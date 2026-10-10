/**
 * QA TEST SUITE & METRIC VALIDATOR — RUMO WORKS | MAPA RUMO
 * Automated QA verification for 4 personas, mathematical correctness, controlled variations, and boundary tests.
 */

const { processAssessment } = require('/tmp/mapa-qa/index.js');
const { calculateAssessmentScores, DIMENSION_CONFIG } = require('/tmp/mapa-qa/engine/scoring.js');
const { generateInterpretations } = require('/tmp/mapa-qa/engine/interpretation.js');
const { generateActionPlan } = require('/tmp/mapa-qa/engine/actionPlanGenerator.js');

// 1. DEFINIÇÃO DAS 4 PERSONAS SINTÉTICAS
const PERSONAS = {
  marina: {
    name: 'Marina Costa',
    role: 'A Competitiva Orientada a Crescimento',
    context: '6 anos de experiência, foco em metas, ambição por liderança e expansão, ritmo acelerado',
    declaredGoal: 'Crescer profissionalmente, ampliar escopo e se preparar para liderança com sustentabilidade',
    answers: {
      e1_q1_fase: 'crescimento_acelerado',
      e1_q2_clareza: 4,
      e1_q3_satisfacao_geral: 4,
      e1_q4_energia_ocupada: ['sobrecarga_operacional', 'tomada_decisao'],
      e1_q5_desejo_compreensao: 'proximos_passos',
      e1_q6_descoberta_util: 'Estruturar próximos passos para liderança sem perder sustentabilidade',
      e2_m1_autonomia: { importance: 4, satisfaction: 4 },
      e2_m2_aprendizado: { importance: 5, satisfaction: 4 },
      e2_m3_resolucao_problemas: { importance: 5, satisfaction: 5 },
      e2_m4_criatividade: { importance: 4, satisfaction: 3 },
      e2_m5_impacto: { importance: 5, satisfaction: 4 },
      e2_m6_colaboracao: { importance: 3, satisfaction: 3 },
      e2_m7_estabilidade: { importance: 3, satisfaction: 4 },
      e2_m8_reconhecimento: { importance: 5, satisfaction: 4 },
      e2_m9_variedade: { importance: 4, satisfaction: 4 },
      e2_m10_profundidade: { importance: 4, satisfaction: 2 },
      e3_t1_autonomia_orientacao: 2,
      e3_t2_seguranca_experimentacao: 4,
      e3_t3_visibilidade_tranquilidade: 1,
      e3_t4_especializacao_generalismo: 4,
      e3_t5_velocidade_qualidade: 2,
      e3_t6_ambicao_equilibrio: 1,
      e3_t7_independencia_colegiado: 2,
      e3_t8_estrutura_flexibilidade: 2,
      e4_q1_organizacao: 'reativo_priorizado',
      e4_q2_foco: 'foco_sob_pressao',
      e4_q3_comunicacao: 'sincrono_rapido',
      e4_q4_feedback: 'proativo',
      e4_q5_tomada_decisao: 'pragmatico',
      e4_q6_mudancas: 'adaptativo_rapido',
      e4_q7_posicionamento: 'voz_ativa',
      e4_q8_limites_nao: 2,
      e5_q1_fortalezas_reconhecidas: ['visao_estrategica', 'resolucao_pratica', 'resiliencia_consistencia'],
      e5_q2_confianca_plena: 'articulacao',
      e5_q3_situacoes_desafiadoras: ['reunioes_improdutivas', 'alta_ambiguidade'],
      e5_q4_competencias_praticar: 'delegacao',
      e5_q5_apoios_disponiveis: ['lideranca_aberta', 'pares_confianca', 'espaco_autonomia'],
      e5_q6_obstaculo_principal: 'tempo_sobrecarga',
      e5_q7_percepcao_progresso: 'avanco_claro',
      e5_q8_potencial_latente: 'pensamento_estrategico',
      e6_q1_experimentar_mais: 'blocos_foco',
      e6_q2_reduzir_reorganizar: 'assumir_tudo',
      e6_q3_preservar_inegociavel: 'autonomia_decisao',
      e6_q4_micro_mudanca: 'pausa_antes_responder',
      e6_q5_tempo_semanal: '1_hora',
      e6_q6_prioridade_central: 'clareza_carreira',
      e6_q7_disposicao_experimentar: 5,
      e6_q8_compromisso_pessoal: 'Lembrar que dizer sim para tudo enfraquece minha entrega estratégica',
    },
  },

  beatriz: {
    name: 'Beatriz Almeida',
    role: 'A Profissional Insatisfeita com o Trabalho Atual',
    context: '5 anos de experiência, competência sólida, ambiente atual estagnado, desgaste de energia',
    declaredGoal: 'Entender se deve transformar contexto atual, mudar de equipe ou buscar novo caminho',
    answers: {
      e1_q1_fase: 'reavaliacao',
      e1_q2_clareza: 2,
      e1_q3_satisfacao_geral: 2,
      e1_q4_energia_ocupada: ['sobrecarga_operacional', 'falta_clareza'],
      e1_q5_desejo_compreensao: 'motivadores_reais',
      e1_q6_descoberta_util: 'Entender se meu desgaste é fruto da empresa ou se preciso rever meu rumo',
      e2_m1_autonomia: { importance: 5, satisfaction: 2 },
      e2_m2_aprendizado: { importance: 5, satisfaction: 2 },
      e2_m3_resolucao_problemas: { importance: 4, satisfaction: 3 },
      e2_m4_criatividade: { importance: 4, satisfaction: 2 },
      e2_m5_impacto: { importance: 5, satisfaction: 2 },
      e2_m6_colaboracao: { importance: 4, satisfaction: 3 },
      e2_m7_estabilidade: { importance: 4, satisfaction: 4 },
      e2_m8_reconhecimento: { importance: 4, satisfaction: 2 },
      e2_m9_variedade: { importance: 3, satisfaction: 2 },
      e2_m10_profundidade: { importance: 4, satisfaction: 2 },
      e3_t1_autonomia_orientacao: 1,
      e3_t2_seguranca_experimentacao: 2,
      e3_t3_visibilidade_tranquilidade: 4,
      e3_t4_especializacao_generalismo: 3,
      e3_t5_velocidade_qualidade: 4,
      e3_t6_ambicao_equilibrio: 4,
      e3_t7_independencia_colegiado: 3,
      e3_t8_estrutura_flexibilidade: 4,
      e4_q1_organizacao: 'sobrecarregado',
      e4_q2_foco: 'dispersao_frequente',
      e4_q3_comunicacao: 'assincrono_escrito',
      e4_q4_feedback: 'cauteloso',
      e4_q5_tomada_decisao: 'analitico',
      e4_q6_mudancas: 'desgaste_inicial',
      e4_q7_posicionamento: 'observador_cirurgico',
      e4_q8_limites_nao: 2,
      e5_q1_fortalezas_reconhecidas: ['rigor_qualidade', 'clareza_estruturacao'],
      e5_q2_confianca_plena: 'execucao_profunda',
      e5_q3_situacoes_desafiadoras: ['microgerenciamento', 'conflitos_politicos'],
      e5_q4_competencias_praticar: 'postura_limites',
      e5_q5_apoios_disponiveis: ['pares_confianca'],
      e5_q6_obstaculo_principal: 'cultura_ambiente',
      e5_q7_percepcao_progresso: 'estagnacao_incomoda',
      e5_q8_potencial_latente: 'criatividade_autoral',
      e6_q1_experimentar_mais: 'conversas_alinhamento',
      e6_q2_reduzir_reorganizar: 'reunioes_dispensaveis',
      e6_q3_preservar_inegociavel: 'saude_sono',
      e6_q4_micro_mudanca: 'comunicar_limite',
      e6_q5_tempo_semanal: '30_minutos',
      e6_q6_prioridade_central: 'resgate_energia',
      e6_q7_disposicao_experimentar: 3,
      e6_q8_compromisso_pessoal: 'Não tomar decisões no desespero; recuperar fôlego para escolher com lucidez',
    },
  },

  lucas: {
    name: 'Lucas Ribeiro',
    role: 'O Profissional no Início da Carreira',
    context: '1 ano de experiência, construindo repertório, curioso, hábitos de priorização em formação',
    declaredGoal: 'Identificar caminhos para explorar e desenvolver competências nos próximos meses',
    answers: {
      e1_q1_fase: 'reestruturacao',
      e1_q2_clareza: 2,
      e1_q3_satisfacao_geral: 3,
      e1_q4_energia_ocupada: ['aprendizado_novo', 'alinhamento_comunicacao'],
      e1_q5_desejo_compreensao: 'estilo_trabalho',
      e1_q6_descoberta_util: 'Descobrir minhas verdadeiras forças e como organizar meu dia a dia',
      e2_m1_autonomia: { importance: 3, satisfaction: 3 },
      e2_m2_aprendizado: { importance: 5, satisfaction: 5 },
      e2_m3_resolucao_problemas: { importance: 4, satisfaction: 3 },
      e2_m4_criatividade: { importance: 4, satisfaction: 3 },
      e2_m5_impacto: { importance: 4, satisfaction: 3 },
      e2_m6_colaboracao: { importance: 5, satisfaction: 4 },
      e2_m7_estabilidade: { importance: 3, satisfaction: 3 },
      e2_m8_reconhecimento: { importance: 4, satisfaction: 3 },
      e2_m9_variedade: { importance: 4, satisfaction: 4 },
      e2_m10_profundidade: { importance: 3, satisfaction: 3 },
      e3_t1_autonomia_orientacao: 4,
      e3_t2_seguranca_experimentacao: 4,
      e3_t3_visibilidade_tranquilidade: 3,
      e3_t4_especializacao_generalismo: 4,
      e3_t5_velocidade_qualidade: 3,
      e3_t6_ambicao_equilibrio: 3,
      e3_t7_independencia_colegiado: 4,
      e3_t8_estrutura_flexibilidade: 3,
      e4_q1_organizacao: 'fluxo_emergente',
      e4_q2_foco: 'foco_com_esforco',
      e4_q3_comunicacao: 'hibrido',
      e4_q4_feedback: 'reflexivo',
      e4_q5_tomada_decisao: 'consultivo',
      e4_q6_mudancas: 'adaptativo_rapido',
      e4_q7_posicionamento: 'facilitador',
      e4_q8_limites_nao: 3,
      e5_q1_fortalezas_reconhecidas: ['empatia_escuta', 'comunicacao_didatica'],
      e5_q2_confianca_plena: 'mentoria_time',
      e5_q3_situacoes_desafiadoras: ['alta_ambiguidade', 'isolamento'],
      e5_q4_competencias_praticar: 'priorizacao_estrategica',
      e5_q5_apoios_disponiveis: ['pares_confianca', 'recursos_estudo'],
      e5_q6_obstaculo_principal: 'clareza_prioridade',
      e5_q7_percepcao_progresso: 'avanco_claro',
      e5_q8_potencial_latente: 'comunicacao_articulacao',
      e6_q1_experimentar_mais: 'registro_aprendizados',
      e6_q2_reduzir_reorganizar: 'perfeccionismo',
      e6_q3_preservar_inegociavel: 'familia_relacoes',
      e6_q4_micro_mudanca: 'checkin_semanal',
      e6_q5_tempo_semanal: '1_hora',
      e6_q6_prioridade_central: 'foco_organizacao',
      e6_q7_disposicao_experimentar: 4,
      e6_q8_compromisso_pessoal: 'Dar tempo para construir repertório sem me comparar com veteranos',
    },
  },

  renata: {
    name: 'Renata Martins',
    role: 'A Profissional Sênior que Quer Mudar',
    context: '15 anos de experiência, histórico de liderança e impacto, busca transição estruturada com propósito e sustentabilidade',
    declaredGoal: 'Identificar transição coerente com valores, experiência e condições de sustentabilidade',
    answers: {
      e1_q1_fase: 'transicao',
      e1_q2_clareza: 3,
      e1_q3_satisfacao_geral: 3,
      e1_q4_energia_ocupada: ['alinhamento_comunicacao', 'equilibrio_vida'],
      e1_q5_desejo_compreensao: 'relacionamentos',
      e1_q6_descoberta_util: 'Mapear competências transferíveis para transição madura e consciente',
      e2_m1_autonomia: { importance: 5, satisfaction: 3 },
      e2_m2_aprendizado: { importance: 4, satisfaction: 3 },
      e2_m3_resolucao_problemas: { importance: 5, satisfaction: 4 },
      e2_m4_criatividade: { importance: 4, satisfaction: 3 },
      e2_m5_impacto: { importance: 5, satisfaction: 4 },
      e2_m6_colaboracao: { importance: 4, satisfaction: 4 },
      e2_m7_estabilidade: { importance: 5, satisfaction: 4 },
      e2_m8_reconhecimento: { importance: 4, satisfaction: 4 },
      e2_m9_variedade: { importance: 3, satisfaction: 3 },
      e2_m10_profundidade: { importance: 5, satisfaction: 3 },
      e3_t1_autonomia_orientacao: 1,
      e3_t2_seguranca_experimentacao: 2,
      e3_t3_visibilidade_tranquilidade: 3,
      e3_t4_especializacao_generalismo: 5,
      e3_t5_velocidade_qualidade: 4,
      e3_t6_ambicao_equilibrio: 4,
      e3_t7_independencia_colegiado: 3,
      e3_t8_estrutura_flexibilidade: 4,
      e4_q1_organizacao: 'metodico',
      e4_q2_foco: 'foco_consistente',
      e4_q3_comunicacao: 'assincrono_escrito',
      e4_q4_feedback: 'reflexivo',
      e4_q5_tomada_decisao: 'analitico',
      e4_q6_mudancas: 'pragmatico_calmo',
      e4_q7_posicionamento: 'voz_ativa',
      e4_q8_limites_nao: 4,
      e5_q1_fortalezas_reconhecidas: ['visao_estrategica', 'clareza_estruturacao', 'resolucao_pratica'],
      e5_q2_confianca_plena: 'otimizacao',
      e5_q3_situacoes_desafiadoras: ['conflitos_politicos', 'microgerenciamento'],
      e5_q4_competencias_praticar: 'posicionamento_influencia',
      e5_q5_apoios_disponiveis: ['pares_confianca', 'rede_externa', 'espaco_autonomia'],
      e5_q6_obstaculo_principal: 'tempo_sobrecarga',
      e5_q7_percepcao_progresso: 'estabilidade_confortavel',
      e5_q8_potencial_latente: 'desenvolvimento_pessoas',
      e6_q1_experimentar_mais: 'projetos_autorais',
      e6_q2_reduzir_reorganizar: 'disponibilidade_imediata',
      e6_q3_preservar_inegociavel: 'etica_rigor',
      e6_q4_micro_mudanca: 'planejar_vespera',
      e6_q5_tempo_semanal: '3_horas_mais',
      e6_q6_prioridade_central: 'clareza_carreira',
      e6_q7_disposicao_experimentar: 4,
      e6_q8_compromisso_pessoal: 'Honrar os 15 anos construídos, usando minha bagagem como alavanca e não como âncora',
    },
  },
};

// 2. MOTOR INDEPENDENTE DE RECALCULO MATEMÁTICO (Para verificação de referência cega)
function independentRecalculate(answers) {
  const primaryDims = [
    'motivacaoEnergia',
    'valoresLimites',
    'ambienteEstrutura',
    'clarezaDirecao',
    'forcasCompetencias',
    'comunicacaoInfluencia',
    'priorizacaoExecucao',
    'aprendizagemAdaptabilidade',
  ];

  const points = {};
  primaryDims.forEach((d) => {
    points[d] = { total: 0, maxPossible: 0, count: 0 };
  });

  const add = (dim, pts, max) => {
    points[dim].total += Math.max(0, Math.min(pts, max));
    points[dim].maxPossible += max;
    points[dim].count += 1;
  };

  // Etapa 1
  if (answers.e1_q1_fase) {
    const map = { consolidacao: 4.5, crescimento_acelerado: 4.5, transicao: 3.5, reavaliacao: 3.0, reestruturacao: 2.5 };
    add('clarezaDirecao', map[answers.e1_q1_fase] || 3.5, 5);
  }
  if (answers.e1_q2_clareza !== undefined && answers.e1_q2_clareza !== null && answers.e1_q2_clareza !== '') {
    add('clarezaDirecao', Number(answers.e1_q2_clareza) || 3, 5);
  }
  if (answers.e1_q3_satisfacao_geral !== undefined && answers.e1_q3_satisfacao_geral !== null && answers.e1_q3_satisfacao_geral !== '') {
    add('motivacaoEnergia', Number(answers.e1_q3_satisfacao_geral) || 3, 5);
  }
  if (answers.e1_q4_energia_ocupada && Array.isArray(answers.e1_q4_energia_ocupada) && answers.e1_q4_energia_ocupada.length > 0) {
    if (answers.e1_q4_energia_ocupada.includes('sobrecarga_operacional')) add('priorizacaoExecucao', 2.5, 5);
    if (answers.e1_q4_energia_ocupada.includes('tomada_decisao')) add('priorizacaoExecucao', 3.5, 5);
    if (answers.e1_q4_energia_ocupada.includes('equilibrio_vida')) add('valoresLimites', 2.5, 5);
    if (answers.e1_q4_energia_ocupada.includes('falta_clareza')) add('clarezaDirecao', 2.0, 5);
  }
  if (answers.e1_q5_desejo_compreensao) {
    const desejoMap = {
      motivadores_reais: [{ dim: 'motivacaoEnergia', score: 4.5 }, { dim: 'clarezaDirecao', score: 4.0 }],
      estilo_trabalho: [{ dim: 'ambienteEstrutura', score: 4.5 }, { dim: 'priorizacaoExecucao', score: 4.2 }],
      relacionamentos: [{ dim: 'comunicacaoInfluencia', score: 4.5 }, { dim: 'valoresLimites', score: 4.2 }],
      proximos_passos: [{ dim: 'clarezaDirecao', score: 4.8 }, { dim: 'priorizacaoExecucao', score: 4.2 }],
    };
    const mapped = desejoMap[answers.e1_q5_desejo_compreensao];
    if (mapped) mapped.forEach((item) => add(item.dim, item.score, 5));
  }

  // Etapa 2
  const motivators = [
    'e2_m1_autonomia', 'e2_m2_aprendizado', 'e2_m3_resolucao_problemas', 'e2_m4_criatividade',
    'e2_m5_impacto', 'e2_m6_colaboracao', 'e2_m7_estabilidade', 'e2_m8_reconhecimento',
    'e2_m9_variedade', 'e2_m10_profundidade',
  ];

  motivators.forEach((qId) => {
    const raw = answers[qId];
    if (raw === undefined || raw === null) return;
    let sat = 3;
    if (typeof raw === 'object') sat = Number(raw.satisfaction) || 3;
    else if (typeof raw === 'number') sat = raw;

    if (['e2_m1_autonomia', 'e2_m2_aprendizado', 'e2_m3_resolucao_problemas', 'e2_m4_criatividade', 'e2_m5_impacto', 'e2_m8_reconhecimento'].includes(qId)) {
      add('motivacaoEnergia', sat, 5);
    }
    if (['e2_m5_impacto', 'e2_m7_estabilidade', 'e2_m10_profundidade'].includes(qId)) {
      add('valoresLimites', sat, 5);
    }
    if (['e2_m1_autonomia', 'e2_m7_estabilidade', 'e2_m9_variedade', 'e2_m10_profundidade'].includes(qId)) {
      add('ambienteEstrutura', sat, 5);
    }
    if (['e2_m3_resolucao_problemas', 'e2_m4_criatividade'].includes(qId)) {
      add('forcasCompetencias', sat, 5);
    }
    if (qId === 'e2_m6_colaboracao') add('comunicacaoInfluencia', sat, 5);
    if (qId === 'e2_m10_profundidade' || qId === 'e2_m1_autonomia') add('priorizacaoExecucao', sat, 5);
    if (qId === 'e2_m2_aprendizado') {
      add('aprendizagemAdaptabilidade', sat, 5);
      add('clarezaDirecao', sat, 5);
    }
  });

  // Etapa 3
  const tensions = [
    'e3_t1_autonomia_orientacao', 'e3_t2_seguranca_experimentacao', 'e3_t3_visibilidade_tranquilidade',
    'e3_t4_especializacao_generalismo', 'e3_t5_velocidade_qualidade', 'e3_t6_ambicao_equilibrio',
    'e3_t7_independencia_colegiado', 'e3_t8_estrutura_flexibilidade',
  ];
  tensions.forEach((k) => {
    if (answers[k] === undefined || answers[k] === null || answers[k] === '') return;
    const val = Number(answers[k]) || 3;
    if (k === 'e3_t1_autonomia_orientacao') add('ambienteEstrutura', 2.5 + val * 0.5, 5);
    if (k === 'e3_t2_seguranca_experimentacao') {
      add('valoresLimites', val <= 2 ? 4.5 : val >= 4 ? 4.2 : 4.0, 5);
      add('aprendizagemAdaptabilidade', 2.2 + val * 0.55, 5);
    }
    if (k === 'e3_t3_visibilidade_tranquilidade') add('comunicacaoInfluencia', 2.5 + val * 0.5, 5);
    if (k === 'e3_t4_especializacao_generalismo') add('forcasCompetencias', 3.6 + Math.abs(val - 3) * 0.45, 5);
    if (k === 'e3_t5_velocidade_qualidade') add('priorizacaoExecucao', 2.8 + val * 0.42, 5);
    if (k === 'e3_t6_ambicao_equilibrio') {
      add('valoresLimites', 2.0 + val * 0.6, 5);
      add('motivacaoEnergia', val <= 2 ? 4.5 : 4.0, 5);
    }
    if (k === 'e3_t7_independencia_colegiado') add('comunicacaoInfluencia', 2.5 + val * 0.5, 5);
    if (k === 'e3_t8_estrutura_flexibilidade') {
      add('ambienteEstrutura', val <= 3 ? 4.5 : 3.8, 5);
      add('aprendizagemAdaptabilidade', 2.5 + val * 0.5, 5);
    }
  });

  // Etapa 4
  if (answers.e4_q1_organizacao) {
    const m = { metodico: 5.0, reativo_priorizado: 4.0, fluxo_emergente: 3.2, sobrecarregado: 2.0 };
    const v = m[answers.e4_q1_organizacao] || 3.5;
    add('ambienteEstrutura', v, 5);
    add('priorizacaoExecucao', v, 5);
  }
  if (answers.e4_q2_foco) {
    const m = { foco_consistente: 5.0, foco_com_esforco: 3.5, foco_sob_pressao: 3.0, dispersao_frequente: 2.0 };
    const v = m[answers.e4_q2_foco] || 3.5;
    add('ambienteEstrutura', v, 5);
    add('priorizacaoExecucao', v, 5);
  }
  if (answers.e4_q3_comunicacao) {
    const m = { hibrido: 4.8, assincrono_escrito: 4.3, presencial_visual: 4.0, sincrono_rapido: 3.6 };
    add('comunicacaoInfluencia', m[answers.e4_q3_comunicacao] || 4.0, 5);
  }
  if (answers.e4_q4_feedback) {
    const m = { proativo: 5.0, reflexivo: 4.5, sensivel: 3.2, cauteloso: 2.8 };
    const v = m[answers.e4_q4_feedback] || 3.5;
    add('comunicacaoInfluencia', v, 5);
    add('aprendizagemAdaptabilidade', v, 5);
  }
  if (answers.e4_q5_tomada_decisao) {
    const m = { analitico: 4.8, pragmatico: 4.5, consensual: 4.2, intuitivo: 3.6 };
    add('priorizacaoExecucao', m[answers.e4_q5_tomada_decisao] || 4.0, 5);
  }
  if (answers.e4_q6_mudancas) {
    const m = { adaptativo_rapido: 5.0, pragmatico_calmo: 4.5, desgaste_inicial: 3.0, resistencia: 2.0 };
    add('aprendizagemAdaptabilidade', m[answers.e4_q6_mudancas] || 3.5, 5);
  }
  if (answers.e4_q7_posicionamento) {
    const m = { voz_ativa: 5.0, facilitador: 4.8, observador_cirurgico: 4.0, discreto: 3.2 };
    add('comunicacaoInfluencia', m[answers.e4_q7_posicionamento] || 4.0, 5);
  }
  if (answers.e4_q8_limites_nao !== undefined && answers.e4_q8_limites_nao !== null && answers.e4_q8_limites_nao !== '') {
    const v = Number(answers.e4_q8_limites_nao) || 3;
    add('valoresLimites', v, 5);
    add('comunicacaoInfluencia', v, 5);
  }

  // Etapa 5
  if (answers.e5_q1_fortalezas_reconhecidas && Array.isArray(answers.e5_q1_fortalezas_reconhecidas) && answers.e5_q1_fortalezas_reconhecidas.length > 0) {
    add('forcasCompetencias', Math.min(5, 2.8 + answers.e5_q1_fortalezas_reconhecidas.length * 0.75), 5);
  }
  if (answers.e5_q2_confianca_plena) {
    const mapConf = {
      criacao_zero: { forcas: 5.0, motiv: 4.6 },
      otimizacao: { forcas: 4.8, motiv: 4.2, extraDim: 'priorizacaoExecucao', extraScore: 4.6 },
      mentoria_time: { forcas: 4.5, motiv: 4.5, extraDim: 'comunicacaoInfluencia', extraScore: 4.8 },
      articulacao: { forcas: 4.4, motiv: 4.3, extraDim: 'comunicacaoInfluencia', extraScore: 5.0 },
      execucao_profunda: { forcas: 4.8, motiv: 4.4, extraDim: 'priorizacaoExecucao', extraScore: 4.8 },
    };
    const c = mapConf[answers.e5_q2_confianca_plena];
    if (c) {
      add('forcasCompetencias', c.forcas, 5);
      add('motivacaoEnergia', c.motiv, 5);
      if (c.extraDim && c.extraScore) add(c.extraDim, c.extraScore, 5);
    } else {
      add('forcasCompetencias', 4.2, 5);
      add('motivacaoEnergia', 4.0, 5);
    }
  }
  if (answers.e5_q3_situacoes_desafiadoras && Array.isArray(answers.e5_q3_situacoes_desafiadoras) && answers.e5_q3_situacoes_desafiadoras.length > 0) {
    answers.e5_q3_situacoes_desafiadoras.forEach((sit) => {
      if (sit === 'conflitos_politicos') {
        add('valoresLimites', 2.5, 5);
        add('comunicacaoInfluencia', 3.0, 5);
      } else if (sit === 'reunioes_improdutivas') {
        add('priorizacaoExecucao', 2.5, 5);
        add('ambienteEstrutura', 3.0, 5);
      } else if (sit === 'microgerenciamento') {
        add('ambienteEstrutura', 2.0, 5);
        add('motivacaoEnergia', 2.5, 5);
      } else if (sit === 'isolamento') {
        add('comunicacaoInfluencia', 2.5, 5);
        add('motivacaoEnergia', 3.0, 5);
      } else if (sit === 'alta_ambiguidade') {
        add('clarezaDirecao', 2.0, 5);
        add('ambienteEstrutura', 2.5, 5);
      }
    });
  }
  if (answers.e5_q4_competencias_praticar) {
    add('aprendizagemAdaptabilidade', 4.2, 5);
    if (['priorizacao_estrategica', 'delegacao'].includes(answers.e5_q4_competencias_praticar)) {
      add('priorizacaoExecucao', 4.0, 5);
    }
  }
  if (answers.e5_q5_apoios_disponiveis && Array.isArray(answers.e5_q5_apoios_disponiveis) && answers.e5_q5_apoios_disponiveis.length > 0) {
    add('comunicacaoInfluencia', Math.min(5, 2.5 + answers.e5_q5_apoios_disponiveis.length * 0.6), 5);
  }
  if (answers.e5_q6_obstaculo_principal) {
    const mapObs = {
      tempo_sobrecarga: [{ dim: 'priorizacaoExecucao', score: 2.0 }, { dim: 'valoresLimites', score: 2.5 }],
      cultura_ambiente: [{ dim: 'ambienteEstrutura', score: 2.0 }, { dim: 'valoresLimites', score: 2.8 }],
      clareza_prioridade: [{ dim: 'clarezaDirecao', score: 2.5 }, { dim: 'priorizacaoExecucao', score: 2.5 }],
      medo_desagradar: [{ dim: 'valoresLimites', score: 2.0 }, { dim: 'comunicacaoInfluencia', score: 3.0 }],
      energia_baixa: [{ dim: 'motivacaoEnergia', score: 2.0 }, { dim: 'priorizacaoExecucao', score: 3.0 }],
    };
    const obsArr = mapObs[answers.e5_q6_obstaculo_principal];
    if (obsArr) obsArr.forEach((item) => add(item.dim, item.score, 5));
  }
  if (answers.e5_q7_percepcao_progresso) {
    const m = { avanco_claro: 5.0, estabilidade_confortavel: 4.0, estagnacao_incomoda: 2.5, turbulencia: 2.0 };
    add('clarezaDirecao', m[answers.e5_q7_percepcao_progresso] || 3.5, 5);
  }
  if (answers.e5_q8_potencial_latente) {
    if (answers.e5_q8_potencial_latente === 'bem_aproveitada') {
      add('forcasCompetencias', 5.0, 5);
      add('motivacaoEnergia', 4.8, 5);
    } else {
      add('forcasCompetencias', 3.8, 5);
      add('motivacaoEnergia', 3.5, 5);
    }
  }

  // Etapa 6
  if (answers.e6_q1_experimentar_mais) {
    const mapExp = {
      blocos_foco: [{ dim: 'priorizacaoExecucao', score: 4.8 }, { dim: 'ambienteEstrutura', score: 4.5 }],
      conversas_alinhamento: [{ dim: 'comunicacaoInfluencia', score: 4.8 }, { dim: 'valoresLimites', score: 4.5 }],
      projetos_autorais: [{ dim: 'aprendizagemAdaptabilidade', score: 4.8 }, { dim: 'motivacaoEnergia', score: 4.5 }],
      desaceleracao_pausas: [{ dim: 'valoresLimites', score: 4.8 }, { dim: 'motivacaoEnergia', score: 4.2 }],
      registro_aprendizados: [{ dim: 'aprendizagemAdaptabilidade', score: 4.8 }, { dim: 'clarezaDirecao', score: 4.2 }],
    };
    const expArr = mapExp[answers.e6_q1_experimentar_mais];
    if (expArr) expArr.forEach((item) => add(item.dim, item.score, 5));
    else add('priorizacaoExecucao', 4.2, 5);
  }
  if (answers.e6_q2_reduzir_reorganizar) {
    const mapRed = {
      reunioes_dispensaveis: [{ dim: 'priorizacaoExecucao', score: 4.5 }, { dim: 'ambienteEstrutura', score: 4.2 }],
      perfeccionismo: [{ dim: 'priorizacaoExecucao', score: 4.2 }, { dim: 'valoresLimites', score: 4.2 }],
      disponibilidade_imediata: [{ dim: 'valoresLimites', score: 4.5 }, { dim: 'ambienteEstrutura', score: 4.0 }],
      assumir_tudo: [{ dim: 'valoresLimites', score: 3.5 }, { dim: 'priorizacaoExecucao', score: 3.5 }],
    };
    const redArr = mapRed[answers.e6_q2_reduzir_reorganizar];
    if (redArr) redArr.forEach((item) => add(item.dim, item.score, 5));
    else {
      add('priorizacaoExecucao', 4.0, 5);
      add('valoresLimites', 4.0, 5);
    }
  }
  if (answers.e6_q3_preservar_inegociavel) {
    const mapPres = {
      saude_sono: [{ dim: 'valoresLimites', score: 5.0 }],
      familia_relacoes: [{ dim: 'valoresLimites', score: 5.0 }],
      autonomia_decisao: [{ dim: 'valoresLimites', score: 4.8 }, { dim: 'ambienteEstrutura', score: 4.6 }],
      etica_rigor: [{ dim: 'valoresLimites', score: 5.0 }, { dim: 'forcasCompetencias', score: 4.6 }],
    };
    const presArr = mapPres[answers.e6_q3_preservar_inegociavel];
    if (presArr) presArr.forEach((item) => add(item.dim, item.score, 5));
    else add('valoresLimites', 4.8, 5);
  }
  if (answers.e6_q4_micro_mudanca) {
    const mapMic = {
      planejar_vespera: [{ dim: 'priorizacaoExecucao', score: 4.8 }, { dim: 'ambienteEstrutura', score: 4.5 }],
      pausa_antes_responder: [{ dim: 'valoresLimites', score: 4.8 }, { dim: 'priorizacaoExecucao', score: 4.3 }],
      checkin_semanal: [{ dim: 'clarezaDirecao', score: 4.8 }, { dim: 'priorizacaoExecucao', score: 4.4 }],
      comunicar_limite: [{ dim: 'comunicacaoInfluencia', score: 4.8 }, { dim: 'valoresLimites', score: 4.8 }],
    };
    const micArr = mapMic[answers.e6_q4_micro_mudanca];
    if (micArr) micArr.forEach((item) => add(item.dim, item.score, 5));
    else add('priorizacaoExecucao', 4.2, 5);
  }
  if (answers.e6_q5_tempo_semanal) {
    const m = { '3_horas_mais': 5.0, '1_hora': 4.0, '30_minutos': 3.2 };
    add('clarezaDirecao', m[answers.e6_q5_tempo_semanal] || 3.5, 5);
  }
  if (answers.e6_q6_prioridade_central) {
    add('clarezaDirecao', 4.5, 5);
    if (answers.e6_q6_prioridade_central === 'foco_organizacao') add('priorizacaoExecucao', 4.5, 5);
    else if (answers.e6_q6_prioridade_central === 'comunicacao_posicionamento') add('comunicacaoInfluencia', 4.5, 5);
    else if (answers.e6_q6_prioridade_central === 'resgate_energia') add('motivacaoEnergia', 4.5, 5);
  }
  if (answers.e6_q7_disposicao_experimentar !== undefined && answers.e6_q7_disposicao_experimentar !== null && answers.e6_q7_disposicao_experimentar !== '') {
    add('aprendizagemAdaptabilidade', Number(answers.e6_q7_disposicao_experimentar) || 3, 5);
  }

  // Recálculo final
  const res = {};
  primaryDims.forEach((dim) => {
    const d = points[dim];
    const raw = d.maxPossible > 0 ? (d.total / d.maxPossible) * 100 : 50;
    const finalScore = Math.round(Math.max(10, Math.min(95, raw)));
    let level = 'em_desenvolvimento';
    if (finalScore >= 80) level = 'destaque';
    else if (finalScore >= 60) level = 'estruturado';
    else if (finalScore >= 40) level = 'em_desenvolvimento';
    else level = 'exploratorio';

    res[dim] = {
      numerator: Math.round(d.total * 100) / 100,
      denominator: d.maxPossible,
      count: d.count,
      rawScore: Math.round(raw * 100) / 100,
      finalScore,
      level,
    };
  });

  return res;
}

// 3. EXECUÇÃO DO DIAGNÓSTICO PARA AS 4 PERSONAS
console.log('================================================================');
console.log('BATERIA DE TESTES DE QA METODOLÓGICO — MAPA RUMO (RUMO WORKS)');
console.log('================================================================\n');

const personaResults = {};

for (const [key, p] of Object.entries(PERSONAS)) {
  const result = processAssessment(p.answers);
  const independent = independentRecalculate(p.answers);
  personaResults[key] = {
    persona: p,
    result,
    independent,
  };
}

// Imprimir Tabela de Scores
console.log('1. TABELA CONSOLIDADA DE SCORES DAS 4 PERSONAS:');
console.log('----------------------------------------------------------------');
const dims = [
  'motivacaoEnergia',
  'valoresLimites',
  'ambienteEstrutura',
  'clarezaDirecao',
  'forcasCompetencias',
  'comunicacaoInfluencia',
  'priorizacaoExecucao',
  'aprendizagemAdaptabilidade',
];

console.log('Dimensão                        | Marina | Beatriz | Lucas | Renata | Status Validação');
console.log('--------------------------------+--------+---------+-------+--------+------------------');

dims.forEach((d) => {
  const m = personaResults.marina.result.scores[d].score;
  const b = personaResults.beatriz.result.scores[d].score;
  const l = personaResults.lucas.result.scores[d].score;
  const r = personaResults.renata.result.scores[d].score;

  // Verificação contra recálculo independente
  const mInd = personaResults.marina.independent[d].finalScore;
  const bInd = personaResults.beatriz.independent[d].finalScore;
  const lInd = personaResults.lucas.independent[d].finalScore;
  const rInd = personaResults.renata.independent[d].finalScore;

  const valid = (m === mInd && b === bInd && l === lInd && r === rInd) ? '100% MATCH' : 'DIVERGÊNCIA';
  const label = DIMENSION_CONFIG[d].name.padEnd(31);
  console.log(`${label} | ${String(m).padEnd(6)} | ${String(b).padEnd(7)} | ${String(l).padEnd(5)} | ${String(r).padEnd(6)} | ${valid}`);
});

console.log('\n2. VERIFICAÇÃO DE GAPS E FRICÇÕES POR PERSONA:');
console.log('----------------------------------------------------------------');
for (const [k, pData] of Object.entries(personaResults)) {
  const gaps = pData.result.gaps;
  const crit = gaps.filter((g) => g.status === 'friccao_critica').map((g) => g.label);
  const alig = gaps.filter((g) => g.status === 'alinhado').map((g) => g.label);
  console.log(`- ${pData.persona.name}:`);
  console.log(`  * Fricções Críticas (${crit.length}): ${crit.join(', ') || 'Nenhuma'}`);
  console.log(`  * Motivadores Alinhados (${alig.length}): ${alig.slice(0, 4).join(', ')}...`);
}

console.log('\n3. VERIFICAÇÃO DE OBSERVAÇÕES E PRIORIDADES:');
console.log('----------------------------------------------------------------');
for (const [k, pData] of Object.entries(personaResults)) {
  console.log(`- ${pData.persona.name}:`);
  console.log(`  * Observações (${pData.result.observations.length}):`);
  pData.result.observations.forEach((o, i) => {
    console.log(`    [Obs ${i + 1}] (${o.dimension}): ${o.title}`);
  });
  console.log(`  * Prioridades Top 3:`);
  pData.result.priorities.forEach((pr, i) => {
    console.log(`    [Prioridade ${i + 1}]: ${pr.title}`);
  });
  console.log(`  * Ações do Plano de 30 Dias: ${pData.result.actionPlan.length} ações distribuídas em 4 semanas.`);
}

// 4. TESTE DE LIMITES (BOUNDARY TESTS)
console.log('\n4. TESTE DE LIMITES E CASOS EXTREMOS (BOUNDARY TESTS):');
console.log('----------------------------------------------------------------');

// Caso Min: todas as respostas no menor valor
const allMinAnswers = {
  e1_q1_fase: 'reestruturacao',
  e1_q2_clareza: 1,
  e1_q3_satisfacao_geral: 1,
  e1_q4_energia_ocupada: ['falta_clareza'],
  e1_q5_desejo_compreensao: 'proximos_passos',
  e3_t1_autonomia_orientacao: 1,
  e3_t2_seguranca_experimentacao: 1,
  e3_t3_visibilidade_tranquilidade: 1,
  e3_t4_especializacao_generalismo: 1,
  e3_t5_velocidade_qualidade: 1,
  e3_t6_ambicao_equilibrio: 1,
  e3_t7_independencia_colegiado: 1,
  e3_t8_estrutura_flexibilidade: 1,
  e4_q1_organizacao: 'sobrecarregado',
  e4_q2_foco: 'dispersao_frequente',
  e4_q3_comunicacao: 'sincrono_rapido',
  e4_q4_feedback: 'cauteloso',
  e4_q5_tomada_decisao: 'pragmatico',
  e4_q6_mudancas: 'resistencia',
  e4_q7_posicionamento: 'discreto',
  e4_q8_limites_nao: 1,
  e5_q1_fortalezas_reconhecidas: [],
  e5_q2_confianca_plena: 'otimizacao',
  e5_q4_competencias_praticar: 'gestao_emocional',
  e5_q5_apoios_disponiveis: [],
  e5_q7_percepcao_progresso: 'turbulencia',
  e5_q8_potencial_latente: 'bem_aproveitada',
  e6_q1_experimentar_mais: 'desaceleracao_pausas',
  e6_q2_reduzir_reorganizar: 'assumir_tudo',
  e6_q3_preservar_inegociavel: 'saude_sono',
  e6_q4_micro_mudanca: 'planejar_vespera',
  e6_q5_tempo_semanal: '30_minutos',
  e6_q6_prioridade_central: 'resgate_energia',
  e6_q7_disposicao_experimentar: 1,
};
for (let i = 1; i <= 10; i++) {
  allMinAnswers[`e2_m${i}_${['autonomia','aprendizado','resolucao_problemas','criatividade','impacto','colaboracao','estabilidade','reconhecimento','variedade','profundidade'][i-1]}`] = { importance: 1, satisfaction: 1 };
}

const minRes = processAssessment(allMinAnswers);
let minValid = true;
dims.forEach((d) => {
  const s = minRes.scores[d].score;
  if (s < 10 || s > 95) minValid = false;
});
console.log(`- Teste Todas as Respostas no Mínimo: ${minValid ? 'APROVADO' : 'FALHOU'} (Clamping [10, 95] respeitado)`);
console.log(`  Scores mínimos obtidos: ${dims.map(d => `${d.slice(0,5)}:${minRes.scores[d].score}`).join(', ')}`);

// Caso Max: todas as respostas no maior valor
const allMaxAnswers = {
  e1_q1_fase: 'consolidacao',
  e1_q2_clareza: 5,
  e1_q3_satisfacao_geral: 5,
  e1_q4_energia_ocupada: ['tomada_decisao'],
  e1_q5_desejo_compreensao: 'proximos_passos',
  e3_t1_autonomia_orientacao: 5,
  e3_t2_seguranca_experimentacao: 5,
  e3_t3_visibilidade_tranquilidade: 5,
  e3_t4_especializacao_generalismo: 5,
  e3_t5_velocidade_qualidade: 5,
  e3_t6_ambicao_equilibrio: 5,
  e3_t7_independencia_colegiado: 5,
  e3_t8_estrutura_flexibilidade: 5,
  e4_q1_organizacao: 'metodico',
  e4_q2_foco: 'foco_consistente',
  e4_q3_comunicacao: 'hibrido',
  e4_q4_feedback: 'proativo',
  e4_q5_tomada_decisao: 'pragmatico',
  e4_q6_mudancas: 'adaptativo_rapido',
  e4_q7_posicionamento: 'voz_ativa',
  e4_q8_limites_nao: 5,
  e5_q1_fortalezas_reconhecidas: ['clareza_estruturacao', 'resolucao_pratica', 'visao_estrategica'],
  e5_q2_confianca_plena: 'criacao_zero',
  e5_q4_competencias_praticar: 'priorizacao_estrategica',
  e5_q5_apoios_disponiveis: ['pares_confianca', 'lideranca_aberta', 'espaco_autonomia', 'rede_externa'],
  e5_q7_percepcao_progresso: 'avanco_claro',
  e5_q8_potencial_latente: 'pensamento_estrategico',
  e6_q1_experimentar_mais: 'blocos_foco',
  e6_q2_reduzir_reorganizar: 'reunioes_dispensaveis',
  e6_q3_preservar_inegociavel: 'etica_rigor',
  e6_q4_micro_mudanca: 'planejar_vespera',
  e6_q5_tempo_semanal: '3_horas_mais',
  e6_q6_prioridade_central: 'foco_organizacao',
  e6_q7_disposicao_experimentar: 5,
};
for (let i = 1; i <= 10; i++) {
  allMaxAnswers[`e2_m${i}_${['autonomia','aprendizado','resolucao_problemas','criatividade','impacto','colaboracao','estabilidade','reconhecimento','variedade','profundidade'][i-1]}`] = { importance: 5, satisfaction: 5 };
}

const maxRes = processAssessment(allMaxAnswers);
let maxValid = true;
dims.forEach((d) => {
  const s = maxRes.scores[d].score;
  if (s < 10 || s > 95) maxValid = false;
});
console.log(`- Teste Todas as Respostas no Máximo: ${maxValid ? 'APROVADO' : 'FALHOU'} (Clamping [10, 95] respeitado)`);
console.log(`  Scores máximos obtidos: ${dims.map(d => `${d.slice(0,5)}:${maxRes.scores[d].score}`).join(', ')}`);

// Caso Vazio: respostas ausentes {}
const emptyRes = processAssessment({});
let emptyValid = true;
dims.forEach((d) => {
  const s = emptyRes.scores[d].score;
  if (s !== 50 || isNaN(s)) emptyValid = false;
});
console.log(`- Teste de Respostas Ausentes (Empty Object): ${emptyValid ? 'APROVADO' : 'FALHOU'} (Scores neutros = 50, sem NaN nem divisão por zero)`);

// 5. TESTES DE VARIAÇÃO CONTROLADA (CONTROLLED VARIATION TESTS)
console.log('\n5. TESTES DE VARIAÇÃO CONTROLADA (SENSITIVITY & VARIATION):');
console.log('----------------------------------------------------------------');

const VARIATION_TESTS = [
  {
    persona: 'marina',
    id: 'marina_var1_priorizacao_baixa',
    desc: 'Marina altera organização de reativo para sobrecarregado e foco de sob pressão para dispersão',
    patch: { e4_q1_organizacao: 'sobrecarregado', e4_q2_foco: 'dispersao_frequente' },
    targetDim: 'priorizacaoExecucao',
  },
  {
    persona: 'marina',
    id: 'marina_var2_limites_baixo',
    desc: 'Marina pontua limites_nao em 1 (dificuldade severa) e dilema em aceleração',
    patch: { e4_q8_limites_nao: 1, e3_t6_ambicao_equilibrio: 1 },
    targetDim: 'valoresLimites',
  },
  {
    persona: 'marina',
    id: 'marina_var3_tempo_estudo_baixo',
    desc: 'Marina reduz tempo disponível para 30 minutos e momento para reavaliação',
    patch: { e6_q5_tempo_semanal: '30_minutos', e1_q1_fase: 'reavaliacao' },
    targetDim: 'clarezaDirecao',
  },
  {
    persona: 'beatriz',
    id: 'beatriz_var1_lideranca_apoio',
    desc: 'Beatriz ganha apoios de liderança aberta e pares de confiança',
    patch: { e5_q5_apoios_disponiveis: ['lideranca_aberta', 'pares_confianca', 'espaco_autonomia'] },
    targetDim: 'comunicacaoInfluencia',
  },
  {
    persona: 'beatriz',
    id: 'beatriz_var2_satisfacao_recuperada',
    desc: 'Beatriz melhora satisfação geral e satisfação com autonomia para 4',
    patch: { e1_q3_satisfacao_geral: 4, e2_m1_autonomia: { importance: 5, satisfaction: 4 } },
    targetDim: 'motivacaoEnergia',
  },
  {
    persona: 'beatriz',
    id: 'beatriz_var3_clareza_avanco',
    desc: 'Beatriz indica clareza 4/5 e percepção de avanço claro na carreira',
    patch: { e1_q2_clareza: 4, e5_q7_percepcao_progresso: 'avanco_claro' },
    targetDim: 'clarezaDirecao',
  },
  {
    persona: 'lucas',
    id: 'lucas_var1_clareza_alta',
    desc: 'Lucas passa a ter clareza 5/5 e fase de consolidação',
    patch: { e1_q1_fase: 'consolidacao', e1_q2_clareza: 5 },
    targetDim: 'clarezaDirecao',
  },
  {
    persona: 'lucas',
    id: 'lucas_var2_organizacao_metodica',
    desc: 'Lucas adota rotina metódica e foco consistente',
    patch: { e4_q1_organizacao: 'metodico', e4_q2_foco: 'foco_consistente' },
    targetDim: 'priorizacaoExecucao',
  },
  {
    persona: 'lucas',
    id: 'lucas_var3_abertura_baixa',
    desc: 'Lucas reage com resistência a mudanças e pouca disposição a testar',
    patch: { e4_q6_mudancas: 'resistencia', e6_q7_disposicao_experimentar: 1 },
    targetDim: 'aprendizagemAdaptabilidade',
  },
  {
    persona: 'renata',
    id: 'renata_var1_experimentacao_alta',
    desc: 'Renata adota postura de alta experimentação e prontidão máxima',
    patch: { e3_t2_seguranca_experimentacao: 5, e6_q7_disposicao_experimentar: 5 },
    targetDim: 'aprendizagemAdaptabilidade',
  },
  {
    persona: 'renata',
    id: 'renata_var2_saturacao_limites',
    desc: 'Renata relata dificuldade em dizer não (limite = 1) e energia drenada (satisfação = 1)',
    patch: { e4_q8_limites_nao: 1, e1_q3_satisfacao_geral: 1 },
    targetDim: 'valoresLimites',
  },
  {
    persona: 'renata',
    id: 'renata_var3_rotina_sobrecarregada',
    desc: 'Renata passa a operar com dispersão frequente e sobrecarga',
    patch: { e4_q1_organizacao: 'sobrecarregado', e4_q2_foco: 'dispersao_frequente' },
    targetDim: 'priorizacaoExecucao',
  },
];

VARIATION_TESTS.forEach((vt) => {
  const baseAnswers = PERSONAS[vt.persona].answers;
  const modAnswers = { ...baseAnswers, ...vt.patch };
  const baseRes = processAssessment(baseAnswers);
  const modRes = processAssessment(modAnswers);

  const prevScore = baseRes.scores[vt.targetDim].score;
  const newScore = modRes.scores[vt.targetDim].score;
  const delta = newScore - prevScore;

  console.log(`- [${vt.id}]:`);
  console.log(`  * ${vt.desc}`);
  console.log(`  * Dimensão: ${DIMENSION_CONFIG[vt.targetDim].name} | Score Anterior: ${prevScore} -> Novo: ${newScore} (Delta: ${delta > 0 ? '+' : ''}${delta})`);
  console.log(`  * Sensibilidade observada: ${delta !== 0 ? 'CORRETO (Mudança detectada)' : 'NEUTRO/ESTÁVEL'}`);
});
