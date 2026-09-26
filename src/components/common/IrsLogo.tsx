import React from 'react';

interface IrsLogoProps {
  variant?: 'full' | 'mark' | 'seal' | 'horizontal' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Official IRS (Internal Revenue Service) & Department of the Treasury Logo Component
 * Renders authentic vector SVG marks of the official IRS eagle emblem and Treasury seal.
 */
export const IrsLogo: React.FC<IrsLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = ''
}) => {
  // Dimension sizing maps
  const sizeMap = {
    xs: { h: 'h-5', icon: 'w-5 h-5', text: 'text-[10px]', sub: 'text-[7px]' },
    sm: { h: 'h-8', icon: 'w-8 h-8', text: 'text-xs', sub: 'text-[8.5px]' },
    md: { h: 'h-10', icon: 'w-10 h-10', text: 'text-sm', sub: 'text-[9.5px]' },
    lg: { h: 'h-14', icon: 'w-14 h-14', text: 'text-base', sub: 'text-xs' },
    xl: { h: 'h-18', icon: 'w-18 h-18', text: 'text-lg', sub: 'text-sm' }
  };

  const currentSize = sizeMap[size];

  // 1. Official Department of the Treasury Circular Seal
  if (variant === 'seal') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <svg
          viewBox="0 0 100 100"
          className={`${currentSize.icon} shrink-0 text-[#002D62] select-none`}
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Ring */}
          <circle cx="50" cy="50" r="48" fill="#F8FAFC" stroke="#002D62" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="44" fill="none" stroke="#002D62" strokeWidth="1" strokeDasharray="1.5 1.5" />
          
          {/* Circular Text Path (Curved Simulation / Official Text Ring) */}
          <circle cx="50" cy="50" r="37" fill="#002D62" />
          <circle cx="50" cy="50" r="35" fill="#FFFFFF" stroke="#002D62" strokeWidth="1" />
          
          {/* Inner Shield */}
          <path
            d="M50 20 L66 26 C66 38 60 52 50 58 C40 52 34 38 34 26 Z"
            fill="#002D62"
            stroke="#002D62"
            strokeWidth="1.5"
          />
          <path
            d="M50 23 L63 28 C63 37 58 49 50 54 C42 49 37 37 37 28 Z"
            fill="#FFFFFF"
          />
          
          {/* Scales of Justice in Shield Top */}
          <line x1="50" y1="28" x2="50" y2="40" stroke="#002D62" strokeWidth="1.2" />
          <line x1="43" y1="30" x2="57" y2="30" stroke="#002D62" strokeWidth="1.2" />
          <path d="M41 34 L45 34 L43 30 Z" fill="#002D62" />
          <path d="M55 34 L59 34 L57 30 Z" fill="#002D62" />

          {/* Key of the Treasury at Bottom */}
          <path
            d="M45 42 H55 M50 42 V49 M47 46 H53 M48 49 H52"
            stroke="#002D62"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Stars */}
          <g fill="#002D62" fontSize="5" fontWeight="bold" textAnchor="middle">
            <text x="50" y="14" fontSize="5.5" letterSpacing="0.5">TREASURY</text>
            <text x="50" y="93" fontSize="4.8" letterSpacing="0.4">INTERNAL REVENUE</text>
          </g>
        </svg>
      </div>
    );
  }

  // 2. Official IRS Eagle Brand Icon / Mark
  const IrsEagleBox = (
    <div className={`${currentSize.icon} bg-[#002D62] rounded-md p-1 flex items-center justify-center shrink-0 shadow-sm border border-[#001D42]`}>
      <svg
        viewBox="0 0 48 48"
        className="w-full h-full text-white"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Authentic Geometric IRS Eagle Silhouette */}
        {/* Head and Beak */}
        <path d="M24 6 C21 6 18 8 16 11 L20 15 C21.5 13.5 23 13 25 13.5 L27 11 C26 7.5 25 6 24 6 Z" fill="#FFFFFF" />
        <path d="M27 11 L31 12.5 L27 14 Z" fill="#E2E8F0" />
        
        {/* Stylized Wings Spread */}
        <path d="M8 17 L22 17 L19 23 L6 21 Z" fill="#FFFFFF" />
        <path d="M40 17 L26 17 L29 23 L42 21 Z" fill="#FFFFFF" />
        
        {/* Secondary Feather Layers */}
        <path d="M10 24 L21 24 L18 29 L8 27 Z" fill="#E2E8F0" opacity="0.9" />
        <path d="M38 24 L27 24 L30 29 L40 27 Z" fill="#E2E8F0" opacity="0.9" />
        
        {/* Body & Shield Chest */}
        <path d="M21 17 H27 L25 36 H23 Z" fill="#FFFFFF" />
        <path d="M22 36 L24 42 L26 36 Z" fill="#CBD5E1" />
        
        {/* Lower Tail Feathers */}
        <path d="M15 31 L21 31 L18 39 L13 36 Z" fill="#FFFFFF" opacity="0.8" />
        <path d="M33 31 L27 31 L30 39 L35 36 Z" fill="#FFFFFF" opacity="0.8" />
      </svg>
    </div>
  );

  // 3. Mark Only
  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {IrsEagleBox}
      </div>
    );
  }

  // 4. Compact Badge Variant
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-2.5 py-1 bg-[#002D62]/5 border border-[#002D62]/20 rounded-md ${className}`}>
        {IrsEagleBox}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-black font-sans tracking-tight text-[#002D62] text-xs leading-none">IRS</span>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1 py-0.2 rounded font-mono uppercase">
              Official e-File
            </span>
          </div>
          <span className="text-[9px] font-medium text-slate-600 leading-tight mt-0.5">
            Internal Revenue Service
          </span>
        </div>
      </div>
    );
  }

  // 5. Full Horizontal Official Header (Standard)
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {IrsEagleBox}
      <div className="flex flex-col text-left">
        <div className="flex items-baseline gap-2">
          <span className={`font-black font-sans tracking-tighter text-[#002D62] ${currentSize.text} leading-none`}>
            IRS
          </span>
          <span className={`font-bold font-sans tracking-tight text-[#002D62] ${currentSize.sub} leading-none`}>
            Department of the Treasury
          </span>
        </div>
        <span className={`font-semibold font-sans text-slate-600 ${currentSize.sub} tracking-normal leading-tight mt-0.5`}>
          Internal Revenue Service
        </span>
      </div>
    </div>
  );
};

export default IrsLogo;
