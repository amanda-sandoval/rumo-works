import crypto from 'crypto';

/**
 * Obtém a chave de assinatura HMAC para tokens de download.
 * Em produção, exige estritamente DOWNLOAD_TOKEN_SECRET configurado com alta entropia (min 32 caracteres).
 * Não permite fallbacks genéricos inseguros em produção.
 */
function getSigningSecret(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const exclusiveSecret = process.env.DOWNLOAD_TOKEN_SECRET;

  if (isProduction) {
    if (!exclusiveSecret || exclusiveSecret.trim().length < 32) {
      throw new Error(
        'CONFIG_ERROR: DOWNLOAD_TOKEN_SECRET exclusivo e forte (mínimo de 32 caracteres) é estritamente obrigatório em ambiente de produção.'
      );
    }
    return exclusiveSecret.trim();
  }

  // Em desenvolvimento ou testes automatizados, utiliza chave dedicada para ambiente dev/test
  return exclusiveSecret?.trim() || 'dev_rumo_works_exclusive_download_hmac_secret_2026_dev_only';
}

export interface DownloadTokenPayload {
  sessionId: string;
  type: 'preview' | 'complete';
  exp: number; // Timestamp em milissegundos
  nonce: string;
  participantName?: string;
  participantEmail?: string;
  answers?: Record<string, any>;
}

/**
 * Gera um token de download temporário assinado criptograficamente (HMAC-SHA256).
 * Válido por 24 horas por padrão.
 * Evita a exposição de accessTokens permanentes em links enviados por e-mail ou no histórico do navegador.
 * Suporta contexto assinado para garantir resiliência durável entre instâncias serverless.
 */
export function createDownloadToken(
  sessionId: string,
  type: 'preview' | 'complete',
  expiresInHours = 24,
  context?: {
    participantName?: string;
    participantEmail?: string;
    answers?: Record<string, any>;
  }
): string {
  const payload: DownloadTokenPayload = {
    sessionId,
    type,
    exp: Date.now() + expiresInHours * 60 * 60 * 1000,
    nonce: crypto.randomBytes(8).toString('hex'),
    ...(context?.participantName ? { participantName: context.participantName } : {}),
    ...(context?.participantEmail ? { participantEmail: context.participantEmail } : {}),
    ...(context?.answers ? { answers: context.answers } : {}),
  };

  const secret = getSigningSecret();
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');

  return `${payloadB64}.${hmac}`;
}

/**
 * Valida a integridade, autenticidade e expiração de um token de download.
 */
export function verifyDownloadToken(tokenString: string): {
  valid: boolean;
  sessionId?: string;
  type?: 'preview' | 'complete';
  participantName?: string;
  participantEmail?: string;
  answers?: Record<string, any>;
  error?: string;
} {
  if (!tokenString || typeof tokenString !== 'string') {
    return { valid: false, error: 'Token de download não informado.' };
  }

  const parts = tokenString.split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'Estrutura de token inválida.' };
  }

  const [payloadB64, providedHmac] = parts;

  let secret: string;
  try {
    secret = getSigningSecret();
  } catch {
    return { valid: false, error: 'Serviço de download temporariamente indisponível (chave não configurada).' };
  }

  // Verificação de assinatura HMAC
  const expectedHmac = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
  const providedBuffer = Buffer.from(providedHmac);
  const expectedBuffer = Buffer.from(expectedHmac);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return { valid: false, error: 'Assinatura criptográfica do token inválida.' };
  }

  try {
    const payload: DownloadTokenPayload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    );

    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Token de download expirado (validade de 24 horas excedida).' };
    }

    if (payload.type !== 'preview' && payload.type !== 'complete') {
      return { valid: false, error: 'Escopo de relatório inválido no token.' };
    }

    return {
      valid: true,
      sessionId: payload.sessionId,
      type: payload.type,
      participantName: payload.participantName,
      participantEmail: payload.participantEmail,
      answers: payload.answers,
    };
  } catch {
    return { valid: false, error: 'Falha ao decodificar payload do token.' };
  }
}
