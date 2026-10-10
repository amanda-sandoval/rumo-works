import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { processAssessment } from '@/lib/mapa';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, accessToken, participantName } = body;

    if (!sessionId || !accessToken) {
      return NextResponse.json(
        { error: 'Identificador de sessão ou token ausente.' },
        { status: 400 }
      );
    }

    const session = await prisma.assessmentSession.findFirst({
      where: {
        id: sessionId,
        accessToken: accessToken,
      },
      include: {
        responses: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Sessão não encontrada.' },
        { status: 404 }
      );
    }

    // Montar mapa de respostas
    const answersMap: Record<string, any> = {};
    session.responses.forEach((resp) => {
      try {
        answersMap[resp.questionId] = JSON.parse(resp.valueJson);
      } catch {
        answersMap[resp.questionId] = resp.valueJson;
      }
    });

    // Processar através do motor determinístico
    const resultData = processAssessment(answersMap);

    // Salvar ou atualizar resultado na base de dados
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

    // Atualizar status da sessão
    await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        isCompleted: true,
        participantName: participantName || session.participantName,
      },
    });

    // Se já estiver desbloqueado, retorna o relatório completo
    if (session.isUnlocked) {
      return NextResponse.json({
        isUnlocked: true,
        report: {
          sessionId: session.id,
          accessToken: session.accessToken,
          participantName: participantName || session.participantName,
          ...resultData,
          generatedAt: new Date().toISOString(),
          isUnlocked: true,
        },
      });
    }

    // Caso contrário, retorna a prévia gratuita personalizada
    return NextResponse.json({
      isUnlocked: false,
      preview: {
        sessionId: session.id,
        participantName: participantName || session.participantName,
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
  } catch (error) {
    console.error('[API /api/mapa/calculate] Erro:', error);
    return NextResponse.json(
      { error: 'Falha no processamento do diagnóstico.' },
      { status: 500 }
    );
  }
}
