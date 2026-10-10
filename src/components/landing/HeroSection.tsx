'use client';

import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { ArrowRight, CheckCircle2, Compass, Sparkles, Lock, ArrowUpRight } from 'lucide-react';
import { ScrollReveal } from '@/components/motion/ScrollReveal';

interface HeroSectionProps {
  onOpenInterest: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenInterest }) => {
  const { hero } = siteConfig;

  // Mini-radar SVG ilustrativo para demonstração real do Mapa Rumo
  const radarAxes = [
    { name: 'Motivação', val: 82 },
    { name: 'Valores', val: 74 },
    { name: 'Ambiente', val: 88 },
    { name: 'Clareza', val: 65 },
    { name: 'Forças', val: 85 },
    { name: 'Comunicação', val: 78 },
    { name: 'Priorização', val: 70 },
    { name: 'Aprendizado', val: 80 },
  ];

  const cx = 110;
  const cy = 110;
  const r = 75;
  const numAxes = radarAxes.length;

  const getCoordinates = (index: number, val: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / numAxes;
    const distance = (val / 100) * r;
    const x = cx + distance * Math.cos(angle);
    const y = cy + distance * Math.sin(angle);
    return { x, y };
  };

  const polygonPoints = radarAxes
    .map((item, idx) => {
      const { x, y } = getCoordinates(idx, item.val);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <section className="relative pt-10 pb-16 md:pt-16 md:pb-28 overflow-hidden">
      {/* Subtle background ambient gradients */}
      <div className="absolute top-1/4 -right-48 w-96 h-96 bg-sage-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-10 -left-48 w-96 h-96 bg-ivory-300/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Core Positioning Copy and CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <ScrollReveal variant="fade-up" delay={0}>
              {/* Institutional Sage Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#2E473B] text-[#FAF8F5] border border-[#3E5C4D] shadow-2xs mb-6">
                <Compass className="w-3.5 h-3.5 text-warmCream" />
                <span>Rumo Works • Autoconhecimento & Mentoria</span>
              </div>

              {/* Headline Oficial Master Prompt V3 */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-charcoal-500 tracking-tight leading-[1.12] mb-6">
                {hero.headline}
              </h1>

              {/* Supporting Copy Oficial Master Prompt V3 */}
              <p className="text-base sm:text-lg text-charcoal-200 leading-relaxed max-w-2xl mb-8">
                {hero.supportingCopy}
              </p>

              {/* Dual CTAs Exatos da Especificação */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
                <Link
                  href="/mapa"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold bg-[#2E473B] hover:bg-[#22352C] text-[#FAF8F5] shadow-md hover:shadow-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 active:scale-[0.98] group"
                >
                  <span>{hero.primaryCta}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/mentoria"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-medium text-charcoal-300 hover:text-charcoal-500 bg-white hover:bg-ivory-100 border border-borderWarm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-700 shadow-2xs"
                >
                  <span>{hero.secondaryCta}</span>
                  <ArrowUpRight className="w-4 h-4 text-sage-800" />
                </Link>
              </div>

              {/* Quick Value Signals */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-4 border-t border-borderWarm/80 text-xs text-charcoal-200">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E473B]" />
                  <span>Diagnóstico gratuito em ~5 min</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2E473B]" />
                  <span>Mentoria individualizada 1:1</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#A95840]" />
                  <span className="font-medium text-charcoal-300">Sem promessas irreais ou atalhos</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Demonstração Visual Real do Mapa Rumo */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <ScrollReveal variant="popup" delay={150} className="w-full max-w-md">
              <div className="relative bg-white border-2 border-sage-600/20 rounded-3xl p-6 sm:p-7 shadow-xl">
                {/* Header da Demonstração */}
                <div className="flex items-center justify-between border-b border-borderWarm pb-3.5 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sage-700 animate-pulse" />
                    <span className="text-xs font-semibold text-charcoal-500">
                      Mapa Rumo • Demonstração
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-sage-800 bg-sage-100 px-2 py-0.5 rounded-md border border-sage-200">
                    Exemplo ilustrativo
                  </span>
                </div>

                {/* Radar Gráfico Demonstrativo */}
                <div className="flex items-center justify-center py-2">
                  <div className="relative w-[220px] h-[220px]">
                    <svg viewBox="0 0 220 220" className="w-full h-full overflow-visible">
                      {/* Círculos concêntricos de escala */}
                      {[0.3, 0.6, 1.0].map((level, i) => (
                        <polygon
                          key={i}
                          points={radarAxes
                            .map((_, idx) => {
                              const { x, y } = getCoordinates(idx, level * 100);
                              return `${x},${y}`;
                            })
                            .join(' ')}
                          fill="none"
                          stroke="#E7E2D9"
                          strokeWidth={level === 1 ? '1.5' : '1'}
                          strokeDasharray={level === 1 ? 'none' : '2 2'}
                        />
                      ))}

                      {/* Eixos */}
                      {radarAxes.map((_, idx) => {
                        const { x, y } = getCoordinates(idx, 100);
                        return (
                          <line
                            key={idx}
                            x1={cx}
                            y1={cy}
                            x2={x}
                            y2={y}
                            stroke="#E7E2D9"
                            strokeWidth="1"
                          />
                        );
                      })}

                      {/* Polígono preenchido do diagnóstico */}
                      <polygon
                        points={polygonPoints}
                        fill="rgba(46, 71, 59, 0.22)"
                        stroke="#2E473B"
                        strokeWidth="2"
                      />

                      {/* Vértices */}
                      {radarAxes.map((item, idx) => {
                        const { x, y } = getCoordinates(idx, item.val);
                        return (
                          <circle
                            key={idx}
                            cx={x}
                            cy={y}
                            r={3.5}
                            fill="#2E473B"
                            stroke="#FFFFFF"
                            strokeWidth="1.5"
                          />
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Cards Demonstrativos de Insights Reais */}
                <div className="space-y-2.5 mt-3 pt-3 border-t border-borderWarm/70 text-xs">
                  <div className="p-2.5 rounded-xl bg-ivory-50 border border-borderWarm flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-charcoal-500">Pilar Ativo: Autonomia & Rigor</p>
                      <p className="text-[11px] text-charcoal-200 mt-0.5">
                        Alta consistência entre importância declarada e realização prática na rotina.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-sage-50/60 border border-sage-200/80 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-sage-800 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sage-900">Plano de 30 Dias Integrado</p>
                      <p className="text-[11px] text-sage-800/80 mt-0.5">
                        Micro-ações semanais orientadas para proteger margem mental e foco essencial.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Link para Iniciar */}
                <div className="mt-4 text-center">
                  <Link
                    href="/mapa"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sage-800 hover:text-sage-900 transition-colors"
                  >
                    <span>Fazer meu diagnóstico gratuito</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};
