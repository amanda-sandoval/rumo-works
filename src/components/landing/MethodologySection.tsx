'use client';

import React from 'react';
import { siteConfig } from '@/config/site';
import { Search, PenLine, Target, CheckSquare, Sparkles } from 'lucide-react';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

export const MethodologySection: React.FC = () => {
  const { methodology } = siteConfig;

  const stageIcons = [Search, PenLine, Target, CheckSquare];

  return (
    <section id="metodologia" className="py-20 md:py-28 bg-[#FAF8F5] scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with ScrollReveal */}
        <ScrollReveal variant="popup" delay={0}>
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] bg-[#2E473B] px-3.5 py-1.5 rounded-full border border-[#3E5C4D] inline-block mb-4 shadow-2xs">
              A Metodologia
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal-500 tracking-tight leading-tight mb-5">
              {methodology.headline}
            </h2>
            <p className="text-base sm:text-lg text-charcoal-200 leading-relaxed">
              {methodology.subheadline}
            </p>
          </div>
        </ScrollReveal>

        {/* 4-Step Methodology Grid with Staggered Scroll Pop-Up */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {methodology.stages.map((stage, idx) => {
            const Icon = stageIcons[idx % stageIcons.length];
            const isCapstone = idx === 3; // Step 04 is the final capstone

            return (
              <ScrollReveal
                key={stage.step}
                variant="popup"
                delay={idx * 100}
                className="h-full"
              >
                {isCapstone ? (
                  // Step 04 Capstone Card: Dark Sage Canvas for High-Contrast Punch
                  <div className="relative h-full bg-gradient-to-br from-[#273F33] to-[#1E3228] border border-[#3A5647] hover:border-[#527D67] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group overflow-hidden">
                    {/* Ambient light on top corner */}
                    <div className="absolute top-0 right-0 w-28 h-28 bg-[#A95840]/20 rounded-full blur-xl pointer-events-none" />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-5">
                        <span className="text-2xl font-serif font-bold text-[#FAF8F5]">
                          {stage.step}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#A95840] text-white px-2 py-0.5 rounded shadow-xs">
                            Síntese
                          </span>
                          <div className="w-9 h-9 rounded-xl bg-[#A95840] text-white flex items-center justify-center shadow-xs">
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>
                      </div>

                      <h3 className="font-serif text-xl font-semibold text-[#FAF8F5] mb-3 tracking-tight">
                        {stage.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#D5E2D9] leading-relaxed mb-6">
                        {stage.description}
                      </p>
                    </div>

                    <div className="relative z-10 pt-5 border-t border-white/15 space-y-2">
                      {stage.details.map((detail, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-2 text-xs text-[#E2EBE5]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E58B70] mt-1.5 shrink-0" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Steps 01-03: Editorial White Cards with Rich Accents
                  <div className="relative h-full bg-white border border-borderWarm hover:border-[#2E473B] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group shadow-xs">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-2xl font-serif font-bold text-[#2E473B] group-hover:text-[#A95840] transition-colors">
                          {stage.step}
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-sage-100 border border-sage-200/80 group-hover:bg-[#2E473B] group-hover:text-white text-[#2E473B] flex items-center justify-center transition-all duration-300 shadow-2xs">
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>

                      <h3 className="font-serif text-xl font-semibold text-charcoal-500 mb-3 tracking-tight group-hover:text-[#2E473B] transition-colors">
                        {stage.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-charcoal-200 leading-relaxed mb-6">
                        {stage.description}
                      </p>
                    </div>

                    <div className="pt-5 border-t border-borderWarm/70 space-y-2">
                      {stage.details.map((detail, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-2 text-xs text-charcoal-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#A95840] mt-1.5 shrink-0" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </ScrollReveal>
            );
          })}
        </div>

        {/* High-Contrast Pilot Evolution Note */}
        <ScrollReveal variant="fade-up" delay={250}>
          <div className="mt-14 p-6 rounded-2xl bg-gradient-to-r from-[#243A2F] via-[#2E473B] to-[#203429] border border-[#3B5A4B] text-[#FAF8F5] flex items-start gap-4 max-w-3xl shadow-lg">
            <Sparkles className="w-5 h-5 text-[#E58B70] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-[#DDE7E1] leading-relaxed">
              {methodology.pilotNotice}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
