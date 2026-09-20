-- ══════════════════════════════════════════════════════════════
-- SiAP: Cipta Jadual siap_student_satisfaction
-- Jalankan ini dalam: Supabase Dashboard > SQL Editor
-- URL: https://supabase.com/dashboard/project/dliiscfkrzxdjtgphyoq/sql/new
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.siap_student_satisfaction (
  id                        TEXT PRIMARY KEY,
  timestamp                 TEXT NOT NULL,
  year                      INTEGER,
  jantina                   TEXT CHECK (jantina IN ('LELAKI', 'PEREMPUAN')),
  "programPengajian"        TEXT,
  semester                  TEXT,
  scores                    JSONB,
  "rawScores"               JSONB,
  "kemudahanPenambahbaikan" TEXT,
  cadangan                  TEXT,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

-- Aktifkan Row Level Security
ALTER TABLE public.siap_student_satisfaction ENABLE ROW LEVEL SECURITY;

-- Benarkan semua akses (selaras dengan jadual siap lain)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'siap_student_satisfaction' 
    AND policyname = 'Allow all access'
  ) THEN
    CREATE POLICY "Allow all access"
      ON public.siap_student_satisfaction
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- Sahkan jadual berjaya dicipta
SELECT 
  'siap_student_satisfaction' AS jadual,
  COUNT(*) AS jumlah_kolum
FROM information_schema.columns 
WHERE table_name = 'siap_student_satisfaction';
