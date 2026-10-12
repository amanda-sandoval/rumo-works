import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ASSESSMENT_QUESTIONS } from '@/lib/mapa/content/questions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, accessToken, questionId, stage, value, freeText } = body;

    if (!sessionId || !accessToken || !questionId) {
      return NextResponse.json(
        { error: 'Dados incompletos para salvar a resposta.' },
        { status: 400 }
      );
    }

    // Verificar se a questão existe no inventário (anti-tampering)
    const targetQuestion = ASSESSMENT_QUESTIONS.find((q) => q.id === questionId);
    if (!targetQuestion) {
      return NextResponse.json(
        { error: `Identificador de questão inválido ou desconhecido: ${questionId}` },
        { status: 400 }
      );
    }

    // Verificar se a sessão é válida no banco
    const session = await prisma.assessmentSession.findFirst({
      where: {
        id: sessionId,
        accessToken: accessToken,
      },
      include: {
        purchases: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Sessão inválida ou expirada.' },
        { status: 403 }
      );
    }

    const isUnlocked = Boolean(
      session.isUnlocked ||
      session.purchases?.some(
        (p) => p.status === 'COMPLETED' || p.status === 'TESTER_BYPASS'
      )
    );

    const questionStage = targetQuestion.stage || stage || 1;

    // Se a questão pertence às etapas 4 a 6 e a sessão não está paga, bloquear com 403
    if (questionStage > 3 && !isUnlocked) {
      return NextResponse.json(
        {
          error: 'Acesso às etapas 4 a 6 requer confirmação de pagamento no servidor.',
          code: 'PAYMENT_REQUIRED',
        },
        { status: 403 }
      );
    }

    const valueJson = typeof value === 'string' ? value : JSON.stringify(value);

    // Salvar ou atualizar resposta (idempotente)
    await prisma.assessmentResponse.upsert({
      where: {
        sessionId_questionId: {
          sessionId,
          questionId,
        },
      },
      update: {
        stage: questionStage,
        valueJson,
        freeText: freeText || null,
      },
      create: {
        sessionId,
        questionId,
        stage: questionStage,
        valueJson,
        freeText: freeText || null,
      },
    });

    // Atualizar estágio atual se for maior
    if (questionStage > session.currentStage) {
      await prisma.assessmentSession.update({
        where: { id: sessionId },
        data: { currentStage: questionStage },
      });
    }

    return NextResponse.json({ success: true, questionId });
  } catch (error) {
    console.warn('[API /api/mapa/response] Erro ao persistir resposta:', error);
    return NextResponse.json({ error: 'Erro ao processar resposta.' }, { status: 500 });
  }
}
