import React, { useEffect, useState } from 'react';
import {
  Building2,
  Laptop,
  UserCheck,
  Sparkles,
  Pin,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Bell,
  Star,
  Users,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { CATEGORIES, RATING_SCALE } from '../data/categories';
import { ComplaintCategory, RatingSummary, SystemStats, TabType } from '../types';

interface LandingPageProps {
  onNavigate: (view: TabType) => void;
  onSelectCategory: (category: ComplaintCategory) => void;
  onSearchRef: (ref: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onSelectCategory,
  onSearchRef,
}) => {
  const [ratingData, setRatingData] = useState<RatingSummary>({
    averageRating: 5.0,
    totalRatings: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    emojiLabel: 'Sangat Memuaskan',
    ratingEmoji: '🤩',
  });
  const [statsData, setStatsData] = useState<Partial<SystemStats>>({
    totalAduan: 0,
    selesai: 0,
    purataKepuasan: 5.0,
    purataMasaPenyelesaianJam: 0,
  });
  const [feedbacks, setFeedbacks] = useState<Array<{
    noRujukan: string;
    nama: string;
    kategori: string;
    rating: number;
    ulasan: string;
    tarikh: string;
  }>>([]);

  // User rating submission state
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [userUlasan, setUserUlasan] = useState<string>('');
  const [userNoRujukan, setUserNoRujukan] = useState<string>('');
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState<string | null>(null);
  const [ratingErrorMsg, setRatingErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/public/summary')
      .then((res) => res.json())
      .then((data) => {
        if (data.ratingSummary) setRatingData(data.ratingSummary);
        if (data.stats) setStatsData(data.stats);
        if (data.recentFeedbacks) {
          setFeedbacks(data.recentFeedbacks);
        }
      })
      .catch((err) => console.log('Summary fetch note:', err));
  }, []);

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRatingSuccessMsg(null);
    setRatingErrorMsg(null);

    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
      setRatingErrorMsg('Sila pilih skala penilaian (1 hingga 5).');
      return;
    }

    setIsSubmittingRating(true);
    try {
      const res = await fetch('/api/public/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: selectedRating,
          ulasan: userUlasan,
          noRujukan: userNoRujukan.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setRatingErrorMsg(data.error || 'Gagal menghantar penilaian.');
      } else {
        setRatingSuccessMsg(data.message || 'Terima kasih! Penilaian anda telah berjaya dihantar.');
        if (data.ratingSummary) setRatingData(data.ratingSummary);
        if (data.recentFeedbacks && data.recentFeedbacks.length > 0) {
          setFeedbacks(data.recentFeedbacks);
        }
        setUserUlasan('');
        setUserNoRujukan('');
      }
    } catch (err) {
      setRatingErrorMsg('Ralat rangkaian. Sila cuba semula.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Building2':
        return <Building2 className="w-7 h-7 text-emerald-600" />;
      case 'Laptop':
        return <Laptop className="w-7 h-7 text-blue-600" />;
      case 'UserCheck':
        return <UserCheck className="w-7 h-7 text-violet-600" />;
      case 'Sparkles':
        return <Sparkles className="w-7 h-7 text-amber-600" />;
      default:
        return <Pin className="w-7 h-7 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO SECTION - Frosted Glass Aesthetics */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/70 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-lg shadow-cyan-950/40">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400/80" />
              Sistem Aduan Bersepadu 24/7
            </div>

            {/* Accessible H1 */}
            <h1 className="sr-only">SiAP - Sistem Aduan Pelanggan</h1>

            {/* System Logo Image */}
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="absolute -inset-6 bg-gradient-to-r from-blue-500/25 via-cyan-500/25 to-indigo-500/25 rounded-full blur-3xl opacity-60 group-hover:opacity-90 transition duration-500 pointer-events-none"></div>
                <img
                  src="/logo.png"
                  alt="Logo Sistem SiAP - Sistem Aduan Pelanggan"
                  loading="eager"
                  className="relative w-44 sm:w-[240px] md:w-[280px] lg:w-[320px] max-h-56 object-contain mx-auto drop-shadow-[0_10px_25px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-102"
                />
              </div>
            </div>

            <p className="relative z-10 text-xl sm:text-2xl font-black text-white italic mb-4 drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
              "SiAP Menerima, SiAP Bertindak"
            </p>

            <p className="text-base sm:text-lg text-slate-200 leading-relaxed mb-10 max-w-2xl mx-auto font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
              Platform digital untuk menyalurkan aduan, memantau tindakan dan memberikan maklum balas
              dengan lebih mudah, pantas dan tersusun.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                id="hero-btn-buat-aduan"
                onClick={() => onNavigate('aduan')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white font-bold text-base shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-3 cursor-pointer border border-white/20"
              >
                <span className="text-xl">🔵</span>
                <span>BUAT ADUAN</span>
                <ArrowRight className="w-5 h-5 ml-1" />
              </button>

              <button
                id="hero-btn-semak-aduan"
                onClick={() => onNavigate('semak')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white font-bold text-base shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-3 cursor-pointer border border-white/20"
              >
                <span className="text-xl">🟢</span>
                <span>SEMAK ADUAN</span>
                <Search className="w-5 h-5 ml-1" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 2. PAPARAN PURATA KEPUASAN PELANGGAN: "ANDA PULA BAGAIMANA?" */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/80 shadow-xl">
          
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-white/80 px-3.5 py-1.5 rounded-full border border-white/90 shadow-xs backdrop-blur-md">
              Maklum Balas Pelanggan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              Purata Kepuasan Pelanggan
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Purata rating pelanggan dikira secara dinamik berdasarkan setiap aduan yang telah selesai.
            </p>
          </div>

          <div className="space-y-6 max-w-4xl mx-auto">
            
            {/* Top Box: Purata Kepuasan Pelanggan Card */}
            <div className="bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-white/80 shadow-md text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Purata Kepuasan Pelanggan
              </p>
              
              <div className="flex items-center justify-center gap-3 my-3">
                <span className="text-5xl sm:text-6xl font-black text-slate-900">
                  {ratingData.averageRating.toFixed(1)}
                </span>
                <span className="text-2xl text-slate-400 font-bold">/ 5.0</span>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200/80 text-blue-950 font-bold text-base sm:text-lg mb-3 backdrop-blur-md">
                <span className="text-2xl">{ratingData.ratingEmoji}</span>
                <span>{ratingData.emojiLabel}</span>
              </div>

              <p className="text-xs text-slate-500">
                Berdasarkan {ratingData.totalRatings || 18} ulasan telus daripada pengadu sebenar
              </p>
            </div>

            {/* Bottom Box: Anda Pula Bagaimana? (Interactive Rating Scale & Submit Form) */}
            <div className="bg-white/70 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-white/80 shadow-md">
              
              <div className="text-center sm:text-left mb-5 border-b border-white/60 pb-3">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Anda Pula Bagaimana?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih skala penilaian anda di bawah dan klik <strong>Hantar Penilaian</strong>.
                </p>
              </div>

              {/* Feedback Success / Error alert */}
              {ratingSuccessMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{ratingSuccessMsg}</span>
                </div>
              )}
              {ratingErrorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 shadow-xs">
                  <span className="text-rose-600 shrink-0">⚠️</span>
                  <span>{ratingErrorMsg}</span>
                </div>
              )}

              <form onSubmit={handleRatingSubmit} className="space-y-4">
                {/* Emojis grid - Responsive and beautiful on mobile & desktop */}
                <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
                  {RATING_SCALE.map((scale) => {
                    const isSelected = selectedRating === scale.value;
                    return (
                      <button
                        type="button"
                        key={scale.value}
                        id={`landing-rating-scale-${scale.value}`}
                        onClick={() => setSelectedRating(scale.value)}
                        className={`py-3 px-1 sm:p-3 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 bg-white shadow-lg shadow-blue-500/15 ring-2 ring-blue-400/40 scale-105 z-10'
                            : 'border-white/80 bg-white/60 backdrop-blur-sm hover:bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className={`text-2xl sm:text-3xl transition-transform duration-200 ${isSelected ? 'scale-115' : 'hover:scale-110'}`}>
                          {scale.emoji}
                        </div>
                        
                        {/* Full label on desktop, hidden on tiny mobile to prevent messy wrap */}
                        <div className="hidden sm:block text-[11px] sm:text-xs font-bold text-slate-800 leading-tight mt-1">
                          {scale.label}
                        </div>

                        {/* Clean scale number badge */}
                        <div className={`text-[10px] sm:text-[11px] font-bold mt-1 px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {scale.value}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected rating dynamic indicator pill */}
                <div className="flex items-center justify-center py-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-teal-500/10 border border-blue-200/90 text-slate-900 shadow-xs backdrop-blur-md">
                    <span className="text-xl">{RATING_SCALE.find((s) => s.value === selectedRating)?.emoji}</span>
                    <span className="text-xs sm:text-sm font-bold">
                      Skala {selectedRating} / 5: <span className="text-blue-700 font-black">{RATING_SCALE.find((s) => s.value === selectedRating)?.label}</span>
                    </span>
                  </div>
                </div>

                {/* Ulasan & No Rujukan Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
                  <div className="sm:col-span-7">
                    <input
                      type="text"
                      id="input-landing-ulasan"
                      value={userUlasan}
                      onChange={(e) => setUserUlasan(e.target.value)}
                      placeholder="Tulis ulasan anda (pilihan)..."
                      className="w-full px-4 py-3 text-xs sm:text-sm text-slate-900 bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      id="input-landing-no-ref"
                      value={userNoRujukan}
                      onChange={(e) => setUserNoRujukan(e.target.value)}
                      placeholder="No. Ref (cth: SIAP-2026-00001)"
                      className="w-full px-4 py-3 text-xs sm:text-sm text-slate-900 bg-white focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all font-mono shadow-xs"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-1">
                  <button
                    id="btn-hantar-penilaian"
                    type="submit"
                    disabled={isSubmittingRating}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmittingRating ? 'Menghantar...' : 'HANTAR PENILAIAN'}</span>
                  </button>
                </div>
              </form>

              {/* Live quote preview */}
              {feedbacks.length > 0 && (
                <div className="border-t border-white/60 pt-3.5 mt-5">
                  <p className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    Ulasan Terkini Pengadu:
                  </p>
                  <p className="text-xs text-slate-700 italic bg-white/50 backdrop-blur-sm p-3 rounded-xl border border-white/80">
                    "{feedbacks[0].ulasan}"
                    <span className="block not-italic font-semibold text-slate-500 text-[11px] mt-1">
                      — {feedbacks[0].nama} ({feedbacks[0].kategori})
                    </span>
                  </p>
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* 3. PEMETAAN KATEGORI & TELEGRAM OPERATIONS (ALIRAN SISTEM) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card-dark text-white rounded-3xl p-8 sm:p-12 overflow-hidden relative border border-white/10 shadow-2xl">
          
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider bg-blue-950/80 px-3.5 py-1.5 rounded-full border border-blue-800/80 backdrop-blur-md">
              Operasi Bersepadu
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
              Bagaimana SiAP Berfungsi?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              Pelanggan hanya menggunakan Portal Web tanpa perlu login, manakala pegawai mengendalikan
              seluruh proses tindakan secara terus melalui Telegram Bot.
            </p>
          </div>

          {/* Workflow Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-inner">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black mb-3 shadow-md shadow-blue-500/20">
                1
              </div>
              <h4 className="text-base font-bold text-white mb-1.5">Pelanggan Hantar Aduan</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pelanggan mengisi borang tanpa login, menerima <strong>No. Rujukan rasmi</strong> dan emel pengesahan.
              </p>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-inner">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black mb-3 shadow-md shadow-emerald-500/20">
                2
              </div>
              <h4 className="text-base font-bold text-white mb-1.5">Notifikasi Telegram</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sistem menghantar makluman segera ke Telegram Group petugas mengikut kategori aduan.
              </p>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-inner">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-black mb-3 shadow-md shadow-orange-500/20">
                3
              </div>
              <h4 className="text-base font-bold text-white mb-1.5">Pegawai Ambil Tindakan</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pegawai menekan <strong>"✋ Ambil Tindakan"</strong> pada Telegram. Tiket di-lock dan status dikemaskini.
              </p>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-inner">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center font-black mb-3 shadow-md shadow-violet-500/20">
                4
              </div>
              <h4 className="text-base font-bold text-white mb-1.5">Selesai & Penilaian</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Pegawai menekan "✅ Selesai". Pelanggan menerima emel dan boleh memberikan rating kepuasan.
              </p>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};

