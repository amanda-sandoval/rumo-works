/**
 * REPRODUÇÃO DO BUG P0 — CÁLCULO DO DIAGNÓSTICO GRATUITO
 * MAPA RUMO | RUMO WORKS
 */

const { validateLead } = require('/tmp/mapa-qa/lib/mapa/engine/leadValidation.js');
const { validateSubmission } = require('/tmp/mapa-qa/engine/validation.js');
const { processAssessment } = require('/tmp/mapa-qa/index.js');
const { createDownloadToken } = require('/tmp/mapa-qa/lib/mapa/export/downloadToken.js');

const sample24Answers = {
  e1_q1_fase: 'crescimento_acelerado',
  e1_q2_clareza: 4,
  e1_q3_satisfacao_geral: 4,
  e1_q4_energia_ocupada: ['sobrecarga_operacional'],
  e1_q5_desejo_compreensao: 'proximos_passos',
  e1_q6_descoberta_util: 'Clareza de liderança',
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
  e3_t1_autonomia_orientacao: 4, // Questão 17 na captura do usuário
  e3_t2_seguranca_experimentacao: 4,
  e3_t3_visibilidade_tranquilidade: 1,
  e3_t4_especializacao_generalismo: 4,
  e3_t5_velocidade_qualidade: 2,
  e3_t6_ambicao_equilibrio: 1,
  e3_t7_independencia_colegiado: 2,
  e3_t8_estrutura_flexibilidade: 2,
};

async function testCurrentBehavior() {
  console.log('--- REPRODUÇÃO DO BUG EM AMBIENTE DE PRODUÇÃO ---');
  process.env.NODE_ENV = 'production';
  delete process.env.DOWNLOAD_TOKEN_SECRET;

  try {
    console.log('1. Validando lead...');
    const leadVal = validateLead('João Santos', 'joao@exemplo.com.br');
    console.log('   Lead válido:', leadVal.isValid);

    console.log('2. Validando submissão de 24 perguntas...');
    const subVal = validateSubmission(sample24Answers, 'free');
    console.log('   Submissão válida:', subVal.isValid, '| Perguntas:', subVal.answeredCount);

    console.log('3. Processando assessment...');
    const resultData = processAssessment(sample24Answers);
    console.log('   Assessment calculado com sucesso.');

    console.log('4. Tentando gerar downloadToken em produção sem DOWNLOAD_TOKEN_SECRET...');
    const token = createDownloadToken('sess_teste_123', 'preview', 24);
    console.log('   DownloadToken gerado:', token);
  } catch (err) {
    console.error('❌ ERRO CAPTURADO:', err.message);
    console.log('   No endpoint /api/mapa/calculate, este erro cai no bloco catch geral:');
    console.log('   => Status 500');
    console.log('   => Resposta: { error: "Falha no processamento do diagnóstico." }');
  }
}

testCurrentBehavior();
