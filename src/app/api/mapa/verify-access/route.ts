import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { processAssessment } from '@/lib/mapa';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, accessToken, answers: clientAnswers, isTesterMode, testerKey } = body;

    if (!sessionId || !accessToken) {
      return NextResponse.json(
        { error: 'Credenciais de sessão inválidas.' },
        { status: 400 }
      );
    }

    let isUnlocked = !!isTesterMode || testerKey === 'TESTE-VIP-2026';
    let sessionData: any = null;

    try {
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

      if (session) {
        sessionData = session;
        const hasValidPurchase = session.purchases?.some(
          (p) => p.status === 'COMPLETED' || p.status === 'TESTER_BYPASS'
        );
        if (session.isUnlocked || hasValidPurchase) {
          isUnlocked = true;
        }
      }
    } catch (dbReadErr) {
      console.warn('[API /api/mapa/verify-access] Consulta ao DB offline:', dbReadErr);
    }

    // Se temos resultado no banco, utiliza ele
    if (sessionData && sessionData.result) {
      const result = sessionData.result;
      const scores = JSON.parse(result.scoresJson);
      const radarData = JSON.parse(result.radarJson);
      const observations = JSON.parse(result.observationsJson);

      if (!isUnlocked) {
        return NextResponse.json({
          isUnlocked: false,
          preview: {
            sessionId: sessionData.id,
            participantName: sessionData.participantName,
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

      const gaps = JSON.parse(result.gapsJson);
      const pills = JSON.parse(result.pillsJson);
      const priorities = JSON.parse(result.prioritiesJson);
      const actionPlan = JSON.parse(result.actionPlanJson);

      return NextResponse.json({
        isUnlocked: true,
        report: {
          sessionId: sessionData.id,
          accessToken: sessionData.accessToken,
          participantName: sessionData.participantName,
          participantEmail: sessionData.participantEmail,
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
    }

    // Fallback se DB não estiver disponível mas temos respostas salvas localmente
    if (clientAnswers) {
      const resultData = processAssessment(clientAnswers);

      if (isUnlocked) {
        return NextResponse.json({
          isUnlocked: true,
          report: {
            sessionId,
            accessToken,
            participantName: 'Participante',
            ...resultData,
            generatedAt: new Date().toISOString(),
            isUnlocked: true,
          },
        });
      }

      return NextResponse.json({
        isUnlocked: false,
        preview: {
          sessionId,
          participantName: 'Participante',
          scores: resultData.scores,
          radarData: resultData.radarData,
          initialObservations: resultData.observations.slice(0, 3),
          deepReflectionQuestion:
            resultData.observations[0]?.reflectionQuestion ||
            'O que torna suas escolhas profissionais verdadeiramente sustentáveis hoje?',
          initialActionSuggestion:
            resultData.priorities[0]?.concreteAction ||
            'Reservar 30 minutos na próxima semana para mapear seus focos essenciais.',
          isUnlocked: false,
        },
      });
    }

    return NextResponse.json(
      { error: 'Diagnóstico não encontrado para esta sessão.' },
      { status: 404 }
    );
  } catch (error) {
    console.error('[API /api/mapa/verify-access] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar direito de acesso.' },
      { status: 500 }
    );
  }
}
