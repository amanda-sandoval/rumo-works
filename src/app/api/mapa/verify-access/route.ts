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

    let isUnlocked = false;
    let sessionData: any = null;
    let savedResponses: Record<string, any> = {};

    try {
      const session = await prisma.assessmentSession.findFirst({
        where: {
          id: sessionId,
          accessToken: accessToken,
        },
        include: {
          result: true,
          purchases: true,
          responses: true,
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

        if (session.responses && session.responses.length > 0) {
          session.responses.forEach((resp) => {
            try {
              savedResponses[resp.questionId] = JSON.parse(resp.valueJson);
            } catch {
              savedResponses[resp.questionId] = resp.valueJson;
            }
          });
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
          currentStage: sessionData.currentStage,
          participantName: sessionData.participantName,
          participantEmail: sessionData.participantEmail,
          savedResponses,
          preview: {
            sessionId: sessionData.id,
            participantName: sessionData.participantName,
            participantEmail: sessionData.participantEmail,
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
        currentStage: sessionData.currentStage,
        participantName: sessionData.participantName,
        participantEmail: sessionData.participantEmail,
        savedResponses,
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

    // Se a sessão existe no banco mesmo sem resultado calculado ainda
    if (sessionData) {
      return NextResponse.json({
        isUnlocked,
        currentStage: sessionData.currentStage,
        participantName: sessionData.participantName,
        participantEmail: sessionData.participantEmail,
        savedResponses,
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
