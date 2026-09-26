import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface NorthernTrustSplashScreenProps {
  onComplete: () => void;
}

export const NorthernTrustSplashScreen: React.FC<NorthernTrustSplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState('Initializing Hardware Cryptographic Enclave...');
  const [isExiting, setIsExiting] = useState(false);

  // Store onComplete in ref to prevent stale closures
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // High-assurance realistic verification sequence steps
    const t1 = setTimeout(() => {
      setProgress(40);
      setStatusText('Establishing Mutual TLS 1.3 Handshake...');
    }, 400);

    const t2 = setTimeout(() => {
      setProgress(75);
      setStatusText('256-Bit Hardware HSM Tunnel Verified...');
    }, 850);

    const t3 = setTimeout(() => {
      setProgress(95);
      setStatusText('Loading Sovereign Asset Ledgers...');
    }, 1250);

    const t4 = setTimeout(() => {
      setProgress(100);
      setStatusText('Secure Session Synchronized');
    }, 1500);

    const t5 = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onCompleteRef.current();
      }, 350);
    }, 1750);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      onCompleteRef.current();
    }, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-[#083624] via-[#062F1E] to-[#041D12] text-white p-5 sm:p-8 select-none cursor-pointer transition-opacity duration-500 overflow-hidden ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle Financial Guilloche / Security Grid Background Pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="guilloche" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="28" fill="none" stroke="#10B981" strokeWidth="0.75" opacity="0.4" />
              <circle cx="30" cy="30" r="18" fill="none" stroke="#10B981" strokeWidth="0.5" opacity="0.3" />
              <path d="M0 30 Q15 0 30 30 T60 30" fill="none" stroke="#10B981" strokeWidth="0.5" opacity="0.3" />
              <path d="M30 0 Q60 15 30 30 T30 60" fill="none" stroke="#10B981" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#guilloche)" />
        </svg>
      </div>

      {/* Top Bar: Centered Institutional Security Badge */}
      <div className="w-full max-w-5xl flex items-center justify-center relative z-10 animate-fade-in pt-1 sm:pt-2">
        <div className="inline-flex items-center gap-2 sm:gap-2.5 px-3.5 py-1.5 rounded-lg bg-[#042014]/90 border border-[#147A52]/50 text-[10.5px] sm:text-xs font-mono text-emerald-100 shadow-sm whitespace-nowrap">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
          <span className="tracking-wider uppercase font-semibold text-emerald-200">TLS 1.3 • FIPS 140-3 LEVEL 4</span>
        </div>
      </div>

      {/* Center: Iconic Northern Trust Emblem Animation */}
      <div className="flex flex-col items-center justify-center my-auto text-center relative z-10 max-w-xl px-4 py-2">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-56 h-56 sm:w-80 sm:h-80 rounded-full bg-[#147A52]/35 blur-3xl nt-halo pointer-events-none"></div>

          {/* Northern Trust Anchor Emblem */}
          <div className="relative w-36 h-48 sm:w-48 sm:h-64 drop-shadow-[0_16px_32px_rgba(0,0,0,0.65)]">
            <svg
              viewBox="0 0 300 400"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Northern Trust Anchor Emblem"
              role="img"
            >
              <defs>
                <linearGradient id="ntGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#E6F4EA" />
                  <stop offset="100%" stopColor="#D8DEE8" />
                </linearGradient>
                <linearGradient id="ntSolidGreen" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#D1FAE5" />
                </linearGradient>
              </defs>

              {/* 1. Animated Stroke Outlines */}
              <g
                fill="none"
                stroke="url(#ntGreenGrad)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="nt-stroke-animated"
              >
                {/* Top Ring / Eyelet */}
                <circle cx="150" cy="52" r="34" />

                {/* Horizontal Stock Crossbar */}
                <line x1="42" y1="94" x2="258" y2="94" />

                {/* Central Shank Upper */}
                <line x1="150" y1="88" x2="150" y2="162" />

                {/* Central Shank Lower */}
                <line x1="150" y1="236" x2="150" y2="365" />

                {/* Letter N: Vertical Stem */}
                <path d="M62,122 L112,122 L112,135 L96,135 L96,258 L124,258 L124,271 L62,271 L62,258 L82,258 L82,135 L62,135 Z" />

                {/* Letter N: Diagonal Stroke */}
                <polygon points="96,135 119,135 224,271 198,271" />

                {/* Letter T: Crossbar & Leg */}
                <path d="M182,122 L244,122 L244,138 L236,138 L236,133 L220,133 L220,208 L206,208 L206,133 L190,133 L190,138 L182,138 Z" />

                {/* Curved Fluke Arms */}
                <path d="M10,205 C14,285 70,358 150,358 C230,358 286,285 290,205 L278,212 C274,280 220,346 150,346 C80,346 26,280 22,212 Z" />

                {/* Crown Chevron Point */}
                <polygon points="150,398 126,354 142,354 150,372 158,354 174,354" />
              </g>

              {/* 2. Solid Luminous Fill */}
              <g fill="url(#ntSolidGreen)" className="nt-fill-animated opacity-0">
                <circle
                  cx="150"
                  cy="52"
                  r="34"
                  fill="none"
                  stroke="url(#ntSolidGreen)"
                  strokeWidth="13"
                />
                <rect x="42" y="88" width="216" height="13" rx="1" />
                <rect x="143" y="88" width="14" height="74" />
                <rect x="143" y="238" width="14" height="124" />
                <path d="M62,122 L112,122 L112,136 L96,136 L96,258 L124,258 L124,272 L62,272 L62,258 L82,258 L82,136 L62,136 Z" />
                <polygon points="96,136 120,136 226,272 198,272" />
                <path d="M182,122 L244,122 L244,138 L236,138 L236,133 L220,133 L220,208 L206,208 L206,133 L190,133 L190,138 L182,138 Z" />
                <path d="M10,205 C14,286 70,358 150,358 C230,358 286,286 290,205 L278,212 C274,280 220,346 150,346 C80,346 26,280 22,212 Z" />
                <polygon points="150,398 126,354 142,354 150,372 158,354 174,354" />
              </g>
            </svg>
          </div>
        </div>

        {/* Typography: NORTHERN TRUST Brand Name */}
        <div className="mt-5 sm:mt-6 space-y-1.5 sm:space-y-2">
          <h1 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl text-white tracking-[0.25em] sm:tracking-[0.35em] uppercase drop-shadow-md nt-text-reveal">
            Northern Trust
          </h1>
          <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-emerald-100 tracking-[0.2em] sm:tracking-[0.28em] uppercase font-sans">
            Wealth Management &amp; Sovereign Custody
          </p>
          <div className="flex items-center justify-center flex-wrap gap-x-2 gap-y-0.5 text-[9.5px] sm:text-[11px] font-mono text-emerald-200/80 pt-1.5 tracking-[0.16em] sm:tracking-widest uppercase">
            <span>Chartered 1889</span>
            <span className="text-emerald-300/40">•</span>
            <span>Global Institutional Network</span>
          </div>
        </div>
      </div>

      {/* Bottom Area: Progress Bar & Cryptographic Status */}
      <div className="w-full max-w-sm sm:max-w-md relative z-10 space-y-2 pb-2 text-center">
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono text-emerald-100">
          <span className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{statusText}</span>
          </span>
          <span className="font-bold text-white shrink-0 ml-2">{progress}%</span>
        </div>

        {/* Sleek Progress Track */}
        <div className="h-1.5 w-full rounded-lg bg-[#042014] overflow-hidden p-0.5 border border-[#147A52]/40 shadow-inner">
          <div
            className="h-full rounded bg-gradient-to-r from-[#147A52] to-[#10B981] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
