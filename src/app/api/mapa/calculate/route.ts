import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { processAssessment, validateSubmission } from '@/lib/mapa';
import { validateLead } from '@/lib/mapa/engine/leadValidation';
import { createDownloadToken } from '@/lib/mapa/export/downloadToken';
import { deliverAssessmentEmail } from '@/lib/email/emailDeliveryService';
import { syncDiagnosticToPrivateSheets } from '@/lib/sheets/diagnosticSyncService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, accessToken, participantName, participantEmail, answers: clientAnswers } = body;

    if (!sessionId || !accessToken) {
      return NextResponse.json(
        { error: 'Identificador de sessão ou token ausente.' },
        { status: 400 }
      );
    }

    // Buscar sessão e histórico de compras e respostas exclusivamente no banco de dados
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

    if (!session) {
      return NextResponse.json(
        { error: 'Sessão inválida ou não encontrada.' },
        { status: 401 }
      );
    }

    // Validação obrigatória de cadastro de lead (Nome Completo e E-mail válidos)
    const rawName = participantName || session.participantName || '';
    const rawEmail = participantEmail || session.participantEmail || '';

    const leadValidation = validateLead(rawName, rawEmail);
    if (!leadValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Identificação de participante (Nome completo e e-mail válidos) obrigatória.',
          code: 'LEAD_REGISTRATION_REQUIRED',
          errors: leadValidation.errors,
        },
        { status: 422 }
      );
    }

    const effectiveName = leadValidation.normalizedName!;
    const effectiveEmail = leadValidation.normalizedEmail!;

    // Autorização estrita no backend: NÃO confiar em flags enviadas pelo cliente
    const isServerUnlocked = Boolean(
      session.isUnlocked ||
      session.purchases?.some(
        (p) => p.status === 'COMPLETED' || p.status === 'TESTER_BYPASS'
      )
    );

    // Mesclar respostas salvas no banco com as respostas enviadas pelo cliente
    const answersMap: Record<string, any> = {};
    if (session.responses && session.responses.length > 0) {
      session.responses.forEach((resp) => {
        try {
          answersMap[resp.questionId] = JSON.parse(resp.valueJson);
        } catch {
          answersMap[resp.questionId] = resp.valueJson;
        }
      });
    }

    if (clientAnswers && typeof clientAnswers === 'object' && !Array.isArray(clientAnswers)) {
      Object.assign(answersMap, clientAnswers);
    }

    // Validação estrita de submissão (anti-tampering, integridade de tipos, escopo e completude)
    if (!isServerUnlocked) {
      // Escopo gratuito: Etapas 1 a 3 (24 perguntas: 23 pontuadas + 1 qualitativa)
      const valResult = validateSubmission(answersMap, 'free');
      if (!valResult.isValid) {
        if (valResult.errorCode === 'INVALID_FREE_SUBMISSION') {
          return NextResponse.json(
            {
              error: valResult.errorMessage,
              code: 'PAYMENT_REQUIRED',
              message: 'Perguntas das etapas 4 a 6 requerem confirmação de pagamento no servidor.',
            },
            { status: 403 }
          );
        }
        return NextResponse.json(
          {
            error: valResult.errorMessage,
            code: valResult.errorCode,
            missingQuestions: valResult.missingQuestions,
            invalidQuestions: valResult.invalidQuestions,
            answeredCount: valResult.answeredCount,
            expectedCount: valResult.expectedCount,
          },
          { status: 422 }
        );
      }
    } else {
      // Escopo completo pago: Etapas 1 a 6 (48 perguntas: 46 pontuadas + 2 qualitativas)
      const valResult = validateSubmission(answersMap, 'complete');
      if (!valResult.isValid) {
        return NextResponse.json(
          {
            error: valResult.errorMessage,
            code: valResult.errorCode,
            missingQuestions: valResult.missingQuestions,
            invalidQuestions: valResult.invalidQuestions,
            answeredCount: valResult.answeredCount,
            expectedCount: valResult.expectedCount,
          },
          { status: 422 }
        );
      }
    }

    // Processar através do motor determinístico
    const resultData = processAssessment(answersMap);

    // Persistir no banco de dados
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
          participantEmail: effectiveEmail,
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
      isUnlocked: isServerUnlocked,
      isFreePlan: !isServerUnlocked,
    }).catch((err) => console.warn('[Calculate] Falha no sync background do Sheets:', err));

    // Geração de token de download seguro temporário (24h)
    const reportType = isServerUnlocked ? 'COMPLETE' : 'PREVIEW';
    const downloadToken = createDownloadToken(
      sessionId,
      isServerUnlocked ? 'complete' : 'preview',
      24
    );
    const downloadUrl = `/api/mapa/pdf?token=${downloadToken}`;

    // Entrega de e-mail serverless-safe (aguarda execução e gravação de status)
    let emailDeliveryResult;
    try {
      emailDeliveryResult = await deliverAssessmentEmail({
        sessionId,
        reportType,
        recipientName: effectiveName,
        recipientEmail: effectiveEmail,
        resultData,
      });
    } catch (emailErr) {
      console.warn('[API /api/mapa/calculate] Falha na entrega de e-mail:', emailErr);
      emailDeliveryResult = {
        success: false,
        status: 'FAILED' as const,
        error: String(emailErr),
      };
    }

    // Se já estiver desbloqueado no servidor, retorna o relatório completo
    if (isServerUnlocked) {
      return NextResponse.json({
        isUnlocked: true,
        downloadToken,
        downloadUrl,
        emailDelivery: {
          status: emailDeliveryResult.status,
          recipientEmail: effectiveEmail,
          alreadySent: emailDeliveryResult.alreadySent,
        },
        report: {
          sessionId,
          accessToken,
          participantName: effectiveName,
          participantEmail: effectiveEmail,
          downloadToken,
          downloadUrl,
          ...resultData,
          generatedAt: new Date().toISOString(),
          isUnlocked: true,
        },
      });
    }

    // Para plano gratuito (3 dimensões âncora avaliadas nas etapas 1 a 3)
    const FREE_PLAN_DIMENSIONS = ['motivacaoEnergia', 'valoresLimites', 'ambienteEstrutura'];

    const effectiveRadarData = resultData.radarData.map((item) => {
      const isLocked = !FREE_PLAN_DIMENSIONS.includes(item.dimensionKey);
      return {
        ...item,
        isLocked,
      };
    });

    const filteredObservations = resultData.observations
      .filter((obs) => FREE_PLAN_DIMENSIONS.includes(obs.dimension))
      .slice(0, 3);

    return NextResponse.json({
      isUnlocked: false,
      downloadToken,
      downloadUrl,
      emailDelivery: {
        status: emailDeliveryResult.status,
        recipientEmail: effectiveEmail,
        alreadySent: emailDeliveryResult.alreadySent,
      },
      preview: {
        sessionId,
        participantName: effectiveName,
        participantEmail: effectiveEmail,
        downloadToken,
        downloadUrl,
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
        isFreePlan: true,
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
