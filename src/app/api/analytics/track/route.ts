import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { googleSheetsService } from '@/lib/sheets/googleSheetsService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, sessionId, diagnosticId, pseudonymId, funnelStage, metadata } = body;

    if (!eventName || typeof eventName !== 'string') {
      return NextResponse.json({ error: 'Nome do evento obrigatório' }, { status: 400 });
    }

    // Sanitizar metadados removendo qualquer dado sensível (PII)
    let sanitizedMetadata: Record<string, any> = {};
    if (metadata && typeof metadata === 'object') {
      const forbiddenKeys = ['email', 'nome', 'name', 'password', 'cpf', 'card', 'phone', 'telefone', 'token'];
      Object.entries(metadata).forEach(([k, v]) => {
        if (!forbiddenKeys.some((fk) => k.toLowerCase().includes(fk))) {
          sanitizedMetadata[k] = v;
        }
      });
    }

    const nowIso = new Date().toISOString();
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const effectivePseudoId = pseudonymId || (sessionId ? sessionId.slice(0, 12) : 'anon');

    // 1. Tentar gravar no banco interno (com resiliência se SQLite estiver em read-only mode no Vercel)
    try {
      await prisma.analyticsEvent.create({
        data: {
          eventName,
          sessionId: sessionId || null,
          diagnosticId: diagnosticId || null,
          pseudonymId: effectivePseudoId,
          funnelStage: funnelStage || 'funnel',
          metadataJson: JSON.stringify(sanitizedMetadata),
        },
      });
    } catch (dbErr) {
      console.warn('[API /api/analytics/track] Falha ao persistir no DB interno:', dbErr);
    }

    // 2. Gravar no Google Sheets privado na aba Eventos_Funil
    googleSheetsService.appendFunnelEvent({
      event_id: eventId,
      pseudonym_id: effectivePseudoId,
      diagnostic_id: diagnosticId || sessionId || undefined,
      event_name: eventName,
      occurred_at: nowIso,
      funnel_stage: funnelStage || 'funnel',
    }).catch((sheetsErr) => {
      console.warn('[API /api/analytics/track] Falha ao sincronizar com Google Sheets:', sheetsErr);
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[API /api/analytics/track] Erro geral:', err);
    return NextResponse.json({ success: false, error: 'Falha ao registrar evento' }, { status: 500 });
  }
}
