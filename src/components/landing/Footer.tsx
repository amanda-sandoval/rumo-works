'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { siteConfig } from '@/config/site';
import { Mail } from 'lucide-react';

interface FooterProps {
  onOpenInterest: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenInterest }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-borderWarm bg-[#F6F3EE] py-16 text-charcoal-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-borderWarm/70">
          {/* Brand and Mission Statement */}
          <div className="md:col-span-5 flex flex-col items-start">
            <Logo className="mb-4" />
            <p className="text-sm text-charcoal-200 leading-relaxed max-w-sm mb-4">
              {siteConfig.footer.statement}
            </p>
            <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-sage-800 bg-sage-100/90 px-2.5 py-1 rounded-md border border-sage-200/60">
              Mentoria 1:1 & Desenvolvimento Profissional
            </span>
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

          {/* Legal / Transparency Links */}
          <div className="md:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-400 mb-4">
              Transparência e Contato
            </p>
            <ul className="space-y-2.5 text-sm text-charcoal-200 mb-5">
              <li>
                <Link
                  href="/termos-de-uso"
                  className="hover:text-sage-800 transition-colors underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 rounded-xs"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-de-privacidade"
                  className="hover:text-sage-800 transition-colors underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 rounded-xs"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="inline-flex items-center gap-2 hover:text-sage-800 transition-colors underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 rounded-xs"
                >
                  <Mail className="w-3.5 h-3.5 text-sage-700" />
                  <span>{siteConfig.contactEmail}</span>
                </a>
              </li>
            </ul>
            <button
              type="button"
              onClick={onOpenInterest}
              className="text-xs font-semibold text-sage-800 hover:text-sage-900 underline underline-offset-4 transition-colors"
            >
              Manifestar interesse no piloto →
            </button>
          </div>
        </div>

        {/* Bottom Disclaimer and Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-100">
          <p className="max-w-xl text-center sm:text-left leading-relaxed">
            {siteConfig.footer.independentNotice}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <div className="flex items-center gap-3 text-charcoal-200">
              <Link href="/termos-de-uso" className="hover:text-sage-800 transition-colors">
                Termos de Uso
              </Link>
              <span>•</span>
              <Link href="/politica-de-privacidade" className="hover:text-sage-800 transition-colors">
                Privacidade
              </Link>
            </div>
            <span className="text-charcoal-100 sm:border-l sm:border-borderWarm sm:pl-3">
              &copy; {currentYear} Rumo Works.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
