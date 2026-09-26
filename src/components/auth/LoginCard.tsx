import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import { NorthernTrustLogo } from '../common/NorthernTrustLogo';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  Smartphone,
  User
} from 'lucide-react';

export const LoginCard: React.FC = () => {
  const { login, navigateTo } = useBanking();
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(accountNumber, password, rememberDevice);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
      }
    }, 350);
  };

  return (
    <div className="login-container">
      {/* Main Client Login Card */}
      <div className="login-card">
        {/* Initial Company Brand Logo and Name on Login Session */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-[#D8DEE8]">
          <div className="w-12 h-12 rounded-xl bg-[#147A52] text-white flex items-center justify-center p-2 shrink-0 shadow-sm">
            <NorthernTrustLogo className="w-full h-full text-white" color="#FFFFFF" title="Northern Trust" />
          </div>
          <div>
            <span className="font-serif font-black text-2xl text-[#20242A] block leading-tight tracking-tight">
              Northern Trust
            </span>
            <span className="text-[11px] font-sans font-bold tracking-[0.14em] uppercase text-[#147A52] block mt-0.5">
              Wealth Management &bull; Private Client
            </span>
          </div>
        </div>

        {/* Heading & Subtitle */}
        <div className="mb-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold mb-2 bg-[#147A52]/10 text-[#147A52] border border-[#147A52]/20">
            <User className="w-3 h-3 text-[#147A52]" /> Personal &amp; Private Wealth Client Enclave
          </div>
          <h1 className="login-heading">Client Sign In</h1>
          <p className="login-subtitle mb-2">
            Enter your Account Number and password to access your accounts. Non-existent account numbers are strictly blocked by bank ledger security.
          </p>

          <div className="p-2.5 rounded-xl bg-slate-100 border border-[#D8DEE8] text-[11px] text-[#5F6670] flex items-center justify-between font-mono">
            <span>Demo Acc #: <strong className="text-[#0B1F6A]">882049102741</strong> (or <strong className="text-[#0B1F6A]">angelina.jolie</strong>)</span>
            <button
              type="button"
              onClick={() => {
                setAccountNumber('882049102741');
                setPassword('password123');
              }}
              className="text-[#147A52] font-sans font-bold hover:underline cursor-pointer"
            >
              Fill Credentials
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded bg-red-50 border border-red-200 text-[#B42318] text-xs">
            <p className="font-semibold">{errorMessage}</p>
            {errorMessage.includes('unlock-account') && (
              <button
                type="button"
                onClick={() => navigateTo('/unlock-account')}
                className="mt-1 font-semibold text-[#147A52] underline hover:text-[#147A52] block cursor-pointer"
              >
                Initiate Account Unlock Protocol &rarr;
              </button>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Account Number Input */}
          <div className="form-group">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="accountNumberInput" className="form-label mb-0">
                Account Number
              </label>
              <button
                type="button"
                onClick={() => navigateTo('/forgot-username')}
                className="auth-link text-xs"
              >
                Forgot Account Number?
              </button>
            </div>
            <input
              id="accountNumberInput"
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter your account number"
              className={`form-input font-mono tracking-wide ${errorMessage ? 'input-error' : ''}`}
            />
          </div>

          {/* Password Input */}
          <div className="form-group">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="passwordInput" className="form-label mb-0">
                Password
              </label>
              <button
                type="button"
                onClick={() => navigateTo('/forgot-password')}
                className="auth-link text-xs"
              >
                Forgot Password?
              </button>
            </div>
            <div className="password-wrapper">
              <input
                id="passwordInput"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={`form-input ${errorMessage ? 'input-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#5F6670]" />}
              </button>
            </div>
          </div>

          {/* Remember Device Checkbox */}
          <div className="form-options">
            <label className="checkbox-wrapper cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
              />
              <span>Remember this device for 30 days</span>
            </label>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="primary-button cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In with Account Number</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Links */}
        <div className="auth-links">
          <button
            type="button"
            onClick={() => navigateTo('/unlock-account')}
            className="auth-link text-xs flex items-center gap-1"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Unlock Account</span>
          </button>
          <span className="text-[#D8DEE8]">•</span>
          <button
            type="button"
            onClick={() => navigateTo('/register-device')}
            className="auth-link text-xs flex items-center gap-1"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Register Device</span>
          </button>
        </div>

        {/* Security Notice */}
        <div className="security-notice">
          <div className="security-notice-title">
            <ShieldCheck className="w-4 h-4 text-[#147A52]" />
            <span>High-Assurance Client Security</span>
          </div>
          <div>
            Your connection is guarded by 256-bit encryption and hardware enclave token validation. Never share your password or one-time verification codes.
          </div>
        </div>
      </div>
    </div>
  );
};
