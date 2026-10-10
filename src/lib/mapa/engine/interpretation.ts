import {
  DiagnosticPill,
  InterpretationItem,
  MotivatorGap,
  PrioritySynthesis,
  DimensionScores,
} from '../types';
import { RawAnswerMap } from './scoring';

/**
 * Biblioteca e motor de interpretação analítica e geração de pílulas diagnósticas
 */
export function generateInterpretations(
  answers: RawAnswerMap,
  scores: DimensionScores,
  gaps: MotivatorGap[]
): {
  pills: DiagnosticPill[];
  observations: InterpretationItem[];
  priorities: PrioritySynthesis[];
} {
  const pills: DiagnosticPill[] = [];
  const observations: InterpretationItem[] = [];
  const priorities: PrioritySynthesis[] = [];

  // =========================================================================
  // 1. GERAÇÃO DE PÍLULAS DE DIAGNÓSTICO (Insights rápidos com categorias)
  // =========================================================================

  // Pílulas de Motivadores
  const criticalGaps = gaps.filter((g) => g.status === 'friccao_critica');
  if (criticalGaps.length > 0) {
    pills.push({
      id: 'pill_friccao_principal',
      label: `Tensão em ${criticalGaps[0].label}`,
      category: 'POSSIVEL_TENSAO',
      description: 'Alta relevância subjetiva com nível de realização restrito na rotina atual.',
      evidence: `Importância avaliada em ${criticalGaps[0].importance}/5 vs Satisfação em ${criticalGaps[0].satisfaction}/5.`,
    });
  }

  const alignedGaps = gaps.filter((g) => g.status === 'alinhado');
  if (alignedGaps.length > 0) {
    pills.push({
      id: 'pill_fortaleza_nutrida',
      label: `Pilar Ativo: ${alignedGaps[0].label}`,
      category: 'MOTIVADOR_CHAVE',
      description: 'Motivador central com alta correspondência na prática cotidiana.',
      evidence: `Importância ${alignedGaps[0].importance}/5 e Satisfação ${alignedGaps[0].satisfaction}/5.`,
    });
  }

  // Pílulas de Estilo de Trabalho
  if (answers.e4_q1_organizacao === 'metodico') {
    pills.push({
      id: 'pill_estilo_metodico',
      label: 'Planejamento Estruturado',
      category: 'PREFERENCIA_IDENTIFICADA',
      description: 'Preferência por blocos protegidos e organização prévia da semana.',
      evidence: 'Relatou uso de planejamento deliberado e listas priorizadas.',
    });
  } else if (answers.e4_q1_organizacao === 'sobrecarregado') {
    pills.push({
      id: 'pill_alerta_urgencia',
      label: 'Predomínio de Urgências',
      category: 'TEMA_INVESTIGAR',
      description: 'Sensação frequente de responder a demandas externas em detrimento do essencial.',
      evidence: 'Sinalizou sobrecarga e dificuldade em manter consistência da agenda.',
    });
  }

  // Pílulas de Limites e Comunicação
  const limitesVal = Number(answers.e4_q8_limites_nao) || 3;
  if (limitesVal <= 2) {
    pills.push({
      id: 'pill_limites_absorcao',
      label: 'Tendência a Absorver Demandas',
      category: 'OPORTUNIDADE_EXPLORACAO',
      description: 'Dificuldade em recusar pedidos ou renegociar prazos com interlocutores.',
      evidence: `Grau de facilidade para dizer não avaliado em ${limitesVal}/5.`,
    });
  } else if (limitesVal >= 4) {
    pills.push({
      id: 'pill_limites_firmes',
      label: 'Assertividade de Limites',
      category: 'RECURSO_PERCEBIDO',
      description: 'Segurança desenvolvida para posicionar capacidade real e prazos viáveis.',
      evidence: `Grau de facilidade para dizer não avaliado em ${limitesVal}/5.`,
    });
  }

  // Pílulas de Fortalezas Declaradas
  if (answers.e5_q1_fortalezas_reconhecidas && Array.isArray(answers.e5_q1_fortalezas_reconhecidas)) {
    const fortLabels: Record<string, string> = {
      clareza_estruturacao: 'Clareza & Estruturação',
      resolucao_pratica: 'Resolução Pragmática',
      visao_estrategica: 'Visão Estratégica',
      empatia_escuta: 'Escuta Ativa & Mediação',
      rigor_qualidade: 'Rigor Técnico & Qualidade',
      comunicacao_didatica: 'Comunicação Didática',
      resiliencia_consistencia: 'Resiliência & Consistência',
    };
    answers.e5_q1_fortalezas_reconhecidas.slice(0, 2).forEach((f: string, idx: number) => {
      if (fortLabels[f]) {
        pills.push({
          id: `pill_fortaleza_${idx}`,
          label: fortLabels[f],
          category: 'RECURSO_PERCEBIDO',
          description: 'Competência reconhecida pelo próprio profissional como fonte sólida de valor.',
          evidence: 'Identificada como fortaleza consistente no mapeamento de recursos.',
        });
      }
    });
  }

  // Pílula da Prioridade dos 30 dias
  if (answers.e6_q6_prioridade_central) {
    const prioridadeMap: Record<string, string> = {
      foco_organizacao: 'Foco na Organização & Redução de Ruído',
      comunicacao_posicionamento: 'Posicionamento & Alinhamento de Expectativas',
      clareza_carreira: 'Definição Estratégica de Carreira',
      resgate_energia: 'Reconexão de Energia & Sustentabilidade',
    };
    pills.push({
      id: 'pill_prioridade_escolhida',
      label: prioridadeMap[answers.e6_q6_prioridade_central] || 'Evolução Consciente',
      category: 'ACAO_PRIORITARIA',
      description: 'Eixo estratégico definido para orientar o plano de 30 dias.',
      evidence: 'Selecionada como foco principal para as próximas semanas.',
    });
  }

  // =========================================================================
  // 2. OBSERVAÇÕES ANALÍTICAS E INTERPRETAÇÕES EM PROFUNDIDADE
  // =========================================================================

  // Observação 1: Relação entre Autonomia e Estrutura
  const tensaoAutonomia = Number(answers.e3_t1_autonomia_orientacao) || 3;
  if (tensaoAutonomia <= 2) {
    observations.push({
      id: 'obs_autonomia_alta',
      dimension: 'ambienteTrabalho',
      title: 'Autonomia com Responsabilidade Própria',
      narrative:
        'Suas respostas indicam uma forte preferência por operar com liberdade de condução. Ambientes que especificam cada micro-etapa tendem a gerar fricção imediata, enquanto contextos que definem o objetivo final e deixam a arquitetura da solução sob sua responsabilidade liberam seu melhor potencial analítico.',
      evidence: 'Preferência explícita por liberdade de condução na Etapa 3 (Valores e Limites).',
      practicalImplication:
        'Pode haver risco de isolamento ou descompasso se os alinhamentos prévios de alinhamento com a liderança forem escassos.',
      reflectionQuestion:
        'Como você pode combinar sua necessidade de liberdade com pactos curtos e visíveis de progresso?',
      suggestedExperiment:
        'Em sua próxima demanda aberta, envie um resumo prévio em 3 tópicos sobre como pretende conduzir o trabalho antes de iniciar a execução integral.',
      priorityWeight: 9,
    });
  } else {
    observations.push({
      id: 'obs_alinhamento_estruturado',
      dimension: 'ambienteTrabalho',
      title: 'Busca por Clareza e Parâmetros Concretos',
      narrative:
        'Você valoriza nitidez sobre o que é esperado e prefere construir acordos explícitos antes de gastar energia na execução. Esse traço previne retrabalho, reduz ansiedade de entrega e garante que os critérios de sucesso estejam alinhados desde o primeiro dia.',
      evidence: 'Priorização de alinhamento detalhado e expectativas explícitas na Etapa 3.',
      practicalImplication:
        'Contextos com alta ambiguidade de liderança podem paralisar ou exigir esforço desproporcional para extrair definições.',
      reflectionQuestion:
        'Quando a liderança for vaga, qual é a pergunta mínima capaz de transformar incerteza em um escopo acionável?',
      suggestedExperiment:
        'Exercite rascunhar você mesmo(a) os critérios de conclusão e submetê-los para um "de acordo" rápido com seu gestor.',
      priorityWeight: 8,
    });
  }

  // Observação 2: Fricção de Energia ou Sustentabilidade
  if (criticalGaps.length > 0) {
    const topGap = criticalGaps[0];
    observations.push({
      id: 'obs_friccao_critica',
      dimension: 'motivacaoEnergia',
      title: `O Descompasso entre Valor e Prática: ${topGap.label}`,
      narrative:
        `Um padrão notável nos seus dados é a distância entre o quanto você valoriza "${topGap.label}" e o quanto isso tem acontecido na sua rotina recente. Quando um elemento de alta importância não encontra vazão, é comum surgir uma sensação silenciosa de esforço árduo com pouco retorno emocional.`,
      evidence: `Importância declarada nível ${topGap.importance}/5 contrastando com satisfação atual de nível ${topGap.satisfaction}/5.`,
      practicalImplication:
        'A longo prazo, descompassos desse tipo são a principal raiz de desengajamento e esgotamento involuntário.',
      reflectionQuestion:
        `O que está bloqueando mais "${topGap.label}" hoje: a natureza das tarefas ou a forma como seu tempo está organizado?`,
      suggestedExperiment:
        `Identifique uma única atividade semanal que permita aproximar 5% a mais de "${topGap.label}" na sua rotina.`,
      priorityWeight: 10,
    });
  } else {
    observations.push({
      id: 'obs_equilibrio_motivadores',
      dimension: 'motivacaoEnergia',
      title: 'Consistência de Energia e Sustentação',
      narrative:
        'Seus motivadores declarados mantêm um nível saudável de correspondência com as condições que você encontra hoje. Esse alinhamento cria uma base estável, permitindo que suas decisões profissionais sejam tomadas a partir de escolhas conscientes, e não de urgência ou saturação.',
      evidence: 'Ausência de distorções severas entre importância declarada e satisfação na Etapa 2.',
      practicalImplication:
        'Excelente momento para consolidar aprendizados e projetar movimentos mais ousados sem o peso do cansaço crônico.',
      reflectionQuestion:
        'Como proteger essa sustentabilidade quando a demanda externa inevitavelmente subir?',
      suggestedExperiment:
        'Mantenha um inventário quinzenal das atividades que mais recarregam seu foco.',
      priorityWeight: 7,
    });
  }

  // Observação 3: Colaboração e Sustentação de Limites
  if (limitesVal <= 2) {
    observations.push({
      id: 'obs_dificuldade_limites',
      dimension: 'valoresLimites',
      title: 'O Custo Invisível da Dificuldade em Negociar Limites',
      narrative:
        'Suas respostas apontam para uma postura prestativa e responsável, mas que frequentemente cobra um pedágio alto: absorver pedidos de última hora e estender a jornada para não frustrar expectativas externas. Aprender a negociar prazos não é falta de compromisso, mas o único caminho para sustentar rigor técnico e saúde mental.',
      evidence: `Facilidade relatada para dizer "não" ou negociar prazos pontuada em ${limitesVal}/5.`,
      practicalImplication:
        'Gera uma agenda fragmentada onde os projetos estratégicos são empurrados para as margens do expediente.',
      reflectionQuestion:
        'Qual foi a última vez em que aceitar um pedido de outra pessoa significou, na prática, descumprir um compromisso com você mesmo(a)?',
      suggestedExperiment:
        'Adote a regra dos 15 minutos: diante de uma nova demanda repentina, responda: "Deixe-me conferir meus prazos atuais antes de confirmar a entrega até as 17h".',
      priorityWeight: 9,
    });
  } else {
    observations.push({
      id: 'obs_comunicacao_dialogo',
      dimension: 'colaboracaoComunicacao',
      title: 'Transparência nas Trocas e Maturidade de Diálogo',
      narrative:
        'Você demonstra capacidade de articular prioridades e sustentar limites de forma construtiva. Essa habilidade favorece uma colaboração madura, onde expectativas são alinhadas abertamente sem acúmulo de ressentimentos operacionais.',
      evidence: `Pontuação de segurança em limites avaliada em ${limitesVal}/5 e padrão comunicativo reflexivo.`,
      practicalImplication:
        'Favorece liderança informal e confiança mútua em projetos com alta interdependência.',
      reflectionQuestion:
        'Como você pode apoiar pares que ainda sentem receio de negociar limites com a mesma clareza?',
      suggestedExperiment:
        'Compartilhe explicitamente sua lógica de priorização nas aberturas de reuniões de alinhamento.',
      priorityWeight: 7,
    });
  }

  // =========================================================================
  // 3. SÍNTESE CRUZADA: ATÉ 3 PRIORIDADES CENTRAIS
  // =========================================================================

  // Prioridade A: Proteção de Espaço Mental & Foco
  priorities.push({
    id: 'prioridade_foco_estruturado',
    title: 'Recuperar Margem Mental e Proteger o Essencial',
    observed:
      'A rotina atual apresenta momentos de sobrecarga ou fragmentação que competem diretamente com a dedicação a trabalhos de alto valor e reflexão.',
    evidence:
      `Pontuação de ${scores.ambienteTrabalho.score}/100 em Ambiente e Estrutura; tensão entre urgências e foco profundo.`,
    hypothesis:
      'Pequenos ajustes de protocolo (como blocos de 90 minutos de foco sem notificações) podem devolver sensação de progresso tangível.',
    reflectionQuestion:
      'Quais são as duas tarefas que, se concluídas hoje, tornariam o seu dia profissional verdadeiramente produtivo?',
    concreteAction:
      'Bloquear na agenda 2 janelas de 60 minutos na próxima semana dedicadas exclusivamente a uma única entrega estratégica.',
  });

  // Prioridade B: Alinhamento de Fricções de Energia
  if (criticalGaps.length > 0) {
    const topG = criticalGaps[0];
    priorities.push({
      id: 'prioridade_friccao_energia',
      title: `Endereçar o Gap de "${topG.label}"`,
      observed:
        `Existe uma desconexão evidente entre o que mais te mobiliza intelectualmente e o que preenche sua jornada.`,
      evidence:
        `Diferença de ${topG.gap} pontos entre importância e satisfação neste aspecto.`,
      hypothesis:
        'Não é necessário mudar de emprego radicalmente para reencontrar motivação; pequenas conversas de escopo já trazem alívio significativo.',
      reflectionQuestion:
        `Como trazer mais de "${topG.label}" para um projeto que já está sob sua responsabilidade?`,
      concreteAction:
        `Agendar uma conversa de alinhamento de escopo nos próximos 14 dias focada em conectar suas competências a essa dimensão.`,
    });
  } else {
    priorities.push({
      id: 'prioridade_expansao_fortalezas',
      title: 'Alavancar Fortalezas Consolidadas',
      observed:
        'Com uma rotina estável e motivadores equilibrados, seu maior retorno virá da intencionalidade de expansão.',
      evidence:
        `Pontuação equilibrada em Motivação e Energia (${scores.motivacaoEnergia.score}/100).`,
      hypothesis:
        'Sistematizar o conhecimento e documentar seus aprendizados gerará maior autoridade profissional e visibilidade orgânica.',
      reflectionQuestion:
        'O que você faz com facilidade que os outros acham complexo e como tornar isso mais evidente?',
      concreteAction:
        'Documentar um playbook simples ou aprendizado recente para compartilhar com o time ou sua rede.',
    });
  }

  // Prioridade C: Construção de Hábitos para o Próximo Ciclo
  priorities.push({
    id: 'prioridade_proximos_passos',
    title: 'Transformar Reflexão em Experimentos de 30 Dias',
    observed:
      'Você demonstra maturidade para avaliar seu contexto, mas a evolução depende de testar micro-mudanças com baixa fricção.',
    evidence:
      `Dimensão de Próximos Passos pontuada em ${scores.desenvolvimentoFuturo.score}/100.`,
    hypothesis:
      'Mudanças sustentáveis não exigem transformações monumentais; exigem repetições consistentes de micro-ações que geram alívio imediato.',
    reflectionQuestion:
      'Qual é o experimento mais simples e seguro que você pode conduzir sem precisar de autorização de ninguém?',
    concreteAction:
      'Seguir o roteiro estruturado das 4 semanas do Plano de 30 Dias do Mapa Rumo, registrando seu progresso.',
  });

  return {
    pills,
    observations,
    priorities: priorities.slice(0, 3),
  };
}
