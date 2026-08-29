import React, { useEffect, useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Download,
  AlertCircle,
  Code2,
  FolderOpen,
  HardDrive,
} from 'lucide-react';
import { Complaint } from '../types';

interface AdminSheetsSyncProps {
  complaints: Complaint[];
}

export const AdminSheetsSync: React.FC<AdminSheetsSyncProps> = ({ complaints }) => {
  const [googleSheetId, setGoogleSheetId] = useState('1PEsqqZJL6az5Np-BTojlOCgPX9gD6Iip4zemQQ11W9U');
  const [googleDriveFolderId, setGoogleDriveFolderId] = useState('1bQ1l9Q_Kz0JcUQsGVRxPkWQrj66yq8Qr');
  const [googleDriveFolderUrl, setGoogleDriveFolderUrl] = useState('https://drive.google.com/drive/folders/1bQ1l9Q_Kz0JcUQsGVRxPkWQrj66yq8Qr?usp=sharing');
  const [appsScriptUrl, setAppsScriptUrl] = useState('');
  const [appsScriptCode, setAppsScriptCode] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isTestingUrl, setIsTestingUrl] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const [copiedJson, setCopiedJson] = useState(false);

  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatIdKemudahan, setTelegramChatIdKemudahan] = useState('');
  const [telegramChatIdSistem, setTelegramChatIdSistem] = useState('');
  const [telegramChatIdPerkhidmatan, setTelegramChatIdPerkhidmatan] = useState('');
  const [telegramChatIdKebersihan, setTelegramChatIdKebersihan] = useState('');

  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');

  const handleCopyJson = async () => {
    try {
      const res = await fetch('/api/sync-feed');
      const data = await res.json();
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    } catch {
      navigator.clipboard.writeText(JSON.stringify({ complaints }, null, 2));
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }
  };

  const handleTestUrl = async () => {
    if (!appsScriptUrl) {
      setTestResult('⚠️ Sila masukkan URL Web App terlebih dahulu.');
      return;
    }
    setIsTestingUrl(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/sheets/test-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: appsScriptUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(`✅ ${data.message}`);
      } else {
        setTestResult(`❌ ${data.message}`);
      }
    } catch (err: any) {
      setTestResult(`❌ Ralat: ${err.message}`);
    } finally {
      setIsTestingUrl(false);
    }
  };

  useEffect(() => {
    fetch('/api/admin/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setGoogleSheetId(data.config.googleSheetId || '1PEsqqZJL6az5Np-BTojlOCgPX9gD6Iip4zemQQ11W9U');
          setGoogleDriveFolderId(data.config.googleDriveFolderId || '1bQ1l9Q_Kz0JcUQsGVRxPkWQrj66yq8Qr');
          setGoogleDriveFolderUrl(data.config.googleDriveFolderUrl || 'https://drive.google.com/drive/folders/1bQ1l9Q_Kz0JcUQsGVRxPkWQrj66yq8Qr?usp=sharing');
          setAppsScriptUrl(data.config.googleAppsScriptUrl || '');
          setTelegramBotToken(data.config.telegramBotToken || '');
          setTelegramChatIdKemudahan(data.config.telegramChatIdKemudahan || '');
          setTelegramChatIdSistem(data.config.telegramChatIdSistem || '');
          setTelegramChatIdPerkhidmatan(data.config.telegramChatIdPerkhidmatan || '');
          setTelegramChatIdKebersihan(data.config.telegramChatIdKebersihan || '');
          setSmtpHost(data.config.smtpHost || '');
          setSmtpPort(data.config.smtpPort || '587');
          setSmtpUser(data.config.smtpUser || '');
          setSmtpPass(data.config.smtpPass || '');
        }
        if (data.appsScriptCode) {
          setAppsScriptCode(data.appsScriptCode);
        }
      })
      .catch((e) => console.log('Config fetch error:', e));
  }, []);

  const handleSaveConfig = async () => {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleSheetId,
          googleDriveFolderId,
          googleDriveFolderUrl,
          googleAppsScriptUrl: appsScriptUrl,
          telegramBotToken,
          telegramChatIdKemudahan,
          telegramChatIdSistem,
          telegramChatIdPerkhidmatan,
          telegramChatIdKebersihan,
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPass,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncStatus('Konfigurasi integrasi sistem berjaya disimpan.');
      }
    } catch (e: any) {
      setSyncStatus(`Ralat: ${e.message}`);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch('/api/admin/sheets/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncStatus(`✅ ${data.message} (${data.syncedRows || complaints.length} rekod aduan diselaraskan)`);
      } else {
        setSyncStatus(`⚠️ ${data.message}`);
      }
    } catch (e: any) {
      setSyncStatus(`Ralat: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const [isPulling, setIsPulling] = useState(false);
  const handlePullSync = async () => {
    setIsPulling(true);
    setSyncStatus(null);
    try {
      const res = await fetch('/api/admin/sheets/pull', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncStatus(`✅ ${data.message}`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setSyncStatus(`⚠️ ${data.message}`);
      }
    } catch (e: any) {
      setSyncStatus(`Ralat: ${e.message}`);
    } finally {
      setIsPulling(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCSV = () => {
    const headers = [
      'No Rujukan',
      'Tarikh Masa',
      'Nama Pengadu',
      'Telefon',
      'Emel',
      'Kategori',
      'Tajuk Aduan',
      'Lokasi',
      'Status',
      'Pegawai',
      'Tindakan Terkini',
      'Pautan Lampiran Google Drive',
      'Rating',
    ];

    const rows = complaints.map((c) => [
      `"${c.noRujukan}"`,
      `"${c.tarikhMasa}"`,
      `"${c.namaPengadu}"`,
      `"${c.telefon}"`,
      `"${c.emel}"`,
      `"${c.kategoriNama}"`,
      `"${c.tajukAduan.replace(/"/g, '""')}"`,
      `"${c.lokasi.replace(/"/g, '""')}"`,
      `"${c.status}"`,
      `"${c.namaPegawai || ''}"`,
      `"${(c.tindakanTerkini || '').replace(/"/g, '""')}"`,
      `"${c.lampiranDriveUrl || (c.lampiran ? googleDriveFolderUrl : '')}"`,
      `"${c.rating || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SiAP_Aduan_Export_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sheetUrl = `https://docs.google.com/spreadsheets/d/${googleSheetId}/edit?usp=sharing`;

  return (
    <div className="space-y-6">
      
      {/* Header Banner - Frosted Glass Dark Accent */}
      <div className="bg-slate-900/85 backdrop-blur-xl border border-white/20 text-white rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2 backdrop-blur-md">
              <FileSpreadsheet className="w-4 h-4" />
              Pangkalan Data Utama & Google Drive
            </div>
            <h2 className="text-2xl font-black text-white">
              Integrasi Google Sheets & Google Drive
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
              Sistem menggunakan Google Sheets sebagai pangkalan data utama dan Google Drive sebagai pusat simpanan fail/gambar lampiran aduan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 border border-white/20 active:scale-98 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Buka Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={googleDriveFolderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20 border border-white/20 active:scale-98 cursor-pointer"
            >
              <FolderOpen className="w-4 h-4 text-blue-200" />
              <span>Buka Folder Google Drive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all flex items-center gap-2 border border-white/20 active:scale-98 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Eksport CSV</span>
            </button>
          </div>
        </div>
      </div>

      {syncStatus && (
        <div className="p-4 rounded-2xl bg-blue-50/90 backdrop-blur-md border border-blue-200 text-blue-900 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Sync Control & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Configuration Inputs */}
        <div className="lg:col-span-6 glass-card p-6 sm:p-8 rounded-3xl space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Konfigurasi Google Sheets & Google Drive</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Google Spreadsheet ID:</label>
              <input
                type="text"
                value={googleSheetId}
                onChange={(e) => setGoogleSheetId(e.target.value)}
                placeholder="ID Dokumen Google Sheets"
                className="w-full p-3 font-mono text-slate-900 glass-input rounded-xl focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Pautan semasa: <a href={sheetUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline truncate max-w-xs inline-block align-bottom">{sheetUrl}</a>
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-blue-600" />
                <span>Google Drive Folder ID (Simpanan Fail Lampiran):</span>
              </label>
              <input
                type="text"
                value={googleDriveFolderId}
                onChange={(e) => {
                  const val = e.target.value;
                  setGoogleDriveFolderId(val);
                  setGoogleDriveFolderUrl(`https://drive.google.com/drive/folders/${val}?usp=sharing`);
                }}
                placeholder="cth: 1bQ1l9Q_Kz0JcUQsGVRxPkWQrj66yq8Qr"
                className="w-full p-3 font-mono text-slate-900 glass-input rounded-xl focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Semua gambar & dokumen lampiran aduan disimpan terus ke: <a href={googleDriveFolderUrl} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline truncate max-w-xs inline-block align-bottom">{googleDriveFolderUrl}</a>
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Google Apps Script Web App URL (Untuk 2-Way Live Sync & Muat Naik Drive):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={appsScriptUrl}
                  onChange={(e) => setAppsScriptUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 p-3 font-mono text-slate-900 glass-input rounded-xl focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleTestUrl}
                  disabled={isTestingUrl}
                  className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shrink-0 transition-all cursor-pointer shadow-sm"
                >
                  {isTestingUrl ? 'Menguji...' : 'Uji Sambungan'}
                </button>
              </div>
              {testResult && (
                <div className={`mt-1.5 p-2 rounded-lg text-[11px] font-bold ${testResult.startsWith('✅') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                  {testResult}
                </div>
              )}
              <span className="text-[11px] text-slate-500 mt-1 block">
                Dapatkan URL ini selepas melakukan deployment Web App di Google Apps Script (lihat panduan sebelah).
              </span>
            </div>

            {/* Telegram Bot Configuration */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>🤖 Tetapan Telegram Bot (Notifikasi Aduan)</span>
              </h4>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Telegram Bot Token:</label>
                <input
                  type="text"
                  value={telegramBotToken}
                  onChange={(e) => setTelegramBotToken(e.target.value)}
                  placeholder="cth: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  className="w-full p-3 font-mono text-slate-900 glass-input rounded-xl focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chat ID Kemudahan:</label>
                  <input
                    type="text"
                    value={telegramChatIdKemudahan}
                    onChange={(e) => setTelegramChatIdKemudahan(e.target.value)}
                    placeholder="-100..."
                    className="w-full p-3 font-mono text-slate-900 glass-input rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chat ID Sistem:</label>
                  <input
                    type="text"
                    value={telegramChatIdSistem}
                    onChange={(e) => setTelegramChatIdSistem(e.target.value)}
                    placeholder="-100..."
                    className="w-full p-3 font-mono text-slate-900 glass-input rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chat ID Perkhidmatan:</label>
                  <input
                    type="text"
                    value={telegramChatIdPerkhidmatan}
                    onChange={(e) => setTelegramChatIdPerkhidmatan(e.target.value)}
                    placeholder="-100..."
                    className="w-full p-3 font-mono text-slate-900 glass-input rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chat ID Kebersihan:</label>
                  <input
                    type="text"
                    value={telegramChatIdKebersihan}
                    onChange={(e) => setTelegramChatIdKebersihan(e.target.value)}
                    placeholder="-100..."
                    className="w-full p-3 font-mono text-slate-900 glass-input rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SMTP Server Configuration */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>📧 Tetapan SMTP E-mel (Direct Delivery)</span>
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">SMTP Host:</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="w-full p-3 font-mono text-slate-900 glass-input rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SMTP Port:</label>
                  <input
                    type="text"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="587"
                    className="w-full p-3 font-mono text-slate-900 glass-input rounded-xl focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SMTP Username (Emel):</label>
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="pengirim@gmail.com"
                    className="w-full p-3 font-mono text-slate-900 glass-input rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SMTP Password / App Key:</label>
                  <input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="••••••••••••••••"
                    className="w-full p-3 font-mono text-slate-900 glass-input rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSaveConfig}
                className="flex-1 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md active:scale-98 cursor-pointer"
              >
                Simpan Konfigurasi
              </button>

              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-98 border border-white/20"
                title="Hantar data tempatan ke Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menghantar...' : 'Hantar ke Sheets (Push)'}</span>
              </button>

              <button
                onClick={handlePullSync}
                disabled={isPulling}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-98 border border-white/20"
                title="Tarik data terkini dari Google Sheets"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPulling ? 'animate-spin' : ''}`} />
                <span>{isPulling ? 'Menarik...' : 'Tarik dari Sheets (Pull)'}</span>
              </button>
            </div>
          </div>

          {/* Database Structure Preview */}
          <div className="pt-4 border-t border-white/60 text-xs">
            <h4 className="font-bold text-slate-800 mb-2">5 Sheet & Folder Google Drive SiAP:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-blue-50/80 backdrop-blur-xs text-blue-900 rounded-xl font-mono border border-blue-200/80 shadow-xs">
                📄 <strong>ADUAN</strong> (Pautan Drive)
              </div>
              <div className="p-2.5 bg-emerald-50/80 backdrop-blur-xs text-emerald-900 rounded-xl font-mono border border-emerald-200/80 shadow-xs">
                📄 <strong>TINDAKAN</strong> (Log pegawai)
              </div>
              <div className="p-2.5 bg-indigo-50/80 backdrop-blur-xs text-indigo-900 rounded-xl font-mono border border-indigo-200/80 shadow-xs">
                📄 <strong>TELEGRAM_GROUPS</strong> (ID Kumpulan)
              </div>
              <div className="p-2.5 bg-amber-50/80 backdrop-blur-xs text-amber-900 rounded-xl font-mono border border-amber-200/80 shadow-xs">
                📄 <strong>KATEGORI</strong> (5 Kategori)
              </div>
              <div className="p-2.5 bg-sky-50/80 backdrop-blur-xs text-sky-900 rounded-xl font-mono border border-sky-200/80 shadow-xs sm:col-span-2 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-sky-600 shrink-0" />
                <span>📁 <strong>Google Drive Folder</strong> (ID: <code>1bQ1l9Q_Kz0JcUQsGVRxPkWQrj66yq8Qr</code>)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Apps Script Ready-to-Copy Template */}
        <div className="lg:col-span-6 bg-slate-900/85 backdrop-blur-xl rounded-3xl p-6 sm:p-8 text-white flex flex-col justify-between border border-white/20 shadow-2xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Kod Apps Script SiAP (Versi Terkini)</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyJson}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm active:scale-95 border border-white/20"
                title="Salin data mentah JSON untuk import"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? 'JSON Disalin!' : 'Salin JSON Data'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 border border-white/20"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Disalin!' : 'Salin Kod (Copy)'}</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950/90 rounded-2xl p-3.5 border border-white/10 overflow-hidden font-mono text-[11px] text-emerald-300 h-64 overflow-y-auto shadow-inner">
            <pre>{appsScriptCode || '// Memuatkan skrip Apps Script...'}</pre>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span>🛠️ Cara Pasang Kod & Selesaikan Ralat JSON:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-200">
              <li>Klik butang hijau <strong>Salin Kod (Copy)</strong> di atas.</li>
              <li>Buka Google Sheets &gt; <strong>Extensions &gt; Apps Script</strong>.</li>
              <li>Pilih semua kod lama (Ctrl+A), <strong>padam</strong>, dan <strong>tampal (Ctrl+V)</strong> kod baharu ini, lalu tekan <strong>Save (Ctrl+S)</strong>.</li>
              <li>Tutup tab Apps Script, kemudian <strong>Refresh (F5) Google Sheets anda</strong>.</li>
              <li>Klik menu atas Google Sheets: <strong>🔄 SiAP Database &gt; 🚀 Tarik Semua Data & Simpan Gambar ke Drive</strong>.</li>
            </ol>
            <p className="text-[11px] text-emerald-300 font-semibold pt-1 border-t border-white/10">
              💡 Kod baharu kini mengandungi fallback automatik &amp; pemproses fail Google Drive terbina dalam — tiada lagi ralat <em>SyntaxError Unexpected token '&lt;'</em>.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
