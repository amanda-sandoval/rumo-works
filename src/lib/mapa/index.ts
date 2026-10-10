import { AssessmentResultData, PreviewData, FullReportData } from './types';
import { calculateAssessmentScores, RawAnswerMap } from './engine/scoring';
import { generateInterpretations } from './engine/interpretation';
import { generateActionPlan } from './engine/actionPlanGenerator';

export * from './types';
export * from './content/questions';
export * from './engine/scoring';
export * from './engine/interpretation';
export * from './engine/actionPlanGenerator';

/**
 * Executa o motor completo do Mapa Rumo a partir das respostas do usuário
 */
export function processAssessment(answers: RawAnswerMap): AssessmentResultData {
  const { scores, radarData, gaps } = calculateAssessmentScores(answers);
  const { pills, observations, priorities } = generateInterpretations(answers, scores, gaps);
  const actionPlan = generateActionPlan(answers);

  return {
    scores,
    radarData,
    gaps,
    pills,
    observations,
    priorities,
    actionPlan,
    engineVersion: '1.0.0',
  };
}
