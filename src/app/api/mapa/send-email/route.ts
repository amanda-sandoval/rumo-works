import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { deliverAssessmentEmail } from '@/lib/email/emailDeliveryService';
import { validateLead } from '@/lib/mapa/engine/leadValidation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, accessToken, reportType = 'PREVIEW', forceRetry = false } = body;

    if (!sessionId || !accessToken) {
      return NextResponse.json(
        { error: 'Identificador de sessão ou token de acesso ausente.' },
        { status: 400 }
      );
    }

    const session = await prisma.assessmentSession.findFirst({
      where: {
        id: sessionId,
        accessToken,
      },
      include: {
        result: true,
        purchases: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Sessão do diagnóstico não encontrada ou token inválido.' },
        { status: 401 }
      );
    }

    if (!session.participantEmail || !session.participantName) {
      return NextResponse.json(
        {
          error: 'E-mail ou nome do participante não cadastrado.',
          code: 'LEAD_REGISTRATION_REQUIRED',
        },
        { status: 422 }
      );
    }

    const leadCheck = validateLead(session.participantName, session.participantEmail);
    if (!leadCheck.isValid) {
      return NextResponse.json(
        {
          error: 'Dados de identificação do participante inválidos.',
          errors: leadCheck.errors,
        },
        { status: 422 }
      );
    }

    const normalizedReportType: 'PREVIEW' | 'COMPLETE' =
      reportType.toUpperCase() === 'COMPLETE' ? 'COMPLETE' : 'PREVIEW';

    // Autorização estrita no servidor para o relatório completo
    const isServerUnlocked = Boolean(
      session.isUnlocked ||
      session.purchases?.some(
        (p) => p.status === 'COMPLETED' || p.status === 'TESTER_BYPASS'
      )
    );

    if (normalizedReportType === 'COMPLETE' && !isServerUnlocked) {
      return NextResponse.json(
        {
          error:
            'Acesso não autorizado para envio do relatório completo. Pagamento pendente de confirmação no servidor.',
        },
        { status: 403 }
      );
    }

    if (!session.result) {
      return NextResponse.json(
        { error: 'O resultado do diagnóstico ainda não foi calculado para esta sessão.' },
        { status: 400 }
      );
    }

    const deliveryResult = await deliverAssessmentEmail({
      sessionId: session.id,
      reportType: normalizedReportType,
      recipientName: session.participantName,
      recipientEmail: session.participantEmail,
      forceRetry: Boolean(forceRetry),
    });

    return NextResponse.json({
      success: deliveryResult.success,
      status: deliveryResult.status,
      recipientEmail: session.participantEmail,
      downloadToken: deliveryResult.downloadToken,
      downloadUrl: deliveryResult.downloadUrl,
      alreadySent: deliveryResult.alreadySent,
      error: deliveryResult.error,
    });
  } catch (error) {
    console.error('[API /api/mapa/send-email POST] Erro:', error);
    return NextResponse.json(
      { error: 'Falha interna ao processar envio de e-mail.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const accessToken = searchParams.get('accessToken');
    const reportType = (searchParams.get('reportType') || 'PREVIEW').toUpperCase();

    if (!sessionId || !accessToken) {
      return NextResponse.json(
        { error: 'Parâmetros de autenticação de sessão ausentes.' },
        { status: 400 }
      );
    }

    const session = await prisma.assessmentSession.findFirst({
      where: {
        id: sessionId,
        accessToken,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Sessão inválida ou não encontrada.' },
        { status: 401 }
      );
    }

    const delivery = await prisma.assessmentEmailDelivery.findUnique({
      where: {
        sessionId_reportType: {
          sessionId,
          reportType,
        },
      },
    });

    return NextResponse.json({
      configured: Boolean(process.env.RESEND_API_KEY),
      delivery: delivery || null,
      participantEmail: session.participantEmail,
      participantName: session.participantName,
    });
  } catch (error) {
    console.error('[API /api/mapa/send-email GET] Erro:', error);
    return NextResponse.json(
      { error: 'Falha ao consultar status de envio do e-mail.' },
      { status: 500 }
    );
  }
}
