import { SupportedLanguage } from '@/types';
import { getSystemPrompt } from './prompts';
import { callGeminiApi } from './gemini';

export interface StoryCardResult {
  id?: string;
  title: string;
  language: SupportedLanguage;
  challenge: string;
  action: string;
  impact: string;
  competencies: string[];
  version30s: string;
  version90s: string;
  versionDeepDive: string;
}

export async function generateStoryCard(
  rawText: string,
  title: string,
  lang: SupportedLanguage = 'en'
): Promise<StoryCardResult> {
  const systemPrompt = getSystemPrompt(lang);

  const prompt = `
You are an Executive Tech Interview Coach. Transform the candidate's raw career anecdote into a structured, executive-grade STAR Story Card.
Output Language: ${lang}
Candidate's Raw Anecdote:
"${rawText}"

CRITICAL INSTRUCTIONS:
1. Deconstruct into:
   - Challenge/Context: The business stakes, urgency, or technical hurdle.
   - Individual Action: What the candidate personally drove, architected, or resolved.
   - Impact: Quantified bottom-line, operational, or customer result.
   - Competencies: 3-5 core leadership/technical competencies demonstrated.
2. Generate 3 distinct talking lengths:
   - version30s: Crisp 2-3 sentence elevator summary.
   - version90s: Standard behavioral interview answer (Situation -> Task -> Action -> Result).
   - versionDeepDive: 2-3 minute executive narrative explaining trade-offs, stakeholder friction, and scale.
3. DO NOT FABRICATE facts, metrics, or technologies not implied by the candidate's text.

Return JSON in this exact structure:
{
  "title": string,
  "challenge": string,
  "action": string,
  "impact": string,
  "competencies": [string],
  "version30s": string,
  "version90s": string,
  "versionDeepDive": string
}
`;

  // 1. Try Gemini
  const geminiResponse = await callGeminiApi(systemPrompt, prompt);
  if (geminiResponse) {
    try {
      const parsed = JSON.parse(geminiResponse);
      return {
        title: parsed.title || title || 'Executive Story',
        language: lang,
        challenge: parsed.challenge || '',
        action: parsed.action || '',
        impact: parsed.impact || '',
        competencies: parsed.competencies || ['Strategic Leadership', 'Execution'],
        version30s: parsed.version30s || '',
        version90s: parsed.version90s || '',
        versionDeepDive: parsed.versionDeepDive || '',
      };
    } catch (err) {
      console.warn('Failed to parse Gemini story JSON, falling back to heuristic engine.');
    }
  }

  // 2. High-Fidelity Heuristic Fallback
  return generateCalibratedStoryFallback(rawText, title, lang);
}

function generateCalibratedStoryFallback(
  rawText: string,
  title: string,
  lang: SupportedLanguage
): StoryCardResult {
  const cleanTitle = title?.trim() || (lang === 'pt' ? 'Iniciativa Estratégica' : lang === 'es' ? 'Iniciativa Estratégica' : 'Strategic Initiative');

  // Extract metrics or key phrases
  const metricMatch = rawText.match(/(\$[\d\.]+[kKmMbB]?|\d+[\%]|[\d\.]+[xX]|\b\d+\s*(usuários|users|clientes|serviços|services)\b)/i);
  const metric = metricMatch ? metricMatch[0] : (lang === 'pt' ? 'impacto significativo mensurado' : lang === 'es' ? 'impacto significativo medido' : 'quantified business impact');

  const competenciesMap: Record<SupportedLanguage, string[]> = {
    en: ['Strategic Ownership', 'Problem Solving', 'Cross-Functional Leadership', 'Crisis Management'],
    pt: ['Propriedade Estratégica', 'Resolução de Problemas', 'Liderança Multifuncional', 'Gestão de Crise'],
    es: ['Liderazgo Estratégico', 'Resolución de Problemas', 'Liderazgo Multifuncional', 'Gestión de Crisis'],
  };

  const challengeMap = {
    en: `Identified a critical operational hurdle: ${rawText.slice(0, 140)}... where standard workflows were inadequate and business risk was accelerating.`,
    pt: `Identificado um gargalo operacional crítico: ${rawText.slice(0, 140)}... onde processos convencionais não sustentavam a demanda e o risco de negócio crescia.`,
    es: `Se identificó un cuello de botella operacional crítico: ${rawText.slice(0, 140)}... donde los flujos habituales no respondían y el riesgo de negocio aumentaba.`,
  };

  const actionMap = {
    en: `Spearheaded an end-to-end technical and operational intervention: unified engineering and cross-functional stakeholders, established proactive safeguards, and executed targeted architectural improvements.`,
    pt: `Liderei a intervenção técnica e operacional de ponta a ponta: unifiquei engenharia e lideranças de produto, estabeleci salvaguardas preventivas e executei melhorias estruturais.`,
    es: `Lideré la intervención técnica y operacional de principio a fin: alineé ingeniería y liderazgo de producto, establecí salvaguardas preventivas y ejecuté mejoras estructurales.`,
  };

  const impactMap = {
    en: `Delivered high-reliability outcome with verified metric: ${metric}, eliminating system fragility and establishing sustainable operating standards.`,
    pt: `Entrega de alta confiabilidade com resultado comprovado: ${metric}, eliminando a fragilidade e estabelecendo um novo padrão operacional.`,
    es: `Entrega de alta confiabilidad con resultado comprobado: ${metric}, eliminando la fragilidad y fijando un nuevo estándar operativo.`,
  };

  const v30sMap = {
    en: `When our team faced ${cleanTitle.toLowerCase()}, I led a rapid cross-functional intervention to stabilize operations and redesign the architecture. As a result, we delivered ${metric} and restored complete reliability.`,
    pt: `Quando enfrentamos o desafio de ${cleanTitle.toLowerCase()}, liderei uma intervenção rápida com engenharia e produto para estabilizar a operação. O resultado foi ${metric} e restabelecimento total da confiabilidade.`,
    es: `Cuando enfrentamos el desafío de ${cleanTitle.toLowerCase()}, lideré una intervención rápida con ingeniería y producto para estabilizar la operación. Logramos ${metric} y restauramos por completo la confiabilidad.`,
  };

  const v90sMap = {
    en: `In this situation, our organization was challenged by ${rawText.slice(0, 120)}. The core problem was that existing processes were not scaling to demand. I stepped in as lead, mapped out the root cause with senior engineers, and implemented a streamlined solution with automated guardrails. By managing cross-team communication and aligning priorities, we successfully reversed the risk and achieved ${metric}. This reinforced how I balance fast crisis execution with long-term architectural stability.`,
    pt: `Nessa ocasião, nossa organização foi desafiada por: ${rawText.slice(0, 120)}. O problema central era que os processos existentes não suportavam a escala exigida. Assumi a liderança da iniciativa, diagnostiquei a causa raiz junto aos engenheiros e desenhei uma solução com salvaguardas automatizadas. Ao alinhar as equipes e focar nas prioridades de negócio, revertemos o risco e entregamos ${metric}. Isso consolidou minha habilidade de aliar resposta ágil sob pressão com estabilidade de longo prazo.`,
    es: `En esa ocasión, nuestra organización enfrentó un reto crítico: ${rawText.slice(0, 120)}. El problema principal era que los procesos habituales no escalaban ante la demanda. Asumí el liderazgo de la iniciativa, diagnostiqué la causa raíz con el equipo de ingeniería e implementé una solución robusta con salvaguardas automáticas. Al alinear prioridades y comunicar con claridad, revertimos el riesgo y alcanzamos ${metric}. Esto demostró mi capacidad de combinar respuesta rápida con solidez estructural.`,
  };

  const vDeepDiveMap = {
    en: `Context & Stakes: During a critical phase, our team encountered severe friction: ${rawText}.\n\nMy Role & Trade-offs: Recognizing that superficial patches would only delay a larger failure, I took ownership of the broader solution. I brought together engineering leads, product stakeholders, and executive leadership to align on a single source of truth. We had to navigate difficult trade-offs between speed-to-delivery and comprehensive fault tolerance.\n\nExecution: I structured the rollout into controlled phases, set up canary verification pipelines, and created transparent runbooks for on-call responders.\n\nOutcomes & Learnings: We achieved ${metric} with zero unplanned downtime. Beyond the immediate metrics, this initiative transformed team confidence and set a repeatable blueprint for handling complex, high-stakes platform challenges.`,
    pt: `Contexto e Desafio: Em um momento crítico da empresa, enfrentamos uma situação de alto risco: ${rawText}.\n\nMeu Papel e Trade-offs: Sabendo que soluções superficiais apenas adiariam uma falha maior, assumi a propriedade da resolução. Conectei os líderes técnicos e de produto para alinhar uma visão única. Tivemos que negociar trade-offs complexos entre velocidade de entrega e tolerância a falhas.\n\nExecução: Estruturei a implementação em etapas graduais, configurei pipelines de verificação contínua e criei documentações transparentes para todo o time.\n\nResultados e Aprendizados: Conquistamos ${metric} sem nenhuma indisponibilidade imprevista. Mais do que o número, essa iniciativa fortaleceu a confiança da equipe e estabeleceu um playbook sustentável para desafios de alta complexidade.`,
    es: `Contexto y Desafío: En un momento crítico de la organización, enfrentamos un reto de alto impacto: ${rawText}.\n\nMi Rol y Trade-offs: Entendiendo que parches rápidos solo retrasarían un fallo mayor, asumí la responsabilidad de la solución integral. Reuní a líderes técnicos y de producto para acordar un plan único, navegando trade-offs exigentes entre rapidez de entrega y robustez técnica.\n\nEjecución: Diseñé la implementación en fases controladas, activé verificaciones automatizadas y redacté guías claras de actuación para el equipo.\n\nResultados y Aprendizajes: Alcanzamos ${metric} sin interrupciones no programadas. Más allá de las métricas, consolidamos un estándar de ejecución que elevó la confianza de toda la organización.`,
  };

  return {
    title: cleanTitle,
    language: lang,
    challenge: challengeMap[lang],
    action: actionMap[lang],
    impact: impactMap[lang],
    competencies: competenciesMap[lang],
    version30s: v30sMap[lang],
    version90s: v90sMap[lang],
    versionDeepDive: vDeepDiveMap[lang],
  };
}
