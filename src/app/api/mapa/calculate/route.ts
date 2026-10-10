import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { processAssessment } from '@/lib/mapa';
import { syncDiagnosticToPrivateSheets } from '@/lib/sheets/diagnosticSyncService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, accessToken, participantName, answers: clientAnswers, isTesterMode, isFreePlan } = body;

    if (!sessionId || !accessToken) {
      return NextResponse.json(
        { error: 'Identificador de sessão ou token ausente.' },
        { status: 400 }
      );
    }

    let answersMap: Record<string, any> = clientAnswers || {};
    let isUnlocked = !!isTesterMode;
    let effectiveName = participantName || 'Participante';

    try {
      const session = await prisma.assessmentSession.findFirst({
        where: {
          id: sessionId,
          accessToken: accessToken,
        },
        include: {
          responses: true,
          purchases: true,
        },
      });

      if (session) {
        if (session.participantName) {
          effectiveName = session.participantName;
        }
        if (
          session.isUnlocked ||
          session.purchases?.some(
            (p) => p.status === 'COMPLETED' || p.status === 'TESTER_BYPASS'
          )
        ) {
          isUnlocked = true;
        }

        // Se o banco tiver respostas salvas, mesclar
        if (session.responses && session.responses.length > 0) {
          session.responses.forEach((resp) => {
            try {
              answersMap[resp.questionId] = JSON.parse(resp.valueJson);
            } catch {
              answersMap[resp.questionId] = resp.valueJson;
            }
          });
        }
      }
    } catch (dbReadErr) {
      console.warn('[API /api/mapa/calculate] Consulta ao DB offline:', dbReadErr);
    }

    // Processar através do motor determinístico
    const resultData = processAssessment(answersMap);

    // Tentar persistir no banco de dados
    try {
      await prisma.assessmentResult.upsert({
        where: { sessionId },
        update: {
          scoresJson: JSON.stringify(resultData.scores),
          radarJson: JSON.stringify(resultData.radarData),
          gapsJson: JSON.stringify(resultData.gaps),
          pillsJson: JSON.stringify(resultData.pills),
          observationsJson: JSON.stringify(resultData.observations),
          prioritiesJson: JSON.stringify(resultData.priorities),
          actionPlanJson: JSON.stringify(resultData.actionPlan),
          engineVersion: resultData.engineVersion,
        },
        create: {
          sessionId,
          scoresJson: JSON.stringify(resultData.scores),
          radarJson: JSON.stringify(resultData.radarData),
          gapsJson: JSON.stringify(resultData.gaps),
          pillsJson: JSON.stringify(resultData.pills),
          observationsJson: JSON.stringify(resultData.observations),
          prioritiesJson: JSON.stringify(resultData.priorities),
          actionPlanJson: JSON.stringify(resultData.actionPlan),
          engineVersion: resultData.engineVersion,
        },
      });

      await prisma.assessmentSession.update({
        where: { id: sessionId },
        data: {
          isCompleted: true,
          participantName: effectiveName,
        },
      });
    } catch (dbWriteErr) {
      console.warn('[API /api/mapa/calculate] Persistência no DB offline:', dbWriteErr);
    }

    // Sincronização assíncrona privada com Google Sheets (non-blocking)
    syncDiagnosticToPrivateSheets({
      sessionId,
      participantName: effectiveName,
      answers: answersMap,
      resultData,
      isUnlocked,
      isFreePlan: !!isFreePlan,
    }).catch((err) => console.warn('[Calculate] Falha no sync background do Sheets:', err));

    // Se já estiver desbloqueado, retorna o relatório completo
    if (isUnlocked) {
      return NextResponse.json({
        isUnlocked: true,
        report: {
          sessionId,
          accessToken,
          participantName: effectiveName,
          ...resultData,
          generatedAt: new Date().toISOString(),
          isUnlocked: true,
        },
      });
    }

    // Para plano gratuito (3 dimensões avaliadas nas etapas 1 a 3)
    const FREE_PLAN_DIMENSIONS = ['motivacaoEnergia', 'valoresLimites', 'ambienteEstrutura', 'ambienteTrabalho'];

    const effectiveRadarData = isFreePlan
      ? resultData.radarData.map((item) => {
          if (!FREE_PLAN_DIMENSIONS.includes(item.dimensionKey)) {
            return {
              ...item,
              score: 0,
              isLocked: true,
            };
          }
          return {
            ...item,
            isLocked: false,
          };
        })
      : resultData.radarData;

    const filteredObservations = isFreePlan
      ? resultData.observations
          .filter((obs) => FREE_PLAN_DIMENSIONS.includes(obs.dimension))
          .slice(0, 3)
      : resultData.observations.slice(0, 3);

    // Caso contrário, retorna a prévia inicial personalizada
    return NextResponse.json({
      isUnlocked: false,
      preview: {
        sessionId,
        participantName: effectiveName,
        scores: resultData.scores,
        radarData: effectiveRadarData,
        initialObservations: filteredObservations,
        deepReflectionQuestion:
          filteredObservations[0]?.reflectionQuestion ||
          'O que torna suas escolhas profissionais verdadeiramente sustentáveis hoje?',
        initialActionSuggestion:
          resultData.priorities[0]?.concreteAction ||
          'Reservar 30 minutos na próxima semana para mapear seus focos essenciais.',
        isUnlocked: false,
        isFreePlan: !!isFreePlan,
      },
    });
  } catch (error) {
    console.error('[API /api/mapa/calculate] Erro:', error);
    return NextResponse.json(
      { error: 'Falha no processamento do diagnóstico.' },
      { status: 500 }
    );
  }
}
