import {
  DimensionId,
  DimensionScore,
  DimensionScores,
  MotivatorGap,
} from '../types';

export interface RawAnswerMap {
  [questionId: string]: any;
}

export const DIMENSION_CONFIG: Record<
  DimensionId,
  { name: string; summaryBase: string }
> = {
  motivacaoEnergia: {
    name: 'Motivação e Energia',
    summaryBase: 'Avalia as fontes de vigor, satisfação intrínseca e o balanço entre esforço e realização cotidiana.',
  },
  valoresLimites: {
    name: 'Valores e Limites',
    summaryBase: 'Avalia coerência ética, preservação de limites pessoais e capacidade de sustentar acordos saudáveis.',
  },
  ambienteEstrutura: {
    name: 'Ambiente e Estrutura',
    summaryBase: 'Avalia autonomia, ritmo sustentável, organização de processos e flexibilidade de contexto.',
  },
  clarezaDirecao: {
    name: 'Clareza de Direção',
    summaryBase: 'Avalia nitidez de objetivos futuros, visão estratégica da trajetória e maturidade de escolhas.',
  },
  forcasCompetencias: {
    name: 'Forças e Competências',
    summaryBase: 'Avalia a consciência e o aproveitamento de talentos naturais, diferenciais técnicos e repertório autoral.',
  },
  comunicacaoInfluencia: {
    name: 'Comunicação e Influência',
    summaryBase: 'Avalia assertividade no diálogo, capacidade de escuta, alinhamento interpessoal e influência construtiva.',
  },
  priorizacaoExecucao: {
    name: 'Priorização e Execução',
    summaryBase: 'Avalia foco no essencial, gestão da sobrecarga de urgências e entrega consistente com qualidade.',
  },
  aprendizagemAdaptabilidade: {
    name: 'Aprendizagem e Adaptabilidade',
    summaryBase: 'Avalia prontidão para absorver feedbacks, flexibilidade diante de mudanças e curiosidade intelectual.',
  },
  // Aliases para retrocompatibilidade
  ambienteTrabalho: {
    name: 'Ambiente e Estrutura',
    summaryBase: 'Avalia autonomia, ritmo sustentável, organização de processos e flexibilidade de contexto.',
  },
  colaboracaoComunicacao: {
    name: 'Comunicação e Influência',
    summaryBase: 'Avalia assertividade no diálogo, capacidade de escuta, alinhamento interpessoal e influência construtiva.',
  },
  desenvolvimentoFuturo: {
    name: 'Clareza de Direção',
    summaryBase: 'Avalia nitidez de objetivos futuros, visão estratégica da trajetória e maturidade de escolhas.',
  },
};

export const MOTIVATOR_LABELS: Record<string, string> = {
  e2_m1_autonomia: 'Autonomia e liberdade de condução',
  e2_m2_aprendizado: 'Aprendizado contínuo e desenvolvimento intelectual',
  e2_m3_resolucao_problemas: 'Resolução de problemas complexos',
  e2_m4_criatividade: 'Criatividade e criação autoral',
  e2_m5_impacto: 'Sentido de utilidade e impacto concreto',
  e2_m6_colaboracao: 'Colaboração próxima e trocas humanas ricas',
  e2_m7_estabilidade: 'Estabilidade, previsibilidade e segurança',
  e2_m8_reconhecimento: 'Reconhecimento explícito e valorização',
  e2_m9_variedade: 'Variedade e dinamismo no dia a dia',
  e2_m10_profundidade: 'Foco profundo e ritmo sustentável de imersão',
};

/**
 * Normaliza e calcula pontuações determinísticas das 8 dimensões e análise de gaps
 */
export function calculateAssessmentScores(answers: RawAnswerMap): {
  scores: DimensionScores;
  radarData: Array<{
    dimension: string;
    dimensionKey: DimensionId;
    score: number;
    fullMark: 100;
  }>;
  gaps: MotivatorGap[];
} {
  // 8 dimensões do Mapa Rumo
  const primaryDimensions: DimensionId[] = [
    'motivacaoEnergia',
    'valoresLimites',
    'ambienteEstrutura',
    'clarezaDirecao',
    'forcasCompetencias',
    'comunicacaoInfluencia',
    'priorizacaoExecucao',
    'aprendizagemAdaptabilidade',
  ];

  // Acumuladores de pontuação e peso por dimensão
  const dimensionPoints: Record<DimensionId, { total: number; maxPossible: number; count: number }> = {
    motivacaoEnergia: { total: 0, maxPossible: 0, count: 0 },
    valoresLimites: { total: 0, maxPossible: 0, count: 0 },
    ambienteEstrutura: { total: 0, maxPossible: 0, count: 0 },
    clarezaDirecao: { total: 0, maxPossible: 0, count: 0 },
    forcasCompetencias: { total: 0, maxPossible: 0, count: 0 },
    comunicacaoInfluencia: { total: 0, maxPossible: 0, count: 0 },
    priorizacaoExecucao: { total: 0, maxPossible: 0, count: 0 },
    aprendizagemAdaptabilidade: { total: 0, maxPossible: 0, count: 0 },
    // Aliases
    ambienteTrabalho: { total: 0, maxPossible: 0, count: 0 },
    colaboracaoComunicacao: { total: 0, maxPossible: 0, count: 0 },
    desenvolvimentoFuturo: { total: 0, maxPossible: 0, count: 0 },
  };

  // Helper para somar pontos
  const addScore = (dimension: DimensionId, points: number, max: number) => {
    if (dimensionPoints[dimension]) {
      dimensionPoints[dimension].total += Math.max(0, Math.min(points, max));
      dimensionPoints[dimension].maxPossible += max;
      dimensionPoints[dimension].count += 1;
    }
  };

  // =========================================================================
  // 1. Processar Etapa 1: Meu momento atual
  // =========================================================================
  if (answers.e1_q1_fase) {
    const faseMap: Record<string, number> = {
      consolidacao: 4.5,
      crescimento_acelerado: 4.5,
      transicao: 3.5,
      reavaliacao: 3.0,
      reestruturacao: 2.5,
    };
    addScore('clarezaDirecao', faseMap[answers.e1_q1_fase] || 3.5, 5);
  }

  if (answers.e1_q2_clareza !== undefined && answers.e1_q2_clareza !== null && answers.e1_q2_clareza !== '') {
    const val = Number(answers.e1_q2_clareza) || 3;
    addScore('clarezaDirecao', val, 5);
  }

  if (answers.e1_q3_satisfacao_geral !== undefined && answers.e1_q3_satisfacao_geral !== null && answers.e1_q3_satisfacao_geral !== '') {
    const val = Number(answers.e1_q3_satisfacao_geral) || 3;
    addScore('motivacaoEnergia', val, 5);
  }

  if (answers.e1_q4_energia_ocupada && Array.isArray(answers.e1_q4_energia_ocupada) && answers.e1_q4_energia_ocupada.length > 0) {
    if (answers.e1_q4_energia_ocupada.includes('sobrecarga_operacional')) {
      addScore('priorizacaoExecucao', 2.5, 5);
    }
    if (answers.e1_q4_energia_ocupada.includes('tomada_decisao')) {
      addScore('priorizacaoExecucao', 3.5, 5);
    }
    if (answers.e1_q4_energia_ocupada.includes('equilibrio_vida')) {
      addScore('valoresLimites', 2.5, 5);
    }
    if (answers.e1_q4_energia_ocupada.includes('falta_clareza')) {
      addScore('clarezaDirecao', 2.0, 5);
    }
  }

  if (answers.e1_q5_desejo_compreensao) {
    const desejoMap: Record<string, { dim: DimensionId; score: number }[]> = {
      motivadores_reais: [
        { dim: 'motivacaoEnergia', score: 4.5 },
        { dim: 'clarezaDirecao', score: 4.0 },
      ],
      estilo_trabalho: [
        { dim: 'ambienteEstrutura', score: 4.5 },
        { dim: 'priorizacaoExecucao', score: 4.2 },
      ],
      relacionamentos: [
        { dim: 'comunicacaoInfluencia', score: 4.5 },
        { dim: 'valoresLimites', score: 4.2 },
      ],
      proximos_passos: [
        { dim: 'clarezaDirecao', score: 4.8 },
        { dim: 'priorizacaoExecucao', score: 4.2 },
      ],
    };
    const mapped = desejoMap[answers.e1_q5_desejo_compreensao];
    if (mapped) {
      mapped.forEach((item) => addScore(item.dim, item.score, 5));
    }
  }

  // =========================================================================
  // 2. Processar Etapa 2: O que me motiva (10 pares Importância vs Satisfação)
  // =========================================================================
  const gaps: MotivatorGap[] = [];

  Object.keys(MOTIVATOR_LABELS).forEach((qId) => {
    const rawVal = answers[qId];
    if (rawVal === undefined || rawVal === null) return;

    let imp = 3;
    let sat = 3;

    if (typeof rawVal === 'object') {
      imp = Number(rawVal.importance) || 3;
      sat = Number(rawVal.satisfaction) || 3;
    } else if (typeof rawVal === 'number') {
      imp = rawVal;
      sat = rawVal;
    }

    const gap = imp - sat;
    let status: MotivatorGap['status'] = 'alinhado';
    let insight = 'Boa sintonia entre o que importa e a realidade prática.';

    if (imp >= 4 && sat <= 2) {
      status = 'friccao_critica';
      insight = 'Valor vital com baixa realização atual. Fonte evidente de desgaste ou desmotivação.';
    } else if (imp >= 4 && sat === 3) {
      status = 'atencao';
      insight = 'Valor de alta importância com espaço relevante para enriquecimento.';
    } else if (sat >= 4 && imp <= 2) {
      status = 'potencial_recurso';
      insight = 'Condição bem atendida no contexto atual, mas com peso secundário para você.';
    } else if (imp >= 4 && sat >= 4) {
      status = 'alinhado';
      insight = 'Motivador central plenamente alimentado. Uma fortaleza da sua rotina atual.';
    }

    gaps.push({
      id: qId,
      label: MOTIVATOR_LABELS[qId],
      importance: imp,
      satisfaction: sat,
      gap,
      status,
      insight,
    });

    // Contribuição pareada para as 8 dimensões (satisfação reflete a realização prática)
    if (['e2_m1_autonomia', 'e2_m2_aprendizado', 'e2_m3_resolucao_problemas', 'e2_m4_criatividade', 'e2_m5_impacto', 'e2_m8_reconhecimento'].includes(qId)) {
      addScore('motivacaoEnergia', sat, 5);
    }
    if (['e2_m5_impacto', 'e2_m7_estabilidade', 'e2_m10_profundidade'].includes(qId)) {
      addScore('valoresLimites', sat, 5);
    }
    if (['e2_m1_autonomia', 'e2_m7_estabilidade', 'e2_m9_variedade', 'e2_m10_profundidade'].includes(qId)) {
      addScore('ambienteEstrutura', sat, 5);
    }
    if (['e2_m3_resolucao_problemas', 'e2_m4_criatividade'].includes(qId)) {
      addScore('forcasCompetencias', sat, 5);
    }
    if (qId === 'e2_m6_colaboracao') {
      addScore('comunicacaoInfluencia', sat, 5);
    }
    if (qId === 'e2_m10_profundidade' || qId === 'e2_m1_autonomia') {
      addScore('priorizacaoExecucao', sat, 5);
    }
    if (qId === 'e2_m2_aprendizado') {
      addScore('aprendizagemAdaptabilidade', sat, 5);
      addScore('clarezaDirecao', sat, 5);
    }
  });

  // =========================================================================
  // 3. Processar Etapa 3: Meus valores e limites (8 tensões situacionais)
  // =========================================================================
  const tensionKeys = [
    'e3_t1_autonomia_orientacao',
    'e3_t2_seguranca_experimentacao',
    'e3_t3_visibilidade_tranquilidade',
    'e3_t4_especializacao_generalismo',
    'e3_t5_velocidade_qualidade',
    'e3_t6_ambicao_equilibrio',
    'e3_t7_independencia_colegiado',
    'e3_t8_estrutura_flexibilidade',
  ];

  tensionKeys.forEach((key) => {
    if (answers[key] === undefined || answers[key] === null || answers[key] === '') return;
    const val = Number(answers[key]) || 3;

    // Respostas deliberadas expressam postura operacional e maturidade de trade-offs
    if (key === 'e3_t1_autonomia_orientacao') {
      addScore('ambienteEstrutura', 2.5 + val * 0.5, 5);
    }
    if (key === 'e3_t2_seguranca_experimentacao') {
      addScore('valoresLimites', val <= 2 ? 4.5 : val >= 4 ? 4.2 : 4.0, 5);
      addScore('aprendizagemAdaptabilidade', 2.2 + val * 0.55, 5);
    }
    if (key === 'e3_t3_visibilidade_tranquilidade') {
      addScore('comunicacaoInfluencia', 2.5 + val * 0.5, 5);
    }
    if (key === 'e3_t4_especializacao_generalismo') {
      addScore('forcasCompetencias', 3.6 + Math.abs(val - 3) * 0.45, 5);
    }
    if (key === 'e3_t5_velocidade_qualidade') {
      addScore('priorizacaoExecucao', 2.8 + val * 0.42, 5);
    }
    if (key === 'e3_t6_ambicao_equilibrio') {
      addScore('valoresLimites', 2.0 + val * 0.6, 5);
      addScore('motivacaoEnergia', val <= 2 ? 4.5 : 4.0, 5);
    }
    if (key === 'e3_t7_independencia_colegiado') {
      addScore('comunicacaoInfluencia', 2.5 + val * 0.5, 5);
    }
    if (key === 'e3_t8_estrutura_flexibilidade') {
      addScore('ambienteEstrutura', val <= 3 ? 4.5 : 3.8, 5);
      addScore('aprendizagemAdaptabilidade', 2.5 + val * 0.5, 5);
    }
  });

  // =========================================================================
  // 4. Processar Etapa 4: Como eu trabalho (8 perguntas)
  // =========================================================================
  if (answers.e4_q1_organizacao) {
    const mapOrg: Record<string, number> = {
      metodico: 5.0,
      reativo_priorizado: 4.0,
      fluxo_emergente: 3.2,
      sobrecarregado: 2.0,
    };
    const scoreVal = mapOrg[answers.e4_q1_organizacao] || 3.5;
    addScore('ambienteEstrutura', scoreVal, 5);
    addScore('priorizacaoExecucao', scoreVal, 5);
  }

  if (answers.e4_q2_foco) {
    const mapFoco: Record<string, number> = {
      foco_consistente: 5.0,
      foco_com_esforco: 3.5,
      foco_sob_pressao: 3.0,
      dispersao_frequente: 2.0,
    };
    const scoreVal = mapFoco[answers.e4_q2_foco] || 3.5;
    addScore('ambienteEstrutura', scoreVal, 5);
    addScore('priorizacaoExecucao', scoreVal, 5);
  }

  if (answers.e4_q3_comunicacao) {
    const mapCom: Record<string, number> = {
      hibrido: 4.8,
      assincrono_escrito: 4.3,
      presencial_visual: 4.0,
      sincrono_rapido: 3.6,
    };
    addScore('comunicacaoInfluencia', mapCom[answers.e4_q3_comunicacao] || 4.0, 5);
  }

  if (answers.e4_q4_feedback) {
    const mapFb: Record<string, number> = {
      proativo: 5.0,
      reflexivo: 4.5,
      sensivel: 3.2,
      cauteloso: 2.8,
    };
    const scoreVal = mapFb[answers.e4_q4_feedback] || 3.5;
    addScore('comunicacaoInfluencia', scoreVal, 5);
    addScore('aprendizagemAdaptabilidade', scoreVal, 5);
  }

  if (answers.e4_q5_tomada_decisao) {
    const mapDec: Record<string, number> = {
      analitico: 4.8,
      pragmatico: 4.5,
      consensual: 4.2,
      intuitivo: 3.6,
    };
    addScore('priorizacaoExecucao', mapDec[answers.e4_q5_tomada_decisao] || 4.0, 5);
  }

  if (answers.e4_q6_mudancas) {
    const mapMud: Record<string, number> = {
      adaptativo_rapido: 5.0,
      pragmatico_calmo: 4.5,
      desgaste_inicial: 3.0,
      resistencia: 2.0,
    };
    addScore('aprendizagemAdaptabilidade', mapMud[answers.e4_q6_mudancas] || 3.5, 5);
  }

  if (answers.e4_q7_posicionamento) {
    const mapPos: Record<string, number> = {
      voz_ativa: 5.0,
      facilitador: 4.8,
      observador_cirurgico: 4.0,
      discreto: 3.2,
    };
    addScore('comunicacaoInfluencia', mapPos[answers.e4_q7_posicionamento] || 4.0, 5);
  }

  if (answers.e4_q8_limites_nao !== undefined && answers.e4_q8_limites_nao !== null && answers.e4_q8_limites_nao !== '') {
    const val = Number(answers.e4_q8_limites_nao) || 3;
    addScore('valoresLimites', val, 5);
    addScore('comunicacaoInfluencia', val, 5);
  }

  // =========================================================================
  // 5. Processar Etapa 5: Meus recursos e oportunidades (8 perguntas)
  // =========================================================================
  if (answers.e5_q1_fortalezas_reconhecidas && Array.isArray(answers.e5_q1_fortalezas_reconhecidas) && answers.e5_q1_fortalezas_reconhecidas.length > 0) {
    const count = answers.e5_q1_fortalezas_reconhecidas.length;
    addScore('forcasCompetencias', Math.min(5, 2.8 + count * 0.75), 5);
  }

  if (answers.e5_q2_confianca_plena) {
    const mapConf: Record<string, { forcas: number; motiv: number; extraDim?: DimensionId; extraScore?: number }> = {
      criacao_zero: { forcas: 5.0, motiv: 4.6 },
      otimizacao: { forcas: 4.8, motiv: 4.2, extraDim: 'priorizacaoExecucao', extraScore: 4.6 },
      mentoria_time: { forcas: 4.5, motiv: 4.5, extraDim: 'comunicacaoInfluencia', extraScore: 4.8 },
      articulacao: { forcas: 4.4, motiv: 4.3, extraDim: 'comunicacaoInfluencia', extraScore: 5.0 },
      execucao_profunda: { forcas: 4.8, motiv: 4.4, extraDim: 'priorizacaoExecucao', extraScore: 4.8 },
    };
    const c = mapConf[answers.e5_q2_confianca_plena];
    if (c) {
      addScore('forcasCompetencias', c.forcas, 5);
      addScore('motivacaoEnergia', c.motiv, 5);
      if (c.extraDim && c.extraScore) addScore(c.extraDim, c.extraScore, 5);
    } else {
      addScore('forcasCompetencias', 4.2, 5);
      addScore('motivacaoEnergia', 4.0, 5);
    }
  }

  if (answers.e5_q3_situacoes_desafiadoras && Array.isArray(answers.e5_q3_situacoes_desafiadoras) && answers.e5_q3_situacoes_desafiadoras.length > 0) {
    answers.e5_q3_situacoes_desafiadoras.forEach((sit: string) => {
      if (sit === 'conflitos_politicos') {
        addScore('valoresLimites', 2.5, 5);
        addScore('comunicacaoInfluencia', 3.0, 5);
      } else if (sit === 'reunioes_improdutivas') {
        addScore('priorizacaoExecucao', 2.5, 5);
        addScore('ambienteEstrutura', 3.0, 5);
      } else if (sit === 'microgerenciamento') {
        addScore('ambienteEstrutura', 2.0, 5);
        addScore('motivacaoEnergia', 2.5, 5);
      } else if (sit === 'isolamento') {
        addScore('comunicacaoInfluencia', 2.5, 5);
        addScore('motivacaoEnergia', 3.0, 5);
      } else if (sit === 'alta_ambiguidade') {
        addScore('clarezaDirecao', 2.0, 5);
        addScore('ambienteEstrutura', 2.5, 5);
      }
    });
  }

  if (answers.e5_q4_competencias_praticar) {
    addScore('aprendizagemAdaptabilidade', 4.2, 5);
    if (['priorizacao_estrategica', 'delegacao'].includes(answers.e5_q4_competencias_praticar)) {
      addScore('priorizacaoExecucao', 4.0, 5);
    }
  }

  if (answers.e5_q5_apoios_disponiveis && Array.isArray(answers.e5_q5_apoios_disponiveis) && answers.e5_q5_apoios_disponiveis.length > 0) {
    const count = answers.e5_q5_apoios_disponiveis.length;
    addScore('comunicacaoInfluencia', Math.min(5, 2.5 + count * 0.6), 5);
  }

  if (answers.e5_q6_obstaculo_principal) {
    const mapObs: Record<string, { dim: DimensionId; score: number }[]> = {
      tempo_sobrecarga: [
        { dim: 'priorizacaoExecucao', score: 2.0 },
        { dim: 'valoresLimites', score: 2.5 },
      ],
      cultura_ambiente: [
        { dim: 'ambienteEstrutura', score: 2.0 },
        { dim: 'valoresLimites', score: 2.8 },
      ],
      clareza_prioridade: [
        { dim: 'clarezaDirecao', score: 2.5 },
        { dim: 'priorizacaoExecucao', score: 2.5 },
      ],
      medo_desagradar: [
        { dim: 'valoresLimites', score: 2.0 },
        { dim: 'comunicacaoInfluencia', score: 3.0 },
      ],
      energia_baixa: [
        { dim: 'motivacaoEnergia', score: 2.0 },
        { dim: 'priorizacaoExecucao', score: 3.0 },
      ],
    };
    const obsArr = mapObs[answers.e5_q6_obstaculo_principal];
    if (obsArr) {
      obsArr.forEach((item) => addScore(item.dim, item.score, 5));
    }
  }

  if (answers.e5_q7_percepcao_progresso) {
    const mapProg: Record<string, number> = {
      avanco_claro: 5.0,
      estabilidade_confortavel: 4.0,
      estagnacao_incomoda: 2.5,
      turbulencia: 2.0,
    };
    addScore('clarezaDirecao', mapProg[answers.e5_q7_percepcao_progresso] || 3.5, 5);
  }

  if (answers.e5_q8_potencial_latente) {
    if (answers.e5_q8_potencial_latente === 'bem_aproveitada') {
      addScore('forcasCompetencias', 5.0, 5);
      addScore('motivacaoEnergia', 4.8, 5);
    } else {
      addScore('forcasCompetencias', 3.8, 5);
      addScore('motivacaoEnergia', 3.5, 5);
    }
  }

  // =========================================================================
  // 6. Processar Etapa 6: Minha próxima fase & Plano de 30 dias (8 perguntas)
  // =========================================================================
  if (answers.e6_q1_experimentar_mais) {
    const mapExp: Record<string, { dim: DimensionId; score: number }[]> = {
      blocos_foco: [
        { dim: 'priorizacaoExecucao', score: 4.8 },
        { dim: 'ambienteEstrutura', score: 4.5 },
      ],
      conversas_alinhamento: [
        { dim: 'comunicacaoInfluencia', score: 4.8 },
        { dim: 'valoresLimites', score: 4.5 },
      ],
      projetos_autorais: [
        { dim: 'aprendizagemAdaptabilidade', score: 4.8 },
        { dim: 'motivacaoEnergia', score: 4.5 },
      ],
      desaceleracao_pausas: [
        { dim: 'valoresLimites', score: 4.8 },
        { dim: 'motivacaoEnergia', score: 4.2 },
      ],
      registro_aprendizados: [
        { dim: 'aprendizagemAdaptabilidade', score: 4.8 },
        { dim: 'clarezaDirecao', score: 4.2 },
      ],
    };
    const expArr = mapExp[answers.e6_q1_experimentar_mais];
    if (expArr) {
      expArr.forEach((item) => addScore(item.dim, item.score, 5));
    } else {
      addScore('priorizacaoExecucao', 4.2, 5);
    }
  }

  if (answers.e6_q2_reduzir_reorganizar) {
    const mapRed: Record<string, { dim: DimensionId; score: number }[]> = {
      reunioes_dispensaveis: [
        { dim: 'priorizacaoExecucao', score: 4.5 },
        { dim: 'ambienteEstrutura', score: 4.2 },
      ],
      perfeccionismo: [
        { dim: 'priorizacaoExecucao', score: 4.2 },
        { dim: 'valoresLimites', score: 4.2 },
      ],
      disponibilidade_imediata: [
        { dim: 'valoresLimites', score: 4.5 },
        { dim: 'ambienteEstrutura', score: 4.0 },
      ],
      assumir_tudo: [
        { dim: 'valoresLimites', score: 3.5 },
        { dim: 'priorizacaoExecucao', score: 3.5 },
      ],
    };
    const redArr = mapRed[answers.e6_q2_reduzir_reorganizar];
    if (redArr) {
      redArr.forEach((item) => addScore(item.dim, item.score, 5));
    } else {
      addScore('priorizacaoExecucao', 4.0, 5);
      addScore('valoresLimites', 4.0, 5);
    }
  }

  if (answers.e6_q3_preservar_inegociavel) {
    const mapPres: Record<string, { dim: DimensionId; score: number }[]> = {
      saude_sono: [{ dim: 'valoresLimites', score: 5.0 }],
      familia_relacoes: [{ dim: 'valoresLimites', score: 5.0 }],
      autonomia_decisao: [
        { dim: 'valoresLimites', score: 4.8 },
        { dim: 'ambienteEstrutura', score: 4.6 },
      ],
      etica_rigor: [
        { dim: 'valoresLimites', score: 5.0 },
        { dim: 'forcasCompetencias', score: 4.6 },
      ],
    };
    const presArr = mapPres[answers.e6_q3_preservar_inegociavel];
    if (presArr) {
      presArr.forEach((item) => addScore(item.dim, item.score, 5));
    } else {
      addScore('valoresLimites', 4.8, 5);
    }
  }

  if (answers.e6_q4_micro_mudanca) {
    const mapMic: Record<string, { dim: DimensionId; score: number }[]> = {
      planejar_vespera: [
        { dim: 'priorizacaoExecucao', score: 4.8 },
        { dim: 'ambienteEstrutura', score: 4.5 },
      ],
      pausa_antes_responder: [
        { dim: 'valoresLimites', score: 4.8 },
        { dim: 'priorizacaoExecucao', score: 4.3 },
      ],
      checkin_semanal: [
        { dim: 'clarezaDirecao', score: 4.8 },
        { dim: 'priorizacaoExecucao', score: 4.4 },
      ],
      comunicar_limite: [
        { dim: 'comunicacaoInfluencia', score: 4.8 },
        { dim: 'valoresLimites', score: 4.8 },
      ],
    };
    const micArr = mapMic[answers.e6_q4_micro_mudanca];
    if (micArr) {
      micArr.forEach((item) => addScore(item.dim, item.score, 5));
    } else {
      addScore('priorizacaoExecucao', 4.2, 5);
    }
  }

  if (answers.e6_q5_tempo_semanal) {
    const mapTempo: Record<string, number> = {
      '3_horas_mais': 5.0,
      '1_hora': 4.0,
      '30_minutos': 3.2,
    };
    addScore('clarezaDirecao', mapTempo[answers.e6_q5_tempo_semanal] || 3.5, 5);
  }

  if (answers.e6_q6_prioridade_central) {
    addScore('clarezaDirecao', 4.5, 5);
    if (answers.e6_q6_prioridade_central === 'foco_organizacao') {
      addScore('priorizacaoExecucao', 4.5, 5);
    } else if (answers.e6_q6_prioridade_central === 'comunicacao_posicionamento') {
      addScore('comunicacaoInfluencia', 4.5, 5);
    } else if (answers.e6_q6_prioridade_central === 'resgate_energia') {
      addScore('motivacaoEnergia', 4.5, 5);
    }
  }

  if (answers.e6_q7_disposicao_experimentar !== undefined && answers.e6_q7_disposicao_experimentar !== null && answers.e6_q7_disposicao_experimentar !== '') {
    const val = Number(answers.e6_q7_disposicao_experimentar) || 3;
    addScore('aprendizagemAdaptabilidade', val, 5);
  }

  // =========================================================================
  // Finalizar pontuação normalizada (0 a 100)
  // =========================================================================
  const scoresResult = {} as DimensionScores;

  primaryDimensions.forEach((dimId) => {
    const data = dimensionPoints[dimId];
    const rawScore = data.maxPossible > 0 ? (data.total / data.maxPossible) * 100 : 50;
    const finalScore = Math.round(Math.max(10, Math.min(95, rawScore)));

    let level: DimensionScore['level'] = 'em_desenvolvimento';
    if (finalScore >= 80) level = 'destaque';
    else if (finalScore >= 60) level = 'estruturado';
    else if (finalScore >= 40) level = 'em_desenvolvimento';
    else level = 'exploratorio';

    scoresResult[dimId] = {
      id: dimId,
      name: DIMENSION_CONFIG[dimId].name,
      score: finalScore,
      level,
      summary: DIMENSION_CONFIG[dimId].summaryBase,
      sufficiency: data.count >= 3 ? 'alta' : data.count >= 1 ? 'moderada' : 'amostral',
    };
  });

  // Aliases para manter total retrocompatibilidade
  scoresResult.ambienteTrabalho = scoresResult.ambienteEstrutura;
  scoresResult.colaboracaoComunicacao = scoresResult.comunicacaoInfluencia;
  scoresResult.desenvolvimentoFuturo = scoresResult.clarezaDirecao;

  // Radar Data com as 8 Dimensões em sequência geométrica balanceada
  const radarData: Array<{
    dimension: string;
    dimensionKey: DimensionId;
    score: number;
    fullMark: 100;
  }> = [
    {
      dimension: 'Motivação & Energia',
      dimensionKey: 'motivacaoEnergia',
      score: scoresResult.motivacaoEnergia.score,
      fullMark: 100,
    },
    {
      dimension: 'Clareza de Direção',
      dimensionKey: 'clarezaDirecao',
      score: scoresResult.clarezaDirecao.score,
      fullMark: 100,
    },
    {
      dimension: 'Forças & Competências',
      dimensionKey: 'forcasCompetencias',
      score: scoresResult.forcasCompetencias.score,
      fullMark: 100,
    },
    {
      dimension: 'Comunicação & Influência',
      dimensionKey: 'comunicacaoInfluencia',
      score: scoresResult.comunicacaoInfluencia.score,
      fullMark: 100,
    },
    {
      dimension: 'Priorização & Execução',
      dimensionKey: 'priorizacaoExecucao',
      score: scoresResult.priorizacaoExecucao.score,
      fullMark: 100,
    },
    {
      dimension: 'Ambiente & Estrutura',
      dimensionKey: 'ambienteEstrutura',
      score: scoresResult.ambienteEstrutura.score,
      fullMark: 100,
    },
    {
      dimension: 'Valores & Limites',
      dimensionKey: 'valoresLimites',
      score: scoresResult.valoresLimites.score,
      fullMark: 100,
    },
    {
      dimension: 'Aprendizagem & Adaptabilidade',
      dimensionKey: 'aprendizagemAdaptabilidade',
      score: scoresResult.aprendizagemAdaptabilidade.score,
      fullMark: 100,
    },
  ];

  return {
    scores: scoresResult,
    radarData,
    gaps,
  };
}
