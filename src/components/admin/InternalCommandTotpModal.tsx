import React, { useState, useRef, useEffect } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  ShieldAlert,
  KeyRound,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
  Smartphone,
  HelpCircle
} from 'lucide-react';
import { AdminGoogleAuthenticatorModal } from './AdminGoogleAuthenticatorModal';

interface InternalCommandTotpModalProps {
  isOpen: boolean;
  onClose: () => void;
  commandName: string;
  commandDescription?: string;
  onConfirm: () => void;
}

export const InternalCommandTotpModal: React.FC<InternalCommandTotpModalProps> = ({
  isOpen,
  onClose,
  commandName,
  commandDescription,
  onConfirm
}) => {
  const { executeInternalBankCommand } = useBanking();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPairingModalOpen, setIsPairingModalOpen] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setErrorMsg('');
      setIsSuccess(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);
    setErrorMsg('');

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = digits.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits from your Google Authenticator app.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');

    const res = await executeInternalBankCommand(commandName, fullCode, () => {
      onConfirm();
    });

    setIsVerifying(false);

    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      setErrorMsg(res.error || 'Invalid passcode. Please check your Google Authenticator app.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in text-[#20242A]">
        <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] max-w-md w-full p-6 sm:p-7 shadow-2xl relative my-auto">
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-[#5F6670] hover:text-[#20242A] p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2.25]" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3.5 mb-5 pb-4 border-b-2 border-[#F5F7FA]">
            <div className="w-12 h-12 rounded-xl bg-[#147A52] text-white flex items-center justify-center shrink-0 shadow-sm">
              <KeyRound className="w-6 h-6 stroke-[2.25]" />
            </div>
            <div>
              <h2 className="text-base font-black font-serif text-[#20242A] leading-tight">
                Internal Bank Command Authorization
              </h2>
              <span className="text-xs text-[#147A52] font-mono font-bold block mt-0.5">
                Google Authenticator Challenge (RFC 6238)
              </span>
            </div>
          </div>

          {/* Command Details */}
          <div className="mb-5 p-3.5 rounded-xl bg-amber-50/80 border-2 border-amber-300 text-xs text-amber-900 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#B87500] shrink-0 mt-0.5 stroke-[2.25]" />
              <div>
                <span className="font-extrabold block text-amber-950">{commandName}</span>
                {commandDescription && (
                  <span className="text-amber-900 text-xs block mt-1 leading-relaxed font-medium">
                    {commandDescription}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Subtitle instructions */}
          <p className="text-xs text-[#5F6670] mb-4 leading-relaxed text-center font-medium">
            Open your personal <strong className="text-[#20242A] font-bold">Google Authenticator</strong> app on your mobile device and enter the active 6-digit dynamic passcode to authorize this action.
          </p>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border-2 border-red-300 text-[#B42318] text-xs font-bold flex items-center gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 stroke-[2.25] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-[#147A52]/10 border-2 border-emerald-300 text-[#147A52] text-xs font-bold flex items-center gap-2.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#147A52] stroke-[2.25] shrink-0" />
              <span>Internal command authorized &amp; executed successfully!</span>
            </div>
          )}

          {/* 6-Digit Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={isSuccess || isVerifying}
                  className="w-11 h-14 sm:w-13 sm:h-16 text-center text-xl font-black font-mono border-2 border-[#D8DEE8] rounded-xl focus:border-[#147A52] focus:ring-2 focus:ring-[#147A52]/20 focus:outline-none transition-all shadow-2xs"
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isVerifying || isSuccess || digits.join('').length !== 6}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
                  digits.join('').length === 6 && !isVerifying && !isSuccess
                    ? 'bg-[#101F7A] hover:bg-[#081552] text-white cursor-pointer'
                    : 'bg-slate-100 text-[#5F6670] cursor-not-allowed border-2 border-[#D8DEE8]'
                }`}
              >
                {isVerifying ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authorize Internal Command</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.25]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Pairing link */}
          <div className="mt-5 pt-3.5 border-t-2 border-[#F5F7FA] flex items-center justify-between text-xs text-[#5F6670]">
            <button
              type="button"
              onClick={() => setIsPairingModalOpen(true)}
              className="text-[#147A52] hover:underline font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 stroke-[2.25]" />
              <span>Pair Google Authenticator QR</span>
            </button>
            <span className="font-mono text-xs font-bold text-[#5F6670]">RFC 6238 • 30s</span>
          </div>
        </div>
      </div>

      {/* Google Authenticator Pairing Modal */}
      <AdminGoogleAuthenticatorModal
        isOpen={isPairingModalOpen}
        onClose={() => setIsPairingModalOpen(false)}
      />
    </>
  );
};
