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
  Smartphone,
  ShieldCheck,
  Lock,
  Terminal,
  Clock,
  ShieldAlert,
  Sliders,
  SendHorizontal,
  Wallet,
  FileCheck
} from 'lucide-react';

export const AdminAuthenticatorView: React.FC = () => {
  const { adminTotpSecret, updateAdminTotpSecret, auditLogs } = useBanking();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [testCode, setTestCode] = useState('');
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30 - (Math.floor(Date.now() / 1000) % 30));

  // 30-second interval ticker for TOTP cycle
  useEffect(() => {
    const interval = setInterval(() => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      setSecondsRemaining(30 - (nowSeconds % 30));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Generate QR Code
  useEffect(() => {
    const uri = buildTotpUri(adminTotpSecret, 'BankAdmin (Sarah Jenkins)', 'Northern Trust');
    QRCode.toDataURL(uri, {
      width: 260,
      margin: 2,
      color: {
        dark: '#147A52',
        light: '#ffffff'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [adminTotpSecret]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(adminTotpSecret);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleGenerateNewKey = () => {
    const newKey = generateTotpSecret(16);
    updateAdminTotpSecret(newKey);
    setTestResult({ success: true, message: 'New secret key generated! Scan the updated QR code with Google Authenticator.' });
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
        message: 'Google Authenticator verified successfully! Your mobile app is synced and ready for internal bank commands.'
      });
    } else {
      setTestResult({
        success: false,
        message: 'Invalid code. Check that your Google Authenticator clock is synchronized and the code has not expired.'
      });
    }
  };

  const authAuditLogs = auditLogs.filter(
    (l) => l.event.includes('TOTP') || l.details.includes('Authenticator') || l.category === '2FA_CHALLENGE'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D8DEE8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-[#20242A]">
              Personal Google Authenticator Integration
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-100 text-[#147A52] border border-emerald-300">
              RFC 6238 ACTIVE
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Bank Operations Internal Command Security Engine. Pair your mobile device to authorize administrative actions.
          </p>
        </div>

        {/* 30-Second Cycle Indicator */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white border border-[#D8DEE8] shadow-2xs">
          <Clock className="w-4 h-4 text-[#147A52]" />
          <div>
            <span className="text-[10px] text-gray-500 block uppercase tracking-wider font-semibold">TOTP Step Cycle</span>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[#147A52]">
              <span>{secondsRemaining}s remaining</span>
              <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#147A52] transition-all duration-1000"
                  style={{ width: `${(secondsRemaining / 30) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: QR Code & Pairing */}
        <div className="lg:col-span-7 bg-white rounded-lg border border-[#D8DEE8] p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-sm font-bold text-[#20242A] flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#147A52]" /> Mobile Authenticator Pairing
            </h2>
            <span className="text-[11px] text-[#147A52] font-semibold bg-[#147A52]/10 px-2 py-0.5 rounded border border-[#147A52]/20">
              Google Authenticator • Microsoft • Authy
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* QR Card */}
            <div className="bg-white p-3 rounded-lg border border-gray-300 shadow-xs flex flex-col items-center shrink-0">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Scan with Google Authenticator"
                  className="w-48 h-48 object-contain"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-gray-400">
                  <QrCode className="w-12 h-12 animate-pulse" />
                </div>
              )}
              <span className="text-[11px] text-gray-600 mt-2 font-medium flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-[#147A52]" /> Scan with phone camera
              </span>
            </div>

            {/* Instructions & Secret Key */}
            <div className="flex-1 space-y-3.5 text-xs text-left">
              <div>
                <span className="font-bold text-gray-800 block mb-1">
                  How to link your personal authenticator:
                </span>
                <ol className="list-decimal list-inside text-gray-600 space-y-1 text-[11px] leading-relaxed">
                  <li>Open the <strong className="text-gray-900">Google Authenticator</strong> app on your smartphone.</li>
                  <li>Tap the <strong className="text-gray-900">+</strong> button and choose <strong className="text-gray-900">Scan a QR code</strong>.</li>
                  <li>Point your phone camera at the QR code on the left.</li>
                  <li>Your phone will immediately generate dynamic 6-digit codes.</li>
                </ol>
              </div>

              {/* Secret Key Display */}
              <div className="p-3 rounded-md bg-gray-50 border border-gray-200 space-y-1.5">
                <span className="text-[11px] font-semibold text-gray-600 block">
                  Manual Entry Base32 Secret Key:
                </span>
                <div className="flex items-center gap-2">
                  <code className="px-2.5 py-1 bg-white border border-gray-300 rounded font-mono font-bold text-xs text-[#147A52] tracking-wider select-all">
                    {adminTotpSecret}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyKey}
                    className="p-1.5 rounded border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 cursor-pointer transition-colors shadow-2xs"
                    title="Copy Key"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-[#147A52]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={handleGenerateNewKey}
                  className="px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:text-[#147A52] border border-gray-300 rounded bg-white hover:bg-gray-50 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Generate New Secret
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingKey(!isEditingKey)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:text-[#147A52] border border-gray-300 rounded bg-white hover:bg-gray-50 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <KeyRound className="w-3 h-3" /> {isEditingKey ? 'Cancel' : 'Enter My Custom Secret'}
                </button>
              </div>

              {isEditingKey && (
                <div className="p-3 bg-gray-50 rounded-md border border-gray-300 space-y-2">
                  <label className="text-[11px] font-semibold text-gray-700 block">
                    Use Your Existing Authenticator Secret:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customKeyInput}
                      onChange={(e) => setCustomKeyInput(e.target.value)}
                      placeholder="Enter Base32 Secret"
                      className="flex-1 text-xs font-mono px-2.5 py-1.5 border border-gray-300 rounded focus:border-[#147A52] focus:outline-none uppercase bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCustomKey}
                      className="px-3 py-1.5 bg-[#101F7A] text-white rounded text-xs font-semibold hover:bg-[#081552] cursor-pointer shrink-0"
                    >
                      Save Key
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Verify Live Code */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#147A52]" /> Verify Google Authenticator Code
            </h3>
            <form onSubmit={handleTestVerify} className="flex items-center gap-2">
              <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                value={testCode}
                onChange={(e) => setTestCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code from phone"
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-center font-mono font-bold text-base tracking-widest focus:outline-none focus:border-[#147A52] bg-white"
              />
              <button
                type="submit"
                disabled={testCode.length !== 6 || isTesting}
                className={`px-4 py-2 rounded font-semibold text-xs transition-colors shrink-0 ${
                  testCode.length === 6 && !isTesting
                    ? 'bg-[#147A52] text-white hover:bg-[#081552] cursor-pointer shadow-xs'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                }`}
              >
                {isTesting ? 'Verifying...' : 'Validate Code'}
              </button>
            </form>

            {testResult && (
              <div
                className={`mt-3 p-2.5 rounded text-xs flex items-center gap-2 ${
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

        {/* Right: Protected Internal Bank Commands & Policies */}
        <div className="lg:col-span-5 space-y-6">
          {/* Protected Commands List */}
          <div className="bg-white rounded-lg border border-[#D8DEE8] p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <ShieldCheck className="w-4 h-4 text-[#147A52]" />
              <h3 className="text-sm font-bold text-[#20242A]">
                Protected Internal Bank Commands
              </h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              In accordance with Federal Reserve Board &amp; OCC dual-control standards, the following internal commands require active Google Authenticator authorization:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-md bg-[#147A52]/10/60 border border-[#147A52]/20 flex items-start gap-2.5">
                <SendHorizontal className="w-4 h-4 text-[#147A52] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#20242A] block">Wire Settlement Approval</span>
                  <span className="text-[11px] text-gray-600">Release of pending commercial Fedwire &amp; SWIFT transfers.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-md bg-[#147A52]/10/60 border border-[#147A52]/20 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-[#B87500] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#20242A] block">AML / FinCEN Hold &amp; Freeze</span>
                  <span className="text-[11px] text-gray-600">Applying suspicious activity holds and asset freezes.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-md bg-[#147A52]/10/60 border border-[#147A52]/20 flex items-start gap-2.5">
                <Wallet className="w-4 h-4 text-[#147A52] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#20242A] block">Ledger Balance Adjustments</span>
                  <span className="text-[11px] text-gray-600">Administrative credit/debit overrides on client accounts.</span>
                </div>
              </div>

              <div className="p-2.5 rounded-md bg-[#147A52]/10/60 border border-[#147A52]/20 flex items-start gap-2.5">
                <FileCheck className="w-4 h-4 text-[#147A52] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#20242A] block">KYC Verification Clearance</span>
                  <span className="text-[11px] text-gray-600">Supervisory sign-off on sovereign onboarding &amp; identity documents.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Security Logs */}
          <div className="bg-white rounded-lg border border-[#D8DEE8] p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Terminal className="w-4 h-4 text-[#147A52]" />
              <h3 className="text-sm font-bold text-[#20242A]">
                Authenticator Audit Log
              </h3>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto text-[11px] font-mono pr-1">
              {authAuditLogs.length === 0 ? (
                <div className="text-gray-400 py-2">No recent Authenticator events logged.</div>
              ) : (
                authAuditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="p-2 rounded bg-gray-50 border border-gray-200 text-gray-700">
                    <div className="flex justify-between items-center text-[10px] text-gray-500 mb-0.5">
                      <span className="text-[#147A52] font-bold">{log.event}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <div className="truncate">{log.details}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
