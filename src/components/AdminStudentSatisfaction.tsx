import React, { useState, useMemo, useEffect } from 'react';
import {
  GraduationCap,
  Download,
  Filter,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertTriangle,
  Star,
  Users,
  TrendingUp,
  Building,
  Wifi,
  Coffee,
  Wrench,
  BookOpen,
  Calendar,
  MessageSquare,
  Sparkles,
  RefreshCw,
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
import { getProcessedStudentSurveys, StudentSurveyItem } from '../data/studentSatisfactionData';

interface AdminStudentSatisfactionProps {
  // Optional props
}

export const AdminStudentSatisfaction: React.FC<AdminStudentSatisfactionProps> = () => {
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedProgram, setSelectedProgram] = useState<string>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // All survey items
  const allSurveys: StudentSurveyItem[] = useMemo(() => {
    return getProcessedStudentSurveys();
  }, []);

  // Filtered surveys
  const filteredSurveys = useMemo(() => {
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

  // Aggregate Metrics calculation
  const totalResponden = filteredSurveys.length;
  const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  const overallAvgScore = useMemo(() => {
    if (!totalResponden) return 0;
    return Number(avg(filteredSurveys.map((s) => s.scores.purataKeseluruhan)).toFixed(2));
  }, [filteredSurveys, totalResponden]);

  const overallPercentage = useMemo(() => {
    return Number(((overallAvgScore / 5) * 100).toFixed(1));
  }, [overallAvgScore]);

  // Gender Demographics
  const genderBreakdown = useMemo(() => {
    const lelaki = filteredSurveys.filter((s) => s.jantina === 'LELAKI').length;
    const perempuan = filteredSurveys.filter((s) => s.jantina === 'PEREMPUAN').length;
    return { lelaki, perempuan };
  }, [filteredSurveys]);

  // Dimension Averages Chart Data
  const dimensionChartData = useMemo(() => {
    if (!totalResponden) return [];
    return [
      { name: 'Bilik Kuliah', score: Number(avg(filteredSurveys.map((s) => s.scores.bilikKuliah)).toFixed(2)) },
      { name: 'Perpustakaan', score: Number(avg(filteredSurveys.map((s) => s.scores.perpustakaan)).toFixed(2)) },
      { name: 'Bengkel / Dapur', score: Number(avg(filteredSurveys.map((s) => s.scores.bengkelDapur)).toFixed(2)) },
      { name: 'Makmal Komputer', score: Number(avg(filteredSurveys.map((s) => s.scores.makmalKomputer)).toFixed(2)) },
      { name: 'Dewan Kuliah', score: Number(avg(filteredSurveys.map((s) => s.scores.dewanKuliah)).toFixed(2)) },
      { name: 'Immersive Centre', score: Number(avg(filteredSurveys.map((s) => s.scores.immersiveCentre)).toFixed(2)) },
      { name: 'Kemudahan Sokongan', score: Number(avg(filteredSurveys.map((s) => s.scores.kemudahanSokongan)).toFixed(2)) },
      { name: 'Kafe', score: Number(avg(filteredSurveys.map((s) => s.scores.kafe)).toFixed(2)) },
      { name: 'Capaian WiFi', score: Number(avg(filteredSurveys.map((s) => s.scores.wifi)).toFixed(2)) },
    ].sort((a, b) => b.score - a.score);
  }, [filteredSurveys, totalResponden]);

  // Priority Facilities Breakdown Chart Data
  const priorityChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of filteredSurveys) {
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
  }, [filteredSurveys, totalResponden]);

  // Program Breakdown Chart Data
  const programChartData = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    for (const item of filteredSurveys) {
      const prog = item.programPengajian;
      if (!map[prog]) map[prog] = { count: 0, total: 0 };
      map[prog].count += 1;
      map[prog].total += item.scores.purataKeseluruhan;
    }
    return Object.entries(map).map(([name, val]) => ({
      name: name.replace('SIJIL ', ''),
      fullName: name,
      count: val.count,
      score: Number((val.total / val.count).toFixed(2)),
    }));
  }, [filteredSurveys]);

  // Export to Excel / CSV format
  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      const headers = [
        'ID',
        'Timestamp',
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
      ];

      const rows = filteredSurveys.map((s) => [
        `"${s.id}"`,
        `"${s.timestamp}"`,
        `"${s.year}"`,
        `"${s.jantina}"`,
        `"${s.programPengajian}"`,
        `"${s.semester}"`,
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
        `"${s.kemudahanPenambahbaikan.replace(/"/g, '""')}"`,
        `"${s.cadangan.replace(/"/g, '""')}"`,
      ]);

      // Add UTF-8 BOM so MS Excel opens with perfect formatting & Malay accents
      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const yearStr = selectedYear === 'ALL' ? 'Semua-Tahun' : `Tahun-${selectedYear}`;
      link.href = url;
      link.setAttribute('download', `SiAP_Statistik_Kepuasan_Pelajar_${yearStr}_${new Date().toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

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

          {/* Year Filter Pills */}
          <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 backdrop-blur-md">
            <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Tahun:
            </span>
            {['ALL', '2025', '2026'].map((year) => {
              const isSelected = selectedYear === year;
              const count = year === 'ALL' 
                ? allSurveys.length 
                : allSurveys.filter((s) => s.year.toString() === year).length;

              return (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {year === 'ALL' ? 'Semua Tahun' : year} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Filters (Program & Semester) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Program Pengajian
            </label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-white/90 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
            >
              <option value="ALL">Semua Program Pengajian</option>
              <option value="SIJIL KULINARI">Sijil Kulinari</option>
              <option value="SIJIL TEKNOLOGI ELEKTRIK">Sijil Teknologi Elektrik</option>
              <option value="SIJIL OPERASI PERHOTELAN">Sijil Operasi Perhotelan</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Semester Pengajian
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 bg-white/90 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
            >
              <option value="ALL">Semua Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4 (LATIHAN INDUSTRI)">Semester 4 (Latihan Industri)</option>
            </select>
          </div>

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
                placeholder="cth: wifi, kafe, aircond, tandas..."
                className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-900 bg-white/90 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. KAD MUAT TURUN EXCEL (HIGHLIGHTED EXPORT CARD) */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-emerald-500/30">
        {/* Glow orb */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Eksport Pangkalan Data
                </span>
                <span className="text-xs text-emerald-200">
                  • {filteredSurveys.length} Rekod Tersedia
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Muat Turun Laporan Skor & Data Penuh Kepuasan Pelajar (Excel)
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Eksport lembaran data lengkap merangkumi 55 item soalan instrumen kepuasan, pecahan 9 dimensi kemudahan, demografi jantina, dan teks cadangan penambahbaikan pelajar.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-emerald-300/40 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>{isExporting ? 'Menjana Fail...' : 'MUAT TURUN EXCEL (.CSV)'}</span>
            </button>
          </div>
        </div>

        {exportSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/60 text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Fail Excel berjaya dimuat turun ke peranti anda!</span>
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
        <div className="glass-card p-6 rounded-3xl border border-rose-200/70 bg-rose-50/30 shadow-md">
          <div className="flex items-center justify-between text-xs font-bold text-rose-700 mb-2">
            <span>ISU PALING KERAP DITEGUR</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-200 text-rose-600 flex items-center justify-center">
              ⚠️
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600">
            {priorityChartData[0]?.name || 'WIFI'}
          </div>
          <p className="text-[11px] text-slate-600 mt-1 font-medium">
            {priorityChartData[0]?.count || 0} responden ({priorityChartData[0]?.percent || 0}%) mencadangkan tindakan
          </p>
        </div>

        {/* Secondary Priority Improvement */}
        <div className="glass-card p-6 rounded-3xl border border-amber-200/70 bg-amber-50/30 shadow-md">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800 mb-2">
            <span>ISU KEDUA TERBANYAK</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-200 text-amber-600 flex items-center justify-center">
              ☕
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700">
            {priorityChartData[1]?.name || 'KAFE'}
          </div>
          <p className="text-[11px] text-slate-600 mt-1 font-medium">
            {priorityChartData[1]?.count || 0} responden ({priorityChartData[1]?.percent || 0}%) memohon penambahbaikan
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

        {/* Chart 2: Keperluan Penambahbaikan Segera (Donut / Pie) */}
        <div className="lg:col-span-5 glass-card p-6 sm:p-8 rounded-3xl border border-white/80 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
              Pecahan Kemudahan Perlu Penambahbaikan Segera
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Berdasarkan undian pilihan utama pelajar
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [`${val} Pelajar (${item.payload.percent}%)`, item.payload.name]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* List breakdown */}
            <div className="space-y-2 mt-2 max-h-36 overflow-y-auto pr-1 text-xs">
              {priorityChartData.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="font-bold text-slate-800">{p.name}</span>
                  </div>
                  <span className="font-mono text-slate-600 font-bold">{p.count} undian ({p.percent}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 5. JADUAL DATA LENGKAP & CADANGAN PELAJAR */}
      <div className="glass-card rounded-3xl border border-white/80 shadow-xl overflow-hidden">
        
        <div className="p-6 border-b border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Senarai Maklum Balas & Cadangan Pelajar</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Menunjukkan {filteredSurveys.length} rekod respons daripada pangkalan data
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
              {selectedYear === 'ALL' ? 'Semua Tahun' : `Tahun ${selectedYear}`} • {filteredSurveys.length} Hasil
            </span>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/90 sticky top-0 z-10 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Tarikh & Masa</th>
                <th className="py-3 px-4">Jantina</th>
                <th className="py-3 px-4">Program & Semester</th>
                <th className="py-3 px-4">Skor Purata</th>
                <th className="py-3 px-4">Keperluan Segera</th>
                <th className="py-3 px-4 min-w-[280px]">Cadangan Penambahbaikan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredSurveys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Tiada data dijumpai untuk kriteria tapisan ini.
                  </td>
                </tr>
              ) : (
                filteredSurveys.map((survey) => (
                  <tr key={survey.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {survey.timestamp}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        survey.jantina === 'LELAKI' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {survey.jantina}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{survey.programPengajian}</div>
                      <div className="text-[10px] text-slate-500">Semester {survey.semester}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-lg font-mono font-black text-xs ${
                        survey.scores.purataKeseluruhan >= 4.5
                          ? 'bg-emerald-100 text-emerald-800'
                          : survey.scores.purataKeseluruhan >= 3.8
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {survey.scores.purataKeseluruhan} / 5
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        survey.kemudahanPenambahbaikan === 'WIFI'
                          ? 'bg-sky-50 text-sky-800 border-sky-200'
                          : survey.kemudahanPenambahbaikan === 'KAFE'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : survey.kemudahanPenambahbaikan === 'TANDAS'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        {survey.kemudahanPenambahbaikan}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-slate-700 italic leading-relaxed">
                        {survey.cadangan === '-' || survey.cadangan === '.' || !survey.cadangan ? (
                          <span className="text-slate-400 not-italic">Tiada catatan tambahan</span>
                        ) : (
                          `"${survey.cadangan}"`
                        )}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
