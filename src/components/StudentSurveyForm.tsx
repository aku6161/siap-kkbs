import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Send,
  Star,
  Building2,
  Wifi,
  Coffee,
  BookOpen,
  Laptop,
  Layers,
  Wrench,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Share2,
  Copy,
  Check,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { StudentSurveyItem, saveCustomStudentSurvey } from '../data/studentSatisfactionData';

interface StudentSurveyFormProps {
  onSuccess?: (survey: StudentSurveyItem) => void;
  onCancel?: () => void;
}

export const SURVEY_SECTIONS = [
  {
    id: 'bilikKuliah1',
    title: 'Bilik Kuliah 1',
    icon: Building2,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    questions: [
      { id: 0, text: 'Peralatan kerusi dalam keadaan yang baik dan mencukupi untuk keperluan pembelajaran' },
      { id: 1, text: 'Peralatan meja dalam keadaan yang baik dan mencukupi untuk keperluan pembelajaran' },
      { id: 2, text: 'Alat bantu mengajar mencukupi serta berfungsi dengan baik' },
      { id: 3, text: 'Persekitaran bilik kuliah adalah bersih dan selesa' },
      { id: 4, text: 'Persekitaran bilik kuliah adalah selamat' },
      { id: 5, text: 'Mempunyai capaian WiFi yang baik di bilik kuliah' },
    ],
  },
  {
    id: 'bilikKuliah2',
    title: 'Bilik Kuliah 2',
    icon: Building2,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    questions: [
      { id: 6, text: 'Peralatan kerusi dalam keadaan yang baik dan mencukupi untuk keperluan pembelajaran' },
      { id: 7, text: 'Peralatan meja dalam keadaan yang baik dan mencukupi untuk keperluan pembelajaran' },
      { id: 8, text: 'Alat bantu mengajar mencukupi serta berfungsi dengan baik' },
      { id: 9, text: 'Persekitaran bilik kuliah adalah bersih dan selesa' },
      { id: 10, text: 'Persekitaran bilik kuliah adalah selamat' },
      { id: 11, text: 'Mempunyai capaian WiFi yang baik' },
    ],
  },
  {
    id: 'immersive',
    title: 'Immersive Centre',
    icon: Layers,
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    questions: [
      { id: 12, text: 'Peralatan kerusi dalam keadaan yang baik dan mencukupi untuk keperluan pembelajaran' },
      { id: 13, text: 'Peralatan meja dalam keadaan yang baik dan mencukupi untuk keperluan pembelajaran' },
      { id: 14, text: 'Alat bantu mengajar mencukupi serta berfungsi dengan baik' },
      { id: 15, text: 'Persekitaran Immersive Centre adalah bersih dan selesa' },
      { id: 16, text: 'Persekitaran Immersive Centre adalah selamat' },
      { id: 17, text: 'Mempunyai capaian WiFi yang baik di Immersive Centre' },
    ],
  },
  {
    id: 'dewanKuliah',
    title: 'Dewan Kuliah',
    icon: GraduationCap,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    questions: [
      { id: 18, text: 'Peralatan kerusi dalam keadaan yang baik dan mencukupi untuk keperluan pembelajaran' },
      { id: 19, text: 'Peralatan meja dalam keadaan yang baik dan mencukupi untuk keperluan pembelajaran' },
      { id: 20, text: 'Alat bantu mengajar mencukupi serta berfungsi dengan baik' },
      { id: 21, text: 'Persekitaran dewan kuliah adalah bersih dan selesa' },
      { id: 22, text: 'Persekitaran dewan kuliah adalah selamat' },
      { id: 23, text: 'Mempunyai capaian WiFi yang baik di dewan kuliah' },
    ],
  },
  {
    id: 'makmalKomputer',
    title: 'Makmal Bahasa & Makmal Komputer',
    icon: Laptop,
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    questions: [
      { id: 24, text: 'Komputer yang disediakan berfungsi dengan baik' },
      { id: 25, text: 'Komputer yang disediakan mencukupi untuk keperluan pembelajaran' },
      { id: 26, text: 'Peralatan kerusi dalam keadaan yang baik dan mencukupi untuk keperluan pembelajaran' },
      { id: 27, text: 'Persekitaran makmal bahasa dan makmal komputer adalah bersih dan selesa' },
      { id: 28, text: 'Persekitaran makmal bahasa dan makmal komputer adalah selamat' },
      { id: 29, text: 'Mempunyai capaian WiFi yang baik di makmal komputer' },
    ],
  },
  {
    id: 'perpustakaan',
    title: 'Perpustakaan',
    icon: BookOpen,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    questions: [
      { id: 30, text: 'Proses capaian maklumat dan bahan rujukan di perpustakaan adalah tersusun dan mudah diperolehi' },
      { id: 31, text: 'Koleksi bahan bacaan mencukupi' },
      { id: 32, text: 'Waktu operasi perpustakaan adalah bersesuaian' },
      { id: 33, text: 'Proses peminjaman dan pemulangan mudah dan cepat' },
      { id: 34, text: 'Persekitaran perpustakaan adalah bersih dan selesa' },
      { id: 35, text: 'Persekitaran perpustakaan adalah selamat' },
      { id: 36, text: 'Mempunyai capaian WiFi yang baik di perpustakaan' },
    ],
  },
  {
    id: 'kafe',
    title: 'E-Tech Centre',
    icon: Coffee,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    questions: [
      { id: 37, text: 'Layanan perkhidmatan di kaunter adalah mesra dan baik' },
      { id: 38, text: 'Makanan dijual dengan harga yang berpatutan' },
      { id: 39, text: 'Mempunyai menu makanan yang pelbagai' },
      { id: 40, text: 'Mempunyai meja dan kerusi yang mencukupi' },
      { id: 41, text: 'Mempunyai persekitaran yang bersih dan selesa' },
      { id: 42, text: 'Makanan dan minuman yang dijual sedap dan bersih' },
    ],
  },
  {
    id: 'kemudahanSokongan',
    title: 'Kemudahan Sokongan',
    icon: HelpCircle,
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    questions: [
      { id: 43, text: 'Kemudahan tempat rehat adalah mencukupi' },
      { id: 44, text: 'Tempat rehat pelajar adalah selesa dan bersih' },
      { id: 45, text: 'Kemudahan tandas adalah mencukupi' },
      { id: 46, text: 'Tahap kebersihan tandas adalah baik' },
      { id: 47, text: 'Kemudahan surau adalah mencukupi' },
      { id: 48, text: 'Kemudahan surau adalah selesa dan bersih' },
      { id: 49, text: 'Kemudahan asas di surau adalah mencukupi' },
      { id: 50, text: 'Kemudahan tempat letak kenderaan adalah mencukupi' },
    ],
  },
  {
    id: 'bengkelDapur',
    title: 'Bengkel / Restoran / Bilik Simulasi / Bilik Dobi / Dapur',
    icon: Wrench,
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    questions: [
      { id: 51, text: 'Peralatan pembelajaran yang disediakan adalah mencukupi' },
      { id: 52, text: 'Peralatan pembelajaran untuk amali adalah berfungsi dengan baik' },
      { id: 53, text: 'Persekitaran di dalam bengkel / restoran / bilik simulasi / bilik dobi / dapur adalah bersih dan selesa' },
      { id: 54, text: 'Persekitaran di dalam bengkel / restoran / bilik simulasi / bilik dobi / dapur adalah selamat' },
      { id: 55, text: 'Peraturan keselamatan penggunaan peralatan dalam bengkel / restoran / bilik simulasi / bilik dobi / dapur dipamerkan' },
    ],
  },
];

const PROGRAM_OPTIONS = [
  'SIJIL KULINARI',
  'SIJIL OPERASI PERHOTELAN',
  'SIJIL TEKNOLOGI ELEKTRIK',
];

const SEMESTER_OPTIONS = [
  '1',
  '2',
  '3',
  '4 (LATIHAN INDUSTRI)',
];

const PRIORITY_FACILITY_OPTIONS = [
  'WIFI',
  'KAFE',
  'E-TECH CENTRE',
  'TANDAS',
  'SURAU',
  'KOMPUTER',
  'KERUSI',
  'PERALATAN PDP SKE',
  'PERALATAN PDP SKU',
  'PERALATAN PDP SOP',
  'PERPUSTAKAAN',
  'BILIK KULIAH',
  'LAIN-LAIN',
];

const RATING_DESCRIPTIONS: Record<number, { text: string; emoji: string; color: string }> = {
  1: { text: 'Sangat Tidak Memuaskan', emoji: '😡', color: 'text-rose-600 bg-rose-50 border-rose-200' },
  2: { text: 'Tidak Memuaskan', emoji: '🙁', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  3: { text: 'Sederhana', emoji: '😐', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  4: { text: 'Memuaskan', emoji: '😊', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  5: { text: 'Sangat Memuaskan', emoji: '🤩', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
};

export const StudentSurveyForm: React.FC<StudentSurveyFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  // Step navigation (0: Demografi, 1..9: Sections, 10: Cadangan Akhir)
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Demographics
  const [jantina, setJantina] = useState<'LELAKI' | 'PEREMPUAN'>('LELAKI');
  const [programPengajian, setProgramPengajian] = useState<string>('SIJIL KULINARI');
  const [semester, setSemester] = useState<string>('1');

  // Exact 56 Question Scores (Initialized to 4)
  const [scoresArray, setScoresArray] = useState<number[]>(() => Array(56).fill(4));

  // Priority and open text
  const [kemudahanPenambahbaikan, setKemudahanPenambahbaikan] = useState<string>('WIFI');
  const [cadangan, setCadangan] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSurvey, setSubmittedSurvey] = useState<StudentSurveyItem | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const handleScoreChange = (index: number, val: number) => {
    setScoresArray((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleSetAllCurrentSection = (val: number, sectionQuestions: { id: number }[]) => {
    setScoresArray((prev) => {
      const next = [...prev];
      sectionQuestions.forEach((q) => {
        next[q.id] = val;
      });
      return next;
    });
  };

  // Computes structured dimension scores from 56 scores
  const computedMetrics = useMemo(() => {
    const s = scoresArray;
    const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

    const bilikKuliah = avg(s.slice(0, 12));
    const immersiveCentre = avg(s.slice(12, 18));
    const dewanKuliah = avg(s.slice(18, 24));
    const makmalKomputer = avg(s.slice(24, 30));
    const perpustakaan = avg(s.slice(30, 37));
    const kafe = avg(s.slice(37, 43));
    const kemudahanSokongan = avg(s.slice(43, 51));
    const bengkelDapur = avg(s.slice(51, 56));
    const wifiScores = [s[5], s[11], s[17], s[23], s[29], s[36]];
    const wifi = avg(wifiScores);
    const purataKeseluruhan = avg(s);

    return {
      bilikKuliah: Number(bilikKuliah.toFixed(2)),
      immersiveCentre: Number(immersiveCentre.toFixed(2)),
      dewanKuliah: Number(dewanKuliah.toFixed(2)),
      makmalKomputer: Number(makmalKomputer.toFixed(2)),
      perpustakaan: Number(perpustakaan.toFixed(2)),
      kafe: Number(kafe.toFixed(2)),
      kemudahanSokongan: Number(kemudahanSokongan.toFixed(2)),
      bengkelDapur: Number(bengkelDapur.toFixed(2)),
      wifi: Number(wifi.toFixed(2)),
      purataKeseluruhan: Number(purataKeseluruhan.toFixed(2)),
    };
  }, [scoresArray]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const currentYear = new Date().getFullYear();
    const now = new Date();
    const timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${now.toLocaleTimeString('en-US')} GMT+8`;

    const surveyItem: StudentSurveyItem = {
      id: `SURVEY-${currentYear}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp,
      year: currentYear,
      jantina,
      programPengajian,
      semester,
      scores: computedMetrics,
      kemudahanPenambahbaikan: kemudahanPenambahbaikan.trim().toUpperCase(),
      cadangan: cadangan.trim() || '-',
    };

    try {
      const response = await fetch('/api/student-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jantina,
          programPengajian,
          semester,
          scores: computedMetrics,
          scoresRaw: scoresArray,
          kemudahanPenambahbaikan,
          cadangan,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.survey) {
          surveyItem.id = data.survey.id;
        }
      }
    } catch {
      // Local fallback
    }

    saveCustomStudentSurvey(surveyItem);
    setIsSubmitting(false);
    setSubmittedSurvey(surveyItem);
    if (onSuccess) {
      onSuccess(surveyItem);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?tab=soalselidik`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // SUCCESS VIEW
  if (submittedSurvey) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in">
        <div className="bg-white/95 backdrop-blur-xl border border-white/80 rounded-3xl p-8 sm:p-12 shadow-2xl text-center relative overflow-hidden">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-3xl shadow-lg shadow-emerald-500/30 mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
            Terima Kasih Atas Maklum Balas Anda!
          </h2>
          <p className="text-slate-600 max-w-lg mx-auto mb-6 text-sm sm:text-base leading-relaxed">
            Maklum balas anda bagi program <span className="font-bold text-slate-900">{submittedSurvey.programPengajian}</span> (Semester {submittedSurvey.semester}) telah direkodkan ke dalam Sistem Statistik Kepuasan Pelajar KKBS.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-xs font-mono font-bold text-slate-700 mb-8 border border-slate-200">
            <span>ID Respon:</span>
            <span className="text-blue-600 font-extrabold">{submittedSurvey.id}</span>
          </div>

          <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 max-w-lg mx-auto mb-8 text-left space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Purata Skor Diberikan</span>
              <div className="flex items-center gap-1 text-emerald-600 font-extrabold text-lg">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{submittedSurvey.scores.purataKeseluruhan} / 5.00</span>
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Keperluan Segera:</span>
              <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                {submittedSurvey.kemudahanPenambahbaikan}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Cadangan:</span>
              <span className="font-medium text-slate-800 text-right max-w-[240px] truncate">
                {submittedSurvey.cadangan}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all duration-200"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
              {copiedLink ? 'Pautan Disalin!' : 'Kongsi Borang Kepada Rakan'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSubmittedSurvey(null);
                setCurrentStep(0);
                setScoresArray(Array(56).fill(4));
                setCadangan('');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-xl border border-slate-300 shadow-sm transition-all"
            >
              <RefreshCw className="w-4 h-4 text-slate-500" />
              Isi Respon Baharu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden mb-8 border border-blue-800">
        <div className="relative z-10">
          <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight mb-2">
            Kajian Soal Selidik Kepuasan Pelajar Terhadap Fasiliti & Kemudahan KKBS
          </h1>
          <p className="text-blue-100/90 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Sila berikan maklum balas dan penilaian ikhlas anda bagi setiap aspek di bawah mengikut skala 1 (Sangat Tidak Memuaskan) hingga 5 (Sangat Memuaskan).
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: DEMOGRAFI */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-200/80">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
              1
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Maklumat Responden Pelajar</h2>
              <p className="text-xs text-slate-500">Pilih jantina, program pengajian dan semester</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Jantina */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Jantina <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setJantina('LELAKI')}
                  className={`py-3 px-3 rounded-xl text-xs font-bold transition-all border ${
                    jantina === 'LELAKI'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  👨 Lelaki
                </button>
                <button
                  type="button"
                  onClick={() => setJantina('PEREMPUAN')}
                  className={`py-3 px-3 rounded-xl text-xs font-bold transition-all border ${
                    jantina === 'PEREMPUAN'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  👩 Perempuan
                </button>
              </div>
            </div>

            {/* Program Pengajian */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Program Pengajian <span className="text-rose-500">*</span>
              </label>
              <select
                value={programPengajian}
                onChange={(e) => setProgramPengajian(e.target.value)}
                className="w-full py-3 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              >
                {PROGRAM_OPTIONS.map((prog) => (
                  <option key={prog} value={prog}>
                    {prog}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Semester Pengajian <span className="text-rose-500">*</span>
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full py-3 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              >
                {SEMESTER_OPTIONS.map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: SEMUA SOALAN MENGIKUT KATEGORI TEPAT CSV */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Penilaian Soal Selidik
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Skala: 1-Sangat Tidak Memuaskan, 2-Tidak Memuaskan, 3-Sederhana, 4-Memuaskan, 5-Sangat Memuaskan
              </p>
            </div>
          </div>

          {SURVEY_SECTIONS.map((sec, secIdx) => {
            const IconComp = sec.icon;
            const secScores = sec.questions.map((q) => scoresArray[q.id]);
            const secAvg = secScores.length
              ? (secScores.reduce((a, b) => a + b, 0) / secScores.length).toFixed(2)
              : '0.00';

            return (
              <div
                key={sec.id}
                className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
              >
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        {secIdx + 1}. {sec.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {sec.questions.length} soalan penilaian
                      </p>
                    </div>
                  </div>

                  {/* Section Fast Fill helper & Average Pill */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                      Purata: <span className="text-blue-700 font-black">{secAvg}</span>
                    </div>

                    <div className="inline-flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-500">
                      <span className="px-1 hidden sm:inline">Set Pantas:</span>
                      {[5, 4, 3].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleSetAllCurrentSection(val, sec.questions)}
                          className="px-2 py-0.5 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-slate-200 text-slate-700 font-bold transition-all shadow-2xs"
                          title={`Setkan semua soalan bahagian ini kepada ${val}`}
                        >
                          Semua {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Questions in Section */}
                <div className="space-y-4">
                  {sec.questions.map((q, qIndex) => {
                    const currentScore = scoresArray[q.id];
                    const activeDesc = RATING_DESCRIPTIONS[currentScore];

                    return (
                      <div
                        key={q.id}
                        className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/70 rounded-2xl p-4 transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          
                          {/* Question Text */}
                          <div className="flex items-start gap-3 flex-1">
                            <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {qIndex + 1}
                            </span>
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                                {q.text}
                              </p>
                            </div>
                          </div>

                          {/* 1-5 Rating Selector */}
                          <div className="flex flex-col items-end gap-1.5 shrink-0 self-end md:self-center">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((scoreNum) => {
                                const isSelected = currentScore === scoreNum;
                                return (
                                  <button
                                    key={scoreNum}
                                    type="button"
                                    onClick={() => handleScoreChange(q.id, scoreNum)}
                                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all flex items-center justify-center cursor-pointer ${
                                      isSelected
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105 ring-2 ring-blue-400/40'
                                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                                    }`}
                                  >
                                    {scoreNum}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Label */}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 ${activeDesc.color}`}>
                              <span>{activeDesc.emoji}</span>
                              <span>{activeDesc.text}</span>
                            </span>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>

        {/* SECTION 3: KEPERLUAN SEGERA & CADANGAN PENAMBAHBAIKAN */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200/80">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
              3
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Kemudahan Yang Perlu Penambahbaikan Segera & Cadangan
              </h2>
              <p className="text-xs text-slate-500">
                Pilih bahagian paling kritikal dan nyatakan cadangan penambahbaikan anda
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Priority Facility */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                KEMUDAHAN YANG PERLU PENAMBAHBAIKAN SEGERA <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {PRIORITY_FACILITY_OPTIONS.map((fac) => {
                  const isSelected = kemudahanPenambahbaikan === fac;
                  return (
                    <button
                      key={fac}
                      type="button"
                      onClick={() => setKemudahanPenambahbaikan(fac)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                        isSelected
                          ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-xs ring-2 ring-rose-400'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {fac}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Open Suggestions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                CADANGAN PENAMBAHBAIKAN / CATATAN
              </label>
              <textarea
                rows={4}
                value={cadangan}
                onChange={(e) => setCadangan(e.target.value)}
                placeholder="Contoh: Rangkaian WiFi di bengkel SKE perlu diperbaiki, tambah kerusi dan menu di kafe, perbaiki kunci pintu tandas..."
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all"
            >
              Batal / Kembali
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex-1 sm:flex-none sm:min-w-[200px] inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-blue-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Menghantar...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Hantar</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
