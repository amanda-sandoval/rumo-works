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
  CreditCard,
  QrCode,
  ShieldCheck,
  KeyRound,
  X,
  Loader2,
  Check,
} from 'lucide-react';
import { PreviewData, DimensionId } from '@/lib/mapa/types';

export default function PreviaPage() {
  const router = useRouter();
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDimension, setSelectedDimension] = useState<DimensionId | null>(null);
  const [isUnlockedSession, setIsUnlockedSession] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<{ id: string; accessToken: string } | null>(null);

  // Estados do Modal de Pagamento / Checkout Direto
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPaymentTab, setSelectedPaymentTab] = useState<'pix' | 'cartao' | 'vip'>('pix');
  const [testerCodeInput, setTesterCodeInput] = useState('');
  const [testerCodeError, setTesterCodeError] = useState<string | null>(null);
  const [validatingTester, setValidatingTester] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    async function fetchPreview() {
      try {
        const savedSession = localStorage.getItem('mapa_rumo_session');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.id && parsed.accessToken) {
            setSessionInfo({ id: parsed.id, accessToken: parsed.accessToken });

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
              setLoading(false);
              return;
            }

            if (data.preview) {
              setPreviewData(data.preview);
              setLoading(false);
              return;
            }
          }
        }

        // Contingência com dados do storage local
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

  // Função para validar código de testador VIP direto no pop-up
  const handleUnlockWithVIPCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sessionInfo?.id || !sessionInfo?.accessToken) {
      setTesterCodeError('Sessão não identificada. Por favor, recarregue a página.');
      return;
    }
    if (!testerCodeInput.trim()) {
      setTesterCodeError('Por favor, digite o código de acesso VIP.');
      return;
    }

    setValidatingTester(true);
    setTesterCodeError(null);

    try {
      const res = await fetch('/api/mapa/unlock-tester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionInfo.id,
          accessToken: sessionInfo.accessToken,
          testerKey: testerCodeInput.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Atualizar storage
        const saved = localStorage.getItem('mapa_rumo_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.isUnlocked = true;
          localStorage.setItem('mapa_rumo_session', JSON.stringify(parsed));
        }
        window.location.href = `/mapa/relatorio?session_id=${sessionInfo.id}&token=${sessionInfo.accessToken}`;
      } else {
        setTesterCodeError(data.error || 'Código VIP inválido ou não autorizado.');
      }
    } catch {
      setTesterCodeError('Erro de conexão ao validar o código.');
    } finally {
      setValidatingTester(false);
    }
  };

  // Iniciar pagamento seguro via checkout
  const handleDirectPayment = async () => {
    if (!sessionInfo?.id || !sessionInfo?.accessToken) {
      window.location.href = '/mapa/oferta';
      return;
    }

    setIsProcessingPayment(true);
    try {
      const res = await fetch('/api/mapa/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionInfo.id,
          accessToken: sessionInfo.accessToken,
          customerName: previewData?.participantName || 'Participante',
        }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        // Fallback para página de oferta detalhada se necessário
        window.location.href = `/mapa/oferta?session_id=${sessionInfo.id}&token=${sessionInfo.accessToken}`;
      }
    } catch (err) {
      console.error('Erro ao processar checkout:', err);
      window.location.href = `/mapa/oferta?session_id=${sessionInfo.id}&token=${sessionInfo.accessToken}`;
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-3 border-sage-700 border-t-transparent rounded-full animate-spin mb-4" />
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
    colaboracaoComunicacao: { id: 'colaboracaoComunicacao', name: 'Colaboração e Comunicação', score: 0, level: 'exploratorio', summary: 'Disponível no Relatório Completo.', sufficiency: 'amostral' },
    desenvolvimentoFuturo: { id: 'desenvolvimentoFuturo', name: 'Desenvolvimento e Próximos Passos', score: 0, level: 'exploratorio', summary: 'Disponível no Relatório Completo.', sufficiency: 'amostral' },
  };

  const radarData = previewData?.radarData || [
    { dimension: 'Motivação & Energia', dimensionKey: 'motivacaoEnergia' as DimensionId, score: scores.motivacaoEnergia.score, fullMark: 100, isLocked: false },
    { dimension: 'Ambiente & Estrutura', dimensionKey: 'ambienteTrabalho' as DimensionId, score: scores.ambienteTrabalho.score, fullMark: 100, isLocked: false },
    { dimension: 'Valores & Limites', dimensionKey: 'valoresLimites' as DimensionId, score: scores.valoresLimites.score, fullMark: 100, isLocked: false },
    { dimension: 'Colaboração & Diálogo', dimensionKey: 'colaboracaoComunicacao' as DimensionId, score: 0, fullMark: 100, isLocked: true },
    { dimension: 'Próximos Passos', dimensionKey: 'desenvolvimentoFuturo' as DimensionId, score: 0, fullMark: 100, isLocked: true },
  ];

  // Cálculo dos pontos do Radar SVG Proporcional e Ampliado (Pentágono)
  const cx = 190;
  const cy = 190;
  const r = 135;
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
      // Se a dimensão estiver bloqueada no plano gratuito, plota valor 0 ou base
      const scoreVal = item.isLocked ? 0 : item.score;
      const { x, y } = getCoordinates(idx, scoreVal);
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
                Você está vendo a <strong>Prévia Inicial</strong>. Seu Relatório Completo também já está liberado.
              </p>
            </div>
          </div>
          <Link
            href={`/mapa/relatorio?session_id=${sessionInfo.id}&token=${sessionInfo.accessToken}`}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-white text-sage-900 hover:bg-ivory-100 transition-all shrink-0 text-center shadow-xs"
          >
            Ver Relatório Completo →
          </Link>
        </div>
      )}

      {/* Faixa de Notificação de Prévia Inicial */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sage-100 text-sage-800 border border-sage-200 shadow-2xs mb-4">
          <Sparkles className="w-3.5 h-3.5 text-sage-700" />
          <span>Prévia Personalizada Inicial</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal-500 tracking-tight leading-tight mb-3">
          {previewData?.participantName ? `${previewData.participantName}, este é o seu Mapa Preliminar.` : 'Este é o seu Mapa Preliminar.'}
        </h1>

        <p className="text-sm text-charcoal-200 max-w-2xl mx-auto leading-relaxed">
          Suas respostas foram processadas com base nas dimensões respondidas. Abaixo você confere o cálculo real do seu perfil e três observações preliminares sobre seus padrões de atuação profissional.
        </p>
      </div>

      {/* PAINEL CENTRAL: Radar Gráfico Maior e Proporcional */}
      <div className="bg-white rounded-3xl border border-borderWarm p-6 sm:p-10 shadow-xl mb-12">
        <div className="flex items-center justify-between border-b border-borderWarm pb-4 mb-8">
          <div>
            <h2 className="font-serif text-xl font-semibold text-charcoal-500">
              Síntese das Dimensões
            </h2>
            <p className="text-xs text-charcoal-200">
              Pontuações calculadas a partir das suas respostas (0 a 100)
            </p>
          </div>
          <span className="text-[11px] font-semibold text-sage-800 bg-sage-100 px-3 py-1 rounded-full border border-sage-200">
            Dados Reais Calculados
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Radar SVG Matemático Ampliado e Proporcional */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            <div className="relative w-[300px] h-[300px] sm:w-[360px] sm:h-[360px] md:w-[380px] md:h-[380px]">
              <svg viewBox="0 0 380 380" className="w-full h-full overflow-visible">
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
                  fill="rgba(46, 71, 59, 0.22)"
                  stroke="#2E473B"
                  strokeWidth="2.5"
                  className="transition-all duration-700 ease-out"
                />

                {/* Marcadores dos Vértices */}
                {radarData.map((item, idx) => {
                  const scoreVal = item.isLocked ? 0 : item.score;
                  const { x, y } = getCoordinates(idx, scoreVal);
                  const isHovered = selectedDimension === item.dimensionKey;
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r={isHovered ? 7 : 4.5}
                      fill={item.isLocked ? '#A8A29E' : '#2E473B'}
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
                      ? 'border-sage-600 bg-sage-50/70 shadow-2xs'
                      : 'border-borderWarm/80 bg-ivory-50/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-charcoal-500">{item.dimension}</span>
                    {item.isLocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-charcoal-400 bg-ivory-100 px-2 py-0.5 rounded-md border border-borderWarm">
                        <Lock className="w-3 h-3 text-sage-800" />
                        Plano Completo
                      </span>
                    ) : (
                      <span className="font-mono font-bold text-sage-900">{item.score}/100</span>
                    )}
                  </div>
                  <div className="w-full bg-borderWarm h-2 rounded-full overflow-hidden">
                    {item.isLocked ? (
                      <div className="h-full bg-borderWarm border-r border-sage-300 opacity-30" style={{ width: '100%' }} />
                    ) : (
                      <div
                        className="h-full bg-sage-800 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${item.score}%` }}
                      />
                    )}
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
              className="p-6 rounded-2xl bg-white border border-borderWarm shadow-xs hover:border-sage-300 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-sage-100 text-sage-800 text-[10px] font-bold flex items-center justify-center">
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
                <span className="font-semibold text-sage-800 shrink-0">Evidência:</span>
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
            <CheckCircle2 className="w-4 h-4 text-sage-800" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sage-800">
              Sugestão de Ação Inicial
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-400 leading-relaxed">
            {previewData?.initialActionSuggestion || 'Reserve 30 minutos na próxima semana para mapear seus focos essenciais e proteger seus limites de energia.'}
          </p>
        </div>
      </div>

      {/* CARD DE UPGRADE DESTACADO COM VALOR E BOTÃO QUE ABRE O POP-UP DIRETO */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#243A2F] via-[#2E473B] to-[#1E3228] text-white p-8 sm:p-12 shadow-2xl border-2 border-sage-600 mb-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Lado Esquerdo: Conteúdo e Benefícios */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-warmCream border border-white/15 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-warmCream" />
              <span>Aprofunde seus Resultados</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white tracking-tight leading-tight mb-3">
              Desbloqueie o Mapa Rumo Completo
            </h2>

            <p className="text-xs sm:text-sm text-ivory-200 leading-relaxed mb-6">
              Sua versão gratuita avaliou as 3 dimensões essenciais. No diagnóstico completo você desbloqueia as <strong>5 dimensões integradas</strong>, a <strong>Matriz de Fricções (Importância vs Satisfação)</strong>, pílulas de valores e o seu <strong>Plano Personalizado de 30 Dias</strong> com micro-ações divididas em 4 semanas.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-ivory-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-warmCream shrink-0" />
                <span>5 Dimensões com Radar Completo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-warmCream shrink-0" />
                <span>Matriz de Gaps em 10 Motivadores</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-warmCream shrink-0" />
                <span>Plano Estruturado de 30 Dias</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-warmCream shrink-0" />
                <span>Exportação em PDF Editorial</span>
              </div>
            </div>
          </div>

          {/* Lado Direito: Caixa de Preço e Botão que Abre Pop-up Direto */}
          <div className="lg:col-span-5 flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ivory-200 mb-1">
              Pagamento Único
            </span>

            <div className="flex items-baseline gap-1 my-2">
              <span className="text-xl font-serif text-ivory-200">R$</span>
              <span className="text-5xl font-serif font-bold text-white">67</span>
              <span className="text-xl font-serif text-ivory-200">,00</span>
            </div>

            <p className="text-[11px] text-ivory-300 mb-6">
              Sem mensalidades • Sem assinatura • Acesso vitalício
            </p>

            <button
              type="button"
              onClick={() => setCheckoutModalOpen(true)}
              className="w-full py-4 rounded-xl text-sm font-bold bg-white hover:bg-[#F9F6F0] text-[#1A1816] transition-all flex items-center justify-center gap-2 group active:scale-[0.98] shadow-lg hover:shadow-xl cursor-pointer"
            >
              <span className="text-[#1A1816] font-bold">Iniciar Diagnóstico Completo</span>
              <ArrowRight className="w-4 h-4 text-[#1A1816] transition-transform group-hover:translate-x-1" />
            </button>

            <div className="flex items-center gap-1.5 text-[10px] text-ivory-300 mt-3">
              <ShieldCheck className="w-3.5 h-3.5 text-warmCream" />
              <span>Checkout Seguro • Garantia de 7 dias</span>
            </div>
          </div>
        </div>
      </div>

      {/* POP-UP DIRETO PARA PAGAMENTO DO PLANO COMPLETO */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-borderWarm relative animate-in zoom-in-95 duration-200">
            {/* Botão Fechar (X) */}
            <button
              type="button"
              onClick={() => {
                setCheckoutModalOpen(false);
                setTesterCodeError(null);
              }}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-ivory-100 hover:bg-ivory-200 text-charcoal-400 hover:text-charcoal-600 flex items-center justify-center transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Cabeçalho do Pop-up */}
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sage-800 bg-sage-100 px-3 py-1 rounded-full border border-sage-200">
                Acesso Imediato
              </span>
              <h3 className="font-serif text-2xl font-semibold text-charcoal-500 mt-2">
                Desbloquear Mapa Rumo Completo
              </h3>
              <p className="text-xs text-charcoal-200 mt-1">
                Liberação integral das 5 dimensões e Plano de 30 Dias.
              </p>
            </div>

            {/* Resumo do Pedido e Valor */}
            <div className="p-4 rounded-2xl bg-ivory-50 border border-borderWarm mb-6">
              <div className="flex justify-between items-center text-xs text-charcoal-300 mb-2">
                <span>Produto:</span>
                <span className="font-semibold text-charcoal-500">Relatório Completo + 30 Dias</span>
              </div>
              <div className="flex justify-between items-center text-xs text-charcoal-300 mb-2">
                <span>Condição:</span>
                <span className="font-semibold text-sage-800">Pagamento Único</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-borderWarm pt-2 mt-2">
                <span className="text-xs font-semibold text-charcoal-500">Total a Pagar:</span>
                <span className="text-2xl font-serif font-bold text-charcoal-500">R$ 67,00</span>
              </div>
            </div>

            {/* Abas de Opções de Pagamento */}
            <div className="flex rounded-xl bg-ivory-100 p-1 mb-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedPaymentTab('pix')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  selectedPaymentTab === 'pix'
                    ? 'bg-white text-sage-900 shadow-2xs font-bold'
                    : 'text-charcoal-300 hover:text-charcoal-500'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>PIX</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPaymentTab('cartao')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  selectedPaymentTab === 'cartao'
                    ? 'bg-white text-sage-900 shadow-2xs font-bold'
                    : 'text-charcoal-300 hover:text-charcoal-500'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Cartão</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPaymentTab('vip')}
                className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  selectedPaymentTab === 'vip'
                    ? 'bg-white text-sage-900 shadow-2xs font-bold'
                    : 'text-charcoal-300 hover:text-charcoal-500'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Código de Acesso</span>
              </button>
            </div>

            {/* Conteúdo da Aba PIX */}
            {selectedPaymentTab === 'pix' && (
              <div className="space-y-4">
                <p className="text-xs text-charcoal-300 leading-relaxed">
                  Aprovação instantânea. Ao clicar abaixo você será direcionado para a tela segura de pagamento bancário com chave PIX copia e cola e QR Code.
                </p>

                <button
                  type="button"
                  onClick={handleDirectPayment}
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 rounded-xl text-xs font-semibold bg-sage-800 hover:bg-sage-900 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gerando chave PIX segura...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>Pagar com PIX — R$ 67,00</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Conteúdo da Aba Cartão */}
            {selectedPaymentTab === 'cartao' && (
              <div className="space-y-4">
                <p className="text-xs text-charcoal-300 leading-relaxed">
                  Pagamento seguro com criptografia bancária. Parcelamento disponível em até 12x.
                </p>

                <button
                  type="button"
                  onClick={handleDirectPayment}
                  disabled={isProcessingPayment}
                  className="w-full py-3.5 rounded-xl text-xs font-semibold bg-sage-800 hover:bg-sage-900 text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Abrindo checkout seguro...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Pagar com Cartão — R$ 67,00</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Conteúdo da Aba Código de Acesso */}
            {selectedPaymentTab === 'vip' && (
              <form onSubmit={handleUnlockWithVIPCode} className="space-y-3">
                <p className="text-xs text-charcoal-300">
                  Possui um código de acesso ou convite? Insira-o abaixo para validação:
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testerCodeInput}
                    onChange={(e) => setTesterCodeInput(e.target.value)}
                    placeholder="Digite seu código de acesso"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-borderWarm text-xs font-mono uppercase focus:border-sage-700 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={validatingTester || !testerCodeInput.trim()}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-sage-800 hover:bg-sage-900 disabled:opacity-50 text-white transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {validatingTester ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Ativar</span>
                    )}
                  </button>
                </div>

                {testerCodeError && (
                  <p className="text-[11px] text-red-600 font-medium">
                    {testerCodeError}
                  </p>
                )}
              </form>
            )}

            {/* Rodapé de Segurança */}
            <div className="mt-6 pt-4 border-t border-borderWarm flex items-center justify-center gap-2 text-[10px] text-charcoal-200">
              <ShieldCheck className="w-3.5 h-3.5 text-sage-800" />
              <span>Ambiente Criptografado SSL • Garantia Incondicional de 7 Dias</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
