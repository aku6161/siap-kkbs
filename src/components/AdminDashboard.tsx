import React, { useEffect, useState } from 'react';
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
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  LayoutDashboard,
  ListOrdered,
  Bot,
  FileSpreadsheet,
  Mail,
  History,
  Lock,
  LogOut,
  Search,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Star,
  Users,
  Send,
  Calendar,
} from 'lucide-react';
import { CATEGORIES, STATUS_CONFIG } from '../data/categories';
import { Complaint, ComplaintCategory, ComplaintStatus, EmailLog, LogItem, SystemStats } from '../types';
import { AdminComplaintDetailModal } from './AdminComplaintDetailModal';
import { AdminSheetsSync } from './AdminSheetsSync';
import { AdminTelegramSimulator } from './AdminTelegramSimulator';

interface AdminDashboardProps {
  isAdminLoggedIn: boolean;
  onLogin: (token: string) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isAdminLoggedIn,
  onLogin,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'senarai' | 'telegram' | 'sheets' | 'audit'>('ringkasan');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data states
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<LogItem[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters for complaints list
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Selected complaint for modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [compRes, statsRes, logsRes, emailRes] = await Promise.all([
        fetch(`/api/admin/complaints?search=${encodeURIComponent(searchQuery)}&kategori=${selectedCategoryFilter}&status=${selectedStatusFilter}&startDate=${startDateFilter}&endDate=${endDateFilter}`),
        fetch('/api/admin/stats'),
        fetch('/api/admin/logs'),
        fetch('/api/admin/emails'),
      ]);

      const compData = await compRes.json();
      const statsData = await statsRes.json();
      const logsData = await logsRes.json();
      const emailData = await emailRes.json();

      if (compData.complaints) setComplaints(compData.complaints);
      if (statsData.stats) setStats(statsData.stats);
      if (statsData.categoryStats) setCategoryStats(statsData.categoryStats);
      if (statsData.monthlyTrends) setMonthlyTrends(statsData.monthlyTrends);
      if (Array.isArray(logsData)) setAuditLogs(logsData);
      if (Array.isArray(emailData)) setEmailLogs(emailData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchAdminData();
    }
  }, [isAdminLoggedIn, selectedCategoryFilter, selectedStatusFilter, startDateFilter, endDateFilter]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLogin(data.token);
      } else {
        setLoginError(data.error || 'Kata laluan tidak tepat.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Ralat sambungan.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAdminData();
  };

  // LOGIN SCREEN
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="glass-card rounded-3xl border border-white/80 shadow-2xl p-8 text-center">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <img
              src="https://lh3.googleusercontent.com/d/1wuY-0qy28C7QQrX6FAY9zTDyLhGP2drh"
              alt="Logo SiAP"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain drop-shadow-xl"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('uc?export=view')) {
                  target.src = 'https://drive.google.com/uc?export=view&id=1wuY-0qy28C7QQrX6FAY9zTDyLhGP2drh';
                }
              }}
            />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
            Log Masuk Pentadbir
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Sila masukkan kata laluan untuk mengakses Dashboard Pengurusan SiAP.
          </p>

          {loginError && (
            <div className="p-3.5 mb-4 rounded-2xl bg-red-50/80 backdrop-blur-md border border-red-200 text-red-700 text-xs font-semibold text-left shadow-xs">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <input
                id="admin-password-input"
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Kata Laluan Pentadbir (cth: admin)"
                className="w-full px-4 py-3 text-sm text-slate-900 glass-input rounded-xl focus:outline-none transition-all"
              />
            </div>

            <button
              id="btn-admin-login-submit"
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition-all cursor-pointer border border-white/20"
            >
              {isLoggingIn ? 'Mengesahkan...' : 'Log Masuk'}
            </button>
          </form>

          <p className="text-[11px] text-slate-400 mt-6 font-medium">
            Kata laluan lalai: <code className="bg-white/80 px-2 py-0.5 rounded-md border border-white font-mono text-slate-700 font-bold">admin</code>
          </p>
        </div>
      </div>
    );
  }

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#64748b'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header Bar - Frosted Glass */}
      <div className="glass-card rounded-3xl border border-white/80 shadow-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-amber-100/90 text-amber-900 font-bold text-xs border border-amber-200 shadow-xs">
              PENTADBIR SISTEM
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Akses Penuh Pengurusan & Pemantauan
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Dashboard SiAP
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAdminData}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 border border-white/80 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Muat Semula</span>
          </button>

          <button
            onClick={onLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-50/90 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Keluar</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('ringkasan')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'ringkasan'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-white/20'
              : 'bg-white/70 backdrop-blur-md text-slate-600 hover:bg-white border border-white/80'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Ringkasan & Analitik</span>
        </button>

        <button
          onClick={() => setActiveTab('senarai')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'senarai'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-white/20'
              : 'bg-white/70 backdrop-blur-md text-slate-600 hover:bg-white border border-white/80'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Senarai Aduan ({complaints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('telegram')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'telegram'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-white/20'
              : 'bg-white/70 backdrop-blur-md text-slate-600 hover:bg-white border border-white/80'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Operasi Telegram (Pegawai)</span>
        </button>

        <button
          onClick={() => setActiveTab('sheets')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'sheets'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-white/20'
              : 'bg-white/70 backdrop-blur-md text-slate-600 hover:bg-white border border-white/80'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Google Sheets & Database</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 border border-white/20'
              : 'bg-white/70 backdrop-blur-md text-slate-600 hover:bg-white border border-white/80'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Trail & Emel</span>
        </button>
      </div>

      {/* ==========================================
          TAB 1: RINGKASAN & ANALITIK
         ========================================== */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-6">
          
          {/* Status KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            <div className="glass-card p-4 rounded-2xl shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Jumlah</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{stats?.totalAduan || 0}</div>
              <span className="text-[10px] text-slate-400">Semua Tiket</span>
            </div>

            <div className="glass-card p-4 rounded-2xl shadow-xs border-amber-200/80 bg-amber-50/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-yellow-800">Menunggu</span>
              <div className="text-2xl font-black text-yellow-700 mt-1">{stats?.menunggu || 0}</div>
              <span className="text-[10px] text-yellow-600">🟡 Belum diambil</span>
            </div>

            <div className="glass-card p-4 rounded-2xl shadow-xs border-blue-200/80 bg-blue-50/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Semakan</span>
              <div className="text-2xl font-black text-blue-700 mt-1">{stats?.dalamSemakan || 0}</div>
              <span className="text-[10px] text-blue-600">🔵 Siasatan awal</span>
            </div>

            <div className="glass-card p-4 rounded-2xl shadow-xs border-orange-200/80 bg-orange-50/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-800">Tindakan</span>
              <div className="text-2xl font-black text-orange-700 mt-1">{stats?.dalamTindakan || 0}</div>
              <span className="text-[10px] text-orange-600">🟠 Sedang dibaiki</span>
            </div>

            <div className="glass-card p-4 rounded-2xl shadow-xs border-emerald-200/80 bg-emerald-50/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Selesai</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">{stats?.selesai || 0}</div>
              <span className="text-[10px] text-emerald-600">🟢 Berjaya diselesai</span>
            </div>

            <div className="glass-card p-4 rounded-2xl shadow-xs border-rose-200/80 bg-rose-50/40">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Tidak Selesai</span>
              <div className="text-2xl font-black text-rose-700 mt-1">{stats?.tidakDapatDiselesaikan || 0}</div>
              <span className="text-[10px] text-rose-600">🔴 Kekangan teknikal</span>
            </div>

          </div>

          {/* Unassigned Warning Alert if any */}
          {stats && stats.unassignedCount > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/90 backdrop-blur-md border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  Terdapat <strong>{stats.unassignedCount} aduan</strong> yang masih belum diambil tindakan oleh pegawai bertugas dalam Telegram Group!
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedStatusFilter('MENUNGGU');
                  setActiveTab('senarai');
                }}
                className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl text-xs font-bold shrink-0 transition-all shadow-xs"
              >
                Lihat Aduan
              </button>
            </div>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Category Breakdown Bar Chart */}
            <div className="lg:col-span-7 glass-card p-6 rounded-3xl">
              <h3 className="text-sm font-bold text-slate-900 mb-4">
                Aduan Mengikut Kategori
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.6)" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]}>
                      {categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Trend Chart */}
            <div className="lg:col-span-5 glass-card p-6 rounded-3xl">
              <h3 className="text-sm font-bold text-slate-900 mb-4">
                Trend Aduan Bulanan
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.6)" />
                    <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="jumlah" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Performance & Quality Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-3xl">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Purata Masa Penyelesaian
              </span>
              <div className="text-3xl font-black text-slate-900 mt-2">
                {stats?.purataMasaPenyelesaianJam || 3.5} Jam
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Diukur dari detik aduan didaftarkan sehingga pegawai menekan selesai.
              </p>
            </div>

            <div className="glass-card p-6 rounded-3xl">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Purata Kepuasan Pelanggan
              </span>
              <div className="text-3xl font-black text-blue-600 mt-2">
                {stats?.purataKepuasan || 4.8} / 5.0
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Daripada {stats?.totalRating || 0} responden pelanggan yang telah memberikan ulasan.
              </p>
            </div>

            <div className="glass-card p-6 rounded-3xl">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Kadar Penyelesaian Keseluruhan
              </span>
              <div className="text-3xl font-black text-emerald-600 mt-2">
                {stats && stats.totalAduan > 0 ? Math.round((stats.selesai / stats.totalAduan) * 100) : 0}%
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {stats?.selesai || 0} daripada {stats?.totalAduan || 0} aduan telah diselesaikan sepenuhnya.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ==========================================
          TAB 2: SENARAI ADUAN LENGKAP
         ========================================== */}
      {activeTab === 'senarai' && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
          
          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Carian Aduan:</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari Ref / Tajuk / Pengadu / Pegawai..."
                  className="w-full pl-9 pr-3 py-2 text-xs glass-input rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Filter Kategori:</label>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full p-2 text-xs glass-input rounded-xl focus:outline-none"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="KEMUDAHAN">🏢 Kemudahan & Infrastruktur</option>
                <option value="SISTEM">💻 Sistem & Teknologi</option>
                <option value="PERKHIDMATAN">👨‍🏫 Perkhidmatan</option>
                <option value="KEBERSIHAN">🧹 Kebersihan</option>
                <option value="LAIN_LAIN">📌 Lain-lain</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Filter Status:</label>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full p-2 text-xs glass-input rounded-xl focus:outline-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="MENUNGGU">🟡 Menunggu Tindakan</option>
                <option value="DALAM_SEMAKAN">🔵 Dalam Semakan</option>
                <option value="DALAM_TINDAKAN">🟠 Dalam Tindakan</option>
                <option value="SELESAI">🟢 Selesai</option>
                <option value="TIDAK_DAPAT_DISELESAIKAN">🔴 Tidak Dapat Diselesaikan</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchAdminData}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
              >
                Tapis Data
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/80 bg-white/40 backdrop-blur-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/70 text-slate-700 uppercase font-bold border-b border-white/80 text-[11px]">
                <tr>
                  <th className="p-3.5">No. Rujukan</th>
                  <th className="p-3.5">Pengadu</th>
                  <th className="p-3.5">Kategori & Tajuk</th>
                  <th className="p-3.5">Saluran Telegram</th>
                  <th className="p-3.5">Pegawai Bertugas</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/60">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                      Tiada aduan sepadan dengan kriteria carian.
                    </td>
                  </tr>
                ) : (
                  complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-white/60 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-600 whitespace-nowrap">
                        {c.noRujukan}
                        <span className="block text-[10px] text-slate-400 font-sans">{c.tarikhMasa.substring(0, 10)}</span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{c.namaPengadu}</span>
                        <span className="text-[11px] text-slate-500">{c.telefon}</span>
                      </td>

                      <td className="p-3.5 max-w-xs">
                        <span className="text-[10px] font-semibold text-slate-500 block uppercase">
                          {c.kategoriNama}
                        </span>
                        <span className="font-semibold text-slate-800 line-clamp-1">
                          {c.tajukAduan}
                        </span>
                        <span className="text-[11px] text-slate-500 line-clamp-1">
                          📍 {c.lokasi}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="text-[11px] font-medium text-slate-700 bg-white/80 px-2 py-0.5 rounded-md border border-white/90">
                          {c.telegramGroup}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        {c.namaPegawai ? (
                          <span className="text-xs font-bold text-emerald-800 bg-emerald-50/90 px-2.5 py-1 rounded-xl border border-emerald-200 shadow-xs">
                            👤 {c.namaPegawai}
                          </span>
                        ) : (
                          <span className="text-xs text-yellow-700 font-medium">
                            🟡 Belum diambil
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${STATUS_CONFIG[c.status]?.badgeBg} backdrop-blur-xs`}>
                          {STATUS_CONFIG[c.status]?.emoji} {STATUS_CONFIG[c.status]?.label}
                        </span>
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          className="px-3 py-1.5 bg-blue-50/90 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ml-auto cursor-pointer shadow-xs active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Butiran</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ==========================================
          TAB 3: TELEGRAM OPERASI SIMULATOR
         ========================================== */}
      {activeTab === 'telegram' && (
        <AdminTelegramSimulator
          complaints={complaints}
          onRefreshComplaints={fetchAdminData}
        />
      )}

      {/* ==========================================
          TAB 4: GOOGLE SHEETS SYNC
         ========================================== */}
      {activeTab === 'sheets' && (
        <AdminSheetsSync complaints={complaints} />
      )}

      {/* ==========================================
          TAB 5: AUDIT TRAIL & EMEL
         ========================================== */}
      {activeTab === 'audit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Audit Logs */}
          <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <span>Log Jejak Audit Aktiviti Sistem (Sheet LOG)</span>
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 bg-white/60 border border-white/80 rounded-2xl backdrop-blur-xs shadow-xs">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-bold text-blue-600 font-mono">{log.noRujukan}</span>
                    <span className="text-slate-400 font-mono">{log.tarikhMasa}</span>
                  </div>
                  <p className="text-slate-800 font-medium">{log.keterangan}</p>
                  <span className="block text-[10px] text-slate-500 mt-1">
                    Dilakukan Oleh: <strong>{log.dilakukanOleh}</strong> ({log.jenisAktiviti})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Email Logs */}
          <div className="lg:col-span-5 glass-card p-6 sm:p-8 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>Notifikasi Emel Pelanggan</span>
            </h3>

            <p className="text-xs text-slate-500">
              Setiap emel dihantar dengan nama pengirim <strong>"SiAP – Sistem Aduan Pelanggan"</strong>.
            </p>

            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1 text-xs">
              {emailLogs.map((em) => (
                <div key={em.id} className="p-3.5 bg-white/60 border border-white/80 rounded-2xl backdrop-blur-xs shadow-xs space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-900">{em.penerima}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      {em.status}
                    </span>
                  </div>
                  <p className="font-semibold text-blue-700 text-[11px]">{em.subjek}</p>
                  <p className="text-slate-600 text-[11px] line-clamp-2">{em.kandungan}</p>
                  <span className="block text-[10px] text-slate-400 font-mono">{em.tarikhMasa}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedComplaint && (
        <AdminComplaintDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpdate={() => {
            fetchAdminData();
            setSelectedComplaint(null);
          }}
        />
      )}

    </div>
  );
};
