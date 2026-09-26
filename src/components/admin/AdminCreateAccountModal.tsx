import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  Wallet,
  Building2,
  CheckCircle2,
  X,
  AlertCircle,
  Plus
} from 'lucide-react';
import { AccountType, BankAccount } from '../../types/banking';
import { NorthernTrustLogo } from '../common/NorthernTrustLogo';

interface AdminCreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (account: BankAccount) => void;
}

export const AdminCreateAccountModal: React.FC<AdminCreateAccountModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { allCustomers, createBankAccount } = useBanking();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(allCustomers[0]?.id || '');
  const [accountType, setAccountType] = useState<AccountType>('checking');
  const [accountName, setAccountName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [initialDeposit, setInitialDeposit] = useState('100000');
  const [customAccountNumber, setCustomAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('071000288');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedCustomer = allCustomers.find(c => c.id === selectedCustomerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const generatedAccNum = customAccountNumber.trim() || `8820${Math.floor(10000000 + Math.random() * 90000000)}`;
    const depositAmt = parseFloat(initialDeposit) || 0;

    setIsSubmitting(true);
    try {
      const defaultName = selectedCustomer
        ? `${selectedCustomer.fullName}'s ${accountType === 'savings' ? 'High-Yield Savings' : accountType === 'investment' ? 'Investment Custody' : 'Private Checking'}`
        : `Northern Trust ${accountType.toUpperCase()} Facility`;

      const newAccount = await createBankAccount({
        accountNumber: generatedAccNum,
        routingNumber: routingNumber.trim() || '071000288',
        name: accountName.trim() || defaultName,
        type: accountType,
        currency,
        balance: depositAmt,
        initialDeposit: depositAmt,
        colorTheme: accountType === 'savings' ? 'emerald' : 'navy'
      });

      if (onSuccess) {
        onSuccess(newAccount);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to create bank account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-[#20242A]">
      <div className="w-full max-w-xl bg-white rounded-xl border border-[#D8DEE8] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0B1F6A] text-white flex items-center justify-between border-b border-[#081552]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center p-1.5 shrink-0 shadow-xs">
              <NorthernTrustLogo className="w-full h-full text-[#147A52]" color="#147A52" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif">Open New Bank Account</h2>
              <p className="text-xs text-slate-300">
                Provision a new depository or custodial ledger facility
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#20242A] mb-1">
              Account Beneficiary / Client Assignment
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                const c = allCustomers.find(cust => cust.id === e.target.value);
                if (c && !accountName) {
                  setAccountName(`${c.fullName}'s ${accountType === 'savings' ? 'High-Yield Savings' : 'Private Checking'}`);
                }
              }}
              className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs font-semibold text-[#20242A] focus:outline-none focus:border-[#147A52] cursor-pointer"
            >
              {allCustomers.map(cust => (
                <option key={cust.id} value={cust.id}>
                  {cust.fullName} ({cust.clientId}) &bull; {cust.tier}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#20242A] mb-1">
                Account Type
              </label>
              <select
                value={accountType}
                onChange={(e) => {
                  const t = e.target.value as AccountType;
                  setAccountType(t);
                  if (selectedCustomer) {
                    setAccountName(`${selectedCustomer.fullName}'s ${t === 'savings' ? 'High-Yield Savings' : t === 'investment' ? 'Custodial Investment' : 'Private Checking'}`);
                  }
                }}
                className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs font-semibold text-[#20242A] focus:outline-none focus:border-[#147A52] cursor-pointer"
              >
                <option value="checking">Private Checking</option>
                <option value="savings">Private High-Yield Savings</option>
                <option value="investment">Custodial Investment Portfolio</option>
                <option value="multicurrency">Multi-Currency Global Treasury</option>
                <option value="cd">Certificate of Deposit (CD)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#20242A] mb-1">
                Base Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs font-semibold text-[#20242A] focus:outline-none focus:border-[#147A52] cursor-pointer"
              >
                <option value="USD">USD ($) - United States Dollar</option>
                <option value="EUR">EUR (€) - Eurozone</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="CHF">CHF (Fr.) - Swiss Franc</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#20242A] mb-1">
              Account Display Name
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. Primary Private Checking"
              className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs text-[#20242A] focus:outline-none focus:border-[#147A52]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#20242A] mb-1">
                Opening Ledger Balance ($)
              </label>
              <input
                type="number"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(e.target.value)}
                placeholder="100000"
                className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs font-mono font-bold text-[#147A52] focus:outline-none focus:border-[#147A52]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#20242A] mb-1">
                Custom Account # (Optional)
              </label>
              <input
                type="text"
                value={customAccountNumber}
                onChange={(e) => setCustomAccountNumber(e.target.value)}
                placeholder="Auto-generated (e.g. 8820...)"
                className="w-full px-3 py-2 bg-white border border-[#D8DEE8] rounded-lg text-xs font-mono text-[#20242A] focus:outline-none focus:border-[#147A52]"
              />
            </div>
          </div>

          <div className="p-3 bg-[#F5F7FA] rounded-lg border border-[#D8DEE8] text-xs font-mono text-[#5F6670] space-y-1">
            <div className="flex justify-between">
              <span>Routing Number:</span>
              <span className="font-bold text-[#20242A]">071000288 (Northern Trust Chicago)</span>
            </div>
            <div className="flex justify-between">
              <span>SWIFT / BIC:</span>
              <span className="font-bold text-[#20242A]">NTRSUS44XXX</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D8DEE8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-[#D8DEE8] text-xs font-semibold text-[#5F6670] hover:text-[#20242A] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-[#147A52] hover:bg-[#0f6040] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              {isSubmitting ? 'Opening Account...' : 'Authorize & Open Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
