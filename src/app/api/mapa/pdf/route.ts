import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyDownloadToken } from '@/lib/mapa/export/downloadToken';
import {
  generateMapaPreviewPdf,
  generateMapaCompletePdf,
} from '@/lib/mapa/export/mapaPdfGenerator';

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

    const session = await prisma.assessmentSession.findUnique({
      where: { id: tokenResult.sessionId },
      include: {
        result: true,
        purchases: true,
      },
    });

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
      },
    });
  } catch (error) {
    console.error('[API /api/mapa/pdf] Erro na geração/download do PDF:', error);
    return NextResponse.json(
      { error: 'Falha interna ao gerar arquivo PDF.' },
      { status: 500 }
    );
  }
}
