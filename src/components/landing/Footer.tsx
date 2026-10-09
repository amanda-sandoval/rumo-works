'use client';

import React from 'react';
import { Logo } from '@/components/brand/Logo';
import { siteConfig } from '@/config/site';

interface FooterProps {
  onOpenInterest: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenInterest }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-borderWarm bg-[#F6F3EE] py-16 text-charcoal-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-borderWarm/70">
          {/* Brand & Mission Statement */}
          <div className="md:col-span-6 flex flex-col items-start">
            <Logo className="mb-4" />
            <p className="text-sm text-charcoal-200 leading-relaxed max-w-sm mb-6">
              {siteConfig.footer.statement}
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 mb-4">
              Navegação
            </p>
            <ul className="space-y-2.5 text-sm text-charcoal-200">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="hover:text-sage-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 rounded-xs"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Pilot Action */}
          <div className="md:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 mb-4">
              Piloto Voluntário
            </p>
            <p className="text-xs text-charcoal-100 leading-relaxed mb-4">
              Primeira fase com vagas limitadas para participantes selecionados.
            </p>
            <button
              type="button"
              onClick={onOpenInterest}
              className="text-xs font-semibold text-sage-800 hover:text-sage-900 underline underline-offset-4 transition-colors"
            >
              Manifestar interesse →
            </button>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-100">
          <p className="max-w-xl text-center sm:text-left">
            {siteConfig.footer.independentNotice}
          </p>
          <p className="shrink-0">
            &copy; {currentYear} Rumo Works. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};
