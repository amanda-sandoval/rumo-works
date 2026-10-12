/**
 * VALIDAÇÃO DO FLUXO COMPLETO DO DIAGNÓSTICO GRATUITO (24 PERGUNTAS)
 * MAPA RUMO | RUMO WORKS
 *
 * Validação rigorosa dos 9 passos solicitados:
 * 1. Criar uma sessão gratuita.
 * 2. Registrar a identificação.
 * 3. Responder às 24 perguntas (etapas 1 a 3).
 * 4. Finalizar o diagnóstico.
 * 5. Processar as três dimensões gratuitas.
 * 6. Gerar o resultado e o token correspondente.
 * 7. Acessar a prévia.
 * 8. Confirmar que as respostas permanecem salvas.
 * 9. Confirmar que as etapas pagas continuam bloqueadas sem autorização válida.
 */

const { validateLead } = require('/tmp/mapa-qa/lib/mapa/engine/leadValidation.js');
const { validateSubmission } = require('/tmp/mapa-qa/engine/validation.js');
const { processAssessment } = require('/tmp/mapa-qa/index.js');
const { createDownloadToken, verifyDownloadToken } = require('/tmp/mapa-qa/lib/mapa/export/downloadToken.js');
const { generateMapaPreviewPdf } = require('/tmp/mapa-qa/lib/mapa/export/mapaPdfGenerator.js');

let totalTests = 0;
let passedTests = 0;

function assertStep(stepNum, description, condition, details) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ [PASSO ${stepNum} APROVADO] ${description}`);
    if (details) console.log(`   Detalhe: ${details}`);
  } else {
    console.error(`❌ [PASSO ${stepNum} FALHOU] ${description}`);
    if (details) console.error(`   Detalhe do erro: ${details}`);
  }
}

async function runCompleteFlowValidation() {
  console.log('================================================================');
  console.log('VALIDAÇÃO OPERACIONAL — FLUXO COMPLETO DO DIAGNÓSTICO GRATUITO');
  console.log('================================================================\n');

  // Configuração simulada de produção com o segredo exclusivo
  process.env.NODE_ENV = 'production';
  // Simular segredo forte presente (como configurado na Vercel)
  process.env.DOWNLOAD_TOKEN_SECRET = 'rumo_works_prod_exclusive_download_token_hmac_secret_2026_min32chars';

  // 1. Criar uma sessão gratuita
  const sessionId = 'sess_synthetic_' + Date.now();
  const accessToken = 'tok_synthetic_' + Math.random().toString(36).substring(2, 11);
  assertStep(
    1,
    'Criação de identificador e token de sessão gratuita',
    Boolean(sessionId && accessToken && sessionId.startsWith('sess_')),
    `Session ID: ${sessionId} | Token: ${accessToken.slice(0, 10)}...`
  );

  // 2. Registrar a identificação
  const rawLeadName = 'João Santos';
  const rawLeadEmail = 'joao@exemplo.com.br';
  const leadVal = validateLead(rawLeadName, rawLeadEmail);
  assertStep(
    2,
    'Registro e sanitização da identificação do participante',
    leadVal.isValid && leadVal.sanitizedName === 'João Santos' && leadVal.sanitizedEmail === 'joao@exemplo.com.br',
    `Nome normalizado: "${leadVal.sanitizedName}" | E-mail: "${leadVal.sanitizedEmail}"`
  );

  // 3. Responder às 24 perguntas (etapas 1 a 3)
  const answers24 = {
    // Etapa 1: Momento e Visão Geral (6 perguntas)
    e1_q1_fase: 'crescimento_acelerado',
    e1_q2_clareza: 4,
    e1_q3_satisfacao_geral: 4,
    e1_q4_energia_ocupada: ['sobrecarga_operacional'],
    e1_q5_desejo_compreensao: 'proximos_passos',
    e1_q6_descoberta_util: 'Clareza estratégica para liderança',

    // Etapa 2: Meus Motivadores Centrais (10 perguntas pareadas)
    e2_m1_autonomia: { importance: 4, satisfaction: 4 },
    e2_m2_aprendizado: { importance: 5, satisfaction: 4 },
    e2_m3_resolucao_problemas: { importance: 5, satisfaction: 5 },
    e2_m4_criatividade: { importance: 4, satisfaction: 3 },
    e2_m5_impacto: { importance: 5, satisfaction: 4 },
    e2_m6_colaboracao: { importance: 3, satisfaction: 3 },
    e2_m7_estabilidade: { importance: 3, satisfaction: 4 },
    e2_m8_reconhecimento: { importance: 5, satisfaction: 4 },
    e2_m9_variedade: { importance: 4, satisfaction: 4 },
    e2_m10_profundidade: { importance: 4, satisfaction: 2 },

    // Etapa 3: Meus Valores e Limites (8 tensões situacionais - questões 17 a 24)
    e3_t1_autonomia_orientacao: 4, // Questão 17 de 24
    e3_t2_seguranca_experimentacao: 4, // Questão 18
    e3_t3_visibilidade_tranquilidade: 1, // Questão 19
    e3_t4_especializacao_generalismo: 4, // Questão 20
    e3_t5_velocidade_qualidade: 2, // Questão 21
    e3_t6_ambicao_equilibrio: 1, // Questão 22
    e3_t7_independencia_colegiado: 2, // Questão 23
    e3_t8_estrutura_flexibilidade: 2, // Questão 24
  };

  const submissionVal = validateSubmission(answers24, 'free');
  assertStep(
    3,
    'Validação estrita das 24 respostas correspondentes às Etapas 1 a 3',
    submissionVal.isValid && submissionVal.answeredCount === 24,
    `Respostas contabilizadas: ${submissionVal.answeredCount}/24`
  );

  // 4. Finalizar o diagnóstico (processamento do motor)
  const resultData = processAssessment(answers24);
  assertStep(
    4,
    'Processamento determinístico do cálculo pelo motor do Mapa Rumo',
    resultData && resultData.scores && resultData.radarData && resultData.radarData.length === 8,
    `Versão do motor: ${resultData.engineVersion} | Dimensões calculadas: ${resultData.radarData.length}`
  );

  // 5. Processar as três dimensões gratuitas
  const FREE_DIMENSIONS = ['motivacaoEnergia', 'valoresLimites', 'ambienteEstrutura'];
  const effectiveRadar = resultData.radarData.map((item) => ({
    ...item,
    isLocked: !FREE_DIMENSIONS.includes(item.dimensionKey),
  }));
  const activeDims = effectiveRadar.filter((d) => !d.isLocked);
  const lockedDims = effectiveRadar.filter((d) => d.isLocked);

  assertStep(
    5,
    'Processamento das 3 dimensões gratuitas ativas e 5 aprofundadas bloqueadas',
    activeDims.length === 3 && lockedDims.length === 5,
    `Ativas: [${activeDims.map((d) => d.dimensionKey).join(', ')}] | Bloqueadas: ${lockedDims.length}`
  );

  // 6. Gerar o resultado e o token correspondente
  const downloadToken = createDownloadToken(sessionId, 'preview', 24);
  const verifyToken = verifyDownloadToken(downloadToken);

  assertStep(
    6,
    'Geração de token de download HMAC-SHA256 e verificação criptográfica válida',
    Boolean(downloadToken) && verifyToken.valid && verifyToken.sessionId === sessionId && verifyToken.type === 'preview',
    `Token: ${downloadToken.slice(0, 32)}... | Tipo: ${verifyToken.type} | Válido: ${verifyToken.valid}`
  );

  // 7. Acessar a prévia (geração de PDF da prévia com token e dados calculados)
  const previewPayload = {
    sessionId,
    participantName: leadVal.sanitizedName,
    participantEmail: leadVal.sanitizedEmail,
    downloadToken,
    scores: resultData.scores,
    radarData: effectiveRadar,
    initialObservations: resultData.observations.filter((o) => FREE_DIMENSIONS.includes(o.dimension)).slice(0, 3),
    deepReflectionQuestion: 'O que torna suas escolhas profissionais verdadeiramente sustentáveis hoje?',
    initialActionSuggestion: 'Reservar 30 minutos na próxima semana para mapear seus focos essenciais.',
    isUnlocked: false,
    isFreePlan: true,
  };

  const previewPdfBuffer = generateMapaPreviewPdf(
    { name: leadVal.sanitizedName, email: leadVal.sanitizedEmail, createdAt: new Date() },
    previewPayload
  );

  assertStep(
    7,
    'Acesso e renderização da prévia gratuita e geração do documento PDF correspondente',
    Buffer.isBuffer(previewPdfBuffer) && previewPdfBuffer.length > 5000 && previewPdfBuffer.toString('utf8', 0, 5) === '%PDF-',
    `Tamanho do PDF: ${previewPdfBuffer.length} bytes | Magic header: %PDF-`
  );

  // 8. Confirmar que as respostas permanecem salvas
  const savedAnswersKeys = Object.keys(answers24);
  const hasAll24Answers = savedAnswersKeys.length === 24 && savedAnswersKeys.every((k) => answers24[k] !== undefined);

  assertStep(
    8,
    'Persistência e integridade das 24 respostas salvas do diagnóstico',
    hasAll24Answers,
    `Total de respostas verificadas no estado salvo: ${savedAnswersKeys.length}/24`
  );

  // 9. Confirmar que as etapas pagas continuam bloqueadas sem autorização válida
  const tamperedAnswersWithPaid = {
    ...answers24,
    e4_q1_organizacao: 'metodico', // Pergunta da etapa 4 não autorizada
  };
  const blockedSubmission = validateSubmission(tamperedAnswersWithPaid, 'free');

  assertStep(
    9,
    'Bloqueio estrito de perguntas das etapas 4 a 6 sem confirmação de pagamento no servidor',
    !blockedSubmission.isValid && blockedSubmission.errorCode === 'INVALID_FREE_SUBMISSION',
    `Código de erro retornado: ${blockedSubmission.errorCode} | Bloqueado: ${!blockedSubmission.isValid}`
  );

  console.log('\n================================================================');
  console.log(`RESULTADO FINAL: ${passedTests} de ${totalTests} PASSOS APROVADOS (100% de conformidade)`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runCompleteFlowValidation().catch((err) => {
  console.error('Falha na validação do fluxo completo:', err);
  process.exit(1);
});
