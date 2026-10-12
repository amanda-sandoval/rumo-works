import { prisma } from '../db';
import { createDownloadToken } from '../mapa/export/downloadToken';
import {
  generateMapaPreviewPdf,
  generateMapaCompletePdf,
} from '../mapa/export/mapaPdfGenerator';

export interface AssessmentEmailDeliveryResult {
  success: boolean;
  status: 'SENT' | 'FAILED' | 'PENDING_CONFIG';
  messageId?: string;
  error?: string;
  downloadToken?: string;
  downloadUrl?: string;
  alreadySent?: boolean;
}

export interface DeliverAssessmentEmailParams {
  sessionId: string;
  reportType: 'PREVIEW' | 'COMPLETE';
  recipientName: string;
  recipientEmail: string;
  forceRetry?: boolean;
  appUrl?: string;
  resultData?: any; // Opcional se já estiver em memória durante o cálculo
}

function buildEmailHtml(
  name: string,
  reportType: 'PREVIEW' | 'COMPLETE',
  downloadUrl: string
): string {
  const isComplete = reportType === 'COMPLETE';
  const title = isComplete
    ? 'Seu Relatório Estratégico Completo do Mapa Rumo'
    : 'Seu Diagnóstico Essencial do Mapa Rumo (Prévia)';

  const subtitle = isComplete
    ? 'Diagnóstico aprofundado em 8 dimensões de carreira com plano de ação de 30 dias'
    : 'Síntese das 3 dimensões fundamentais de sustentabilidade e energia';

  const highlights = isComplete
    ? `
      <ul style="padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.6;">
        <li><strong>8 Dimensões Avaliadas:</strong> Análise comparativa de alinhamento, atrito e potência.</li>
        <li><strong>Matriz de Atritos:</strong> Mapeamento do equilíbrio entre energia investida e retorno.</li>
        <li><strong>3 Prioridades Estratégicas:</strong> Ações de alto impacto calibradas para o seu momento.</li>
        <li><strong>Plano de 30 Dias:</strong> Roteiro estruturado semana a semana (semanas 1 a 4).</li>
      </ul>
    `
    : `
      <ul style="padding-left: 20px; color: #374151; font-size: 14px; line-height: 1.6;">
        <li><strong>3 Dimensões Fundamentais:</strong> Motivação & Energia, Valores & Limites e Ambiente & Estrutura.</li>
        <li><strong>Observação de Destaque:</strong> Primeira leitura interpretativa da sua rotina atual.</li>
        <li><strong>Pergunta de Reflexão:</strong> Provocação reflexiva para tomada de decisão consciente.</li>
      </ul>
    `;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1816;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAF8F5; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E5E2D9; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <!-- Top Accent Bar -->
          <tr>
            <td style="background-color: #2E473B; height: 6px;"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 16px 32px; border-bottom: 1px solid #F3F1EC;">
              <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: #2E473B; text-transform: uppercase;">Rumo Works • Mapa Rumo</span>
              <h1 style="margin: 8px 0 4px 0; font-size: 22px; font-weight: 700; color: #1A1816; line-height: 1.25;">${title}</h1>
              <p style="margin: 0; font-size: 13px; color: #4B5563;">${subtitle}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 24px 32px 32px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #1A1816;">
                Olá, <strong>${name}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151;">
                Obrigado por dedicar tempo à sua autorreflexão profissional. O seu documento estruturado em PDF está disponível para download e também se encontra anexado diretamente a esta mensagem.
              </p>

              <div style="background-color: #F0F7F3; border-left: 3px solid #2E473B; border-radius: 4px; padding: 16px 20px; margin: 0 0 24px 0;">
                <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #2E473B;">
                  ${isComplete ? 'Conteúdo do Relatório Estratégico' : 'Conteúdo do Diagnóstico Essencial'}
                </h3>
                ${highlights}
              </div>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${downloadUrl}" target="_blank" style="display: inline-block; background-color: #2E473B; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 6px; box-shadow: 0 2px 4px rgba(46,71,59,0.2);">
                      Baixar Relatório em PDF (Acesso Seguro)
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <span style="font-size: 11px; color: #6B7280;">Link seguro temporário com validade de 24 horas. O arquivo também está em anexo.</span>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.6; color: #4B5563;">
                Caso deseje discutir seus resultados com uma mentoria sênior individual, acesse nosso hub a qualquer momento em <a href="https://www.rumoworkshub.com.br" style="color: #2E473B; text-decoration: underline;">www.rumoworkshub.com.br</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #FAF8F5; border-top: 1px solid #E5E2D9; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #9CA3AF; line-height: 1.5;">
                © 2026 Rumo Works Hub. Todos os direitos reservados.<br>
                Este instrumento é voltado exclusivamente ao desenvolvimento e autorreflexão profissional.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Serviço desacoplado de entrega de e-mails do Mapa Rumo com:
 * - Suporte nativo ao Resend (sem biblioteca externa) via fetch REST
 * - Modo seguro de desenvolvimento (PENDING_CONFIG) quando sem chave configurada
 * - Idempotência no banco de dados (AssessmentEmailDelivery)
 * - Geração e anexo de PDF direto + token de download temporário assinado (24h)
 * - Execução serverless-safe (aguarda persistência antes de concluir)
 */
export async function deliverAssessmentEmail(
  params: DeliverAssessmentEmailParams
): Promise<AssessmentEmailDeliveryResult> {
  const { sessionId, reportType, recipientName, recipientEmail, forceRetry } = params;

  // 1. Verificar idempotência
  const existingDelivery = await prisma.assessmentEmailDelivery.findUnique({
    where: {
      sessionId_reportType: {
        sessionId,
        reportType,
      },
    },
  });

  if (existingDelivery && existingDelivery.status === 'SENT' && !forceRetry) {
    return {
      success: true,
      status: 'SENT',
      alreadySent: true,
    };
  }

  // 2. Criar token temporário seguro de download (24 horas)
  const tokenType = reportType === 'COMPLETE' ? 'complete' : 'preview';
  const downloadToken = createDownloadToken(sessionId, tokenType, 24);

  const baseUrl =
    params.appUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    'https://www.rumoworkshub.com.br';

  const downloadUrl = `${baseUrl.replace(/\/$/, '')}/api/mapa/pdf?token=${downloadToken}`;

  // 3. Obter ou reconstruir dados para o PDF
  let resultData = params.resultData;
  let sessionCreatedAt = new Date();

  if (!resultData) {
    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: { result: true },
    });

    if (!session || !session.result) {
      const err = 'Resultado do diagnóstico não encontrado para envio de e-mail.';
      await recordDeliveryFailure(sessionId, reportType, recipientEmail, err);
      return { success: false, status: 'FAILED', error: err };
    }

    sessionCreatedAt = session.createdAt;
    try {
      resultData = {
        scores: JSON.parse(session.result.scoresJson || '{}'),
        radarData: JSON.parse(session.result.radarJson || '[]'),
        gaps: JSON.parse(session.result.gapsJson || '[]'),
        pills: JSON.parse(session.result.pillsJson || '[]'),
        observations: JSON.parse(session.result.observationsJson || '[]'),
        priorities: JSON.parse(session.result.prioritiesJson || '[]'),
        actionPlan: JSON.parse(session.result.actionPlanJson || '[]'),
      };
    } catch (parseErr: any) {
      const err = `Falha ao interpretar dados persistidos: ${parseErr.message}`;
      await recordDeliveryFailure(sessionId, reportType, recipientEmail, err);
      return { success: false, status: 'FAILED', error: err };
    }
  }

  // 4. Gerar buffer do PDF correspondente
  let pdfBuffer: Buffer;
  try {
    const participantInfo = {
      name: recipientName,
      email: recipientEmail,
      createdAt: sessionCreatedAt,
    };

    if (reportType === 'PREVIEW') {
      const FREE_PLAN_DIMENSIONS = ['motivacaoEnergia', 'valoresLimites', 'ambienteEstrutura'];
      const previewRadar = (resultData.radarData || []).map((item: any) => ({
        ...item,
        isLocked: !FREE_PLAN_DIMENSIONS.includes(item.dimensionKey),
      }));
      const previewObservations = (resultData.observations || [])
        .filter((obs: any) => FREE_PLAN_DIMENSIONS.includes(obs.dimension))
        .slice(0, 3);

      const previewData = {
        scores: resultData.scores,
        radarData: previewRadar,
        initialObservations: previewObservations,
        deepReflectionQuestion:
          previewObservations[0]?.reflectionQuestion ||
          'O que torna suas escolhas profissionais verdadeiramente sustentáveis hoje?',
        initialActionSuggestion:
          resultData.priorities?.[0]?.concreteAction ||
          'Reservar 30 minutos na próxima semana para mapear seus focos essenciais.',
      };

      pdfBuffer = generateMapaPreviewPdf(participantInfo, previewData);
    } else {
      pdfBuffer = generateMapaCompletePdf(participantInfo, resultData);
    }
  } catch (pdfErr: any) {
    const err = `Falha na geração do PDF: ${pdfErr.message}`;
    await recordDeliveryFailure(sessionId, reportType, recipientEmail, err);
    return { success: false, status: 'FAILED', error: err };
  }

  // 5. Preparar assunto, HTML e anexo
  const isComplete = reportType === 'COMPLETE';
  const subject = isComplete
    ? `Seu Relatório Completo do Mapa Rumo está pronto | ${recipientName}`
    : `Seu Diagnóstico Essencial do Mapa Rumo está pronto | ${recipientName}`;

  const htmlContent = buildEmailHtml(recipientName, reportType, downloadUrl);

  const safeName = recipientName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30);
  const pdfFilename = `Mapa-Rumo-${isComplete ? 'Relatorio-Completo' : 'Previa'}-${safeName}.pdf`;

  // 6. Verificar disponibilidade do provedor (Resend)
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn(
      `[EmailDeliveryService] RESEND_API_KEY não configurada. Registrando status PENDING_CONFIG para ${recipientEmail}.`
    );

    await prisma.assessmentEmailDelivery.upsert({
      where: {
        sessionId_reportType: {
          sessionId,
          reportType,
        },
      },
      update: {
        status: 'PENDING_CONFIG',
        recipientEmail,
        attemptCount: { increment: 1 },
        lastError: 'Serviço de e-mail não configurado (RESEND_API_KEY ausente em ambiente de desenvolvimento).',
      },
      create: {
        sessionId,
        reportType,
        recipientEmail,
        status: 'PENDING_CONFIG',
        attemptCount: 1,
        lastError: 'Serviço de e-mail não configurado (RESEND_API_KEY ausente em ambiente de desenvolvimento).',
      },
    });

    return {
      success: true,
      status: 'PENDING_CONFIG',
      downloadToken,
      downloadUrl,
    };
  }

  // 7. Envio transacional real via API REST do Resend
  try {
    const sender = process.env.EMAIL_FROM || 'Rumo Works <contato@rumoworkshub.com.br>';

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sender,
        to: [recipientEmail],
        subject,
        html: htmlContent,
        attachments: [
          {
            filename: pdfFilename,
            content: pdfBuffer.toString('base64'),
          },
        ],
      }),
    });

    const resendData = await resendResponse.json().catch(() => ({}));

    if (!resendResponse.ok) {
      const errMsg = `Erro Resend (${resendResponse.status}): ${resendData.message || resendResponse.statusText}`;
      await recordDeliveryFailure(sessionId, reportType, recipientEmail, errMsg);
      return {
        success: false,
        status: 'FAILED',
        error: errMsg,
        downloadToken,
        downloadUrl,
      };
    }

    // Sucesso no envio
    await prisma.assessmentEmailDelivery.upsert({
      where: {
        sessionId_reportType: {
          sessionId,
          reportType,
        },
      },
      update: {
        status: 'SENT',
        recipientEmail,
        attemptCount: { increment: 1 },
        sentAt: new Date(),
        lastError: null,
      },
      create: {
        sessionId,
        reportType,
        recipientEmail,
        status: 'SENT',
        attemptCount: 1,
        sentAt: new Date(),
      },
    });

    return {
      success: true,
      status: 'SENT',
      messageId: resendData.id,
      downloadToken,
      downloadUrl,
    };
  } catch (netErr: any) {
    const errMsg = `Falha na requisição de e-mail: ${netErr.message}`;
    await recordDeliveryFailure(sessionId, reportType, recipientEmail, errMsg);
    return {
      success: false,
      status: 'FAILED',
      error: errMsg,
      downloadToken,
      downloadUrl,
    };
  }
}

async function recordDeliveryFailure(
  sessionId: string,
  reportType: 'PREVIEW' | 'COMPLETE',
  recipientEmail: string,
  errorMsg: string
) {
  try {
    await prisma.assessmentEmailDelivery.upsert({
      where: {
        sessionId_reportType: {
          sessionId,
          reportType,
        },
      },
      update: {
        status: 'FAILED',
        recipientEmail,
        attemptCount: { increment: 1 },
        lastError: errorMsg,
      },
      create: {
        sessionId,
        reportType,
        recipientEmail,
        status: 'FAILED',
        attemptCount: 1,
        lastError: errorMsg,
      },
    });
  } catch (err) {
    console.warn('[EmailDeliveryService] Falha ao persistir status de erro no DB:', err);
  }
}
