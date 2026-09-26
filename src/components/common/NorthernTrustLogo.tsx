import React from 'react';

interface NorthernTrustLogoProps {
  className?: string;
  color?: string;
  title?: string;
}

export const NorthernTrustLogo: React.FC<NorthernTrustLogoProps> = ({
  className = 'w-6 h-6',
  color = 'currentColor',
  title = 'Northern Trust Official Emblem'
}) => {
  return (
    <svg
      viewBox="0 0 300 400"
      className={className}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-label={title}
      role="img"
    >
      <title>{title}</title>

      {/* Top Eyelet Ring */}
      <circle
        cx="150"
        cy="52"
        r="34"
        fill="none"
        stroke={color}
        strokeWidth="13"
      />

      {/* Horizontal Stock Crossbar */}
      <rect
        x="42"
        y="88"
        width="216"
        height="14"
        rx="1"
        fill={color}
      />

      {/* Central Vertical Shank - Upper Portion (below stock down to N diagonal clearance gap) */}
      <rect
        x="143"
        y="88"
        width="14"
        height="76"
        fill={color}
      />

      {/* Central Vertical Shank - Lower Portion (from below N diagonal down through bottom fluke) */}
      <rect
        x="143"
        y="238"
        width="14"
        height="124"
        fill={color}
      />

      {/* Letter 'N' - Left Vertical Pillar with Classic Serifs */}
      <path
        d="M62,122 L112,122 L112,136 L96,136 L96,258 L124,258 L124,272 L62,272 L62,258 L82,258 L82,136 L62,136 Z"
        fill={color}
      />

      {/* Letter 'N' - Diagonal Stroke Crossing Through Center */}
      <polygon
        points="96,136 120,136 226,272 198,272"
        fill={color}
      />

      {/* Letter 'T' - Seriffed Crossbar and Vertical Stem */}
      <path
        d="M182,122 L244,122 L244,138 L236,138 L236,133 L220,133 L220,208 L206,208 L206,133 L190,133 L190,138 L182,138 Z"
        fill={color}
      />

      {/* Bottom Flukes - Sweeping Anchor Curve with Pointed Bills */}
      <path
        d="M10,205 C14,286 70,358 150,358 C230,358 286,286 290,205 L278,212 C274,280 220,346 150,346 C80,346 26,280 22,212 Z"
        fill={color}
      />

      {/* Bottom Anchor Crown / Chevron Point */}
      <polygon
        points="150,398 126,354 142,354 150,372 158,354 174,354"
        fill={color}
      />
    </svg>
  );
};
