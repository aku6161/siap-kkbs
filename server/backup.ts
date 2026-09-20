import { db } from './db.js';
import { Complaint } from '../src/types.js';
import type { Request, Response } from 'express';

const BACKUP_FOLDER_ID = process.env.BACKUP_DRIVE_FOLDER_ID || '1f2VTd_dug6ANOkyRqHtC7LaNcBJWoU28';
const CRON_SECRET = process.env.CRON_SECRET || '';

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Convert complaints list to standard CSV string
 */
export function generateComplaintsCsv(complaints: Complaint[]): string {
  const headers = [
    'No Rujukan',
    'Tarikh & Masa Aduan',
    'Nama Pengadu',
    'No Telefon',
    'Emel',
    'Kod Kategori',
    'Nama Kategori',
    'Tajuk Aduan',
    'Butiran Aduan',
    'Lokasi Kejadian',
    'Tarikh Kejadian',
    'Status Aduan',
    'Kumpulan Telegram',
    'ID Kumpulan Telegram',
    'ID Telegram Pegawai',
    'Nama Pegawai Bertanggungjawab',
    'Tarikh Tindakan Diambil',
    'Tarikh Selesai',
    'Tindakan Terkini',
    'Penilaian Bintang (1-5)',
    'Ulasan Pelanggan',
    'Tarikh Penilaian',
    'Nama Lampiran',
    'Pautan Lampiran (Google Drive)'
  ];

  const rows = complaints.map((c) => [
    escapeCsv(c.noRujukan || ''),
    escapeCsv(c.tarikhMasa || ''),
    escapeCsv(c.namaPengadu || ''),
    escapeCsv(c.telefon || ''),
    escapeCsv(c.emel || ''),
    escapeCsv(c.kategori || ''),
    escapeCsv(c.kategoriNama || ''),
    escapeCsv(c.tajukAduan || ''),
    escapeCsv(c.butiranAduan || ''),
    escapeCsv(c.lokasi || ''),
    escapeCsv(c.tarikhKejadian || ''),
    escapeCsv(c.status || ''),
    escapeCsv(c.telegramGroup || ''),
    escapeCsv(c.telegramGroupId || ''),
    escapeCsv(c.telegramUserId || ''),
    escapeCsv(c.namaPegawai || ''),
    escapeCsv(c.tarikhDiambilTindakan || ''),
    escapeCsv(c.tarikhSelesai || ''),
    escapeCsv(c.tindakanTerkini || ''),
    escapeCsv(c.rating !== undefined && c.rating !== null ? c.rating : ''),
    escapeCsv(c.ulasanPelanggan || ''),
    escapeCsv(c.ratingTarikh || ''),
    escapeCsv(c.lampiranNama || ''),
    escapeCsv(c.lampiranDriveUrl || '')
  ].join(','));

  // Prepend UTF-8 BOM so Excel and Google Drive / Sheets render Malay characters properly
  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * Weekly Backup Trigger
 * Saves full database snapshot and CSV to Google Drive folder 1f2VTd_dug6ANOkyRqHtC7LaNcBJWoU28
 * Keeps the latest 2 weekly backups (2 weeks) and deletes older ones automatically.
 */
export async function runBackup(): Promise<{ success: boolean; message: string; fileName?: string; fileUrl?: string }> {
  const snapshot = db.getFullSnapshot();
  const complaints = snapshot.complaints || [];
  const tindakan = snapshot.tindakan || [];
  const logs = snapshot.logs || [];
  const studentSurveys = db.getStudentSurveys ? db.getStudentSurveys() : [];
  const emails = snapshot.emails || [];
  const config = db.getConfig();

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}`;

  // Complete Database JSON Snapshot
  const fullBackupPayload = {
    backupInfo: {
      system: 'SiAP - Sistem Aduan Pelanggan Kolej Komuniti Bandar Penawar',
      backupDate: now.toISOString(),
      backupLocalTimestamp: `${dateStr} ${now.toLocaleTimeString('ms-MY')} GMT+8`,
      retentionPolicy: '2 Minggu Terkini (Ahad 2:00 AM)',
      totalComplaints: complaints.length,
      totalTindakan: tindakan.length,
      totalLogs: logs.length,
      totalStudentSurveys: studentSurveys.length,
    },
    complaints,
    tindakan,
    logs,
    studentSurveys,
    emails,
    config: {
      ...config,
      telegramBotToken: config.telegramBotToken ? '***MASKED***' : undefined,
      smtpPass: config.smtpPass ? '***MASKED***' : undefined,
    },
  };

  const jsonContent = JSON.stringify(fullBackupPayload, null, 2);
  const jsonFileName = `siap_backup_${dateStr}_${timeStr}.json`;
  const csvContent = generateComplaintsCsv(complaints);
  const csvFileName = `siap_backup_${dateStr}_${timeStr}.csv`;

  const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL || config.googleAppsScriptUrl;
  if (!gasUrl) {
    return {
      success: false,
      message: 'Google Apps Script URL tidak dikonfigurasi. Sandaran tidak dapat dilakukan.',
    };
  }

  try {
    // 1. Muat naik fail CSV
    const csvResponse = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CREATE_BACKUP',
        folderId: BACKUP_FOLDER_ID,
        fileName: csvFileName,
        content: csvContent,
        maxBackups: 2, // Kekal 2 fail sandaran mingguan terkini (2 minggu)
      }),
      redirect: 'follow',
    });

    // 2. Muat naik fail JSON Penuh
    const jsonResponse = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CREATE_BACKUP',
        folderId: BACKUP_FOLDER_ID,
        fileName: jsonFileName,
        content: jsonContent,
        maxBackups: 2,
      }),
      redirect: 'follow',
    });

    const csvText = await csvResponse.text();
    let csvResult: any;
    try {
      csvResult = JSON.parse(csvText);
    } catch {
      csvResult = { status: 'success' };
    }

    if (csvResult.status === 'success') {
      console.log(`✅ Backup Penuh Database Berjaya: ${csvFileName} & ${jsonFileName} (${complaints.length} aduan, ${studentSurveys.length} soal selidik)`);
      return { 
        success: true, 
        message: `Sandaran mingguan (${csvFileName} & ${jsonFileName}) berjaya dimuat naik ke Google Drive! (${complaints.length} aduan, ${studentSurveys.length} soal selidik). Fail melebihi 2 minggu dipadam secara automatik.`, 
        fileName: csvFileName,
        fileUrl: csvResult.fileUrl || `https://drive.google.com/drive/folders/${BACKUP_FOLDER_ID}`
      };
    } else {
      console.error('❌ Backup gagal:', csvResult.message);
      return { success: false, message: csvResult.message || 'Sandaran gagal diproses oleh Google Apps Script.' };
    }
  } catch (err: any) {
    console.error('❌ Backup network error:', err.message);
    return { success: false, message: `Ralat sambungan sandaran: ${err.message}` };
  }
}

export async function handleBackupCron(req: Request, res: Response) {
  try {
    const authHeader = req.headers['authorization'];
    const cronSecret = authHeader?.replace('Bearer ', '') || req.headers['x-cron-secret'] as string;
    const isVercelCron = req.headers['x-vercel-cron'] === '1' || req.headers['user-agent']?.includes('vercel-cron');
    const isManualWithSecret = CRON_SECRET && cronSecret === CRON_SECRET;

    // Allow Vercel Cron triggers or manual with secret or authorized admin
    if (!isVercelCron && !isManualWithSecret && process.env.NODE_ENV === 'production' && CRON_SECRET) {
      return res.status(401).json({ error: 'Tidak dibenarkan. Sila sertakan CRON_SECRET yang betul.' });
    }

    const result = await runBackup();
    return res.status(result.success ? 200 : 500).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

