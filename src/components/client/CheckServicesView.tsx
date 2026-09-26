import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  CheckSquare,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Camera,
  Upload,
  Building2,
  DollarSign,
  FileText,
  Truck,
  Ban,
  Search,
  ChevronRight,
  Info
} from 'lucide-react';
import { NorthernTrustLogo } from '../common/NorthernTrustLogo';

export const CheckServicesView: React.FC = () => {
  const {
    currentUser,
    accounts,
    checkDeposits,
    stoppedChecks,
    checkbookOrders,
    depositCheck,
    placeStopPayment,
    orderCheckbook
  } = useBanking();

  const [activeTab, setActiveTab] = useState<'deposit' | 'voided' | 'order' | 'stop_payment' | 'history'>('deposit');

  // Deposit State
  const [depositAccountId, setDepositAccountId] = useState(accounts[0]?.id || '');
  const [depositAmount, setDepositAmount] = useState('12500.00');
  const [depositCheckNumber, setDepositCheckNumber] = useState('1045');
  const [depositMemo, setDepositMemo] = useState('Quarterly Advisory Retainer');
  const [isFrontView, setIsFrontView] = useState(true);
  const [hasEndorsed, setHasEndorsed] = useState(true);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<{ ref: string; amount: number } | null>(null);

  // Stop Payment State
  const [stopCheckNum, setStopCheckNum] = useState('');
  const [stopPayee, setStopPayee] = useState('');
  const [stopAmount, setStopAmount] = useState('');
  const [stopReason, setStopReason] = useState<'Lost' | 'Stolen' | 'Dispute' | 'Duplicate'>('Lost');
  const [stopSuccessMsg, setStopSuccessMsg] = useState<string | null>(null);

  // Checkbook Order State
  const [orderStyle, setOrderStyle] = useState<'Executive Navy Blue' | 'Classic Parchment' | 'Monogram Gold' | 'Carbonless Business'>('Executive Navy Blue');
  const [orderQuantity, setOrderQuantity] = useState<number>(200);
  const [orderStartNum, setOrderStartNum] = useState<number>(1100);
  const [orderAddress, setOrderAddress] = useState(
    `${currentUser?.address.street || '740 Park Avenue, Penthouse B'}, ${currentUser?.address.city || 'New York'}, ${currentUser?.address.state || 'NY'} ${currentUser?.address.postalCode || '10021'}`
  );
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<{ track: string; count: number } | null>(null);

  const selectedAccount = accounts.find(a => a.id === depositAccountId) || accounts[0];

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0 || !depositCheckNumber) return;

    const res = depositCheck(depositAccountId, amt, depositCheckNumber, depositMemo);
    if (res.success) {
      setDepositSuccessMsg({ ref: res.referenceNumber, amount: amt });
      setTimeout(() => {
        setDepositSuccessMsg(null);
        setDepositCheckNumber((parseInt(depositCheckNumber, 10) + 1).toString());
      }, 3500);
    }
  };

  const handleStopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stopCheckNum || !stopPayee) return;

    const amt = stopAmount ? parseFloat(stopAmount) : undefined;
    placeStopPayment(depositAccountId, stopCheckNum, stopPayee, amt, stopReason);
    setStopSuccessMsg(`Stop payment order activated for Check #${stopCheckNum}. Valid for 180 days.`);
    setStopCheckNum('');
    setStopPayee('');
    setStopAmount('');
    setTimeout(() => setStopSuccessMsg(null), 4000);
  };

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = orderCheckbook(depositAccountId, orderStyle, orderQuantity, orderStartNum, orderAddress);
    if (res.success) {
      setOrderSuccessMsg({ track: res.trackingNumber, count: orderQuantity });
      setTimeout(() => setOrderSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0B1F6A]/10 border-2 border-[#0B1F6A]/20 text-[#0B1F6A] text-xs font-black mb-2 shadow-2xs">
            <ShieldCheck className="w-4 h-4 stroke-[2.25]" /> Federal Reserve Reg CC Clearing Enclave
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-[#20242A]">
            Cheque Management &amp; Remote Deposit
          </h1>
          <p className="text-xs text-[#5F6670] mt-1 font-medium">
            Deposit paper checks with automated provisional clearing, print official voided checks, order security checkbooks, and manage stop-payments.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-[#F5F7FA] p-1.5 rounded-xl border-2 border-[#D8DEE8] text-xs overflow-x-auto shrink-0">
          {[
            { id: 'deposit', label: 'Remote Deposit (RDC)', icon: Camera },
            { id: 'voided', label: 'Print Voided Check', icon: Printer },
            { id: 'order', label: 'Order Checkbook', icon: Truck },
            { id: 'stop_payment', label: 'Stop Payment', icon: Ban },
            { id: 'history', label: 'Deposit History', icon: Clock }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === t.id
                    ? 'bg-[#0B1F6A] text-white shadow-xs'
                    : 'text-[#5F6670] hover:text-[#20242A] hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 stroke-[2.25]" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REMOTE CHECK DEPOSIT (RDC) */}
      {/* ========================================================================= */}
      {activeTab === 'deposit' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Check Capture Simulator & Interactive Check Graphic */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE8]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0B1F6A]/10 text-[#0B1F6A] flex items-center justify-center font-black text-xs">
                    RDC
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-[#20242A]">Optical MICR Check Scanner</h2>
                    <p className="text-[11px] text-[#5F6670]">High-resolution digital check preview</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[#F5F7FA] p-1 rounded-lg border border-[#D8DEE8] text-xs">
                  <button
                    type="button"
                    onClick={() => setIsFrontView(true)}
                    className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      isFrontView ? 'bg-white text-[#0B1F6A] shadow-xs' : 'text-[#5F6670]'
                    }`}
                  >
                    Front of Check
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFrontView(false)}
                    className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      !isFrontView ? 'bg-white text-[#0B1F6A] shadow-xs' : 'text-[#5F6670]'
                    }`}
                  >
                    Back (Endorsement)
                  </button>
                </div>
              </div>

              {/* Graphical Check Canvas */}
              {isFrontView ? (
                <div className="bg-[#EBF1FA] p-6 sm:p-7 rounded-xl border-2 border-[#B0C4DE] shadow-inner font-serif text-[#1C2D42] relative overflow-hidden space-y-4">
                  {/* Watermark Logo */}
                  <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
                    <NorthernTrustLogo className="w-48 h-48" />
                  </div>

                  {/* Top Line: Drawer & Date & Check Number */}
                  <div className="flex justify-between items-start font-sans">
                    <div>
                      <p className="font-bold text-xs uppercase tracking-wide text-[#0B1F6A]">Vance Global Holdings LLC</p>
                      <p className="text-[10px] text-[#5F6670]">Treasury Operations • Suite 4200</p>
                      <p className="text-[10px] text-[#5F6670]">New York, NY 10022</p>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="font-mono text-base font-black text-[#0B1F6A]">#{depositCheckNumber}</span>
                      <div className="text-[11px] font-mono font-bold text-[#5F6670]">
                        Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Payee Line */}
                  <div className="pt-2 flex items-baseline gap-3 border-b border-[#1C2D42]/30 pb-1.5">
                    <span className="font-sans text-[10px] uppercase font-bold text-[#5F6670] shrink-0">PAY TO THE ORDER OF</span>
                    <span className="font-sans font-black text-sm text-[#0B1F6A] flex-1">
                      {currentUser?.fullName || 'Angelina Jolie'}
                    </span>
                    <span className="font-mono font-black text-base px-2 py-0.5 bg-white/70 border border-[#B0C4DE] rounded text-[#0B1F6A]">
                      ${parseFloat(depositAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Words Amount Line */}
                  <div className="flex items-baseline gap-3 border-b border-[#1C2D42]/30 pb-1.5">
                    <span className="font-serif italic text-xs text-[#20242A] flex-1">
                      {parseFloat(depositAmount || '0') > 0 ? 'Certified Depository Funds as Endorsed' : 'Zero and 00/100'}
                    </span>
                    <span className="font-sans text-[10px] uppercase font-bold text-[#5F6670]">DOLLARS</span>
                  </div>

                  {/* Memo and Signature */}
                  <div className="pt-2 flex justify-between items-end gap-6 font-sans">
                    <div className="border-b border-[#1C2D42]/30 pb-1 w-1/2">
                      <span className="text-[9px] uppercase font-bold text-[#5F6670] block">MEMO</span>
                      <span className="text-xs font-semibold text-[#20242A]">{depositMemo || 'General Settlement'}</span>
                    </div>

                    <div className="border-b border-[#1C2D42]/30 pb-1 w-1/2 text-right">
                      <div className="font-serif italic text-base font-bold text-[#0B1F6A]">
                        Eleanor Sterling
                      </div>
                      <span className="text-[9px] uppercase font-bold text-[#5F6670]">AUTHORIZED SIGNATURE</span>
                    </div>
                  </div>

                  {/* MICR Line */}
                  <div className="pt-4 text-center font-mono text-xs sm:text-sm tracking-widest text-[#0B1F6A] font-bold select-all bg-white/50 py-1.5 rounded border border-[#B0C4DE]/60">
                    ⑆021000089⑆ {selectedAccount?.accountNumber || '8849019233'}⑈ {depositCheckNumber}
                  </div>
                </div>
              ) : (
                /* Back of Check Endorsement */
                <div className="bg-[#FAF5EF] p-8 rounded-xl border-2 border-amber-300 font-sans relative space-y-6">
                  <div className="max-w-xs ml-auto border-l-2 border-dashed border-slate-400 pl-5 space-y-4">
                    <span className="text-[10px] uppercase font-bold text-[#5F6670] tracking-wider block">
                      ENDORSE HERE (DO NOT WRITE BELOW THIS LINE)
                    </span>

                    <div className="font-serif italic text-lg font-bold text-[#0B1F6A] border-b border-slate-400 pb-1">
                      Angelina Jolie
                    </div>

                    <div className="p-2.5 rounded bg-emerald-50 border border-emerald-300 text-[11px] text-emerald-900 font-bold space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Restrictive Endorsement Applied</span>
                      </div>
                      <p className="font-mono text-[10px] font-normal">
                        "For Mobile Deposit Only at Northern Trust"
                      </p>
                    </div>

                    <div className="text-[9px] text-[#5F6670]">
                      Federal Reserve Reg CC endorsement clearance approved. Security ink verified.
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-[#D8DEE8] flex items-center justify-between text-xs text-[#5F6670]">
                <span>Daily Mobile Deposit Limit: <strong>$250,000.00</strong></span>
                <span>Funds Availability: <strong>Immediate Provisional Clearing</strong></span>
              </div>
            </div>
          </div>

          {/* Right: Deposit Execution Form */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-sm text-[#20242A] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#0B1F6A]" />
                <span>Deposit Instruction</span>
              </h2>

              {depositSuccessMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 space-y-1.5 animate-fade-in">
                  <div className="flex items-center gap-2 font-black text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Check Deposit Cleared &amp; Credited!</span>
                  </div>
                  <p className="text-xs">
                    ${depositSuccessMsg.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} has been provisionally credited to your account.
                  </p>
                  <p className="font-mono text-[10px] text-emerald-800">
                    Reference: {depositSuccessMsg.ref}
                  </p>
                </div>
              )}

              <form onSubmit={handleDepositSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#20242A] block mb-1">Destination Account</label>
                  <select
                    value={depositAccountId}
                    onChange={e => setDepositAccountId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] font-bold text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} — ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({acc.currency})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#20242A] block mb-1">Check Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 font-bold text-base text-[#5F6670]">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={depositAmount}
                      onChange={e => setDepositAmount(e.target.value)}
                      required
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] font-mono font-bold text-sm text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#20242A] block mb-1">Check Number</label>
                    <input
                      type="text"
                      value={depositCheckNumber}
                      onChange={e => setDepositCheckNumber(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] font-mono font-bold text-xs text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-[#20242A] block mb-1">Memo / Purpose</label>
                    <input
                      type="text"
                      value={depositMemo}
                      onChange={e => setDepositMemo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] font-medium text-xs text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
                    />
                  </div>
                </div>

                <div className="p-3 bg-[#F5F7FA] rounded-xl border border-[#D8DEE8] space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasEndorsed}
                      onChange={e => setHasEndorsed(e.target.checked)}
                      className="mt-0.5 rounded text-[#0B1F6A] focus:ring-[#0B1F6A]"
                    />
                    <span className="text-[11px] text-[#5F6670]">
                      I confirm the check has been restrictively endorsed with <strong>"For Mobile Deposit Only at Northern Trust"</strong> and my physical signature.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!hasEndorsed}
                  className="w-full py-3 px-4 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Camera className="w-4 h-4 stroke-[2.25]" />
                  <span>Verify Check &amp; Credit Account</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PRINT OFFICIAL VOIDED CHECK */}
      {/* ========================================================================= */}
      {activeTab === 'voided' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-base text-[#20242A]">Official Printable Voided Check</h2>
              <p className="text-xs text-[#5F6670] mt-0.5">
                Use this verified voided check to configure direct deposits with your employer, payroll provider, or automated vendor clearing.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4.5 py-2.5 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
            >
              <Printer className="w-4 h-4 stroke-[2.25]" />
              <span>Print Voided Check</span>
            </button>
          </div>

          {/* High-Resolution Printable Voided Check */}
          <div className="w-full max-w-3xl mx-auto bg-[#EDF3FA] p-8 sm:p-10 rounded-2xl border-4 border-[#9CB6D6] shadow-xl relative overflow-hidden font-serif space-y-6 print:border-2 print:shadow-none">
            {/* Massive VOID Diagonal Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
              <span className="text-7xl sm:text-9xl font-black text-rose-500/20 rotate-[-25deg] tracking-widest font-sans border-8 border-rose-500/20 px-8 py-2 rounded-2xl">
                VOID
              </span>
            </div>

            {/* Top Row */}
            <div className="flex justify-between items-start font-sans relative z-0">
              <div>
                <p className="font-black text-sm uppercase text-[#0B1F6A]">{currentUser?.fullName || 'Angelina Jolie'}</p>
                <p className="text-xs text-[#5F6670] font-medium">{currentUser?.address.street || '740 Park Avenue, Penthouse B'}</p>
                <p className="text-xs text-[#5F6670] font-medium">
                  {currentUser?.address.city || 'New York'}, {currentUser?.address.state || 'NY'} {currentUser?.address.postalCode || '10021'}
                </p>
              </div>

              <div className="text-right space-y-1">
                <span className="font-mono text-xl font-black text-[#0B1F6A]"># 1042</span>
                <div className="text-xs font-mono font-bold text-[#5F6670]">Date: •••• •••• ••••</div>
              </div>
            </div>

            {/* Payee Row */}
            <div className="flex items-baseline gap-3 border-b-2 border-[#1C2D42]/40 pb-2 relative z-0">
              <span className="font-sans text-[10px] uppercase font-bold text-[#5F6670] shrink-0">PAY TO THE ORDER OF</span>
              <span className="font-sans font-black text-lg text-rose-700/80 flex-1 tracking-widest">
                *** VOID - NON NEGOTIABLE ***
              </span>
              <span className="font-mono font-black text-lg px-3 py-1 bg-white/80 border border-slate-300 rounded text-slate-500">
                $ •••••••••
              </span>
            </div>

            {/* Middle Bank Letterhead */}
            <div className="flex justify-between items-center py-2 relative z-0 font-sans">
              <div className="flex items-center gap-2.5">
                <NorthernTrustLogo className="w-8 h-8 text-[#0B1F6A]" color="#0B1F6A" />
                <div>
                  <p className="font-black text-xs uppercase text-[#0B1F6A]">Northern Trust Company</p>
                  <p className="text-[10px] text-[#5F6670]">50 South LaSalle Street, Chicago, IL • 1 Wall Street, NYC</p>
                </div>
              </div>

              <div className="text-right text-[11px] text-[#5F6670]">
                <span>FOR DIRECT DEPOSIT / ACH CLEARING ONLY</span>
              </div>
            </div>

            {/* Memo and Signature */}
            <div className="flex justify-between items-end gap-8 font-sans pt-2 relative z-0">
              <div className="border-b-2 border-[#1C2D42]/40 pb-1.5 w-1/2">
                <span className="text-[9px] uppercase font-bold text-[#5F6670] block">MEMO</span>
                <span className="text-xs font-mono font-bold text-[#0B1F6A]">DIRECT DEPOSIT SETUP ONLY</span>
              </div>

              <div className="border-b-2 border-[#1C2D42]/40 pb-1.5 w-1/2 text-right">
                <span className="font-serif italic text-lg font-black text-rose-600/70 block">VOID</span>
                <span className="text-[9px] uppercase font-bold text-[#5F6670]">AUTHORIZED SIGNATURE</span>
              </div>
            </div>

            {/* MICR Encoding Line */}
            <div className="pt-4 text-center font-mono text-sm sm:text-base tracking-widest text-[#0B1F6A] font-bold select-all bg-white/70 py-2 rounded-xl border border-slate-300 relative z-0">
              ⑆021000089⑆ {selectedAccount?.accountNumber || '8849019233'}⑈ 1042
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ORDER OFFICIAL CHECKBOOK */}
      {/* ========================================================================= */}
      {activeTab === 'order' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-base text-[#20242A] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#0B1F6A]" />
                <span>Select Security Checkbook Style</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: 'Executive Navy Blue',
                    desc: 'Micro-printed chemical sensitive security paper with gold foil emblem',
                    badge: 'POPULAR'
                  },
                  {
                    id: 'Classic Parchment',
                    desc: 'Traditional linen weave texture with watermark fiber authentication',
                    badge: 'TRADITIONAL'
                  },
                  {
                    id: 'Monogram Gold',
                    desc: 'Raised monogram crest with double guilloche anti-copy patterns',
                    badge: 'PRESTIGE'
                  },
                  {
                    id: 'Carbonless Business',
                    desc: '2-part checkbook with automatic yellow carbonless customer copy',
                    badge: 'BUSINESS'
                  }
                ].map(style => (
                  <div
                    key={style.id}
                    onClick={() => setOrderStyle(style.id as any)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      orderStyle === style.id
                        ? 'border-[#0B1F6A] bg-[#0B1F6A]/5 shadow-xs'
                        : 'border-[#D8DEE8] bg-[#F5F7FA] hover:border-slate-400'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-black text-xs text-[#20242A]">{style.id}</span>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#0B1F6A]/10 text-[#0B1F6A]">
                        {style.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5F6670] leading-relaxed">{style.desc}</p>
                  </div>
                ))}
              </div>

              {/* Quantity Options */}
              <div>
                <label className="font-bold text-xs text-[#20242A] block mb-2">Select Check Quantity</label>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {[
                    { count: 100, label: '100 Checks', fee: '$0.00 (Waived)' },
                    { count: 200, label: '200 Checks', fee: '$0.00 (Waived)' },
                    { count: 400, label: '400 Checks', fee: '$0.00 (Waived)' }
                  ].map(q => (
                    <button
                      key={q.count}
                      type="button"
                      onClick={() => setOrderQuantity(q.count)}
                      className={`p-3 rounded-xl border-2 font-bold text-center transition-all cursor-pointer ${
                        orderQuantity === q.count
                          ? 'border-[#0B1F6A] bg-[#0B1F6A] text-white shadow-xs'
                          : 'border-[#D8DEE8] bg-white text-[#20242A] hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-black text-sm">{q.label}</div>
                      <div className={`text-[10px] mt-0.5 ${orderQuantity === q.count ? 'text-emerald-300' : 'text-[#5F6670]'}`}>
                        {q.fee}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-sm text-[#20242A]">Order &amp; Delivery Details</h2>

              {orderSuccessMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 space-y-1.5 animate-fade-in text-xs">
                  <div className="flex items-center gap-2 font-black">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Checkbook Order Dispatched!</span>
                  </div>
                  <p>
                    Your box of {orderSuccessMsg.count} {orderStyle} checks is being printed and shipped via FedEx Priority.
                  </p>
                  <p className="font-mono text-[10.5px] text-emerald-800">
                    Tracking #: {orderSuccessMsg.track}
                  </p>
                </div>
              )}

              <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-[#20242A] block mb-1">Starting Check Number</label>
                  <input
                    type="number"
                    value={orderStartNum}
                    onChange={e => setOrderStartNum(parseInt(e.target.value, 10))}
                    required
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] font-mono font-bold text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
                  />
                  <span className="text-[10px] text-[#5F6670] mt-1 block">
                    Recommended: Start after your current check register #1049.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-[#20242A] block mb-1">Secure Delivery Address</label>
                  <textarea
                    rows={3}
                    value={orderAddress}
                    onChange={e => setOrderAddress(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] font-medium text-xs text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-[#D8DEE8] text-[11px] text-[#5F6670] space-y-1">
                  <div className="flex justify-between font-bold text-[#20242A]">
                    <span>Courier Delivery:</span>
                    <span className="text-emerald-700">FedEx Priority Overnight (Free)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Private Client Benefit:</span>
                    <span>Complimentary checkbooks included</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Truck className="w-4 h-4 stroke-[2.25]" />
                  <span>Submit Checkbook Order</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: STOP PAYMENT REGISTRY */}
      {/* ========================================================================= */}
      {activeTab === 'stop_payment' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-4 text-xs">
              <div>
                <h2 className="font-bold text-sm text-[#20242A] flex items-center gap-2">
                  <Ban className="w-4 h-4 text-rose-600" />
                  <span>Place Immediate Stop Payment</span>
                </h2>
                <p className="text-[11px] text-[#5F6670] mt-0.5">
                  Orders a permanent hold preventing check clearance for 180 days across the clearing network.
                </p>
              </div>

              {stopSuccessMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 font-bold animate-fade-in">
                  {stopSuccessMsg}
                </div>
              )}

              <form onSubmit={handleStopSubmit} className="space-y-4">
                <div>
                  <label className="font-bold text-[#20242A] block mb-1">Check Number</label>
                  <input
                    type="text"
                    value={stopCheckNum}
                    onChange={e => setStopCheckNum(e.target.value)}
                    required
                    placeholder="Check number"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] font-mono font-bold text-[#20242A] focus:outline-none focus:border-rose-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#20242A] block mb-1">Payee Name</label>
                  <input
                    type="text"
                    value={stopPayee}
                    onChange={e => setStopPayee(e.target.value)}
                    required
                    placeholder="Name of individual or company check was written to"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] font-medium text-[#20242A] focus:outline-none focus:border-rose-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#20242A] block mb-1">Approximate Amount (USD, Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={stopAmount}
                    onChange={e => setStopAmount(e.target.value)}
                    placeholder="Leave blank to block any amount with this check #"
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] font-mono text-[#20242A] focus:outline-none focus:border-rose-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#20242A] block mb-1">Reason for Stop Payment</label>
                  <select
                    value={stopReason}
                    onChange={e => setStopReason(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] font-bold text-[#20242A] focus:outline-none focus:border-rose-600"
                  >
                    <option value="Lost">Check Lost in Transit</option>
                    <option value="Stolen">Check Stolen / Fraud Risk</option>
                    <option value="Dispute">Commercial Contract Dispute</option>
                    <option value="Duplicate">Duplicate Payment Issued</option>
                  </select>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-[11px] text-amber-900">
                  Notice: Stop payment orders take effect immediately upon submission. Private Wealth Tier clients receive fee waivers for all stop payment orders.
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Ban className="w-4 h-4 stroke-[2.25]" />
                  <span>Execute Stop Payment Order</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right: Active Stop Payments Table */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-4">
              <h2 className="font-bold text-sm text-[#20242A] flex items-center justify-between">
                <span>Active Stop Payment Registry ({stoppedChecks.length})</span>
                <span className="text-[10.5px] font-mono text-[#5F6670]">Enforced by Fedwire/ACH Node</span>
              </h2>

              <div className="border border-[#D8DEE8] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F5F7FA] text-[#5F6670] font-bold text-[10.5px] uppercase border-b border-[#D8DEE8]">
                    <tr>
                      <th className="py-2.5 px-3">Check #</th>
                      <th className="py-2.5 px-3">Payee / Reason</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Expires</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8DEE8] font-mono text-[11px]">
                    {stoppedChecks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-[#5F6670] font-sans font-medium">
                          No active stop payment holds on file.
                        </td>
                      </tr>
                    ) : (
                      stoppedChecks.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-bold text-rose-700">#{item.checkNumber}</td>
                          <td className="py-2.5 px-3 font-sans">
                            <div className="font-bold text-[#20242A]">{item.payeeName}</div>
                            <div className="text-[10px] text-[#5F6670]">{item.reason}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            {item.amount ? `$${item.amount.toLocaleString()}` : 'Any Amount'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              ACTIVE HOLD
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[#5F6670] text-[10px]">{item.expiresAt.slice(0, 10)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DEPOSIT HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE8]">
            <h2 className="font-bold text-sm text-[#20242A]">Remote Deposit Capture Clearance Records</h2>
            <span className="text-xs text-[#5F6670] font-mono">Total Cleared: {checkDeposits.length} Checks</span>
          </div>

          <div className="border border-[#D8DEE8] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F5F7FA] text-[#5F6670] font-bold text-[10.5px] uppercase border-b border-[#D8DEE8]">
                <tr>
                  <th className="py-2.5 px-3">Deposit Date</th>
                  <th className="py-2.5 px-3">Check # / Ref</th>
                  <th className="py-2.5 px-3">Target Account</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3">Clearing Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DEE8] font-mono text-[11px]">
                {checkDeposits.map(dep => (
                  <tr key={dep.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-[#5F6670] font-bold">{dep.depositDate.slice(0, 10)}</td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="font-mono font-bold text-[#0B1F6A]">Check #{dep.checkNumber}</div>
                      <div className="text-[10px] font-mono text-[#5F6670]">{dep.referenceNumber}</div>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-[#20242A]">{dep.accountName}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">
                      +${dep.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        CLEARED &amp; SETTLED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
