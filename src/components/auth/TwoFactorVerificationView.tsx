import React, { useState, useEffect, useRef } from 'react';
import { useBanking } from '../../context/BankingContext';
import { AuthenticationLayout } from './AuthenticationLayout';
import {
  Smartphone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  RotateCw,
  ShieldCheck
} from 'lucide-react';

export const TwoFactorVerificationView: React.FC = () => {
  const { verify2FA, rememberDeviceChecked, navigateTo } = useBanking();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [trustDevice, setTrustDevice] = useState(rememberDeviceChecked);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(45);
  const [showResendToast, setShowResendToast] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for resending SMS
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const fullCode = digits.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter the full 6-digit SMS verification code received.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = verify2FA(fullCode, trustDevice);
      setIsLoading(false);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid SMS verification passcode. Please verify the code provided.');
      }
    }, 350);
  };

  const handleResendSms = () => {
    if (resendCountdown > 0) return;
    setResendCountdown(45);
    setShowResendToast(true);
    setTimeout(() => setShowResendToast(false), 4000);
  };

  return (
    <AuthenticationLayout activeHeaderTab="signin">
      <div className="login-container max-w-[460px]">
        {/* Verification Card */}
        <div className="login-card verification-card">
          {/* SMS Verification Icon */}
          <div className="verification-icon">
            <Smartphone className="w-7 h-7 text-[#147A52]" />
          </div>

          {/* Heading */}
          <h1 className="login-heading">Two-Step Verification</h1>
          <p className="login-subtitle">
            A 6-digit one-time passcode has been dispatched via SMS to your registered primary mobile device ending in <strong className="text-[#20242A]">••••4921</strong>.
          </p>

          {showResendToast && (
            <div className="mb-4 p-2.5 rounded bg-[#147A52]/10 border border-emerald-300 text-[#147A52] text-xs text-left flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#147A52] shrink-0" />
              <span>New SMS security verification code dispatched to your mobile device.</span>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-2.5 rounded bg-red-50 border border-red-200 text-[#B42318] text-xs text-left flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="text-left">
            <div className="form-group mb-4">
              <label className="form-label text-center block mb-3 text-xs font-semibold text-gray-700">
                Enter 6-Digit SMS Passcode
              </label>
              <div className="verification-code" onPaste={handlePaste}>
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
                    autoFocus={idx === 0}
                  />
                ))}
              </div>
            </div>

            {/* Resend SMS Code trigger */}
            <div className="flex items-center justify-between text-xs mb-4">
              <span className="text-gray-500">Didn&apos;t receive a text?</span>
              <button
                type="button"
                onClick={handleResendSms}
                disabled={resendCountdown > 0}
                className={`font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  resendCountdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#147A52] hover:underline'
                }`}
              >
                <RotateCw className={`w-3 h-3 ${resendCountdown > 0 ? '' : 'text-[#147A52]'}`} />
                <span>{resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : 'Resend SMS code'}</span>
              </button>
            </div>

            {/* Remember Device */}
            <div className="form-options mb-5">
              <label className="checkbox-wrapper cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={trustDevice}
                  onChange={(e) => setTrustDevice(e.target.checked)}
                />
                <span>Trust this device (Bypasses 2FA for 30 days)</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="primary-button"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify Identity &amp; Open Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom links */}
          <div className="auth-links pt-3 border-t border-[#D8DEE8] mt-6 flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={() => navigateTo('/login')}
              className="auth-link text-xs flex items-center gap-1 text-[#5F6670] hover:text-[#147A52]"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
            </button>
            <button
              type="button"
              onClick={() => navigateTo('/trusted-devices')}
              className="auth-link text-xs"
            >
              Manage Trusted Devices
            </button>
          </div>
        </div>
      </div>
    </AuthenticationLayout>
  );
};
