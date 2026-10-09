'use client';

import React from 'react';
import { siteConfig } from '@/config/site';
import { Check, Info } from 'lucide-react';

export const TargetAudienceSection: React.FC = () => {
  const { targetAudience } = siteConfig;

  return (
    <section id="para-quem" className="pt-16 pb-4 md:pt-20 md:pb-6 bg-[#FAF8F5] scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-sage-800 bg-sage-100/80 px-3 py-1 rounded-full border border-sage-200/60 inline-block mb-4">
            Para quem é
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal-500 tracking-tight leading-tight mb-5">
            {targetAudience.headline}
          </h2>
          <p className="text-base sm:text-lg text-charcoal-200 leading-relaxed">
            {targetAudience.intro}
          </p>
        </div>

        {/* 4 Audience Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {targetAudience.items.map((item, idx) => (
            <div
              key={idx}
              className="editorial-card p-6 sm:p-7 flex items-start gap-4 hover:border-sage-300 transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-lg bg-sage-100 text-sage-800 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-charcoal-500 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-charcoal-200 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Candidacy and Fit Note */}
        <div className="p-6 rounded-2xl bg-ivory-100/80 border border-borderWarm flex items-start gap-4">
          <Info className="w-5 h-5 text-charcoal-300 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-charcoal-300 leading-relaxed">
            {targetAudience.pilotNote}
          </p>
        </div>
      </div>
    </section>
  );
};
