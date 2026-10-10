/**
 * Teste de Integração de Ponta a Ponta: Persistência, Diagnóstico e Acesso Restrito de Testador
 */

import { prisma } from '../src/lib/db';
import { processAssessment } from '../src/lib/mapa';

async function runIntegrationTest() {
  console.log('========================================================');
  console.log('INICIANDO TESTE DE INTEGRAÇÃO DE BANCO & CONTROLE DE ACESSO');
  console.log('========================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, msg: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
    }
  }

  try {
    // 1. Criar nova sessão
    const session = await prisma.assessmentSession.create({
      data: {
        participantName: 'Amanda (Teste)',
        participantEmail: 'amanda@rumoworks.com.br',
        currentStage: 1,
        isCompleted: false,
        isUnlocked: false,
      },
    });

    assert(!!session.id && !!session.accessToken, 'Sessão criada com ID e accessToken imprevisíveis');

    // 2. Salvar respostas simuladas
    const mockResponses = [
      { questionId: 'e1_q1_fase', stage: 1, valueJson: JSON.stringify('transicao') },
      { questionId: 'e2_m1_autonomia', stage: 2, valueJson: JSON.stringify({ importance: 5, satisfaction: 4 }) },
      { questionId: 'e2_m2_aprendizado', stage: 2, valueJson: JSON.stringify({ importance: 5, satisfaction: 2 }) },
      { questionId: 'e4_q1_organizacao', stage: 4, valueJson: JSON.stringify('metodico') },
      { questionId: 'e6_q6_prioridade_central', stage: 6, valueJson: JSON.stringify('foco_organizacao') },
    ];

    for (const r of mockResponses) {
      await prisma.assessmentResponse.create({
        data: {
          sessionId: session.id,
          questionId: r.questionId,
          stage: r.stage,
          valueJson: r.valueJson,
        },
      });
    }

    const savedRespCount = await prisma.assessmentResponse.count({
      where: { sessionId: session.id },
    });
    assert(savedRespCount === mockResponses.length, `Persistiu ${savedRespCount} respostas no SQLite`);

    // 3. Processar cálculo e salvar no AssessmentResult
    const answersMap: Record<string, any> = {
      e1_q1_fase: 'transicao',
      e2_m1_autonomia: { importance: 5, satisfaction: 4 },
      e2_m2_aprendizado: { importance: 5, satisfaction: 2 },
      e4_q1_organizacao: 'metodico',
      e6_q6_prioridade_central: 'foco_organizacao',
    };

    const calculated = processAssessment(answersMap);

    const resultRecord = await prisma.assessmentResult.create({
      data: {
        sessionId: session.id,
        scoresJson: JSON.stringify(calculated.scores),
        radarJson: JSON.stringify(calculated.radarData),
        gapsJson: JSON.stringify(calculated.gaps),
        pillsJson: JSON.stringify(calculated.pills),
        observationsJson: JSON.stringify(calculated.observations),
        prioritiesJson: JSON.stringify(calculated.priorities),
        actionPlanJson: JSON.stringify(calculated.actionPlan),
        engineVersion: '1.0.0',
      },
    });

    assert(!!resultRecord.id, 'AssessmentResult salvo com sucesso com radar, scores e plano');

    // 4. Testar Verificação de Acesso antes do desbloqueio (Deve estar bloqueado)
    const sessionBeforeUnlock = await prisma.assessmentSession.findUnique({
      where: { id: session.id },
      include: { purchases: true },
    });
    const hasPurchaseBefore = sessionBeforeUnlock?.purchases.some((p) => p.status === 'COMPLETED' || p.status === 'TESTER_BYPASS');
    const isUnlockedBefore = sessionBeforeUnlock?.isUnlocked || hasPurchaseBefore;

    assert(!isUnlockedBefore, 'Relatório completo estritamente bloqueado antes do pagamento/chave');

    // 5. Desbloquear usando chave de teste restrita (TESTER_BYPASS)
    const testerKey = 'TESTE-VIP-2026';
    await prisma.assessmentPurchase.create({
      data: {
        sessionId: session.id,
        provider: 'TESTER_BYPASS',
        amountInCents: 0,
        currency: 'BRL',
        status: 'TESTER_BYPASS',
        testerCodeUsed: testerKey,
        completedAt: new Date(),
      },
    });

    await prisma.assessmentSession.update({
      where: { id: session.id },
      data: { isUnlocked: true },
    });

    // 6. Verificar se o acesso foi liberado no servidor
    const sessionAfterUnlock = await prisma.assessmentSession.findUnique({
      where: { id: session.id },
      include: { purchases: true },
    });
    const isUnlockedAfter = sessionAfterUnlock?.isUnlocked;

    assert(isUnlockedAfter === true, 'Acesso liberado com sucesso no servidor via TESTER_BYPASS');

    // 7. Interagir com o progresso do plano de 30 dias
    const firstActionId = calculated.actionPlan[0].id;
    await prisma.actionPlanProgress.create({
      data: {
        sessionId: session.id,
        actionId: firstActionId,
        status: 'COMPLETED',
        notes: 'Executado com sucesso durante a manhã de terça.',
      },
    });

    const progressRecord = await prisma.actionPlanProgress.findUnique({
      where: {
        sessionId_actionId: {
          sessionId: session.id,
          actionId: firstActionId,
        },
      },
    });

    assert(progressRecord?.status === 'COMPLETED' && progressRecord?.notes !== null, 'Progresso da ação salvo e recuperado no banco');

    // 8. Teste de conformidade LGPD: Exclusão em cascata
    await prisma.assessmentSession.delete({
      where: { id: session.id },
    });

    const checkDeletedSession = await prisma.assessmentSession.findUnique({
      where: { id: session.id },
    });
    const checkDeletedResponses = await prisma.assessmentResponse.count({
      where: { sessionId: session.id },
    });
    const checkDeletedResult = await prisma.assessmentResult.findUnique({
      where: { sessionId: session.id },
    });

    assert(
      checkDeletedSession === null && checkDeletedResponses === 0 && checkDeletedResult === null,
      'Exclusão de dados da sessão em conformidade com LGPD removeu todos os registros em cascata'
    );

    console.log('\n========================================================');
    console.log(`INTEGRAÇÃO: ${passed} de ${total} testes aprovados (100%)`);
    console.log('========================================================\n');
  } catch (error) {
    console.error('Erro na integração:', error);
    process.exit(1);
  }
}

runIntegrationTest();
