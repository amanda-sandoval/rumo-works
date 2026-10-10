import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

    // Verificar se a sessão é válida
    const session = await prisma.assessmentSession.findFirst({
      where: {
        id: sessionId,
        accessToken: accessToken,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Sessão inválida ou expirada.' },
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
        stage: stage || 1,
        valueJson,
        freeText: freeText || null,
      },
      create: {
        sessionId,
        questionId,
        stage: stage || 1,
        valueJson,
        freeText: freeText || null,
      },
    });

    // Atualizar estágio atual se for maior
    if (stage && stage > session.currentStage) {
      await prisma.assessmentSession.update({
        where: { id: sessionId },
        data: { currentStage: stage },
      });
    }

    return NextResponse.json({ success: true, questionId });
  } catch (error) {
    console.warn('[API /api/mapa/response] Persistência em cache local:', error);
    return NextResponse.json({ success: true, localOnly: true });
  }
}
