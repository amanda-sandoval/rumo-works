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
  const [participantInput, setParticipantInput] = useState('');
  const [isTesterDetected, setIsTesterDetected] = useState(false);
  const [startingMode, setStartingMode] = useState<'free' | 'complete' | null>(null);

  // Checar se já existe sessão ou se veio código pela URL
  useEffect(() => {
    try {
      const urlKey = searchParams.get('tester_key') || searchParams.get('key');
      if (urlKey) {
        setParticipantInput(urlKey);
        setIsTesterDetected(true);
      }

      const saved = localStorage.getItem('mapa_rumo_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.id) {
          setHasExistingSession(true);
          setExistingStage(parsed.currentStage || 1);
          if (parsed.participantName) {
            setParticipantInput(parsed.participantName);
          }
        }
      }
    } catch {
      // ignore
    }
  }, [searchParams]);

  // Monitorar digitação do código de teste no campo de nome
  const handleInputChange = (val: string) => {
    setParticipantInput(val);
    const clean = val.trim().toUpperCase();
    if (AUTHORIZED_TESTER_CODES.includes(clean)) {
      setIsTesterDetected(true);
    } else {
      setIsTesterDetected(false);
    }
  };

  // Função robusta e instantânea de início (sem risco de travamento)
  const handleStart = async (mode: 'free' | 'complete') => {
    setStartingMode(mode);

    const isTester =
      isTesterDetected ||
      AUTHORIZED_TESTER_CODES.includes(participantInput.trim().toUpperCase());

    // Nome para exibição (se for código de teste, exibe "Amanda" como cortesia)
    const displayName = isTester
      ? (participantInput.trim().toUpperCase().startsWith('AMANDA') ? 'Amanda' : 'Amanda (Teste)')
      : participantInput.trim() || 'Participante';

    // 1. Criar ou recuperar identificadores da sessão de forma imediata
    let sessionId = 'sess_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    let accessToken = 'tok_' + Math.random().toString(36).substring(2, 12);

    try {
      const existing = localStorage.getItem('mapa_rumo_session');
      if (existing) {
        const parsed = JSON.parse(existing);
        if (parsed.id && parsed.accessToken) {
          sessionId = parsed.id;
          accessToken = parsed.accessToken;
        }
      }
    } catch {
      // ignore
    }

    // 2. Salvar sessão imediatamente no localStorage
    const localSessionData = {
      id: sessionId,
      accessToken: accessToken,
      participantName: displayName,
      currentStage: 1,
      isCompleted: false,
      isUnlocked: isTester ? true : false,
      isTesterMode: isTester,
      targetMode: mode,
    };

    localStorage.setItem('mapa_rumo_session', JSON.stringify(localSessionData));

    // 3. Notificar o servidor em segundo plano (com fallback seguro sem bloquear)
    try {
      fetch('/api/mapa/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          accessToken,
          participantName: displayName,
        }),
      }).catch((err) => console.warn('Sync em segundo plano:', err));

      if (isTester) {
        fetch('/api/mapa/unlock-tester', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            accessToken,
            testerKey: 'TESTE-MAPA-AMANDA',
          }),
        }).catch((err) => console.warn('Unlock tester sync:', err));
      }
    } catch {
      // ignora
    }

    // 4. Redirecionamento instantâneo garantido
    window.location.href = '/mapa/questionario';
  };

  const handleResume = () => {
    window.location.href = '/mapa/questionario';
  };

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Título de Abertura Editorial */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sage-100 text-sage-800 border border-sage-200/80 mb-5 shadow-2xs">
          <Compass className="w-3.5 h-3.5 text-sage-700" />
          <span>Diagnóstico de Autoconhecimento Profissional • Rumo Works</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-charcoal-500 tracking-tight leading-[1.14] mb-5">
          Entenda como você funciona no trabalho, o que importa para você e seus próximos passos.
        </h1>

        <p className="text-base sm:text-lg text-charcoal-200 leading-relaxed max-w-2xl mx-auto">
          Uma experiência estruturada para investigar suas motivações essenciais, padrões de energia, relação com limites e prioridades práticas de evolução.
        </p>
      </div>

      {/* Cartão de Continuação se já houver sessão ativa */}
      {hasExistingSession && (
        <div className="mb-10 p-5 rounded-2xl bg-white border border-sage-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-charcoal-500">
                Você possui um diagnóstico em andamento
              </p>
              <p className="text-xs text-charcoal-200">
                Respostas salvas anteriormente na <strong>Etapa {existingStage} de 6</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResume}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-sage-800 hover:bg-sage-900 text-white shadow-xs transition-all shrink-0"
          >
            Continuar de onde parei →
          </button>
        </div>
      )}

      {/* CAMPO DE NOME (Com Destravamento Oculto para Amanda e Convidados) */}
      <div className="max-w-md mx-auto mb-12">
        <label
          htmlFor="participantInput"
          className="block font-serif text-sm font-semibold text-charcoal-500 mb-1 text-center"
        >
          Como prefere que nos dirijamos a você?{' '}
          <span className="text-xs font-sans font-normal text-charcoal-200">(opcional)</span>
        </label>
        <div className="relative">
          <input
            id="participantInput"
            type="text"
            value={participantInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Ex: Amanda"
            className="w-full px-4 py-3 rounded-xl border border-borderWarm focus:border-sage-700 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal-500 bg-white text-center shadow-xs transition-all"
          />
        </div>

        {/* Notificação Sutil de Modo de Teste Destravado (Invisível para quem não tem o código) */}
        {isTesterDetected ? (
          <p className="text-xs text-sage-800 font-semibold text-center mt-2 flex items-center justify-center gap-1.5 animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-sage-700" />
            <span>Código de teste reconhecido! O relatório completo será liberado para avaliação.</span>
          </p>
        ) : (
          <p className="text-[11px] text-charcoal-200 text-center mt-1.5">
            Usado apenas para personalizar seu diagnóstico. Você pode iniciar sem preencher.
          </p>
        )}
      </div>

      {/* OS DOIS CARDS DESTACADOS LADO A LADO PARA TOMADA DE AÇÃO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 items-stretch">
        {/* CARD 1: MAPA RUMO INICIAL */}
        <div className="bg-white rounded-3xl border-2 border-borderWarm p-7 sm:p-8 flex flex-col justify-between shadow-md hover:border-sage-300 transition-all hover:shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-ivory-100 text-charcoal-400 border border-borderWarm">
                Acesso Inicial
              </span>
              <span className="text-xs font-medium text-charcoal-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                ~12 a 15 min
              </span>
            </div>

            <h2 className="font-serif text-2xl font-semibold text-charcoal-500 mb-2">
              Mapa Rumo Inicial
            </h2>

            <p className="text-xs sm:text-sm text-charcoal-300 leading-relaxed mb-6">
              Diagnóstico inicial de autoconhecimento profissional para descobrir suas fontes de energia e explorar suas primeiras descobertas.
            </p>

            {/* Preço Zero */}
            <div className="mb-6 pb-6 border-b border-borderWarm/70">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-serif font-bold text-charcoal-500">R$ 0</span>
                <span className="text-xs text-charcoal-200 ml-1">/ acesso inicial</span>
              </div>
              <p className="text-[11px] text-charcoal-200 mt-1">
                Sem cartão de crédito • Sem cadastro obrigatório
              </p>
            </div>

            {/* Lista de Recursos */}
            <ul className="space-y-3 text-xs text-charcoal-300 mb-8">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
                <span>Questionário reflexivo completo em 6 etapas</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
                <span>Cálculo real das suas 5 dimensões profissionais (0 a 100)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
                <span>Radar visual integrado do seu padrão atual</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
                <span>3 Primeiras descobertas personalizadas com evidências</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-sage-700 shrink-0 mt-0.5" />
                <span>1 Pergunta reflexiva central e sugestão de ação inicial</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleStart('free')}
            disabled={startingMode !== null}
            className="w-full py-4 rounded-xl text-sm font-semibold bg-white hover:bg-ivory-100 text-charcoal-500 border-2 border-charcoal-500 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] shadow-xs hover:shadow-sm"
          >
            <span>{startingMode === 'free' ? 'Abrindo questionário...' : 'Iniciar Diagnóstico Inicial'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* CARD 2: MAPA RUMO COMPLETO (DESTAQUE PREMIUM) */}
        <div className="bg-gradient-to-br from-[#243A2F] via-[#2E473B] to-[#1E3228] text-white rounded-3xl border-2 border-sage-600 p-7 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Badge Decorativa */}
          <div className="absolute top-4 right-4">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-terracotta-600 text-white px-3 py-1 rounded-full shadow-xs">
              Recomendado
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/15 text-white border border-white/20">
                Relatório Integral + Plano de Ação
              </span>
            </div>

            <h2 className="font-serif text-2xl font-semibold text-white mb-2">
              Mapa Rumo Completo
            </h2>

            <p className="text-xs sm:text-sm text-ivory-100 leading-relaxed mb-6">
              A experiência integral de diagnóstico, análise cruzada de tensões e roteiro prático de 30 dias para orientar sua evolução.
            </p>

            {/* Preço Único */}
            <div className="mb-6 pb-6 border-b border-white/15">
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-ivory-200">R$</span>
                <span className="text-4xl sm:text-5xl font-serif font-bold text-white">67</span>
                <span className="text-xs text-ivory-200">,00</span>
                <span className="text-xs text-ivory-300 ml-2">/ pagamento único</span>
              </div>
              <p className="text-[11px] text-ivory-200 mt-1">
                Sem mensalidade • Sem recorrência • Acesso vitalício ao seu mapa
              </p>
            </div>

            {/* Lista de Recursos Completos */}
            <ul className="space-y-3 text-xs text-ivory-100 mb-8">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-terracotta-400 shrink-0 mt-0.5" />
                <span><strong>Tudo incluído no diagnóstico inicial</strong></span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-terracotta-400 shrink-0 mt-0.5" />
                <span>Radar interativo com zoom clicável por dimensão</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-terracotta-400 shrink-0 mt-0.5" />
                <span><strong>Matriz de Fricções:</strong> Importância vs Satisfação pareadas</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-terracotta-400 shrink-0 mt-0.5" />
                <span>Pílulas de diagnóstico e tensões de valores identificadas</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-terracotta-400 shrink-0 mt-0.5" />
                <span>3 Prioridades estratégicas cruzadas com evidências</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-terracotta-400 shrink-0 mt-0.5" />
                <span><strong>Plano Personalizado de 30 Dias:</strong> 4 semanas com checklist interativo</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-terracotta-400 shrink-0 mt-0.5" />
                <span>Exportação completa em formato PDF editorial para impressão</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() => handleStart('complete')}
            disabled={startingMode !== null}
            className="w-full py-4 rounded-xl text-sm font-semibold bg-white hover:bg-ivory-100 text-sage-900 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            <span>{startingMode === 'complete' ? 'Abrindo questionário...' : (isTesterDetected ? 'Iniciar com Relatório Completo (Teste VIP)' : 'Desbloquear Relatório Completo')}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
                <th className="py-3.5 px-4 font-semibold text-center w-36">Versão Inicial</th>
                <th className="py-3.5 px-4 font-semibold text-center w-44 bg-sage-50/60 rounded-t-xl text-sage-900">
                  Relatório Completo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderWarm/60 text-charcoal-300">
              <tr>
                <td className="py-3.5 px-4">Questionário com 48 itens estruturados em 6 etapas</td>
                <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-sage-700 mx-auto" /></td>
                <td className="py-3.5 px-4 text-center bg-sage-50/30"><Check className="w-4 h-4 text-sage-700 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3.5 px-4">Pontuação calculada das 5 dimensões (0 a 100)</td>
                <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-sage-700 mx-auto" /></td>
                <td className="py-3.5 px-4 text-center bg-sage-50/30"><Check className="w-4 h-4 text-sage-700 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3.5 px-4">Radar visual integrado das dimensões</td>
                <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-sage-700 mx-auto" /></td>
                <td className="py-3.5 px-4 text-center bg-sage-50/30"><Check className="w-4 h-4 text-sage-700 mx-auto" /></td>
              </tr>
              <tr>
                <td className="py-3.5 px-4">Descobertas e observações iniciais com evidências</td>
                <td className="py-3.5 px-4 text-center text-xs text-charcoal-400">3 observações</td>
                <td className="py-3.5 px-4 text-center bg-sage-50/30 font-semibold text-sage-900">Análise Aprofundada</td>
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
                <td className="py-3.5 px-4">Plano de 30 Dias em 4 semanas com micro-ações práticas</td>
                <td className="py-3.5 px-4 text-center"><Minus className="w-4 h-4 text-charcoal-200 mx-auto" /></td>
                <td className="py-3.5 px-4 text-center bg-sage-50/30 font-semibold text-sage-900">Checklist + Notas</td>
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
