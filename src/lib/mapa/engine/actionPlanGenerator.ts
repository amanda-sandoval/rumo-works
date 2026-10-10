import { ActionPlanItem } from '../types';
import { RawAnswerMap } from './scoring';

/**
 * Gera o Plano Personalizado de 30 Dias dividido em 4 semanas estruturadas,
 * calibrado a partir das respostas do usuário na Etapa 6 e nos motivadores centrais.
 */
export function generateActionPlan(answers: RawAnswerMap): ActionPlanItem[] {
  const prioridade = answers.e6_q6_prioridade_central || 'foco_organizacao';
  const tempoSemanal = answers.e6_q5_tempo_semanal || '1_hora';
  const microMudanca = answers.e6_q4_micro_mudanca || 'planejar_vespera';
  const reduzir = answers.e6_q2_reduzir_reorganizar || 'reunioes_dispensaveis';

  // Calibrador de tempo estimado em minutos por ação
  const tempoMultiplier = tempoSemanal === '30_minutos' ? 0.6 : tempoSemanal === '3_horas_mais' ? 1.5 : 1;

  const items: ActionPlanItem[] = [];

  // =========================================================================
  // SEMANA 1 (DIAS 1–7): OBSERVAR E COMPREENDER
  // =========================================================================
  items.push({
    id: 'acao_sem1_1_mapeamento_drenos',
    week: 1,
    stageName: 'Semana 1: Observar e compreender',
    title: 'Inventário de Atenção: Mapear os 3 Maiores Drenos da Semana',
    customRationale:
      'Antes de tentar mudar sua rotina, é fundamental enxergar com honestidade para onde sua energia está escorrendo sem julgamentos prévios.',
    instructions: [
      'Escolha dois dias úteis desta semana para observar suas oscilações de foco.',
      'Anote em um bloco de notas simples: que tipo de tarefa ou conversa deixou você mentalmente cansado(a)?',
      'Identifique se o cansaço veio da complexidade do trabalho ou da forma/ruído em torno dele.',
    ],
    estimatedMinutes: Math.round(20 * tempoMultiplier),
    expectedOutcome:
      'Clareza visual sobre os fatores específicos do ambiente que drenam sua energia no dia a dia.',
    completionCriterion:
      'Uma lista sucinta com 3 situações concretas registradas com a data e o contexto em que ocorreram.',
    reflectionQuestion:
      'Quantas dessas interrupções eram verdadeiramente urgentes e quantas foram apenas fruto do imediatismo alheio?',
  });

  items.push({
    id: 'acao_sem1_2_diagnostico_reduzir',
    week: 1,
    stageName: 'Semana 1: Observar e compreender',
    title: `Auditoria de Ruído: Analisar a Incidência de "${formatReduzirLabel(reduzir)}"`,
    customRationale:
      `Você identificou "${formatReduzirLabel(reduzir)}" como a principal fonte de desgaste a reorganizar. Esta ação investiga a raiz desse ruído.`,
    instructions: [
      'Revise sua agenda e notificações dos últimos 5 dias úteis.',
      'Calcule quantas horas ou quantas vezes essa situação se repetiu.',
      'Pergunte-se: qual crença pessoal sustenta essa dinâmica? (Ex: medo de parecer ausente, perfeccionismo, etc.)',
    ],
    estimatedMinutes: Math.round(25 * tempoMultiplier),
    expectedOutcome:
      'Compreensão do mecanismo que sustenta a sobrecarga antes de propor a intervenção.',
    completionCriterion:
      'Identificar o gatilho exato que costuma iniciar esse padrão na sua semana.',
    reflectionQuestion:
      'O que você teme que aconteça de pior se você diminuir sua participação nessas demandas em 30%?',
  });

  // =========================================================================
  // SEMANA 2 (DIAS 8–14): EXPERIMENTAR UMA PEQUENA MUDANÇA
  // =========================================================================
  items.push({
    id: 'acao_sem2_1_micro_experimento',
    week: 2,
    stageName: 'Semana 2: Experimentar uma micro-mudança',
    title: `Micro-Experimento Controlado: ${formatMicroMudancaLabel(microMudanca)}`,
    customRationale:
      'Grandes resoluções falham por atrito; micro-mudanças têm baixo custo de teste e geram alívio imediato no mesmo dia.',
    instructions: [
      'Pratique esse comportamento em 3 dias alternados durante esta segunda semana.',
      'Não tente torná-lo perfeito; encare como um laboratório de teste de 7 dias.',
      'Se surgirem imprevistos, retome no dia seguinte sem culpa.',
    ],
    estimatedMinutes: Math.round(15 * tempoMultiplier),
    expectedOutcome:
      'Sensação direta de autocontrole sobre um recorte específico da sua rotina.',
    completionCriterion:
      'Realizar o experimento por pelo menos 3 vezes ao longo da semana.',
    reflectionQuestion:
      'Qual foi a reação do seu corpo e da sua mente logo após praticar essa pequena mudança?',
  });

  items.push({
    id: 'acao_sem2_2_janela_protegida',
    week: 2,
    stageName: 'Semana 2: Experimentar uma micro-mudança',
    title: 'Janela de Foco Singular: 45 Minutos Sem Notificações',
    customRationale:
      'A fragmentação da atenção destrói o prazer intelectual do trabalho. Uma única janela protegida devolve o sentimento de capacidade.',
    instructions: [
      'Escolha uma tarefa de alta relevância que você vem adiando.',
      'Feche abas não essenciais, silencie mensageiros e coloque um cronômetro de 45 minutos.',
      'Trabalhe exclusivamente nessa entrega até o alarme tocar, sem trocar de contexto.',
    ],
    estimatedMinutes: Math.round(45 * tempoMultiplier),
    expectedOutcome:
      'Avanço palpável em uma entrega densa e recuperação da confiança de imersão.',
    completionCriterion:
      'Sessão de 45 minutos finalizada sem desvios para e-mail ou redes sociais.',
    reflectionQuestion:
      'Como a qualidade do seu pensamento mudou quando você eliminou a expectativa de responder imediatamente?',
  });

  // =========================================================================
  // SEMANA 3 (DIAS 15–21): AVALIAR O QUE FUNCIONOU
  // =========================================================================
  items.push({
    id: 'acao_sem3_1_revisao_calibracao',
    week: 3,
    stageName: 'Semana 3: Avaliar o que funcionou',
    title: 'Check-in de Calibração: O que Vale Preservar e o que Descartar',
    customRationale:
      'Métodos devem servir à sua vida, não o contrário. Ajustar o plano aos seus limites reais é o que garante longevidade.',
    instructions: [
      'Reserve 20 minutos calmos na sexta-feira.',
      'Classifique os experimentos das últimas duas semanas: o que gerou alívio real? O que gerou esforço excessivo?',
      'Se algo não funcionou, reduza pela metade o tamanho do hábito em vez de abandoná-lo.',
    ],
    estimatedMinutes: Math.round(20 * tempoMultiplier),
    expectedOutcome:
      'Um plano enxuto, ajustado ao seu ritmo real de trabalho e sem excessos teóricos.',
    completionCriterion:
      'Definir com clareza a prática que você deseja manter ativa para a segunda quinzena.',
    reflectionQuestion:
      'O que você aprendeu sobre sua tolerância a mudanças e seu ritmo natural?',
  });

  items.push({
    id: 'acao_sem3_2_conversa_alinhamento',
    week: 3,
    stageName: 'Semana 3: Avaliar o que funcionou',
    title: 'Pacto de Alinhamento: Uma Conversa Clara com um Interlocutor-Chave',
    customRationale:
      `Para sustentar sua prioridade de "${formatPrioridadeLabel(prioridade)}", é fundamental que ao menos uma pessoa do seu contexto conheça sua intenção.`,
    instructions: [
      'Escolha um líder, par de confiança ou parceiro(a).',
      'Compartilhe em 3 minutos: "Nas últimas semanas percebi que meu trabalho ganha muito mais qualidade quando faço X. Estou organizando meus prazos para proteger esse formato."',
      'Escute a perspectiva da outra pessoa e busque um ponto de apoio.',
    ],
    estimatedMinutes: Math.round(25 * tempoMultiplier),
    expectedOutcome:
      'Validação externa do seu posicionamento, transformando um desejo individual em um acordo colaborativo.',
    completionCriterion:
      'Realizar ou agendar formalmente esse diálogo curto.',
    reflectionQuestion:
      'Como a conversa alterou a sua segurança sobre sustentar esse limite?',
  });

  // =========================================================================
  // SEMANA 4 (DIAS 22–30): CONSOLIDAR APRENDIZADOS E ESCOLHER PRÓXIMOS PASSOS
  // =========================================================================
  items.push({
    id: 'acao_sem4_1_playbook_pessoal',
    week: 4,
    stageName: 'Semana 4: Consolidar aprendizados',
    title: 'Meu Guia de Operação: Sintetizar seus 3 Princípios Inegociáveis',
    customRationale:
      'Consolidar os aprendizados dos 30 dias em 3 regras simples e acionáveis para o seu dia a dia profissional.',
    instructions: [
      'Escreva em poucas linhas seus 3 princípios práticos consolidados.',
      'Exemplo 1: "Minhas manhãs de terça são dedicadas a foco sem reuniões."',
      'Exemplo 2: "Sempre peço 24h para responder a demandas complexas antes de assumir o prazo."',
    ],
    estimatedMinutes: Math.round(30 * tempoMultiplier),
    expectedOutcome:
      'Um manifesto pessoal compacto de postura profissional e gestão de energia.',
    completionCriterion:
      'Documento de 1 página ou nota salva no aplicativo de sua preferência.',
    reflectionQuestion:
      'De que forma esses princípios protegem o que você mais valoriza na sua carreira?',
  });

  items.push({
    id: 'acao_sem4_2_ritual_retorno',
    week: 4,
    stageName: 'Semana 4: Consolidar aprendizados',
    title: 'Ritual de Fechamento: Revisitar o Mapa Rumo e Definir o Próximo Ciclo',
    customRationale:
      'O autoconhecimento é um ciclo contínuo de experimentação e renovação consciente.',
    instructions: [
      'Abra seu relatório do Mapa Rumo novamente e revise suas pontuações iniciais.',
      'Avalie se a sensação de clareza e controle na rotina evoluiu.',
      'Escolha qual dimensão do Mapa você deseja colocar sob a lupa nos próximos 60 dias.',
    ],
    estimatedMinutes: Math.round(20 * tempoMultiplier),
    expectedOutcome:
      'Fechamento reflexivo e intencional dos primeiros 30 dias com perspectiva clara de continuidade.',
    completionCriterion:
      'Revisão do relatório concluída e registro de 1 prioridade para o próximo ciclo.',
    reflectionQuestion:
      'Quem você era quando iniciou o questionário e o que se tornou mais nítido para você hoje?',
  });

  return items;
}

function formatReduzirLabel(val: string): string {
  const map: Record<string, string> = {
    reunioes_dispensaveis: 'Reuniões Dispensáveis e Sem Pauta',
    perfeccionismo: 'Perfeccionismo e Polimento Excessivo',
    disponibilidade_imediata: 'Disponibilidade Imediata e Reatividade',
    assumir_tudo: 'Absorção Indiscriminada de Pedidos Extras',
  };
  return map[val] || 'Demandas Fragmentadas';
}

function formatMicroMudancaLabel(val: string): string {
  const map: Record<string, string> = {
    planejar_vespera: 'Definir as 2 Prioridades da Véspera',
    pausa_antes_responder: 'Pausa de 10 Minutos Antes de Aceitar Demandas',
    checkin_semanal: 'Check-in Semanal de Fechamento na Sexta-feira',
    comunicar_limite: 'Comunicar Horários de Foco ao Time',
  };
  return map[val] || 'Micro-Ajuste de Foco e Limites';
}

function formatPrioridadeLabel(val: string): string {
  const map: Record<string, string> = {
    foco_organizacao: 'Organização da Rotina e Redução de Sobrecarga',
    comunicacao_posicionamento: 'Comunicação Assertiva e Limites',
    clareza_carreira: 'Definição Estratégica de Carreira',
    resgate_energia: 'Reconexão de Energia e Sustentabilidade',
  };
  return map[val] || 'Desenvolvimento Consciente';
}
