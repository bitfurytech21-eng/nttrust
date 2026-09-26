import React, { useState } from 'react';
import { BankCard } from '../../types/banking';
import { Lock, Eye, EyeOff, RotateCw, ShieldCheck } from 'lucide-react';

interface RealBankCardProps {
  card: BankCard;
  isRevealed?: boolean;
  onToggleReveal?: () => void;
  onToggleFreeze?: () => void;
  showControls?: boolean;
  className?: string;
  size?: 'normal' | 'compact';
}

export const RealBankCard: React.FC<RealBankCardProps> = ({
  card,
  isRevealed = false,
  onToggleReveal,
  onToggleFreeze,
  showControls = true,
  className = '',
  size = 'normal'
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [localRevealed, setLocalRevealed] = useState(isRevealed);
  const [srAnnouncement, setSrAnnouncement] = useState('');

  const revealed = onToggleReveal !== undefined ? isRevealed : localRevealed;

  const handleToggleReveal = () => {
    if (onToggleReveal) {
      onToggleReveal();
    } else {
      setLocalRevealed(prev => !prev);
    }
    setSrAnnouncement(!revealed ? 'Card details are now visible.' : 'Card details are now masked.');
  };

  const handleFlipCard = () => {
    setIsFlipped(prev => {
      const next = !prev;
      setSrAnnouncement(next ? 'Card flipped to back showing security signature and CVV.' : 'Card flipped to front showing cardholder name and card number.');
      return next;
    });
  };

  // Determine card network based on number
  const isVisa = card.cardNumber.startsWith('4');
  const isMastercard = card.cardNumber.startsWith('5');

  // Surface texture / material gradient based on card tier
  const getCardTheme = () => {
    if (card.tier === 'gold_reserve') {
      return {
        bg: 'bg-[#0B1F6A]',
        edge: 'border-[#dfc06b]/40 ring-amber-900/30',
        metalSheen: 'linear-gradient(115deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 38%, rgba(255,255,255,0.1) 55%, rgba(0,0,0,0.25) 100%)',
        textColor: 'text-amber-50',
        mutedText: 'text-amber-100/75',
        embossShadow: 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.85)]',
        chipTone: 'silver'
      };
    }

    if (card.tier === 'platinum_elite') {
      return {
        bg: 'bg-[#101F7A]',
        edge: 'border-[#748ba7]/40 ring-slate-900/40',
        metalSheen: 'linear-gradient(125deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.02) 40%, rgba(255,255,255,0.12) 60%, rgba(0,0,0,0.3) 100%)',
        textColor: 'text-slate-100',
        mutedText: 'text-slate-300/80',
        embossShadow: 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]',
        chipTone: 'gold'
      };
    }

    // Default: 'black_metal' / Institutional Deep Navy
    return {
      bg: 'bg-[#081552]',
      edge: 'border-[#D8DEE8]/30 ring-black/40',
      metalSheen: 'linear-gradient(130deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.01) 35%, rgba(255,255,255,0.08) 65%, rgba(0,0,0,0.4) 100%)',
      textColor: 'text-white',
      mutedText: 'text-[#D8DEE8]',
      embossShadow: 'drop-shadow-[0_1px_1px_rgba(0,0,0,0.95)]',
      chipTone: 'gold'
    };
  };

  const theme = getCardTheme();

  // Format card number display
  const rawNumber = card.cardNumber.replace(/\s+/g, '');
  const formattedRevealed = rawNumber.replace(/(\d{4})/g, '$1 ').trim();
  const formattedMasked = `••••  ••••  ••••  ${rawNumber.slice(-4)}`;

  const cardDetailsId = `card-details-${card.id}`;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Screen Reader Live Announcement */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {srAnnouncement}
      </div>

      {/* 3D Perspective Card Container */}
      <div
        className="w-full relative select-none"
        style={{ perspective: '1200px' }}
      >
        <div
          role="button"
          tabIndex={0}
          aria-label={
            isFlipped
              ? `Northern Trust ${card.cardType} Card Back. Showing magnetic stripe and CVV security code. Press Enter or Space to flip to front.`
              : `Northern Trust ${card.cardType} Card Front. Card ending in ${rawNumber.slice(-4)}. Press Enter or Space to flip to back.`
          }
          onClick={handleFlipCard}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleFlipCard();
            }
          }}
          className={`relative w-full aspect-[1.586/1] rounded-2xl cursor-pointer transition-transform duration-700 shadow-2xl group focus-visible:ring-3 focus-visible:ring-[#0B1F6A] focus-visible:ring-offset-2 focus-visible:outline-hidden ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
          style={{ transformStyle: 'preserve-3d' }}
          title={isFlipped ? 'Click or press Space to flip to front' : 'Click or press Space to flip to back'}
        >
          {/* ============================================================ */}
          {/* FRONT OF THE CARD                                             */}
          {/* ============================================================ */}
          <div
            className={`absolute inset-0 rounded-2xl overflow-hidden border ${theme.edge} shadow-xl flex flex-col justify-between p-4 sm:p-5 md:p-6 text-white [backface-visibility:hidden] ${theme.bg}`}
            style={{
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.12) inset'
            }}
          >
            {/* Metallic Brushed Sheen Layer */}
            <div
              className="absolute inset-0 pointer-events-none opacity-80 mix-blend-overlay"
              style={{ background: theme.metalSheen }}
            />

            {/* Fine Hairline Texture Pattern */}
            <div
              className="absolute inset-0 pointer-events-none opacity-15"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 3px)'
              }}
            />

            {/* Subtle Edge Core Bevel Highlight */}
            <div className="absolute inset-[1px] rounded-[15px] border border-white/20 pointer-events-none" />

            {/* HEADER ROW: Bank Wordmark + Card Tier & Program */}
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-2">
                {/* Official Bank Crest Icon */}
                <div className="w-8 h-8 rounded-lg bg-[#101F7A] border border-white/25 flex items-center justify-center p-1.5 shadow-inner backdrop-blur-xs">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <div>
                  <span className="font-serif font-black tracking-wider text-xs sm:text-sm text-white block uppercase">
                    Northern Trust
                  </span>
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] font-semibold text-white/70 block">
                    Private Wealth
                  </span>
                </div>
              </div>

              {/* Card Tier / Classification */}
              <div className="text-right">
                <span className="inline-block text-[9px] sm:text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-black/30 border border-white/20 font-bold backdrop-blur-xs text-white/90">
                  {card.cardType.toUpperCase()}
                </span>
                <span className="block text-[8px] uppercase tracking-[0.18em] font-medium text-white/60 mt-0.5">
                  {card.tier === 'black_metal' ? 'Titanium Metal' : card.tier === 'gold_reserve' ? 'Aurum Reserve' : 'World Elite'}
                </span>
              </div>
            </div>

            {/* MIDDLE ROW: Authentic EMV Chip & Contactless Waves */}
            <div className="relative z-10 flex items-center justify-between mt-1 sm:mt-2">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Realistic EMV Smart Chip (ISO/IEC 7816 Microchip Layout) */}
                <div
                  className="w-10 h-8 sm:w-12 sm:h-9 rounded-md relative overflow-hidden border border-amber-400/70 shadow-sm"
                  style={{
                    background: theme.chipTone === 'silver'
                      ? 'linear-gradient(135deg, #f0f3f6 0%, #D8DEE8 50%, #5F6670 100%)'
                      : 'linear-gradient(135deg, #ffe082 0%, #ffd54f 35%, #ffb300 70%, #d48b00 100%)'
                  }}
                  title="EMV Contact Smart Chip"
                >
                  {/* Etched microchip contact pads */}
                  <svg viewBox="0 0 48 36" className="w-full h-full p-0.5 opacity-80" stroke="#785002" strokeWidth="1.2" fill="none">
                    <rect x="2" y="2" width="44" height="32" rx="3" stroke="#785002" strokeWidth="1" />
                    {/* Horizontal dividing channels */}
                    <line x1="2" y1="12" x2="46" y2="12" />
                    <line x1="2" y1="24" x2="46" y2="24" />
                    {/* Vertical dividing channels */}
                    <line x1="16" y1="2" x2="16" y2="34" />
                    <line x1="32" y1="2" x2="32" y2="34" />
                    {/* Center rounded contact zone */}
                    <circle cx="24" cy="18" r="4.5" fill="#B87500" fillOpacity="0.25" stroke="#785002" strokeWidth="1.2" />
                  </svg>
                </div>

                {/* Official Contactless / RFID 4-Wave Symbol */}
                <div className="flex items-center text-white/80" title="Contactless Payment Enabled">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 -rotate-90 stroke-[2.2]" fill="none" stroke="currentColor">
                    <path d="M5 12.55a11 11 0 0 1 14.08 0" strokeLinecap="round" />
                    <path d="M8.5 15.65a6.5 6.5 0 0 1 7 0" strokeLinecap="round" />
                    <path d="M12 18.5a2 2 0 0 1 0 0" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Holographic Security Micro-Seal */}
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/30 flex items-center justify-center relative overflow-hidden shadow-inner opacity-90"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(216,222,232,0.4) 50%, rgba(16,31,122,0.3) 100%)'
                }}
              >
                <ShieldCheck className="w-4 h-4 text-white drop-shadow" />
              </div>
            </div>

            {/* CARD NUMBER ROW (Embossed foil look with authentic spacing) */}
            <div className="relative z-10 pt-1 sm:pt-2">
              <div
                id={cardDetailsId}
                aria-label={revealed ? `Card number: ${formattedRevealed}` : `Card number ending in ${rawNumber.slice(-4)}`}
                className={`font-mono text-base sm:text-lg md:text-xl font-bold tracking-[0.22em] sm:tracking-[0.26em] text-white ${theme.embossShadow} transition-all`}
                style={{
                  textShadow: '0 1px 2px rgba(0,0,0,0.9), 0 -1px 0 rgba(255,255,255,0.35)',
                  fontFamily: '"SF Mono", "Courier New", Courier, monospace'
                }}
              >
                {revealed ? formattedRevealed : formattedMasked}
              </div>
            </div>

            {/* FOOTER ROW: Cardholder Name, Expiry & Network Brand */}
            <div className="relative z-10 flex items-end justify-between pt-1">
              {/* Cardholder Name */}
              <div className="space-y-0.5">
                <span className="block text-[7.5px] sm:text-[8.5px] uppercase font-semibold tracking-widest text-white/60">
                  Cardholder
                </span>
                <span
                  className="font-mono text-xs sm:text-sm font-bold tracking-wider text-white uppercase block leading-none"
                  style={{ textShadow: '0 1px 1px rgba(0,0,0,0.8)' }}
                >
                  {card.cardholderName}
                </span>
              </div>

              {/* Expiration Date with Authentic Stacked "GOOD THRU" */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="text-[6.5px] sm:text-[7.5px] leading-tight text-right uppercase font-semibold text-white/60 tracking-wider">
                  <div>GOOD</div>
                  <div>THRU</div>
                </div>
                <div
                  className="font-mono text-xs sm:text-sm font-bold tracking-widest text-white"
                  style={{ textShadow: '0 1px 1px rgba(0,0,0,0.8)' }}
                >
                  {card.expiryMonth}/{card.expiryYear}
                </div>
              </div>

              {/* Authentic Card Payment Network Insignia */}
              <div className="pl-2">
                {isMastercard ? (
                  // Mastercard Intersecting Circles
                  <div className="flex items-center relative" title="Mastercard World Elite">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EB001B] shadow-sm" />
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#F79E1B] -ml-3 sm:-ml-3.5 shadow-sm opacity-95 mix-blend-multiply" />
                  </div>
                ) : (
                  // Visa Wordmark
                  <div className="flex flex-col items-end" title="Visa Infinite">
                    <span className="font-sans font-black italic text-lg sm:text-xl tracking-tighter text-white leading-none drop-shadow">
                      VISA
                    </span>
                    <span className="text-[6.5px] sm:text-[7.5px] font-mono tracking-widest uppercase text-white/80 font-bold -mt-0.5">
                      INFINITE
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Frozen Card Overlay State */}
            {card.isFrozen && (
              <div className="absolute inset-0 z-30 rounded-2xl bg-slate-950/75 backdrop-blur-[3px] flex flex-col items-center justify-center gap-2 text-white border-2 border-rose-500/50">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-400 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-rose-300 stroke-[2.5]" />
                </div>
                <div className="text-center px-4">
                  <span className="text-xs font-black uppercase tracking-widest text-rose-200 block">
                    Card Temporarily Locked
                  </span>
                  <span className="text-[10px] text-white/70 block mt-0.5">
                    Transactions are currently disabled
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* BACK OF THE CARD                                             */}
          {/* ============================================================ */}
          <div
            className={`absolute inset-0 rounded-2xl overflow-hidden border ${theme.edge} shadow-xl flex flex-col justify-between py-4 text-white [backface-visibility:hidden] [transform:rotateY(180deg)] ${theme.bg}`}
            style={{
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.12) inset'
            }}
          >
            {/* Magnetic Stripe (Full bleed across the top) */}
            <div className="w-full">
              <div
                className="w-full h-10 sm:h-12 bg-[#0a0c0f] relative shadow-inner flex items-center justify-end pr-4"
                style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, #0f1217 0px, #0f1217 2px, #07090b 2px, #07090b 4px)'
                }}
              >
                <span className="text-[7.5px] font-mono tracking-widest text-white/30 uppercase">
                  HIGH COERCIVITY MAGNETIC STRIPE
                </span>
              </div>
            </div>

            {/* Middle Section: Signature Strip & CVV */}
            <div className="px-5 sm:px-6 space-y-2">
              <div className="flex items-center gap-3">
                {/* White / Security Pattern Signature Strip */}
                <div
                  className="flex-1 h-9 sm:h-10 bg-slate-100 rounded flex items-center justify-between px-3 text-[#20242A] relative overflow-hidden shadow-inner border border-slate-300"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(135deg, rgba(203,213,225,0.4) 0px, rgba(203,213,225,0.4) 2px, transparent 2px, transparent 6px)'
                  }}
                >
                  <span className="text-[7.5px] uppercase font-bold text-slate-400 select-none tracking-wider">
                    AUTHORIZED SIGNATURE • NOT VALID UNLESS SIGNED
                  </span>

                  {/* CVV 3-Digit Code stamped on strip */}
                  <div
                    id={`${cardDetailsId}-cvv`}
                    aria-label={revealed ? `Card CVV: ${card.cvv}` : 'Card CVV security code masked'}
                    className="bg-white px-2 py-0.5 rounded border border-slate-300 shadow-2xs font-mono font-black italic text-xs sm:text-sm text-slate-900 tracking-wider"
                  >
                    {revealed ? card.cvv : '•••'}
                  </div>
                </div>

                {/* Holographic Dove / Seal sticker */}
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-md border border-white/40 flex items-center justify-center shadow-md relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #F5F7FA 0%, #D8DEE8 50%, #5F6670 100%)'
                  }}
                >
                  <ShieldCheck className="w-5 h-5 text-slate-800/80" />
                </div>
              </div>

              {/* Customer Service & Legal Text */}
              <div className="text-[7.5px] sm:text-[8px] text-white/60 leading-tight space-y-1 font-sans">
                <p>
                  This card is issued by Northern Trust, N.A., pursuant to license. Use of this card is subject to the Deposit Account and Cardholder Agreement.
                </p>
                <div className="flex justify-between items-center text-white/80 font-mono text-[8px] pt-0.5">
                  <span>24/7 Concierge: +1 (800) 468-2352</span>
                  <span>northerntrust.com</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Interbank ATM Networks */}
            <div className="px-5 sm:px-6 flex items-center justify-between pt-1 border-t border-white/10">
              <div className="flex items-center gap-3">
                <span className="text-[8px] font-mono font-black px-1.5 py-0.5 rounded bg-white/15 text-white">
                  CIRRUS
                </span>
                <span className="text-[8px] font-mono font-black px-1.5 py-0.5 rounded bg-white/15 text-white">
                  PLUS
                </span>
                <span className="text-[8px] font-mono font-black px-1.5 py-0.5 rounded bg-white/15 text-white">
                  STAR
                </span>
                <span className="text-[8px] font-mono font-black px-1.5 py-0.5 rounded bg-white/15 text-white">
                  PULSE
                </span>
              </div>
              <span className="text-[8px] font-mono text-white/40">
                FDIC INSURED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Helper Controls below the card */}
      {showControls && (
        <div className="w-full flex items-center justify-between gap-2 mt-3 pt-1">
          {/* Flip Card Button */}
          <button
            type="button"
            onClick={handleFlipCard}
            aria-label={isFlipped ? 'Flip card to show front details' : 'Flip card to show back details and CVV'}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold bg-[#F5F7FA] hover:bg-slate-100 border border-[#D8DEE8] text-[#20242A] transition-colors cursor-pointer shadow-2xs min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            <RotateCw className="w-3.5 h-3.5 text-[#0B1F6A]" />
            <span>{isFlipped ? 'Show Front' : 'Flip to Back (CVV)'}</span>
          </button>

          {/* Reveal / Hide Numbers Button */}
          <button
            type="button"
            onClick={handleToggleReveal}
            aria-label={revealed ? 'Hide card details' : 'Show card details'}
            aria-expanded={revealed}
            aria-controls={cardDetailsId}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold bg-[#F5F7FA] hover:bg-slate-100 border border-[#D8DEE8] text-[#20242A] transition-colors cursor-pointer shadow-2xs min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:ring-offset-2 focus-visible:outline-hidden"
          >
            {revealed ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-[#5F6670]" />
                <span>Hide card details</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-[#0B1F6A]" />
                <span>Show card details</span>
              </>
            )}
          </button>

          {/* Freeze / Unlock Button if handler provided */}
          {onToggleFreeze && (
            <button
              type="button"
              onClick={onToggleFreeze}
              aria-label={card.isFrozen ? 'Unlock card transactions' : 'Freeze card transactions'}
              aria-pressed={card.isFrozen}
              className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer shadow-2xs min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:ring-offset-2 focus-visible:outline-hidden ${
                card.isFrozen
                  ? 'bg-rose-50 text-[#B42318] border-rose-300 hover:bg-rose-100'
                  : 'bg-[#147A52]/10 text-[#147A52] border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <Lock className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>{card.isFrozen ? 'Unlock' : 'Freeze'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
