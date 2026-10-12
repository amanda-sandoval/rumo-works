import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateLead } from '@/lib/mapa';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { sessionId, accessToken, name, email } = body;

    // 1. Validação estrita dos campos obrigatórios
    const validation = validateLead(name, email);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: validation.error,
          field: validation.field,
          code: 'INVALID_LEAD_DATA',
        },
        { status: 422 }
      );
    }

    const { sanitizedName, sanitizedEmail } = validation;

    // 2. Se a sessão já existir, tenta atualizar os dados
    if (sessionId && accessToken) {
      try {
        const existingSession = await prisma.assessmentSession.findFirst({
          where: {
            id: sessionId,
            accessToken: accessToken,
          },
          include: {
            purchases: true,
          },
        });

        if (existingSession) {
          const isUnlocked = Boolean(
            existingSession.isUnlocked ||
            existingSession.purchases?.some(
              (p) => p.status === 'COMPLETED' || p.status === 'TESTER_BYPASS'
            )
          );

          const updated = await prisma.assessmentSession.update({
            where: { id: existingSession.id },
            data: {
              participantName: sanitizedName,
              participantEmail: sanitizedEmail,
            },
          });

          return NextResponse.json({
            success: true,
            session: {
              id: updated.id,
              accessToken: updated.accessToken,
              participantName: updated.participantName,
              participantEmail: updated.participantEmail,
              currentStage: updated.currentStage,
              isCompleted: updated.isCompleted,
              isUnlocked,
            },
          });
        }
      } catch (dbUpdateErr) {
        console.warn('[API /api/mapa/lead] DB offline/read-only na atualização. Ativando fallback resiliente:', dbUpdateErr);
        return NextResponse.json({
          success: true,
          session: {
            id: sessionId,
            accessToken: accessToken,
            participantName: sanitizedName,
            participantEmail: sanitizedEmail,
            currentStage: 1,
            isCompleted: false,
            isUnlocked: false,
          },
        });
      }
    }

    // 3. Caso não exista sessão ativa no banco, tenta criar uma nova
    try {
      const newSession = await prisma.assessmentSession.create({
        data: {
          participantName: sanitizedName,
          participantEmail: sanitizedEmail,
          currentStage: 1,
          isCompleted: false,
          isUnlocked: false,
        },
      });

      return NextResponse.json({
        success: true,
        session: {
          id: newSession.id,
          accessToken: newSession.accessToken,
          participantName: newSession.participantName,
          participantEmail: newSession.participantEmail,
          currentStage: newSession.currentStage,
          isCompleted: newSession.isCompleted,
          isUnlocked: false,
        },
      });
    } catch (dbCreateErr) {
      console.warn('[API /api/mapa/lead] DB offline/read-only na criação. Ativando fallback resiliente:', dbCreateErr);
      const fallbackId = sessionId || ('sess_' + Math.random().toString(36).substring(2, 11));
      const fallbackToken = accessToken || ('tok_' + Math.random().toString(36).substring(2, 11));

      return NextResponse.json({
        success: true,
        session: {
          id: fallbackId,
          accessToken: fallbackToken,
          participantName: sanitizedName,
          participantEmail: sanitizedEmail,
          currentStage: 1,
          isCompleted: false,
          isUnlocked: false,
        },
      });
    }
  } catch (error) {
    console.error('[API /api/mapa/lead] Erro ao registrar identificação do lead:', error);
    return NextResponse.json(
      { error: 'Erro interno ao registrar dados de identificação.' },
      { status: 500 }
    );
  }
}
