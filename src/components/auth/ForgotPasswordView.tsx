import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import { AuthenticationLayout } from './AuthenticationLayout';
import {
  KeyRound,
  ArrowLeft,
  Mail,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Lock,
  Smartphone,
  Check
} from 'lucide-react';

interface Props {
  mode?: 'forgot-password' | 'forgot-username' | 'reset-password';
}

export const ForgotPasswordView: React.FC<Props> = ({ mode = 'forgot-password' }) => {
  const { requestPasswordReset, resetPassword, navigateTo } = useBanking();
  const [identifier, setIdentifier] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // 4 steps: 1. identify -> 2. verify -> 3. reset -> 4. confirmation
  const [recoveryStep, setRecoveryStep] = useState<'identify' | 'verify' | 'reset' | 'confirmation'>(
    mode === 'reset-password' ? 'reset' : 'identify'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isForgotUsername = mode === 'forgot-username';

  const handleIdentifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      requestPasswordReset(identifier);
      setIsLoading(false);
      if (isForgotUsername) {
        setRecoveryStep('confirmation');
      } else {
        setRecoveryStep('verify');
      }
    }, 450);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      setIsLoading(false);
      setRecoveryStep('reset');
    }, 400);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters with numbers and symbols.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      resetPassword(newPassword);
      setIsLoading(false);
      setRecoveryStep('confirmation');
    }, 500);
  };

  return (
    <AuthenticationLayout activeHeaderTab="help">
      <div className="w-full max-w-md">
        {/* Step Indicator */}
        {!isForgotUsername && (
          <div className="mb-4 flex items-center justify-between text-[11px] text-[#5F6670] px-1 font-medium">
            <span className={recoveryStep === 'identify' ? 'text-[#147A52] font-bold' : 'text-[#147A52]'}>
              1. Identify
            </span>
            <span className="text-[#D8DEE8]">&rarr;</span>
            <span className={recoveryStep === 'verify' ? 'text-[#147A52] font-bold' : recoveryStep === 'identify' ? 'text-[#5F6670]' : 'text-[#147A52]'}>
              2. Verify
            </span>
            <span className="text-[#D8DEE8]">&rarr;</span>
            <span className={recoveryStep === 'reset' ? 'text-[#147A52] font-bold' : recoveryStep === 'confirmation' ? 'text-[#147A52]' : 'text-[#5F6670]'}>
              3. Reset
            </span>
            <span className="text-[#D8DEE8]">&rarr;</span>
            <span className={recoveryStep === 'confirmation' ? 'text-[#147A52] font-bold' : 'text-[#5F6670]'}>
              4. Complete
            </span>
          </div>
        )}

        <div className="bg-white rounded-md p-6 sm:p-8 border border-[#D8DEE8] shadow-xs">
          {/* STEP 1: IDENTIFY ACCOUNT */}
          {recoveryStep === 'identify' && (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#147A52]/10 border border-[#147A52]/20 text-[#147A52] text-xs font-semibold mb-3">
                  <KeyRound className="w-3.5 h-3.5 text-[#147A52]" /> Step 1: Identify Account
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#20242A]">
                  {isForgotUsername ? 'Recover Account Number' : 'Forgot Password'}
                </h1>
                <p className="text-xs text-[#5F6670] mt-1 leading-relaxed">
                  {isForgotUsername
                    ? 'Enter your registered email address to receive your account numbers and access credentials.'
                    : 'Enter your Account Number or verified email address to initiate secure credential recovery.'}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded bg-rose-50 border border-rose-200 text-[#B42318] text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleIdentifySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#20242A] mb-1.5">
                    {isForgotUsername ? 'Registered Email Address' : 'Account Number / Registered Email'}
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Account number or registered email"
                    className="w-full px-3.5 py-2.5 rounded bg-white border border-[#D8DEE8] text-[#20242A] text-sm focus:outline-none focus:border-[#147A52]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded bg-[#147A52] hover:bg-[#0E5E3D] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isForgotUsername ? 'Send My Account Number' : 'Proceed to Identity Verification'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* STEP 2: VERIFY IDENTITY */}
          {recoveryStep === 'verify' && (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#147A52]/10 border border-[#147A52]/20 text-[#147A52] text-xs font-semibold mb-3">
                  <Smartphone className="w-3.5 h-3.5 text-[#147A52]" /> Step 2: Verify Identity
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#20242A]">Security Verification</h1>
                <p className="text-xs text-[#5F6670] mt-1 leading-relaxed">
                  We dispatched a 6-digit recovery OTP code to the primary phone / device registered for <span className="text-[#147A52] font-mono font-semibold">{identifier}</span>.
                </p>
              </div>

              <div className="mb-4 p-3 rounded bg-[#F5F7FA] border border-[#D8DEE8] flex items-center justify-between text-xs">
                <span className="text-[#5F6670]">Dispatched Code to: +1 (•••) •••-2810</span>
                <button
                  type="button"
                  onClick={() => setVerificationCode('884921')}
                  className="px-2 py-1 rounded bg-[#147A52]/10 text-[#147A52] font-semibold text-[11px] border border-[#147A52]/20 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  Auto-Fill OTP
                </button>
              </div>

              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#20242A] mb-1.5">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit code"
                    className="w-full text-center tracking-[0.3em] font-mono text-xl py-2.5 rounded bg-white border border-[#D8DEE8] text-[#147A52] placeholder-[#5F6670] focus:outline-none focus:border-[#147A52]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded bg-[#147A52] hover:bg-[#0E5E3D] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Confirm Identity &amp; Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* STEP 3: RESET PASSWORD */}
          {recoveryStep === 'reset' && (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#147A52]/10 border border-[#147A52]/20 text-[#147A52] text-xs font-semibold mb-3">
                  <Lock className="w-3.5 h-3.5 text-[#147A52]" /> Step 3: Reset Password
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#20242A]">Create New Password</h1>
                <p className="text-xs text-[#5F6670] mt-1 leading-relaxed">
                  Establish a secure master password for your sovereign banking access.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded bg-rose-50 border border-rose-200 text-[#B42318] text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#20242A] mb-1.5">
                    New Master Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters with symbol &amp; number"
                    className="w-full px-3.5 py-2.5 rounded bg-white border border-[#D8DEE8] text-[#20242A] text-sm focus:outline-none focus:border-[#147A52]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#20242A] mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full px-3.5 py-2.5 rounded bg-white border border-[#D8DEE8] text-[#20242A] text-sm focus:outline-none focus:border-[#147A52]"
                  />
                </div>

                <div className="p-3 bg-[#F5F7FA] rounded border border-[#D8DEE8] text-[11px] text-[#5F6670] space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Check className={`w-3.5 h-3.5 ${newPassword.length >= 8 ? 'text-[#147A52]' : 'text-[#5F6670]'}`} />
                    <span>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className={`w-3.5 h-3.5 ${/\d/.test(newPassword) ? 'text-[#147A52]' : 'text-[#5F6670]'}`} />
                    <span>Includes at least one numeric digit</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded bg-[#147A52] hover:bg-[#0E5E3D] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Save Password &amp; Terminate Old Sessions</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* STEP 4: CONFIRMATION */}
          {recoveryStep === 'confirmation' && (
            <div className="text-center py-5 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#147A52]/10 border border-[#147A52]/20 text-[#147A52] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-[#20242A]">
                {isForgotUsername ? 'Account Number Dispatched' : 'Password Successfully Updated'}
              </h2>
              <p className="text-xs text-[#5F6670] leading-relaxed">
                {isForgotUsername
                  ? `Your Account Number details and credentials have been dispatched to ${identifier}. Please check your inbox and return to sign in.`
                  : 'Your credentials have been updated securely across all banking gateways. You can now sign in immediately.'}
              </p>
              <button
                type="button"
                onClick={() => navigateTo('/login')}
                className="w-full py-3 px-4 rounded bg-[#147A52] hover:bg-[#0E5E3D] text-white font-semibold text-sm transition-all cursor-pointer shadow-xs"
              >
                Return to Sign In &rarr;
              </button>
            </div>
          )}

          {/* Back to Login link */}
          {recoveryStep !== 'confirmation' && (
            <div className="mt-6 pt-4 border-t border-[#D8DEE8] text-center">
              <button
                type="button"
                onClick={() => navigateTo('/login')}
                className="text-xs text-[#5F6670] hover:text-[#147A52] transition-colors inline-flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthenticationLayout>
  );
};
