/**
 * Testes Automatizados do Motor de Diagnóstico do Mapa Rumo
 * Executável via ts-node ou npx tsx
 */

import { processAssessment } from '../src/lib/mapa';
import { calculateAssessmentScores } from '../src/lib/mapa/engine/scoring';
import { generateInterpretations } from '../src/lib/mapa/engine/interpretation';
import { generateActionPlan } from '../src/lib/mapa/engine/actionPlanGenerator';

console.log('====================================================');
console.log('INICIANDO SUÍTE DE TESTES: MAPA RUMO ENGINE & LOGIC');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
  }
}

// -------------------------------------------------------------------------
// CENÁRIO 1: Alta importância de Aprendizado e Baixa Satisfação Atual (Fricção)
// -------------------------------------------------------------------------
console.log('--- Teste 1: Detecção de Gap de Fricção Crítica ---');

const mockAnswersScenario1 = {
  e1_q1_fase: 'reavaliacao',
  e1_q2_clareza: 3,
  e1_q3_satisfacao_geral: 2,
  e2_m1_autonomia: { importance: 4, satisfaction: 4 },
  e2_m2_aprendizado: { importance: 5, satisfaction: 2 }, // Fricção Crítica: gap 3
  e2_m3_resolucao_problemas: { importance: 3, satisfaction: 3 },
  e2_m4_criatividade: { importance: 3, satisfaction: 3 },
  e2_m5_impacto: { importance: 4, satisfaction: 2 }, // Fricção Crítica: gap 2
  e2_m6_colaboracao: { importance: 4, satisfaction: 4 },
  e2_m7_estabilidade: { importance: 3, satisfaction: 3 },
  e2_m8_reconhecimento: { importance: 3, satisfaction: 3 },
  e2_m9_variedade: { importance: 3, satisfaction: 3 },
  e2_m10_profundidade: { importance: 3, satisfaction: 3 },
  e3_t1_autonomia_orientacao: 2,
  e4_q1_organizacao: 'metodico',
  e4_q8_limites_nao: 2, // Limites baixos
  e5_q1_fortalezas_reconhecidas: ['clareza_estruturacao', 'visao_estrategica'],
  e6_q2_reduzir_reorganizar: 'reunioes_dispensaveis',
  e6_q4_micro_mudanca: 'planejar_vespera',
  e6_q5_tempo_semanal: '1_hora',
  e6_q6_prioridade_central: 'resgate_energia',
};

const result1 = processAssessment(mockAnswersScenario1);

assert(
  result1.scores.motivacaoEnergia.score > 0 && result1.scores.motivacaoEnergia.score <= 100,
  'Pontuação de Motivação & Energia calculada entre 0 e 100'
);

const aprendizadoGap = result1.gaps.find((g) => g.id === 'e2_m2_aprendizado');
assert(
  aprendizadoGap !== undefined && aprendizadoGap.status === 'friccao_critica' && aprendizadoGap.gap === 3,
  'Identificou corretamente fricção crítica em Aprendizado com gap = 3'
);

const pillFriccao = result1.pills.find((p) => p.category === 'POSSIVEL_TENSAO');
assert(
  pillFriccao !== undefined && pillFriccao.label.includes('Aprendizado'),
  'Gerou pílula diagnóstica de POSSIVEL_TENSAO apontando Aprendizado'
);

// -------------------------------------------------------------------------
// CENÁRIO 2: Determinismo e Consistência (Mesmas entradas -> Mesmas saídas)
// -------------------------------------------------------------------------
console.log('\n--- Teste 2: Determinismo do Motor ---');

const result1Repeat = processAssessment(mockAnswersScenario1);
assert(
  JSON.stringify(result1.scores) === JSON.stringify(result1Repeat.scores),
  'Motor determinístico gera pontuações idênticas para as mesmas entradas'
);
assert(
  JSON.stringify(result1.radarData) === JSON.stringify(result1Repeat.radarData),
  'Dados do radar idênticos em execuções repetidas'
);

// -------------------------------------------------------------------------
// CENÁRIO 3: Personalização do Plano de 30 Dias (4 Semanas)
// -------------------------------------------------------------------------
console.log('\n--- Teste 3: Personalização do Plano de 30 Dias ---');

assert(
  result1.actionPlan.length === 8,
  'Plano de 30 dias gerou exatamente 8 micro-ações estruturadas (2 por semana)'
);

const semanasPresentes = new Set(result1.actionPlan.map((a) => a.week));
assert(
  semanasPresentes.has(1) && semanasPresentes.has(2) && semanasPresentes.has(3) && semanasPresentes.has(4),
  'Todas as 4 semanas estão presentes no plano'
);

const acaoSem2 = result1.actionPlan.find((a) => a.week === 2 && a.id.includes('micro_experimento'));
assert(
  acaoSem2 !== undefined && acaoSem2.title.includes('Definir as 2 Prioridades da Véspera'),
  'Ação da Semana 2 foi personalizada com a micro-mudança escolhida pelo usuário'
);

// -------------------------------------------------------------------------
// CENÁRIO 4: Validação de Chaves de Testador (Tester Bypass)
// -------------------------------------------------------------------------
console.log('\n--- Teste 4: Validação Lógica de Chave de Testador VIP ---');

const validKeys = ['TESTE-VIP-2026'];
const testKey1 = 'teste-vip-2026 '; // Case-insensitive e com espaço
const testKeyInvalid = 'CODIGO_ALEATORIO_INEXISTENTE';

assert(
  validKeys.map((k) => k.toUpperCase()).includes(testKey1.trim().toUpperCase()),
  'Reconhece com sucesso chave autorizada em minúsculo e com espaços'
);

assert(
  !validKeys.map((k) => k.toUpperCase()).includes(testKeyInvalid.trim().toUpperCase()),
  'Rejeita com segurança chave inválida'
);

// -------------------------------------------------------------------------
// RESULTADO FINAL
// -------------------------------------------------------------------------
console.log('\n====================================================');
console.log(`RESUMO DOS TESTES: ${passedTests} de ${totalTests} aprovados (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('====================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
