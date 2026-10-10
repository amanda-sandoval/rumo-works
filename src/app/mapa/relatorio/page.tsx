'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FullReportData,
  DimensionId,
  ActionPlanItem,
  MotivatorGap,
} from '@/lib/mapa/types';
import {
  Compass,
  Printer,
  Share2,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  HelpCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  CalendarCheck2,
  Bookmark,
  ExternalLink,
  Copy,
  Check,
  Lock,
} from 'lucide-react';
import { Suspense } from 'react';

function RelatorioCompletoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [report, setReport] = useState<FullReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de Interatividade
  const [activeDimension, setActiveDimension] = useState<DimensionId | null>(null);
  const [actionProgress, setActionProgress] = useState<Record<string, { status: string; notes?: string }>>({});
  const [copiedLink, setCopiedLink] = useState(false);
  const [filterWeek, setFilterWeek] = useState<number | 'all'>('all');

  useEffect(() => {
    async function fetchReport() {
      try {
        let sId = searchParams.get('session_id');
        let token = searchParams.get('token');

        if (!sId || !token) {
          const saved = localStorage.getItem('mapa_rumo_session');
          if (saved) {
            const parsed = JSON.parse(saved);
            sId = parsed.id;
            token = parsed.accessToken;
          }
        }

        if (!sId || !token) {
          setError('Sessão não identificada. Por favor, acesse através do link do seu diagnóstico.');
          setLoading(false);
          return;
        }

        // Verificar autorização estrita no servidor
        const res = await fetch('/api/mapa/verify-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sId, accessToken: token }),
        });

        const data = await res.json();
        if (res.ok && data.isUnlocked && data.report) {
          setReport(data.report);

          // Buscar progresso salvo das ações do plano
          try {
            const progRes = await fetch(`/api/mapa/action-progress?sessionId=${sId}&token=${token}`);
            const progData = await progRes.json();
            if (progData.progress) {
              setActionProgress(progData.progress);
            }
          } catch {
            // ignore
          }
        } else {
          // Não autorizado: redireciona para a página de oferta
          router.push('/mapa/oferta');
        }
      } catch (err) {
        console.error('Erro ao verificar relatório:', err);
        setError('Não foi possível carregar o relatório no momento.');
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [searchParams, router]);

  // Atualizar status de uma ação no plano de 30 dias
  const handleToggleActionStatus = async (actionId: string, currentStatus: string) => {
    if (!report) return;
    const nextStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    const updated = {
      ...actionProgress,
      [actionId]: {
        ...actionProgress[actionId],
        status: nextStatus,
      },
    };
    setActionProgress(updated);

    try {
      await fetch('/api/mapa/action-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: report.sessionId,
          accessToken: report.accessToken,
          actionId,
          status: nextStatus,
        }),
      });
    } catch (err) {
      console.error('Erro ao salvar progresso:', err);
    }
  };

  const handleUpdateNotes = async (actionId: string, notesText: string) => {
    if (!report) return;
    const updated = {
      ...actionProgress,
      [actionId]: {
        ...actionProgress[actionId],
        notes: notesText,
        status: actionProgress[actionId]?.status || 'PENDING',
      },
    };
    setActionProgress(updated);

    try {
      await fetch('/api/mapa/action-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: report.sessionId,
          accessToken: report.accessToken,
          actionId,
          status: updated[actionId].status,
          notes: notesText,
        }),
      });
    } catch (err) {
      console.error('Erro ao salvar anotação:', err);
    }
  };

  const handleCopyShareLink = () => {
    if (!report) return;
    const url = `${window.location.origin}/mapa/relatorio?session_id=${report.sessionId}&token=${report.accessToken}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-28 text-center">
        <div className="inline-block w-8 h-8 border-3 border-cobalt-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-charcoal-400">
          Carregando seu Mapa Rumo Completo...
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="py-20 max-w-md mx-auto text-center px-4">
        <p className="text-sm text-charcoal-400 mb-6">{error || 'Acesso não liberado.'}</p>
        <button
          onClick={() => router.push('/mapa/oferta')}
          className="px-6 py-3 rounded-xl bg-cobalt-500 text-white text-xs font-semibold shadow-xs"
        >
          Ir para a Página de Oferta e Acesso
        </button>
      </div>
    );
  }

  // Dados para o Radar SVG
  const radarData = report.radarData;
  const cx = 160;
  const cy = 160;
  const r = 100;
  const numAxes = radarData.length;

  const getCoordinates = (index: number, val: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / numAxes;
    const distance = (val / 100) * r;
    const x = cx + distance * Math.cos(angle);
    const y = cy + distance * Math.sin(angle);
    return { x, y };
  };

  const polygonPoints = radarData
    .map((item, idx) => {
      const { x, y } = getCoordinates(idx, item.score);
      return `${x},${y}`;
    })
    .join(' ');

  const filteredActionPlan = filterWeek === 'all'
    ? report.actionPlan
    : report.actionPlan.filter((a) => a.week === filterWeek);

  const completedActionsCount = Object.values(actionProgress).filter((p) => p.status === 'COMPLETED').length;

  return (
    <div className="py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto print:p-0 print:max-w-none">
      {/* Barra de Ações do Relatório (Imprimir / Compartilhar) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-borderWarm print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-cobalt-100 text-cobalt-700">
            Relatório Completo Autorizado
          </span>
          <span className="text-xs text-charcoal-200">
            Gerado em {new Date(report.generatedAt).toLocaleDateString('pt-BR')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border border-borderWarm bg-white hover:bg-ivory-100 text-charcoal-400 transition-all shadow-2xs"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-sage-800" />
                <span className="text-sage-800">Link copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar link de acesso</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cobalt-500 hover:bg-cobalt-600 text-white transition-all shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Exportar PDF / Imprimir</span>
          </button>
        </div>
      </div>

      {/* 11.1 ABERTURA: SEU MAPA RUMO */}
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cobalt-50 text-cobalt-700 border border-cobalt-200 mb-4">
          <Compass className="w-3.5 h-3.5 text-cobalt-500" />
          <span>Diagnóstico & Plano Pessoal de 30 Dias</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-charcoal-500 tracking-tight leading-[1.15] mb-4">
          {report.participantName ? `Mapa Rumo de ${report.participantName}` : 'Seu Mapa Rumo'}
        </h1>

        <p className="text-sm sm:text-base text-charcoal-300 leading-relaxed max-w-3xl">
          Este documento sintetiza suas motivações declaradas, padrões autorrelatados de trabalho, tensões de valores e um roteiro estruturado em 4 semanas para orientar experimentos conscientes na sua rotina profissional.
        </p>
      </header>

      {/* 11.2 PAINEL PRINCIPAL: RADAR INTERATIVO DAS 5 DIMENSÕES */}
      <section className="bg-white rounded-3xl border border-borderWarm p-6 sm:p-10 shadow-xl mb-14 page-break-inside-avoid">
        <div className="border-b border-borderWarm pb-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal-500">
              Painel Integrado das Cinco Dimensões
            </h2>
            <p className="text-xs text-charcoal-200">
              Clique nos vértices ou nas barras para detalhar a evidência de cada dimensão.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-cobalt-600 bg-cobalt-50 px-2.5 py-1 rounded-full border border-cobalt-200 self-start sm:self-auto">
            Metodologia Rumo Works
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Radar Gráfico SVG */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px]">
              <svg viewBox="0 0 320 320" className="w-full h-full overflow-visible">
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, i) => (
                  <polygon
                    key={i}
                    points={radarData
                      .map((_, idx) => {
                        const { x, y } = getCoordinates(idx, level * 100);
                        return `${x},${y}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#E7E2D9"
                    strokeWidth={level === 1 ? '1.5' : '1'}
                    strokeDasharray={level === 1 ? 'none' : '2 3'}
                  />
                ))}

                {radarData.map((_, idx) => {
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

                <polygon
                  points={polygonPoints}
                  fill="rgba(36, 76, 232, 0.2)"
                  stroke="#244CE8"
                  strokeWidth="2.5"
                />

                {radarData.map((item, idx) => {
                  const { x, y } = getCoordinates(idx, item.score);
                  const isFocused = activeDimension === item.dimensionKey;
                  return (
                    <g key={idx} className="cursor-pointer" onClick={() => setActiveDimension(item.dimensionKey)}>
                      <circle
                        cx={x}
                        cy={y}
                        r={isFocused ? 7 : 5}
                        fill="#244CE8"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
            <p className="text-[11px] text-charcoal-200 mt-2">
              Clique nas dimensões para focar na análise correspondente
            </p>
          </div>

          {/* Barras Interativas com Detalhes */}
          <div className="lg:col-span-6 space-y-3">
            {radarData.map((item) => {
              const isSelected = activeDimension === item.dimensionKey;
              const dimObj = (report.scores as any)[item.dimensionKey];

              return (
                <div
                  key={item.dimensionKey}
                  onClick={() => setActiveDimension(isSelected ? null : item.dimensionKey)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-cobalt-500 bg-cobalt-50/70 shadow-xs'
                      : 'border-borderWarm/80 bg-ivory-50/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-charcoal-500">{item.dimension}</span>
                    <span className="font-mono font-bold text-cobalt-600">{item.score}/100</span>
                  </div>
                  <div className="w-full bg-borderWarm h-2 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-cobalt-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  {isSelected && (
                    <p className="text-[11px] text-charcoal-300 mt-2 pt-2 border-t border-cobalt-200/60 animate-fadeIn">
                      {dimObj?.summary} • Nível diagnosticado: <strong className="uppercase">{dimObj?.level?.replace('_', ' ')}</strong>.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* PÍLULAS DE DIAGNÓSTICO CALCULADAS */}
        <div className="mt-8 pt-8 border-t border-borderWarm">
          <h3 className="font-serif text-sm font-semibold text-charcoal-500 mb-3">
            Pílulas de Diagnóstico Identificadas:
          </h3>
          <div className="flex flex-wrap gap-2">
            {report.pills.map((pill) => (
              <span
                key={pill.id}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border bg-ivory-50 text-charcoal-500 border-borderWarm"
                title={pill.description}
              >
                {pill.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 11.4 SEUS MOTIVADORES: MATRIZ DE FRICÇÃO (IMPORTÂNCIA VS SATISFAÇÃO) */}
      <section className="mb-14 page-break-inside-avoid">
        <div className="mb-6">
          <h2 className="font-serif text-2xl font-semibold text-charcoal-500 mb-1">
            Seus Motivadores e Gaps de Satisfação
          </h2>
          <p className="text-xs text-charcoal-200">
            Comparação pareada entre a relevância de cada dimensão e a sua realização prática no dia a dia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.gaps.map((gap) => {
            const isFriccao = gap.status === 'friccao_critica';
            const isAlinhado = gap.status === 'alinhado';

            return (
              <div
                key={gap.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isFriccao
                    ? 'border-terracotta-300 bg-terracotta-50/40'
                    : isAlinhado
                    ? 'border-sage-300 bg-sage-50/40'
                    : 'border-borderWarm bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-charcoal-500">{gap.label}</h3>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isFriccao
                        ? 'bg-terracotta-100 text-terracotta-700'
                        : isAlinhado
                        ? 'bg-sage-100 text-sage-800'
                        : 'bg-ivory-100 text-charcoal-300'
                    }`}
                  >
                    {isFriccao ? 'Tensão de Energia' : isAlinhado ? 'Fortaleza Nutrida' : 'Em Equilíbrio'}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-xs text-charcoal-300 my-2">
                  <div>
                    Importância: <strong className="text-cobalt-600">{gap.importance}/5</strong>
                  </div>
                  <div>
                    Satisfação: <strong className="text-sage-800">{gap.satisfaction}/5</strong>
                  </div>
                  <div>
                    Gap: <strong className="font-mono">{gap.gap > 0 ? `+${gap.gap}` : gap.gap}</strong>
                  </div>
                </div>

                <p className="text-xs text-charcoal-300 mt-2 leading-relaxed">
                  {gap.insight}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 11.3 COMO VOCÊ FUNCIONA NO TRABALHO: OBSERVAÇÕES ANALÍTICAS EM PROFUNDIDADE */}
      <section className="mb-14">
        <div className="mb-6">
          <h2 className="font-serif text-2xl font-semibold text-charcoal-500 mb-1">
            Como Você Funciona no Trabalho
          </h2>
          <p className="text-xs text-charcoal-200">
            Análises interpretativas rastreáveis diretamente às suas respostas.
          </p>
        </div>

        <div className="space-y-6">
          {report.observations.map((obs) => (
            <div
              key={obs.id}
              className="p-7 rounded-3xl bg-white border border-borderWarm shadow-xs space-y-4 page-break-inside-avoid"
            >
              <h3 className="font-serif text-lg sm:text-xl font-semibold text-charcoal-500">
                {obs.title}
              </h3>

              <p className="text-xs sm:text-sm text-charcoal-300 leading-relaxed">
                {obs.narrative}
              </p>

              <div className="p-3.5 rounded-xl bg-ivory-50 border border-borderWarm text-xs text-charcoal-400">
                <strong className="text-cobalt-600 font-semibold block mb-0.5">Evidência Identificada:</strong>
                {obs.evidence}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-ivory-100/60 border border-borderWarm/70 text-xs">
                  <span className="font-bold uppercase tracking-wider text-charcoal-500 block mb-1">
                    Pergunta para Reflexão
                  </span>
                  <p className="italic text-charcoal-400 leading-relaxed">"{obs.reflectionQuestion}"</p>
                </div>

                <div className="p-4 rounded-xl bg-cobalt-50/50 border border-cobalt-200/60 text-xs">
                  <span className="font-bold uppercase tracking-wider text-cobalt-700 block mb-1">
                    Experimento Sugerido
                  </span>
                  <p className="text-charcoal-400 leading-relaxed">{obs.suggestedExperiment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11.8 SÍNTESE: O QUE VALE EXPLORAR AGORA (3 PRIORIDADES CRUZADAS) */}
      <section className="mb-14 page-break-inside-avoid">
        <div className="mb-6">
          <h2 className="font-serif text-2xl font-semibold text-charcoal-500 mb-1">
            Síntese: Três Prioridades Estratégicas
          </h2>
          <p className="text-xs text-charcoal-200">
            Cruzamento entre seus recursos, suas fricções e seus objetivos para o próximo ciclo.
          </p>
        </div>

        <div className="space-y-4">
          {report.priorities.map((p, idx) => (
            <div
              key={p.id}
              className="p-6 rounded-2xl bg-white border border-borderWarm shadow-xs flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-xl bg-cobalt-500 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-1">
                0{idx + 1}
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-base font-semibold text-charcoal-500">{p.title}</h3>
                <p className="text-xs text-charcoal-300 leading-relaxed">
                  <strong>Padrão Observado:</strong> {p.observed}
                </p>
                <p className="text-xs text-charcoal-300 leading-relaxed">
                  <strong>Hipótese de Trabalho:</strong> {p.hypothesis}
                </p>
                <div className="p-3 rounded-xl bg-ivory-50 border border-borderWarm text-xs text-charcoal-500">
                  <strong className="text-cobalt-600 block mb-0.5">Micro-Ação Recomendada:</strong>
                  {p.concreteAction}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11.9 MEU PRÓXIMO CAPÍTULO: PLANO DE 30 DIAS (INTERATIVO) */}
      <section className="bg-white rounded-3xl border border-borderWarm p-6 sm:p-10 shadow-xl mb-14 page-break-inside-avoid">
        <div className="border-b border-borderWarm pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cobalt-50 text-cobalt-700 border border-cobalt-200 mb-2">
              <CalendarCheck2 className="w-3.5 h-3.5 text-cobalt-500" />
              <span>Plano Personalizado em 4 Semanas</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal-500">
              Seu Roteiro Prático de 30 Dias
            </h2>
            <p className="text-xs text-charcoal-200 mt-1">
              {completedActionsCount} de {report.actionPlan.length} ações concluídas
            </p>
          </div>

          {/* Filtro por Semana */}
          <div className="flex items-center gap-1.5 p-1 bg-ivory-100 rounded-xl border border-borderWarm self-start sm:self-auto print:hidden">
            <button
              type="button"
              onClick={() => setFilterWeek('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterWeek === 'all' ? 'bg-white text-cobalt-600 shadow-2xs' : 'text-charcoal-300'
              }`}
            >
              Todas
            </button>
            {[1, 2, 3, 4].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setFilterWeek(w)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterWeek === w ? 'bg-white text-cobalt-600 shadow-2xs' : 'text-charcoal-300'
                }`}
              >
                Sem {w}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Ações das 4 Semanas */}
        <div className="space-y-6">
          {filteredActionPlan.map((action) => {
            const currentProg = actionProgress[action.id] || { status: 'PENDING', notes: '' };
            const isDone = currentProg.status === 'COMPLETED';

            return (
              <div
                key={action.id}
                className={`p-6 rounded-2xl border transition-all ${
                  isDone
                    ? 'border-sage-300 bg-sage-50/30'
                    : 'border-borderWarm bg-white hover:border-borderWarm/90'
                }`}
              >
                {/* Cabeçalho da Ação com Checkbox Interativo */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActionStatus(action.id, currentProg.status)}
                      className="mt-0.5 text-charcoal-300 hover:text-sage-800 transition-colors focus:outline-none print:hidden"
                      title={isDone ? 'Marcar como pendente' : 'Marcar como concluído'}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-sage-800" />
                      ) : (
                        <Circle className="w-5 h-5 text-charcoal-200" />
                      )}
                    </button>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cobalt-600 block mb-1">
                        {action.stageName} • ~{action.estimatedMinutes} min
                      </span>
                      <h3
                        className={`font-serif text-base sm:text-lg font-semibold leading-snug ${
                          isDone ? 'line-through text-charcoal-300' : 'text-charcoal-500'
                        }`}
                      >
                        {action.title}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 ${
                      isDone ? 'bg-sage-100 text-sage-800' : 'bg-ivory-100 text-charcoal-300'
                    }`}
                  >
                    {isDone ? 'Concluída' : 'Pendente'}
                  </span>
                </div>

                <p className="text-xs text-charcoal-300 leading-relaxed mb-4 pl-8">
                  {action.customRationale}
                </p>

                {/* Passo a Passo */}
                <div className="pl-8 mb-4">
                  <span className="text-[11px] font-bold text-charcoal-500 block mb-1.5">
                    Como executar:
                  </span>
                  <ul className="space-y-1 text-xs text-charcoal-300 list-disc list-inside">
                    {action.instructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ul>
                </div>

                {/* Critério e Pergunta de Reflexão */}
                <div className="pl-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
                  <div className="p-3 rounded-xl bg-ivory-50 border border-borderWarm/70">
                    <strong className="block text-[10px] uppercase font-bold text-charcoal-400 mb-0.5">
                      Resultado Esperado:
                    </strong>
                    <span className="text-charcoal-300">{action.expectedOutcome}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-ivory-50 border border-borderWarm/70">
                    <strong className="block text-[10px] uppercase font-bold text-charcoal-400 mb-0.5">
                      Pergunta de Fechamento:
                    </strong>
                    <span className="italic text-charcoal-300">"{action.reflectionQuestion}"</span>
                  </div>
                </div>

                {/* Campo de Anotações do Participante */}
                <div className="pl-8 print:hidden">
                  <label htmlFor={`notes-${action.id}`} className="block text-[11px] font-medium text-charcoal-300 mb-1">
                    Suas observações / aprendizados desta micro-ação:
                  </label>
                  <textarea
                    id={`notes-${action.id}`}
                    rows={2}
                    value={currentProg.notes || ''}
                    onChange={(e) => handleUpdateNotes(action.id, e.target.value)}
                    placeholder="Registre o que você sentiu ou observou ao praticar esta ação..."
                    className="w-full p-3 rounded-xl border border-borderWarm text-xs text-charcoal-500 bg-ivory-50 focus:border-cobalt-500 outline-none resize-none transition-all"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 11.10 ENCERRAMENTO E RITUAL DE 30 DIAS */}
      <footer className="p-8 rounded-3xl bg-gradient-to-br from-charcoal-500 to-charcoal-600 text-white shadow-xl text-center page-break-inside-avoid">
        <Sparkles className="w-8 h-8 text-warmCream mx-auto mb-3" />
        <h2 className="font-serif text-2xl font-semibold text-white mb-2">
          O Ponto de Partida para a Sua Próxima Fase
        </h2>
        <p className="text-xs sm:text-sm text-ivory-200 max-w-xl mx-auto leading-relaxed mb-6">
          O desenvolvimento profissional sustentável não nasce de promessas mágicas, mas da repetição deliberada de pequenas escolhas conscientes.
        </p>

        <div className="inline-block p-4 rounded-2xl bg-white/10 border border-white/15 text-xs text-warmCream mb-8 max-w-lg">
          <strong>Pergunta para revisitar ao término dos 30 dias:</strong>
          <p className="italic mt-1 text-white">
            "Qual pequena mudança na sua rotina profissional fez você se sentir mais no comando da sua própria trajetória?"
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold bg-white text-charcoal-500 hover:bg-ivory-50 transition-all shadow-sm"
          >
            Exportar como PDF
          </button>
          <button
            type="button"
            onClick={handleCopyShareLink}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20"
          >
            {copiedLink ? 'Link copiado!' : 'Salvar Link Deste Relatório'}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function RelatorioCompletoPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-3 border-cobalt-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs font-semibold text-charcoal-400">Carregando relatório...</p>
        </div>
      }
    >
      <RelatorioCompletoContent />
    </Suspense>
  );
}
