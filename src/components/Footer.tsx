import React from 'react';
import { TabType } from '../types';

interface FooterProps {
  onNavigate?: (view: TabType) => void;
}

export const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="relative bg-slate-900/85 backdrop-blur-2xl text-slate-300 py-6 border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.2)]">
      {/* Decorative top glass gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} SiAP (Sistem Aduan Pelanggan). Hak Cipta Terpelihara.
          </div>
          
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Polisi Privasi</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Terma Perkhidmatan</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

