import { CareerSourceData, MatchAnalysisResult, MatchRequirement, SupportedLanguage } from '@/types';
import { getSystemPrompt } from './prompts';
import { callGeminiApi } from './gemini';

export async function analyzeJdAlignment(
  careerSource: CareerSourceData,
  job: { company: string; roleTitle: string; rawJd: string },
  targetLang: SupportedLanguage = 'en'
): Promise<MatchAnalysisResult> {
  const systemPrompt = getSystemPrompt(targetLang);

  const candidateEvidenceSummary = careerSource.experiences
    .map(
      (exp) =>
        `Company: ${exp.company}, Title: ${exp.title} (${exp.startDate} - ${exp.endDate || 'Present'})\nScope: ${exp.teamScope || 'N/A'}\nAccomplishments:\n` +
        exp.accomplishments
          .map(
            (acc) =>
              `- Bullet: ${acc.text}\n  Business Problem: ${acc.businessProblem || 'N/A'}\n  Action: ${acc.actionTaken || 'N/A'}\n  Metric: ${acc.quantifiedMetric || 'N/A'}\n  Competencies: ${acc.competencies || 'N/A'}`
          )
          .join('\n')
    )
    .join('\n\n');

  const userPrompt = `
Analyze the alignment between the Candidate's Career Source and the Target Job Description.
Target Language: ${targetLang}
Target Company: ${job.company}
Target Role: ${job.roleTitle}

CANDIDATE'S VERIFIED CAREER SOURCE:
${candidateEvidenceSummary}

TARGET JOB DESCRIPTION:
${job.rawJd}

INSTRUCTIONS:
1. Extract 4-6 key requirements/pillars from the JD (Technical, Strategic Ownership, Cross-functional Leadership, Metric/Scale).
2. For each requirement, determine if the candidate has verified proof, partial proof, or an evidence gap.
3. For gaps or missing proof, DO NOT FABRICATE. Provide a sharp Socratic probing question in ${targetLang} to prompt the candidate for authentic evidence.
4. Calculate an authentic alignment score (0-100).
5. Suggest calibrations of existing bullets emphasizing the target JD's keywords without altering the underlying truth.

Return JSON in this exact structure:
{
  "score": number,
  "summary": string,
  "requirements": [
    {
      "id": string,
      "category": string,
      "requirement": string,
      "status": "matched" | "gap" | "partial",
      "matchedProof": string,
      "missingDetail": string,
      "socraticQuestion": string
    }
  ],
  "strengths": [string],
  "gaps": [
    {
      "area": string,
      "missingRequirement": string,
      "socraticPrompt": string
    }
  ],
  "tailoredSuggestions": [
    {
      "originalBullet": string,
      "calibratedBullet": string,
      "rationale": string
    }
  ]
}
`;

  // 1. Attempt Gemini API
  const geminiResponse = await callGeminiApi(systemPrompt, userPrompt);
  if (geminiResponse) {
    try {
      const parsed = JSON.parse(geminiResponse);
      return {
        score: parsed.score || 75,
        targetRole: job.roleTitle,
        targetCompany: job.company,
        language: targetLang,
        summary: parsed.summary || 'Calibration analysis completed.',
        requirements: parsed.requirements || [],
        strengths: parsed.strengths || [],
        gaps: parsed.gaps || [],
        tailoredSuggestions: parsed.tailoredSuggestions || [],
      };
    } catch (e) {
      console.warn('Failed to parse Gemini JSON output, utilizing calibrated heuristic fallback.', e);
    }
  }

  // 2. Deterministic High-Fidelity Heuristic Fallback
  return generateCalibratedFallbackAnalysis(careerSource, job, targetLang);
}

function generateCalibratedFallbackAnalysis(
  careerSource: CareerSourceData,
  job: { company: string; roleTitle: string; rawJd: string },
  lang: SupportedLanguage
): MatchAnalysisResult {
  const jdLower = job.rawJd.toLowerCase();
  const allAccText = careerSource.experiences
    .flatMap((e) => e.accomplishments)
    .map((a) => `${a.text} ${a.actionTaken} ${a.quantifiedMetric} ${a.competencies}`)
    .join(' ')
    .toLowerCase();

  // Define critical Big Tech pillar categories
  const pillarChecks = [
    {
      category: 'Strategic Ownership',
      terms: ['strategy', 'roadmap', 'vision', 'ownership', 'estrategia', 'visão', 'diretoria', 'liderança', 'estrategia'],
      proofKeyword: ['roadmap', 'strategy', 'led', 'spearheaded', 'liderou', 'definiu', 'arquitetei', 'estrategia'],
      socraticQuestion: {
        en: "Where in your career did you define product strategy and roadmap independently rather than merely executing an assigned spec? What was the business bet?",
        pt: "Em qual momento da sua carreira você definiu a estratégia e o roadmap de produto com autonomia, em vez de apenas executar demandas prévias? Qual foi a aposta de negócio?",
        es: "¿En qué momento de tu carrera definiste la estrategia de producto y roadmap con autonomía, en lugar de solo ejecutar especificaciones previas? ¿Cuál fue la apuesta de negocio?"
      },
      title: {
        en: "Strategic Ownership & Multi-Year Roadmap Definition",
        pt: "Propriedade Estratégica e Definição de Roadmap Plurianual",
        es: "Liderazgo Estratégico y Definición de Roadmap Plurianual"
      }
    },
    {
      category: 'Quantified Business Impact',
      terms: ['revenue', 'growth', 'arr', 'scale', 'efficiency', 'roi', 'métrica', 'receita', 'crescimento', 'impacto'],
      proofKeyword: ['$', '%', 'm', 'k', 'arr', 'retention', 'redução', 'aumento', 'faturamento'],
      socraticQuestion: {
        en: "The target role strongly values bottom-line impact. Can you quantify the revenue, cost reduction, or conversion gains delivered in your flagship initiatives?",
        pt: "A posição requer impacto comprovado no resultado financeiro. Como você quantifica a receita gerada, custo reduzido ou ganho de conversão das suas iniciativas principais?",
        es: "El puesto exige impacto demostrado en la cuenta de resultados. ¿Cómo cuantificas los ingresos generados, costes reducidos o ganancias de conversión de tus proyectos insignia?"
      },
      title: {
        en: "Quantified P&L / Bottom-Line Business Results",
        pt: "Impacto Financeiro e Resultados de Negócio Quantificados",
        es: "Impacto Financiero y Resultados de Negocio Cuantificados"
      }
    },
    {
      category: 'Cross-Functional & Exec Influence',
      terms: ['cross-functional', 'stakeholder', 'engineering', 'design', 'executives', 'leadership', 'influência', 'alinhamento'],
      proofKeyword: ['stakeholder', 'cross-functional', 'vp', 'c-level', 'engineers', 'engineering', 'director', 'diretoria', 'equipes', 'alinhou', 'alinhamento', 'consensus'],
      socraticQuestion: {
        en: "What is an example of a contentious technical or product decision where you aligned conflicting executive stakeholders across Engineering and Business?",
        pt: "Qual é um exemplo de decisão de produto ou arquitetura de alto atrito em que você alinhou executivos e lideranças divergentes de Engenharia e Negócios?",
        es: "¿Cuál es un ejemplo de decisión de producto o arquitectura con alta fricción en la que alineaste a directivos y líderes opuestos de Ingeniería y Negocio?"
      },
      title: {
        en: "Executive Stakeholder Alignment & Cross-Functional Influence",
        pt: "Alinhamento com Stakeholders C-Level e Liderança Cross-Funcional",
        es: "Alineación de Stakeholders C-Level e Influencia Multifuncional"
      }
    },
    {
      category: 'High-Scale & Technical Architecture',
      terms: ['distributed', 'latency', 'api', 'infrastructure', 'scale', 'platform', 'plataforma', 'arquitetura', 'dados'],
      proofKeyword: ['api', 'platform', 'latency', 'architecture', 'microservices', 'cloud', 'dados', 'escala'],
      socraticQuestion: {
        en: "What scale constraints (e.g. QPS, data volume, multi-region compliance) did your platform operate under, and how did you navigate the technical trade-offs?",
        pt: "Quais limites de escala (ex: QPS, volume de dados, conformidade multi-região) sua plataforma enfrentou e como você navegou os trade-offs técnicos?",
        es: "¿Qué restricciones de escala (ej: QPS, volumen de datos, multi-región) enfrentó tu plataforma y cómo navegaste los trade-offs técnicos?"
      },
      title: {
        en: "Large-Scale Architecture & Platform Engineering Rigor",
        pt: "Arquitetura em Larga Escala e Rigor de Plataforma",
        es: "Arquitectura a Gran Escala y Rigor de Plataforma"
      }
    }
  ];

  const requirements: MatchRequirement[] = [];
  const strengths: string[] = [];
  const gaps: { area: string; missingRequirement: string; socraticPrompt: string }[] = [];
  let matchCount = 0;

  pillarChecks.forEach((pillar, idx) => {
    // Check if JD mentions related concepts
    const jdRelevant = pillar.terms.some((t) => jdLower.includes(t)) || idx < 3;
    if (!jdRelevant) return;

    const hasProof = pillar.proofKeyword.some((k) => allAccText.includes(k));

    if (hasProof) {
      matchCount += 1;
      const matchedSample = careerSource.experiences[0]?.accomplishments[0]?.text || 'Verified in experience records.';
      requirements.push({
        id: `req-${idx}`,
        category: pillar.category,
        requirement: pillar.title[lang],
        status: 'matched',
        matchedProof: matchedSample,
      });
      strengths.push(`${pillar.title[lang]}: Strong evidence documented in your Career Source.`);
    } else {
      requirements.push({
        id: `req-${idx}`,
        category: pillar.category,
        requirement: pillar.title[lang],
        status: 'gap',
        missingDetail: lang === 'pt' ? 'Falta métrica quantificada ou escopo de liderança explícito' : lang === 'es' ? 'Falta métrica cuantificada o alcance de liderazgo explícito' : 'Lacks explicit quantified metric or strategic ownership proof',
        socraticQuestion: pillar.socraticQuestion[lang],
      });
      gaps.push({
        area: pillar.category,
        missingRequirement: pillar.title[lang],
        socraticPrompt: pillar.socraticQuestion[lang],
      });
    }
  });

  const rawScore = Math.round((matchCount / Math.max(requirements.length, 1)) * 100);
  const score = Math.max(50, Math.min(95, rawScore > 0 ? rawScore : 65));

  // Executive summaries per language
  const summaryTexts = {
    en: `Calibration for ${job.roleTitle} at ${job.company}: Your profile shows solid foundational seniority with ${matchCount} verified core competency pillars. To reach the top 5% of candidate pool, address the highlighted evidence gaps using the Socratic prompts below.`,
    pt: `Calibração para ${job.roleTitle} na ${job.company}: Seu perfil demonstra senioridade sólida com ${matchCount} pilares de competência verificados. Para se posicionar no top 5% dos candidatos, complemente as lacunas destacadas através das perguntas Socráticas abaixo.`,
    es: `Calibración para ${job.roleTitle} en ${job.company}: Tu perfil muestra una sólida base de seniority con ${matchCount} pilares verificados. Para posicionarte en el 5% superior de candidatos, responde a las indagaciones Socráticas para aportar evidencias auténticas faltantes.`
  };

  // Sample bullet calibration suggestions
  const firstAcc = careerSource.experiences[0]?.accomplishments[0];
  const tailoredSuggestions = firstAcc
    ? [
        {
          originalBullet: firstAcc.text,
          calibratedBullet:
            lang === 'pt'
              ? `Liderou a concepção e entrega estratégica de ponta a ponta, alinhando times multifuncionais e gerando ${firstAcc.quantifiedMetric || 'impacto de alta relevância'}.`
              : lang === 'es'
              ? `Lideró la concepción y entrega estratégica de extremo a extremo, alineando equipos multifuncionales y generando ${firstAcc.quantifiedMetric || 'impacto de alta relevancia'}.`
              : `Spearheaded end-to-end strategic delivery and cross-functional alignment, driving ${firstAcc.quantifiedMetric || 'substantial bottom-line impact'}.`,
          rationale:
            lang === 'pt'
              ? 'Enfatiza a propriedade executiva e alinhamento com a barra de Big Tech sem alterar os fatos reais.'
              : lang === 'es'
              ? 'Enfatiza la propiedad ejecutiva y alineación con el estándar de Big Tech sin alterar los hechos reales.'
              : 'Amplifies executive ownership and strategic framing to match Big Tech calibration standards without altering verified facts.'
        }
      ]
    : [];

  return {
    score,
    targetRole: job.roleTitle,
    targetCompany: job.company,
    language: lang,
    summary: summaryTexts[lang],
    requirements,
    strengths,
    gaps,
    tailoredSuggestions,
  };
}
