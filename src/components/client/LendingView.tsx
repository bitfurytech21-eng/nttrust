import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  Landmark,
  ShieldCheck,
  DollarSign,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Percent,
  Calendar,
  Layers,
  FileSpreadsheet,
  Check
} from 'lucide-react';

export const LendingView: React.FC = () => {
  const { accounts, creditLine, drawdownCreditLine, repayCreditLine } = useBanking();

  // Drawdown & Repayment State
  const [targetAccountId, setTargetAccountId] = useState(accounts[0]?.id || '');
  const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?.id || '');
  const [drawAmount, setDrawAmount] = useState('25000');
  const [repayAmount, setRepayAmount] = useState('10000');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Mortgage Calculator State
  const [calcLoanAmount, setCalcLoanAmount] = useState<number>(1500000); // 1.5M Jumbo Mortgage
  const [calcRate, setCalcRate] = useState<number>(6.25); // 6.25% APR
  const [calcTermYears, setCalcTermYears] = useState<number>(30); // 30 Years

  const handleDrawdown = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(drawAmount);
    if (!amt || amt <= 0) return;

    const res = drawdownCreditLine(targetAccountId, amt);
    if (res.success) {
      setActionSuccessMsg(`Successfully drew down $${amt.toLocaleString()} from your Lombard credit line into your account.`);
      setActionErrorMsg(null);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } else {
      setActionErrorMsg(res.error || 'Drawdown failed');
    }
  };

  const handleRepay = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(repayAmount);
    if (!amt || amt <= 0) return;

    const res = repayCreditLine(sourceAccountId, amt);
    if (res.success) {
      setActionSuccessMsg(`Successfully repaid $${amt.toLocaleString()} to your Lombard credit facility.`);
      setActionErrorMsg(null);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } else {
      setActionErrorMsg(res.error || 'Repayment failed');
    }
  };

  // Monthly mortgage calculation
  const monthlyRate = (calcRate / 100) / 12;
  const numPayments = calcTermYears * 12;
  const monthlyPrincipalAndInterest =
    (calcLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  const estimatedTaxesAndIns = calcLoanAmount * 0.0012; // ~0.12% per month
  const totalEstimatedMonthly = monthlyPrincipalAndInterest + estimatedTaxesAndIns;

  // First 12 months amortization schedule
  const amortizationSchedule = [];
  let currentBalance = calcLoanAmount;
  for (let month = 1; month <= 12; month++) {
    const interestPmt = currentBalance * monthlyRate;
    const principalPmt = monthlyPrincipalAndInterest - interestPmt;
    currentBalance -= principalPmt;
    amortizationSchedule.push({
      month,
      payment: monthlyPrincipalAndInterest,
      principal: principalPmt,
      interest: interestPmt,
      remainingBalance: Math.max(0, currentBalance)
    });
  }

  const drawnPercentage = (creditLine.drawnAmount / creditLine.totalLimit) * 100;

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0B1F6A]/10 border-2 border-[#0B1F6A]/20 text-[#0B1F6A] text-xs font-black mb-2 shadow-2xs">
            <Landmark className="w-4 h-4 stroke-[2.25]" /> Private Wealth Lending &bull; Lombard Liquidity Facility
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-[#20242A]">
            Credit Lines &amp; Institutional Financing
          </h1>
          <p className="text-xs text-[#5F6670] mt-1 font-medium">
            Access immediate liquidity against eligible custodial investment portfolios, execute instantaneous drawdowns, and model bespoke mortgages.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs font-bold bg-[#F5F7FA] px-3 py-2 rounded-xl border border-[#D8DEE8] shrink-0">
          <span>Facility Rate: Prime + 0.75% ({creditLine.apr}% APR)</span>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 flex items-center gap-2 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {actionErrorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-center gap-2 text-xs font-bold animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
          <span>{actionErrorMsg}</span>
        </div>
      )}

      {/* Lombard Credit Facility Overview Card */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-[#D8DEE8]">
          <div>
            <h2 className="font-bold text-base text-[#20242A] flex items-center gap-2">
              <span>{creditLine.facilityName}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                ACTIVE
              </span>
            </h2>
            <p className="text-xs text-[#5F6670] font-mono mt-0.5">Facility ID: {creditLine.facilityId}</p>
          </div>

          <div className="text-right text-xs">
            <span className="text-[#5F6670]">Linked Collateral Portfolio:</span>
            <span className="font-mono font-bold text-[#0B1F6A] ml-1.5">
              ${creditLine.linkedCollateralValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#D8DEE8] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#5F6670] block">Total Credit Line</span>
            <span className="text-lg font-black font-mono text-[#20242A]">
              ${creditLine.totalLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#D8DEE8] space-y-1">
            <span className="text-[10px] uppercase font-bold text-rose-700 block">Drawn Balance (Utilized)</span>
            <span className="text-lg font-black font-mono text-rose-700">
              ${creditLine.drawnAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-300 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Available to Drawdown</span>
            <span className="text-lg font-black font-mono text-emerald-800">
              ${creditLine.availableLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#D8DEE8] space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#5F6670] block">Monthly Min. Due ({creditLine.paymentDueDate})</span>
            <span className="text-lg font-black font-mono text-[#0B1F6A]">
              ${creditLine.minimumMonthlyPayment.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Utilization Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-bold text-[#5F6670]">
            <span>Line Utilization ({drawnPercentage.toFixed(1)}%)</span>
            <span>Maximum Safe Threshold: 65% LTV</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full transition-all ${drawnPercentage > 50 ? 'bg-amber-500' : 'bg-[#0B1F6A]'}`}
              style={{ width: `${Math.min(100, drawnPercentage)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Drawdown & Repayment Action Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Drawdown Form */}
        <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-sm text-[#20242A] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              <span>Instant Credit Drawdown</span>
            </h3>
            <p className="text-[11px] text-[#5F6670] mt-0.5">
              Instantly advance funds into your operating account with zero origination fees.
            </p>
          </div>

          <form onSubmit={handleDrawdown} className="space-y-4">
            <div>
              <label className="font-bold text-[#20242A] block mb-1">Deposit To Account</label>
              <select
                value={targetAccountId}
                onChange={e => setTargetAccountId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] font-bold text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — Balance: ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-[#20242A] block mb-1">Drawdown Amount (USD)</label>
              <input
                type="number"
                step="1000"
                max={creditLine.availableLimit}
                value={drawAmount}
                onChange={e => setDrawAmount(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] font-mono font-bold text-sm text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
              />
              <span className="text-[10px] text-[#5F6670] mt-1 block">
                Up to ${creditLine.availableLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })} available
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <span>Authorize &amp; Deposit to Checking</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Repayment Form */}
        <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-sm text-[#20242A] flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-[#0B1F6A]" />
              <span>Credit Facility Repayment</span>
            </h3>
            <p className="text-[11px] text-[#5F6670] mt-0.5">
              Pay down principal balance from your liquid cash reserves anytime with zero prepayment penalty.
            </p>
          </div>

          <form onSubmit={handleRepay} className="space-y-4">
            <div>
              <label className="font-bold text-[#20242A] block mb-1">Pay From Account</label>
              <select
                value={sourceAccountId}
                onChange={e => setSourceAccountId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] font-bold text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — Balance: ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-[#20242A] block mb-1">Repayment Amount (USD)</label>
              <input
                type="number"
                step="500"
                max={creditLine.drawnAmount}
                value={repayAmount}
                onChange={e => setRepayAmount(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] font-mono font-bold text-sm text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
              />
              <span className="text-[10px] text-[#5F6670] mt-1 block">
                Current outstanding drawn balance: ${creditLine.drawnAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <button
              type="submit"
              disabled={creditLine.drawnAmount <= 0}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border-2 border-[#D8DEE8] hover:border-[#0B1F6A] text-[#0B1F6A] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <span>Submit Principal Repayment</span>
            </button>
          </form>
        </div>
      </div>

      {/* Jumbo Mortgage & Financing Calculator Enclave */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-[#D8DEE8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B1F6A]/10 text-[#0B1F6A] flex items-center justify-center">
              <Calculator className="w-5 h-5 stroke-[2.25]" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#20242A]">Jumbo Mortgage &amp; Amortization Modeler</h2>
              <p className="text-xs text-[#5F6670]">Model financing scenarios, interest breakdown, and amortization curves</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#5F6670]">Estimated Monthly Payment:</span>
            <div className="text-xl font-black font-mono text-[#0B1F6A]">
              ${totalEstimatedMonthly.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mo
            </div>
          </div>
        </div>

        {/* Inputs & Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-2">
            <div className="flex justify-between font-bold">
              <span>Loan Amount</span>
              <span className="font-mono text-[#0B1F6A]">${calcLoanAmount.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="250000"
              max="5000000"
              step="50000"
              value={calcLoanAmount}
              onChange={e => setCalcLoanAmount(parseFloat(e.target.value))}
              className="w-full accent-[#0B1F6A]"
            />
            <div className="flex justify-between text-[10px] text-[#5F6670] font-mono">
              <span>$250K</span>
              <span>$5.0M</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between font-bold">
              <span>Interest Rate (APR)</span>
              <span className="font-mono text-[#0B1F6A]">{calcRate}%</span>
            </div>
            <input
              type="range"
              min="4.0"
              max="9.5"
              step="0.125"
              value={calcRate}
              onChange={e => setCalcRate(parseFloat(e.target.value))}
              className="w-full accent-[#0B1F6A]"
            />
            <div className="flex justify-between text-[10px] text-[#5F6670] font-mono">
              <span>4.0%</span>
              <span>9.5%</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between font-bold">
              <span>Loan Term</span>
              <span className="font-mono text-[#0B1F6A]">{calcTermYears} Years</span>
            </div>
            <div className="flex gap-2">
              {[15, 30].map(yr => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setCalcTermYears(yr)}
                  className={`flex-1 py-2 rounded-xl border-2 font-bold transition-all cursor-pointer ${
                    calcTermYears === yr
                      ? 'border-[#0B1F6A] bg-[#0B1F6A] text-white shadow-xs'
                      : 'border-[#D8DEE8] bg-white text-[#20242A]'
                  }`}
                >
                  {yr} Years Fixed
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 12-Month Amortization Schedule Table */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#20242A] uppercase tracking-wider text-[11px]">
              First Year Monthly Amortization Breakdown
            </span>
            <span className="text-[11px] font-mono text-[#5F6670]">Principal vs Interest Split</span>
          </div>

          <div className="border border-[#D8DEE8] rounded-xl overflow-hidden max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F5F7FA] text-[#5F6670] font-bold text-[10.5px] uppercase border-b border-[#D8DEE8] sticky top-0">
                <tr>
                  <th className="py-2 px-3">Month</th>
                  <th className="py-2 px-3 text-right">Payment</th>
                  <th className="py-2 px-3 text-right">Principal</th>
                  <th className="py-2 px-3 text-right">Interest</th>
                  <th className="py-2 px-3 text-right">Ending Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DEE8] font-mono text-[11px]">
                {amortizationSchedule.map(row => (
                  <tr key={row.month} className="hover:bg-slate-50">
                    <td className="py-2 px-3 text-[#5F6670] font-bold">Month {row.month}</td>
                    <td className="py-2 px-3 text-right text-[#20242A]">
                      ${row.payment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-700 font-bold">
                      ${row.principal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right text-rose-700 font-bold">
                      ${row.interest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-right text-[#0B1F6A] font-black">
                      ${row.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
