export interface TelegramGroup {
  id: string;
  name: string;
  chatId: string;
  unit: string;
  pic: string;
  officers: string[];
  status: 'Aktif' | 'Tidak Aktif';
}

export const TELEGRAM_GROUPS: Record<string, TelegramGroup> = {
  KEMUDAHAN: {
    id: 'KEMUDAHAN',
    name: 'SiAP – Kemudahan',
    chatId: '-1003546212661',
    unit: 'Kemudahan & Infrastruktur',
    pic: 'Pegawai Pembangunan',
    officers: ['Pegawai Pembangunan'],
    status: 'Aktif',
  },
  SISTEM: {
    id: 'SISTEM',
    name: 'SiAP - Sistem & Teknologi',
    chatId: '-1003763181014',
    unit: 'Sistem & Teknologi',
    pic: 'Pegawai ICT',
    officers: ['Pegawai ICT'],
    status: 'Aktif',
  },
  PERKHIDMATAN: {
    id: 'PERKHIDMATAN',
    name: 'SiAP - Perkhidmatan & Lain-lain',
    chatId: '-1004423616468',
    unit: 'Perkhidmatan & Pentadbiran',
    pic: 'Pegawai Perhubungan Pelanggan',
    officers: ['Pegawai Perhubungan Pelanggan'],
    status: 'Aktif',
  },
  KEBERSIHAN: {
    id: 'KEBERSIHAN',
    name: 'SiAP – Kebersihan',
    chatId: '-1003921165191',
    unit: 'Kebersihan & Kesihatan',
    pic: 'Pegawai Kebersihan',
    officers: ['Pegawai Kebersihan'],
    status: 'Aktif',
  },
  LAIN_LAIN: {
    id: 'LAIN_LAIN',
    name: 'SiAP - Perkhidmatan & Lain-lain',
    chatId: '-1004423616468',
    unit: 'Lain-lain',
    pic: 'Pegawai Perhubungan Pelanggan',
    officers: ['Pegawai Perhubungan Pelanggan'],
    status: 'Aktif',
  },
};

