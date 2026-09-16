import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  User,
  MapPin,
  Calendar,
  Send,
  Star,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  Printer,
} from 'lucide-react';
import { RATING_SCALE, STATUS_CONFIG } from '../data/categories';
import { Complaint, ComplaintStatus, TindakanItem } from '../types';

interface ComplaintTrackerProps {
  initialRef?: string;
  onNavigateToCreate?: () => void;
}

export const ComplaintTracker: React.FC<ComplaintTrackerProps> = ({
  initialRef = '',
  onNavigateToCreate,
}) => {
  const [refInput, setRefInput] = useState(initialRef);
  const [searchedRef, setSearchedRef] = useState(initialRef);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [tindakanList, setTindakanList] = useState<TindakanItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Rating state
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [ulasan, setUlasan] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState<string | null>(null);

  const fetchComplaint = async (ref: string) => {
    if (!ref.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setRatingSuccessMsg(null);

    try {
      const res = await fetch(`/api/complaints/${encodeURIComponent(ref.trim())}`);
      let data: any = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: 'Format respons tidak sah.' };
      }

      if (!res.ok) {
        throw new Error(data?.error || 'Aduan tidak dijumpai.');
      }

      if (data?.complaint) {
        setComplaint(data.complaint);
        setTindakanList(data.tindakanList || []);
        setSearchedRef(ref.trim());
        if (data.complaint.rating) {
          setSelectedRating(data.complaint.rating);
          setUlasan(data.complaint.ulasanPelanggan || '');
        } else {
          setSelectedRating(null);
          setUlasan('');
        }
      } else {
        throw new Error('Aduan tidak dijumpai.');
      }
    } catch (err: any) {
      setComplaint(null);
      setTindakanList([]);
      setErrorMsg(err.message || 'Gagal menyemak aduan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialRef) {
      setRefInput(initialRef);
      fetchComplaint(initialRef);
    }
  }, [initialRef]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaint(refInput);
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !selectedRating) return;

    setIsSubmittingRating(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/complaints/${complaint.noRujukan}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: selectedRating,
          ulasan,
        }),
      });

      let data: any = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: 'Format respons tidak sah.' };
      }

      if (!res.ok) {
        throw new Error(data?.error || 'Gagal menghantar penilaian.');
      }

      setComplaint(data.complaint);
      setRatingSuccessMsg(data.message || 'Penilaian kepuasan berjaya direkodkan. Terima kasih!');

      // Confetti
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (err) {}
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const currentStatusConfig = complaint ? STATUS_CONFIG[complaint.status] : null;

  // Timeline definition
  const timelineSteps = [
    { key: 'MENUNGGU', label: 'Aduan Diterima', index: 0 },
    { key: 'DALAM_SEMAKAN', label: 'Dalam Semakan', index: 1 },
    { key: 'DALAM_TINDAKAN', label: 'Dalam Tindakan', index: 2 },
    {
      key: 'SELESAI',
      label: complaint?.status === 'TIDAK_DAPAT_DISELESAIKAN'
        ? 'Tidak Dapat Diselesaikan'
        : 'Selesai / Tidak Dapat Diselesaikan',
      index: 3,
    },
  ];

  const getStepStatus = (stepIndex: number) => {
    if (!complaint) return 'upcoming';
    if (complaint.status === 'TIDAK_DAPAT_DISELESAIKAN') {
      if (stepIndex < 3) return 'completed';
      return 'failed';
    }
    const currentStepIndex = currentStatusConfig ? currentStatusConfig.stepIndex : 0;
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'upcoming';
  };

  const handlePrintReport = () => {
    if (!complaint) return;
    const printWin = window.open('', '_blank');
    if (!printWin) {
      window.print();
      return;
    }

    const tindakanRows = tindakanList.length > 0
      ? tindakanList.map((t) => `
          <tr>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-family: monospace; white-space: nowrap;">${t.tarikhMasa || '-'}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #1e293b;">${t.namaPegawai || 'Pegawai Bertugas'}</td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px;"><span style="display: inline-block; padding: 2px 8px; border-radius: 6px; font-weight: bold; background: #e0f2fe; color: #0369a1;">${t.status}</span></td>
            <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #334155; line-height: 1.4;">${t.catatanTindakan || '-'}</td>
          </tr>
        `).join('')
      : `<tr><td colspan="4" style="padding: 16px; text-align: center; color: #94a3b8; font-style: italic;">Tiada catatan tindakan tambahan direkodkan.</td></tr>`;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Rasmi Aduan ${complaint.noRujukan}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #0f172a; margin: 0; background: #fff; }
          .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 22px; color: #1e3a8a; letter-spacing: -0.5px; }
          .header p { margin: 4px 0 0 0; font-size: 13px; color: #64748b; font-weight: 500; }
          .badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .status-SELESAI { background: #dcfce7; color: #15803d; }
          .status-TIDAK_DAPAT_DISELESAIKAN { background: #ffe4e6; color: #be123c; }
          .status-DALAM_TINDAKAN { background: #ffedd5; color: #c2410c; }
          .status-DALAM_SEMAKAN { background: #dbeafe; color: #1d4ed8; }
          .status-MENUNGGU { background: #fef9c3; color: #a16207; }
          .section-title { font-size: 13px; font-weight: bold; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px; margin: 18px 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
          .grid { display: table; width: 100%; border-collapse: collapse; margin-bottom: 12px; }
          .row { display: table-row; }
          .col-label { display: table-cell; width: 28%; padding: 7px 10px; font-size: 13px; font-weight: 600; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; }
          .col-val { display: table-cell; width: 72%; padding: 7px 10px; font-size: 13px; color: #0f172a; border: 1px solid #e2e8f0; }
          table.history-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          table.history-table th { background: #f1f5f9; padding: 8px 12px; text-align: left; font-size: 12px; font-weight: bold; color: #475569; border: 1px solid #cbd5e1; }
          table.history-table td { border: 1px solid #e2e8f0; }
          .footer { margin-top: 36px; border-top: 1px solid #cbd5e1; padding-top: 10px; text-align: center; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SiAP – SISTEM ADUAN PELANGGAN</h1>
          <p>LAPORAN PENUH & SEJARAH TINDAKAN ADUAN</p>
        </div>

        <div class="section-title">1. MAKLUMAT UTAMA ADUAN</div>
        <div class="grid">
          <div class="row"><div class="col-label">No. Rujukan:</div><div class="col-val" style="font-family: monospace; font-size: 15px; font-weight: bold; color: #2563eb;">${complaint.noRujukan}</div></div>
          <div class="row"><div class="col-label">Status Semasa:</div><div class="col-val"><span class="badge status-${complaint.status}">${currentStatusConfig?.label || complaint.status}</span></div></div>
          <div class="row"><div class="col-label">Kategori Aduan:</div><div class="col-val">${complaint.kategoriNama}</div></div>
          <div class="row"><div class="col-label">Tajuk Aduan:</div><div class="col-val"><strong>${complaint.tajukAduan}</strong></div></div>
          <div class="row"><div class="col-label">Lokasi Kejadian:</div><div class="col-val">${complaint.lokasi}</div></div>
          <div class="row"><div class="col-label">Tarikh & Masa Aduan:</div><div class="col-val">${complaint.tarikhMasa}</div></div>
          <div class="row"><div class="col-label">Nama Pengadu:</div><div class="col-val">${complaint.namaPengadu} (${complaint.telefon})</div></div>
          <div class="row"><div class="col-label">Emel Pengadu:</div><div class="col-val">${complaint.emel}</div></div>
          <div class="row"><div class="col-label">Pegawai Bertugas (PIC):</div><div class="col-val">${complaint.namaPegawai || 'Pegawai Bertugas'}</div></div>
        </div>

        <div class="section-title">2. BUTIRAN ADUAN PENGADU</div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-size: 13px; line-height: 1.6; white-space: pre-wrap; color: #1e293b; margin-bottom: 14px;">${complaint.butiranAduan}</div>

        <div class="section-title">3. SEJARAH TINDAKAN & CATATAN PEGAWAI</div>
        <table class="history-table">
          <thead>
            <tr>
              <th style="width: 22%;">Tarikh & Masa</th>
              <th style="width: 25%;">Pegawai Bertugas</th>
              <th style="width: 18%;">Status</th>
              <th style="width: 35%;">Catatan Tindakan</th>
            </tr>
          </thead>
          <tbody>
            ${tindakanRows}
          </tbody>
        </table>

        ${complaint.rating ? `
          <div class="section-title" style="margin-top: 20px;">4. PENILAIAN MAKLUM BALAS PELANGGAN</div>
          <div class="grid">
            <div class="row"><div class="col-label">Tahap Kepuasan:</div><div class="col-val"><strong>${complaint.rating} / 5 Bintang</strong></div></div>
            <div class="row"><div class="col-label">Ulasan Pelanggan:</div><div class="col-val">${complaint.ulasanPelanggan || 'Tiada ulasan tambahan.'}</div></div>
            <div class="row"><div class="col-label">Tarikh Penilaian:</div><div class="col-val">${complaint.ratingTarikh || '-'}</div></div>
          </div>
        ` : ''}

        <div class="footer">
          Laporan dijana secara automatik oleh SiAP (Sistem Aduan Pelanggan) pada: ${new Date().toLocaleString('ms-MY')}
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Search Header Card - Frosted Glass (HANYA DIPAPARKAN JIKA TIADA ADUAN DIBUKA) */}
      {!complaint && (
        <div className="glass-card rounded-3xl border border-white/80 shadow-2xl p-6 sm:p-10">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-white/80 px-3.5 py-1.5 rounded-full border border-white/90 shadow-xs backdrop-blur-md">
              Semakan Terus 24/7
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              Semak Status Aduan
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Masukkan Nombor Rujukan unik yang anda terima semasa menghantar aduan.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto mb-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="tracker-input-ref"
                  type="text"
                  required
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value)}
                  placeholder="cth: SIAP-2026-00001"
                  className="w-full pl-11 pr-4 py-3.5 text-sm text-slate-900 glass-input rounded-xl focus:outline-none transition-all font-mono font-bold uppercase shadow-inner"
                />
              </div>
              <button
                id="tracker-btn-submit"
                type="submit"
                disabled={isLoading}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white text-sm font-bold shadow-xl shadow-emerald-500/25 transition-all shrink-0 cursor-pointer disabled:opacity-50 border border-white/20"
              >
                {isLoading ? 'Menyemak...' : 'SEMAK STATUS'}
              </button>
            </div>
          </form>

          {/* Sample chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">Contoh Nombor Rujukan:</span>
            {['SIAP-2026-00001', 'SIAP-2026-00002', 'SIAP-2026-00003', 'SIAP-2026-00004', 'SIAP-2026-00005'].map((sRef) => (
              <button
                key={sRef}
                type="button"
                onClick={() => {
                  setRefInput(sRef);
                  fetchComplaint(sRef);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/70 hover:bg-white hover:text-emerald-700 text-slate-700 font-mono text-[11px] font-bold border border-white/80 transition-all shadow-xs"
              >
                {sRef}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="mt-6 p-4 rounded-2xl bg-red-50/80 backdrop-blur-md border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 max-w-xl mx-auto shadow-xs">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Aduan Tidak Dijumpai</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* COMPLAINT DETAILS DISPLAY */}
      {complaint && (
        <div className="space-y-6">
          
          {/* Navigation Bar / Reset Search */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setComplaint(null);
                setRefInput('');
                setSearchedRef('');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/80 hover:bg-white text-slate-700 text-xs font-bold border border-white/90 shadow-xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Semak Nombor Rujukan Lain</span>
            </button>
            <span className="text-xs font-mono font-bold text-slate-500">
              {complaint.noRujukan}
            </span>
          </div>

          {/* Main Status Header Card - Frosted Glass */}
          <div className="glass-card rounded-3xl border border-white/80 shadow-2xl p-6 sm:p-8">
            
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

              {/* Actions & Status Badge */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handlePrintReport}
                  title="Cetak Laporan Lengkap Aduan"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-700 bg-white/80 hover:bg-white border border-white/90 shadow-xs backdrop-blur-md transition-all hover:scale-105 active:scale-95"
                >
                  <Printer className="w-4 h-4 text-blue-600" />
                  <span>Cetak Laporan</span>
                </button>
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
                <span className="font-bold text-slate-800">{complaint.namaPengadu}</span>
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
              <div className="mt-4 p-3 bg-white/70 backdrop-blur-xs rounded-xl border border-white/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold">{complaint.lampiranNama || 'Fail Lampiran Disertakan'}</span>
                </div>
                {complaint.lampiranDriveUrl ? (
                  <a
                    href={complaint.lampiranDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 transition-all flex items-center gap-1"
                  >
                    <span>Buka Lampiran</span>
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
          <div className="glass-card rounded-3xl border border-white/80 shadow-2xl p-6 sm:p-8">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Sejarah Tindakan & Catatan Pegawai</span>
            </h3>

            {tindakanList.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                Belum ada catatan tindakan tambahan daripada pegawai setakat ini.
              </p>
            ) : (
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-white/60">
                {tindakanList.map((item, i) => (
                  <div key={item.id || i} className="relative flex items-start gap-4 pl-8">
                    <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-100" />
                    <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/80 w-full text-xs shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                        <span className="font-bold text-slate-900">
                          {item.namaPegawai}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {item.tarikhMasa}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {item.catatanTindakan}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 18. PENILAIAN KEPUASAN (HANYA APABILA STATUS SELESAI) */}
          {complaint.status === 'SELESAI' && (
            <div className="glass-card rounded-3xl border border-amber-300/80 shadow-2xl p-6 sm:p-8">
              <div className="text-center max-w-xl mx-auto mb-6">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-white/80 px-3.5 py-1.5 rounded-full border border-white/90 shadow-xs backdrop-blur-md">
                  Penilaian Perkhidmatan
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-3">
                  Apa Penilaian Anda?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Aduan anda telah berjaya diselesaikan. Sila kongsikan maklum balas anda untuk membantu meningkatkan mutu perkhidmatan kami.
                </p>
              </div>

              {ratingSuccessMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50/80 backdrop-blur-md border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2 max-w-xl mx-auto shadow-xs">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-bold">{ratingSuccessMsg}</span>
                </div>
              )}

              {complaint.rating ? (
                /* Already Rated */
                <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-white/80 max-w-xl mx-auto text-center space-y-3 shadow-sm">
                  <div className="text-4xl">
                    {RATING_SCALE.find((r) => r.value === complaint.rating)?.emoji || '⭐'}
                  </div>
                  <div className="text-base font-extrabold text-slate-900">
                    Rating Anda: {complaint.rating} / 5 ({RATING_SCALE.find((r) => r.value === complaint.rating)?.label})
                  </div>
                  {complaint.ulasanPelanggan && (
                    <p className="text-xs text-slate-600 italic bg-white/50 backdrop-blur-xs p-3.5 rounded-xl border border-white/70">
                      "{complaint.ulasanPelanggan}"
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 font-semibold">
                    ✓ Penilaian telah direkodkan ke dalam pangkalan data SiAP.
                  </p>
                </div>
              ) : (
                /* Rating Submission Form */
                <form onSubmit={handleRatingSubmit} className="max-w-xl mx-auto space-y-5">
                  
                  {/* Emoji selector */}
                  <div className="grid grid-cols-5 gap-2 sm:gap-3">
                    {RATING_SCALE.map((scale) => {
                      const isSelected = selectedRating === scale.value;
                      return (
                        <button
                          type="button"
                          key={scale.value}
                          id={`btn-rating-${scale.value}`}
                          onClick={() => setSelectedRating(scale.value)}
                          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                            isSelected
                              ? 'border-blue-500 bg-white/95 ring-2 ring-blue-400/30 scale-105 shadow-md'
                              : 'border-white/60 bg-white/40 backdrop-blur-sm hover:bg-white/70'
                          }`}
                        >
                          <span className="text-3xl mb-1">{scale.emoji}</span>
                          <span className="text-[10px] sm:text-xs font-bold text-slate-800 leading-tight">
                            {scale.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Comments textarea */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Ulasan Tambahan (Pilihan)
                    </label>
                    <textarea
                      id="input-ulasan-pelanggan"
                      rows={3}
                      value={ulasan}
                      onChange={(e) => setUlasan(e.target.value)}
                      placeholder="Kongsi pengalaman anda tentang kepantasan atau hasil tindakan pegawai..."
                      className="w-full px-3.5 py-2.5 text-sm text-slate-900 glass-input rounded-xl focus:outline-none transition-all"
                    />
                  </div>

                  <button
                    id="btn-hantar-penilaian-submit"
                    type="submit"
                    disabled={!selectedRating || isSubmittingRating}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmittingRating ? 'Menghantar Penilaian...' : 'HANTAR PENILAIAN'}</span>
                  </button>

                </form>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
};

