'use client';

import React from 'react';
import { siteConfig } from '@/config/site';
import { ArrowUpRight } from 'lucide-react';

interface LinkedInLinkProps {
  className?: string;
  variant?: 'badge' | 'button' | 'icon';
  showLabel?: boolean;
}

export const LinkedInLink: React.FC<LinkedInLinkProps> = ({
  className = '',
  variant = 'button',
  showLabel = true,
}) => {
  const url = siteConfig.mentor.linkedInUrl;

  // Official LinkedIn SVG Icon (Pixel-perfect, authentic #0A66C2 blue)
  const LinkedInIcon = ({ size = 20 }: { size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-2xs"
      aria-hidden="true"
    >
      <rect width="24" height="24" rx="4.5" fill="#0A66C2" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.94 5a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88zM5.5 9h2.88v9.5H5.5V9zm4.6 0h2.76v1.3h.04c.38-.73 1.33-1.5 2.73-1.5 2.92 0 3.46 1.92 3.46 4.42V18.5h-2.88v-4.33c0-1.03-.02-2.36-1.44-2.36-1.44 0-1.66 1.12-1.66 2.28V18.5h-2.88V9z"
        fill="#FFFFFF"
      />
    </svg>
  );

  if (variant === 'badge') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Ver perfil profissional de Amanda Sandoval no LinkedIn"
        title="Perfil de Amanda Sandoval no LinkedIn"
        className={`inline-flex items-center justify-center p-1.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-full shadow-md hover:shadow-lg transition-all transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66C2] ${className}`}
      >
        <LinkedInIcon size={24} />
      </a>
    );
  }

  if (variant === 'icon') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Ver perfil profissional de Amanda Sandoval no LinkedIn"
        title="Perfil de Amanda Sandoval no LinkedIn"
        className={`inline-flex items-center justify-center transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66C2] rounded-md ${className}`}
      >
        <LinkedInIcon size={22} />
      </a>
    );
  }

  // Default 'button' variant: highly legible, official blue accents, crisp presentation
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Ver perfil profissional de Amanda Sandoval no LinkedIn"
      title="Ver perfil de Amanda Sandoval no LinkedIn"
      className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F3F7FA] border border-[#0A66C2]/30 hover:border-[#0A66C2] text-[#0A66C2] font-medium text-xs sm:text-sm shadow-xs hover:shadow-sm transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66C2] ${className}`}
    >
      <LinkedInIcon size={20} />
      {showLabel && (
        <span className="font-semibold text-slate-800 group-hover:text-[#0A66C2] transition-colors">
          Ver perfil no LinkedIn
        </span>
      )}
      <ArrowUpRight className="w-3.5 h-3.5 text-[#0A66C2] opacity-70 group-hover:opacity-100 transition-opacity ml-0.5" />
    </a>
  );
};
