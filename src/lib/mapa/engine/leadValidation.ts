export interface LeadValidationResult {
  isValid: boolean;
  error?: string;
  errors?: string[];
  field?: 'name' | 'email';
  sanitizedName?: string;
  normalizedName?: string;
  sanitizedEmail?: string;
  normalizedEmail?: string;
}

// Regex inclusivo para nomes com acentuação latina, hífens e apóstrofos
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'\-]+$/;

// Regex padrão RFC 5322 simplificado para validação segura de e-mail
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validador de identificação de leads do Mapa Rumo (Frontend e Backend).
 * Garante que:
 * 1. Nome completo seja informado, sem espaços supérfluos, com limites adequados (3 a 120 caracteres).
 * 2. Nomes legítimos com acentos (ex: "João da Silva", "Maria D'Ávila", "Ana-Paula") sejam aceitos.
 * 3. E-mail tenha formato válido e seja normalizado em minúsculas para persistência.
 */
export function validateLead(rawName?: any, rawEmail?: any): LeadValidationResult {
  // 1. Validação do Nome Completo
  if (!rawName || typeof rawName !== 'string') {
    const msg = 'Por favor, informe seu nome completo.';
    return {
      isValid: false,
      field: 'name',
      error: msg,
      errors: [msg],
    };
  }

  const sanitizedName = rawName.trim().replace(/\s+/g, ' ');

  if (sanitizedName.length < 3) {
    const msg = 'O nome completo deve conter ao menos 3 caracteres.';
    return {
      isValid: false,
      field: 'name',
      error: msg,
      errors: [msg],
    };
  }

  if (sanitizedName.length > 120) {
    const msg = 'O nome completo não deve ultrapassar 120 caracteres.';
    return {
      isValid: false,
      field: 'name',
      error: msg,
      errors: [msg],
    };
  }

  if (!NAME_REGEX.test(sanitizedName)) {
    const msg = 'O nome contém caracteres inválidos. Utilize apenas letras, acentos, hífens ou apóstrofos.';
    return {
      isValid: false,
      field: 'name',
      error: msg,
      errors: [msg],
    };
  }

  // 2. Validação do E-mail
  if (!rawEmail || typeof rawEmail !== 'string') {
    const msg = 'Por favor, informe um endereço de e-mail válido.';
    return {
      isValid: false,
      field: 'email',
      error: msg,
      errors: [msg],
    };
  }

  const trimmedEmail = rawEmail.trim();

  if (trimmedEmail.length < 5 || trimmedEmail.length > 150) {
    const msg = 'O e-mail deve ter tamanho válido (máximo de 150 caracteres).';
    return {
      isValid: false,
      field: 'email',
      error: msg,
      errors: [msg],
    };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    const msg = 'Formato de e-mail inválido. Por favor, verifique o endereço digitado (ex: seu.nome@exemplo.com).';
    return {
      isValid: false,
      field: 'email',
      error: msg,
      errors: [msg],
    };
  }

  const sanitizedEmail = trimmedEmail.toLowerCase();

  return {
    isValid: true,
    sanitizedName,
    normalizedName: sanitizedName,
    sanitizedEmail,
    normalizedEmail: sanitizedEmail,
  };
}
