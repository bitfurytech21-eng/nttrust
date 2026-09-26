import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  Receipt,
  Plus,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Zap,
  CreditCard,
  Home,
  Shield,
  Phone,
  X
} from 'lucide-react';
import { BillPayment } from '../../types/banking';

export const PaymentsView: React.FC = () => {
  const { bills, payBill, addBill } = useBanking();
  const [showAddModal, setShowAddModal] = useState(false);
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [paySuccessMsg, setPaySuccessMsg] = useState('');

  // Form
  const [payeeName, setPayeeName] = useState('');
  const [category, setCategory] = useState<BillPayment['category']>('Utilities');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('2026-10-15');
  const [autoPayEnabled, setAutoPayEnabled] = useState(true);

  const handlePay = (bill: BillPayment) => {
    setPayingBillId(bill.id);
    setTimeout(() => {
      payBill(bill.id);
      setPayingBillId(null);
      setPaySuccessMsg(`Successfully processed payment of $${bill.amount.toFixed(2)} to ${bill.payeeName}.`);
      setTimeout(() => setPaySuccessMsg(''), 4000);
    }, 400);
  };

  const handleAddBill = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount) || 0;
    if (!payeeName || amt <= 0) return;

    addBill({
      payeeName,
      category,
      accountNumber,
      amount: amt,
      dueDate,
      autoPayEnabled
    });

    setShowAddModal(false);
    setPayeeName('');
    setAccountNumber('');
    setAmount('');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#147A52]/10 border-2 border-emerald-300 text-[#147A52] text-xs font-black mb-2 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#147A52] stroke-[2.25]" /> Automated Clearing House &amp; e-Bills
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-[#20242A]">
            Bills &amp; Recurring Payments
          </h1>
          <p className="text-xs text-[#5F6670] mt-1 font-medium">
            Automate recurring utility, mortgage, tax, and institutional bill dispatches.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.25]" />
          <span>Add New Payee / Biller</span>
        </button>
      </div>

      {paySuccessMsg && (
        <div className="p-4 rounded-xl bg-[#147A52]/10 border-2 border-emerald-300 text-[#147A52] flex items-center gap-2.5 text-xs font-bold shadow-2xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 stroke-[2.25]" />
          <span>{paySuccessMsg}</span>
        </div>
      )}

      {/* Grid of Bills */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bills.map((bill) => {
          const isPaying = payingBillId === bill.id;
          const isOverdue = bill.status === 'overdue';
          const isPaid = bill.status === 'paid';

          return (
            <div
              key={bill.id}
              className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#147A52] transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#F5F7FA] text-[#5F6670] border-2 border-[#D8DEE8]">
                    {bill.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black border-2 ${
                    isPaid
                      ? 'bg-[#147A52]/10 text-[#147A52] border-emerald-300'
                      : isOverdue
                      ? 'bg-red-50 text-[#B42318] border-red-300'
                      : 'bg-[#147A52]/10 text-[#147A52] border-emerald-300'
                  }`}>
                    {bill.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-[#20242A]">{bill.payeeName}</h3>
                  <p className="text-xs text-[#5F6670] font-mono font-medium mt-0.5">Account: ••{bill.accountNumber.slice(-4)}</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#5F6670] block tracking-wider">Amount Due</span>
                    <span className="font-mono font-black text-lg text-[#20242A]">${bill.amount.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#5F6670] block tracking-wider">Due Date</span>
                    <span className="text-xs text-[#5F6670] font-bold">{bill.dueDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#5F6670] pt-1 font-medium">
                  <span>Auto-Pay: <strong className={bill.autoPayEnabled ? 'text-[#147A52] font-black' : 'text-[#5F6670] font-bold'}>
                    {bill.autoPayEnabled ? 'Enabled' : 'Disabled'}
                  </strong></span>
                  {bill.lastPaidDate && (
                    <span className="text-[11px] font-mono">Last: {bill.lastPaidDate}</span>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isPaid || isPaying}
                  onClick={() => handlePay(bill)}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                    isPaid
                      ? 'bg-slate-100 text-[#5F6670] border-2 border-slate-200 cursor-not-allowed'
                      : 'bg-[#101F7A] hover:bg-[#081552] text-white'
                  }`}
                >
                  {isPaying ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isPaid ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#147A52] stroke-[2.25]" />
                      <span>Settled</span>
                    </>
                  ) : (
                    <>
                      <span>Pay Now (${bill.amount.toLocaleString()})</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.25]" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Payee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border-2 border-[#D8DEE8] p-6 space-y-5 shadow-2xl text-xs animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#F5F7FA]">
              <span className="font-black text-sm text-[#147A52]">Add Institutional Payee / e-Bill</span>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#5F6670] hover:text-[#20242A] p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.25]" />
              </button>
            </div>

            <form onSubmit={handleAddBill} className="space-y-4">
              <div>
                <label className="font-bold text-xs text-[#20242A] block mb-1.5">Payee / Entity Legal Name</label>
                <input
                  type="text"
                  required
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  placeholder="Payee or utility name"
                  className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium placeholder-[#5F6670] focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-bold focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                  >
                    <option value="Utilities">Utilities</option>
                    <option value="Mortgage">Mortgage</option>
                    <option value="Tax & Municipal">Tax &amp; Municipal</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Telecom">Telecom</option>
                    <option value="Credit Card">Credit Card</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1.5">Account / Reference #</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Account or billing reference number"
                    className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-mono font-bold focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1.5">Amount ($ USD)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-mono font-black focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                  />
                </div>
                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1.5">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="autopay"
                  checked={autoPayEnabled}
                  onChange={(e) => setAutoPayEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#147A52] cursor-pointer"
                />
                <label htmlFor="autopay" className="text-xs text-[#20242A] font-bold cursor-pointer">
                  Enable Automatic ACH Debit on Due Date
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t-2 border-[#F5F7FA]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-[#D8DEE8] text-[#20242A] font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#101F7A] hover:bg-[#081552] text-white font-bold transition-all shadow-sm cursor-pointer"
                >
                  Save Payee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
