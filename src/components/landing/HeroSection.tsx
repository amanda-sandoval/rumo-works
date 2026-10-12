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

  // 8 dimensões oficiais da metodologia Mapa Rumo
  const radarAxes = [
    { name: 'Motivação & Energia', short: 'Motivação', val: 84 },
    { name: 'Valores & Limites', short: 'Limites', val: 74 },
    { name: 'Ambiente & Estrutura', short: 'Ambiente', val: 88 },
    { name: 'Clareza de Direção', short: 'Clareza', val: 68 },
    { name: 'Forças & Competências', short: 'Forças', val: 86 },
    { name: 'Comunicação & Influência', short: 'Comunicação', val: 78 },
    { name: 'Priorização & Execução', short: 'Execução', val: 72 },
    { name: 'Aprendizagem & Adaptação', short: 'Adaptação', val: 82 },
  ];

  const cx = 130;
  const cy = 130;
  const r = 86;
  const numAxes = radarAxes.length;

  const getCoordinates = (index: number, val: number, radius = r) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / numAxes;
    const distance = (val / 100) * radius;
    const x = cx + distance * Math.cos(angle);
    const y = cy + distance * Math.sin(angle);
    return { x, y };
  };

  const polygonPoints = radarAxes
    .map((item, idx) => {
      const { x, y } = getCoordinates(idx, item.val);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
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
                <span>Rumo Works • Estratégia e Desenvolvimento de Carreira</span>
              </div>

              {/* Headline Oficial Master Prompt V3 (Preservada estritamente) */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-charcoal-500 tracking-tight leading-[1.12] mb-6">
                {hero.headline}
              </h1>

              {/* Definição Institucional e Supporting Copy Oficial */}
              <p className="text-base sm:text-lg text-charcoal-300 leading-relaxed max-w-2xl mb-3 font-medium">
                {siteConfig.description}
              </p>
              <p className="text-sm sm:text-base text-charcoal-200 leading-relaxed max-w-2xl mb-8">
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
              <div className="relative bg-white/95 backdrop-blur-xs border-2 border-sage-600/20 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden">
                {/* Glow sutil roxo/lilás de fundo exclusivo do Mapa Rumo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-violet-400/10 rounded-full blur-3xl pointer-events-none" />

                {/* Header da Demonstração */}
                <div className="relative z-10 flex items-center justify-between border-b border-borderWarm/80 pb-3 mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#2E473B] text-white flex items-center justify-center shadow-2xs">
                      <Compass className="w-4 h-4 text-warmCream" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-charcoal-500 leading-tight">
                          Mapa Rumo
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                      </div>
                      <span className="text-[10px] text-charcoal-300 block">
                        Diagnóstico de Carreira
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#6D28D9] bg-[#F5F3FF] px-2.5 py-0.5 rounded-full border border-[#DDD6FE] shadow-2xs">
                    8 Dimensões Integradas
                  </span>
                </div>

                {/* Radar Gráfico Demonstrativo 8D com Eixos Oficiais */}
                <div className="relative z-10 flex items-center justify-center py-1">
                  <div className="relative w-[260px] h-[260px]">
                    <svg viewBox="0 0 260 260" className="w-full h-full overflow-visible">
                      <defs>
                        {/* Gradiente luminoso da área preenchida do radar */}
                        <radialGradient id="radarAreaGrad" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
                          <stop offset="85%" stopColor="#7C3AED" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#6D28D9" stopOpacity="0.15" />
                        </radialGradient>
                        {/* Filtro de sombra suave nos nós */}
                        <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#7C3AED" floodOpacity="0.35" />
                        </filter>
                      </defs>

                      {/* Níveis concêntricos octogonais de calibração */}
                      {[0.25, 0.5, 0.75, 1.0].map((level, i) => (
                        <polygon
                          key={i}
                          points={radarAxes
                            .map((_, idx) => {
                              const { x, y } = getCoordinates(idx, level * 100);
                              return `${x.toFixed(1)},${y.toFixed(1)}`;
                            })
                            .join(' ')}
                          fill={level === 1.0 ? 'rgba(250, 248, 245, 0.5)' : 'none'}
                          stroke="#E5E0D8"
                          strokeWidth={level === 1.0 ? '1.2' : '0.8'}
                          strokeDasharray={level === 1.0 ? 'none' : '2.5 2.5'}
                        />
                      ))}

                      {/* Eixos radiais */}
                      {radarAxes.map((_, idx) => {
                        const { x, y } = getCoordinates(idx, 100);
                        return (
                          <line
                            key={idx}
                            x1={cx}
                            y1={cy}
                            x2={x.toFixed(1)}
                            y2={y.toFixed(1)}
                            stroke="#E5E0D8"
                            strokeWidth="0.8"
                          />
                        );
                      })}

                      {/* Polígono preenchido do diagnóstico calculado */}
                      <polygon
                        points={polygonPoints}
                        fill="url(#radarAreaGrad)"
                        stroke="#7C3AED"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />

                      {/* Vértices / Nós luminosos com valor */}
                      {radarAxes.map((item, idx) => {
                        const { x, y } = getCoordinates(idx, item.val);
                        return (
                          <g key={idx} filter="url(#nodeGlow)">
                            <circle
                              cx={x}
                              cy={y}
                              r={4}
                              fill="#7C3AED"
                              stroke="#FFFFFF"
                              strokeWidth="1.8"
                            />
                          </g>
                        );
                      })}

                      {/* Rótulos curtos das 8 dimensões nas extremidades */}
                      {radarAxes.map((item, idx) => {
                        const labelCoord = getCoordinates(idx, 114);
                        return (
                          <text
                            key={idx}
                            x={labelCoord.x}
                            y={labelCoord.y + 3}
                            textAnchor="middle"
                            className="text-[9px] font-medium fill-charcoal-400 select-none pointer-events-none"
                          >
                            {item.short}
                          </text>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Cards Demonstrativos de Insights Reais */}
                <div className="relative z-10 space-y-2 mt-2 pt-3 border-t border-borderWarm/70 text-xs">
                  <div className="p-2.5 rounded-xl bg-ivory-50/80 border border-borderWarm/80 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-violet-100 text-[#6D28D9] flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-[#7C3AED]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-charcoal-500 text-[11px] truncate">
                          Perfil: Autonomia & Ambiente
                        </p>
                        <span className="text-[10px] font-mono font-bold text-[#6D28D9] bg-violet-50 px-1.5 py-0.2 rounded border border-violet-200/60">
                          84/100
                        </span>
                      </div>
                      <p className="text-[10px] text-charcoal-300 mt-0.5 leading-snug">
                        Alta consistência entre motivadores internos e sustentação de foco no dia a dia.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-sage-50/70 border border-sage-200/80 flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-sage-100 text-[#2E473B] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-[#2E473B]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sage-900 text-[11px]">
                        Plano de 30 Dias Estruturado
                      </p>
                      <p className="text-[10px] text-sage-800/80 mt-0.5 leading-snug">
                        4 semanas de micro-ações calibradas para transformar diagnóstico em prática.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Link para Iniciar */}
                <div className="relative z-10 mt-3.5 text-center">
                  <Link
                    href="/mapa"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sage-800 hover:text-sage-900 transition-colors group"
                  >
                    <span>Fazer meu diagnóstico gratuito</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
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
