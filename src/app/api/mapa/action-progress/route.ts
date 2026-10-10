import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const token = searchParams.get('token');

    if (!sessionId || !token) {
      return NextResponse.json({ error: 'Credenciais ausentes.' }, { status: 400 });
    }

    const session = await prisma.assessmentSession.findFirst({
      where: { id: sessionId, accessToken: token },
      include: { actionProgress: true },
    });

    if (!session) {
      return NextResponse.json({ error: 'Sessão inválida.' }, { status: 404 });
    }

    const progressMap: Record<string, { status: string; notes?: string | null }> = {};
    session.actionProgress.forEach((item) => {
      progressMap[item.actionId] = {
        status: item.status,
        notes: item.notes,
      };
    });

    return NextResponse.json({ progress: progressMap });
  } catch (error) {
    console.error('[API /api/mapa/action-progress GET] Erro:', error);
    return NextResponse.json({ error: 'Erro ao buscar progresso.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, accessToken, actionId, status, notes } = body;

    if (!sessionId || !accessToken || !actionId) {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
    }

    const session = await prisma.assessmentSession.findFirst({
      where: { id: sessionId, accessToken },
    });

    if (!session) {
      return NextResponse.json({ error: 'Sessão inválida.' }, { status: 404 });
    }

    const updated = await prisma.actionPlanProgress.upsert({
      where: {
        sessionId_actionId: {
          sessionId,
          actionId,
        },
      },
      update: {
        status: status || 'PENDING',
        notes: notes !== undefined ? notes : undefined,
      },
      create: {
        sessionId,
        actionId,
        status: status || 'PENDING',
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, progress: updated });
  } catch (error) {
    console.error('[API /api/mapa/action-progress POST] Erro:', error);
    return NextResponse.json({ error: 'Erro ao salvar progresso.' }, { status: 500 });
  }
}
