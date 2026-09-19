import { Complaint, ComplaintCategory, ComplaintStatus, EmailLog, LogItem, SystemStats, TindakanItem, StudentSurveyItem } from '../src/types.js';
import { getProcessedStudentSurveys } from '../src/data/studentSatisfactionData.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// ─── Supabase Client Setup ───
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = !!(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('your-supabase-project') &&
  SUPABASE_URL.startsWith('http')
);

// ─── Supabase Table Names ───
export const SUPABASE_TABLES = {
  COMPLAINTS: 'siap_complaints',
  TINDAKAN: 'siap_tindakan',
  LOGS: 'siap_logs',
  EMAILS: 'siap_emails',
  CONFIG: 'siap_config',
  STUDENT_SURVEYS: 'siap_student_satisfaction',
} as const;

let supabaseClient: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized.');
  } catch (err: any) {
    console.error('Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ Supabase not configured – running in local/fallback database mode.');
}

// In-memory + persisted store
export interface DBStore {
  complaints: Complaint[];
  tindakan: TindakanItem[];
  logs: LogItem[];
  emails: EmailLog[];
  lastSequenceNumber: number;
  config: {
    googleSheetId: string;
    googleAppsScriptUrl: string;
    googleDriveFolderId: string;
    googleDriveFolderUrl: string;
    telegramBotToken: string;
    telegramChatIdKemudahan: string;
    telegramChatIdSistem: string;
    telegramChatIdPerkhidmatan: string;
    telegramChatIdKebersihan: string;
    emailSenderName: string;
    smtpHost?: string;
    smtpPort?: string;
    smtpUser?: string;
    smtpPass?: string;
  };
}

const INITIAL_COMPLAINTS: Complaint[] = [];
const INITIAL_TINDAKAN: TindakanItem[] = [];
const INITIAL_LOGS: LogItem[] = [];
const INITIAL_EMAILS: EmailLog[] = [];

// fs and path are imported at top of file

const SERVER_DB_PATH = path.join(process.cwd(), 'server', 'db-store.json');
// Use /tmp for writable storage in serverless environments (Vercel, etc.)
// Detect by checking if process.cwd()/server is writable
function getDbFilePath(): string {
  try {
    // Test write access to server directory
    const testPath = path.join(process.cwd(), 'server', '.write_test');
    fs.writeFileSync(testPath, '1');
    try { fs.unlinkSync(testPath); } catch { /* ignore cleanup error */ }
    return SERVER_DB_PATH;
  } catch {
    // Read-only filesystem — use /tmp
    return '/tmp/db-store.json';
  }
}

let DB_FILE_PATH: string;
try {
  DB_FILE_PATH = getDbFilePath();
} catch {
  DB_FILE_PATH = '/tmp/db-store.json';
}

class Database {
  private store: DBStore;

  constructor() {
    // If running on Vercel, ensure the file is initialized in /tmp from the bundled database
    if (process.env.VERCEL) {
      const originalPath = path.join(process.cwd(), 'server', 'db-store.json');
      if (!fs.existsSync(DB_FILE_PATH) && fs.existsSync(originalPath)) {
        try {
          const dir = path.dirname(DB_FILE_PATH);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.copyFileSync(originalPath, DB_FILE_PATH);
        } catch (e) {
          // Ignore copy error
        }
      }
    }

    if (fs.existsSync(DB_FILE_PATH)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.store = JSON.parse(fileContent);
        if (!this.store.config) {
          this.store.config = this.getDefaultConfig();
        }
        return;
      } catch (e) {
        // Fall back to memory
      }
    }

    this.store = {
      complaints: [],
      tindakan: [],
      logs: [],
      emails: [],
      lastSequenceNumber: 0,
      config: this.getDefaultConfig(),
    };
    this.saveToFile();
  }

  private getDefaultConfig() {
    return {
      googleSheetId: process.env.GOOGLE_SHEET_ID || '1PEsqqZJL6az5Np-BTojlOCgPX9gD6Iip4zemQQ11W9U',
      googleAppsScriptUrl: process.env.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwqLeg4K5ffhrxvcC8TuxY5mlM8ZHtsdbCfXWtZ3MOiB0C01Yd8nOlw90po-vhDljx2jw/exec',
      googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || '1bQ1l9Q_Kz0JcUQsGVRxPkWQrj66yq8Qr',
      googleDriveFolderUrl: process.env.GOOGLE_DRIVE_FOLDER_URL || 'https://drive.google.com/drive/folders/1bQ1l9Q_Kz0JcUQsGVRxPkWQrj66yq8Qr?usp=sharing',
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '8238304961:AAG44pdgon1zFkqacccsk7da8iEPv83HPkQ',
      telegramChatIdKemudahan: process.env.TELEGRAM_CHAT_ID_KEMUDAHAN || '-1003546212661',
      telegramChatIdSistem: process.env.TELEGRAM_CHAT_ID_SISTEM || '-1003763181014',
      telegramChatIdPerkhidmatan: process.env.TELEGRAM_CHAT_ID_PERKHIDMATAN || '-1004423616468',
      telegramChatIdKebersihan: process.env.TELEGRAM_CHAT_ID_KEBERSIHAN || '-1003921165191',
      emailSenderName: process.env.EMAIL_SENDER_NAME || 'SiAP – Sistem Aduan Pelanggan',
      smtpHost: process.env.SMTP_HOST || '',
      smtpPort: process.env.SMTP_PORT || '587',
      smtpUser: process.env.SMTP_USER || 'aku6161@gmail.com',
      smtpPass: process.env.SMTP_PASS || 'wjir zsas zjfw iwpi',
    };
  }

  private saveToFile() {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.store, null, 2), 'utf-8');
    } catch (e) {
      // Ignore write errors in serverless read-only mode
    }
  }

  // ─── Supabase Helpers ───

  /** Load all data exclusively from Supabase into in-memory store in parallel */
  public async initFromSupabase(): Promise<void> {
    if (!supabaseClient) return;
    try {
      const compTable = SUPABASE_TABLES.COMPLAINTS;
      const tindTable = SUPABASE_TABLES.TINDAKAN;
      const logTable = SUPABASE_TABLES.LOGS;
      const emailTable = SUPABASE_TABLES.EMAILS;
      const cfgTable = SUPABASE_TABLES.CONFIG;

      // Run all 5 Supabase queries concurrently in parallel for maximum speed (<300ms)
      const [compRes, tindRes, logRes, emailRes, cfgRes] = await Promise.all([
        supabaseClient.from(compTable).select('*').order('"tarikhMasa"', { ascending: false }),
        supabaseClient.from(tindTable).select('*').order('"tarikhMasa"', { ascending: false }),
        supabaseClient.from(logTable).select('*').order('"tarikhMasa"', { ascending: false }),
        supabaseClient.from(emailTable).select('*').order('"tarikhMasa"', { ascending: false }),
        supabaseClient.from(cfgTable).select('*').eq('id', 'system_config').maybeSingle(),
      ]);

      if (compRes.data) {
        this.store.complaints = compRes.data as Complaint[];
      }
      if (tindRes.data) {
        this.store.tindakan = tindRes.data as TindakanItem[];
      }
      if (logRes.data) {
        this.store.logs = logRes.data as LogItem[];
      }
      if (emailRes.data) {
        this.store.emails = emailRes.data as EmailLog[];
      }
      if (cfgRes.data) {
        const { id: _id, lastSequenceNumber, ...configData } = cfgRes.data as any;
        this.store.config = { ...this.store.config, ...configData };
        if (lastSequenceNumber !== undefined) {
          this.store.lastSequenceNumber = lastSequenceNumber;
        }
      }

      // Calculate lastSequenceNumber dynamically based on highest reference number in complaints
      let maxSeq = 0;
      for (const c of this.store.complaints) {
        const parts = (c.noRujukan || '').split('-');
        if (parts.length === 3) {
          const seq = parseInt(parts[2], 10);
          if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
        }
      }
      this.store.lastSequenceNumber = maxSeq;
    } catch (e: any) {
      console.error('Error in initFromSupabase:', e.message);
    }
  }

  /** Write a single record to Supabase with await */
  private async sbUpsert(table: string, record: Record<string, any>): Promise<void> {
    if (!supabaseClient) return;
    try {
      let cleanRecord = record;
      if (table === SUPABASE_TABLES.COMPLAINTS && record.lampiran) {
        const { lampiran, ...rest } = record;
        cleanRecord = rest;
      }
      const { error } = await supabaseClient.from(table).upsert(cleanRecord);
      if (error) {
        // If table not found, try fallback without siap_ prefix
        if (error.message && error.message.includes('does not exist')) {
          const fallbackTable = table.replace('siap_', '');
          await supabaseClient.from(fallbackTable).upsert(cleanRecord);
        } else {
          console.warn(`Supabase upsert notice (${table}):`, error.message);
        }
      }
    } catch (err: any) {
      console.error('sbUpsert error:', err.message);
    }
  }

  /** Return full snapshot of current in-memory data (used by backup cron) */
  public getFullSnapshot() {
    return {
      complaints: [...this.store.complaints],
      tindakan: [...this.store.tindakan],
      logs: [...this.store.logs],
      emails: [...this.store.emails],
      config: { ...this.store.config },
      lastSequenceNumber: this.store.lastSequenceNumber,
      generatedAt: new Date().toISOString(),
    };
  }

  public getComplaints(): Complaint[] {
    return [...this.store.complaints];
  }

  public getComplaintByRef(noRujukan: string): Complaint | undefined {
    const trimmed = noRujukan.trim().toUpperCase();
    return this.store.complaints.find((c) => c.noRujukan.toUpperCase() === trimmed);
  }

  public async findComplaintByRef(noRujukan: string): Promise<Complaint | undefined> {
    const trimmed = noRujukan.trim().toUpperCase();
    let comp = this.store.complaints.find((c) => c.noRujukan.toUpperCase() === trimmed);
    if (comp) return comp;

    if (supabaseClient) {
      try {
        const compTable = SUPABASE_TABLES.COMPLAINTS;
        const { data } = await supabaseClient.from(compTable).select('*').eq('noRujukan', trimmed).maybeSingle();
        if (data) {
          comp = data as Complaint;
          this.store.complaints.unshift(comp);
          return comp;
        }
      } catch (err: any) {
        console.error('findComplaintByRef error:', err.message);
      }
    }
    return undefined;
  }

  public async createComplaint(data: {
    namaPengadu: string;
    telefon: string;
    emel: string;
    kategori: ComplaintCategory;
    kategoriNama: string;
    tajukAduan: string;
    butiranAduan: string;
    lokasi: string;
    tarikhKejadian: string;
    lampiran?: string;
    lampiranNama?: string;
    lampiranDriveUrl?: string;
    telegramGroup: string;
    telegramGroupId: string;
  }): Promise<Complaint> {
    this.store.lastSequenceNumber += 1;
    const year = new Date().getFullYear();
    const seqStr = String(this.store.lastSequenceNumber).padStart(5, '0');
    const noRujukan = `SIAP-${year}-${seqStr}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Save attachment locally if present to bypass Google Drive access restrictions
    let fileUrl = undefined;
    if (data.lampiran) {
      try {
        // Use /tmp/uploads if the main uploads dir is not writable (same logic as DB path)
        let uploadsDir = path.join(process.cwd(), 'uploads');
        try {
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
          // Quick write test
          const testP = path.join(uploadsDir, '.wtest');
          fs.writeFileSync(testP, '1');
          try { fs.unlinkSync(testP); } catch { /* ignore */ }
        } catch {
          uploadsDir = '/tmp/uploads';
        }
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        let mimeType = 'image/jpeg';
        let cleanBase64 = data.lampiran;
        
        if (cleanBase64.indexOf('data:') === 0 && cleanBase64.indexOf('base64,') > -1) {
          const parts = cleanBase64.split('base64,');
          mimeType = parts[0].replace('data:', '').replace(';', '').trim();
          cleanBase64 = parts[1];
        }
        
        const buffer = Buffer.from(cleanBase64, 'base64');
        const ext = mimeType.includes('png') ? '.png' : mimeType.includes('pdf') ? '.pdf' : '.jpg';
        const fileName = `${noRujukan}_${Date.now()}${ext}`;
        const filePath = path.join(uploadsDir, fileName);
        
        fs.writeFileSync(filePath, buffer);
        
        const appUrl = process.env.APP_URL || '';
        if (appUrl) {
          fileUrl = `${appUrl}/uploads/${fileName}`;
        }
      } catch (err) {
        console.error('Error saving file locally:', err);
      }
    }

    const newComplaint: Complaint = {
      id: `c_${Date.now()}`,
      noRujukan,
      tarikhMasa: now,
      namaPengadu: data.namaPengadu,
      telefon: data.telefon,
      emel: data.emel,
      kategori: data.kategori,
      kategoriNama: data.kategoriNama,
      tajukAduan: data.tajukAduan,
      butiranAduan: data.butiranAduan,
      lokasi: data.lokasi,
      tarikhKejadian: data.tarikhKejadian || now.substring(0, 10),
      lampiran: undefined, // Base64 excluded so payloads and Supabase remain ultra-light
      lampiranNama: data.lampiranNama,
      lampiranDriveUrl: fileUrl || data.lampiranDriveUrl,
      status: 'MENUNGGU',
      telegramGroup: data.telegramGroup,
      telegramGroupId: data.telegramGroupId,
      tindakanTerkini: 'Aduan baharu diterima dan dihantar ke saluran Telegram petugas.',
    };

    this.store.complaints.unshift(newComplaint);

    // Add log
    await this.addLog({
      jenisAktiviti: 'ADUAN_DITERIMA',
      noRujukan,
      keterangan: `Aduan baharu didaftarkan: "${data.tajukAduan}" oleh ${data.namaPengadu}.`,
      dilakukanOleh: 'Portal Web SiAP',
    });

    this.saveToFile();
    // Await Supabase write so Serverless doesn't terminate prematurely
    await this.sbUpsert(SUPABASE_TABLES.COMPLAINTS, { ...newComplaint });
    return newComplaint;
  }

  public async updateComplaint(
    noRujukan: string,
    updates: Partial<Complaint>,
    performedBy: string = 'Sistem'
  ): Promise<Complaint | null> {
    const comp = this.getComplaintByRef(noRujukan);
    if (!comp) return null;

    const prevStatus = comp.status;
    Object.assign(comp, updates);

    if (updates.status && updates.status !== prevStatus) {
      await this.addLog({
        jenisAktiviti: updates.status === 'SELESAI' ? 'ADUAN_SELESAI' : 'STATUS_DIKEMASKINI',
        noRujukan,
        keterangan: `Status aduan ditukar dari "${prevStatus}" kepada "${updates.status}".`,
        dilakukanOleh: performedBy,
      });
    }

    this.saveToFile();
    await this.sbUpsert(SUPABASE_TABLES.COMPLAINTS, { ...comp });
    return comp;
  }

  public async assignOfficer(
    noRujukan: string,
    officerInfo: {
      telegramUserId: string;
      namaPegawai: string;
    }
  ): Promise<{ success: boolean; message: string; complaint?: Complaint }> {
    const comp = this.getComplaintByRef(noRujukan);
    if (!comp) return { success: false, message: 'Aduan tidak dijumpai.' };

    if (comp.namaPegawai && comp.status !== 'MENUNGGU') {
      return {
        success: false,
        message: `Aduan ini telah pun diambil oleh ${comp.namaPegawai}.`,
        complaint: comp,
      };
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    comp.telegramUserId = officerInfo.telegramUserId;
    comp.namaPegawai = officerInfo.namaPegawai;
    comp.tarikhDiambilTindakan = now;
    comp.status = 'DALAM_TINDAKAN';
    comp.tindakanTerkini = `Aduan diambil tindakan oleh ${officerInfo.namaPegawai}.`;

    // Record in tindakan table
    await this.addTindakan({
      noRujukan,
      telegramUserId: officerInfo.telegramUserId,
      namaPegawai: officerInfo.namaPegawai,
      status: 'DALAM_TINDAKAN',
      catatanTindakan: `Aduan diambil oleh ${officerInfo.namaPegawai} untuk siasatan dan tindakan lanjut.`,
    });

    await this.addLog({
      jenisAktiviti: 'ADUAN_DIAMBIL',
      noRujukan,
      keterangan: `Aduan diambil oleh pegawai ${officerInfo.namaPegawai} (${officerInfo.telegramUserId}).`,
      dilakukanOleh: officerInfo.namaPegawai,
    });

    this.saveToFile();
    await this.sbUpsert(SUPABASE_TABLES.COMPLAINTS, { ...comp });
    return { success: true, message: 'Tindakan berjaya diambil.', complaint: comp };
  }

  public async addTindakan(item: Omit<TindakanItem, 'id' | 'tarikhMasa'>): Promise<TindakanItem> {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const tindakan: TindakanItem = {
      id: `t_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      noRujukan: item.noRujukan,
      tarikhMasa: now,
      telegramUserId: item.telegramUserId,
      namaPegawai: item.namaPegawai,
      status: item.status,
      catatanTindakan: item.catatanTindakan,
    };

    this.store.tindakan.unshift(tindakan);

    // Update latest action in complaint
    const comp = this.getComplaintByRef(item.noRujukan);
    if (comp) {
      comp.status = item.status;
      comp.tindakanTerkini = item.catatanTindakan;
      if (item.status === 'SELESAI' && !comp.tarikhSelesai) {
        comp.tarikhSelesai = now;
      }
    }

    await this.addLog({
      jenisAktiviti: 'TINDAKAN_DITAMBAH',
      noRujukan: item.noRujukan,
      keterangan: `Catatan tindakan ditambah oleh ${item.namaPegawai}: "${item.catatanTindakan.substring(0, 60)}..."`,
      dilakukanOleh: item.namaPegawai,
    });

    this.saveToFile();
    await this.sbUpsert(SUPABASE_TABLES.TINDAKAN, { ...tindakan });
    if (comp) await this.sbUpsert(SUPABASE_TABLES.COMPLAINTS, { ...comp });
    return tindakan;
  }

  public getTindakanForComplaint(noRujukan: string): TindakanItem[] {
    const trimmed = noRujukan.trim().toUpperCase();
    return this.store.tindakan.filter((t) => t.noRujukan.toUpperCase() === trimmed);
  }

  public getAllTindakan(): TindakanItem[] {
    return [...this.store.tindakan];
  }

  public async deleteComplaint(noRujukan: string): Promise<{ success: boolean; message: string }> {
    const trimmed = noRujukan.trim().toUpperCase();
    const index = this.store.complaints.findIndex((c) => c.noRujukan.toUpperCase() === trimmed);
    if (index === -1) {
      return { success: false, message: 'Aduan tidak dijumpai.' };
    }

    const removed = this.store.complaints.splice(index, 1)[0];
    this.store.tindakan = this.store.tindakan.filter((t) => t.noRujukan.toUpperCase() !== trimmed);

    await this.addLog({
      jenisAktiviti: 'STATUS_DIKEMASKINI',
      noRujukan: trimmed,
      keterangan: `Aduan ${trimmed} (${removed.tajukAduan}) telah dipadam oleh Pentadbir.`,
      dilakukanOleh: 'Admin SiAP',
    });

    this.saveToFile();

    if (supabaseClient) {
      try {
        await Promise.allSettled([
          supabaseClient.from(SUPABASE_TABLES.COMPLAINTS).delete().eq('noRujukan', trimmed),
          supabaseClient.from(SUPABASE_TABLES.TINDAKAN).delete().eq('noRujukan', trimmed),
        ]);
      } catch (err: any) {
        console.error('Supabase delete error:', err.message);
      }
    }

    return { success: true, message: `Aduan ${trimmed} berjaya dipadam.` };
  }

  public async addRating(noRujukan: string, rating: number, ulasan?: string): Promise<{ success: boolean; message: string; complaint?: Complaint }> {
    let comp = this.getComplaintByRef(noRujukan);
    if (!comp) {
      comp = await this.findComplaintByRef(noRujukan);
    }
    if (!comp) return { success: false, message: 'Aduan tidak dijumpai.' };

    if (comp.status !== 'SELESAI' && comp.status !== 'TIDAK_DAPAT_DISELESAIKAN') {
      return { success: false, message: 'Penilaian hanya boleh diberikan untuk aduan yang telah Selesai atau Tidak Dapat Diselesaikan.' };
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    comp.rating = Math.max(1, Math.min(5, Math.round(rating)));
    comp.ulasanPelanggan = ulasan || '';
    comp.ratingTarikh = now;

    await this.addLog({
      jenisAktiviti: 'RATING_DITERIMA',
      noRujukan,
      keterangan: `Pelanggan memberikan rating ${comp.rating}/5. Ulasan: "${ulasan || 'Tiada ulasan'}".`,
      dilakukanOleh: comp.namaPengadu,
    });

    this.saveToFile();
    await this.sbUpsert(SUPABASE_TABLES.COMPLAINTS, { ...comp });
    return { success: true, message: 'Penilaian kepuasan berjaya direkodkan. Terima kasih!', complaint: comp };
  }

  public async addPublicRating(rating: number, ulasan?: string, nama?: string): Promise<{ success: boolean; message: string }> {
    const validRating = Math.max(1, Math.min(5, Math.round(rating)));
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const ref = `RATING-${Date.now().toString().slice(-6)}`;

    const comp: Complaint = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      noRujukan: ref,
      namaPengadu: nama || 'Pengunjung SiAP',
      telefon: '-',
      emel: '-',
      kategori: 'PERKHIDMATAN',
      kategoriNama: 'Maklum Balas Pelanggan',
      tajukAduan: 'Maklum Balas Kepuasan Pelanggan',
      butiranAduan: ulasan || 'Penilaian kepuasan daripada pengguna.',
      lokasi: 'Portal SiAP',
      tarikhKejadian: now.split(' ')[0],
      status: 'SELESAI',
      telegramGroup: 'Umum',
      telegramGroupId: '0',
      tarikhMasa: now,
      tarikhSelesai: now,
      rating: validRating,
      ulasanPelanggan: ulasan || '',
      ratingTarikh: now,
    };

    this.store.complaints.unshift(comp);
    await this.addLog({
      jenisAktiviti: 'RATING_DITERIMA',
      noRujukan: ref,
      keterangan: `Maklum balas umum diterima: ${validRating}/5. Ulasan: "${ulasan || 'Tiada ulasan'}".`,
      dilakukanOleh: comp.namaPengadu,
    });

    this.saveToFile();
    await this.sbUpsert(SUPABASE_TABLES.COMPLAINTS, { ...comp });
    return { success: true, message: 'Penilaian anda berjaya dihantar. Terima kasih atas maklum balas anda!' };
  }

  public async addLog(item: Omit<LogItem, 'id' | 'tarikhMasa'>): Promise<LogItem> {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const log: LogItem = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tarikhMasa: now,
      ...item,
    };
    this.store.logs.unshift(log);
    this.saveToFile();
    await this.sbUpsert(SUPABASE_TABLES.LOGS, { ...log });
    return log;
  }

  public getLogs(limit: number = 100): LogItem[] {
    return this.store.logs.slice(0, limit);
  }

  public async addEmailLog(email: Omit<EmailLog, 'id' | 'tarikhMasa'>): Promise<EmailLog> {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const item: EmailLog = {
      id: `em_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tarikhMasa: now,
      ...email,
    };
    this.store.emails.unshift(item);
    this.saveToFile();
    await this.sbUpsert(SUPABASE_TABLES.EMAILS, { ...item });
    return item;
  }

  public getEmails(limit: number = 50): EmailLog[] {
    return this.store.emails.slice(0, limit);
  }

  public getStudentSurveys(year?: string | number): StudentSurveyItem[] {
    const all = getProcessedStudentSurveys();
    if (!year || year === 'ALL') return all;
    const yNum = typeof year === 'string' ? parseInt(year, 10) : year;
    return all.filter((item) => item.year === yNum);
  }

  public getConfig() {
    const defaults = this.getDefaultConfig();
    return {
      ...defaults,
      ...this.store.config,
      telegramBotToken: this.store.config?.telegramBotToken || defaults.telegramBotToken,
      telegramChatIdKemudahan: this.store.config?.telegramChatIdKemudahan || defaults.telegramChatIdKemudahan,
      telegramChatIdSistem: this.store.config?.telegramChatIdSistem || defaults.telegramChatIdSistem,
      telegramChatIdPerkhidmatan: this.store.config?.telegramChatIdPerkhidmatan || defaults.telegramChatIdPerkhidmatan,
      telegramChatIdKebersihan: this.store.config?.telegramChatIdKebersihan || defaults.telegramChatIdKebersihan,
      googleAppsScriptUrl: this.store.config?.googleAppsScriptUrl || defaults.googleAppsScriptUrl,
      smtpUser: this.store.config?.smtpUser || defaults.smtpUser,
      smtpPass: this.store.config?.smtpPass || defaults.smtpPass,
    };
  }

  public async updateConfig(newConfig: Partial<DBStore['config']>) {
    Object.assign(this.store.config, newConfig);
    this.saveToFile();
    await this.sbUpsert(SUPABASE_TABLES.CONFIG, { id: 'system_config', ...this.store.config, lastSequenceNumber: this.store.lastSequenceNumber });
    return { ...this.store.config };
  }



  public getStats(): SystemStats {
    const list = this.store.complaints;
    const totalAduan = list.length;
    let menunggu = 0;
    let dalamSemakan = 0;
    let dalamTindakan = 0;
    let selesai = 0;
    let tidakDapatDiselesaikan = 0;
    let totalRatingSum = 0;
    let totalRatingCount = 0;
    let totalResolutionHours = 0;
    let resolvedCount = 0;
    let unassignedCount = 0;

    for (const c of list) {
      if (c.status === 'MENUNGGU') menunggu++;
      else if (c.status === 'DALAM_SEMAKAN') dalamSemakan++;
      else if (c.status === 'DALAM_TINDAKAN') dalamTindakan++;
      else if (c.status === 'SELESAI') selesai++;
      else if (c.status === 'TIDAK_DAPAT_DISELESAIKAN') tidakDapatDiselesaikan++;

      if (!c.namaPegawai && c.status !== 'SELESAI' && c.status !== 'TIDAK_DAPAT_DISELESAIKAN') {
        unassignedCount++;
      }

      if (c.rating) {
        totalRatingSum += c.rating;
        totalRatingCount++;
      }

      if (c.tarikhSelesai && c.tarikhMasa) {
        const start = new Date(c.tarikhMasa).getTime();
        const end = new Date(c.tarikhSelesai).getTime();
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          const diffHours = (end - start) / (1000 * 60 * 60);
          totalResolutionHours += diffHours;
          resolvedCount++;
        }
      }
    }

    const purataKepuasan = totalRatingCount > 0 ? Number((totalRatingSum / totalRatingCount).toFixed(1)) : 4.5;
    const purataMasaPenyelesaianJam = resolvedCount > 0 ? Number((totalResolutionHours / resolvedCount).toFixed(1)) : 4.2;

    return {
      totalAduan,
      menunggu,
      dalamSemakan,
      dalamTindakan,
      selesai,
      tidakDapatDiselesaikan,
      purataMasaPenyelesaianJam,
      purataKepuasan,
      totalRating: totalRatingCount,
      unassignedCount,
    };
  }

  public getRatingSummary() {
    const list = this.store.complaints;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    let count = 0;

    for (const c of list) {
      if (c.rating && c.rating >= 1 && c.rating <= 5) {
        distribution[c.rating as 1 | 2 | 3 | 4 | 5]++;
        sum += c.rating;
        count++;
      }
    }

    // Default baseline if no rating yet so landing page shows realistic data
    const average = count > 0 ? Number((sum / count).toFixed(1)) : 4.5;

    let emojiLabel = 'Memuaskan';
    let ratingEmoji = '😊';
    if (average >= 4.5) {
      emojiLabel = 'Sangat Memuaskan';
      ratingEmoji = '🤩';
    } else if (average >= 3.5) {
      emojiLabel = 'Memuaskan';
      ratingEmoji = '😊';
    } else if (average >= 2.5) {
      emojiLabel = 'Baik';
      ratingEmoji = '🙂';
    } else if (average >= 1.5) {
      emojiLabel = 'Tidak Memuaskan';
      ratingEmoji = '🙁';
    } else {
      emojiLabel = 'Sangat Tidak Memuaskan';
      ratingEmoji = '😡';
    }

    return {
      averageRating: average,
      totalRatings: count,
      ratingDistribution: distribution,
      emojiLabel,
      ratingEmoji,
    };
  }

  public overwriteDatabase(data: {
    complaints: Complaint[];
    tindakan: TindakanItem[];
    logs: LogItem[];
  }) {
    this.store.complaints = data.complaints;
    this.store.tindakan = data.tindakan;
    this.store.logs = data.logs;

    // Recalculate lastSequenceNumber based on reference numbers
    let maxSeq = 5;
    for (const c of data.complaints) {
      const parts = c.noRujukan.split('-');
      if (parts.length === 3) {
        const seq = parseInt(parts[2], 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    }
    this.store.lastSequenceNumber = maxSeq;

    // Clean up unreferenced local files in the uploads folder
    try {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        const validRefs = new Set(data.complaints.map(c => c.noRujukan));
        for (const file of files) {
          // File pattern: complaint_SIAP-YYYY-XXXXX_...
          const match = file.match(/^complaint_(SIAP-\d{4}-\d{5})/);
          if (match) {
            const ref = match[1];
            if (!validRefs.has(ref)) {
              const filePath = path.join(uploadDir, file);
              fs.unlinkSync(filePath);
              console.log(`Deleted unreferenced local attachment file: ${file}`);
            }
          }
        }
      }
    } catch (e: any) {
      console.error('Failed to clean up unreferenced files:', e.message);
    }

    this.saveToFile();
  }
}

export const db = new Database();
