'use client';

import React from 'react';
import { siteConfig } from '@/config/site';
import { Compass, MessageSquareText, CalendarCheck, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

export const ChallengeSection: React.FC = () => {
  const { challenges } = siteConfig;

  const cardAccents = [
    {
      icon: Compass,
      iconBg: 'bg-[#2E473B] text-white',
      badgeBg: 'bg-sage-100 text-[#2E473B] border-sage-200/80',
    },
    {
      icon: MessageSquareText,
      iconBg: 'bg-[#A95840] text-white',
      badgeBg: 'bg-terracotta-100 text-[#A95840] border-terracotta-200/80',
    },
    {
      icon: CalendarCheck,
      iconBg: 'bg-[#2E473B] text-white',
      badgeBg: 'bg-sage-100 text-[#2E473B] border-sage-200/80',
    },
  ];

  return (
    <section id="desafios" className="py-20 md:py-28 bg-[#F6F3EE] border-y border-borderWarm scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with ScrollReveal */}
        <ScrollReveal variant="popup" delay={0}>
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#FAF8F5] bg-[#2E473B] px-3.5 py-1.5 rounded-full border border-[#3E5C4D] inline-block mb-4 shadow-2xs">
              O Desafio
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal-500 tracking-tight leading-tight mb-5">
              {challenges.headline}
            </h2>
            <p className="text-base sm:text-lg text-charcoal-200 leading-relaxed">
              {challenges.intro}
            </p>
          </div>
        </ScrollReveal>

        {/* 3 Challenge Cards with Staggered Scroll Pop-Up */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {challenges.items.map((item, index) => {
            const accent = cardAccents[index % cardAccents.length];
            const Icon = accent.icon;

            return (
              <ScrollReveal
                key={item.id}
                variant="popup"
                delay={index * 120}
                className="h-full"
              >
                <div
                  className="group relative h-full bg-white border border-borderWarm hover:border-[#2E473B] rounded-2xl p-7 sm:p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 shadow-xs"
                >
                  <div>
                    {/* Icon & Category Pill */}
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-12 h-12 rounded-xl ${accent.iconBg} flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-105`}>
                        <Icon className="w-6 h-6 stroke-[2]" />
                      </div>
                      <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md border ${accent.badgeBg}`}>
                        {item.highlight}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-semibold text-charcoal-500 mb-3 leading-snug group-hover:text-[#2E473B] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-charcoal-200 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-borderWarm/70 flex items-center justify-between text-xs font-semibold text-[#2E473B] group-hover:text-[#A95840] transition-colors">
                    <span>Etapa {index + 1} de resolução</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* High-Contrast Reassurance Callout in Deep Institutional Sage */}
        <ScrollReveal variant="fade-up" delay={250}>
          <div className="mt-14 p-7 sm:p-8 rounded-2xl bg-gradient-to-br from-[#243A2F] via-[#2E473B] to-[#203429] text-[#FAF8F5] border border-[#3B5A4B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
            <div className="max-w-2xl">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#FAF8F5]/80 bg-white/10 px-2.5 py-0.5 rounded border border-white/15 inline-block mb-2">
                Filosofia da iniciativa
              </span>
              <p className="text-sm sm:text-base leading-relaxed text-[#DDE7E1]">
                <strong className="text-white font-serif text-lg font-semibold block sm:inline sm:mr-1">
                  Desenvolvimento consciente:
                </strong>
                O objetivo não é oferecer atalhos ou fórmulas prontas, mas sim construir clareza sobre suas fortalezas e consistência para a sua evolução.
              </p>
            </div>
            <a
              href="#metodologia"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider bg-white hover:bg-[#FAF8F5] text-[#243A2F] shadow-sm transition-all hover:scale-105 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <span>Ver as etapas</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#2E473B]" />
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
