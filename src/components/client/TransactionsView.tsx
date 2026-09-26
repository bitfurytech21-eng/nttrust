import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  Search,
  Filter,
  Download,
  Receipt,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronDown,
  Calendar,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  FileCheck2,
  Printer,
  Sparkles
} from 'lucide-react';
import { Transaction } from '../../types/banking';
import { ReceiptModal } from '../common/ReceiptModal';
import { DisputeModal } from '../common/DisputeModal';
import { StatementTaxModal } from './StatementTaxModal';
import {
  exportTransactionsToCSV,
  exportTransactionsToPDF,
  exportTaxSummaryCSV
} from '../../utils/exportUtils';

export const TransactionsView: React.FC = () => {
  const { transactions, accounts, currentUser } = useBanking();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [statementModalType, setStatementModalType] = useState<'statement' | 'tax_1099_int' | 'tax_1099_b' | 'proof_of_funds'>('statement');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.counterparty.toLowerCase().includes(search.toLowerCase()) ||
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      tx.referenceNumber.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    const matchesYear = yearFilter === 'all' || tx.timestamp.startsWith(yearFilter);
    const matchesAccount = accountFilter === 'all' || tx.accountId === accountFilter;

    return matchesSearch && matchesType && matchesStatus && matchesYear && matchesAccount;
  });

  // Calculate year metrics
  const totalInflows = filteredTransactions
    .filter(t => t.type === 'deposit' || t.type === 'interest' || t.type === 'transfer_in')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalOutflows = filteredTransactions
    .filter(t => t.type === 'transfer_out' || t.type === 'withdrawal' || t.type === 'bill_payment' || t.type === 'card_purchase' || t.type === 'fee')
    .reduce((acc, t) => acc + t.amount, 0);

  // Direct CSV Export
  const handleExportCSV = () => {
    exportTransactionsToCSV(
      filteredTransactions,
      'Northern_Trust_Transactions',
      yearFilter === 'all' ? '2023_2026_All' : yearFilter
    );
    showToast(`Exported ${filteredTransactions.length} transactions to CSV.`);
  };

  // Direct PDF Export
  const handleExportPDF = () => {
    const selectedAcc = accounts.find(a => a.id === accountFilter) || null;
    exportTransactionsToPDF(filteredTransactions, {
      account: selectedAcc,
      currentUser,
      yearFilter,
      typeFilter
    });
    showToast(`Downloaded Official Transaction Audit PDF (${filteredTransactions.length} records).`);
  };

  // Tax Schedule Export
  const handleExportTaxSchedule = () => {
    const targetTaxYear = yearFilter === 'all' ? '2025' : yearFilter;
    exportTaxSummaryCSV(targetTaxYear, accounts, transactions);
    showToast(`Exported Annual Tax Schedule CSV for ${targetTaxYear}.`);
  };

  return (
    <div className="space-y-6 pb-8 animate-fade-in text-[#20242A]">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 bg-[#0B1F6A] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#147A52] text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#147A52]/10 border-2 border-emerald-300 text-[#147A52] text-xs font-black mb-2 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#147A52] stroke-[2.25]" /> 3-Year Cleared Ledger (2023 – September 2026)
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-[#20242A]">
            Transactions &amp; Activity
          </h1>
          <p className="text-xs text-[#5F6670] mt-1 font-medium">
            Audit book transactions, inspect cleared wire transfers, and export official CSV/PDF records.
          </p>
        </div>

        {/* Global Export Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F5F7FA] border-2 border-[#D8DEE8] hover:border-[#147A52] text-[#147A52] font-bold text-xs flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
            title="Export filtered transaction records to spreadsheet CSV"
          >
            <FileSpreadsheet className="w-4 h-4 stroke-[2.25]" />
            <span>Download CSV ({filteredTransactions.length})</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="px-3.5 py-2 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            title="Download formatted official PDF transaction audit ledger"
          >
            <Download className="w-4 h-4 stroke-[2.25]" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={handleExportTaxSchedule}
            className="px-3.5 py-2 rounded-xl bg-[#F5F7FA] hover:bg-slate-200 border-2 border-[#D8DEE8] text-[#20242A] font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            title="Download Tax Summary Schedule for selected year"
          >
            <FileCheck2 className="w-4 h-4 text-[#147A52]" />
            <span>Tax Schedule</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatementModalType('statement');
              setIsStatementModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-[#147A52] hover:bg-[#0E5E3D] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4 stroke-[2.25]" />
            <span>Statements &amp; 1099 Forms</span>
          </button>
        </div>
      </div>

      {/* Quick 3-Year Selector Bar */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="w-4 h-4 text-[#147A52] stroke-[2.25] mr-1" />
          <span className="text-xs font-bold text-[#5F6670] mr-1">Time Horizon:</span>
          <button
            type="button"
            onClick={() => setYearFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 ${
              yearFilter === 'all'
                ? 'bg-[#0B1F6A] text-white border-[#0B1F6A] shadow-xs'
                : 'bg-[#F5F7FA] text-[#20242A] border-[#D8DEE8] hover:bg-slate-200'
            }`}
          >
            All 3 Years (2023–2026)
          </button>
          <button
            type="button"
            onClick={() => setYearFilter('2026')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 ${
              yearFilter === '2026'
                ? 'bg-[#147A52] text-white border-emerald-600 shadow-xs'
                : 'bg-[#F5F7FA] text-[#20242A] border-[#D8DEE8] hover:bg-slate-200'
            }`}
          >
            2026 (Jan–Sep)
          </button>
          <button
            type="button"
            onClick={() => setYearFilter('2025')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 ${
              yearFilter === '2025'
                ? 'bg-[#0B1F6A] text-white border-[#0B1F6A] shadow-xs'
                : 'bg-[#F5F7FA] text-[#20242A] border-[#D8DEE8] hover:bg-slate-200'
            }`}
          >
            2025 Full Year
          </button>
          <button
            type="button"
            onClick={() => setYearFilter('2024')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 ${
              yearFilter === '2024'
                ? 'bg-[#0B1F6A] text-white border-[#0B1F6A] shadow-xs'
                : 'bg-[#F5F7FA] text-[#20242A] border-[#D8DEE8] hover:bg-slate-200'
            }`}
          >
            2024 Full Year
          </button>
          <button
            type="button"
            onClick={() => setYearFilter('2023')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-2 ${
              yearFilter === '2023'
                ? 'bg-[#0B1F6A] text-white border-[#0B1F6A] shadow-xs'
                : 'bg-[#F5F7FA] text-[#20242A] border-[#D8DEE8] hover:bg-slate-200'
            }`}
          >
            2023 Full Year
          </button>
        </div>

        {/* Selected Year Mini Metrics */}
        <div className="flex items-center gap-4 text-xs font-mono shrink-0 pl-0 md:pl-4 md:border-l-2 border-[#D8DEE8]">
          <div>
            <span className="text-[10px] text-[#5F6670] uppercase font-sans block font-semibold">Credits (+)</span>
            <span className="font-bold text-emerald-700">+${totalInflows.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#5F6670] uppercase font-sans block font-semibold">Debits (-)</span>
            <span className="font-bold text-rose-700">-${totalOutflows.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-4 sm:p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-[#5F6670] stroke-[2.25] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by counterparty, reference, memo..."
            className="w-full pl-10 pr-3.5 py-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium placeholder-[#5F6670] focus:bg-white focus:outline-none focus:border-[#147A52] transition-all shadow-2xs"
          />
        </div>

        <div>
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-bold focus:bg-white focus:outline-none focus:border-[#147A52] transition-all shadow-2xs"
          >
            <option value="all">All Accounts (Consolidated)</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.name} (••• {acc.accountNumber.slice(-4)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-bold focus:bg-white focus:outline-none focus:border-[#147A52] transition-all shadow-2xs"
          >
            <option value="all">All Transaction Types</option>
            <option value="transfer_out">Wire Transfers &amp; Grants</option>
            <option value="deposit">Royalties &amp; Inbound Deposits</option>
            <option value="interest">Compounded Interest Credits</option>
            <option value="card_purchase">Card Purchases</option>
            <option value="bill_payment">Estate &amp; Lease Payments</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-bold focus:bg-white focus:outline-none focus:border-[#147A52] transition-all shadow-2xs"
          >
            <option value="all">All Settlement Statuses</option>
            <option value="completed">Completed / Settled</option>
            <option value="pending">Pending Clearing</option>
            <option value="disputed">Under Dispute</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] shadow-sm overflow-hidden">
        <div className="p-3.5 bg-[#F5F7FA] border-b-2 border-[#D8DEE8] flex items-center justify-between">
          <div className="text-xs font-bold text-[#20242A] flex items-center gap-2">
            <span>Showing <strong className="font-mono text-[#147A52]">{filteredTransactions.length}</strong> transactions</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="text-xs text-[#147A52] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Table CSV</span>
            </button>
            <span className="text-[#D8DEE8]">•</span>
            <button
              type="button"
              onClick={handleExportPDF}
              className="text-xs text-[#0B1F6A] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Ledger PDF</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F5F7FA] border-b-2 border-[#D8DEE8] text-[#5F6670] font-black text-[10px] font-mono uppercase tracking-wider">
                <th className="py-3 px-4">Counterparty / Description</th>
                <th className="py-3 px-4">Date &amp; Time</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#F5F7FA]">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[#5F6670] font-medium">
                    No transactions match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-[#F5F7FA] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border-2 shadow-2xs ${
                            isPositive
                              ? 'bg-[#147A52]/10 text-[#147A52] border-emerald-300'
                              : 'bg-slate-100 text-[#20242A] border-slate-300'
                          }`}>
                            {isPositive ? <ArrowDownLeft className="w-4 h-4 stroke-[2.25]" /> : <ArrowUpRight className="w-4 h-4 stroke-[2.25]" />}
                          </div>
                          <div>
                            <span className="font-extrabold text-[#20242A] block text-xs">{tx.counterparty}</span>
                            <span className="text-[10px] text-[#5F6670] font-mono font-medium">{tx.referenceNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#5F6670] whitespace-nowrap text-xs font-mono font-medium">
                        {tx.timestamp}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F5F7FA] text-[#5F6670] border-2 border-[#D8DEE8]">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-black border-2 ${
                          tx.status === 'completed'
                            ? 'bg-[#147A52]/10 text-[#147A52] border-emerald-300'
                            : tx.status === 'pending'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-red-50 text-[#B42318] border-red-300'
                        }`}>
                          {tx.status.toUpperCase()}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-black text-sm ${
                        isPositive ? 'text-[#147A52]' : 'text-[#20242A]'
                      }`}>
                        {isPositive ? '+' : ''}${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTx(tx);
                              setIsReceiptOpen(true);
                            }}
                            className="p-1.5 rounded-lg border-2 border-transparent hover:border-[#D8DEE8] hover:bg-slate-100 text-[#147A52] transition-all cursor-pointer"
                            title="View Receipt"
                          >
                            <Receipt className="w-4 h-4 stroke-[2.25]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTx(tx);
                              setIsDisputeOpen(true);
                            }}
                            className="p-1.5 rounded-lg border-2 border-transparent hover:border-red-200 hover:bg-red-50 text-[#5F6670] hover:text-[#B42318] transition-all cursor-pointer"
                            title="File Dispute"
                          >
                            <AlertTriangle className="w-4 h-4 stroke-[2.25]" />
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

      {/* Modals */}
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
        initialType={statementModalType}
      />
    </div>
  );
};
