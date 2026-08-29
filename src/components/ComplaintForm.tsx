import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Building2,
  Laptop,
  UserCheck,
  Sparkles,
  Pin,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Send,
  FileText,
  X,
} from 'lucide-react';
import { CATEGORIES } from '../data/categories';
import { Complaint, ComplaintCategory } from '../types';

interface ComplaintFormProps {
  initialCategory?: ComplaintCategory;
  onSuccess: (complaint: Complaint) => void;
  onCancel: () => void;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({
  initialCategory = 'KEMUDAHAN',
  onSuccess,
  onCancel,
}) => {
  const [namaPengadu, setNamaPengadu] = useState('');
  const [emel, setEmel] = useState('');
  const [telefon, setTelefon] = useState('');
  const [kategori, setKategori] = useState<ComplaintCategory>(initialCategory);
  const [tajukAduan, setTajukAduan] = useState('');
  const [butiranAduan, setButiranAduan] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [tarikhKejadian, setTarikhKejadian] = useState(new Date().toISOString().substring(0, 10));
  const [lampiran, setLampiran] = useState<string | undefined>(undefined);
  const [lampiranNama, setLampiranNama] = useState<string | undefined>(undefined);
  const [isAgreed, setIsAgreed] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [copied, setCopied] = useState(false);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Saiz fail melebihi had maksimum 5MB.');
        return;
      }
      setLampiranNama(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setLampiran(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setLampiran(undefined);
    setLampiranNama(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!namaPengadu.trim() || !emel.trim() || !tajukAduan.trim() || !butiranAduan.trim() || !lokasi.trim()) {
      setErrorMessage('Sila lengkapkan semua medan wajib yang bertanda (*).');
      return;
    }

    if (!isAgreed) {
      setErrorMessage('Sila tandakan pengesahan maklumat sebelum menghantar aduan.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaPengadu,
          telefon,
          emel,
          kategori,
          tajukAduan,
          butiranAduan,
          lokasi,
          tarikhKejadian,
          lampiran,
          lampiranNama,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghantar aduan.');
      }

      setSubmittedComplaint(data.complaint);
      
      // Fire confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // ignore
      }

    } catch (err: any) {
      setErrorMessage(err.message || 'Berlaku ralat rangkaian. Sila cuba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRef = () => {
    if (submittedComplaint?.noRujukan) {
      navigator.clipboard.writeText(submittedComplaint.noRujukan);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // SUCCESS VIEW - Frosted Glass Aesthetics
  if (submittedComplaint) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="glass-card rounded-3xl border border-emerald-300/80 shadow-2xl p-8 sm:p-10 text-center">
          
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-500/15">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Aduan Berjaya Dihantar!
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Maklumat aduan anda telah disimpan dalam pangkalan data dan disalurkan terus kepada kumpulan petugas.
          </p>

          {/* Reference Card */}
          <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-6 mb-6 shadow-inner">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              No. Rujukan Anda
            </p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-black text-blue-600 font-mono tracking-tight">
                {submittedComplaint.noRujukan}
              </span>
              <button
                id="btn-copy-ref-success"
                onClick={handleCopyRef}
                className="p-2 text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white rounded-xl border border-white/90 transition-all shadow-xs"
                title="Salin No Rujukan"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              "Sila simpan nombor rujukan ini untuk membuat semakan."
            </p>
          </div>

          {/* Integration dispatch details */}
          <div className="text-left bg-blue-50/60 backdrop-blur-md rounded-2xl p-4 border border-blue-200/60 text-xs text-slate-700 space-y-2 mb-8">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">Saluran Telegram:</span>
              <span className="font-bold text-blue-700">{submittedComplaint.telegramGroup}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">Notifikasi Emel:</span>
              <span className="font-medium text-slate-900">{submittedComplaint.emel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-600">Status Semasa:</span>
              <span className="font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">🟡 Menunggu Tindakan</span>
            </div>
          </div>

          <button
            id="btn-semak-status-after-submit"
            onClick={() => onSuccess(submittedComplaint)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20 active:scale-98"
          >
            <span>SEMAK STATUS ADUAN</span>
            <ArrowRight className="w-5 h-5" />
          </button>

        </div>
      </div>
    );
  }

  const selectedCategoryConfig = CATEGORIES[kategori];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      
      {/* Header card - Frosted Glass */}
      <div className="glass-card rounded-3xl border border-white/80 shadow-2xl p-6 sm:p-10 mb-6">
        
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/60">
          <div>
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-white/80 px-3.5 py-1.5 rounded-full border border-white/90 shadow-xs backdrop-blur-md">
              Portal Awam
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              Borang Buat Aduan
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Sila isikan maklumat aduan dengan tepat. Tiada pendaftaran akaun diperlukan.
            </p>
          </div>

          <button
            onClick={onCancel}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white/60 hover:bg-white/90 px-3.5 py-2 rounded-xl border border-white/80 transition-colors shadow-xs"
          >
            Batal
          </button>
        </div>

        {errorMessage && (
          <div className="p-4 mb-6 rounded-2xl bg-red-50/80 backdrop-blur-md border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5 shadow-xs">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Perhatian</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Pengadu Info */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              1. Maklumat Pengadu
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Pengadu <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-nama-pengadu"
                  type="text"
                  required
                  value={namaPengadu}
                  onChange={(e) => setNamaPengadu(e.target.value)}
                  placeholder="cth: Ahmad Farhan"
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 glass-input rounded-xl focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Emel Notifikasi <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-emel-pengadu"
                  type="email"
                  required
                  value={emel}
                  onChange={(e) => setEmel(e.target.value)}
                  placeholder="cth: nama@domain.com"
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 glass-input rounded-xl focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Kategori Aduan */}
          <div className="pt-4 border-t border-white/60">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Kategori Aduan <span className="text-red-500">*</span>
              </h3>
              <span className="text-[11px] font-bold text-blue-700 bg-white/80 px-3 py-1 rounded-full border border-white/90 shadow-xs backdrop-blur-sm">
                Saluran Telegram: {selectedCategoryConfig.telegramGroup}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {(Object.keys(CATEGORIES) as ComplaintCategory[]).map((key) => {
                const cat = CATEGORIES[key];
                const isSelected = kategori === key;
                return (
                  <button
                    type="button"
                    key={key}
                    id={`form-cat-${key.toLowerCase()}`}
                    onClick={() => setKategori(key)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-white/95 shadow-md ring-2 ring-blue-400/30'
                        : 'border-white/60 bg-white/40 backdrop-blur-sm hover:bg-white/70'
                    }`}
                  >
                    <div className="mt-0.5 text-xl">{cat.id === 'KEMUDAHAN' ? '🏢' : cat.id === 'SISTEM' ? '💻' : cat.id === 'PERKHIDMATAN' ? '👨‍🏫' : cat.id === 'KEBERSIHAN' ? '🧹' : '📌'}</div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{cat.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{cat.examples.slice(0, 3).join(', ')}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Butiran Aduan */}
          <div className="pt-4 border-t border-white/60 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              3. Butiran Aduan
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tajuk Aduan <span className="text-red-500">*</span>
              </label>
              <input
                id="input-tajuk-aduan"
                type="text"
                required
                value={tajukAduan}
                onChange={(e) => setTajukAduan(e.target.value)}
                placeholder="cth: Kerosakan Penghawa Dingin Bilik Kuliah 2"
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 glass-input rounded-xl focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Butiran Lengkap Aduan <span className="text-red-500">*</span>
              </label>
              <textarea
                id="input-butiran-aduan"
                required
                rows={4}
                value={butiranAduan}
                onChange={(e) => setButiranAduan(e.target.value)}
                placeholder="Sila terangkan kerosakan atau aduan dengan jelas agar tindakan pegawai dapat dipercepatkan..."
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 glass-input rounded-xl focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Lokasi Kejadian / Bilik / Bangunan <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-lokasi-aduan"
                  type="text"
                  required
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  placeholder="cth: Blok A, Aras 2, Bilik Kuliah 2"
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 glass-input rounded-xl focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tarikh Kejadian
                </label>
                <input
                  id="input-tarikh-kejadian"
                  type="date"
                  value={tarikhKejadian}
                  onChange={(e) => setTarikhKejadian(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm text-slate-900 glass-input rounded-xl focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Lampiran */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Lampiran Gambar / Dokumen (Pilihan)
              </label>

              {!lampiranNama ? (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/80 hover:border-blue-400 bg-white/40 backdrop-blur-sm rounded-2xl cursor-pointer transition-all shadow-inner">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs font-semibold text-slate-700">
                    Klik atau seret fail ke sini untuk memuat naik
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">
                    PNG, JPG, PDF (Maksimum 5MB)
                  </span>
                  <input
                    id="input-file-lampiran"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3.5 bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl shadow-xs">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-blue-900">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="truncate max-w-xs">{lampiranNama}</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Pengesahan Checkbox */}
          <div className="pt-4 border-t border-white/60">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                id="checkbox-pengesahan-benar"
                type="checkbox"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-white/80"
              />
              <span className="text-xs text-slate-700 font-medium leading-relaxed">
                Saya mengesahkan maklumat yang diberikan adalah benar dan bersedia untuk dihubungi oleh pihak SiAP sekiranya maklumat tambahan diperlukan.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              id="btn-hantar-aduan-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 disabled:opacity-50 text-white font-bold text-base shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sedang Menghantar Aduan...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>HANTAR ADUAN</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};

