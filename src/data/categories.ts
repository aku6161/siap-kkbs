import { CategoryInfo, ComplaintCategory, ComplaintStatus } from '../types';

export const CATEGORIES: Record<ComplaintCategory, CategoryInfo> = {
  KEMUDAHAN: {
    id: 'KEMUDAHAN',
    name: 'Kemudahan & Infrastruktur',
    icon: 'Building2',
    description: 'Aduan berkaitan bangunan, bilik, elektrik, perabot dan kerosakan fizikal.',
    examples: ['Bangunan', 'Bilik', 'Tandas', 'Elektrik', 'Penghawa dingin', 'Perabot', 'Kemudahan fizikal'],
    telegramGroup: 'SiAP – Kemudahan',
    telegramChatId: '-3546212661',
    telegramLink: 'https://web.telegram.org/k/#-3546212661',
    color: 'emerald',
    badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    badgeText: 'text-emerald-700',
  },
  SISTEM: {
    id: 'SISTEM',
    name: 'Sistem & Teknologi',
    icon: 'Laptop',
    description: 'Aduan berkaitan sistem digital, rangkaian internet, komputer dan aplikasi.',
    examples: ['Sistem digital', 'Komputer', 'Internet / Wi-Fi', 'Aplikasi', 'Teknologi'],
    telegramGroup: 'SiAP - Sistem & Teknologi',
    telegramChatId: '-3763181014',
    telegramLink: 'https://web.telegram.org/k/#-3763181014',
    color: 'blue',
    badgeBg: 'bg-blue-50 border-blue-200 text-blue-800',
    badgeText: 'text-blue-700',
  },
  PERKHIDMATAN: {
    id: 'PERKHIDMATAN',
    name: 'Perkhidmatan',
    icon: 'UserCheck',
    description: 'Aduan berkaitan kualiti layanan kaunter, staf, dan penyampaian perkhidmatan.',
    examples: ['Perkhidmatan', 'Urusan kaunter', 'Staf', 'Penyampaian perkhidmatan'],
    telegramGroup: 'SiAP - Perkhidmatan & Lain-lain',
    telegramChatId: '-4423616468',
    telegramLink: 'https://web.telegram.org/k/#-4423616468',
    color: 'violet',
    badgeBg: 'bg-violet-50 border-violet-200 text-violet-800',
    badgeText: 'text-violet-700',
  },
  KEBERSIHAN: {
    id: 'KEBERSIHAN',
    name: 'Kebersihan',
    icon: 'Sparkles',
    description: 'Aduan berkaitan kebersihan kawasan persekitaran, tandas dan pengurusan sisa.',
    examples: ['Kebersihan kawasan', 'Tandas', 'Bilik', 'Persekitaran', 'Pengurusan sisa'],
    telegramGroup: 'SiAP – Kebersihan',
    telegramChatId: '-3921165191',
    telegramLink: 'https://web.telegram.org/k/#-3921165191',
    color: 'amber',
    badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
    badgeText: 'text-amber-700',
  },
  LAIN_LAIN: {
    id: 'LAIN_LAIN',
    name: 'Lain-lain',
    icon: 'Pin',
    description: 'Aduan umum yang tidak termasuk dalam mana-mana kategori di atas.',
    examples: ['Aduan umum', 'Cadangan penambahbaikan', 'Isu lain'],
    telegramGroup: 'SiAP - Perkhidmatan & Lain-lain',
    telegramChatId: '-4423616468',
    telegramLink: 'https://web.telegram.org/k/#-4423616468',
    color: 'slate',
    badgeBg: 'bg-slate-100 border-slate-200 text-slate-800',
    badgeText: 'text-slate-700',
  },
};

export const STATUS_CONFIG: Record<
  ComplaintStatus,
  {
    label: string;
    emoji: string;
    badgeBg: string;
    textColor: string;
    borderColor: string;
    dotColor: string;
    stepIndex: number;
    description: string;
  }
> = {
  MENUNGGU: {
    label: 'Menunggu Tindakan',
    emoji: '🟡',
    badgeBg: 'bg-yellow-50 text-yellow-800 border-yellow-300',
    textColor: 'text-yellow-700',
    borderColor: 'border-yellow-400',
    dotColor: 'bg-yellow-400',
    stepIndex: 0,
    description: 'Aduan telah diterima oleh sistem dan sedang menunggu tindakan pegawai bertugas.',
  },
  DALAM_SEMAKAN: {
    label: 'Dalam Semakan',
    emoji: '🔵',
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-300',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-400',
    dotColor: 'bg-blue-500',
    stepIndex: 1,
    description: 'Aduan sedang disemak dan diteliti oleh pegawai untuk siasatan awal.',
  },
  DALAM_TINDAKAN: {
    label: 'Dalam Tindakan',
    emoji: '🟠',
    badgeBg: 'bg-orange-50 text-orange-800 border-orange-300',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-400',
    dotColor: 'bg-orange-500',
    stepIndex: 2,
    description: 'Tindakan pembetulan/pembaikan fizikal atau teknikal sedang giat dijalankan.',
  },
  SELESAI: {
    label: 'Selesai',
    emoji: '🟢',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-400',
    dotColor: 'bg-emerald-500',
    stepIndex: 3,
    description: 'Aduan telah berjaya diselesaikan sepenuhnya. Pelanggan boleh memberikan penilaian.',
  },
  TIDAK_DAPAT_DISELESAIKAN: {
    label: 'Tidak Dapat Diselesaikan',
    emoji: '🔴',
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-300',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-400',
    dotColor: 'bg-rose-500',
    stepIndex: 3,
    description: 'Aduan tidak dapat diselesaikan atas kekangan di luar kawalan atau maklumat tidak sah.',
  },
};

export const RATING_SCALE = [
  { value: 1, emoji: '😡', label: 'Sangat Tidak Memuaskan', color: 'text-red-500', bg: 'bg-red-50 hover:bg-red-100' },
  { value: 2, emoji: '🙁', label: 'Tidak Memuaskan', color: 'text-orange-500', bg: 'bg-orange-50 hover:bg-orange-100' },
  { value: 3, emoji: '🙂', label: 'Baik', color: 'text-yellow-500', bg: 'bg-yellow-50 hover:bg-yellow-100' },
  { value: 4, emoji: '😊', label: 'Memuaskan', color: 'text-blue-500', bg: 'bg-blue-50 hover:bg-blue-100' },
  { value: 5, emoji: '🤩', label: 'Sangat Memuaskan', color: 'text-emerald-500', bg: 'bg-emerald-50 hover:bg-emerald-100' },
];

export function getRatingLabel(score: number): { emoji: string; label: string } {
  const rounded = Math.round(score);
  const found = RATING_SCALE.find((r) => r.value === rounded);
  if (found) return { emoji: found.emoji, label: found.label };
  if (score >= 4.5) return { emoji: '🤩', label: 'Sangat Memuaskan' };
  if (score >= 3.5) return { emoji: '😊', label: 'Memuaskan' };
  if (score >= 2.5) return { emoji: '🙂', label: 'Baik' };
  if (score >= 1.5) return { emoji: '🙁', label: 'Tidak Memuaskan' };
  return { emoji: '😡', label: 'Sangat Tidak Memuaskan' };
}
