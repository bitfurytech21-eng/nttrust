import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import { AuthenticationLayout } from './AuthenticationLayout';
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  AlertTriangle,
  Fingerprint,
  Cpu,
  Smartphone,
  CheckCircle2,
  FileText,
  HelpCircle,
  Eye,
  Send
} from 'lucide-react';

export const SecurityCenterView: React.FC = () => {
  const { navigateTo, currentUser } = useBanking();
  const [activeTab, setActiveTab] = useState<'overview' | 'protection' | 'fraud' | 'privacy' | 'report'>('overview');
  const [reportText, setReportText] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const handleReportFraud = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
  };

  return (
    <AuthenticationLayout activeHeaderTab="security">
      <div className="w-full max-w-5xl">
        {/* Security Center Hero Card */}
        <div className="mb-6 p-6 sm:p-8 rounded-md bg-white border border-[#D8DEE8] shadow-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#147A52]/10 border border-[#147A52]/20 text-[#147A52] text-xs font-semibold mb-3">
            <ShieldCheck className="w-4 h-4 text-[#147A52]" /> Sovereign Trust &amp; Cryptographic Integrity
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#20242A] tracking-tight">
            Security Center &amp; Asset Protection
          </h1>
          <p className="text-[#5F6670] text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
            Northern Trust employs bank-grade multi-layer encryption, hardware token authentication, real-time AML surveillance, and zero-knowledge session management to safeguard your capital.
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 text-xs font-semibold border-b border-[#D8DEE8]">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-[#147A52] text-white shadow-xs'
                  : 'text-[#5F6670] hover:text-[#20242A] hover:bg-[#F5F7FA]'
              }`}
            >
              Security Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('protection')}
              className={`px-3.5 py-2 rounded transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'protection'
                  ? 'bg-[#147A52] text-white shadow-xs'
                  : 'text-[#5F6670] hover:text-[#20242A] hover:bg-[#F5F7FA]'
              }`}
            >
              Account Protection
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('fraud')}
              className={`px-3.5 py-2 rounded transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'fraud'
                  ? 'bg-[#147A52] text-white shadow-xs'
                  : 'text-[#5F6670] hover:text-[#20242A] hover:bg-[#F5F7FA]'
              }`}
            >
              Fraud Awareness
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`px-3.5 py-2 rounded transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'privacy'
                  ? 'bg-[#147A52] text-white shadow-xs'
                  : 'text-[#5F6670] hover:text-[#20242A] hover:bg-[#F5F7FA]'
              }`}
            >
              Privacy Standards
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('report')}
              className={`px-3.5 py-2 rounded transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'report'
                  ? 'bg-rose-50 text-[#B42318] border border-rose-200'
                  : 'text-[#5F6670] hover:text-[#B42318] hover:bg-rose-50'
              }`}
            >
              Report Suspicious Activity
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-6 rounded-md bg-white border border-[#D8DEE8] space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded bg-[#147A52]/10 border border-[#147A52]/20 flex items-center justify-center text-[#147A52]">
                    <Fingerprint className="w-5 h-5 text-[#147A52]" />
                  </div>
                  <h3 className="text-base font-bold text-[#20242A]">Multi-Factor Enclave</h3>
                  <p className="text-xs text-[#5F6670] leading-relaxed">
                    Hardware-backed FIDO2 WebAuthn &amp; TOTP Authenticator protocols enforce 100% two-step verification across every session.
                  </p>
                </div>

                <div className="p-6 rounded-md bg-white border border-[#D8DEE8] space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded bg-[#147A52]/10 border border-[#147A52]/20 flex items-center justify-center text-[#147A52]">
                    <Lock className="w-5 h-5 text-[#147A52]" />
                  </div>
                  <h3 className="text-base font-bold text-[#20242A]">256-Bit Data Encryption</h3>
                  <p className="text-xs text-[#5F6670] leading-relaxed">
                    Data in transit is protected with TLS 1.3 encryption. Financial ledgers and identity records are vaulted with AES-256 GCM.
                  </p>
                </div>

                <div className="p-6 rounded-md bg-white border border-[#D8DEE8] space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded bg-[#147A52]/10 border border-[#147A52]/20 flex items-center justify-center text-[#147A52]">
                    <Cpu className="w-5 h-5 text-[#147A52]" />
                  </div>
                  <h3 className="text-base font-bold text-[#20242A]">Adaptive AML Surveillance</h3>
                  <p className="text-xs text-[#5F6670] leading-relaxed">
                    Automated heuristics analyze behavioral velocity, high-value wire transfers, and unusual geo-locations in real time.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-md bg-white border border-[#D8DEE8] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#20242A]">Need to review active hardware tokens or devices?</h4>
                  <p className="text-xs text-[#5F6670] mt-0.5">Manage your trusted laptops, smartphones, and active session tokens.</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('/trusted-devices')}
                  className="px-4 py-2.5 rounded bg-[#101F7A] hover:bg-[#081552] text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
                >
                  Open Trusted Device Vault &rarr;
                </button>
              </div>
            </div>
          )}

          {activeTab === 'protection' && (
            <div className="p-6 sm:p-8 rounded-md bg-white border border-[#D8DEE8] shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-[#20242A]">Guaranteed Account Protection Measures</h2>
              <ul className="space-y-4 text-xs text-[#20242A]">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#147A52] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#20242A]">Zero-Liability Card Fraud Policy:</strong> You are not liable for unauthorized debit or credit card charges reported within statutory window.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#147A52] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#20242A]">Continuous Session Auto-Lock:</strong> Active client portals automatically lock after 5 minutes of inactivity to prevent physical terminal hijacking.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#147A52] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#20242A]">High-Value Wire Dual-Auth:</strong> Outgoing transfers over $40,000 USD or international SWIFT routes require compliance desk verification.
                  </div>
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'fraud' && (
            <div className="p-6 sm:p-8 rounded-md bg-white border border-[#D8DEE8] shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-[#20242A]">Recognizing Phishing &amp; Social Engineering</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                  <span className="text-[#B42318] font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> What Northern Trust will NEVER do:
                  </span>
                  <ul className="list-disc list-inside space-y-1.5 text-[#20242A]">
                    <li>Never ask for your password or master PIN over phone or SMS.</li>
                    <li>Never demand immediate wire transfers to an unfamiliar "holding account".</li>
                    <li>Never request remote control software (TeamViewer/AnyDesk) on personal machines.</li>
                  </ul>
                </div>
                <div className="p-4 rounded bg-[#147A52]/10 border border-[#147A52]/20 text-emerald-900 space-y-2">
                  <span className="text-[#147A52] font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Best Security Practices:
                  </span>
                  <ul className="list-disc list-inside space-y-1.5 text-[#20242A]">
                    <li>Always confirm the browser URL displays <code className="text-[#147A52] font-mono font-semibold">northerntrust.com</code>.</li>
                    <li>Keep your TOTP authenticator phone backed up with offline seed words.</li>
                    <li>Regularly inspect the Login Audit Log in your profile settings.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="p-6 sm:p-8 rounded-md bg-white border border-[#D8DEE8] shadow-xs space-y-4 text-xs text-[#5F6670]">
              <h2 className="text-lg font-bold text-[#20242A]">Swiss &amp; Sovereign Banking Privacy Standards</h2>
              <p className="leading-relaxed">
                Northern Trust operates under strict Swiss Federal Banking Commission (FINMA) standards, US Federal Reserve supervisory guidelines, and GDPR / CCPA privacy frameworks.
              </p>
              <p className="leading-relaxed">
                We do not sell, monetize, or broker client financial data, transactional history, or identity documents to third-party advertising networks.
              </p>
            </div>
          )}

          {activeTab === 'report' && (
            <div className="p-6 sm:p-8 rounded-md bg-white border border-[#D8DEE8] shadow-xs max-w-2xl mx-auto">
              {reportSubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-[#147A52] mx-auto" />
                  <h3 className="text-lg font-bold text-[#20242A]">Suspicious Activity Report Dispatched</h3>
                  <p className="text-xs text-[#5F6670]">
                    Our 24/7 Global Fraud &amp; Incident Response desk has received your report (#INC-88910). An officer will contact your verified phone within 15 minutes.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReportFraud} className="space-y-4">
                  <div className="flex items-center gap-2 text-[#B42318] font-bold text-base">
                    <AlertTriangle className="w-5 h-5" /> Report Suspicious Activity
                  </div>
                  <p className="text-xs text-[#5F6670] leading-relaxed">
                    If you noticed an unrecognized transaction, unauthorized login, or received a phishing attempt, report it immediately to our fraud desk.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-[#20242A] mb-1.5">
                      Incident Description &amp; Details
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder="Describe transaction date, reference number, or suspect communication..."
                      className="w-full p-3 rounded bg-white border border-[#D8DEE8] text-[#20242A] text-xs focus:border-[#147A52] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded bg-[#B42318] hover:bg-[#912015] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Send className="w-4 h-4" /> Submit Emergency Report
                  </button>
                </form>
              )}
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
          <span className="text-[#5F6670] font-mono text-[11px]">Northern Trust Security Desk</span>
        </div>
      </div>
    </AuthenticationLayout>
  );
};
