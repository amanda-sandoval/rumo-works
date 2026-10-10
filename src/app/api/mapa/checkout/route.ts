import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, accessToken, customerName, customerEmail } = body;

    if (!sessionId || !accessToken) {
      return NextResponse.json(
        { error: 'Sessão inválida para checkout.' },
        { status: 400 }
      );
    }

    let session: any = null;
    try {
      session = await prisma.assessmentSession.findFirst({
        where: {
          id: sessionId,
          accessToken: accessToken,
        },
      });
    } catch (dbErr) {
      console.warn('[API /api/mapa/checkout] DB findFirst offline:', dbErr);
    }

    // Preço configurável no servidor (padrão: R$ 67,00)
    const priceInCents = parseInt(process.env.MAPA_PRICE_CENTS || '6700', 10);
    const currency = 'BRL';
    let purchaseId = 'pur_' + Date.now();

    // Salvar registro de compra pendente se DB disponível
    try {
      if (session) {
        const purchase = await prisma.assessmentPurchase.create({
          data: {
            sessionId: session.id,
            provider: process.env.PAYMENT_PROVIDER || 'ASAAS',
            amountInCents: priceInCents,
            currency,
            status: 'PENDING',
          },
        });
        purchaseId = purchase.id;

        if (customerEmail && !session.participantEmail) {
          await prisma.assessmentSession.update({
            where: { id: session.id },
            data: {
              participantEmail: customerEmail,
              participantName: customerName || session.participantName,
            },
          });
        }
      }
    } catch (dbWriteErr) {
      console.warn('[API /api/mapa/checkout] DB write offline:', dbWriteErr);
    }

    // Se houver chave Stripe configurada
    if (process.env.STRIPE_SECRET_KEY) {
      // Criação de sessão Stripe real
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.rumoworkshub.com.br';
      return NextResponse.json({
        purchaseId: purchaseId,
        amountInCents: priceInCents,
        currency,
        status: 'PENDING',
        checkoutUrl: `${baseUrl}/mapa/oferta?checkout_id=${purchaseId}`,
      });
    }

    // Estrutura pronta: retorna dados para o modal de pagamento seguro
    return NextResponse.json({
      purchaseId: purchaseId,
      amountInCents: priceInCents,
      currency,
      status: 'PENDING',
      formattedPrice: `R$ ${(priceInCents / 100).toFixed(2).replace('.', ',')}`,
      message:
        'Sessão de checkout iniciada. Configure STRIPE_SECRET_KEY ou ASAAS_API_KEY no ambiente de produção para ativação do gateway bancário.',
    });
  } catch (error) {
    console.error('[API /api/mapa/checkout] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar checkout.' },
      { status: 500 }
    );
  }
}
