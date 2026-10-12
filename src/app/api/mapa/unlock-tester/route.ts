import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function isKeyAuthorized(providedKey: string): boolean {
  if (!providedKey) return false;
  const cleanInput = providedKey.trim().toUpperCase();

  const isProduction = process.env.NODE_ENV === 'production';
  const isStagingOrPreview =
    process.env.APP_ENV === 'staging' ||
    process.env.VERCEL_ENV === 'preview' ||
    process.env.NEXT_PUBLIC_APP_ENV === 'staging';

  // 1. Em ambiente de produção real, o bypass de teste é estritamente DESABILITADO por padrão.
  // A variável ALLOW_TESTER_BYPASS=true NÃO é uma exceção suficiente para liberar acesso público em produção.
  if (isProduction && !isStagingOrPreview) {
    return false;
  }

  // 2. Em ambiente de homologação/staging explícito:
  // Exige dupla autorização: flag explícita ALLOW_TESTER_BYPASS=true E chave customizada configurada em MAPA_TESTER_KEY.
  if (isStagingOrPreview) {
    if (process.env.ALLOW_TESTER_BYPASS !== 'true' || !process.env.MAPA_TESTER_KEY) {
      return false;
    }
    const stagingKeys = process.env.MAPA_TESTER_KEY.split(',').map((k) => k.trim().toUpperCase());
    return stagingKeys.includes(cleanInput);
  }

  // 3. Em ambiente de desenvolvimento local (NODE_ENV !== 'production'):
  // Preserva mecanismos de teste para desenvolvimento e testes automatizados locais.
  const envKeys = process.env.MAPA_TESTER_KEY
    ? process.env.MAPA_TESTER_KEY.split(',').map((k) => k.trim().toUpperCase())
    : [];

  const defaultDevKeys = ['TESTE-VIP-2026'];
  const allAuthorized = [...envKeys, ...defaultDevKeys];

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
        { error: 'Código de teste não reconhecido ou inativo neste ambiente.' },
        { status: 401 }
      );
    }

    let destinationUrl = `/mapa/questionario?plan=complete&stage=1`;

    // Persistir liberação da sessão no banco de dados
    try {
      const session = await prisma.assessmentSession.findFirst({
        where: { id: sessionId, accessToken: accessToken },
        include: { responses: true, result: true },
      });

      if (session) {
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

        await prisma.assessmentSession.update({
          where: { id: session.id },
          data: { isUnlocked: true },
        });

        if (session.result) {
          destinationUrl = `/mapa/relatorio?session_id=${sessionId}&token=${accessToken}`;
        } else if (session.responses && session.responses.length >= 24) {
          destinationUrl = `/mapa/questionario?plan=complete&stage=4`;
        }
      }
    } catch (dbErr) {
      console.warn('[API /api/mapa/unlock-tester] Aviso ao persistir no DB:', dbErr);
    }

    return NextResponse.json({
      success: true,
      isUnlocked: true,
      message: 'Acesso VIP de teste autorizado com sucesso!',
      redirectUrl: destinationUrl,
    });
  } catch (error) {
    console.error('[API /api/mapa/unlock-tester] Erro:', error);
    return NextResponse.json(
      { error: 'Erro interno ao validar chave de teste.' },
      { status: 500 }
    );
  }
}
