-- ══════════════════════════════════════════════════════════════════════════════
-- SiAP: NAIK TARAF JADUAL KEPASAN PELAJAR (LENGKAP 56 SOALAN INDIVIDUAL)
-- Salin dan jalankan kod ini di:
-- Supabase Dashboard > SQL Editor > New query
-- URL: https://supabase.com/dashboard/project/dliiscfkrzxdjtgphyoq/sql/new
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Padam jadual lama jika mahu bina semula dengan 56 kolum bersih
DROP TABLE IF EXISTS public.siap_student_satisfaction CASCADE;

-- 2. Cipta jadual baharu dengan kesemua 56 lajur soalan berasingan
CREATE TABLE public.siap_student_satisfaction (
  id                               TEXT PRIMARY KEY,
  timestamp                        TEXT NOT NULL,
  year                             INTEGER,
  jantina                          TEXT CHECK (jantina IN ('LELAKI', 'PEREMPUAN')),
  "programPengajian"               TEXT,
  semester                         TEXT,

  -- ── BILIK KULIAH 1 (Soalan 1 - 6) ──
  s01_bk1_kerusi                   NUMERIC,
  s02_bk1_meja                     NUMERIC,
  s03_bk1_abm                      NUMERIC,
  s04_bk1_bersih                   NUMERIC,
  s05_bk1_selamat                  NUMERIC,
  s06_bk1_wifi                     NUMERIC,

  -- ── BILIK KULIAH 2 (Soalan 7 - 12) ──
  s07_bk2_kerusi                   NUMERIC,
  s08_bk2_meja                     NUMERIC,
  s09_bk2_abm                      NUMERIC,
  s10_bk2_bersih                   NUMERIC,
  s11_bk2_selamat                  NUMERIC,
  s12_bk2_wifi                     NUMERIC,

  -- ── IMMERSIVE CENTRE (Soalan 13 - 18) ──
  s13_immersive_kerusi             NUMERIC,
  s14_immersive_meja               NUMERIC,
  s15_immersive_abm                NUMERIC,
  s16_immersive_bersih             NUMERIC,
  s17_immersive_selamat            NUMERIC,
  s18_immersive_wifi               NUMERIC,

  -- ── DEWAN KULIAH (Soalan 19 - 24) ──
  s19_dewan_kerusi                 NUMERIC,
  s20_dewan_meja                   NUMERIC,
  s21_dewan_abm                    NUMERIC,
  s22_dewan_bersih                 NUMERIC,
  s23_dewan_selamat                NUMERIC,
  s24_dewan_wifi                   NUMERIC,

  -- ── MAKMAL BAHASA & KOMPUTER (Soalan 25 - 30) ──
  s25_makmal_komputer_fungsi       NUMERIC,
  s26_makmal_komputer_cukup        NUMERIC,
  s27_makmal_kerusi                NUMERIC,
  s28_makmal_bersih                NUMERIC,
  s29_makmal_selamat               NUMERIC,
  s30_makmal_wifi                  NUMERIC,

  -- ── PERPUSTAKAAN (Soalan 31 - 37) ──
  s31_perpustakaan_rujukan         NUMERIC,
  s32_perpustakaan_koleksi         NUMERIC,
  s33_perpustakaan_operasi         NUMERIC,
  s34_perpustakaan_pinjaman        NUMERIC,
  s35_perpustakaan_bersih          NUMERIC,
  s36_perpustakaan_selamat         NUMERIC,
  s37_perpustakaan_wifi            NUMERIC,

  -- ── E-TECH CENTRE / KAFE (Soalan 38 - 43) ──
  s38_etech_layanan                NUMERIC,
  s39_etech_harga                  NUMERIC,
  s40_etech_menu                   NUMERIC,
  s41_etech_meja_kerusi            NUMERIC,
  s42_etech_bersih                 NUMERIC,
  s43_etech_makanan_sedap          NUMERIC,

  -- ── KEMUDAHAN SOKONGAN (Soalan 44 - 51) ──
  s44_sokongan_rehat_cukup         NUMERIC,
  s45_sokongan_rehat_selesa        NUMERIC,
  s46_sokongan_tandas_cukup        NUMERIC,
  s47_sokongan_tandas_bersih       NUMERIC,
  s48_sokongan_surau_cukup         NUMERIC,
  s49_sokongan_surau_selesa        NUMERIC,
  s50_sokongan_surau_asas          NUMERIC,
  s51_sokongan_parkir              NUMERIC,

  -- ── BENGKEL AMALI (Soalan 52 - 56) ──
  s52_bengkel_peralatan_cukup      NUMERIC,
  s53_bengkel_peralatan_fungsi     NUMERIC,
  s54_bengkel_bersih               NUMERIC,
  s55_bengkel_selamat              NUMERIC,
  s56_bengkel_peraturan_sop        NUMERIC,

  -- ── PURATA SKOR KATEGORI ──
  purata_bilik_kuliah              NUMERIC,
  purata_immersive_centre          NUMERIC,
  purata_dewan_kuliah              NUMERIC,
  purata_makmal_komputer           NUMERIC,
  purata_perpustakaan              NUMERIC,
  purata_etech_kafe                NUMERIC,
  purata_kemudahan_sokongan        NUMERIC,
  purata_bengkel_amali             NUMERIC,
  purata_wifi                      NUMERIC,
  purata_keseluruhan               NUMERIC,

  -- ── KEMUDAHAN PENAMBAHBAIKAN & CADANGAN ──
  "kemudahanPenambahbaikan"        TEXT,
  cadangan                         TEXT,

  -- ── JSON BACKWARD COMPATIBILITY ──
  scores                           JSONB,
  "rawScores"                      JSONB,

  created_at                       TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Aktifkan Row Level Security
ALTER TABLE public.siap_student_satisfaction ENABLE ROW LEVEL SECURITY;

-- 4. Benarkan semua operasi baca/tulis
CREATE POLICY "Allow all access"
  ON public.siap_student_satisfaction
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Semak jumlah kolum yang terhasil
SELECT 
  'siap_student_satisfaction' AS jadual,
  COUNT(*) AS jumlah_kolum
FROM information_schema.columns 
WHERE table_name = 'siap_student_satisfaction';
