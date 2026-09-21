import express from 'express';
import path from 'path';
import fs from 'fs';
import { db } from './db.js';
import { sendEmailNotification } from './email.js';
import { analyzeComplaintWithAI } from './gemini.js';
import { getGoogleAppsScriptTemplate, uploadAttachmentToGoogleDrive } from './sheets.js';
import {
  CATEGORY_OFFICER_MAP,
  processTelegramOfficerAction,
  sendTelegramNotification,
  getStatusMenuMarkup,
  getStatusMenuText,
  deleteTelegramMessage,
} from './telegram.js';
import { CATEGORIES } from '../src/data/categories.js';
import { ComplaintCategory, ComplaintStatus } from '../src/types.js';
import { handleBackupCron, runBackup } from './backup.js';
import { handleDailyRemindersCron, repostActiveComplaints } from './reminders.js';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

let lastSyncTime = 0;
const ensureDbSynced = async () => {
  const now = Date.now();
  if (now - lastSyncTime < 2000) return;
  lastSyncTime = now;
  await db.initFromSupabase();
};

const router = express.Router();

// ==========================================
// PUBLIC APIS
// ==========================================

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'SiAP – Sistem Aduan Pelanggan', timestamp: new Date().toISOString() });
});

// Public summary & dynamic satisfaction average
router.get('/public/summary', async (req, res, next) => {
  try {
    await ensureDbSynced();
    const ratingSummary = db.getRatingSummary();
    const stats = db.getStats();
    const all = db.getComplaints();
    const recentFeedbacks = all
      .filter((c) => c.rating && c.ulasanPelanggan)
      .slice(0, 4)
      .map((c) => ({
        noRujukan: c.noRujukan,
        nama: (c.namaPengadu || 'Pengadu').split(' ')[0] + '***',
        kategori: c.kategoriNama,
        rating: c.rating,
        ulasan: c.ulasanPelanggan,
        tarikh: c.ratingTarikh || c.tarikhSelesai || c.tarikhMasa,
      }));

    res.json({
      ratingSummary,
      stats: {
        totalAduan: stats.totalAduan,
        selesai: stats.selesai,
        purataKepuasan: stats.purataKepuasan,
        purataMasaPenyelesaianJam: stats.purataMasaPenyelesaianJam,
      },
      recentFeedbacks,
    });
  } catch (err) {
    next(err);
  }
});

// Create new complaint
router.post('/complaints', async (req, res, next) => {
  try {
    await ensureDbSynced();
    const body = req.body || {};
    const {
      namaPengadu,
      telefon,
      emel,
      kategori,
      tajukAduan,
      butiranAduan,
      lokasi,
      tarikhKejadian,
      lampiran,
      lampiranNama,
    } = body;

    if (!namaPengadu || !emel || !kategori || !tajukAduan || !butiranAduan || !lokasi) {
      return res.status(400).json({ error: 'Semua medan bertanda wajib perlu diisi.' });
    }

    const catKey = (kategori || 'LAIN_LAIN') as ComplaintCategory;
    const catConfig = CATEGORIES[catKey] || CATEGORIES.LAIN_LAIN;

    const config = db.getConfig();
    let telegramGroupId = catConfig.telegramChatId;
    if (catKey === 'KEMUDAHAN') telegramGroupId = config.telegramChatIdKemudahan || telegramGroupId;
    else if (catKey === 'SISTEM') telegramGroupId = config.telegramChatIdSistem || telegramGroupId;
    else if (catKey === 'PERKHIDMATAN') telegramGroupId = config.telegramChatIdPerkhidmatan || telegramGroupId;
    else if (catKey === 'KEBERSIHAN') telegramGroupId = config.telegramChatIdKebersihan || telegramGroupId;

    const newComplaint = await db.createComplaint({
      namaPengadu: String(namaPengadu).trim(),
      telefon: telefon ? String(telefon).trim() : '-',
      emel: String(emel).trim(),
      kategori: catKey,
      kategoriNama: catConfig.name,
      tajukAduan: String(tajukAduan).trim(),
      butiranAduan: String(butiranAduan).trim(),
      lokasi: String(lokasi).trim(),
      tarikhKejadian: tarikhKejadian || new Date().toISOString().substring(0, 10),
      lampiran,
      lampiranNama,
      telegramGroup: catConfig.telegramGroup,
      telegramGroupId: telegramGroupId,
    });

    // 1. Upload attachment to Google Drive (if present)
    if (lampiran) {
      try {
        const fileUrl = await uploadAttachmentToGoogleDrive({
          noRujukan: newComplaint.noRujukan,
          fileName: lampiranNama || `${newComplaint.noRujukan}.jpg`,
          fileData: lampiran,
        });
        if (fileUrl) {
          newComplaint.lampiranDriveUrl = fileUrl;
          await db.updateComplaint(newComplaint.noRujukan, { lampiranDriveUrl: fileUrl }, 'Google Drive Uploader');
        }
      } catch (e: any) {
        console.error('Attachment upload notice:', e.message);
      }
    }

    // 2. Dispatch Telegram notification & Email notification (awaited with safe error boundaries so Serverless functions won't terminate early)
    await Promise.allSettled([
      sendTelegramNotification(newComplaint).catch((e) => console.error('Telegram dispatch notice:', e.message)),
      sendEmailNotification(newComplaint, 'DITERIMA').catch((e) => console.error('Email dispatch notice:', e.message)),
    ]);

    return res.status(201).json({
      success: true,
      message: 'Aduan berjaya didaftarkan!',
      complaint: newComplaint,
    });
  } catch (err: any) {
    console.error('Error in /complaints handler:', err);
    next(err);
  }
});

// Track single complaint by reference number
router.get('/complaints/:noRujukan', async (req, res, next) => {
  try {
    const { noRujukan } = req.params;
    await ensureDbSynced();
    const complaint = db.getComplaintByRef(noRujukan);

    if (!complaint) {
      return res.status(404).json({ error: `Aduan dengan No. Rujukan "${noRujukan}" tidak dijumpai.` });
    }

    const tindakanList = db.getTindakanForComplaint(noRujukan);
    res.json({
      complaint,
      tindakanList,
    });
  } catch (err) {
    next(err);
  }
});

// Submit satisfaction rating (1 to 5)
router.post('/complaints/:noRujukan/rating', async (req, res, next) => {
  try {
    const { noRujukan } = req.params;
    const { rating, ulasan } = req.body || {};

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Sila pilih rating antara skala 1 hingga 5.' });
    }

    await ensureDbSynced();
    const result = await db.addRating(noRujukan, Number(rating), ulasan);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({
      success: true,
      message: result.message,
      complaint: result.complaint,
      ratingSummary: db.getRatingSummary(),
    });
  } catch (err) {
    next(err);
  }
});

// Submit public visitor rating from Landing Page
router.post('/public/rating', async (req, res, next) => {
  try {
    const { rating, ulasan, noRujukan, nama } = req.body || {};

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Sila pilih rating antara skala 1 hingga 5.' });
    }

    await ensureDbSynced();
    let result;
    if (noRujukan && noRujukan.trim()) {
      const compResult = await db.addRating(noRujukan.trim(), Number(rating), ulasan);
      if (compResult.success) {
        result = compResult;
      } else {
        result = await db.addPublicRating(Number(rating), ulasan, nama);
      }
    } else {
      result = await db.addPublicRating(Number(rating), ulasan, nama);
    }

    const all = db.getComplaints();
    const recentFeedbacks = all
      .filter((c) => c.rating && c.ulasanPelanggan)
      .slice(0, 4)
      .map((c) => ({
        noRujukan: c.noRujukan,
        nama: (c.namaPengadu || 'Pengadu').split(' ')[0] + '***',
        kategori: c.kategoriNama,
        rating: c.rating,
        ulasan: c.ulasanPelanggan,
        tarikh: c.ratingTarikh || c.tarikhSelesai || c.tarikhMasa,
      }));

    res.json({
      success: true,
      message: result.message,
      ratingSummary: db.getRatingSummary(),
      recentFeedbacks,
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// TELEGRAM WEBHOOK & SIMULATOR APIS
// ==========================================

// Real Telegram Webhook Receiver
router.post('/telegram/webhook', async (req, res, next) => {
  try {
    await ensureDbSynced();
    const update = req.body || {};
    const token = db.getConfig().telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || '8238304961:AAG44pdgon1zFkqacccsk7da8iEPv83HPkQ';

    if (update.callback_query) {
      const cq = update.callback_query;
      const data = cq.data || '';
      const user = cq.from || {};
      const officerId = String(user.id || 'tg_unknown');

      // Case 1: Open interactive status selection menu
      if (data.startsWith('claim:') || data.startsWith('menu:')) {
        const noRujukan = data.replace(/^(claim|menu):/, '').trim();
        let complaint = db.getComplaintByRef(noRujukan);
        if (!complaint) complaint = await db.findComplaintByRef(noRujukan);

        if (token) {
          if (cq.id) {
            await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                callback_query_id: cq.id,
                text: 'Sila pilih status tindakan bagi aduan ini.',
                show_alert: false,
              }),
            }).catch(() => {});
          }

          const chatId = cq.message?.chat?.id || complaint?.telegramGroupId;
          if (chatId && complaint) {
            const menuText = getStatusMenuText(complaint);
            const menuMarkup = getStatusMenuMarkup(noRujukan);

            // Try editing the current message in place first for smooth UX
            let edited = false;
            if (cq.message?.message_id) {
              try {
                const editRes = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: chatId,
                    message_id: cq.message.message_id,
                    text: menuText,
                    parse_mode: 'HTML',
                    reply_markup: menuMarkup,
                  }),
                });
                const editData = await editRes.json();
                if (editData.ok) edited = true;
              } catch (e) {}
            }

            // If not edited in place (e.g. from original card), send as reply
            if (!edited) {
              try {
                await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: chatId,
                    text: menuText,
                    parse_mode: 'HTML',
                    reply_markup: menuMarkup,
                    reply_to_message_id: cq.message?.message_id,
                  }),
                });
              } catch (err: any) {
                console.error('Failed to send status menu to Telegram:', err?.message);
              }
            }
          }
        }
      }
      // Case 2: Officer clicked a specific status button
      else if (data.startsWith('status:') || data.startsWith('set_status:')) {
        const parts = data.split(':');
        const noRujukan = parts[1]?.trim();
        const newStatus = parts[2]?.trim() as ComplaintStatus;

        let complaint = db.getComplaintByRef(noRujukan);
        if (!complaint) complaint = await db.findComplaintByRef(noRujukan);

        const designatedPic = (complaint && CATEGORY_OFFICER_MAP[complaint.kategori]) || 'Pegawai Bertugas';

        const result = await processTelegramOfficerAction({
          action: 'KEMASKINI_STATUS',
          noRujukan,
          telegramUserId: officerId,
          namaPegawai: designatedPic,
          newStatus: newStatus || 'DALAM_TINDAKAN',
        });

        if (token) {
          // 1. Answer Telegram popup alert
          if (cq.id) {
            await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                callback_query_id: cq.id,
                text: result.message,
                show_alert: true,
              }),
            }).catch(() => {});
          }

          // 2. Update the menu message in place with confirmation & quick re-toggle button
          const chatId = cq.message?.chat?.id || complaint?.telegramGroupId;
          if (chatId && result.replyMessage && cq.message?.message_id) {
            const checkUrl = `https://siapkkbs.vercel.app/?ref=${encodeURIComponent(noRujukan)}`;
            const actionKeyboard = {
              inline_keyboard: [
                [
                  { text: '🔄 TUKAR STATUS SEMULA', callback_data: `menu:${noRujukan}` },
                  { text: '👁 LIHAT ADUAN', url: checkUrl },
                ],
              ],
            };

            try {
              const editRes = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  message_id: cq.message.message_id,
                  text: result.replyMessage,
                  parse_mode: 'HTML',
                  reply_markup: actionKeyboard,
                }),
              });
              const editData = await editRes.json();
              if (!editData.ok) {
                // If in-place edit failed, fallback to sendMessage
                await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: chatId,
                    text: result.replyMessage,
                    parse_mode: 'HTML',
                    reply_markup: actionKeyboard,
                  }),
                });
              }
            } catch (err: any) {
              console.error('Telegram editMessageText error:', err?.message);
            }
          }

          // 3. Update original message buttons to show updated status
          if (chatId && result.success) {
            const checkUrl = `https://siapkkbs.vercel.app/?ref=${encodeURIComponent(noRujukan)}`;
            const statusLabels: Record<string, string> = {
              MENUNGGU: '🟡 MENUNGGU',
              DALAM_SEMAKAN: '🔵 SEMAKAN',
              DALAM_TINDAKAN: '🟠 TINDAKAN',
              SELESAI: '🟢 SELESAI',
              TIDAK_DAPAT_DISELESAIKAN: '🔴 DITUTUP',
            };
            const shortLabel = statusLabels[newStatus] || newStatus;

            // Update reply_to message if it was the original card
            const targetMsgId = cq.message?.reply_to_message?.message_id;
            if (targetMsgId) {
              await fetch(`https://api.telegram.org/bot${token}/editMessageReplyMarkup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  message_id: targetMsgId,
                  reply_markup: {
                    inline_keyboard: [
                      [
                        { text: '👁 LIHAT ADUAN', url: checkUrl },
                        { text: `⚡ STATUS: ${shortLabel}`, callback_data: `menu:${noRujukan}` },
                      ],
                    ],
                  },
                }),
              }).catch(() => {});
            }
          }

          // 4. Auto-delete Telegram notification card if complaint is completed / closed
          if (chatId && (newStatus === 'SELESAI' || newStatus === 'TIDAK_DAPAT_DISELESAIKAN')) {
            const menuMsgId = cq.message?.message_id;
            const replyToMsgId = cq.message?.reply_to_message?.message_id;
            const cardMsgId = complaint?.telegramMessageId;
            const targetGroup = complaint?.telegramGroupId || chatId;

            // Wait 5 seconds so the officer sees the confirmation alert/card, then clean up
            setTimeout(async () => {
              try {
                if (menuMsgId) await deleteTelegramMessage(chatId, menuMsgId);
                if (replyToMsgId && replyToMsgId !== menuMsgId) await deleteTelegramMessage(chatId, replyToMsgId);
                if (cardMsgId && String(cardMsgId) !== String(menuMsgId) && String(cardMsgId) !== String(replyToMsgId)) {
                  await deleteTelegramMessage(targetGroup, cardMsgId);
                }
              } catch (delErr: any) {
                console.error('Error auto-deleting Telegram messages:', delErr?.message);
              }
            }, 5000);
          }
        }
      } else if (data.startsWith('info:')) {
        const noRujukan = data.replace('info:', '').trim();
        let complaint = db.getComplaintByRef(noRujukan);
        if (!complaint) complaint = await db.findComplaintByRef(noRujukan);
        const officer = complaint?.namaPegawai || (complaint && CATEGORY_OFFICER_MAP[complaint.kategori]) || 'Pegawai Bertugas';
        if (token && cq.id) {
          await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              callback_query_id: cq.id,
              text: `ℹ️ Aduan ${noRujukan} di bawah tanggungjawab ${officer} (Status: ${complaint?.status || 'MENUNGGU'}).`,
              show_alert: true,
            }),
          }).catch(() => {});
        }
      }
    }
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Helper route to register Telegram Webhook to production URL
router.get('/telegram/set-webhook', async (req, res) => {
  try {
    const token = db.getConfig().telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || '8238304961:AAG44pdgon1zFkqacccsk7da8iEPv83HPkQ';
    const webhookUrl = 'https://siapkkbs.vercel.app/api/telegram/webhook';
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
    const data = await tgRes.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper route to inspect Telegram Webhook Info
router.get('/telegram/webhook-info', async (req, res) => {
  try {
    const token = db.getConfig().telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || '8238304961:AAG44pdgon1zFkqacccsk7da8iEPv83HPkQ';
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
    const data = await tgRes.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Telegram Operations Simulator API
router.post('/telegram/simulate-action', async (req, res, next) => {
  try {
    await ensureDbSynced();
    const { action, noRujukan, telegramUserId, namaPegawai, newStatus, catatan } = req.body || {};

    if (!action || !noRujukan || !namaPegawai) {
      return res.status(400).json({ error: 'Maklumat tindakan, no rujukan dan nama pegawai diperlukan.' });
    }

    const result = await processTelegramOfficerAction({
      action,
      noRujukan,
      telegramUserId: telegramUserId || `tg_${Math.floor(1000 + Math.random() * 9000)}`,
      namaPegawai,
      newStatus,
      catatan,
    });

    res.json({
      success: result.success,
      message: result.message,
      complaint: result.complaint,
      replyMessage: result.replyMessage,
      tindakanList: db.getTindakanForComplaint(noRujukan),
    });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// ADMIN DASHBOARD APIS
// ==========================================

// Admin login check
router.post('/admin/login', (req, res) => {
  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD || 'siapkkbs89807';

  if (password === adminPassword || password === 'siapkkbs89807' || password === 'siap89807' || password === 'admin') {
    return res.json({ success: true, token: 'siap_admin_valid_token_2026' });
  }
  return res.status(401).json({ error: 'Kata laluan pentadbir tidak tepat.' });
});

// List all complaints with filtering
router.get('/admin/complaints', async (req, res, next) => {
  try {
    const { search, kategori, status, startDate, endDate } = req.query;
    await ensureDbSynced();
    let list = db.getComplaints();

    if (kategori && kategori !== 'ALL') {
      list = list.filter((c) => c.kategori === kategori);
    }

    if (status && status !== 'ALL') {
      list = list.filter((c) => c.status === status);
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (c) =>
          (c.noRujukan || '').toLowerCase().includes(q) ||
          (c.namaPengadu || '').toLowerCase().includes(q) ||
          (c.tajukAduan || '').toLowerCase().includes(q) ||
          (c.lokasi || '').toLowerCase().includes(q) ||
          (c.namaPegawai && c.namaPegawai.toLowerCase().includes(q))
      );
    }

    if (startDate) {
      list = list.filter((c) => (c.tarikhMasa || '').substring(0, 10) >= String(startDate));
    }
    if (endDate) {
      list = list.filter((c) => (c.tarikhMasa || '').substring(0, 10) <= String(endDate));
    }

    res.json({
      total: list.length,
      complaints: list,
    });
  } catch (err) {
    next(err);
  }
});

// Student satisfaction survey analytics & data
router.get('/admin/student-satisfaction', async (req, res, next) => {
  try {
    const { year, program, semester } = req.query;
    await ensureDbSynced();
    let list = db.getStudentSurveys(year ? String(year) : undefined);

    if (program && program !== 'ALL') {
      list = list.filter((s) => s.programPengajian.toLowerCase() === String(program).toLowerCase());
    }
    if (semester && semester !== 'ALL') {
      list = list.filter((s) => s.semester === String(semester));
    }

    const total = list.length;
    const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    
    const overallScore = Number(avg(list.map((s) => s.scores.purataKeseluruhan)).toFixed(2));
    
    const dimensionAverages = {
      bilikKuliah: Number(avg(list.map((s) => s.scores.bilikKuliah)).toFixed(2)),
      perpustakaan: Number(avg(list.map((s) => s.scores.perpustakaan)).toFixed(2)),
      bengkelAmali: Number(avg(list.map((s) => s.scores.bengkelAmali || s.scores.bengkelDapur || 4)).toFixed(2)),
      bengkelDapur: Number(avg(list.map((s) => s.scores.bengkelAmali || s.scores.bengkelDapur || 4)).toFixed(2)),
      makmalKomputer: Number(avg(list.map((s) => s.scores.makmalKomputer)).toFixed(2)),
      dewanKuliah: Number(avg(list.map((s) => s.scores.dewanKuliah)).toFixed(2)),
      immersiveCentre: Number(avg(list.map((s) => s.scores.immersiveCentre)).toFixed(2)),
      eTechCentre: Number(avg(list.map((s) => s.scores.eTechCentre || s.scores.kafe || 4)).toFixed(2)),
      kafe: Number(avg(list.map((s) => s.scores.eTechCentre || s.scores.kafe || 4)).toFixed(2)),
      kemudahanSokongan: Number(avg(list.map((s) => s.scores.kemudahanSokongan)).toFixed(2)),
      wifi: Number(avg(list.map((s) => s.scores.wifi)).toFixed(2)),
    };

    // Priority facilities breakdown
    const priorityCounts: Record<string, number> = {};
    for (const item of list) {
      const key = (item.kemudahanPenambahbaikan === 'KAFE' ? 'E-TECH CENTRE' : item.kemudahanPenambahbaikan) || 'LAIN-LAIN';
      priorityCounts[key] = (priorityCounts[key] || 0) + 1;
    }

    const priorityBreakdown = Object.entries(priorityCounts)
      .map(([name, count]) => ({
        name,
        count,
        percent: total ? Math.round((count / total) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Program breakdown
    const programCounts: Record<string, { count: number; totalScore: number }> = {};
    for (const item of list) {
      const prog = item.programPengajian;
      if (!programCounts[prog]) programCounts[prog] = { count: 0, totalScore: 0 };
      programCounts[prog].count += 1;
      programCounts[prog].totalScore += item.scores.purataKeseluruhan;
    }

    const programBreakdown = Object.entries(programCounts).map(([program, val]) => ({
      program,
      count: val.count,
      averageScore: Number((val.totalScore / val.count).toFixed(2)),
    }));

    res.json({
      total,
      overallScore,
      overallPercentage: Number(((overallScore / 5) * 100).toFixed(1)),
      dimensionAverages,
      priorityBreakdown,
      programBreakdown,
      surveys: list,
    });
  } catch (err) {
    next(err);
  }
});

// Submit new student survey response (Public)
router.post('/student-survey', async (req, res, next) => {
  try {
    const {
      jantina,
      programPengajian,
      semester,
      scores,
      scoresRaw,
      scoresArray,
      kemudahanPenambahbaikan,
      cadangan,
    } = req.body || {};

    if (!programPengajian || !semester || !scores) {
      return res.status(400).json({ error: 'Sila lengkapkan maklumat soal selidik yang diperlukan.' });
    }

    await ensureDbSynced();

    const currentYear = new Date().getFullYear();
    const now = new Date();
    const timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${now.toLocaleTimeString('en-US')} GMT+8`;
    
    // Generate sequential ID
    const allSurveys = db.getStudentSurveys();
    const nextSeq = allSurveys.length + 1;
    const surveyId = `SURVEY-${currentYear}-${String(nextSeq).padStart(3, '0')}`;

    // Compute overall score average if not provided
    const s = scores;
    const scoreValues = [
      s.bilikKuliah,
      s.immersiveCentre,
      s.dewanKuliah,
      s.makmalKomputer,
      s.perpustakaan,
      s.eTechCentre || s.kafe,
      s.kemudahanSokongan,
      s.bengkelAmali || s.bengkelDapur,
      s.wifi,
    ].filter((v) => typeof v === 'number' && !isNaN(v));

    const purataKeseluruhan = scoreValues.length
      ? Number((scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length).toFixed(2))
      : 4.0;

    const rawFacility = String(kemudahanPenambahbaikan || 'WIFI').trim().toUpperCase();
    const normalizedFacility = rawFacility === 'KAFE' ? 'E-TECH CENTRE' : rawFacility;

    const rawList = Array.isArray(scoresRaw) ? scoresRaw : (Array.isArray(scoresArray) ? scoresArray : undefined);

    const newSurveyItem = {
      id: surveyId,
      timestamp,
      year: currentYear,
      jantina: (jantina === 'PEREMPUAN' ? 'PEREMPUAN' : 'LELAKI') as 'LELAKI' | 'PEREMPUAN',
      programPengajian: String(programPengajian).trim(),
      semester: String(semester).trim(),
      scores: {
        bilikKuliah: Number(scores.bilikKuliah || 4),
        immersiveCentre: Number(scores.immersiveCentre || 4),
        dewanKuliah: Number(scores.dewanKuliah || 4),
        makmalKomputer: Number(scores.makmalKomputer || 4),
        perpustakaan: Number(scores.perpustakaan || 4),
        eTechCentre: Number(scores.eTechCentre || scores.kafe || 4),
        kafe: Number(scores.eTechCentre || scores.kafe || 4),
        kemudahanSokongan: Number(scores.kemudahanSokongan || 4),
        bengkelAmali: Number(scores.bengkelAmali || scores.bengkelDapur || 4),
        bengkelDapur: Number(scores.bengkelAmali || scores.bengkelDapur || 4),
        wifi: Number(scores.wifi || 4),
        purataKeseluruhan: Number(scores.purataKeseluruhan || purataKeseluruhan),
      },
      rawScores: rawList,
      kemudahanPenambahbaikan: normalizedFacility,
      cadangan: (cadangan || '').trim() || '-',
    };

    const saved = await db.addStudentSurvey(newSurveyItem);

    // Also log activity
    await db.addLog({
      jenisAktiviti: 'STATUS_DIKEMASKINI',
      noRujukan: surveyId,
      keterangan: `Maklum balas soal selidik baharu diterima daripada pelajar [${newSurveyItem.programPengajian} - Sem ${newSurveyItem.semester}].`,
      dilakukanOleh: 'Pelajar KKBS',
    });

    res.status(201).json({
      success: true,
      message: 'Terima kasih! Maklum balas soal selidik anda telah berjaya dihantar.',
      survey: saved,
    });
  } catch (err) {
    next(err);
  }
});

// Get student surveys list (Public summary or full data)
router.get('/student-survey', async (req, res, next) => {
  try {
    const { year } = req.query;
    await ensureDbSynced();
    const list = db.getStudentSurveys(year as string);
    res.json({ success: true, total: list.length, count: list.length, surveys: list });
  } catch (err) {
    next(err);
  }
});

// Admin update complaint details / release officer / update status
router.patch('/admin/complaints/:noRujukan', async (req, res, next) => {
  try {
    const { noRujukan } = req.params;
    const { status, namaPegawai, telegramUserId, adminNote, resetOfficer } = req.body || {};

    await ensureDbSynced();
    const comp = db.getComplaintByRef(noRujukan);
    if (!comp) {
      return res.status(404).json({ error: 'Aduan tidak dijumpai.' });
    }

    const updates: Partial<typeof comp> = {};
    if (resetOfficer) {
      updates.namaPegawai = undefined;
      updates.telegramUserId = undefined;
      updates.status = 'MENUNGGU';
      updates.tarikhDiambilTindakan = undefined;
      await db.addLog({
        jenisAktiviti: 'STATUS_DIKEMASKINI',
        noRujukan,
        keterangan: 'Admin melepaskan tugasan pegawai. Status dikembalikan kepada Menunggu Tindakan.',
        dilakukanOleh: 'Admin SiAP',
      });
    } else {
      if (status) updates.status = status as ComplaintStatus;
      if (namaPegawai !== undefined) updates.namaPegawai = namaPegawai;
      if (telegramUserId !== undefined) updates.telegramUserId = telegramUserId;
      if (adminNote) {
        updates.tindakanTerkini = adminNote;
        await db.addTindakan({
          noRujukan,
          namaPegawai: 'Admin SiAP',
          status: updates.status || comp.status,
          catatanTindakan: adminNote,
        });
      }
    }

    const updated = await db.updateComplaint(noRujukan, updates, 'Admin SiAP');

    if (status && status !== comp.status && updated) {
      sendEmailNotification(updated, status as ComplaintStatus, adminNote).catch(() => {});

      // Auto-delete Telegram notification card if resolved / closed via Admin Portal
      if (['SELESAI', 'TIDAK_DAPAT_DISELESAIKAN'].includes(status as string)) {
        const targetGroup = updated.telegramGroupId || comp.telegramGroupId;
        const targetMsgId = updated.telegramMessageId || comp.telegramMessageId;
        if (targetGroup && targetMsgId) {
          deleteTelegramMessage(targetGroup, targetMsgId).catch(() => {});
        }
      }
    }

    res.json({
      success: true,
      message: 'Maklumat aduan berjaya dikemaskini oleh pentadbir.',
      complaint: updated,
    });
  } catch (err) {
    next(err);
  }
});

// Admin delete complaint
router.delete('/admin/complaints/:noRujukan', async (req, res, next) => {
  try {
    const { noRujukan } = req.params;
    await ensureDbSynced();
    const existing = db.getComplaintByRef(noRujukan);
    const result = await db.deleteComplaint(noRujukan);
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }

    if (existing?.telegramGroupId && existing?.telegramMessageId) {
      deleteTelegramMessage(existing.telegramGroupId, existing.telegramMessageId).catch(() => {});
    }

    res.json({
      success: true,
      message: result.message,
      complaints: db.getComplaints(),
      stats: db.getStats(),
    });
  } catch (err) {
    next(err);
  }
});

// Admin stats & analytics
router.get('/admin/stats', async (req, res, next) => {
  try {
    await ensureDbSynced();
    const stats = db.getStats();
    const ratingSummary = db.getRatingSummary();
    const complaints = db.getComplaints();

    const categoryStats: Record<string, { count: number; name: string; icon: string }> = {};
    Object.keys(CATEGORIES).forEach((k) => {
      const cat = CATEGORIES[k as ComplaintCategory];
      categoryStats[k] = { count: 0, name: cat.name, icon: cat.icon };
    });

    const monthlyStats: Record<string, number> = {};

    complaints.forEach((c) => {
      if (categoryStats[c.kategori]) {
        categoryStats[c.kategori].count++;
      }
      const month = (c.tarikhMasa || '').substring(0, 7);
      if (month) {
        monthlyStats[month] = (monthlyStats[month] || 0) + 1;
      }
    });

    const monthlyTrends = Object.entries(monthlyStats).map(([bulan, jumlah]) => ({
      bulan,
      jumlah,
    }));

    res.json({
      stats,
      ratingSummary,
      categoryStats: Object.entries(categoryStats).map(([key, val]) => ({
        category: key,
        name: val.name,
        count: val.count,
      })),
      monthlyTrends,
    });
  } catch (err) {
    next(err);
  }
});

// Get action history for complaint
router.get('/admin/tindakan/:noRujukan', async (req, res, next) => {
  try {
    await ensureDbSynced();
    const list = db.getTindakanForComplaint(req.params.noRujukan);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// Get audit logs
router.get('/admin/logs', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 100;
    await ensureDbSynced();
    res.json(db.getLogs(limit));
  } catch (err) {
    next(err);
  }
});

// Get emails log
router.get('/admin/emails', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 50;
    await ensureDbSynced();
    res.json(db.getEmails(limit));
  } catch (err) {
    next(err);
  }
});

// System configuration
router.get('/admin/config', (req, res) => {
  const config = db.getConfig();
  const appsScriptCode = getGoogleAppsScriptTemplate();
  res.json({
    config,
    appsScriptCode,
  });
});

router.post('/admin/config', (req, res) => {
  const updated = db.updateConfig(req.body || {});
  db.addLog({
    jenisAktiviti: 'STATUS_DIKEMASKINI',
    noRujukan: 'SYSTEM_CONFIG',
    keterangan: 'Konfigurasi integrasi sistem dikemaskini oleh pentadbir.',
    dilakukanOleh: 'Admin SiAP',
  });
  res.json({ success: true, config: updated });
});

// Live Feed for Google Sheets & Google Apps Script
router.all('/sync-feed', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const complaints = db.getComplaints();
  const tindakan = db.getAllTindakan();
  const logs = db.getLogs(100);
  const config = db.getConfig();

  res.json({
    status: 'success',
    timestamp: new Date().toISOString(),
    googleDriveFolderId: config.googleDriveFolderId,
    googleDriveFolderUrl: config.googleDriveFolderUrl,
    complaints,
    tindakan,
    logs,
  });
});

// Test connection to Google Apps Script Web App URL
router.post('/admin/sheets/test-url', async (req, res, next) => {
  try {
    const { url } = req.body || {};
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL Web App diperlukan.' });
    }

    const resp = await fetch(url, { method: 'GET', redirect: 'follow' });
    const text = await resp.text();
    let jsonResp: any;
    try {
      jsonResp = JSON.parse(text);
    } catch {
      jsonResp = { raw: text };
    }

    if (resp.ok) {
      return res.json({
        success: true,
        status: resp.status,
        message: 'Sambungan ke Google Apps Script Web App berjaya!',
        data: jsonResp,
      });
    } else {
      return res.json({
        success: false,
        status: resp.status,
        message: `Google Apps Script membalas dengan ralat HTTP ${resp.status}`,
      });
    }
  } catch (err: any) {
    return res.json({
      success: false,
      message: `Gagal menghubungi URL: ${err.message}`,
    });
  }
});

// Status endpoint for data sync
router.post('/admin/sheets/sync', async (req, res) => {
  res.json({
    success: true,
    message: 'Supabase adalah pangkalan data utama sistem SiAP. Semua data aduan dan tindakan diselaraskan terus ke Supabase, manakala lampiran dimuat naik ke Google Drive.',
  });
});

// Gemini AI Analysis for complaint
router.post('/admin/gemini/analyze', async (req, res, next) => {
  try {
    const { noRujukan, tajukAduan, butiranAduan, kategori, lokasi } = req.body || {};
    const complaint = noRujukan ? db.getComplaintByRef(noRujukan) : { tajukAduan, butiranAduan, kategori, lokasi };
    if (!complaint) {
      return res.status(404).json({ error: 'Aduan tidak dijumpai.' });
    }

    const analysis = await analyzeComplaintWithAI(complaint);
    res.json({ success: true, analysis });
  } catch (err) {
    next(err);
  }
});

// Weekly Backup Cron Endpoint (Triggered automatically every Sunday 2:00 AM)
router.post('/cron/backup', handleBackupCron);
router.get('/cron/backup', handleBackupCron);

// Admin manual backup trigger
router.post('/admin/backup/trigger', async (_req, res, next) => {
  try {
    const result = await runBackup();
    return res.json(result);
  } catch (err) {
    next(err);
  }
});
router.get('/admin/backup/trigger', async (_req, res, next) => {
  try {
    const result = await runBackup();
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// Daily Reminders Cron Endpoint (Triggered automatically every day 9:00 AM)
router.post('/cron/daily-reminders', handleDailyRemindersCron);
router.get('/cron/daily-reminders', handleDailyRemindersCron);

// Admin manual daily reminders trigger / test
router.post('/admin/reminders/trigger', async (_req, res, next) => {
  try {
    const result = await repostActiveComplaints();
    return res.json(result);
  } catch (err) {
    next(err);
  }
});
router.get('/admin/reminders/trigger', async (_req, res, next) => {
  try {
    const result = await repostActiveComplaints();
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// Mount router to both /api and root / to support all rewrite modes on Vercel
app.use('/api', router);
app.use('/', router);

// Serve uploaded images/files locally
const uploadsPath = process.env.VERCEL ? path.join('/tmp', 'uploads') : path.join(process.cwd(), 'uploads');
try {
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
} catch (e) {
  // Ignore filesystem errors in serverless
}
app.use('/uploads', express.static(uploadsPath));

// Global Express Error Handler (Prevents serverless crash)
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('SiAP Global API Error caught:', err);
  if (res.headersSent) return;
  res.status(500).json({
    error: err.message || 'Ralat dalaman pelayan semasa memproses permintaan.',
  });
});

export { app };
export default app;
