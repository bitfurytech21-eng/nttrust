import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  SendHorizontal,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Globe2,
  Building2,
  AlertTriangle,
  Receipt,
  FileText,
  Calendar,
  Lock,
  ArrowLeftRight,
  RefreshCw,
  Info,
  DollarSign,
  Repeat,
  Layers,
  Plus,
  Trash2
} from 'lucide-react';
import { TransferRequest, TransferType, StandingOrder } from '../../types/banking';
import { ReceiptModal } from '../common/ReceiptModal';
import { BiometricPromptModal } from '../common/BiometricPromptModal';
import { ScanFace, Fingerprint, Sparkles } from 'lucide-react';
import { hasPermission } from '../../utils/permissions';

export const TransfersView: React.FC = () => {
  const {
    accounts,
    transfers,
    beneficiaries,
    initiateTransfer,
    currentUser,
    standingOrders,
    addStandingOrder,
    cancelStandingOrder,
    cashSweepRule,
    updateCashSweepRule,
    biometricSettings
  } = useBanking();

  const canCreateTransfer = hasPermission(currentUser, 'create:transfers');

  const [activeSection, setActiveSection] = useState<'wire' | 'standing_orders' | 'cash_sweeps'>('wire');

  // Standing Order Form State
  const [soBeneficiary, setSoBeneficiary] = useState('');
  const [soAccount, setSoAccount] = useState('');
  const [soAmount, setSoAmount] = useState('5000');
  const [soFrequency, setSoFrequency] = useState<'weekly' | 'biweekly' | 'monthly' | 'quarterly'>('monthly');
  const [soPurpose, setSoPurpose] = useState('Monthly Family Office Allocation');
  const [soSuccess, setSoSuccess] = useState(false);

  // Cash Sweep Rule Local State
  const [sweepEnabled, setSweepEnabled] = useState(cashSweepRule.enabled);
  const [sweepThreshold, setSweepThreshold] = useState(cashSweepRule.thresholdAmount.toString());
  const [sweepSaved, setSweepSaved] = useState(false);

  const [transferType, setTransferType] = useState<TransferType>('internal');
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState('');
  const [customBeneficiaryName, setCustomBeneficiaryName] = useState('');
  const [customAccountNumber, setCustomAccountNumber] = useState('');
  const [customRoutingOrBic, setCustomRoutingOrBic] = useState('');
  const [amount, setAmount] = useState('');
  const [targetCurrency, setTargetCurrency] = useState('USD');
  const [purpose, setPurpose] = useState('Treasury Capital Allocation');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().slice(0, 10));
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');

  // Confirmation OTP & Biometric 2-Step Stage
  const [step, setStep] = useState<'form' | 'otp_challenge' | 'submitted'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
  const [createdTransfer, setCreatedTransfer] = useState<TransferRequest | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedTransferForReceipt, setSelectedTransferForReceipt] = useState<TransferRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fromAccount = accounts.find((a) => a.id === fromAccountId) || accounts[0];
  const toAccount = accounts.find((a) => a.id === toAccountId);
  const numAmount = parseFloat(amount) || 0;

  // Live FX Converter Rates
  const fxRates: Record<string, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.7745,
    CHF: 0.8842,
    JPY: 154.2,
    CAD: 1.36
  };
  const currentFxRate = fxRates[targetCurrency] || 1.0;
  const convertedAmount = numAmount * currentFxRate;
  const transferFee = transferType === 'international_swift' ? 45.0 : transferType === 'external_wire' ? 25.0 : 0.0;

  const handleSelectBeneficiary = (benId: string) => {
    setSelectedBeneficiaryId(benId);
    const ben = beneficiaries.find(b => b.id === benId);
    if (ben) {
      setCustomBeneficiaryName(ben.fullName);
      setCustomAccountNumber(ben.accountNumber);
      setCustomRoutingOrBic(ben.routingOrSwift);
      setTargetCurrency(ben.currency);
    }
  };

  const executeTransferCommit = () => {
    setIsLoading(true);

    setTimeout(() => {
      let finalBeneficiary = customBeneficiaryName;
      let finalToAccName = customBeneficiaryName;

      if (transferType === 'internal' && toAccount) {
        finalBeneficiary = `${currentUser?.fullName} (${toAccount.name})`;
        finalToAccName = toAccount.name;
      }

      const res = initiateTransfer({
        type: transferType,
        fromAccountId: fromAccount.id,
        fromAccountName: fromAccount.name,
        toAccountId: transferType === 'internal' ? toAccount?.id : undefined,
        toAccountName: finalToAccName,
        toAccountNumber: customAccountNumber,
        toRoutingOrBic: customRoutingOrBic,
        beneficiaryName: finalBeneficiary || 'Authorized Counterparty',
        beneficiaryBank: transferType === 'international_swift' ? 'SWIFT Network Intermediary' : 'Federal Reserve ACH',
        beneficiaryCountry: targetCurrency === 'CHF' ? 'Switzerland' : targetCurrency === 'GBP' ? 'United Kingdom' : 'United States',
        amount: numAmount,
        sourceCurrency: fromAccount.currency,
        targetCurrency,
        exchangeRate: currentFxRate,
        fee: transferFee,
        scheduledDate,
        isRecurring,
        recurringFrequency: isRecurring ? recurringFrequency : undefined,
        purpose,
        riskScore: numAmount >= 40000 ? 'MEDIUM' : 'LOW'
      });

      setCreatedTransfer(res);
      setIsLoading(false);
      setStep('submitted');
      setIsBiometricModalOpen(false);
    }, 600);
  };

  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0) return;

    // If biometric is enabled and threshold met or wire transfer
    const isWireOrHighValue =
      transferType === 'external_wire' ||
      transferType === 'international_swift' ||
      numAmount >= (biometricSettings?.thresholdAmount || 0);

    if (biometricSettings?.enabled && isWireOrHighValue) {
      setIsBiometricModalOpen(true);
    } else {
      setStep('otp_challenge');
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeTransferCommit();
  };

  const handleBiometricAuthSuccess = () => {
    executeTransferCommit();
  };

  const handleResetForm = () => {
    setAmount('');
    setStep('form');
    setCreatedTransfer(null);
    setOtpCode('');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0B1F6A]/10 border-2 border-[#0B1F6A]/20 text-[#0B1F6A] text-xs font-black mb-2 shadow-2xs">
            <ShieldCheck className="w-4 h-4 stroke-[2.25]" /> High-Assurance Wire &amp; FedNow Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-[#20242A]">
            Transfer &amp; Cross-Border Remittances
          </h1>
          <p className="text-xs text-[#5F6670] mt-1 font-medium">
            Execute instantaneous internal capital sweeps, FedWire, ACH distributions, standing orders, and recurring sweeps.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-[#F5F7FA] p-1.5 rounded-xl border-2 border-[#D8DEE8] text-xs shrink-0 overflow-x-auto">
          {[
            { id: 'wire', label: 'Wire & ACH Transfers', icon: SendHorizontal },
            { id: 'standing_orders', label: `Standing Orders (${standingOrders.length})`, icon: Repeat },
            { id: 'cash_sweeps', label: 'Cash Sweeps Engine', icon: Layers }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveSection(t.id as any)}
                className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  activeSection === t.id
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

      {/* Main Grid: Transfer Form / Wizard (7 cols) & Transfer History (5 cols) */}
      {activeSection === 'wire' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 2xl:gap-8">
          {/* Left 7 Cols: Wizard Card */}
          <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-[#D8DEE8] shadow-sm">
            {step === 'submitted' && createdTransfer && (
              <div className="text-center py-6 space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-[#147A52]/10 border-2 border-emerald-300 text-[#147A52] flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-9 h-9 stroke-[2.25]" />
                </div>
                <h2 className="text-xl font-black text-[#20242A]">Transfer Successfully Initiated</h2>
                <p className="text-xs text-[#5F6670] max-w-md mx-auto font-medium">
                  {createdTransfer.status === 'pending_review' ? (
                    <span className="text-amber-800 font-bold block">
                      Transfer #{createdTransfer.referenceId} flagged for standard AML dual-officer approval. Compliance will clear within 1 hour.
                    </span>
                  ) : (
                    <span>
                      Transfer #{createdTransfer.referenceId} settled immediately into the target ledger account.
                    </span>
                  )}
                </p>

                {/* Summary Slip */}
                <div className="p-4 bg-[#F5F7FA] rounded-xl border-2 border-[#D8DEE8] text-xs text-left text-[#5F6670] space-y-2 font-mono max-w-md mx-auto shadow-2xs">
                  <div className="flex justify-between">
                    <span className="font-sans font-medium">Reference ID:</span>
                    <strong className="text-[#147A52] font-black">{createdTransfer.referenceId}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans font-medium">Beneficiary:</span>
                    <strong className="text-[#20242A] font-bold">{createdTransfer.beneficiaryName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans font-medium">Source Amount:</span>
                    <strong className="text-[#20242A] font-black">{createdTransfer.sourceCurrency} ${createdTransfer.amount.toLocaleString()}</strong>
                  </div>
                  {createdTransfer.exchangeRate && createdTransfer.targetCurrency !== 'USD' && (
                    <div className="flex justify-between">
                      <span className="font-sans font-medium">Destination Yield ({createdTransfer.targetCurrency}):</span>
                      <strong className="text-[#147A52] font-black">
                        {createdTransfer.targetCurrency} {(createdTransfer.amount * createdTransfer.exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </strong>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-sans font-medium">Status:</span>
                    <span className={`font-black ${createdTransfer.status === 'completed' ? 'text-[#147A52]' : 'text-amber-800'}`}>
                      {createdTransfer.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTransferForReceipt(createdTransfer);
                      setIsReceiptOpen(true);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Receipt className="w-4 h-4 stroke-[2.25]" /> Download Official Receipt
                  </button>
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#F5F7FA] hover:bg-[#F5F7FA] border-2 border-[#D8DEE8] hover:border-[#147A52] text-[#20242A] font-bold text-xs transition-all cursor-pointer shadow-2xs"
                  >
                    Initiate Another Transfer
                  </button>
                </div>
              </div>
            )}

            {step === 'otp_challenge' && (
              <form onSubmit={handleFinalSubmit} className="space-y-5 animate-fade-in text-xs">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#147A52]/10 border-2 border-emerald-300 text-[#147A52] text-xs font-black mb-2 shadow-2xs">
                    <Lock className="w-3.5 h-3.5 stroke-[2.25]" /> High-Value Wire Authorization
                  </div>
                  <h2 className="text-base font-black text-[#20242A]">Authorize Outgoing Transfer</h2>
                  <p className="text-[#5F6670] mt-0.5 font-medium">
                    Please confirm the transfer details below and enter your 2-Step Authenticator verification code.
                  </p>
                </div>

                {/* Transfer Preview Card */}
                <div className="p-4 bg-[#F5F7FA] rounded-xl border-2 border-[#D8DEE8] space-y-2.5 shadow-2xs">
                  <div className="flex justify-between text-[#5F6670]">
                    <span>Source Account:</span>
                    <strong className="text-[#20242A] font-bold">{fromAccount.name}</strong>
                  </div>
                  <div className="flex justify-between text-[#5F6670]">
                    <span>Recipient / Beneficiary:</span>
                    <strong className="text-[#20242A] font-bold">{customBeneficiaryName || toAccount?.name}</strong>
                  </div>
                  <div className="flex justify-between text-[#5F6670]">
                    <span>Transfer Type:</span>
                    <span className="text-[#147A52] font-mono uppercase font-black">{transferType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-[#5F6670]">
                    <span>Principal Amount:</span>
                    <strong className="text-[#20242A] font-mono font-black text-sm">${numAmount.toLocaleString()} USD</strong>
                  </div>
                  {targetCurrency !== 'USD' && (
                    <div className="flex justify-between text-[#5F6670]">
                      <span>Delivered in {targetCurrency} (@ {currentFxRate}):</span>
                      <strong className="text-[#147A52] font-mono font-black text-sm">{targetCurrency} {convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
                    </div>
                  )}
                  <div className="flex justify-between text-[#5F6670]">
                    <span>Execution Fee:</span>
                    <span className="text-[#20242A] font-mono font-bold">${transferFee.toFixed(2)} USD</span>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1.5">
                    Enter Authenticator OTP / Dynamic Passcode
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full text-center tracking-[0.3em] font-mono font-black text-xl py-3 text-[#147A52] bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                  />
                </div>

                {biometricSettings?.enabled && (
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border-2 border-emerald-300 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-[#147A52] text-white">
                        {biometricSettings.type === 'touch_id' ? <Fingerprint className="w-4 h-4" /> : <ScanFace className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-extrabold text-[#20242A]">Fast Biometric Clearance</div>
                        <div className="text-[11px] text-[#5F6670]">Skip manual OTP code entry with Secure Enclave verification.</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsBiometricModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-[#147A52] hover:bg-[#0e5c3e] text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{biometricSettings.type === 'touch_id' ? 'Use Touch ID' : 'Use Face ID'}</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-[#D8DEE8] text-[#20242A] font-bold cursor-pointer transition-all"
                  >
                    &larr; Back to Edit
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 rounded-lg bg-[#101F7A] hover:bg-[#081552] text-white font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign &amp; Transmit Wire</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.25]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {step === 'form' && (
              <form onSubmit={handleProceedToOtp} className="space-y-4 text-xs">
                {!canCreateTransfer && (
                  <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Permission Restricted: Creation Not Authorized</span>
                      <span className="text-[11px] text-amber-800 leading-relaxed block mt-0.5">
                        Your assigned account role (<strong className="font-mono uppercase">{currentUser?.role}</strong>) does not have authorization to initiate external wires or internal fund disbursements.
                      </span>
                    </div>
                  </div>
                )}

                {/* Channel Selector */}
                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-2">Select Transfer Channel</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'internal', label: 'Internal Transfer', desc: 'Instant (0 fee)' },
                      { id: 'external_ach', label: 'Domestic ACH', desc: '1-2 Days' },
                      { id: 'external_wire', label: 'Domestic FedWire', desc: 'Same-day ($25)' },
                      { id: 'international_swift', label: 'Global SWIFT', desc: 'Cross-Border FX ($45)' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTransferType(t.id as any)}
                        className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer shadow-2xs ${
                          transferType === t.id
                            ? 'bg-[#147A52] text-white border-[#147A52] shadow-xs'
                            : 'bg-[#F5F7FA] border-[#D8DEE8] text-[#5F6670] hover:bg-white hover:border-[#9ba8b5]'
                        }`}
                      >
                        <div className="font-black text-xs">{t.label}</div>
                        <span className={`text-[10.5px] block mt-0.5 font-medium ${transferType === t.id ? 'text-white/80' : 'text-[#5F6670]'}`}>
                          {t.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Source Account */}
                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1">Debit Source Account</label>
                  <select
                    value={fromAccountId}
                    onChange={(e) => setFromAccountId(e.target.value)}
                    className="w-full p-2.5 border-2 border-[#D8DEE8] rounded-xl text-xs bg-white text-[#20242A] font-mono font-bold focus:border-[#147A52] focus:outline-none"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} — Available: {a.currency} ${a.availableBalance.toLocaleString()} (••{a.accountNumber.slice(-4)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Selector */}
                {transferType === 'internal' ? (
                  <div>
                    <label className="font-bold text-xs text-[#20242A] block mb-1">Credit Destination Account</label>
                    <select
                      value={toAccountId}
                      onChange={(e) => setToAccountId(e.target.value)}
                      className="w-full p-2.5 border-2 border-[#D8DEE8] rounded-xl text-xs bg-white text-[#20242A] font-mono font-bold focus:border-[#147A52] focus:outline-none"
                    >
                      {accounts.filter((a) => a.id !== fromAccountId).map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} — Balance: {a.currency} ${a.balance.toLocaleString()}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-3.5 pt-1">
                    {beneficiaries.length > 0 && (
                      <div>
                        <label className="font-bold text-xs text-[#20242A] block mb-1">Saved Beneficiaries</label>
                        <select
                          value={selectedBeneficiaryId}
                          onChange={(e) => handleSelectBeneficiary(e.target.value)}
                          className="w-full p-2.5 border-2 border-[#D8DEE8] rounded-xl text-xs bg-white text-[#20242A] font-semibold focus:border-[#147A52] focus:outline-none"
                        >
                          <option value="">-- Choose saved beneficiary or enter below --</option>
                          {beneficiaries.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.nickname} — {b.fullName} ({b.bankName})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-xs text-[#20242A] block mb-1">Beneficiary Legal Name</label>
                        <input
                          type="text"
                          required
                          value={customBeneficiaryName}
                          onChange={(e) => setCustomBeneficiaryName(e.target.value)}
                          placeholder="Recipient institution or entity name"
                          className="w-full p-2.5 border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium focus:border-[#147A52] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-xs text-[#20242A] block mb-1">Account / IBAN Number</label>
                        <input
                          type="text"
                          required
                          value={customAccountNumber}
                          onChange={(e) => setCustomAccountNumber(e.target.value)}
                          placeholder="IBAN or account number"
                          className="w-full p-2.5 border-2 border-[#D8DEE8] rounded-xl text-xs font-mono font-bold text-[#20242A] focus:border-[#147A52] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-xs text-[#20242A] block mb-1">Routing ABA or SWIFT/BIC</label>
                        <input
                          type="text"
                          required
                          value={customRoutingOrBic}
                          onChange={(e) => setCustomRoutingOrBic(e.target.value)}
                          placeholder="ABA routing number or SWIFT/BIC"
                          className="w-full p-2.5 border-2 border-[#D8DEE8] rounded-xl text-xs font-mono uppercase font-bold text-[#20242A] focus:border-[#147A52] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-xs text-[#20242A] block mb-1">Destination Currency</label>
                        <select
                          value={targetCurrency}
                          onChange={(e) => setTargetCurrency(e.target.value)}
                          className="w-full p-2.5 border-2 border-[#D8DEE8] rounded-xl text-xs bg-white text-[#20242A] font-mono font-bold focus:border-[#147A52] focus:outline-none"
                        >
                          <option value="USD">USD - United States Dollar</option>
                          <option value="EUR">EUR - Euro Area (SEPA)</option>
                          <option value="GBP">GBP - British Pound Sterling</option>
                          <option value="CHF">CHF - Swiss Franc</option>
                          <option value="CAD">CAD - Canadian Dollar</option>
                          <option value="JPY">JPY - Japanese Yen</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Amount & FX Calculator */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-xs text-[#20242A] block mb-1">Transfer Amount ($ USD)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-2.5 border-2 border-[#D8DEE8] rounded-xl text-xs font-mono text-sm font-black text-[#20242A] focus:border-[#147A52] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-xs text-[#20242A] block mb-1">Execution Fee</label>
                    <div className="p-2.5 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] text-xs font-mono font-bold text-[#20242A]">
                      ${transferFee.toFixed(2)} USD (Waived under Private Client tier)
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1">Transfer Purpose / Compliance Memo</label>
                  <input
                    type="text"
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Remittance memo or purpose of transfer"
                    className="w-full p-2.5 border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium focus:border-[#147A52] focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t-2 border-[#F5F7FA] flex items-center justify-between">
                  <span className="text-[11px] text-[#5F6670] font-medium">
                    High-value transfers (&gt;$40k) include dual-signature confirmation.
                  </span>
                  <button
                    type="submit"
                    disabled={!canCreateTransfer}
                    className={`px-6 py-2.5 rounded-lg text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm ${
                      !canCreateTransfer
                        ? 'bg-gray-400 opacity-60 cursor-not-allowed'
                        : 'bg-[#101F7A] hover:bg-[#081552] cursor-pointer'
                    }`}
                  >
                    {!canCreateTransfer ? (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Transfers Restricted for Role</span>
                      </>
                    ) : (
                      <>
                        <span>Proceed to Verification</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.25]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Transfer History */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#F5F7FA]">
              <h3 className="text-base font-black text-[#20242A] flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#147A52] stroke-[2.25]" />
                <span>Recent Wire Records</span>
              </h3>
              <span className="text-xs text-[#5F6670] font-bold">{transfers.length} total</span>
            </div>

            <div className="space-y-3 max-h-[580px] overflow-y-auto">
              {transfers.map((t) => (
                <div key={t.id} className="p-3.5 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] hover:border-[#147A52] space-y-2.5 text-xs transition-all shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-[#147A52]">{t.referenceId}</span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black border-2 ${
                      t.status === 'completed'
                        ? 'bg-[#147A52]/10 text-[#147A52] border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      {t.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <div>
                      <span className="font-extrabold text-[#20242A] block text-xs">{t.beneficiaryName}</span>
                      <span className="text-[11px] text-[#5F6670] font-medium">{t.purpose}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-black text-[#20242A] block text-xs">${t.amount.toLocaleString()}</span>
                      <span className="text-[10px] text-[#5F6670] font-semibold">{t.createdAt.slice(0, 10)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t-2 border-[#F5F7FA] flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTransferForReceipt(t);
                        setIsReceiptOpen(true);
                      }}
                      className="text-xs font-bold text-[#147A52] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5 stroke-[2.25]" /> View Advice Receipt &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: STANDING ORDERS & RECURRING RULES */}
      {/* ========================================================================= */}
      {activeSection === 'standing_orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Standing Orders Table */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE8]">
                <h2 className="font-bold text-sm text-[#20242A] flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-[#0B1F6A]" />
                  <span>Active Recurring Standing Orders ({standingOrders.length})</span>
                </h2>
                <span className="text-[11px] font-mono text-[#5F6670]">Automated Execution Engine</span>
              </div>

              <div className="space-y-3">
                {standingOrders.length === 0 ? (
                  <p className="text-xs text-[#5F6670] py-6 text-center italic">No active standing orders.</p>
                ) : (
                  standingOrders.map(order => (
                    <div key={order.id} className="p-4 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] hover:border-[#0B1F6A] transition-all space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-black text-sm text-[#20242A] block">{order.beneficiaryName}</span>
                          <span className="text-[11px] text-[#5F6670] font-medium">{order.purpose}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-black text-sm text-[#0B1F6A] block">
                            ${order.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {order.currency}
                          </span>
                          <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-[#0B1F6A]/10 text-[#0B1F6A]">
                            {order.frequency}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[11px] text-[#5F6670] font-mono">
                        <div>
                          <span>From: {order.fromAccountName} &bull; Next Execution: <strong>{order.nextExecutionDate}</strong></span>
                        </div>
                        <button
                          type="button"
                          onClick={() => cancelStandingOrder(order.id)}
                          className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer font-sans"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Cancel Order</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* New Standing Order Form */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-sm text-[#20242A] flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#0B1F6A]" />
                  <span>Set Up New Standing Order</span>
                </h3>
                <p className="text-[11px] text-[#5F6670] mt-0.5">
                  Automate payments with guaranteed on-time dual-officer Fedwire clearing.
                </p>
              </div>

              {soSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold animate-fade-in">
                  Standing order activated! Automated payments will execute on scheduled dates.
                </div>
              )}

              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!soBeneficiary || !soAmount) return;
                  addStandingOrder({
                    fromAccountId: fromAccountId,
                    fromAccountName: fromAccount.name,
                    beneficiaryName: soBeneficiary,
                    beneficiaryAccount: soAccount || '8849-AUTO',
                    beneficiaryBank: 'Domestic Federal Reserve Node',
                    amount: parseFloat(soAmount),
                    currency: fromAccount.currency,
                    frequency: soFrequency,
                    nextExecutionDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
                    purpose: soPurpose
                  });
                  setSoSuccess(true);
                  setSoBeneficiary('');
                  setSoAccount('');
                  setTimeout(() => setSoSuccess(false), 3500);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="font-bold text-[#20242A] block mb-1">Beneficiary Name</label>
                  <input
                    type="text"
                    value={soBeneficiary}
                    onChange={e => setSoBeneficiary(e.target.value)}
                    required
                    placeholder="Beneficiary or trust name"
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F7FA] border border-[#D8DEE8] font-bold text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#20242A] block mb-1">Amount (USD)</label>
                  <input
                    type="number"
                    step="100"
                    value={soAmount}
                    onChange={e => setSoAmount(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F7FA] border border-[#D8DEE8] font-mono font-bold text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#20242A] block mb-1">Frequency</label>
                  <select
                    value={soFrequency}
                    onChange={e => setSoFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F7FA] border border-[#D8DEE8] font-bold text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-Weekly</option>
                    <option value="monthly">Monthly (Recommended)</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#20242A] block mb-1">Payment Purpose</label>
                  <input
                    type="text"
                    value={soPurpose}
                    onChange={e => setSoPurpose(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-[#F5F7FA] border border-[#D8DEE8] text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Repeat className="w-4 h-4" />
                  <span>Activate Standing Order</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: AUTOMATED CASH SWEEPS ENGINE */}
      {/* ========================================================================= */}
      {activeSection === 'cash_sweeps' && (
        <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-6 shadow-sm space-y-6 text-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-[#D8DEE8]">
            <div>
              <h2 className="font-bold text-base text-[#20242A] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#0B1F6A]" />
                <span>Automated Liquidity Cash Sweep Engine</span>
              </h2>
              <p className="text-xs text-[#5F6670] mt-0.5">
                Automatically maximize yields by sweeping non-working checking cash into 5.15% APY Treasury Reserves at day-end.
              </p>
            </div>

            <div className="text-right font-mono">
              <span className="text-[#5F6670] block text-[11px]">Total Swept Year-to-Date:</span>
              <span className="font-black text-emerald-700 text-sm">
                +${cashSweepRule.totalSweptYTD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
              </span>
            </div>
          </div>

          {sweepSaved && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Cash Sweep Rule Configuration Saved &amp; Active!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Rule Switch Card */}
            <div className="p-4 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-black text-[#20242A]">Sweep Rule Status</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  sweepEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {sweepEnabled ? 'ENABLED' : 'PAUSED'}
                </span>
              </div>
              <p className="text-[11px] text-[#5F6670]">
                When enabled, balances in your Premier Checking exceeding the threshold are automatically swept every business night.
              </p>
              <label className="flex items-center gap-2.5 cursor-pointer select-none font-bold text-[#0B1F6A]">
                <input
                  type="checkbox"
                  checked={sweepEnabled}
                  onChange={e => setSweepEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#0B1F6A]"
                />
                <span>Enable Automated Sweep</span>
              </label>
            </div>

            {/* Threshold Input Card */}
            <div className="p-4 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] space-y-3">
              <span className="font-black text-[#20242A] block">Checking Balance Threshold</span>
              <p className="text-[11px] text-[#5F6670]">
                Keep this minimum buffer in Checking for daily operations; sweep all excess.
              </p>
              <div className="relative">
                <span className="absolute left-3 top-2 font-bold text-slate-500">$</span>
                <input
                  type="number"
                  step="5000"
                  value={sweepThreshold}
                  onChange={e => setSweepThreshold(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-white border border-[#D8DEE8] font-mono font-bold text-[#0B1F6A] focus:outline-none focus:border-[#0B1F6A]"
                />
              </div>
            </div>

            {/* Target Vault Card */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border-2 border-emerald-300 space-y-2">
              <span className="font-black text-emerald-950 block">Target Yield Vault</span>
              <div className="font-bold text-[#0B1F6A]">Sovereign High-Yield Treasury Reserve</div>
              <div className="text-base font-mono font-black text-emerald-800">5.15% APY</div>
              <p className="text-[10px] text-emerald-900">
                Daily compounded interest, full FDIC + sovereign multi-custodial sweep insurance.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                updateCashSweepRule({
                  enabled: sweepEnabled,
                  thresholdAmount: parseFloat(sweepThreshold) || 50000
                });
                setSweepSaved(true);
                setTimeout(() => setSweepSaved(false), 3500);
              }}
              className="px-6 py-2.5 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save &amp; Apply Sweep Rule</span>
            </button>
          </div>
        </div>
      )}

      {/* Advice Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transfer={selectedTransferForReceipt}
      />

      {/* Biometric Prompt Modal for Wire Transfers */}
      <BiometricPromptModal
        isOpen={isBiometricModalOpen}
        onClose={() => setIsBiometricModalOpen(false)}
        onSuccess={handleBiometricAuthSuccess}
        onFallbackToOtp={() => {
          setIsBiometricModalOpen(false);
          setStep('otp_challenge');
        }}
        biometricType={biometricSettings?.type || 'face_id'}
        details={{
          title: biometricSettings?.type === 'touch_id' ? 'Authorize Wire with Touch ID' : 'Authorize Wire with Face ID',
          subtitle: 'Confirm sovereign fund disbursement via hardware Secure Enclave.',
          actionName: `${transferType.replace('_', ' ').toUpperCase()} Settlement`,
          recipient: customBeneficiaryName || toAccount?.name || 'Beneficiary Counterparty',
          amount: numAmount,
          currency: fromAccount.currency,
          securityLevel: biometricSettings?.enclaveSecurityLevel || 'FIPS 140-3 Hardware Level 3'
        }}
      />
    </div>
  );
};
