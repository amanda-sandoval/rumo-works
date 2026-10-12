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
  HelpCircle,
  Check,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { Suspense } from 'react';
import { validateLead } from '@/lib/mapa/engine/leadValidation';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState<string>('');
  const [participantEmail, setParticipantEmail] = useState<string>('');
  const [hasAnswersFromPreview, setHasAnswersFromPreview] = useState<boolean>(false);
  const [savedAnswersCount, setSavedAnswersCount] = useState<number>(0);

  const [selectedTab, setSelectedTab] = useState<'pix' | 'cartao' | 'codigo'>('pix');
  const [loading, setLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Estados de resposta do checkout
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [checkoutInfo, setCheckoutInfo] = useState<{
    purchaseId?: string;
    formattedPrice?: string;
    message?: string;
    status?: string;
  } | null>(null);

  // Estados do código de acesso VIP / Testador (homologação segura)
  const [testerKey, setTesterKey] = useState<string>('');
  const [testerError, setTesterError] = useState<string | null>(null);
  const [testerSuccess, setTesterSuccess] = useState<string | null>(null);
  const [validatingTester, setValidatingTester] = useState<boolean>(false);

  // Inicialização da sessão e detecção de respostas anteriores
  useEffect(() => {
    try {
      // 1. Verificar parâmetros de URL (se vier de link direto de sessão)
      const urlSessionId = searchParams.get('session_id') || searchParams.get('sessionId');
      const urlToken = searchParams.get('token') || searchParams.get('accessToken');

      const saved = localStorage.getItem('mapa_rumo_session');
      let currentSessionId = urlSessionId || null;
      let currentAccessToken = urlToken || null;

      if (saved) {
        const parsed = JSON.parse(saved);
        if (!currentSessionId) currentSessionId = parsed.id;
        if (!currentAccessToken) currentAccessToken = parsed.accessToken;
        if (parsed.participantName && !parsed.participantName.includes('(Teste)')) {
          setParticipantName(parsed.participantName);
        }
        if (parsed.participantEmail) {
          setParticipantEmail(parsed.participantEmail);
        }
      }

      if (currentSessionId && currentAccessToken) {
        setSessionId(currentSessionId);
        setAccessToken(currentAccessToken);
      }

      // 2. Verificar respostas existentes no localStorage para detectar se veio da prévia
      const savedAnswers = localStorage.getItem('mapa_rumo_answers');
      if (savedAnswers) {
        const parsedAnswers = JSON.parse(savedAnswers);
        const keys = Object.keys(parsedAnswers);
        setSavedAnswersCount(keys.length);
        if (keys.length >= 24) {
          setHasAnswersFromPreview(true);
        }
      }

      // 3. Se veio com chave de teste na URL
      const keyFromUrl = searchParams.get('tester_key') || searchParams.get('key');
      if (keyFromUrl && currentSessionId && currentAccessToken) {
        handleUnlockWithTesterKey(currentSessionId, currentAccessToken, keyFromUrl);
      }
    } catch {
      // ignore
    }
  }, [searchParams]);

  // Validação de acesso de teste no servidor
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
          testerKey: keyToTest.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTesterSuccess('Acesso autorizado pelo servidor! Redirecionando...');

        // Atualizar flag local
        const saved = localStorage.getItem('mapa_rumo_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.isUnlocked = true;
          localStorage.setItem('mapa_rumo_session', JSON.stringify(parsed));
        }

        const destination = data.redirectUrl || (hasAnswersFromPreview
          ? '/mapa/questionario?plan=complete&stage=4'
          : '/mapa/questionario?plan=complete&stage=1');

        setTimeout(() => {
          window.location.href = destination;
        }, 1200);
      } else {
        setTesterError(data.error || 'Código de acesso não reconhecido ou inválido neste ambiente.');
      }
    } catch {
      setTesterError('Erro ao validar acesso. Verifique sua conexão.');
    } finally {
      setValidatingTester(false);
    }
  };

  const handleManualTesterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testerKey.trim()) {
      setTesterError('Por favor, informe a chave de acesso.');
      return;
    }

    // Se ainda não houver sessão ativa, cria uma temporária primeiro
    if (!sessionId || !accessToken) {
      const leadCheck = validateLead(participantName || 'João Santos', participantEmail || 'joao@exemplo.com.br');
      fetch('/api/mapa/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantName: leadCheck.normalizedName,
          participantEmail: leadCheck.normalizedEmail,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.session) {
            setSessionId(data.session.id);
            setAccessToken(data.session.accessToken);
            localStorage.setItem('mapa_rumo_session', JSON.stringify(data.session));
            handleUnlockWithTesterKey(data.session.id, data.session.accessToken, testerKey.trim());
          }
        })
        .catch(() => {
          setTesterError('Não foi possível inicializar a sessão.');
        });
      return;
    }

    handleUnlockWithTesterKey(sessionId, accessToken, testerKey.trim());
  };

  // Iniciar checkout bancário
  const handleStartCheckout = async () => {
    setValidationError(null);

    // Validação de lead se não preenchido
    const leadCheck = validateLead(participantName, participantEmail);
    if (!leadCheck.isValid) {
      setValidationError(leadCheck.error || 'Por favor, informe seu nome completo e um e-mail válido para identificação do pedido.');
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/mapa/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          accessToken,
          customerName: leadCheck.normalizedName,
          customerEmail: leadCheck.normalizedEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setValidationError(data.error || 'Não foi possível registrar o checkout no momento.');
        return;
      }

      // Se nova sessão foi gerada
      if (data.sessionId && data.accessToken) {
        setSessionId(data.sessionId);
        setAccessToken(data.accessToken);
        const existingSession = localStorage.getItem('mapa_rumo_session');
        const parsed = existingSession ? JSON.parse(existingSession) : {};
        parsed.id = data.sessionId;
        parsed.accessToken = data.accessToken;
        parsed.participantName = leadCheck.normalizedName;
        parsed.participantEmail = leadCheck.normalizedEmail;
        localStorage.setItem('mapa_rumo_session', JSON.stringify(parsed));
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setCheckoutInfo({
          purchaseId: data.purchaseId,
          formattedPrice: data.formattedPrice || 'R$ 67,00',
          message: data.message,
          status: data.status,
        });
        setCheckoutModalOpen(true);
      }
    } catch {
      setValidationError('Erro de conexão ao processar o checkout. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-clarity-mask="true" className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Botão Voltar */}
      <div className="mb-6">
        <Link
          href="/mapa"
          className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal-300 hover:text-charcoal-500 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para a apresentação</span>
        </Link>
      </div>

      {/* Cabeçalho Editorial */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cobalt-50 text-cobalt-700 border border-cobalt-200 shadow-2xs mb-4">
          <Sparkles className="w-3.5 h-3.5 text-cobalt-500" />
          <span>Checkout Seguro • Rumo Works</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-charcoal-500 tracking-tight leading-tight mb-3">
          Mapa Rumo — Diagnóstico Completo
        </h1>

        <p className="text-sm text-charcoal-200 leading-relaxed">
          Acesso integral à experiência aprofundada: 8 dimensões integradas de carreira, Matriz de Fricções e Plano de Ação Estruturado de 30 Dias.
        </p>
      </div>

      {/* Alerta de Contexto do Usuário: Upgrade vs Compra Direta */}
      {hasAnswersFromPreview ? (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-sage-50 border border-sage-300 text-sage-900 shadow-xs flex items-start gap-3">
          <RotateCcw className="w-5 h-5 text-sage-700 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-sage-900">
              Respostas da Prévia Gratuita identificadas ({savedAnswersCount} respostas salvas)
            </p>
            <p className="text-xs text-sage-800 mt-1 leading-relaxed">
              Você já concluiu as etapas 1 a 3. Ao confirmar o pagamento, você <strong>não precisará refazer nada</strong>: seu questionário continuará diretamente a partir da <strong>Etapa 4</strong> para completar as 8 dimensões.
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-cobalt-50/70 border border-cobalt-200 text-cobalt-900 shadow-xs flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-cobalt-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-cobalt-900">
              Início Direto no Diagnóstico Completo (Sem desvios)
            </p>
            <p className="text-xs text-cobalt-800 mt-1 leading-relaxed">
              Você terá acesso direto a todas as <strong>48 perguntas em 6 etapas estruturadas</strong>. Ao concluir, seu relatório completo de 8 dimensões e Plano de 30 Dias serão liberados imediatamente.
            </p>
          </div>
        </div>
      )}

      {/* Grid Principal: Resumo dos Benefícios & Formulário de Pagamento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
        {/* Lado Esquerdo: Detalhamento do que está incluso */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-borderWarm p-6 sm:p-8 shadow-sm">
          <h2 className="font-serif text-xl font-semibold text-charcoal-500 mb-4 pb-3 border-b border-borderWarm">
            O que você recebe no Diagnóstico Completo:
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-charcoal-300">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-cobalt-600 shrink-0 mt-0.5" />
              <span>
                <strong>48 Perguntas em 6 Etapas Estruturadas:</strong> Investigação aprofundada de comportamento, rotina, ambição e limites.
              </span>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-cobalt-600 shrink-0 mt-0.5" />
              <span>
                <strong>Radar Completo de 8 Dimensões:</strong> Motivação, Limites, Ambiente, Clareza, Forças, Comunicação, Execução e Adaptabilidade.
              </span>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-cobalt-600 shrink-0 mt-0.5" />
              <span>
                <strong>Matriz de Fricções (Importância vs. Satisfação):</strong> Identificação exata de fontes de desgaste onde seus valores não estão alinhados.
              </span>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-cobalt-600 shrink-0 mt-0.5" />
              <span>
                <strong>Plano Personalizado de 30 Dias:</strong> 4 semanas de micro-ações calibradas pelas suas respostas, com checklist interativo e espaço para anotações.
              </span>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-cobalt-600 shrink-0 mt-0.5" />
              <span>
                <strong>PDF Editorial para Impressão:</strong> Relatório em layout A4 formatado para arquivamento pessoal.
              </span>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-cobalt-600 shrink-0 mt-0.5" />
              <span>
                <strong>Acesso Permanente e Seguro:</strong> Link exclusivo para revisitar e atualizar seu progresso quando desejar.
              </span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-borderWarm flex items-center justify-between text-xs text-charcoal-200">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sage-800" />
              <span>Garantia de 7 dias</span>
            </span>
            <span>Ambiente seguro</span>
          </div>
        </div>

        {/* Lado Direito: Formulário de Identificação e Checkout */}
        <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-cobalt-200 p-6 sm:p-8 shadow-xl">
          {/* Caixa de Preço */}
          <div className="text-center pb-6 border-b border-borderWarm mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-200">
              Pagamento Único
            </span>
            <div className="flex items-baseline justify-center gap-1 my-2">
              <span className="text-xl font-serif text-charcoal-300">R$</span>
              <span className="text-5xl font-serif font-bold text-charcoal-500">67</span>
              <span className="text-xl font-serif text-charcoal-300">,00</span>
            </div>
            <p className="text-[11px] text-charcoal-200">
              Sem mensalidades • Sem cobranças adicionais
            </p>
          </div>

          {/* Dados do Participante */}
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="customerName" className="block text-xs font-semibold text-charcoal-500 mb-1">
                Nome Completo <span className="text-terracotta-600">*</span>
              </label>
              <input
                id="customerName"
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="Ex: João Santos"
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderWarm text-xs text-charcoal-500 focus:border-cobalt-500 focus:ring-1 focus:ring-cobalt-200 outline-none"
              />
            </div>

            <div>
              <label htmlFor="customerEmail" className="block text-xs font-semibold text-charcoal-500 mb-1">
                E-mail para Envio do Relatório <span className="text-terracotta-600">*</span>
              </label>
              <input
                id="customerEmail"
                type="email"
                value={participantEmail}
                onChange={(e) => setParticipantEmail(e.target.value)}
                placeholder="Ex: joao@exemplo.com.br"
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderWarm text-xs text-charcoal-500 focus:border-cobalt-500 focus:ring-1 focus:ring-cobalt-200 outline-none"
              />
            </div>
          </div>

          {validationError && (
            <div className="mb-4 p-3 rounded-xl bg-terracotta-50 border border-terracotta-200 text-[11px] text-terracotta-700 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-terracotta-600 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Abas de Pagamento */}
          <div className="flex rounded-xl bg-ivory-100 p-1 mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedTab('pix')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                selectedTab === 'pix'
                  ? 'bg-white text-charcoal-500 shadow-2xs font-bold'
                  : 'text-charcoal-300 hover:text-charcoal-500'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>PIX</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('cartao')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                selectedTab === 'cartao'
                  ? 'bg-white text-charcoal-500 shadow-2xs font-bold'
                  : 'text-charcoal-300 hover:text-charcoal-500'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Cartão</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('codigo')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                selectedTab === 'codigo'
                  ? 'bg-white text-charcoal-500 shadow-2xs font-bold'
                  : 'text-charcoal-300 hover:text-charcoal-500'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Código</span>
            </button>
          </div>

          {/* Conteúdo Aba PIX ou Cartão */}
          {selectedTab !== 'codigo' ? (
            <div className="space-y-4">
              <p className="text-[11px] text-charcoal-200 leading-relaxed">
                {selectedTab === 'pix'
                  ? 'Aprovação instantânea no servidor. Após o pagamento, você será redirecionado automaticamente para o questionário.'
                  : 'Pagamento com criptografia bancária em até 12x. Liberação imediata após a transação.'}
              </p>

              <button
                type="button"
                onClick={handleStartCheckout}
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-xs font-bold bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Iniciando Checkout Seguro...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pagar R$ 67,00 e Desbloquear</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Conteúdo Aba Código de Acesso Institucional */
            <form onSubmit={handleManualTesterSubmit} className="space-y-3">
              <p className="text-[11px] text-charcoal-200 leading-relaxed">
                Possui código de acesso institucional ou corporativo? Digite abaixo para liberação imediata:
              </p>

              <input
                type="text"
                value={testerKey}
                onChange={(e) => setTesterKey(e.target.value.toUpperCase())}
                placeholder="Ex: INSIRA SEU CÓDIGO"
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderWarm text-xs font-mono uppercase text-charcoal-500 focus:border-sage-700 outline-none"
              />

              {testerError && (
                <div className="p-2.5 rounded-lg bg-terracotta-50 text-[11px] text-terracotta-700">
                  {testerError}
                </div>
              )}
              {testerSuccess && (
                <div className="p-2.5 rounded-lg bg-sage-50 text-[11px] text-sage-800 font-semibold">
                  {testerSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={validatingTester}
                className="w-full py-3 rounded-xl text-xs font-semibold bg-sage-800 hover:bg-sage-900 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {validatingTester ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Validando no Servidor...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Validar Código de Acesso</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Opção de Experimentar Versão Gratuita Primeiro */}
          <div className="mt-6 pt-5 border-t border-borderWarm text-center">
            <Link
              href="/mapa/questionario?plan=free"
              className="text-[11px] text-charcoal-300 hover:text-charcoal-500 font-semibold transition-colors underline"
            >
              Prefiro fazer a Prévia Gratuita de 3 Dimensões primeiro →
            </Link>
          </div>
        </div>
      </div>

      {/* Modal de Status de Checkout Bancário */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-borderWarm animate-scaleUp">
            <div className="flex items-center gap-2.5 mb-3 text-cobalt-600">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-serif text-lg font-semibold text-charcoal-500">
                Instruções de Pagamento Seguro
              </h3>
            </div>

            <p className="text-xs text-charcoal-300 leading-relaxed mb-4">
              {checkoutInfo?.message || 'Sessão de pagamento registrada no servidor.'}
            </p>

            <div className="p-4 rounded-xl bg-ivory-50 border border-borderWarm text-xs text-charcoal-400 space-y-2 mb-6">
              <div className="flex justify-between">
                <span>Produto:</span>
                <span className="font-semibold text-charcoal-500">Mapa Rumo Completo + 30 Dias</span>
              </div>
              <div className="flex justify-between">
                <span>Valor:</span>
                <span className="font-semibold text-charcoal-500">{checkoutInfo?.formattedPrice || 'R$ 67,00'}</span>
              </div>
              <div className="flex justify-between">
                <span>Status no Servidor:</span>
                <span className="font-semibold text-amber-600 font-mono">
                  {checkoutInfo?.status || 'PENDING'} (Aguardando Gateway)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sage-50 text-[11px] text-sage-900 border border-sage-200 mb-6 leading-relaxed">
              <strong>Nota de Transparência:</strong> O gateway definitivo de produção está em fase de homologação final. O acesso às perguntas analíticas será liberado no servidor assim que a confirmação de pagamento for recebida.
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCheckoutModalOpen(false)}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-charcoal-500 hover:bg-charcoal-600 text-white transition-all"
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

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-cobalt-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
