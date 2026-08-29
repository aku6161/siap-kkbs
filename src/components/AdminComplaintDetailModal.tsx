import React, { useState } from 'react';
import {
  X,
  Clock,
  User,
  MapPin,
  Calendar,
  Send,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  ExternalLink,
  FolderOpen,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { STATUS_CONFIG } from '../data/categories';
import { Complaint, ComplaintStatus, TindakanItem } from '../types';

interface AdminComplaintDetailModalProps {
  complaint: Complaint;
  onClose: () => void;
  onUpdate: () => void;
}

export const AdminComplaintDetailModal: React.FC<AdminComplaintDetailModalProps> = ({
  complaint,
  onClose,
  onUpdate,
}) => {
  const [tindakanList, setTindakanList] = useState<TindakanItem[]>([]);
  const [loadingTindakan, setLoadingTindakan] = useState(true);
  
  const [newStatus, setNewStatus] = useState<ComplaintStatus>(complaint.status);
  const [adminNote, setAdminNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  // Gemini AI Analysis
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  React.useEffect(() => {
    fetch(`/api/admin/tindakan/${complaint.noRujukan}`)
      .then((res) => res.json())
      .then((data) => {
        setTindakanList(data || []);
        setLoadingTindakan(false);
      })
      .catch(() => setLoadingTindakan(false));
  }, [complaint.noRujukan]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setUpdateMsg(null);
    try {
      const res = await fetch(`/api/admin/complaints/${complaint.noRujukan}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminNote: adminNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setUpdateMsg('Aduan berjaya dikemaskini oleh pentadbir.');
        setAdminNote('');
        onUpdate();
      } else {
        setUpdateMsg(data.error || 'Gagal mengemaskini.');
      }
    } catch (e: any) {
      setUpdateMsg(e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetOfficer = async () => {
    if (!window.confirm('Adakah anda pasti mahu melepaskan pegawai yang mengambil aduan ini? Status akan dikembalikan kepada Menunggu Tindakan.')) {
      return;
    }
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/complaints/${complaint.noRujukan}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetOfficer: true }),
      });
      if (res.ok) {
        setUpdateMsg('Pegawai telah dilepaskan dan status disetkan semula kepada Menunggu Tindakan.');
        onUpdate();
      }
    } catch (e: any) {
      setUpdateMsg(e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRunAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/admin/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noRujukan: complaint.noRujukan }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAiAnalysis(data.analysis);
      }
    } catch (e) {
      console.error('AI error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Resolution duration calculation
  const getDurationString = () => {
    if (!complaint.tarikhMasa) return '-';
    const start = new Date(complaint.tarikhMasa).getTime();
    const end = complaint.tarikhSelesai ? new Date(complaint.tarikhSelesai).getTime() : Date.now();
    const diffHours = (end - start) / (1000 * 60 * 60);
    if (diffHours < 1) {
      return `${Math.round(diffHours * 60)} Minit`;
    }
    return `${diffHours.toFixed(1)} Jam`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/80">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-xl px-6 py-5 border-b border-white/80 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-200 text-blue-600 flex items-center justify-center font-bold shadow-xs">
              📑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-black text-blue-600">
                  {complaint.noRujukan}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_CONFIG[complaint.status]?.badgeBg}`}>
                  {STATUS_CONFIG[complaint.status]?.emoji} {STATUS_CONFIG[complaint.status]?.label}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 truncate max-w-md">
                {complaint.tajukAduan}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 bg-white/80 hover:bg-white rounded-xl border border-white/80 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {updateMsg && (
            <div className="p-3.5 rounded-2xl bg-blue-50/90 backdrop-blur-md border border-blue-200 text-blue-900 text-xs font-semibold flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>{updateMsg}</span>
            </div>
          )}

          {/* Details Overview Card */}
          <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/80 text-xs space-y-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-slate-500 font-semibold block mb-1">Pengadu:</span>
                <span className="font-bold text-slate-900">{complaint.namaPengadu}</span>
                <span className="block text-slate-500 text-[11px]">{complaint.emel}</span>
                <span className="block text-slate-500 text-[11px]">{complaint.telefon}</span>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-1">Kategori & Saluran:</span>
                <span className="font-bold text-slate-900">{complaint.kategoriNama}</span>
                <span className="block text-blue-600 font-semibold text-[11px]">{complaint.telegramGroup}</span>
              </div>

              <div>
                <span className="text-slate-500 font-semibold block mb-1">Lokasi & Tarikh:</span>
                <span className="font-bold text-slate-900">{complaint.lokasi}</span>
                <span className="block text-slate-500 text-[11px]">Kejadian: {complaint.tarikhKejadian}</span>
                <span className="block text-slate-500 text-[11px]">Diterima: {complaint.tarikhMasa}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/60">
              <span className="text-slate-500 font-semibold block mb-1">Butiran Aduan Pengadu:</span>
              <p className="text-slate-800 leading-relaxed bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-white/80">
                {complaint.butiranAduan}
              </p>
            </div>

            {/* Lampiran & Google Drive Storage */}
            {(complaint.lampiran || complaint.lampiranDriveUrl || complaint.lampiranNama) && (
              <div className="pt-3 border-t border-white/60">
                <span className="text-slate-500 font-semibold block mb-1">Lampiran & Pautan Google Drive:</span>
                <div className="p-3.5 bg-sky-50/80 backdrop-blur-xs rounded-xl border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-300 text-sky-700 flex items-center justify-center shrink-0">
                      {complaint.lampiran?.startsWith('data:image') ? (
                        <ImageIcon className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">
                        {complaint.lampiranNama || 'Fail Lampiran Aduan'}
                      </p>
                      <p className="text-[11px] text-sky-700">
                        Disimpan di Google Drive Folder Aduan
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a
                      href={complaint.lampiranDriveUrl || 'https://drive.google.com/drive/folders/1bQ1l9Q_Kz0JcUQsGVRxPkWQrj66yq8Qr?usp=sharing'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 w-full sm:w-auto"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Buka di Google Drive</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    {complaint.lampiran && complaint.lampiran.startsWith('data:') && (
                      <a
                        href={complaint.lampiran}
                        download={complaint.lampiranNama || `${complaint.noRujukan}_lampiran`}
                        className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                      >
                        Pratonton
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Time Breakdown */}
            <div className="pt-3 border-t border-white/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500">Masa Diterima:</span>
                <p className="font-bold text-slate-800">{complaint.tarikhMasa || '-'}</p>
              </div>
              <div>
                <span className="text-slate-500">Masa Diambil Tindakan:</span>
                <p className="font-bold text-slate-800">{complaint.tarikhDiambilTindakan || '-'}</p>
              </div>
              <div>
                <span className="text-slate-500">Tempoh Keseluruhan:</span>
                <p className="font-bold text-blue-600">{getDurationString()}</p>
              </div>
            </div>
          </div>

          {/* Pegawai Bertugas & Action History */}
          <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/80 text-xs shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                <span>Pegawai Yang Mengambil Tindakan</span>
              </h3>

              {complaint.namaPegawai && (
                <button
                  onClick={handleResetOfficer}
                  disabled={isUpdating}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/90 px-3 py-1 rounded-xl border border-rose-200 cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  Lepaskan Pegawai
                </button>
              )}
            </div>

            {complaint.namaPegawai ? (
              <div className="p-3.5 bg-emerald-50/80 backdrop-blur-xs border border-emerald-200 rounded-xl mb-4 text-emerald-900 shadow-xs">
                <p className="font-bold">👤 {complaint.namaPegawai}</p>
                <p className="text-[11px] text-emerald-700">
                  Telegram User ID: {complaint.telegramUserId || '-'} • Diambil pada: {complaint.tarikhDiambilTindakan || '-'}
                </p>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50/80 backdrop-blur-xs border border-amber-200 rounded-xl mb-4 text-amber-900 font-medium shadow-xs">
                🟡 Belum ada pegawai yang mengambil aduan ini di Telegram Group.
              </div>
            )}

            {/* Action history */}
            <h4 className="font-bold text-slate-700 mb-2">Sejarah Catatan Tindakan (Sheet TINDAKAN):</h4>
            {loadingTindakan ? (
              <p className="text-slate-400 italic">Memuatkan sejarah tindakan...</p>
            ) : tindakanList.length === 0 ? (
              <p className="text-slate-400 italic">Tiada rekod tindakan lagi.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {tindakanList.map((t, idx) => (
                  <div key={idx} className="p-3 bg-white/80 backdrop-blur-xs border border-white/90 rounded-xl shadow-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-bold text-slate-800">{t.namaPegawai}</span>
                      <span className="font-mono">{t.tarikhMasa}</span>
                    </div>
                    <p className="text-slate-700">{t.catatanTindakan}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Smart Diagnosis (Gemini) */}
          <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-white/40 backdrop-blur-md p-5 rounded-2xl border border-indigo-200/80 text-xs shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-indigo-950">Analisis Pintar AI (Gemini)</span>
              </div>
              <button
                onClick={handleRunAiAnalysis}
                disabled={isAnalyzing}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-indigo-500/20 active:scale-95 border border-white/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAnalyzing ? 'Menganalisis...' : 'Jana Analisis Aduan'}</span>
              </button>
            </div>

            {aiAnalysis ? (
              <div className="space-y-2.5 text-slate-800 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-indigo-100 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Tahap Keutamaan:</span>
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold text-[11px] border border-orange-200">
                    {aiAnalysis.tahapKeutamaan}
                  </span>
                  <span className="text-slate-400">|</span>
                  <span className="font-bold">Anggaran Masa:</span>
                  <span className="font-semibold text-blue-600">{aiAnalysis.anggaranMasaPenyelesaian}</span>
                </div>
                <p className="italic text-slate-600">"{aiAnalysis.analisisRingkas}"</p>
                <div>
                  <span className="font-bold block mb-1">Cadangan Tindakan Pegawai:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {aiAnalysis.cadanganTindakanPegawai?.map((step: string, sIdx: number) => (
                      <li key={sIdx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">
                Gunakan AI untuk mengenal pasti punca masalah, anggaran masa selesai, dan cadangan langkah pembaikan bagi pegawai bertugas.
              </p>
            )}
          </div>

          {/* Admin Manual Override Form */}
          <div className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/80 text-xs space-y-3 shadow-xs">
            <h3 className="font-bold text-slate-900">Kemaskini Manual Status / Catatan Pentadbir</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tukar Status:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                  className="w-full p-2.5 glass-input rounded-xl focus:outline-none font-bold"
                >
                  <option value="MENUNGGU">🟡 Menunggu Tindakan</option>
                  <option value="DALAM_SEMAKAN">🔵 Dalam Semakan</option>
                  <option value="DALAM_TINDAKAN">🟠 Dalam Tindakan</option>
                  <option value="SELESAI">🟢 Selesai</option>
                  <option value="TIDAK_DAPAT_DISELESAIKAN">🔴 Tidak Dapat Diselesaikan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Pentadbir (Pilihan):</label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="cth: Arahan disalurkan kepada unit senggara..."
                  className="w-full p-2.5 glass-input rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xl shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 active:scale-98 border border-white/20"
            >
              {isUpdating ? 'Sedang Mengemaskini...' : 'Simpan Kemaskini Pentadbir'}
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-white/70 backdrop-blur-md px-6 py-4 border-t border-white/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-white bg-white/80 rounded-xl border border-white/80 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
