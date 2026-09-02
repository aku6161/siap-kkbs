import { Complaint, ComplaintCategory, ComplaintStatus, EmailLog, LogItem, SystemStats, TindakanItem } from '../src/types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// ─── Supabase Client Setup ───
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('your-supabase-project'));

let supabaseClient: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Supabase client initialized.');
} else {
  console.warn('⚠️  Supabase not configured – running on local file DB only.');
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

const DB_FILE_PATH = process.env.VERCEL 
  ? path.join('/tmp', 'db-store.json')
  : path.join(process.cwd(), 'server', 'db-store.json');

class Database {
  private store: DBStore;

  constructor() {
    // If running on Vercel, ensure the file is initialized in /tmp from the bundled database
    if (process.env.VERCEL) {
      const originalPath = path.join(process.cwd(), 'server', 'db-store.json');
      if (!fs.existsSync(DB_FILE_PATH) && fs.existsSync(originalPath)) {
        try {
          // Ensure parent directory of DB_FILE_PATH exists (just in case)
          const dir = path.dirname(DB_FILE_PATH);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.copyFileSync(originalPath, DB_FILE_PATH);
        } catch (e) {
          console.error('Failed to copy initial db-store to /tmp:', e);
        }
      }
    }

    if (fs.existsSync(DB_FILE_PATH)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.store = JSON.parse(fileContent);
        // Ensure config exists
        if (!this.store.config) {
          this.store.config = this.getDefaultConfig();
        }
        return;
      } catch (e) {
        console.error('Error loading db-store.json, using defaults:', e);
      }
    }

    this.store = {
      complaints: [...INITIAL_COMPLAINTS],
      tindakan: [...INITIAL_TINDAKAN],
      logs: [...INITIAL_LOGS],
      emails: [...INITIAL_EMAILS],
      lastSequenceNumber: 5,
      config: this.getDefaultConfig(),
    };
    this.saveToFile();
  }

  private getDefaultConfig() {
    return {
      googleSheetId: process.env.GOOGLE_SHEET_ID || '1PEsqqZJL6az5Np-BTojlOCgPX9gD6Iip4zemQQ11W9U',
      googleAppsScriptUrl: process.env.GOOGLE_APPS_SCRIPT_URL || '',
      googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID || '1bQ1l9Q_Kz0JcUQsGVRxPkWQrj66yq8Qr',
      googleDriveFolderUrl: process.env.GOOGLE_DRIVE_FOLDER_URL || 'https://drive.google.com/drive/folders/1bQ1l9Q_Kz0JcUQsGVRxPkWQrj66yq8Qr?usp=sharing',
      telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
      telegramChatIdKemudahan: process.env.TELEGRAM_CHAT_ID_KEMUDAHAN || '-3546212661',
      telegramChatIdSistem: process.env.TELEGRAM_CHAT_ID_SISTEM || '-3763181014',
      telegramChatIdPerkhidmatan: process.env.TELEGRAM_CHAT_ID_PERKHIDMATAN || '-4423616468',
      telegramChatIdKebersihan: process.env.TELEGRAM_CHAT_ID_KEBERSIHAN || '-3921165191',
      emailSenderName: process.env.EMAIL_SENDER_NAME || 'SiAP – Sistem Aduan Pelanggan',
      smtpHost: process.env.SMTP_HOST || '',
      smtpPort: process.env.SMTP_PORT || '587',
      smtpUser: process.env.SMTP_USER || '',
      smtpPass: process.env.SMTP_PASS || '',
    };
  }

  private saveToFile() {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.store, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database to file:', e);
    }
  }

  // ─── Supabase Helpers ───

  /** Load all data from Supabase into in-memory store (called once at startup) */
  public async initFromSupabase(): Promise<void> {
    if (!supabaseClient) return;
    try {
      const [compRes, tindRes, logRes, emailRes, cfgRes] = await Promise.all([
        supabaseClient.from('complaints').select('*').order('"tarikhMasa"', { ascending: false }),
        supabaseClient.from('tindakan').select('*').order('"tarikhMasa"', { ascending: false }),
        supabaseClient.from('logs').select('*').order('"tarikhMasa"', { ascending: false }),
        supabaseClient.from('emails').select('*').order('"tarikhMasa"', { ascending: false }),
        supabaseClient.from('config').select('*').eq('id', 'system_config').maybeSingle(),
      ]);

      const isSupabaseEmpty = !compRes.data || compRes.data.length === 0;

      if (isSupabaseEmpty) {
        // Auto-migrate from local file to Supabase
        console.log('🚀 Supabase empty – migrating local data to Supabase...');
        await this.migrateLocalToSupabase();
      } else {
        // Load from Supabase
        this.store.complaints = (compRes.data || []) as Complaint[];
        this.store.tindakan = (tindRes.data || []) as TindakanItem[];
        this.store.logs = (logRes.data || []) as LogItem[];
        this.store.emails = (emailRes.data || []) as EmailLog[];

        if (cfgRes.data) {
          const { id: _id, lastSequenceNumber, ...configData } = cfgRes.data as any;
          this.store.config = { ...this.store.config, ...configData };
          this.store.lastSequenceNumber = lastSequenceNumber || this.store.lastSequenceNumber;
        }

        // Recalculate lastSequenceNumber
        let maxSeq = this.store.lastSequenceNumber;
        for (const c of this.store.complaints) {
          const parts = c.noRujukan.split('-');
          if (parts.length === 3) {
            const seq = parseInt(parts[2], 10);
            if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
          }
        }
        this.store.lastSequenceNumber = maxSeq;
        console.log(`✅ Loaded ${this.store.complaints.length} complaints from Supabase.`);
      }
    } catch (e: any) {
      console.error('❌ Error loading from Supabase:', e.message);
    }
  }

  /** Migrate all local data to Supabase (one-time on first deployment) */
  private async migrateLocalToSupabase(): Promise<void> {
    if (!supabaseClient) return;
    try {
      const tasks: Promise<any>[] = [];
      if (this.store.complaints.length > 0) {
        tasks.push(supabaseClient.from('complaints').upsert(this.store.complaints) as unknown as Promise<any>);
      }
      if (this.store.tindakan.length > 0) {
        tasks.push(supabaseClient.from('tindakan').upsert(this.store.tindakan) as unknown as Promise<any>);
      }
      if (this.store.logs.length > 0) {
        tasks.push(supabaseClient.from('logs').upsert(this.store.logs) as unknown as Promise<any>);
      }
      if (this.store.emails.length > 0) {
        tasks.push(supabaseClient.from('emails').upsert(this.store.emails) as unknown as Promise<any>);
      }
      // Migrate config
      tasks.push(supabaseClient.from('config').upsert({
        id: 'system_config',
        ...this.store.config,
        lastSequenceNumber: this.store.lastSequenceNumber,
      }) as unknown as Promise<any>);

      await Promise.allSettled(tasks);
      console.log('✅ Local data migration to Supabase complete.');
    } catch (e: any) {
      console.error('❌ Migration failed:', e.message);
    }
  }

  /** Background write a single record to Supabase (non-blocking) */
  private sbUpsert(table: string, record: Record<string, any>): void {
    if (!supabaseClient) return;
    supabaseClient.from(table).upsert(record).then(({ error }) => {
      if (error) console.error(`Supabase upsert error (${table}):`, error.message);
    });
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

  public createComplaint(data: {
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
  }): Complaint {
    this.store.lastSequenceNumber += 1;
    const year = new Date().getFullYear();
    const seqStr = String(this.store.lastSequenceNumber).padStart(5, '0');
    const noRujukan = `SIAP-${year}-${seqStr}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Save attachment locally if present to bypass Google Drive access restrictions
    let fileUrl = undefined;
    if (data.lampiran) {
      try {
        const uploadsDir = path.join(process.cwd(), 'uploads');
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
        
        const appUrl = process.env.APP_URL || 'http://localhost:3001';
        fileUrl = `${appUrl}/uploads/${fileName}`;
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
      lampiran: data.lampiran,
      lampiranNama: data.lampiranNama,
      lampiranDriveUrl: fileUrl || data.lampiranDriveUrl,
      status: 'MENUNGGU',
      telegramGroup: data.telegramGroup,
      telegramGroupId: data.telegramGroupId,
      tindakanTerkini: 'Aduan baharu diterima dan dihantar ke saluran Telegram petugas.',
    };

    this.store.complaints.unshift(newComplaint);

    // Add log
    this.addLog({
      jenisAktiviti: 'ADUAN_DITERIMA',
      noRujukan,
      keterangan: `Aduan baharu didaftarkan: "${data.tajukAduan}" oleh ${data.namaPengadu}.`,
      dilakukanOleh: 'Portal Web SiAP',
    });

    this.saveToFile();
    // Background write to Supabase
    this.sbUpsert('complaints', { ...newComplaint });
    return newComplaint;
  }

  public updateComplaint(
    noRujukan: string,
    updates: Partial<Complaint>,
    performedBy: string = 'Sistem'
  ): Complaint | null {
    const comp = this.getComplaintByRef(noRujukan);
    if (!comp) return null;

    const prevStatus = comp.status;
    Object.assign(comp, updates);

    if (updates.status && updates.status !== prevStatus) {
      this.addLog({
        jenisAktiviti: updates.status === 'SELESAI' ? 'ADUAN_SELESAI' : 'STATUS_DIKEMASKINI',
        noRujukan,
        keterangan: `Status aduan ditukar dari "${prevStatus}" kepada "${updates.status}".`,
        dilakukanOleh: performedBy,
      });
    }

    this.saveToFile();
    // Background write to Supabase
    this.sbUpsert('complaints', { ...comp });
    return comp;
  }

  public assignOfficer(
    noRujukan: string,
    officerInfo: {
      telegramUserId: string;
      namaPegawai: string;
    }
  ): { success: boolean; message: string; complaint?: Complaint } {
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
    this.addTindakan({
      noRujukan,
      telegramUserId: officerInfo.telegramUserId,
      namaPegawai: officerInfo.namaPegawai,
      status: 'DALAM_TINDAKAN',
      catatanTindakan: `Aduan diambil oleh ${officerInfo.namaPegawai} untuk siasatan dan tindakan lanjut.`,
    });

    this.addLog({
      jenisAktiviti: 'ADUAN_DIAMBIL',
      noRujukan,
      keterangan: `Aduan diambil oleh pegawai ${officerInfo.namaPegawai} (${officerInfo.telegramUserId}).`,
      dilakukanOleh: officerInfo.namaPegawai,
    });

    this.saveToFile();
    return { success: true, message: 'Tindakan berjaya diambil.', complaint: comp };
  }

  public addTindakan(item: Omit<TindakanItem, 'id' | 'tarikhMasa'>): TindakanItem {
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

    this.addLog({
      jenisAktiviti: 'TINDAKAN_DITAMBAH',
      noRujukan: item.noRujukan,
      keterangan: `Catatan tindakan ditambah oleh ${item.namaPegawai}: "${item.catatanTindakan.substring(0, 60)}..."`,
      dilakukanOleh: item.namaPegawai,
    });

    this.saveToFile();
    // Background write to Supabase
    this.sbUpsert('tindakan', { ...tindakan });
    if (comp) this.sbUpsert('complaints', { ...comp });
    return tindakan;
  }

  public getTindakanForComplaint(noRujukan: string): TindakanItem[] {
    const trimmed = noRujukan.trim().toUpperCase();
    return this.store.tindakan.filter((t) => t.noRujukan.toUpperCase() === trimmed);
  }

  public getAllTindakan(): TindakanItem[] {
    return [...this.store.tindakan];
  }

  public addRating(noRujukan: string, rating: number, ulasan?: string): { success: boolean; message: string; complaint?: Complaint } {
    const comp = this.getComplaintByRef(noRujukan);
    if (!comp) return { success: false, message: 'Aduan tidak dijumpai.' };

    if (comp.status !== 'SELESAI') {
      return { success: false, message: 'Penilaian hanya boleh diberikan untuk aduan yang telah Selesai.' };
    }

    if (comp.rating) {
      return { success: false, message: 'Penilaian telah pun dihantar sebelum ini untuk nombor rujukan ini.' };
    }

    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    comp.rating = Math.max(1, Math.min(5, Math.round(rating)));
    comp.ulasanPelanggan = ulasan || '';
    comp.ratingTarikh = now;

    this.addLog({
      jenisAktiviti: 'RATING_DITERIMA',
      noRujukan,
      keterangan: `Pelanggan memberikan rating ${comp.rating}/5. Ulasan: "${ulasan || 'Tiada ulasan'}".`,
      dilakukanOleh: comp.namaPengadu,
    });

    this.saveToFile();
    // Background write to Supabase
    this.sbUpsert('complaints', { ...comp });
    return { success: true, message: 'Penilaian kepuasan berjaya direkodkan. Terima kasih!', complaint: comp };
  }

  public addLog(item: Omit<LogItem, 'id' | 'tarikhMasa'>): LogItem {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const log: LogItem = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tarikhMasa: now,
      ...item,
    };
    this.store.logs.unshift(log);
    this.saveToFile();
    // Background write to Supabase
    this.sbUpsert('logs', { ...log });
    return log;
  }

  public getLogs(limit: number = 100): LogItem[] {
    return this.store.logs.slice(0, limit);
  }

  public addEmailLog(email: Omit<EmailLog, 'id' | 'tarikhMasa'>): EmailLog {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const item: EmailLog = {
      id: `em_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      tarikhMasa: now,
      ...email,
    };
    this.store.emails.unshift(item);
    this.saveToFile();
    // Background write to Supabase
    this.sbUpsert('emails', { ...item });
    return item;
  }

  public getEmails(limit: number = 50): EmailLog[] {
    return this.store.emails.slice(0, limit);
  }

  public getConfig() {
    return { ...this.store.config };
  }

  public updateConfig(newConfig: Partial<DBStore['config']>) {
    Object.assign(this.store.config, newConfig);
    this.saveToFile();
    // Background write to Supabase
    this.sbUpsert('config', { id: 'system_config', ...this.store.config, lastSequenceNumber: this.store.lastSequenceNumber });
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
