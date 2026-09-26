import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useBanking } from '../../context/BankingContext';
import {
  FileText,
  Download,
  Eye,
  ShieldCheck,
  Calendar,
  DollarSign,
  Receipt,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Send,
  Building2,
  Lock,
  Printer,
  X,
  AlertCircle,
  Landmark,
  BadgeCheck,
  HelpCircle,
  FileCheck,
  CreditCard,
  FileSpreadsheet
} from 'lucide-react';
import { IrsLogo } from '../common/IrsLogo';
import { StatementTaxModal } from './StatementTaxModal';
import { TaxDeadlineNotificationBadge } from './TaxDeadlineNotificationBadge';

export interface TaxTransactionRecord {
  id: string;
  referenceNumber: string;
  date: string;
  taxYear: string;
  taxType: 'IRS 1040-ES Estimated' | 'Form 1099-INT Withholding' | 'Form 1099-DIV Dividend Tax' | '1099-B Capital Gains Withholding' | 'CA FTB 540-ES State' | 'Foreign Withholding 1042-S' | 'Corporate Franchise Tax';
  taxableAmount: number;
  taxAmount: number;
  status: 'Completed' | 'Verified' | 'Pending Clearing';
  relatedAccountId: string;
  relatedAccountName: string;
  paymentReference: string;
  description: string;
}

const initialTaxRecords: TaxTransactionRecord[] = [
  {
    id: 'tx-tax-2026-03',
    referenceNumber: 'EFTPS-2026-092418',
    date: '2026-09-15',
    taxYear: '2026',
    taxType: 'IRS 1040-ES Estimated',
    taxableAmount: 185000.00,
    taxAmount: 62500.00,
    status: 'Completed',
    relatedAccountId: 'acc_1',
    relatedAccountName: 'Private Wealth Checking (•••2741)',
    paymentReference: 'EFTPS-FED-9920148-US',
    description: 'Q3 2026 U.S. Federal Individual Estimated Tax Payment via Direct Treasury Clearing'
  },
  {
    id: 'tx-tax-2026-02',
    referenceNumber: 'FTB-2026-061590',
    date: '2026-06-15',
    taxYear: '2026',
    taxType: 'CA FTB 540-ES State',
    taxableAmount: 185000.00,
    taxAmount: 21500.00,
    status: 'Completed',
    relatedAccountId: 'acc_1',
    relatedAccountName: 'Private Wealth Checking (•••2741)',
    paymentReference: 'FTB-CA-8840192',
    description: 'Q2 2026 California Franchise Tax Board Estimated Quarterly Tax Payment'
  },
  {
    id: 'tx-tax-2026-01',
    referenceNumber: 'EFTPS-2026-041502',
    date: '2026-04-15',
    taxYear: '2026',
    taxType: 'IRS 1040-ES Estimated',
    taxableAmount: 160000.00,
    taxAmount: 54000.00,
    status: 'Completed',
    relatedAccountId: 'acc_1',
    relatedAccountName: 'Private Wealth Checking (•••2741)',
    paymentReference: 'EFTPS-FED-7730911-US',
    description: 'Q1 2026 U.S. Federal Individual Estimated Tax Payment via Direct Treasury Clearing'
  },
  {
    id: 'tx-tax-2025-04',
    referenceNumber: 'WTH-2025-123190',
    date: '2025-12-31',
    taxYear: '2025',
    taxType: 'Form 1099-INT Withholding',
    taxableAmount: 981540.25,
    taxAmount: 235569.66,
    status: 'Verified',
    relatedAccountId: 'acc_1',
    relatedAccountName: 'Private Wealth Checking (•••2741)',
    paymentReference: 'IRS-WTH-2025-1099INT',
    description: 'Annual Verified Mandatory Backup & Backup Clearing Withholding on High-Yield Depository Interest'
  },
  {
    id: 'tx-tax-2025-03',
    referenceNumber: 'WTH-2025-123191',
    date: '2025-12-31',
    taxYear: '2025',
    taxType: 'Form 1099-DIV Dividend Tax',
    taxableAmount: 512400.00,
    taxAmount: 102480.00,
    status: 'Verified',
    relatedAccountId: 'acc_2',
    relatedAccountName: 'Depository Vault Reserves (•••9014)',
    paymentReference: 'IRS-DIV-2025-1099DIV',
    description: 'Qualified Dividend Income Federal Tax Assessment & Custodial Sweep'
  },
  {
    id: 'tx-tax-2025-02',
    referenceNumber: 'WTH-2025-123192',
    date: '2025-12-31',
    taxYear: '2025',
    taxType: '1099-B Capital Gains Withholding',
    taxableAmount: 640000.00,
    taxAmount: 128000.00,
    status: 'Verified',
    relatedAccountId: 'acc_3',
    relatedAccountName: 'Sovereign Wealth Trust (•••5521)',
    paymentReference: 'IRS-CAP-2025-1099B',
    description: 'Long-Term Capital Gains Statutory Tax Withholding on Portfolio Liquidations'
  },
  {
    id: 'tx-tax-2024-01',
    referenceNumber: 'EFTPS-2024-101509',
    date: '2024-10-15',
    taxYear: '2024',
    taxType: 'IRS 1040-ES Estimated',
    taxableAmount: 894220.10,
    taxAmount: 357688.04,
    status: 'Completed',
    relatedAccountId: 'acc_1',
    relatedAccountName: 'Private Wealth Checking (•••2741)',
    paymentReference: 'EFTPS-FED-6640192-US',
    description: 'Final 2024 U.S. Federal Form 1040 Tax Settlement Cleared via Direct ACH Transit'
  }
];

export const TaxSection: React.FC = () => {
  const { currentUser, accounts, navigateTo } = useBanking();

  // State Management
  const [taxRecords, setTaxRecords] = useState<TaxTransactionRecord[]>(initialTaxRecords);
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Tax Payment Modal State
  const [isPayTaxModalOpen, setIsPayTaxModalOpen] = useState(false);
  const [taxPaymentType, setTaxPaymentType] = useState<string>('IRS 1040-ES Estimated');
  const [taxPaymentAmount, setTaxPaymentAmount] = useState<string>('25000');
  const [taxPaymentAccountId, setTaxPaymentAccountId] = useState<string>(accounts[0]?.id || 'acc_1');
  const [taxPaymentYear, setTaxPaymentYear] = useState<string>('2026');
  const [taxPaymentPeriod, setTaxPaymentPeriod] = useState<string>('Q4 Estimated');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState<TaxTransactionRecord | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Statement & Receipt Modals
  const [isStatementTaxModalOpen, setIsStatementTaxModalOpen] = useState(false);
  const [statementTaxModalType, setStatementTaxModalType] = useState<'statement' | 'tax_1099_int' | 'tax_1099_b' | 'proof_of_funds'>('tax_1099_int');
  const [viewingReceipt, setViewingReceipt] = useState<TaxTransactionRecord | null>(null);

  // Active Funding Account for Tax Payment
  const activeFundingAccount = accounts.find(a => a.id === taxPaymentAccountId) || accounts[0];

  // Dynamic Year Overview Metrics (IRS Verified Rules)
  const overviewMetrics = useMemo(() => {
    switch (selectedYear) {
      case '2026':
        return {
          taxYear: '2026 (Estimated Q1–Q3)',
          taxableIncome: 530000.00,
          taxWithheld: 127536.22,
          taxPaymentsMade: 138000.00,
          pendingObligations: 0.00,
          availableTaxRecords: 3,
          taxStatus: 'Active & Compliant',
          statusColor: 'emerald',
          jurisdiction: 'U.S. Federal (IRS) & California (FTB)'
        };
      case '2024':
        return {
          taxYear: '2024 (Certified)',
          taxableIncome: 1883120.10,
          taxWithheld: 473936.64,
          taxPaymentsMade: 357688.04,
          pendingObligations: 0.00,
          availableTaxRecords: 4,
          taxStatus: 'Filed & Certified',
          statusColor: 'blue',
          jurisdiction: 'U.S. Federal (IRS) & California (FTB)'
        };
      case '2023':
        return {
          taxYear: '2023 (Certified)',
          taxableIncome: 1547880.50,
          taxWithheld: 393726.66,
          taxPaymentsMade: 297152.20,
          pendingObligations: 0.00,
          availableTaxRecords: 4,
          taxStatus: 'Filed & Certified',
          statusColor: 'blue',
          jurisdiction: 'U.S. Federal (IRS) & California (FTB)'
        };
      case '2025':
      default:
        return {
          taxYear: '2025 (Final Tax Year)',
          taxableIncome: 2133940.25,
          taxWithheld: 520206.30,
          taxPaymentsMade: 420000.00,
          pendingObligations: 0.00,
          availableTaxRecords: 6,
          taxStatus: 'Verified & 100% Cleared',
          statusColor: 'emerald',
          jurisdiction: 'U.S. Federal (IRS) & California (FTB)'
        };
    }
  }, [selectedYear]);

  // Filtered Tax Transactions Ledger
  const filteredTaxRecords = useMemo(() => {
    return taxRecords.filter((record) => {
      // Year Filter
      if (selectedYear !== 'all' && record.taxYear !== selectedYear) {
        return false;
      }
      // Account Filter
      if (selectedAccountFilter !== 'all' && record.relatedAccountId !== selectedAccountFilter) {
        return false;
      }
      // Type Filter
      if (selectedTypeFilter !== 'all' && record.taxType !== selectedTypeFilter) {
        return false;
      }
      // Status Filter
      if (selectedStatusFilter !== 'all' && record.status !== selectedStatusFilter) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = record.referenceNumber.toLowerCase().includes(q);
        const matchesPayRef = record.paymentReference.toLowerCase().includes(q);
        const matchesDesc = record.description.toLowerCase().includes(q);
        const matchesType = record.taxType.toLowerCase().includes(q);
        if (!matchesRef && !matchesPayRef && !matchesDesc && !matchesType) {
          return false;
        }
      }
      return true;
    });
  }, [taxRecords, selectedYear, selectedAccountFilter, selectedTypeFilter, selectedStatusFilter, searchQuery]);

  // Handle Tax Payment Execution
  const handleExecuteTaxPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    const amountNum = parseFloat(taxPaymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setPaymentError('Please enter a valid, positive tax payment amount.');
      return;
    }

    if (activeFundingAccount && amountNum > activeFundingAccount.availableBalance) {
      setPaymentError(`Insufficient available funds in ${activeFundingAccount.name}. Available balance: $${activeFundingAccount.availableBalance.toLocaleString()}`);
      return;
    }

    setIsProcessingPayment(true);

    // Simulate backend verification lifecycle: Initiated -> Pending -> Verified
    setTimeout(() => {
      const generatedRef = `EFTPS-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const newTaxRecord: TaxTransactionRecord = {
        id: `tx-tax-${Date.now()}`,
        referenceNumber: generatedRef,
        date: new Date().toISOString().slice(0, 10),
        taxYear: taxPaymentYear,
        taxType: taxPaymentType as any,
        taxableAmount: amountNum * 2.8,
        taxAmount: amountNum,
        status: 'Completed',
        relatedAccountId: activeFundingAccount?.id || 'acc_1',
        relatedAccountName: `${activeFundingAccount?.name || 'Private Checking'} (•••${activeFundingAccount?.accountNumber.slice(-4) || '2741'})`,
        paymentReference: `EFTPS-FED-${Math.floor(1000000 + Math.random() * 9000000)}-US`,
        description: `Official ${taxPaymentType} Payment (${taxPaymentPeriod} ${taxPaymentYear}) Authorized via Direct Treasury Clearing Protocol`
      };

      // Add to tax records ledger
      setTaxRecords(prev => [newTaxRecord, ...prev]);
      setIsProcessingPayment(false);
      setPaymentSuccessReceipt(newTaxRecord);
    }, 1200);
  };

  const handleOpenDocModal = (type: 'tax_1099_int' | 'tax_1099_b') => {
    setStatementTaxModalType(type);
    setIsStatementTaxModalOpen(true);
  };

  return (
    <div className="space-y-5 sm:space-y-6 text-[#20242A]">
      {/* =========================================================================
          1. TAX SECTION HEADER & OVERVIEW BANNER
         ========================================================================= */}
      <div className="bg-white rounded-xl border border-[#D8DEE8] p-4 sm:p-5 md:p-6 shadow-xs hover:border-[#C4CBD6] transition-all space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#147A52]/10 text-[#147A52] border border-[#147A52]/20 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#147A52] stroke-[2.25]" />
                <span>IRS EFTPS &amp; CA FTB DIRECT CLEARING ACTIVE</span>
              </span>
              <span className="text-xs text-[#5F6670] font-mono">
                Taxpayer ID: <strong className="text-[#0B1F6A]">{currentUser?.taxIdMasked || '•••-••-7724'}</strong> (W-9 Certified)
              </span>
              {/* Decoupled Tax Filing Deadline & Documentation Alert Badge */}
              <TaxDeadlineNotificationBadge
                onActionClick={(actionType) => {
                  if (actionType === 'pay_tax') {
                    setIsPayTaxModalOpen(true);
                  } else {
                    handleOpenDocModal('tax_1099_int');
                  }
                }}
              />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#0B1F6A] tracking-tight flex items-center gap-2.5">
                <FileCheck className="w-6 h-6 text-[#0B1F6A]" />
                <span>Tax &amp; Regulatory Filing Center</span>
              </h2>
              <p className="text-xs text-[#5F6670] font-medium mt-0.5 max-w-2xl">
                Official depository withholding records, Form 1099 statements, certified Schedule K-1 allocations, and authorized federal/state tax payment settlement.
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              aria-label="Pay Federal or State Tax via EFTPS Clearing"
              onClick={() => {
                setPaymentSuccessReceipt(null);
                setPaymentError(null);
                setIsPayTaxModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-lg bg-[#0B1F6A] hover:bg-[#081552] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Pay Federal / State Tax</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              aria-label="View Form 1099-INT Tax Statement"
              onClick={() => handleOpenDocModal('tax_1099_int')}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-[#F5F7FA] text-[#0B1F6A] border border-[#D8DEE8] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-[#0B1F6A]" />
              <span>Form 1099-INT</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              aria-label="Open Full Tax Archive and Filings Center"
              onClick={() => navigateTo('/tax')}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-[#F5F7FA] text-[#0B1F6A] border border-[#D8DEE8] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#5F6670]" />
              <span>Full Tax Vault &rarr;</span>
            </motion.button>
          </div>
        </div>

        {/* Year Filter Tabs */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#D8DEE8] flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-[#5F6670] mr-1.5">Tax Year:</span>
            {['2025', '2026', '2024', '2023', 'all'].map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-[#0B1F6A] text-white shadow-2xs'
                    : 'bg-[#F5F7FA] text-[#5F6670] hover:text-[#0B1F6A] hover:bg-slate-200'
                }`}
              >
                {yr === 'all' ? 'All Years' : yr === '2026' ? '2026 (Est.)' : `${yr} (Final)`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] text-[#5F6670] font-medium">Filing Status:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#147A52]/10 text-[#147A52] border border-[#147A52]/20">
              <CheckCircle2 className="w-3 h-3" />
              <span>{overviewMetrics.taxStatus}</span>
            </span>
          </div>
        </div>

        {/* =========================================================================
            2. TAX OVERVIEW 4-METRIC KEY CARDS
           ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-1">
          <div className="p-3.5 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8]">
            <div className="flex items-center justify-between text-[#5F6670] text-[11px] font-semibold mb-1">
              <span>Gross Taxable Income</span>
              <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-[#D8DEE8]">1099-INT/DIV</span>
            </div>
            <div className="font-mono font-bold text-base sm:text-lg text-[#0B1F6A]">
              ${overviewMetrics.taxableIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-[#5F6670] mt-0.5 block">Depository APY &amp; Dividends</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8]">
            <div className="flex items-center justify-between text-[#5F6670] text-[11px] font-semibold mb-1">
              <span>Tax Already Withheld</span>
              <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-[#D8DEE8]">Fed &amp; CA</span>
            </div>
            <div className="font-mono font-bold text-base sm:text-lg text-rose-700">
              ${overviewMetrics.taxWithheld.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-[#5F6670] mt-0.5 block">Official IRS Remittance</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8]">
            <div className="flex items-center justify-between text-[#5F6670] text-[11px] font-semibold mb-1">
              <span>Tax Payments Made</span>
              <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-[#D8DEE8]">EFTPS Cleared</span>
            </div>
            <div className="font-mono font-bold text-base sm:text-lg text-[#147A52]">
              ${overviewMetrics.taxPaymentsMade.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-[#5F6670] mt-0.5 block">Estimated Payments Cleared</span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8]">
            <div className="flex items-center justify-between text-[#5F6670] text-[11px] font-semibold mb-1">
              <span>Pending Obligations</span>
              <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-[#D8DEE8]">Current</span>
            </div>
            <div className="font-mono font-bold text-base sm:text-lg text-[#20242A]">
              ${overviewMetrics.pendingObligations.toFixed(2)}
            </div>
            <span className="text-[10px] text-[#147A52] font-semibold mt-0.5 block">✓ In Good Standing</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. SEARCHABLE & FILTERABLE TAX LEDGER
         ========================================================================= */}
      <div className="bg-white rounded-xl border border-[#D8DEE8] p-4 sm:p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0B1F6A] flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#0B1F6A]" />
              <span>Tax Transactions &amp; Clearing Ledger</span>
            </h3>
            <p className="text-xs text-[#5F6670] font-medium mt-0.5">
              Verified record of statutory withholdings, quarterly estimated tax settlements, and official payment references.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-[#5F6670]">
            Showing {filteredTaxRecords.length} of {taxRecords.length} records
          </span>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#5F6670] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference # or tax type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-[#D8DEE8] rounded-lg bg-[#F5F7FA] text-[#20242A] focus:bg-white focus:border-[#0B1F6A] focus:outline-none"
            />
          </div>

          {/* Account Filter */}
          <select
            value={selectedAccountFilter}
            onChange={(e) => setSelectedAccountFilter(e.target.value)}
            className="w-full p-2 border border-[#D8DEE8] rounded-lg bg-[#F5F7FA] text-[#20242A] font-medium focus:bg-white focus:border-[#0B1F6A] focus:outline-none"
          >
            <option value="all">All Related Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} (•••{a.accountNumber.slice(-4)})
              </option>
            ))}
          </select>

          {/* Tax Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="w-full p-2 border border-[#D8DEE8] rounded-lg bg-[#F5F7FA] text-[#20242A] font-medium focus:bg-white focus:border-[#0B1F6A] focus:outline-none"
          >
            <option value="all">All Tax Types</option>
            <option value="IRS 1040-ES Estimated">IRS 1040-ES Estimated</option>
            <option value="Form 1099-INT Withholding">Form 1099-INT Withholding</option>
            <option value="Form 1099-DIV Dividend Tax">Form 1099-DIV Dividend Tax</option>
            <option value="1099-B Capital Gains Withholding">1099-B Capital Gains Withholding</option>
            <option value="CA FTB 540-ES State">CA FTB 540-ES State</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full p-2 border border-[#D8DEE8] rounded-lg bg-[#F5F7FA] text-[#20242A] font-medium focus:bg-white focus:border-[#0B1F6A] focus:outline-none"
          >
            <option value="all">All Settlement Statuses</option>
            <option value="Completed">Completed / Cleared</option>
            <option value="Verified">Verified &amp; Certified</option>
            <option value="Pending Clearing">Pending Clearing</option>
          </select>
        </div>

        {/* Tax Ledger Table */}
        <div className="overflow-x-auto border border-[#D8DEE8] rounded-lg">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F5F7FA] text-[#5F6670] border-b border-[#D8DEE8] font-bold text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Transaction / Ref</th>
                <th className="py-2.5 px-3">Tax Type</th>
                <th className="py-2.5 px-3">Related Account</th>
                <th className="py-2.5 px-3 text-right">Taxable Amount</th>
                <th className="py-2.5 px-3 text-right">Tax Paid / Withheld</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DEE8]">
              {filteredTaxRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#5F6670]">
                    <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                    <p className="font-semibold">No tax transaction records found matching your filters.</p>
                  </td>
                </tr>
              ) : (
                filteredTaxRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono text-[#5F6670] whitespace-nowrap">
                      {record.date}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#0B1F6A] whitespace-nowrap">
                      {record.referenceNumber}
                      <span className="block text-[10px] font-normal text-[#5F6670]">
                        {record.paymentReference}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#20242A]">
                      {record.taxType}
                      <span className="block text-[10px] text-[#5F6670] font-normal truncate max-w-[220px]">
                        {record.description}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#5F6670] whitespace-nowrap">
                      {record.relatedAccountName}
                    </td>
                    <td className="py-3 px-3 font-mono text-right text-[#5F6670] whitespace-nowrap">
                      ${record.taxableAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-right text-[#0B1F6A] whitespace-nowrap">
                      ${record.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        record.status === 'Completed'
                          ? 'bg-[#147A52]/10 text-[#147A52] border border-[#147A52]/20'
                          : record.status === 'Verified'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {record.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        aria-label={`View tax payment receipt for ${record.referenceNumber}`}
                        onClick={() => setViewingReceipt(record)}
                        className="p-1 rounded text-[#0B1F6A] hover:bg-slate-200 transition-colors cursor-pointer"
                        title="View Official Receipt"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          4. TAX DOCUMENTS & OFFICIAL STATEMENTS CARD
         ========================================================================= */}
      <div className="bg-white rounded-xl border border-[#D8DEE8] p-4 sm:p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0B1F6A] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0B1F6A]" />
              <span>Certified Tax Documents &amp; Withholding Statements</span>
            </h3>
            <p className="text-xs text-[#5F6670] font-medium mt-0.5">
              Download certified annual IRS Form 1099 packages, Schedule K-1 trust reports, and official filing slips.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('/documents')}
            className="text-xs font-semibold text-[#0B1F6A] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
          >
            All Banking Documents Archive &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs">
          {/* Doc 1: Form 1099-INT */}
          <div className="p-4 rounded-xl border border-[#D8DEE8] bg-[#F5F7FA] hover:border-[#0B1F6A] transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-white font-mono font-bold text-[10px] text-[#0B1F6A] border border-[#D8DEE8]">
                IRS Form 1099-INT
              </span>
              <span className="text-[10px] font-mono text-[#147A52] font-bold">Certified Final</span>
            </div>
            <div>
              <h4 className="font-bold text-[#20242A] text-sm">Interest Income Statement ({selectedYear === 'all' ? '2025' : selectedYear})</h4>
              <p className="text-[11px] text-[#5F6670] mt-0.5">Comprehensive interest yield earned across checking and custodial accounts.</p>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-[#D8DEE8]">
              <button
                type="button"
                onClick={() => handleOpenDocModal('tax_1099_int')}
                className="text-xs font-semibold text-[#0B1F6A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> View Statement
              </button>
              <button
                type="button"
                onClick={() => handleOpenDocModal('tax_1099_int')}
                className="p-1 rounded text-[#0B1F6A] hover:bg-slate-200 transition-colors cursor-pointer"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Doc 2: Form 1099-B */}
          <div className="p-4 rounded-xl border border-[#D8DEE8] bg-[#F5F7FA] hover:border-[#0B1F6A] transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-white font-mono font-bold text-[10px] text-[#0B1F6A] border border-[#D8DEE8]">
                IRS Form 1099-B
              </span>
              <span className="text-[10px] font-mono text-[#147A52] font-bold">Certified Final</span>
            </div>
            <div>
              <h4 className="font-bold text-[#20242A] text-sm">Brokerage &amp; Proceeds Statement</h4>
              <p className="text-[11px] text-[#5F6670] mt-0.5">Capital transactions, treasury liquidations, and statutory cost basis records.</p>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-[#D8DEE8]">
              <button
                type="button"
                onClick={() => handleOpenDocModal('tax_1099_b')}
                className="text-xs font-semibold text-[#0B1F6A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> View Statement
              </button>
              <button
                type="button"
                onClick={() => handleOpenDocModal('tax_1099_b')}
                className="p-1 rounded text-[#0B1F6A] hover:bg-slate-200 transition-colors cursor-pointer"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Doc 3: Annual Tax Summary */}
          <div className="p-4 rounded-xl border border-[#D8DEE8] bg-[#F5F7FA] hover:border-[#0B1F6A] transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded bg-white font-mono font-bold text-[10px] text-[#0B1F6A] border border-[#D8DEE8]">
                Consolidated Package
              </span>
              <span className="text-[10px] font-mono text-[#147A52] font-bold">IRS &amp; CA FTB</span>
            </div>
            <div>
              <h4 className="font-bold text-[#20242A] text-sm">Consolidated Tax Bundle ({selectedYear === 'all' ? '2025' : selectedYear})</h4>
              <p className="text-[11px] text-[#5F6670] mt-0.5">Encrypted master archive containing all 1099s, K-1 schedules, and clearing receipts.</p>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-[#D8DEE8]">
              <button
                type="button"
                onClick={() => handleOpenDocModal('tax_1099_int')}
                className="text-xs font-semibold text-[#0B1F6A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> Inspect Package
              </button>
              <button
                type="button"
                onClick={() => handleOpenDocModal('tax_1099_int')}
                className="p-1 rounded text-[#0B1F6A] hover:bg-slate-200 transition-colors cursor-pointer"
                title="Download Bundle"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: PAY TAX (EFTPS DIRECT TREASURY CLEARING)
         ========================================================================= */}
      <AnimatePresence>
        {isPayTaxModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-xl max-w-lg w-full border border-[#D8DEE8] p-5 sm:p-6 space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE8]">
                <div className="flex items-center gap-2 text-[#0B1F6A] font-bold text-base sm:text-lg">
                  <DollarSign className="w-5 h-5 text-[#0B1F6A]" />
                  <span>Federal &amp; State Tax Settlement (EFTPS)</span>
                </div>
                <button
                  type="button"
                  aria-label="Close tax payment dialog"
                  onClick={() => setIsPayTaxModalOpen(false)}
                  className="text-[#5F6670] hover:text-[#20242A] p-1.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {paymentSuccessReceipt ? (
                <div className="space-y-4 text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#147A52] border border-emerald-300 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#0B1F6A]">Tax Payment Successfully Cleared</h4>
                    <p className="text-xs text-[#5F6670] mt-0.5">
                      Treasury transaction reference: <strong className="font-mono text-[#0B1F6A]">{paymentSuccessReceipt.referenceNumber}</strong>
                    </p>
                  </div>

                  <div className="p-3 bg-[#F5F7FA] border border-[#D8DEE8] rounded-lg text-left font-mono space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[#5F6670]">Tax Obligation Type:</span>
                      <span className="font-bold text-[#20242A]">{paymentSuccessReceipt.taxType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5F6670]">Amount Debited:</span>
                      <span className="font-bold text-[#147A52]">${paymentSuccessReceipt.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5F6670]">Direct Fedwire Transit Fee:</span>
                      <span className="font-bold text-[#147A52]">$0.00 (Waived)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#5F6670]">EFTPS Confirmation ID:</span>
                      <span className="font-bold text-[#0B1F6A]">{paymentSuccessReceipt.paymentReference}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setViewingReceipt(paymentSuccessReceipt)}
                      className="px-4 py-2 rounded-lg bg-[#0B1F6A] text-white font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> View Official Receipt
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPayTaxModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-white border border-[#D8DEE8] text-[#20242A] font-semibold cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleExecuteTaxPayment} className="space-y-3.5">
                  {paymentError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  <div>
                    <label className="font-bold text-xs text-[#0B1F6A] block mb-1">Tax Obligation Type</label>
                    <select
                      value={taxPaymentType}
                      onChange={(e) => setTaxPaymentType(e.target.value)}
                      className="w-full p-2.5 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-semibold focus:border-[#0B1F6A] focus:outline-none"
                    >
                      <option value="IRS 1040-ES Estimated">U.S. Federal Form 1040-ES (Quarterly Estimated Tax)</option>
                      <option value="CA FTB 540-ES State">California FTB Form 540-ES (State Estimated Tax)</option>
                      <option value="IRS Form 1040 Balance Due">IRS Form 1040 Balance Due Settlement</option>
                      <option value="Corporate Franchise Tax">State Corporate Franchise &amp; Depository Tax</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-xs text-[#0B1F6A] block mb-1">Tax Year</label>
                      <select
                        value={taxPaymentYear}
                        onChange={(e) => setTaxPaymentYear(e.target.value)}
                        className="w-full p-2.5 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-semibold focus:border-[#0B1F6A] focus:outline-none"
                      >
                        <option value="2026">2026 Tax Year</option>
                        <option value="2025">2025 Tax Year</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-xs text-[#0B1F6A] block mb-1">Period</label>
                      <select
                        value={taxPaymentPeriod}
                        onChange={(e) => setTaxPaymentPeriod(e.target.value)}
                        className="w-full p-2.5 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-semibold focus:border-[#0B1F6A] focus:outline-none"
                      >
                        <option value="Q3 Estimated">Q3 Estimated (Sept 15)</option>
                        <option value="Q4 Estimated">Q4 Estimated (Jan 15)</option>
                        <option value="Q1 Estimated">Q1 Estimated (Apr 15)</option>
                        <option value="Q2 Estimated">Q2 Estimated (Jun 15)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-xs text-[#0B1F6A] block mb-1">Debit From Account</label>
                    <select
                      value={taxPaymentAccountId}
                      onChange={(e) => setTaxPaymentAccountId(e.target.value)}
                      className="w-full p-2.5 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-semibold focus:border-[#0B1F6A] focus:outline-none"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} — ${a.availableBalance.toLocaleString()} available
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-xs text-[#0B1F6A] block mb-1">Payment Amount (USD)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#5F6670]">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        value={taxPaymentAmount}
                        onChange={(e) => setTaxPaymentAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 border border-[#D8DEE8] rounded-md text-xs font-mono font-bold bg-white text-[#20242A] focus:border-[#0B1F6A] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Fee Breakdown */}
                  <div className="p-3 bg-[#F5F7FA] border border-[#D8DEE8] rounded-lg text-xs space-y-1">
                    <div className="flex justify-between text-[#5F6670]">
                      <span>EFTPS Direct Transit Fee:</span>
                      <span className="font-bold text-[#147A52]">$0.00 (Complimentary)</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#0B1F6A] pt-1 border-t border-[#D8DEE8]">
                      <span>Total Debit:</span>
                      <span className="font-mono">${(parseFloat(taxPaymentAmount) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsPayTaxModalOpen(false)}
                      className="px-4 py-2 rounded-md bg-white hover:bg-slate-50 border border-[#D8DEE8] text-[#20242A] font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isProcessingPayment}
                      className="px-4.5 py-2 rounded-md bg-[#0B1F6A] hover:bg-[#081552] text-white font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          <span>Verifying Clearing...</span>
                        </>
                      ) : (
                        <span>Authorize Tax Payment</span>
                      )}
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 2: OFFICIAL TAX PAYMENT RECEIPT VIEW
         ========================================================================= */}
      <AnimatePresence>
        {viewingReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl max-w-md w-full border border-[#D8DEE8] p-6 space-y-4 shadow-2xl text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE8]">
                <div className="flex items-center gap-2 text-[#0B1F6A] font-bold text-base">
                  <Receipt className="w-5 h-5" />
                  <span>Official Tax Remittance Receipt</span>
                </div>
                <button
                  type="button"
                  aria-label="Close receipt dialog"
                  onClick={() => setViewingReceipt(null)}
                  className="text-[#5F6670] hover:text-[#20242A] p-1.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 font-mono text-[11px] p-4 bg-[#F5F7FA] border border-[#D8DEE8] rounded-lg">
                <div className="flex justify-between pb-2 border-b border-[#D8DEE8]">
                  <span className="text-[#5F6670]">Receipt Reference:</span>
                  <span className="font-bold text-[#0B1F6A]">{viewingReceipt.referenceNumber}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#D8DEE8]">
                  <span className="text-[#5F6670]">Treasury / EFTPS Confirmation:</span>
                  <span className="font-bold text-[#20242A]">{viewingReceipt.paymentReference}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#D8DEE8]">
                  <span className="text-[#5F6670]">Tax Type:</span>
                  <span className="font-bold text-[#20242A]">{viewingReceipt.taxType}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#D8DEE8]">
                  <span className="text-[#5F6670]">Settlement Date:</span>
                  <span className="font-bold text-[#20242A]">{viewingReceipt.date}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#D8DEE8]">
                  <span className="text-[#5F6670]">Related Account:</span>
                  <span className="font-bold text-[#20242A]">{viewingReceipt.relatedAccountName}</span>
                </div>
                <div className="flex justify-between text-xs pt-1 font-bold">
                  <span className="text-[#0B1F6A]">Total Settled Amount:</span>
                  <span className="text-[#147A52]">${viewingReceipt.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-md bg-white border border-[#D8DEE8] hover:bg-slate-50 text-[#20242A] font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setViewingReceipt(null)}
                  className="px-4 py-2 rounded-md bg-[#0B1F6A] text-white font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Statement Tax Modal Hook */}
      <StatementTaxModal
        isOpen={isStatementTaxModalOpen}
        onClose={() => setIsStatementTaxModalOpen(false)}
        initialType={statementTaxModalType}
      />
    </div>
  );
};
