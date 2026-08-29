export interface TelegramGroup {
  id: string;
  name: string;
  chatId: string;
  unit: string;
  officers: string[];
  status: 'Aktif' | 'Tidak Aktif';
}

export const TELEGRAM_GROUPS: Record<string, TelegramGroup> = {
  KEMUDAHAN: {
    id: 'KEMUDAHAN',
    name: 'SiAP – Kemudahan',
    chatId: '-3546212661',
    unit: 'Kemudahan & Infrastruktur',
    officers: ['Mohd Razak (Juruteknik Fasiliti)', 'Ahmad Sukri (Penyelia Fasiliti)'],
    status: 'Aktif',
  },
  SISTEM: {
    id: 'SISTEM',
    name: 'SiAP - Sistem & Teknologi',
    chatId: '-3763181014',
    unit: 'Sistem & Teknologi',
    officers: ['Kamal Azizi (Pegawai IT)', 'Nurul Diana (Juruteknik Rangkaian)'],
    status: 'Aktif',
  },
  PERKHIDMATAN: {
    id: 'PERKHIDMATAN',
    name: 'SiAP - Perkhidmatan & Lain-lain',
    chatId: '-4423616468',
    unit: 'Perkhidmatan & Pentadbiran',
    officers: ['Hafizah (Pegawai Khidmat Pelanggan)', 'Siti Aminah (Unit Latihan)'],
    status: 'Aktif',
  },
  KEBERSIHAN: {
    id: 'KEBERSIHAN',
    name: 'SiAP – Kebersihan',
    chatId: '-3921165191',
    unit: 'Kebersihan & Kesihatan',
    officers: ['Zainal Abidin (Penyelia Kebersihan)', 'Abu Bakar (Pegawai Kesihatan)'],
    status: 'Aktif',
  },
};
