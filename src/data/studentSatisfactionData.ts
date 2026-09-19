export interface SurveyQuestionDef {
  id: number;
  sectionId: string;
  sectionTitle: string;
  text: string;
}

export const SURVEY_QUESTIONS_LIST: SurveyQuestionDef[] = [
  // Bilik Kuliah 1 (0-5)
  { id: 0, sectionId: 'bilikKuliah1', sectionTitle: 'Bilik Kuliah 1', text: 'Peralatan kerusi dalam keadaan yang baik dan mencukupi untuk keperluan pembelajaran' },
  { id: 1, sectionId: 'bilikKuliah1', sectionTitle: 'Bilik Kuliah 1', text: 'Peralatan meja dalam keadaan yang baik dan mencukupi untuk keperluan pembelajaran' },
  { id: 2, sectionId: 'bilikKuliah1', sectionTitle: 'Bilik Kuliah 1', text: 'Alat bantu mengajar mencukupi serta berfungsi dengan baik' },
  { id: 3, sectionId: 'bilikKuliah1', sectionTitle: 'Bilik Kuliah 1', text: 'Persekitaran bilik kuliah adalah bersih dan selesa' },
  { id: 4, sectionId: 'bilikKuliah1', sectionTitle: 'Bilik Kuliah 1', text: 'Persekitaran bilik kuliah adalah selamat' },
  { id: 5, sectionId: 'bilikKuliah1', sectionTitle: 'Bilik Kuliah 1', text: 'Mempunyai capaian WiFi yang baik di bilik kuliah' },

  // Bilik Kuliah 2 (6-11)
  { id: 6, sectionId: 'bilikKuliah2', sectionTitle: 'Bilik Kuliah 2', text: 'Peralatan kerusi dalam keadaan yang baik dan mencukupi untuk keperluan pembelajaran' },
  { id: 7, sectionId: 'bilikKuliah2', sectionTitle: 'Bilik Kuliah 2', text: 'Peralatan meja dalam keadaan yang baik dan mencukupi untuk keperluan pembelajaran' },
  { id: 8, sectionId: 'bilikKuliah2', sectionTitle: 'Bilik Kuliah 2', text: 'Alat bantu mengajar mencukupi serta berfungsi dengan baik' },
  { id: 9, sectionId: 'bilikKuliah2', sectionTitle: 'Bilik Kuliah 2', text: 'Persekitaran bilik kuliah adalah bersih dan selesa' },
  { id: 10, sectionId: 'bilikKuliah2', sectionTitle: 'Bilik Kuliah 2', text: 'Persekitaran bilik kuliah adalah selamat' },
  { id: 11, sectionId: 'bilikKuliah2', sectionTitle: 'Bilik Kuliah 2', text: 'Mempunyai capaian WiFi yang baik' },

  // Immersive Centre (12-17)
  { id: 12, sectionId: 'immersive', sectionTitle: 'Immersive Centre', text: 'Peralatan kerusi dalam keadaan yang baik dan mencukupi untuk keperluan pembelajaran' },
  { id: 13, sectionId: 'immersive', sectionTitle: 'Immersive Centre', text: 'Peralatan meja dalam keadaan yang baik dan mencukupi untuk keperluan pembelajaran' },
  { id: 14, sectionId: 'immersive', sectionTitle: 'Immersive Centre', text: 'Alat bantu mengajar mencukupi serta berfungsi dengan baik' },
  { id: 15, sectionId: 'immersive', sectionTitle: 'Immersive Centre', text: 'Persekitaran Immersive Centre adalah bersih dan selesa' },
  { id: 16, sectionId: 'immersive', sectionTitle: 'Immersive Centre', text: 'Persekitaran Immersive Centre adalah selamat' },
  { id: 17, sectionId: 'immersive', sectionTitle: 'Immersive Centre', text: 'Mempunyai capaian WiFi yang baik di Immersive Centre' },

  // Dewan Kuliah (18-23)
  { id: 18, sectionId: 'dewanKuliah', sectionTitle: 'Dewan Kuliah', text: 'Peralatan kerusi dalam keadaan yang baik dan mencukupi untuk keperluan pembelajaran' },
  { id: 19, sectionId: 'dewanKuliah', sectionTitle: 'Dewan Kuliah', text: 'Peralatan meja dalam keadaan yang baik dan mencukupi untuk keperluan pembelajaran' },
  { id: 20, sectionId: 'dewanKuliah', sectionTitle: 'Dewan Kuliah', text: 'Alat bantu mengajar mencukupi serta berfungsi dengan baik' },
  { id: 21, sectionId: 'dewanKuliah', sectionTitle: 'Dewan Kuliah', text: 'Persekitaran dewan kuliah adalah bersih dan selesa' },
  { id: 22, sectionId: 'dewanKuliah', sectionTitle: 'Dewan Kuliah', text: 'Persekitaran dewan kuliah adalah selamat' },
  { id: 23, sectionId: 'dewanKuliah', sectionTitle: 'Dewan Kuliah', text: 'Mempunyai capaian WiFi yang baik di dewan kuliah' },

  // Makmal Komputer (24-29)
  { id: 24, sectionId: 'makmalKomputer', sectionTitle: 'Makmal Bahasa & Makmal Komputer', text: 'Komputer yang disediakan berfungsi dengan baik' },
  { id: 25, sectionId: 'makmalKomputer', sectionTitle: 'Makmal Bahasa & Makmal Komputer', text: 'Komputer yang disediakan mencukupi untuk keperluan pembelajaran' },
  { id: 26, sectionId: 'makmalKomputer', sectionTitle: 'Makmal Bahasa & Makmal Komputer', text: 'Peralatan kerusi dalam keadaan yang baik dan mencukupi untuk keperluan pembelajaran' },
  { id: 27, sectionId: 'makmalKomputer', sectionTitle: 'Makmal Bahasa & Makmal Komputer', text: 'Persekitaran makmal bahasa dan makmal komputer adalah bersih dan selesa' },
  { id: 28, sectionId: 'makmalKomputer', sectionTitle: 'Makmal Bahasa & Makmal Komputer', text: 'Persekitaran makmal bahasa dan makmal komputer adalah selamat' },
  { id: 29, sectionId: 'makmalKomputer', sectionTitle: 'Makmal Bahasa & Makmal Komputer', text: 'Mempunyai capaian WiFi yang baik di makmal komputer' },

  // Perpustakaan (30-36)
  { id: 30, sectionId: 'perpustakaan', sectionTitle: 'Perpustakaan', text: 'Proses capaian maklumat dan bahan rujukan di perpustakaan adalah tersusun dan mudah diperolehi' },
  { id: 31, sectionId: 'perpustakaan', sectionTitle: 'Perpustakaan', text: 'Koleksi bahan bacaan mencukupi' },
  { id: 32, sectionId: 'perpustakaan', sectionTitle: 'Perpustakaan', text: 'Waktu operasi perpustakaan adalah bersesuaian' },
  { id: 33, sectionId: 'perpustakaan', sectionTitle: 'Perpustakaan', text: 'Proses peminjaman dan pemulangan mudah dan cepat' },
  { id: 34, sectionId: 'perpustakaan', sectionTitle: 'Perpustakaan', text: 'Persekitaran perpustakaan adalah bersih dan selesa' },
  { id: 35, sectionId: 'perpustakaan', sectionTitle: 'Perpustakaan', text: 'Persekitaran perpustakaan adalah selamat' },
  { id: 36, sectionId: 'perpustakaan', sectionTitle: 'Perpustakaan', text: 'Mempunyai capaian WiFi yang baik di perpustakaan' },

  // E-Tech Centre (37-42)
  { id: 37, sectionId: 'kafe', sectionTitle: 'E-Tech Centre', text: 'Layanan perkhidmatan di kaunter adalah mesra dan baik' },
  { id: 38, sectionId: 'kafe', sectionTitle: 'E-Tech Centre', text: 'Makanan dijual dengan harga yang berpatutan' },
  { id: 39, sectionId: 'kafe', sectionTitle: 'E-Tech Centre', text: 'Mempunyai menu makanan yang pelbagai' },
  { id: 40, sectionId: 'kafe', sectionTitle: 'E-Tech Centre', text: 'Mempunyai meja dan kerusi yang mencukupi' },
  { id: 41, sectionId: 'kafe', sectionTitle: 'E-Tech Centre', text: 'Mempunyai persekitaran yang bersih dan selesa' },
  { id: 42, sectionId: 'kafe', sectionTitle: 'E-Tech Centre', text: 'Makanan dan minuman yang dijual sedap dan bersih' },

  // Kemudahan Sokongan (43-50)
  { id: 43, sectionId: 'kemudahanSokongan', sectionTitle: 'Kemudahan Sokongan', text: 'Kemudahan tempat rehat adalah mencukupi' },
  { id: 44, sectionId: 'kemudahanSokongan', sectionTitle: 'Kemudahan Sokongan', text: 'Tempat rehat pelajar adalah selesa dan bersih' },
  { id: 45, sectionId: 'kemudahanSokongan', sectionTitle: 'Kemudahan Sokongan', text: 'Kemudahan tandas adalah mencukupi' },
  { id: 46, sectionId: 'kemudahanSokongan', sectionTitle: 'Kemudahan Sokongan', text: 'Tahap kebersihan tandas adalah baik' },
  { id: 47, sectionId: 'kemudahanSokongan', sectionTitle: 'Kemudahan Sokongan', text: 'Kemudahan surau adalah mencukupi' },
  { id: 48, sectionId: 'kemudahanSokongan', sectionTitle: 'Kemudahan Sokongan', text: 'Kemudahan surau adalah selesa dan bersih' },
  { id: 49, sectionId: 'kemudahanSokongan', sectionTitle: 'Kemudahan Sokongan', text: 'Kemudahan asas di surau adalah mencukupi' },
  { id: 50, sectionId: 'kemudahanSokongan', sectionTitle: 'Kemudahan Sokongan', text: 'Kemudahan tempat letak kenderaan adalah mencukupi' },

  // Bengkel Amali (51-55)
  { id: 51, sectionId: 'bengkelDapur', sectionTitle: 'Bengkel Amali', text: 'Peralatan pembelajaran yang disediakan adalah mencukupi' },
  { id: 52, sectionId: 'bengkelDapur', sectionTitle: 'Bengkel Amali', text: 'Peralatan pembelajaran untuk amali adalah berfungsi dengan baik' },
  { id: 53, sectionId: 'bengkelDapur', sectionTitle: 'Bengkel Amali', text: 'Persekitaran di dalam bengkel amali adalah bersih dan selesa' },
  { id: 54, sectionId: 'bengkelDapur', sectionTitle: 'Bengkel Amali', text: 'Persekitaran di dalam bengkel amali adalah selamat' },
  { id: 55, sectionId: 'bengkelDapur', sectionTitle: 'Bengkel Amali', text: 'Peraturan keselamatan penggunaan peralatan dalam bengkel amali dipamerkan' },
];

export interface StudentSurveyItem {
  id: string;
  timestamp: string;
  year: number;
  jantina: 'LELAKI' | 'PEREMPUAN';
  programPengajian: string;
  semester: string;
  scores: {
    bilikKuliah: number;
    immersiveCentre: number;
    dewanKuliah: number;
    makmalKomputer: number;
    perpustakaan: number;
    eTechCentre?: number;
    kafe?: number;
    kemudahanSokongan: number;
    bengkelAmali?: number;
    bengkelDapur?: number;
    wifi: number;
    purataKeseluruhan: number;
  };
  rawScores?: number[];
  kemudahanPenambahbaikan: string;
  cadangan: string;
}

export const STUDENT_SURVEY_RAW_DATA = [
  {
    "Timestamp": "2025/12/11 4:45:58 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "3",
    "SCORES": [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,3,3,3,3,4,5,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "Pelbagaikan menu dan buat harga khas untuk pelajar."
  },
  {
    "Timestamp": "2025/12/11 5:32:24 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "1",
    "SCORES": [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,3,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "Membaik pulih rangkaian WiFi yang ada di Kolej😀"
  },
  {
    "Timestamp": "2025/12/11 5:34:02 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "3",
    "SCORES": [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,3,5,5,4,4,3,5,5,5,5,4,5,3,5,5,5],
    "KEMUDAHAN": "PERALATAN PDP SKE",
    "CADANGAN": "pintu tandas lelaki di bawah perbaikki"
  },
  {
    "Timestamp": "2025/12/11 5:38:03 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "1",
    "SCORES": [4,3,4,4,4,3,4,4,4,4,4,3,4,4,4,4,4,3,4,4,4,4,4,3,4,4,4,4,4,4,3,4,4,4,4,4,3,4,4,3,4,4,4,3,3,4,3,3,3,3,4,3,4,3,3,3],
    "KEMUDAHAN": "KOMPUTER",
    "CADANGAN": "Perlu membaiki computer makmal"
  },
  {
    "Timestamp": "2025/12/11 5:40:15 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "4 (LATIHAN INDUSTRI)",
    "SCORES": [4,4,5,5,4,5,5,5,5,5,5,4,4,4,5,5,5,5,5,5,4,5,5,5,5,5,4,4,4,4,5,4,5,5,5,5,5,5,3,3,3,3,4,4,4,4,4,5,5,5,4,4,5,5,5,5],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "membuat jadual makanan yang tidak sama dalam 1 minggu"
  },
  {
    "Timestamp": "2025/12/11 5:41:23 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "1",
    "SCORES": [2,3,3,4,4,3,4,4,3,4,4,3,4,4,3,3,4,3,4,4,3,4,4,4,4,4,4,4,4,4,4,3,4,3,4,3,4,4,4,2,2,4,3,3,4,4,4,3,4,3,4,3,4,3,4,3],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "meja dan kerusi perlu d tambah.selain itu. makanan perlu sedia ada sama ada waktu pagi.petang. supaya pelajar tidak perlu lagi makan d luar kolej"
  },
  {
    "Timestamp": "2025/12/11 5:41:45 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "3",
    "SCORES": [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4,4,4,4,5,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    "KEMUDAHAN": "SURAU",
    "CADANGAN": "Aircond di surau kasi bagus"
  },
  {
    "Timestamp": "2025/12/11 5:43:21 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "2",
    "SCORES": [4,4,4,3,4,4,4,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,3,4,4,4,4,4,4,4,4,3,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "-"
  },
  {
    "Timestamp": "2025/12/11 5:57:31 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "1",
    "SCORES": [4,4,4,4,5,5,4,4,4,5,5,5,4,4,4,4,5,5,4,4,4,3,4,5,5,4,4,5,5,5,4,4,4,4,5,4,5,5,4,4,3,4,5,4,4,4,4,5,5,5,4,4,4,5,4,4],
    "KEMUDAHAN": "KERUSI",
    "CADANGAN": "Ada berkarat sikit ja"
  },
  {
    "Timestamp": "2025/12/11 5:57:33 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "1",
    "SCORES": [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,4,5,5,4,4,4,4,4,4,4,4,4,4,5,5,5],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "Tiada"
  },
  {
    "Timestamp": "2025/12/11 5:57:59 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [4,4,4,5,5,5,4,4,4,5,5,5,4,4,4,5,5,5,4,4,4,5,5,5,4,4,4,4,4,4,5,5,5,5,5,5,4,5,3,4,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    "KEMUDAHAN": "KERUSI",
    "CADANGAN": ". "
  },
  {
    "Timestamp": "2025/12/11 6:03:37 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "."
  },
  {
    "Timestamp": "2025/12/11 6:04:21 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "1",
    "SCORES": [4,3,3,4,5,5,5,5,4,4,4,5,4,4,3,4,4,5,3,4,3,5,5,5,4,4,4,5,4,5,5,5,5,5,5,5,5,5,4,4,3,5,5,3,4,4,4,4,5,4,4,4,5,5,5,5],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "kalau boleh la Kan letak lampu dekat dobi tempat menunggu depan psh. Sangat gelap bagi pelajar yang lambat balik😁."
  },
  {
    "Timestamp": "2025/12/11 6:09:04 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "3",
    "SCORES": [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,4,5,4,5,5,4,5,5,4,5,4,4,4,5,5,5,5,4,5,4,4,4,5,5,4,5,4,5,5,5,5,4,4,5,5,5,5],
    "KEMUDAHAN": "TANDAS",
    "CADANGAN": "Pendapat saya tandas perempuan kadang tersumbat"
  },
  {
    "Timestamp": "2025/12/11 6:10:47 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "1",
    "SCORES": [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4,4,4,4,4,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "tiada"
  },
  {
    "Timestamp": "2025/12/11 6:13:09 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "1",
    "SCORES": [3,3,2,5,4,4,3,3,2,5,4,3,3,3,3,3,3,1,3,3,3,3,3,5,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,3,3,1,3,3,3,3,3,3,3,3,3,3,3,3],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "Kerusi cafe tidak cukup"
  },
  {
    "Timestamp": "2025/12/11 6:25:23 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "3",
    "SCORES": [4,5,3,5,4,4,5,4,5,5,5,5,4,4,3,4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "TANDAS",
    "CADANGAN": "Pintu tandas lelaki dibawah tiada kunci kerana rosak"
  },
  {
    "Timestamp": "2025/12/11 6:39:51 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "1",
    "SCORES": [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,4,4,5,4,5,5,5,4,4,3,4,3,5,4,5,5,5,5,5,4,5,5,4,4,4],
    "KEMUDAHAN": "KERUSI",
    "CADANGAN": "Tidak ada."
  },
  {
    "Timestamp": "2025/12/11 6:40:59 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "1",
    "SCORES": [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4],
    "KEMUDAHAN": "PERALATAN PDP SKE",
    "CADANGAN": "Mempunyai peralatan yg rusak"
  },
  {
    "Timestamp": "2025/12/11 6:42:54 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "2",
    "SCORES": [5,5,5,5,5,4,5,5,5,5,5,4,5,5,5,5,5,4,5,5,5,5,5,4,5,5,5,5,5,4,5,4,5,5,5,5,4,5,1,1,1,5,3,4,5,5,4,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "PADA PENDAPAT SAYA, PENAMBAHBAIKAN YANG PIHAK SEKOLAH BOLEH LAKUKAN ADALAH DARI SEGI WIFI, PERALATAN PDP SKU DAN JUGA CAFE, ANTARA KETIGA TIGA INI YANG TIDAK DPT DITOLERANSI ADALAH CAFE KERANA MEMBERI HRGA YANG YANG BERLAINAN MENGIKUT PELAJAR..."
  },
  {
    "Timestamp": "2025/12/11 6:51:39 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "1",
    "SCORES": [4,4,5,5,5,5,5,4,4,5,5,5,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,5,5,5,5,5,5,3,4,1,3,4,4,4,5,4,4,5,5,5,3,4,5,5,5],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "Cafe"
  },
  {
    "Timestamp": "2025/12/11 7:01:55 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "1",
    "SCORES": [5,5,3,4,4,3,5,5,3,4,4,3,5,5,3,4,4,3,3,3,4,4,4,3,3,2,4,4,4,3,3,3,3,3,4,4,3,4,4,4,2,3,3,2,3,3,3,4,5,4,3,3,3,3,3,3],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "Line d kkbs tidak mencapai 5G"
  },
  {
    "Timestamp": "2025/12/11 7:12:02 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "2",
    "SCORES": [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "SURAU",
    "CADANGAN": "Saya cadangkan untuk menambah baik aircond di surau seperti tidak rosak dan sejuk yang tinggi."
  },
  {
    "Timestamp": "2025/12/11 7:18:38 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "2",
    "SCORES": [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,2,5,5,5,5,5,5,5,3,2,2,3,3,5,5,5,5,4,2,2,3,2,1,3,4,4],
    "KEMUDAHAN": "PERALATAN PDP SKU",
    "CADANGAN": "tiada"
  },
  {
    "Timestamp": "2025/12/11 7:23:19 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "2",
    "SCORES": [4,4,4,4,4,3,4,4,4,4,3,3,4,4,4,4,4,3,4,3,3,4,3,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,3,4,3,3,4,5,4,4,4,4,4,4,3,4,4,4,4,4],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "-"
  },
  {
    "Timestamp": "2025/12/11 7:24:25 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "1",
    "SCORES": [5,5,3,3,3,2,5,5,3,3,3,2,5,5,3,3,3,2,5,5,3,3,3,2,2,2,5,5,5,2,3,3,3,3,3,3,3,3,3,3,1,3,5,2,3,3,3,3,3,3,5,3,3,3,3,3],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "."
  },
  {
    "Timestamp": "2025/12/11 7:51:10 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "3",
    "SCORES": [5,5,5,5,5,4,5,5,5,5,5,4,5,5,5,5,5,4,5,5,5,5,5,4,5,5,5,5,5,4,5,5,5,5,5,5,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "-"
  },
  {
    "Timestamp": "2025/12/11 7:56:25 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "1",
    "SCORES": [4,4,3,4,5,3,4,4,4,3,4,3,4,5,5,5,5,1,5,5,5,5,5,5,3,2,4,4,5,5,5,5,5,5,5,5,5,5,3,2,2,4,4,3,3,3,3,4,5,5,5,2,3,4,4,4],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "letak menu yang best d cafe yg ckup utk semua murid n hrga berpatuttan"
  },
  {
    "Timestamp": "2025/12/11 8:19:26 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "1",
    "SCORES": [5,5,3,5,5,3,5,5,3,4,4,2,5,5,3,3,3,3,5,5,3,5,5,3,4,4,5,5,5,3,3,3,3,3,5,5,3,5,3,4,1,3,4,2,3,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "-"
  },
  {
    "Timestamp": "2025/12/11 8:19:39 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "1",
    "SCORES": [4,4,4,4,4,3,4,4,4,4,4,3,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,4,3,4,4,3,4,4,4,4,4,4,4,4,4,4,4,4],
    "KEMUDAHAN": "TANDAS",
    "CADANGAN": "Tiada"
  },
  {
    "Timestamp": "2025/12/11 9:28:54 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "2",
    "SCORES": [4,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "Buka 2 kafe"
  },
  {
    "Timestamp": "2025/12/11 9:30:11 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "1",
    "SCORES": [4,4,4,4,4,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "Wifi tak berapa kuat kalau berada di cafe"
  },
  {
    "Timestamp": "2025/12/11 9:35:46 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "3",
    "SCORES": [5,5,5,5,5,2,5,5,5,5,5,3,5,5,5,5,5,2,5,5,5,5,5,4,5,5,5,5,5,5,5,5,5,5,5,5,5,3,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "Wifi perlu kuat, guna wifi extender atau mesh"
  },
  {
    "Timestamp": "2025/12/11 9:36:25 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "2",
    "SCORES": [4,4,4,4,4,3,4,4,4,4,4,3,4,3,4,4,4,3,4,4,4,4,4,3,4,4,4,4,4,3,3,3,3,3,3,3,3,4,3,3,3,3,3,3,3,4,3,4,4,4,3,3,4,4,4,3],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "Pelbagaikan menu jualan"
  },
  {
    "Timestamp": "2025/12/11 9:48:46 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "2",
    "SCORES": [5,5,5,5,5,4,5,5,5,5,5,4,5,5,5,5,5,4,5,5,5,5,5,4,5,5,5,5,5,4,5,5,5,5,5,5,5,4,5,5,4,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "."
  },
  {
    "Timestamp": "2025/12/11 10:07:01 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [5,5,5,5,5,3,5,3,5,5,5,3,4,5,4,4,4,4,5,5,5,5,5,3,5,5,4,5,5,4,5,5,5,5,5,5,5,5,3,4,2,5,4,2,3,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "Cadangan saya adalah, Ruang kafe perlu menambah lebih banyak meja dan tempat duduk supaya dapat menampung lebih ramai pelajar dengan senang."
  },
  {
    "Timestamp": "2025/12/11 10:15:54 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,2,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,3,4,4,5,5,2,4,5,5,5,5,4,4,4,4,4],
    "KEMUDAHAN": "TANDAS",
    "CADANGAN": "Toilet"
  },
  {
    "Timestamp": "2025/12/11 10:43:06 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [3,4,3,4,4,2,3,3,3,3,3,2,3,3,3,3,4,1,2,3,3,5,5,5,3,5,5,5,5,5,4,5,3,5,5,5,5,5,2,5,3,3,3,3,3,3,5,5,5,5,5,3,3,3,3,3],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "Kalau boleh semua tempat dapat akses wifi"
  },
  {
    "Timestamp": "2025/12/11 11:10:30 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "3",
    "SCORES": [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,3,5,5,5,3,5,5,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "Baik Sahaja"
  },
  {
    "Timestamp": "2025/12/12 2:54:44 AM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "3",
    "SCORES": [3,3,2,4,4,1,3,3,3,4,4,1,5,5,5,5,5,3,4,4,4,4,4,2,5,5,5,5,5,5,5,5,5,4,5,5,2,5,5,5,1,5,5,2,2,2,4,2,4,2,1,2,2,2,2,2],
    "KEMUDAHAN": "PERALATAN PDP SKE",
    "CADANGAN": "Peralatan bagi melaksanakan amali setiap motor 1 fasa/ 3 fasa adalah kurang mencukupi..."
  },
  {
    "Timestamp": "2025/12/12 10:35:27 AM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "2",
    "SCORES": [5,5,5,5,5,3,5,5,5,5,5,3,5,5,5,5,5,4,5,5,5,5,5,2,5,5,5,5,5,3,5,5,5,5,5,5,4,5,3,3,3,2,2,5,5,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "SURAU",
    "CADANGAN": "tiada"
  },
  {
    "Timestamp": "2025/12/12 10:48:21 AM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "3",
    "SCORES": [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "PERALATAN PDP SOP",
    "CADANGAN": "tiada"
  },
  {
    "Timestamp": "2025/12/12 10:49:45 AM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "2",
    "SCORES": [5,5,5,5,5,5,5,5,5,5,5,5,4,5,5,5,5,5,5,5,5,5,5,5,5,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "."
  },
  {
    "Timestamp": "2025/12/12 12:29:08 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "1",
    "SCORES": [4,4,4,5,5,3,5,4,4,5,4,4,5,5,5,5,5,3,5,5,5,5,5,5,5,5,5,5,5,5,4,4,4,4,4,4,3,4,5,5,2,4,5,5,5,5,4,5,5,5,2,4,4,5,4,5],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "Wifi terkadang kalau dipakai line nya tidak kuat yang membuat susah untuk melakukan pencarian yang penting"
  },
  {
    "Timestamp": "2025/12/12 4:36:01 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "3",
    "SCORES": [5,5,3,5,5,4,5,5,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,3,3,5,5,5,5,5,3,4,3,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "PERALATAN PDP SKE",
    "CADANGAN": "PERALATAN UNTUK PENDAWAIAN TERUTAMA UNTUK ELEKTRIK, BANYAK SKRU YANG SUDAH HAUS, ROSAK..."
  },
  {
    "Timestamp": "2025/12/12 6:28:19 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "3",
    "SCORES": [3,3,3,4,4,3,3,3,3,4,3,3,3,3,3,4,4,3,3,3,3,3,4,3,4,4,4,4,4,4,4,4,4,3,4,4,4,4,4,4,3,4,4,3,3,3,3,4,4,4,3,4,3,4,4,4],
    "KEMUDAHAN": "KOMPUTER",
    "CADANGAN": "Semua serba baik dan lengkap."
  },
  {
    "Timestamp": "2025/12/12 8:36:15 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "1",
    "SCORES": [4,4,4,4,4,4,4,4,4,4,5,5,4,4,5,5,5,5,4,4,4,5,5,5,1,2,5,5,5,5,5,4,5,5,5,5,5,5,3,5,2,5,5,2,2,5,3,5,5,5,5,5,4,5,5,5],
    "KEMUDAHAN": "TANDAS",
    "CADANGAN": "TIDAK ADA"
  },
  {
    "Timestamp": "2025/12/12 8:50:34 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "3",
    "SCORES": [3,3,4,5,3,2,3,3,4,3,3,2,3,3,3,3,3,2,3,3,3,3,3,2,3,3,3,3,3,3,4,5,4,5,5,5,4,5,2,2,2,3,2,2,2,4,3,4,4,4,4,5,5,5,5,5],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "."
  },
  {
    "Timestamp": "2025/12/12 9:46:10 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "3",
    "SCORES": [4,3,4,5,5,3,3,4,5,5,5,3,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,3,5,4,5,5,5,2,3,2,3,5,4,5,5,4,4,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "SURAU",
    "CADANGAN": "Membaik pulih aircon di perpustakaan "
  },
  {
    "Timestamp": "2025/12/14 1:28:06 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "2",
    "SCORES": [5,2,5,5,5,2,5,5,5,5,5,2,5,5,5,5,5,5,5,5,5,5,5,3,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,1,3,5,3,5,3,5,5,5,5,5,5,3,3,4,4],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "Membaikpulih pintu tandas pelajar lekaki dan menambah kerusi dan meja d cafe"
  },
  {
    "Timestamp": "2025/12/15 11:55:11 AM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [4,4,4,3,4,3,4,4,4,3,4,3,4,4,4,4,4,3,3,4,4,4,4,3,4,4,5,3,5,4,5,5,4,5,5,5,5,5,4,4,1,2,5,4,4,4,3,4,5,4,4,5,5,5,5,5],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "menambah meja/kerusi dan memperluaskan lagi cafe untuk mengelakkan kesesakan pelajar"
  },
  {
    "Timestamp": "2025/12/16 5:20:44 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "1",
    "SCORES": [5,5,5,5,5,4,4,4,4,5,5,4,4,4,4,5,5,3,4,4,4,4,5,3,4,4,4,4,5,3,5,4,5,4,5,5,4,5,5,5,3,4,5,3,4,4,4,5,5,5,4,5,5,5,5,5],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "kalau bolehh tambahkan lagi meja dengan kerusi d kafe sebab tidak cukup tempat untuk duduk dan makan"
  },
  {
    "Timestamp": "2025/12/18 2:43:44 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "1",
    "SCORES": [4,4,4,4,4,2,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4,4,4,4,4,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "TIADA"
  },
  {
    "Timestamp": "2026/01/19 9:06:09 AM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [4,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "Pandai lag wifi nya."
  },
  {
    "Timestamp": "2026/01/19 9:07:57 AM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [4,4,4,4,4,2,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    "KEMUDAHAN": "PERALATAN PDP SOP",
    "CADANGAN": "wifi kolej tidak kuat"
  },
  {
    "Timestamp": "2026/01/19 9:08:14 AM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [4,4,4,4,4,3,4,4,4,4,4,3,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4,4,4,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "TIADA"
  },
  {
    "Timestamp": "2026/01/19 9:08:28 AM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [5,5,4,5,5,3,5,5,5,5,5,3,5,5,5,5,5,3,5,5,5,5,5,3,5,5,5,5,5,3,5,5,5,5,5,5,3,5,5,4,3,5,5,4,5,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "."
  },
  {
    "Timestamp": "2026/01/19 9:09:26 AM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [4,4,4,5,5,4,4,4,4,4,4,4,4,4,4,5,5,4,4,4,4,4,5,5,5,4,4,4,5,4,4,5,5,5,5,5,4,5,4,4,3,5,5,3,4,4,4,5,5,5,4,5,4,4,4,5],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "Perbanyak meja Dan kerusi untuk student"
  },
  {
    "Timestamp": "2026/01/19 9:10:16 AM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [5,5,3,5,5,3,5,5,3,5,5,3,5,5,3,5,5,2,5,5,3,5,5,3,3,5,5,5,5,5,5,5,5,5,5,5,5,5,4,4,1,3,5,4,4,4,4,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "kursi di kafe kurang mencukupi"
  },
  {
    "Timestamp": "2026/01/19 9:10:40 AM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [5,4,4,4,5,3,4,4,5,4,4,4,4,4,5,4,5,4,4,4,4,4,5,4,4,3,4,4,4,5,4,4,4,4,5,5,5,5,4,4,3,4,4,4,4,4,4,5,5,5,3,4,4,5,4,4],
    "KEMUDAHAN": "PERALATAN PDP SOP",
    "CADANGAN": "Wi-Fi kolej slow"
  },
  {
    "Timestamp": "2026/01/19 9:11:52 AM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [2,2,2,2,3,4,2,2,2,2,3,4,2,2,2,2,3,4,2,2,2,2,2,4,3,3,3,3,2,4,2,2,2,2,2,2,2,4,2,2,2,2,4,2,2,2,2,2,2,2,2,2,2,2,2,2],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "penambah baikan wifi"
  },
  {
    "Timestamp": "2026/01/19 9:13:18 AM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "3",
    "SCORES": [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "1. Saya cadangkan tempat meja/kerus cafe menambah jumlah yang banyak lagi. 2. Keluasan tapak cafe."
  },
  {
    "Timestamp": "2026/01/19 9:13:20 AM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "3",
    "SCORES": [5,5,5,5,5,3,5,5,5,5,5,3,5,5,5,5,5,3,5,5,5,5,5,3,5,5,5,5,5,3,5,5,5,5,5,5,3,5,3,3,3,5,3,4,5,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "Pendapat saya, wi-fi shj kerana kmi sbgai pelajar sgt memerlukan wi-fi untuk memisahkan kmi belajar di kolej"
  },
  {
    "Timestamp": "2026/01/19 9:14:25 AM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [4,5,5,5,5,3,5,5,5,5,5,3,5,5,5,5,5,5,5,5,5,5,5,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "WiFi slow"
  },
  {
    "Timestamp": "2026/01/19 9:14:42 AM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "3",
    "SCORES": [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,3,2,1,4,4,5,5,5,5,5,5,5,5,5,4,4,3,4],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "Menjual kuih muih yang fresh di cafe"
  },
  {
    "Timestamp": "2026/01/19 9:17:02 AM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "3",
    "SCORES": [4,4,4,4,4,4,4,4,4,4,4,2,4,4,4,4,4,2,4,4,4,4,4,2,4,4,4,4,4,2,4,4,4,4,4,4,2,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "Peralatan PDP SKU"
  },
  {
    "Timestamp": "2026/01/19 9:22:12 AM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "1",
    "SCORES": [4,4,4,4,4,3,4,4,4,4,4,3,4,4,4,4,4,4,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "wifi perlu ditambah baik "
  },
  {
    "Timestamp": "2026/01/19 9:24:58 AM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [4,5,5,5,4,3,5,4,5,4,5,5,5,5,5,5,5,5,5,4,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,5],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "Tidak ada..semua dalam keadaan baik"
  },
  {
    "Timestamp": "2026/01/19 9:26:06 AM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "1",
    "SCORES": [5,5,5,4,4,2,5,5,5,5,5,3,5,5,5,2,5,3,5,5,5,5,4,2,5,5,5,5,5,2,5,5,5,5,5,5,2,5,5,5,5,5,5,4,4,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "Wifi kurang kuat"
  },
  {
    "Timestamp": "2026/01/19 9:26:20 AM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "3",
    "SCORES": [3,4,4,4,5,2,4,4,4,4,5,2,4,4,4,5,5,2,4,4,4,4,4,2,3,3,3,4,4,2,4,4,3,4,3,5,2,3,2,2,3,4,4,3,4,4,3,4,4,4,3,4,3,3,4,3],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "Wifi slow"
  },
  {
    "Timestamp": "2026/01/19 9:28:04 AM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "3",
    "SCORES": [5,5,4,5,5,4,5,5,5,5,5,5,5,5,5,5,5,3,5,5,5,5,5,3,5,5,5,5,5,3,5,5,5,5,5,5,3,5,3,3,3,3,4,4,4,4,4,4,5,4,4,5,5,5,5,5],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "tiada"
  },
  {
    "Timestamp": "2026/01/19 9:30:15 AM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "1",
    "SCORES": [5,5,5,5,5,3,5,5,5,5,5,3,5,5,5,5,5,3,5,5,5,5,5,3,5,5,5,5,5,3,5,5,5,5,5,5,3,5,5,5,5,5,5,5,5,3,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "TANDAS",
    "CADANGAN": "tandas lelaki baiki lock"
  },
  {
    "Timestamp": "2026/01/19 9:44:13 AM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "3",
    "SCORES": [5,5,4,5,4,3,5,5,5,5,4,3,5,5,5,4,4,3,5,5,5,4,4,5,5,5,5,5,5,5,4,4,4,4,4,4,4,4,4,3,2,3,5,4,4,5,5,5,4,5,5,5,5,5,5,5],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "."
  },
  {
    "Timestamp": "2026/01/19 9:51:37 AM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "Tiada"
  },
  {
    "Timestamp": "2026/01/19 10:00:35 AM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "3",
    "SCORES": [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "Tambah meja cafe"
  },
  {
    "Timestamp": "2026/01/19 10:01:32 AM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "3",
    "SCORES": [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "capaian untuk semua tempat"
  },
  {
    "Timestamp": "2026/01/19 10:01:51 AM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "3",
    "SCORES": [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "Steady"
  },
  {
    "Timestamp": "2026/01/19 10:04:25 AM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "3",
    "SCORES": [4,4,4,4,4,4,4,4,4,4,4,4,3,3,4,3,4,3,3,3,4,4,3,4,3,4,3,4,4,3,4,3,4,4,4,4,3,4,3,3,4,3,4,4,4,4,4,4,4,3,4,3,3,1,4,3],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "Makanan cafe tidak mencukupi"
  },
  {
    "Timestamp": "2026/01/19 10:06:20 AM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "3",
    "SCORES": [4,4,4,4,4,4,4,4,4,4,4,4,4,4,2,4,4,2,4,4,2,3,4,5,5,4,4,5,5,5,5,3,5,4,5,5,5,5,2,4,3,3,4,2,2,4,2,4,4,4,4,3,3,2,4,5],
    "KEMUDAHAN": "PERALATAN PDP SKU",
    "CADANGAN": "dan cafe"
  },
  {
    "Timestamp": "2026/01/19 10:32:40 AM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [5,5,5,5,5,5,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "semua baik"
  },
  {
    "Timestamp": "2026/01/19 12:37:41 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "3",
    "SCORES": [5,5,3,5,5,3,4,5,3,5,5,3,5,4,3,5,5,3,5,5,3,4,5,3,4,4,5,5,5,3,5,5,3,5,5,5,3,4,5,5,4,4,4,4,5,3,5,5,5,5,5,3,5,5,5,5],
    "KEMUDAHAN": "PERALATAN PDP SKE",
    "CADANGAN": "Terbaik"
  },
  {
    "Timestamp": "2026/01/19 1:30:55 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [5,5,4,5,5,2,5,5,5,5,5,2,5,5,5,5,5,2,5,5,5,5,5,2,4,5,5,5,5,3,5,5,5,5,5,5,3,5,4,5,4,5,5,4,4,5,5,5,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "E-TECH CENTRE",
    "CADANGAN": "Cafe"
  },
  {
    "Timestamp": "2026/01/19 1:32:30 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [5,5,4,4,5,3,5,5,5,5,5,5,4,4,5,5,5,4,5,5,5,5,5,5,5,5,5,5,5,5,5,4,5,4,5,5,5,5,5,5,5,5,5,4,5,5,5,4,5,5,5,5,5,5,5,5],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "Tiada"
  },
  {
    "Timestamp": "2026/01/19 1:39:05 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL OPERASI PERHOTELAN",
    "SEMESTER": "2",
    "SCORES": [3,2,2,4,3,1,3,3,3,4,5,1,5,5,5,5,5,1,3,4,4,3,3,1,1,1,4,2,4,1,5,5,5,5,5,5,1,5,3,4,1,1,5,2,2,1,3,3,3,3,5,5,5,5,5,5],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "."
  },
  {
    "Timestamp": "2026/01/19 1:47:46 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL TEKNOLOGI ELEKTRIK",
    "SEMESTER": "3",
    "SCORES": [4,4,4,4,4,4,3,4,4,3,4,4,4,4,4,4,4,4,4,3,4,4,4,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    "KEMUDAHAN": "PERALATAN PDP SKE",
    "CADANGAN": "ada aset yang kurang boleh di tambahkan"
  },
  {
    "Timestamp": "2026/01/19 3:21:25 PM GMT+8",
    "JANTINA": "PEREMPUAN",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "3",
    "SCORES": [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "-"
  },
  {
    "Timestamp": "2026/01/19 4:00:09 PM GMT+8",
    "JANTINA": "LELAKI",
    "PROGRAM PENGAJIAN": "SIJIL KULINARI",
    "SEMESTER": "2",
    "SCORES": [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,4,4,5,5,5,5,5,5,5,4,5,5,4,5],
    "KEMUDAHAN": "WIFI",
    "CADANGAN": "Saya ingin Wi-Fi di kolej diperbaiki untuk mudah mengakses pembelajaran yang ada dalam talian"
  }
];

// Storage key for client-side custom surveys
const CUSTOM_SURVEYS_STORAGE_KEY = 'siap_custom_student_surveys';

export function getCustomStudentSurveys(): StudentSurveyItem[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(CUSTOM_SURVEYS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomStudentSurvey(survey: StudentSurveyItem): void {
  try {
    if (typeof window === 'undefined') return;
    const existing = getCustomStudentSurveys();
    const updated = [survey, ...existing];
    localStorage.setItem(CUSTOM_SURVEYS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage issues
  }
}

// Helper to compute structured processed items
export function getProcessedStudentSurveys(): StudentSurveyItem[] {
  const baseItems: StudentSurveyItem[] = STUDENT_SURVEY_RAW_DATA.map((item, index) => {
    // Extract year from timestamp (e.g. "2025/12/11 ..." or "2026/01/19 ...")
    const yearMatch = item.Timestamp.match(/(\d{4})/);
    const year = yearMatch ? parseInt(yearMatch[1], 10) : 2026;

    const s = item.SCORES;
    // Section sub-averages
    const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

    const bilikKuliah = avg(s.slice(0, 12));
    const immersiveCentre = avg(s.slice(12, 18));
    const dewanKuliah = avg(s.slice(18, 24));
    const makmalKomputer = avg(s.slice(24, 30));
    const perpustakaan = avg(s.slice(30, 37));
    const kafe = avg(s.slice(37, 43));
    const kemudahanSokongan = avg(s.slice(43, 51));
    const bengkelDapur = avg(s.slice(51, 56));
    // Collect all WiFi rating questions
    const wifiScores = [s[5], s[11], s[17], s[23], s[29], s[36]];
    const wifi = avg(wifiScores.filter((n) => typeof n === 'number'));
    const purataKeseluruhan = avg(s);

    const rawFacility = (item.KEMUDAHAN || '').trim().toUpperCase();
    const kemudahanPenambahbaikan = rawFacility === 'KAFE' ? 'E-TECH CENTRE' : rawFacility;

    return {
      id: `SURVEY-${year}-${String(index + 1).padStart(3, '0')}`,
      timestamp: item.Timestamp,
      year,
      jantina: item.JANTINA as 'LELAKI' | 'PEREMPUAN',
      programPengajian: item["PROGRAM PENGAJIAN"].trim(),
      semester: item.SEMESTER.trim(),
      scores: {
        bilikKuliah: Number(bilikKuliah.toFixed(2)),
        immersiveCentre: Number(immersiveCentre.toFixed(2)),
        dewanKuliah: Number(dewanKuliah.toFixed(2)),
        makmalKomputer: Number(makmalKomputer.toFixed(2)),
        perpustakaan: Number(perpustakaan.toFixed(2)),
        eTechCentre: Number(kafe.toFixed(2)),
        kafe: Number(kafe.toFixed(2)),
        kemudahanSokongan: Number(kemudahanSokongan.toFixed(2)),
        bengkelAmali: Number(bengkelDapur.toFixed(2)),
        bengkelDapur: Number(bengkelDapur.toFixed(2)),
        wifi: Number(wifi.toFixed(2)),
        purataKeseluruhan: Number(purataKeseluruhan.toFixed(2)),
      },
      rawScores: s,
      kemudahanPenambahbaikan,
      cadangan: item.CADANGAN.trim(),
    };
  });

  const customItems = getCustomStudentSurveys().map((c) => {
    const rawFac = (c.kemudahanPenambahbaikan || '').trim().toUpperCase();
    const kemudahanPenambahbaikan = rawFac === 'KAFE' ? 'E-TECH CENTRE' : rawFac;
    const scores = {
      ...c.scores,
      eTechCentre: c.scores.eTechCentre ?? c.scores.kafe,
      kafe: c.scores.kafe ?? c.scores.eTechCentre,
      bengkelAmali: c.scores.bengkelAmali ?? c.scores.bengkelDapur,
      bengkelDapur: c.scores.bengkelDapur ?? c.scores.bengkelAmali,
    };
    return {
      ...c,
      kemudahanPenambahbaikan,
      scores,
    };
  });

  return [...customItems, ...baseItems];
}

