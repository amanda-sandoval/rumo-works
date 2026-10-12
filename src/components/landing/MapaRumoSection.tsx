'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
  CalendarCheck2,
  CheckCircle2,
  Lock,
  BarChart2,
  SlidersHorizontal,
  Scale,
  Target,
} from 'lucide-react';

export function MapaRumoSection() {
  const [activeTab, setActiveTab] = useState<'visao' | 'analise' | 'comparativo' | 'acoes'>('visao');
  return (
    <section
      id="mapa-rumo"
      className="relative py-20 md:py-32 bg-[#FAF8F5] border-y border-borderWarm overflow-hidden scroll-mt-20"
    >
      {/* Detalhes de iluminação sutil no fundo */}
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-cobalt-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 -right-48 w-96 h-96 bg-terracotta-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Coluna da Esquerda: Narrativa e Proposta de Valor */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cobalt-500 text-white shadow-xs mb-6">
                <Sparkles className="w-3.5 h-3.5 text-warmCream" />
                <span>Nova Ferramenta Digital • Rumo Works</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal-500 tracking-tight leading-[1.15] mb-6">
                Entenda como você funciona no trabalho. Descubra o que importa para você e o que pode transformar sua próxima fase.
              </h2>

              <p className="text-base sm:text-lg text-charcoal-200 leading-relaxed max-w-2xl mb-8">
                Uma experiência de autoconhecimento profissional para conectar suas motivações, seus valores, seu jeito de trabalhar e seus próximos passos em um diagnóstico interativo com plano de ação de 30 dias.
              </p>

              {/* Destaques do Modelo Freemium */}
              <div className="space-y-3 mb-10 w-full max-w-xl">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-borderWarm shadow-2xs">
                  <div className="w-6 h-6 rounded-md bg-sage-100 text-sage-800 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-sage-800" />
                  </div>
                  <div className="text-xs sm:text-sm text-charcoal-300">
                    <strong className="text-charcoal-500 font-semibold block">Diagnóstico e prévia personalizada:</strong>
                    Responda às perguntas no seu ritmo (~12 min) e explore suas primeiras descobertas sem cadastro prévio obrigatório.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-borderWarm shadow-2xs">
                  <div className="w-6 h-6 rounded-md bg-cobalt-100 text-cobalt-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-3.5 h-3.5 text-cobalt-600" />
                  </div>
                  <div className="text-xs sm:text-sm text-charcoal-300">
                    <strong className="text-charcoal-500 font-semibold block">Relatório completo e plano de 30 dias:</strong>
                    Aprofundamento para quem deseja o radar completo, análises cruzadas de motivação e roteiro de micro-ações semanais.
                  </div>
                </div>
              </div>

              {/* Botão de Ação Primário */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-4">
                <Link
                  href="/mapa"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-sm font-semibold bg-cobalt-500 hover:bg-cobalt-600 text-white shadow-md hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cobalt-500 active:scale-[0.98] group"
                >
                  <span>Criar meu Mapa Rumo</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <p className="text-xs text-charcoal-200">
                Comece agora. Explore seus resultados. Aprofunde seu mapa quando quiser.
              </p>
            </ScrollReveal>
          </div>

          {/* Coluna da Direita: Demonstração Analítica das 4 Visões (Propósito & Motivação) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <ScrollReveal delay={150}>
              <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xs border-2 border-sage-600/20 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden">
                {/* Glow sutil de fundo exclusivo do Mapa Rumo */}
                <div className="absolute top-1/3 -right-12 w-48 h-48 bg-violet-400/10 rounded-full blur-3xl pointer-events-none" />

                {/* Header Superior da Demonstração */}
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
                        <span className="text-[10px] text-charcoal-300">• Painel Analítico</span>
                      </div>
                      <span className="text-[10px] text-sage-800 font-medium block">
                        Pilar: Propósito & Motivação
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#6D28D9] bg-[#F5F3FF] px-2 py-0.5 rounded-full border border-[#DDD6FE] shadow-2xs">
                    4 Visões do Diagnóstico
                  </span>
                </div>

                {/* Seletor Segmentado das 4 Visões Analíticas */}
                <div className="relative z-10 grid grid-cols-4 gap-1 p-1 bg-ivory-100/90 rounded-xl mb-4 border border-borderWarm/70 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('visao')}
                    className={`py-1.5 px-1 rounded-lg text-center font-medium transition-all ${
                      activeTab === 'visao'
                        ? 'bg-[#2E473B] text-white shadow-xs font-semibold'
                        : 'text-charcoal-300 hover:text-charcoal-500 hover:bg-white/60'
                    }`}
                  >
                    1. Visão Geral
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('analise')}
                    className={`py-1.5 px-1 rounded-lg text-center font-medium transition-all ${
                      activeTab === 'analise'
                        ? 'bg-[#2E473B] text-white shadow-xs font-semibold'
                        : 'text-charcoal-300 hover:text-charcoal-500 hover:bg-white/60'
                    }`}
                  >
                    2. Análise
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('comparativo')}
                    className={`py-1.5 px-1 rounded-lg text-center font-medium transition-all ${
                      activeTab === 'comparativo'
                        ? 'bg-[#2E473B] text-white shadow-xs font-semibold'
                        : 'text-charcoal-300 hover:text-charcoal-500 hover:bg-white/60'
                    }`}
                  >
                    3. Comparativo
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('acoes')}
                    className={`py-1.5 px-1 rounded-lg text-center font-medium transition-all ${
                      activeTab === 'acoes'
                        ? 'bg-[#2E473B] text-white shadow-xs font-semibold'
                        : 'text-charcoal-300 hover:text-charcoal-500 hover:bg-white/60'
                    }`}
                  >
                    4. Ações
                  </button>
                </div>

                {/* Conteúdo Específico de Cada Visão */}
                <div className="relative z-10 min-h-[220px]">
                  {/* VISÃO 1: VISÃO GERAL */}
                  {activeTab === 'visao' && (
                    <div className="space-y-2.5 animate-fadeIn">
                      <div className="p-3 rounded-2xl bg-ivory-50/90 border border-borderWarm/80">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold text-charcoal-500">Nível do Pilar: Estruturado</span>
                          <span className="font-mono font-bold text-[#6D28D9]">84/100</span>
                        </div>
                        <div className="w-full bg-borderWarm h-2 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-violet-500 to-[#6D28D9] h-full rounded-full w-[84%]" />
                        </div>
                        <p className="text-[10px] text-charcoal-300 mt-2 leading-relaxed">
                          Forte disposição para autonomia técnica com necessidade de clareza explícita de impacto.
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-borderWarm/70 flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-md bg-sage-100 text-[#2E473B] flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2E473B]" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-charcoal-500">Padrão de Energia Mapeado</p>
                          <p className="text-[10px] text-charcoal-300 mt-0.5 leading-snug">
                            Alta sustentação de foco em projetos com escopo definido e autonomia de condução.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-violet-50 text-[#6D28D9] border border-violet-200/60">
                          ⚡ Autonomia com Propósito
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-sage-50 text-sage-800 border border-sage-200">
                          🌱 Aprendizado Contínuo
                        </span>
                      </div>
                    </div>
                  )}

                  {/* VISÃO 2: ANÁLISE COMPLETA */}
                  {activeTab === 'analise' && (
                    <div className="space-y-2.5 animate-fadeIn">
                      <div className="p-3 rounded-2xl bg-white border border-borderWarm/80">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-charcoal-500">Ambiente & Margem Mental</span>
                          <span className="text-[9px] uppercase tracking-wider font-semibold text-sage-800 bg-sage-100 px-1.5 py-0.2 rounded">
                            Evidência
                          </span>
                        </div>
                        <p className="text-[10px] text-charcoal-300 leading-relaxed">
                          Sua rotina demanda blocos protegidos de concentração de pelo menos 90 min para gerar profundidade analítica.
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-white border border-borderWarm/80">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-charcoal-500">Tensão de Valores Identificada</span>
                          <span className="text-[9px] uppercase tracking-wider font-semibold text-terracotta-700 bg-terracotta-100 px-1.5 py-0.2 rounded">
                            Atenção
                          </span>
                        </div>
                        <p className="text-[10px] text-charcoal-300 leading-relaxed">
                          Conflito recorrente entre tempo dedicado a iniciativas de longo prazo e demandas operacionais reativas.
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-ivory-50 border border-borderWarm/70 text-[10px] text-charcoal-400">
                        <strong className="text-charcoal-500 font-semibold block mb-0.5">Pergunta para Reflexão:</strong>
                        "Onde sua energia está gerando alavancagem real e onde está apenas apagando incêndios?"
                      </div>
                    </div>
                  )}

                  {/* VISÃO 3: COMPARATIVO (MATRIZ DE GAPS) */}
                  {activeTab === 'comparativo' && (
                    <div className="space-y-2 animate-fadeIn">
                      <div className="text-[10px] text-charcoal-300 flex items-center justify-between px-1">
                        <span>Motivador de Carreira</span>
                        <span>Importância vs. Realização</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-borderWarm/80 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-charcoal-500 text-[11px]">Autonomia de Decisão</p>
                          <p className="text-[10px] text-charcoal-300">Imp: 5/5 • Sat: 4/5</p>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sage-100 text-sage-800 border border-sage-200">
                          Alinhado (+1)
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-borderWarm/80 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-charcoal-500 text-[11px]">Margem Mental & Foco</p>
                          <p className="text-[10px] text-charcoal-300">Imp: 5/5 • Sat: 2/5</p>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-terracotta-100 text-terracotta-700 border border-terracotta-200">
                          Tensão (-3)
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-borderWarm/80 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-charcoal-500 text-[11px]">Reconhecimento Técnico</p>
                          <p className="text-[10px] text-charcoal-300">Imp: 4/5 • Sat: 4/5</p>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-ivory-100 text-charcoal-400 border border-borderWarm">
                          Equilíbrio (0)
                        </span>
                      </div>

                      <p className="text-[9px] text-charcoal-200 pt-0.5 px-1 leading-snug">
                        Revela se suas prioridades fundamentais estão sendo nutridas ou consumidas na prática.
                      </p>
                    </div>
                  )}

                  {/* VISÃO 4: RECOMENDAÇÕES PRÁTICAS (PLANO DE 30 DIAS) */}
                  {activeTab === 'acoes' && (
                    <div className="space-y-2 animate-fadeIn">
                      <div className="text-[10px] text-charcoal-300 flex items-center justify-between px-1">
                        <span className="font-semibold text-charcoal-500">Roteiro Semanal de Ação</span>
                        <span className="text-[9px] text-violet-600 font-semibold">4 Semanas</span>
                      </div>

                      <div className="space-y-1.5 text-[10px]">
                        <div className="p-2 rounded-xl bg-ivory-50 border border-borderWarm/70 flex items-start gap-2">
                          <span className="font-mono font-bold text-xs text-[#2E473B] shrink-0 w-5">S1</span>
                          <span className="text-charcoal-400">Blindar 90 min diários de foco sem mensagens reativas.</span>
                        </div>
                        <div className="p-2 rounded-xl bg-ivory-50 border border-borderWarm/70 flex items-start gap-2">
                          <span className="font-mono font-bold text-xs text-[#2E473B] shrink-0 w-5">S2</span>
                          <span className="text-charcoal-400">Repactuar acordos de prazos e alinhamento com lideranças.</span>
                        </div>
                        <div className="p-2 rounded-xl bg-ivory-50 border border-borderWarm/70 flex items-start gap-2">
                          <span className="font-mono font-bold text-xs text-[#2E473B] shrink-0 w-5">S3</span>
                          <span className="text-charcoal-400">Ativar conexões estratégicas e mapear novas oportunidades.</span>
                        </div>
                        <div className="p-2 rounded-xl bg-ivory-50 border border-borderWarm/70 flex items-start gap-2">
                          <span className="font-mono font-bold text-xs text-[#2E473B] shrink-0 w-5">S4</span>
                          <span className="text-charcoal-400">Consolidar rituais e revisar indicadores de consistência.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Discreto do Card com Cartão de Acesso */}
                <div className="relative z-10 mt-3 pt-3 border-t border-borderWarm/70 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-charcoal-300">
                    <CalendarCheck2 className="w-3.5 h-3.5 text-sage-800" />
                    <span className="text-[10px]">Plano de 30 Dias Integrado</span>
                  </div>
                  <span className="text-[10px] font-semibold text-sage-800 bg-sage-100 px-2 py-0.5 rounded-md">
                    Relatório Completo
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
