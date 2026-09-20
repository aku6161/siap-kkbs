import { db, SUPABASE_TABLES } from './db.js';
import { Complaint, StudentSurveyItem } from '../src/types.js';
import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const CRON_SECRET = process.env.CRON_SECRET || '';
const RETENTION_COPIES = 2; // Simpan 2 fail sandaran terkini (2 minggu), selebihnya dipadam secara automatik

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * 1. Jana CSV Senarai Aduan Pelanggan
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
    escapeCsv((c as any).telefon || ''),
    escapeCsv(c.emel || ''),
    escapeCsv(c.kategori || ''),
    escapeCsv(c.kategoriNama || ''),
    escapeCsv(c.tajukAduan || ''),
    escapeCsv(c.butiranAduan || ''),
    escapeCsv(c.lokasi || ''),
    escapeCsv(c.tarikhKejadian || ''),
    escapeCsv(c.status || ''),
    escapeCsv(c.telegramGroup || ''),
    escapeCsv((c as any).telegramGroupId || ''),
    escapeCsv(c.telegramUserId || ''),
    escapeCsv(c.namaPegawai || ''),
    escapeCsv(c.tarikhDiambilTindakan || ''),
    escapeCsv(c.tarikhSelesai || ''),
    escapeCsv(c.tindakanTerkini || ''),
    escapeCsv(c.rating !== undefined && c.rating !== null ? c.rating : ''),
    escapeCsv(c.ulasanPelanggan || ''),
    escapeCsv((c as any).ratingTarikh || ''),
    escapeCsv(c.lampiranNama || ''),
    escapeCsv(c.lampiranDriveUrl || '')
  ].join(','));

  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * 2. Jana CSV Maklum Balas Kepuasan Pelanggan (Pelajar)
 */
export function generateStudentSurveysCsv(surveys: StudentSurveyItem[]): string {
  const headers = [
    'ID Soal Selidik',
    'Tarikh & Masa',
    'Tahun',
    'Jantina',
    'Program Pengajian',
    'Semester',
    'Skor Bilik Kuliah',
    'Skor Perpustakaan',
    'Skor Bengkel Amali',
    'Skor Bengkel Dapur',
    'Skor Makmal Komputer',
    'Skor Dewan Kuliah',
    'Skor Immersive Centre',
    'Skor eTech Centre',
    'Skor Kafe',
    'Skor Kemudahan Sokongan',
    'Skor WiFi',
    'Purata Skor Keseluruhan (1-5)',
    'Keutamaan Penambahbaikan',
    'Cadangan Pelajar'
  ];

  const rows = surveys.map((s) => [
    escapeCsv(s.id || ''),
    escapeCsv(s.timestamp || ''),
    escapeCsv(s.year || ''),
    escapeCsv(s.jantina || ''),
    escapeCsv(s.programPengajian || ''),
    escapeCsv(s.semester || ''),
    escapeCsv(s.scores?.bilikKuliah ?? ''),
    escapeCsv(s.scores?.perpustakaan ?? ''),
    escapeCsv(s.scores?.bengkelAmali ?? ''),
    escapeCsv(s.scores?.bengkelDapur ?? ''),
    escapeCsv(s.scores?.makmalKomputer ?? ''),
    escapeCsv(s.scores?.dewanKuliah ?? ''),
    escapeCsv(s.scores?.immersiveCentre ?? ''),
    escapeCsv(s.scores?.eTechCentre ?? ''),
    escapeCsv(s.scores?.kafe ?? ''),
    escapeCsv(s.scores?.kemudahanSokongan ?? ''),
    escapeCsv(s.scores?.wifi ?? ''),
    escapeCsv(s.scores?.purataKeseluruhan ?? ''),
    escapeCsv(s.kemudahanPenambahbaikan || ''),
    escapeCsv(s.cadangan || '')
  ].join(','));

  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * 3. Jana CSV Penuh (Aduan + Tindakan + Kepuasan Pelajar Dalam 1 Fail Master)
 */
export function generateMasterAllCsv(complaints: Complaint[], surveys: StudentSurveyItem[]): string {
  const compCsv = generateComplaintsCsv(complaints);
  const surveyCsv = generateStudentSurveysCsv(surveys);

  return `${compCsv}\r\n\r\n\r\n=== DATA MAKLUM BALAS KEPUASAN PELAJAR ===\r\n\r\n${surveyCsv}`;
}

/**
 * Pembersihan Automatik: Simpan 2 minggu data sandaran terkini, padam selebihnya
 */
function cleanOldBackups(targetDir: string, maxCopies = RETENTION_COPIES) {
  try {
    if (!fs.existsSync(targetDir)) return;
    const allFiles = fs.readdirSync(targetDir);

    // Kumpulan pola fail sandaran
    const prefixes = [
      'SiAP_Sandaran_Aduan_',
      'SiAP_Sandaran_Kepuasan_Pelajar_',
    ];

    // Padam fail JSON jika ada
    for (const f of allFiles) {
      if (f.endsWith('.json') && f.startsWith('SiAP_Sandaran_')) {
        try {
          fs.unlinkSync(path.join(targetDir, f));
        } catch {}
      }
    }

    for (const prefix of prefixes) {
      const matchingFiles = allFiles
        .filter((f) => f.startsWith(prefix) && f.endsWith('.csv'))
        .sort((a, b) => b.localeCompare(a)); // Paling baru di hadapan

      if (matchingFiles.length > maxCopies) {
        const filesToDelete = matchingFiles.slice(maxCopies);
        for (const file of filesToDelete) {
          try {
            const filePath = path.join(targetDir, file);
            fs.unlinkSync(filePath);
            console.log(`🧹 Auto-Cleanup: Memadam sandaran lama (> 2 minggu): ${file}`);
          } catch (e: any) {
            console.warn(`Gagal memadam fail lama ${file}:`, e.message);
          }
        }
      }
    }
  } catch (err: any) {
    console.error(`Ralat semasa auto-cleanup pada ${targetDir}:`, err.message);
  }
}

/**
 * Pelaksanaan Sandaran Automatik Setiap Ahad Jam 2:00 AM
 * Mengambil data TERUS dari Supabase (bukan dari db tempatan)
 */
export async function runBackup(): Promise<{ success: boolean; message: string; savedPaths: string[] }> {
  // ── Sambung terus ke Supabase ──
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
  let complaints: Complaint[] = [];
  let studentSurveys: StudentSurveyItem[] = [];
  let tindakan: any[] = [];
  let logs: any[] = [];

  if (supabaseUrl && supabaseKey) {
    try {
      const sb = createClient(supabaseUrl, supabaseKey);
      const [compRes, surveyRes, tindRes, logRes] = await Promise.all([
        sb.from(SUPABASE_TABLES.COMPLAINTS).select('*').order('"tarikhMasa"', { ascending: false }),
        sb.from(SUPABASE_TABLES.STUDENT_SURVEYS).select('*').order('timestamp', { ascending: false }),
        sb.from(SUPABASE_TABLES.TINDAKAN).select('*'),
        sb.from(SUPABASE_TABLES.LOGS).select('*'),
      ]);
      if (compRes.data) complaints = compRes.data as Complaint[];
      if (surveyRes.data) studentSurveys = surveyRes.data as StudentSurveyItem[];
      if (tindRes.data) tindakan = tindRes.data;
      if (logRes.data) logs = logRes.data;
      console.log(`📥 Supabase: ${complaints.length} aduan, ${studentSurveys.length} kepuasan pelajar, ${tindakan.length} tindakan`);
    } catch (e: any) {
      console.warn('Supabase fetch gagal, guna db tempatan:', e.message);
      const snapshot = db.getFullSnapshot();
      complaints = snapshot.complaints || [];
      tindakan = snapshot.tindakan || [];
      logs = snapshot.logs || [];
    }
  } else {
    // Fallback ke db tempatan jika Supabase tidak dikonfigurasi
    console.warn('⚠️ SUPABASE_URL/KEY tidak dikonfigurasi — guna db tempatan sebagai fallback');
    const snapshot = db.getFullSnapshot();
    complaints = snapshot.complaints || [];
    tindakan = snapshot.tindakan || [];
    logs = snapshot.logs || [];
  }

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

  const compCsvName = `SiAP_Sandaran_Aduan_${dateStr}_${timeStr}.csv`;
  const surveyCsvName = `SiAP_Sandaran_Kepuasan_Pelajar_${dateStr}_${timeStr}.csv`;

  const compCsvContent = generateComplaintsCsv(complaints);
  const surveyCsvContent = generateStudentSurveysCsv(studentSurveys);

  const savedPaths: string[] = [];

  // Folder sasaran: Google Drive (di-mount) & backups/ tempatan
  const rawFolders = [
    '/Users/shamsuddinamin/Library/CloudStorage/GoogleDrive-aku6161@gmail.com/My Drive/PROJEK AI/SISTEM BACKUP/SiAP BACKUP',
    path.resolve(process.cwd(), 'backups'),
  ];
  const backupFolders = Array.from(new Set(rawFolders));

  for (const dir of backupFolders) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const compPath = path.join(dir, compCsvName);
      fs.writeFileSync(compPath, compCsvContent, 'utf8');

      const surveyPath = path.join(dir, surveyCsvName);
      fs.writeFileSync(surveyPath, surveyCsvContent, 'utf8');

      savedPaths.push(compPath, surveyPath);

      cleanOldBackups(dir, RETENTION_COPIES);
      console.log(`✅ Sandaran CSV disimpan ke: ${dir}`);
    } catch (e: any) {
      console.warn(`Gagal folder sandaran ${dir}:`, e.message);
    }
  }

  return {
    success: savedPaths.length > 0,
    message: `Sandaran CSV (${compCsvName}, ${surveyCsvName}) berjaya! ${complaints.length} aduan, ${studentSurveys.length} kepuasan pelajar. 2 minggu terkini dikekalkan.`,
    savedPaths
  };
}

/**
 * Handler HTTP untuk Cron Job (Vercel Cron / API Trigger)
 */
export async function handleBackupCron(req: Request, res: Response) {
  try {
    const authHeader = req.headers['authorization'];
    const cronSecret = authHeader?.replace('Bearer ', '') || req.headers['x-cron-secret'] as string;
    const isVercelCron = req.headers['x-vercel-cron'] === '1' || req.headers['user-agent']?.includes('vercel-cron');
    const isManualWithSecret = CRON_SECRET && cronSecret === CRON_SECRET;

    if (!isVercelCron && !isManualWithSecret && process.env.NODE_ENV === 'production' && CRON_SECRET) {
      return res.status(401).json({ error: 'Tidak dibenarkan. Sila sertakan CRON_SECRET yang betul.' });
    }

    const result = await runBackup();
    return res.status(result.success ? 200 : 500).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Inisialisasi Penjadual Dalaman (Node.js Background Scheduler)
 * Memeriksa waktu setiap minit: Jika Hari Ahad (0) jam 02:00 pagi, sandaran dijalankan automatik
 */
let lastRunDate = '';
export function initBackupScheduler() {
  console.log('⏰ Penjadual Sandaran Automatik Diaktifkan: Setiap Ahad jam 2.00 pagi (Simpan 2 minggu data terkini)');

  setInterval(async () => {
    try {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = Ahad
      const hours = now.getHours();   // 2 = 2 AM
      const minutes = now.getMinutes();
      const todayDateStr = now.toISOString().slice(0, 10);

      // Jalankan pada Hari Ahad jam 02:00 pagi sekali sahaja sehari
      if (dayOfWeek === 0 && hours === 2 && minutes === 0 && lastRunDate !== todayDateStr) {
        lastRunDate = todayDateStr;
        console.log('🚀 Menjalankan sandaran mingguan automatik (Ahad 2:00 AM)...');
        await runBackup();
      }
    } catch (e: any) {
      console.error('Ralat pada penjadual sandaran dalaman:', e.message);
    }
  }, 60000); // Semak setiap 60 saat
}
