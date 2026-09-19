import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Download,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertTriangle,
  Star,
  Users,
  Calendar,
  MessageSquare,
  Sparkles,
  X,
  Filter,
  Eye,
  Copy,
  Check,
  Share2,
  QrCode,
  ExternalLink,
  Link as LinkIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import * as XLSX from 'xlsx';
import {
  getProcessedStudentSurveys,
  StudentSurveyItem,
  SURVEY_QUESTIONS_LIST,
} from '../data/studentSatisfactionData';
import { StudentSurveyForm } from './StudentSurveyForm';

interface AdminStudentSatisfactionProps {
  // Props if needed
}

export const AdminStudentSatisfaction: React.FC<AdminStudentSatisfactionProps> = () => {
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedProgram, setSelectedProgram] = useState<string>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [selectedFacilityFilter, setSelectedFacilityFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);
  const [surveysFromApi, setSurveysFromApi] = useState<StudentSurveyItem[] | null>(null);

  // Fetch live surveys on mount
  React.useEffect(() => {
    fetch('/api/student-survey')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.surveys)) {
          setSurveysFromApi(data.surveys);
        }
      })
      .catch(() => {
        // Fallback to local
      });
  }, []);

  // All survey items
  const allSurveys: StudentSurveyItem[] = useMemo(() => {
    if (surveysFromApi && surveysFromApi.length > 0) {
      return surveysFromApi;
    }
    return getProcessedStudentSurveys();
  }, [surveysFromApi]);

  // Filtered surveys by Year, Program, Semester, Search
  const baseFilteredSurveys = useMemo(() => {
    return allSurveys.filter((item) => {
      if (selectedYear !== 'ALL' && item.year.toString() !== selectedYear) return false;
      if (selectedProgram !== 'ALL' && item.programPengajian !== selectedProgram) return false;
      if (selectedSemester !== 'ALL' && item.semester !== selectedSemester) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchText =
          item.programPengajian.toLowerCase().includes(q) ||
          item.kemudahanPenambahbaikan.toLowerCase().includes(q) ||
          item.cadangan.toLowerCase().includes(q) ||
          item.jantina.toLowerCase().includes(q);
        if (!matchText) return false;
      }
      return true;
    });
  }, [allSurveys, selectedYear, selectedProgram, selectedSemester, searchQuery]);

  // Specific filtered list for the Suggestions Table (applying selectedFacilityFilter if active)
  const tableSurveys = useMemo(() => {
    if (!selectedFacilityFilter) return baseFilteredSurveys;
    return baseFilteredSurveys.filter(
      (s) => s.kemudahanPenambahbaikan.trim().toUpperCase() === selectedFacilityFilter.trim().toUpperCase()
    );
  }, [baseFilteredSurveys, selectedFacilityFilter]);

  // Aggregate Metrics calculation
  const totalResponden = baseFilteredSurveys.length;
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  const overallAvgScore = useMemo(() => {
    if (!totalResponden) return 0;
    return Number(avg(baseFilteredSurveys.map((s) => s.scores.purataKeseluruhan)).toFixed(2));
  }, [baseFilteredSurveys, totalResponden]);

  const overallPercentage = useMemo(() => {
    return Number(((overallAvgScore / 5) * 100).toFixed(1));
  }, [overallAvgScore]);

  // Gender Demographics
  const genderBreakdown = useMemo(() => {
    const lelaki = baseFilteredSurveys.filter((s) => s.jantina === 'LELAKI').length;
    const perempuan = baseFilteredSurveys.filter((s) => s.jantina === 'PEREMPUAN').length;
    return { lelaki, perempuan };
  }, [baseFilteredSurveys]);

  // Dimension Averages Chart Data
  const dimensionChartData = useMemo(() => {
    if (!totalResponden) return [];
    return [
      { name: 'Bilik Kuliah', score: Number(avg(baseFilteredSurveys.map((s) => s.scores.bilikKuliah)).toFixed(2)) },
      { name: 'Perpustakaan', score: Number(avg(baseFilteredSurveys.map((s) => s.scores.perpustakaan)).toFixed(2)) },
      { name: 'Bengkel Amali', score: Number(avg(baseFilteredSurveys.map((s) => s.scores.bengkelAmali ?? s.scores.bengkelDapur ?? 4)).toFixed(2)) },
      { name: 'Makmal Komputer', score: Number(avg(baseFilteredSurveys.map((s) => s.scores.makmalKomputer)).toFixed(2)) },
      { name: 'Dewan Kuliah', score: Number(avg(baseFilteredSurveys.map((s) => s.scores.dewanKuliah)).toFixed(2)) },
      { name: 'Immersive Centre', score: Number(avg(baseFilteredSurveys.map((s) => s.scores.immersiveCentre)).toFixed(2)) },
      { name: 'Kemudahan Sokongan', score: Number(avg(baseFilteredSurveys.map((s) => s.scores.kemudahanSokongan)).toFixed(2)) },
      { name: 'E-Tech Centre', score: Number(avg(baseFilteredSurveys.map((s) => s.scores.eTechCentre ?? s.scores.kafe ?? 4)).toFixed(2)) },
      { name: 'Capaian WiFi', score: Number(avg(baseFilteredSurveys.map((s) => s.scores.wifi)).toFixed(2)) },
    ].sort((a, b) => b.score - a.score);
  }, [baseFilteredSurveys, totalResponden]);

  // Priority Facilities Breakdown Chart Data
  const priorityChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of baseFilteredSurveys) {
      const key = (item.kemudahanPenambahbaikan === 'KAFE' ? 'E-TECH CENTRE' : item.kemudahanPenambahbaikan) || 'LAIN-LAIN';
      counts[key] = (counts[key] || 0) + 1;
    }
    const colors = ['#0284c7', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4'];
    return Object.entries(counts)
      .map(([name, count], index) => ({
        name,
        count,
        percent: totalResponden ? Math.round((count / totalResponden) * 100) : 0,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [baseFilteredSurveys, totalResponden]);

  // Toggle facility filter when user clicks facility badge or pie chart
  const handleFacilityClick = (facilityName: string) => {
    if (selectedFacilityFilter === facilityName) {
      setSelectedFacilityFilter(null); // toggle off
    } else {
      setSelectedFacilityFilter(facilityName);
      // Smooth scroll to suggestions section
      const el = document.getElementById('section-cadangan-pelajar');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Export to native .xlsx format using SheetJS (xlsx) with 3 rich sheets
  const handleExportXLSX = () => {
    setIsExporting(true);
    try {
      // 1. Executive Summary Sheet
      const summaryData = [
        ['LAPORAN STATISTIK KEPUASAN PELAJAR - SiAP (KOLEJ KOMUNITI BANDAR PENAWAR)'],
        ['Tarikh Laporan Dihasilkan', new Date().toLocaleString('ms-MY')],
        ['Tahun Tapisan', selectedYear === 'ALL' ? 'Semua Tahun' : selectedYear],
        ['Program Pengajian', selectedProgram === 'ALL' ? 'Semua Program' : selectedProgram],
        ['Semester', selectedSemester === 'ALL' ? 'Semua Semester' : selectedSemester],
        ['Jumlah Responden', totalResponden],
        ['Purata Skor Keseluruhan', `${overallAvgScore} / 5.0 (${overallPercentage}%)`],
        ['Responden Lelaki', genderBreakdown.lelaki],
        ['Responden Perempuan', genderBreakdown.perempuan],
        [],
        ['KATEGORI KEMUDAHAN', 'PURATA SKOR (/5.0)', 'PERATUSAN KEPUASAN (%)'],
        ...dimensionChartData.map((d) => [d.name, d.score, `${((d.score / 5) * 100).toFixed(1)}%`]),
        [],
        ['ISU / KEMUDAHAN PERLU TINDAKAN SEGERA', 'BILANGAN PELAJAR', 'PERATUSAN (%)'],
        ...priorityChartData.map((p) => [p.name, p.count, `${p.percent}%`]),
      ];

      // 2. Category Level Data Sheet
      const categorySheetData = [
        [
          'ID',
          'Tarikh & Masa',
          'Tahun',
          'Jantina',
          'Program Pengajian',
          'Semester',
          'Skor Bilik Kuliah 1 & 2 (/5)',
          'Skor Immersive Centre (/5)',
          'Skor Dewan Kuliah (/5)',
          'Skor Makmal Komputer (/5)',
          'Skor Perpustakaan (/5)',
          'Skor E-Tech Centre (/5)',
          'Skor Kemudahan Sokongan (/5)',
          'Skor Bengkel Amali (/5)',
          'Skor WiFi (/5)',
          'Purata Skor Keseluruhan (/5)',
          'Kemudahan Perlu Penambahbaikan Segera',
          'Cadangan Penambahbaikan / Catatan',
        ],
        ...baseFilteredSurveys.map((s) => [
          s.id,
          s.timestamp,
          s.year,
          s.jantina,
          s.programPengajian,
          s.semester,
          s.scores.bilikKuliah,
          s.scores.immersiveCentre,
          s.scores.dewanKuliah,
          s.scores.makmalKomputer,
          s.scores.perpustakaan,
          s.scores.eTechCentre ?? s.scores.kafe ?? 4,
          s.scores.kemudahanSokongan,
          s.scores.bengkelAmali ?? s.scores.bengkelDapur ?? 4,
          s.scores.wifi,
          s.scores.purataKeseluruhan,
          s.kemudahanPenambahbaikan === 'KAFE' ? 'E-TECH CENTRE' : s.kemudahanPenambahbaikan,
          s.cadangan,
        ]),
      ];

      // 3. Complete 56 Questions Detailed Raw Sheet
      const questionHeaders = [
        'ID',
        'Tarikh & Masa',
        'Tahun',
        'Jantina',
        'Program Pengajian',
        'Semester',
        'Kemudahan Perlu Penambahbaikan Segera',
        ...SURVEY_QUESTIONS_LIST.map(
          (q) => `[Q${q.id + 1} - ${q.sectionTitle}] ${q.text}`
        ),
        'Purata Skor Keseluruhan (/5)',
        'Cadangan Penambahbaikan / Catatan',
      ];

      const questionRows = baseFilteredSurveys.map((s) => {
        const rawScores = Array.isArray(s.rawScores) && s.rawScores.length === 56
          ? s.rawScores
          : SURVEY_QUESTIONS_LIST.map((q) => {
              // Fallback to category average if raw item not available
              if (q.sectionId === 'bilikKuliah1' || q.sectionId === 'bilikKuliah2') return s.scores.bilikKuliah;
              if (q.sectionId === 'immersive') return s.scores.immersiveCentre;
              if (q.sectionId === 'dewanKuliah') return s.scores.dewanKuliah;
              if (q.sectionId === 'makmalKomputer') return s.scores.makmalKomputer;
              if (q.sectionId === 'perpustakaan') return s.scores.perpustakaan;
              if (q.sectionId === 'kafe') return s.scores.eTechCentre ?? s.scores.kafe;
              if (q.sectionId === 'kemudahanSokongan') return s.scores.kemudahanSokongan;
              if (q.sectionId === 'bengkelDapur') return s.scores.bengkelAmali ?? s.scores.bengkelDapur;
              return 4;
            });

        return [
          s.id,
          s.timestamp,
          s.year,
          s.jantina,
          s.programPengajian,
          s.semester,
          s.kemudahanPenambahbaikan === 'KAFE' ? 'E-TECH CENTRE' : s.kemudahanPenambahbaikan,
          ...rawScores,
          s.scores.purataKeseluruhan,
          s.cadangan,
        ];
      });

      const detailedSheetData = [questionHeaders, ...questionRows];

      const wb = XLSX.utils.book_new();

      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      const wsCategory = XLSX.utils.aoa_to_sheet(categorySheetData);
      const wsDetailed = XLSX.utils.aoa_to_sheet(detailedSheetData);

      // Set column widths for readability
      wsSummary['!cols'] = [{ wch: 45 }, { wch: 25 }, { wch: 25 }];

      wsCategory['!cols'] = [
        { wch: 16 }, // ID
        { wch: 28 }, // Timestamp
        { wch: 8 },  // Year
        { wch: 12 }, // Jantina
        { wch: 30 }, // Program
        { wch: 14 }, // Semester
        { wch: 24 }, // Bilik Kuliah
        { wch: 24 }, // Immersive Centre
        { wch: 22 }, // Dewan Kuliah
        { wch: 24 }, // Makmal Komputer
        { wch: 22 }, // Perpustakaan
        { wch: 22 }, // E-Tech Centre
        { wch: 26 }, // Kemudahan Sokongan
        { wch: 24 }, // Bengkel Amali
        { wch: 16 }, // WiFi
        { wch: 26 }, // Overall
        { wch: 34 }, // Priority Issue
        { wch: 60 }, // Cadangan
      ];

      // Column widths for detailed 56 questions sheet
      wsDetailed['!cols'] = [
        { wch: 16 }, // ID
        { wch: 28 }, // Timestamp
        { wch: 8 },  // Year
        { wch: 12 }, // Jantina
        { wch: 30 }, // Program
        { wch: 14 }, // Semester
        { wch: 32 }, // Kemudahan Segera
        ...SURVEY_QUESTIONS_LIST.map(() => ({ wch: 22 })),
        { wch: 26 }, // Purata
        { wch: 60 }, // Cadangan
      ];

      XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Eksekutif');
      XLSX.utils.book_append_sheet(wb, wsCategory, 'Data Kategori & Cadangan');
      XLSX.utils.book_append_sheet(wb, wsDetailed, 'Skor Lengkap 56 Soalan');

      const yearStr = selectedYear === 'ALL' ? 'Semua_Tahun' : `Tahun_${selectedYear}`;
      const fileName = `SiAP_Statistik_Kepuasan_Pelajar_${yearStr}_${new Date().toISOString().substring(0, 10)}.xlsx`;

      XLSX.writeFile(wb, fileName);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const getShareableUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${window.location.pathname}?tab=soalselidik`;
    }
    return 'https://siapkkbs.sudin.my/?tab=soalselidik';
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(getShareableUrl());
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 3000);
  };

  return (
    <div className="space-y-8">
      
      {/* 0. KAD PAUTAN KEPUASAN PELAJAR */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-700/50">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-blue-200 border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Pautan Kepuasan Pelajar
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Borang Soal Selidik Kepuasan Pelajar Digital
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
              Kongsikan pautan atau kod QR kepada pelajar KKBS untuk mendapatkan penilaian fasiliti, E-Tech Centre, Wi-Fi dan cadangan penambahbaikan secara terus.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
            <button
              id="btn-buka-soal-selidik"
              onClick={() => setIsSurveyModalOpen(true)}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Eye className="w-4 h-4 text-white" />
              <span>Buka Borang Soal Selidik</span>
            </button>

            <button
              id="btn-salin-pautan-survey"
              onClick={handleCopyShareLink}
              className="px-4 py-3 bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm rounded-xl backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              {linkCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-blue-200" />}
              <span>{linkCopied ? 'Pautan Disalin!' : 'Salin Pautan'}</span>
            </button>

            <button
              id="btn-qr-survey"
              onClick={() => setIsQrModalOpen(true)}
              className="px-3.5 py-3 bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm rounded-xl backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Papar Kod QR"
            >
              <QrCode className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Kod QR</span>
            </button>

            <a
              href={`https://wa.me/?text=${encodeURIComponent('Sila lengkapkan Borang Soal Selidik Kepuasan Pelajar KKBS di pautan ini: ' + getShareableUrl())}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer hover:scale-105"
              title="Kongsi ke WhatsApp"
            >
              <Share2 className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* 1. FILTER BAR & HEADER */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Statistik Kepuasan Pelajar
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Kajian Maklum Balas & Analisis Penilaian Kemudahan Pembelajaran Kolej
              </p>
            </div>
          </div>

          {/* Quick Active Record Tag */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200 shadow-xs">
              📊 {baseFilteredSurveys.length} Responden Dipaparkan
            </span>
          </div>
        </div>

        {/* Filters Row: Tahun Dropdown, Program Dropdown, Semester Dropdown, Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          
          {/* Dropdown Tahun */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Tahun
            </label>
            <select
              id="filter-tahun-select"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedFacilityFilter(null);
              }}
              className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white/95 border border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs cursor-pointer"
            >
              <option value="ALL">Semua Tahun</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          {/* Dropdown Program */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Program Pengajian
            </label>
            <select
              value={selectedProgram}
              onChange={(e) => {
                setSelectedProgram(e.target.value);
                setSelectedFacilityFilter(null);
              }}
              className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-white/95 border border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs cursor-pointer"
            >
              <option value="ALL">Semua Program Pengajian</option>
              <option value="SIJIL KULINARI">Sijil Kulinari</option>
              <option value="SIJIL TEKNOLOGI ELEKTRIK">Sijil Teknologi Elektrik</option>
              <option value="SIJIL OPERASI PERHOTELAN">Sijil Operasi Perhotelan</option>
            </select>
          </div>

          {/* Dropdown Semester */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Semester Pengajian
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value);
                setSelectedFacilityFilter(null);
              }}
              className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-white/95 border border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs cursor-pointer"
            >
              <option value="ALL">Semua Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4 (LATIHAN INDUSTRI)">Semester 4 (Latihan Industri)</option>
            </select>
          </div>

          {/* Carian Kata Kunci */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Carian Kata Kunci / Isu
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="cth: wifi, e-tech centre, tandas, surau..."
                className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-900 bg-white/95 border border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
              />
            </div>
          </div>

        </div>
      </div>

      {/* 2. KAD MUAT TURUN LAPORAN FORMAT [.XLSX] (EXCEL DOWNLOAD CARD) */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-emerald-500/40">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-500/30">
                  Format Asli .xlsx (SheetJS)
                </span>
                {selectedYear !== 'ALL' && (
                  <span className="text-xs font-bold text-amber-300 bg-amber-950/85 px-2 py-0.5 rounded-md border border-amber-500/30">
                    Tahun {selectedYear}
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Muat Turun Laporan Statistik Kepuasan Pelajar (.xlsx)
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Jana dan muat turun fail Excel lengkap mengandungi Ringkasan Eksekutif, Purata Kategori, serta Skor Terperinci Kesemua 56 Soalan Penilaian mengikut tapisan semasa.
              </p>
            </div>
          </div>

          <button
            id="btn-muat-turun-laporan-excel"
            onClick={handleExportXLSX}
            disabled={isExporting || totalResponden === 0}
            className={`px-6 py-4 rounded-2xl font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer shrink-0 ${
              exportSuccess
                ? 'bg-emerald-500 text-white shadow-emerald-500/40'
                : totalResponden === 0
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/30 hover:scale-105 active:scale-95'
            }`}
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Menjana Fail .xlsx...</span>
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
                <span>Fail .xlsx Berjaya Dimuat Turun!</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 text-white" />
                <span>Muat Turun Laporan (.xlsx)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. METRIK UTAMA (KPI CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Responden */}
        <div className="glass-card p-6 rounded-3xl border border-white/80 shadow-md">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
            <span>JUMLAH RESPONDEN</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-200 text-blue-600 flex items-center justify-center">
              👥
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900">
            {totalResponden}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">
            Pelajar ({genderBreakdown.lelaki} Lelaki • {genderBreakdown.perempuan} Perempuan)
          </p>
        </div>

        {/* Overall Satisfaction Score */}
        <div className="glass-card p-6 rounded-3xl border border-white/80 shadow-md">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
            <span>INDEKS KEPUASAN KESELURUHAN</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-200 text-amber-600 flex items-center justify-center">
              ⭐
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-blue-600">{overallAvgScore}</span>
            <span className="text-sm font-bold text-slate-400">/ 5.0</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">
            {overallPercentage}% Tahap Kepuasan Tinggi 🤩
          </p>
        </div>

        {/* Top Priority Improvement */}
        <div
          onClick={() => priorityChartData[0] && handleFacilityClick(priorityChartData[0].name)}
          className={`glass-card p-6 rounded-3xl border shadow-md cursor-pointer transition-all ${
            selectedFacilityFilter === priorityChartData[0]?.name
              ? 'ring-2 ring-rose-500 bg-rose-50/70 border-rose-400 scale-102'
              : 'border-rose-200/70 bg-rose-50/30 hover:bg-rose-50/50'
          }`}
          title="Klik untuk menapis cadangan berkaitan isu ini"
        >
          <div className="flex items-center justify-between text-xs font-bold text-rose-700 mb-2">
            <span>ISU KEUTAMAAN #1 (KLIK TAPIS)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-200 text-rose-600 flex items-center justify-center">
              ⚠️
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 flex items-center justify-between">
            <span>{priorityChartData[0]?.name || 'WIFI'}</span>
            <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
              {priorityChartData[0]?.count || 0} Undian
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1 font-medium">
            {priorityChartData[0]?.percent || 0}% responden memohon penambahbaikan
          </p>
        </div>

        {/* Secondary Priority Improvement */}
        <div
          onClick={() => priorityChartData[1] && handleFacilityClick(priorityChartData[1].name)}
          className={`glass-card p-6 rounded-3xl border shadow-md cursor-pointer transition-all ${
            selectedFacilityFilter === priorityChartData[1]?.name
              ? 'ring-2 ring-amber-500 bg-amber-50/70 border-amber-400 scale-102'
              : 'border-amber-200/70 bg-amber-50/30 hover:bg-amber-50/50'
          }`}
          title="Klik untuk menapis cadangan berkaitan isu ini"
        >
          <div className="flex items-center justify-between text-xs font-bold text-amber-800 mb-2">
            <span>ISU KEUTAMAAN #2 (KLIK TAPIS)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-200 text-amber-600 flex items-center justify-center">
              ☕
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 flex items-center justify-between">
            <span>{priorityChartData[1]?.name || 'E-TECH CENTRE'}</span>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              {priorityChartData[1]?.count || 0} Undian
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1 font-medium">
            {priorityChartData[1]?.percent || 0}% responden memohon penambahbaikan
          </p>
        </div>

      </div>

      {/* 4. CARTA VISUAL ANALITIK (RECHARTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Skor Purata Mengikut Dimensi Kemudahan */}
        <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-3xl border border-white/80 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-blue-600" />
                  <span>Purata Skor Mengikut Kategori Kemudahan (/5.0)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Penilaian tertinggi: Bilik Kuliah & Perpustakaan • Perlu perhatian: E-Tech Centre & WiFi
                </p>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dimensionChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 5]} tickCount={6} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} width={120} />
                  <Tooltip
                    formatter={(val: any) => [`${val} / 5.0 (${((val / 5) * 100).toFixed(0)}%)`, 'Skor']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="score" fill="#3b82f6" radius={[0, 8, 8, 0]}>
                    {dimensionChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.score >= 4.4 ? '#3b82f6' : entry.score >= 4.0 ? '#0ea5e9' : entry.score >= 3.5 ? '#f59e0b' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Sangat Tinggi (≥ 4.4)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Baik (4.0 - 4.3)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Sederhana (&lt; 4.0)</span>
          </div>
        </div>

        {/* Chart 2: Keperluan Penambahbaikan Segera (Pie Chart) */}
        <div className="lg:col-span-5 glass-card p-6 sm:p-8 rounded-3xl border border-white/80 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-rose-600" />
                  <span>Kemudahan Perlu Penambahbaikan Segera</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Peratusan maklum balas mengikut fasiliti yang paling kritikal
                </p>
              </div>
            </div>

            <div className="h-56 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    onClick={(data) => handleFacilityClick(data.name)}
                    className="cursor-pointer"
                  >
                    {priorityChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke={selectedFacilityFilter === entry.name ? '#000' : 'none'}
                        strokeWidth={selectedFacilityFilter === entry.name ? 2 : 0}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} pelajar (${priorityChartData.find((p) => p.name === name)?.percent || 0}%)`, name]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl sm:text-2xl font-black text-slate-900">{totalResponden}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Responden</span>
              </div>
            </div>
          </div>

          {/* Dynamic Clickable Badges Legend */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 justify-center">
            {priorityChartData.slice(0, 5).map((p) => {
              const isSelected = selectedFacilityFilter === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => handleFacilityClick(p.name)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-blue-400/40 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                  title={`Klik untuk tapis cadangan ${p.name}`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>{p.name} ({p.count})</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 5. SENARAI MAKLUM BALAS & CADANGAN PELAJAR */}
      <div id="section-cadangan-pelajar" className="glass-card p-6 sm:p-8 rounded-3xl border border-white/80 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  Senarai Maklum Balas & Cadangan Pelajar
                </h3>
                {selectedFacilityFilter && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 text-xs font-black border border-blue-200">
                    <span>Tapis: {selectedFacilityFilter}</span>
                    <button
                      onClick={() => setSelectedFacilityFilter(null)}
                      className="hover:text-rose-600 ml-1 text-slate-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Memaparkan keperluan segera dan cadangan penambahbaikan terbuka daripada pelajar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
              {tableSurveys.length} Rekod Maklum Balas
            </span>
          </div>
        </div>

        {/* Suggestions Table with 2 columns */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6 w-1/3">Keperluan Segera</th>
                <th className="py-3.5 px-6 w-2/3">Cadangan Penambahbaikan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {tableSurveys.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-12 text-center text-slate-400">
                    <p className="font-bold text-sm text-slate-600">Tiada cadangan maklum balas dijumpai</p>
                    <p className="text-xs mt-1">Cuba ubah tapisan tahun, program atau perkataan carian anda.</p>
                    {selectedFacilityFilter && (
                      <button
                        onClick={() => setSelectedFacilityFilter(null)}
                        className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all cursor-pointer"
                      >
                        Klik di sini untuk memaparkan semua cadangan
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                tableSurveys.map((survey) => {
                  const isCurrentFilter = selectedFacilityFilter === survey.kemudahanPenambahbaikan;
                  return (
                    <tr key={survey.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 align-top">
                        <button
                          onClick={() => handleFacilityClick(survey.kemudahanPenambahbaikan)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs ${
                            isCurrentFilter
                              ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-400/40'
                              : survey.kemudahanPenambahbaikan === 'WIFI'
                              ? 'bg-sky-100 text-sky-900 border-sky-300 hover:bg-sky-200'
                              : survey.kemudahanPenambahbaikan === 'E-TECH CENTRE'
                              ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                              : survey.kemudahanPenambahbaikan === 'TANDAS'
                              ? 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200'
                              : 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200'
                          }`}
                          title={`Klik untuk tapis cadangan ${survey.kemudahanPenambahbaikan}`}
                        >
                          <span>{survey.kemudahanPenambahbaikan}</span>
                        </button>
                        <div className="text-[10px] text-slate-400 mt-1 font-medium">
                          {survey.programPengajian.replace('SIJIL ', '')} • Sem {survey.semester} ({survey.year})
                        </div>
                      </td>
                      <td className="py-4 px-6 align-top">
                        <div className="text-slate-800 text-xs sm:text-sm leading-relaxed font-medium">
                          {survey.cadangan === '-' || survey.cadangan === '.' || !survey.cadangan ? (
                            <span className="text-slate-400 italic font-normal">
                              Tiada catatan tambahan diberikan
                            </span>
                          ) : (
                            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
                              "{survey.cadangan}"
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* MODAL PRATONTON / BUKA BORANG SOAL SELIDIK */}
      {isSurveyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-50 rounded-3xl shadow-2xl border border-white my-auto p-4 sm:p-6">
            
            {/* Modal Header bar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pratonton Borang Soal Selidik Pelajar
                </span>
              </div>
              <button
                onClick={() => setIsSurveyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <StudentSurveyForm
              onSuccess={() => {
                // Refresh surveys locally if needed
              }}
              onCancel={() => setIsSurveyModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* MODAL KOD QR SOAL SELIDIK */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-white p-6 sm:p-8 text-center space-y-5">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="inline-flex p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <QrCode className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">
                Kod QR Soal Selidik Pelajar
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Imbas untuk membuka borang soal selidik di telefon bimbit pelajar
              </p>
            </div>

            {/* QR Code Graphic */}
            <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getShareableUrl())}`}
                alt="QR Code Soal Selidik"
                className="w-48 h-48 rounded-xl shadow-xs"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCopyShareLink}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{linkCopied ? 'Pautan Disalin!' : 'Salin Pautan URL'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
