import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  Wallet,
  Building2,
  Copy,
  Eye,
  EyeOff,
  ArrowRight,
  TrendingUp,
  Download,
  Lock,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  SendHorizontal,
  FileText,
  DollarSign,
  ChevronRight,
  Info,
  FileSpreadsheet,
  Printer,
  Sparkles,
  FileCheck2,
  Receipt
} from 'lucide-react';
import { BankAccount } from '../../types/banking';
import { StatementTaxModal } from './StatementTaxModal';
import { ExportPrintSecurityModal } from '../common/ExportPrintSecurityModal';
import {
  exportAccountsToCSV,
  exportTransactionsToCSV,
  exportOfficialStatementPDF,
  exportTaxFormPDF,
  exportTaxSummaryCSV
} from '../../utils/exportUtils';

export const AccountsView: React.FC = () => {
  const {
    accounts,
    transactions,
    currentUser,
    navigateTo,
    hasPermission,
    triggerAccessDenied
  } = useBanking();
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(accounts[0] || null);
  const [unmaskMap, setUnmaskMap] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [isAccountsSectionExpanded, setIsAccountsSectionExpanded] = useState<boolean>(true);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [modalType, setModalType] = useState<'statement' | 'tax_1099_int' | 'tax_1099_b' | 'proof_of_funds'>('statement');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleUnmask = (id: string) => {
    setUnmaskMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredAccounts = filterType === 'all'
    ? accounts
    : accounts.filter(a => a.type === filterType);

  // Quick direct exports
  const handleExportAccountsCSV = () => {
    if (!hasPermission('view:documents')) {
      triggerAccessDenied('view:documents', 'Export Portfolio Accounts CSV');
      return;
    }
    triggerProtectedAction(() => {
      exportAccountsToCSV(accounts, currentUser);
      showToast('Accounts Portfolio CSV exported successfully.');
    }, 'Export Accounts Portfolio CSV', 'export');
  };

  const handleExportSelectedAccountCSV = (acc: BankAccount) => {
    if (!hasPermission('view:documents')) {
      triggerAccessDenied('view:documents', 'Download Ledger CSV');
      return;
    }
    triggerProtectedAction(() => {
      const accTxs = transactions.filter(t => t.accountId === acc.id);
      exportTransactionsToCSV(accTxs, `Northern_Trust_${acc.name.replace(/\s+/g, '_')}`, 'Account_Ledger');
      showToast(`Ledger CSV for ${acc.name} downloaded.`);
    }, `Download Ledger CSV (${acc.name})`, 'download');
  };

  const handleExportSelectedAccountPDF = (acc: BankAccount) => {
    if (!hasPermission('view:documents')) {
      triggerAccessDenied('view:documents', 'Generate Official Statement PDF');
      return;
    }
    triggerProtectedAction(() => {
      const accTxs = transactions.filter(t => t.accountId === acc.id);
      exportOfficialStatementPDF(acc, accTxs, currentUser, 'Monthly Cycle #09-2026');
      showToast(`Official PDF Statement for ${acc.name} generated & downloaded.`);
    }, `Generate Statement PDF (${acc.name})`, 'download');
  };

  const handleExportTaxForm = (acc: BankAccount, formType: '1099-INT' | '1099-B' = '1099-INT') => {
    if (!hasPermission('view:documents')) {
      triggerAccessDenied('view:documents', `IRS Form ${formType}`);
      return;
    }
    triggerProtectedAction(() => {
      exportTaxFormPDF(formType, '2025', acc, currentUser);
      showToast(`IRS Form ${formType} (2025) PDF generated.`);
    }, `Export IRS Form ${formType} PDF`, 'download');
  };

  return (
    <div className="space-y-6 pb-8 animate-fade-in text-[#20242A]">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-[#0B1F6A] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#147A52] text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#147A52]/10 border-2 border-emerald-300 text-[#147A52] text-xs font-black mb-2 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#147A52] stroke-[2.25]" /> Federal Reserve &amp; FINMA Supervised Ledger
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-[#20242A]">
            Accounts &amp; Liquidity Portfolios
          </h1>
          <p className="text-xs text-[#5F6670] mt-1 font-medium">
            Access routing transit numbers, international IBANs, multi-currency accounts, and tier-specific yield schedules.
          </p>
        </div>

        {/* Global Export & Filter Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportAccountsCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F5F7FA] border-2 border-[#D8DEE8] hover:border-[#147A52] text-[#147A52] font-bold text-xs flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
            title="Download complete account balances and wiring info as CSV"
          >
            <FileSpreadsheet className="w-4 h-4 stroke-[2.25]" />
            <span>Download CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (selectedAccount) {
                handleExportSelectedAccountPDF(selectedAccount);
              } else {
                setModalType('statement');
                setShowStatementModal(true);
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            title="Generate & Download Official PDF Statement"
          >
            <Download className="w-4 h-4 stroke-[2.25]" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!hasPermission('view:documents')) {
                triggerAccessDenied('view:documents', 'Official Statements & Tax');
                return;
              }
              setModalType('statement');
              setShowStatementModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#147A52] hover:bg-[#0E5E3D] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4 stroke-[2.25]" />
            <span>Official Statements &amp; Tax</span>
          </button>
        </div>
      </div>

      {/* Account Type Filter Tabs */}
      <div className="flex items-center justify-between gap-3 bg-white p-2 rounded-xl border-2 border-[#D8DEE8] overflow-x-auto shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-[#5F6670] uppercase px-2 font-mono">Filter Category:</span>
          {['all', 'checking', 'investment', 'cd', 'multicurrency'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer text-xs ${
                filterType === t
                  ? 'bg-[#147A52] text-white shadow-xs border border-[#147A52]'
                  : 'text-[#5F6670] hover:text-[#20242A] hover:bg-[#F5F7FA]'
              }`}
            >
              {t === 'all' ? 'All Accounts' : t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pr-2 text-xs text-[#5F6670] font-mono">
          <span>Total Portfolios: <strong className="text-[#20242A]">{filteredAccounts.length}</strong></span>
        </div>
      </div>

      {/* Main Grid: Account Cards + Account Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Account Cards List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between bg-white rounded-2xl p-4 border-2 border-[#D8DEE8] shadow-sm cursor-pointer" onClick={() => setIsAccountsSectionExpanded(!isAccountsSectionExpanded)}>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-black text-[#20242A]">
                Deposit &amp; Custody Accounts ({filteredAccounts.length})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#5F6670] font-medium hidden sm:inline">Select account to inspect wiring &amp; export</span>
              <button
                type="button"
                className="p-1.5 rounded-lg bg-[#F5F7FA] border-2 border-[#D8DEE8] text-[#147A52] hover:bg-[#081552]/10 transition-colors"
                aria-label="Toggle section"
              >
                {isAccountsSectionExpanded ? (
                  <span className="text-xs font-bold font-mono px-1">COLLAPSE ▲</span>
                ) : (
                  <span className="text-xs font-bold font-mono px-1">EXPAND ▼</span>
                )}
              </button>
            </div>
          </div>

          {isAccountsSectionExpanded && (
          <div className="space-y-3.5 animate-fade-in">
            {filteredAccounts.map((acc) => {
              const isSelected = selectedAccount?.id === acc.id;
              const isUnmasked = !!unmaskMap[acc.id];
              const displayAcctNum = isUnmasked ? acc.accountNumber : `•••• •••• ${acc.accountNumber.slice(-4)}`;

              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccount(acc)}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border-2 transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? 'border-[#147A52] ring-2 ring-[#147A52]/20 bg-[#fafcfb]'
                      : 'border-[#D8DEE8] hover:border-[#9ba8b5]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-base text-[#20242A]">{acc.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md uppercase font-bold bg-[#F5F7FA] text-[#5F6670] border-2 border-[#D8DEE8]">
                          {acc.type}
                        </span>
                        {acc.interestRateAPY && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#147A52]/10 text-[#147A52] border-2 border-emerald-300 font-extrabold">
                            {acc.interestRateAPY}% APY
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#5F6670] font-mono font-medium">
                        <span>Account: {displayAcctNum}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleUnmask(acc.id);
                          }}
                          className="text-[#5F6670] hover:text-[#20242A] p-0.5 cursor-pointer"
                          title="Toggle Account Number"
                        >
                          {isUnmasked ? <EyeOff className="w-3.5 h-3.5 stroke-[2.25]" /> : <Eye className="w-3.5 h-3.5 stroke-[2.25]" />}
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#5F6670] uppercase font-bold tracking-wider block">Available Liquidity</span>
                      <div className="text-lg sm:text-xl font-black font-mono text-[#147A52]">
                        {acc.currency} {acc.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t-2 border-[#F5F7FA] flex flex-wrap items-center justify-between gap-2 text-xs text-[#5F6670]">
                    <div className="flex items-center gap-4">
                      <span>Routing: <strong className="font-mono text-[#20242A] font-bold">{acc.routingNumber}</strong></span>
                      {acc.swiftBic && (
                        <span>SWIFT: <strong className="font-mono text-[#20242A] font-bold">{acc.swiftBic}</strong></span>
                      )}
                    </div>

                    {/* Quick export action buttons per card */}
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleExportSelectedAccountCSV(acc)}
                        className="p-1 px-2 rounded-md bg-[#F5F7FA] hover:bg-slate-200 border border-[#D8DEE8] text-[#147A52] font-semibold text-[11px] flex items-center gap-1 transition-colors"
                        title="Download CSV Ledger"
                      >
                        <FileSpreadsheet className="w-3 h-3" />
                        <span>CSV</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportSelectedAccountPDF(acc)}
                        className="p-1 px-2 rounded-md bg-[#0B1F6A] hover:bg-[#081552] text-white font-semibold text-[11px] flex items-center gap-1 transition-colors shadow-2xs"
                        title="Download PDF Statement"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>

        {/* Account Detail Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedAccount ? (
            <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#F5F7FA]">
                <div>
                  <h3 className="text-base font-black text-[#20242A]">{selectedAccount.name}</h3>
                  <span className="text-xs text-[#5F6670] font-medium">Settlement &amp; Wiring Instructions</span>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-black bg-[#147A52]/10 text-[#147A52] border-2 border-emerald-300">
                  {selectedAccount.status.toUpperCase()}
                </span>
              </div>

              {/* Wire Information Grid */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[#5F6670] block text-[10px] uppercase font-bold tracking-wider">Account Number</span>
                    <span className="font-mono font-black text-sm text-[#20242A]">{selectedAccount.accountNumber}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedAccount.accountNumber, 'acct')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border-2 border-[#D8DEE8] hover:border-[#147A52] text-[#147A52] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5 stroke-[2.25]" />
                    <span>{copiedKey === 'acct' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[#5F6670] block text-[10px] uppercase font-bold tracking-wider">ABA Routing (Fedwire / ACH)</span>
                    <span className="font-mono font-black text-sm text-[#20242A]">{selectedAccount.routingNumber}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(selectedAccount.routingNumber, 'routing')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border-2 border-[#D8DEE8] hover:border-[#147A52] text-[#147A52] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                  >
                    <Copy className="w-3.5 h-3.5 stroke-[2.25]" />
                    <span>{copiedKey === 'routing' ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>

                {selectedAccount.iban && (
                  <div className="p-3 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="text-[#5F6670] block text-[10px] uppercase font-bold tracking-wider">International IBAN</span>
                      <span className="font-mono font-black text-sm text-[#20242A]">{selectedAccount.iban}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedAccount.iban!, 'iban')}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border-2 border-[#D8DEE8] hover:border-[#147A52] text-[#147A52] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                    >
                      <Copy className="w-3.5 h-3.5 stroke-[2.25]" />
                      <span>{copiedKey === 'iban' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                )}

                {selectedAccount.swiftBic && (
                  <div className="p-3 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] flex items-center justify-between shadow-2xs">
                    <div>
                      <span className="text-[#5F6670] block text-[10px] uppercase font-bold tracking-wider">SWIFT / BIC Code</span>
                      <span className="font-mono font-black text-sm text-[#20242A]">{selectedAccount.swiftBic}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedAccount.swiftBic!, 'swift')}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border-2 border-[#D8DEE8] hover:border-[#147A52] text-[#147A52] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                    >
                      <Copy className="w-3.5 h-3.5 stroke-[2.25]" />
                      <span>{copiedKey === 'swift' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Download / Export Hub */}
              <div className="pt-2 border-t-2 border-[#F5F7FA] space-y-2">
                <div className="text-[11px] font-bold text-[#5F6670] uppercase tracking-wider font-mono">
                  Export &amp; Record Keeping
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportSelectedAccountCSV(selectedAccount)}
                    className="py-2.5 px-3 rounded-xl bg-white hover:bg-[#F5F7FA] border-2 border-[#D8DEE8] hover:border-[#147A52] text-[#147A52] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 stroke-[2.25]" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportSelectedAccountPDF(selectedAccount)}
                    className="py-2.5 px-3 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.25]" />
                    <span>Download PDF</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportTaxForm(selectedAccount, '1099-INT')}
                    className="py-2 px-3 rounded-xl bg-[#F5F7FA] hover:bg-slate-200 border border-[#D8DEE8] text-[#20242A] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-[#147A52]" />
                    <span>Form 1099-INT</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setModalType('tax_1099_b');
                      setShowStatementModal(true);
                    }}
                    className="py-2 px-3 rounded-xl bg-[#F5F7FA] hover:bg-slate-200 border border-[#D8DEE8] text-[#20242A] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#0B1F6A]" />
                    <span>Form 1099-B</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setModalType('proof_of_funds');
                    setShowStatementModal(true);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#F5F7FA] border-2 border-[#D8DEE8] hover:border-[#0B1F6A] text-[#0B1F6A] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                >
                  <FileText className="w-4 h-4 stroke-[2.25]" />
                  <span>Download Bank Verification Letter (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo('/transfers')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <SendHorizontal className="w-4 h-4 stroke-[2.25]" />
                  <span>Initiate Wire Transfer from This Account</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Official Statement & Tax Modal */}
      {selectedAccount && (
        <StatementTaxModal
          isOpen={showStatementModal}
          onClose={() => setShowStatementModal(false)}
          initialType={modalType}
          initialAccountId={selectedAccount.id}
        />
      )}

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
