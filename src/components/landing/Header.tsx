'use client';

import React, { useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import { siteConfig } from '@/config/site';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onOpenInterest: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenInterest }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF8F5]/90 backdrop-blur-md border-b border-borderWarm transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Typographic Wordmark */}
        <Logo />

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-8 text-sm font-medium text-charcoal-200"
          aria-label="Navegação principal"
        >
          {siteConfig.navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-sage-800 transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-sage-700 hover:after:w-full after:transition-all after:duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 rounded-sm"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Primary CTA */}
          <button
            type="button"
            onClick={onOpenInterest}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider bg-sage-700 hover:bg-sage-800 text-ivory-50 shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 active:scale-[0.98]"
          >
            {siteConfig.hero.primaryCta}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-charcoal-300 hover:text-charcoal-500 hover:bg-ivory-200/80 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-borderWarm bg-[#FAF8F5] px-4 pt-2 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2" aria-label="Navegação mobile">
            {siteConfig.navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-charcoal-300 hover:text-sage-800 hover:bg-ivory-100 rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-borderWarm flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenInterest();
              }}
              className="w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium bg-sage-700 text-ivory-50 hover:bg-sage-800 transition-colors shadow-sm"
            >
              {siteConfig.hero.primaryCta}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
