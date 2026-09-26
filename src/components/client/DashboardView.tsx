import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useBanking } from '../../context/BankingContext';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  SendHorizontal,
  CreditCard,
  Receipt,
  FileText,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Copy,
  ExternalLink,
  ShieldCheck,
  Building2,
  Lock,
  Unlock,
  Plus,
  Download,
  Calendar,
  DollarSign,
  Smartphone,
  X,
  Printer,
  ChevronRight,
  ArrowDownCircle,
  ArrowUpCircle,
  HelpCircle,
  Activity,
  Check,
  Landmark,
  BadgeCheck,
  Clock,
  Search,
  Sliders,
  Filter,
  Zap
} from 'lucide-react';
import { ReceiptModal } from '../common/ReceiptModal';
import { DisputeModal } from '../common/DisputeModal';
import { StatementTaxModal } from './StatementTaxModal';
import { TaxSection } from './TaxSection';
import { NorthernTrustLogo } from '../common/NorthernTrustLogo';
import { RealBankCard } from '../common/RealBankCard';
import { DigitalWaveBackground } from '../common/DigitalWaveBackground';
import { Transaction } from '../../types/banking';

type ChartInterval = '7D' | '30D' | '90D' | '1Y';
type TxFilter = 'all' | 'deposits' | 'withdrawals' | 'wires' | 'transfers';

const heroAnimatedPhrases = [
  'Direct Fedwire (ABA 021000089) & SWIFT ISO 20022 Settlements Active',
  'Multi-Asset Depository Reserves • Cleared & Unencumbered Custody',
  'Automated IntraFi Yield Sweeps Protected Up to $25,000,000',
  '256-Bit Hardware Enclave Biometric Authorization Online',
  'Private Wealth Fiduciary Desk • Continuous Real-Time Clearing'
];

// Smooth Animated Counter for Numbers
const useAnimatedCounter = (target: number, duration = 1400) => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setVal(ease * target);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setVal(target);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return val;
};

// Redesigned Institutional Live Settlement Ticker (Replaces old typewriter & removes AI star)
const LiveSettlementTicker: React.FC = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % heroAnimatedPhrases.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="inline-flex items-center gap-2.5 sm:gap-3 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#F0F5FD] via-[#F4FAF6] to-[#F8FAFC] dark:from-[#081552]/80 dark:via-[#0B1F6A]/60 dark:to-[#081552]/80 border border-[#D8DEE8] dark:border-blue-900/60 shadow-2xs max-w-full overflow-hidden"
    >
      {/* Network / Clearing Status Badge (No AI Star) */}
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#147A52]/15 dark:bg-emerald-950/60 border border-[#147A52]/25 dark:border-emerald-600/40 text-[#147A52] dark:text-emerald-400 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#147A52] dark:bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#147A52] dark:bg-emerald-400"></span>
        </span>
        <Activity className="w-3.5 h-3.5 stroke-[2.25]" />
        <span className="text-[10px] font-mono font-bold tracking-wider uppercase hidden sm:inline">LIVE FEED</span>
      </div>

      {/* Crossfade Slide-in Text Animation */}
      <div className="relative h-6 min-w-[200px] max-w-xl overflow-hidden flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={phraseIndex}
            initial={{ opacity: 0, y: 10, filter: 'blur(2px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(2px)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="font-mono text-[11px] sm:text-xs text-[#0B1F6A] dark:text-emerald-200 font-semibold tracking-tight truncate flex items-center gap-2"
          >
            <span>{heroAnimatedPhrases[phraseIndex]}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subtle Step Paging Indicator */}
      <div className="hidden md:flex items-center gap-1 shrink-0 pl-1 border-l border-[#D8DEE8] dark:border-blue-900/50">
        {heroAnimatedPhrases.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPhraseIndex(i)}
            aria-label={`Show phrase ${i + 1}`}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              i === phraseIndex ? 'w-4 bg-[#147A52] dark:bg-emerald-400' : 'w-1.5 bg-[#D8DEE8] dark:bg-blue-900/60 hover:bg-[#147A52]/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    accounts,
    transactions,
    transfers,
    bills,
    cards,
    totalNetWorthUSD,
    totalAvailableUSD,
    initiateTransfer,
    fundAccount,
    payBill,
    toggleCardFreeze,
    navigateTo,
    privacyMode,
    hasPermission,
    triggerAccessDenied
  } = useBanking();

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);

  // Quick Action Modals
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isPayBillModalOpen, setIsPayBillModalOpen] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [isRoutingModalOpen, setIsRoutingModalOpen] = useState(false);
  const [selectedRoutingAccount, setSelectedRoutingAccount] = useState<string>(accounts[0]?.id || '');

  // Copy Feedback state
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Transfer Modal State
  const [transferFromAcc, setTransferFromAcc] = useState(accounts[0]?.id || '');
  const [transferToAcc, setTransferToAcc] = useState(accounts[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferMemo, setTransferMemo] = useState('Treasury Liquidity Rebalancing');
  const [transferSuccess, setTransferSuccess] = useState('');

  // Deposit Modal State
  const [depositAcc, setDepositAcc] = useState(accounts[0]?.id || '');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState<'check' | 'wire' | 'ach'>('check');
  const [depositSuccess, setDepositSuccess] = useState('');

  // Withdraw Modal State
  const [withdrawFromAcc, setWithdrawFromAcc] = useState(accounts[0]?.id || '');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'wire' | 'ach' | 'check'>('wire');
  const [withdrawDestination, setWithdrawDestination] = useState('');
  const [withdrawMemo, setWithdrawMemo] = useState('Custodial Liquidation Disbursal');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

  // Pay Bill Modal State
  const [selectedBillId, setSelectedBillId] = useState(bills[0]?.id || '');
  const [payBillSuccess, setPayBillSuccess] = useState('');

  // Balance Activity Chart State
  const [chartInterval, setChartInterval] = useState<ChartInterval>('30D');
  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; balance: number; inflow: number; outflow: number; x: number; y: number } | null>(null);
  const [hoveredDonutSlice, setHoveredDonutSlice] = useState<'avail' | 'used' | 'pending' | null>(null);

  // Transaction Ledger Filter & Search
  const [txFilter, setTxFilter] = useState<TxFilter>('all');
  const [txSearch, setTxSearch] = useState('');

  const pendingTransfers = transfers.filter((t) => t.status === 'pending_review');
  const primaryCard = cards[0];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Group accounts in real bank taxonomy
  const checkingAndOperatingAccounts = accounts.filter(a => a.type === 'checking' || a.type === 'multicurrency');
  const savingsAndReservesAccounts = accounts.filter(a => a.type === 'savings' || a.type === 'investment' || a.type === 'cd');

  // Compute accurate total gross ledger
  const computedGrossLedger = useMemo(() => {
    return accounts.reduce((acc, a) => acc + a.balance, 0);
  }, [accounts]);

  const computedTotalPending = useMemo(() => {
    return accounts.reduce((acc, a) => acc + (a.pendingBalance || 0), 0);
  }, [accounts]);

  // Credit Limit Calculations (Expanded Circle with Dynamic Size Animation)
  const totalFacilityAmount = 150000.00;
  const animatedFacilityAmount = useAnimatedCounter(totalFacilityAmount, 1500);
  const availableAmount = totalAvailableUSD;
  const usedAmount = Math.max(0, totalFacilityAmount - availableAmount);
  const pendingAmount = computedTotalPending;

  const availPct = Math.round((availableAmount / totalFacilityAmount) * 100);
  const usedPct = Math.round((usedAmount / totalFacilityAmount) * 100);
  const pendingPct = Math.round((pendingAmount / totalFacilityAmount) * 100);

  const circleRadius = 88;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const availDash = (availPct / 100) * circleCircumference;
  const usedDash = (usedPct / 100) * circleCircumference;
  const pendingDash = (pendingPct / 100) * circleCircumference;
  const usedOffset = -availDash;
  const pendingOffset = -(availDash + usedDash);

  // Generate dynamic chart data based on interval
  const chartData = useMemo(() => {
    const base = computedGrossLedger || 125450;
    if (chartInterval === '7D') {
      return [
        { date: 'Sep 17', balance: base - 14500, inflow: 8500, outflow: 2400 },
        { date: 'Sep 18', balance: base - 11800, inflow: 4200, outflow: 1500 },
        { date: 'Sep 19', balance: base - 9600, inflow: 3800, outflow: 1600 },
        { date: 'Sep 20', balance: base - 7200, inflow: 5100, outflow: 2700 },
        { date: 'Sep 21', balance: base - 4900, inflow: 6500, outflow: 4200 },
        { date: 'Sep 22', balance: base - 1800, inflow: 4800, outflow: 1700 },
        { date: 'Sep 23', balance: base, inflow: 3200, outflow: 1400 },
      ];
    } else if (chartInterval === '30D') {
      return [
        { date: 'Aug 25', balance: base - 68200, inflow: 45000, outflow: 22000 },
        { date: 'Aug 30', balance: base - 52400, inflow: 38000, outflow: 22200 },
        { date: 'Sep 05', balance: base - 41800, inflow: 41000, outflow: 30400 },
        { date: 'Sep 10', balance: base - 29500, inflow: 39400, outflow: 27100 },
        { date: 'Sep 15', balance: base - 18200, inflow: 42000, outflow: 30700 },
        { date: 'Sep 20', balance: base - 8400, inflow: 32000, outflow: 22200 },
        { date: 'Sep 23', balance: base, inflow: 28400, outflow: 20000 },
      ];
    } else if (chartInterval === '90D') {
      return [
        { date: 'Jun 24', balance: base - 184000, inflow: 110000, outflow: 68000 },
        { date: 'Jul 10', balance: base - 145000, inflow: 98000, outflow: 59000 },
        { date: 'Jul 28', balance: base - 110000, inflow: 105000, outflow: 70000 },
        { date: 'Aug 15', balance: base - 76000, inflow: 88000, outflow: 54000 },
        { date: 'Sep 01', balance: base - 38000, inflow: 94000, outflow: 56000 },
        { date: 'Sep 23', balance: base, inflow: 82000, outflow: 44000 },
      ];
    } else {
      return [
        { date: 'Oct 25', balance: base - 480000, inflow: 320000, outflow: 210000 },
        { date: 'Dec 25', balance: base - 390000, inflow: 360000, outflow: 270000 },
        { date: 'Feb 26', balance: base - 290000, inflow: 310000, outflow: 210000 },
        { date: 'Apr 26', balance: base - 210000, inflow: 380000, outflow: 300000 },
        { date: 'Jun 26', balance: base - 120000, inflow: 390000, outflow: 300000 },
        { date: 'Sep 26', balance: base, inflow: 410000, outflow: 290000 },
      ];
    }
  }, [chartInterval, computedGrossLedger]);

  // Compute SVG chart points
  const minBal = Math.min(...chartData.map(d => d.balance));
  const maxBal = Math.max(...chartData.map(d => d.balance));
  const range = maxBal - minBal || 1;

  const svgWidth = 800;
  const svgHeight = 175;
  const paddingX = 35;
  const paddingY = 22;

  const points = chartData.map((d, i) => {
    const x = paddingX + (i / (chartData.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - ((d.balance - minBal) / range) * (svgHeight - paddingY * 2);
    return { ...d, x, y };
  });

  const linePath = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cp1x = prev.x + (p.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (p.x - prev.x) / 2;
    const cp2y = p.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`;
  }, '');

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  // Quick Transfer Handler
  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (!amt || amt <= 0) return;

    const fromAcc = accounts.find((a) => a.id === transferFromAcc);
    const toAcc = accounts.find((a) => a.id === transferToAcc);
    if (!fromAcc || !toAcc) return;

    initiateTransfer({
      type: 'internal',
      fromAccountId: fromAcc.id,
      fromAccountName: fromAcc.name,
      toAccountId: toAcc.id,
      toAccountName: toAcc.name,
      beneficiaryName: `${currentUser?.fullName} (${toAcc.name})`,
      amount: amt,
      sourceCurrency: fromAcc.currency,
      targetCurrency: toAcc.currency,
      fee: 0,
      scheduledDate: new Date().toISOString().slice(0, 10),
      isRecurring: false,
      purpose: transferMemo || 'Internal Liquidity Reallocation',
      riskScore: 'LOW'
    });

    setTransferSuccess(`Successfully transferred $${amt.toLocaleString()} to ${toAcc.name}`);
    setTimeout(() => {
      setTransferSuccess('');
      setIsTransferModalOpen(false);
      setTransferAmount('');
    }, 1800);
  };

  // Quick Deposit Handler
  const handleExecuteDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) return;

    const targetAcc = accounts.find((a) => a.id === depositAcc) || accounts[0];
    if (!targetAcc) return;

    const result = await fundAccount({
      accountId: targetAcc.id,
      amount: amt,
      fundingMethod: depositMethod,
      memo: `Deposit Inflow via ${depositMethod.toUpperCase()}`,
      sourceInstitution:
        depositMethod === 'wire'
          ? 'Fedwire Inflow Clearing (ABA 021000089)'
          : depositMethod === 'check'
          ? 'Remote Check Clearing Desk'
          : 'ACH Direct Network Settlement'
    });

    if (result.success) {
      setDepositSuccess(`Verified & Credited: $${amt.toLocaleString()} to ${targetAcc.name}. Ref: ${result.referenceNumber}`);
      setTimeout(() => {
        setDepositSuccess('');
        setIsDepositModalOpen(false);
        setDepositAmount('');
      }, 2000);
    } else {
      alert(result.error || 'Deposit funding verification failed.');
    }
  };

  // Quick Withdraw Handler
  const handleExecuteWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0) return;

    const sourceAcc = accounts.find((a) => a.id === withdrawFromAcc) || accounts[0];
    if (!sourceAcc) return;

    if (!hasPermission('create:transfers')) {
      triggerAccessDenied('create:transfers', 'Withdraw / Outbound Liquidation');
      return;
    }

    if (amt > sourceAcc.availableBalance) {
      alert(`Insufficient available funds. Current available balance is $${sourceAcc.availableBalance.toLocaleString()}.`);
      return;
    }

    initiateTransfer({
      type: withdrawMethod === 'wire' ? 'external_wire' : 'external_ach',
      fromAccountId: sourceAcc.id,
      fromAccountName: sourceAcc.name,
      toAccountName: withdrawDestination.trim() || 'External Outbound Depository',
      beneficiaryName: withdrawDestination.trim() || `${currentUser?.fullName} (External Disbursal)`,
      amount: amt,
      sourceCurrency: sourceAcc.currency || 'USD',
      targetCurrency: 'USD',
      fee: withdrawMethod === 'wire' ? 25 : 0,
      scheduledDate: new Date().toISOString().slice(0, 10),
      isRecurring: false,
      purpose: withdrawMemo || `Outbound Withdrawal (${withdrawMethod.toUpperCase()})`,
      riskScore: amt >= 50000 ? 'MEDIUM' : 'LOW'
    });

    setWithdrawSuccess(`Withdrawal of $${amt.toLocaleString()} submitted for outbound settlement.`);
    setTimeout(() => {
      setWithdrawSuccess('');
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      setWithdrawDestination('');
    }, 1800);
  };

  // Quick Pay Bill Handler
  const handleExecutePayBill = (e: React.FormEvent) => {
    e.preventDefault();
    const bill = bills.find((b) => b.id === selectedBillId);
    if (!bill) return;

    payBill(bill.id);
    setPayBillSuccess(`Disbursement of $${bill.amount.toLocaleString()} scheduled to ${bill.payeeName}.`);
    setTimeout(() => {
      setPayBillSuccess('');
      setIsPayBillModalOpen(false);
    }, 1800);
  };

  // Filtered transactions for dashboard preview
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (txFilter === 'deposits') return t.type === 'deposit' || t.amount > 0;
      if (txFilter === 'withdrawals') return t.type === 'withdrawal' || t.type === 'transfer_out' || t.type === 'bill_payment' || t.amount < 0;
      if (txFilter === 'wires') return t.type === 'transfer_out' || t.type === 'transfer_in';
      if (txFilter === 'transfers') return t.type === 'transfer_in' || t.type === 'transfer_out';
      return true;
    }).filter((t) => {
      if (!txSearch.trim()) return true;
      const q = txSearch.toLowerCase();
      return (
        t.description.toLowerCase().includes(q) ||
        (t.counterparty && t.counterparty.toLowerCase().includes(q)) ||
        (t.referenceNumber && t.referenceNumber.toLowerCase().includes(q))
      );
    }).slice(0, 7);
  }, [transactions, txFilter, txSearch]);

  const activeRoutingAcc = accounts.find((a) => a.id === selectedRoutingAccount) || accounts[0] || {
    id: 'acc_01',
    name: 'Private Wealth Operating Reserve',
    accountNumber: '882077771975',
    availableBalance: 0,
    swiftBic: 'NTCOUS33NYC'
  };

  // Animation container variants for staggered fluid entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.04
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut' as const
      }
    }
  };

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
  const clientName = currentUser?.preferredName || currentUser?.fullName?.split(' ')[0] || 'Client';

  // Primary account context for WCAG accessibility labeling
  const primaryAccount = accounts[0];
  const primaryAccountLastFour = primaryAccount?.accountNumber ? primaryAccount.accountNumber.slice(-4) : '••••';
  const primaryAccountName = primaryAccount?.name || 'Primary Operating Account';
  const primaryAccountBalanceFormatted = primaryAccount
    ? `$${(primaryAccount.availableBalance ?? primaryAccount.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '$0.00';

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative space-y-5 sm:space-y-6 pb-12 text-[#20242A]"
    >
      {/* =========================================================================
          1. DASHBOARD HEADER & QUICK CAPABILITIES TOOLBAR
         ========================================================================= */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-[#D8DEE8] shadow-xs hover:shadow-sm transition-all"
      >
        <div className="space-y-2.5 min-w-0 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#147A52]/10 text-[#147A52] border border-[#147A52]/20 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#147A52] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#147A52]"></span>
              </span>
              <span>NORTHERN TRUST PRIVATE WEALTH ENCLAVE • ACTIVE</span>
            </span>
            <span className="text-xs text-[#5F6670] font-mono">
              Client ID: <strong className="text-[#0B1F6A]">{currentUser?.clientId || 'NT-8840291'}</strong>
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#0B1F6A] tracking-tight">
              {greeting}, {clientName}
            </h1>
            <p className="text-xs text-[#5F6670] font-medium mt-0.5">
              Northern Trust Private Wealth &amp; Institutional Custodial Enclave
            </p>
          </div>

          {/* Redesigned Live Settlement Network Feed (AI star removed, redesigned carousel format) */}
          <LiveSettlementTicker />
        </div>

        {/* Action Button Strip */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap" role="toolbar" aria-label="Primary banking quick actions">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            aria-label={`Send Money: Initiate outbound wire transfer or external remittance from ${primaryAccountName} (ending in ${primaryAccountLastFour}, available balance: ${primaryAccountBalanceFormatted})`}
            onClick={() => {
              if (!hasPermission('create:transfers')) {
                triggerAccessDenied('create:transfers', 'Send Money / Outbound Remittance');
                return;
              }
              navigateTo('/transfers');
            }}
            className="px-3 py-1.5 sm:py-2 rounded-lg bg-[#0B1F6A] hover:bg-[#081552] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            <SendHorizontal className="w-3.5 h-3.5" />
            <span>Send Money</span>
            {!hasPermission('create:transfers') && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Restricted by Role" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            aria-label={`Transfer Funds: Initiate instant internal transfer between ${primaryAccountName} (ending in ${primaryAccountLastFour}) and depository accounts`}
            onClick={() => {
              if (!hasPermission('create:transfers')) {
                triggerAccessDenied('create:transfers', 'Account Transfer');
                return;
              }
              setIsTransferModalOpen(true);
            }}
            className="px-3 py-1.5 sm:py-2 rounded-lg bg-white hover:bg-[#F5F7FA] text-[#0B1F6A] border border-[#D8DEE8] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            <ArrowRight className="w-3.5 h-3.5 text-[#0B1F6A]" />
            <span>Transfer</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            aria-label={`Deposit Funds: Open remote check capture and inbound funding into ${primaryAccountName} (ending in ${primaryAccountLastFour})`}
            onClick={() => {
              if (!hasPermission('create:transactions')) {
                triggerAccessDenied('create:transactions', 'Remote Check & Funds Deposit');
                return;
              }
              setIsDepositModalOpen(true);
            }}
            className="px-3 py-1.5 sm:py-2 rounded-lg bg-white hover:bg-[#F5F7FA] text-[#0B1F6A] border border-[#D8DEE8] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            <ArrowDownCircle className="w-3.5 h-3.5 text-[#147A52]" />
            <span>Deposit</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            aria-label={`Withdraw Funds: Open cash withdrawal and wire liquidation from ${primaryAccountName} (ending in ${primaryAccountLastFour}, available balance: ${primaryAccountBalanceFormatted})`}
            onClick={() => {
              if (!hasPermission('create:transfers')) {
                triggerAccessDenied('create:transfers', 'Withdraw / Outbound Liquidation');
                return;
              }
              setIsWithdrawModalOpen(true);
            }}
            className="px-3 py-1.5 sm:py-2 rounded-lg bg-white hover:bg-[#F5F7FA] text-[#0B1F6A] border border-[#D8DEE8] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-[#B42318]" />
            <span>Withdraw</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            aria-label={`Pay Bills: Open bill payment and scheduled obligations disbursement from ${primaryAccountName} (ending in ${primaryAccountLastFour})`}
            onClick={() => {
              if (!hasPermission('create:transactions')) {
                triggerAccessDenied('create:transactions', 'Pay Bills');
                return;
              }
              setIsPayBillModalOpen(true);
            }}
            className="px-3 py-1.5 sm:py-2 rounded-lg bg-white hover:bg-[#F5F7FA] text-[#0B1F6A] border border-[#D8DEE8] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            <Receipt className="w-3.5 h-3.5 text-[#0B1F6A]" />
            <span>Pay Bills</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            aria-label={`Account Statements: Open official monthly e-statements and tax filings for ${primaryAccountName} and all associated custodial accounts`}
            onClick={() => {
              if (!hasPermission('view:documents')) {
                triggerAccessDenied('view:documents', 'Official Account Statements');
                return;
              }
              setIsStatementModalOpen(true);
            }}
            className="px-3 py-1.5 sm:py-2 rounded-lg bg-white hover:bg-[#F5F7FA] text-[#0B1F6A] border border-[#D8DEE8] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            <FileText className="w-3.5 h-3.5 text-[#0B1F6A]" />
            <span>Statements</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            aria-label={`Wiring Slip: View Fedwire routing transit and direct deposit instruction slip for ${primaryAccountName} (ending in ${primaryAccountLastFour})`}
            onClick={() => {
              if (!hasPermission('view:accounts')) {
                triggerAccessDenied('view:accounts', 'Account Wiring Instructions');
                return;
              }
              setIsRoutingModalOpen(true);
            }}
            className="px-3 py-1.5 sm:py-2 rounded-lg bg-white hover:bg-[#F5F7FA] text-[#0B1F6A] border border-[#D8DEE8] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            <Landmark className="w-3.5 h-3.5 text-[#0B1F6A]" />
            <span>Wiring Slip</span>
          </motion.button>
        </div>
      </motion.div>

      {/* AML Alert if pending wire */}
      {pendingTransfers.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-[#B87500] text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-amber-400 opacity-60"></span>
              <ShieldAlert className="w-5 h-5 text-[#B87500] shrink-0 stroke-[2.2] relative z-10" />
            </div>
            <div>
              <span className="font-bold block text-[13px] text-[#20242A]">
                {pendingTransfers.length} High-Value Wire Settlement Under Clearing Protocol
              </span>
              <span className="text-[#5F6670] text-[11px] font-medium">
                Wire #{pendingTransfers[0].id} (${pendingTransfers[0].amount.toLocaleString()}) queued in Zurich/Fedwire clearing node.
              </span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => navigateTo('/transfers')}
            className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-amber-100 border border-amber-300 font-semibold text-xs text-[#B87500] transition-colors shrink-0 cursor-pointer shadow-2xs"
          >
            Review Status &rarr;
          </motion.button>
        </motion.div>
      )}

      {/* =========================================================================
          2. MAIN FINANCIAL SUMMARY CARD (CREDIT LIMIT DONUT & BREAKDOWN - COMPACT)
         ========================================================================= */}
      <motion.div
        variants={itemVariants}
        className="w-full bg-white border border-[#D8DEE8] rounded-xl p-4 sm:p-5 md:p-6 shadow-xs hover:border-[#C4CBD6] transition-all"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-8 lg:gap-10 items-center">
          {/* LEFT SIDE — CREDIT LIMIT VISUALIZATION (EXPANDED & REDESIGNED WITH DYNAMIC SIZE ANIMATION) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-2 sm:p-3">
            <div className="relative w-[230px] h-[230px] sm:w-[255px] sm:h-[255px] md:w-[265px] md:h-[265px] flex items-center justify-center group">
              <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 240 240">
                <defs>
                  {/* Subtle Inner Glow */}
                  <radialGradient id="donutCenterGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#147A52" stopOpacity="0.08" />
                    <stop offset="70%" stopColor="#0B1F6A" stopOpacity="0.03" />
                    <stop offset="100%" stopColor="#0B1F6A" stopOpacity="0" />
                  </radialGradient>
                  {/* Gradients for Slices */}
                  <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#147A52" />
                  </linearGradient>
                  <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E3A8A" />
                    <stop offset="100%" stopColor="#0B1F6A" />
                  </linearGradient>
                  <linearGradient id="royalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#101F7A" />
                  </linearGradient>
                </defs>

                {/* Soft Center Background Disc */}
                <circle cx="120" cy="120" r="76" fill="url(#donutCenterGlow)" />

                {/* Outer Delicate Compass / Precision Gauge Ring */}
                <circle
                  cx="120"
                  cy="120"
                  r="104"
                  fill="none"
                  stroke="#D8DEE8"
                  strokeOpacity="0.5"
                  strokeDasharray="2 6"
                  strokeWidth="1.5"
                />

                {/* Inner Delicate Concentric Ring */}
                <circle
                  cx="120"
                  cy="120"
                  r="72"
                  fill="none"
                  stroke="#D8DEE8"
                  strokeOpacity="0.4"
                  strokeWidth="1"
                />

                {/* Background Ring Track (Expanded Radius) */}
                <circle
                  cx="120"
                  cy="120"
                  r="88"
                  fill="none"
                  stroke="#EEF2F6"
                  className="dark:stroke-slate-800/80 transition-colors"
                  strokeWidth="16"
                />

                {/* Available Slice (Emerald Gradient) */}
                <motion.circle
                  initial={{ strokeDashoffset: circleCircumference }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
                  cx="120"
                  cy="120"
                  r="88"
                  fill="none"
                  stroke="url(#emeraldGrad)"
                  strokeLinecap="round"
                  strokeWidth={hoveredDonutSlice === 'avail' ? 20 : 16}
                  strokeDasharray={`${availDash} ${circleCircumference}`}
                  strokeDashoffset="0"
                  className="transition-all duration-300 ease-out cursor-pointer drop-shadow-xs"
                  onMouseEnter={() => setHoveredDonutSlice('avail')}
                  onMouseLeave={() => setHoveredDonutSlice(null)}
                />

                {/* Used Slice (Navy Gradient) */}
                {usedPct > 0 && (
                  <motion.circle
                    initial={{ strokeDashoffset: circleCircumference }}
                    animate={{ strokeDashoffset: usedOffset }}
                    transition={{ duration: 1.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    cx="120"
                    cy="120"
                    r="88"
                    fill="none"
                    stroke="url(#navyGrad)"
                    strokeLinecap="round"
                    strokeWidth={hoveredDonutSlice === 'used' ? 20 : 16}
                    strokeDasharray={`${usedDash} ${circleCircumference}`}
                    className="transition-all duration-300 ease-out cursor-pointer drop-shadow-xs"
                    onMouseEnter={() => setHoveredDonutSlice('used')}
                    onMouseLeave={() => setHoveredDonutSlice(null)}
                  />
                )}

                {/* Pending Slice (Royal Blue Gradient) */}
                <motion.circle
                  initial={{ strokeDashoffset: circleCircumference }}
                  animate={{ strokeDashoffset: pendingOffset }}
                  transition={{ duration: 1.3, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  cx="120"
                  cy="120"
                  r="88"
                  fill="none"
                  stroke="url(#royalGrad)"
                  strokeLinecap="round"
                  strokeWidth={hoveredDonutSlice === 'pending' ? 20 : 16}
                  strokeDasharray={`${pendingDash} ${circleCircumference}`}
                  className="transition-all duration-300 ease-out cursor-pointer drop-shadow-xs"
                  onMouseEnter={() => setHoveredDonutSlice('pending')}
                  onMouseLeave={() => setHoveredDonutSlice(null)}
                />
              </svg>

              {/* Center Donut Label & Credit Limit Amount with Dynamic Size Animation */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 select-none pointer-events-none">
                <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.18em] text-[#5F6670] dark:text-slate-400 uppercase font-sans">
                  CREDIT LIMIT
                </span>

                {/* Animated Credit Limit Size (Count-up & gentle breathing pulse) */}
                <motion.div
                  className="my-1 cursor-default pointer-events-auto"
                  animate={{
                    scale: [1, 1.035, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  whileHover={{ scale: 1.09 }}
                >
                  <span className="text-2xl sm:text-[27px] font-black text-[#0B1F6A] dark:text-white tracking-tight font-sans drop-shadow-xs block">
                    ${animatedFacilityAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </motion.div>

                {/* Redesigned Tier-1 Facility Capsule (Expanded & completely clear of circle ring) */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-[#147A52]/10 dark:bg-emerald-950/60 border border-[#147A52]/30 dark:border-emerald-500/40 text-[#147A52] dark:text-emerald-300 font-mono text-[9px] sm:text-[10px] font-bold tracking-wider shadow-2xs mt-0.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#147A52] dark:bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#147A52] dark:bg-emerald-400"></span>
                  </span>
                  <span>TIER-1 PRIME FACILITY</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE — FINANCIAL BREAKDOWN ROWS WITH INTERACTIVE HOVER */}
          <div className="md:col-span-7 space-y-0 divide-y divide-[#D8DEE8]">
            {/* ROW 1: Available */}
            <div
              onMouseEnter={() => setHoveredDonutSlice('avail')}
              onMouseLeave={() => setHoveredDonutSlice(null)}
              className={`flex items-center justify-between py-2.5 sm:py-3.5 px-2 rounded-lg transition-all cursor-default ${
                hoveredDonutSlice === 'avail' ? 'bg-[#147A52]/5 scale-[1.01]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#147A52] opacity-40"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#147A52]"></span>
                </span>
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-[#5F6670] block">Available</span>
                  <span className="text-base sm:text-xl font-bold font-sans text-[#0B1F6A] mt-0.5 block tracking-tight">
                    ${availableAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <span className="text-base sm:text-xl font-bold text-[#147A52] font-sans">
                {availPct}%
              </span>
            </div>

            {/* ROW 2: Used */}
            <div
              onMouseEnter={() => setHoveredDonutSlice('used')}
              onMouseLeave={() => setHoveredDonutSlice(null)}
              className={`flex items-center justify-between py-2.5 sm:py-3.5 px-2 rounded-lg transition-all cursor-default ${
                hoveredDonutSlice === 'used' ? 'bg-[#0B1F6A]/5 scale-[1.01]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#0B1F6A] shrink-0" />
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-[#5F6670] block">Used</span>
                  <span className="text-base sm:text-xl font-bold font-sans text-[#0B1F6A] mt-0.5 block tracking-tight">
                    ${usedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <span className="text-base sm:text-xl font-bold text-[#0B1F6A] font-sans">
                {usedPct}%
              </span>
            </div>

            {/* ROW 3: Pending */}
            <div
              onMouseEnter={() => setHoveredDonutSlice('pending')}
              onMouseLeave={() => setHoveredDonutSlice(null)}
              className={`flex items-center justify-between py-2.5 sm:py-3.5 px-2 rounded-lg transition-all cursor-default ${
                hoveredDonutSlice === 'pending' ? 'bg-[#101F7A]/5 scale-[1.01]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#101F7A] shrink-0" />
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-[#5F6670] block">Pending</span>
                  <span className="text-base sm:text-xl font-bold font-sans text-[#0B1F6A] mt-0.5 block tracking-tight">
                    ${pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <span className="text-base sm:text-xl font-bold text-[#101F7A] font-sans">
                {pendingPct}%
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* =========================================================================
          3. MASTER TREASURY METRIC CARDS (WITH INDIVIDUAL 👁 EYE LOCKS)
         ========================================================================= */}
      <motion.div
        variants={containerVariants}
        className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
      >
        {/* 1. Total Relationship Value */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white rounded-xl border border-[#D8DEE8] p-4 sm:p-5 shadow-xs hover:border-[#0B1F6A]/30 hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between text-[11px] text-[#5F6670] mb-1.5 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span>TOTAL RELATIONSHIP VALUE</span>
            </span>
            <Landmark className="w-4 h-4 text-[#0B1F6A]" />
          </div>
          <div className="text-2xl sm:text-[26px] font-bold text-[#0B1F6A] tracking-tight mt-1 font-sans">
            ${computedGrossLedger.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#D8DEE8] flex items-center justify-between text-[11px] text-[#5F6670]">
            <span>Gross Book Ledger</span>
            <span className="text-[#147A52] font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +4.8% YTD Yield
            </span>
          </div>
        </motion.div>

        {/* 2. Available Liquidity */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white rounded-xl border border-[#D8DEE8] p-4 sm:p-5 shadow-xs hover:border-[#147A52]/30 hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between text-[11px] text-[#5F6670] mb-1.5 font-bold uppercase tracking-wider">
            <span>AVAILABLE LIQUIDITY</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#147A52]/10 text-[#147A52] font-bold border border-[#147A52]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#147A52] animate-pulse"></span>
              ZERO HOLD
            </span>
          </div>
          <div className="text-2xl sm:text-[26px] font-bold text-[#147A52] tracking-tight mt-1 font-sans">
            ${totalAvailableUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#D8DEE8] flex items-center justify-between text-[11px] text-[#5F6670]">
            <span>Fedwire &amp; Cash</span>
            <span className="text-[#147A52] font-semibold">100% Unencumbered</span>
          </div>
        </motion.div>

        {/* 3. Clearing & Holds */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white rounded-xl border border-[#D8DEE8] p-4 sm:p-5 shadow-xs hover:border-[#0B1F6A]/30 hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between text-[11px] text-[#5F6670] mb-1.5 font-bold uppercase tracking-wider">
            <span>CLEARING &amp; HOLDS</span>
            <Clock className="w-4 h-4 text-[#5F6670]" />
          </div>
          <div className="text-2xl sm:text-[26px] font-bold text-[#0B1F6A] tracking-tight mt-1 font-sans">
            ${computedTotalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#D8DEE8] flex items-center justify-between text-[11px] text-[#5F6670]">
            <span>Overnight Clearing</span>
            <span className="text-[#5F6670] font-semibold">T+1 Settlement</span>
          </div>
        </motion.div>

        {/* 4. High-Yield APY Earnings */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="bg-white rounded-xl border border-[#D8DEE8] p-4 sm:p-5 shadow-xs hover:border-[#101F7A]/30 hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex items-center justify-between text-[11px] text-[#5F6670] mb-1.5 font-bold uppercase tracking-wider">
            <span>HIGH-YIELD APY</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-[#101F7A] font-bold border border-blue-200">
              <TrendingUp className="w-3 h-3 text-[#101F7A]" />
              5.15% APY
            </span>
          </div>
          <div className="text-2xl sm:text-[26px] font-bold text-[#0B1F6A] tracking-tight mt-1 font-sans">
            +$14,820.40
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#D8DEE8] flex items-center justify-between text-[11px] text-[#5F6670]">
            <span>Compounded Monthly</span>
            <span className="text-[#101F7A] font-semibold">Next: Sep 30</span>
          </div>
        </motion.div>
      </motion.div>

      {/* =========================================================================
          4. REAL BANK DEPOSITORY & CUSTODIAL ACCOUNTS PORTFOLIO (WITH 👁 EYE LOCKS)
         ========================================================================= */}
      <motion.div
        variants={itemVariants}
        className="w-full bg-white rounded-xl border border-[#D8DEE8] p-3.5 sm:p-5 md:p-6 shadow-xs space-y-5 sm:space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8DEE8] pb-3.5 sm:pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0B1F6A] flex items-center gap-2">
              <Landmark className="w-5 h-5 text-[#0B1F6A]" />
              <span>Deposit &amp; Custodial Accounts</span>
            </h2>
            <p className="text-xs text-[#5F6670] font-medium mt-0.5">
              FDIC-insured operating checking, high-yield reserves, forex vault &amp; institutional custody
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              aria-label={`Deposit Check: Open remote check deposit modal for ${primaryAccountName} (ending in ${primaryAccountLastFour})`}
              onClick={() => setIsDepositModalOpen(true)}
              className="px-3.5 py-1.5 rounded-md bg-white hover:bg-slate-50 text-[#0B1F6A] border border-[#D8DEE8] font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
            >
              <ArrowDownCircle className="w-4 h-4 text-[#0B1F6A]" />
              <span>Deposit Check</span>
            </motion.button>
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#5F6670] bg-[#F5F7FA] px-3 py-1.5 rounded-md border border-[#D8DEE8]">
              <span>ABA: <strong className="text-[#0B1F6A] font-bold">021000089</strong></span>
              <button
                type="button"
                aria-label="Copy ABA Routing Number 021000089"
                onClick={() => handleCopy('021000089', 'aba_top')}
                className="text-[#101F7A] hover:underline cursor-pointer font-semibold inline-flex items-center gap-0.5"
                title="Copy ABA Routing Number"
              >
                {copiedField === 'aba_top' ? (
                  <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-[#147A52] font-bold flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Copied!
                  </motion.span>
                ) : (
                  'Copy'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Operating Accounts Section */}
        <div className="space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5F6670] font-sans flex items-center justify-between gap-2 flex-wrap">
            <span>Operating Demand Accounts &amp; Multi-Currency Cash ({checkingAndOperatingAccounts.length})</span>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#147A52] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#147A52] animate-pulse"></span>
              Direct Clearing Active
            </span>
          </div>

          <div className="divide-y divide-[#D8DEE8] border border-[#D8DEE8] rounded-lg overflow-hidden bg-white shadow-xs">
            {checkingAndOperatingAccounts.map((account) => {
              const lastFour = account.accountNumber.slice(-4);

              return (
                <motion.div
                  whileHover={{ backgroundColor: 'rgba(245, 247, 250, 0.7)' }}
                  key={account.id}
                  className="p-3.5 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-[15px] text-[#0B1F6A] hover:text-[#101F7A] cursor-pointer transition-colors" onClick={() => navigateTo('/accounts')}>
                        {account.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F5F7FA] text-[#5F6670] border border-[#D8DEE8] uppercase font-bold">
                        {account.type}
                      </span>
                      {account.interestRateAPY && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#147A52]/10 text-[#147A52] border border-[#147A52]/20 font-bold">
                          {account.interestRateAPY}% APY
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#5F6670] font-mono flex-wrap font-medium">
                      <span>Acct: ••••{lastFour}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(account.accountNumber, `acc_${account.id}`)}
                        className="text-[#101F7A] hover:underline cursor-pointer flex items-center gap-1 font-semibold"
                      >
                        {copiedField === `acc_${account.id}` ? (
                          <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-[#147A52] flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Copied
                          </motion.span>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <span>•</span>
                      <span>Routing: 021000089</span>
                      {account.currency !== 'USD' && (
                        <>
                          <span>•</span>
                          <span className="text-[#0B1F6A] font-semibold font-sans">Currency: {account.currency}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-right">
                      <div className="text-[10.5px] text-[#5F6670] uppercase font-semibold tracking-wider">
                        Available Balance
                      </div>
                      <div className="text-lg sm:text-xl font-bold font-sans text-[#0B1F6A]">
                        {privacyMode ? '••••••••' : `${account.currency === 'USD' ? '$' : account.currency + ' '}${account.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                      </div>
                      {account.pendingBalance ? (
                        <div className="text-[10.5px] text-[#5F6670] font-mono">
                          {privacyMode ? 'Ledger: ••••••••' : `Ledger: $${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} (Holds: $${account.pendingBalance.toLocaleString()})`}
                        </div>
                      ) : (
                        <div className="text-[10.5px] text-[#5F6670] font-mono">
                          {privacyMode ? 'Ledger: ••••••••' : `Ledger: $${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        aria-label={`Transfer funds from ${account.name} (Account ending in ${lastFour}, Available balance: $${account.availableBalance.toLocaleString()})`}
                        onClick={() => {
                          setTransferFromAcc(account.id);
                          setIsTransferModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-md bg-[#0B1F6A] hover:bg-[#081552] text-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                      >
                        Transfer
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        aria-label={`View Fedwire wiring slip and routing details for ${account.name} (Account ending in ${lastFour})`}
                        onClick={() => {
                          setSelectedRoutingAccount(account.id);
                          setIsRoutingModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-md bg-white hover:bg-slate-50 text-[#0B1F6A] border border-[#D8DEE8] text-xs font-semibold transition-colors cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                        title="View Wiring & Direct Deposit Instructions"
                      >
                        Wiring Slip
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* High-Yield Savings & Custodial Investments Section */}
        <div className="space-y-3 pt-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#5F6670] font-sans flex items-center justify-between">
            <span>High-Yield Treasury Reserves &amp; Institutional Custody ({savingsAndReservesAccounts.length})</span>
            <span className="text-[11px] text-[#147A52] font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#147A52]" />
              Tier-1 Yield Accrual
            </span>
          </div>

          <div className="divide-y divide-[#D8DEE8] border border-[#D8DEE8] rounded-lg overflow-hidden bg-white shadow-xs">
            {savingsAndReservesAccounts.map((account) => {
              const lastFour = account.accountNumber.slice(-4);

              return (
                <motion.div
                  whileHover={{ backgroundColor: 'rgba(245, 247, 250, 0.7)' }}
                  key={account.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-[15px] text-[#0B1F6A] hover:text-[#101F7A] cursor-pointer transition-colors" onClick={() => navigateTo('/accounts')}>
                        {account.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#147A52]/10 text-[#147A52] border border-[#147A52]/20 uppercase font-bold">
                        {account.type.toUpperCase()}
                      </span>
                      {account.interestRateAPY && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B1F6A] text-white font-bold">
                          {account.interestRateAPY}% APY
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#5F6670] font-mono flex-wrap font-medium">
                      <span>Acct: ••••{lastFour}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(account.accountNumber, `acc_${account.id}`)}
                        className="text-[#101F7A] hover:underline cursor-pointer flex items-center gap-1 font-semibold"
                      >
                        {copiedField === `acc_${account.id}` ? (
                          <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-[#147A52] flex items-center gap-0.5">
                            <Check className="w-3 h-3" /> Copied
                          </motion.span>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <span>•</span>
                      <span>Routing: 021000089</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-right">
                      <div className="text-[10.5px] text-[#5F6670] uppercase font-semibold tracking-wider">
                        {account.type === 'cd' ? 'Principal Value' : 'Available Balance'}
                      </div>
                      <div className="text-lg sm:text-xl font-bold font-sans text-[#0B1F6A]">
                        {privacyMode ? '••••••••' : `$${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                      </div>
                      <div className="text-[10.5px] text-[#147A52] font-sans font-semibold">
                        {account.type === 'cd' ? 'Fixed Maturity: Nov 2026' : `Yield: ${account.interestRateAPY || 5.15}% Daily Compounding`}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        aria-label={`Deposit funds into ${account.name} (Account ending in ${lastFour}, Current balance: $${account.balance.toLocaleString()})`}
                        onClick={() => {
                          setTransferToAcc(account.id);
                          setIsTransferModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-md bg-white hover:bg-slate-50 text-[#0B1F6A] border border-[#D8DEE8] text-xs font-semibold transition-colors cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                      >
                        Deposit In
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* =========================================================================
          5. BALANCE LIQUIDITY TRAJECTORY (CHART WITH SMOOTH DRAW ANIMATION)
         ========================================================================= */}
      <motion.div
        variants={itemVariants}
        className="w-full bg-white rounded-xl border border-[#D8DEE8] p-3.5 sm:p-5 md:p-6 shadow-xs space-y-4 sm:space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0B1F6A] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#0B1F6A]" />
              <span>Treasury Liquidity &amp; Cash Flow Trajectory</span>
            </h2>
            <p className="text-xs text-[#5F6670] font-medium mt-0.5">
              Historical net balance progression and overnight settlement velocity
            </p>
          </div>

          {/* Interval Switcher */}
          <div className="flex items-center gap-1 bg-[#F5F7FA] p-1 rounded-md border border-[#D8DEE8]">
            {(['7D', '30D', '90D', '1Y'] as ChartInterval[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setChartInterval(tab)}
                className={`relative px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  chartInterval === tab
                    ? 'text-white'
                    : 'text-[#5F6670] hover:text-[#0B1F6A]'
                }`}
              >
                {chartInterval === tab && (
                  <motion.span
                    layoutId="chartTabBg"
                    className="absolute inset-0 bg-[#0B1F6A] rounded shadow-xs"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{tab === '7D' ? '7 Days' : tab === '30D' ? '30 Days' : tab === '90D' ? '90 Days' : '1 Year'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive SVG Chart Container with AnimatePresence */}
        <div className="relative p-3 sm:p-5 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8] overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-36 sm:h-44 overflow-visible select-none"
          >
            <defs>
              <linearGradient id="bankBalanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B1F6A" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#0B1F6A" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0.25, 0.5, 0.75].map((fraction, idx) => {
              const y = paddingY + fraction * (svgHeight - paddingY * 2);
              return (
                <line
                  key={idx}
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#D8DEE8"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}

            {/* Hover Laser Guide Line */}
            {hoveredPoint && (
              <line
                x1={hoveredPoint.x}
                y1={paddingY}
                x2={hoveredPoint.x}
                y2={svgHeight - paddingY}
                stroke="#0B1F6A"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                className="opacity-70"
              />
            )}

            {/* Filled Area */}
            <path
              key={`area-${chartInterval}`}
              d={areaPath}
              fill="url(#bankBalanceGrad)"
              className="transition-all duration-700 ease-out"
            />

            {/* Smooth Line Curve with CSS Keyframe Animation */}
            <path
              key={`line-${chartInterval}`}
              d={linePath}
              fill="none"
              stroke="#0B1F6A"
              strokeWidth="3"
              strokeLinecap="round"
              className="chart-line-animated"
            />

            {/* Interactive Data Points with Glowing Node */}
            {points.map((p, i) => {
              const isHovered = hoveredPoint?.date === p.date;
              const isLast = i === points.length - 1;

              return (
                <g key={i}>
                  {/* Subtle pulsing beacon on the most recent data point */}
                  {isLast && !isHovered && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="9"
                      fill="#147A52"
                      opacity="0.25"
                      className="animate-ping"
                    />
                  )}

                  {/* Target Area for easier hovering */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="14"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />

                  {/* Visual Point */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 6.5 : isLast ? 5 : 4}
                    fill={isHovered ? '#0B1F6A' : isLast ? '#147A52' : '#ffffff'}
                    stroke={isLast ? '#147A52' : '#0B1F6A'}
                    strokeWidth="2.5"
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />

                  {/* X-axis Date Labels */}
                  <text
                    x={p.x}
                    y={svgHeight - 6}
                    textAnchor="middle"
                    className="text-[10px] fill-[#5F6670] font-mono font-semibold"
                  >
                    {p.date}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Card with Smooth Spring Motion */}
          <AnimatePresence>
            {hoveredPoint && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bg-white border border-[#D8DEE8] rounded-lg shadow-xl p-3 text-xs pointer-events-none z-20"
                style={{
                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                  top: `${(hoveredPoint.y / svgHeight) * 60}%`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <div className="font-bold text-[#20242A] text-[11px] mb-0.5">{hoveredPoint.date}</div>
                <div className="font-mono font-bold text-[#0B1F6A] text-[13px]">
                  {privacyMode ? '••••••••' : `$${hoveredPoint.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                </div>
                <div className="flex items-center gap-2 mt-1 text-[10px] font-semibold">
                  <span className="text-[#147A52]">In: +${hoveredPoint.inflow.toLocaleString()}</span>
                  <span className="text-[#B42318]">Out: -${hoveredPoint.outflow.toLocaleString()}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Activity Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 pt-3 border-t border-[#D8DEE8] text-xs">
          <div className="p-3 sm:p-3.5 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8]">
            <span className="text-[#5F6670] block text-[11px] font-semibold">Total Deposits ({chartInterval})</span>
            <span className="font-mono font-bold text-[#147A52] text-sm sm:text-base">
              {privacyMode ? '••••••••' : '+$48,250.00'}
            </span>
          </div>
          <div className="p-3 sm:p-3.5 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8]">
            <span className="text-[#5F6670] block text-[11px] font-semibold">Total Debits / Wires Out</span>
            <span className="font-mono font-bold text-[#20242A] text-sm sm:text-base">
              {privacyMode ? '••••••••' : '-$18,410.00'}
            </span>
          </div>
          <div className="p-3 sm:p-3.5 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8]">
            <span className="text-[#5F6670] block text-[11px] font-semibold">Net Treasury Retention</span>
            <span className="font-mono font-bold text-[#147A52] text-sm sm:text-base">+61.84%</span>
          </div>
          <div className="p-3 sm:p-3.5 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8]">
            <span className="text-[#5F6670] block text-[11px] font-semibold">Avg Daily Clearing Float</span>
            <span className="font-mono font-bold text-[#20242A] text-sm sm:text-base">
              {privacyMode ? '••••••••' : `$${(computedGrossLedger * 0.98).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
            </span>
          </div>
        </div>
      </motion.div>

      {/* =========================================================================
          6. DUAL SECTION: OFFICIAL TRANSACTION LEDGER & CLIENT CARDS
         ========================================================================= */}
      <motion.div
        variants={itemVariants}
        className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6"
      >
        {/* Left Column (8 cols): REAL BANK TRANSACTION LEDGER WITH 👁 EYE LOCKS */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-[#D8DEE8] p-3.5 sm:p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#0B1F6A] flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#0B1F6A]" />
                <span>Transaction &amp; Wire Settlement Ledger</span>
              </h2>
              <p className="text-xs text-[#5F6670] font-medium mt-0.5">
                Live record of posted debits, credits, Fedwire settlements &amp; book transfers
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('/transactions')}
              className="text-xs font-semibold text-[#101F7A] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              Full Archive ({transactions.length}) &rarr;
            </button>
          </div>

          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 p-1 bg-[#F5F7FA] rounded-md border border-[#D8DEE8]">
              {(
                [
                  { id: 'all', label: 'All Items' },
                  { id: 'deposits', label: 'Credits (+)' },
                  { id: 'withdrawals', label: 'Debits (-)' },
                  { id: 'wires', label: 'Wires' },
                  { id: 'transfers', label: 'Transfers' }
                ] as { id: TxFilter; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTxFilter(tab.id)}
                  className={`relative px-3 py-1.5 rounded text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                    txFilter === tab.id
                      ? 'text-white'
                      : 'text-[#5F6670] hover:text-[#0B1F6A] hover:bg-white/60'
                  }`}
                >
                  {txFilter === tab.id && (
                    <motion.span
                      layoutId="txFilterBg"
                      className="absolute inset-0 bg-[#0B1F6A] rounded shadow-2xs"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-[#5F6670] absolute left-3 top-2.5" />
              <input
                type="text"
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                placeholder="Search ledger..."
                className="w-full pl-9 pr-3 py-1.5 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] focus:border-[#0B1F6A] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Transactions List with Motion Stagger */}
          <div className="divide-y divide-[#D8DEE8] border border-[#D8DEE8] rounded-lg overflow-hidden bg-white shadow-xs">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-[#5F6670] text-xs">
                No transactions found matching criteria.
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredTransactions.map((tx) => {
                  const isDebit = tx.type === 'withdrawal' || tx.type === 'transfer_out' || tx.type === 'bill_payment' || tx.type === 'card_purchase' || tx.amount < 0;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ backgroundColor: 'rgba(245, 247, 250, 0.7)' }}
                      key={tx.id}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isDebit ? 'bg-red-50 text-[#B42318]' : 'bg-[#147A52]/10 text-[#147A52]'
                        }`}>
                          {isDebit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-[#20242A] truncate block">
                              {privacyMode ? '••••••••••••' : tx.description}
                            </span>
                            {tx.referenceNumber && (
                              <span className="text-[10px] font-mono text-[#5F6670] bg-[#F5F7FA] px-1.5 py-0.5 rounded border border-[#D8DEE8] hidden sm:inline">
                                #{tx.referenceNumber}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-[#5F6670] font-medium mt-0.5">
                            <span>{tx.timestamp.slice(0, 10)}</span>
                            <span>•</span>
                            <span className="capitalize">{tx.category || tx.type.replace('_', ' ')}</span>
                            {tx.status === 'pending' && (
                              <>
                                <span>•</span>
                                <span className="text-amber-600 font-bold uppercase text-[10px]">Pending Clearing</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className={`font-mono font-bold text-xs sm:text-sm ${
                            isDebit ? 'text-[#20242A]' : 'text-[#147A52]'
                          }`}>
                            {privacyMode ? '••••••••' : `${isDebit ? '-' : '+'}$${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                          </div>
                          <div className="text-[10px] text-[#5F6670] font-mono capitalize">
                            {tx.status || 'Posted'}
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => {
                            setSelectedTx(tx);
                            setIsReceiptOpen(true);
                          }}
                          className="p-1.5 rounded bg-white hover:bg-slate-100 border border-[#D8DEE8] text-[#0B1F6A] text-xs transition-colors cursor-pointer shadow-2xs"
                          title="View Official Receipt"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): CARDS & SCHEDULED DISBURSEMENTS */}
        <div className="lg:col-span-4 space-y-5 sm:space-y-6">
          {/* Card Management */}
          <div className="w-full bg-white rounded-xl border border-[#D8DEE8] p-3.5 sm:p-5 md:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0B1F6A] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0B1F6A]" />
                <span>Private Wealth Cards</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo('/cards')}
                  className="text-xs font-semibold text-[#101F7A] hover:underline cursor-pointer"
                >
                  Manage &rarr;
                </button>
              </div>
            </div>

            {primaryCard && (
              <div className="space-y-3">
                <RealBankCard
                  card={primaryCard}
                  onToggleFreeze={() => toggleCardFreeze(primaryCard.id)}
                  showControls={false}
                />

                {/* Daily Spending & ATM Limits */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8]">
                    <span className="text-[#5F6670] block text-[10px] font-bold uppercase tracking-wider">Daily POS Limit</span>
                    <span className="font-mono font-bold text-[#147A52] text-sm">
                      ${primaryCard.dailySpendingLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8]">
                    <span className="text-[#5F6670] block text-[10px] font-bold uppercase tracking-wider">Today's Usage</span>
                    <span className="font-mono font-bold text-[#0B1F6A] text-sm">
                      ${primaryCard.currentDaySpent.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Card Status & Lock */}
                <div className="flex items-center justify-between pt-2 border-t border-[#D8DEE8]">
                  <span className="text-xs text-[#5F6670] font-semibold">Card Status</span>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => toggleCardFreeze(primaryCard.id)}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer shadow-2xs border ${
                      primaryCard.isFrozen
                        ? 'bg-rose-50 text-[#B42318] border-rose-300 hover:bg-rose-100'
                        : 'bg-[#147A52]/10 text-[#147A52] border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    {primaryCard.isFrozen ? 'Card Frozen (Click to Unlock)' : 'Active (Click to Freeze)'}
                  </motion.button>
                </div>
              </div>
            )}
          </div>

          {/* Upcoming Obligations & Scheduled Wires */}
          <div className="w-full bg-white rounded-xl border border-[#D8DEE8] p-3.5 sm:p-5 md:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0B1F6A] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0B1F6A]" />
                <span>Scheduled Disbursements</span>
              </h3>
              <button
                type="button"
                onClick={() => navigateTo('/payments')}
                className="text-xs font-semibold text-[#101F7A] hover:underline cursor-pointer"
              >
                All Bills &rarr;
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {bills.slice(0, 3).map((b) => (
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  key={b.id}
                  className="p-3.5 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8] flex items-center justify-between hover:border-[#C4CBD6] transition-all"
                >
                  <div>
                    <span className="font-bold text-[#0B1F6A] block text-xs">{b.payeeName}</span>
                    <span className="text-[11px] text-[#5F6670] font-medium">Due: {b.dueDate}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#20242A] block text-xs">
                      {privacyMode ? '••••••••' : `$${b.amount.toLocaleString()}`}
                    </span>
                    <button
                      type="button"
                      aria-label={`Pay bill now: ${b.payeeName} for $${b.amount.toLocaleString()} USD from ${primaryAccountName}, due ${b.dueDate}`}
                      onClick={() => {
                        setSelectedBillId(b.id);
                        setIsPayBillModalOpen(true);
                      }}
                      className="text-[11px] font-semibold text-[#101F7A] hover:underline cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden rounded px-1"
                    >
                      Pay Now &rarr;
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* =========================================================================
          7. TAX & REGULATORY FILING CENTER
         ========================================================================= */}
      <motion.div variants={itemVariants}>
        <TaxSection />
      </motion.div>

      {/* =========================================================================
          MODAL 1: DIRECT DEPOSIT & WIRE ROUTING INSTRUCTIONS SLIP
         ========================================================================= */}
      <AnimatePresence>
        {isRoutingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-xl max-w-lg w-full border border-[#D8DEE8] p-6 space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE8]">
                <div className="flex items-center gap-2 text-[#0B1F6A] font-bold text-base sm:text-lg">
                  <Landmark className="w-5 h-5 text-[#0B1F6A]" />
                  <span>Direct Deposit &amp; Fedwire Routing Slip</span>
                </div>
                <button
                  type="button"
                  aria-label="Close direct deposit and Fedwire routing slip dialog"
                  onClick={() => setIsRoutingModalOpen(false)}
                  className="text-[#5F6670] hover:text-[#20242A] p-1.5 rounded hover:bg-slate-100 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#5F6670] font-medium leading-relaxed">
                Provide these official instructions to payors, employers, or sending financial institutions to receive automated ACH direct deposits and Fedwires into your account.
              </p>

              {/* Select Target Account */}
              <div className="space-y-1.5">
                <label className="font-bold text-xs text-[#0B1F6A] block">Select Receiving Account:</label>
                <select
                  value={selectedRoutingAccount}
                  onChange={(e) => setSelectedRoutingAccount(e.target.value)}
                  className="w-full p-2.5 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-semibold focus:border-[#0B1F6A] focus:outline-none"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — ••••{a.accountNumber.slice(-4)} (${a.availableBalance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Official Banking Specification Table */}
              <div className="bg-[#F5F7FA] border border-[#D8DEE8] rounded-lg p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#D8DEE8]">
                  <span className="text-[#5F6670] font-sans font-medium">Receiving Depository:</span>
                  <span className="font-bold text-[#0B1F6A]">Northern Trust Company, N.A.</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-[#D8DEE8]">
                  <span className="text-[#5F6670] font-sans font-medium">Bank Address:</span>
                  <span className="font-bold text-[#20242A]">50 South La Salle Street, Chicago, IL 60603</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-[#D8DEE8]">
                  <div>
                    <span className="text-[#5F6670] font-sans font-medium block">Routing Transit Number (ABA / ACH / Wire):</span>
                    <span className="text-[10.5px] text-[#5F6670] font-sans">For domestic ACH direct deposits and incoming Fedwires</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#147A52]">021000089</span>
                    <button
                      type="button"
                      aria-label="Copy ABA Routing Number 021000089 from routing slip"
                      onClick={() => handleCopy('021000089', 'aba_slip')}
                      className="px-2.5 py-1 rounded bg-white border border-[#D8DEE8] hover:border-[#0B1F6A] text-[#0B1F6A] text-[11px] font-sans font-semibold cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                    >
                      {copiedField === 'aba_slip' ? (
                        <span className="text-[#147A52] font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Copied
                        </span>
                      ) : (
                        'Copy'
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-[#D8DEE8]">
                  <span className="text-[#5F6670] font-sans font-medium">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0B1F6A]">{activeRoutingAcc.accountNumber}</span>
                    <button
                      type="button"
                      aria-label={`Copy account number ${activeRoutingAcc.accountNumber} from routing slip`}
                      onClick={() => handleCopy(activeRoutingAcc.accountNumber, 'acc_slip')}
                      className="px-2.5 py-1 rounded bg-white border border-[#D8DEE8] hover:border-[#0B1F6A] text-[#0B1F6A] text-[11px] font-sans font-semibold cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                    >
                      {copiedField === 'acc_slip' ? (
                        <span className="text-[#147A52] font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Copied
                        </span>
                      ) : (
                        'Copy'
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-[#D8DEE8]">
                  <span className="text-[#5F6670] font-sans font-medium">SWIFT / BIC (International):</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#20242A]">{activeRoutingAcc.swiftBic || 'NTCOUS33NYC'}</span>
                    <button
                      type="button"
                      aria-label={`Copy SWIFT BIC code ${activeRoutingAcc.swiftBic || 'NTCOUS33NYC'} from routing slip`}
                      onClick={() => handleCopy(activeRoutingAcc.swiftBic || 'NTCOUS33NYC', 'swift_slip')}
                      className="px-2.5 py-1 rounded bg-white border border-[#D8DEE8] hover:border-[#0B1F6A] text-[#0B1F6A] text-[11px] font-sans font-semibold cursor-pointer transition-colors shadow-2xs inline-flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                    >
                      {copiedField === 'swift_slip' ? (
                        <span className="text-[#147A52] font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Copied
                        </span>
                      ) : (
                        'Copy'
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#5F6670] font-sans font-medium">Beneficiary Name:</span>
                  <span className="font-bold text-[#0B1F6A]">{currentUser?.fullName}</span>
                </div>
              </div>

              {/* Voided Check Preview Graphic */}
              <div className="p-3 bg-[#147A52]/10 border border-[#147A52]/20 rounded-lg text-center">
                <span className="text-[11px] text-[#147A52] font-bold block">
                  Official Account Verification Slip • Ready for Employer / Brokerage Submission
                </span>
                <span className="font-mono text-[10.5px] text-emerald-950 font-bold mt-0.5 block">
                  ⑆021000089⑆ {activeRoutingAcc.accountNumber} ⑈ 1001
                </span>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  aria-label="Close direct deposit and Fedwire routing slip"
                  onClick={() => setIsRoutingModalOpen(false)}
                  className="px-4 py-2 rounded-md bg-white hover:bg-slate-50 border border-[#D8DEE8] text-[#20242A] font-semibold cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                >
                  Close Slip
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  aria-label="Print official account verification and Fedwire routing slip"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-md bg-[#0B1F6A] hover:bg-[#081552] text-white font-semibold cursor-pointer shadow-xs transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Official Slip</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 2: QUICK WIRE / INTERNAL TRANSFER
         ========================================================================= */}
      <AnimatePresence>
        {isTransferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-xl max-w-md w-full border border-[#D8DEE8] p-6 space-y-4 shadow-2xl text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE8]">
                <div className="flex items-center gap-2 text-[#0B1F6A] font-bold text-base sm:text-lg">
                  <SendHorizontal className="w-5 h-5 text-[#0B1F6A]" />
                  <span>Instant Account Transfer</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="text-[#5F6670] hover:text-[#20242A] p-1.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {transferSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-lg bg-[#147A52]/10 border border-emerald-300 text-[#147A52] text-center space-y-2"
                >
                  <CheckCircle2 className="w-8 h-8 mx-auto text-[#147A52]" />
                  <p className="font-bold text-sm">{transferSuccess}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleExecuteTransfer} className="space-y-3.5">
                  <div>
                    <label className="font-bold text-xs text-[#0B1F6A] block mb-1">From Source Account</label>
                    <select
                      value={transferFromAcc}
                      onChange={(e) => setTransferFromAcc(e.target.value)}
                      className="w-full p-2.5 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-semibold focus:border-[#0B1F6A] focus:outline-none"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} (${a.availableBalance.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-xs text-[#0B1F6A] block mb-1">To Destination Account</label>
                    <select
                      value={transferToAcc}
                      onChange={(e) => setTransferToAcc(e.target.value)}
                      className="w-full p-2.5 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-semibold focus:border-[#0B1F6A] focus:outline-none"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id} disabled={a.id === transferFromAcc}>
                          {a.name} (${a.availableBalance.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-xs text-[#0B1F6A] block mb-1">Amount ($ USD)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-2.5 border border-[#D8DEE8] rounded-md text-xs font-mono font-bold text-[#20242A] focus:border-[#0B1F6A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-xs text-[#0B1F6A] block mb-1">Memo / Purpose</label>
                    <input
                      type="text"
                      value={transferMemo}
                      onChange={(e) => setTransferMemo(e.target.value)}
                      placeholder="Transfer description or memo"
                      className="w-full p-2.5 border border-[#D8DEE8] rounded-md text-xs text-[#20242A] focus:border-[#0B1F6A] focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2.5">
                    <button
                      type="button"
                      aria-label="Cancel transfer"
                      onClick={() => setIsTransferModalOpen(false)}
                      className="px-4 py-2 rounded-md bg-white hover:bg-slate-50 border border-[#D8DEE8] text-[#20242A] font-semibold cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      aria-label="Authorize and execute internal account transfer"
                      className="px-4.5 py-2 rounded-md bg-[#0B1F6A] hover:bg-[#081552] text-white font-semibold cursor-pointer shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                    >
                      Authorize Transfer
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 3: QUICK DEPOSIT
         ========================================================================= */}
      <AnimatePresence>
        {isDepositModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-xl max-w-md w-full border border-[#D8DEE8] p-6 space-y-4 shadow-2xl text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE8]">
                <div className="flex items-center gap-2 text-[#0B1F6A] font-bold text-base sm:text-lg">
                  <ArrowDownCircle className="w-5 h-5 text-[#147A52]" />
                  <span>Remote Check &amp; Funds Deposit</span>
                </div>
                <button
                  type="button"
                  aria-label="Close remote check and funds deposit dialog"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="text-[#5F6670] hover:text-[#20242A] p-1.5 rounded hover:bg-slate-100 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {depositSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-lg bg-[#147A52]/10 border border-emerald-300 text-[#147A52] text-center space-y-2"
                >
                  <CheckCircle2 className="w-8 h-8 mx-auto text-[#147A52]" />
                  <p className="font-bold text-sm">{depositSuccess}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleExecuteDeposit} className="space-y-3.5">
                  <div>
                    <label className="font-bold text-xs text-[#0B1F6A] block mb-1">Deposit Channel</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'check', label: 'Remote Check' },
                        { id: 'wire', label: 'Fedwire In' },
                        { id: 'ach', label: 'ACH Direct' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          aria-label={`Select deposit channel: ${m.label}`}
                          aria-pressed={depositMethod === m.id}
                          onClick={() => setDepositMethod(m.id as any)}
                          className={`p-2 rounded-md border text-center font-semibold cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden ${
                            depositMethod === m.id
                              ? 'bg-[#0B1F6A] text-white border-[#0B1F6A] shadow-xs'
                              : 'bg-[#F5F7FA] text-[#5F6670] border-[#D8DEE8] hover:bg-white'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-xs text-[#0B1F6A] block mb-1">Deposit Into Account</label>
                    <select
                      value={depositAcc}
                      onChange={(e) => setDepositAcc(e.target.value)}
                      className="w-full p-2.5 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-semibold focus:border-[#0B1F6A] focus:outline-none"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} (${a.availableBalance.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-xs text-[#0B1F6A] block mb-1">Deposit Amount ($ USD)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-2.5 border border-[#D8DEE8] rounded-md text-xs font-mono font-bold text-[#20242A] focus:border-[#0B1F6A] focus:outline-none"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8] text-[11px] text-[#5F6670]">
                    <p className="font-bold text-[#0B1F6A] mb-0.5">Private Wealth Instant Clearance</p>
                    Incoming deposits under $100,000 clear with zero hold under Tier 3 client privileges.
                  </div>

                  <div className="pt-2 flex justify-end gap-2.5">
                    <button
                      type="button"
                      aria-label="Cancel deposit"
                      onClick={() => setIsDepositModalOpen(false)}
                      className="px-4 py-2 rounded-md bg-white hover:bg-slate-50 border border-[#D8DEE8] text-[#20242A] font-semibold cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      aria-label="Confirm and submit deposit for verification"
                      className="px-4.5 py-2 rounded-md bg-[#0B1F6A] hover:bg-[#081552] text-white font-semibold cursor-pointer shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                    >
                      Confirm Deposit
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 3B: QUICK WITHDRAW / OUTBOUND DISBURSAL
         ========================================================================= */}
      <AnimatePresence>
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-xl max-w-md w-full border border-[#D8DEE8] p-6 space-y-4 shadow-2xl text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE8]">
                <div className="flex items-center gap-2 text-[#0B1F6A] font-bold text-base sm:text-lg">
                  <ArrowUpRight className="w-5 h-5 text-[#B42318]" />
                  <span>Withdraw &amp; Outbound Disbursal</span>
                </div>
                <button
                  type="button"
                  aria-label="Close withdrawal and outbound disbursal dialog"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="text-[#5F6670] hover:text-[#20242A] p-1.5 rounded hover:bg-slate-100 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {withdrawSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-lg bg-[#147A52]/10 border border-emerald-300 text-[#147A52] text-center space-y-2"
                >
                  <CheckCircle2 className="w-8 h-8 mx-auto text-[#147A52]" />
                  <p className="font-bold text-sm">{withdrawSuccess}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleExecuteWithdraw} className="space-y-3.5">
                  <div>
                    <label className="font-bold text-xs text-[#0B1F6A] block mb-1">Withdrawal Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'wire', label: 'Fedwire (Same-Day)' },
                        { id: 'ach', label: 'ACH Direct Transfer' },
                        { id: 'check', label: 'Cashier Check' }
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          aria-label={`Select withdrawal method: ${m.label}`}
                          aria-pressed={withdrawMethod === m.id}
                          onClick={() => setWithdrawMethod(m.id as any)}
                          className={`p-2 rounded-md border text-center font-semibold cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden ${
                            withdrawMethod === m.id
                              ? 'bg-[#0B1F6A] text-white border-[#0B1F6A] shadow-xs'
                              : 'bg-[#F5F7FA] text-[#5F6670] border-[#D8DEE8] hover:bg-white'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-xs text-[#0B1F6A] block mb-1">Debit From Account</label>
                    <select
                      value={withdrawFromAcc}
                      onChange={(e) => setWithdrawFromAcc(e.target.value)}
                      className="w-full p-2.5 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-semibold focus:border-[#0B1F6A] focus:outline-none"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} (${a.availableBalance.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-xs text-[#0B1F6A] block mb-1">Destination Name / Beneficiary</label>
                    <input
                      type="text"
                      required
                      value={withdrawDestination}
                      onChange={(e) => setWithdrawDestination(e.target.value)}
                      placeholder="Receiving institution or beneficiary name"
                      className="w-full p-2.5 border border-[#D8DEE8] rounded-md text-xs text-[#20242A] focus:border-[#0B1F6A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-xs text-[#0B1F6A] block mb-1">Withdrawal Amount ($ USD)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-2.5 border border-[#D8DEE8] rounded-md text-xs font-mono font-bold text-[#20242A] focus:border-[#0B1F6A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-xs text-[#0B1F6A] block mb-1">Memo / Wire Purpose</label>
                    <input
                      type="text"
                      value={withdrawMemo}
                      onChange={(e) => setWithdrawMemo(e.target.value)}
                      placeholder="Reason for withdrawal"
                      className="w-full p-2.5 border border-[#D8DEE8] rounded-md text-xs text-[#20242A] focus:border-[#0B1F6A] focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2.5">
                    <button
                      type="button"
                      aria-label="Cancel withdrawal"
                      onClick={() => setIsWithdrawModalOpen(false)}
                      className="px-4 py-2 rounded-md bg-white hover:bg-slate-50 border border-[#D8DEE8] text-[#20242A] font-semibold cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      aria-label="Authorize and execute outbound withdrawal"
                      className="px-4.5 py-2 rounded-md bg-[#0B1F6A] hover:bg-[#081552] text-white font-semibold cursor-pointer shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                    >
                      Authorize Outbound Disbursal
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 4: PAY BILL
         ========================================================================= */}
      <AnimatePresence>
        {isPayBillModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-xl max-w-sm w-full border border-[#D8DEE8] p-6 space-y-4 shadow-2xl text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE8]">
                <div className="flex items-center gap-2 text-[#0B1F6A] font-bold text-base sm:text-lg">
                  <Receipt className="w-5 h-5 text-[#0B1F6A]" />
                  <span>Pay Outstanding Obligation</span>
                </div>
                <button
                  type="button"
                  aria-label="Close bill payment dialog"
                  onClick={() => setIsPayBillModalOpen(false)}
                  className="text-[#5F6670] hover:text-[#20242A] p-1.5 rounded hover:bg-slate-100 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {payBillSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-lg bg-[#147A52]/10 border border-emerald-300 text-[#147A52] text-center space-y-2"
                >
                  <CheckCircle2 className="w-8 h-8 mx-auto text-[#147A52]" />
                  <p className="font-bold text-sm">{payBillSuccess}</p>
                </motion.div>
              ) : (
                <form onSubmit={handleExecutePayBill} className="space-y-3.5">
                  <div>
                    <label className="font-bold text-xs text-[#0B1F6A] block mb-1">Select Payee / Creditor</label>
                    <select
                      value={selectedBillId}
                      onChange={(e) => setSelectedBillId(e.target.value)}
                      className="w-full p-2.5 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-semibold focus:border-[#0B1F6A] focus:outline-none"
                    >
                      {bills.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.payeeName} — ${b.amount.toLocaleString()} (Due {b.dueDate})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-xs text-[#0B1F6A] block mb-1">Debit From Account</label>
                    <select className="w-full p-2.5 border border-[#D8DEE8] rounded-md text-xs bg-white text-[#20242A] font-semibold focus:border-[#0B1F6A] focus:outline-none">
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} (${a.availableBalance.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2 flex justify-end gap-2.5">
                    <button
                      type="button"
                      aria-label="Cancel bill payment"
                      onClick={() => setIsPayBillModalOpen(false)}
                      className="px-4 py-2 rounded-md bg-white hover:bg-slate-50 border border-[#D8DEE8] text-[#20242A] font-semibold cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                    >
                      Cancel
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      aria-label="Authorize and execute payee bill payment"
                      className="px-4.5 py-2 rounded-md bg-[#0B1F6A] hover:bg-[#081552] text-white font-semibold cursor-pointer shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                    >
                      Authorize Payment
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipts, Dispute & Statement Modals */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={selectedTx}
      />
      <DisputeModal
        isOpen={isDisputeOpen}
        onClose={() => setIsDisputeOpen(false)}
        transaction={selectedTx}
      />
      <StatementTaxModal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
      />
    </motion.div>
  );
};
