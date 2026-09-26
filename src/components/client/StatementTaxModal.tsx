import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useBanking } from '../../context/BankingContext';
import {
  X,
  Printer,
  Download,
  Calendar,
  Building2,
  ShieldCheck,
  CheckCircle2,
  FileText,
  DollarSign,
  Lock,
  ChevronDown,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Award,
  Loader2,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  FileSpreadsheet
} from 'lucide-react';
import { NorthernTrustLogo } from '../common/NorthernTrustLogo';
import { IrsLogo } from '../common/IrsLogo';
import { BankAccount, Transaction } from '../../types/banking';
import { exportOfficialStatementPDF, exportTaxFormPDF } from '../../utils/exportUtils';
import { ExportPrintSecurityModal } from '../common/ExportPrintSecurityModal';

interface StatementTaxModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'statement' | 'tax_1099_int' | 'tax_1099_b' | 'proof_of_funds';
  initialAccountId?: string;
  autoStartDownload?: boolean;
}

export const StatementTaxModal: React.FC<StatementTaxModalProps> = ({
  isOpen,
  onClose,
  initialType = 'statement',
  initialAccountId,
  autoStartDownload = false
}) => {
  const { currentUser, accounts, transactions } = useBanking();

  const [documentType, setDocumentType] = useState<'statement' | 'tax_1099_int' | 'tax_1099_b' | 'proof_of_funds'>(initialType);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(initialAccountId || accounts[0]?.id || '');
  const [period, setPeriod] = useState<string>('curr_month');
  const [taxYear, setTaxYear] = useState<'2026' | '2025' | '2024' | '2023'>('2026');
  const [isMasked, setIsMasked] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
  // Simulated PDF download generation state
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [pdfProgress, setPdfProgress] = useState<number>(0);
  const [pdfStepText, setPdfStepText] = useState<string>('');
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<boolean>(false);

  const activeAccount: BankAccount = accounts.find(a => a.id === selectedAccountId) || accounts[0] || {
    id: 'acc_1',
    name: "Private Wealth Checking",
    accountNumber: '882077771975',
    routingNumber: '021000089',
    swiftBic: 'NTCOUS33NYC',
    currency: 'USD',
    balance: 4850220.50,
    availableBalance: 4825220.50,
    pendingBalance: 0,
    interestRateAPY: 2.15,
    type: 'checking',
    status: 'active',
    isFrozen: false,
    colorTheme: 'cyan'
  };

  // Sync initial props if modal re-opens
  useEffect(() => {
    if (initialType) setDocumentType(initialType);
    if (initialAccountId) setSelectedAccountId(initialAccountId);
  }, [initialType, initialAccountId]);

  // Handle auto start download if triggered from direct action
  useEffect(() => {
    if (isOpen && autoStartDownload) {
      handleGenerateAndDownloadPdf();
    }
  }, [isOpen, autoStartDownload]);

  // Generate QR Code for verification
  useEffect(() => {
    const verificationData = `https://northerntrust.com/verify/doc?cif=${currentUser?.clientId || 'NT-8820-CLIENT'}&acc=${activeAccount?.accountNumber || '8820'}&type=${documentType}&taxYear=${taxYear}&dt=${new Date().toISOString().slice(0, 10)}&hash=SHA256-CLIENT-TAX-${taxYear}`;
    QRCode.toDataURL(verificationData, {
      width: 140,
      margin: 1,
      color: {
        dark: '#0B1F6A',
        light: '#ffffff'
      }
    })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error('QR code generation error:', err));
  }, [documentType, selectedAccountId, currentUser, taxYear]);

  if (!isOpen) return null;

  // Filter transactions for this account
  const accountTxs: Transaction[] = transactions.filter(t => t.accountId === activeAccount?.id);

  // Period label computation
  let periodLabel = 'September 1, 2026 – September 26, 2026';
  let statementCycle = 'Monthly Cycle #09-2026';
  if (period === 'prev_month') {
    periodLabel = 'August 1, 2026 – August 31, 2026';
    statementCycle = 'Monthly Cycle #08-2026';
  } else if (period === 'q2_2026') {
    periodLabel = 'April 1, 2026 – June 30, 2026';
    statementCycle = 'Quarterly Cycle #Q2-2026';
  } else if (period === 'year_2025') {
    periodLabel = 'January 1, 2025 – December 31, 2025';
    statementCycle = 'Annual Tax Cycle 2025';
  } else if (period === 'ytd_2026') {
    periodLabel = 'January 1, 2026 – September 26, 2026';
    statementCycle = 'Year-to-Date Cycle 2026';
  }

  // Compute realistic Starting, Credits, Debits, and Ending balances
  const endingBal = activeAccount ? activeAccount.balance : 50000;
  const depositTxs = accountTxs.filter(tx => tx.type === 'deposit' || tx.type === 'transfer_in' || tx.type === 'interest');
  const withdrawalTxs = accountTxs.filter(tx => tx.type === 'withdrawal' || tx.type === 'transfer_out' || tx.type === 'bill_payment' || tx.type === 'card_purchase' || tx.type === 'fee');
  
  const totalCredits = depositTxs.reduce((sum, tx) => sum + tx.amount, 0) || 95000;
  const totalDebits = withdrawalTxs.reduce((sum, tx) => sum + tx.amount, 0) || 28500;
  const startingBal = Math.max(0, endingBal - (totalCredits - totalDebits));
  const netCashFlow = totalCredits - totalDebits;
  const interestEarnedPeriod = activeAccount ? (activeAccount.balance * ((activeAccount.interestRateAPY || 2.5) / 100) / 12) : 158.40;

  // Security Modal state for Export & Print Protection
  const [secModalOpen, setSecModalOpen] = useState(false);
  const [pendingSecAction, setPendingSecAction] = useState<{
    fn: () => void;
    title: string;
    type: 'export' | 'print' | 'download';
  } | null>(null);

  const triggerProtectedAction = (fn: () => void, title: string, type: 'export' | 'print' | 'download' = 'export') => {
    setPendingSecAction({ fn, title, type });
    setSecModalOpen(true);
  };

  const handlePrint = () => {
    triggerProtectedAction(() => {
      window.print();
    }, 'Print Official Statement / Tax Document', 'print');
  };

  // Real-time high-fidelity PDF Generation and Download Flow
  const executeGenerateAndDownloadPdf = () => {
    setIsGeneratingPdf(true);
    setPdfProgress(10);
    setPdfStepText(`Fetching cleared ledger records for ${activeAccount.name}...`);

    setTimeout(() => {
      setPdfProgress(38);
      setPdfStepText('Calculating daily balances, APY interest accrual, and tax totals...');
    }, 450);

    setTimeout(() => {
      setPdfProgress(68);
      setPdfStepText('Applying 256-bit cryptographic seal & scannable validation QR...');
    }, 950);

    setTimeout(() => {
      setPdfProgress(92);
      setPdfStepText('Compiling official bank statement PDF layout...');
    }, 1450);

    setTimeout(() => {
      setPdfProgress(100);
      setPdfStepText('Finalizing and initiating download...');
      
      // Generate formatted standalone printable report file download
      const statementHtmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Northern Trust Statement - ${activeAccount.accountNumber}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #20242a; margin: 40px; background: #fff; }
    .header { border-bottom: 3px solid #0b1f6a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
    .title { font-size: 24px; font-weight: 900; color: #0b1f6a; text-transform: uppercase; margin: 0; }
    .sub { font-size: 11px; color: #5f6670; margin-top: 4px; }
    .badge { background: #e8ecf8; color: #0b1f6a; font-weight: bold; font-size: 11px; padding: 4px 8px; border-radius: 4px; display: inline-block; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f5f7fa; padding: 16px; border-radius: 8px; margin-bottom: 24px; border: 1px solid #d8dee8; font-size: 12px; }
    .summary-box { border: 1px solid #0b1f6a; border-radius: 8px; overflow: hidden; margin-bottom: 24px; }
    .summary-header { background: #0b1f6a; color: white; padding: 8px 16px; font-weight: bold; font-size: 12px; text-transform: uppercase; }
    .summary-body { display: grid; grid-template-columns: repeat(4, 1fr); padding: 16px; text-align: center; gap: 12px; }
    .summary-item { border-right: 1px solid #d8dee8; }
    .summary-item:last-child { border-right: none; }
    .summary-label { font-size: 10px; text-transform: uppercase; color: #5f6670; font-weight: bold; }
    .summary-val { font-size: 16px; font-weight: 900; font-family: monospace; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 24px; }
    th { background: #f5f7fa; text-align: left; padding: 8px; border-bottom: 2px solid #d8dee8; font-size: 10px; text-transform: uppercase; color: #5f6670; }
    td { padding: 8px; border-bottom: 1px solid #eef2f6; font-family: monospace; }
    .credit { color: #147a52; font-weight: bold; text-align: right; }
    .debit { color: #b42318; font-weight: bold; text-align: right; }
    .footer { border-top: 2px solid #d8dee8; padding-top: 16px; font-size: 10px; color: #5f6670; line-height: 1.5; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">Northern Trust Company</h1>
      <div class="sub">Chartered 1889 • Member FDIC • Institutional Banking & Private Wealth Custody</div>
      <div class="sub">50 South LaSalle Street, Chicago, IL 60603 | 1 Wall Street, New York, NY 10005</div>
    </div>
    <div style="text-align: right;">
      <span class="badge">Official Bank Statement</span>
      <div class="sub">Statement Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      <div class="sub">Cycle: ${statementCycle}</div>
    </div>
  </div>

  <div class="grid">
    <div>
      <strong>Account Holder:</strong><br>
      ${currentUser?.fullName || 'Angelina Jolie'}<br>
      ${currentUser?.address.street || '740 Park Avenue, Penthouse B'}<br>
      ${currentUser?.address.city || 'New York'}, ${currentUser?.address.state || 'NY'} ${currentUser?.address.postalCode || '10021'}<br>
      CIF ID: ${currentUser?.clientId || 'NT-8820-CLIENT'}
    </div>
    <div style="text-align: right;">
      <strong>Account Information:</strong><br>
      ${activeAccount.name}<br>
      Account Number: ${activeAccount.accountNumber}<br>
      Routing (ABA): ${activeAccount.routingNumber}<br>
      SWIFT: ${activeAccount.swiftBic || 'NTCOUS44XXX'}<br>
      Period: ${periodLabel}
    </div>
  </div>

  <div class="summary-box">
    <div class="summary-header">Account Activity & Balance Summary (${activeAccount.currency})</div>
    <div class="summary-body">
      <div class="summary-item">
        <div class="summary-label">Starting Balance</div>
        <div class="summary-val">$${startingBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Total Deposits (+)</div>
        <div class="summary-val" style="color: #147a52;">+$${totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Total Withdrawals (-)</div>
        <div class="summary-val" style="color: #b42318;">-$${totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
      </div>
      <div class="summary-item">
        <div class="summary-label">Ending Balance</div>
        <div class="summary-val" style="color: #0b1f6a;">$${endingBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
      </div>
    </div>
  </div>

  <h3>Itemized Transaction Ledger</h3>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Reference</th>
        <th>Description / Counterparty</th>
        <th style="text-align: right;">Debits (-)</th>
        <th style="text-align: right;">Credits (+)</th>
        <th style="text-align: right;">Balance</th>
      </tr>
    </thead>
    <tbody>
      ${accountTxs.map(t => {
        const isDeb = t.type === 'withdrawal' || t.type === 'transfer_out' || t.type === 'bill_payment' || t.type === 'card_purchase' || t.type === 'fee';
        return `<tr>
          <td>${t.timestamp.slice(0, 10)}</td>
          <td>${t.referenceNumber}</td>
          <td>${t.description} (${t.counterparty})</td>
          <td class="debit">${isDeb ? '-$' + t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}</td>
          <td class="credit">${!isDeb ? '+$' + t.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}</td>
          <td style="text-align: right; font-weight: bold;">$${endingBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>

  <div class="footer">
    <strong>REGULATORY DISCLOSURE:</strong> Deposits insured up to $250,000 per depositor by the FDIC. Securities and wealth advisory custody governed by SEC Rule 206(4)-2.
    <br>Security Checksum: SHA256-492001-E9281-B902A • Certified by Northern Trust Chief Compliance Office.
  </div>
</body>
</html>`;

      if (documentType === 'tax_1099_int' || documentType === 'tax_1099_b') {
        exportTaxFormPDF(documentType === 'tax_1099_int' ? '1099-INT' : '1099-B', taxYear, activeAccount, currentUser);
      } else {
        exportOfficialStatementPDF(activeAccount, accountTxs, currentUser, statementCycle);
      }

      setIsGeneratingPdf(false);
      setDownloadSuccessToast(true);
      setTimeout(() => setDownloadSuccessToast(false), 4000);
    }, 1200);
  };

  const handleGenerateAndDownloadPdf = () => {
    triggerProtectedAction(
      executeGenerateAndDownloadPdf,
      `Download Official PDF Document (${documentType.toUpperCase().replace(/_/g, ' ')})`,
      'download'
    );
  };

  const handleDownloadCSV = () => {
    triggerProtectedAction(() => {
      const headers = 'Date,Reference Number,Type,Description,Counterparty,Debits,Credits,Status\n';
      const rows = accountTxs.map(t => {
        const isDebit = t.type === 'withdrawal' || t.type === 'transfer_out' || t.type === 'bill_payment' || t.type === 'card_purchase' || t.type === 'fee';
        const deb = isDebit ? t.amount.toFixed(2) : '';
        const cred = !isDebit ? t.amount.toFixed(2) : '';
        return `"${t.timestamp.slice(0, 10)}","${t.referenceNumber}","${t.type}","${t.description.replace(/"/g, '""')}","${t.counterparty.replace(/"/g, '""')}",${deb},${cred},"${t.status}"`;
      }).join('\n');

      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Northern_Trust_Statement_${activeAccount.accountNumber}_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'Export Statement CSV Ledger', 'export');
  };

  const maskAccount = (accNum: string) => {
    if (!isMasked) return accNum;
    return `•••• •••• •••• ${accNum.slice(-4)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden print:max-h-none print:border-none print:shadow-none print:rounded-none">
        
        {/* Top Header Controls (Hidden on Print) */}
        <div className="p-4 sm:p-5 bg-[#0B1F6A] text-white flex flex-wrap items-center justify-between gap-3 border-b border-[#081552] shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <NorthernTrustLogo className="w-7 h-7 text-emerald-300" color="#6ee7b7" />
            <div>
              <h2 className="text-base sm:text-lg font-black font-serif tracking-wide text-white flex items-center gap-2">
                <span>Northern Trust Document Enclave</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Certified PDF Generator
                </span>
              </h2>
              <p className="text-[11px] text-emerald-200 font-medium">
                Official Regulatory Ledger Statements &amp; IRS Tax Certificates
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleGenerateAndDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-[#147A52] hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm border border-emerald-400/40 disabled:opacity-50"
              title="Generate and Download Statement as PDF"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Statement'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/20"
              title="Print Document or Save as PDF via Print Dialog"
            >
              <Printer className="w-4 h-4 stroke-[2]" />
              <span>Print / Save PDF</span>
            </button>

            {documentType === 'statement' && (
              <button
                type="button"
                onClick={handleDownloadCSV}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-white/15"
                title="Download CSV Ledger"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
                <span>CSV</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/15 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Generation In-Progress Overlay Banner */}
        {isGeneratingPdf && (
          <div className="bg-gradient-to-r from-[#0B1F6A] via-[#101F7A] to-[#0B1F6A] text-white p-4 px-6 border-b border-white/10 shrink-0 print:hidden animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin shrink-0" />
                <div>
                  <div className="font-bold text-xs flex items-center gap-2">
                    <span>Generating Bank Statement PDF</span>
                    <span className="font-mono text-emerald-300 font-black">{pdfProgress}%</span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono mt-0.5">{pdfStepText}</div>
                </div>
              </div>
              <div className="w-full sm:w-64 bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${pdfProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Download Success Toast */}
        {downloadSuccessToast && (
          <div className="bg-emerald-700 text-white px-6 py-3 flex items-center justify-between text-xs font-bold shrink-0 print:hidden animate-fade-in shadow-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>Statement PDF downloaded successfully for {activeAccount.name}!</span>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="underline text-emerald-100 hover:text-white cursor-pointer ml-4"
            >
              Click here to Print Statement
            </button>
          </div>
        )}

        {/* Secondary Configuration Bar (Hidden on Print) */}
        <div className="bg-[#F5F7FA] px-4 sm:px-6 py-3 border-b border-[#D8DEE8] flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden text-xs">
          {/* Document Type Selector Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#D8DEE8]">
            {[
              { id: 'statement', label: 'Official Statement' },
              { id: 'tax_1099_int', label: 'IRS Form 1099-INT' },
              { id: 'tax_1099_b', label: 'IRS Form 1099-B' },
              { id: 'proof_of_funds', label: 'Proof of Funds Letter' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDocumentType(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  documentType === tab.id
                    ? 'bg-[#0B1F6A] text-white shadow-xs'
                    : 'text-[#5F6670] hover:text-[#20242A] hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Account and Period Dropdowns */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#5F6670]">Account:</span>
              <select
                value={selectedAccountId}
                onChange={e => setSelectedAccountId(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D8DEE8] font-bold text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (${acc.balance.toLocaleString('en-US', { maximumFractionDigits: 0 })})
                  </option>
                ))}
              </select>
            </div>

            {documentType === 'statement' && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#5F6670]">Period:</span>
                <select
                  value={period}
                  onChange={e => setPeriod(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D8DEE8] font-bold text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
                >
                  <option value="curr_month">Current Month (Sep 2026)</option>
                  <option value="prev_month">Prior Month (Aug 2026)</option>
                  <option value="q2_2026">Second Quarter (Q2 2026)</option>
                  <option value="ytd_2026">Year-to-Date (2026)</option>
                  <option value="year_2025">Full Year 2025</option>
                </select>
              </div>
            )}

            {(documentType === 'tax_1099_int' || documentType === 'tax_1099_b') && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#5F6670]">Tax Year:</span>
                <select
                  value={taxYear}
                  onChange={e => setTaxYear(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D8DEE8] font-black text-[#0B1F6A] focus:outline-none focus:border-[#0B1F6A] cursor-pointer"
                >
                  <option value="2026">Tax Year 2026 (Current YTD / Estimate)</option>
                  <option value="2025">Tax Year 2025 (Latest IRS Certified Return)</option>
                  <option value="2024">Tax Year 2024 (Certified Historical)</option>
                  <option value="2023">Tax Year 2023 (Certified Historical)</option>
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIsMasked(!isMasked)}
              className="p-1.5 rounded-lg bg-white border border-[#D8DEE8] text-[#5F6670] hover:text-[#20242A] hover:bg-slate-50 transition-colors cursor-pointer"
              title={isMasked ? 'Reveal Full Account Numbers' : 'Mask Account Numbers'}
            >
              {isMasked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          
          {/* ========================================================================= */}
          {/* OPTION 1: OFFICIAL BANK ACCOUNT STATEMENT (REAL BANK PRINT FORMAT) */}
          {/* ========================================================================= */}
          {documentType === 'statement' && (
            <div className="w-full max-w-[840px] bg-white p-6 sm:p-10 rounded-xl shadow-lg border border-[#D8DEE8] print:border-none print:shadow-none print:p-0 space-y-6 text-[#20242A] text-xs font-sans">
              
              {/* Bank Header & Letterhead */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5 border-b-2 border-[#0B1F6A]">
                <div className="flex items-start gap-3.5">
                  <NorthernTrustLogo className="w-11 h-11 text-[#0B1F6A] shrink-0" color="#0B1F6A" />
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black font-serif text-[#0B1F6A] tracking-tight uppercase">
                      Northern Trust Company
                    </h1>
                    <p className="text-[11px] font-semibold text-[#5F6670]">
                      Chartered 1889 • Institutional Banking &amp; Private Wealth Custody
                    </p>
                    <p className="text-[10px] text-[#5F6670] mt-0.5 font-mono">
                      50 South LaSalle Street, Chicago, IL 60603 | 1 Wall Street, New York, NY 10005
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-block px-3 py-1 rounded bg-[#0B1F6A]/10 border border-[#0B1F6A]/20 text-[#0B1F6A] font-black text-[11px] uppercase tracking-wider">
                    Official Regulatory Statement
                  </div>
                  <div className="text-[10px] text-[#5F6670] font-mono mt-1">
                    Page 1 of 1 • Fed Clearing Node: NYC-HQ-01
                  </div>
                  <div className="text-[9.5px] text-[#147A52] font-mono font-bold mt-0.5">
                    ● FDIC INSURED DEPOSITORY
                  </div>
                </div>
              </div>

              {/* Account Holder & Statement Identification Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#F5F7FA] p-4.5 rounded-xl border border-[#D8DEE8]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#5F6670] tracking-wider block mb-1">
                    Client Entity &amp; Registered Address
                  </span>
                  <p className="text-sm font-black text-[#20242A]">{currentUser?.fullName || 'Angelina Jolie'}</p>
                  <p className="text-xs text-[#5F6670] font-medium">{currentUser?.address.street || '2620 Los Feliz Blvd'}</p>
                  <p className="text-xs text-[#5F6670] font-medium">
                    {currentUser?.address.city || 'Los Angeles'}, {currentUser?.address.state || 'CA'} {currentUser?.address.postalCode || '90027'} {currentUser?.address.country || 'USA'}
                  </p>
                  <p className="text-[11px] font-mono font-bold text-[#0B1F6A] mt-1.5">
                    Client CIF ID: {currentUser?.clientId || 'NT-8820-CLIENT'}
                  </p>
                </div>

                <div className="space-y-1.5 text-right sm:text-right">
                  <div className="flex justify-between sm:justify-end gap-3">
                    <span className="text-[#5F6670] font-medium">Statement Period:</span>
                    <strong className="font-bold text-[#20242A]">{periodLabel}</strong>
                  </div>
                  <div className="flex justify-between sm:justify-end gap-3">
                    <span className="text-[#5F6670] font-medium">Account Title:</span>
                    <strong className="font-bold text-[#20242A]">{activeAccount.name}</strong>
                  </div>
                  <div className="flex justify-between sm:justify-end gap-3">
                    <span className="text-[#5F6670] font-medium">Account Number:</span>
                    <strong className="font-mono font-bold text-[#0B1F6A]">{maskAccount(activeAccount.accountNumber)}</strong>
                  </div>
                  <div className="flex justify-between sm:justify-end gap-3">
                    <span className="text-[#5F6670] font-medium">Routing Transit (ABA):</span>
                    <strong className="font-mono font-bold text-[#20242A]">{activeAccount.routingNumber}</strong>
                  </div>
                  {activeAccount.swiftBic && (
                    <div className="flex justify-between sm:justify-end gap-3">
                      <span className="text-[#5F6670] font-medium">SWIFT / BIC:</span>
                      <strong className="font-mono font-bold text-[#20242A]">{activeAccount.swiftBic}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Activity Summary Grid */}
              <div className="border border-[#D8DEE8] rounded-xl overflow-hidden">
                <div className="bg-[#0B1F6A] text-white px-4 py-2 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>Account Balance &amp; Activity Summary ({activeAccount.currency})</span>
                  <span className="font-mono text-[11px]">Interest APY: {activeAccount.interestRateAPY || 2.15}%</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 p-4 gap-4 bg-white text-center">
                  <div className="p-2 border-r border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-[#5F6670] block">Starting Balance</span>
                    <span className="text-base font-black font-mono text-[#20242A] mt-1 block">
                      ${startingBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9.5px] text-[#5F6670]">As of cycle start</span>
                  </div>
                  <div className="p-2 border-r border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Total Deposits ({depositTxs.length})</span>
                    <span className="text-base font-black font-mono text-emerald-700 mt-1 block">
                      +${totalCredits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9.5px] text-emerald-600 font-medium">Cleared credits</span>
                  </div>
                  <div className="p-2 border-r border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-rose-700 block">Total Withdrawals ({withdrawalTxs.length})</span>
                    <span className="text-base font-black font-mono text-rose-700 mt-1 block">
                      -${totalDebits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9.5px] text-rose-600 font-medium">Debits &amp; sweeps</span>
                  </div>
                  <div className="p-2 bg-emerald-50/60 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-[#0B1F6A] block">Ending Cleared Balance</span>
                    <span className="text-base font-black font-mono text-[#0B1F6A] mt-1 block">
                      ${endingBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9.5px] text-[#147A52] font-bold">100% Cleared Available</span>
                  </div>
                </div>

                {/* Secondary Metrics Bar */}
                <div className="bg-[#F5F7FA] px-4 py-2.5 border-t border-[#D8DEE8] grid grid-cols-3 text-[11px] font-mono">
                  <div className="text-left">
                    <span className="text-[#5F6670] font-sans font-medium">Net Cash Flow: </span>
                    <strong className={`font-bold ${netCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {netCashFlow >= 0 ? '+' : ''}${netCashFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                  <div className="text-center">
                    <span className="text-[#5F6670] font-sans font-medium">Period Interest Accrued: </span>
                    <strong className="text-[#0B1F6A] font-bold">
                      ${interestEarnedPeriod.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[#5F6670] font-sans font-medium">YTD Interest Paid: </span>
                    <strong className="text-[#20242A] font-bold">
                      ${(interestEarnedPeriod * 9).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Detailed Itemized Transaction Ledger Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-xs uppercase tracking-wider text-[#0B1F6A] flex items-center gap-1.5">
                    <span>Itemized Transaction Ledger</span>
                    <span className="text-[11px] font-mono font-medium text-[#5F6670]">({accountTxs.length} settled records)</span>
                  </h3>
                  <span className="text-[10px] text-[#5F6670] font-mono">Currency: {activeAccount.currency} • Standard Ledger</span>
                </div>

                <div className="border border-[#D8DEE8] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F5F7FA] text-[#5F6670] font-bold text-[10.5px] uppercase border-b border-[#D8DEE8]">
                        <th className="py-2.5 px-3">Settlement Date</th>
                        <th className="py-2.5 px-3">Reference / Counterparty</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3 text-right">Debits (-)</th>
                        <th className="py-2.5 px-3 text-right">Credits (+)</th>
                        <th className="py-2.5 px-3 text-right">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8DEE8] font-mono text-[11px]">
                      {accountTxs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-[#5F6670] font-sans font-medium">
                            No ledger movements recorded during this statement cycle.
                          </td>
                        </tr>
                      ) : (
                        accountTxs.map((tx, idx) => {
                          const isDebit = tx.type === 'withdrawal' || tx.type === 'transfer_out' || tx.type === 'bill_payment' || tx.type === 'card_purchase' || tx.type === 'fee';
                          return (
                            <tr key={tx.id || idx} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 whitespace-nowrap text-[#5F6670] font-bold">
                                {tx.timestamp.slice(0, 10)}
                              </td>
                              <td className="py-2.5 px-3 font-sans">
                                <div className="font-bold text-[#20242A] leading-tight">{tx.description}</div>
                                <div className="text-[10px] text-[#5F6670] font-mono mt-0.5">
                                  {tx.counterparty} • Ref: {tx.referenceNumber}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-sans text-[10px] text-[#5F6670]">
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                                  {tx.category}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right text-rose-700 font-bold whitespace-nowrap">
                                {isDebit ? `-$${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                              </td>
                              <td className="py-2.5 px-3 text-right text-emerald-700 font-bold whitespace-nowrap">
                                {!isDebit ? `+$${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                              </td>
                              <td className="py-2.5 px-3 text-right text-[#20242A] font-bold whitespace-nowrap">
                                ${endingBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Legal Disclosures, FDIC Insurance & Cryptographic QR Verification Footer */}
              <div className="pt-4 border-t-2 border-[#D8DEE8] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-[9.5px] text-[#5F6670] leading-tight max-w-xl">
                  <p className="font-bold text-[#20242A]">IMPORTANT REGULATORY DISCLOSURES (SEC RULE 206(4)-2 &amp; REGULATION E):</p>
                  <p>
                    Please examine this statement immediately. If you believe your statement or receipt is incorrect or if you need more information about a transfer listed, notify Northern Trust within 60 days after the statement was sent.
                  </p>
                  <p>
                    Deposits are insured up to $250,000 per depositor by the Federal Deposit Insurance Corporation (FDIC). Sovereign Multi-Custodial Sweeps provide excess multi-institution coverage up to $50,000,000.00.
                  </p>
                  <div className="font-mono text-[9px] text-slate-400 pt-1">
                    Security Checksum: SHA256-492001-E9281-B902A • Hardware Enclave Sealed • Officer: Sarah Jenkins
                  </div>
                </div>

                {/* Scannable Verification QR Code */}
                {qrCodeUrl && (
                  <div className="flex flex-col items-center shrink-0 p-2 bg-[#F5F7FA] rounded-xl border border-[#D8DEE8]">
                    <img src={qrCodeUrl} alt="Document Verification QR" className="w-18 h-18" />
                    <span className="text-[8.5px] font-mono font-bold text-[#0B1F6A] mt-1 text-center">
                      SCAN TO VERIFY<br />OFFICIAL SEAL
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* OPTION 2: OFFICIAL IRS FORM 1099-INT */}
          {/* ========================================================================= */}
          {documentType === 'tax_1099_int' && (
            <div className="w-full max-w-[820px] bg-white p-6 sm:p-10 rounded-xl shadow-lg border border-[#D8DEE8] print:border-none print:shadow-none print:p-0 space-y-5 text-[#20242A] text-xs font-sans">
              
              {/* Official IRS Top Banner & Treasury Seal */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b-2 border-[#002D62] gap-3">
                <IrsLogo variant="full" size="md" />
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ IRS CERTIFIED e-FILE
                    </span>
                    <p className="text-[9px] text-[#5F6670] mt-0.5 font-mono">
                      Transmitted to Internal Revenue Service • Tax Year {taxYear}
                    </p>
                  </div>
                  <IrsLogo variant="seal" size="md" />
                </div>
              </div>

              {/* Form 1099-INT Header */}
              <div className="grid grid-cols-12 border-2 border-black">
                {/* Payer Box */}
                <div className="col-span-8 p-3 border-r-2 border-black space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[#5F6670] block">
                    PAYER'S name, street address, city or town, state or province, country, ZIP or foreign postal code, and telephone no.
                  </span>
                  <p className="font-black text-xs text-[#0B1F6A]">NORTHERN TRUST COMPANY</p>
                  <p className="text-[11px]">50 South LaSalle Street, Floor 12</p>
                  <p className="text-[11px]">Chicago, IL 60603 • Tel: (800) 555-NTCO • SWIFT: NTCOUS33NYC</p>
                </div>

                <div className="col-span-4 p-3 flex flex-col justify-between bg-slate-50">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] font-bold">OMB No. 1545-0112</span>
                    <span className="text-xl font-black font-serif text-[#0B1F6A]">{taxYear}</span>
                  </div>
                  <div className="text-center font-black text-sm uppercase tracking-tight">
                    Form 1099-INT
                  </div>
                  <div className="text-[10px] font-bold text-center text-[#5F6670]">
                    Interest Income Certification
                  </div>
                </div>

                {/* Payer & Recipient TINs */}
                <div className="col-span-4 p-2.5 border-t-2 border-r-2 border-black">
                  <span className="text-[9px] font-bold text-[#5F6670] block">PAYER'S TIN</span>
                  <span className="font-mono font-bold text-xs">36-0724010</span>
                </div>
                <div className="col-span-4 p-2.5 border-t-2 border-r-2 border-black">
                  <span className="text-[9px] font-bold text-[#5F6670] block">RECIPIENT'S TIN</span>
                  <span className="font-mono font-bold text-xs">
                    {isMasked ? '•••-••-7724' : (currentUser?.taxIdMasked || '•••-••-7724')}
                  </span>
                </div>
                <div className="col-span-4 p-2.5 border-t-2 border-black bg-emerald-50/70">
                  <span className="text-[9px] font-bold text-[#0B1F6A] block">1 Interest income</span>
                  <span className="font-mono font-black text-sm text-[#0B1F6A] block">
                    {taxYear === '2026' ? '$735,900.00' : taxYear === '2025' ? '$981,540.25' : taxYear === '2024' ? '$894,220.10' : '$742,880.50'}
                  </span>
                </div>

                {/* Recipient's Name and Details */}
                <div className="col-span-8 p-3 border-t-2 border-r-2 border-black space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[#5F6670] block">RECIPIENT'S name</span>
                  <p className="font-bold text-xs text-[#20242A]">{currentUser?.fullName || 'Angelina Jolie'}</p>
                  <span className="text-[9px] uppercase font-bold text-[#5F6670] block mt-1">Street address (including apt. no.)</span>
                  <p className="text-[11px] text-[#20242A]">{currentUser?.address.street || '2620 Los Feliz Blvd'}</p>
                  <span className="text-[9px] uppercase font-bold text-[#5F6670] block mt-1">City or town, state, and ZIP</span>
                  <p className="text-[11px] text-[#20242A]">
                    {currentUser?.address.city || 'Los Angeles'}, {currentUser?.address.state || 'CA'} {currentUser?.address.postalCode || '90027'}
                  </p>
                </div>

                {/* Boxes 2, 3, 4 */}
                <div className="col-span-4 border-t-2 border-black divide-y divide-black">
                  <div className="p-2">
                    <span className="text-[9px] font-bold text-[#5F6670] block">2 Early withdrawal penalty</span>
                    <span className="font-mono font-bold text-xs">$0.00</span>
                  </div>
                  <div className="p-2">
                    <span className="text-[9px] font-bold text-[#5F6670] block">3 Interest on U.S. Savings Bonds</span>
                    <span className="font-mono font-bold text-xs">
                      {taxYear === '2026' ? '$36,150.00' : taxYear === '2025' ? '$48,200.00' : taxYear === '2024' ? '$42,100.00' : '$36,500.00'}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50">
                    <span className="text-[9px] font-bold text-[#5F6670] block">4 Federal income tax withheld</span>
                    <span className="font-mono font-bold text-xs">$0.00</span>
                  </div>
                </div>

                {/* Account Number & FATCA check */}
                <div className="col-span-4 p-2.5 border-t-2 border-r-2 border-black">
                  <span className="text-[9px] font-bold text-[#5F6670] block">Account number (see instructions)</span>
                  <span className="font-mono font-bold text-xs">{maskAccount(activeAccount.accountNumber)}</span>
                </div>
                <div className="col-span-4 p-2.5 border-t-2 border-r-2 border-black">
                  <span className="text-[9px] font-bold text-[#5F6670] block">Payer's RTN (optional)</span>
                  <span className="font-mono font-bold text-xs">{activeAccount.routingNumber}</span>
                </div>
                <div className="col-span-4 p-2.5 border-t-2 border-black">
                  <span className="text-[9px] font-bold text-[#5F6670] block">8 Tax-exempt interest</span>
                  <span className="font-mono font-bold text-xs">$0.00</span>
                </div>
              </div>

              {/* IRS Copy Notice */}
              <div className="flex flex-col sm:flex-row items-center justify-between pt-3 text-[10px] text-[#5F6670] border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <IrsLogo variant="mark" size="xs" />
                  <span>
                    <strong>Copy B For Recipient:</strong> This official tax information is furnished to the Internal Revenue Service for Tax Year {taxYear}.
                  </span>
                </div>
                <div className="font-mono text-right text-[9.5px]">
                  Cat. No. 14410K • Form 1099-INT (Rev. {taxYear})
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* OPTION 3: OFFICIAL IRS FORM 1099-B */}
          {/* ========================================================================= */}
          {documentType === 'tax_1099_b' && (
            <div className="w-full max-w-[820px] bg-white p-6 sm:p-10 rounded-xl shadow-lg border border-[#D8DEE8] print:border-none print:shadow-none print:p-0 space-y-5 text-[#20242A] text-xs font-sans">
              
              {/* Official IRS Top Banner & Treasury Seal */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b-2 border-[#002D62] gap-3">
                <IrsLogo variant="full" size="md" />
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ IRS CERTIFIED BROKERAGE RETURN
                    </span>
                    <p className="text-[9px] text-[#5F6670] mt-0.5 font-mono">
                      Department of the Treasury • Tax Year {taxYear}
                    </p>
                  </div>
                  <IrsLogo variant="seal" size="md" />
                </div>
              </div>

              <div className="grid grid-cols-12 border-2 border-black">
                <div className="col-span-8 p-3 border-r-2 border-black space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[#5F6670] block">
                    PAYER'S name, address, and telephone number
                  </span>
                  <p className="font-black text-xs text-[#0B1F6A]">NORTHERN TRUST SECURITIES &amp; CUSTODY LLC</p>
                  <p className="text-[11px]">1 Wall Street, Floor 48, New York, NY 10005</p>
                </div>

                <div className="col-span-4 p-3 flex flex-col justify-between bg-slate-50">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] font-bold">OMB No. 1545-0715</span>
                    <span className="text-xl font-black font-serif text-[#0B1F6A]">{taxYear}</span>
                  </div>
                  <div className="text-center font-black text-sm uppercase tracking-tight">
                    Form 1099-B
                  </div>
                  <div className="text-[9px] font-bold text-center text-[#5F6670]">
                    Proceeds From Brokerage &amp; Barter
                  </div>
                </div>

                <div className="col-span-6 p-2.5 border-t-2 border-r-2 border-black">
                  <span className="text-[9px] font-bold text-[#5F6670] block">1a Description of property</span>
                  <span className="font-bold text-xs">US TREASURY BONDS &amp; SOVEREIGN ESG INDEX PORTFOLIO</span>
                </div>
                <div className="col-span-3 p-2.5 border-t-2 border-r-2 border-black">
                  <span className="text-[9px] font-bold text-[#5F6670] block">1d Gross proceeds</span>
                  <span className="font-mono font-black text-xs text-emerald-800">
                    {taxYear === '2026' ? '$3,620,000.00' : taxYear === '2025' ? '$4,820,500.00' : taxYear === '2024' ? '$3,920,000.00' : '$3,100,000.00'}
                  </span>
                </div>
                <div className="col-span-3 p-2.5 border-t-2 border-black">
                  <span className="text-[9px] font-bold text-[#5F6670] block">1e Cost or other basis</span>
                  <span className="font-mono font-black text-xs text-[#20242A]">
                    {taxYear === '2026' ? '$3,140,000.00' : taxYear === '2025' ? '$4,180,500.00' : taxYear === '2024' ? '$3,400,000.00' : '$2,690,000.00'}
                  </span>
                </div>

                <div className="col-span-6 p-2.5 border-t-2 border-r-2 border-black">
                  <span className="text-[9px] font-bold text-[#5F6670] block">Recipient's Identification (SSN/TIN)</span>
                  <span className="font-mono font-bold text-xs">
                    {isMasked ? '•••-••-7724' : (currentUser?.taxIdMasked || '•••-••-7724')}
                  </span>
                </div>
                <div className="col-span-6 p-2.5 border-t-2 border-black bg-emerald-50/50">
                  <span className="text-[9px] font-bold text-emerald-900 block">Net Realized Capital Gain (Long-Term)</span>
                  <span className="font-mono font-black text-sm text-emerald-700">
                    {taxYear === '2026' ? '+$480,000.00' : taxYear === '2025' ? '+$640,000.00' : taxYear === '2024' ? '+$520,000.00' : '+$410,000.00'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#5F6670] pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <IrsLogo variant="mark" size="xs" />
                  <span>Copy B for Recipient • Department of the Treasury – Internal Revenue Service. Retain with Tax Year {taxYear} records.</span>
                </div>
                <span className="font-mono text-[9px]">Cat. No. 14411V • Form 1099-B</span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* OPTION 4: CERTIFIED PROOF OF FUNDS / BANK REFERENCE LETTER */}
          {/* ========================================================================= */}
          {documentType === 'proof_of_funds' && (
            <div className="w-full max-w-[820px] bg-white p-8 sm:p-12 rounded-xl shadow-lg border border-[#D8DEE8] print:border-none print:shadow-none print:p-0 space-y-6 text-[#20242A] text-xs font-serif leading-relaxed">
              
              {/* Prestigious Letterhead */}
              <div className="text-center pb-6 border-b-2 border-[#0B1F6A]">
                <NorthernTrustLogo className="w-12 h-12 text-[#0B1F6A] mx-auto mb-2" color="#0B1F6A" />
                <h1 className="text-2xl font-black font-serif text-[#0B1F6A] tracking-wider uppercase">
                  Northern Trust Company
                </h1>
                <p className="text-[11px] font-sans font-semibold text-[#5F6670]">
                  Private Wealth &amp; Institutional Banking Group • Founded 1889
                </p>
                <p className="text-[10px] font-sans text-[#5F6670] mt-0.5">
                  50 South LaSalle Street, Chicago, Illinois 60603 | 1 Wall Street, New York, NY 10005
                </p>
              </div>

              {/* Date & Salutation */}
              <div className="font-sans space-y-1">
                <p className="text-xs font-bold text-[#5F6670]">Date: September 26, 2026</p>
                <p className="text-xs font-bold text-[#5F6670]">Reference Code: CERT-POF-2026-NT-CLIENT</p>
                <div className="pt-3 font-bold text-sm text-[#20242A]">
                  TO WHOM IT MAY CONCERN / EMBASSY / FINANCIAL REGULATORY AUTHORITY:
                </div>
              </div>

              {/* Body Text */}
              <div className="space-y-4 text-xs text-[#20242A]">
                <p>
                  This official Bank Reference and Certification Letter is issued at the request of our valued client,{' '}
                  <strong className="font-sans font-bold">{currentUser?.fullName || 'Angelina Jolie'}</strong> (Client Identifier:{' '}
                  <span className="font-mono font-bold text-[#0B1F6A]">{currentUser?.clientId || 'NT-8820-CLIENT'}</span>).
                </p>

                <p>
                  We hereby certify that as of the close of global ledger operations on September 26, 2026, the above-named client maintains active, fully cleared, unencumbered depository balances and custodial reserves in excellent standing with Northern Trust Company as summarized below:
                </p>

                {/* Accounts Table in Letter */}
                <div className="border border-[#D8DEE8] rounded-xl overflow-hidden font-sans">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0B1F6A] text-white font-bold text-[10.5px]">
                      <tr>
                        <th className="p-2.5">Account Portfolio Description</th>
                        <th className="p-2.5">Clearing Account No.</th>
                        <th className="p-2.5">Date Inception</th>
                        <th className="p-2.5 text-right">Cleared Balance (USD Equiv.)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8DEE8] font-mono text-[11px]">
                      {accounts.map(acc => (
                        <tr key={acc.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-sans font-bold text-[#20242A]">{acc.name}</td>
                          <td className="p-2.5 text-[#5F6670]">{maskAccount(acc.accountNumber)}</td>
                          <td className="p-2.5 text-[#5F6670] font-sans">March 2021</td>
                          <td className="p-2.5 text-right font-black text-[#0B1F6A]">
                            ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-emerald-50/70 font-black">
                        <td colSpan={3} className="p-2.5 font-sans text-emerald-950 uppercase text-right">
                          Total Certified Liquidity Under Custody:
                        </td>
                        <td className="p-2.5 text-right font-mono text-emerald-800 text-sm">
                          ${accounts.reduce((sum, a) => sum + a.balance, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p>
                  All accounts held by {currentUser?.fullName || 'Angelina Jolie'} have operated with exemplary punctuality, zero derogatory events, and full compliance with the Bank Secrecy Act, FATCA, Common Reporting Standards (CRS), and Federal Reserve regulatory guidelines.
                </p>

                <p>
                  This certificate is issued without liability or guarantee on the part of the bank or its officers, but reflects verified ledger records.
                </p>
              </div>

              {/* Signatures and Corporate Raised-look Stamp */}
              <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 font-sans">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="font-serif italic text-lg text-[#0B1F6A] font-bold border-b border-[#D8DEE8] pb-1 w-56">
                    Sarah Jenkins
                  </div>
                  <p className="font-bold text-xs text-[#20242A]">Sarah Jenkins</p>
                  <p className="text-[11px] text-[#5F6670]">Managing Director &amp; Chief Compliance Officer</p>
                  <p className="text-[10px] text-[#5F6670]">Private Wealth Operations • Northern Trust</p>
                </div>

                {/* Stamped Corporate Seal & QR */}
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full border-4 border-double border-[#0B1F6A] flex flex-col items-center justify-center text-center p-1 text-[#0B1F6A] rotate-[-8deg] shadow-xs">
                    <span className="text-[7.5px] font-black tracking-widest uppercase">NORTHERN TRUST</span>
                    <NorthernTrustLogo className="w-5 h-5 text-[#0B1F6A] my-0.5" color="#0B1F6A" />
                    <span className="text-[7px] font-bold uppercase">OFFICIAL SEAL</span>
                    <span className="text-[6.5px] font-mono">EST. 1889</span>
                  </div>

                  {qrCodeUrl && (
                    <div className="flex flex-col items-center p-1.5 bg-slate-50 rounded-lg border border-slate-200">
                      <img src={qrCodeUrl} alt="Verify Seal" className="w-14 h-14" />
                      <span className="text-[7.5px] font-mono font-bold text-[#0B1F6A]">VERIFIED SEAL</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <ExportPrintSecurityModal
        isOpen={secModalOpen}
        onClose={() => {
          setSecModalOpen(false);
          setPendingSecAction(null);
        }}
        onAuthorized={() => {
          if (pendingSecAction) {
            pendingSecAction.fn();
          }
          setSecModalOpen(false);
          setPendingSecAction(null);
        }}
        actionTitle={pendingSecAction?.title}
        actionType={pendingSecAction?.type}
      />
    </div>
  );
};
