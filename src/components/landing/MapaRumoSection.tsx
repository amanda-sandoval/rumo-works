'use client';

import React from 'react';
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
} from 'lucide-react';

export function MapaRumoSection() {
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
                    <strong className="text-charcoal-500 font-semibold block">Diagnóstico e prévia personalizada gratuitos:</strong>
                    Responda às perguntas no seu ritmo (~12 min) e explore suas primeiras descobertas sem nenhum custo ou cadastro prévio obrigatório.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-borderWarm shadow-2xs">
                  <div className="w-6 h-6 rounded-md bg-cobalt-100 text-cobalt-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Lock className="w-3.5 h-3.5 text-cobalt-600" />
                  </div>
                  <div className="text-xs sm:text-sm text-charcoal-300">
                    <strong className="text-charcoal-500 font-semibold block">Relatório completo e plano de 30 dias:</strong>
                    Aprofundamento pago e opcional para quem deseja o radar completo, análises cruzadas de motivação e roteiro de micro-ações semanais.
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
                Comece gratuitamente. Explore seus resultados. Aprofunde seu mapa quando quiser.
              </p>
            </ScrollReveal>
          </div>

          {/* Coluna da Direita: Mockup Editorial do Relatório */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <ScrollReveal delay={150}>
              <div className="relative w-full max-w-md bg-white border-2 border-charcoal-500/10 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden">
                {/* Faixa decorativa superior com identidade Mapa Rumo */}
                <div className="flex items-center justify-between border-b border-borderWarm pb-4 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cobalt-500 text-white flex items-center justify-center">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-charcoal-500 block leading-tight">
                        Mapa Rumo
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-charcoal-200">
                        Diagnóstico Editorial
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-cobalt-600 bg-cobalt-50 px-2.5 py-1 rounded-full border border-cobalt-200">
                    Prévia Gratuita
                  </span>
                </div>

                {/* Prévia dos Indicadores de Dimensão */}
                <div className="space-y-3 mb-5">
                  <div className="p-3 rounded-xl bg-ivory-100 border border-borderWarm/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-charcoal-500">Motivação & Energia</span>
                      <span className="font-mono font-bold text-cobalt-600">84/100</span>
                    </div>
                    <div className="w-full bg-borderWarm h-2 rounded-full overflow-hidden">
                      <div className="bg-cobalt-500 h-full rounded-full w-[84%]" />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-ivory-100 border border-borderWarm/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-charcoal-500">Ambiente & Estrutura</span>
                      <span className="font-mono font-bold text-terracotta-600">76/100</span>
                    </div>
                    <div className="w-full bg-borderWarm h-2 rounded-full overflow-hidden">
                      <div className="bg-terracotta-500 h-full rounded-full w-[76%]" />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-ivory-100 border border-borderWarm/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-charcoal-500">Valores & Limites</span>
                      <span className="font-mono font-bold text-sage-800">68/100</span>
                    </div>
                    <div className="w-full bg-borderWarm h-2 rounded-full overflow-hidden">
                      <div className="bg-sage-700 h-full rounded-full w-[68%]" />
                    </div>
                  </div>
                </div>

                {/* Pílulas Diagnósticas de Amostra */}
                <div className="mb-5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-200 block mb-2">
                    Pílulas de Diagnóstico Calculadas
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-cobalt-50 text-cobalt-700 border border-cobalt-200">
                      ⚡ Autonomia com Propósito
                    </span>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-terracotta-50 text-terracotta-700 border border-terracotta-200">
                      ⚖️ Tensão: Foco vs Urgências
                    </span>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-sage-50 text-sage-800 border border-sage-200">
                      🌱 Aprendizado em Expansão
                    </span>
                  </div>
                </div>

                {/* Cartão de Amostra do Plano de 30 Dias */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-charcoal-500 to-charcoal-600 text-white flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <CalendarCheck2 className="w-5 h-5 text-warmCream" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-warmCream/80 block">
                      Incluso no Relatório Completo
                    </span>
                    <span className="text-xs font-semibold text-white block">
                      Plano Personalizado de 30 Dias
                    </span>
                    <span className="text-[11px] text-ivory-200">
                      Micro-ações semanais calibradas com suas respostas
                    </span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
