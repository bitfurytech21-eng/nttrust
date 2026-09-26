import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useBanking } from '../../context/BankingContext';
import { buildTotpUri, generateTotpSecret, verifyTotpToken } from '../../utils/totp';
import {
  KeyRound,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Smartphone,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

interface AdminGoogleAuthenticatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminGoogleAuthenticatorModal: React.FC<AdminGoogleAuthenticatorModalProps> = ({
  isOpen,
  onClose
}) => {
  const { adminTotpSecret, updateAdminTotpSecret } = useBanking();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [testCode, setTestCode] = useState('');
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const uri = buildTotpUri(adminTotpSecret, 'BankAdmin', 'Northern Trust');
    QRCode.toDataURL(uri, {
      width: 240,
      margin: 2,
      color: {
        dark: '#147A52',
        light: '#ffffff'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [isOpen, adminTotpSecret]);

  if (!isOpen) return null;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(adminTotpSecret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleGenerateNewKey = () => {
    const newKey = generateTotpSecret(16);
    updateAdminTotpSecret(newKey);
    setTestResult(null);
  };

  const handleSaveCustomKey = () => {
    const clean = customKeyInput.toUpperCase().replace(/[^A-Z2-7]/g, '');
    if (clean.length < 8) {
      setTestResult({ success: false, message: 'Secret key must be at least 8 Base32 characters (A-Z, 2-7).' });
      return;
    }
    updateAdminTotpSecret(clean);
    setIsEditingKey(false);
    setCustomKeyInput('');
    setTestResult({ success: true, message: 'Custom secret key saved successfully!' });
  };

  const handleTestVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    const res = await verifyTotpToken(adminTotpSecret, testCode);
    setIsTesting(false);

    if (res.valid) {
      setTestResult({
        success: true,
        message: 'Google Authenticator verified! Your phone app is perfectly synchronized.'
      });
    } else {
      setTestResult({
        success: false,
        message: 'Invalid code. Make sure the code in Google Authenticator hasn’t expired (codes refresh every 30 seconds).'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in text-[#20242A]">
      <div className="bg-white rounded-lg border border-[#D8DEE8] max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-[#e2e6e9]">
          <div className="w-9 h-9 rounded-md bg-[#147A52] text-white flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#20242A] leading-tight">
              Personal Google Authenticator Pairing
            </h2>
            <p className="text-xs text-gray-500">
              Bank Operations Internal Command Security (RFC 6238 TOTP)
            </p>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-4 text-xs">
          <div className="bg-[#147A52]/10/70 border border-[#147A52]/20 rounded-md p-3 text-emerald-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#147A52] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-[#147A52]">Bank Command Authorization Engine</span>
              Internal actions (approving high-value wires, account overrides, and admin logins) require dynamic 6-digit codes generated on your personal mobile device.
            </div>
          </div>

          {/* QR Code and Secret Key Card */}
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex flex-col sm:flex-row items-center gap-4">
            {/* QR Code */}
            <div className="bg-white p-2 rounded-md border border-gray-300 shadow-2xs shrink-0 flex flex-col items-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Scan in Google Authenticator"
                  className="w-36 h-36 object-contain"
                />
              ) : (
                <div className="w-36 h-36 flex items-center justify-center text-gray-400">
                  <QrCode className="w-12 h-12 animate-pulse" />
                </div>
              )}
              <span className="text-[10px] text-gray-500 mt-1 font-medium flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-[#147A52]" /> Scan with phone camera
              </span>
            </div>

            {/* Secret details */}
            <div className="flex-1 w-full space-y-2.5 text-left">
              <div>
                <span className="text-[11px] font-semibold text-gray-600 block mb-1">
                  1. Scan in Google Authenticator
                </span>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Open Google Authenticator on your phone &rarr; Tap &ldquo;+&rdquo; &rarr; Select &ldquo;Scan a QR code&rdquo;.
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-gray-600 block mb-1">
                  2. Or enter Key manually:
                </span>
                <div className="flex items-center gap-1.5">
                  <code className="px-2 py-1 bg-white border border-gray-300 rounded font-mono font-bold text-xs text-[#147A52] tracking-wider select-all">
                    {adminTotpSecret}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="p-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 cursor-pointer transition-colors"
                    title="Copy Key"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-[#147A52]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={handleGenerateNewKey}
                  className="text-[11px] text-gray-600 hover:text-[#147A52] flex items-center gap-1 underline cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Generate New Key
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setIsEditingKey(!isEditingKey)}
                  className="text-[11px] text-gray-600 hover:text-[#147A52] underline cursor-pointer"
                >
                  {isEditingKey ? 'Cancel' : 'Enter My Custom Key'}
                </button>
              </div>

              {isEditingKey && (
                <div className="mt-2 p-2 bg-white rounded border border-gray-300 space-y-2">
                  <input
                    type="text"
                    value={customKeyInput}
                    onChange={(e) => setCustomKeyInput(e.target.value)}
                    placeholder="Enter Base32 Secret"
                    className="w-full text-xs font-mono px-2 py-1 border border-gray-300 rounded focus:border-[#147A52] focus:outline-none uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleSaveCustomKey}
                    className="px-2.5 py-1 bg-[#101F7A] text-white rounded text-[11px] font-semibold hover:bg-[#081552] cursor-pointer"
                  >
                    Save Custom Key
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Live Synchronicity Verification */}
          <div className="border border-gray-200 rounded-lg p-3 bg-white space-y-2">
            <span className="font-semibold block text-gray-700">
              Verify Google Authenticator Code
            </span>
            <form onSubmit={handleTestVerify} className="flex items-center gap-2">
              <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                value={testCode}
                onChange={(e) => setTestCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6 digits from phone"
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-center font-mono font-bold text-sm tracking-widest focus:outline-none focus:border-[#147A52]"
              />
              <button
                type="submit"
                disabled={testCode.length !== 6 || isTesting}
                className={`px-3 py-1.5 rounded font-semibold text-xs transition-colors shrink-0 ${
                  testCode.length === 6 && !isTesting
                    ? 'bg-[#147A52] text-white hover:bg-[#081552] cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                }`}
              >
                {isTesting ? 'Verifying...' : 'Validate Code'}
              </button>
            </form>

            {testResult && (
              <div
                className={`p-2 rounded text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-[#147A52]/10 text-[#147A52] border border-emerald-300'
                    : 'bg-red-50 text-red-800 border border-red-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-[#147A52] shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#B42318] shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#101F7A] text-white text-xs font-semibold hover:bg-[#081552] transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
