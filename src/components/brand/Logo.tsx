'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  isLink?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', isLink = true }) => {
  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Editorial directional mark: a minimal calibrated quadrant symbol */}
      <div className="relative w-7 h-7 rounded-lg bg-sage-700 flex items-center justify-center text-ivory-50 shadow-sm transition-transform duration-300 group-hover:scale-105">
        <svg
          className="w-4 h-4 text-ivory-50 transition-transform duration-300 group-hover:rotate-12"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle directional orientation compass */}
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" strokeDasharray="1.5 1.5" />
          <path
            d="M5.5 10.5L10.5 5.5M10.5 5.5H7M10.5 5.5V9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* Subtle terracotta accent dot */}
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-terracotta-500 ring-2 ring-[#FAF8F5]" />
      </div>

      <div className="flex items-baseline tracking-tight">
        <span className="font-serif text-lg font-semibold text-charcoal-500 tracking-tight group-hover:text-sage-800 transition-colors">
          Rumo
        </span>
        <span className="ml-1 text-xs font-semibold uppercase tracking-widest text-sage-700">
          Works
        </span>
      </div>
    </div>
  );

  if (isLink) {
    return (
      <Link
        href="/"
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 rounded-md"
        aria-label="Rumo Works - Início"
      >
        {content}
      </Link>
    );
  }

  return content;
};
