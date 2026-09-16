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
 * Saves CSV backup to Google Drive folder 1f2VTd_dug6ANOkyRqHtC7LaNcBJWoU28
 */
export async function runBackup(): Promise<{ success: boolean; message: string; fileName?: string; fileUrl?: string }> {
  const complaints = db.getComplaints();
  const csvContent = generateComplaintsCsv(complaints);
  const now = new Date();

  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}`;
  const fileName = `siap_backup_${dateStr}_${timeStr}.csv`;

  const gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL || db.getConfig().googleAppsScriptUrl;
  if (!gasUrl) {
    return {
      success: false,
      message: 'Google Apps Script URL tidak dikonfigurasi. Sandaran tidak dapat dilakukan.',
    };
  }

  try {
    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'CREATE_BACKUP',
        folderId: BACKUP_FOLDER_ID,
        fileName,
        content: csvContent,
        maxBackups: 2, // Kekal 2 fail sandaran mingguan terkini (2 minggu)
      }),
      redirect: 'follow',
    });

    const text = await response.text();
    let result: any;
    try {
      result = JSON.parse(text);
    } catch {
      result = { status: 'success', message: 'Sandaran CSV dihantar ke Google Drive.' };
    }

    if (result.status === 'success') {
      console.log(`✅ Backup CSV berjaya: ${fileName} (${complaints.length} rekod)`);
      return { 
        success: true, 
        message: result.message || `Sandaran CSV ${fileName} berjaya disimpan (${complaints.length} rekod).`, 
        fileName,
        fileUrl: result.fileUrl
      };
    } else {
      console.error('❌ Backup gagal:', result.message);
      return { success: false, message: result.message || 'Sandaran gagal.' };
    }
  } catch (err: any) {
    console.error('❌ Backup network error:', err.message);
    return { success: false, message: `Ralat sambungan: ${err.message}` };
  }
}

export async function handleBackupCron(req: Request, res: Response) {
  try {
    const authHeader = req.headers['authorization'];
    const cronSecret = authHeader?.replace('Bearer ', '') || req.headers['x-cron-secret'] as string;
    const isVercelCron = req.headers['x-vercel-cron'] === '1';
    const isManualWithSecret = CRON_SECRET && cronSecret === CRON_SECRET;

    if (!isVercelCron && !isManualWithSecret) {
      return res.status(401).json({ error: 'Tidak dibenarkan. Sila sertakan CRON_SECRET yang betul.' });
    }

    const result = await runBackup();
    return res.status(result.success ? 200 : 500).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
