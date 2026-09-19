import React from 'react';
import { ShieldCheck, Mail, MessageSquare, ExternalLink, Lock, Sparkles } from 'lucide-react';
import { TabType } from '../types';

interface FooterProps {
  onNavigate: (view: TabType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
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
            
            {/* Discreet Admin Login */}
            <button
              id="footer-admin-login-btn"
              onClick={() => onNavigate('admin')}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 font-medium px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
              title="Akses Pentadbir Sistem"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

