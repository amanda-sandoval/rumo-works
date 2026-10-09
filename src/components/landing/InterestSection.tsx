'use client';

import React from 'react';
import { siteConfig } from '@/config/site';
import { Sparkles, ArrowRight } from 'lucide-react';

interface InterestSectionProps {
  onOpenInterest: () => void;
}

export const InterestSection: React.FC<InterestSectionProps> = ({ onOpenInterest }) => {
  const { interest } = siteConfig;

  return (
    <section id="interesse" className="py-20 md:py-28 bg-[#FAF8F5] scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Focal Card */}
        <div className="relative bg-gradient-to-br from-sage-800 to-sage-900 rounded-3xl p-8 sm:p-12 md:p-16 text-ivory-50 overflow-hidden shadow-xl">
          {/* Subtle geometric circles */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-sage-700/30 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-terracotta-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            {/* Tag badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-sage-700/60 text-ivory-100 border border-sage-600/50 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-ivory-200" />
              <span>Piloto Voluntário • Vagas Iniciais</span>
            </div>

            {/* Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-ivory-50 tracking-tight leading-tight mb-6">
              {interest.headline}
            </h2>

            {/* Copy */}
            <p className="text-base sm:text-lg text-ivory-200/90 leading-relaxed mb-8">
              {interest.copy}
            </p>

            {/* CTA Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                type="button"
                onClick={onOpenInterest}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm font-semibold bg-ivory-50 text-sage-900 hover:bg-ivory-100 transition-all shadow-md hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ivory-50 active:scale-[0.98]"
              >
                <span>{interest.primaryCta}</span>
                <ArrowRight className="w-4 h-4 text-sage-800" />
              </button>

              <span className="text-xs text-ivory-200/70 text-center sm:text-left self-center">
                Iniciativa 100% voluntária, gratuita e sem fins comerciais.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
