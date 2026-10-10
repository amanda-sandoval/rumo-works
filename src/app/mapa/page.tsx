'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Compass,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  CalendarCheck2,
  RotateCcw,
  ShieldCheck,
  FileText,
  Clock,
  KeyRound,
  Check,
  Minus,
} from 'lucide-react';

const AUTHORIZED_TESTER_CODES = [
  'TESTE-VIP-2026',
];

function MapaLandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [hasExistingSession, setHasExistingSession] = useState(false);
  const [existingStage, setExistingStage] = useState(1);
  const [hasCompletedFree, setHasCompletedFree] = useState(false);
  const [hasCompletedFull, setHasCompletedFull] = useState(false);
  const [startingMode, setStartingMode] = useState<'free' | 'complete' | null>(null);

  // Checar se já existe sessão ou respostas salvas
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mapa_rumo_session');
      const answers = localStorage.getItem('mapa_rumo_answers');
      const result = localStorage.getItem('mapa_rumo_result');

      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.id) {
          setHasExistingSession(true);
          setExistingStage(parsed.currentStage || 1);
        }
      }

      if (answers) {
        const parsedAnswers = JSON.parse(answers);
        const keys = Object.keys(parsedAnswers);
        const answeredStage3 = keys.some((k) => k.startsWith('e3_'));
        const answeredStage6 = keys.some((k) => k.startsWith('e6_'));

        if (answeredStage6 || (result && JSON.parse(result).report)) {
          setHasCompletedFull(true);
          setHasCompletedFree(true);
        } else if (answeredStage3 || (result && JSON.parse(result).preview)) {
          setHasCompletedFree(true);
        }
      }
    } catch {
      // ignore
    }
  }, [searchParams]);

  // Função de início sem bloqueio
  const handleStart = (mode: 'free' | 'complete') => {
    setStartingMode(mode);

    // Se usuário já completou e clica na mesma opção ou quer ir direto
    if (mode === 'free' && hasCompletedFree) {
      window.location.href = '/mapa/previa';
      return;
    }

    if (mode === 'complete') {
      if (hasCompletedFull) {
        window.location.href = '/mapa/relatorio';
        return;
      }
      if (hasCompletedFree) {
        // Se já completou as 3 primeiras (gratuita), continua da etapa 4 sem refazer!
        window.location.href = '/mapa/questionario?plan=complete&stage=4';
        return;
      }
    }

    // Início padrão direcionado pelo plano
    window.location.href = `/mapa/questionario?plan=${mode}`;
  };

  const handleResume = () => {
    window.location.href = `/mapa/questionario?stage=${existingStage}`;
  };

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Título de Abertura Editorial */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sage-100 text-sage-800 border border-sage-200/80 mb-5 shadow-2xs">
          <Compass className="w-3.5 h-3.5 text-sage-700" />
          <span>Diagnóstico de Autoconhecimento Profissional • Rumo Works</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-charcoal-500 tracking-tight leading-[1.14] mb-5">
          Entenda como você funciona no trabalho, o que importa para você e seus próximos passos.
        </h1>

        <p className="text-base sm:text-lg text-charcoal-200 leading-relaxed max-w-2xl mx-auto">
          Uma experiência estruturada para investigar suas fontes de energia, padrões de ambiente, relação com limites e prioridades práticas de evolução profissional.
        </p>
      </div>

      {/* Alerta de Continuação se já houver sessão ativa com respostas salvas */}
      {hasExistingSession && (
        <div className="mb-10 p-5 rounded-2xl bg-white border border-sage-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-charcoal-500">
                Respostas memorizadas no seu navegador
              </p>
              <p className="text-xs text-charcoal-200">
                {hasCompletedFull
                  ? 'Você já respondeu às 6 etapas completas.'
                  : hasCompletedFree
                  ? 'Você já completou as 3 primeiras etapas (Diagnóstico Gratuito). Pode continuar para o Plano Completo sem refazê-las.'
                  : `Seu progresso está salvo na Etapa ${existingStage}.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={hasCompletedFull ? () => (window.location.href = '/mapa/relatorio') : hasCompletedFree ? () => (window.location.href = '/mapa/previa') : handleResume}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-sage-800 hover:bg-sage-900 text-white shadow-xs transition-all shrink-0"
          >
            {hasCompletedFull ? 'Ver Relatório Completo →' : hasCompletedFree ? 'Ver Prévia Gratuita →' : 'Continuar de onde parei →'}
          </button>
        </div>
      )}

      {/* OS DOIS CARDS DESTACADOS LADO A LADO PARA TOMADA DE AÇÃO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 items-stretch">
        {/* CARD 1: MAPA RUMO GRATUITO */}
        <div className="bg-white rounded-3xl border-2 border-borderWarm p-7 sm:p-8 flex flex-col justify-between shadow-md hover:border-sage-300 transition-all hover:shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-ivory-100 text-charcoal-400 border border-borderWarm">
                Diagnóstico Essencial
              </span>
              <span className="text-xs font-medium text-charcoal-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                ~5 min (3 Dimensões)
              </span>
            </div>

            <h2 className="font-serif text-2xl font-semibold text-charcoal-500 mb-2">
              Mapa Rumo Gratuito
            </h2>

            <p className="text-xs sm:text-sm text-charcoal-300 leading-relaxed mb-6">
              Investigação inicial focada nas <strong>3 dimensões fundamentais</strong> de energia e rotina profissional, com diagnóstico objetivo e imediato.
            </p>

            {/* Preço Zero */}
            <div className="mb-6 pb-6 border-b border-borderWarm/70">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-serif font-bold text-charcoal-500">R$ 0</span>
                <span className="text-xs text-charcoal-200 ml-1">/ acesso gratuito</span>
              </div>
              <p className="text-[11px] text-charcoal-200 mt-1">
                Sem cartão de crédito • Acesso imediato
              </p>
            </div>

            {/* Lista de Recursos */}
            <ul className="space-y-3 text-xs text-charcoal-300 mb-8">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
                <span><strong>3 Dimensões avaliadas:</strong> Motivação & Energia, Ambiente & Estrutura e Valores & Limites</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
                <span>Questionário reduzido em 3 etapas objetivas (~5 min)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
                <span>Gráfico de Radar visual das 3 dimensões calculadas</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
                <span>3 Primeiras descobertas personalizadas com evidências</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
                <span>1 Pergunta reflexiva profunda e sugestão de ação inicial</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleStart('free')}
            disabled={startingMode !== null}
            className="w-full py-4 rounded-xl text-sm font-semibold bg-white hover:bg-ivory-100 text-charcoal-500 border-2 border-charcoal-500 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] shadow-xs hover:shadow-sm"
          >
            <span>
              {startingMode === 'free'
                ? 'Abrindo diagnóstico...'
                : hasCompletedFree
                ? 'Ver Minha Prévia Gratuita'
                : 'Iniciar Diagnóstico Gratuito'}
            </span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* CARD 2: MAPA RUMO COMPLETO (DESTAQUE PREMIUM) */}
        <div className="bg-gradient-to-br from-[#243A2F] via-[#2E473B] to-[#1E3228] text-white rounded-3xl border-2 border-sage-600 p-7 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Badge Decorativa */}
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#FFF4E7] text-[#1A1816] border border-[#E7D6BE] shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#E6531B]" />
              <span className="text-[#1A1816] font-bold">Recomendado</span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-ivory-100 border border-white/15">
                Experiência Completa
              </span>
              <span className="text-xs text-ivory-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                ~12 a 15 min (5 Dimensões)
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white mb-2">
              Mapa Rumo Completo
            </h2>

            <p className="text-xs sm:text-sm text-ivory-200 leading-relaxed mb-6">
              Diagnóstico aprofundado em <strong>5 dimensões integradas</strong>, análise de fricções, tensões de valores e <strong>Plano Pessoal de 30 Dias</strong> estruturado em 4 semanas.
            </p>

            {/* Preço de R$ 67,00 */}
            <div className="mb-6 pb-6 border-b border-white/15">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-serif font-bold text-white">R$ 67,00</span>
                <span className="text-xs text-ivory-200 ml-1">/ pagamento único</span>
              </div>
              <p className="text-[11px] text-ivory-300 mt-1">
                Acesso permanente • Garantia de 7 dias
              </p>
            </div>

            {/* Lista de Recursos Completos */}
            <ul className="space-y-3 text-xs text-ivory-100 mb-8">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-warmCream shrink-0 mt-0.5" />
                <span><strong>5 Dimensões integradas:</strong> Motivação, Ambiente, Valores, Colaboração e Desenvolvimento</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-warmCream shrink-0 mt-0.5" />
                <span>Questionário analítico completo em 6 etapas estruturadas</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-warmCream shrink-0 mt-0.5" />
                <span><strong>Matriz de Fricções:</strong> Importância vs. Satisfação em 10 motivadores de energia</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-warmCream shrink-0 mt-0.5" />
                <span>Pílulas diagnósticas e síntese de 3 prioridades estratégicas cruzadas com evidências</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CalendarCheck2 className="w-4 h-4 text-warmCream shrink-0 mt-0.5" />
                <span><strong>Plano de 30 Dias:</strong> 4 semanas de micro-ações práticas com checklist interativo e notas</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-warmCream shrink-0 mt-0.5" />
                <span>Layout A4 editorial formatado para exportação em PDF e impressão</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleStart('complete')}
            disabled={startingMode !== null}
            className="w-full py-4 rounded-xl text-sm font-bold bg-white hover:bg-[#F9F6F0] text-[#1A1816] transition-all flex items-center justify-center gap-2 group active:scale-[0.98] shadow-lg hover:shadow-xl cursor-pointer"
          >
            <span className="text-[#1A1816] font-bold">
              {startingMode === 'complete'
                ? 'Abrindo versão completa...'
                : hasCompletedFull
                ? 'Ver Relatório Completo'
                : hasCompletedFree
                ? 'Completar para o Plano de 30 Dias'
                : 'Iniciar Diagnóstico Completo'}
            </span>
            <ArrowRight className="w-4 h-4 text-[#1A1816] transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* SESSÃO MAIS ABAIXO: O QUE ESTÁ INCLUÍDO NO SEU ACESSO (COMPARATIVO TRANSPARENTE) */}
      <section className="bg-white rounded-3xl border border-borderWarm p-6 sm:p-10 shadow-lg mb-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sage-800 bg-sage-100 px-3 py-1 rounded-full border border-sage-200">
            Comparativo Detalhado
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal-500 mt-3 mb-2">
            O que está incluído no seu acesso
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-200">
            Transparência total para você escolher a profundidade adequada para o seu momento.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-borderWarm text-charcoal-400">
                <th className="py-3.5 px-4 font-semibold">Conteúdo e Funcionalidade</th>
                <th className="py-3.5 px-4 font-semibold text-center w-36">Mapa Gratuito</th>
                <th className="py-3.5 px-4 font-semibold text-center w-44 bg-sage-50/60 rounded-t-xl text-sage-900">
                  Mapa Completo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderWarm/60 text-charcoal-300">
              <tr>
                <td className="py-3.5 px-4 font-medium text-charcoal-500">Dimensões investigadas</td>
                <td className="py-3.5 px-4 text-center font-semibold text-sage-800">3 Dimensões</td>
                <td className="py-3.5 px-4 text-center bg-sage-50/30 font-semibold text-sage-950">5 Dimensões Integradas</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4">Etapas do questionário</td>
                <td className="py-3.5 px-4 text-center text-xs text-charcoal-400">3 Etapas (~5 min)</td>
                <td className="py-3.5 px-4 text-center bg-sage-50/30 text-xs font-semibold text-sage-900">6 Etapas (~12-15 min)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4">Radar visual dos eixos calculados</td>
                <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-sage-700 mx-auto" /></td>
                <td className="py-3.5 px-4 text-center bg-sage-50/30"><Check className="w-4 h-4 text-sage-700 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3.5 px-4">Descobertas personalizadas com evidências</td>
                <td className="py-3.5 px-4 text-center text-xs text-charcoal-400">3 descobertas</td>
                <td className="py-3.5 px-4 text-center bg-sage-50/30 font-semibold text-sage-900">Diagnóstico Aprofundado</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4">Radar interativo com zoom clicável e detalhamento por eixo</td>
                <td className="py-3.5 px-4 text-center"><Minus className="w-4 h-4 text-charcoal-200 mx-auto" /></td>
                <td className="py-3.5 px-4 text-center bg-sage-50/30"><Check className="w-4 h-4 text-sage-700 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3.5 px-4">Matriz de Gaps: Importância vs Satisfação em 10 motivadores</td>
                <td className="py-3.5 px-4 text-center"><Minus className="w-4 h-4 text-charcoal-200 mx-auto" /></td>
                <td className="py-3.5 px-4 text-center bg-sage-50/30"><Check className="w-4 h-4 text-sage-700 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3.5 px-4">Pílulas de diagnóstico e análise de tensões de valores</td>
                <td className="py-3.5 px-4 text-center"><Minus className="w-4 h-4 text-charcoal-200 mx-auto" /></td>
                <td className="py-3.5 px-4 text-center bg-sage-50/30"><Check className="w-4 h-4 text-sage-700 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3.5 px-4">Síntese cruzada com 3 prioridades estratégicas de ação</td>
                <td className="py-3.5 px-4 text-center"><Minus className="w-4 h-4 text-charcoal-200 mx-auto" /></td>
                <td className="py-3.5 px-4 text-center bg-sage-50/30"><Check className="w-4 h-4 text-sage-700 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-medium text-charcoal-500">Plano de 30 Dias em 4 semanas com micro-ações</td>
                <td className="py-3.5 px-4 text-center"><Minus className="w-4 h-4 text-charcoal-200 mx-auto" /></td>
                <td className="py-3.5 px-4 text-center bg-sage-50/30 font-semibold text-sage-950">Incluso (Checklist + Notas)</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4">Exportação completa em PDF / Layout A4 para impressão</td>
                <td className="py-3.5 px-4 text-center"><Minus className="w-4 h-4 text-charcoal-200 mx-auto" /></td>
                <td className="py-3.5 px-4 text-center bg-sage-50/30"><Check className="w-4 h-4 text-sage-700 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3.5 px-4">Acesso permanente e link recuperável</td>
                <td className="py-3.5 px-4 text-center"><Minus className="w-4 h-4 text-charcoal-200 mx-auto" /></td>
                <td className="py-3.5 px-4 text-center bg-sage-50/30"><Check className="w-4 h-4 text-sage-700 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function MapaLandingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-sage-700 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MapaLandingContent />
    </React.Suspense>
  );
}
