import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import { AuthenticationLayout } from './AuthenticationLayout';
import {
  Smartphone,
  Laptop,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Cpu,
  Fingerprint
} from 'lucide-react';

export const RegisterDeviceView: React.FC = () => {
  const { registerCurrentDevice, navigateTo } = useBanking();
  const [deviceName, setDeviceName] = useState('');
  const [isTrusted, setIsTrusted] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setTimeout(() => {
      registerCurrentDevice(deviceName || 'Primary Authorized Device', isTrusted);
      setIsRegistering(false);
      setIsDone(true);
    }, 550);
  };

  return (
    <AuthenticationLayout activeHeaderTab="devices">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-md p-6 sm:p-8 border border-[#D8DEE8] shadow-xs">
          {isDone ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#147A52]/10 border border-[#147A52]/20 text-[#147A52] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-[#20242A]">Device Successfully Registered</h2>
              <p className="text-xs text-[#5F6670] leading-relaxed">
                Your device cryptographic fingerprint has been securely bound to the Northern Trust security enclave.
              </p>
              <div className="p-3 bg-[#F5F7FA] rounded border border-[#D8DEE8] text-left text-xs font-mono text-[#5F6670] space-y-1">
                <div>Hardware Name: <span className="text-[#20242A] font-semibold">{deviceName || 'Primary Authorized Device'}</span></div>
                <div>Device Token: <span className="text-[#147A52] font-semibold">fp_09af82b144ce</span></div>
                <div>Status: <span className="text-[#147A52] font-bold">ENROLLED &amp; TRUSTED</span></div>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('/login')}
                className="w-full py-2.5 px-4 rounded bg-[#101F7A] hover:bg-[#081552] text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#147A52]/10 border border-[#147A52]/20 text-[#147A52] text-xs font-semibold mb-3">
                  <Cpu className="w-3.5 h-3.5 text-[#147A52]" /> FIDO2 Device Trust Setup
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#20242A]">Register Device</h1>
                <p className="text-xs text-[#5F6670] mt-1 leading-relaxed">
                  Registering this browser or computer registers a unique hardware cryptographic signature with your banking profile.
                </p>
              </div>

              <div className="mb-5 p-3.5 rounded bg-[#F5F7FA] border border-[#D8DEE8] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#5F6670]">
                  <span>Detected OS:</span>
                  <span className="text-[#20242A] font-medium">macOS / Chromium Secure Engine</span>
                </div>
                <div className="flex items-center justify-between text-[#5F6670]">
                  <span>Client IP:</span>
                  <span className="text-[#20242A] font-mono">198.51.100.44 (New York, US)</span>
                </div>
                <div className="flex items-center justify-between text-[#5F6670]">
                  <span>Hardware Enclave:</span>
                  <span className="text-[#147A52] font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Hardware Key Available
                  </span>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#20242A] mb-1.5">
                    Custom Device Nickname
                  </label>
                  <input
                    type="text"
                    required
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="Device label or nickname"
                    className="w-full px-3.5 py-2.5 rounded bg-white border border-[#D8DEE8] text-[#20242A] text-sm focus:outline-none focus:border-[#147A52]"
                  />
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#5F6670] select-none">
                    <input
                      type="checkbox"
                      checked={isTrusted}
                      onChange={(e) => setIsTrusted(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-[#D8DEE8] text-[#147A52] focus:ring-[#147A52] cursor-pointer"
                    />
                    <span>
                      Mark as Trusted Device (Grants 30-day fast-track session validation from this hardware).
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full py-3 px-4 rounded bg-[#147A52] hover:bg-[#0E5E3D] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isRegistering ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Enroll &amp; Cryptographically Bind</span>
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
