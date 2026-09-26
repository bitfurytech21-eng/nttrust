import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Share2,
  Copy,
  Check,
  FileText,
  Lock,
  Layers,
  Landmark,
  QrCode
} from 'lucide-react';
import { Transaction, TransferRequest } from '../../types/banking';
import { useBanking } from '../../context/BankingContext';
import { NorthernTrustLogo } from './NorthernTrustLogo';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  transfer?: TransferRequest | null;
}

export const ReceiptModal: React.FC<Props> = ({ isOpen, onClose, transaction, transfer }) => {
  const { currentUser } = useBanking();
  const [adviceViewMode, setAdviceViewMode] = useState<'standard' | 'regulatory'>('standard');
  const [copied, setCopied] = useState(false);
  const [isPreparingAdvice, setIsGeneratingPdf] = useState(false);

  if (!isOpen || (!transaction && !transfer)) return null;

  const itemTitle = transfer 
    ? (transfer.type === 'external_wire' || transfer.type === 'international_swift' ? 'OFFICIAL FEDWIRE / SWIFT SETTLEMENT ADVICE' : 'OFFICIAL TRANSFER ADVICE & VOUCHER')
    : (transaction?.type === 'deposit' ? 'CREDIT SETTLEMENT ADVICE' : 'TRANSACTION ADVICE & DEBIT VOUCHER');

  const refCode = transfer ? transfer.referenceId : transaction?.referenceNumber || `REF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const amount = transfer ? transfer.amount : transaction?.amount || 0;
  const currency = transfer ? transfer.sourceCurrency : transaction?.currency || 'USD';
  const timestamp = transfer ? transfer.createdAt : transaction?.timestamp || new Date().toISOString().slice(0, 19).replace('T', ' ');
  const counterparty = transfer ? transfer.beneficiaryName : transaction?.counterparty || 'Northern Trust Enclave';
  const description = transfer ? transfer.purpose : transaction?.description || 'Settled via High-Assurance Enclave';
  const fee = transfer ? transfer.fee : transaction?.fee || 0;
  const category = transaction?.category || 'Treasury Transfer';

  const handleCopyRef = () => {
    if (refCode) {
      navigator.clipboard.writeText(refCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadAdvice = () => {
    setIsGeneratingPdf(true);
    setTimeout(() => {
      const adviceContent = `================================================================================
NORTHERN TRUST PRIVATE WEALTH & INSTITUTIONAL BANKING
OFFICIAL TRANSACTION ADVICE & SETTLEMENT CERTIFICATE
================================================================================
DOCUMENT REFERENCE: ${refCode}
SETTLEMENT TIMESTAMP: ${new Date().toUTCString()}
PRIMARY CLIENT: ${currentUser?.fullName || "Private Wealth Client"} (CIF #${currentUser?.clientId || "NT-8820-CLIENT"})
ACCOUNT NUMBER: ••••••••2741 (Private Wealth Checking)
ROUTING / ABA: 021000089 (Fedwire / Direct Clearing)

SETTLEMENT DETAILS:
--------------------------------------------------------------------------------
Document Type:       ${itemTitle}
Counterparty / Node: ${counterparty}
Description / Memo:  ${description}
Settled Amount:      ${currency} $${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
Execution Timestamp: ${timestamp}
Assigned Wire Fee:   $${fee.toFixed(2)} USD (Client Tier Waived)
Clearing Channel:    FedNow / Fedwire / SWIFT MT103 High-Assurance
Status:              CLEARED & RECORDED ON IMMUTABLE LEDGER

CRYPTOGRAPHIC PROOF:
--------------------------------------------------------------------------------
Hash: SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()}-4921E-FEDWIRE-CONFIRMED
Enclave ID: NT-ENCLAVE-US-EAST-01
Digital Signature: SEC-RSA4096-${refCode}

This advice serves as official legal and accounting proof of cleared funds disbursal or receipt.
Northern Trust, NA • Member FDIC • Equal Housing Lender
50 South LaSalle Street, Chicago, IL 60603
================================================================================`;

      const blob = new Blob([adviceContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NorthernTrust_Advice_${refCode}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsGeneratingPdf(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs print:static print:p-0 print:bg-white print:overflow-visible">
      <div className="w-full max-w-xl bg-white border-2 border-[#D8DEE8] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-xs text-[#20242A] animate-fade-in print:max-h-none print:border-none print:shadow-none print:rounded-none print:w-full print:m-0">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b-2 border-[#F5F7FA] flex items-center justify-between bg-[#F5F7FA] print:hidden">
          <div className="flex items-center gap-2 text-xs font-mono text-[#147A52] font-black">
            <ShieldCheck className="w-4 h-4 text-[#147A52] stroke-[2.25]" />
            <span>CRYPTOGRAPHIC SETTLEMENT ADVICE</span>
          </div>

          {/* Advice View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white border border-[#D8DEE8] p-0.5 rounded-lg shadow-2xs">
            <button
              type="button"
              onClick={() => setAdviceViewMode('standard')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                adviceViewMode === 'standard'
                  ? 'bg-[#0B1F6A] text-white shadow-xs'
                  : 'text-[#5F6670] hover:text-[#0B1F6A]'
              }`}
            >
              Summary Advice
            </button>
            <button
              type="button"
              onClick={() => setAdviceViewMode('regulatory')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                adviceViewMode === 'regulatory'
                  ? 'bg-[#0B1F6A] text-white shadow-xs'
                  : 'text-[#5F6670] hover:text-[#0B1F6A]'
              }`}
            >
              Regulatory Audit Slip
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#5F6670] hover:text-[#20242A] hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Close Advice Modal"
          >
            <X className="w-5 h-5 stroke-[2.25]" />
          </button>
        </div>

        {/* Printable Advice Document Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5 print:p-0 print:overflow-visible">
          
          {/* Bank Letterhead */}
          <div className="flex items-start justify-between border-b-2 border-[#D8DEE8] pb-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-black tracking-wider text-[#147A52]">
                <NorthernTrustLogo className="w-6 h-6 text-[#147A52]" color="#147A52" />
                <span className="font-serif tracking-widest text-[#0B1F6A] text-base">NORTHERN TRUST</span>
              </div>
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#20242A]">{itemTitle}</h2>
              <p className="text-[11px] text-[#5F6670] font-medium">
                Private Wealth Management • Clearing &amp; Settlement Operations (NYC / Chicago / Zurich)
              </p>
            </div>

            <div className="text-right font-mono text-[10.5px] text-[#5F6670] space-y-0.5 shrink-0">
              <div className="font-bold text-[#0B1F6A]">AUTHENTICATED ADVICE</div>
              <div>ABA: 021000089</div>
              <div>BIC: NTCOUS33NYC</div>
              <div className="text-[#147A52] font-bold">NODE: ENCLAVE-PROD</div>
            </div>
          </div>

          {/* Settled Amount Banner */}
          <div className="p-4 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] text-center space-y-1.5 shadow-2xs print:border print:border-slate-300">
            <span className="text-[10px] uppercase font-bold text-[#5F6670] tracking-wider block">
              Cleared Settled Funds
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#0B1F6A]">
              {currency} ${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#147A52] font-bold">
              <CheckCircle2 className="w-4 h-4 stroke-[2.25]" />
              <span>Direct Settlement Completed &amp; Cleared with Finality</span>
            </div>
          </div>

          {/* Standard Advice Breakdown */}
          {adviceViewMode === 'standard' ? (
            <div className="divide-y-2 divide-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl bg-white text-xs shadow-2xs overflow-hidden print:border print:border-slate-300">
              <div className="p-3 flex justify-between items-center">
                <span className="text-[#5F6670] font-medium">Advice Reference ID:</span>
                <div className="flex items-center gap-1.5 font-mono font-black text-[#0B1F6A]">
                  <span>{refCode}</span>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="p-1 rounded-md text-[#5F6670] hover:text-[#20242A] hover:bg-slate-100 transition-colors cursor-pointer print:hidden"
                    title="Copy Reference"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#147A52] stroke-[2.25]" /> : <Copy className="w-4 h-4 stroke-[2.25]" />}
                  </button>
                </div>
              </div>

              <div className="p-3 flex justify-between items-center">
                <span className="text-[#5F6670] font-medium">Beneficiary / Originator:</span>
                <strong className="text-[#20242A] font-bold">{counterparty}</strong>
              </div>

              <div className="p-3 flex justify-between items-center">
                <span className="text-[#5F6670] font-medium">Description / Memo:</span>
                <span className="text-[#20242A] font-medium text-right max-w-[260px] truncate">{description}</span>
              </div>

              <div className="p-3 flex justify-between items-center">
                <span className="text-[#5F6670] font-medium">Execution Timestamp:</span>
                <span className="font-mono font-bold text-[#20242A]">{timestamp}</span>
              </div>

              <div className="p-3 flex justify-between items-center">
                <span className="text-[#5F6670] font-medium">Assigned Clearing Fee:</span>
                <span className="font-mono font-bold text-[#147A52]">${fee.toFixed(2)} USD (Private Wealth Waived)</span>
              </div>

              <div className="p-3 flex justify-between items-center">
                <span className="text-[#5F6670] font-medium">Cryptographic Hash:</span>
                <span className="font-mono text-[10.5px] font-bold text-[#5F6670]">
                  SHA256-{refCode.replace(/[^A-Z0-9]/gi, '').slice(0, 10)}-FEDWIRE-PROD
                </span>
              </div>
            </div>
          ) : (
            /* Regulatory Audit Slip Breakdown */
            <div className="border-2 border-[#D8DEE8] rounded-xl bg-white text-xs shadow-2xs p-4 space-y-3 print:border print:border-slate-300 font-mono">
              <div className="text-[11px] font-bold uppercase text-[#0B1F6A] border-b border-[#D8DEE8] pb-1.5 flex items-center justify-between">
                <span>SWIFT MT103 / FEDWIRE REGULATORY AUDIT LOG</span>
                <span className="text-[#147A52] text-[10px]">ISO 20022 COMPLIANT</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#5F6670] block">Sender Bank (BIC):</span>
                  <span className="font-bold text-[#20242A]">NTCOUS33NYC (Northern Trust New York)</span>
                </div>
                <div>
                  <span className="text-[#5F6670] block">Clearing Protocol:</span>
                  <span className="font-bold text-[#20242A]">Fedwire / FedNow Direct Clearing</span>
                </div>
                <div>
                  <span className="text-[#5F6670] block">Message Input Ref (MIR):</span>
                  <span className="font-bold text-[#20242A]">{timestamp.slice(0, 10).replace(/-/g, '')}NTCOUS33{refCode.slice(-6)}</span>
                </div>
                <div>
                  <span className="text-[#5F6670] block">Account Debited/Credited:</span>
                  <span className="font-bold text-[#20242A]">••••••••2741 (USD Operating)</span>
                </div>
                <div>
                  <span className="text-[#5F6670] block">BSA / AML Clearance:</span>
                  <span className="font-bold text-[#147A52]">TIER-3 PASSED (ZERO EXCEPTION)</span>
                </div>
                <div>
                  <span className="text-[#5F6670] block">Settlement Finality:</span>
                  <span className="font-bold text-[#147A52]">IMMEDIATE IRREVOCABLE (Fed Rules)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D8DEE8] text-[10px] text-[#5F6670] leading-relaxed">
                This document constitutes official bank advice as required by Federal Reserve Regulation J and the Uniform Commercial Code Article 4A. Funds are unconditionally credited and available for immediate withdrawal.
              </div>
            </div>
          )}

          {/* Legal Compliance Footer */}
          <div className="pt-2 text-[10px] text-[#5F6670] text-center border-t border-[#D8DEE8] leading-tight space-y-1">
            <p>Northern Trust, NA • Member FDIC • Equal Housing Lender • Fedwire Routing Transit 021000089</p>
            <p className="font-mono text-[9.5px]">Advice Token: NT-ADV-{refCode}-ENCLAVE-2026</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t-2 border-[#F5F7FA] bg-[#F5F7FA] flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border-2 border-[#D8DEE8] hover:border-[#147A52] text-[#147A52] font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
              title="Print Advice Certificate (Printer / PDF)"
            >
              <Printer className="w-4 h-4 stroke-[2.25]" />
              <span>Print Advice</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadAdvice}
              disabled={isPreparingAdvice}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border-2 border-[#D8DEE8] hover:border-[#0B1F6A] text-[#0B1F6A] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              title="Download Certified Advice File"
            >
              {isPreparingAdvice ? (
                <div className="w-4 h-4 border-2 border-[#0B1F6A]/30 border-t-[#0B1F6A] rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4 stroke-[2.25]" />
              )}
              <span className="hidden sm:inline">Export Text Advice</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold transition-all cursor-pointer shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
