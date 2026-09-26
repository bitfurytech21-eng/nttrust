import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import { AuthenticationLayout } from './AuthenticationLayout';
import {
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

export const UnlockAccountView: React.FC = () => {
  const { unlockAccountWithKYC, navigateTo } = useBanking();
  const [ssnLast4, setSsnLast4] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [motherMaiden, setMotherMaiden] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState<'form' | 'success' | 'failed'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const ok = unlockAccountWithKYC({ ssnLast4, birthYear, motherMaiden });
      setIsSubmitting(false);
      if (ok) {
        setStatus('success');
      } else {
        setStatus('failed');
      }
    }, 550);
  };

  return (
    <AuthenticationLayout activeHeaderTab="help">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-md p-6 sm:p-8 border border-[#D8DEE8] shadow-xs">
          {status === 'success' ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#147A52]/10 border border-[#147A52]/20 text-[#147A52] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-[#20242A]">Account Successfully Unlocked</h2>
              <p className="text-xs text-[#5F6670] leading-relaxed">
                Your identity verification matched bank surveillance records. Security restrictions have been cleared and your session is restored.
              </p>
              <div className="p-4 bg-[#F5F7FA] rounded border border-[#D8DEE8] text-xs text-left text-[#5F6670] space-y-1 font-mono">
                <div>Client ID: <span className="text-[#20242A] font-semibold">{clientId}</span></div>
                <div>Status: <span className="text-[#147A52] font-bold">UNRESTRICTED</span></div>
                <div>Security Audit: <span className="text-[#147A52] font-semibold">KYC_CHALLENGE_SOLVED</span></div>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('/login')}
                className="w-full py-3 px-4 rounded bg-[#101F7A] hover:bg-[#081552] text-white font-semibold text-sm transition-all cursor-pointer shadow-xs"
              >
                Sign In with Restored Account &rarr;
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#147A52]/10 border border-[#147A52]/20 text-[#147A52] text-xs font-semibold mb-3">
                  <Lock className="w-3.5 h-3.5 text-[#147A52]" /> High-Assurance Unlock Protocol
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#20242A]">Unlock Client Account</h1>
                <p className="text-xs text-[#5F6670] mt-1 leading-relaxed">
                  If your profile was locked due to excessive failed password attempts or security tripwires, complete identity verification below.
                </p>
              </div>

              {status === 'failed' && (
                <div className="mb-5 p-3.5 rounded bg-rose-50 border border-rose-200 text-[#B42318] text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-[#B42318] shrink-0" />
                  <span>Identity details could not be validated. Please enter the last 4 digits of your SSN and a valid 4-digit Birth Year.</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#20242A] mb-1.5">
                    User ID or Verified Email
                  </label>
                  <input
                    type="text"
                    required
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Username or Client ID"
                    className="w-full px-3.5 py-2.5 rounded bg-white border border-[#D8DEE8] text-[#20242A] text-sm focus:outline-none focus:border-[#147A52] font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#20242A] mb-1.5">
                      Last 4 Digits of Tax ID / SSN
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={ssnLast4}
                      onChange={(e) => setSsnLast4(e.target.value.replace(/\D/g, ''))}
                      placeholder="Last 4 digits"
                      className="w-full px-3.5 py-2.5 rounded bg-white border border-[#D8DEE8] text-[#20242A] text-sm focus:outline-none focus:border-[#147A52] font-mono text-center tracking-widest"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#20242A] mb-1.5">
                      Year of Birth (YYYY)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, ''))}
                      placeholder="YYYY"
                      className="w-full px-3.5 py-2.5 rounded bg-white border border-[#D8DEE8] text-[#20242A] text-sm focus:outline-none focus:border-[#147A52] font-mono text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#20242A] mb-1.5">
                    Security Verification: Mother's Maiden Name / Secret Phrase
                  </label>
                  <input
                    type="text"
                    required
                    value={motherMaiden}
                    onChange={(e) => setMotherMaiden(e.target.value)}
                    placeholder="Enter security phrase"
                    className="w-full px-3.5 py-2.5 rounded bg-white border border-[#D8DEE8] text-[#20242A] text-sm focus:outline-none focus:border-[#147A52]"
                  />
                </div>

                <div className="p-3 rounded bg-[#F5F7FA] border border-[#D8DEE8] text-[#5F6670] text-xs flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#147A52] shrink-0" />
                  <span>Enter your verified tax identifier and security phrase to authenticate with bank surveillance records.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded bg-[#147A52] hover:bg-[#0E5E3D] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Validate Identity &amp; Unlock Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-[#D8DEE8] text-center">
                <button
                  type="button"
                  onClick={() => navigateTo('/login')}
                  className="text-xs text-[#5F6670] hover:text-[#147A52] transition-colors inline-flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AuthenticationLayout>
  );
};
