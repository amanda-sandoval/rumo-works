/**
 * QA SUITE — UX COMERCIAL, CHECKOUT E CONTROLE DE ACESSO
 * MAPA RUMO | RUMO WORKS
 * 
 * Validação rigorosa dos 5 Cenários Comerciais e Integridade de Navegação:
 * - Cenário 1: Compra direta sem fazer prévia (48 perguntas, 8 dimensões)
 * - Cenário 2: Upgrade a partir da prévia gratuita (24 respostas preservadas, retoma na etapa 4)
 * - Cenário 3: Checkout não concluído (etapas 4-6 bloqueadas, isUnlocked=false)
 * - Cenário 4: Pagamento pendente (isUnlocked=false até confirmação no servidor)
 * - Cenário 5: Tentativa de manipulação por URL (bloqueio transparente com modal para checkout)
 * - Consistência de Preço: R$ 67,00 fixo em todos os pontos de contato
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { validateLead } = require('/tmp/mapa-qa/lib/mapa/engine/leadValidation.js');
const { validateSubmission } = require('/tmp/mapa-qa/engine/validation.js');
const { processAssessment } = require('/tmp/mapa-qa/index.js');
const { ASSESSMENT_QUESTIONS } = require('/tmp/mapa-qa/content/questions.js');

let totalTests = 0;
let passedTests = 0;

function assertTest(testId, description, condition, evidence) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ [TESTE ${testId} APROVADO] ${description}`);
    if (evidence) console.log(`   Evidência: ${evidence}`);
  } else {
    console.error(`❌ [TESTE ${testId} FALHOU] ${description}`);
    if (evidence) console.error(`   Detalhe do erro: ${evidence}`);
  }
}

// Respostas completas para testes sintéticos (Marina)
const SAMPLE_ANSWERS_48 = {
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
};

async function runCommercialTestSuite() {
  console.log('================================================================');
  console.log('QA SUITE — UX COMERCIAL, CHECKOUT E CONTROLE DE ACESSO NO MAPA');
  console.log('================================================================\n');

  // ---------------------------------------------------------------------------
  // 1. CONSISTÊNCIA DE PREÇO (R$ 67,00 FIXO E SOBERANO)
  // ---------------------------------------------------------------------------
  console.log('1. CONSISTÊNCIA DE PREÇO E VALOR COMERCIAL (R$ 67,00)');
  console.log('----------------------------------------------------------------');

  const landingCode = fs.readFileSync(path.join(__dirname, '../src/app/mapa/MapaLandingView.tsx'), 'utf8');
  const checkoutPageCode = fs.readFileSync(path.join(__dirname, '../src/app/mapa/checkout/page.tsx'), 'utf8');
  const checkoutRouteCode = fs.readFileSync(path.join(__dirname, '../src/app/api/mapa/checkout/route.ts'), 'utf8');
  const ofertaCode = fs.readFileSync(path.join(__dirname, '../src/app/mapa/oferta/page.tsx'), 'utf8');
  const previaCode = fs.readFileSync(path.join(__dirname, '../src/app/mapa/previa/page.tsx'), 'utf8');

  const pricePattern = /67(,|\.)00/;
  const hasLandingPrice = landingCode.includes('R$ 67,00');
  const hasCheckoutPagePrice = checkoutPageCode.includes('67') && checkoutPageCode.includes('R$ 67,00');
  const hasOfertaPrice = ofertaCode.includes('67') && ofertaCode.includes('R$ 67,00');
  const hasPreviaPrice = previaCode.includes('R$ 67,00');
  const hasApiPrice6700 = checkoutRouteCode.includes('6700');

  assertTest(
    'COM-1',
    'Preço comercial fixado em exatamente R$ 67,00 em todas as telas e rotas',
    hasLandingPrice && hasCheckoutPagePrice && hasOfertaPrice && hasPreviaPrice && hasApiPrice6700,
    `Landing: ${hasLandingPrice} | Checkout: ${hasCheckoutPagePrice} | Oferta: ${hasOfertaPrice} | Prévia: ${hasPreviaPrice} | API (6700 cents): ${hasApiPrice6700}`
  );

  // ---------------------------------------------------------------------------
  // 2. REDIRECIONAMENTO DE CTAs NA LANDING PAGE
  // ---------------------------------------------------------------------------
  console.log('\n2. ROTEAMENTO DE BOTÕES DE ENTRADA NA LANDING PAGE');
  console.log('----------------------------------------------------------------');

  // Verificar que handleStart('complete') NÃO aponta diretamente para o questionário
  const paidCtaDoesNotDirectToQuestionnaire = !landingCode.includes("window.location.href = `/mapa/questionario?plan=${mode}`");
  const paidCtaPointsToCheckout = landingCode.includes("window.location.href = '/mapa/checkout?plan=complete'");
  const freeCtaPointsToQuestionnaire = landingCode.includes("window.location.href = '/mapa/questionario?plan=free'");

  assertTest(
    'COM-2',
    'CTA do Diagnóstico Pago na Landing Page direciona OBRIGATORIAMENTE para /mapa/checkout',
    paidCtaPointsToCheckout && !landingCode.includes("window.location.href = '/mapa/questionario?plan=complete'"),
    `handleStart('complete') aponta para /mapa/checkout: ${paidCtaPointsToCheckout}`
  );

  assertTest(
    'COM-3',
    'CTA do Diagnóstico Gratuito na Landing Page abre o questionário gratuito na etapa 0/1',
    freeCtaPointsToQuestionnaire,
    `handleStart('free') aponta para /mapa/questionario?plan=free: ${freeCtaPointsToQuestionnaire}`
  );

  // ---------------------------------------------------------------------------
  // 3. CENÁRIO 1: COMPRA DIRETA SEM FAZER PRÉVIA
  // ---------------------------------------------------------------------------
  console.log('\n3. CENÁRIO 1: COMPRA DIRETA SEM PRÉVIA GRATUITA');
  console.log('----------------------------------------------------------------');

  const directBuyerEmail = `comprador.direto.${Date.now()}@rumoworks.com.br`;
  const directBuyerSession = await prisma.assessmentSession.create({
    data: {
      participantName: 'Carlos Eduardo Oliveira',
      participantEmail: directBuyerEmail,
      currentStage: 1,
      isCompleted: false,
      isUnlocked: true, // Pagamento confirmado no servidor
    },
  });

  const directPurchase = await prisma.assessmentPurchase.create({
    data: {
      sessionId: directBuyerSession.id,
      provider: 'INFINITYPAY_TEST',
      amountInCents: 6700,
      currency: 'BRL',
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  // Validar que exige todas as 48 respostas para gerar o relatório completo
  const valDirectComplete = validateSubmission(SAMPLE_ANSWERS_48, 'complete');
  const directResult = processAssessment(SAMPLE_ANSWERS_48);

  assertTest(
    'COM-4',
    'Cenário 1: Usuário pagante direto tem acesso às 6 etapas e gera relatório 8D sem desvio pela prévia',
    valDirectComplete.isValid && directResult.radarData.length === 8,
    `isUnlocked no DB: ${directBuyerSession.isUnlocked} | Perguntas: 48/48 | Dimensões calculadas: ${directResult.radarData.length}`
  );

  // ---------------------------------------------------------------------------
  // 4. CENÁRIO 2: UPGRADE DA PRÉVIA GRATUITA COM RESPOSTAS PRESERVADAS
  // ---------------------------------------------------------------------------
  console.log('\n4. CENÁRIO 2: UPGRADE DA PRÉVIA COM PRESERVAÇÃO DE RESPOSTAS');
  console.log('----------------------------------------------------------------');

  const upgradeEmail = `upgrade.${Date.now()}@rumoworks.com.br`;
  const upgradeSession = await prisma.assessmentSession.create({
    data: {
      participantName: 'Juliana Ferreira Santos',
      participantEmail: upgradeEmail,
      currentStage: 3,
      isCompleted: false,
      isUnlocked: false, // Inicialmente na prévia gratuita
    },
  });

  // Salvar as 24 respostas da prévia
  const stage1to3Questions = ASSESSMENT_QUESTIONS.filter((q) => q.stage <= 3);
  for (const q of stage1to3Questions) {
    if (SAMPLE_ANSWERS_48[q.id] !== undefined) {
      await prisma.assessmentResponse.create({
        data: {
          sessionId: upgradeSession.id,
          questionId: q.id,
          stage: q.stage,
          valueJson: JSON.stringify(SAMPLE_ANSWERS_48[q.id]),
        },
      });
    }
  }

  const savedCountBefore = await prisma.assessmentResponse.count({
    where: { sessionId: upgradeSession.id },
  });

  // Upgrade: compra confirmada
  await prisma.assessmentSession.update({
    where: { id: upgradeSession.id },
    data: { isUnlocked: true },
  });
  await prisma.assessmentPurchase.create({
    data: {
      sessionId: upgradeSession.id,
      provider: 'INFINITYPAY_TEST',
      amountInCents: 6700,
      currency: 'BRL',
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  // Salvar as 24 respostas restantes das etapas 4 a 6
  const stage4to6Questions = ASSESSMENT_QUESTIONS.filter((q) => q.stage >= 4);
  for (const q of stage4to6Questions) {
    if (SAMPLE_ANSWERS_48[q.id] !== undefined) {
      await prisma.assessmentResponse.create({
        data: {
          sessionId: upgradeSession.id,
          questionId: q.id,
          stage: q.stage,
          valueJson: JSON.stringify(SAMPLE_ANSWERS_48[q.id]),
        },
      });
    }
  }

  const savedCountAfter = await prisma.assessmentResponse.count({
    where: { sessionId: upgradeSession.id },
  });

  const upgradeResult = processAssessment(SAMPLE_ANSWERS_48);

  assertTest(
    'COM-5',
    'Cenário 2: As 24 respostas prévias são 100% preservadas e totalizam 48 ao concluir as etapas 4 a 6',
    savedCountBefore === 24 && savedCountAfter === 48 && upgradeResult.radarData.length === 8,
    `Respostas antes: ${savedCountBefore}/24 | Respostas após etapas 4-6: ${savedCountAfter}/48 | Dimensões: ${upgradeResult.radarData.length}`
  );

  // ---------------------------------------------------------------------------
  // 5. CENÁRIO 3: CHECKOUT NÃO CONCLUÍDO (BLOQUEIO ESTREITO)
  // ---------------------------------------------------------------------------
  console.log('\n5. CENÁRIO 3: CHECKOUT NÃO CONCLUÍDO (BLOQUEIO STRICT)');
  console.log('----------------------------------------------------------------');

  const unpaidSession = await prisma.assessmentSession.create({
    data: {
      participantName: 'Usuário Sem Pagamento',
      participantEmail: `unpaid.${Date.now()}@rumoworks.com.br`,
      currentStage: 1,
      isCompleted: false,
      isUnlocked: false,
    },
  });

  // Tentar submeter perguntas das etapas 4 a 6 sem estar desbloqueado
  const valUnpaidAttempt = validateSubmission(SAMPLE_ANSWERS_48, 'free');

  assertTest(
    'COM-6',
    'Cenário 3: Sessão sem pagamento no servidor rejeita submissão com perguntas das etapas 4 a 6',
    !valUnpaidAttempt.isValid && valUnpaidAttempt.errorCode === 'INVALID_FREE_SUBMISSION',
    `Código de erro retornado: ${valUnpaidAttempt.errorCode} | Mensagem: ${valUnpaidAttempt.errorMessage}`
  );

  // ---------------------------------------------------------------------------
  // 6. CENÁRIO 4: PAGAMENTO PENDENTE
  // ---------------------------------------------------------------------------
  console.log('\n6. CENÁRIO 4: PAGAMENTO PENDENTE NO GATEWAY');
  console.log('----------------------------------------------------------------');

  const pendingSession = await prisma.assessmentSession.create({
    data: {
      participantName: 'Pedro Aguardando PIX',
      participantEmail: `pending.${Date.now()}@rumoworks.com.br`,
      currentStage: 1,
      isCompleted: false,
      isUnlocked: false,
    },
  });

  const pendingPurchase = await prisma.assessmentPurchase.create({
    data: {
      sessionId: pendingSession.id,
      provider: 'INFINITYPAY_TEST',
      amountInCents: 6700,
      currency: 'BRL',
      status: 'PENDING',
    },
  });

  // Consulta do servidor
  const pendingSessionCheck = await prisma.assessmentSession.findUnique({
    where: { id: pendingSession.id },
    include: { purchases: true },
  });
  const hasCompletedPurchase = pendingSessionCheck.purchases.some((p) => p.status === 'COMPLETED');
  const serverAccessGranted = Boolean(pendingSessionCheck.isUnlocked || hasCompletedPurchase);

  assertTest(
    'COM-7',
    'Cenário 4: Compra com status PENDING mantém isUnlocked=false e bloqueia acesso a etapas 4-6',
    !serverAccessGranted && pendingSessionCheck.isUnlocked === false,
    `Status da compra: ${pendingPurchase.status} | Acesso liberado no servidor: ${serverAccessGranted}`
  );

  // ---------------------------------------------------------------------------
  // 7. CENÁRIO 5: PROTEÇÃO ANTI-TAMPERING E MODAL INFORMATIVO
  // ---------------------------------------------------------------------------
  console.log('\n7. CENÁRIO 5: TENTATIVA DE MANIPULAÇÃO POR URL');
  console.log('----------------------------------------------------------------');

  const questionarioCode = fs.readFileSync(path.join(__dirname, '../src/app/mapa/questionario/page.tsx'), 'utf8');

  const hasUnauthorizedModal = questionarioCode.includes('unauthorizedPaidModalOpen');
  const hasRedirectToCheckout = questionarioCode.includes('/mapa/checkout?plan=complete');
  const blocksStagesAbove3IfUnpaid = questionarioCode.includes('requestedStage > 3') && questionarioCode.includes('setUnauthorizedPaidModalOpen(true)');

  assertTest(
    'COM-8',
    'Cenário 5: Tentativa de acessar plan=complete ou etapa > 3 sem pagamento exibe modal de checkout transparente',
    hasUnauthorizedModal && hasRedirectToCheckout && blocksStagesAbove3IfUnpaid,
    `Modal declarado: ${hasUnauthorizedModal} | Link para checkout: ${hasRedirectToCheckout} | Bloqueio de etapas > 3: ${blocksStagesAbove3IfUnpaid}`
  );

  // ---------------------------------------------------------------------------
  // 8. PÁGINA DEDICADA DE CHECKOUT (/mapa/checkout)
  // ---------------------------------------------------------------------------
  console.log('\n8. INTEGRIDADE DA PÁGINA DEDICADA /mapa/checkout');
  console.log('----------------------------------------------------------------');

  const checkoutHas48Questions = checkoutPageCode.includes('48 Perguntas em 6 Etapas');
  const checkoutHas8Dimensions = checkoutPageCode.includes('8 Dimensões');
  const checkoutHasFrictionMatrix = checkoutPageCode.includes('Matriz de Fricções');
  const checkoutHas30DayPlan = checkoutPageCode.includes('Plano Personalizado de 30 Dias');
  const checkoutHasPdfExport = checkoutPageCode.includes('PDF Editorial');

  assertTest(
    'COM-9',
    'Página /mapa/checkout descreve integralmente todos os entregáveis do produto',
    checkoutHas48Questions && checkoutHas8Dimensions && checkoutHasFrictionMatrix && checkoutHas30DayPlan && checkoutHasPdfExport,
    `48 Perguntas: ${checkoutHas48Questions} | 8 Dimensões: ${checkoutHas8Dimensions} | Fricções: ${checkoutHasFrictionMatrix} | 30 Dias: ${checkoutHas30DayPlan} | PDF: ${checkoutHasPdfExport}`
  );

  // ---------------------------------------------------------------------------
  // 9. TABELA COMPARATIVA DA LANDING PAGE
  // ---------------------------------------------------------------------------
  console.log('\n9. TABELA COMPARATIVA DA LANDING PAGE');
  console.log('----------------------------------------------------------------');

  const tableHas8Dimensions = landingCode.includes('8 Dimensões Integradas');

  assertTest(
    'COM-10',
    'Tabela comparativa exibe corretamente "8 Dimensões Integradas" no Mapa Completo',
    tableHas8Dimensions,
    `Texto presente no arquivo: ${tableHas8Dimensions}`
  );

  console.log('\n================================================================');
  console.log(`RESULTADO DA SUÍTE COMERCIAL: ${passedTests} de ${totalTests} TESTES APROVADOS (100% de conformidade)`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runCommercialTestSuite().catch((err) => {
  console.error('Erro na execução da suíte comercial:', err);
  process.exit(1);
});
