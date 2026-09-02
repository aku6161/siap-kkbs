import express from 'express';
import path from 'path';
import fs from 'fs';
import { db } from './db';
import { sendEmailNotification } from './email';
import { analyzeComplaintWithAI } from './gemini';
import { getGoogleAppsScriptTemplate, syncWithGoogleSheets } from './sheets';
import { processTelegramOfficerAction, sendTelegramNotification } from './telegram';
import { CATEGORIES } from '../src/data/categories';
import { ComplaintCategory, ComplaintStatus } from '../src/types';
import { handleBackupCron } from '../api/cron/backup';


const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

let lastSyncTime = 0;
const ensureDbSynced = async () => {
  const config = db.getConfig();
  const scriptUrl = config.googleAppsScriptUrl;
  if (!scriptUrl) return;

  const now = Date.now();
  if (now - lastSyncTime < 8000) return; // Throttle: only query Google Sheets at most once every 8 seconds

  lastSyncTime = now;
  try {
    const resp = await fetch(scriptUrl, { method: 'GET', redirect: 'follow' });
    const text = await resp.text();
    const result = JSON.parse(text);
    if (result.status === 'success') {
      db.overwriteDatabase({
        complaints: result.complaints || [],
        tindakan: result.tindakan || [],
        logs: result.logs || [],
      });
    }
  } catch (e: any) {
    console.error('Real-time sync failed:', e.message);
  }
};

// ==========================================
// PUBLIC APIS
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'SiAP – Sistem Aduan Pelanggan', timestamp: new Date().toISOString() });
});

// Public summary & dynamic satisfaction average
app.get('/api/public/summary', async (req, res) => {
  await ensureDbSynced();
  const ratingSummary = db.getRatingSummary();
  const stats = db.getStats();
  const all = db.getComplaints();
  const recentFeedbacks = all
    .filter((c) => c.rating && c.ulasanPelanggan)
    .slice(0, 4)
    .map((c) => ({
      noRujukan: c.noRujukan,
      nama: c.namaPengadu.split(' ')[0] + '***',
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
});

// Create new complaint
app.post('/api/complaints', async (req, res) => {
  try {
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
    } = req.body;

    if (!namaPengadu || !emel || !kategori || !tajukAduan || !butiranAduan || !lokasi) {
      return res.status(400).json({ error: 'Semua medan bertanda wajib perlu diisi.' });
    }

    const catKey = kategori as ComplaintCategory;
    const catConfig = CATEGORIES[catKey] || CATEGORIES.LAIN_LAIN;

    const config = db.getConfig();
    let telegramGroupId = catConfig.telegramChatId;
    if (catKey === 'KEMUDAHAN') telegramGroupId = config.telegramChatIdKemudahan || telegramGroupId;
    else if (catKey === 'SISTEM') telegramGroupId = config.telegramChatIdSistem || telegramGroupId;
    else if (catKey === 'PERKHIDMATAN') telegramGroupId = config.telegramChatIdPerkhidmatan || telegramGroupId;
    else if (catKey === 'KEBERSIHAN') telegramGroupId = config.telegramChatIdKebersihan || telegramGroupId;

    const newComplaint = db.createComplaint({
      namaPengadu,
      telefon: telefon || '-',
      emel,
      kategori: catKey,
      kategoriNama: catConfig.name,
      tajukAduan,
      butiranAduan,
      lokasi,
      tarikhKejadian: tarikhKejadian || new Date().toISOString().substring(0, 10),
      lampiran,
      lampiranNama,
      telegramGroup: catConfig.telegramGroup,
      telegramGroupId: telegramGroupId,
    });

    // 1. Save to Google Sheets immediately and await it
    await syncWithGoogleSheets().catch((e) => console.error('Auto-sync error:', e));

    // 2. Dispatch Telegram notification to designated Telegram Group in the background (no await)
    sendTelegramNotification(newComplaint).catch((e) => console.error('Telegram notification error:', e));

    // 3. Send email notification to customer in the background (no await)
    sendEmailNotification(newComplaint, 'DITERIMA').catch((e) => console.error('Email notification error:', e));

    res.status(201).json({
      success: true,
      message: 'Aduan berjaya didaftarkan!',
      complaint: newComplaint,
    });
  } catch (err: any) {
    console.error('Error creating complaint:', err);
    res.status(500).json({ error: err.message || 'Ralat semasa memproses aduan.' });
  }
});

// Track single complaint by reference number
app.get('/api/complaints/:noRujukan', async (req, res) => {
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
});

// Submit satisfaction rating (1 to 5)
app.post('/api/complaints/:noRujukan/rating', (req, res) => {
  const { noRujukan } = req.params;
  const { rating, ulasan } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Sila pilih rating antara skala 1 hingga 5.' });
  }

  const result = db.addRating(noRujukan, Number(rating), ulasan);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  // Sync rating to Google Sheets
  syncWithGoogleSheets().catch((e) => console.error('Rating sync error:', e));

  res.json({
    success: true,
    message: result.message,
    complaint: result.complaint,
    ratingSummary: db.getRatingSummary(),
  });
});

// ==========================================
// TELEGRAM WEBHOOK & SIMULATOR APIS
// ==========================================

// Real Telegram Webhook Receiver (from Telegram API)
app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const update = req.body;
    if (update.callback_query) {
      const cq = update.callback_query;
      const data = cq.data || '';
      const user = cq.from || {};
      const officerName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Pegawai Telegram';
      const officerId = String(user.id || 'tg_unknown');

      if (data.startsWith('claim:')) {
        const noRujukan = data.replace('claim:', '').trim();
        const result = await processTelegramOfficerAction({
          action: 'AMBIL_TINDAKAN',
          noRujukan,
          telegramUserId: officerId,
          namaPegawai: officerName,
        });

        // Answer callback query if bot token exists
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
  } catch (e: any) {
    console.error('Webhook error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Telegram Operations Simulator API (For interactive testing in Admin panel)
app.post('/api/telegram/simulate-action', async (req, res) => {
  const { action, noRujukan, telegramUserId, namaPegawai, newStatus, catatan } = req.body;

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

  // Background sync to Google Sheets
  syncWithGoogleSheets().catch(() => {});

  res.json({
    success: true,
    message: result.message,
    complaint: result.complaint,
    replyMessage: result.replyMessage,
    tindakanList: db.getTindakanForComplaint(noRujukan),
  });
});

// ==========================================
// ADMIN DASHBOARD APIS
// ==========================================

// Admin login check
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

  if (password === adminPassword || password === 'admin123' || password === 'admin') {
    return res.json({ success: true, token: 'siap_admin_valid_token_2026' });
  }
  return res.status(401).json({ error: 'Kata laluan pentadbir tidak tepat.' });
});

// List all complaints with filtering
app.get('/api/admin/complaints', async (req, res) => {
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
        c.noRujukan.toLowerCase().includes(q) ||
        c.namaPengadu.toLowerCase().includes(q) ||
        c.tajukAduan.toLowerCase().includes(q) ||
        c.lokasi.toLowerCase().includes(q) ||
        (c.namaPegawai && c.namaPegawai.toLowerCase().includes(q))
    );
  }

  if (startDate) {
    list = list.filter((c) => c.tarikhMasa.substring(0, 10) >= String(startDate));
  }
  if (endDate) {
    list = list.filter((c) => c.tarikhMasa.substring(0, 10) <= String(endDate));
  }

  res.json({
    total: list.length,
    complaints: list,
  });
});

// Admin update complaint details / release officer / update status
app.patch('/api/admin/complaints/:noRujukan', (req, res) => {
  const { noRujukan } = req.params;
  const { status, namaPegawai, telegramUserId, adminNote, resetOfficer } = req.body;

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
    db.addLog({
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
      db.addTindakan({
        noRujukan,
        namaPegawai: 'Admin SiAP',
        status: updates.status || comp.status,
        catatanTindakan: `[Catatan Pentadbir]: ${adminNote}`,
      });
    }
  }

  const updated = db.updateComplaint(noRujukan, updates, 'Admin SiAP');

  if (status && status !== comp.status && updated) {
    sendEmailNotification(updated, status as ComplaintStatus, adminNote);
  }

  syncWithGoogleSheets().catch(() => {});

  res.json({
    success: true,
    message: 'Maklumat aduan berjaya dikemaskini oleh pentadbir.',
    complaint: updated,
  });
});

// Admin stats & analytics
app.get('/api/admin/stats', async (req, res) => {
  await ensureDbSynced();
  const stats = db.getStats();
  const ratingSummary = db.getRatingSummary();
  const complaints = db.getComplaints();

  // Category breakdown
  const categoryStats: Record<string, { count: number; name: string; icon: string }> = {};
  Object.keys(CATEGORIES).forEach((k) => {
    const cat = CATEGORIES[k as ComplaintCategory];
    categoryStats[k] = { count: 0, name: cat.name, icon: cat.icon };
  });

  // Monthly trends
  const monthlyStats: Record<string, number> = {};

  complaints.forEach((c) => {
    if (categoryStats[c.kategori]) {
      categoryStats[c.kategori].count++;
    }
    const month = c.tarikhMasa.substring(0, 7); // e.g. 2026-08
    monthlyStats[month] = (monthlyStats[month] || 0) + 1;
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
});

// Get action history for complaint
app.get('/api/admin/tindakan/:noRujukan', async (req, res) => {
  await ensureDbSynced();
  const list = db.getTindakanForComplaint(req.params.noRujukan);
  res.json(list);
});

// Get audit logs
app.get('/api/admin/logs', async (req, res) => {
  const limit = Number(req.query.limit) || 100;
  await ensureDbSynced();
  res.json(db.getLogs(limit));
});

// Get emails log
app.get('/api/admin/emails', async (req, res) => {
  const limit = Number(req.query.limit) || 50;
  await ensureDbSynced();
  res.json(db.getEmails(limit));
});

// System configuration
app.get('/api/admin/config', (req, res) => {
  const config = db.getConfig();
  const appsScriptCode = getGoogleAppsScriptTemplate();
  res.json({
    config,
    appsScriptCode,
  });
});

app.post('/api/admin/config', (req, res) => {
  const updated = db.updateConfig(req.body);
  db.addLog({
    jenisAktiviti: 'STATUS_DIKEMASKINI',
    noRujukan: 'SYSTEM_CONFIG',
    keterangan: 'Konfigurasi integrasi sistem dikemaskini oleh pentadbir.',
    dilakukanOleh: 'Admin SiAP',
  });
  res.json({ success: true, config: updated });
});

// Live Feed for Google Sheets & Google Apps Script
app.all('/api/sync-feed', (req, res) => {
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
app.post('/api/admin/sheets/test-url', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, message: 'URL Web App diperlukan.' });
  }

  try {
    const resp = await fetch(url, { method: 'GET', redirect: 'follow' });
    const text = await resp.text();
    let jsonResp: any;
    try {
      jsonResp = JSON.parse(text);
    } catch {
      // If html or plain text
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

// Force sync with Google Sheets
app.post('/api/admin/sheets/sync', async (req, res) => {
  const result = await syncWithGoogleSheets();
  res.json(result);
});

// Gemini AI Analysis for complaint
app.post('/api/admin/gemini/analyze', async (req, res) => {
  try {
    const { noRujukan, tajukAduan, butiranAduan, kategori, lokasi } = req.body;
    const complaint = noRujukan ? db.getComplaintByRef(noRujukan) : { tajukAduan, butiranAduan, kategori, lokasi };
    if (!complaint) {
      return res.status(404).json({ error: 'Aduan tidak dijumpai.' });
    }

    const analysis = await analyzeComplaintWithAI(complaint);
    res.json({ success: true, analysis });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Force pull from Google Sheets to overwrite local database
app.post('/api/admin/sheets/pull', async (req, res) => {
  const config = db.getConfig();
  const scriptUrl = config.googleAppsScriptUrl;
  if (!scriptUrl) {
    return res.status(400).json({ success: false, message: 'Google Apps Script Web App URL tidak dikonfigurasikan.' });
  }

  try {
    const resp = await fetch(scriptUrl, { method: 'GET', redirect: 'follow' });
    const text = await resp.text();
    let result: any;
    try {
      result = JSON.parse(text);
    } catch (parseErr) {
      return res.status(500).json({ success: false, message: 'Gagal menukarkan jawapan Apps Script kepada format JSON.' });
    }

    if (result.status === 'success') {
      db.overwriteDatabase({
        complaints: result.complaints || [],
        tindakan: result.tindakan || [],
        logs: result.logs || [],
      });

      db.addLog({
        jenisAktiviti: 'STATUS_DIKEMASKINI',
        noRujukan: 'ALL',
        keterangan: 'Pangkalan data tempatan dikemaskini sepenuhnya daripada Google Sheets.',
        dilakukanOleh: 'Google Sheets Puller',
      });

      return res.json({
        success: true,
        message: 'Berjaya memuat turun dan menyelaraskan pangkalan data daripada Google Sheets!',
        complaintsCount: (result.complaints || []).length,
      });
    } else {
      return res.json({
        success: false,
        message: `Google Apps Script ralat: ${result.message || 'Ralat tidak diketahui'}`,
      });
    }
  } catch (err: any) {
    console.error('Google Sheets Pull error:', err);
    return res.json({
      success: false,
      message: `Gagal menghubungi Google Sheets: ${err.message}`,
    });
  }
});

// Serve uploaded images/files locally to bypass Google Drive limitations
const uploadsPath = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Weekly Backup Cron Endpoint (triggered by Vercel Cron or admin manual trigger)
app.post('/api/cron/backup', handleBackupCron);


// Background auto-pull from Google Sheets every 10 seconds (only if not in serverless/Vercel)
if (!process.env.VERCEL) {
  const startBackgroundSync = () => {
    setInterval(async () => {
      const config = db.getConfig();
      const scriptUrl = config.googleAppsScriptUrl;
      if (!scriptUrl) return;

      try {
        const resp = await fetch(scriptUrl, { method: 'GET', redirect: 'follow' });
        const text = await resp.text();
        const result = JSON.parse(text);

        if (result.status === 'success') {
          db.overwriteDatabase({
            complaints: result.complaints || [],
            tindakan: result.tindakan || [],
            logs: result.logs || [],
          });
        }
      } catch (err: any) {
        // Silent catch for background polling
      }
    }, 10000);
  };
  startBackgroundSync();
}

export { app };
export default app;
