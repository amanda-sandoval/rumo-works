/**
 * Tipagens do Mapa Rumo — Rumo Works
 */

export type QuestionType =
  | 'single_choice'
  | 'multi_choice'
  | 'likert_5'
  | 'importance_satisfaction'
  | 'tension_slider'
  | 'short_text'
  | 'priority_rank';

export type DimensionId =
  | 'motivacaoEnergia'
  | 'ambienteTrabalho'
  | 'valoresLimites'
  | 'colaboracaoComunicacao'
  | 'desenvolvimentoFuturo';

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
  scoreWeights?: Partial<Record<DimensionId, number>>;
}

export interface Question {
  id: string;
  stage: number; // 1 a 6
  order: number;
  title: string;
  instruction?: string;
  type: QuestionType;
  options?: QuestionOption[];
  minSelections?: number;
  maxSelections?: number;
  dimensionsRelated: DimensionId[];
  required: boolean;
  inverted?: boolean;
  placeholder?: string;
  leftAnchor?: string;  // Para tensões e sliders
  rightAnchor?: string; // Para tensões e sliders
}

export interface DimensionScore {
  id: DimensionId;
  name: string;
  score: number; // 0 a 100
  level: 'exploratorio' | 'em_desenvolvimento' | 'estruturado' | 'destaque';
  summary: string;
  sufficiency: 'alta' | 'moderada' | 'amostral';
}

export interface DimensionScores {
  motivacaoEnergia: DimensionScore;
  ambienteTrabalho: DimensionScore;
  valoresLimites: DimensionScore;
  colaboracaoComunicacao: DimensionScore;
  desenvolvimentoFuturo: DimensionScore;
}

export interface MotivatorGap {
  id: string;
  label: string;
  importance: number; // 1 a 5
  satisfaction: number; // 1 a 5
  gap: number; // importance - satisfaction
  status: 'friccao_critica' | 'atencao' | 'alinhado' | 'potencial_recurso';
  insight: string;
}

export type PillCategory =
  | 'MOTIVADOR_CHAVE'
  | 'PRIORIDADE_DECLARADA'
  | 'PREFERENCIA_IDENTIFICADA'
  | 'OPORTUNIDADE_EXPLORACAO'
  | 'POSSIVEL_TENSAO'
  | 'RECURSO_PERCEBIDO'
  | 'TEMA_INVESTIGAR'
  | 'ACAO_PRIORITARIA';

export interface DiagnosticPill {
  id: string;
  label: string;
  category: PillCategory;
  description: string;
  evidence: string;
}

export interface InterpretationItem {
  id: string;
  dimension: DimensionId;
  title: string;
  narrative: string;
  evidence: string;
  practicalImplication: string;
  reflectionQuestion: string;
  suggestedExperiment: string;
  priorityWeight: number;
}

export interface PrioritySynthesis {
  id: string;
  title: string;
  observed: string;
  evidence: string;
  hypothesis: string;
  reflectionQuestion: string;
  concreteAction: string;
}

export interface ActionPlanItem {
  id: string;
  week: 1 | 2 | 3 | 4;
  stageName: string; // "Semana 1: Observar e compreender", etc.
  title: string;
  customRationale: string;
  instructions: string[];
  estimatedMinutes: number;
  expectedOutcome: string;
  completionCriterion: string;
  reflectionQuestion: string;
}

export interface AssessmentResultData {
  scores: DimensionScores;
  radarData: Array<{
    dimension: string;
    dimensionKey: DimensionId;
    score: number;
    fullMark: 100;
    isLocked?: boolean;
  }>;
  gaps: MotivatorGap[];
  pills: DiagnosticPill[];
  observations: InterpretationItem[];
  priorities: PrioritySynthesis[];
  actionPlan: ActionPlanItem[];
  engineVersion: string;
}

export interface PreviewData {
  sessionId: string;
  participantName?: string | null;
  scores: DimensionScores;
  radarData: Array<{
    dimension: string;
    dimensionKey: DimensionId;
    score: number;
    fullMark: 100;
    isLocked?: boolean;
  }>;
  initialObservations: InterpretationItem[];
  deepReflectionQuestion: string;
  initialActionSuggestion: string;
  isUnlocked: false;
  isFreePlan?: boolean;
}

export interface FullReportData {
  sessionId: string;
  accessToken: string;
  participantName?: string | null;
  participantEmail?: string | null;
  scores: DimensionScores;
  radarData: Array<{
    dimension: string;
    dimensionKey: DimensionId;
    score: number;
    fullMark: 100;
  }>;
  gaps: MotivatorGap[];
  pills: DiagnosticPill[];
  observations: InterpretationItem[];
  priorities: PrioritySynthesis[];
  actionPlan: ActionPlanItem[];
  engineVersion: string;
  generatedAt: string;
  isUnlocked: true;
}
