import React, { useState } from 'react';
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
  RefreshCw,
  Share2,
  Copy,
  Check,
  Award,
} from 'lucide-react';
import { StudentSurveyItem } from '../data/studentSatisfactionData';
import { saveCustomStudentSurvey } from '../data/studentSatisfactionData';

interface StudentSurveyFormProps {
  onSuccess?: (survey: StudentSurveyItem) => void;
  onCancel?: () => void;
}

const PROGRAM_OPTIONS = [
  'SIJIL KULINARI',
  'SIJIL TEKNOLOGI ELEKTRIK',
  'SIJIL OPERASI PERHOTELAN',
  'SIJIL TEKNOLOGI PENYEJUKAN & PENYAMANAN UDARA',
  'SIJIL TERAPI KECANTIKAN & SPA',
  'SIJIL PEMPROSESAN MAKANAN',
  'PROGRAM LAIN-LAIN',
];

const SEMESTER_OPTIONS = [
  '1',
  '2',
  '3',
  '4 (LATIHAN INDUSTRI)',
];

const PRIORITY_FACILITIES = [
  { id: 'WIFI', name: 'Wi-Fi & Internet', icon: '📶' },
  { id: 'KAFE', name: 'Kafe / Makanan', icon: '🍽️' },
  { id: 'TANDAS', name: 'Tandas Pelajar', icon: '🚻' },
  { id: 'SURAU', name: 'Surau & Ruang Solat', icon: '🕌' },
  { id: 'MAKMAL KOMPUTER', name: 'Makmal Komputer', icon: '💻' },
  { id: 'BILIK KULIAH', name: 'Bilik Kuliah / Aircond', icon: '🏫' },
  { id: 'PERALATAN PDP SKE', name: 'Peralatan Bengkel / SKE', icon: '⚡' },
  { id: 'PERPUSTAKAAN', name: 'Perpustakaan', icon: '📚' },
  { id: 'ASRAMA', name: 'Asrama Pelajar', icon: '🏢' },
  { id: 'LAIN-LAIN', name: 'Lain-lain Kemudahan', icon: '🔧' },
];

const RATING_DIMENSIONS = [
  {
    key: 'bilikKuliah',
    title: 'Bilik Kuliah & Pembelajaran',
    desc: 'Keselesaan kerusi, meja, projektor, pencahayaan dan penghawa dingin bilik kuliah.',
    icon: Building2,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    key: 'immersiveCentre',
    title: 'Immersive Centre & Multimedia',
    desc: 'Kelengkapan teknologi simulasi, audio visual dan ruang interaktif moden.',
    icon: Layers,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    key: 'dewanKuliah',
    title: 'Dewan Kuliah Utama',
    desc: 'Kapasiti, sistem bunyi, paparan skrin dan keselesaan semasa kuliah umum.',
    icon: GraduationCap,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    key: 'makmalKomputer',
    title: 'Makmal Komputer & Perisian',
    desc: 'Prestasi PC, perisian kursus yang terkini, dan kelajuan capaian makmal.',
    icon: Laptop,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
  },
  {
    key: 'perpustakaan',
    title: 'Perpustakaan & Pusat Sumber',
    desc: 'Koleksi buku/rujukan, ruang belajar kondusif, dan perkhidmatan kaunter.',
    icon: BookOpen,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    key: 'kafe',
    title: 'Kafe & Kafeteria',
    desc: 'Kepelbagaian makanan, kualiti masakan, harga berpatutan dan kebersihan ruang makan.',
    icon: Coffee,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    key: 'kemudahanSokongan',
    title: 'Kemudahan Sokongan & Sanitasi',
    desc: 'Kebersihan tandas, keselesaan surau, ruang rehat, dan tempat letak kenderaan.',
    icon: HelpCircle,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    key: 'bengkelDapur',
    title: 'Bengkel & Dapur Latihan Kulinari/Teknikal',
    desc: 'Kelengkapan mesin/peralatan amali, aspek keselamatan, dan ruang kerja praktikal.',
    icon: Wrench,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
  },
  {
    key: 'wifi',
    title: 'Capaian Rangkaian Wi-Fi Kolej',
    desc: 'Kestabilan sambungan, kelajuan muat turun, dan liputan di seluruh kawasan kolej.',
    icon: Wifi,
    color: 'text-sky-600',
    bg: 'bg-sky-50',
  },
];

const RATING_LABELS: Record<number, { text: string; emoji: string; color: string }> = {
  1: { text: 'Sangat Lemah', emoji: '😞', color: 'text-rose-600 bg-rose-50 border-rose-200' },
  2: { text: 'Kurang Memuaskan', emoji: '🙁', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  3: { text: 'Sederhana', emoji: '😐', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  4: { text: 'Memuaskan', emoji: '😊', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  5: { text: 'Sangat Cemerlang', emoji: '🤩', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
};

export const StudentSurveyForm: React.FC<StudentSurveyFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  // Form States
  const [jantina, setJantina] = useState<'LELAKI' | 'PEREMPUAN'>('LELAKI');
  const [programPengajian, setProgramPengajian] = useState<string>('SIJIL KULINARI');
  const [semester, setSemester] = useState<string>('1');

  // Ratings State (Default 4 - Memuaskan)
  const [scores, setScores] = useState<Record<string, number>>({
    bilikKuliah: 4,
    immersiveCentre: 4,
    dewanKuliah: 4,
    makmalKomputer: 4,
    perpustakaan: 4,
    kafe: 4,
    kemudahanSokongan: 4,
    bengkelDapur: 4,
    wifi: 4,
  });

  const [kemudahanPenambahbaikan, setKemudahanPenambahbaikan] = useState<string>('WIFI');
  const [cadangan, setCadangan] = useState<string>('');
  
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedSurvey, setSubmittedSurvey] = useState<StudentSurveyItem | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleScoreChange = (dimensionKey: string, score: number) => {
    setScores((prev) => ({
      ...prev,
      [dimensionKey]: score,
    }));
  };

  const calculateOverallAverage = () => {
    const vals = Object.values(scores);
    const sum = vals.reduce((a, b) => a + b, 0);
    return Number((sum / vals.length).toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const purata = calculateOverallAverage();
    const currentYear = new Date().getFullYear();
    const now = new Date();
    const timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${now.toLocaleTimeString('en-US')} GMT+8`;

    const surveyPayload = {
      jantina,
      programPengajian,
      semester,
      scores: {
        bilikKuliah: scores.bilikKuliah || 4,
        immersiveCentre: scores.immersiveCentre || 4,
        dewanKuliah: scores.dewanKuliah || 4,
        makmalKomputer: scores.makmalKomputer || 4,
        perpustakaan: scores.perpustakaan || 4,
        kafe: scores.kafe || 4,
        kemudahanSokongan: scores.kemudahanSokongan || 4,
        bengkelDapur: scores.bengkelDapur || 4,
        wifi: scores.wifi || 4,
        purataKeseluruhan: purata,
      },
      kemudahanPenambahbaikan,
      cadangan: cadangan.trim() || '-',
    };

    let generatedItem: StudentSurveyItem = {
      id: `SURVEY-${currentYear}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp,
      year: currentYear,
      jantina,
      programPengajian,
      semester,
      scores: {
        bilikKuliah: scores.bilikKuliah || 4,
        immersiveCentre: scores.immersiveCentre || 4,
        dewanKuliah: scores.dewanKuliah || 4,
        makmalKomputer: scores.makmalKomputer || 4,
        perpustakaan: scores.perpustakaan || 4,
        kafe: scores.kafe || 4,
        kemudahanSokongan: scores.kemudahanSokongan || 4,
        bengkelDapur: scores.bengkelDapur || 4,
        wifi: scores.wifi || 4,
        purataKeseluruhan: purata,
      },
      kemudahanPenambahbaikan,
      cadangan: cadangan.trim() || '-',
    };

    try {
      const response = await fetch('/api/student-survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyPayload),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.survey) {
          generatedItem = data.survey;
        }
      }
    } catch {
      // Fallback to client-side storage if offline or running in mock mode
    }

    // Persist to local storage to ensure stats immediately reflect in client
    saveCustomStudentSurvey(generatedItem);

    setIsSubmitting(false);
    setSubmittedSurvey(generatedItem);
    if (onSuccess) {
      onSuccess(generatedItem);
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
        <div className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-3xl p-8 sm:p-12 shadow-2xl text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-3xl shadow-lg shadow-emerald-500/30 mb-6 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
            Terima Kasih Atas Maklum Balas Anda!
          </h2>
          <p className="text-slate-600 max-w-lg mx-auto mb-6 text-sm sm:text-base leading-relaxed">
            Maklum balas anda bagi <span className="font-bold text-slate-900">{submittedSurvey.programPengajian}</span> (Semester {submittedSurvey.semester}) telah direkodkan ke dalam Sistem Statistik Kepuasan Pelajar KKBS.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-xs font-mono font-bold text-slate-700 mb-8 border border-slate-200">
            <span>ID Respon:</span>
            <span className="text-blue-600 font-extrabold">{submittedSurvey.id}</span>
          </div>

          {/* Rating Summary Card */}
          <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 max-w-lg mx-auto mb-8 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Purata Skor Diberikan</span>
              <div className="flex items-center gap-1 text-emerald-600 font-extrabold text-lg">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{submittedSurvey.scores.purataKeseluruhan} / 5.00</span>
              </div>
            </div>
            <div className="pt-4 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Kemudahan Keutamaan Segera:</span>
                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                  {submittedSurvey.kemudahanPenambahbaikan}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Cadangan:</span>
                <span className="font-medium text-slate-800 text-right max-w-[240px] truncate">
                  {submittedSurvey.cadangan}
                </span>
              </div>
            </div>
          </div>

          {/* Share with peers */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
              {copiedLink ? 'Pautan Disalin!' : 'Kongsi Borang Kepada Rakan'}
            </button>

            <button
              type="button"
              onClick={() => {
                setSubmittedSurvey(null);
                setScores({
                  bilikKuliah: 4,
                  immersiveCentre: 4,
                  dewanKuliah: 4,
                  makmalKomputer: 4,
                  perpustakaan: 4,
                  kafe: 4,
                  kemudahanSokongan: 4,
                  bengkelDapur: 4,
                  wifi: 4,
                });
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
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-200 border border-white/15 mb-4">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            Borang Maklum Balas Rasmi Kolej Komuniti Bandar Penawar
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
            Soal Selidik Kepuasan Pelajar Terhadap Fasiliti & Kemudahan KKBS
          </h1>
          <p className="text-blue-100/90 text-sm sm:text-base max-w-2xl leading-relaxed">
            Suara anda membentuk masa depan kolej. Sila berikan penilaian jujur bagi membantu pihak pengurusan mempertingkatkan kualiti prasarana pembelajaran dan kebajikan pelajar.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl backdrop-blur-md border border-white/20 transition-all"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-300" />}
              {copiedLink ? 'Pautan Borang Disalin!' : 'Salin Pautan Soal Selidik'}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: DEMOGRAFI */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-200/80">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
              1
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Maklumat Responden</h2>
              <p className="text-xs text-slate-500">Pilih program dan semester pengajian anda</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Jantina */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Jantina <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setJantina('LELAKI')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border ${
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
                  className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border ${
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
                className="w-full py-3 px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-xs"
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
                className="w-full py-3 px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-xs"
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

        {/* SECTION 2: PENILAIAN FASILITI & KEMUDAHAN */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-200/80 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
                2
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Penilaian Fasiliti & Kemudahan</h2>
                <p className="text-xs text-slate-500">Skala 1 (Sangat Lemah) hingga 5 (Sangat Cemerlang)</p>
              </div>
            </div>

            {/* Live Average Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl">
              <span className="text-xs text-slate-600 font-semibold">Purata Penilaian:</span>
              <span className="text-sm font-black text-blue-700 flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {calculateOverallAverage()} / 5.0
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {RATING_DIMENSIONS.map((dim) => {
              const currentVal = scores[dim.key] || 4;
              const IconComp = dim.icon;
              const activeLabel = RATING_LABELS[currentVal];

              return (
                <div
                  key={dim.key}
                  className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/70 rounded-2xl p-4 sm:p-5 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Title & Desc */}
                    <div className="flex items-start gap-3.5 flex-1">
                      <div className={`p-2.5 rounded-xl ${dim.bg} ${dim.color} shrink-0 mt-0.5 shadow-xs`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-0.5">
                          {dim.title}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                          {dim.desc}
                        </p>
                      </div>
                    </div>

                    {/* Rating Scale Buttons 1-5 */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((num) => {
                          const isSelected = currentVal === num;
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => handleScoreChange(dim.key, num)}
                              className={`w-10 h-10 rounded-xl text-sm font-black transition-all flex items-center justify-center ${
                                isSelected
                                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {num}
                            </button>
                          );
                        })}
                      </div>

                      {/* Active Label Badge */}
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 ${activeLabel.color}`}>
                        <span>{activeLabel.emoji}</span>
                        <span>{activeLabel.text}</span>
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: KEPERLUAN SEGERA & CADANGAN */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-200/80">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
              3
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Keperluan Segera & Cadangan Penambahbaikan</h2>
              <p className="text-xs text-slate-500">Bantu kami mengetahui bahagian yang memerlukan tindakan segera</p>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Keperluan Segera Facility Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Kemudahan Yang Paling Memerlukan Penambahbaikan Segera <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {PRIORITY_FACILITIES.map((fac) => {
                  const isSelected = kemudahanPenambahbaikan === fac.id;
                  return (
                    <button
                      key={fac.id}
                      type="button"
                      onClick={() => setKemudahanPenambahbaikan(fac.id)}
                      className={`p-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center text-center gap-1.5 ${
                        isSelected
                          ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-sm ring-2 ring-rose-400'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-xl">{fac.icon}</span>
                      <span className="line-clamp-1">{fac.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cadangan Penambahbaikan Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Cadangan / Ulasan Tambahan Anda
              </label>
              <textarea
                rows={4}
                value={cadangan}
                onChange={(e) => setCadangan(e.target.value)}
                placeholder="Contoh: Kelajuan Wi-Fi di blok B perlu dinaik taraf, tambah pilihan menu berpatutan di kafeteria, baiki pintu tandas..."
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-xs resize-none"
              />
            </div>

          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
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
            className="w-full sm:w-auto flex-1 sm:flex-none sm:min-w-[260px] inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-blue-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Menghantar Soal Selidik...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Hantar Maklum Balas Soal Selidik</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
