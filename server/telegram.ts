import { Complaint, ComplaintStatus } from '../src/types';
import { db } from './db';
import { sendEmailNotification } from './email';

export interface TelegramDispatchResult {
  success: boolean;
  messageId?: string;
  sentToGroup: string;
  sentToChatId: string;
  renderedText: string;
  error?: string;
}

export function formatTelegramNewComplaintMessage(complaint: Complaint, appUrl: string): {
  text: string;
  replyMarkup: any;
} {
  const categoryIcons: Record<string, string> = {
    KEMUDAHAN: '🏢',
    SISTEM: '💻',
    PERKHIDMATAN: '👨‍🏫',
    KEBERSIHAN: '🧹',
    LAIN_LAIN: '📌',
  };

  const icon = categoryIcons[complaint.kategori] || '📌';
  let cleanUrl = appUrl || 'http://localhost:3000';
  if (cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1')) {
    cleanUrl = 'https://siap-aduan.net';
  }
  const checkUrl = `${cleanUrl}/?ref=${complaint.noRujukan}`;

  const text =
    `🚨 *ADUAN BAHARU – SiAP*\n\n` +
    `*No. Rujukan:* \`${complaint.noRujukan}\`\n` +
    `${icon} *Kategori:* ${complaint.kategoriNama}\n` +
    `📝 *Tajuk:* ${complaint.tajukAduan}\n` +
    `📍 *Lokasi:* ${complaint.lokasi}\n` +
    `👤 *Pengadu:* ${complaint.namaPengadu} (${complaint.telefon})\n` +
    `🕐 *Tarikh:* ${complaint.tarikhMasa}\n` +
    `*Status:* 🟡 MENUNGGU TINDAKAN\n\n` +
    `📄 *Butiran:* ${complaint.butiranAduan.substring(0, 180)}${complaint.butiranAduan.length > 180 ? '...' : ''}`;

  const replyMarkup = {
    inline_keyboard: [
      [
        { text: '👁 LIHAT ADUAN', url: checkUrl },
        { text: '✋ AMBIL TINDAKAN', callback_data: `claim:${complaint.noRujukan}` },
      ],
    ],
  };

  return { text, replyMarkup };
}

export async function sendTelegramNotification(complaint: Complaint): Promise<TelegramDispatchResult> {
  const config = db.getConfig();
  const token = config.telegramBotToken;
  const chatId = complaint.telegramGroupId;
  let appUrl = process.env.APP_URL || '';
  if (!appUrl.startsWith('http://') && !appUrl.startsWith('https://')) {
    appUrl = 'http://localhost:3001';
  }

  const { text, replyMarkup } = formatTelegramNewComplaintMessage(complaint, appUrl);

  // Log in system logs
  db.addLog({
    jenisAktiviti: 'TELEGRAM_DIHANTAR',
    noRujukan: complaint.noRujukan,
    keterangan: `Notifikasi dihantar ke Telegram group: ${complaint.telegramGroup} (ID: ${chatId}).`,
    dilakukanOleh: 'SiAP Telegram Engine',
  });

  if (!token) {
    // Simulated delivery when token is not yet injected
    return {
      success: true,
      messageId: `sim_msg_${Date.now()}`,
      sentToGroup: complaint.telegramGroup,
      sentToChatId: chatId,
      renderedText: text,
    };
  }

  let targetChatId = chatId;
  try {
    let response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text,
        parse_mode: 'Markdown',
        reply_markup: replyMarkup,
      }),
    });

    let data = await response.json();

    // Fallback self-healing: Try prepending -100 if chat not found for group IDs
    if (!data.ok && targetChatId.startsWith('-') && !targetChatId.startsWith('-100')) {
      const fallbackChatId = `-100${targetChatId.substring(1)}`;
      console.log(`Telegram chat not found for ${targetChatId}. Retrying with self-healing Chat ID: ${fallbackChatId}`);
      
      try {
        const retryResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: fallbackChatId,
            text,
            parse_mode: 'Markdown',
            reply_markup: replyMarkup,
          }),
        });
        const retryData = await retryResponse.json();
        if (retryData.ok) {
          data = retryData;
          targetChatId = fallbackChatId;
          db.updateComplaint(complaint.noRujukan, { telegramGroupId: targetChatId }, 'Telegram Auto-Fixer');
          console.log(`Telegram self-healing succeeded for ${complaint.noRujukan} using Chat ID: ${targetChatId}`);
        } else {
          console.error(`Telegram self-healing retry failed for chat ${fallbackChatId}:`, retryData.description || retryData);
        }
      } catch (retryErr: any) {
        console.error(`Telegram self-healing connection failed:`, retryErr.message);
      }
    }

    if (data.ok) {
      const msgId = String(data.result.message_id);
      db.updateComplaint(complaint.noRujukan, { telegramMessageId: msgId }, 'Telegram Bot');
      return {
        success: true,
        messageId: msgId,
        sentToGroup: complaint.telegramGroup,
        sentToChatId: targetChatId,
        renderedText: text,
      };
    } else {
      console.error(`Telegram Bot API error for chat ${targetChatId}:`, data.description || data);
      return {
        success: false,
        error: data.description || 'Gagal menghantar mesej ke Telegram API',
        sentToGroup: complaint.telegramGroup,
        sentToChatId: targetChatId,
        renderedText: text,
      };
    }
  } catch (err: any) {
    console.error(`Failed to connect to Telegram API for chat ${targetChatId}:`, err.message);
    return {
      success: false,
      error: err.message,
      sentToGroup: complaint.telegramGroup,
      sentToChatId: targetChatId,
      renderedText: text,
    };
  }
}

export async function processTelegramOfficerAction(params: {
  action: 'AMBIL_TINDAKAN' | 'KEMASKINI_STATUS' | 'TAMBAH_TINDAKAN' | 'SELESAIKAN';
  noRujukan: string;
  telegramUserId: string;
  namaPegawai: string;
  newStatus?: ComplaintStatus;
  catatan?: string;
}): Promise<{ success: boolean; message: string; complaint?: Complaint; replyMessage?: string }> {
  const { action, noRujukan, telegramUserId, namaPegawai, newStatus, catatan } = params;
  const complaint = db.getComplaintByRef(noRujukan);

  if (!complaint) {
    return { success: false, message: `Aduan ${noRujukan} tidak dijumpai dalam sistem.` };
  }

  if (action === 'AMBIL_TINDAKAN') {
    const assignResult = db.assignOfficer(noRujukan, { telegramUserId, namaPegawai });
    if (!assignResult.success) {
      return {
        success: false,
        message: assignResult.message,
        complaint,
        replyMessage: `⚠️ ${assignResult.message}`,
      };
    }

    // Trigger Email to customer
    sendEmailNotification(assignResult.complaint!, 'DALAM_TINDAKAN', `Aduan anda telah diambil oleh pegawai ${namaPegawai}. Tindakan siasatan sedang dijalankan.`);

    const replyMessage =
      `🟠 *ADUAN TELAH DIAMBIL*\n\n` +
      `*No. Rujukan:* \`${noRujukan}\`\n` +
      `*Status:* 🟠 DALAM TINDAKAN\n` +
      `*Pegawai Bertugas:* ${namaPegawai} (${telegramUserId})\n` +
      `*Masa Diambil:* ${new Date().toLocaleTimeString('ms-MY')}\n\n` +
      `_Aduan ini kini sedang dikendalikan oleh ${namaPegawai}._`;

    return {
      success: true,
      message: `Aduan ${noRujukan} berjaya diambil oleh ${namaPegawai}.`,
      complaint: assignResult.complaint,
      replyMessage,
    };
  }

  if (action === 'TAMBAH_TINDAKAN') {
    const note = catatan || 'Tindakan susulan sedang diambil.';
    const tindakan = db.addTindakan({
      noRujukan,
      telegramUserId,
      namaPegawai,
      status: complaint.status,
      catatanTindakan: note,
    });

    const replyMessage =
      `📝 *CATATAN TINDAKAN DITAMBAH*\n\n` +
      `*No. Rujukan:* \`${noRujukan}\`\n` +
      `*Pegawai:* ${namaPegawai}\n` +
      `*Catatan:* ${note}\n` +
      `*Masa:* ${new Date().toLocaleTimeString('ms-MY')}`;

    return {
      success: true,
      message: 'Catatan tindakan berjaya disimpan.',
      complaint: db.getComplaintByRef(noRujukan),
      replyMessage,
    };
  }

  if (action === 'KEMASKINI_STATUS') {
    if (!newStatus) {
      return { success: false, message: 'Status baharu diperlukan.' };
    }
    const note = catatan || `Status dikemaskini kepada ${newStatus} oleh ${namaPegawai}.`;
    db.addTindakan({
      noRujukan,
      telegramUserId,
      namaPegawai,
      status: newStatus,
      catatanTindakan: note,
    });

    const updated = db.updateComplaint(
      noRujukan,
      {
        status: newStatus,
        tindakanTerkini: note,
        ...(newStatus === 'SELESAI' ? { tarikhSelesai: new Date().toISOString().replace('T', ' ').substring(0, 19) } : {}),
      },
      namaPegawai
    );

    // Email notification
    if (updated) {
      sendEmailNotification(updated, newStatus, note);
    }

    const replyMessage =
      `🔄 *STATUS ADUAN DIKEMASKINI*\n\n` +
      `*No. Rujukan:* \`${noRujukan}\`\n` +
      `*Status Baharu:* ${newStatus}\n` +
      `*Pegawai:* ${namaPegawai}\n` +
      `*Catatan:* ${note}`;

    return {
      success: true,
      message: `Status aduan ${noRujukan} berjaya dikemaskini.`,
      complaint: updated || undefined,
      replyMessage,
    };
  }

  if (action === 'SELESAIKAN') {
    const note = catatan || 'Tindakan pembaikan telah selesai dan diuji sepenuhnya.';
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    db.addTindakan({
      noRujukan,
      telegramUserId,
      namaPegawai,
      status: 'SELESAI',
      catatanTindakan: note,
    });

    const updated = db.updateComplaint(
      noRujukan,
      {
        status: 'SELESAI',
        tarikhSelesai: now,
        tindakanTerkini: note,
      },
      namaPegawai
    );

    if (updated) {
      sendEmailNotification(updated, 'SELESAI', note);
    }

    const replyMessage =
      `🟢 *ADUAN SELESAI*\n\n` +
      `*No. Rujukan:* \`${noRujukan}\`\n` +
      `*Status:* 🟢 SELESAI\n` +
      `*Pegawai Bertugas:* ${namaPegawai}\n` +
      `📝 *Tindakan Akhir:* ${note}\n` +
      `🕐 *Tarikh Selesai:* ${now}\n\n` +
      `_Pelanggan telah dimaklumkan melalui emel dan boleh memberikan rating kepuasan._`;

    return {
      success: true,
      message: `Aduan ${noRujukan} telah ditandakan sebagai selesai.`,
      complaint: updated || undefined,
      replyMessage,
    };
  }

  return { success: false, message: 'Tindakan tidak sah.' };
}
