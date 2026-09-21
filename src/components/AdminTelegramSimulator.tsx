import React, { useState, useEffect } from 'react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Check,
  Layers,
} from 'lucide-react';
import { STATUS_CONFIG, CATEGORIES } from '../data/categories';
import { Complaint, ComplaintStatus, TindakanItem } from '../types';
import { formatDateTime } from '../utils/dateFormatter';

interface AdminTelegramSimulatorProps {
  complaints: Complaint[];
  onRefreshComplaints: () => void;
}

export const AdminTelegramSimulator: React.FC<AdminTelegramSimulatorProps> = ({
  complaints,
  onRefreshComplaints,
}) => {
  const [selectedRef, setSelectedRef] = useState<string>(complaints[0]?.noRujukan || '');
  const [catatanText, setCatatanText] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  
  const [chatMessages, setChatMessages] = useState<Array<{
    sender: 'bot' | 'officer' | 'system';
    text: string;
    time: string;
    isHtml?: boolean;
    buttons?: Array<{ label: string; action: string; status?: ComplaintStatus; url?: string }>;
  }>>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Fallback or selected complaint
  const selectedComplaint = complaints.find((c) => c.noRujukan === selectedRef) || complaints[0];

  // Auto-sync selectedRef if complaints change
  useEffect(() => {
    if (complaints.length > 0 && !complaints.some((c) => c.noRujukan === selectedRef)) {
      setSelectedRef(complaints[0].noRujukan);
    }
  }, [complaints, selectedRef]);

  // Build the Telegram card and initial chat history for the selected complaint
  useEffect(() => {
    if (!selectedComplaint) {
      setChatMessages([
        {
          sender: 'system',
          text: 'Tiada rekod aduan untuk dipaparkan. Sila buat aduan baharu terlebih dahulu.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      return;
    }

    const categoryInfo = CATEGORIES[selectedComplaint.kategori];
    const pic = selectedComplaint.namaPegawai || (categoryInfo ? `Pegawai ${categoryInfo.name.split(' ')[0]}` : 'Pegawai Bertugas');
    const nowTime = selectedComplaint.tarikhMasa.split(' ')[1] || '12:00';
    const statusCfg = STATUS_CONFIG[selectedComplaint.status] || { emoji: '🟡', label: selectedComplaint.status };

    const cardText =
      `🚨 <b>ADUAN BAHARU – SiAP</b>\n\n` +
      `<b>No. Rujukan:</b> <code>${selectedComplaint.noRujukan}</code>\n` +
      `🏢 <b>Kategori:</b> ${selectedComplaint.kategoriNama}\n` +
      `👮 <b>Pegawai PIC:</b> ${pic}\n` +
      `📝 <b>Tajuk:</b> ${selectedComplaint.tajukAduan}\n` +
      `📍 <b>Lokasi:</b> ${selectedComplaint.lokasi}\n` +
      `👤 <b>Pengadu:</b> ${selectedComplaint.namaPengadu} (${selectedComplaint.telefon || '-'})\n` +
      `🕐 <b>Tarikh:</b> ${formatDateTime(selectedComplaint.tarikhMasa)}\n` +
      `<b>Status Semasa:</b> ${statusCfg.emoji} <b>${statusCfg.label.toUpperCase()}</b>\n\n` +
      `📄 <b>Butiran:</b> ${selectedComplaint.butiranAduan}`;

    const checkUrl = `${window.location.origin}/?ref=${encodeURIComponent(selectedComplaint.noRujukan)}`;

    const initialCard = {
      sender: 'bot' as const,
      text: cardText,
      time: nowTime,
      isHtml: true,
      buttons: [
        { label: '👁 LIHAT ADUAN', action: 'VIEW', url: checkUrl },
        { label: `⚡ AMBIL TINDAKAN / TUKAR STATUS`, action: 'OPEN_MENU' },
      ],
    };

    const logs: typeof chatMessages = [initialCard];

    if (selectedComplaint.status !== 'MENUNGGU') {
      logs.push({
        sender: 'bot',
        text:
          `✅ <b>STATUS TINDAKAN TERKINI</b>\n\n` +
          `<b>No. Rujukan:</b> <code>${selectedComplaint.noRujukan}</code>\n` +
          `<b>Status Semasa:</b> ${statusCfg.emoji} <b>${statusCfg.label.toUpperCase()}</b>\n` +
          `👮 <b>Pegawai PIC:</b> ${pic}\n` +
          `📝 <b>Tindakan:</b> ${selectedComplaint.tindakanTerkini || 'Sedang dikendalikan.'}\n` +
          `🕐 <b>Kemas Kini Terakhir:</b> ${formatDateTime(selectedComplaint.tarikhSelesai || selectedComplaint.tarikhDiambilTindakan || selectedComplaint.tarikhMasa)}\n\n` +
          `<i>Status ini disimpan secara langsung ke dalam pangkalan data Supabase.</i>`,
        time: (selectedComplaint.tarikhSelesai || selectedComplaint.tarikhDiambilTindakan || '').split(' ')[1] || nowTime,
        isHtml: true,
        buttons: [
          { label: '🔄 TUKAR STATUS LAIN', action: 'OPEN_MENU' },
          { label: '👁 LIHAT ADUAN', action: 'VIEW', url: checkUrl },
        ],
      });
    }

    setChatMessages(logs);
    setShowStatusMenu(false);
  }, [selectedRef, selectedComplaint?.status, selectedComplaint?.tindakanTerkini]);

  const handleUpdateStatus = async (newStatus: ComplaintStatus) => {
    if (!selectedComplaint) return;
    setIsLoading(true);
    setFeedback(null);

    const statusObj = STATUS_CONFIG[newStatus] || { emoji: '⚡', label: newStatus };
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append officer selection click bubble
    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'officer',
        time: now,
        text: `[Memilih Status: ${statusObj.emoji} ${statusObj.label}]${catatanText ? `\nCatatan: "${catatanText}"` : ''}`,
      },
    ]);

    try {
      const res = await fetch('/api/telegram/simulate-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'KEMASKINI_STATUS',
          noRujukan: selectedComplaint.noRujukan,
          newStatus,
          catatan: catatanText.trim() || undefined,
        }),
      });

      const data = await res.json();
      const botReply = data.replyMessage || data.message || 'Status berjaya dikemaskini.';
      const checkUrl = `${window.location.origin}/?ref=${encodeURIComponent(selectedComplaint.noRujukan)}`;

      // Append bot incoming reply bubble with interactive options
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          time: now,
          isHtml: true,
          buttons: [
            { label: '🔄 TUKAR STATUS SEMULA', action: 'OPEN_MENU' },
            { label: '👁 LIHAT ADUAN', action: 'VIEW', url: checkUrl },
          ],
        },
      ]);

      setCatatanText('');
      setShowStatusMenu(false);
      setFeedback(data.message || 'Status aduan berjaya dikemaskini.');
      onRefreshComplaints();
    } catch (e: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `⚠️ <b>RALAT:</b> ${e.message}`,
          time: now,
          isHtml: true,
        },
      ]);
      setFeedback(`Ralat: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCatatanOnly = async () => {
    if (!selectedComplaint || !catatanText.trim()) return;
    setIsLoading(true);
    setFeedback(null);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setChatMessages((prev) => [
      ...prev,
      {
        sender: 'officer',
        time: now,
        text: `📝 Tambah Catatan: "${catatanText}"`,
      },
    ]);

    try {
      const res = await fetch('/api/telegram/simulate-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TAMBAH_TINDAKAN',
          noRujukan: selectedComplaint.noRujukan,
          catatan: catatanText.trim(),
        }),
      });

      const data = await res.json();
      if (data.replyMessage) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: data.replyMessage,
            time: now,
            isHtml: true,
          },
        ]);
      }
      setCatatanText('');
      setFeedback('Catatan tindakan berjaya direkodkan.');
      onRefreshComplaints();
    } catch (e: any) {
      setFeedback(`Ralat: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = (btn: { label: string; action: string; status?: ComplaintStatus; url?: string }) => {
    if (!selectedComplaint) return;
    if (btn.action === 'VIEW' && btn.url) {
      window.open(btn.url, '_blank');
    } else if (btn.action === 'OPEN_MENU') {
      setShowStatusMenu(true);
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `⚡ <b>MENU PILIHAN STATUS TINDAKAN</b>\n\n` +
                `<b>No. Rujukan:</b> <code>${selectedComplaint.noRujukan}</code>\n` +
                `<i>Sila pilih status tindakan baharu di bawah:</i>`,
          time: now,
          isHtml: true,
          buttons: [
            { label: '🔵 DALAM SEMAKAN', action: 'STATUS', status: 'DALAM_SEMAKAN' },
            { label: '🟠 DALAM TINDAKAN', action: 'STATUS', status: 'DALAM_TINDAKAN' },
            { label: '🟢 SELESAI', action: 'STATUS', status: 'SELESAI' },
            { label: '🔴 TIDAK DAPAT DISELESAIKAN', action: 'STATUS', status: 'TIDAK_DAPAT_DISELESAIKAN' },
          ],
        },
      ]);
    } else if (btn.action === 'STATUS' && btn.status) {
      handleUpdateStatus(btn.status);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Banner - Frosted Glass Accent */}
      <div className="bg-slate-900/85 backdrop-blur-xl border border-white/20 text-white rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Pusat Operasi Tindakan Pegawai PIC (Telegram)
            </div>
            <h2 className="text-2xl font-black text-white">
              Pusat Tindakan Pegawai Khas Mengikut Kategori
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
              Pegawai PIC bertindak secara eksklusif melalui Telegram untuk memilih dan mengemas kini status tindakan aduan secara langsung ke dalam sistem SiAP.
            </p>
          </div>

          <button
            onClick={onRefreshComplaints}
            className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold transition-all flex items-center gap-2 shrink-0 self-start md:self-auto shadow-sm active:scale-98 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Muat Semula Data</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-blue-50/90 backdrop-blur-md border border-blue-200 text-blue-900 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Simulator 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Officer Controls */}
        <div className="lg:col-span-6 glass-card p-6 sm:p-8 rounded-3xl space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>Pilihan Status Tindakan Pegawai</span>
          </h3>

          {/* Select Complaint */}
          <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 text-xs shadow-inner space-y-2">
            <label className="block font-bold text-slate-700">Pilih Aduan Untuk Diuji:</label>
            <select
              value={selectedRef}
              onChange={(e) => setSelectedRef(e.target.value)}
              className="w-full p-2.5 glass-input rounded-xl focus:outline-none font-mono font-bold text-blue-700"
            >
              {complaints.map((c) => (
                <option key={c.noRujukan} value={c.noRujukan}>
                  {c.noRujukan} - {c.tajukAduan.substring(0, 24)}... ({c.status})
                </option>
              ))}
            </select>
          </div>

          {selectedComplaint && (
            <div className="p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-200/80 rounded-2xl text-xs space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{selectedComplaint.noRujukan}</span>
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${STATUS_CONFIG[selectedComplaint.status]?.badgeBg}`}>
                  {STATUS_CONFIG[selectedComplaint.status]?.emoji} {STATUS_CONFIG[selectedComplaint.status]?.label}
                </span>
              </div>
              <p className="font-semibold text-slate-800">{selectedComplaint.tajukAduan}</p>
              <p className="text-slate-600">Saluran: <strong>{selectedComplaint.telegramGroup}</strong></p>
              <p className="text-slate-600">
                Pegawai PIC Bertanggungjawab:{' '}
                <strong>{selectedComplaint.namaPegawai || (CATEGORIES[selectedComplaint.kategori]?.name || 'Pegawai PIC')}</strong>
              </p>
            </div>
          )}

          {/* Optional Notes Input */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-slate-700">
              Catatan / Ulasan Tindakan Pegawai (Pilihan):
            </label>
            <input
              type="text"
              value={catatanText}
              onChange={(e) => setCatatanText(e.target.value)}
              placeholder="cth: Pemeriksaan telah selesai dan alat ganti telah dipasang..."
              className="w-full p-3 text-xs glass-input rounded-xl focus:outline-none"
            />
          </div>

          {/* Status Buttons Grid */}
          <div className="pt-2 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pilih Status Untuk Dikemaskini:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Option 1: Dalam Semakan */}
              <button
                onClick={() => handleUpdateStatus('DALAM_SEMAKAN')}
                disabled={isLoading}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 border border-white/20"
              >
                <span>🔵 DALAM SEMAKAN</span>
              </button>

              {/* Option 2: Dalam Tindakan */}
              <button
                onClick={() => handleUpdateStatus('DALAM_TINDAKAN')}
                disabled={isLoading}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 border border-white/20"
              >
                <span>🟠 DALAM TINDAKAN</span>
              </button>

              {/* Option 3: Selesai */}
              <button
                onClick={() => handleUpdateStatus('SELESAI')}
                disabled={isLoading}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 border border-white/20"
              >
                <span>🟢 SELESAI</span>
              </button>

              {/* Option 4: Tidak Dapat Diselesaikan */}
              <button
                onClick={() => handleUpdateStatus('TIDAK_DAPAT_DISELESAIKAN')}
                disabled={isLoading}
                className="py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 border border-white/20"
              >
                <span>🔴 TIDAK SELESAI</span>
              </button>

            </div>

            {/* Extra: Tambah Catatan Sahaja */}
            {catatanText.trim() && (
              <button
                onClick={handleAddCatatanOnly}
                disabled={isLoading}
                className="w-full py-2.5 mt-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📝 Simpan Catatan Tambahan Sahaja</span>
              </button>
            )}

          </div>

        </div>

        {/* Right Column: Telegram Chat Interface Mockup */}
        <div className="lg:col-span-6 bg-slate-900/85 backdrop-blur-xl rounded-3xl p-5 sm:p-6 text-white flex flex-col justify-between h-[640px] border border-white/20 shadow-2xl">
          
          {/* Telegram Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
                ✈️
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {selectedComplaint ? selectedComplaint.telegramGroup : 'SiAP – Telegram Ops'}
                </h4>
                <span className="text-[11px] text-emerald-400 font-medium">● Bot Interaktif SiAP</span>
              </div>
            </div>

            <span className="text-xs text-slate-400 font-mono">SiAP Bot v2.5</span>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.sender === 'officer' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-line shadow-md ${
                    msg.sender === 'officer'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white/10 text-slate-100 border border-white/10 rounded-bl-xs font-sans backdrop-blur-md'
                  }`}
                >
                  {msg.isHtml ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: msg.text }}
                      className="space-y-1 [&>b]:font-bold [&>code]:bg-white/20 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:font-mono [&>i]:italic"
                    />
                  ) : (
                    <p>{msg.text}</p>
                  )}

                  {/* Inline Telegram Interactive Buttons */}
                  {msg.buttons && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
                      {msg.buttons.map((btn, bIdx) => (
                        <button
                          key={bIdx}
                          onClick={() => handleButtonClick(btn)}
                          className="py-2 px-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 text-sky-200 font-bold text-[11px] text-center border border-sky-400/30 transition-all cursor-pointer shadow-xs active:scale-96 flex items-center justify-center gap-1"
                        >
                          {btn.label}
                          {btn.action === 'VIEW' && <ExternalLink className="w-3 h-3 inline ml-1 opacity-70" />}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="block text-right text-[10px] text-slate-400 mt-2">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Chat input footer */}
          <div className="pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-slate-400">
            <span className="text-[11px]">
              Setiap pilihan status dikemas kini secara automatik ke dalam database Supabase & menghantar emel status.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
