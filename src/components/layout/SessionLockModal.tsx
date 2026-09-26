import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import { NorthernTrustLogo } from '../common/NorthernTrustLogo';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  LogOut,
  AlertCircle,
  Fingerprint,
  ScanFace,
  Shield,
  Camera
} from 'lucide-react';
import { BiometricPromptModal } from '../common/BiometricPromptModal';

export const SessionLockModal: React.FC = () => {
  const { sessionLocked, unlockSession, logout, currentUser, biometricSettings, enrolledSecurityKeys } = useBanking();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricOpen, setIsBiometricOpen] = useState(false);

  if (!sessionLocked) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const ok = unlockSession(passcode);
      setIsLoading(false);
      if (!ok) {
        setError('Invalid client PIN or master password. Please verify credentials.');
      } else {
        setPasscode('');
      }
    }, 300);
  };

  const handleBiometricSuccess = () => {
    setIsBiometricOpen(false);
    unlockSession('password123');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in text-[#20242A]">
        <div className="w-full max-w-md bg-white rounded-2xl p-7 sm:p-8 border-2 border-[#D8DEE8] shadow-2xl relative text-xs">
          <div className="text-center space-y-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#147A52] text-white flex items-center justify-center mx-auto shadow-md p-3">
              <NorthernTrustLogo className="w-full h-full text-white" color="#FFFFFF" title="Northern Trust" />
            </div>
            <div>
              <span className="text-[11px] font-sans font-bold tracking-[0.18em] uppercase text-[#147A52] block">
                Northern Trust
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-serif text-[#20242A] tracking-tight mt-0.5">
                Session Locked for Inactivity
              </h2>
            </div>
            <p className="text-xs text-[#5F6670] font-medium leading-relaxed max-w-xs mx-auto">
              Your banking session was automatically suspended to safeguard sovereign wealth accounts.
            </p>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8] text-xs font-mono font-bold text-[#147A52] shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#147A52]" />
              <span>{currentUser?.fullName} ({currentUser?.clientId})</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-[#B42318] text-xs font-bold flex items-center gap-2.5 shadow-2xs animate-fade-in">
              <AlertCircle className="w-4 h-4 stroke-[2.25] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Biometric & Security Key Unlock Buttons */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsBiometricOpen(true)}
              className="py-2.5 px-3 rounded-xl bg-[#147A52]/10 hover:bg-[#147A52]/20 border border-[#147A52]/30 text-[#147A52] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Camera className="w-4 h-4" />
              <span>Face ID Unlock</span>
            </button>

            <button
              type="button"
              onClick={() => setIsBiometricOpen(true)}
              className="py-2.5 px-3 rounded-xl bg-[#0B1F6A]/10 hover:bg-[#0B1F6A]/20 border border-[#0B1F6A]/30 text-[#0B1F6A] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <KeyRound className="w-4 h-4" />
              <span>Security Key 🔑</span>
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#D8DEE8]"></div>
            <span className="flex-shrink mx-3 text-[10px] font-mono text-[#5F6670] uppercase">or enter credentials</span>
            <div className="flex-grow border-t border-[#D8DEE8]"></div>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="font-bold text-xs text-[#20242A] block mb-1.5">Client Passcode / Master Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#5F6670] absolute left-3 top-3 stroke-[2.25]" />
                <input
                  type="password"
                  required
                  autoFocus
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter PIN or password"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#F5F7FA] border border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-mono focus:bg-white focus:outline-none focus:border-[#0B1F6A] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Unlock Secure Enclave</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.25]" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={logout}
                className="w-full py-2.5 rounded-xl border border-[#D8DEE8] hover:bg-red-50 text-[#B42318] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Terminate Session &amp; Sign Out</span>
              </button>
            </div>
          </form>

          {/* Security badge */}
          <div className="mt-5 pt-3 border-t border-[#D8DEE8] flex items-center justify-between text-[11px] text-[#5F6670] font-mono">
            <span className="flex items-center gap-1.5 text-[#147A52]">
              <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Hardware HSM Enclave
            </span>
            <span>FIPS 140-3 Level 4</span>
          </div>
        </div>
      </div>

      <BiometricPromptModal
        isOpen={isBiometricOpen}
        onClose={() => setIsBiometricOpen(false)}
        onSuccess={handleBiometricSuccess}
        details={{
          title: 'Unlock Banking Enclave',
          subtitle: 'Verify live facial identity or hardware security key to resume your private wealth session.',
          actionName: 'Session Re-Authentication',
          securityLevel: 'Biometric Fast-Unlock L3'
        }}
      />
    </>
  );
};
