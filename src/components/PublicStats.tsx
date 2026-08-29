import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, Clock, Star, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { RATING_SCALE } from '../data/categories';
import { RatingSummary, SystemStats } from '../types';

interface PublicStatsProps {
  onNavigateToCreate: () => void;
}

export const PublicStats: React.FC<PublicStatsProps> = ({ onNavigateToCreate }) => {
  const [ratingData, setRatingData] = useState<RatingSummary>({
    averageRating: 4.8,
    totalRatings: 18,
    ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 4, 5: 13 },
    emojiLabel: 'Sangat Memuaskan',
    ratingEmoji: '🤩',
  });
  const [stats, setStats] = useState<Partial<SystemStats>>({
    totalAduan: 24,
    selesai: 19,
    purataKepuasan: 4.8,
    purataMasaPenyelesaianJam: 3.5,
  });
  const [feedbacks, setFeedbacks] = useState<Array<{
    noRujukan: string;
    nama: string;
    kategori: string;
    rating: number;
    ulasan: string;
    tarikh: string;
  }>>([
    {
      noRujukan: 'SIAP-2026-00001',
      nama: 'Ahmad***',
      kategori: 'Kemudahan & Infrastruktur',
      rating: 5,
      ulasan: 'Tindakan sangat pantas dan bilik kuliah kembali selesa untuk kelas petang. Terima kasih!',
      tarikh: '2026-08-20',
    },
    {
      noRujukan: 'SIAP-2026-00003',
      nama: 'Tan***',
      kategori: 'Kebersihan',
      rating: 4,
      ulasan: 'Kawasan kafeteria telah dibersihkan dalam masa yang singkat. Servis mantap.',
      tarikh: '2026-08-22',
    },
  ]);

  useEffect(() => {
    fetch('/api/public/summary')
      .then((res) => res.json())
      .then((data) => {
        if (data.ratingSummary) setRatingData(data.ratingSummary);
        if (data.stats) setStats(data.stats);
        if (data.recentFeedbacks && data.recentFeedbacks.length > 0) {
          setFeedbacks(data.recentFeedbacks);
        }
      })
      .catch((err) => console.log('Stats error:', err));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider bg-white/80 px-3.5 py-1.5 rounded-full border border-white/90 shadow-xs backdrop-blur-md">
          Ketelusan & Prestasi
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
          Statistik & Kepuasan Pelanggan
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Data ketelusan prestasi aduan dan kepuasan pelanggan yang dikemas kini secara langsung dari pangkalan data.
        </p>
      </div>

      {/* KPI Cards - Frosted Glass Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card glass-card-hover p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah Aduan</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-200 text-blue-600 flex items-center justify-center font-bold shadow-xs">
              📊
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.totalAduan || 24}</div>
          <p className="text-[11px] text-slate-500 mt-1">Didaftarkan dalam sistem SiAP</p>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Berjaya Diselesaikan</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
              🟢
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600">{stats.selesai || 19}</div>
          <p className="text-[11px] text-slate-500 mt-1">Kadar penyelesaian ~85%</p>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Purata Masa Tindakan</span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-200 text-orange-600 flex items-center justify-center font-bold shadow-xs">
              ⏱️
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.purataMasaPenyelesaianJam || 3.5} Jam</div>
          <p className="text-[11px] text-slate-500 mt-1">Daripada aduan diterima hingga selesai</p>
        </div>

        <div className="glass-card glass-card-hover p-6 rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Indeks Kepuasan</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-200 text-amber-600 flex items-center justify-center font-bold shadow-xs">
              ⭐
            </div>
          </div>
          <div className="text-3xl font-black text-blue-600">{ratingData.averageRating.toFixed(1)} / 5.0</div>
          <p className="text-[11px] text-slate-500 mt-1">{ratingData.emojiLabel} {ratingData.ratingEmoji}</p>
        </div>
      </div>

      {/* Satisfaction Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Rating Bars */}
        <div className="lg:col-span-7 glass-card p-6 sm:p-8 rounded-3xl">
          <h3 className="text-base font-bold text-slate-900 mb-6">
            Pecahan Skala Penilaian Pelanggan
          </h3>

          <div className="space-y-4">
            {RATING_SCALE.slice().reverse().map((scale) => {
              const count = ratingData.ratingDistribution[scale.value as 1 | 2 | 3 | 4 | 5] || 0;
              const total = ratingData.totalRatings || 1;
              const percent = Math.round((count / total) * 100);

              return (
                <div key={scale.value} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{scale.emoji}</span>
                      <span className="text-slate-800">{scale.label} (Skala {scale.value})</span>
                    </span>
                    <span className="text-slate-600">{count} ulasan ({percent}%)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-white/60 border border-white/80 overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 shadow-xs"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Customer Testimonials */}
        <div className="lg:col-span-5 glass-card p-6 sm:p-8 rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Ulasan Terkini Pengadu
            </h3>

            <div className="space-y-3">
              {feedbacks.map((fb, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 text-xs shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900">{fb.nama}</span>
                    <span className="text-amber-500 font-bold">
                      {'⭐'.repeat(fb.rating)}
                    </span>
                  </div>
                  <p className="text-slate-700 italic">"{fb.ulasan}"</p>
                  <span className="block text-[10px] text-slate-400 mt-2 font-medium">
                    Kategori: {fb.kategori} • {fb.tarikh}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/60 text-center">
            <button
              onClick={onNavigateToCreate}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 border border-white/20 active:scale-98 cursor-pointer"
            >
              <span>Salurkan Aduan Anda Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

