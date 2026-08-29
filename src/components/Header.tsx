import React from 'react';
import { ShieldCheck, PlusCircle, Search, BarChart3, Lock, Sparkles } from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isAdminLoggedIn: boolean;
  onAdminLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isAdminLoggedIn,
  onAdminLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/60 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div
            id="brand-logo"
            onClick={() => setActiveTab('utama')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-11 h-11 flex items-center justify-center group-hover:scale-105 transition-all duration-200">
              <img
                src="https://lh3.googleusercontent.com/d/1wuY-0qy28C7QQrX6FAY9zTDyLhGP2drh"
                alt="Logo SiAP"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain drop-shadow-md"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes('uc?export=view')) {
                    target.src = 'https://drive.google.com/uc?export=view&id=1wuY-0qy28C7QQrX6FAY9zTDyLhGP2drh';
                  }
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 drop-shadow-xs">SiAP</span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-white/80 text-blue-700 border border-white/80 rounded-full shadow-xs backdrop-blur-md">
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  Portal Digital
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden xs:block">
                Sistem Aduan Pelanggan
              </p>
            </div>
          </div>

          {/* Center Navigation - Glass Pill Bar */}
          <nav className="hidden md:flex items-center gap-1.5 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.03)]">
            <button
              id="nav-utama"
              onClick={() => setActiveTab('utama')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeTab === 'utama'
                  ? 'bg-white/90 text-blue-600 shadow-sm border border-white/90 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              Utama
            </button>
            <button
              id="nav-buat-aduan"
              onClick={() => setActiveTab('aduan')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'aduan'
                  ? 'bg-white/90 text-blue-600 shadow-sm border border-white/90 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Buat Aduan
            </button>
            <button
              id="nav-semak-aduan"
              onClick={() => setActiveTab('semak')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'semak'
                  ? 'bg-white/90 text-blue-600 shadow-sm border border-white/90 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Search className="w-4 h-4" />
              Semak Aduan
            </button>
            <button
              id="nav-statistik"
              onClick={() => setActiveTab('statistik')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'statistik'
                  ? 'bg-white/90 text-blue-600 shadow-sm border border-white/90 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Statistik
            </button>
          </nav>

          {/* Right Action Button */}
          <div className="flex items-center gap-2.5">
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  id="header-admin-pill"
                  onClick={() => setActiveTab('admin')}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500/15 text-amber-900 border border-amber-300/60 hover:bg-amber-500/25 transition-all flex items-center gap-1.5 backdrop-blur-md shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Admin</span>
                </button>
              </div>
            ) : (
              <button
                id="header-admin-login-link"
                onClick={() => setActiveTab('admin')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-white/50 transition-colors"
                title="Akses Pentadbir"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

            <button
              id="btn-header-buat-aduan"
              onClick={() => setActiveTab('aduan')}
              className="px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 border border-white/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Aduan</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar - Frosted Glass */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-white/40 text-xs">
          <button
            id="mobile-nav-utama"
            onClick={() => setActiveTab('utama')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'utama'
                ? 'font-bold text-blue-600 bg-white/80 shadow-xs border border-white/80'
                : 'text-slate-600 hover:bg-white/40'
            }`}
          >
            Utama
          </button>
          <button
            id="mobile-nav-buat"
            onClick={() => setActiveTab('aduan')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'aduan'
                ? 'font-bold text-blue-600 bg-white/80 shadow-xs border border-white/80'
                : 'text-slate-600 hover:bg-white/40'
            }`}
          >
            Buat Aduan
          </button>
          <button
            id="mobile-nav-semak"
            onClick={() => setActiveTab('semak')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'semak'
                ? 'font-bold text-blue-600 bg-white/80 shadow-xs border border-white/80'
                : 'text-slate-600 hover:bg-white/40'
            }`}
          >
            Semak Aduan
          </button>
          <button
            id="mobile-nav-stats"
            onClick={() => setActiveTab('statistik')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'statistik'
                ? 'font-bold text-blue-600 bg-white/80 shadow-xs border border-white/80'
                : 'text-slate-600 hover:bg-white/40'
            }`}
          >
            Statistik
          </button>
        </div>
      </div>
    </header>
  );
};

