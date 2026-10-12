import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyDownloadToken } from '@/lib/mapa/export/downloadToken';
import {
  generateMapaPreviewPdf,
  generateMapaCompletePdf,
} from '@/lib/mapa/export/mapaPdfGenerator';
import { processAssessment } from '@/lib/mapa';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token de download não fornecido.' },
        { status: 400 }
      );
    }

    // Validação criptográfica do token temporário assinado (HMAC-SHA256, 24h expiração)
    const tokenResult = verifyDownloadToken(token);
    if (!tokenResult.valid || !tokenResult.sessionId || !tokenResult.type) {
      return NextResponse.json(
        { error: tokenResult.error || 'Token de download inválido ou expirado.' },
        { status: 403 }
      );
    }

    let session = await prisma.assessmentSession.findUnique({
      where: { id: tokenResult.sessionId },
      include: {
        result: true,
        purchases: true,
      },
    }).catch(() => null);

    // Se a sessão não constar no SQLite (ambiente read-only), consultar cache em memória
    if (!session && typeof globalThis !== 'undefined') {
      const cached = (globalThis as any).__mapaResults?.[tokenResult.sessionId];
      if (cached) {
        session = {
          id: tokenResult.sessionId,
          accessToken: '',
          participantName: cached.participantName,
          participantEmail: cached.participantEmail,
          currentStage: 3,
          isCompleted: true,
          isUnlocked: cached.isUnlocked,
          createdAt: cached.updatedAt,
          updatedAt: cached.updatedAt,
          result: {
            id: 'res_' + tokenResult.sessionId,
            sessionId: tokenResult.sessionId,
            scoresJson: JSON.stringify(cached.resultData.scores),
            radarJson: JSON.stringify(cached.resultData.radarData),
            gapsJson: JSON.stringify(cached.resultData.gaps),
            pillsJson: JSON.stringify(cached.resultData.pills),
            observationsJson: JSON.stringify(cached.resultData.observations),
            prioritiesJson: JSON.stringify(cached.resultData.priorities),
            actionPlanJson: JSON.stringify(cached.resultData.actionPlan),
            engineVersion: cached.resultData.engineVersion,
            createdAt: cached.updatedAt,
            updatedAt: cached.updatedAt,
          },
          purchases: [],
        } as any;
      }
    }

    // Se a sessão não constar no DB nem na memória da instância, mas o token assinado e verificado com HMAC contiver as respostas
    if (!session && tokenResult.answers) {
      const regenerated = processAssessment(tokenResult.answers);
      session = {
        id: tokenResult.sessionId,
        accessToken: '',
        participantName: tokenResult.participantName || 'Participante',
        participantEmail: tokenResult.participantEmail || undefined,
        currentStage: 3,
        isCompleted: true,
        isUnlocked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        result: {
          id: 'res_' + tokenResult.sessionId,
          sessionId: tokenResult.sessionId,
          scoresJson: JSON.stringify(regenerated.scores),
          radarJson: JSON.stringify(regenerated.radarData),
          gapsJson: JSON.stringify(regenerated.gaps),
          pillsJson: JSON.stringify(regenerated.pills),
          observationsJson: JSON.stringify(regenerated.observations),
          prioritiesJson: JSON.stringify(regenerated.priorities),
          actionPlanJson: JSON.stringify(regenerated.actionPlan),
          engineVersion: regenerated.engineVersion,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        purchases: [],
      } as any;
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Sessão do diagnóstico não encontrada.' },
        { status: 404 }
      );
    }

    // Autorização estrita no servidor: o relatório completo requer compra ou bypass autorizado no backend
    const isServerUnlocked = Boolean(
      session.isUnlocked ||
      session.purchases?.some(
        (p) => p.status === 'COMPLETED' || p.status === 'TESTER_BYPASS'
      )
    );

    if (tokenResult.type === 'complete' && !isServerUnlocked) {
      return NextResponse.json(
        {
          error:
            'Acesso não autorizado ao relatório completo em PDF. Confirmação de pagamento necessária no servidor.',
        },
        { status: 403 }
      );
    }

    if (!session.result) {
      return NextResponse.json(
        { error: 'Resultado do diagnóstico não encontrado para esta sessão.' },
        { status: 404 }
      );
    }

    let parsedResult;
    try {
      parsedResult = {
        scores: JSON.parse(session.result.scoresJson || '{}'),
        radarData: JSON.parse(session.result.radarJson || '[]'),
        gaps: JSON.parse(session.result.gapsJson || '[]'),
        pills: JSON.parse(session.result.pillsJson || '[]'),
        observations: JSON.parse(session.result.observationsJson || '[]'),
        priorities: JSON.parse(session.result.prioritiesJson || '[]'),
        actionPlan: JSON.parse(session.result.actionPlanJson || '[]'),
      };
    } catch {
      return NextResponse.json(
        { error: 'Falha ao decodificar os dados do diagnóstico persistidos.' },
        { status: 500 }
      );
    }

    const participantInfo = {
      name: session.participantName || 'Participante',
      email: session.participantEmail || undefined,
      createdAt: session.createdAt,
    };

    let pdfBuffer: Buffer;

    if (tokenResult.type === 'preview') {
      const FREE_PLAN_DIMENSIONS = ['motivacaoEnergia', 'valoresLimites', 'ambienteEstrutura'];
      const previewRadar = parsedResult.radarData.map((item: any) => ({
        ...item,
        isLocked: !FREE_PLAN_DIMENSIONS.includes(item.dimensionKey),
      }));
      const previewObservations = parsedResult.observations
        .filter((obs: any) => FREE_PLAN_DIMENSIONS.includes(obs.dimension))
        .slice(0, 3);

      const previewData = {
        scores: parsedResult.scores,
        radarData: previewRadar,
        initialObservations: previewObservations,
        deepReflectionQuestion:
          previewObservations[0]?.reflectionQuestion ||
          'O que torna suas escolhas profissionais verdadeiramente sustentáveis hoje?',
        initialActionSuggestion:
          parsedResult.priorities[0]?.concreteAction ||
          'Reservar 30 minutos na próxima semana para mapear seus focos essenciais.',
      };

      pdfBuffer = generateMapaPreviewPdf(participantInfo, previewData);
    } else {
      pdfBuffer = generateMapaCompletePdf(participantInfo, parsedResult);
    }

    const safeName = (session.participantName || 'Participante')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);

    const docTypeLabel = tokenResult.type === 'preview' ? 'Previa' : 'Relatorio-Completo';
    const filename = `Mapa-Rumo-${docTypeLabel}-${safeName}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    console.error('[API /api/mapa/pdf] Erro na geração/download do PDF:', {
      name: error?.name,
      message: error?.message,
    });
    return NextResponse.json(
      { error: 'Falha interna ao gerar arquivo PDF.' },
      { status: 500 }
    );
  }
}
