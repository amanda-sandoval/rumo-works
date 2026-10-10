'use client';

import React from 'react';
import { siteConfig } from '@/config/site';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

interface InterestSectionProps {
  onOpenInterest: () => void;
}

export const InterestSection: React.FC<InterestSectionProps> = ({ onOpenInterest }) => {
  const { interest } = siteConfig;

  return (
    <section id="interesse" className="pt-4 pb-16 md:pt-6 md:pb-24 bg-[#FAF8F5] scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Focal Card with ScrollReveal */}
        <ScrollReveal variant="popup" delay={0}>
          <div className="relative bg-gradient-to-br from-[#243A2F] via-[#2E473B] to-[#1C2C23] border border-[#3D5C4C] rounded-3xl p-8 sm:p-12 md:p-16 text-ivory-50 overflow-hidden shadow-2xl">
            {/* Subtle geometric circles */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#3B5A4B]/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#A95840]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              {/* Vibrant Terracotta Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#A95840] text-white shadow-sm mb-6">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>Formato Exclusivo 1:1 • Vagas Limitadas</span>
              </div>

              {/* Headline */}
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight leading-tight mb-6">
                {interest.headline}
              </h2>

              {/* Copy */}
              <p className="text-base sm:text-lg text-[#D5E2D9] leading-relaxed mb-8">
                {interest.copy}
              </p>

              {/* CTA Action */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  type="button"
                  onClick={onOpenInterest}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold bg-[#FAF8F5] text-[#243A2F] hover:bg-white transition-all shadow-lg hover:shadow-2xl hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.98]"
                >
                  <span>{interest.primaryCta}</span>
                  <ArrowRight className="w-4 h-4 text-[#2E473B]" />
                </button>

                <span className="text-xs text-[#CBD8D0] text-center sm:text-left self-center">
                  Sessões individuais 1:1 com alinhamento de objetivos mútuos.
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
