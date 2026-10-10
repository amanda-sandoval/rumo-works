import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const DEFAULT_AUTHORIZED_TESTER_KEYS = [
  'TESTE-VIP-2026',
];

function isKeyAuthorized(providedKey: string): boolean {
  if (!providedKey) return false;
  const cleanInput = providedKey.trim().toUpperCase();

  // Chaves configuradas no ambiente
  const envKeys = process.env.MAPA_TESTER_KEY
    ? process.env.MAPA_TESTER_KEY.split(',').map((k) => k.trim().toUpperCase())
    : [];

  const allAuthorized = [...envKeys, ...DEFAULT_AUTHORIZED_TESTER_KEYS];
  return allAuthorized.includes(cleanInput);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, accessToken, testerKey } = body;

    if (!sessionId || !accessToken || !testerKey) {
      return NextResponse.json(
        { error: 'Parâmetros incompletos para validação de acesso de teste.' },
        { status: 400 }
      );
    }

    if (!isKeyAuthorized(testerKey)) {
      return NextResponse.json(
        { error: 'Código de teste não reconhecido ou expirado.' },
        { status: 401 }
      );
    }

    const session = await prisma.assessmentSession.findFirst({
      where: {
        id: sessionId,
        accessToken: accessToken,
      },
      include: {
        result: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Sessão do Mapa Rumo não encontrada.' },
        { status: 404 }
      );
    }

    // 1. Registrar liberação como TESTER_BYPASS na tabela de compras
    await prisma.assessmentPurchase.create({
      data: {
        sessionId: session.id,
        provider: 'TESTER_BYPASS',
        amountInCents: 0,
        currency: 'BRL',
        status: 'TESTER_BYPASS',
        testerCodeUsed: testerKey.trim().toUpperCase(),
        completedAt: new Date(),
      },
    });

    // 2. Liberar o relatório na sessão
    await prisma.assessmentSession.update({
      where: { id: session.id },
      data: { isUnlocked: true },
    });

    return NextResponse.json({
      success: true,
      isUnlocked: true,
      message: 'Acesso restrito de teste liberado com sucesso!',
      redirectUrl: `/mapa/relatorio?session_id=${session.id}&token=${session.accessToken}`,
    });
  } catch (error) {
    console.error('[API /api/mapa/unlock-tester] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao validar chave de teste.' },
      { status: 500 }
    );
  }
}
