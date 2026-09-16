-- ==============================================================================
-- Skrip SQL Penukaran Nama Jadual SiAP kepada Awalan [siap_xxxx]
-- ==============================================================================
-- Jalankan skrip ini di Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ==============================================================================

-- 1. TUKAR NAMA JADUAL SEDIA ADA (JIKA ADA) KEPADA AWALAN siap_
ALTER TABLE IF EXISTS complaints RENAME TO siap_complaints;
ALTER TABLE IF EXISTS tindakan RENAME TO siap_tindakan;
ALTER TABLE IF EXISTS logs RENAME TO siap_logs;
ALTER TABLE IF EXISTS emails RENAME TO siap_emails;
ALTER TABLE IF EXISTS config RENAME TO siap_config;

-- 2. CIPTA JADUAL JIKA BELUM WUJUD (FALLBACK / SETUP BARU)

-- Jadual: siap_complaints
CREATE TABLE IF NOT EXISTS siap_complaints (
    id TEXT PRIMARY KEY,
    "noRujukan" TEXT UNIQUE NOT NULL,
    "tarikhMasa" TEXT NOT NULL,
    "namaPengadu" TEXT NOT NULL,
    telefon TEXT,
    emel TEXT,
    kategori TEXT NOT NULL,
    "kategoriNama" TEXT NOT NULL,
    "tajukAduan" TEXT NOT NULL,
    "butiranAduan" TEXT NOT NULL,
    lokasi TEXT NOT NULL,
    "tarikhKejadian" TEXT NOT NULL,
    lampiran TEXT,
    "lampiranNama" TEXT,
    "lampiranDriveUrl" TEXT,
    status TEXT NOT NULL DEFAULT 'MENUNGGU',
    "telegramGroup" TEXT,
    "telegramGroupId" TEXT,
    "telegramUserId" TEXT,
    "namaPegawai" TEXT,
    "tarikhDiambilTindakan" TEXT,
    "tarikhSelesai" TEXT,
    "tindakanTerkini" TEXT,
    rating INTEGER,
    "ulasanPelanggan" TEXT,
    "ratingTarikh" TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Jadual: siap_tindakan
CREATE TABLE IF NOT EXISTS siap_tindakan (
    id TEXT PRIMARY KEY,
    "noRujukan" TEXT NOT NULL,
    "tarikhMasa" TEXT NOT NULL,
    "telegramUserId" TEXT,
    "namaPegawai" TEXT NOT NULL,
    status TEXT NOT NULL,
    "catatanTindakan" TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Jadual: siap_logs
CREATE TABLE IF NOT EXISTS siap_logs (
    id TEXT PRIMARY KEY,
    "tarikhMasa" TEXT NOT NULL,
    "jenisAktiviti" TEXT NOT NULL,
    "noRujukan" TEXT NOT NULL,
    keterangan TEXT NOT NULL,
    "dilakukanOleh" TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Jadual: siap_emails
CREATE TABLE IF NOT EXISTS siap_emails (
    id TEXT PRIMARY KEY,
    "tarikhMasa" TEXT NOT NULL,
    penerima TEXT NOT NULL,
    subjek TEXT NOT NULL,
    kandungan TEXT NOT NULL,
    status TEXT NOT NULL,
    ralat TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Jadual: siap_config
CREATE TABLE IF NOT EXISTS siap_config (
    id TEXT PRIMARY KEY DEFAULT 'system_config',
    "googleSheetId" TEXT,
    "googleAppsScriptUrl" TEXT,
    "googleDriveFolderId" TEXT,
    "googleDriveFolderUrl" TEXT,
    "telegramBotToken" TEXT,
    "telegramChatIdKemudahan" TEXT,
    "telegramChatIdSistem" TEXT,
    "telegramChatIdPerkhidmatan" TEXT,
    "telegramChatIdKebersihan" TEXT,
    "emailSenderName" TEXT,
    "smtpHost" TEXT,
    "smtpPort" TEXT,
    "smtpUser" TEXT,
    "smtpPass" TEXT,
    "lastSequenceNumber" INTEGER DEFAULT 5,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. INDEKS UNTUK PRESTASI CARIAN
CREATE INDEX IF NOT EXISTS idx_siap_complaints_norujukan ON siap_complaints ("noRujukan");
CREATE INDEX IF NOT EXISTS idx_siap_complaints_status ON siap_complaints (status);
CREATE INDEX IF NOT EXISTS idx_siap_tindakan_norujukan ON siap_tindakan ("noRujukan");
CREATE INDEX IF NOT EXISTS idx_siap_logs_norujukan ON siap_logs ("noRujukan");

-- 4. KESELAMATAN & POLISI ROW LEVEL SECURITY (RLS)
ALTER TABLE siap_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE siap_tindakan ENABLE ROW LEVEL SECURITY;
ALTER TABLE siap_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE siap_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE siap_config ENABLE ROW LEVEL SECURITY;

-- Cipta Polisi Akses Penuh untuk Anon/Service Role bagi Aplikasi SiAP
DROP POLICY IF EXISTS "SiAP Akses Penuh siap_complaints" ON siap_complaints;
CREATE POLICY "SiAP Akses Penuh siap_complaints" ON siap_complaints FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "SiAP Akses Penuh siap_tindakan" ON siap_tindakan;
CREATE POLICY "SiAP Akses Penuh siap_tindakan" ON siap_tindakan FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "SiAP Akses Penuh siap_logs" ON siap_logs;
CREATE POLICY "SiAP Akses Penuh siap_logs" ON siap_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "SiAP Akses Penuh siap_emails" ON siap_emails;
CREATE POLICY "SiAP Akses Penuh siap_emails" ON siap_emails FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "SiAP Akses Penuh siap_config" ON siap_config;
CREATE POLICY "SiAP Akses Penuh siap_config" ON siap_config FOR ALL USING (true) WITH CHECK (true);

-- 5. PENGESAHAN: SEMAK SENARAI JADUAL SIAP_
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'siap_%';
