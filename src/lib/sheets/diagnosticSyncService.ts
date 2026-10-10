import { googleSheetsService, DiagnosticSheetRow, AnswerSheetRow, DimensionResultSheetRow } from './googleSheetsService';
import { AssessmentResultData } from '../mapa/types';
import { ASSESSMENT_QUESTIONS } from '../mapa/content/questions';

export interface SyncDiagnosticParams {
  sessionId: string;
  pseudonymId?: string;
  participantName?: string | null;
  participantEmail?: string | null;
  answers: Record<string, any>;
  resultData: AssessmentResultData;
  isUnlocked: boolean;
  isFreePlan?: boolean;
}

/**
 * Sincroniza um diagnóstico completado com a planilha privada do Google Sheets
 * Executa em background com resiliência total a falhas (não bloqueia o usuário).
 */
export async function syncDiagnosticToPrivateSheets(params: SyncDiagnosticParams): Promise<void> {
  const { sessionId, pseudonymId, answers, resultData, isUnlocked, isFreePlan } = params;

  try {
    const nowIso = new Date().toISOString();
    const effectivePseudoId = pseudonymId || sessionId.slice(0, 12);

    // 1. Linha principal na aba Diagnosticos
    const diagnosticRow: DiagnosticSheetRow = {
      diagnostic_id: sessionId,
      pseudonym_id: effectivePseudoId,
      started_at: nowIso,
      completed_at: nowIso,
      status: isUnlocked ? 'COMPLETED_FULL' : isFreePlan ? 'COMPLETED_FREE' : 'COMPLETED_PREVIEW',
      questionnaire_version: '3.0',
      scoring_version: '3.0-8dim',
      report_version: '3.0',
      preview_generated: true,
      report_purchased: isUnlocked,
      report_generated: isUnlocked,
      primary_goal_category: answers.e6_q6_prioridade_central || 'foco_organizacao',
      completion_duration_seconds: isFreePlan ? 300 : 750,
      source: 'web_production',
    };

    // 2. Linhas na aba Resultados_Dimensoes (8 dimensões)
    const dimensionRows: DimensionResultSheetRow[] = (resultData.radarData || []).map((radarItem) => ({
      diagnostic_id: sessionId,
      dimension_id: radarItem.dimensionKey,
      score: radarItem.score,
      score_scale_version: '100_normalized',
      interpretation_rule_version: 'v3_deterministic',
      generated_at: nowIso,
    }));

    // 3. Linhas na aba Respostas (perguntas respondidas)
    const answerRows: AnswerSheetRow[] = [];
    Object.entries(answers).forEach(([questionId, rawValue]) => {
      const qMeta = ASSESSMENT_QUESTIONS.find((q) => q.id === questionId);
      const dimensionId = qMeta?.dimensionsRelated?.[0] || 'geral';
      const answerType = qMeta?.type || 'unknown';

      let formattedValue = '';
      if (typeof rawValue === 'object' && rawValue !== null) {
        formattedValue = JSON.stringify(rawValue);
      } else {
        formattedValue = String(rawValue);
      }

      answerRows.push({
        diagnostic_id: sessionId,
        question_id: questionId,
        dimension_id: dimensionId,
        answer_type: answerType,
        answer_value: formattedValue,
        questionnaire_version: '3.0',
      });
    });

    // Enviar para o Google Sheets em paralelo
    await Promise.allSettled([
      googleSheetsService.appendDiagnostic(diagnosticRow),
      googleSheetsService.appendDimensionResults(dimensionRows),
      googleSheetsService.appendAnswers(answerRows),
    ]);
  } catch (err) {
    console.warn('[DiagnosticSyncService] Erro não-bloqueante na sincronização com Google Sheets:', err);
  }
}
