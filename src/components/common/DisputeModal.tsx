import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Transaction } from '../../types/banking';
import { useBanking } from '../../context/BankingContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const DisputeModal: React.FC<Props> = ({ isOpen, onClose, transaction }) => {
  const { disputeTransaction } = useBanking();
  const [reason, setReason] = useState('unauthorized_charge');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = `${reason.replace('_', ' ').toUpperCase()}: ${notes || 'Client reported unverified billing charge.'}`;
    disputeTransaction(transaction.id, finalReason);
    setSubmitted(true);
  };

  const handleDone = () => {
    setSubmitted(false);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white border-2 border-[#cfd6dc] rounded-2xl shadow-2xl overflow-hidden text-xs text-[#17232e] animate-fade-in">
        <div className="px-6 py-4 border-b-2 border-[#edf1f5] flex items-center justify-between bg-[#f8fafb]">
          <div className="flex items-center gap-2 font-mono text-[#b42318] font-black text-xs">
            <ShieldAlert className="w-4 h-4 stroke-[2.25]" /> TRANSACTION DISPUTE &amp; INVESTIGATION DESK
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#576574] hover:text-[#17232e] hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.25]" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-[#074a2a] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8 stroke-[2.25]" />
              </div>
              <h3 className="text-lg font-black text-[#17232e]">Dispute Case Initiated</h3>
              <p className="text-xs text-[#576574] max-w-md mx-auto font-medium">
                Case #{Math.floor(100000 + Math.random() * 900000)} has been opened. Provisional credit of ${Math.abs(transaction.amount).toFixed(2)} USD will be credited within 24 hours under Regulation E.
              </p>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={handleDone}
                  className="px-6 py-2.5 rounded-xl bg-[#074a2a] hover:bg-[#05351e] text-white font-bold transition-all shadow-sm cursor-pointer"
                >
                  Return to Ledger
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-4 rounded-xl bg-[#f8fafb] border-2 border-[#cfd6dc] space-y-2 shadow-2xs">
                <div className="flex justify-between">
                  <span className="text-[#576574] font-medium">Transaction:</span>
                  <strong className="text-[#17232e] font-bold">{transaction.counterparty}</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-[#576574] font-medium">Amount:</span>
                  <strong className="text-[#b42318] font-black">${Math.abs(transaction.amount).toFixed(2)} USD</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-[#576574] font-medium">Reference:</span>
                  <span className="text-[#074a2a] font-bold">{transaction.referenceNumber}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-xs text-[#17232e] block mb-1.5">Primary Reason for Dispute</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 bg-[#f8fafb] border-2 border-[#cfd6dc] rounded-xl text-xs text-[#17232e] font-bold focus:bg-white focus:outline-none focus:border-[#074a2a] transition-all"
                >
                  <option value="unauthorized_charge">Unauthorized / Fraudulent Debit</option>
                  <option value="incorrect_amount">Incorrect Amount Charged</option>
                  <option value="goods_not_received">Merchandise or Services Not Delivered</option>
                  <option value="duplicate_charge">Duplicate Billing</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-xs text-[#17232e] block mb-1.5">Investigation Details &amp; Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide any relevant context for the fraud team..."
                  className="w-full p-2.5 bg-[#f8fafb] border-2 border-[#cfd6dc] rounded-xl text-xs text-[#17232e] font-medium placeholder-[#7d8b96] focus:bg-white focus:outline-none focus:border-[#074a2a] transition-all"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t-2 border-[#edf1f5]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-[#cfd6dc] text-[#17232e] font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#b42318] hover:bg-red-800 text-white font-bold transition-all shadow-sm cursor-pointer"
                >
                  Submit Formal Dispute
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
