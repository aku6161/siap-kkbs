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
import { getProcessedStudentSurveys, StudentSurveyItem } from '../data/studentSatisfactionData';

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

  // All survey items
  const allSurveys: StudentSurveyItem[] = useMemo(() => {
    return getProcessedStudentSurveys();
  }, []);

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
      { name: 'Bengkel / Dapur', score: Number(avg(baseFilteredSurveys.map((s) => s.scores.bengkelDapur)).toFixed(2)) },
      { name: 'Makmal Komputer', score: Number(avg(baseFilteredSurveys.map((s) => s.scores.makmalKomputer)).toFixed(2)) },
      { name: 'Dewan Kuliah', score: Number(avg(baseFilteredSurveys.map((s) => s.scores.dewanKuliah)).toFixed(2)) },
      { name: 'Immersive Centre', score: Number(avg(baseFilteredSurveys.map((s) => s.scores.immersiveCentre)).toFixed(2)) },
      { name: 'Kemudahan Sokongan', score: Number(avg(baseFilteredSurveys.map((s) => s.scores.kemudahanSokongan)).toFixed(2)) },
      { name: 'Kafe', score: Number(avg(baseFilteredSurveys.map((s) => s.scores.kafe)).toFixed(2)) },
      { name: 'Capaian WiFi', score: Number(avg(baseFilteredSurveys.map((s) => s.scores.wifi)).toFixed(2)) },
    ].sort((a, b) => b.score - a.score);
  }, [baseFilteredSurveys, totalResponden]);

  // Priority Facilities Breakdown Chart Data
  const priorityChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of baseFilteredSurveys) {
      const key = item.kemudahanPenambahbaikan || 'LAIN-LAIN';
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

  // Export to native .xlsx format using SheetJS (xlsx)
  const handleExportXLSX = () => {
    setIsExporting(true);
    try {
      // 1. Data Sheet
      const sheetData = [
        [
          'ID',
          'Tarikh & Masa',
          'Tahun',
          'Jantina',
          'Program Pengajian',
          'Semester',
          'Skor Bilik Kuliah (/5)',
          'Skor Immersive Centre (/5)',
          'Skor Dewan Kuliah (/5)',
          'Skor Makmal Komputer (/5)',
          'Skor Perpustakaan (/5)',
          'Skor Kafe (/5)',
          'Skor Kemudahan Sokongan (/5)',
          'Skor Bengkel & Dapur (/5)',
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
          s.scores.kafe,
          s.scores.kemudahanSokongan,
          s.scores.bengkelDapur,
          s.scores.wifi,
          s.scores.purataKeseluruhan,
          s.kemudahanPenambahbaikan,
          s.cadangan,
        ]),
      ];

      // 2. Summary Sheet
      const summaryData = [
        ['LAPORAN STATISTIK KEPUASAN PELAJAR - SiAP'],
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

      const wb = XLSX.utils.book_new();

      const wsData = XLSX.utils.aoa_to_sheet(sheetData);
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);

      // Set column widths for readability
      wsData['!cols'] = [
        { wch: 16 }, // ID
        { wch: 28 }, // Timestamp
        { wch: 8 },  // Year
        { wch: 12 }, // Jantina
        { wch: 30 }, // Program
        { wch: 14 }, // Semester
        { wch: 22 }, // Bilik Kuliah
        { wch: 24 }, // Immersive Centre
        { wch: 22 }, // Dewan Kuliah
        { wch: 24 }, // Makmal Komputer
        { wch: 22 }, // Perpustakaan
        { wch: 16 }, // Kafe
        { wch: 26 }, // Kemudahan Sokongan
        { wch: 24 }, // Bengkel Dapur
        { wch: 16 }, // WiFi
        { wch: 26 }, // Overall
        { wch: 32 }, // Priority Issue
        { wch: 60 }, // Cadangan
      ];

      wsSummary['!cols'] = [{ wch: 45 }, { wch: 25 }, { wch: 25 }];

      XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Eksekutif');
      XLSX.utils.book_append_sheet(wb, wsData, 'Data Lengkap Pelajar');

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

  return (
    <div className="space-y-8">
      
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
                placeholder="cth: wifi, kafe, aircond..."
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
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/50">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/50">
                  Format [.xlsx] Excel Rasmi
                </span>
                <span className="text-xs text-emerald-200 font-semibold">
                  • {baseFilteredSurveys.length} Rekod Terkini
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Muat Turun Laporan Kepuasan Pelajar [.xlsx]
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Menjana fail Microsoft Excel (.xlsx) komprehensif mengandungi 2 helaian: <em>Ringkasan Eksekutif</em> (Analisis Dimensi & Isu) dan <em>Data Lengkap Pelajar</em> mengikut tahun dan tapisan semasa.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              id="btn-download-xlsx"
              onClick={handleExportXLSX}
              disabled={isExporting}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-emerald-200 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>{isExporting ? 'Menjana [.xlsx]...' : 'MUAT TURUN LAPORAN [.XLSX]'}</span>
            </button>
          </div>
        </div>

        {exportSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/60 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Laporan format [.xlsx] berjaya dijana dan dimuat turun!</span>
          </div>
        )}
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
            <span>{priorityChartData[1]?.name || 'KAFE'}</span>
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
                  Penilaian tertinggi: Bilik Kuliah & Perpustakaan • Perlu perhatian: Kafe & WiFi
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

        {/* Chart 2: Keperluan Penambahbaikan Segera (Interactive Pie & Click Filter) */}
        <div className="lg:col-span-5 glass-card p-6 sm:p-8 rounded-3xl border border-white/80 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Kemudahan Perlu Penambahbaikan Segera
              </h3>
              {selectedFacilityFilter && (
                <button
                  onClick={() => setSelectedFacilityFilter(null)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Papar Semua</span>
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Klik pada mana-mana item di bawah untuk menapis cadangan berkaitan
            </p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="count"
                    onClick={(data) => handleFacilityClick(data.name)}
                    cursor="pointer"
                  >
                    {priorityChartData.map((entry, index) => (
                      <Cell
                        key={`pie-cell-${index}`}
                        fill={entry.color}
                        stroke={selectedFacilityFilter === entry.name ? '#000' : '#fff'}
                        strokeWidth={selectedFacilityFilter === entry.name ? 2 : 1}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [`${val} Pelajar (${item.payload.percent}%) - Klik untuk tapis`, item.payload.name]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Interactive Facility Filter Buttons */}
            <div className="space-y-1.5 mt-2 max-h-36 overflow-y-auto pr-1 text-xs">
              {priorityChartData.map((p, idx) => {
                const isSelected = selectedFacilityFilter === p.name;
                return (
                  <button
                    key={idx}
                    onClick={() => handleFacilityClick(p.name)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: isSelected ? '#fff' : p.color }}
                      />
                      <span className="font-bold">{p.name}</span>
                    </div>
                    <span className="font-mono text-[11px]">
                      {p.count} undian ({p.percent}%)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* 5. SENARAI MAKLUM BALAS & CADANGAN PELAJAR (HANYA PAPAR [KEPERLUAN SEGERA] & [CADANGAN PENAMBAHBAIKAN]) */}
      <div id="section-cadangan-pelajar" className="glass-card rounded-3xl border border-white/80 shadow-xl overflow-hidden">
        
        <div className="p-6 border-b border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>Senarai Maklum Balas & Cadangan Pelajar</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hanya memaparkan <strong>Keperluan Segera</strong> dan <strong>Cadangan Penambahbaikan</strong> pelajar.
            </p>
          </div>

          {/* Active Filter Pill or Reset Indicator */}
          <div className="flex items-center gap-2">
            {selectedFacilityFilter ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20">
                <span>🎯 Menapis: {selectedFacilityFilter} ({tableSurveys.length} Cadangan)</span>
                <button
                  onClick={() => setSelectedFacilityFilter(null)}
                  className="hover:bg-white/20 p-1 rounded-md transition-colors cursor-pointer"
                  title="Batal tapisan & papar semua cadangan"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-xs font-bold text-slate-600 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
                Memaparkan Semua ({tableSurveys.length} Cadangan)
              </span>
            )}
          </div>
        </div>

        {/* Focused 2-Column Table: [Keperluan Segera] & [Cadangan Penambahbaikan] */}
        <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/90 sticky top-0 z-10 border-b border-slate-200 text-slate-700 font-black uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6 w-1/4 sm:w-1/5">Keperluan Segera</th>
                <th className="py-3.5 px-6 w-3/4 sm:w-4/5">Cadangan Penambahbaikan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {tableSurveys.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-sm">Tiada maklum balas dijumpai untuk kriteria ini.</p>
                    {selectedFacilityFilter && (
                      <button
                        onClick={() => setSelectedFacilityFilter(null)}
                        className="mt-2 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
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
                    <tr key={survey.id} className="hover:bg-blue-50/50 transition-colors">
                      
                      {/* Column 1: Keperluan Segera */}
                      <td className="py-4 px-6 align-top">
                        <button
                          onClick={() => handleFacilityClick(survey.kemudahanPenambahbaikan)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-xs ${
                            isCurrentFilter
                              ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-400/40'
                              : survey.kemudahanPenambahbaikan === 'WIFI'
                              ? 'bg-sky-100 text-sky-900 border-sky-300 hover:bg-sky-200'
                              : survey.kemudahanPenambahbaikan === 'KAFE'
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

                      {/* Column 2: Cadangan Penambahbaikan */}
                      <td className="py-4 px-6 align-top">
                        <div className="text-slate-800 text-xs sm:text-sm leading-relaxed font-medium">
                          {survey.cadangan === '-' || survey.cadangan === '.' || !survey.cadangan ? (
                            <span className="text-slate-400 italic font-normal">
                              Tiada catatan tambahan diberikan
                            </span>
                          ) : (
                            <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
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

    </div>
  );
};
