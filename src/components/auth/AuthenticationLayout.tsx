import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useBanking } from '../../context/BankingContext';
import { NorthernTrustLogo } from '../common/NorthernTrustLogo';
import {
  ShieldCheck,
  Building2,
  HelpCircle,
  KeyRound,
  Lock,
  FileText,
  X,
  Fingerprint,
  User,
  TrendingUp
} from 'lucide-react';

interface AuthenticationLayoutProps {
  children: React.ReactNode;
  activeHeaderTab?: 'signin' | 'security' | 'help' | 'devices';
}

const HEADER_TICKER_ITEMS = [
  { label: 'BANKING & INSTITUTIONAL CUSTODY', detail: '$1.55T GLOBAL CUSTODY AUM' },
  { label: 'FEDWIRE SETTLEMENT', detail: 'REAL-TIME NETWORK ONLINE' },
  { label: 'CAPITAL ADEQUACY', detail: 'TIER-1 RATIO 15.8% (FDIC)' },
  { label: 'PRIVATE WEALTH ENCLAVE', detail: 'CHARTERED 1889' }
];

export const AuthenticationLayout: React.FC<AuthenticationLayoutProps> = ({
  children,
  activeHeaderTab = 'signin',
}) => {
  const { navigateTo } = useBanking();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % HEADER_TICKER_ITEMS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="auth-page bg-[#F5F7FA] min-h-screen flex flex-col text-[#20242A]">
      {/* Header - Styled in Signature Northern Trust Green */}
      <header className="auth-header bg-[#147A52] border-b border-[#0B5C3D] px-4 sm:px-8 lg:px-12 min-h-[86px] sm:min-h-[94px] py-3.5 sm:py-4 flex items-center justify-between sticky top-0 z-30 shadow-md text-white">
        {/* Brand */}
        <div
          onClick={() => navigateTo('/login')}
          className="brand flex items-center gap-3 sm:gap-3.5 cursor-pointer group select-none"
          title="Northern Trust Private Client & Institutional Banking"
        >
          <div className="brand-logo w-10.5 h-10.5 sm:w-12 sm:h-12 rounded-lg bg-white text-[#147A52] flex items-center justify-center font-bold shadow-xs p-2 shrink-0 group-hover:scale-105 transition-all">
            <NorthernTrustLogo className="w-full h-full text-[#147A52]" color="#147A52" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="brand-name font-serif font-bold text-lg sm:text-2xl tracking-tight text-white block leading-tight">
                Northern Trust
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-white/20 text-white font-mono font-semibold uppercase tracking-wider border border-white/30 hidden sm:inline-block">
                Private Wealth
              </span>
            </div>

            {/* Live Institutional Marquee / Rotating Ticker Line */}
            <div className="flex items-center gap-1.5 mt-1 overflow-hidden h-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tickerIndex}
                  initial={{ opacity: 0, y: 7, filter: 'blur(2px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -7, filter: 'blur(2px)' }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-1.5 text-[9.5px] sm:text-[10.5px] font-mono font-bold tracking-[0.12em] uppercase text-emerald-100"
                >
                  <TrendingUp className="w-3 h-3 text-emerald-300 shrink-0" />
                  <span className="text-white font-extrabold">{HEADER_TICKER_ITEMS[tickerIndex].label}</span>
                  <span className="text-emerald-200 font-medium opacity-90 hidden xs:inline">• {HEADER_TICKER_ITEMS[tickerIndex].detail}</span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Header Utility Toggle Signs */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="inline-flex items-center p-1 bg-[#0E5E3D] border border-white/20 rounded-lg shadow-inner gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => navigateTo('/login')}
              title="Sign In Portal - Access Private Banking Ledger"
              aria-label="Sign In Portal"
              className={`min-w-[38px] h-9 sm:h-9.5 px-2.5 sm:px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 font-semibold text-xs cursor-pointer ${
                activeHeaderTab === 'signin'
                  ? 'bg-white text-[#147A52] shadow-xs font-bold'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('/security')}
              title="Security Center - Hardware Keys & 2FA Governance"
              aria-label="Security Center"
              className={`min-w-[38px] h-9 sm:h-9.5 px-2.5 sm:px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 font-semibold text-xs cursor-pointer ${
                activeHeaderTab === 'security'
                  ? 'bg-white text-[#147A52] shadow-xs font-bold'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="hidden md:inline">Security</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('/trusted-devices')}
              title="Trusted Devices - Biometric & FIDO2 Management"
              aria-label="Trusted Devices"
              className={`min-w-[38px] h-9 sm:h-9.5 px-2.5 sm:px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 font-semibold text-xs cursor-pointer ${
                activeHeaderTab === 'devices'
                  ? 'bg-white text-[#147A52] shadow-xs font-bold'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <Fingerprint className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline">Devices</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              title="Concierge Desk - 24/7 Wealth Advisor Support"
              aria-label="Concierge Support Desk"
              className={`min-w-[38px] h-9 sm:h-9.5 px-2.5 sm:px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 font-semibold text-xs cursor-pointer ${
                activeHeaderTab === 'help'
                  ? 'bg-white text-[#147A52] shadow-xs font-bold'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Concierge</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Auth Area */}
      <main className="auth-main flex-1 flex justify-center items-start py-10 px-4">
        {children}
      </main>

      {/* Institutional Two-Tier Footer - Styled in Northern Trust Green */}
      <footer className="auth-footer border-t border-[#0B5C3D] w-full mt-auto">
        {/* Upper Tier: Brand Lockup & Regulatory Badges */}
        <div className="bg-[#0E5E3D] border-b border-[#09452C] py-5 px-4 sm:px-8 lg:px-12 text-white">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center p-2 shadow-xs shrink-0">
                <NorthernTrustLogo className="w-full h-full text-[#147A52]" color="#147A52" />
              </div>
              <div className="text-center lg:text-left">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <span className="font-serif font-bold text-white text-sm sm:text-base tracking-tight block">
                    Northern Trust Corporation
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-white/15 text-white border border-white/25 uppercase hidden sm:inline-block">
                    Chartered 1889
                  </span>
                </div>
                <span className="text-[11px] font-medium text-emerald-100 tracking-wide block mt-0.5">
                  Global Sovereign Custody &amp; Private Wealth Management
                </span>
              </div>
            </div>

            {/* Direct Regulatory Affiliation Line */}
            <div className="flex items-center gap-2 text-xs font-mono text-white bg-[#09452C] px-3.5 py-1.5 rounded-lg border border-white/20 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>FDIC-Insured • Fed Reserve Member • Equal Housing Lender ⌂</span>
            </div>
          </div>
        </div>

        {/* Downward Part: Deep Wealth Management Green Tier */}
        <div className="bg-[#09452C] text-white border-t border-[#062F1E] py-7 px-4 sm:px-8 lg:px-12 shadow-inner">
          <div className="max-w-6xl mx-auto space-y-5">
            {/* Middle Row: Institutional Action Links */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="text-emerald-100 hover:text-white hover:underline transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Institutional Privacy Policy</span>
              </button>
              <span className="text-emerald-300/40 hidden sm:inline">•</span>
              <button
                type="button"
                onClick={() => setShowLegalModal(true)}
                className="text-emerald-100 hover:text-white hover:underline transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Regulatory &amp; Custody Disclosures</span>
              </button>
              <span className="text-emerald-300/40 hidden sm:inline">•</span>
              <button
                type="button"
                onClick={() => navigateTo('/security')}
                className="text-emerald-100 hover:text-white hover:underline transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Security Governance</span>
              </button>
              <span className="text-emerald-300/40 hidden sm:inline">•</span>
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="text-emerald-100 hover:text-white hover:underline transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Concierge Desk (+1 (800) 468-2352)</span>
              </button>
            </div>

            {/* Bottom Row: Legal Disclosures & Real-time Cryptographic Attestation */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-emerald-100 pt-2 border-t border-[#062F1E]">
              <p className="text-center lg:text-left leading-relaxed max-w-3xl text-[11px] sm:text-[11.5px] text-emerald-100/90">
                <strong className="text-white font-semibold">Northern Trust</strong> is a chartered commercial banking association and member of the <strong className="text-white font-semibold">Federal Deposit Insurance Corporation (FDIC)</strong> and the <strong className="text-white font-semibold">Federal Reserve System</strong>. Equal Housing Lender ⌂. Deposits insured up to $250,000 per depositor; eligible cash reserves protected up to $25,000,000 via IntraFi network custodial sweeps. Securities custody protected up to $500,000 by SIPC. All custodial assets held in segregated, non-commingled accounts under OCC supervision.
              </p>

              <div className="flex items-center gap-2.5 font-mono text-[11px] text-white bg-[#062F1E] px-3.5 py-1.5 rounded-lg border border-white/20 shadow-inner shrink-0">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
                <span className="tracking-wide text-emerald-100 font-semibold">256-Bit Hardware Enclave Synced</span>
              </div>
            </div>

            {/* Copyright & Custody Jurisdiction Nodes */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-emerald-100/80 pt-2 border-t border-[#062F1E]">
              <span>© 2026 Northern Trust Corporation. All Rights Reserved.</span>
              <div className="flex items-center gap-2 font-mono text-emerald-100">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Zurich • New York • London • Singapore</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-lg max-w-lg w-full border border-[#D8DEE8] p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8DEE8]">
              <h3 className="font-bold text-sm text-[#147A52]">Institutional Privacy Policy</h3>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="text-[#5F6670] hover:text-[#20242A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[#5F6670] leading-relaxed">
              Northern Trust adheres to the highest international banking privacy standards, compliant with GLBA, GDPR, and Swiss Banking Secrecy regulations. All telemetric data is encrypted in transit and at rest using FIPS 140-3 certified hardware security modules.
            </p>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="px-4 py-2 rounded-lg bg-[#147A52] hover:bg-[#0E5E3D] text-white font-semibold shadow-xs cursor-pointer transition-colors"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal Disclosures Modal */}
      {showLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-lg max-w-lg w-full border border-[#D8DEE8] p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8DEE8]">
              <h3 className="font-bold text-sm text-[#147A52]">Regulatory &amp; Custody Disclosures</h3>
              <button
                type="button"
                onClick={() => setShowLegalModal(false)}
                className="text-[#5F6670] hover:text-[#20242A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[#5F6670] leading-relaxed">
              Deposit accounts are FDIC insured up to allowable federal thresholds. Wealth custody, securities brokerage, and sovereign vaults are held in segregated, non-commingled accounts monitored under OCC supervisory frameworks.
            </p>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLegalModal(false)}
                className="px-4 py-2 rounded-lg bg-[#147A52] hover:bg-[#0E5E3D] text-white font-semibold shadow-xs cursor-pointer transition-colors"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-lg max-w-lg w-full border border-[#D8DEE8] p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8DEE8]">
              <div className="flex items-center gap-2 text-[#147A52] font-bold text-sm">
                <HelpCircle className="w-4 h-4 text-[#147A52]" />
                <span>24/7 Client &amp; Staff Support Desk</span>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-[#5F6670] hover:text-[#20242A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-[#5F6670]">
              <p>For immediate wire inquiries, security lockouts, or lost hardware authenticator tokens:</p>
              <div className="p-3 bg-[#F5F7FA] border border-[#D8DEE8] rounded-lg space-y-1 font-mono text-xs text-[#20242A]">
                <div>Private Client Line: <strong>+1 (800) 468-2352</strong></div>
                <div>Institutional Desk: <strong>+1 (312) 630-6000</strong></div>
                <div>Encrypted Dispatch: <strong>clientdesk@northerntrust.com</strong></div>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-lg bg-[#147A52] hover:bg-[#0E5E3D] text-white font-semibold shadow-xs cursor-pointer transition-colors"
              >
                Close Desk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
