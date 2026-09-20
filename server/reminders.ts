import { Request, Response } from 'express';
import { db } from './db.js';
import { CATEGORY_OFFICER_MAP, deleteTelegramMessage } from './telegram.js';
import { Complaint } from '../src/types.js';

function escapeHtml(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Format teks notifikasi peringatan harian Telegram
 */
export function formatTelegramDailyReminderMessage(complaint: Complaint, appUrl: string) {
  const categoryIcons: Record<string, string> = {
    KEMUDAHAN: '🏢',
    SISTEM: '💻',
    PERKHIDMATAN: '👨‍🏫',
    KEBERSIHAN: '🧹',
    LAIN_LAIN: '📌',
  };

  const statusIcons: Record<string, string> = {
    MENUNGGU: '🟡',
    DALAM_SEMAKAN: '🔵',
    DALAM_TINDAKAN: '🟠',
  };

  const statusLabels: Record<string, string> = {
    MENUNGGU: 'MENUNGGU TINDAKAN',
    DALAM_SEMAKAN: 'DALAM SEMAKAN',
    DALAM_TINDAKAN: 'DALAM TINDAKAN',
  };

  const icon = categoryIcons[complaint.kategori] || '📌';
  const sIcon = statusIcons[complaint.status] || '🟡';
  const sLabel = statusLabels[complaint.status] || complaint.status;
  const pic = complaint.namaPegawai || CATEGORY_OFFICER_MAP[complaint.kategori] || 'Pegawai Bertugas';

  let cleanUrl = appUrl || 'https://siapkkbs.vercel.app';
  if (cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1')) {
    cleanUrl = 'https://siapkkbs.vercel.app';
  }
  const checkUrl = `${cleanUrl}/?ref=${encodeURIComponent(complaint.noRujukan)}`;

  const text =
    `⏰ <b>PERINGATAN HARIAN ADUAN – SiAP (9:00 AM)</b>\n\n` +
    `<b>No. Rujukan:</b> <code>${escapeHtml(complaint.noRujukan)}</code>\n` +
    `${icon} <b>Kategori:</b> ${escapeHtml(complaint.kategoriNama || complaint.kategori)}\n` +
    `👮 <b>Pegawai PIC:</b> ${escapeHtml(pic)}\n` +
    `📊 <b>Status Semasa:</b> ${sIcon} <b>${escapeHtml(sLabel)}</b>\n` +
    `📝 <b>Tajuk:</b> ${escapeHtml(complaint.tajukAduan)}\n` +
    `📍 <b>Lokasi:</b> ${escapeHtml(complaint.lokasi)}\n` +
    `👤 <b>Pengadu:</b> ${escapeHtml(complaint.namaPengadu)} (${escapeHtml(complaint.telefon || '-')})\n` +
    `🕐 <b>Tarikh Aduan:</b> ${escapeHtml(complaint.tarikhMasa)}\n\n` +
    `📄 <b>Butiran:</b> ${escapeHtml(complaint.butiranAduan.substring(0, 250))}${complaint.butiranAduan.length > 250 ? '...' : ''}\n\n` +
    `⚠️ <i>Peringatan: Aduan ini masih belum selesai. Sila ambil tindakan segera atau kemaskini status melalui butang di bawah.</i>`;

  const replyMarkup = {
    inline_keyboard: [
      [
        { text: '👁 LIHAT ADUAN', url: checkUrl },
        { text: '⚡ AMBIL TINDAKAN', callback_data: `menu:${complaint.noRujukan}` },
      ],
    ],
  };

  return { text, replyMarkup };
}

/**
 * Repost semua aduan yang belum selesai (MENUNGGU, DALAM_SEMAKAN, DALAM_TINDAKAN)
 * dan auto-delete notifikasi kad lama.
 */
export async function repostActiveComplaints(): Promise<{
  success: boolean;
  totalActive: number;
  repostedCount: number;
  deletedOldCount: number;
  details: Array<{ noRujukan: string; status: string; newMsgId?: string; oldMsgDeleted: boolean; error?: string }>;
}> {
  await db.initFromSupabase();

  const config = db.getConfig();
  const token = config.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || '8238304961:AAG44pdgon1zFkqacccsk7da8iEPv83HPkQ';
  let appUrl = process.env.APP_URL || 'https://siapkkbs.vercel.app';

  // Dapatkan senarai aduan aktif yang belum selesai
  const activeComplaints = db.getComplaints().filter(c => 
    c.status !== 'SELESAI' && c.status !== 'TIDAK_DAPAT_DISELESAIKAN'
  );

  console.log(`[Peringatan Harian 9:00 AM] Memproses ${activeComplaints.length} aduan aktif...`);

  const results: Array<{ noRujukan: string; status: string; newMsgId?: string; oldMsgDeleted: boolean; error?: string }> = [];
  let repostedCount = 0;
  let deletedOldCount = 0;

  for (const complaint of activeComplaints) {
    let targetChatId = complaint.telegramGroupId;
    if (!targetChatId) {
      if (complaint.kategori === 'KEMUDAHAN') targetChatId = config.telegramChatIdKemudahan;
      else if (complaint.kategori === 'SISTEM') targetChatId = config.telegramChatIdSistem;
      else if (complaint.kategori === 'PERKHIDMATAN') targetChatId = config.telegramChatIdPerkhidmatan;
      else if (complaint.kategori === 'KEBERSIHAN') targetChatId = config.telegramChatIdKebersihan;
      else targetChatId = config.telegramChatIdKemudahan || (config as any).telegramChatId;
    }

    if (!targetChatId) {
      results.push({
        noRujukan: complaint.noRujukan,
        status: complaint.status,
        oldMsgDeleted: false,
        error: 'Tiada Chat ID Telegram ditetapkan untuk kategori ini.',
      });
      continue;
    }

    const { text, replyMarkup } = formatTelegramDailyReminderMessage(complaint, appUrl);
    const oldMessageId = complaint.telegramMessageId;

    try {
      // 1. Hantar kad peringatan baharu
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetChatId,
          text,
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        }),
      });

      const data = await res.json();

      if (data.ok && data.result?.message_id) {
        const newMsgId = String(data.result.message_id);
        repostedCount++;

        // 2. Simpan message ID baharu ke database
        await db.updateComplaint(complaint.noRujukan, {
          telegramMessageId: newMsgId,
          telegramGroupId: targetChatId,
        }, 'SiAP Daily Reminder Engine');

        // 3. Auto-delete notifikasi kad lama jika wujud
        let oldDeleted = false;
        if (oldMessageId && oldMessageId !== newMsgId) {
          try {
            oldDeleted = await deleteTelegramMessage(targetChatId, oldMessageId);
            if (oldDeleted) deletedOldCount++;
          } catch (delErr: any) {
            console.warn(`Gagal memadam mesej lama (${oldMessageId}) untuk aduan ${complaint.noRujukan}:`, delErr.message);
          }
        }

        await db.addLog({
          jenisAktiviti: 'TELEGRAM_DIHANTAR',
          noRujukan: complaint.noRujukan,
          keterangan: `Peringatan harian jam 9:00 AM dihantar semula ke Telegram (Mesej baharu: ${newMsgId}, Mesej lama dipadam: ${oldDeleted ? 'Ya' : 'Tiada'}).`,
          dilakukanOleh: 'SiAP Daily Reminder Engine',
        });

        results.push({
          noRujukan: complaint.noRujukan,
          status: complaint.status,
          newMsgId,
          oldMsgDeleted: oldDeleted,
        });
      } else {
        results.push({
          noRujukan: complaint.noRujukan,
          status: complaint.status,
          oldMsgDeleted: false,
          error: data.description || 'Gagal menghantar mesej ke Telegram API',
        });
      }
    } catch (err: any) {
      results.push({
        noRujukan: complaint.noRujukan,
        status: complaint.status,
        oldMsgDeleted: false,
        error: err.message,
      });
    }

    // Jeda 250ms antara penghantaran untuk elak sekatan kadar (rate limit) Telegram
    await new Promise(r => setTimeout(r, 250));
  }

  return {
    success: true,
    totalActive: activeComplaints.length,
    repostedCount,
    deletedOldCount,
    details: results,
  };
}

/**
 * Handler HTTP untuk Vercel Cron / API Trigger
 */
export async function handleDailyRemindersCron(req: Request, res: Response) {
  try {
    const authHeader = req.headers['authorization'];
    const cronSecret = authHeader?.replace('Bearer ', '') || (req.headers['x-cron-secret'] as string);
    const isVercelCron = req.headers['x-vercel-cron'] === '1' || req.headers['user-agent']?.includes('vercel-cron');
    const expectedSecret = process.env.CRON_SECRET;
    const isManualWithSecret = expectedSecret && cronSecret === expectedSecret;

    if (!isVercelCron && !isManualWithSecret && process.env.NODE_ENV === 'production' && expectedSecret) {
      return res.status(401).json({ error: 'Tidak dibenarkan. Sila sertakan CRON_SECRET yang betul.' });
    }

    const result = await repostActiveComplaints();
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('Ralat ketika menjalankan peringatan harian:', err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Inisialisasi Penjadual Dalaman (Node.js Background Scheduler)
 * Memeriksa setiap minit: Jika jam 09:00 pagi (Waktu Malaysia UTC+8), repost peringatan harian dijalankan
 */
let lastReminderDate = '';
export function initDailyReminderScheduler() {
  console.log('⏰ Penjadual Peringatan Harian Telegram Diaktifkan: Setiap Hari jam 9:00 Pagi (Auto Repost & Delete Mesej Lama)');

  setInterval(async () => {
    try {
      // Dapatkan waktu semasa dalam zon masa Asia/Kuala_Lumpur
      const now = new Date();
      const mytString = now.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' });
      const mytDate = new Date(mytString);

      const hours = mytDate.getHours();
      const minutes = mytDate.getMinutes();
      const todayDateStr = mytDate.toISOString().slice(0, 10);

      // Jalankan pada jam 09:00 pagi setiap hari sekali sahaja
      if (hours === 9 && minutes === 0 && lastReminderDate !== todayDateStr) {
        lastReminderDate = todayDateStr;
        console.log('🚀 Menjalankan Peringatan Harian Telegram 9:00 AM (Asia/Kuala_Lumpur)...');
        await repostActiveComplaints();
      }
    } catch (err: any) {
      console.error('Ralat dalam penjejak penjadual peringatan harian:', err.message);
    }
  }, 60000);
}
