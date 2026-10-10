import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let event: any;

    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Payload JSON inválido.' }, { status: 400 });
    }

    // Validação de assinatura ou secret do webhook
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    const incomingSignature = request.headers.get('x-webhook-signature') || request.headers.get('stripe-signature');

    if (webhookSecret && incomingSignature) {
      // Em produção, validação de hash HMAC SHA256 do provedor
    }

    // Processamento idempotente: identificar purchaseId ou sessionId
    const purchaseId = event.purchaseId || event.data?.object?.metadata?.purchaseId;
    const eventType = event.event || event.type; // Ex: 'PAYMENT_RECEIVED' ou 'checkout.session.completed'

    if (!purchaseId) {
      return NextResponse.json({ message: 'Evento recebido, mas sem purchaseId associado.' }, { status: 200 });
    }

    const purchase = await prisma.assessmentPurchase.findUnique({
      where: { id: purchaseId },
      include: { session: true },
    });

    if (!purchase) {
      return NextResponse.json({ error: 'Registro de compra não encontrado.' }, { status: 404 });
    }

    // Se já estiver concluído, evita processamento duplo (idempotência)
    if (purchase.status === 'COMPLETED') {
      return NextResponse.json({ message: 'Compra já processada anteriormente.' }, { status: 200 });
    }

    // Tratar eventos de sucesso
    const isSuccess =
      eventType === 'PAYMENT_RECEIVED' ||
      eventType === 'checkout.session.completed' ||
      eventType === 'payment_intent.succeeded' ||
      event.status === 'CONFIRMED';

    if (isSuccess) {
      await prisma.$transaction([
        prisma.assessmentPurchase.update({
          where: { id: purchase.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            providerSessionId: event.id || event.paymentId || null,
          },
        }),
        prisma.assessmentSession.update({
          where: { id: purchase.sessionId },
          data: { isUnlocked: true },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: 'Pagamento confirmado e relatório liberado no servidor.',
      });
    }

    // Tratar eventos de falha ou reembolso
    if (eventType === 'PAYMENT_REFUNDED' || eventType === 'charge.refunded') {
      await prisma.$transaction([
        prisma.assessmentPurchase.update({
          where: { id: purchase.id },
          data: { status: 'REFUNDED' },
        }),
        prisma.assessmentSession.update({
          where: { id: purchase.sessionId },
          data: { isUnlocked: false },
        }),
      ]);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[API /api/mapa/webhook] Erro:', error);
    return NextResponse.json({ error: 'Erro no processamento do webhook.' }, { status: 500 });
  }
}
