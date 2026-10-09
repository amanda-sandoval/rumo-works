'use client';

import React from 'react';
import { siteConfig } from '@/config/site';
import { Compass, MessageSquareText, CalendarCheck } from 'lucide-react';

export const ChallengeSection: React.FC = () => {
  const { challenges } = siteConfig;

  const icons = [Compass, MessageSquareText, CalendarCheck];

  return (
    <section id="desafios" className="py-20 md:py-28 bg-[#F6F3EE] border-y border-borderWarm scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-semibold uppercase tracking-wider text-sage-800 bg-sage-100/80 px-3 py-1 rounded-full border border-sage-200/60 inline-block mb-4">
            O Desafio
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal-500 tracking-tight leading-tight mb-5">
            {challenges.headline}
          </h2>
          <p className="text-base text-charcoal-200 leading-relaxed">
            {challenges.intro}
          </p>
        </div>

        {/* 3 Challenge Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {challenges.items.map((item, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div
                key={item.id}
                className="editorial-card p-7 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-ivory-100 border border-borderWarm flex items-center justify-center text-sage-800 mb-6 shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-100 font-semibold mb-2 block">
                    {item.highlight}
                  </span>
                  <h3 className="font-serif text-xl font-semibold text-charcoal-500 mb-3 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-charcoal-200 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-borderWarm/60 flex items-center text-xs text-sage-800 font-medium">
                  <span>Passo {index + 1} para solucionar</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reassurance Callout */}
        <div className="mt-14 p-6 rounded-2xl bg-white border border-borderWarm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <p className="text-sm text-charcoal-300 leading-relaxed">
            <strong className="text-charcoal-500 font-semibold">Sem fórmulas mágicas:</strong> O objetivo não é acelerar candidaturas automáticas, mas sim construir convicção sobre as escolhas e sustentabilidade na busca.
          </p>
          <a
            href="#metodologia"
            className="text-xs font-semibold text-sage-800 hover:text-sage-900 underline underline-offset-4 shrink-0 transition-colors"
          >
            Ver as etapas do método →
          </a>
        </div>
      </div>
    </section>
  );
};
