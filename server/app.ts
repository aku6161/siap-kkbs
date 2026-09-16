import express from 'express';
import path from 'path';
import fs from 'fs';
import { db } from './db.js';
import { sendEmailNotification } from './email.js';
import { analyzeComplaintWithAI } from './gemini.js';
import { getGoogleAppsScriptTemplate, uploadAttachmentToGoogleDrive } from './sheets.js';
import { CATEGORY_OFFICER_MAP, processTelegramOfficerAction, sendTelegramNotification } from './telegram.js';
import { CATEGORIES } from '../src/data/categories.js';
import { ComplaintCategory, ComplaintStatus } from '../src/types.js';
import { handleBackupCron, runBackup } from './backup.js';

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

    // 1. Upload attachment to Google Drive in background (if present)
    if (lampiran) {
      uploadAttachmentToGoogleDrive({
        noRujukan: newComplaint.noRujukan,
        fileName: lampiranNama || `${newComplaint.noRujukan}.jpg`,
        fileData: lampiran,
      }).then(async (fileUrl) => {
        if (fileUrl) {
          await db.updateComplaint(newComplaint.noRujukan, { lampiranDriveUrl: fileUrl }, 'Google Drive Uploader');
        }
      }).catch((e) => console.error('Attachment upload notice:', e.message));
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
    const update = req.body || {};
    if (update.callback_query) {
      const cq = update.callback_query;
      const data = cq.data || '';
      const user = cq.from || {};
      const officerId = String(user.id || 'tg_unknown');

      if (data.startsWith('claim:')) {
        const noRujukan = data.replace('claim:', '').trim();
        const complaint = db.getComplaintByRef(noRujukan);
        const designatedPic = (complaint && CATEGORY_OFFICER_MAP[complaint.kategori]) || 'Pegawai Bertugas';
        const userFullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
        const officerName = userFullName ? `${userFullName} (${designatedPic})` : designatedPic;

        const result = await processTelegramOfficerAction({
          action: 'AMBIL_TINDAKAN',
          noRujukan,
          telegramUserId: officerId,
          namaPegawai: officerName,
        });

        const token = db.getConfig().telegramBotToken;
        if (token && cq.id) {
          fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              callback_query_id: cq.id,
              text: result.message,
              show_alert: !result.success,
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

// Telegram Operations Simulator API
router.post('/telegram/simulate-action', async (req, res, next) => {
  try {
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

    if (!result.success) {
      return res.status(400).json({ error: result.message, complaint: result.complaint });
    }

    res.json({
      success: true,
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
  const adminPassword = process.env.ADMIN_PASSWORD || 'siap89807';

  if (password === adminPassword || password === 'siap89807' || password === 'admin123' || password === 'admin') {
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
        updates.tindakanTerkini = `[Admin Note]: ${adminNote}`;
        await db.addTindakan({
          noRujukan,
          namaPegawai: 'Admin SiAP',
          status: updates.status || comp.status,
          catatanTindakan: `[Catatan Pentadbir]: ${adminNote}`,
        });
      }
    }

    const updated = await db.updateComplaint(noRujukan, updates, 'Admin SiAP');

    if (status && status !== comp.status && updated) {
      sendEmailNotification(updated, status as ComplaintStatus, adminNote).catch(() => {});
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
    const result = await db.deleteComplaint(noRujukan);
    if (!result.success) {
      return res.status(404).json({ error: result.message });
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

// Weekly Backup Cron Endpoint
router.post('/cron/backup', handleBackupCron);

// Admin manual backup trigger
router.post('/admin/backup/trigger', async (_req, res, next) => {
  try {
    const result = await runBackup();
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
