'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ASSESSMENT_QUESTIONS,
  STAGES_METADATA,
} from '@/lib/mapa/content/questions';
import { Question } from '@/lib/mapa/types';
import { validateLead } from '@/lib/mapa/engine/leadValidation';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  Loader2,
  Lock,
  Mail,
  User,
} from 'lucide-react';

function QuestionarioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planParam = searchParams.get('plan') || 'complete';
  const stageParam = searchParams.get('stage');

  // Estados de Sessão e Respostas
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState<string>('');
  const [participantEmail, setParticipantEmail] = useState<string>('');
  const [isLeadRegistered, setIsLeadRegistered] = useState<boolean>(false);
  const [isRegisteringLead, setIsRegisteringLead] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'complete'>(planParam === 'free' ? 'free' : 'complete');
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [isTesterVIP, setIsTesterVIP] = useState<boolean>(false);
  const [serverIsUnlocked, setServerIsUnlocked] = useState<boolean>(false);
  const [unauthorizedPaidModalOpen, setUnauthorizedPaidModalOpen] = useState<boolean>(false);
  const [unauthorizedStageAttempt, setUnauthorizedStageAttempt] = useState<number | null>(null);
  const [answersRestoredNotice, setAnswersRestoredNotice] = useState<boolean>(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Inicialização da sessão, restauração e validação com o servidor
  useEffect(() => {
    async function initSession() {
      try {
        const savedSession = localStorage.getItem('mapa_rumo_session');
        const savedAnswers = localStorage.getItem('mapa_rumo_answers');

        if (savedAnswers) {
          try {
            setAnswers(JSON.parse(savedAnswers));
          } catch {
            // ignore
          }
        }

        let effectiveId: string | null = null;
        let effectiveToken: string | null = null;

        let savedParsed: any = null;
        if (savedSession) {
          savedParsed = JSON.parse(savedSession);
          if (savedParsed.id && savedParsed.accessToken) {
            effectiveId = savedParsed.id;
            effectiveToken = savedParsed.accessToken;
            setSessionId(savedParsed.id);
            setAccessToken(savedParsed.accessToken);
            if (savedParsed.participantName && !savedParsed.participantName.includes('(Teste)')) {
              setParticipantName(savedParsed.participantName);
            }
            if (savedParsed.participantEmail) {
              setParticipantEmail(savedParsed.participantEmail);
            }
            if (savedParsed.isTesterMode) {
              setIsTesterVIP(true);
            }

            // Se a sessão local já possuir nome e e-mail válidos
            if (savedParsed.participantName && savedParsed.participantEmail) {
              const localLeadCheck = validateLead(savedParsed.participantName, savedParsed.participantEmail);
              if (localLeadCheck.isValid) {
                setIsLeadRegistered(true);
              }
            }
          }
        }

        if (!effectiveId || !effectiveToken) {
          // Criar nova sessão se não existir
          const res = await fetch('/api/mapa/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });
          const data = await res.json();
          if (data.session) {
            effectiveId = data.session.id;
            effectiveToken = data.session.accessToken;
            setSessionId(data.session.id);
            setAccessToken(data.session.accessToken);
            localStorage.setItem('mapa_rumo_session', JSON.stringify({
              ...data.session,
              targetMode: selectedPlan,
            }));
          }
        }

        // Consultar direitos de acesso e respostas no servidor
        if (effectiveId && effectiveToken) {
          try {
            const vRes = await fetch('/api/mapa/verify-access', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId: effectiveId, accessToken: effectiveToken }),
            });

            if (vRes.ok) {
              const vData = await vRes.json();
              const isUnlocked = Boolean(vData.isUnlocked);
              setServerIsUnlocked(isUnlocked);

              // Validação de lead pelo backend
              const candidateName = vData.participantName || (savedParsed ? savedParsed.participantName : '');
              const candidateEmail = vData.participantEmail || (savedParsed ? savedParsed.participantEmail : '');

              if (candidateName && !candidateName.includes('(Teste)')) {
                setParticipantName(candidateName);
              }
              if (candidateEmail) {
                setParticipantEmail(candidateEmail);
              }

              if (candidateName && candidateEmail) {
                const leadCheck = validateLead(candidateName, candidateEmail);
                if (leadCheck.isValid) {
                  setIsLeadRegistered(true);
                }
              }

              if (vData.savedResponses && Object.keys(vData.savedResponses).length > 0) {
                setAnswers((prev) => {
                  const merged = { ...vData.savedResponses, ...prev };
                  localStorage.setItem('mapa_rumo_answers', JSON.stringify(merged));
                  return merged;
                });
              }

              // Autorização e configuração do plano com validação estrita no servidor
              if (isUnlocked) {
                setSelectedPlan('complete');
                const stage1to3Ids = ASSESSMENT_QUESTIONS.filter((q) => q.stage <= 3).map((q) => q.id);
                const hasAllFree = vData.savedResponses && stage1to3Ids.every(
                  (id) => vData.savedResponses[id] !== undefined && vData.savedResponses[id] !== null && vData.savedResponses[id] !== ''
                );

                if (hasAllFree) {
                  // Usuário concluiu a prévia gratuita: avança diretamente para a Etapa 4 preservando as 24 respostas
                  if (!stageParam || parseInt(stageParam, 10) < 4) {
                    setCurrentStage(4);
                    setAnswersRestoredNotice(true);
                  } else {
                    const s = parseInt(stageParam, 10);
                    if (s >= 1 && s <= 6) setCurrentStage(s);
                  }
                } else if (stageParam) {
                  const s = parseInt(stageParam, 10);
                  if (s >= 1 && s <= 6) setCurrentStage(s);
                  else setCurrentStage(1);
                } else {
                  setCurrentStage(1);
                }
              } else {
                // Usuário NÃO desbloqueado no servidor: restringir a plano gratuito (etapas 1-3)
                const requestedStage = stageParam ? parseInt(stageParam, 10) : 1;
                const attemptedComplete = planParam === 'complete' || requestedStage > 3;

                if (attemptedComplete) {
                  // Não rebaixa silenciosamente: exibe modal claro com aviso de checkout necessário
                  setUnauthorizedPaidModalOpen(true);
                  setUnauthorizedStageAttempt(requestedStage > 3 ? requestedStage : null);
                }

                setSelectedPlan('free');
                if (requestedStage >= 1 && requestedStage <= 3) {
                  setCurrentStage(requestedStage);
                } else {
                  setCurrentStage(1);
                }
              }
            }
          } catch (vErr) {
            console.warn('Erro ao consultar /api/mapa/verify-access:', vErr);
          }
        }
      } catch (err) {
        console.error('Erro ao inicializar sessão:', err);
      }
    }

    initSession();
  }, [stageParam, planParam]);

  // Salvar resposta e sincronizar com servidor
  const handleAnswerChange = async (questionId: string, value: any) => {
    const updated = { ...answers, [questionId]: value };
    setAnswers(updated);
    localStorage.setItem('mapa_rumo_answers', JSON.stringify(updated));

    // Limpar erro de validação ao interagir
    setValidationError(null);

    // Salvar incremental no servidor se tiver sessão
    if (sessionId && accessToken) {
      setIsSaving(true);
      try {
        await fetch('/api/mapa/response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            accessToken,
            questionId,
            stage: currentStage,
            value,
          }),
        });
      } catch (err) {
        console.error('Erro ao sincronizar resposta:', err);
      } finally {
        setTimeout(() => setIsSaving(false), 400);
      }
    }
  };

  // Monitorar digitação do nome (ou código de teste em ambiente de QA)
  const handleNameChange = (val: string) => {
    setParticipantName(val);
    const clean = val.trim().toUpperCase();

    // Verificação dinâmica via backend (sem chave hardcoded no frontend)
    if (clean.startsWith('TESTE-') && clean.length >= 8) {
      try {
        fetch('/api/mapa/unlock-tester', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            accessToken,
            testerKey: clean,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.success) {
              setIsTesterVIP(true);
              setServerIsUnlocked(true);
              setSelectedPlan('complete');
            }
          })
          .catch(() => {});

        const saved = localStorage.getItem('mapa_rumo_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.isTesterMode = true;
          parsed.isUnlocked = true;
          localStorage.setItem('mapa_rumo_session', JSON.stringify(parsed));
        }
      } catch {}
    } else {
      try {
        const saved = localStorage.getItem('mapa_rumo_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.participantName = val;
          localStorage.setItem('mapa_rumo_session', JSON.stringify(parsed));
        }
      } catch {}
    }
  };

  // Submissão do formulário de identificação (Etapa 0) obrigatória antes da Pergunta 1
  const handleRegisterLead = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError(null);

    const cleanName = participantName.trim();
    const cleanEmail = participantEmail.trim();

    // Verificação dinâmica de autorização de teste via backend
    if (cleanName.toUpperCase().startsWith('TESTE-') && cleanName.length >= 8) {
      if (sessionId && accessToken) {
        try {
          const vRes = await fetch('/api/mapa/unlock-tester', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              accessToken,
              testerKey: cleanName.toUpperCase(),
            }),
          });
          const vData = await vRes.json();
          if (vData.success) {
            setIsTesterVIP(true);
            setServerIsUnlocked(true);
            setSelectedPlan('complete');
          }
        } catch {}
      }
    }

    const check = validateLead(cleanName, cleanEmail);
    if (!check.isValid) {
      setValidationError(check.error || 'Por favor, informe seu nome completo e um e-mail válido.');
      return;
    }

    setIsRegisteringLead(true);
    try {
      let currentSessionId = sessionId;
      let currentAccessToken = accessToken;

      if (!currentSessionId || !currentAccessToken) {
        try {
          const sRes = await fetch('/api/mapa/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });
          const sData = await sRes.json();
          if (sData.session) {
            currentSessionId = sData.session.id;
            currentAccessToken = sData.session.accessToken;
            setSessionId(sData.session.id);
            setAccessToken(sData.session.accessToken);
          }
        } catch (sErr) {
          console.warn('Erro ao inicializar sessão antes do cadastro de lead:', sErr);
        }
      }

      const res = await fetch('/api/mapa/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSessionId,
          accessToken: currentAccessToken,
          name: check.normalizedName,
          email: check.normalizedEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setValidationError(data.error || 'Não foi possível cadastrar sua identificação.');
        setIsRegisteringLead(false);
        return;
      }

      if (data.session) {
        if (data.session.id) setSessionId(data.session.id);
        if (data.session.accessToken) setAccessToken(data.session.accessToken);
      }

      setParticipantName(check.normalizedName!);
      setParticipantEmail(check.normalizedEmail!);
      setIsLeadRegistered(true);

      // Atualizar dados na sessão local
      try {
        const saved = localStorage.getItem('mapa_rumo_session');
        const parsed = saved ? JSON.parse(saved) : {};
        parsed.id = data.session?.id || currentSessionId || parsed.id;
        parsed.accessToken = data.session?.accessToken || currentAccessToken || parsed.accessToken;
        parsed.participantName = check.normalizedName;
        parsed.participantEmail = check.normalizedEmail;
        localStorage.setItem('mapa_rumo_session', JSON.stringify(parsed));
      } catch {}
    } catch (err: any) {
      setValidationError(err.message || 'Falha ao registrar identificação.');
    } finally {
      setIsRegisteringLead(false);
    }
  };

  // Limite de etapas conforme autorização do servidor
  const isFreePlan = !serverIsUnlocked && selectedPlan === 'free';
  const maxStage = isFreePlan ? 3 : 6;

  // Perguntas do estágio atual
  const stageQuestions = ASSESSMENT_QUESTIONS.filter((q) => q.stage === currentStage);
  const currentStageMeta = STAGES_METADATA.find((s) => s.stage === currentStage) || STAGES_METADATA[0];

  // Cálculo de progresso considerando o escopo do plano
  const planQuestions = ASSESSMENT_QUESTIONS.filter((q) => q.stage <= maxStage);
  const totalQuestions = planQuestions.length;
  const answeredQuestionsCount = Object.keys(answers).filter((qId) =>
    planQuestions.some((q) => q.id === qId)
  ).length;
  const globalProgressPercentage = Math.round((answeredQuestionsCount / Math.max(1, totalQuestions)) * 100);

  // Validação da etapa antes de avançar
  const validateCurrentStage = (): boolean => {
    for (const q of stageQuestions) {
      if (!q.required) continue;
      const ans = answers[q.id];

      if (ans === undefined || ans === null || ans === '') {
        setValidationError(`Por favor, responda à pergunta: "${q.title}" antes de prosseguir.`);
        return false;
      }

      // Validação de pergunta pareada de importância e satisfação
      if (q.type === 'importance_satisfaction') {
        if (!ans || typeof ans !== 'object' || !ans.importance || !ans.satisfaction) {
          setValidationError(`Por favor, defina tanto a Importância quanto a Satisfação em "${q.title}".`);
          return false;
        }
      }

      // Validação de múltipla escolha
      if (q.type === 'multi_choice') {
        if (!Array.isArray(ans) || ans.length === 0) {
          setValidationError(`Por favor, selecione ao menos uma opção em "${q.title}".`);
          return false;
        }
      }

      // Validação de reflexão curta
      if (q.type === 'short_text') {
        if (typeof ans !== 'string' || ans.trim().length < 3) {
          setValidationError(`Por favor, escreva ao menos uma frase reflexiva (mínimo de 3 caracteres) em "${q.title}".`);
          return false;
        }
      }
    }
    setValidationError(null);
    return true;
  };

  // Avançar etapa
  const handleNextStage = () => {
    if (!validateCurrentStage()) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    if (currentStage < maxStage) {
      const next = currentStage + 1;
      setCurrentStage(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Atualizar no storage
      try {
        const savedSession = localStorage.getItem('mapa_rumo_session');
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          parsed.currentStage = next;
          localStorage.setItem('mapa_rumo_session', JSON.stringify(parsed));
        }
      } catch {
        // ignore
      }
    }
  };

  // Voltar etapa
  const handlePrevStage = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
      setValidationError(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Finalizar questionário
  const handleSubmitAssessment = async () => {
    if (!validateCurrentStage()) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    try {
      const res = await fetch('/api/mapa/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          accessToken,
          participantName: participantName || 'Participante',
          participantEmail: participantEmail || '',
          answers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setValidationError(data.error || data.message || 'Dados insuficientes ou inválidos para concluir o diagnóstico.');
        window.scrollTo({ top: 120, behavior: 'smooth' });
        return;
      }

      if (data.report) {
        localStorage.setItem('mapa_rumo_result', JSON.stringify(data));
        router.push(`/mapa/relatorio?session_id=${sessionId}&token=${accessToken}`);
        return;
      }

      if (data.preview) {
        localStorage.setItem('mapa_rumo_result', JSON.stringify(data));
        router.push('/mapa/previa');
        return;
      }

      throw new Error('Formato de resposta inesperado.');
    } catch (err: any) {
      console.error('Erro na finalização do questionário:', err);
      setValidationError(err.message || 'Falha ao processar diagnóstico.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-clarity-mask="true" className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* MODAL DE ACESSO BLOQUEADO / CHECKOUT NECESSÁRIO (ANTI-TAMPERING & CLAREZA COMERCIAL) */}
      {unauthorizedPaidModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-borderWarm animate-scaleUp">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-terracotta-50 text-terracotta-800 border border-terracotta-200 mb-3">
              <Lock className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Acesso ao Diagnóstico Completo Bloqueado</span>
            </div>

            <h3 className="font-serif text-2xl font-semibold text-charcoal-500 mb-2">
              Confirmação de Pagamento Necessária
            </h3>

            <p className="text-xs sm:text-sm text-charcoal-300 leading-relaxed mb-4">
              O <strong>Diagnóstico Completo (48 perguntas, 8 dimensões integradas, Matriz de Fricções e Plano de 30 Dias)</strong> é um recurso exclusivo de R$ 67,00 e requer confirmação de pagamento no servidor.
            </p>

            {unauthorizedStageAttempt && unauthorizedStageAttempt > 3 ? (
              <div className="p-3.5 rounded-xl bg-ivory-100 border border-borderWarm text-xs text-charcoal-400 mb-6">
                Você tentou acessar diretamente a <strong>Etapa 0{unauthorizedStageAttempt}</strong>. As etapas 4 a 6 são liberadas após o pagamento. Suas respostas anteriores estão seguras.
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-ivory-100 border border-borderWarm text-xs text-charcoal-400 mb-6">
                Para liberar o questionário completo com todas as 48 perguntas em 6 etapas, conclua seu pedido na página segura de checkout.
              </div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  const sParam = sessionId && accessToken ? `&session_id=${sessionId}&token=${accessToken}` : '';
                  window.location.href = `/mapa/checkout?plan=complete${sParam}`;
                }}
                className="w-full py-3.5 rounded-xl text-xs font-bold bg-cobalt-500 hover:bg-cobalt-600 active:scale-[0.98] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Ir para o Checkout Seguro — R$ 67,00</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUnauthorizedPaidModalOpen(false);
                  setSelectedPlan('free');
                  setCurrentStage(1);
                }}
                className="w-full py-3 rounded-xl text-xs font-semibold bg-ivory-100 hover:bg-ivory-200 text-charcoal-400 hover:text-charcoal-600 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Fazer a Prévia Gratuita (3 Dimensões • 24 perguntas)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {!isLeadRegistered ? (
        /* ETAPA 0: CADASTRO INICIAL OBRIGATÓRIO (PRÉ-QUESTIONÁRIO) */
        <div className="bg-white rounded-3xl border border-borderWarm p-6 sm:p-10 shadow-lg animate-fadeIn">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sage-50 text-sage-800 border border-sage-200 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-sage-700" />
            <span>Etapa 00 • Identificação do Participante</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal-500 tracking-tight mb-2">
            Antes de iniciar o diagnóstico
          </h1>
          <p className="text-sm text-charcoal-300 leading-relaxed mb-6">
            Informe seu nome completo e e-mail corporativo ou pessoal. Seus dados serão usados para calibrar a devolutiva e enviar uma cópia estruturada em PDF do seu relatório ao concluir.
          </p>

          <form onSubmit={handleRegisterLead} className="space-y-5">
            <div>
              <label htmlFor="leadNameInput" className="block text-xs font-semibold text-charcoal-500 mb-1.5">
                Nome Completo <span className="text-terracotta-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="leadNameInput"
                  type="text"
                  value={participantName}
                  onChange={(e) => {
                    handleNameChange(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder="Ex: João Santos"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-borderWarm focus:border-sage-700 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal-500 bg-ivory-50/50 transition-all"
                  autoFocus
                />
                <User className="w-4 h-4 text-charcoal-300 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-charcoal-200 mt-1">
                Mínimo de 3 caracteres. Nomes com acentos ou hífens são aceitos normalmente.
              </p>
            </div>

            <div>
              <label htmlFor="leadEmailInput" className="block text-xs font-semibold text-charcoal-500 mb-1.5">
                E-mail para Envio do Relatório em PDF <span className="text-terracotta-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="leadEmailInput"
                  type="email"
                  value={participantEmail}
                  onChange={(e) => {
                    setParticipantEmail(e.target.value);
                    setValidationError(null);
                  }}
                  placeholder="Ex: joao@exemplo.com.br"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-borderWarm focus:border-sage-700 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-charcoal-500 bg-ivory-50/50 transition-all"
                />
                <Mail className="w-4 h-4 text-charcoal-300 absolute left-3.5 top-3.5" />
              </div>
              <p className="text-[11px] text-charcoal-200 mt-1">
                Uma cópia do diagnóstico em PDF será gerada e enviada para este endereço.
              </p>
            </div>

            {isTesterVIP && (
              <div className="p-3.5 rounded-xl bg-sage-50 border border-sage-200 text-xs text-sage-800 font-semibold flex items-center gap-2 animate-fadeIn">
                <Sparkles className="w-4 h-4 text-sage-700" />
                <span>Modo VIP Reconhecido: seu relatório completo será liberado sem custos.</span>
              </div>
            )}

            {validationError && (
              <div className="p-4 rounded-xl bg-terracotta-50 border border-terracotta-200 text-xs text-terracotta-700 flex items-start gap-2.5 animate-fadeIn">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-terracotta-600" />
                <span>{validationError}</span>
              </div>
            )}

            <div className="pt-4 border-t border-borderWarm flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-charcoal-200">
                <span className="font-semibold text-charcoal-500">Privacidade:</span> dados confidenciais e protegidos.
              </span>

              <button
                type="submit"
                disabled={isRegisteringLead}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-sage-800 hover:bg-sage-900 text-white transition-all shadow-md disabled:opacity-50"
              >
                {isRegisteringLead ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Validando cadastro...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Diagnóstico Estratégico</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Chip de Identificação do Participante */}
          <div className="mb-6 px-4 py-2.5 rounded-xl bg-white border border-borderWarm shadow-xs flex items-center justify-between text-xs text-charcoal-300">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-charcoal-500">{participantName}</span>
              <span>•</span>
              <span className="text-charcoal-400">{participantEmail}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsLeadRegistered(false)}
              className="text-[11px] text-sage-800 hover:text-sage-900 font-semibold underline"
            >
              Alterar dados
            </button>
          </div>

          {/* Barra de Progresso Superior */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs text-charcoal-300 mb-2">
              <span className="font-semibold text-charcoal-500">
                Etapa {currentStage} de {maxStage} — {currentStageMeta.title}
              </span>
              <span className="flex items-center gap-2">
                {isSaving ? (
                  <span className="text-cobalt-600 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Salvando...
                  </span>
                ) : (
                  <span className="text-sage-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-sage-800" />
                    Salvo automaticamente
                  </span>
                )}
                <span className="font-mono font-medium text-charcoal-400">
                  {globalProgressPercentage}%
                </span>
              </span>
            </div>

            <div className="w-full h-2 bg-borderWarm rounded-full overflow-hidden">
              <div
                className="h-full bg-cobalt-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.max(8, globalProgressPercentage)}%` }}
              />
            </div>
          </div>

          {/* Alerta de Respostas Aproveitadas do Diagnóstico Gratuito */}
          {answersRestoredNotice && (
            <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-sage-50 border border-sage-300 text-sage-900 shadow-xs flex items-start justify-between gap-3 animate-fadeIn">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-sage-700 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-sage-900">
                    Respostas das Etapas 1 a 3 recuperadas com sucesso!
                  </p>
                  <p className="text-xs text-sage-800 mt-0.5">
                    Suas 24 respostas do Diagnóstico Gratuito foram automaticamente vinculadas à sua sessão. Você está continuando diretamente a partir da Etapa 4 para as dimensões aprofundadas.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAnswersRestoredNotice(false)}
                className="text-xs text-sage-700 hover:text-sage-900 font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Cabeçalho da Etapa Atual */}
          <div className="mb-8 pb-6 border-b border-borderWarm">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-cobalt-50 text-cobalt-700 border border-cobalt-200 mb-3">
              <span>ETAPA 0{currentStage} DE 0{maxStage}</span>
              <span>•</span>
              <Clock className="w-3 h-3" />
              <span>~{currentStageMeta.estimatedMinutes} min</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-charcoal-500 tracking-tight mb-2">
              {currentStageMeta.title}
            </h1>
            <p className="text-sm text-charcoal-200 leading-relaxed">
              {currentStageMeta.subtitle}
            </p>
          </div>

      {/* Alerta de Validação */}
      {validationError && (
        <div className="mb-8 p-4 rounded-xl bg-terracotta-50 border border-terracotta-200 text-xs text-terracotta-700 flex items-start gap-2.5 animate-fadeIn">
          <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-terracotta-600" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Lista de Perguntas da Etapa */}
      <div className="space-y-10 mb-12">
        {stageQuestions.map((q, idx) => (
          <div
            key={q.id}
            className="p-6 sm:p-7 rounded-2xl bg-white border border-borderWarm shadow-xs hover:border-borderWarm/90 transition-all"
          >
            {/* Título e Instruções da Pergunta */}
            <div className="mb-5">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cobalt-600">
                  Questão {q.order} de {totalQuestions}
                </span>
                {!q.required && (
                  <span className="text-[11px] text-charcoal-200 bg-ivory-100 px-2 py-0.5 rounded">
                    Opcional
                  </span>
                )}
              </div>

              <h2 className="font-serif text-lg sm:text-xl font-semibold text-charcoal-500 leading-snug">
                {q.title}
              </h2>

              {q.instruction && (
                <p className="text-xs text-charcoal-200 mt-1 leading-relaxed">
                  {q.instruction}
                </p>
              )}
            </div>

            {/* Renderizador de Tipos de Pergunta */}

            {/* 1. Múltipla Escolha Exclusiva (Single Choice) */}
            {q.type === 'single_choice' && q.options && (
              <div className="space-y-2.5">
                {q.options.map((opt) => {
                  const isSelected = answers[q.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleAnswerChange(q.id, opt.value)}
                      className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-cobalt-500 bg-cobalt-50/50 shadow-2xs text-charcoal-500'
                          : 'border-borderWarm bg-white hover:bg-ivory-50 text-charcoal-400'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? 'border-cobalt-500 bg-cobalt-500 text-white'
                            : 'border-charcoal-200 bg-white'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <span className="font-semibold block leading-tight">{opt.label}</span>
                        {opt.description && (
                          <span className="text-xs text-charcoal-200 mt-0.5 block leading-relaxed">
                            {opt.description}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 2. Múltipla Escolha com Seleções Múltiplas */}
            {q.type === 'multi_choice' && q.options && (
              <div className="space-y-2.5">
                <div className="text-[11px] text-charcoal-200 mb-1">
                  {q.maxSelections
                    ? `Selecione até ${q.maxSelections} opções (${(answers[q.id] || []).length} selecionadas)`
                    : 'Selecione todas as opções que se aplicam'}
                </div>
                {q.options.map((opt) => {
                  const currentVals: string[] = Array.isArray(answers[q.id]) ? answers[q.id] : [];
                  const isSelected = currentVals.includes(opt.value);

                  const toggleSelection = () => {
                    let nextVals = [...currentVals];
                    if (isSelected) {
                      nextVals = nextVals.filter((v) => v !== opt.value);
                    } else {
                      if (q.maxSelections && nextVals.length >= q.maxSelections) {
                        nextVals.shift(); // Remove a primeira selecionada para dar espaço
                      }
                      nextVals.push(opt.value);
                    }
                    handleAnswerChange(q.id, nextVals);
                  };

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={toggleSelection}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-cobalt-500 bg-cobalt-50/50 shadow-2xs text-charcoal-500'
                          : 'border-borderWarm bg-white hover:bg-ivory-50 text-charcoal-400'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? 'border-cobalt-500 bg-cobalt-500 text-white'
                            : 'border-charcoal-200 bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="leading-snug">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 3. Escala Likert de 1 a 5 */}
            {q.type === 'likert_5' && (
              <div>
                <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-2.5">
                  {[1, 2, 3, 4, 5].map((val) => {
                    const isSelected = Number(answers[q.id]) === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleAnswerChange(q.id, val)}
                        className={`py-3.5 rounded-xl border text-sm font-bold transition-all text-center ${
                          isSelected
                            ? 'border-cobalt-500 bg-cobalt-500 text-white shadow-xs scale-[1.02]'
                            : 'border-borderWarm bg-ivory-50 hover:bg-white text-charcoal-400'
                        }`}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-charcoal-200 px-1">
                  <span>{q.leftAnchor || '1 — Pouco'}</span>
                  <span>{q.rightAnchor || '5 — Muito'}</span>
                </div>
              </div>
            )}

            {/* 4. Medição Pareada de Importância e Satisfação (Etapa 2) */}
            {q.type === 'importance_satisfaction' && (
              <div className="space-y-4 pt-2">
                {/* Linha 1: Importância para Você */}
                <div className="p-3.5 rounded-xl bg-ivory-50 border border-borderWarm/70">
                  <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500 mb-2">
                    <span>1. Quanto isso é importante para você?</span>
                    <span className="font-mono text-cobalt-600 font-bold">
                      {answers[q.id]?.importance ? `${answers[q.id].importance}/5` : 'Selecione'}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const isSelected = answers[q.id]?.importance === val;
                      return (
                        <button
                          key={`imp-${val}`}
                          type="button"
                          onClick={() => {
                            const cur = answers[q.id] || {};
                            handleAnswerChange(q.id, { ...cur, importance: val });
                          }}
                          className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                            isSelected
                              ? 'border-cobalt-500 bg-cobalt-500 text-white shadow-2xs'
                              : 'border-borderWarm bg-white hover:bg-ivory-100 text-charcoal-400'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-charcoal-200 px-0.5 mt-1">
                    <span>1 (Secundário)</span>
                    <span>5 (Fundamental)</span>
                  </div>
                </div>

                {/* Linha 2: Satisfação Atual na Rotina */}
                <div className="p-3.5 rounded-xl bg-ivory-50 border border-borderWarm/70">
                  <div className="flex items-center justify-between text-xs font-semibold text-charcoal-500 mb-2">
                    <span>2. Qual é a sua satisfação com isso hoje?</span>
                    <span className="font-mono text-sage-800 font-bold">
                      {answers[q.id]?.satisfaction ? `${answers[q.id].satisfaction}/5` : 'Selecione'}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const isSelected = answers[q.id]?.satisfaction === val;
                      return (
                        <button
                          key={`sat-${val}`}
                          type="button"
                          onClick={() => {
                            const cur = answers[q.id] || {};
                            handleAnswerChange(q.id, { ...cur, satisfaction: val });
                          }}
                          className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                            isSelected
                              ? 'border-sage-700 bg-sage-700 text-white shadow-2xs'
                              : 'border-borderWarm bg-white hover:bg-ivory-100 text-charcoal-400'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-charcoal-200 px-0.5 mt-1">
                    <span>1 (Muito insatisfeito)</span>
                    <span>5 (Plenamente satisfeito)</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Tensão Situacional (Slider ou Escala de Equilíbrio) */}
            {q.type === 'tension_slider' && (
              <div className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-ivory-50 border border-borderWarm text-xs text-charcoal-400">
                    <span className="text-[10px] uppercase font-bold text-cobalt-600 block mb-1">
                      Polo A (1 — 2)
                    </span>
                    {q.leftAnchor}
                  </div>
                  <div className="p-3 rounded-xl bg-ivory-50 border border-borderWarm text-xs text-charcoal-400">
                    <span className="text-[10px] uppercase font-bold text-terracotta-600 block mb-1">
                      Polo B (4 — 5)
                    </span>
                    {q.rightAnchor}
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5].map((val) => {
                    const isSelected = Number(answers[q.id]) === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleAnswerChange(q.id, val)}
                        className={`py-3 rounded-xl border text-xs sm:text-sm font-bold transition-all text-center ${
                          isSelected
                            ? 'border-charcoal-500 bg-charcoal-500 text-white shadow-xs scale-[1.02]'
                            : 'border-borderWarm bg-white hover:bg-ivory-100 text-charcoal-400'
                        }`}
                      >
                        {val === 3 ? 'Equilíbrio (3)' : val}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. Campo de Texto Curto Reflexivo */}
            {q.type === 'short_text' && (
              <div>
                <textarea
                  rows={3}
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder={q.placeholder || 'Digite sua reflexão aqui...'}
                  className="w-full p-4 rounded-xl border border-borderWarm focus:border-cobalt-500 focus:ring-2 focus:ring-cobalt-100 text-xs sm:text-sm text-charcoal-500 outline-none bg-ivory-50 transition-all resize-none"
                />
                <span className="text-[10px] text-charcoal-200 text-right block mt-1">
                  {(answers[q.id] || '').length} caracteres
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navegação Inferior */}
      <div className="sticky bottom-4 z-30 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-borderWarm shadow-xl flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handlePrevStage}
          disabled={currentStage === 1}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            currentStage === 1
              ? 'opacity-40 cursor-not-allowed text-charcoal-200'
              : 'text-charcoal-400 hover:text-charcoal-500 hover:bg-ivory-100'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Etapa Anterior</span>
        </button>

        {currentStage < maxStage ? (
          <button
            type="button"
            onClick={handleNextStage}
            className="px-6 py-3 rounded-xl text-xs font-semibold bg-cobalt-500 hover:bg-cobalt-600 text-white shadow-sm hover:shadow-md transition-all flex items-center gap-2 group"
          >
            <span>Avançar para Etapa 0{currentStage + 1}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitAssessment}
            disabled={isSubmitting}
            className="px-7 py-3 rounded-xl text-xs font-semibold bg-cobalt-500 hover:bg-cobalt-600 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 group"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Calculando seus resultados...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-warmCream" />
                <span>
                  {isFreePlan
                    ? 'Finalizar Diagnóstico Gratuito (3 Dimensões)'
                    : 'Finalizar e Ver Relatório Completo'}
                </span>
              </>
            )}
          </button>
        )}
      </div>
        </>
      )}
    </div>
  );
}

export default function QuestionarioPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-cobalt-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <QuestionarioContent />
    </React.Suspense>
  );
}
