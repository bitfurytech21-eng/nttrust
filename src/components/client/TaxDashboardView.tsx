import React, { useState, useMemo } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  FileText,
  Download,
  Eye,
  ShieldCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  Send,
  Building2,
  Lock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  Layers,
  Award,
  Check
} from 'lucide-react';
import { BankDocument } from '../../types/banking';
import { StatementTaxModal } from './StatementTaxModal';
import { ExportPrintSecurityModal } from '../common/ExportPrintSecurityModal';
import { IrsLogo } from '../common/IrsLogo';
import { TaxDeadlineNotificationBadge } from './TaxDeadlineNotificationBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

type TaxYear = '2025' | '2024' | '2023' | '2026_q1' | 'all';
type TaxCategory = 'all' | '1099' | 'k1' | '1042s' | 'packages' | 'fbar';

export const TaxDashboardView: React.FC = () => {
  const { currentUser, documents, accounts } = useBanking();
  const [selectedYear, setSelectedYear] = useState<TaxYear>('2025');
  const [selectedCategory, setSelectedCategory] = useState<TaxCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [modalType, setModalType] = useState<'statement' | 'tax_1099_int' | 'tax_1099_b' | 'proof_of_funds'>('tax_1099_int');
  const [modalYear, setModalYear] = useState<string>('2025');
  const [cpaSentSuccess, setCpaSentSuccess] = useState(false);
  const [isSendingToCpa, setIsSendingToCpa] = useState(false);

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

  // Filter only tax-related documents
  const taxDocuments = useMemo(() => {
    return documents.filter(d => 
      d.category === 'tax' || 
      d.type === 'tax' || 
      d.title.toLowerCase().includes('tax') || 
      d.title.toLowerCase().includes('1099') || 
      d.title.toLowerCase().includes('k-1') || 
      d.title.toLowerCase().includes('1042') ||
      d.title.toLowerCase().includes('fbar')
    );
  }, [documents]);

  // Filtered by year and category and search
  const filteredTaxDocs = useMemo(() => {
    return taxDocuments.filter(doc => {
      // Year filter
      let matchesYear = true;
      if (selectedYear === '2025') {
        matchesYear = doc.period?.includes('2025') || doc.title.includes('2025') || doc.date.startsWith('2026-01') || doc.date.startsWith('2026-02');
      } else if (selectedYear === '2024') {
        matchesYear = doc.period?.includes('2024') || doc.title.includes('2024') || doc.date.startsWith('2025');
      } else if (selectedYear === '2023') {
        matchesYear = doc.period?.includes('2023') || doc.title.includes('2023') || doc.date.startsWith('2024');
      } else if (selectedYear === '2026_q1') {
        matchesYear = doc.period?.includes('2026') || doc.title.includes('2026');
      }

      // Category filter
      let matchesCategory = true;
      const titleLower = doc.title.toLowerCase();
      if (selectedCategory === '1099') {
        matchesCategory = titleLower.includes('1099');
      } else if (selectedCategory === 'k1') {
        matchesCategory = titleLower.includes('k-1');
      } else if (selectedCategory === '1042s') {
        matchesCategory = titleLower.includes('1042');
      } else if (selectedCategory === 'packages') {
        matchesCategory = titleLower.includes('package') || titleLower.includes('consolidated');
      } else if (selectedCategory === 'fbar') {
        matchesCategory = titleLower.includes('fbar') || titleLower.includes('fincen');
      }

      // Search filter
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        matchesSearch = doc.title.toLowerCase().includes(q) || (doc.period?.toLowerCase().includes(q) ?? false);
      }

      return matchesYear && matchesCategory && matchesSearch;
    });
  }, [taxDocuments, selectedYear, selectedCategory, searchQuery]);

  // Annual Summary Metrics by Tax Year
  const annualMetrics = useMemo(() => {
    switch (selectedYear) {
      case '2025':
        return {
          year: '2025',
          status: 'Final / IRS Certified',
          interestIncome: 981540.25,
          dividends: 512400.00,
          brokerageProceeds: 640000.00,
          k1Allocations: 1450000.00,
          foreignTaxCredit: 75200.00,
          withheldFederal: 392616.10,
          withheldState: 127590.20,
          fbarStatus: 'Filed & Certified (FinCEN)',
          primaryFiling: 'IRS Form 1040 / CA Form 540'
        };
      case '2024':
        return {
          year: '2024',
          status: 'Final / IRS Certified',
          interestIncome: 894220.10,
          dividends: 468900.00,
          brokerageProceeds: 520000.00,
          k1Allocations: 1280000.00,
          foreignTaxCredit: 68400.00,
          withheldFederal: 357688.04,
          withheldState: 116248.60,
          fbarStatus: 'Filed & Certified (FinCEN)',
          primaryFiling: 'IRS Form 1040 / CA Form 540'
        };
      case '2023':
        return {
          year: '2023',
          status: 'Final / IRS Certified',
          interestIncome: 742880.50,
          dividends: 395000.00,
          brokerageProceeds: 410000.00,
          k1Allocations: 1150000.00,
          foreignTaxCredit: 54100.00,
          withheldFederal: 297152.20,
          withheldState: 96574.46,
          fbarStatus: 'Filed & Certified (FinCEN)',
          primaryFiling: 'IRS Form 1040 / CA Form 540'
        };
      case '2026_q1':
        return {
          year: '2026 Q1-Q3',
          status: 'Provisional / In-Progress',
          interestIncome: 240634.37,
          dividends: 420000.00,
          brokerageProceeds: 0.00,
          k1Allocations: 350000.00,
          foreignTaxCredit: 18500.00,
          withheldFederal: 96253.75,
          withheldState: 31282.47,
          fbarStatus: 'Q1-Q3 Active Tracking',
          primaryFiling: 'IRS Form 1040-ES (Quarterly)'
        };
      default:
        return {
          year: '3-Year Total (2023–2025)',
          status: 'Consolidated Audit Ledger',
          interestIncome: 2618640.85,
          dividends: 1376300.00,
          brokerageProceeds: 1570000.00,
          k1Allocations: 3880000.00,
          foreignTaxCredit: 197700.00,
          withheldFederal: 1047456.34,
          withheldState: 340413.26,
          fbarStatus: '100% Fully Compliant',
          primaryFiling: 'IRS Individual & Trust Sovereign'
        };
    }
  }, [selectedYear]);

  // 3-Year Comparative Tax Payments Data for Recharts Bar Chart (Current and Previous 2 Years)
  const taxPaymentsChartData = useMemo(() => [
    {
      year: '2024',
      periodLabel: '2024 Tax Year',
      federalPayments: 357688,
      statePayments: 116248,
      statutoryWithholdings: 473936,
      total: 947872
    },
    {
      year: '2025',
      periodLabel: '2025 (Final)',
      federalPayments: 420000,
      statePayments: 127590,
      statutoryWithholdings: 520206,
      total: 1067796
    },
    {
      year: '2026',
      periodLabel: '2026 (YTD Est.)',
      federalPayments: 116500,
      statePayments: 21500,
      statutoryWithholdings: 127536,
      total: 265536
    }
  ], []);

  const handleOpenDocModal = (doc: BankDocument) => {
    const titleLower = doc.title.toLowerCase();
    if (titleLower.includes('1099-b')) {
      setModalType('tax_1099_b');
    } else if (titleLower.includes('1099') || titleLower.includes('tax')) {
      setModalType('tax_1099_int');
    } else if (titleLower.includes('custody') || titleLower.includes('proof')) {
      setModalType('proof_of_funds');
    } else {
      setModalType('statement');
    }

    if (doc.period?.includes('2024') || doc.title.includes('2024')) {
      setModalYear('2024');
    } else if (doc.period?.includes('2023') || doc.title.includes('2023')) {
      setModalYear('2023');
    } else {
      setModalYear('2025');
    }

    setShowTaxModal(true);
  };

  const handleTransmitToCPA = () => {
    setIsSendingToCpa(true);
    setTimeout(() => {
      setIsSendingToCpa(false);
      setCpaSentSuccess(true);
      setTimeout(() => setCpaSentSuccess(false), 5000);
    }, 800);
  };

  const handleDownloadAllYearBundle = () => {
    triggerProtectedAction(() => {
      const filename = `Tax_Year_Certified_Bundle_${selectedYear === 'all' ? '2023_2025' : selectedYear}.zip`;
      const taxPackageBlob = new Blob([`Northern Trust Certified Tax Filing Package - Client: Account Holder (${annualMetrics.year})`], { type: 'text/plain' });
      const url = URL.createObjectURL(taxPackageBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'Download Annual Certified Tax Package Bundle', 'download');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* 1. Header Banner with Official IRS Logo & Compliance Seal */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <IrsLogo variant="horizontal" size="sm" />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#147A52]/10 border border-emerald-300 text-[#147A52] text-xs font-black shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-[#147A52] stroke-[2.25]" /> Verified IRS e-File Transmission Vault
            </div>
            {/* Decoupled Tax Filing Deadline & Documentation Alert Badge */}
            <TaxDeadlineNotificationBadge
              onActionClick={(actionType) => {
                if (actionType === 'view_form' || actionType === 'upload_w9') {
                  setModalType('tax_1099_int');
                  setShowTaxModal(true);
                }
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-[#0B1F6A]">
              Certified Tax Statements &amp; IRS Filings
            </h1>
            <p className="text-xs text-[#5F6670] mt-1 font-medium max-w-2xl">
              Access certified Form 1099 statements (Interest, Dividends, Brokerage), Schedule K-1 trust allocations, Form 1042-S foreign treaty relief, and dispatch tax packages directly to your CPA.
            </p>
          </div>
        </div>

        {/* Action Buttons & Treasury Seal */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
          <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl">
            <IrsLogo variant="seal" size="sm" />
            <div className="text-[10px] leading-tight">
              <span className="font-bold text-[#0B1F6A] block">U.S. TREASURY</span>
              <span className="text-slate-500 font-mono">IRS-VERIFIED</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadAllYearBundle}
            className="px-4 py-2.5 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.25]" />
            <span>Download Annual Bundle ({selectedYear === 'all' ? 'All' : selectedYear})</span>
          </button>

          <button
            type="button"
            onClick={handleTransmitToCPA}
            disabled={isSendingToCpa}
            className="px-4 py-2.5 rounded-xl bg-[#147A52] hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            {isSendingToCpa ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4 stroke-[2.25]" />
            )}
            <span>Transmit to CPA (PwC Wealth)</span>
          </button>
        </div>
      </div>

      {/* CPA Transmit Notification Alert */}
      {cpaSentSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-[#147A52] text-xs flex items-center justify-between gap-3 animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#147A52] shrink-0" />
            <div>
              <span className="font-bold block text-sm">Tax Package Securely Transmitted</span>
              <span>Encrypted PDF package dispatched to PricewaterhouseCoopers (PwC) Private Wealth Advisory Team.</span>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold bg-white px-2.5 py-1 rounded border border-emerald-200">
            REF #TAX-PWC-2026-0924
          </span>
        </div>
      )}

      {/* 2. Client Tax Profile Info Strip */}
      <div className="bg-white rounded-xl border border-[#D8DEE8] p-4 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
        <div>
          <span className="text-[11px] text-[#5F6670] block font-medium">Primary Taxpayer</span>
          <span className="font-bold text-[#20242A] text-sm block">{currentUser?.fullName || 'Alexander Vance Wright'}</span>
          <span className="text-[10px] text-gray-500 font-mono">CIF #{currentUser?.clientId || 'NT-8820-CLIENT'}</span>
        </div>
        <div>
          <span className="text-[11px] text-[#5F6670] block font-medium">Taxpayer ID (SSN/TIN)</span>
          <span className="font-mono font-bold text-[#0B1F6A] text-sm block">{currentUser?.taxIdMasked || '•••-••-7724'}</span>
          <span className="text-[10px] text-emerald-700 font-semibold">Form W-9 Verified</span>
        </div>
        <div>
          <span className="text-[11px] text-[#5F6670] block font-medium">Primary Tax Jurisdiction</span>
          <span className="font-bold text-[#20242A] text-sm block">United States (CA)</span>
          <span className="text-[10px] text-gray-500">2620 Los Feliz Blvd, Los Angeles</span>
        </div>
        <div>
          <span className="text-[11px] text-[#5F6670] block font-medium">Designated Tax Advisor</span>
          <span className="font-bold text-[#20242A] text-sm block">PwC Private Client</span>
          <span className="text-[10px] text-[#147A52] font-semibold">Direct API Transmit Enabled</span>
        </div>
      </div>

      {/* 3. Tax Year Switcher Navigation Bar */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Calendar className="w-4 h-4 text-[#147A52] stroke-[2.25] mr-1 shrink-0" />
          <span className="text-xs font-bold text-[#5F6670] mr-1 shrink-0">Filing Year:</span>
          
          <button
            type="button"
            onClick={() => setSelectedYear('2025')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 shrink-0 ${
              selectedYear === '2025'
                ? 'bg-[#0B1F6A] text-white border-[#0B1F6A] shadow-xs'
                : 'bg-[#F5F7FA] text-[#20242A] border-[#D8DEE8] hover:bg-slate-200'
            }`}
          >
            2025 Tax Year (Final)
          </button>

          <button
            type="button"
            onClick={() => setSelectedYear('2024')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 shrink-0 ${
              selectedYear === '2024'
                ? 'bg-[#0B1F6A] text-white border-[#0B1F6A] shadow-xs'
                : 'bg-[#F5F7FA] text-[#20242A] border-[#D8DEE8] hover:bg-slate-200'
            }`}
          >
            2024 Tax Year
          </button>

          <button
            type="button"
            onClick={() => setSelectedYear('2023')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 shrink-0 ${
              selectedYear === '2023'
                ? 'bg-[#0B1F6A] text-white border-[#0B1F6A] shadow-xs'
                : 'bg-[#F5F7FA] text-[#20242A] border-[#D8DEE8] hover:bg-slate-200'
            }`}
          >
            2023 Tax Year
          </button>

          <button
            type="button"
            onClick={() => setSelectedYear('2026_q1')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 shrink-0 ${
              selectedYear === '2026_q1'
                ? 'bg-[#147A52] text-white border-emerald-600 shadow-xs'
                : 'bg-[#F5F7FA] text-[#20242A] border-[#D8DEE8] hover:bg-slate-200'
            }`}
          >
            2026 Q1-Q3 Estimated
          </button>

          <button
            type="button"
            onClick={() => setSelectedYear('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 shrink-0 ${
              selectedYear === 'all'
                ? 'bg-[#0B1F6A] text-white border-[#0B1F6A] shadow-xs'
                : 'bg-[#F5F7FA] text-[#20242A] border-[#D8DEE8] hover:bg-slate-200'
            }`}
          >
            3-Year Multi-Year Ledger
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          <span className="text-[11px] font-bold text-gray-500 uppercase font-sans">Status:</span>
          <span className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold">
            {annualMetrics.status}
          </span>
        </div>
      </div>

      {/* 4. Annual Financial & Tax Filing Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Interest Income */}
        <div className="bg-white rounded-xl border border-[#D8DEE8] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5F6670] mb-1 font-medium">
            <span>Interest Income</span>
            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">1099-INT</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-[#147A52]">
            ${annualMetrics.interestIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-[#5F6670] mt-1 block">Compounded APY Yield</span>
        </div>

        {/* Card 2: Dividends */}
        <div className="bg-white rounded-xl border border-[#D8DEE8] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5F6670] mb-1 font-medium">
            <span>Dividends &amp; Capital</span>
            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">1099-DIV</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-[#0B1F6A]">
            ${annualMetrics.dividends.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-[#5F6670] mt-1 block">Trust &amp; Sovereign Portfolios</span>
        </div>

        {/* Card 3: Brokerage Proceeds */}
        <div className="bg-white rounded-xl border border-[#D8DEE8] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5F6670] mb-1 font-medium">
            <span>Brokerage Proceeds</span>
            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">1099-B</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-[#20242A]">
            ${annualMetrics.brokerageProceeds.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-[#5F6670] mt-1 block">Gross Transaction Volume</span>
        </div>

        {/* Card 4: Trust Allocations */}
        <div className="bg-white rounded-xl border border-[#D8DEE8] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5F6670] mb-1 font-medium">
            <span>Trust Allocations</span>
            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">Sch K-1</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-[#20242A]">
            ${annualMetrics.k1Allocations.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-[#5F6670] mt-1 block">Fiduciary Sovereign Trust</span>
        </div>

        {/* Card 5: Federal Tax Withheld */}
        <div className="bg-white rounded-xl border border-[#D8DEE8] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5F6670] mb-1 font-medium">
            <span>Federal Withholdings</span>
            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">IRS 1040</span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-rose-700">
            ${annualMetrics.withheldFederal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-[#5F6670] mt-1 block">Directly Remitted to IRS</span>
        </div>

        {/* Card 6: FBAR & FinCEN Status */}
        <div className="bg-white rounded-xl border border-[#D8DEE8] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#5F6670] mb-1 font-medium">
            <span>FBAR Compliance</span>
            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">FinCEN 114</span>
          </div>
          <div className="text-sm font-bold text-emerald-800 flex items-center gap-1.5 mt-1">
            <CheckCircle2 className="w-4 h-4 text-[#147A52] shrink-0" />
            <span>Certified</span>
          </div>
          <span className="text-[10px] text-[#5F6670] mt-1.5 block">Swiss &amp; European Accounts</span>
        </div>
      </div>

      {/* =========================================================================
          4B. 3-YEAR COMPARATIVE TAX PAYMENTS VISUALIZATION (RECHARTS BAR CHART)
         ========================================================================= */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D8DEE8]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#0B1F6A]/10 text-[#0B1F6A] font-mono font-bold text-[10px] border border-[#0B1F6A]/20">
                IRS EFTPS &amp; CA FTB MULTI-YEAR AUDIT
              </span>
              <span className="text-xs font-mono text-[#5F6670]">3-Year Horizon (2024–2026)</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold font-serif text-[#0B1F6A] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#0B1F6A]" />
              <span>Comparative Annual Tax Settlement Ledger</span>
            </h3>
            <p className="text-xs text-[#5F6670] font-medium">
              Breakdown of Federal EFTPS 1040-ES payments, California State Franchise remittances, and 1099 statutory withholdings.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto bg-[#F5F7FA] p-2.5 rounded-xl border border-[#D8DEE8] text-xs">
            <div className="text-right">
              <span className="text-[10px] text-[#5F6670] block font-semibold">3-Year Settled Total</span>
              <span className="font-mono font-bold text-sm text-[#0B1F6A]">$2,281,204.00</span>
            </div>
            <div className="h-7 w-px bg-[#D8DEE8]" />
            <div className="text-right">
              <span className="text-[10px] text-[#5F6670] block font-semibold">Treasury Clearance</span>
              <span className="font-mono font-bold text-sm text-[#147A52]">100% On-Time</span>
            </div>
          </div>
        </div>

        {/* Small Responsive Recharts Bar Chart */}
        <div className="w-full h-64 sm:h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={taxPaymentsChartData}
              margin={{ top: 10, right: 15, left: 10, bottom: 5 }}
              barGap={6}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
                tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
                tick={{ fill: '#475569', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const total = payload.reduce((acc: number, entry: any) => acc + (Number(entry.value) || 0), 0);
                    return (
                      <div className="bg-white p-3 rounded-xl border border-[#D8DEE8] shadow-xl text-xs space-y-1.5 font-sans z-50">
                        <div className="font-bold text-[#0B1F6A] pb-1 border-b border-[#D8DEE8] flex items-center justify-between gap-4">
                          <span>{label} Tax Settlement</span>
                          <span className="font-mono text-[#147A52]">${total.toLocaleString('en-US')}</span>
                        </div>
                        {payload.map((entry: any, index: number) => (
                          <div key={`item-${index}`} className="flex items-center justify-between gap-4 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: entry.color }} />
                              <span className="text-[#5F6670]">{entry.name}:</span>
                            </div>
                            <span className="font-mono font-bold text-[#20242A]">
                              ${Number(entry.value).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 600 }}
                formatter={(value) => <span className="text-[#475569]">{value}</span>}
              />
              <Bar
                name="Federal Payments (EFTPS)"
                dataKey="federalPayments"
                fill="#0B1F6A"
                radius={[4, 4, 0, 0]}
                maxBarSize={38}
              />
              <Bar
                name="State Remittances (CA FTB)"
                dataKey="statePayments"
                fill="#147A52"
                radius={[4, 4, 0, 0]}
                maxBarSize={38}
              />
              <Bar
                name="1099 Statutory Withholdings"
                dataKey="statutoryWithholdings"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                maxBarSize={38}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Quick Document Preview Cards & Tax Forms Grid */}
      <div className="space-y-4">
        {/* Filter and Search Toolbar */}
        <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 bg-[#F5F7FA] p-1 rounded-xl border-2 border-[#D8DEE8] text-xs overflow-x-auto">
            {[
              { id: 'all', label: 'All Tax Docs' },
              { id: '1099', label: 'Form 1099 Series' },
              { id: 'k1', label: 'Schedule K-1' },
              { id: '1042s', label: 'Form 1042-S' },
              { id: 'packages', label: 'Annual Packages' },
              { id: 'fbar', label: 'FBAR / FinCEN' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id as TaxCategory)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
                  selectedCategory === tab.id
                    ? 'bg-[#0B1F6A] text-white shadow-xs'
                    : 'text-[#5F6670] hover:text-[#20242A]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-[#5F6670] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tax forms, 1099, K-1..."
              className="w-full pl-9 pr-3 py-2 bg-[#F5F7FA] border border-[#D8DEE8] rounded-xl text-xs text-[#20242A] focus:outline-none focus:border-[#147A52] transition-colors"
            />
          </div>
        </div>

        {/* Documents Table / Grid */}
        <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F5F7FA] border-b-2 border-[#D8DEE8] text-[#5F6670] font-mono text-[11px] uppercase tracking-wider font-extrabold">
                  <th className="py-3 px-4">Document Title &amp; Form Description</th>
                  <th className="py-3 px-4">Tax Period</th>
                  <th className="py-3 px-4">Certified Date</th>
                  <th className="py-3 px-4">File Format</th>
                  <th className="py-3 px-4">Compliance Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#F5F7FA]">
                {filteredTaxDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#5F6670] font-medium">
                      No tax filings or documents found for the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTaxDocs.map((doc) => {
                    const is1099 = doc.title.includes('1099') || doc.title.includes('K-1') || doc.title.includes('1042');
                    return (
                    <tr key={doc.id} className="hover:bg-[#F5F7FA] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {is1099 ? (
                            <IrsLogo variant="mark" size="xs" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-[#0B1F6A]/10 text-[#0B1F6A] flex items-center justify-center shrink-0 border border-[#0B1F6A]/20">
                              <FileText className="w-4 h-4 stroke-[2.25]" />
                            </div>
                          )}
                          <div>
                            <span className="font-extrabold text-[#20242A] block text-xs">{doc.title}</span>
                            <span className="text-[10px] text-[#5F6670] font-mono">IRS Official Sovereign Certificate • ID #{doc.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-[#0B1F6A]">
                        {doc.period || 'Annual'}
                      </td>
                      <td className="py-3.5 px-4 text-[#5F6670] font-mono text-xs">
                        {doc.date}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-200">
                          {doc.fileSize}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                          <Check className="w-3 h-3 text-[#147A52]" /> IRS Certified
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDocModal(doc)}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F5F7FA] border border-[#D8DEE8] text-[#0B1F6A] hover:text-[#081552] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDocModal(doc)}
                            className="p-1.5 rounded-lg bg-[#0B1F6A] hover:bg-[#081552] text-white transition-colors cursor-pointer shadow-2xs"
                            title="Download IRS Certified PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 6. IRS & State Tax Deadlines & Schedule */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0B1F6A] stroke-[2.25]" />
            <h2 className="text-base sm:text-lg font-bold font-serif text-[#0B1F6A]">
              IRS &amp; State Tax Calendar &amp; Deadlines (2026)
            </h2>
          </div>
          <span className="text-xs text-[#5F6670] font-medium hidden sm:inline">
            Fiduciary Sovereign Remittance Schedule
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center justify-between font-mono font-bold text-emerald-900 mb-1">
              <span>JANUARY 15, 2026</span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-sans font-bold">COMPLETED</span>
            </div>
            <span className="font-bold text-[#20242A] block text-xs">Q4 2025 Estimated Tax (1040-ES)</span>
            <p className="text-[11px] text-[#5F6670] mt-1">Final quarterly estimated installment for Tax Year 2025 remitted to US Treasury.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center justify-between font-mono font-bold text-emerald-900 mb-1">
              <span>JANUARY 31, 2026</span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-sans font-bold">DISPATCHED</span>
            </div>
            <span className="font-bold text-[#20242A] block text-xs">Forms 1099-INT &amp; 1099-DIV</span>
            <p className="text-[11px] text-[#5F6670] mt-1">Official bank interest income and dividend statements published to client vault.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center justify-between font-mono font-bold text-emerald-900 mb-1">
              <span>FEBRUARY 15, 2026</span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-sans font-bold">DISPATCHED</span>
            </div>
            <span className="font-bold text-[#20242A] block text-xs">Schedule K-1 &amp; Form 1099-B</span>
            <p className="text-[11px] text-[#5F6670] mt-1">Fiduciary trust allocation and brokerage proceeds packages issued to CPA.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-[#D8DEE8] bg-[#F5F7FA]">
            <div className="flex items-center justify-between font-mono font-bold text-[#0B1F6A] mb-1">
              <span>APRIL 15, 2026</span>
              <span className="text-[10px] bg-blue-100 text-[#0B1F6A] px-1.5 py-0.2 rounded font-sans font-bold">CALENDAR</span>
            </div>
            <span className="font-bold text-[#20242A] block text-xs">Federal 1040 &amp; CA 540 Filing</span>
            <p className="text-[11px] text-[#5F6670] mt-1">Annual federal and state individual tax return filing or extension filing deadline.</p>
          </div>
        </div>
      </div>

      {/* Statement & Tax Form Interactive Modal */}
      <StatementTaxModal
        isOpen={showTaxModal}
        onClose={() => setShowTaxModal(false)}
        initialType={modalType}
        autoStartDownload={false}
      />

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
