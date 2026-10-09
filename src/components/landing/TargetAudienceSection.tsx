'use client';

import React from 'react';
import { siteConfig } from '@/config/site';
import { Check, Info } from 'lucide-react';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

export const TargetAudienceSection: React.FC = () => {
  const { targetAudience } = siteConfig;

  return (
    <section id="para-quem" className="pt-16 pb-6 md:pt-20 md:pb-8 bg-[#FAF8F5] scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with ScrollReveal */}
        <ScrollReveal variant="popup" delay={0}>
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] bg-[#2E473B] px-3.5 py-1.5 rounded-full border border-[#3E5C4D] inline-block mb-4 shadow-2xs">
              Para quem é
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal-500 tracking-tight leading-tight mb-5">
              {targetAudience.headline}
            </h2>
            <p className="text-base sm:text-lg text-charcoal-200 leading-relaxed">
              {targetAudience.intro}
            </p>
          </div>
        </ScrollReveal>

        {/* 4 Audience Cards: High-Contrast Dark Institutional Sage with Terracotta Pop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {targetAudience.items.map((item, idx) => (
            <ScrollReveal
              key={idx}
              variant="popup"
              delay={idx * 100}
              className="h-full"
            >
              <div
                className="group relative h-full bg-gradient-to-br from-[#273F33] to-[#1E3228] border border-[#3A5647] hover:border-[#527D67] rounded-2xl p-7 sm:p-8 flex items-start gap-5 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Subtle ambient lighting on card corner */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-[#3B5A4B]/20 rounded-full blur-2xl pointer-events-none group-hover:bg-[#A95840]/20 transition-colors duration-500" />

                {/* Terracotta/Sage Accent Check Badge */}
                <div className="w-10 h-10 rounded-xl bg-[#2E473B] group-hover:bg-[#A95840] border border-[#436854] group-hover:border-[#C56850] text-[#FAF8F5] flex items-center justify-center shrink-0 mt-0.5 shadow-sm transition-all duration-300">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </div>

                <div className="flex-1 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-serif text-xl font-semibold text-[#FAF8F5] tracking-tight group-hover:text-white transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-xs font-mono text-[#8FAF9A] group-hover:text-[#FAF8F5] transition-colors ml-2 shrink-0">
                      0{idx + 1}
                    </span>
                  </div>
                  <p className="text-sm text-[#D5E2D9] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Alignment Note with High-Contrast Editorial Frame */}
        <ScrollReveal variant="fade-up" delay={200}>
          <div className="p-6 rounded-2xl bg-white border border-[#2E473B]/20 border-l-4 border-l-[#2E473B] shadow-xs flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-sage-100 text-[#2E473B] flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <p className="text-xs sm:text-sm text-charcoal-300 leading-relaxed">
              <strong className="text-[#2E473B] font-semibold">Aviso de alinhamento:</strong> {targetAudience.pilotNote.replace('Aviso de alinhamento: ', '')}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
