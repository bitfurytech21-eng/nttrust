import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  Wallet,
  Search,
  Building2,
  Sliders,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  ShieldCheck,
  Plus,
  Minus,
  X
} from 'lucide-react';
import { BankAccount } from '../../types/banking';
import { InternalCommandTotpModal } from './InternalCommandTotpModal';
import { AdminCreateAccountModal } from './AdminCreateAccountModal';

export const AdminAccountsView: React.FC = () => {
  const {
    accounts,
    adjustAccountBalance,
    updateAccountStatus
  } = useBanking();

  const [search, setSearch] = useState('');
  const [selectedAcc, setSelectedAcc] = useState<BankAccount | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustReason, setAdjustReason] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);

  // Internal Command TOTP state
  const [totpCommand, setTotpCommand] = useState<{
    name: string;
    description: string;
    action: () => void;
  } | null>(null);

  const filtered = accounts.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.accountNumber.includes(search) ||
      a.type.includes(search)
  );

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAcc || !adjustAmount || !adjustReason) return;

    const amt = parseFloat(adjustAmount);
    const finalDelta = adjustType === 'credit' ? amt : -amt;
    const targetAccount = selectedAcc;
    const currentReason = adjustReason;
    const currentType = adjustType;

    setSelectedAcc(null);
    setAdjustAmount('');
    setAdjustReason('');

    setTotpCommand({
      name: `Ledger ${currentType.toUpperCase()}: ${targetAccount.name}`,
      description: `Authorize administrative ledger adjustment of ${currentType === 'credit' ? '+' : '-'}$${amt.toLocaleString()} on ${targetAccount.accountNumber}. Reason: ${currentReason}`,
      action: () => {
        adjustAccountBalance(targetAccount.id, finalDelta, currentReason);
        setSuccessMsg(`Adjusted ${targetAccount.name} by ${currentType === 'credit' ? '+' : '-'}$${amt.toLocaleString()} (${currentReason})`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    });
  };

  const handleToggleFreeze = (acc: BankAccount) => {
    const nextStatus = acc.status === 'active' ? 'frozen' : 'active';
    setTotpCommand({
      name: `${nextStatus === 'frozen' ? 'Legal Freeze' : 'Unfreeze'} Account: ${acc.name}`,
      description: `Apply FinCEN / Bank Compliance status change to ${nextStatus.toUpperCase()} on account #${acc.accountNumber}.`,
      action: () => {
        updateAccountStatus(acc.id, nextStatus);
        setSuccessMsg(`Account #${acc.accountNumber} status updated to ${nextStatus.toUpperCase()}`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Header */}
      <div className="bg-white rounded-md border border-[#D8DEE8] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#147A52]/10 border border-[#147A52]/20 text-[#147A52] text-xs font-semibold mb-1">
            <Sliders className="w-3.5 h-3.5" /> Central Banking Ledger &amp; Adjustments
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#20242A] tracking-tight">
            Account Master Ledger &amp; Restrictions
          </h1>
          <p className="text-xs text-[#5F6670] mt-0.5">
            Perform administrative adjustments, enforce ledger limits, and restrict accounts under legal hold.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateAccountOpen(true)}
          className="px-4.5 py-2.5 rounded-lg bg-[#147A52] hover:bg-[#0f6040] text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4" />
          <span>Open New Bank Account</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded bg-[#147A52]/10 border border-[#147A52]/20 text-[#147A52] text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#147A52] shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-md p-4 border border-[#D8DEE8] flex items-center gap-3 shadow-xs">
        <Search className="w-4 h-4 text-[#5F6670]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search accounts by name, number, or category..."
          className="w-full bg-transparent border-none text-[#20242A] text-xs placeholder-[#5F6670] focus:outline-none"
        />
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-md border border-[#D8DEE8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5F7FA] border-b border-[#D8DEE8] text-[#5F6670] uppercase font-mono text-[11px]">
                <th className="py-3 px-4 font-bold">Account Name</th>
                <th className="py-3 px-4 font-bold">Type</th>
                <th className="py-3 px-4 font-bold">Account Number</th>
                <th className="py-3 px-4 font-bold">Routing / SWIFT</th>
                <th className="py-3 px-4 text-right font-bold">Ledger Balance</th>
                <th className="py-3 px-4 text-center font-bold">Status</th>
                <th className="py-3 px-4 text-right font-bold">Ops Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DEE8] font-mono text-[11px]">
              {filtered.map((acc) => (
                <tr key={acc.id} className="hover:bg-[#F5F7FA] transition-colors">
                  <td className="py-3.5 px-4 font-sans font-bold text-[#20242A]">{acc.name}</td>
                  <td className="py-3.5 px-4 uppercase text-[#5F6670]">{acc.type}</td>
                  <td className="py-3.5 px-4 text-[#20242A]">{acc.accountNumber}</td>
                  <td className="py-3.5 px-4 text-[#147A52]">{acc.routingNumber}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#147A52] text-sm">
                    ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {acc.currency}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      acc.status === 'active'
                        ? 'bg-[#147A52]/10 text-[#147A52] border border-[#147A52]/20'
                        : 'bg-red-50 text-[#B42318] border border-red-200'
                    }`}>
                      {acc.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2 font-sans">
                      <button
                        type="button"
                        onClick={() => setSelectedAcc(acc)}
                        className="px-2.5 py-1 rounded bg-[#101F7A] hover:bg-[#081552] text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs"
                      >
                        Adjust Balance
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleFreeze(acc)}
                        className={`p-1.5 rounded border transition-colors cursor-pointer ${
                          acc.status === 'active'
                            ? 'bg-white text-[#B42318] border-red-200 hover:bg-red-50'
                            : 'bg-white text-[#147A52] border-[#147A52]/20 hover:bg-[#081552]/10'
                        }`}
                        title={acc.status === 'active' ? 'Freeze account' : 'Unfreeze account'}
                      >
                        {acc.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Balance Modal */}
      {selectedAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded max-w-md w-full border border-[#D8DEE8] p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8DEE8]">
              <div>
                <h3 className="font-bold text-sm text-[#20242A]">Administrative Ledger Adjustment</h3>
                <p className="text-[11px] text-[#5F6670]">{selectedAcc.name} ({selectedAcc.accountNumber})</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAcc(null)}
                className="text-[#5F6670] hover:text-[#20242A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjust} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#5F6670] mb-1 uppercase">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('credit')}
                    className={`py-2 rounded font-bold transition-all ${
                      adjustType === 'credit'
                        ? 'bg-[#147A52] text-white shadow-xs'
                        : 'bg-[#F5F7FA] text-[#5F6670] border border-[#D8DEE8]'
                    }`}
                  >
                    + Credit Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('debit')}
                    className={`py-2 rounded font-bold transition-all ${
                      adjustType === 'debit'
                        ? 'bg-[#B42318] text-white shadow-xs'
                        : 'bg-[#F5F7FA] text-[#5F6670] border border-[#D8DEE8]'
                    }`}
                  >
                    - Debit Account
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5F6670] mb-1 uppercase">Amount ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-2.5 rounded bg-white border border-[#D8DEE8] text-[#20242A] text-xs font-mono focus:outline-none focus:border-[#147A52]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#5F6670] mb-1 uppercase">Regulatory Justification / Reason</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Adjustment reason / compliance note"
                  className="w-full p-2.5 rounded bg-white border border-[#D8DEE8] text-[#20242A] text-xs focus:outline-none focus:border-[#147A52]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAcc(null)}
                  className="px-4 py-2 rounded bg-white border border-[#D8DEE8] text-[#5F6670] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#101F7A] hover:bg-[#081552] text-white font-semibold shadow-xs"
                >
                  Apply Ledger Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Internal Command Google Authenticator Modal */}
      {totpCommand && (
        <InternalCommandTotpModal
          isOpen={true}
          onClose={() => setTotpCommand(null)}
          commandName={totpCommand.name}
          commandDescription={totpCommand.description}
          onConfirm={totpCommand.action}
        />
      )}

      {/* Admin Open Bank Account Modal */}
      <AdminCreateAccountModal
        isOpen={isCreateAccountOpen}
        onClose={() => setIsCreateAccountOpen(false)}
        onSuccess={(acc) => {
          setSuccessMsg(`Bank Account #${acc.accountNumber} (${acc.name}) opened with initial ledger balance of $${acc.balance.toLocaleString()} ${acc.currency}!`);
          setTimeout(() => setSuccessMsg(''), 4500);
        }}
      />
    </div>
  );
};
