'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ASSESSMENT_QUESTIONS,
  STAGES_METADATA,
} from '@/lib/mapa/content/questions';
import { Question } from '@/lib/mapa/types';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  Loader2,
} from 'lucide-react';

export default function QuestionarioPage() {
  const router = useRouter();

  // Estados de Sessão e Respostas
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState<string>('');
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Inicialização da sessão e restauração do localStorage
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

        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.id && parsed.accessToken) {
            setSessionId(parsed.id);
            setAccessToken(parsed.accessToken);
            setParticipantName(parsed.participantName || '');
            if (parsed.currentStage && parsed.currentStage >= 1 && parsed.currentStage <= 6) {
              setCurrentStage(parsed.currentStage);
            }
            return;
          }
        }

        // Se não houver sessão válida salva, cria uma nova
        const res = await fetch('/api/mapa/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const data = await res.json();
        if (data.session) {
          setSessionId(data.session.id);
          setAccessToken(data.session.accessToken);
          localStorage.setItem('mapa_rumo_session', JSON.stringify(data.session));
        }
      } catch (err) {
        console.error('Erro ao inicializar sessão:', err);
      }
    }

    initSession();
  }, []);

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

  // Perguntas do estágio atual
  const stageQuestions = ASSESSMENT_QUESTIONS.filter((q) => q.stage === currentStage);
  const currentStageMeta = STAGES_METADATA.find((s) => s.stage === currentStage) || STAGES_METADATA[0];

  // Cálculo de progresso global
  const totalQuestions = ASSESSMENT_QUESTIONS.length;
  const answeredQuestionsCount = Object.keys(answers).length;
  const globalProgressPercentage = Math.round((answeredQuestionsCount / totalQuestions) * 100);

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

    if (currentStage < 6) {
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

  // Finalizar e gerar prévia
  const handleSubmitAssessment = async () => {
    if (!validateCurrentStage()) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      let isTester = false;
      const savedSession = localStorage.getItem('mapa_rumo_session');
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          isTester = !!parsed.isTesterMode || !!parsed.isUnlocked;
        } catch {}
      }

      const res = await fetch('/api/mapa/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          accessToken,
          participantName,
          answers,
          isTesterMode: isTester,
        }),
      });

      const data = await res.json();
      if (data.preview || data.report) {
        // Guardar resultado localmente para contingência
        localStorage.setItem('mapa_rumo_result', JSON.stringify(data));
        router.push('/mapa/previa');
      } else {
        throw new Error(data.error || 'Erro ao calcular diagnóstico');
      }
    } catch (err) {
      console.error('Erro na finalização do questionário:', err);
      // Redireciona para a prévia mesmo em caso de contingência
      router.push('/mapa/previa');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Barra de Progresso Superior */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-charcoal-300 mb-2">
          <span className="font-semibold text-charcoal-500">
            Etapa {currentStage} de 6 — {currentStageMeta.title}
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

      {/* Cabeçalho da Etapa Atual */}
      <div className="mb-8 pb-6 border-b border-borderWarm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-cobalt-50 text-cobalt-700 border border-cobalt-200 mb-3">
          <span>ETAPA 0{currentStage}</span>
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

        {currentStage < 6 ? (
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
                <span>Finalizar e Ver Minha Prévia Gratuita</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
