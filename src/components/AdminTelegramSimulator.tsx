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
} from 'lucide-react';
import { STATUS_CONFIG } from '../data/categories';
import { Complaint, ComplaintStatus, TindakanItem } from '../types';

interface AdminTelegramSimulatorProps {
  complaints: Complaint[];
  onRefreshComplaints: () => void;
}

export const AdminTelegramSimulator: React.FC<AdminTelegramSimulatorProps> = ({
  complaints,
  onRefreshComplaints,
}) => {
  const [selectedRef, setSelectedRef] = useState<string>(complaints[0]?.noRujukan || '');
  const [officerName, setOfficerName] = useState('Pegawai Pembangunan');
  const [officerId, setOfficerId] = useState('tg_8892');
  const [catatanText, setCatatanText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus>('DALAM_TINDAKAN');
  
  const [chatMessages, setChatMessages] = useState<Array<{
    sender: 'bot' | 'officer' | 'system';
    text: string;
    time: string;
    isHtml?: boolean;
    buttons?: string[];
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

    const isClaimed = Boolean(selectedComplaint.namaPegawai && selectedComplaint.status !== 'MENUNGGU');
    const claimer = selectedComplaint.namaPegawai || 'Pegawai Bertugas';
    const nowTime = selectedComplaint.tarikhMasa.split(' ')[1] || '12:00';

    const cardText =
      `🚨 <b>ADUAN BAHARU – SiAP</b>\n` +
      `<b>No. Rujukan:</b> <code>${selectedComplaint.noRujukan}</code>\n` +
      `🏢 <b>Kategori:</b> ${selectedComplaint.kategoriNama}\n` +
      `📝 <b>Tajuk:</b> ${selectedComplaint.tajukAduan}\n` +
      `📍 <b>Lokasi:</b> ${selectedComplaint.lokasi}\n` +
      `👤 <b>Pengadu:</b> ${selectedComplaint.namaPengadu} (${selectedComplaint.telefon || '-'})\n` +
      `<b>Status:</b> ${STATUS_CONFIG[selectedComplaint.status]?.emoji || '🟡'} ${STATUS_CONFIG[selectedComplaint.status]?.label || 'MENUNGGU TINDAKAN'}\n\n` +
      `<b>Butiran:</b> ${selectedComplaint.butiranAduan}`;

    const initialCard = {
      sender: 'bot' as const,
      text: cardText,
      time: nowTime,
      isHtml: true,
      buttons: isClaimed
        ? ['👁 LIHAT ADUAN', `🔒 DIAMBIL: ${claimer}`]
        : ['👁 LIHAT ADUAN', '✋ AMBIL TINDAKAN'],
    };

    const logs: typeof chatMessages = [initialCard];

    if (isClaimed) {
      logs.push({
        sender: 'bot',
        text:
          `🟠 <b>ADUAN TELAH DIAMBIL</b>\n\n` +
          `<b>No. Rujukan:</b> <code>${selectedComplaint.noRujukan}</code>\n` +
          `<b>Status:</b> 🟠 DALAM TINDAKAN\n` +
          `<b>Pegawai Bertugas:</b> ${claimer}\n` +
          `<b>Masa Diambil:</b> ${selectedComplaint.tarikhDiambilTindakan || selectedComplaint.tarikhMasa}\n\n` +
          `<i>Aduan ini kini sedang dikendalikan oleh ${claimer}.</i>`,
        time: (selectedComplaint.tarikhDiambilTindakan || '').split(' ')[1] || nowTime,
        isHtml: true,
      });
    }

    if (selectedComplaint.status === 'SELESAI') {
      logs.push({
        sender: 'bot',
        text:
          `🟢 <b>ADUAN SELESAI</b>\n\n` +
          `<b>No. Rujukan:</b> <code>${selectedComplaint.noRujukan}</code>\n` +
          `<b>Status:</b> 🟢 SELESAI\n` +
          `<b>Pegawai Bertugas:</b> ${claimer}\n` +
          `<b>Tindakan Akhir:</b> ${selectedComplaint.tindakanTerkini || 'Tindakan selesai'}\n` +
          `<b>Tarikh Selesai:</b> ${selectedComplaint.tarikhSelesai || '-'}`,
        time: (selectedComplaint.tarikhSelesai || '').split(' ')[1] || nowTime,
        isHtml: true,
      });
    }

    setChatMessages(logs);
  }, [selectedRef, selectedComplaint?.status, selectedComplaint?.namaPegawai, selectedComplaint?.tindakanTerkini]);

  const handleAction = async (action: 'AMBIL_TINDAKAN' | 'KEMASKINI_STATUS' | 'TAMBAH_TINDAKAN' | 'SELESAIKAN') => {
    if (!selectedComplaint) return;
    setIsLoading(true);
    setFeedback(null);

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append officer outgoing bubble immediately
    const userLog: (typeof chatMessages)[0] = {
      sender: 'officer',
      time: now,
      text:
        action === 'AMBIL_TINDAKAN'
          ? `[Menekan butang: ✋ AMBIL TINDAKAN]`
          : action === 'TAMBAH_TINDAKAN'
          ? `📝 Tambah Catatan: "${catatanText}"`
          : action === 'KEMASKINI_STATUS'
          ? `🔄 Tukar Status: ${selectedStatus}`
          : `✅ Menandakan Aduan Sebagai Selesai`,
    };

    setChatMessages((prev) => [...prev, userLog]);

    try {
      const res = await fetch('/api/telegram/simulate-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          noRujukan: selectedComplaint.noRujukan,
          telegramUserId: officerId,
          namaPegawai: officerName,
          newStatus: action === 'KEMASKINI_STATUS' ? selectedStatus : action === 'SELESAIKAN' ? 'SELESAI' : undefined,
          catatan: action === 'TAMBAH_TINDAKAN' || action === 'SELESAIKAN' ? catatanText || undefined : undefined,
        }),
      });

      const data = await res.json();
      const botReply = data.replyMessage || data.message || (data.success ? 'Tindakan berjaya disimpan.' : data.error);

      // Append bot incoming reply bubble
      if (botReply) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: botReply,
            time: now,
            isHtml: true,
          },
        ]);
      }

      if (action === 'TAMBAH_TINDAKAN') {
        setCatatanText('');
      }

      setFeedback(data.message || (data.success ? 'Tindakan berjaya diproses.' : data.error));
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

  const handleCardButtonClick = (buttonText: string) => {
    if (!selectedComplaint) return;
    if (buttonText.includes('LIHAT')) {
      const url = `${window.location.origin}/?ref=${encodeURIComponent(selectedComplaint.noRujukan)}`;
      window.open(url, '_blank');
    } else if (buttonText.includes('AMBIL')) {
      handleAction('AMBIL_TINDAKAN');
    } else if (buttonText.includes('DIAMBIL')) {
      const officer = selectedComplaint.namaPegawai || 'Pegawai Bertugas';
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `ℹ️ <b>PERHATIAN:</b> Aduan <code>${selectedComplaint.noRujukan}</code> telah pun diambil oleh <b>${officer}</b>.`,
          time: now,
          isHtml: true,
        },
      ]);
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
              Pusat Operasi Pegawai (Telegram Bot Simulator)
            </div>
            <h2 className="text-2xl font-black text-white">
              Pusat Operasi Pegawai Melalui Telegram
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
              <strong>KONSEP PENTING:</strong> Pegawai <u>TIDAK LOGIN</u> ke sistem SiAP. Pegawai bertindak secara eksklusif melalui Telegram Group untuk menerima notifikasi, mengambil aduan, mengemaskini status, dan menyelesaikan tiket.
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
            <User className="w-5 h-5 text-blue-600" />
            <span>Panel Tindakan Pegawai Telegram</span>
          </h3>

          {/* Officer Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 text-xs shadow-inner">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Identiti Pegawai:</label>
              <select
                value={officerName}
                onChange={(e) => {
                  setOfficerName(e.target.value);
                  setOfficerId(`tg_${Math.floor(1000 + Math.random() * 9000)}`);
                }}
                className="w-full p-2.5 glass-input rounded-xl focus:outline-none font-semibold text-slate-800"
              >
                <option value="Pegawai Pembangunan">Pegawai Pembangunan (Kemudahan)</option>
                <option value="Pegawai ICT">Pegawai ICT (Sistem & IT)</option>
                <option value="Pegawai Perhubungan Pelanggan">Pegawai Perhubungan Pelanggan (Perkhidmatan & Lain-lain)</option>
                <option value="Pegawai Kebersihan">Pegawai Kebersihan (Kebersihan)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Aduan:</label>
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
                Pegawai Semasa:{' '}
                <strong>{selectedComplaint.namaPegawai || 'Belum diambil'}</strong>
              </p>
            </div>
          )}

          {/* Action 1: Ambil Tindakan */}
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Butang "Ambil Tindakan"
            </h4>
            <button
              onClick={() => handleAction('AMBIL_TINDAKAN')}
              disabled={isLoading || (selectedComplaint && selectedComplaint.status !== 'MENUNGGU')}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 text-white font-bold text-xs shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 border border-white/20"
            >
              <span>✋ AMBIL TINDAKAN (Lock Aduan & Tukar Status → Dalam Tindakan)</span>
            </button>
          </div>

          {/* Action 2: Tambah Tindakan Catatan */}
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              2. Butang "Tambah Tindakan"
            </h4>
            <div className="space-y-2">
              <input
                type="text"
                value={catatanText}
                onChange={(e) => setCatatanText(e.target.value)}
                placeholder="cth: Telah membuat pemeriksaan voltan dan fius..."
                className="w-full p-3 text-xs glass-input rounded-xl focus:outline-none"
              />
              <button
                onClick={() => handleAction('TAMBAH_TINDAKAN')}
                disabled={isLoading || !catatanText.trim()}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white font-bold text-xs shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 border border-white/20"
              >
                <span>📝 TAMBAH CATATAN TINDAKAN KE SUPABASE & NOTIFIKASI</span>
              </button>
            </div>
          </div>

          {/* Action 3: Selesaikan Aduan */}
          <div className="pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              3. Butang "Selesai"
            </h4>
            <button
              onClick={() => {
                if (window.confirm('Adakah anda pasti mahu menandakan aduan ini sebagai selesai?')) {
                  handleAction('SELESAIKAN');
                }
              }}
              disabled={isLoading || (selectedComplaint && selectedComplaint.status === 'SELESAI')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-40 text-white font-bold text-xs shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 border border-white/20"
            >
              <Check className="w-4 h-4" />
              <span>✅ YA, SELESAIKAN ADUAN (Tukar Status → Selesai & Hantar Emel)</span>
            </button>
          </div>

        </div>

        {/* Right Column: Telegram Chat Interface Mockup */}
        <div className="lg:col-span-6 bg-slate-900/85 backdrop-blur-xl rounded-3xl p-5 sm:p-6 text-white flex flex-col justify-between h-[600px] border border-white/20 shadow-2xl">
          
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
                <span className="text-[11px] text-emerald-400 font-medium">● Petugas SiAP Bersedia</span>
              </div>
            </div>

            <span className="text-xs text-slate-400 font-mono">SiAP Bot v2.4</span>
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
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-line shadow-md ${
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

                  {/* Inline Telegram Buttons Mockup */}
                  {msg.buttons && (
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
                      {msg.buttons.map((btn, bIdx) => (
                        <button
                          key={bIdx}
                          onClick={() => handleCardButtonClick(btn)}
                          className="py-2 px-2.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/35 text-sky-200 font-bold text-[11px] text-center border border-sky-400/30 transition-all cursor-pointer shadow-xs active:scale-96 flex items-center justify-center gap-1"
                        >
                          {btn}
                          {btn.includes('LIHAT') && <ExternalLink className="w-3 h-3 inline ml-1 opacity-70" />}
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
              Simulator langsung disambungkan ke Supabase & Telegram API sebenar.
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
