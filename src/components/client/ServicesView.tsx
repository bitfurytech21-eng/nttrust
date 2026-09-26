import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  Landmark,
  SendHorizontal,
  Receipt,
  CreditCard,
  FileText,
  Users,
  ShieldCheck,
  Building2,
  Clock,
  TrendingUp,
  ArrowRight,
  Copy,
  Check,
  CheckCircle2,
  Lock,
  Download,
  Search,
  ExternalLink,
  Layers,
  Activity,
  Sliders,
  CheckSquare,
  Globe2
} from 'lucide-react';
import { NorthernTrustLogo } from '../common/NorthernTrustLogo';
import { NorthernTrustBranchLocator } from '../common/NorthernTrustBranchLocator';
import { GoogleSheetsSyncModal } from './GoogleSheetsSyncModal';
import { GoogleSlidesPresentationModal } from './GoogleSlidesPresentationModal';
import { FileSpreadsheet, Presentation } from 'lucide-react';

export const ServicesView: React.FC = () => {
  const {
    currentUser,
    accounts,
    bills,
    cards,
    navigateTo,
    payBill,
    toggleCardFreeze,
    totalAvailableUSD
  } = useBanking();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedAccountForSlip, setSelectedAccountForSlip] = useState(accounts[0]?.id || '');
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isGoogleSheetsModalOpen, setIsGoogleSheetsModalOpen] = useState(false);
  const [isGoogleSlidesModalOpen, setIsGoogleSlidesModalOpen] = useState(false);

  const activeAccount = accounts.find(a => a.id === selectedAccountForSlip) || accounts[0];
  const primaryCard = cards[0];

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Services Header Banner */}
      <div className="bg-gradient-to-br from-[#147A52] via-[#147A52] to-[#0a2e1d] text-white p-6 sm:p-8 rounded-3xl border-2 border-[#147A52] shadow-xl relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-white/20 text-white font-extrabold uppercase border border-white/20">
                Institutional Portal
              </span>
              <span className="text-xs text-emerald-300 font-mono font-extrabold">
                CIF: {currentUser?.clientId || 'NT-8820-CLIENT'}
              </span>
            </div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl tracking-tight text-white mt-1">
              Banking &amp; Treasury Services
            </h1>
            <p className="text-xs text-emerald-100 font-medium max-w-2xl mt-1">
              Centralized hub for domestic Fedwire clearing, international SWIFT transfers, high-yield liquidity sweeps, corporate credit controls, and compliance reporting.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('/transfers')}
              className="px-4.5 py-2.5 rounded-xl bg-white text-[#147A52] hover:bg-slate-100 text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <SendHorizontal className="w-4 h-4 stroke-[2.5]" />
              <span>Initiate Wire</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('/payments')}
              className="px-4.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Receipt className="w-4 h-4 stroke-[2.25]" />
              <span>Disbursements</span>
            </button>
          </div>
        </div>
      </div>

      {/* Direct Deposit & Wiring Instructions Card */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#F5F7FA]">
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#20242A] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#147A52] stroke-[2.25]" />
              <span>Direct Deposit &amp; Fedwire Clearing Instructions</span>
            </h2>
            <p className="text-xs text-[#5F6670] font-medium mt-0.5">
              Official banking details for incoming domestic wires, ACH payroll, and SWIFT settlements
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5F6670]">Select Account:</span>
            <select
              value={selectedAccountForSlip}
              onChange={(e) => setSelectedAccountForSlip(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] text-xs font-bold text-[#20242A] focus:outline-none focus:border-[#147A52]"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (••••{acc.accountNumber.slice(-4)})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] space-y-1.5 relative">
            <span className="text-[10.5px] uppercase font-mono font-extrabold text-[#5F6670]">Fedwire ABA Routing</span>
            <div className="text-lg font-black font-mono text-[#20242A]">021000089</div>
            <button
              type="button"
              onClick={() => handleCopy('021000089', 'routing')}
              className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded bg-white border border-[#D8DEE8] text-[10.5px] font-bold text-[#147A52] hover:bg-[#edf2f7]"
            >
              {copiedField === 'routing' ? 'Copied!' : 'Copy'}
            </button>
            <span className="text-[11px] text-[#5F6670] block font-medium">Northern Trust - NYC Clearing</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] space-y-1.5 relative">
            <span className="text-[10.5px] uppercase font-mono font-extrabold text-[#5F6670]">SWIFT / BIC Code</span>
            <div className="text-lg font-black font-mono text-[#20242A]">NTCOUS33NYC</div>
            <button
              type="button"
              onClick={() => handleCopy('NTCOUS33NYC', 'swift')}
              className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded bg-white border border-[#D8DEE8] text-[10.5px] font-bold text-[#147A52] hover:bg-[#edf2f7]"
            >
              {copiedField === 'swift' ? 'Copied!' : 'Copy'}
            </button>
            <span className="text-[11px] text-[#5F6670] block font-medium">International Wire Network</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] space-y-1.5 relative">
            <span className="text-[10.5px] uppercase font-mono font-extrabold text-[#5F6670]">Account Number</span>
            <div className="text-lg font-black font-mono text-[#147A52]">
              {activeAccount ? activeAccount.accountNumber : '8849-0192-33'}
            </div>
            <button
              type="button"
              onClick={() => handleCopy(activeAccount ? activeAccount.accountNumber : '8849-0192-33', 'account')}
              className="absolute top-3.5 right-3.5 px-2.5 py-1 rounded bg-white border border-[#D8DEE8] text-[10.5px] font-bold text-[#147A52] hover:bg-[#edf2f7]"
            >
              {copiedField === 'account' ? 'Copied!' : 'Copy'}
            </button>
            <span className="text-[11px] text-[#5F6670] block font-medium">Beneficiary Name: {currentUser?.fullName}</span>
          </div>
        </div>
      </div>

      {/* Core Services Hub Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Service 1: Wire Transfers */}
        <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#147A52] transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#147A52]/10 border-2 border-[#147A52]/20 text-[#147A52] flex items-center justify-center">
              <SendHorizontal className="w-5 h-5 stroke-[2.25]" />
            </div>
            <h3 className="font-extrabold text-base text-[#20242A]">Fedwire &amp; SWIFT Transfers</h3>
            <p className="text-xs text-[#5F6670] font-medium leading-relaxed">
              Same-day high-value electronic wire settlements, international cross-border payments, and scheduled recurring transfers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('/transfers')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <span>Open Wire Center</span>
            <ArrowRight className="w-4 h-4 stroke-[2.25]" />
          </button>
        </div>

        {/* Service 2: Bill Pay & Disbursements */}
        <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#147A52] transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#147A52]/10 border-2 border-[#147A52]/20 text-[#147A52] flex items-center justify-center">
              <Receipt className="w-5 h-5 stroke-[2.25]" />
            </div>
            <h3 className="font-extrabold text-base text-[#20242A]">Bill Pay &amp; Scheduled Disbursements</h3>
            <p className="text-xs text-[#5F6670] font-medium leading-relaxed">
              Automated vendor bill payments, scheduled corporate disbursements, and recurring liquidity sweeps.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('/payments')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <span>Manage Disbursements</span>
            <ArrowRight className="w-4 h-4 stroke-[2.25]" />
          </button>
        </div>

        {/* Service 3: Cards & Spending Controls */}
        <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#147A52] transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#147A52]/10 border-2 border-[#147A52]/20 text-[#147A52] flex items-center justify-center">
              <CreditCard className="w-5 h-5 stroke-[2.25]" />
            </div>
            <h3 className="font-extrabold text-base text-[#20242A]">Private Metal Cards &amp; Limits</h3>
            <p className="text-xs text-[#5F6670] font-medium leading-relaxed">
              Instant card freezing, POS spending cap adjustments, international ATM access, and virtual card generation.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('/cards')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <span>Manage Cards &amp; Limits</span>
            <ArrowRight className="w-4 h-4 stroke-[2.25]" />
          </button>
        </div>

        {/* Service 4: Approved Beneficiaries */}
        <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#147A52] transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#147A52]/10 border-2 border-[#147A52]/20 text-[#147A52] flex items-center justify-center">
              <Users className="w-5 h-5 stroke-[2.25]" />
            </div>
            <h3 className="font-extrabold text-base text-[#20242A]">Approved Wire Beneficiaries</h3>
            <p className="text-xs text-[#5F6670] font-medium leading-relaxed">
              Pre-approved counterparty directories for instant 1-click wire execution and dual-authorization clearing.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('/beneficiaries')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <span>View Beneficiaries</span>
            <ArrowRight className="w-4 h-4 stroke-[2.25]" />
          </button>
        </div>

        {/* Service 5: Tax Documents & History Dashboard */}
        <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#147A52] transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#0B1F6A]/10 border-2 border-[#0B1F6A]/20 text-[#0B1F6A] flex items-center justify-center">
              <FileText className="w-5 h-5 stroke-[2.25]" />
            </div>
            <h3 className="font-extrabold text-base text-[#20242A]">Tax Documents &amp; History Dashboard</h3>
            <p className="text-xs text-[#5F6670] font-medium leading-relaxed">
              Access 3-year historical IRS filings, certified Form 1099-INT/B packages, Schedule K-1 allocations, and transmit bundles directly to PwC CPA.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('/tax')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <span>Open Tax Dashboard</span>
            <ArrowRight className="w-4 h-4 stroke-[2.25]" />
          </button>
        </div>

        {/* Service 6: e-Statements & Vault */}
        <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#147A52] transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#147A52]/10 border-2 border-[#147A52]/20 text-[#147A52] flex items-center justify-center">
              <FileText className="w-5 h-5 stroke-[2.25]" />
            </div>
            <h3 className="font-extrabold text-base text-[#20242A]">e-Statements &amp; Document Vault</h3>
            <p className="text-xs text-[#5F6670] font-medium leading-relaxed">
              Download monthly accounting statements, account balance letters, and certified audit letters.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('/documents')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <span>Document Vault</span>
            <ArrowRight className="w-4 h-4 stroke-[2.25]" />
          </button>
        </div>

        {/* Service 6: Cryptographic Security */}
        <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#147A52] transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#147A52]/10 border-2 border-[#147A52]/20 text-[#147A52] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 stroke-[2.25]" />
            </div>
            <h3 className="font-extrabold text-base text-[#20242A]">Security &amp; Hardware FIDO2</h3>
            <p className="text-xs text-[#5F6670] font-medium leading-relaxed">
              Hardware key registration, TOTP 2FA authenticator management, and cryptographic session logs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('/security-settings')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <span>Security Center</span>
            <ArrowRight className="w-4 h-4 stroke-[2.25]" />
          </button>
        </div>

        {/* Service 7: Cheque Management & Remote Deposit */}
        <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#147A52] transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#147A52]/10 border-2 border-[#147A52]/20 text-[#147A52] flex items-center justify-center">
              <CheckSquare className="w-5 h-5 stroke-[2.25]" />
            </div>
            <h3 className="font-extrabold text-base text-[#20242A]">Cheque Services &amp; Remote Deposit (RDC)</h3>
            <p className="text-xs text-[#5F6670] font-medium leading-relaxed">
              Scan &amp; deposit checks with immediate provisional clearing, print verified voided checks, and order security checkbooks.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('/checks')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <span>Open Cheque Center</span>
            <ArrowRight className="w-4 h-4 stroke-[2.25]" />
          </button>
        </div>

        {/* Service 8: Treasury FX Desk */}
        <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#147A52] transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#147A52]/10 border-2 border-[#147A52]/20 text-[#147A52] flex items-center justify-center">
              <Globe2 className="w-5 h-5 stroke-[2.25]" />
            </div>
            <h3 className="font-extrabold text-base text-[#20242A]">Global FX Spot &amp; Multi-Currency Desk</h3>
            <p className="text-xs text-[#5F6670] font-medium leading-relaxed">
              Live streaming G10 exchange rates, spot conversions with 0.15% institutional spread, and cross-currency multi-wallet transfers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('/fx')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <span>Launch FX Desk</span>
            <ArrowRight className="w-4 h-4 stroke-[2.25]" />
          </button>
        </div>

        {/* Service 9: Lombard Credit Lines & Mortgages */}
        <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#147A52] transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#147A52]/10 border-2 border-[#147A52]/20 text-[#147A52] flex items-center justify-center">
              <Landmark className="w-5 h-5 stroke-[2.25]" />
            </div>
            <h3 className="font-extrabold text-base text-[#20242A]">Sovereign Lombard Credit &amp; Mortgages</h3>
            <p className="text-xs text-[#5F6670] font-medium leading-relaxed">
              Instant revolving drawdowns against custody investments ($500K facility) and interactive jumbo mortgage amortization modeling.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigateTo('/lending')}
            className="w-full py-2.5 px-4 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <span>Manage Credit &amp; Loans</span>
            <ArrowRight className="w-4 h-4 stroke-[2.25]" />
          </button>
        </div>

        {/* Service 10: Google Slides Presentation Decks */}
        <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#147A52] transition-all">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border-2 border-amber-200 text-amber-700 flex items-center justify-center">
              <Presentation className="w-5 h-5 stroke-[2.25]" />
            </div>
            <h3 className="font-extrabold text-base text-[#20242A]">Google Slides Wealth Presentation Decks</h3>
            <p className="text-xs text-[#5F6670] font-medium leading-relaxed">
              Generate executive portfolio reviews, custody breakdowns, and strategic wealth decks directly inside your Google Drive.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsGoogleSlidesModalOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <span>Launch Google Slides Center</span>
            <ArrowRight className="w-4 h-4 stroke-[2.25]" />
          </button>
        </div>
      </div>

      <GoogleSlidesPresentationModal
        isOpen={isGoogleSlidesModalOpen}
        onClose={() => setIsGoogleSlidesModalOpen(false)}
      />
    </div>
  );
};
