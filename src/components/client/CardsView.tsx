import React, { useState, useEffect, useRef } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Sliders,
  Globe2,
  Wifi,
  Smartphone,
  CheckCircle2,
  RefreshCw,
  Building2,
  AlertCircle,
  KeyRound,
  X,
  Plane,
  Plus,
  Trash2,
  Zap,
  Copy,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { BankCard } from '../../types/banking';
import { NorthernTrustLogo } from '../common/NorthernTrustLogo';
import { RealBankCard } from '../common/RealBankCard';

export const CardsView: React.FC = () => {
  const {
    currentUser,
    cards,
    toggleCardFreeze,
    updateCardLimits,
    updateCardSecuritySwitches,
    travelNotices,
    addTravelNotice,
    deleteTravelNotice,
    merchantCategoryLocks,
    updateMerchantCategoryLocks
  } = useBanking();

  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [showSensitiveDetails, setShowSensitiveDetails] = useState<Record<string, boolean>>({});
  const [revealTimer, setRevealTimer] = useState<number>(0);
  const [srStatus, setSrStatus] = useState<string>('');

  // Card Verification Modal
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyPasscode, setVerifyPasscode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const verifyInputRef = useRef<HTMLInputElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);

  // PIN Change Modal
  const [pinChangeOpen, setPinChangeOpen] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);
  const pinInputRef = useRef<HTMLInputElement>(null);

  // Travel Notice Modal State
  const [travelModalOpen, setTravelModalOpen] = useState(false);
  const [travelCountry, setTravelCountry] = useState('Switzerland, France, Italy');
  const [travelDeparture, setTravelDeparture] = useState(new Date().toISOString().slice(0, 10));
  const [travelReturn, setTravelReturn] = useState(new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10));
  const [travelPhone, setTravelPhone] = useState('+1 (555) 739-2810');

  // Virtual Card State
  const [virtualCardModalOpen, setVirtualCardModalOpen] = useState(false);
  const [virtualCardCVV, setVirtualCardCVV] = useState('842');
  const [cvvTimer, setCvvTimer] = useState(300); // 5 min rotating CVV

  const selectedCard = cards.find((c) => c.id === selectedCardId) || cards[0];
  const isSensitiveRevealed = !!showSensitiveDetails[selectedCard.id];

  // Auto re-masking countdown timer (60 seconds)
  useEffect(() => {
    if (!isSensitiveRevealed) {
      setRevealTimer(0);
      return;
    }

    setRevealTimer(60);
    const interval = setInterval(() => {
      setRevealTimer(prev => {
        if (prev <= 1) {
          setShowSensitiveDetails(curr => ({ ...curr, [selectedCard.id]: false }));
          setSrStatus('Card details have been automatically re-masked for your security.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSensitiveRevealed, selectedCard.id]);

  // Focus management for Card Verification Modal
  useEffect(() => {
    if (verifyModalOpen) {
      const timer = setTimeout(() => {
        verifyInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [verifyModalOpen]);

  // Focus management for PIN Modal
  useEffect(() => {
    if (pinChangeOpen) {
      const timer = setTimeout(() => {
        pinInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [pinChangeOpen]);

  // Escape key handler for open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (verifyModalOpen) {
          setVerifyModalOpen(false);
          setVerifyError('');
          setVerifyPasscode('');
          triggerButtonRef.current?.focus();
        }
        if (pinChangeOpen) setPinChangeOpen(false);
        if (travelModalOpen) setTravelModalOpen(false);
        if (virtualCardModalOpen) setVirtualCardModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [verifyModalOpen, pinChangeOpen, travelModalOpen, virtualCardModalOpen]);

  // Virtual Card CVV rotating timer
  useEffect(() => {
    if (!virtualCardModalOpen) return;
    const interval = setInterval(() => {
      setCvvTimer(prev => {
        if (prev <= 1) {
          setVirtualCardCVV(Math.floor(100 + Math.random() * 900).toString());
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [virtualCardModalOpen]);

  const toggleRevealSensitive = (id: string, triggerEl?: HTMLButtonElement | null) => {
    if (showSensitiveDetails[id]) {
      // Mask immediately
      setShowSensitiveDetails(prev => ({ ...prev, [id]: false }));
      setSrStatus('Card details are now masked.');
    } else {
      // Verification required to view sensitive card details
      if (triggerEl) triggerButtonRef.current = triggerEl;
      setVerifyPasscode('');
      setVerifyError('');
      setVerifyModalOpen(true);
    }
  };

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyPasscode.trim()) {
      setVerifyError('Please enter your 4-digit verification passcode.');
      return;
    }

    // Authenticate client verification passcode
    if (verifyPasscode.length >= 4) {
      setShowSensitiveDetails(prev => ({ ...prev, [selectedCard.id]: true }));
      setVerifyModalOpen(false);
      setVerifyPasscode('');
      setVerifyError('');
      setSrStatus('Verification successful. Card details are now visible for 60 seconds.');
      triggerButtonRef.current?.focus();
    } else {
      setVerifyError('Invalid verification passcode. Please enter a valid 4-digit PIN.');
    }
  };

  const handleCloseVerifyModal = () => {
    setVerifyModalOpen(false);
    setVerifyError('');
    setVerifyPasscode('');
    triggerButtonRef.current?.focus();
  };

  const handleLimitChange = (spendLimit: number, atmLimit: number) => {
    updateCardLimits(selectedCard.id, spendLimit, atmLimit);
    setSrStatus(`Spending limit updated to $${spendLimit.toLocaleString()} USD.`);
  };

  const handleToggleSwitch = (key: 'allowInternational' | 'allowOnlineTransactions' | 'allowAtmWithdrawals' | 'allowContactless') => {
    updateCardSecuritySwitches(selectedCard.id, {
      allowInternational: key === 'allowInternational' ? !selectedCard.allowInternational : selectedCard.allowInternational,
      allowOnline: key === 'allowOnlineTransactions' ? !selectedCard.allowOnlineTransactions : selectedCard.allowOnlineTransactions,
      allowAtm: key === 'allowAtmWithdrawals' ? !selectedCard.allowAtmWithdrawals : selectedCard.allowAtmWithdrawals,
      allowContactless: key === 'allowContactless' ? !selectedCard.allowContactless : selectedCard.allowContactless
    });
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length === 4) {
      setPinSuccess(true);
      setSrStatus('Card PIN code updated successfully.');
      setTimeout(() => {
        setPinSuccess(false);
        setPinChangeOpen(false);
        setNewPin('');
      }, 1500);
    }
  };

  const handleAddTravelNotice = (e: React.FormEvent) => {
    e.preventDefault();
    addTravelNotice({
      cardId: selectedCard.id,
      cardName: selectedCard.tier === 'black_metal' ? 'Northern Trust Black Metal' : 'Northern Trust Private Reserve',
      destinationCountries: travelCountry.split(',').map(c => c.trim()).filter(Boolean),
      departureDate: travelDeparture,
      returnDate: travelReturn,
      contactPhone: travelPhone
    });
    setTravelModalOpen(false);
    setSrStatus(`Travel notice registered for ${travelCountry}.`);
  };

  const handleToggleMerchantLock = (key: string) => {
    updateMerchantCategoryLocks({
      ...merchantCategoryLocks,
      [key]: !merchantCategoryLocks[key]
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Live Region for Screen Reader Announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {srStatus}
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-[#D8DEE8] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#147A52]/10 border border-[#147A52]/20 text-[#147A52] text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#147A52]" /> Titanium Hardware Security Chip
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1F6A]">
            Payment Cards &amp; Spending Controls
          </h1>
          <p className="text-xs text-[#5F6670] mt-1 font-medium">
            Manage debit &amp; private credit lines, freeze status, real-time merchant channel controls, travel notices, and virtual cards.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setTravelModalOpen(true)}
            aria-label={`Travel Notice. ${travelNotices.length} active notices.`}
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border-2 border-[#D8DEE8] hover:border-[#0B1F6A] text-[#0B1F6A] font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            <Plane className="w-4 h-4" />
            <span>Travel Notice ({travelNotices.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setVirtualCardModalOpen(true)}
            aria-label="Generate Single-Use Disposable Virtual Card"
            className="px-3.5 py-2.5 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            <Zap className="w-4 h-4 stroke-[2.25]" />
            <span>Generate Virtual Card</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Card Selector & Visualization + Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Card Visual & Quick Actions */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-[#D8DEE8] p-5 sm:p-6 shadow-xs space-y-5">
            {/* Card Switcher */}
            <div className="flex items-center gap-2" role="group" aria-label="Select Bank Card">
              {cards.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCardId(c.id)}
                  aria-pressed={selectedCardId === c.id}
                  aria-label={`${c.cardType.toUpperCase()} Card ending in ${c.cardNumber.slice(-4)}${selectedCardId === c.id ? ', currently selected' : ''}`}
                  className={`flex-1 py-2.5 px-3 rounded-md text-xs font-semibold border transition-colors cursor-pointer shadow-2xs min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:ring-offset-2 focus-visible:outline-hidden ${
                    selectedCardId === c.id
                      ? 'bg-[#0B1F6A] text-white border-[#0B1F6A] shadow-xs'
                      : 'bg-[#F5F7FA] text-[#5F6670] border-[#D8DEE8] hover:bg-white hover:text-[#0B1F6A]'
                  }`}
                >
                  {c.cardType.toUpperCase()} (••{c.cardNumber.slice(-4)})
                </button>
              ))}
            </div>

            {/* Real Physical Bank Card Visual with 3D Flip & Details */}
            <div className="py-1">
              <RealBankCard
                card={selectedCard}
                isRevealed={isSensitiveRevealed}
                onToggleReveal={() => toggleRevealSensitive(selectedCard.id)}
                onToggleFreeze={() => toggleCardFreeze(selectedCard.id)}
                showControls={true}
              />
            </div>

            {/* Auto-masking Countdown Indicator */}
            {isSensitiveRevealed && (
              <div
                role="status"
                aria-live="polite"
                className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between font-medium"
              >
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Card details visible. Auto-masking in:</span>
                </div>
                <span className="font-mono font-bold text-amber-800">{revealTimer}s</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setPinChangeOpen(true)}
              aria-label="Change Card 4-digit PIN Code"
              className="w-full py-2.5 px-3 rounded-md bg-white hover:bg-slate-50 border border-[#D8DEE8] text-[#0B1F6A] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:ring-offset-2 focus-visible:outline-hidden"
            >
              <KeyRound className="w-4 h-4 text-[#0B1F6A]" />
              <span>Change Card PIN Code</span>
            </button>
          </div>
        </div>

        {/* Right Column (7 cols): Limits & Security Controls */}
        <div className="lg:col-span-7 space-y-5">
          {/* Spending Limits Sliders */}
          <div className="bg-white rounded-xl border border-[#D8DEE8] p-5 sm:p-6 shadow-xs space-y-4 text-xs">
            <h2 className="text-base font-bold text-[#0B1F6A] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0B1F6A]" />
              <span>Daily Spending &amp; Withdrawal Limits</span>
            </h2>

            {/* Daily Purchase Limit */}
            <div className="space-y-2.5 p-4 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8]">
              <div className="flex justify-between items-center">
                <div>
                  <label htmlFor="daily-spend-slider" className="font-bold text-[#0B1F6A] block text-xs cursor-pointer">
                    Daily Purchase Limit
                  </label>
                  <span className="text-xs text-[#5F6670] font-medium">POS, Contactless, and Online Transactions</span>
                </div>
                <span className="font-mono font-bold text-sm text-[#147A52]" aria-live="polite">
                  ${selectedCard.dailySpendingLimit.toLocaleString()} USD
                </span>
              </div>
              <input
                id="daily-spend-slider"
                type="range"
                min="5000"
                max="100000"
                step="5000"
                aria-label="Daily purchase limit"
                aria-valuemin={5000}
                aria-valuemax={100000}
                aria-valuenow={selectedCard.dailySpendingLimit}
                aria-valuetext={`$${selectedCard.dailySpendingLimit.toLocaleString()} USD`}
                value={selectedCard.dailySpendingLimit}
                onChange={(e) => handleLimitChange(parseFloat(e.target.value), selectedCard.dailyWithdrawalLimit)}
                className="w-full accent-[#0B1F6A] cursor-pointer h-2 bg-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
              />
              <div className="flex justify-between text-[10px] text-[#5F6670] font-mono font-semibold" aria-hidden="true">
                <span>$5,000</span>
                <span>$50,000</span>
                <span>$100,000</span>
              </div>
            </div>

            {/* Daily ATM Limit */}
            <div className="space-y-2.5 p-4 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8]">
              <div className="flex justify-between items-center">
                <div>
                  <label htmlFor="daily-atm-slider" className="font-bold text-[#0B1F6A] block text-xs cursor-pointer">
                    Daily ATM Cash Limit
                  </label>
                  <span className="text-xs text-[#5F6670] font-medium">Global ATM cash withdrawals</span>
                </div>
                <span className="font-mono font-bold text-sm text-[#147A52]" aria-live="polite">
                  ${selectedCard.dailyWithdrawalLimit.toLocaleString()} USD
                </span>
              </div>
              <input
                id="daily-atm-slider"
                type="range"
                min="1000"
                max="25000"
                step="1000"
                aria-label="Daily ATM cash limit"
                aria-valuemin={1000}
                aria-valuemax={25000}
                aria-valuenow={selectedCard.dailyWithdrawalLimit}
                aria-valuetext={`$${selectedCard.dailyWithdrawalLimit.toLocaleString()} USD`}
                value={selectedCard.dailyWithdrawalLimit}
                onChange={(e) => handleLimitChange(selectedCard.dailySpendingLimit, parseFloat(e.target.value))}
                className="w-full accent-[#0B1F6A] cursor-pointer h-2 bg-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
              />
              <div className="flex justify-between text-[10px] text-[#5F6670] font-mono font-semibold" aria-hidden="true">
                <span>$1,000</span>
                <span>$12,500</span>
                <span>$25,000</span>
              </div>
            </div>
          </div>

          {/* Real-time Security Toggles */}
          <div className="bg-white rounded-xl border border-[#D8DEE8] p-5 sm:p-6 shadow-xs space-y-4 text-xs">
            <h2 className="text-base font-bold text-[#0B1F6A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0B1F6A]" />
              <span>Channel Controls &amp; Merchant Routing Restrictions</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Online Transactions */}
              <div className="p-4 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8] flex items-center justify-between">
                <div>
                  <label htmlFor="switch-online" className="font-bold text-[#0B1F6A] block cursor-pointer">
                    Online eCommerce
                  </label>
                  <span className="text-[11px] text-[#5F6670] font-medium">Web, App &amp; CNP transactions</span>
                </div>
                <input
                  id="switch-online"
                  type="checkbox"
                  aria-label="Allow online eCommerce transactions"
                  checked={selectedCard.allowOnlineTransactions}
                  onChange={() => handleToggleSwitch('allowOnlineTransactions')}
                  className="w-5 h-5 accent-[#0B1F6A] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                />
              </div>

              {/* International Usage */}
              <div className="p-4 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8] flex items-center justify-between">
                <div>
                  <label htmlFor="switch-international" className="font-bold text-[#0B1F6A] block cursor-pointer">
                    Cross-Border / FX
                  </label>
                  <span className="text-[11px] text-[#5F6670] font-medium">Foreign currencies &amp; overseas</span>
                </div>
                <input
                  id="switch-international"
                  type="checkbox"
                  aria-label="Allow cross-border foreign transactions"
                  checked={selectedCard.allowInternational}
                  onChange={() => handleToggleSwitch('allowInternational')}
                  className="w-5 h-5 accent-[#0B1F6A] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                />
              </div>

              {/* ATM Withdrawals */}
              <div className="p-4 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8] flex items-center justify-between">
                <div>
                  <label htmlFor="switch-atm" className="font-bold text-[#0B1F6A] block cursor-pointer">
                    ATM Cash Withdrawals
                  </label>
                  <span className="text-[11px] text-[#5F6670] font-medium">Global Cirrus &amp; Plus networks</span>
                </div>
                <input
                  id="switch-atm"
                  type="checkbox"
                  aria-label="Allow ATM cash withdrawals"
                  checked={selectedCard.allowAtmWithdrawals}
                  onChange={() => handleToggleSwitch('allowAtmWithdrawals')}
                  className="w-5 h-5 accent-[#0B1F6A] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                />
              </div>

              {/* Contactless */}
              <div className="p-4 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8] flex items-center justify-between">
                <div>
                  <label htmlFor="switch-contactless" className="font-bold text-[#0B1F6A] block cursor-pointer">
                    NFC / Tap &amp; Pay
                  </label>
                  <span className="text-[11px] text-[#5F6670] font-medium">Contactless POS terminal readers</span>
                </div>
                <input
                  id="switch-contactless"
                  type="checkbox"
                  aria-label="Allow contactless NFC and tap to pay transactions"
                  checked={selectedCard.allowContactless}
                  onChange={() => handleToggleSwitch('allowContactless')}
                  className="w-5 h-5 accent-[#0B1F6A] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Merchant Category Security Locks */}
          <div className="bg-white rounded-xl border border-[#D8DEE8] p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-sm text-[#20242A] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0B1F6A]" />
              <span>Merchant Category Automated Blocking</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { key: 'gambling', label: 'Gambling & Casino Wagers', desc: 'Block all sportsbooks and casinos' },
                { key: 'crypto', label: 'Cryptocurrency Purchases', desc: 'Block fiat on-ramp crypto exchanges' },
                { key: 'atm', label: 'ATM Cash Advance Limit', desc: 'Restrict cash withdrawals from ATM network' },
                { key: 'international', label: 'Foreign Online Stores', desc: 'Block foreign currency web checkouts' }
              ].map(cat => (
                <div key={cat.key} className="p-3 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8] flex items-center justify-between">
                  <div>
                    <label htmlFor={`lock-${cat.key}`} className="font-bold text-[#20242A] block cursor-pointer">
                      {cat.label}
                    </label>
                    <span className="text-[10.5px] text-[#5F6670]">{cat.desc}</span>
                  </div>
                  <input
                    id={`lock-${cat.key}`}
                    type="checkbox"
                    aria-label={`Block ${cat.label}`}
                    checked={!!merchantCategoryLocks[cat.key]}
                    onChange={() => handleToggleMerchantLock(cat.key)}
                    className="w-5 h-5 accent-[#0B1F6A] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Travel Notices Enclave */}
          <div className="bg-white rounded-xl border border-[#D8DEE8] p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-sm text-[#20242A] flex items-center gap-2">
                  <Plane className="w-4 h-4 text-[#0B1F6A]" />
                  <span>Active Travel Notices ({travelNotices.length})</span>
                </h2>
                <p className="text-[11px] text-[#5F6670]">Exempts foreign transactions from automated anti-fraud holds</p>
              </div>
              <button
                type="button"
                onClick={() => setTravelModalOpen(true)}
                aria-label="Add Destination Travel Notice"
                className="px-3.5 py-2 rounded-lg bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:ring-offset-2 focus-visible:outline-hidden"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Destination</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {travelNotices.length === 0 ? (
                <p className="text-[#5F6670] italic">No active travel notices on file.</p>
              ) : (
                travelNotices.map(t => (
                  <div key={t.id} className="p-3 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#20242A] flex items-center gap-2">
                        <span>{t.destinationCountries.join(', ')}</span>
                        <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-emerald-100 text-emerald-800">
                          {t.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#5F6670] font-mono mt-0.5">
                        {t.departureDate} &rarr; {t.returnDate} &bull; Contact: {t.contactPhone}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        deleteTravelNotice(t.id);
                        setSrStatus(`Travel notice for ${t.destinationCountries.join(', ')} deleted.`);
                      }}
                      aria-label={`Remove Travel Notice for ${t.destinationCountries.join(', ')}`}
                      className="p-2.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-hidden"
                      title="Remove Notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VERIFICATION DIALOG: Card Detail Security Authorization
         ========================================================================= */}
      {verifyModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="card-verify-title"
          aria-describedby="card-verify-desc"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full border-2 border-[#D8DEE8] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE8]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0B1F6A] text-white flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h2 id="card-verify-title" className="font-bold text-sm text-[#0B1F6A]">
                  Verify Identity to Show Card Details
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseVerifyModal}
                aria-label="Close verification dialog"
                className="p-2 rounded-lg text-[#5F6670] hover:text-[#20242A] hover:bg-slate-100 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p id="card-verify-desc" className="text-xs text-[#5F6670] leading-relaxed">
              To reveal your full card number and security CVV, enter your 4-digit security PIN. Information will automatically re-mask after 60 seconds.
            </p>

            {verifyError && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyPasscode} className="space-y-4">
              <div>
                <label htmlFor="card-verify-passcode" className="font-bold text-[#20242A] block mb-1">
                  4-Digit Security Passcode <span className="text-rose-600" aria-hidden="true">*</span>
                </label>
                <input
                  ref={verifyInputRef}
                  id="card-verify-passcode"
                  type="password"
                  maxLength={4}
                  required
                  aria-required="true"
                  aria-invalid={!!verifyError}
                  value={verifyPasscode}
                  onChange={e => {
                    setVerifyPasscode(e.target.value.replace(/\D/g, ''));
                    if (verifyError) setVerifyError('');
                  }}
                  placeholder="••••"
                  className="w-full text-center text-2xl tracking-[0.5em] font-mono font-bold p-3 rounded-xl bg-[#F5F7FA] border border-[#D8DEE8] text-[#20242A] focus:bg-white focus:outline-none focus:border-[#0B1F6A] focus-visible:ring-2 focus-visible:ring-[#0B1F6A] transition-colors"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCloseVerifyModal}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#20242A] font-bold min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyPasscode.length < 4}
                  className="px-5 py-2.5 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold disabled:opacity-50 min-h-[44px] cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                >
                  Authorize &amp; Show Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Travel Notice Modal */}
      {travelModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="travel-modal-title"
          aria-describedby="travel-modal-desc"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in text-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full border-2 border-[#D8DEE8] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE8]">
              <h2 id="travel-modal-title" className="font-bold text-sm text-[#0B1F6A] flex items-center gap-2">
                <Plane className="w-4 h-4 text-[#0B1F6A]" />
                <span>Register Travel Itinerary</span>
              </h2>
              <button
                type="button"
                onClick={() => setTravelModalOpen(false)}
                aria-label="Close travel notice dialog"
                className="p-2 rounded-lg text-[#5F6670] hover:text-[#20242A] hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p id="travel-modal-desc" className="text-[11px] text-[#5F6670]">
              Register foreign travel to exempt overseas transactions from automated anti-fraud holds.
            </p>

            <form onSubmit={handleAddTravelNotice} className="space-y-3">
              <div>
                <label htmlFor="travel-countries-input" className="font-bold text-[#20242A] block mb-1">
                  Destination Countries (Comma Separated) <span className="text-rose-600" aria-hidden="true">*</span>
                </label>
                <input
                  id="travel-countries-input"
                  type="text"
                  value={travelCountry}
                  onChange={e => setTravelCountry(e.target.value)}
                  required
                  aria-required="true"
                  placeholder="e.g. Switzerland, France, Italy"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F5F7FA] border border-[#D8DEE8] font-medium text-[#20242A] focus:outline-none focus:border-[#0B1F6A] focus-visible:ring-2 focus-visible:ring-[#0B1F6A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="travel-dep-date" className="font-bold text-[#20242A] block mb-1">
                    Departure Date <span className="text-rose-600" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="travel-dep-date"
                    type="date"
                    value={travelDeparture}
                    onChange={e => setTravelDeparture(e.target.value)}
                    required
                    aria-required="true"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F5F7FA] border border-[#D8DEE8] font-medium text-[#20242A] focus:outline-none focus:border-[#0B1F6A] focus-visible:ring-2 focus-visible:ring-[#0B1F6A]"
                  />
                </div>
                <div>
                  <label htmlFor="travel-ret-date" className="font-bold text-[#20242A] block mb-1">
                    Return Date <span className="text-rose-600" aria-hidden="true">*</span>
                  </label>
                  <input
                    id="travel-ret-date"
                    type="date"
                    value={travelReturn}
                    onChange={e => setTravelReturn(e.target.value)}
                    required
                    aria-required="true"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F5F7FA] border border-[#D8DEE8] font-medium text-[#20242A] focus:outline-none focus:border-[#0B1F6A] focus-visible:ring-2 focus-visible:ring-[#0B1F6A]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="travel-contact-phone" className="font-bold text-[#20242A] block mb-1">
                  International Contact Phone <span className="text-rose-600" aria-hidden="true">*</span>
                </label>
                <input
                  id="travel-contact-phone"
                  type="tel"
                  value={travelPhone}
                  onChange={e => setTravelPhone(e.target.value)}
                  required
                  aria-required="true"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F5F7FA] border border-[#D8DEE8] font-mono text-[#20242A] focus:outline-none focus:border-[#0B1F6A] focus-visible:ring-2 focus-visible:ring-[#0B1F6A]"
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-300 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Your travel itinerary will automatically be sent to the global fraud monitoring team.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTravelModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                >
                  Confirm Travel Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Single-Use Virtual Card Modal */}
      {virtualCardModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="virtual-card-title"
          aria-describedby="virtual-card-desc"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in text-xs"
        >
          <div className="bg-white rounded-2xl max-w-md w-full border-2 border-[#D8DEE8] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE8]">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h2 id="virtual-card-title" className="font-bold text-sm text-[#0B1F6A]">
                  Single-Use Disposable Virtual Card
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setVirtualCardModalOpen(false)}
                aria-label="Close virtual card dialog"
                className="p-2 rounded-lg text-[#5F6670] hover:text-[#20242A] hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p id="virtual-card-desc" className="sr-only">
              Disposable virtual card number with dynamic rotating CVV code for secure one-time checkouts.
            </p>

            {/* Virtual Card Graphic */}
            <div className="bg-gradient-to-br from-[#0B1F6A] via-[#101F7A] to-[#040822] text-white p-6 rounded-2xl shadow-xl space-y-4 relative overflow-hidden border border-white/20">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-300 font-black">
                  VIRTUAL DISPOSABLE
                </span>
                <NorthernTrustLogo className="w-6 h-6 text-white" color="#ffffff" />
              </div>

              <div className="pt-2">
                <span
                  aria-label="Virtual card number: 4929 8812 9940 9104"
                  className="text-lg sm:text-xl font-mono tracking-widest font-black block"
                >
                  4929 •••• •••• 9104
                </span>
                <span className="text-[10px] font-mono text-slate-300">
                  Cardholder: {currentUser?.fullName || 'Alexander Vance'}
                </span>
              </div>

              <div className="flex justify-between items-end pt-1">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">EXPIRES</span>
                  <span className="font-mono font-bold text-xs" aria-label="Expiry date: 10/28">10/28</span>
                </div>

                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-amber-300 font-bold block">
                    DYNAMIC CVV (ROTATING)
                  </span>
                  <span
                    aria-label={`Current dynamic CVV code: ${virtualCardCVV}`}
                    className="font-mono font-black text-base text-amber-300"
                  >
                    {virtualCardCVV}
                  </span>
                </div>
              </div>
            </div>

            <div
              role="status"
              aria-live="polite"
              className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-950 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700" />
                <span className="font-medium text-[11px]">CVV Rotates in:</span>
              </div>
              <span className="font-mono font-black text-sm text-amber-800">
                {Math.floor(cvvTimer / 60)}:{(cvvTimer % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <div className="space-y-2 text-[11px] text-[#5F6670]">
              <p>
                This virtual card is cryptographically generated for one-time online transactions. It automatically closes after first authorization.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setVirtualCardModalOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-[#0B1F6A] text-white font-bold hover:bg-[#081552] transition-colors min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
              >
                Close Virtual Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change PIN Modal */}
      {pinChangeOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pin-modal-title"
          aria-describedby="pin-modal-desc"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-white rounded-xl max-w-sm w-full border border-[#D8DEE8] p-6 space-y-5 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE8]">
              <h2 id="pin-modal-title" className="font-bold text-sm text-[#0B1F6A] flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#0B1F6A]" />
                <span>Set 4-Digit Card PIN</span>
              </h2>
              <button
                type="button"
                onClick={() => setPinChangeOpen(false)}
                aria-label="Close Change PIN dialog"
                className="p-2 rounded-lg text-[#5F6670] hover:text-[#20242A] hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p id="pin-modal-desc" className="sr-only">
              Enter a new 4-digit PIN for ATM withdrawals and card terminal authentication.
            </p>

            {pinSuccess ? (
              <div
                role="status"
                aria-live="polite"
                className="p-4 rounded-lg bg-[#147A52]/10 text-[#147A52] border border-emerald-300 text-center font-bold flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#147A52]" />
                <span>PIN code updated successfully across network.</span>
              </div>
            ) : (
              <form onSubmit={handleSavePin} className="space-y-4">
                <div>
                  <label htmlFor="card-new-pin-input" className="block text-xs font-semibold text-[#5F6670] mb-1.5 uppercase">
                    Enter New 4-Digit PIN <span className="text-rose-600" aria-hidden="true">*</span>
                  </label>
                  <input
                    ref={pinInputRef}
                    id="card-new-pin-input"
                    type="password"
                    maxLength={4}
                    required
                    aria-required="true"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full text-center text-2xl tracking-[0.5em] font-mono font-bold p-3 rounded-md bg-[#F5F7FA] border border-[#D8DEE8] text-[#20242A] focus:bg-white focus:outline-none focus:border-[#0B1F6A] focus-visible:ring-2 focus-visible:ring-[#0B1F6A] transition-colors"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPinChangeOpen(false)}
                    className="px-4 py-2.5 rounded-md bg-white border border-[#D8DEE8] text-[#5F6670] font-semibold hover:bg-slate-50 transition-colors cursor-pointer min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={newPin.length !== 4}
                    className="px-4.5 py-2.5 rounded-md bg-[#0B1F6A] hover:bg-[#081552] text-white font-semibold disabled:opacity-50 shadow-xs cursor-pointer transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
                  >
                    Confirm PIN Change
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
