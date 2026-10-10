import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, accessToken } = body;

    if (!sessionId || !accessToken) {
      return NextResponse.json({ error: 'Identificadores ausentes.' }, { status: 400 });
    }

    const session = await prisma.assessmentSession.findFirst({
      where: { id: sessionId, accessToken },
    });

    if (!session) {
      return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 404 });
    }

    // Exclusão completa em cascata conforme direitos da LGPD
    await prisma.assessmentSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({
      success: true,
      message: 'Todos os seus dados e respostas do Mapa Rumo foram permanentemente excluídos.',
    });
  } catch (error) {
    console.error('[API /api/mapa/delete-data] Erro:', error);
    return NextResponse.json({ error: 'Erro ao excluir dados.' }, { status: 500 });
  }
}
