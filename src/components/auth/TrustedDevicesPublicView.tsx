import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import { AuthenticationLayout } from './AuthenticationLayout';
import {
  Laptop,
  Smartphone,
  ShieldCheck,
  Trash2,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Clock,
  MapPin,
  Fingerprint
} from 'lucide-react';

export const TrustedDevicesPublicView: React.FC = () => {
  const { trustedDevices, revokeDevice, navigateTo, currentUser } = useBanking();
  const [successNotice, setSuccessNotice] = useState('');

  const handleRevoke = (id: string, name: string) => {
    revokeDevice(id);
    setSuccessNotice(`Revoked trust from hardware: "${name}". It will require step-up 2FA next time.`);
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  return (
    <AuthenticationLayout activeHeaderTab="devices">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#147A52]/10 border border-[#147A52]/20 text-[#147A52] text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#147A52]" /> FIDO2 / WebAuthn Enrolled Hardware Enclave
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#20242A] tracking-tight">Trusted Hardware Vault</h1>
            <p className="text-xs text-[#5F6670] mt-1">
              Devices listed here have been cryptographically authenticated and granted fast-track 2-step verification bypass.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('/register-device')}
            className="px-4 py-2.5 rounded bg-[#101F7A] hover:bg-[#081552] text-white font-semibold text-xs flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> Register Current Device
          </button>
        </div>

        {successNotice && (
          <div className="mb-6 p-3.5 rounded bg-[#147A52]/10 border border-[#147A52]/20 text-[#147A52] text-xs flex items-center gap-2.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#147A52] shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        <div className="space-y-4">
          {trustedDevices.map((dev) => (
            <div
              key={dev.id}
              className="bg-white rounded-md p-5 border border-[#D8DEE8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#bcc5cc] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded flex items-center justify-center shrink-0 ${
                  dev.isCurrent
                    ? 'bg-[#147A52]/10 text-[#147A52] border border-[#147A52]/20'
                    : 'bg-[#F5F7FA] text-[#5F6670] border border-[#D8DEE8]'
                }`}>
                  {dev.name.toLowerCase().includes('phone') ? (
                    <Smartphone className="w-5 h-5 text-[#147A52]" />
                  ) : (
                    <Laptop className="w-5 h-5 text-[#147A52]" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#20242A]">{dev.name}</h3>
                    {dev.isCurrent && (
                      <span className="px-2 py-0.5 rounded bg-[#147A52]/10 text-[#147A52] text-[10px] font-semibold border border-[#147A52]/20">
                        This Device (Active Session)
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5F6670] mt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-[#5F6670]" /> {dev.browser}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#5F6670]" /> {dev.location} ({dev.ip})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#5F6670]" /> Last Active: {dev.lastActive}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] font-mono text-[#147A52]">
                    Hardware Fingerprint: {dev.fingerprint}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRevoke(dev.id, dev.name)}
                className="px-3 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-[#B42318] border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors self-end sm:self-center cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" /> Revoke Trust
              </button>
            </div>
          ))}

          {trustedDevices.length === 0 && (
            <div className="text-center py-12 border border-dashed border-[#D8DEE8] rounded bg-white">
              <Fingerprint className="w-10 h-10 text-[#5F6670] mx-auto mb-2" />
              <p className="text-sm text-[#5F6670]">No trusted devices registered.</p>
              <button
                type="button"
                onClick={() => navigateTo('/register-device')}
                className="mt-3 text-xs text-[#147A52] font-semibold hover:underline cursor-pointer"
              >
                Register this device now &rarr;
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-[#D8DEE8] flex justify-between items-center text-xs">
          <button
            type="button"
            onClick={() => navigateTo(currentUser ? '/dashboard' : '/login')}
            className="text-[#5F6670] hover:text-[#147A52] transition-colors flex items-center gap-1 cursor-pointer font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {currentUser ? 'Return to Dashboard' : 'Return to Sign In'}
          </button>
          <span className="text-[#5F6670] font-mono text-[11px]">Hardware Trust TTL: 30-Day Sliding Window</span>
        </div>
      </div>
    </AuthenticationLayout>
  );
};
