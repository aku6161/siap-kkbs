export type TabType = 'utama' | 'aduan' | 'semak' | 'statistik' | 'admin';

export type ComplaintCategory =
  | 'KEMUDAHAN'
  | 'SISTEM'
  | 'PERKHIDMATAN'
  | 'KEBERSIHAN'
  | 'LAIN_LAIN';

export type ComplaintStatus =
  | 'MENUNGGU'
  | 'DALAM_SEMAKAN'
  | 'DALAM_TINDAKAN'
  | 'SELESAI'
  | 'TIDAK_DAPAT_DISELESAIKAN';

export interface CategoryInfo {
  id: ComplaintCategory;
  name: string;
  icon: string;
  description: string;
  examples: string[];
  telegramGroup: string;
  telegramChatId: string;
  telegramLink: string;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export interface Complaint {
  id: string;
  noRujukan: string; // e.g. SIAP-2026-00001
  tarikhMasa: string;
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
  status: ComplaintStatus;
  telegramGroup: string;
  telegramGroupId: string;
  telegramMessageId?: string;
  telegramUserId?: string;
  namaPegawai?: string;
  tarikhDiambilTindakan?: string;
  tindakanTerkini?: string;
  tarikhSelesai?: string;
  rating?: number; // 1 to 5
  ulasanPelanggan?: string;
  ratingTarikh?: string;
}

export interface TindakanItem {
  id: string;
  noRujukan: string;
  tarikhMasa: string;
  telegramUserId?: string;
  namaPegawai: string;
  status: ComplaintStatus;
  catatanTindakan: string;
}

export interface TelegramGroupConfig {
  kategori: ComplaintCategory;
  groupName: string;
  telegramChatId: string;
  link: string;
  status: 'Aktif' | 'Tidak Aktif';
}

export interface LogItem {
  id: string;
  tarikhMasa: string;
  jenisAktiviti:
    | 'ADUAN_DITERIMA'
    | 'TELEGRAM_DIHANTAR'
    | 'ADUAN_DIAMBIL'
    | 'STATUS_DIKEMASKINI'
    | 'TINDAKAN_DITAMBAH'
    | 'ADUAN_SELESAI'
    | 'RATING_DITERIMA'
    | 'EMEL_DIHANTAR';
  noRujukan: string;
  keterangan: string;
  dilakukanOleh: string;
}

export interface EmailLog {
  id: string;
  noRujukan: string;
  penerima: string;
  subjek: string;
  kandungan: string;
  tarikhMasa: string;
  status: 'Dihantar' | 'Gagal';
}

export interface RatingSummary {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  emojiLabel: string;
  ratingEmoji: string;
}

export interface SystemStats {
  totalAduan: number;
  menunggu: number;
  dalamSemakan: number;
  dalamTindakan: number;
  selesai: number;
  tidakDapatDiselesaikan: number;
  purataMasaPenyelesaianJam: number;
  purataKepuasan: number;
  totalRating: number;
  unassignedCount: number;
}
