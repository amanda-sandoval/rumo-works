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
  const addScore = (dimension: DimensionId, points: number, max: number = 5) => {
    if (points === undefined || points === null || isNaN(Number(points))) return;
    if (dimensionPoints[dimension]) {
      dimensionPoints[dimension].total += Math.max(0, Math.min(Number(points), max));
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
      reestruturacao: 2.0,
    };
    addScore('clarezaDirecao', faseMap[answers.e1_q1_fase] || 3.5);
  }

  if (answers.e1_q2_clareza !== undefined && answers.e1_q2_clareza !== null && answers.e1_q2_clareza !== '') {
    addScore('clarezaDirecao', Number(answers.e1_q2_clareza));
  }

  if (answers.e1_q3_satisfacao_geral !== undefined && answers.e1_q3_satisfacao_geral !== null && answers.e1_q3_satisfacao_geral !== '') {
    addScore('motivacaoEnergia', Number(answers.e1_q3_satisfacao_geral));
  }

  if (answers.e1_q4_energia_ocupada && Array.isArray(answers.e1_q4_energia_ocupada) && answers.e1_q4_energia_ocupada.length > 0) {
    const arr = answers.e1_q4_energia_ocupada;
    let score = 5.0;
    if (arr.includes('sobrecarga_operacional') || arr.includes('falta_clareza')) score = 2.2;
    else if (arr.includes('tomada_decisao') || arr.includes('equilibrio_vida')) score = 3.5;
    else if (arr.includes('aprendizado_novo')) score = 4.5;
    addScore('priorizacaoExecucao', score);
  }

  if (answers.e1_q5_desejo_compreensao) {
    const desejoMap: Record<string, number> = {
      proximos_passos: 4.8,
      estilo_trabalho: 4.2,
      relacionamentos: 4.0,
      motivadores_reais: 3.5,
    };
    addScore('clarezaDirecao', desejoMap[answers.e1_q5_desejo_compreensao] || 4.0);
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
  });

  const getSat = (qId: string): number | null => {
    const rawVal = answers[qId];
    if (rawVal === undefined || rawVal === null) return null;
    return typeof rawVal === 'object' ? Number(rawVal.satisfaction) : Number(rawVal);
  };

  // Contribuição pareada dos 10 motivadores para as dimensões
  const s1 = getSat('e2_m1_autonomia');
  if (s1 !== null) addScore('ambienteEstrutura', s1);

  const s2 = getSat('e2_m2_aprendizado');
  if (s2 !== null) addScore('aprendizagemAdaptabilidade', s2);

  const s3 = getSat('e2_m3_resolucao_problemas');
  if (s3 !== null) addScore('forcasCompetencias', s3);

  const s4 = getSat('e2_m4_criatividade');
  if (s4 !== null) addScore('forcasCompetencias', s4);

  const s5 = getSat('e2_m5_impacto');
  if (s5 !== null) addScore('valoresLimites', s5);

  const s6 = getSat('e2_m6_colaboracao');
  if (s6 !== null) addScore('comunicacaoInfluencia', s6);

  const s7 = getSat('e2_m7_estabilidade');
  if (s7 !== null) addScore('ambienteEstrutura', s7);

  const s8 = getSat('e2_m8_reconhecimento');
  if (s8 !== null) addScore('motivacaoEnergia', s8);

  const s9 = getSat('e2_m9_variedade');
  if (s9 !== null) addScore('motivacaoEnergia', s9);

  const s10 = getSat('e2_m10_profundidade');
  if (s10 !== null) addScore('priorizacaoExecucao', s10);

  // =========================================================================
  // 3. Processar Etapa 3: Meus valores e limites (8 tensões situacionais)
  // =========================================================================
  const getTen = (k: string): number | null => {
    if (answers[k] === undefined || answers[k] === null || answers[k] === '') return null;
    return Number(answers[k]);
  };

  const t1 = getTen('e3_t1_autonomia_orientacao');
  if (t1 !== null) addScore('ambienteEstrutura', 2.5 + 0.5 * t1);

  const t2 = getTen('e3_t2_seguranca_experimentacao');
  if (t2 !== null) addScore('aprendizagemAdaptabilidade', 2.0 + 0.6 * t2);

  const t3 = getTen('e3_t3_visibilidade_tranquilidade');
  if (t3 !== null) addScore('comunicacaoInfluencia', 2.5 + 0.5 * t3);

  const t4 = getTen('e3_t4_especializacao_generalismo');
  if (t4 !== null) addScore('forcasCompetencias', 3.6 + 0.35 * Math.abs(t4 - 3));

  const t5 = getTen('e3_t5_velocidade_qualidade');
  if (t5 !== null) addScore('priorizacaoExecucao', 2.5 + 0.5 * t5);

  const t6 = getTen('e3_t6_ambicao_equilibrio');
  if (t6 !== null) addScore('valoresLimites', 2.0 + 0.6 * t6);

  const t7 = getTen('e3_t7_independencia_colegiado');
  if (t7 !== null) addScore('comunicacaoInfluencia', 2.5 + 0.5 * t7);

  const t8 = getTen('e3_t8_estrutura_flexibilidade');
  if (t8 !== null) addScore('ambienteEstrutura', t8 <= 3 ? 4.5 : 3.8);

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
    addScore('priorizacaoExecucao', mapOrg[answers.e4_q1_organizacao] || 3.5);
  }

  if (answers.e4_q2_foco) {
    const mapFoco: Record<string, number> = {
      foco_consistente: 5.0,
      foco_com_esforco: 3.5,
      foco_sob_pressao: 3.0,
      dispersao_frequente: 2.0,
    };
    addScore('priorizacaoExecucao', mapFoco[answers.e4_q2_foco] || 3.5);
  }

  if (answers.e4_q3_comunicacao) {
    const mapCom: Record<string, number> = {
      hibrido: 4.8,
      assincrono_escrito: 4.3,
      presencial_visual: 4.0,
      sincrono_rapido: 3.6,
    };
    addScore('comunicacaoInfluencia', mapCom[answers.e4_q3_comunicacao] || 4.0);
  }

  if (answers.e4_q4_feedback) {
    const mapFb: Record<string, number> = {
      proativo: 5.0,
      reflexivo: 4.5,
      sensivel: 3.2,
      cauteloso: 2.8,
    };
    addScore('aprendizagemAdaptabilidade', mapFb[answers.e4_q4_feedback] || 3.5);
  }

  if (answers.e4_q5_tomada_decisao) {
    const mapDec: Record<string, number> = {
      analitico: 4.8,
      pragmatico: 4.5,
      consultivo: 4.2,
      consensual: 4.2,
      intuitivo: 3.6,
    };
    addScore('ambienteEstrutura', mapDec[answers.e4_q5_tomada_decisao] || 4.0);
  }

  if (answers.e4_q6_mudancas) {
    const mapMud: Record<string, number> = {
      adaptativo_rapido: 5.0,
      pragmatico_calmo: 4.5,
      desgaste_inicial: 3.0,
      resistencia: 2.0,
    };
    addScore('aprendizagemAdaptabilidade', mapMud[answers.e4_q6_mudancas] || 3.5);
  }

  if (answers.e4_q7_posicionamento) {
    const mapPos: Record<string, number> = {
      voz_ativa: 5.0,
      facilitador: 4.8,
      observador_cirurgico: 4.0,
      discreto: 3.2,
    };
    addScore('comunicacaoInfluencia', mapPos[answers.e4_q7_posicionamento] || 4.0);
  }

  if (answers.e4_q8_limites_nao !== undefined && answers.e4_q8_limites_nao !== null && answers.e4_q8_limites_nao !== '') {
    addScore('valoresLimites', Number(answers.e4_q8_limites_nao));
  }

  // =========================================================================
  // 5. Processar Etapa 5: Meus recursos e oportunidades (8 perguntas)
  // =========================================================================
  if (answers.e5_q1_fortalezas_reconhecidas && Array.isArray(answers.e5_q1_fortalezas_reconhecidas) && answers.e5_q1_fortalezas_reconhecidas.length > 0) {
    addScore('forcasCompetencias', Math.min(5, 2.5 + answers.e5_q1_fortalezas_reconhecidas.length * 0.83));
  }

  if (answers.e5_q2_confianca_plena) {
    const mapConf: Record<string, number> = {
      criacao_zero: 5.0,
      otimizacao: 4.8,
      execucao_profunda: 4.8,
      mentoria_time: 4.5,
      articulacao: 4.4,
    };
    addScore('forcasCompetencias', mapConf[answers.e5_q2_confianca_plena] || 4.5);
  }

  if (answers.e5_q3_situacoes_desafiadoras && Array.isArray(answers.e5_q3_situacoes_desafiadoras) && answers.e5_q3_situacoes_desafiadoras.length > 0) {
    const arr = answers.e5_q3_situacoes_desafiadoras;
    let s = 4.5;
    if (arr.includes('conflitos_politicos') || arr.includes('microgerenciamento')) s = 2.5;
    else if (arr.includes('reunioes_improdutivas') || arr.includes('isolamento')) s = 3.2;
    addScore('valoresLimites', s);
  }

  if (answers.e5_q4_competencias_praticar) {
    addScore('aprendizagemAdaptabilidade', 4.5);
  }

  if (answers.e5_q5_apoios_disponiveis && Array.isArray(answers.e5_q5_apoios_disponiveis) && answers.e5_q5_apoios_disponiveis.length > 0) {
    const arr = answers.e5_q5_apoios_disponiveis;
    if (arr.includes('apoio_limitado')) {
      addScore('comunicacaoInfluencia', 2.5);
    } else {
      addScore('comunicacaoInfluencia', Math.min(5, 2.8 + arr.length * 0.55));
    }
  }

  if (answers.e5_q6_obstaculo_principal) {
    const mapObs: Record<string, number> = {
      cultura_ambiente: 2.0,
      tempo_sobrecarga: 2.5,
      medo_desagradar: 3.0,
      clareza_prioridade: 3.5,
      energia_baixa: 3.2,
    };
    addScore('ambienteEstrutura', mapObs[answers.e5_q6_obstaculo_principal] || 3.0);
  }

  if (answers.e5_q7_percepcao_progresso) {
    const mapProg: Record<string, number> = {
      avanco_claro: 5.0,
      estabilidade_confortavel: 4.0,
      estagnacao_incomoda: 2.5,
      turbulencia: 2.0,
    };
    addScore('clarezaDirecao', mapProg[answers.e5_q7_percepcao_progresso] || 3.5);
  }

  if (answers.e5_q8_potencial_latente) {
    addScore('motivacaoEnergia', answers.e5_q8_potencial_latente === 'bem_aproveitada' ? 5.0 : 3.5);
  }

  // =========================================================================
  // 6. Processar Etapa 6: Minha próxima fase & Plano de 30 dias (8 perguntas)
  // =========================================================================
  if (answers.e6_q1_experimentar_mais) {
    const mapExp: Record<string, number> = {
      blocos_foco: 4.8,
      projetos_autorais: 4.8,
      conversas_alinhamento: 4.5,
      desaceleracao_pausas: 4.2,
      registro_aprendizados: 4.5,
    };
    addScore('motivacaoEnergia', mapExp[answers.e6_q1_experimentar_mais] || 4.5);
  }

  if (answers.e6_q2_reduzir_reorganizar) {
    const mapRed: Record<string, number> = {
      disponibilidade_imediata: 4.5,
      reunioes_dispensaveis: 4.2,
      perfeccionismo: 4.0,
      assumir_tudo: 3.2,
    };
    addScore('valoresLimites', mapRed[answers.e6_q2_reduzir_reorganizar] || 4.0);
  }

  if (answers.e6_q3_preservar_inegociavel) {
    const mapPres: Record<string, number> = {
      saude_sono: 5.0,
      familia_relacoes: 5.0,
      etica_rigor: 5.0,
      autonomia_decisao: 4.8,
    };
    addScore('valoresLimites', mapPres[answers.e6_q3_preservar_inegociavel] || 4.8);
  }

  if (answers.e6_q4_micro_mudanca) {
    const mapMic: Record<string, number> = {
      planejar_vespera: 4.8,
      checkin_semanal: 4.6,
      pausa_antes_responder: 4.5,
      comunicar_limite: 4.4,
    };
    addScore('priorizacaoExecucao', mapMic[answers.e6_q4_micro_mudanca] || 4.5);
  }

  if (answers.e6_q5_tempo_semanal) {
    const mapTempo: Record<string, number> = {
      '3_horas_mais': 5.0,
      '1_hora': 4.0,
      '30_minutos': 3.2,
    };
    addScore('clarezaDirecao', mapTempo[answers.e6_q5_tempo_semanal] || 3.5);
  }

  if (answers.e6_q6_prioridade_central) {
    addScore('clarezaDirecao', 4.8);
  }

  if (answers.e6_q7_disposicao_experimentar !== undefined && answers.e6_q7_disposicao_experimentar !== null && answers.e6_q7_disposicao_experimentar !== '') {
    addScore('aprendizagemAdaptabilidade', Number(answers.e6_q7_disposicao_experimentar));
  }

  // =========================================================================
  // Finalizar pontuação normalizada (0 a 100)
  // =========================================================================
  const applicableCounts: Record<DimensionId, number> = {
    motivacaoEnergia: 5,
    valoresLimites: 6,
    ambienteEstrutura: 6,
    clarezaDirecao: 6,
    forcasCompetencias: 5,
    comunicacaoInfluencia: 6,
    priorizacaoExecucao: 6,
    aprendizagemAdaptabilidade: 6,
    ambienteTrabalho: 6,
    colaboracaoComunicacao: 6,
    desenvolvimentoFuturo: 6,
  };

  const scoresResult = {} as DimensionScores;

  primaryDimensions.forEach((dimId) => {
    const data = dimensionPoints[dimId];
    const isSufficient = data.count >= 2;
    const rawScore = data.maxPossible > 0 ? (data.total / data.maxPossible) * 100 : null;
    const finalScore = rawScore !== null ? Math.round(Math.max(10, Math.min(95, rawScore))) : 0;

    let level: DimensionScore['level'] = 'em_desenvolvimento';
    if (rawScore === null || data.count === 0) {
      level = 'dados_insuficientes';
    } else if (finalScore >= 80) {
      level = 'destaque';
    } else if (finalScore >= 60) {
      level = 'estruturado';
    } else if (finalScore >= 40) {
      level = 'em_desenvolvimento';
    } else {
      level = 'exploratorio';
    }

    const sufficiency: DimensionScore['sufficiency'] =
      data.count >= 4 ? 'alta' : data.count >= 2 ? 'moderada' : data.count >= 1 ? 'amostral' : 'insuficiente';

    scoresResult[dimId] = {
      id: dimId,
      name: DIMENSION_CONFIG[dimId].name,
      score: finalScore,
      level,
      summary: DIMENSION_CONFIG[dimId].summaryBase,
      sufficiency,
      numerator: Math.round(data.total * 100) / 100,
      denominator: data.maxPossible,
      rawScore: rawScore !== null ? Math.round(rawScore * 100) / 100 : undefined,
      count: data.count,
      applicableCount: applicableCounts[dimId],
      isSufficient,
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
