'use client';

import React from 'react';
import { siteConfig } from '@/config/site';
import { ArrowDown, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeroSectionProps {
  onOpenInterest: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenInterest }) => {
  const { hero } = siteConfig;

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
      {/* Subtle background ambient gradients - refined and non-intrusive */}
      <div className="absolute top-1/4 -right-48 w-96 h-96 bg-sage-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-10 -left-48 w-96 h-96 bg-ivory-300/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Core Positioning Copy & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
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
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-semibold bg-sage-700 hover:bg-sage-800 text-ivory-50 shadow-md hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 active:scale-[0.98]"
              >
                {hero.primaryCta}
              </button>

              <a
                href="#metodologia"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium text-charcoal-300 hover:text-charcoal-500 bg-white hover:bg-ivory-100 border border-borderWarm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700"
              >
                <span>{hero.secondaryCta}</span>
                <ArrowDown className="w-4 h-4 text-sage-600" />
              </a>
            </div>

            {/* Quick Value Signals */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-4 border-t border-borderWarm/80 text-xs text-charcoal-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sage-700" />
                <span>Atendimento 1:1 individualizado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sage-700" />
                <span>Sem promessas irreais ou atalhos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-sage-700" />
                <span>Foco em clareza & execução</span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Visual Element */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              {/* Card Container simulating strategic progression */}
              <div className="relative bg-white border border-borderWarm rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between border-b border-borderWarm/70 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sage-600" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-300">
                      Rumo Works Framework
                    </span>
                  </div>
                  <span className="text-xs font-mono text-charcoal-100">01 → 04</span>
                </div>

                {/* Conceptual Direction Matrix Graphic */}
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-ivory-100/70 border border-borderWarm/50 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-sage-700/10 text-sage-800 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                      01
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-charcoal-400">Ponto de Partida</p>
                      <p className="text-xs text-charcoal-100 mt-0.5">Diagnóstico honesto de competências e objetivos</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-ivory-100/70 border border-borderWarm/50 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-sage-700/10 text-sage-800 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                      02
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-charcoal-400">Posicionamento</p>
                      <p className="text-xs text-charcoal-100 mt-0.5">Narrativa clara sem ruídos corporativos</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-ivory-100/70 border border-borderWarm/50 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-sage-700/10 text-sage-800 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                      03
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-charcoal-400">Estratégia</p>
                      <p className="text-xs text-charcoal-100 mt-0.5">Priorização intencional de papéis e empresas</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-sage-50 border border-sage-200/80 flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-sage-700 text-ivory-50 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                      04
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-sage-900">Plano de Ação</p>
                        <span className="text-[10px] font-medium text-sage-800 bg-sage-200/70 px-1.5 py-0.2 rounded">
                          Destino
                        </span>
                      </div>
                      <p className="text-xs text-sage-800 mt-0.5">Passos práticos e rotina executável</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
