import React, { useState, useEffect } from 'react';
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
  Printer,
  Check,
  Star,
  ArrowRight,
} from 'lucide-react';
import { STATUS_CONFIG } from '../data/categories';
import { Complaint, ComplaintStatus, TindakanItem } from '../types';
import { printComplaintReport } from '../utils/printReport';

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

  useEffect(() => {
    fetch(`/api/admin/tindakan/${encodeURIComponent(complaint.noRujukan)}`)
      .then((res) => res.json())
      .then((data) => {
        setTindakanList(data.tindakan || (Array.isArray(data) ? data : []));
        setLoadingTindakan(false);
      })
      .catch(() => setLoadingTindakan(false));
  }, [complaint.noRujukan]);

  const currentStatusConfig = STATUS_CONFIG[complaint.status] || STATUS_CONFIG.MENUNGGU;

  // Timeline definition matching ComplaintTracker
  const timelineSteps = [
    { key: 'MENUNGGU', label: 'Aduan Diterima', index: 0 },
    { key: 'DALAM_SEMAKAN', label: 'Dalam Semakan', index: 1 },
    { key: 'DALAM_TINDAKAN', label: 'Dalam Tindakan', index: 2 },
    {
      key: 'SELESAI',
      label: complaint.status === 'TIDAK_DAPAT_DISELESAIKAN'
        ? 'Tidak Dapat Diselesaikan'
        : 'Selesai / Tidak Dapat Diselesaikan',
      index: 3,
    },
  ];

  const getStepStatus = (stepIndex: number) => {
    if (complaint.status === 'TIDAK_DAPAT_DISELESAIKAN') {
      if (stepIndex < 3) return 'completed';
      return 'failed';
    }
    const currentStepIndex = currentStatusConfig ? currentStatusConfig.stepIndex : 0;
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'upcoming';
  };

  const handlePrint = () => {
    printComplaintReport(complaint, tindakanList);
  };

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-white/80">
        
        {/* Sticky Header Bar with Close Button */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-xl px-6 py-4 border-b border-white/80 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Paparan Butiran Aduan
            </span>
            <span className="text-xs font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              {complaint.noRujukan}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              title="Cetak Laporan Lengkap Aduan"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Cetak Laporan</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Matching ComplaintTracker.tsx Visual Structure */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {updateMsg && (
            <div className="p-3.5 rounded-2xl bg-blue-50/90 backdrop-blur-md border border-blue-200 text-blue-900 text-xs font-semibold flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>{updateMsg}</span>
            </div>
          )}

          {/* Main Status Header Card */}
          <div className="glass-card rounded-3xl border border-white/80 shadow-lg p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/60">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    No. Rujukan
                  </span>
                  <span className="text-lg font-black font-mono text-blue-600">
                    {complaint.noRujukan}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {complaint.tajukAduan}
                </h2>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold border ${currentStatusConfig?.badgeBg} backdrop-blur-md shadow-xs`}
                >
                  <span className="text-base">{currentStatusConfig?.emoji}</span>
                  <span>{currentStatusConfig?.label}</span>
                </span>
              </div>
            </div>

            {/* TIMELINE PROGRESS STEPPER */}
            <div className="py-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6 text-center">
                Aliran Status Tindakan
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
                {timelineSteps.map((step, idx) => {
                  const status = getStepStatus(step.index);
                  return (
                    <div key={step.key} className="flex flex-col items-center text-center relative">
                      
                      {/* Step Circle */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all mb-2 ${
                          status === 'completed'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                            : status === 'failed'
                            ? 'bg-rose-600 text-white ring-4 ring-rose-100 shadow-md shadow-rose-500/20'
                            : status === 'current'
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md shadow-blue-500/20 animate-pulse'
                            : 'bg-white/60 text-slate-400 border border-white/80 backdrop-blur-xs'
                        }`}
                      >
                        {status === 'completed' ? (
                          <Check className="w-5 h-5" />
                        ) : status === 'failed' ? (
                          <AlertCircle className="w-5 h-5" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>

                      <span
                        className={`text-xs font-bold ${
                          status === 'current'
                            ? 'text-blue-600'
                            : status === 'completed'
                            ? 'text-slate-800'
                            : status === 'failed'
                            ? 'text-rose-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 text-xs shadow-inner">
              <div>
                <span className="text-slate-500 font-semibold block mb-1">Kategori:</span>
                <span className="font-bold text-slate-800">{complaint.kategoriNama}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block mb-1">Lokasi:</span>
                <span className="font-bold text-slate-800">{complaint.lokasi}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block mb-1">Tarikh Kejadian:</span>
                <span className="font-bold text-slate-800">{complaint.tarikhKejadian}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block mb-1">Tarikh Diterima:</span>
                <span className="font-medium text-slate-800">{complaint.tarikhMasa}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block mb-1">Pengadu:</span>
                <span className="font-bold text-slate-800">{complaint.namaPengadu} ({complaint.telefon})</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block mb-1">Pegawai Bertugas:</span>
                <span className="font-bold text-slate-800">
                  {complaint.namaPegawai ? `👤 ${complaint.namaPegawai}` : '🟡 Belum Diambil (Menunggu)'}
                </span>
              </div>
            </div>

            {/* Butiran Aduan Pengadu */}
            <div className="mt-5 p-5 bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 shadow-xs">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Butiran Aduan Pengadu:
              </span>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                {complaint.butiranAduan}
              </p>
            </div>

            {/* Lampiran Info */}
            {(complaint.lampiran || complaint.lampiranNama || complaint.lampiranDriveUrl) && (
              <div className="mt-4 p-3.5 bg-white/70 backdrop-blur-xs rounded-xl border border-white/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold">{complaint.lampiranNama || 'Fail Lampiran Disertakan'}</span>
                </div>
                {complaint.lampiranDriveUrl ? (
                  <a
                    href={complaint.lampiranDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 transition-all flex items-center gap-1 shadow-xs active:scale-95"
                  >
                    <span>Buka Lampiran Google Drive</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Tersimpan di Arkib SiAP
                  </span>
                )}
              </div>
            )}

          </div>

          {/* SEJARAH TINDAKAN PEGAWAI */}
          <div className="glass-card rounded-3xl border border-white/80 shadow-lg p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Sejarah Tindakan & Catatan Pegawai</span>
              </h3>

              {complaint.namaPegawai && (
                <button
                  onClick={handleResetOfficer}
                  disabled={isUpdating}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200 cursor-pointer shadow-xs active:scale-95 transition-all"
                >
                  Lepaskan Pegawai
                </button>
              )}
            </div>

            {loadingTindakan ? (
              <p className="text-xs text-slate-400 italic">Memuatkan sejarah tindakan...</p>
            ) : tindakanList.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                Belum ada catatan tindakan tambahan daripada pegawai setakat ini.
              </p>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-white/60">
                {tindakanList.map((t, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 pl-1">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs z-10 shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                        <span className="text-xs font-bold text-slate-900">
                          {t.namaPegawai}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {t.status}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {t.tarikhMasa}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {t.catatanTindakan || '-'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Penilaian Kepuasan Pelanggan (jika ada) */}
          {complaint.rating && (
            <div className="glass-card rounded-3xl border border-white/80 shadow-lg p-6 sm:p-8">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Penilaian Maklum Balas Pelanggan</span>
              </h3>
              <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (complaint.rating || 0)
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-800 ml-1.5">
                      {complaint.rating} / 5 Bintang
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">
                    "{complaint.ulasanPelanggan || 'Tiada ulasan tambahan.'}"
                  </p>
                </div>
                {complaint.ratingTarikh && (
                  <span className="text-[11px] font-mono text-slate-400">
                    {complaint.ratingTarikh}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* AI Smart Diagnosis (Gemini) */}
          <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-white/40 backdrop-blur-md p-6 rounded-3xl border border-indigo-200/80 text-xs shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-indigo-950 text-sm">Analisis Pintar AI (Gemini)</span>
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
              <div className="space-y-2.5 text-slate-800 bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-indigo-100 shadow-xs">
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
          <div className="bg-white/60 backdrop-blur-sm p-6 rounded-3xl border border-white/80 text-xs space-y-4 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm">Kemaskini Manual Status / Catatan Pentadbir</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Tukar Status:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                  className="w-full p-3 glass-input rounded-xl focus:outline-none font-bold"
                >
                  <option value="MENUNGGU">🟡 Menunggu Tindakan</option>
                  <option value="DALAM_SEMAKAN">🔵 Dalam Semakan</option>
                  <option value="DALAM_TINDAKAN">🟠 Dalam Tindakan</option>
                  <option value="SELESAI">🟢 Selesai</option>
                  <option value="TIDAK_DAPAT_DISELESAIKAN">🔴 Tidak Dapat Diselesaikan</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Catatan Pentadbir (Pilihan):</label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="cth: Arahan disalurkan kepada unit senggara..."
                  className="w-full p-3 glass-input rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xl shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 active:scale-98 border border-white/20"
            >
              {isUpdating ? 'Sedang Mengemaskini...' : 'Simpan Kemaskini Pentadbir'}
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-white/70 backdrop-blur-md px-6 py-4 border-t border-white/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold text-slate-700 hover:bg-white bg-white/80 rounded-xl border border-white/80 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
