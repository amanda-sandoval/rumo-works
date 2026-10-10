'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Target,
  Users,
  Briefcase,
} from 'lucide-react';
import { MentoringInterestForm } from '@/components/landing/MentoringInterestForm';
import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { InterestModal } from '@/components/landing/InterestModal';
import { useState } from 'react';

export default function MentoriaPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-charcoal-500 font-sans antialiased selection:bg-sage-700 selection:text-white">
      {/* Header Oficial Rumo Works */}
      <Header onOpenInterest={() => setModalOpen(true)} />

      <main className="flex-1 w-full py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Hero Editorial da Mentoria */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sage-100 text-sage-800 border border-sage-200/80 mb-5 shadow-2xs">
            <Compass className="w-3.5 h-3.5 text-sage-700" />
            <span>Mentoria Individual Estruturada • Rumo Works</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-charcoal-500 tracking-tight leading-[1.14] mb-5">
            Desenvolvimento profissional conduzido com escuta ativa, rigor analítico e foco em ação.
          </h1>

          <p className="text-base sm:text-lg text-charcoal-200 leading-relaxed max-w-2xl mx-auto mb-8">
            Um espaço seguro e independente para profissionais que desejam compreender seus padrões, organizar decisões complexas de carreira e construir movimentos com clareza intencional.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <a
              href="#formulario"
              className="px-6 py-3.5 rounded-xl bg-sage-800 hover:bg-sage-900 text-white shadow-md transition-all flex items-center gap-2"
            >
              <span>Preencher formulário de interesse</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/mapa"
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-ivory-100 text-charcoal-500 border border-borderWarm shadow-xs transition-all"
            >
              Explorar Diagnóstico Mapa Rumo →
            </Link>
          </div>
        </div>

        {/* Bloco 1: Para quem é e Para quem NÃO é indicada (Transparência Ética) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Para quem é indicada */}
          <div className="bg-white rounded-3xl border border-borderWarm p-7 sm:p-9 shadow-sm">
            <div className="flex items-center gap-2.5 mb-5 text-sage-800">
              <CheckCircle2 className="w-5 h-5 text-sage-700 shrink-0" />
              <h2 className="font-serif text-xl font-semibold text-charcoal-500">
                Para quem a mentoria é indicada
              </h2>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-charcoal-300">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-700 shrink-0 mt-2" />
                <span>
                  <strong>Transição ou consolidação de liderança:</strong> Profissionais que assumiram ou pretendem assumir papéis de maior responsabilidade, gestão de times ou liderança de escopo.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-700 shrink-0 mt-2" />
                <span>
                  <strong>Dilemas de posicionamento e direção:</strong> Quem busca alinhar ambição com ritmo sustentável, definir especialização versus amplitude ou reposicionar sua narrativa profissional.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-700 shrink-0 mt-2" />
                <span>
                  <strong>Construção de autonomia e limites:</strong> Profissionais que enfrentam sobrecarga ou dificuldade em sustentar acordos explícitos e negociar prioridades com lideranças.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-700 shrink-0 mt-2" />
                <span>
                  <strong>Abertura para autorreflexão honesta:</strong> Pessoas dispostas a analisar suas próprias práticas, receber provocações estruturadas e implementar micro-ações deliberadas entre os encontros.
                </span>
              </li>
            </ul>
          </div>

          {/* Para quem NÃO é indicada */}
          <div className="bg-ivory-100/60 rounded-3xl border border-borderWarm/80 p-7 sm:p-9">
            <div className="flex items-center gap-2.5 mb-5 text-charcoal-400">
              <XCircle className="w-5 h-5 text-terracotta-600 shrink-0" />
              <h2 className="font-serif text-xl font-semibold text-charcoal-500">
                Para quem NÃO é indicada
              </h2>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-charcoal-300">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500 shrink-0 mt-2" />
                <span>
                  <strong>Busca por fórmulas mágicas ou atalhos:</strong> A mentoria não fornece receitas prontas nem soluções padronizadas para trajetórias complexas.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500 shrink-0 mt-2" />
                <span>
                  <strong>Promessas de emprego, contratação ou promoção garantida:</strong> Não somos agência de recolocação ou headhunting; o foco é o seu desenvolvimento pessoal e estratégico.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500 shrink-0 mt-2" />
                <span>
                  <strong>Demanda por terapia clínica ou apoio psicológico:</strong> A mentoria trabalha com desenvolvimento de carreira e tomadas de decisão profissional, não substituindo acompanhamento psicoterapêutico.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta-500 shrink-0 mt-2" />
                <span>
                  <strong>Postura exclusivamente passiva:</strong> O processo depende da participação ativa do mentorado em colocar reflexões em prática no seu contexto de trabalho.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bloco 2: Como funciona o Processo */}
        <div className="bg-white rounded-3xl border border-borderWarm p-8 sm:p-12 shadow-sm mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sage-800 bg-sage-100 px-3 py-1 rounded-full border border-sage-200">
              Metodologia de Condução
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal-500 mt-3 mb-2">
              Como funciona o processo de mentoria
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-200">
              Uma jornada deliberada para transformar intenção em clareza prática.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-ivory-50 border border-borderWarm">
              <span className="w-7 h-7 rounded-full bg-sage-100 text-sage-800 text-xs font-bold flex items-center justify-center mb-3">
                01
              </span>
              <h3 className="font-serif text-base font-semibold text-charcoal-500 mb-1.5">
                Primeiro Contato
              </h3>
              <p className="text-xs text-charcoal-300 leading-relaxed">
                Você envia suas informações no formulário. Avaliamos seu momento e alinhamos se a abordagem é a mais adequada antes de qualquer compromisso.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-ivory-50 border border-borderWarm">
              <span className="w-7 h-7 rounded-full bg-sage-100 text-sage-800 text-xs font-bold flex items-center justify-center mb-3">
                02
              </span>
              <h3 className="font-serif text-base font-semibold text-charcoal-500 mb-1.5">
                Definição de Foco
              </h3>
              <p className="text-xs text-charcoal-300 leading-relaxed">
                Mapeamos os objetivos centrais e os critérios de sucesso do processo, utilizando o diagnóstico do Mapa Rumo como insumo analítico estruturado.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-ivory-50 border border-borderWarm">
              <span className="w-7 h-7 rounded-full bg-sage-100 text-sage-800 text-xs font-bold flex items-center justify-center mb-3">
                03
              </span>
              <h3 className="font-serif text-base font-semibold text-charcoal-500 mb-1.5">
                Encontros & Provocações
              </h3>
              <p className="text-xs text-charcoal-300 leading-relaxed">
                Sessões individuais focadas na desconstrução de dilemas, exame de trade-offs e definição de hipóteses de atuação no seu contexto real.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-ivory-50 border border-borderWarm">
              <span className="w-7 h-7 rounded-full bg-sage-100 text-sage-800 text-xs font-bold flex items-center justify-center mb-3">
                04
              </span>
              <h3 className="font-serif text-base font-semibold text-charcoal-500 mb-1.5">
                Planos em Ação
              </h3>
              <p className="text-xs text-charcoal-300 leading-relaxed">
                Micro-ações deliberadas testadas entre as sessões, garantindo que o aprendizado se traduza em progresso observável no dia a dia.
              </p>
            </div>
          </div>
        </div>

        {/* Bloco 3: Formulário Nativo Incorporado (Seção com ID para scroll) */}
        <div id="formulario" className="bg-white rounded-3xl border-2 border-sage-200 p-8 sm:p-12 shadow-xl mb-16 scroll-mt-24">
          <div className="max-w-2xl mx-auto mb-8 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sage-100 text-sage-800 border border-sage-200 mb-3">
              <Compass className="w-3.5 h-3.5 text-sage-700" />
              <span>Inicie sua Conversa</span>
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal-500 tracking-tight mb-2">
              Formulário de Interesse na Mentoria
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-300 leading-relaxed">
              Preencha o formulário abaixo sem sair do site. Seus dados são confidenciais e serão registrados com segurança para avaliação inicial.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <MentoringInterestForm source="pagina_mentoria" />
          </div>
        </div>
      </main>

      {/* Footer Oficial */}
      <Footer onOpenInterest={() => setModalOpen(true)} />

      {/* Modal Suporte */}
      <InterestModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
