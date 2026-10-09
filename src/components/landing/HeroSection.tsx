'use client';

import React from 'react';
import { siteConfig } from '@/config/site';
import { ArrowDown, CheckCircle2 } from 'lucide-react';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

interface HeroSectionProps {
  onOpenInterest: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenInterest }) => {
  const { hero } = siteConfig;

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Subtle background ambient gradients */}
      <div className="absolute top-1/4 -right-48 w-96 h-96 bg-sage-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-10 -left-48 w-96 h-96 bg-ivory-300/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Core Positioning Copy and CTAs with ScrollReveal */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <ScrollReveal variant="fade-up" delay={0}>
              {/* Institutional Sage Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#2E473B] text-[#FAF8F5] border border-[#3E5C4D] shadow-2xs mb-6">
                <span className="w-2 h-2 rounded-full bg-[#A95840]" />
                <span>Iniciativa Voluntária de Mentoria</span>
              </div>

              {/* Headline */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-charcoal-500 tracking-tight leading-[1.12] mb-6">
                {hero.headline}
              </h1>

              {/* Supporting Copy */}
              <p className="text-base sm:text-lg text-charcoal-200 leading-relaxed max-w-2xl mb-8">
                {hero.supportingCopy}
              </p>

              {/* Dual CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
                <button
                  type="button"
                  onClick={onOpenInterest}
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-sm font-semibold bg-[#2E473B] hover:bg-[#22352C] text-[#FAF8F5] shadow-md hover:shadow-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 active:scale-[0.98]"
                >
                  {hero.primaryCta}
                </button>

                <a
                  href="#metodologia"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium text-charcoal-300 hover:text-charcoal-500 bg-white hover:bg-ivory-100 border border-borderWarm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700"
                >
                  <span>{hero.secondaryCta}</span>
                  <ArrowDown className="w-4 h-4 text-[#2E473B]" />
                </a>
              </div>

              {/* Quick Value Signals */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-4 border-t border-borderWarm/80 text-xs text-charcoal-200">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E473B]" />
                  <span>Atendimento 1:1 individualizado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E473B]" />
                  <span>Sem promessas irreais ou atalhos</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#A95840]" />
                  <span className="font-medium text-charcoal-300">Foco em clareza e execução</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Editorial Visual Element with ScrollReveal */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <ScrollReveal variant="popup" delay={150} className="w-full max-w-md">
              {/* Card Container simulating strategic progression */}
              <div className="relative bg-white border-2 border-[#2E473B]/15 rounded-2xl p-6 sm:p-8 shadow-xl">
                <div className="flex items-center justify-between border-b border-borderWarm/80 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2E473B]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-400">
                      Rumo Works Framework
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#2E473B]">01 → 04</span>
                </div>

                {/* Conceptual Direction Matrix Graphic with Rich Contrast */}
                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-xl bg-ivory-100/80 border border-borderWarm/70 flex items-start gap-3 transition-colors hover:border-[#2E473B]/40">
                    <div className="w-7 h-7 rounded-lg bg-[#2E473B] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                      01
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-charcoal-500">Autoconhecimento</p>
                      <p className="text-xs text-charcoal-200 mt-0.5">Mapeamento de forças, valores e objetivos</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-ivory-100/80 border border-borderWarm/70 flex items-start gap-3 transition-colors hover:border-[#2E473B]/40">
                    <div className="w-7 h-7 rounded-lg bg-[#2E473B] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                      02
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-charcoal-500">Comunicação e Postura</p>
                      <p className="text-xs text-charcoal-200 mt-0.5">Clareza na expressão de ideias e escuta ativa</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-ivory-100/80 border border-borderWarm/70 flex items-start gap-3 transition-colors hover:border-[#A95840]/40">
                    <div className="w-7 h-7 rounded-lg bg-[#A95840] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                      03
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-charcoal-500">Priorização e Decisão</p>
                      <p className="text-xs text-charcoal-200 mt-0.5">Gestão do tempo e foco no que gera impacto</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#243A2F] to-[#2E473B] border border-[#3E5C4D] text-white flex items-start gap-3 shadow-md">
                    <div className="w-7 h-7 rounded-lg bg-[#A95840] text-white flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                      04
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-white">Plano de Desenvolvimento</p>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-white bg-[#A95840] px-1.5 py-0.5 rounded shadow-2xs">
                          Evolução
                        </span>
                      </div>
                      <p className="text-xs text-[#D5E2D9] mt-0.5">Metas realizáveis e hábitos contínuos</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};
