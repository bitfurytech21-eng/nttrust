import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  ArrowLeftRight,
  Search,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Download,
  Filter
} from 'lucide-react';
import { Transaction } from '../../types/banking';

export const AdminTransactionsView: React.FC = () => {
  const { transactions } = useBanking();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState('');

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.counterparty.toLowerCase().includes(search.toLowerCase()) ||
      tx.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      tx.accountName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleReverseTx = (ref: string) => {
    setActionNotice(`Initiated chargeback / reversal protocol for transaction ${ref}.`);
    setTimeout(() => setActionNotice(''), 4000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Header */}
      <div className="bg-white rounded-md border border-[#D8DEE8] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#147A52]/10 border border-[#147A52]/20 text-[#147A52] text-xs font-semibold mb-1">
            <ShieldAlert className="w-3.5 h-3.5" /> Real-Time AML Surveillance &amp; Settlement Stream
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#20242A] tracking-tight">
            Transaction Surveillance &amp; Dispute Queue
          </h1>
          <p className="text-xs text-[#5F6670] mt-0.5">
            Surveil incoming/outgoing settlements, investigate disputed card charges, and issue provisional clearing credits.
          </p>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded bg-[#147A52]/10 border border-[#147A52]/20 text-[#147A52] text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#147A52] shrink-0" />
          <span className="font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white rounded-md p-4 border border-[#D8DEE8] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-[#5F6670] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by counterparty, reference #, or account..."
            className="w-full pl-10 pr-4 py-2 rounded bg-[#F5F7FA] border border-[#D8DEE8] text-[#20242A] text-xs placeholder-[#5F6670] focus:outline-none focus:border-[#147A52]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded bg-white border border-[#D8DEE8] text-[#20242A] text-xs font-semibold focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending Clearing</option>
            <option value="disputed">Disputed / Under Investigation</option>
          </select>
        </div>
      </div>

      {/* Surveillance Table */}
      <div className="bg-white rounded-md border border-[#D8DEE8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F5F7FA] border-b border-[#D8DEE8] text-[#5F6670] uppercase font-mono text-[11px]">
                <th className="py-3 px-4 font-bold">Timestamp</th>
                <th className="py-3 px-4 font-bold">Counterparty / Merchant</th>
                <th className="py-3 px-4 font-bold">Account</th>
                <th className="py-3 px-4 font-bold">Reference</th>
                <th className="py-3 px-4 text-right font-bold">Sum</th>
                <th className="py-3 px-4 text-center font-bold">AML Status</th>
                <th className="py-3 px-4 text-right font-bold">Ops Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DEE8] font-mono text-[11px]">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#F5F7FA] transition-colors">
                  <td className="py-3.5 px-4 text-[#5F6670] whitespace-nowrap">{tx.timestamp}</td>
                  <td className="py-3.5 px-4 font-sans font-bold text-[#20242A]">{tx.counterparty}</td>
                  <td className="py-3.5 px-4 text-[#5F6670] font-sans">{tx.accountName}</td>
                  <td className="py-3.5 px-4 text-[#147A52]">{tx.referenceNumber}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#20242A]">
                    ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {tx.currency}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      tx.status === 'completed'
                        ? 'bg-[#147A52]/10 text-[#147A52] border border-[#147A52]/20'
                        : tx.status === 'pending'
                        ? 'bg-amber-50 text-[#B87500] border border-amber-200'
                        : 'bg-red-50 text-[#B42318] border border-red-200'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-sans">
                    {tx.status === 'disputed' ? (
                      <button
                        type="button"
                        onClick={() => handleReverseTx(tx.referenceNumber)}
                        className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-100 text-[#B42318] border border-red-200 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Issue Reversal
                      </button>
                    ) : (
                      <span className="text-[#5F6670] text-[10px] font-mono">CLEARED</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
