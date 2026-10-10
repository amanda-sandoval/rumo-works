import {
  DimensionId,
  DimensionScore,
  DimensionScores,
  MotivatorGap,
} from '../types';

export interface RawAnswerMap {
  [questionId: string]: any;
}

const DIMENSION_CONFIG: Record<
  DimensionId,
  { name: string; summaryBase: string }
> = {
  motivacaoEnergia: {
    name: 'Motivação e Energia',
    summaryBase: 'Avalia as fontes de vigor, realização e satisfação no trabalho cotidiano.',
  },
  ambienteTrabalho: {
    name: 'Ambiente e Estrutura',
    summaryBase: 'Avalia autonomia, ritmo sustentável, organização e flexibilidade de contexto.',
  },
  valoresLimites: {
    name: 'Valores e Limites',
    summaryBase: 'Avalia coerência ética, capacidade de preservação de limites e prioridades vitais.',
  },
  colaboracaoComunicacao: {
    name: 'Colaboração e Comunicação',
    summaryBase: 'Avalia fluidez nas trocas, assertividade, abertura a feedback e alinhamento.',
  },
  desenvolvimentoFuturo: {
    name: 'Desenvolvimento e Próximos Passos',
    summaryBase: 'Avalia clareza de direção, intenção de aprendizado e capacidade de evolução.',
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
 * Normaliza e calcula pontuações determinísticas das 5 dimensões e análise de gaps
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
  // Acumuladores de pontuação e peso por dimensão
  const dimensionPoints: Record<DimensionId, { total: number; maxPossible: number; count: number }> = {
    motivacaoEnergia: { total: 0, maxPossible: 0, count: 0 },
    ambienteTrabalho: { total: 0, maxPossible: 0, count: 0 },
    valoresLimites: { total: 0, maxPossible: 0, count: 0 },
    colaboracaoComunicacao: { total: 0, maxPossible: 0, count: 0 },
    desenvolvimentoFuturo: { total: 0, maxPossible: 0, count: 0 },
  };

  // Helper para somar pontos
  const addScore = (dimension: DimensionId, points: number, max: number) => {
    dimensionPoints[dimension].total += Math.max(0, Math.min(points, max));
    dimensionPoints[dimension].maxPossible += max;
    dimensionPoints[dimension].count += 1;
  };

  // 1. Processar Etapa 1
  if (answers.e1_q2_clareza) {
    const val = Number(answers.e1_q2_clareza) || 3;
    addScore('desenvolvimentoFuturo', val, 5);
  }
  if (answers.e1_q3_satisfacao_geral) {
    const val = Number(answers.e1_q3_satisfacao_geral) || 3;
    addScore('motivacaoEnergia', val, 5);
  }

  // 2. Processar Etapa 2 (10 pares Importância e Satisfação)
  const gaps: MotivatorGap[] = [];

  Object.keys(MOTIVATOR_LABELS).forEach((qId) => {
    const rawVal = answers[qId];
    let imp = 3;
    let sat = 3;

    if (rawVal && typeof rawVal === 'object') {
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

    // Contribuição para dimensões
    // Satisfação reflete a energia atual na dimensão
    if (['e2_m1_autonomia', 'e2_m2_aprendizado', 'e2_m3_resolucao_problemas', 'e2_m4_criatividade', 'e2_m5_impacto', 'e2_m8_reconhecimento'].includes(qId)) {
      addScore('motivacaoEnergia', sat, 5);
    }
    if (['e2_m1_autonomia', 'e2_m7_estabilidade', 'e2_m9_variedade', 'e2_m10_profundidade'].includes(qId)) {
      addScore('ambienteTrabalho', sat, 5);
    }
    if (['e2_m5_impacto', 'e2_m7_estabilidade', 'e2_m10_profundidade'].includes(qId)) {
      addScore('valoresLimites', sat, 5);
    }
    if (qId === 'e2_m6_colaboracao') {
      addScore('colaboracaoComunicacao', sat, 5);
    }
    if (qId === 'e2_m2_aprendizado') {
      addScore('desenvolvimentoFuturo', sat, 5);
    }
  });

  // 3. Processar Etapa 3 (Tensões situacionais 1 a 5)
  // Cada tensão expressa preferências situacionais equilibradas
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
    const val = Number(answers[key]) || 3;
    // Normalizado para maturidade de autoconhecimento (respostas claras indicam boa reflexão)
    if (key === 'e3_t1_autonomia_orientacao' || key === 'e3_t8_estrutura_flexibilidade') {
      addScore('ambienteTrabalho', 3.5, 5);
    }
    if (key === 'e3_t2_seguranca_experimentacao' || key === 'e3_t6_ambicao_equilibrio') {
      addScore('valoresLimites', 4, 5);
    }
    if (key === 'e3_t3_visibilidade_tranquilidade' || key === 'e3_t7_independencia_colegiado') {
      addScore('colaboracaoComunicacao', 3.8, 5);
    }
    if (key === 'e3_t4_especializacao_generalismo') {
      addScore('desenvolvimentoFuturo', 4, 5);
    }
  });

  // 4. Processar Etapa 4 (Como eu trabalho)
  if (answers.e4_q1_organizacao) {
    const mapOrg: Record<string, number> = {
      metodico: 5,
      reativo_priorizado: 4,
      fluxo_emergente: 3,
      sobrecarregado: 2,
    };
    addScore('ambienteTrabalho', mapOrg[answers.e4_q1_organizacao] || 3, 5);
  }

  if (answers.e4_q2_foco) {
    const mapFoco: Record<string, number> = {
      foco_consistente: 5,
      foco_com_esforco: 3.5,
      foco_sob_pressao: 3,
      dispersao_frequente: 2,
    };
    addScore('ambienteTrabalho', mapFoco[answers.e4_q2_foco] || 3, 5);
  }

  if (answers.e4_q3_comunicacao) {
    addScore('colaboracaoComunicacao', 4, 5);
  }

  if (answers.e4_q4_feedback) {
    const mapFb: Record<string, number> = {
      proativo: 5,
      reflexivo: 4.5,
      sensivel: 3,
      cauteloso: 2.5,
    };
    addScore('colaboracaoComunicacao', mapFb[answers.e4_q4_feedback] || 3.5, 5);
  }

  if (answers.e4_q8_limites_nao) {
    const val = Number(answers.e4_q8_limites_nao) || 3;
    addScore('valoresLimites', val, 5);
  }

  // 5. Processar Etapa 5 (Recursos)
  if (answers.e5_q1_fortalezas_reconhecidas && Array.isArray(answers.e5_q1_fortalezas_reconhecidas)) {
    const count = answers.e5_q1_fortalezas_reconhecidas.length;
    addScore('desenvolvimentoFuturo', Math.min(5, 2.5 + count * 0.8), 5);
  }

  if (answers.e5_q7_percepcao_progresso) {
    const mapProg: Record<string, number> = {
      avanco_claro: 5,
      estabilidade_confortavel: 4,
      estagnacao_incomoda: 2.5,
      turbulencia: 2,
    };
    addScore('desenvolvimentoFuturo', mapProg[answers.e5_q7_percepcao_progresso] || 3, 5);
  }

  // 6. Processar Etapa 6 (Próxima fase)
  if (answers.e6_q7_disposicao_experimentar) {
    const val = Number(answers.e6_q7_disposicao_experimentar) || 3;
    addScore('desenvolvimentoFuturo', val, 5);
  }

  // Finalizar pontuação normalizada (0 a 100)
  const scoresResult = {} as DimensionScores;

  (Object.keys(DIMENSION_CONFIG) as DimensionId[]).forEach((dimId) => {
    const data = dimensionPoints[dimId];
    // Caso padrão se nenhuma questão respondeu
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
      sufficiency: data.count >= 3 ? 'alta' : 'moderada',
    };
  });

  const radarData: Array<{
    dimension: string;
    dimensionKey: DimensionId;
    score: number;
    fullMark: 100;
  }> = [
    {
      dimension: 'Motivação & Energia',
      dimensionKey: 'motivacaoEnergia' as DimensionId,
      score: scoresResult.motivacaoEnergia.score,
      fullMark: 100,
    },
    {
      dimension: 'Ambiente & Estrutura',
      dimensionKey: 'ambienteTrabalho' as DimensionId,
      score: scoresResult.ambienteTrabalho.score,
      fullMark: 100,
    },
    {
      dimension: 'Valores & Limites',
      dimensionKey: 'valoresLimites' as DimensionId,
      score: scoresResult.valoresLimites.score,
      fullMark: 100,
    },
    {
      dimension: 'Colaboração & Diálogo',
      dimensionKey: 'colaboracaoComunicacao' as DimensionId,
      score: scoresResult.colaboracaoComunicacao.score,
      fullMark: 100,
    },
    {
      dimension: 'Próximos Passos',
      dimensionKey: 'desenvolvimentoFuturo' as DimensionId,
      score: scoresResult.desenvolvimentoFuturo.score,
      fullMark: 100,
    },
  ];

  return {
    scores: scoresResult,
    radarData,
    gaps,
  };
}
