import { Complaint, ComplaintStatus } from '../src/types.js';
import { db, getMalaysiaNow } from './db.js';
import { sendEmailNotification } from './email.js';

export interface TelegramDispatchResult {
  success: boolean;
  messageId?: string;
  sentToGroup: string;
  sentToChatId: string;
  renderedText: string;
  error?: string;
}

export const CATEGORY_OFFICER_MAP: Record<string, string> = {
  KEMUDAHAN: 'Pegawai Pembangunan',
  SISTEM: 'Pegawai ICT',
  PERKHIDMATAN: 'Pegawai Perhubungan Pelanggan',
  KEBERSIHAN: 'Pegawai Kebersihan',
  LAIN_LAIN: 'Pegawai Perhubungan Pelanggan',
};

function escapeHtml(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function getStatusMenuMarkup(noRujukan: string, appUrl: string = 'https://siapkkbs.sudin.my') {
  const checkUrl = `${appUrl}/?ref=${encodeURIComponent(noRujukan)}`;
  return {
    inline_keyboard: [
      [
        { text: '🔵 DALAM SEMAKAN', callback_data: `status:${noRujukan}:DALAM_SEMAKAN` },
        { text: '🟠 DALAM TINDAKAN', callback_data: `status:${noRujukan}:DALAM_TINDAKAN` },
      ],
      [
        { text: '🟢 SELESAI', callback_data: `status:${noRujukan}:SELESAI` },
        { text: '🔴 TIDAK DAPAT DISELESAIKAN', callback_data: `status:${noRujukan}:TIDAK_DAPAT_DISELESAIKAN` },
      ],
      [
        { text: '👁 LIHAT ADUAN', url: checkUrl },
      ],
    ],
  };
}

export function getStatusMenuText(complaint: Complaint): string {
  const pic = CATEGORY_OFFICER_MAP[complaint.kategori] || 'Pegawai Bertugas';
  const statusLabels: Record<string, string> = {
    MENUNGGU: '🟡 Menunggu Tindakan',
    DALAM_SEMAKAN: '🔵 Dalam Semakan',
    DALAM_TINDAKAN: '🟠 Dalam Tindakan',
    SELESAI: '🟢 Selesai',
    TIDAK_DAPAT_DISELESAIKAN: '🔴 Tidak Dapat Diselesaikan',
  };
  const currentStatusLabel = statusLabels[complaint.status] || complaint.status;

  return (
    `⚡ <b>PILIH STATUS TINDAKAN</b>\n\n` +
    `<b>No. Rujukan:</b> <code>${escapeHtml(complaint.noRujukan)}</code>\n` +
    `🏢 <b>Kategori:</b> ${escapeHtml(complaint.kategoriNama)}\n` +
    `📝 <b>Tajuk:</b> ${escapeHtml(complaint.tajukAduan)}\n` +
    `👮 <b>Pegawai PIC:</b> ${escapeHtml(pic)}\n` +
    `📊 <b>Status Semasa:</b> ${currentStatusLabel}\n\n` +
    `<i>Sila pilih status tindakan baharu di bawah:</i>`
  );
}

export function formatTelegramNewComplaintMessage(complaint: Complaint, appUrl: string): {
  text: string;
  plainText: string;
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
  const pic = CATEGORY_OFFICER_MAP[complaint.kategori] || 'Pegawai Perhubungan Pelanggan';

  let cleanUrl = appUrl || 'http://localhost:3000';
  if (cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1') || cleanUrl.includes('MY_APP_URL')) {
    cleanUrl = 'https://siapkkbs.sudin.my';
  }
  const checkUrl = `${cleanUrl}/?ref=${encodeURIComponent(complaint.noRujukan)}`;

  // Safe HTML formatting
  const text =
    `🚨 <b>ADUAN BAHARU – SiAP</b>\n\n` +
    `<b>No. Rujukan:</b> <code>${escapeHtml(complaint.noRujukan)}</code>\n` +
    `${icon} <b>Kategori:</b> ${escapeHtml(complaint.kategoriNama)}\n` +
    `👮 <b>Pegawai Bertanggungjawab (PIC):</b> ${escapeHtml(pic)}\n` +
    `📝 <b>Tajuk:</b> ${escapeHtml(complaint.tajukAduan)}\n` +
    `📍 <b>Lokasi:</b> ${escapeHtml(complaint.lokasi)}\n` +
    `👤 <b>Pengadu:</b> ${escapeHtml(complaint.namaPengadu)} (${escapeHtml(complaint.telefon || '-')})\n` +
    `🕐 <b>Tarikh:</b> ${escapeHtml(complaint.tarikhMasa)}\n` +
    `<b>Status:</b> 🟡 MENUNGGU TINDAKAN\n\n` +
    `📄 <b>Butiran:</b> ${escapeHtml(complaint.butiranAduan.substring(0, 250))}${complaint.butiranAduan.length > 250 ? '...' : ''}`;

  // Plain text fallback (no markup formatting)
  const plainText =
    `🚨 ADUAN BAHARU – SiAP\n\n` +
    `No. Rujukan: ${complaint.noRujukan}\n` +
    `Kategori: ${complaint.kategoriNama}\n` +
    `Pegawai Bertanggungjawab (PIC): ${pic}\n` +
    `Tajuk: ${complaint.tajukAduan}\n` +
    `Lokasi: ${complaint.lokasi}\n` +
    `Pengadu: ${complaint.namaPengadu} (${complaint.telefon || '-'})\n` +
    `Tarikh: ${complaint.tarikhMasa}\n` +
    `Status: MENUNGGU TINDAKAN\n\n` +
    `Butiran: ${complaint.butiranAduan.substring(0, 250)}${complaint.butiranAduan.length > 250 ? '...' : ''}`;

  const replyMarkup = {
    inline_keyboard: [
      [
        { text: '👁 LIHAT ADUAN', url: checkUrl },
        { text: '⚡ AMBIL TINDAKAN', callback_data: `menu:${complaint.noRujukan}` },
      ],
    ],
  };

  return { text, plainText, replyMarkup };
}

export async function sendTelegramNotification(complaint: Complaint): Promise<TelegramDispatchResult> {
  const config = db.getConfig();
  const token = config.telegramBotToken;
  const chatId = complaint.telegramGroupId;
  let appUrl = process.env.APP_URL || '';
  if (!appUrl.startsWith('http://') && !appUrl.startsWith('https://') || appUrl.includes('MY_APP_URL')) {
    appUrl = 'https://siapkkbs.sudin.my';
  }

  const { text, plainText, replyMarkup } = formatTelegramNewComplaintMessage(complaint, appUrl);

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
    // Try sending with HTML mode
    let response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup,
      }),
    });

    let data = await response.json();

    // Fallback 1: If formatting failed, try sending plain text
    if (!data.ok && data.description && (data.description.includes('parse') || data.description.includes('entity') || data.description.includes('HTML'))) {
      console.warn(`Telegram HTML parse failed for chat ${targetChatId}. Retrying with plain text.`);
      try {
        const plainResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetChatId,
            text: plainText,
            reply_markup: replyMarkup,
          }),
        });
        const plainData = await plainResponse.json();
        if (plainData.ok) {
          data = plainData;
        }
      } catch (err: any) {
        console.error('Telegram plain-text retry failed:', err.message);
      }
    }

    // Fallback 2: Self-healing for missing -100 prefix in supergroups
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
            parse_mode: 'HTML',
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
  telegramUserId?: string;
  namaPegawai?: string;
  newStatus?: ComplaintStatus;
  catatan?: string;
}): Promise<{ success: boolean; message: string; complaint?: Complaint; replyMessage?: string }> {
  const { action, noRujukan, telegramUserId, namaPegawai, newStatus, catatan } = params;
  let complaint = db.getComplaintByRef(noRujukan);
  if (!complaint) {
    complaint = await db.findComplaintByRef(noRujukan);
  }

  if (!complaint) {
    return {
      success: false,
      message: `Aduan ${noRujukan} tidak dijumpai dalam sistem.`,
      replyMessage: `⚠️ <b>PERHATIAN</b>: Aduan <code>${escapeHtml(noRujukan)}</code> tidak dijumpai dalam sistem SiAP.`,
    };
  }

  const pic = CATEGORY_OFFICER_MAP[complaint.kategori] || 'Pegawai Bertugas';
  const officerName = namaPegawai || pic;
  const userId = telegramUserId || 'tg_pic';

  if (action === 'AMBIL_TINDAKAN' || action === 'KEMASKINI_STATUS') {
    const targetStatus = newStatus || 'DALAM_TINDAKAN';
    const note = catatan || (
      targetStatus === 'SELESAI'
        ? 'Aduan telah berjaya diselesaikan oleh pegawai bertugas.'
        : targetStatus === 'DALAM_SEMAKAN'
        ? 'Aduan dalam semakan dan siasatan awal oleh pegawai bertugas.'
        : targetStatus === 'TIDAK_DAPAT_DISELESAIKAN'
        ? 'Aduan tidak dapat diselesaikan atas kekangan di luar kawalan.'
        : 'Aduan sedang dalam tindakan pembaikan/pembetulan aktif.'
    );

    await db.addTindakan({
      noRujukan,
      telegramUserId: userId,
      namaPegawai: officerName,
      status: targetStatus,
      catatanTindakan: note,
    });

    const now = getMalaysiaNow();
    const updated = await db.updateComplaint(
      noRujukan,
      {
        status: targetStatus,
        namaPegawai: officerName,
        tarikhDiambilTindakan: complaint.tarikhDiambilTindakan || now,
        tindakanTerkini: note,
        ...(targetStatus === 'SELESAI' ? { tarikhSelesai: now } : {}),
      },
      officerName
    );

    // Email notification to customer
    if (updated) {
      sendEmailNotification(updated, targetStatus, note);
    }

    const statusIcons: Record<string, string> = {
      MENUNGGU: '🟡',
      DALAM_SEMAKAN: '🔵',
      DALAM_TINDAKAN: '🟠',
      SELESAI: '🟢',
      TIDAK_DAPAT_DISELESAIKAN: '🔴',
    };
    const statusLabels: Record<string, string> = {
      MENUNGGU: 'Menunggu Tindakan',
      DALAM_SEMAKAN: 'Dalam Semakan',
      DALAM_TINDAKAN: 'Dalam Tindakan',
      SELESAI: 'Selesai',
      TIDAK_DAPAT_DISELESAIKAN: 'Tidak Dapat Diselesaikan',
    };

    const sIcon = statusIcons[targetStatus] || '⚡';
    const sLabel = statusLabels[targetStatus] || targetStatus;
    const isCompleted = targetStatus === 'SELESAI' || targetStatus === 'TIDAK_DAPAT_DISELESAIKAN';

    const replyMessage =
      `✅ <b>STATUS BERJAYA DIKEMASKINI</b>\n\n` +
      `<b>No. Rujukan:</b> <code>${escapeHtml(noRujukan)}</code>\n` +
      `<b>Status Baharu:</b> ${sIcon} <b>${escapeHtml(sLabel.toUpperCase())}</b>\n` +
      `👮 <b>Pegawai PIC:</b> ${escapeHtml(officerName)}\n` +
      `🕐 <b>Masa:</b> ${new Intl.DateTimeFormat('ms-MY', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date())}\n` +
      `📝 <b>Catatan:</b> ${escapeHtml(note)}\n\n` +
      (isCompleted
        ? `<i>🗑️ Aduan telah ditutup. Notifikasi Telegram ini akan dipadam secara automatik dalam masa 5 saat untuk memastikan kumpulan sentiasa kemas.</i>`
        : `<i>Status telah dikemaskini secara automatik ke dalam database SiAP. Anda boleh menukar status semula pada bila-bila masa.</i>`);

    return {
      success: true,
      message: `Status aduan ${noRujukan} dikemaskini kepada "${sLabel}".` + (isCompleted ? ' Notifikasi akan dipadam secara auto.' : ''),
      complaint: updated || undefined,
      replyMessage,
    };
  }

  if (action === 'TAMBAH_TINDAKAN') {
    const note = catatan || 'Tindakan susulan sedang diambil.';
    await db.addTindakan({
      noRujukan,
      telegramUserId: userId,
      namaPegawai: officerName,
      status: complaint.status,
      catatanTindakan: note,
    });

    const replyMessage =
      `📝 <b>CATATAN TINDAKAN DITAMBAH</b>\n\n` +
      `<b>No. Rujukan:</b> <code>${escapeHtml(noRujukan)}</code>\n` +
      `👮 <b>Pegawai PIC:</b> ${escapeHtml(officerName)}\n` +
      `<b>Catatan:</b> ${escapeHtml(note)}\n` +
      `<b>Masa:</b> ${new Intl.DateTimeFormat('ms-MY', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date())}`;

    return {
      success: true,
      message: 'Catatan tindakan berjaya disimpan.',
      complaint: db.getComplaintByRef(noRujukan),
      replyMessage,
    };
  }

  if (action === 'SELESAIKAN') {
    return processTelegramOfficerAction({
      action: 'KEMASKINI_STATUS',
      noRujukan,
      telegramUserId: userId,
      namaPegawai: officerName,
      newStatus: 'SELESAI',
      catatan: catatan || 'Tindakan pembaikan telah selesai dan diuji sepenuhnya.',
    });
  }

  return { success: false, message: 'Tindakan tidak sah.' };
}

/**
 * Padam mesej notifikasi Telegram (cth: selepas aduan SELESAI / TIDAK DAPAT DISELESAIKAN)
 */
export async function deleteTelegramMessage(chatId: string | number, messageId: string | number): Promise<boolean> {
  const config = db.getConfig();
  const token = config.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || '8238304961:AAG44pdgon1zFkqacccsk7da8iEPv83HPkQ';
  if (!token || !chatId || !messageId) return false;

  let targetChatId = String(chatId);
  try {
    let res = await fetch(`https://api.telegram.org/bot${token}/deleteMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: targetChatId,
        message_id: Number(messageId),
      }),
    });
    let data = await res.json();

    // Self-healing for supergroup ID format (e.g. -3546212661 -> -1003546212661)
    if (!data.ok && targetChatId.startsWith('-') && !targetChatId.startsWith('-100')) {
      const fallbackChatId = `-100${targetChatId.substring(1)}`;
      res = await fetch(`https://api.telegram.org/bot${token}/deleteMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: fallbackChatId,
          message_id: Number(messageId),
        }),
      });
      data = await res.json();
    }

    if (!data.ok) {
      console.warn(`Telegram deleteMessage response for chat ${targetChatId} msg ${messageId}:`, data.description || data);
    }
    return !!data.ok;
  } catch (err: any) {
    console.error(`Gagal memadam mesej Telegram (chat: ${chatId}, msg: ${messageId}):`, err?.message);
    return false;
  }
}

/**
 * Memastikan webhook Telegram sentiasa didaftarkan dengan URL Vercel dan allowed_updates yang lengkap
 */
export async function ensureTelegramWebhook(targetUrl?: string): Promise<{ ok: boolean; info?: any; error?: string }> {
  const config = db.getConfig();
  const token = config.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || '8238304961:AAG44pdgon1zFkqacccsk7da8iEPv83HPkQ';
  if (!token) return { ok: false, error: 'Tiada token Telegram' };

  let baseUrl = 'https://siapkkbs.sudin.my';
  const rawAppUrl = process.env.APP_URL;
  if (rawAppUrl && !rawAppUrl.includes('MY_APP_URL') && !rawAppUrl.includes('localhost') && !rawAppUrl.includes('127.0.0.1')) {
    baseUrl = rawAppUrl.replace(/\/$/, '');
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
    }
  }
  const webhookUrl = targetUrl || `${baseUrl}/api/telegram/webhook`;
  try {
    const infoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const infoData = await infoRes.json();

    if (
      infoData.ok &&
      infoData.result?.url === webhookUrl &&
      Array.isArray(infoData.result?.allowed_updates) &&
      infoData.result.allowed_updates.includes('callback_query')
    ) {
      return { ok: true, info: infoData.result };
    }

    const setRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'edited_message', 'channel_post', 'callback_query'],
        drop_pending_updates: false,
      }),
    });
    const setData = await setRes.json();
    return { ok: !!setData.ok, info: setData };
  } catch (err: any) {
    console.error('Failed to ensure Telegram webhook:', err?.message);
    return { ok: false, error: err?.message };
  }
}


