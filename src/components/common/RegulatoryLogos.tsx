import React from 'react';

interface RegulatoryLogosProps {
  variant?: 'green-footer' | 'navy-footer' | 'white-card' | 'compact';
  showDetails?: boolean;
}

export const RegulatoryLogos: React.FC<RegulatoryLogosProps> = ({
  variant = 'navy-footer',
  showDetails = true,
}) => {
  const isFooter = variant === 'green-footer' || variant === 'navy-footer';

  // Badge card wrapper styling
  const badgeCardClass = variant === 'navy-footer'
    ? 'bg-white/10 hover:bg-white/15 border border-white/20 hover:border-[#D8DEE8] text-white shadow-2xs'
    : variant === 'green-footer'
    ? 'bg-white/10 hover:bg-white/15 border border-white/20 text-white shadow-2xs'
    : 'bg-white hover:bg-[#F5F7FA] border border-[#D8DEE8] hover:border-[#0B1F6A] text-[#0B1F6A] shadow-2xs';

  // Micro-tag pill styling
  const tagPillClass = isFooter
    ? 'bg-[#147A52] text-white border border-[#147A52]/40'
    : 'bg-[#147A52]/10 text-[#147A52] border border-[#147A52]/20';

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
      {/* 1. FDIC (Federal Deposit Insurance Corporation) */}
      <div
        className={`group relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer ${badgeCardClass}`}
        title="Federal Deposit Insurance Corporation - Deposits backed by the full faith and credit of the U.S. Government up to $250,000"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2V7h2v10z" opacity="0.95" />
        </svg>
        <span className="font-serif font-black tracking-wider text-xs leading-none">
          FDIC
        </span>
        {showDetails && (
          <span className={`text-[8.5px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded leading-none ${tagPillClass}`}>
            INSURED
          </span>
        )}
      </div>

      {/* 2. Federal Reserve System */}
      <div
        className={`group relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer ${badgeCardClass}`}
        title="Member of the Federal Reserve System (12 CFR Part 204)"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="0.9" strokeDasharray="1.5 1.5" />
          <path d="M12 7l1.2 2.6 2.8.4-2 2 .5 2.8-2.5-1.4-2.5 1.4.5-2.8-2-2 2.8-.4z" />
        </svg>
        <span className="font-mono font-bold tracking-tight text-[11px] leading-none">
          FED RESERVE
        </span>
        {showDetails && (
          <span className={`text-[8.5px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded leading-none ${tagPillClass}`}>
            MEMBER
          </span>
        )}
      </div>

      {/* 3. Equal Housing Lender */}
      <div
        className={`group relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer ${badgeCardClass}`}
        title="Equal Housing Lender - Doing business in accordance with Federal Fair Lending Laws"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3L2 12h3v8h14v-8h3L12 3zm-3 10h6v1.5H9V13zm0 3h6v1.5H9V16z" />
        </svg>
        <span className="font-sans font-bold text-[10.5px] leading-none tracking-tight">
          EQUAL HOUSING
        </span>
        {showDetails && (
          <span className={`text-[8.5px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded leading-none ${tagPillClass}`}>
            LENDER
          </span>
        )}
      </div>

      {/* 4. SIPC (Securities Investor Protection Corporation) */}
      <div
        className={`group relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer ${badgeCardClass}`}
        title="Securities Investor Protection Corporation - Custodial securities protected up to $500,000"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <circle cx="8" cy="15" r="1.25" fill="currentColor" stroke="none" />
          <circle cx="12" cy="15" r="1.25" fill="currentColor" stroke="none" />
          <circle cx="16" cy="15" r="1.25" fill="currentColor" stroke="none" />
        </svg>
        <span className="font-mono font-bold tracking-wider text-[11px] leading-none">
          SIPC
        </span>
        {showDetails && (
          <span className={`text-[8.5px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded leading-none ${tagPillClass}`}>
            PROTECTED
          </span>
        )}
      </div>

      {/* 5. FINMA (Swiss Financial Market Supervisory Authority) */}
      <div
        className={`group relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer ${badgeCardClass}`}
        title="Swiss Financial Market Supervisory Authority FINMA - Swiss Custody & Vault Supervision"
      >
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 12h-2v-2H9v-2h2V8h2v2h2v2h-2v2z" />
        </svg>
        <span className="font-mono font-bold tracking-tight text-[11px] leading-none">
          FINMA
        </span>
        {showDetails && (
          <span className={`text-[8.5px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded leading-none ${tagPillClass}`}>
            REGULATED
          </span>
        )}
      </div>

      {/* 6. IntraFi Network Sweep ($25M) */}
      <div
        className={`group relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer ${badgeCardClass}`}
        title="IntraFi Network Deposits - Multi-million FDIC pass-through deposit insurance up to $25,000,000"
      >
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <span className="font-mono font-bold tracking-tight text-[11px] leading-none">
          IntraFi $25M
        </span>
        {showDetails && (
          <span className={`text-[8.5px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded leading-none ${tagPillClass}`}>
            SWEEP
          </span>
        )}
      </div>
    </div>
  );
};
