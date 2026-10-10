import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, accessToken } = body;

    if (!sessionId || !accessToken) {
      return NextResponse.json(
        { error: 'Credenciais de sessão inválidas.' },
        { status: 400 }
      );
    }

    const session = await prisma.assessmentSession.findFirst({
      where: {
        id: sessionId,
        accessToken: accessToken,
      },
      include: {
        result: true,
        purchases: true,
      },
    });

    if (!session || !session.result) {
      return NextResponse.json(
        { error: 'Diagnóstico não encontrado para esta sessão.' },
        { status: 404 }
      );
    }

    // Checar se o acesso está desbloqueado
    const hasValidPurchase = session.purchases.some(
      (p) => p.status === 'COMPLETED' || p.status === 'TESTER_BYPASS'
    );
    const isUnlocked = session.isUnlocked || hasValidPurchase;

    const result = session.result;
    const scores = JSON.parse(result.scoresJson);
    const radarData = JSON.parse(result.radarJson);
    const observations = JSON.parse(result.observationsJson);

    // Se NÃO estiver desbloqueado, retorna APENAS a prévia gratuita
    if (!isUnlocked) {
      return NextResponse.json({
        isUnlocked: false,
        preview: {
          sessionId: session.id,
          participantName: session.participantName,
          scores,
          radarData,
          initialObservations: observations.slice(0, 3),
          deepReflectionQuestion:
            observations[0]?.reflectionQuestion ||
            'O que torna suas escolhas profissionais verdadeiramente sustentáveis hoje?',
          initialActionSuggestion:
            'Reservar 30 minutos na próxima semana para mapear seus focos essenciais.',
          isUnlocked: false,
        },
      });
    }

    // Se estiver desbloqueado, entrega o RELATÓRIO COMPLETO PAGO
    const gaps = JSON.parse(result.gapsJson);
    const pills = JSON.parse(result.pillsJson);
    const priorities = JSON.parse(result.prioritiesJson);
    const actionPlan = JSON.parse(result.actionPlanJson);

    return NextResponse.json({
      isUnlocked: true,
      report: {
        sessionId: session.id,
        accessToken: session.accessToken,
        participantName: session.participantName,
        participantEmail: session.participantEmail,
        scores,
        radarData,
        gaps,
        pills,
        observations,
        priorities,
        actionPlan,
        engineVersion: result.engineVersion,
        generatedAt: result.createdAt.toISOString(),
        isUnlocked: true,
      },
    });
  } catch (error) {
    console.error('[API /api/mapa/verify-access] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar direito de acesso.' },
      { status: 500 }
    );
  }
}
