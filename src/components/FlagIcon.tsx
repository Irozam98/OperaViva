import React from 'react';
import { Language } from '../i18n/translations';

interface FlagIconProps {
  language: Language;
  size?: number;
  className?: string;
}

export const FlagIcon: React.FC<FlagIconProps> = ({ language, size = 22, className = '' }) => {
  const height = Math.round(size * 0.68);

  if (language === 'it') {
    return (
      <svg 
        width={size} 
        height={height} 
        viewBox="0 0 30 20" 
        className={`flag-svg flag-it ${className}`}
        style={{ 
          display: 'inline-block', 
          verticalAlign: 'middle', 
          borderRadius: '3px',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          flexShrink: 0
        }}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Bandiera Italiana"
      >
        <rect width="10" height="20" fill="#009246" />
        <rect x="10" width="10" height="20" fill="#ffffff" />
        <rect x="20" width="10" height="20" fill="#ce2b37" />
        <rect width="30" height="20" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
      </svg>
    );
  }

  // Bandiera Britannica (Union Jack) per lingua inglese
  return (
    <svg 
      width={size} 
      height={height} 
      viewBox="0 0 60 40" 
      className={`flag-svg flag-en ${className}`}
      style={{ 
        display: 'inline-block', 
        verticalAlign: 'middle', 
        borderRadius: '3px',
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.45)',
        overflow: 'hidden',
        flexShrink: 0
      }}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="British Flag"
    >
      <clipPath id="uk-flag-clip">
        <rect width="60" height="40" rx="3" />
      </clipPath>
      <g clipPath="url(#uk-flag-clip)">
        <rect width="60" height="40" fill="#012169" />
        {/* Diagonali bianche */}
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#ffffff" strokeWidth="8" />
        {/* Diagonali rosse */}
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="4" />
        {/* Croce centrale bianca */}
        <path d="M30,0 V40 M0,20 H60" stroke="#ffffff" strokeWidth="12" />
        {/* Croce centrale rossa */}
        <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="7" />
        <rect width="60" height="40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      </g>
    </svg>
  );
};
