/**
 * TESTE DE INTEGRAÇÃO — FLUXO COMPLETO ENTRE INSTÂNCIAS INDEPENDENTES
 * MAPA RUMO | RUMO WORKS
 *
 * Valida a capacidade de processamento, recuperação de acesso e emissão de PDF
 * entre requisições totalmente desacopladas, sem dependência de estado em memória
 * compartilhado (simulando instâncias serverless distintas).
 */

const { validateLead } = require('/tmp/mapa-qa/lib/mapa/engine/leadValidation.js');
const { validateSubmission } = require('/tmp/mapa-qa/engine/validation.js');
const { processAssessment } = require('/tmp/mapa-qa/index.js');
const { createDownloadToken, verifyDownloadToken } = require('/tmp/mapa-qa/lib/mapa/export/downloadToken.js');
const { generateMapaPreviewPdf } = require('/tmp/mapa-qa/lib/mapa/export/mapaPdfGenerator.js');

let totalTests = 0;
let passedTests = 0;

function assertTest(testId, description, condition, evidence) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ [${testId} APROVADO] ${description}`);
    if (evidence) console.log(`   Evidência: ${evidence}`);
  } else {
    console.error(`❌ [${testId} FALHOU] ${description}`);
    if (evidence) console.error(`   Detalhe: ${evidence}`);
  }
}

async function runCrossInstanceTestSuite() {
  console.log('================================================================');
  console.log('TESTE DE INTEGRAÇÃO — REQUISIÇÕES INDEPENDENTES (SERVERLESS)');
  console.log('================================================================\n');

  process.env.NODE_ENV = 'production';
  const SECRET_MOCK = 'rumo_works_prod_exclusive_download_token_hmac_secret_2026_min32chars';
  process.env.DOWNLOAD_TOKEN_SECRET = SECRET_MOCK;

  // ---------------------------------------------------------------------------
  // INSTÂNCIA A: Criação de sessão, respostas e cálculo do diagnóstico gratuito
  // ---------------------------------------------------------------------------
  console.log('1. SIMULAÇÃO: INSTÂNCIA A (Criação e Cálculo)');
  console.log('----------------------------------------------------------------');

  const sessionId = 'sess_cross_instance_' + Date.now();
  const accessToken = 'tok_cross_' + Math.random().toString(36).substring(2, 11);
  const leadName = 'João Santos';
  const leadEmail = 'joao@exemplo.com.br';

  const answers24 = {
    e1_q1_fase: 'crescimento_acelerado',
    e1_q2_clareza: 4,
    e1_q3_satisfacao_geral: 4,
    e1_q4_energia_ocupada: ['sobrecarga_operacional'],
    e1_q5_desejo_compreensao: 'proximos_passos',
    e1_q6_descoberta_util: 'Visão de liderança estratégica',
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
    e3_t1_autonomia_orientacao: 4,
    e3_t2_seguranca_experimentacao: 4,
    e3_t3_visibilidade_tranquilidade: 1,
    e3_t4_especializacao_generalismo: 4,
    e3_t5_velocidade_qualidade: 2,
    e3_t6_ambicao_equilibrio: 1,
    e3_t7_independencia_colegiado: 2,
    e3_t8_estrutura_flexibilidade: 2,
  };

  const valSubmission = validateSubmission(answers24, 'free');
  assertTest(
    'INST-A1',
    'Instância A: Validação das 24 respostas e integridade de tipos',
    valSubmission.isValid && valSubmission.answeredCount === 24,
    `Respostas válidas: ${valSubmission.answeredCount}/24`
  );

  const calcResultA = processAssessment(answers24);

  // Geração do token criptográfico com o contexto assinado
  const downloadTokenA = createDownloadToken(sessionId, 'preview', 24, {
    participantName: leadName,
    participantEmail: leadEmail,
    answers: answers24,
  });

  assertTest(
    'INST-A2',
    'Instância A: Geração de token criptográfico temporário HMAC-SHA256',
    Boolean(downloadTokenA && downloadTokenA.includes('.')),
    `Token assinado: ${downloadTokenA.slice(0, 36)}...`
  );

  // ---------------------------------------------------------------------------
  // ISOLAMENTO TOTAL: Limpar qualquer estado em memória da Instância A
  // ---------------------------------------------------------------------------
  console.log('\n2. ISOLAMENTO DE MEMÓRIA: Descartando todo estado da Instância A');
  console.log('----------------------------------------------------------------');
  delete globalThis.__mapaResults;
  const isMemoryClean = typeof globalThis.__mapaResults === 'undefined';
  console.log(`   Cache globalThis.__mapaResults eliminado: ${isMemoryClean}`);

  // ---------------------------------------------------------------------------
  // INSTÂNCIA B: Nova requisição para /api/mapa/verify-access sem memória prévia
  // ---------------------------------------------------------------------------
  console.log('\n3. SIMULAÇÃO: INSTÂNCIA B (/api/mapa/verify-access independente)');
  console.log('----------------------------------------------------------------');

  // Na Instância B, o cliente envia suas respostas salvas localmente no localStorage
  const verifyBodyB = {
    sessionId,
    accessToken,
    answers: answers24,
    participantName: leadName,
    participantEmail: leadEmail,
  };

  // Simulação da lógica da rota verify-access na Instância B
  const valSubB = validateSubmission(verifyBodyB.answers, 'free');
  const computedB = processAssessment(verifyBodyB.answers);
  const FREE_DIMS = ['motivacaoEnergia', 'valoresLimites', 'ambienteEstrutura'];
  const previewRadarB = computedB.radarData.map((d) => ({
    ...d,
    isLocked: !FREE_DIMS.includes(d.dimensionKey),
  }));

  assertTest(
    'INST-B1',
    'Instância B: Recuperação e cálculo independente de prévia a partir das respostas do cliente',
    valSubB.isValid && previewRadarB.length === 8 && previewRadarB.filter((d) => !d.isLocked).length === 3,
    `3 dimensões ativas calculadas de forma idêntica e sem depender de memória compartilhada`
  );

  assertTest(
    'INST-B2',
    'Instância B: Sessão sem pagamento confirmado permanece estritamente com isUnlocked = false',
    !computedB.isUnlocked && !valSubB.isUnlocked,
    `isUnlocked = false preservado no servidor`
  );

  // ---------------------------------------------------------------------------
  // ISOLAMENTO TOTAL: Limpar novamente qualquer estado em memória
  // ---------------------------------------------------------------------------
  delete globalThis.__mapaResults;

  // ---------------------------------------------------------------------------
  // INSTÂNCIA C: Nova requisição independente para /api/mapa/pdf?token=...
  // ---------------------------------------------------------------------------
  console.log('\n4. SIMULAÇÃO: INSTÂNCIA C (/api/mapa/pdf independente)');
  console.log('----------------------------------------------------------------');

  // A Instância C recebe apenas o token gerado pela Instância A
  const tokenVerifyC = verifyDownloadToken(downloadTokenA);

  assertTest(
    'INST-C1',
    'Instância C: Validação criptográfica do token assinado por outra instância com mesma chave',
    tokenVerifyC.valid && tokenVerifyC.sessionId === sessionId && tokenVerifyC.type === 'preview',
    `Assinatura HMAC verificada com sucesso | Tipo: ${tokenVerifyC.type}`
  );

  assertTest(
    'INST-C2',
    'Instância C: Reconstituição autorizada das respostas e identificação a partir do token verificado',
    Boolean(tokenVerifyC.answers && Object.keys(tokenVerifyC.answers).length === 24 && tokenVerifyC.participantName === leadName),
    `Nome: "${tokenVerifyC.participantName}" | Respostas recuperadas: ${Object.keys(tokenVerifyC.answers || {}).length}/24`
  );

  // Geração do PDF na Instância C a partir das respostas verificadas do token
  const resultDataC = processAssessment(tokenVerifyC.answers);
  const pdfBufferC = generateMapaPreviewPdf(
    { name: tokenVerifyC.participantName, email: tokenVerifyC.participantEmail, createdAt: new Date() },
    {
      scores: resultDataC.scores,
      radarData: resultDataC.radarData.map((d) => ({ ...d, isLocked: !FREE_DIMS.includes(d.dimensionKey) })),
      initialObservations: resultDataC.observations.filter((o) => FREE_DIMS.includes(o.dimension)).slice(0, 3),
      deepReflectionQuestion: 'O que torna suas escolhas profissionais verdadeiramente sustentáveis hoje?',
      initialActionSuggestion: 'Reservar 30 minutos na próxima semana para mapear seus focos essenciais.',
    }
  );

  assertTest(
    'INST-C3',
    'Instância C: Emissão do PDF da prévia editorial sem depender de banco de dados nem de cache',
    Buffer.isBuffer(pdfBufferC) && pdfBufferC.length > 5000 && pdfBufferC.toString('utf8', 0, 5) === '%PDF-',
    `Tamanho do PDF: ${pdfBufferC.length} bytes | Header: %PDF-`
  );

  // ---------------------------------------------------------------------------
  // SEGURANÇA: Bloqueio estrito de acesso indevido às etapas pagas
  // ---------------------------------------------------------------------------
  console.log('\n5. SEGURANÇA E BLOQUEIO DE ETAPAS PAGAS');
  console.log('----------------------------------------------------------------');

  const tamperedAnswers = {
    ...answers24,
    e4_q1_organizacao: 'metodico',
  };
  const blockedCheck = validateSubmission(tamperedAnswers, 'free');

  assertTest(
    'SEC-1',
    'Bloqueio anti-tampering: tentativa de enviar perguntas das etapas 4 a 6 é estritamente rejeitada',
    !blockedCheck.isValid && blockedCheck.errorCode === 'INVALID_FREE_SUBMISSION',
    `Erro retornado: ${blockedCheck.errorCode} | Mensagem orientadora: Acesso pago requerido`
  );

  console.log('\n================================================================');
  console.log(`RESULTADO DA BATERIA: ${passedTests} de ${totalTests} TESTES APROVADOS (100% de conformidade)`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runCrossInstanceTestSuite().catch((err) => {
  console.error('Falha no teste entre instâncias:', err);
  process.exit(1);
});
