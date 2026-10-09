'use client';

import React from 'react';
import { siteConfig } from '@/config/site';
import { Search, PenLine, Target, CheckSquare, Sparkles } from 'lucide-react';

export const MethodologySection: React.FC = () => {
  const { methodology } = siteConfig;

  const stageIcons = [Search, PenLine, Target, CheckSquare];

  return (
    <section id="metodologia" className="py-20 md:py-28 bg-[#FAF8F5] scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-sage-800 bg-sage-100/80 px-3 py-1 rounded-full border border-sage-200/60 inline-block mb-4">
            A Metodologia
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal-500 tracking-tight leading-tight mb-5">
            {methodology.headline}
          </h2>
          <p className="text-base sm:text-lg text-charcoal-200 leading-relaxed">
            {methodology.subheadline}
          </p>
        </div>

        {/* 4-Step Methodology Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {methodology.stages.map((stage, idx) => {
            const Icon = stageIcons[idx % stageIcons.length];
            return (
              <div
                key={stage.step}
                className="relative bg-white border border-borderWarm rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-sage-300 hover:shadow-md transition-all duration-300 group"
              >
                <div>
                  {/* Step indicator and icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-serif font-bold text-sage-700/40 group-hover:text-sage-700 transition-colors">
                      {stage.step}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-ivory-100 border border-borderWarm flex items-center justify-center text-sage-800">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Title and Description */}
                  <h3 className="font-serif text-xl font-semibold text-charcoal-500 mb-3 tracking-tight">
                    {stage.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-200 leading-relaxed mb-6">
                    {stage.description}
                  </p>
                </div>

                {/* Bullets */}
                <div className="pt-5 border-t border-borderWarm/60 space-y-2">
                  {stage.details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2 text-xs text-charcoal-300">
                      <span className="w-1 h-1 rounded-full bg-sage-600 mt-1.5 shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pilot Evolution Note */}
        <div className="mt-14 p-5 rounded-xl bg-sage-50 border border-sage-200/80 flex items-start gap-3.5 max-w-3xl">
          <Sparkles className="w-5 h-5 text-sage-700 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-sage-900 leading-relaxed">
            {methodology.pilotNotice}
          </p>
        </div>
      </div>
    </section>
  );
};
