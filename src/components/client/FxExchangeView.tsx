import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Globe2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  DollarSign,
  ArrowRight,
  Sliders,
  Clock,
  Layers,
  Zap,
  Lock
} from 'lucide-react';
import { BankAccount } from '../../types/banking';

export const FxExchangeView: React.FC = () => {
  const { accounts, executeFxConversion } = useBanking();

  // Currency rates vs USD base
  const [fxRates] = useState<Record<string, { rate: number; change24h: number; spread: number }>>({
    EUR: { rate: 0.9215, change24h: +0.28, spread: 0.0012 },
    GBP: { rate: 0.7742, change24h: -0.14, spread: 0.0010 },
    CHF: { rate: 0.8845, change24h: +0.45, spread: 0.0008 },
    JPY: { rate: 154.25, change24h: -0.62, spread: 0.15 },
    CAD: { rate: 1.3610, change24h: +0.05, spread: 0.0015 },
    SGD: { rate: 1.3180, change24h: +0.12, spread: 0.0010 },
    AUD: { rate: 1.5120, change24h: +0.33, spread: 0.0018 }
  });

  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[2]?.id || accounts[1]?.id || '');
  const [sourceAmount, setSourceAmount] = useState('25000');
  const [isExecuting, setIsExecuting] = useState(false);
  const [exchangeSuccess, setExchangeSuccess] = useState<{ fromAmt: number; toAmt: number; fromCurr: string; toCurr: string; rate: number } | null>(null);
  const [exchangeError, setExchangeError] = useState<string | null>(null);

  // Rate Alert State
  const [alertPair, setAlertPair] = useState('EUR/USD');
  const [alertRate, setAlertRate] = useState('1.1050');
  const [alertSuccess, setAlertSuccess] = useState(false);

  const fromAccount = accounts.find(a => a.id === fromAccountId) || accounts[0];
  const toAccount = accounts.find(a => a.id === toAccountId) || accounts[1];

  const sourceCurrency = fromAccount?.currency || 'USD';
  const targetCurrency = toAccount?.currency || 'EUR';

  // Compute conversion rate between the two currencies
  const getRate = (fromCurr: string, toCurr: string): number => {
    if (fromCurr === toCurr) return 1.0;
    if (fromCurr === 'USD') return fxRates[toCurr]?.rate || 1.0;
    if (toCurr === 'USD') return 1 / (fxRates[fromCurr]?.rate || 1.0);
    // Cross rate
    const fromToUSD = 1 / (fxRates[fromCurr]?.rate || 1.0);
    const usdToTarget = fxRates[toCurr]?.rate || 1.0;
    return fromToUSD * usdToTarget;
  };

  const currentRate = getRate(sourceCurrency, targetCurrency);
  const numSource = parseFloat(sourceAmount) || 0;
  const targetCalculated = numSource * currentRate;

  const handleExecuteExchange = (e: React.FormEvent) => {
    e.preventDefault();
    if (numSource <= 0 || fromAccountId === toAccountId) {
      setExchangeError('Please select different accounts and a valid exchange amount.');
      return;
    }

    setIsExecuting(true);
    setExchangeError(null);

    setTimeout(() => {
      const res = executeFxConversion(fromAccountId, toAccountId, numSource, targetCalculated, currentRate);
      setIsExecuting(false);

      if (res.success) {
        setExchangeSuccess({
          fromAmt: numSource,
          toAmt: targetCalculated,
          fromCurr: sourceCurrency,
          toCurr: targetCurrency,
          rate: currentRate
        });
        setTimeout(() => setExchangeSuccess(null), 5000);
      } else {
        setExchangeError(res.error || 'Exchange transaction failed.');
      }
    }, 600);
  };

  const handleSetAlert = (e: React.FormEvent) => {
    e.preventDefault();
    setAlertSuccess(true);
    setTimeout(() => setAlertSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0B1F6A]/10 border-2 border-[#0B1F6A]/20 text-[#0B1F6A] text-xs font-black mb-2 shadow-2xs">
            <Globe2 className="w-4 h-4 stroke-[2.25]" /> Global Institutional FX Desk &bull; Real-Time Execution
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-[#20242A]">
            Foreign Exchange &amp; Multi-Currency Vault
          </h1>
          <p className="text-xs text-[#5F6670] mt-1 font-medium">
            Execute spot currency conversions across G10 currencies with institutional spreads (0.15%), zero commissions, and instant account settlement.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono font-bold bg-[#F5F7FA] px-3 py-2 rounded-xl border border-[#D8DEE8] shrink-0">
          <Clock className="w-4 h-4 text-[#0B1F6A]" />
          <span>Global Markets: OPEN (London/NY Desk)</span>
        </div>
      </div>

      {/* Live FX Rates Ticker Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {Object.entries(fxRates).map(([pair, data]) => {
          const isUp = data.change24h >= 0;
          return (
            <div
              key={pair}
              className="bg-white p-3 rounded-xl border-2 border-[#D8DEE8] space-y-1 shadow-2xs hover:border-[#0B1F6A] transition-all"
            >
              <div className="flex justify-between items-center text-[10.5px] font-bold text-[#5F6670]">
                <span>USD/{pair}</span>
                <span className={`flex items-center text-[10px] font-mono ${isUp ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                  {isUp ? `+${data.change24h}%` : `${data.change24h}%`}
                </span>
              </div>
              <div className="font-mono font-black text-sm text-[#20242A]">
                {data.rate.toFixed(4)}
              </div>
              <div className="text-[9.5px] text-[#5F6670] font-mono">
                Spread: {(data.spread * 100).toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Terminal: Currency Conversion Calculator & Alert Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: FX Execution Terminal */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE8]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0B1F6A] text-white flex items-center justify-center font-black text-xs">
                  FX
                </div>
                <div>
                  <h2 className="font-bold text-sm text-[#20242A]">Spot Currency Exchange Terminal</h2>
                  <p className="text-[11px] text-[#5F6670]">Instant debit and credit between accounts</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-md text-[10.5px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                FEES: $0.00 WAIVED
              </span>
            </div>

            {exchangeSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 space-y-1 text-xs animate-fade-in">
                <div className="flex items-center gap-2 font-black">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Currency Conversion Executed Successfully!</span>
                </div>
                <p>
                  Converted <strong>{exchangeSuccess.fromAmt.toLocaleString()} {exchangeSuccess.fromCurr}</strong> &rarr;{' '}
                  <strong>{exchangeSuccess.toAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {exchangeSuccess.toCurr}</strong>.
                </p>
                <p className="font-mono text-[10.5px] text-emerald-800">
                  Execution Spot Rate: 1 {exchangeSuccess.fromCurr} = {exchangeSuccess.rate.toFixed(4)} {exchangeSuccess.toCurr}
                </p>
              </div>
            )}

            {exchangeError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 font-bold text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                <span>{exchangeError}</span>
              </div>
            )}

            <form onSubmit={handleExecuteExchange} className="space-y-5 text-xs">
              {/* You Sell Section */}
              <div className="p-4 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-[#5F6670] uppercase">You Transfer Out (Sell)</span>
                  <span className="text-[11px] font-mono text-[#5F6670]">
                    Available: ${fromAccount?.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {fromAccount?.currency}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-7">
                    <select
                      value={fromAccountId}
                      onChange={e => setFromAccountId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-[#D8DEE8] font-bold text-xs text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
                    >
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.currency})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-5">
                    <input
                      type="number"
                      step="0.01"
                      value={sourceAmount}
                      onChange={e => setSourceAmount(e.target.value)}
                      required
                      placeholder="Amount"
                      className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-[#D8DEE8] font-mono font-bold text-sm text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
                    />
                  </div>
                </div>
              </div>

              {/* Rate Calculation Bridge */}
              <div className="flex items-center justify-between px-2 text-xs">
                <div className="flex items-center gap-2 text-[#0B1F6A] font-mono font-black text-sm">
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>1 {sourceCurrency} = {currentRate.toFixed(4)} {targetCurrency}</span>
                </div>
                <span className="text-[11px] text-[#5F6670]">Institutional Rate Guaranteed for 60s</span>
              </div>

              {/* You Receive Section */}
              <div className="p-4 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-[#5F6670] uppercase">You Transfer In (Buy)</span>
                  <span className="text-[11px] font-mono text-[#5F6670]">
                    Current Balance: ${toAccount?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {toAccount?.currency}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-7">
                    <select
                      value={toAccountId}
                      onChange={e => setToAccountId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-[#D8DEE8] font-bold text-xs text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
                    >
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.currency})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-5 flex items-center px-3 py-2.5 rounded-xl bg-white border-2 border-emerald-300 font-mono font-black text-sm text-emerald-700">
                    ~{targetCalculated.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {targetCurrency}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isExecuting || numSource <= 0 || fromAccountId === toAccountId}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Zap className="w-4 h-4 stroke-[2.25]" />
                <span>{isExecuting ? 'Routing to Global Clearing...' : 'Execute Instant Spot Conversion'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right: Currency Limit Alert & Multi-Currency Breakdown */}
        <div className="lg:col-span-5 space-y-5">
          {/* Rate Alert Setup */}
          <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-4 text-xs">
            <div>
              <h2 className="font-bold text-sm text-[#20242A] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#0B1F6A]" />
                <span>Treasury Rate Alert Trigger</span>
              </h2>
              <p className="text-[11px] text-[#5F6670] mt-0.5">
                Receive instant push &amp; SMS alerts when a target rate is reached.
              </p>
            </div>

            {alertSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold animate-fade-in">
                Price alert activated for {alertPair} at target rate {alertRate}.
              </div>
            )}

            <form onSubmit={handleSetAlert} className="space-y-3">
              <div>
                <label className="font-bold text-[#20242A] block mb-1">Currency Pair</label>
                <select
                  value={alertPair}
                  onChange={e => setAlertPair(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] font-bold text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
                >
                  <option value="EUR/USD">EUR / USD (Euro)</option>
                  <option value="GBP/USD">GBP / USD (British Pound)</option>
                  <option value="USD/CHF">USD / CHF (Swiss Franc)</option>
                  <option value="USD/JPY">USD / JPY (Japanese Yen)</option>
                  <option value="USD/SGD">USD / SGD (Singapore Dollar)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#20242A] block mb-1">Target Strike Rate</label>
                <input
                  type="number"
                  step="0.0001"
                  value={alertRate}
                  onChange={e => setAlertRate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] font-mono font-bold text-[#20242A] focus:outline-none focus:border-[#0B1F6A]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border-2 border-[#D8DEE8] hover:border-[#0B1F6A] text-[#0B1F6A] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <span>Save Rate Alert</span>
              </button>
            </form>
          </div>

          {/* Multi-Currency Portfolio Holdings */}
          <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm space-y-4 text-xs">
            <h2 className="font-bold text-sm text-[#20242A]">Multi-Currency Reserve Distribution</h2>

            <div className="space-y-3">
              {[
                { curr: 'USD', name: 'US Dollars', amount: '$2,843,050.00', pct: '77.8%' },
                { curr: 'CHF', name: 'Swiss Francs (Forex)', amount: '320,500.00 CHF (~$362,350 USD)', pct: '9.9%' },
                { curr: 'EUR', name: 'Euro Reserves', amount: '225,000.00 EUR (~$244,150 USD)', pct: '6.7%' },
                { curr: 'GBP', name: 'British Sterling', amount: '160,000.00 GBP (~$206,500 USD)', pct: '5.6%' }
              ].map(item => (
                <div key={item.curr} className="p-3 rounded-xl bg-[#F5F7FA] border border-[#D8DEE8] space-y-1.5">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-[#20242A]">{item.curr} — {item.name}</span>
                    <span className="font-mono text-[#0B1F6A]">{item.pct}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-[#0B1F6A]" style={{ width: item.pct }} />
                  </div>
                  <div className="text-[11px] font-mono text-[#5F6670]">{item.amount}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
