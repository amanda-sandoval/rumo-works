'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  KeyRound,
  Sparkles,
  CreditCard,
  QrCode,
  CalendarCheck2,
  FileDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Suspense } from 'react';

function OfertaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  // Estados do Acesso de Teste Restrito (Amanda e Convidados)
  const [showTesterInput, setShowTesterInput] = useState(false);
  const [testerKey, setTesterKey] = useState('');
  const [testerError, setTesterError] = useState<string | null>(null);
  const [testerSuccess, setTesterSuccess] = useState<string | null>(null);
  const [validatingTester, setValidatingTester] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mapa_rumo_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.id && parsed.accessToken) {
          setSessionId(parsed.id);
          setAccessToken(parsed.accessToken);
          setParticipantName(parsed.participantName || '');

          // Checar se veio com parâmetro direto na URL (ex: ?tester_key=TESTE-MAPA-AMANDA)
          const keyFromUrl = searchParams.get('tester_key') || searchParams.get('key');
          if (keyFromUrl) {
            handleUnlockWithTesterKey(parsed.id, parsed.accessToken, keyFromUrl);
          }
        }
      }
    } catch {
      // ignore
    }
  }, [searchParams]);

  // Função para validar chave de teste no servidor
  const handleUnlockWithTesterKey = async (sId: string, aToken: string, keyToTest: string) => {
    setValidatingTester(true);
    setTesterError(null);
    setTesterSuccess(null);

    try {
      const res = await fetch('/api/mapa/unlock-tester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sId,
          accessToken: aToken,
          testerKey: keyToTest,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTesterSuccess('Código de teste autorizado! Redirecionando para o seu relatório completo...');
        // Atualizar storage local
        const saved = localStorage.getItem('mapa_rumo_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.isUnlocked = true;
          localStorage.setItem('mapa_rumo_session', JSON.stringify(parsed));
        }
        setTimeout(() => {
          router.push(`/mapa/relatorio?session_id=${sId}&token=${aToken}`);
        }, 1200);
      } else {
        setTesterError(data.error || 'Código de teste inválido ou não autorizado.');
      }
    } catch (err) {
      setTesterError('Erro ao validar acesso de teste. Verifique sua conexão.');
    } finally {
      setValidatingTester(false);
    }
  };

  const handleManualTesterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !accessToken) {
      setTesterError('Sessão não identificada. Volte à prévia para inicializar seus dados.');
      return;
    }
    if (!testerKey.trim()) {
      setTesterError('Por favor, informe a chave de acesso.');
      return;
    }
    handleUnlockWithTesterKey(sessionId, accessToken, testerKey.trim());
  };

  // Iniciar checkout bancário
  const handleStartCheckout = async () => {
    if (!sessionId || !accessToken) {
      alert('Sessão não identificada. Por favor, inicie o questionário primeiro.');
      return;
    }

    setLoading(true);
    setCheckoutMessage(null);

    try {
      const res = await fetch('/api/mapa/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          accessToken,
          customerName: participantName,
        }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setCheckoutModalOpen(true);
        setCheckoutMessage(data.message || 'Sessão de pagamento registrada.');
      }
    } catch (err) {
      console.error('Erro no checkout:', err);
      alert('Não foi possível iniciar o checkout no momento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Título da Oferta */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cobalt-50 text-cobalt-700 border border-cobalt-200 shadow-2xs mb-4">
          <Sparkles className="w-3.5 h-3.5 text-cobalt-500" />
          <span>Acesso Integral ao Relatório & Plano de Ação</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal-500 tracking-tight leading-tight mb-4">
          Desbloqueie o seu Mapa Rumo Completo.
        </h1>

        <p className="text-base text-charcoal-200 leading-relaxed">
          Tudo o que você precisa para transformar reflexões em clareza analítica e passos práticos para os próximos 30 dias.
        </p>
      </div>

      {/* Cartão de Preço e Benefícios */}
      <div className="bg-white rounded-3xl border-2 border-cobalt-200 p-8 sm:p-12 shadow-2xl mb-12 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Lado Esquerdo: Lista de Conteúdos Liberados */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-charcoal-500 mb-2">
              O que está incluído no seu acesso:
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-charcoal-300">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cobalt-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Radar Interativo Completo:</strong> Exploração das 8 dimensões com visualização analítica e zoom por eixo temático.
                </span>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cobalt-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Matriz de Fricção (Importância vs Satisfação):</strong> Identificação exata das fontes de desgaste onde seus valores não estão sendo nutridos.
                </span>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cobalt-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Pílulas de Diagnóstico & Tensões de Valores:</strong> Análises sobre estilo de tomada de decisão, comunicação e limites.
                </span>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cobalt-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Plano Personalizado de 30 Dias:</strong> 4 semanas de micro-ações calibradas pelas suas respostas, com checklist interativo de progresso e espaço para notas.
                </span>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cobalt-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Exportação em PDF Editorial:</strong> Layout específico para impressão e arquivamento pessoal.
                </span>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-cobalt-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Acesso Vitalício ao seu Relatório:</strong> Link seguro para revisitar seus resultados quando quiser.
                </span>
              </div>
            </div>
          </div>

          {/* Lado Direito: Caixa de Preço e CTA */}
          <div className="lg:col-span-5 flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-ivory-50 border border-borderWarm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-200 mb-1">
              Pagamento Único
            </span>

            <div className="flex items-baseline gap-1 my-3">
              <span className="text-xl font-serif text-charcoal-300">R$</span>
              <span className="text-5xl font-serif font-bold text-charcoal-500">67</span>
              <span className="text-xl font-serif text-charcoal-300">,00</span>
            </div>

            <p className="text-[11px] text-charcoal-200 mb-6">
              Sem assinatura • Sem cobrança recorrente • Acesso liberado no servidor
            </p>

            <button
              type="button"
              onClick={handleStartCheckout}
              disabled={loading}
              className="w-full py-4 rounded-xl text-sm font-semibold bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 mb-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Desbloquear Relatório Completo</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-1.5 text-[10px] text-charcoal-200">
              <ShieldCheck className="w-3.5 h-3.5 text-sage-800" />
              <span>Checkout Seguro • Garantia de 7 dias</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Instruções de Checkout Seguro */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-borderWarm">
            <h3 className="font-serif text-lg font-semibold text-charcoal-500 mb-2">
              Checkout Seguro do Mapa Rumo
            </h3>
            <p className="text-xs text-charcoal-300 leading-relaxed mb-4">
              {checkoutMessage}
            </p>

            <div className="p-4 rounded-xl bg-ivory-50 border border-borderWarm text-xs text-charcoal-400 space-y-2 mb-6">
              <div className="flex justify-between">
                <span>Produto:</span>
                <span className="font-semibold text-charcoal-500">Relatório Completo + 30 Dias</span>
              </div>
              <div className="flex justify-between">
                <span>Valor:</span>
                <span className="font-semibold text-charcoal-500">R$ 67,00</span>
              </div>
              <div className="flex justify-between">
                <span>Condição:</span>
                <span className="font-semibold text-sage-800">Pagamento Único</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="px-5 py-2.5 rounded-lg text-xs font-semibold bg-charcoal-500 hover:bg-charcoal-600 text-white"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OfertaPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-3 border-cobalt-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs font-semibold text-charcoal-400">Carregando...</p>
        </div>
      }
    >
      <OfertaContent />
    </Suspense>
  );
}
