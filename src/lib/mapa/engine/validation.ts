import { ASSESSMENT_QUESTIONS } from '../content/questions';
import { Question } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errorCode?: 'INSUFFICIENT_DATA' | 'INVALID_FREE_SUBMISSION' | 'INVALID_SUBMISSION' | 'PAYMENT_REQUIRED';
  errorMessage?: string;
  missingQuestions?: string[];
  invalidQuestions?: Array<{ id: string; reason: string }>;
  answeredCount: number;
  expectedCount: number;
}

/**
 * Validador estrito de submissões do diagnóstico do Mapa Rumo.
 * Garante que:
 * 1. Nenhuma chave desconhecida seja aceita (anti-tampering).
 * 2. O fluxo gratuito (etapas 1-3) aceite exclusivamente as 24 perguntas dessas etapas.
 * 3. O fluxo completo (etapas 1-6) exija todas as 48 perguntas devidamente respondidas.
 * 4. Tipos de dados, opções permitidas e intervalos (likert, sliders, etc.) sejam respeitados.
 */
export function validateSubmission(
  answers: Record<string, any>,
  scope: 'free' | 'complete'
): ValidationResult {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return {
      isValid: false,
      errorCode: 'INSUFFICIENT_DATA',
      errorMessage: 'Nenhuma resposta válida foi enviada.',
      answeredCount: 0,
      expectedCount: scope === 'free' ? 24 : 48,
    };
  }

  // Escopo de perguntas
  const targetQuestions = scope === 'free'
    ? ASSESSMENT_QUESTIONS.filter((q) => q.stage <= 3)
    : ASSESSMENT_QUESTIONS;

  const allQuestionIds = new Set(ASSESSMENT_QUESTIONS.map((q) => q.id));

  // Bloqueio no fluxo gratuito: rejeitar perguntas das etapas 4 a 6
  if (scope === 'free') {
    const stage4to6Questions = ASSESSMENT_QUESTIONS.filter((q) => q.stage > 3);
    const hasForbiddenStage = stage4to6Questions.some(
      (q) => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id] !== ''
    );
    if (hasForbiddenStage) {
      return {
        isValid: false,
        errorCode: 'INVALID_FREE_SUBMISSION',
        errorMessage:
          'O diagnóstico gratuito aceita exclusivamente perguntas das etapas 1 a 3. Perguntas das etapas 4 a 6 requerem confirmação de pagamento no servidor.',
        answeredCount: Object.keys(answers).length,
        expectedCount: 24,
      };
    }
  }

  // Anti-tampering: rejeitar IDs desconhecidos
  const unknownIds = Object.keys(answers).filter((id) => !allQuestionIds.has(id));
  if (unknownIds.length > 0) {
    return {
      isValid: false,
      errorCode: 'INVALID_SUBMISSION',
      errorMessage: `Payload contém identificadores desconhecidos: ${unknownIds.join(', ')}`,
      answeredCount: Object.keys(answers).length,
      expectedCount: targetQuestions.length,
    };
  }

  // Checagem de completude e validação de valores
  const missingQuestions: string[] = [];
  const invalidQuestions: Array<{ id: string; reason: string }> = [];

  for (const q of targetQuestions) {
    const val = answers[q.id];

    if (val === undefined || val === null || val === '') {
      missingQuestions.push(q.id);
      continue;
    }

    switch (q.type) {
      case 'likert_5':
      case 'tension_slider': {
        const num = Number(val);
        if (!Number.isInteger(num) || num < 1 || num > 5) {
          invalidQuestions.push({
            id: q.id,
            reason: `Valor deve ser um inteiro entre 1 e 5. Recebido: ${JSON.stringify(val)}`,
          });
        }
        break;
      }
      case 'single_choice': {
        const allowed = (q.options || []).map((o) => o.value);
        if (typeof val !== 'string' || !allowed.includes(val)) {
          invalidQuestions.push({
            id: q.id,
            reason: `Opção inválida "${val}". Permitidas: ${allowed.join(', ')}`,
          });
        }
        break;
      }
      case 'multi_choice': {
        const allowed = (q.options || []).map((o) => o.value);
        if (
          !Array.isArray(val) ||
          val.length === 0 ||
          !val.every((v) => typeof v === 'string' && allowed.includes(v))
        ) {
          invalidQuestions.push({
            id: q.id,
            reason: `Array de múltipla escolha inválido ou vazio para: ${q.id}`,
          });
        }
        break;
      }
      case 'importance_satisfaction': {
        if (!val || typeof val !== 'object') {
          invalidQuestions.push({
            id: q.id,
            reason: `Objeto de importância e satisfação esperado para: ${q.id}`,
          });
        } else {
          const imp = Number(val.importance);
          const sat = Number(val.satisfaction);
          if (
            !Number.isInteger(imp) ||
            imp < 1 ||
            imp > 5 ||
            !Number.isInteger(sat) ||
            sat < 1 ||
            sat > 5
          ) {
            invalidQuestions.push({
              id: q.id,
              reason: `Importância e Satisfação devem ser inteiros entre 1 e 5 para: ${q.id}`,
            });
          }
        }
        break;
      }
      case 'short_text': {
        if (typeof val !== 'string' || val.trim().length < 3) {
          invalidQuestions.push({
            id: q.id,
            reason: `Texto reflexivo deve conter ao menos 3 caracteres para: ${q.id}`,
          });
        }
        break;
      }
    }
  }

  if (missingQuestions.length > 0) {
    return {
      isValid: false,
      errorCode: 'INSUFFICIENT_DATA',
      errorMessage: `Existem ${missingQuestions.length} perguntas obrigatórias pendentes para este diagnóstico.`,
      missingQuestions,
      invalidQuestions,
      answeredCount: targetQuestions.length - missingQuestions.length,
      expectedCount: targetQuestions.length,
    };
  }

  if (invalidQuestions.length > 0) {
    return {
      isValid: false,
      errorCode: 'INVALID_SUBMISSION',
      errorMessage: `Existem ${invalidQuestions.length} respostas inválidas ou fora do intervalo permitido.`,
      invalidQuestions,
      answeredCount: targetQuestions.length,
      expectedCount: targetQuestions.length,
    };
  }

  return {
    isValid: true,
    answeredCount: targetQuestions.length,
    expectedCount: targetQuestions.length,
  };
}
