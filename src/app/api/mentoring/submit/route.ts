import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { googleSheetsService } from '@/lib/sheets/googleSheetsService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verificação de Honeypot contra robôs de spam
    if (body.website_trap || body.b_honey) {
      return NextResponse.json({ success: true, message: 'Recebido com sucesso.' });
    }

    const {
      nome,
      email,
      linkedin,
      empresaAtual,
      cargoAtual,
      experienciaProfissional,
      objetivoProfissional,
      desafioPrincipal,
      expectativaMentoria,
      disponibilidade,
      contextoAdicional,
      origem,
    } = body;

    // Validação de campos obrigatórios
    if (!nome || typeof nome !== 'string' || nome.trim().length < 2) {
      return NextResponse.json(
        { error: 'Por favor, informe seu nome completo.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Por favor, informe um endereço de e-mail válido.' },
        { status: 400 }
      );
    }

    if (!objetivoProfissional || typeof objetivoProfissional !== 'string' || objetivoProfissional.trim().length < 5) {
      return NextResponse.json(
        { error: 'Por favor, descreva brevemente seu principal objetivo profissional.' },
        { status: 400 }
      );
    }

    if (!desafioPrincipal || typeof desafioPrincipal !== 'string' || desafioPrincipal.trim().length < 5) {
      return NextResponse.json(
        { error: 'Por favor, compartilhe seu maior desafio profissional no momento.' },
        { status: 400 }
      );
    }

    const cleanNome = nome.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanLinkedin = linkedin ? linkedin.trim() : '';
    const cleanEmpresa = empresaAtual ? empresaAtual.trim() : '';
    const cleanCargo = cargoAtual ? cargoAtual.trim() : '';
    const cleanExp = experienciaProfissional ? experienciaProfissional.trim() : '';
    const cleanObjetivo = objetivoProfissional.trim();
    const cleanDesafio = desafioPrincipal.trim();
    const cleanExpectativa = expectativaMentoria ? expectativaMentoria.trim() : '';
    const cleanDisponibilidade = disponibilidade ? disponibilidade.trim() : '';
    const cleanContexto = contextoAdicional ? contextoAdicional.trim() : '';
    const cleanOrigem = origem ? origem.trim() : 'site_modal';

    const now = new Date();
    const submissionId = `ment_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Persistência no Banco de Dados Primário
    let createdRecord: any = null;
    try {
      createdRecord = await prisma.mentoringInterest.create({
        data: {
          id: submissionId,
          submittedAt: now,
          nome: cleanNome,
          email: cleanEmail,
          linkedin: cleanLinkedin,
          empresaAtual: cleanEmpresa,
          cargoAtual: cleanCargo,
          experienciaProfissional: cleanExp,
          objetivoProfissional: cleanObjetivo,
          desafioPrincipal: cleanDesafio,
          expectativaMentoria: cleanExpectativa,
          disponibilidade: cleanDisponibilidade,
          contextoAdicional: cleanContexto,
          origem: cleanOrigem,
          statusProcessamento: 'NOVO',
          syncedToSheets: false,
        },
      });
    } catch (dbErr) {
      console.warn('[API /api/mentoring/submit] Falha ao persistir no DB primário (modo serverless read-only):', dbErr);
    }

    // 2. Sincronização segura com o Google Sheets Privado
    let sheetsSyncSuccess = false;
    try {
      const sheetResult = await googleSheetsService.appendMentoringInterest({
        submission_id: submissionId,
        submitted_at: now.toISOString(),
        nome: cleanNome,
        email: cleanEmail,
        linkedin: cleanLinkedin,
        empresa_atual: cleanEmpresa,
        cargo_atual: cleanCargo,
        experiencia_profissional: cleanExp,
        objetivo_profissional: cleanObjetivo,
        desafio_principal: cleanDesafio,
        expectativa_mentoria: cleanExpectativa,
        disponibilidade: cleanDisponibilidade,
        contexto_adicional: cleanContexto,
        origem: cleanOrigem,
        status_processamento: 'NOVO',
      });

      sheetsSyncSuccess = sheetResult.success;

      // Se sincronizou com sucesso e o DB estiver gravável, atualiza flag
      if (sheetsSyncSuccess && createdRecord) {
        await prisma.mentoringInterest.update({
          where: { id: submissionId },
          data: {
            syncedToSheets: true,
            sheetsSyncedAt: new Date(),
          },
        }).catch(() => {});
      }
    } catch (sheetErr) {
      console.error('[API /api/mentoring/submit] Erro na sincronização com Google Sheets:', sheetErr);
    }

    // 3. Resposta oficial de confirmação (conforme especificação 6.3)
    return NextResponse.json({
      success: true,
      submissionId,
      message:
        'Obrigada pelo interesse na Rumo Works! Suas informações foram recebidas e serão analisadas para entender se a mentoria é adequada aos seus objetivos.',
    });
  } catch (error) {
    console.error('[API /api/mentoring/submit] Erro interno:', error);
    return NextResponse.json(
      { error: 'Não foi possível processar sua solicitação no momento. Por favor, tente novamente.' },
      { status: 500 }
    );
  }
}
