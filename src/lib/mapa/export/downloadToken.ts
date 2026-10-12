import crypto from 'crypto';
import zlib from 'zlib';

/**
 * Obtém a chave mestra para tokens de download.
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

/**
 * Deriva uma chave de 256 bits (32 bytes) para cifragem autenticada (AEAD AES-256-GCM).
 */
function getEncryptionKey(): Buffer {
  const secret = getSigningSecret();
  return crypto.createHash('sha256').update(secret).digest();
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
 * Gera um token de download temporário criptografado e autenticado (AES-256-GCM + zlib).
 * Válido por 24 horas por padrão.
 * Garante confidencialidade total (dados pessoais e respostas não são legíveis em URL ou browser)
 * e autenticidade criptográfica estrita (qualquer alteração no ciphertext ou IV invalida o token).
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

  const key = getEncryptionKey();
  const jsonBuf = Buffer.from(JSON.stringify(payload), 'utf8');
  const compressed = zlib.deflateRawSync(jsonBuf);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(compressed), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `enc.${iv.toString('base64url')}.${tag.toString('base64url')}.${ciphertext.toString('base64url')}`;
}

/**
 * Valida a autenticidade, decifra o conteúdo e checa a expiração de um token de download.
 * Suporta tokens cifrados (AES-256-GCM) e mantém retrocompatibilidade com tokens legados HMAC.
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

  // Exige estritamente o formato Criptografado Autenticado (AEAD AES-256-GCM): enc.iv.tag.ciphertext
  if (parts.length !== 4 || parts[0] !== 'enc') {
    return {
      valid: false,
      error: 'Assinatura criptográfica ou estrutura do token inválida.',
    };
  }

  const [, ivB64, tagB64, ciphertextB64] = parts;
  let key: Buffer;
  try {
    key = getEncryptionKey();
  } catch {
    return { valid: false, error: 'Serviço de download temporariamente indisponível (chave não configurada).' };
  }

  try {
    const iv = Buffer.from(ivB64, 'base64url');
    const tag = Buffer.from(tagB64, 'base64url');
    const ciphertext = Buffer.from(ciphertextB64, 'base64url');

    if (iv.length !== 12 || tag.length !== 16) {
      return { valid: false, error: 'Parâmetros de cifragem ou assinatura criptográfica inválidos no token.' };
    }

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const decryptedCompressed = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    const decompressed = zlib.inflateRawSync(decryptedCompressed);
    const payload: DownloadTokenPayload = JSON.parse(decompressed.toString('utf8'));

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
    return { valid: false, error: 'Assinatura criptográfica ou autenticidade do token inválida.' };
  }
}
