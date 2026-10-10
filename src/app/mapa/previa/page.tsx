'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  ArrowRight,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Lock,
  CalendarCheck2,
  Eye,
  FileText,
  BarChart3,
} from 'lucide-react';
import { PreviewData, DimensionId } from '@/lib/mapa/types';

export default function PreviaPage() {
  const router = useRouter();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDimension, setSelectedDimension] = useState<DimensionId | null>(null);
  const [isUnlockedSession, setIsUnlockedSession] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<{ id: string; accessToken: string } | null>(null);

  useEffect(() => {
    async function fetchPreview() {
      try {
        const savedSession = localStorage.getItem('mapa_rumo_session');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.id && parsed.accessToken) {
            const res = await fetch('/api/mapa/verify-access', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: parsed.id,
                accessToken: parsed.accessToken,
                isTesterMode: !!parsed.isTesterMode,
                answers: JSON.parse(localStorage.getItem('mapa_rumo_answers') || '{}'),
              }),
            });

            const data = await res.json();
            if (data.isUnlocked && data.report) {
              setPreviewData({
                sessionId: data.report.sessionId,
                participantName: data.report.participantName,
                scores: data.report.scores,
                radarData: data.report.radarData,
                initialObservations: data.report.observations.slice(0, 3),
                deepReflectionQuestion:
                  data.report.observations[0]?.reflectionQuestion ||
                  'O que torna suas escolhas profissionais verdadeiramente sustentáveis hoje?',
                initialActionSuggestion:
                  data.report.priorities[0]?.concreteAction ||
                  'Reservar 30 minutos na próxima semana para mapear seus focos essenciais.',
                isUnlocked: false,
              });
              setIsUnlockedSession(true);
              setSessionInfo({ id: parsed.id, accessToken: parsed.accessToken });
              setLoading(false);
              return;
            }

            if (data.preview) {
              setPreviewData(data.preview);
              setSessionInfo({ id: parsed.id, accessToken: parsed.accessToken });
              setLoading(false);
              return;
            }
          }
        }

        // Tenta pegar do storage local de contingência
        const localResult = localStorage.getItem('mapa_rumo_result');
        if (localResult) {
          const parsedRes = JSON.parse(localResult);
          if (parsedRes.preview) {
            setPreviewData(parsedRes.preview);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar prévia:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPreview();
  }, [router]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-3 border-cobalt-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-charcoal-400">
          Carregando sua prévia personalizada...
        </p>
      </div>
    );
  }

  // Fallback caso não haja dados calculados
  const scores = previewData?.scores || {
    motivacaoEnergia: { id: 'motivacaoEnergia', name: 'Motivação e Energia', score: 78, level: 'estruturado', summary: 'Fontes de realização e vigor.', sufficiency: 'alta' },
    ambienteTrabalho: { id: 'ambienteTrabalho', name: 'Ambiente e Estrutura', score: 72, level: 'estruturado', summary: 'Autonomia e ritmo sustentável.', sufficiency: 'alta' },
    valoresLimites: { id: 'valoresLimites', name: 'Valores e Limites', score: 64, level: 'estruturado', summary: 'Preservação de limites essenciais.', sufficiency: 'alta' },
    colaboracaoComunicacao: { id: 'colaboracaoComunicacao', name: 'Colaboração e Comunicação', score: 81, level: 'destaque', summary: 'Assertividade e diálogo com outros.', sufficiency: 'alta' },
    desenvolvimentoFuturo: { id: 'desenvolvimentoFuturo', name: 'Desenvolvimento e Próximos Passos', score: 85, level: 'destaque', summary: 'Clareza de direção e evolução.', sufficiency: 'alta' },
  };

  const radarData = previewData?.radarData || [
    { dimension: 'Motivação & Energia', dimensionKey: 'motivacaoEnergia' as DimensionId, score: scores.motivacaoEnergia.score, fullMark: 100 },
    { dimension: 'Ambiente & Estrutura', dimensionKey: 'ambienteTrabalho' as DimensionId, score: scores.ambienteTrabalho.score, fullMark: 100 },
    { dimension: 'Valores & Limites', dimensionKey: 'valoresLimites' as DimensionId, score: scores.valoresLimites.score, fullMark: 100 },
    { dimension: 'Colaboração & Diálogo', dimensionKey: 'colaboracaoComunicacao' as DimensionId, score: scores.colaboracaoComunicacao.score, fullMark: 100 },
    { dimension: 'Próximos Passos', dimensionKey: 'desenvolvimentoFuturo' as DimensionId, score: scores.desenvolvimentoFuturo.score, fullMark: 100 },
  ];

  // Cálculo dos pontos do Radar SVG (Pentágono)
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

  return (
    <div className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Banner de Alternância para Testador (Permite testar tanto a prévia quanto o relatório pago) */}
      {isUnlockedSession && sessionInfo && (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sage-800 to-sage-900 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-warmCream" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                Modo de Teste / Acesso Liberado
              </p>
              <p className="text-xs text-ivory-200">
                Você está vendo a <strong>Prévia Gratuita</strong>. Seu Relatório Completo Pago também já está liberado.
              </p>
            </div>
          </div>
          <Link
            href={`/mapa/relatorio?session_id=${sessionInfo.id}&token=${sessionInfo.accessToken}`}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-white text-sage-900 hover:bg-ivory-100 transition-all shrink-0 text-center shadow-xs"
          >
            Ver Relatório Completo Pago →
          </Link>
        </div>
      )}

      {/* Faixa de Notificação de Prévia Gratuita */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cobalt-50 text-cobalt-700 border border-cobalt-200 shadow-2xs mb-4">
          <Sparkles className="w-3.5 h-3.5 text-cobalt-500" />
          <span>Prévia Personalizada Gratuita</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal-500 tracking-tight leading-tight mb-3">
          {previewData?.participantName ? `${previewData.participantName}, este é o seu Mapa Preliminar.` : 'Este é o seu Mapa Preliminar.'}
        </h1>

        <p className="text-sm text-charcoal-200 max-w-2xl mx-auto leading-relaxed">
          Suas respostas foram processadas pelo nosso motor de diagnóstico. Abaixo você confere o cálculo real das suas 5 dimensões e três observações iniciais sobre seu padrão de atuação profissional.
        </p>
      </div>

      {/* PAINEL CENTRAL: Radar Gráfico e Pontuações */}
      <div className="bg-white rounded-3xl border border-borderWarm p-6 sm:p-10 shadow-xl mb-12">
        <div className="flex items-center justify-between border-b border-borderWarm pb-4 mb-8">
          <div>
            <h2 className="font-serif text-xl font-semibold text-charcoal-500">
              Síntese das Cinco Dimensões
            </h2>
            <p className="text-xs text-charcoal-200">
              Pontuações calculadas a partir das suas respostas (0 a 100)
            </p>
          </div>
          <span className="text-[11px] font-semibold text-cobalt-600 bg-cobalt-50 px-3 py-1 rounded-full border border-cobalt-200">
            Dados Reais
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Radar SVG Matemático Interativo */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="relative w-[280px] h-[280px] sm:w-[320px] sm:h-[320px]">
              <svg viewBox="0 0 320 320" className="w-full h-full overflow-visible">
                {/* Círculos concêntricos de escala (20%, 40%, 60%, 80%, 100%) */}
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

                {/* Eixos do centro até os vértices */}
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

                {/* Área Preenchida do Diagnóstico do Usuário */}
                <polygon
                  points={polygonPoints}
                  fill="rgba(36, 76, 232, 0.18)"
                  stroke="#244CE8"
                  strokeWidth="2.5"
                  className="transition-all duration-700 ease-out"
                />

                {/* Marcadores dos Vértices */}
                {radarData.map((item, idx) => {
                  const { x, y } = getCoordinates(idx, item.score);
                  const isHovered = selectedDimension === item.dimensionKey;
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r={isHovered ? 6 : 4}
                      fill="#244CE8"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setSelectedDimension(item.dimensionKey)}
                      onMouseLeave={() => setSelectedDimension(null)}
                    />
                  );
                })}
              </svg>
            </div>
            <p className="text-[11px] text-charcoal-200 text-center mt-2">
              Visualização vetorial das 5 dimensões integradas
            </p>
          </div>

          {/* Barras e Detalhamento das Dimensões */}
          <div className="lg:col-span-6 space-y-3.5">
            {radarData.map((item) => {
              const isSelected = selectedDimension === item.dimensionKey;
              return (
                <div
                  key={item.dimensionKey}
                  onMouseEnter={() => setSelectedDimension(item.dimensionKey)}
                  onMouseLeave={() => setSelectedDimension(null)}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-cobalt-500 bg-cobalt-50/50 shadow-2xs'
                      : 'border-borderWarm/80 bg-ivory-50/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-charcoal-500">{item.dimension}</span>
                    <span className="font-mono font-bold text-cobalt-600">{item.score}/100</span>
                  </div>
                  <div className="w-full bg-borderWarm h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cobalt-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* TRÊS OBSERVAÇÕES PRELIMINARES PERSONALIZADAS */}
      <div className="mb-14">
        <h2 className="font-serif text-2xl font-semibold text-charcoal-500 mb-6">
          Primeiras Descobertas do Seu Perfil
        </h2>

        <div className="space-y-4">
          {(previewData?.initialObservations || []).slice(0, 3).map((obs, idx) => (
            <div
              key={obs.id || idx}
              className="p-6 rounded-2xl bg-white border border-borderWarm shadow-xs hover:border-cobalt-200 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-cobalt-100 text-cobalt-700 text-[10px] font-bold flex items-center justify-center">
                  0{idx + 1}
                </span>
                <h3 className="font-serif text-base font-semibold text-charcoal-500">
                  {obs.title}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-charcoal-300 leading-relaxed mb-4">
                {obs.narrative}
              </p>

              <div className="p-3 rounded-xl bg-ivory-100/70 border border-borderWarm/60 text-xs text-charcoal-300 flex items-start gap-2">
                <span className="font-semibold text-cobalt-600 shrink-0">Evidência:</span>
                <span>{obs.evidence}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PERGUNTA DE REFLEXÃO E MICRO-AÇÃO INICIAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#2E473B] to-[#22352C] text-white shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-warmCream" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-warmCream">
              Pergunta para Reflexão
            </span>
          </div>
          <p className="font-serif text-base sm:text-lg leading-relaxed text-ivory-50">
            "{previewData?.deepReflectionQuestion || 'O que torna suas escolhas profissionais verdadeiramente sustentáveis hoje?'}"
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-borderWarm shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-4 h-4 text-cobalt-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-cobalt-600">
              Sugestão de Ação Inicial
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-400 leading-relaxed">
            {previewData?.initialActionSuggestion || 'Reserve 30 minutos na próxima semana para mapear seus focos essenciais e proteger seus limites de energia.'}
          </p>
        </div>
      </div>

      {/* TEASER VISUAL EDITORIAL DO RELATÓRIO COMPLETO PAGO */}
      <div className="relative rounded-3xl border-2 border-dashed border-cobalt-300 bg-white p-8 sm:p-10 shadow-lg overflow-hidden mb-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 rounded-2xl bg-cobalt-50 text-cobalt-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal-500 mb-3">
            Aprofunde seus resultados no Relatório Completo
          </h2>

          <p className="text-xs sm:text-sm text-charcoal-300 leading-relaxed mb-6">
            A prévia gratuita entrega as dimensões iniciais. O relatório pago desbloqueia a análise aprofundada das tensões de carreira, matriz de gaps de motivação e o seu <strong>Plano Personalizado de 30 Dias</strong> com micro-ações divididas em 4 semanas.
          </p>

          {/* O que é desbloqueado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs text-charcoal-400 mb-8 max-w-xl mx-auto">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cobalt-500 shrink-0 mt-0.5" />
              <span>Matriz de Fricções (Importância vs Satisfação)</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cobalt-500 shrink-0 mt-0.5" />
              <span>Plano estruturado em 4 semanas (Dias 1 a 30)</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cobalt-500 shrink-0 mt-0.5" />
              <span>Pílulas de diagnóstico e tensões de valores</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cobalt-500 shrink-0 mt-0.5" />
              <span>Exportação em formato PDF editorial para impressão</span>
            </div>
          </div>

          <Link
            href="/mapa/oferta"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold bg-cobalt-500 hover:bg-cobalt-600 text-white shadow-md hover:shadow-xl transition-all group active:scale-[0.98]"
          >
            <span>Desbloquear meu relatório completo</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <p className="text-[11px] text-charcoal-200 mt-3">
            Pagamento único • Sem assinatura recorrente • Acesso permanente
          </p>
        </div>
      </div>
    </div>
  );
}
