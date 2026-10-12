import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { processAssessment, validateSubmission } from '@/lib/mapa';

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

    // Se a sessão não constar no SQLite (ambiente read-only), consultar cache em memória
    if (!sessionData && typeof globalThis !== 'undefined') {
      const cached = (globalThis as any).__mapaResults?.[sessionId];
      if (cached) {
        sessionData = {
          id: sessionId,
          participantName: cached.participantName,
          participantEmail: cached.participantEmail,
          currentStage: 3,
          isUnlocked: cached.isUnlocked,
          result: {
            scoresJson: JSON.stringify(cached.resultData.scores),
            radarJson: JSON.stringify(cached.resultData.radarData),
            observationsJson: JSON.stringify(cached.resultData.observations),
            gapsJson: JSON.stringify(cached.resultData.gaps),
            pillsJson: JSON.stringify(cached.resultData.pills),
            prioritiesJson: JSON.stringify(cached.resultData.priorities),
            actionPlanJson: JSON.stringify(cached.resultData.actionPlan),
            engineVersion: cached.resultData.engineVersion,
            createdAt: cached.updatedAt,
          },
        };
        isUnlocked = cached.isUnlocked;
      }
    }

    // Se a sessão não constar no SQLite e nem no cache em memória, mas o cliente enviou as 24 respostas válidas
    if (!sessionData && clientAnswers && typeof clientAnswers === 'object' && Object.keys(clientAnswers).length >= 24) {
      const valSubmission = validateSubmission(clientAnswers, 'free');
      if (valSubmission.isValid) {
        const computed = processAssessment(clientAnswers);
        sessionData = {
          id: sessionId,
          participantName: body.participantName || 'Participante',
          participantEmail: body.participantEmail || null,
          currentStage: 3,
          isUnlocked: false,
          result: {
            scoresJson: JSON.stringify(computed.scores),
            radarJson: JSON.stringify(computed.radarData),
            observationsJson: JSON.stringify(computed.observations),
            gapsJson: JSON.stringify(computed.gaps),
            pillsJson: JSON.stringify(computed.pills),
            prioritiesJson: JSON.stringify(computed.priorities),
            actionPlanJson: JSON.stringify(computed.actionPlan),
            engineVersion: computed.engineVersion,
            createdAt: new Date(),
          },
        };
        isUnlocked = false;
      }
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
