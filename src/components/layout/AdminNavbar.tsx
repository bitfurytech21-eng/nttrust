import React from 'react';
import { useBanking } from '../../context/BankingContext';
import { NorthernTrustLogo } from '../common/NorthernTrustLogo';
import {
  Building2,
  ShieldAlert,
  Sliders,
  LogOut,
  User,
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  RefreshCw,
  KeyRound,
  Lock,
  Moon,
  Sun
} from 'lucide-react';

export const AdminNavbar: React.FC = () => {
  const {
    currentUser,
    pendingTransfersCount,
    setIsAdminMode,
    logout,
    resetAllData,
    navigateTo,
    lockSessionManually,
    sessionRemainingSeconds
  } = useBanking();

  return (
    <header className="min-h-[58px] sm:min-h-[64px] border-b border-[#081552] bg-[#0B1F6A] px-3 sm:px-6 py-2 flex items-center justify-between sticky top-0 z-30 shadow-xs text-white">
      {/* Brand & Terminal Identifier */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <div className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-lg bg-white flex items-center justify-center text-[#147A52] font-bold shadow-xs p-1.5 shrink-0">
          <NorthernTrustLogo className="w-full h-full text-[#147A52]" color="#147A52" title="Northern Trust" />
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="font-serif font-bold text-sm sm:text-lg tracking-tight text-white leading-tight whitespace-nowrap truncate">
              Northern Trust
            </span>
            <span className="text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 rounded-md bg-white/15 text-white font-mono font-bold uppercase border border-white/25 hidden sm:inline-block shrink-0">
              Bank Operations &amp; Clearance Enclave
            </span>
          </div>
          <span className="text-[8px] sm:text-[10px] font-medium tracking-wider uppercase text-[#D8DEE8] leading-tight mt-0.5 whitespace-nowrap block truncate">
            Federal Reserve &amp; Institutional Settlement Portal
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Pending AML wire review badge */}
        {pendingTransfersCount > 0 && (
          <button
            type="button"
            onClick={() => navigateTo('/admin/transfers')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B42318] hover:bg-[#8e1910] text-white border border-red-300 text-xs font-semibold animate-pulse cursor-pointer shadow-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-white" />
            <span>{pendingTransfersCount} AML Wire Flagged</span>
          </button>
        )}

        {/* Lock Session with countdown */}
        <button
          type="button"
          onClick={lockSessionManually}
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold transition-all cursor-pointer"
          title="Lock admin session immediately"
        >
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>{Math.floor(sessionRemainingSeconds / 60)}:{String(sessionRemainingSeconds % 60).padStart(2, '0')}</span>
        </button>

        {/* Google Authenticator Quick Access */}
        <button
          type="button"
          onClick={() => navigateTo('/admin/authenticator')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-medium transition-colors cursor-pointer"
          title="Google Authenticator Pairing & Verification"
        >
          <KeyRound className="w-3.5 h-3.5 text-[#D8DEE8]" />
          <span className="hidden md:inline">Authenticator App</span>
        </button>

        {/* Client Portal Exit Switcher */}
        <button
          type="button"
          onClick={() => {
            setIsAdminMode(false);
            navigateTo('/dashboard');
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white hover:bg-[#F5F7FA] text-[#0B1F6A] border border-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
        >
          <User className="w-3.5 h-3.5 text-[#0B1F6A]" />
          <span className="hidden sm:inline">Client Portal</span>
        </button>

        {/* Reset State button */}
        <button
          type="button"
          onClick={resetAllData}
          className="p-2 rounded-lg text-[#D8DEE8] hover:text-white hover:bg-white/10 border border-white/20 transition-colors cursor-pointer"
          title="Reset System Ledger & Data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Officer profile pill */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-xs text-white">
          <div className="w-6 h-6 rounded-md bg-white text-[#0B1F6A] flex items-center justify-center font-bold text-[11px]">
            SJ
          </div>
          <span className="text-white font-medium hidden lg:inline">Sarah Jenkins (Compliance Lead)</span>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-[#B42318] border border-transparent hover:border-red-400 transition-colors cursor-pointer"
          title="Sign Out of Admin Portal"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
