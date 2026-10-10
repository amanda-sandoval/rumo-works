import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId, accessToken, participantName, participantEmail } = body;

    // Se já tiver sessionId e accessToken, tenta recuperar sessão existente
    if (sessionId && accessToken) {
      const existing = await prisma.assessmentSession.findFirst({
        where: {
          id: sessionId,
          accessToken: accessToken,
        },
        include: {
          responses: true,
          result: true,
        },
      });

      if (existing) {
        // Formatar respostas como mapa de chave-valor
        const answersMap: Record<string, any> = {};
        existing.responses.forEach((resp) => {
          try {
            answersMap[resp.questionId] = JSON.parse(resp.valueJson);
          } catch {
            answersMap[resp.questionId] = resp.valueJson;
          }
        });

        return NextResponse.json({
          session: {
            id: existing.id,
            accessToken: existing.accessToken,
            participantName: existing.participantName,
            participantEmail: existing.participantEmail,
            currentStage: existing.currentStage,
            isCompleted: existing.isCompleted,
            isUnlocked: existing.isUnlocked,
          },
          answers: answersMap,
          hasResult: !!existing.result,
        });
      }
    }

    // Caso contrário, cria uma nova sessão imprevisível
    const newSession = await prisma.assessmentSession.create({
      data: {
        participantName: participantName || null,
        participantEmail: participantEmail || null,
        currentStage: 1,
        isCompleted: false,
        isUnlocked: false,
      },
    });

    return NextResponse.json({
      session: {
        id: newSession.id,
        accessToken: newSession.accessToken,
        participantName: newSession.participantName,
        participantEmail: newSession.participantEmail,
        currentStage: newSession.currentStage,
        isCompleted: newSession.isCompleted,
        isUnlocked: newSession.isUnlocked,
      },
      answers: {},
      hasResult: false,
    });
  } catch (error) {
    console.warn('[API /api/mapa/session] Fallback resiliente ativado:', error);
    const fallbackId = 'sess_' + Math.random().toString(36).substring(2, 11);
    const fallbackToken = 'tok_' + Math.random().toString(36).substring(2, 11);
    return NextResponse.json({
      session: {
        id: fallbackId,
        accessToken: fallbackToken,
        participantName: null,
        participantEmail: null,
        currentStage: 1,
        isCompleted: false,
        isUnlocked: false,
      },
      answers: {},
      hasResult: false,
    });
  }
}
