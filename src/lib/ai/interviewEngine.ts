import { callGeminiApi } from './gemini';

export type InterviewTrack = 'behavioral' | 'system_design' | 'product_strategy' | 'executive';

export interface SpeechAnalytics {
  isAudio?: boolean;
  durationSeconds?: number;
  wpm?: number;
  paceRating?: 'ideal' | 'fast' | 'slow';
  paceLabel?: string;
  fillerWordsFound?: string[];
  verbalClarityScore?: number;
}

export interface InterviewTurnData {
  turnIndex: number;
  speaker: 'interviewer' | 'candidate';
  text: string;
  analysis?: {
    score: number;
    strengths: string[];
    improvements: string[];
    ownershipScore: number;
    quantificationScore: number;
    tradeoffScore: number;
    speechAnalytics?: SpeechAnalytics;
  };
}

export interface InterviewSessionDiagnostic {
  overallScore: number;
  pillars: {
    ownership: number;
    quantification: number;
    tradeoffs: number;
    structure: number;
    presence: number;
  };
  matrix: {
    strategicDepth: number;
    clarityAndStructure: number;
    problemSolvingAndCrisis: number;
  };
  keyStrengths: string[];
  coachingNotes: string[];
  calibratedLevelRecommendation: string;
}

const TRACK_STARTER_QUESTIONS: Record<string, Record<InterviewTrack, string>> = {
  en: {
    behavioral: "Tell me about a high-stakes disagreement with an executive or key stakeholder where you had to make a call despite incomplete data. How did you handle alignment and what was the outcome?",
    system_design: "Walk me through the architecture of a distributed system you scaled under heavy load. What were the core bottlenecks, and what technical trade-offs did you actively choose?",
    product_strategy: "Describe a 0-to-1 product or strategic initiative you spearheaded. How did you discover customer signal, prioritize conflicting requirements, and measure definitive product-market fit?",
    executive: "Tell me about an organizational crisis or severe business constraint you navigated. How did you restructure priorities, lead across functions without direct authority, and protect business outcomes?",
  },
  pt: {
    behavioral: "Conte sobre uma divergência de alto impacto com um executivo ou stakeholder chave em que você precisou tomar uma decisão com dados incompletos. Como você conduziu o alinhamento e qual foi o resultado?",
    system_design: "Descreva a arquitetura de um sistema distribuído que você escalou sob alta carga. Quais foram os principais gargalos e quais trade-offs técnicos você conscientemente adotou?",
    product_strategy: "Descreva uma iniciativa estratégica ou produto 0-a-1 que você liderou. Como você validou o sinal de mercado, priorizou demandas concorrentes e mediu o sucesso do negócio?",
    executive: "Conte sobre uma crise organizacional ou restrição severa de negócio que você precisou contornar. Como reestruturou prioridades, exerceu liderança multifuncional sem autoridade direta e protegeu os resultados?",
  },
  es: {
    behavioral: "Cuéntame sobre un desacuerdo de alto impacto con un ejecutivo o stakeholder clave donde tuviste que tomar una decisión con datos incompletos. ¿Cómo manejaste el alineamiento y cuál fue el resultado?",
    system_design: "Explícame la arquitectura de un sistema distribuido que escalaste bajo alta demanda. ¿Cuáles fueron los cuellos de botella principales y qué trade-offs técnicos elegiste conscientemente?",
    product_strategy: "Describe un producto 0-a-1 o iniciativa estratégica que lideraste. ¿Cómo validaste las señales del cliente, priorizaste requisitos en conflicto y mediste el ajuste al mercado?",
    executive: "Cuéntame sobre una crisis organizacional o restricción severa de negocio que debiste resolver. ¿Cómo reestructuraste prioridades, influiste multifuncionalmente sin autoridad directa y protegiste los resultados?",
  },
};

export function getInitialInterviewQuestion(
  track: InterviewTrack,
  targetLevel: string,
  company: string,
  roleTitle: string,
  language: string = 'en'
): string {
  const langKey = language in TRACK_STARTER_QUESTIONS ? language : 'en';
  const base = TRACK_STARTER_QUESTIONS[langKey][track] || TRACK_STARTER_QUESTIONS.en[track];
  
  if (language === 'pt') {
    return `Bem-vindo(a) à simulação para ${roleTitle} (${targetLevel}) na ${company}. Vamos começar direto com um cenário prático: ${base}`;
  } else if (language === 'es') {
    return `Bienvenido(a) a la simulación para ${roleTitle} (${targetLevel}) en ${company}. Comencemos directamente con un escenario real: ${base}`;
  }
  return `Welcome to the mock simulation for ${roleTitle} (${targetLevel}) at ${company}. Let's jump straight into a real-world scenario: ${base}`;
}

export function analyzeSpeechDelivery(
  text: string,
  durationSeconds: number = 0,
  language: string = 'en',
  isAudio: boolean = true
): SpeechAnalytics {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  let wpm = 0;
  let paceRating: 'ideal' | 'fast' | 'slow' = 'ideal';
  let paceLabel = '';

  if (durationSeconds > 0) {
    wpm = Math.round((wordCount / durationSeconds) * 60);
    if (wpm >= 120 && wpm <= 165) {
      paceRating = 'ideal';
      paceLabel =
        language === 'pt'
          ? `Cadência executiva ideal (${wpm} PPM)`
          : language === 'es'
          ? `Cadencia ejecutiva ideal (${wpm} PPM)`
          : `Ideal executive cadence (${wpm} WPM)`;
    } else if (wpm > 165) {
      paceRating = 'fast';
      paceLabel =
        language === 'pt'
          ? `Fala acelerada (${wpm} PPM) — desacelere para maior autoridade`
          : language === 'es'
          ? `Habla apresurada (${wpm} PPM) — reduce el ritmo para mayor presencia`
          : `Rushed speech (${wpm} WPM) — pause to emphasize key points`;
    } else {
      paceRating = 'slow';
      paceLabel =
        language === 'pt'
          ? `Cadência pausada (${wpm} PPM) — busque mais dinamismo`
          : language === 'es'
          ? `Cadencia pausada (${wpm} PPM) — busca mayor dinamismo`
          : `Deliberate pace (${wpm} WPM) — add conversational energy`;
    }
  }

  const lower = text.toLowerCase();
  const fillerPatterns: Record<string, string[]> = {
    pt: ['tipo assim', 'tipo', 'né', 'ééé', 'humm', 'quer dizer', 'entendeu', 'sabe'],
    es: ['o sea', 'este...', 'ehh', 'bueno', 'sabes', 'como que', 'digo'],
    en: ['like', 'you know', 'uh', 'um', 'basically', 'sort of', 'kind of', 'i mean'],
  };

  const candidateFillers = fillerPatterns[language] || fillerPatterns.en;
  const fillerWordsFound: string[] = [];

  for (const filler of candidateFillers) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      fillerWordsFound.push(`${filler} (${matches.length}x)`);
    }
  }

  let verbalClarityScore = 90;
  if (fillerWordsFound.length > 2) verbalClarityScore -= 15;
  else if (fillerWordsFound.length > 0) verbalClarityScore -= 5;
  if (paceRating === 'ideal') verbalClarityScore += 5;
  if (durationSeconds >= 45 && durationSeconds <= 120) verbalClarityScore += 5;

  return {
    isAudio,
    durationSeconds,
    wpm: wpm || (wordCount > 0 ? 140 : 0),
    paceRating,
    paceLabel,
    fillerWordsFound,
    verbalClarityScore: Math.min(100, Math.max(50, verbalClarityScore)),
  };
}

function cleanPromptSnippet(question: string): string {
  return question
    .replace(/^Bem-vindo[^:]*:\s*/i, '')
    .replace(/^Bienvenido[^:]*:\s*/i, '')
    .replace(/^Welcome[^:]*:\s*/i, '')
    .trim();
}

function detectDuplicateAnswer(currentAnswer: string, priorTurns: InterviewTurnData[]): boolean {
  const candidateTurns = priorTurns.filter((t) => t.speaker === 'candidate');
  if (candidateTurns.length === 0) return false;

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const normCurrent = normalize(currentAnswer);
  if (!normCurrent || normCurrent.length < 15) return false;

  const currentWords = new Set(normCurrent.split(' ').filter((w) => w.length >= 3));

  for (const prev of candidateTurns) {
    const normPrev = normalize(prev.text);
    if (!normPrev || normPrev.length < 15) continue;

    if (normCurrent === normPrev) return true;
    if (normCurrent.length > 35 && (normPrev.includes(normCurrent) || normCurrent.includes(normPrev))) {
      return true;
    }

    const prevWords = new Set(normPrev.split(' ').filter((w) => w.length >= 3));
    let intersection = 0;
    currentWords.forEach((w) => {
      if (prevWords.has(w)) intersection++;
    });
    const minSize = Math.min(currentWords.size, prevWords.size);
    if (minSize >= 5 && intersection / minSize >= 0.65) {
      return true;
    }
  }

  return false;
}

function detectOffTopicAnswer(
  answer: string,
  lastQuestion: string,
  language: string
): { isOffTopic: boolean; feedback: { strengths: string[]; improvements: string[]; nextQuestion: string } } | null {
  if (!lastQuestion || answer.length < 20) return null;

  const cleanQ = cleanPromptSnippet(lastQuestion);

  // Theme 1: Stakeholders / Executive Disagreement / Conflict / Pushback / Alignment
  const isStakeholderQuestion =
    /stakeholder|executiv|diretor|vp|cétic|diverg|desacordo|conflit|alinha|convenc|política|consenso|negotiat|disagree|skeptic|pushback|resistência/i.test(
      cleanQ
    );

  if (isStakeholderQuestion) {
    const hasStakeholderWords =
      /stakeholder|executiv|diretor|vp|lider|conflit|diverg|desacordo|consenso|alinha|convenc|reuni|negoci|apresent|resist|pushback|skeptic|disagree|alignment|pessoa|time|board|comitê|comite|parceiro|líder/i.test(
        answer
      );

    const isPurelyTechnicalOutage =
      /gateway|circuit breaker|redis|cache|tráfego|transaç|banco|latency|latência|servidor|cluster|infra|black friday/i.test(
        answer
      );

    if (!hasStakeholderWords && isPurelyTechnicalOutage) {
      if (language === 'pt') {
        return {
          isOffTopic: true,
          feedback: {
            strengths: ['O relato operacional tem dados, porém não responde à pergunta formulada.'],
            improvements: [
              'Desvio de contexto crítico: a pergunta cobrava gestão de divergência com executivos e alinhamento de stakeholders.',
              'Sua resposta descreveu uma resolução puramente operacional/técnica sem abordar a negociação humana ou liderança executiva.',
              'Responda diretamente ao cenário proposto para demonstrar maturidade e escopo executivo.',
            ],
            nextQuestion:
              'Compreendo a complexidade técnica do incidente que você descreveu, mas sua resposta desviou da pergunta. Meu foco foi especificamente como você lidera e resolve divergências com executivos ou stakeholders céticos. Como exatamente você gerenciou as pessoas envolvidas e construiu o alinhamento?',
          },
        };
      } else if (language === 'es') {
        return {
          isOffTopic: true,
          feedback: {
            strengths: ['El relato técnico tiene datos, pero elude el objetivo de la pregunta.'],
            improvements: [
              'Desviación de contexto crítica: la pregunta indagaba sobre desacuerdos con ejecutivos y alineación de stakeholders.',
              'Tu respuesta trató solo un incidente de infraestructura sin abordar la negociación con personas ni liderazgo.',
              'Responde directamente al escenario propuesto para evidenciar seniority ejecutivo.',
            ],
            nextQuestion:
              'Entiendo la complejidad operativa descrita, pero te desviaste de la pregunta principal. El objetivo era evaluar cómo gestionas discrepancias con ejecutivos o stakeholders escépticos. ¿Cómo manejaste el conflicto humano y negociaste el consenso?',
          },
        };
      } else {
        return {
          isOffTopic: true,
          feedback: {
            strengths: ['The technical narrative has metrics, but fails to address the prompt.'],
            improvements: [
              'Critical topic evasion: the question specifically probed executive pushback and stakeholder alignment.',
              'Your response focused exclusively on operational/systems troubleshooting without touching human or leadership friction.',
              'Directly address the prompt framed by the interviewer to reflect leadership scope.',
            ],
            nextQuestion:
              'I understand the operational incident you described, but you dodged the question. I specifically asked how you navigate disagreements with skeptical executives or stakeholders. How exactly did you resolve the friction and secure cross-functional alignment?',
          },
        };
      }
    }
  }

  // Theme 2: Retrospective / What would you do differently
  const isRetrospectiveQuestion =
    /diferente|mudaria|voltasse|início|evitar retrabalho|lição|retrospect|change|differently|look back|hindsight/i.test(
      cleanQ
    );

  if (isRetrospectiveQuestion) {
    const hasRetrospectiveWords =
      /diferente|mudaria|teria|evitad|lição|aprend|erro|antecipad|instead|hindsight|differently|mistake|regret|decisão diferente|rever|refatorar/i.test(
        answer
      );

    if (!hasRetrospectiveWords && answer.length > 50) {
      if (language === 'pt') {
        return {
          isOffTopic: true,
          feedback: {
            strengths: ['A resposta descreve ações passadas, mas não responde à reflexão crítica solicitada.'],
            improvements: [
              'Falta de reflexão retrospectiva: a pergunta solicitou expressamente o que você faria de DIFERENTE hoje.',
              'Líderes seniores demonstram vulnerabilidade estratégica e capacidade de identificar pontos cegos passados.',
            ],
            nextQuestion:
              'Você reiterou o que deu certo, mas evitou responder o núcleo da pergunta: com a experiência que tem hoje, qual decisão técnica, de processo ou de governança você teria tomado DIFERENTE para evitar retrabalho?',
          },
        };
      } else if (language === 'es') {
        return {
          isOffTopic: true,
          feedback: {
            strengths: ['Describes lo ocurrido, pero no respondes a la reflexión crítica planteada.'],
            improvements: [
              'Falta de autocrítica: la pregunta pedía qué decisión habrías tomado de manera DIFERENTE.',
              'Los líderes senior deben mostrar madurez para reconocer aprendizajes y trade-offs no anticipados.',
            ],
            nextQuestion:
              'Repasaste lo que funcionó, pero eludiste el punto central: con tu madurez actual, ¿qué decisión habrías tomado de forma DIFERENTE para evitar fricciones?',
          },
        };
      } else {
        return {
          isOffTopic: true,
          feedback: {
            strengths: ['You reiterated the delivery, but avoided the retrospective probe.'],
            improvements: [
              'Missing self-reflection: the question specifically asked what you would do DIFFERENTLY with hindsight.',
              'Staff/Principal candidates must demonstrate strategic humility and post-mortem accountability.',
            ],
            nextQuestion:
              'You summarized what succeeded, but bypassed the core question: with today\'s perspective, what architectural or prioritization decision would you have made DIFFERENTLY to prevent long-term friction?',
          },
        };
      }
    }
  }

  return null;
}

export async function evaluateTurnAndAskFollowUp(
  candidateAnswer: string,
  priorTurns: InterviewTurnData[],
  track: InterviewTrack,
  targetLevel: string,
  roleTitle: string,
  company: string,
  language: string = 'en',
  speechInput?: { durationSeconds?: number; isAudio?: boolean }
): Promise<{
  analysis: {
    score: number;
    strengths: string[];
    improvements: string[];
    ownershipScore: number;
    quantificationScore: number;
    tradeoffScore: number;
    speechAnalytics?: SpeechAnalytics;
  };
  nextQuestion: string;
}> {
  const speechAnalytics = analyzeSpeechDelivery(
    candidateAnswer,
    speechInput?.durationSeconds || 0,
    language,
    speechInput?.isAudio ?? true
  );

  const lastInterviewerTurn = [...priorTurns].reverse().find((t) => t.speaker === 'interviewer');
  const lastQuestion = lastInterviewerTurn?.text || '';
  const lastQuestionSnippet = cleanPromptSnippet(lastQuestion);

  // 1. Rigorous Duplicate / Repetition check
  if (detectDuplicateAnswer(candidateAnswer, priorTurns)) {
    if (language === 'pt') {
      return {
        analysis: {
          score: 25,
          ownershipScore: 25,
          quantificationScore: 20,
          tradeoffScore: 20,
          strengths: [],
          improvements: [
            'Repetição detectada: você forneceu a mesma resposta/exemplo que já havia dado em um turno anterior.',
            'Em entrevistas para cargos seniores em Big Tech, reciclar a mesma história denota falta de repertório e fuga do tema.',
            'Responda especificamente ao cenário perguntado em vez de repetir casos anteriores.',
          ],
          speechAnalytics,
        },
        nextQuestion: `Você acabou de repetir o mesmo exemplo dado no turno anterior. Em uma entrevista para ${targetLevel} na ${company}, reciclar a mesma história demonstra falta de repertório e fuga do tema. Preciso que você responda especificamente à pergunta que formulei: "${lastQuestionSnippet}". Qual é o seu exemplo real para essa situação?`,
      };
    } else if (language === 'es') {
      return {
        analysis: {
          score: 25,
          ownershipScore: 25,
          quantificationScore: 20,
          tradeoffScore: 20,
          strengths: [],
          improvements: [
            'Respuesta repetida: has proporcionado el mismo ejemplo que en un turno anterior.',
            'En entrevistas para niveles senior en Big Tech, reciclar la misma historia denota falta de repertorio y evasión.',
            'Responde específicamente al escenario planteado en lugar de repetir relatos previos.',
          ],
          speechAnalytics,
        },
        nextQuestion: `Acabas de repetir exactamente el mismo ejemplo que en el turno anterior. En una entrevista para ${targetLevel} en ${company}, reciclar la misma historia denota falta de repertorio y evasión. Necesito que respondas concretamente a la pregunta formulada: "${lastQuestionSnippet}". ¿Cuál es tu experiencia real para esta situación?`,
      };
    } else {
      return {
        analysis: {
          score: 25,
          ownershipScore: 25,
          quantificationScore: 20,
          tradeoffScore: 20,
          strengths: [],
          improvements: [
            'Repetition flagged: you provided the exact same example as in a previous turn.',
            'In Big Tech senior hiring rounds, recycling stories indicates a shallow repertoire and prompt dodging.',
            'Address the specific scenario asked rather than repeating past anecdotes.',
          ],
          speechAnalytics,
        },
        nextQuestion: `You just repeated the exact same example from a previous turn. In an interview for ${targetLevel} at ${company}, recycling the same story signals a shallow repertoire and evades the prompt. I need you to address the specific question I asked: "${lastQuestionSnippet}". What is your actual experience for this scenario?`,
      };
    }
  }

  // 2. Off-Topic / Question Evasion check
  const offTopicResult = detectOffTopicAnswer(candidateAnswer, lastQuestion, language);
  if (offTopicResult && offTopicResult.isOffTopic) {
    return {
      analysis: {
        score: 35,
        ownershipScore: 40,
        quantificationScore: 35,
        tradeoffScore: 30,
        strengths: offTopicResult.feedback.strengths,
        improvements: offTopicResult.feedback.improvements,
        speechAnalytics,
      },
      nextQuestion: offTopicResult.feedback.nextQuestion,
    };
  }

  const conversationContext = priorTurns
    .map((t) => `${t.speaker.toUpperCase()} (Turn ${t.turnIndex}): ${t.text}`)
    .join('\n');

  const systemPrompt = `
# Role and Identity
You are the lead AI Interviewer and Mentor for "The Career Lab", an elite career acceleration and mentoring platform created by industry experts from Big Tech. Your persona is that of a seasoned, rigorous, yet constructive hiring manager or senior leader (e.g., CMO, Director of Product, VP of Engineering) at a top-tier tech company.

# Core Objective
Conduct a highly personalized, adaptive behavioral and strategic roleplay interview for ${roleTitle} (${targetLevel}) at ${company}, Track: ${track}.
Critically evaluate the candidate's responses, probe for depth, business impact, and strategic thinking through smart follow-up questions, and deliver structured evaluation.

# Operational Rules & Flow
1. Language Adaptation: Conduct the entire turn seamlessly in ${language}.
2. One Step at a Time: Ask strictly ONE question at a time.
3. Strict Prompt Relevance & Rejection of Dodging:
   - Carefully examine the immediately preceding question asked: "${lastQuestionSnippet}".
   - If the candidate's answer is a duplicate of an earlier turn, or completely dodges the question (e.g. asked about executive conflict but candidate talks only about database latency without mentioning stakeholders):
     a) score MUST be penalized below 40.
     b) improvements MUST explicitly flag the repetition or question dodging.
     c) nextQuestion MUST firmly call out the evasion and demand they answer the specific question asked. DO NOT advance to a new topic!
4. Dynamic Follow-up Logic ("Yodli" Style Roleplay):
   - Analyze against: Strategic Depth & Business Impact, Communication Clarity & Structure (STAR), Problem-Solving / Crisis Management.
   - If the answer is superficial, lacks concrete metrics, or avoids core complexity: DO NOT ADVANCE to a new scenario. Ask a sharp, probing follow-up question to test their critical thinking and depth.
   - If the answer is robust, structured, and demonstrates high-level competency: acknowledge it briefly and transition smoothly to the next core scenario.
5. Tone and Style:
   - Professional, analytical, authoritative yet mentoring.
   - NEVER use generic encouragement ("Good job!", "Great answer!"). Provide precise, contextual professional critique.
   - All recommendations must be deeply tailored to the exact context, numbers, and challenges the user mentioned.

Return strictly valid JSON matching:
{
  "analysis": {
    "score": 85,
    "ownershipScore": 90,
    "quantificationScore": 80,
    "tradeoffScore": 85,
    "strengths": ["...", "..."],
    "improvements": ["..."]
  },
  "nextQuestion": "..."
}
`;

  const userPrompt = `
Conversation History so far:
${conversationContext}

Candidate's Latest Audio/Spoken Response:
"${candidateAnswer}"

Speech Metrics:
- Duration: ${speechAnalytics.durationSeconds || 'N/A'}s
- WPM: ${speechAnalytics.wpm || 'N/A'}
- Filler Words Detected: ${speechAnalytics.fillerWordsFound?.join(', ') || 'None'}

Evaluate the candidate's answer and produce the next single follow-up question.
`;

  try {
    const rawResult = await callGeminiApi(systemPrompt, userPrompt);
    if (rawResult) {
      const cleaned = rawResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.analysis && parsed.nextQuestion) {
        parsed.analysis.speechAnalytics = speechAnalytics;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Gemini API call failed for interview turn, falling back to heuristic engine:', e);
  }

  // Heuristic evaluation engine
  return evaluateTurnHeuristic(candidateAnswer, priorTurns, track, targetLevel, language, speechAnalytics);
}

function evaluateTurnHeuristic(
  answer: string,
  priorTurns: InterviewTurnData[],
  track: InterviewTrack,
  targetLevel: string,
  language: string,
  speechAnalytics?: SpeechAnalytics
): {
  analysis: {
    score: number;
    strengths: string[];
    improvements: string[];
    ownershipScore: number;
    quantificationScore: number;
    tradeoffScore: number;
    speechAnalytics?: SpeechAnalytics;
  };
  nextQuestion: string;
} {
  const words = answer.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Quantification check
  const hasNumbers = /\d+%|\$\d+|\d+k|\d+M|\b(zero|duas|três|dez|hundred|million|milhões|millones)\b/i.test(answer);
  const quantificationScore = hasNumbers ? 88 : 58;

  // Ownership check
  const hasOwnershipWords = /\b(eu|liderando|decidi|estruturei|migrei|defini|criei|I |my |spearheaded|architected|drove|delivered|yo |lideré|decidí)\b/i.test(answer);
  const ownershipScore = hasOwnershipWords ? 92 : 64;

  // Tradeoff / Depth check
  const hasTradeoffs = /\b(trade-off|tradeoff|embora|porém|risco|sacrifício|custo|alternativa|latency|overhead|resiliência|dilemma|instead|balance|pesar)\b/i.test(answer);
  const tradeoffScore = hasTradeoffs ? 90 : 62;

  const score = Math.round(
    ownershipScore * 0.35 +
    quantificationScore * 0.35 +
    tradeoffScore * 0.2 +
    Math.min(100, Math.max(50, wordCount > 40 ? 90 : 60)) * 0.1
  );

  let strengths: string[] = [];
  let improvements: string[] = [];
  let nextQuestion = '';

  if (language === 'pt') {
    if (hasOwnershipWords) strengths.push('Clara apropriação pessoal da iniciativa e das decisões tomadas.');
    else improvements.push('Evite falar apenas no coletivo ("nós fizemos"); explicite seu papel individual de liderança.');

    if (hasNumbers) strengths.push('Excelente ancoragem com métricas concretas e impacto de negócio mensurável.');
    else improvements.push('Faltou quantificar a magnitude do impacto (percentuais, volume de dados, receita ou tempo economizado).');

    if (hasTradeoffs) strengths.push('Boa maturidade ao expor alternativas descartadas e riscos gerenciados.');
    else improvements.push('Para calibrar nível sênior/staff, exponha quais trade-offs técnicos ou organizacionais você precisou negociar.');

    // Audio-specific verbal delivery insights
    if (speechAnalytics?.isAudio) {
      if (speechAnalytics.fillerWordsFound && speechAnalytics.fillerWordsFound.length > 0) {
        improvements.push(`Vícios de linguagem detectados na fala: ${speechAnalytics.fillerWordsFound.join(', ')}. Use pausas de respiração.`);
      }
      if (speechAnalytics.paceRating === 'ideal') {
        strengths.push(`Excelente ritmo e cadência de fala (${speechAnalytics.wpm} PPM), soando seguro e calmo.`);
      } else if (speechAnalytics.paceRating === 'fast') {
        improvements.push(`Ritmo de fala acelerado (${speechAnalytics.wpm} PPM). Desacelere para demonstrar maior gravitas executiva.`);
      }
    }

    const turnCount = priorTurns.length;
    if (turnCount <= 2) {
      nextQuestion = `Entendido. Você detalhou a solução central. Pensando na resistência ou fricção que quase sempre ocorre em iniciativas desse porte: como você convenceu os stakeholders mais céticos e quais dados apresentou para sustentar sua tese?`;
    } else if (turnCount <= 4) {
      nextQuestion = `Excelente contexto. Se você pudesse voltar ao início desse projeto com a maturidade que tem hoje, qual decisão arquitetural ou de processo você teria tomado diferente para evitar retrabalho a longo prazo?`;
    } else {
      nextQuestion = `Para fecharmos este ciclo: como essa solução se sustentou 6 a 12 meses após a entrega e qual mecanismo você instituiu para que o time mantivesse essa barra de qualidade autonomamente?`;
    }
  } else if (language === 'es') {
    if (hasOwnershipWords) strengths.push('Clara apropiación personal de la iniciativa y decisiones tomadas.');
    else improvements.push('Evita usar solo el plural colectivo ("hicimos"); explicita tu rol individual de liderazgo.');

    if (hasNumbers) strengths.push('Buena cuantificación con números y métricas de impacto reales.');
    else improvements.push('Falta cuantificar la magnitud del impacto (porcentajes, volumen de usuarios o ahorro financiero).');

    if (hasTradeoffs) strengths.push('Madurez ejecutiva al considerar trade-offs y alternativas descartadas.');
    else improvements.push('Para reflejar seniority Staff/Lead, explica qué trade-offs técnicos o de negocio tuviste que balancear.');

    if (speechAnalytics?.isAudio) {
      if (speechAnalytics.fillerWordsFound && speechAnalytics.fillerWordsFound.length > 0) {
        improvements.push(`Muletillas detectadas en la voz: ${speechAnalytics.fillerWordsFound.join(', ')}. Sustitúyelas con pausas deliberadas.`);
      }
      if (speechAnalytics.paceRating === 'ideal') {
        strengths.push(`Cadencia verbal ideal (${speechAnalytics.wpm} PPM), proyectando claridad y control.`);
      }
    }

    const turnCount = priorTurns.length;
    if (turnCount <= 2) {
      nextQuestion = `Entendido. Explicaste la solución principal. Pensando en la resistencia natural en proyectos de este calibre: ¿cómo alineaste a los stakeholders más escépticos y qué datos presentaste para validar tu dirección?`;
    } else if (turnCount <= 4) {
      nextQuestion = `Muy buen contexto. Si pudieras regresar al inicio de esta iniciativa con tu experiencia actual, ¿qué decisión arquitectónica o de ejecución cambiarías y por qué?`;
    } else {
      nextQuestion = `Para concluir: ¿cómo evolucionó esta solución 6 a 12 meses después del lanzamiento y qué procesos estableciste para que el equipo mantuviera esta barra de excelencia?`;
    }
  } else {
    if (hasOwnershipWords) strengths.push('Strong personal ownership and active voice detailing your leadership.');
    else improvements.push('Avoid relying solely on "we"; specify your individual actions and pivotal choices.');

    if (hasNumbers) strengths.push('Solid quantified business impact with verifiable metric anchors.');
    else improvements.push('Quantify the scale of your impact (e.g. latency reduction, dollar savings, user scale).');

    if (hasTradeoffs) strengths.push('Demonstrated executive depth by framing technical and organizational trade-offs.');
    else improvements.push('To reflect Staff/Principal scope, articulate the alternatives you weighed and discarded.');

    if (speechAnalytics?.isAudio) {
      if (speechAnalytics.fillerWordsFound && speechAnalytics.fillerWordsFound.length > 0) {
        improvements.push(`Filler words heard in delivery: ${speechAnalytics.fillerWordsFound.join(', ')}. Replace with measured pauses.`);
      }
      if (speechAnalytics.paceRating === 'ideal') {
        strengths.push(`Measured, articulate verbal pace (${speechAnalytics.wpm} WPM), conveying executive calm.`);
      }
    }

    const turnCount = priorTurns.length;
    if (turnCount <= 2) {
      nextQuestion = `Got it. You outlined the core delivery. Taking a step back into organizational friction: how did you handle pushback from skeptical cross-functional leaders, and what specific evidence did you use to bring them along?`;
    } else if (turnCount <= 4) {
      nextQuestion = `Great depth. With the benefit of hindsight, what key technical or strategic decision would you have made differently to future-proof the architecture?`;
    } else {
      nextQuestion = `To wrap up this scenario: how did this system or framework sustain itself 6-12 months post-launch, and what observability or governance did you put in place?`;
    }
  }

  return {
    analysis: {
      score,
      ownershipScore,
      quantificationScore,
      tradeoffScore,
      strengths: strengths.length ? strengths : ['Clear baseline context and problem explanation.'],
      improvements: improvements.length ? improvements : ['Consider structuring with even tighter brevity to leave room for follow-ups.'],
      speechAnalytics,
    },
    nextQuestion,
  };
}

export function generatePostSessionDiagnostic(
  turns: InterviewTurnData[],
  targetLevel: string,
  track: InterviewTrack,
  language: string = 'en'
): InterviewSessionDiagnostic {
  const candidateTurns = turns.filter((t) => t.speaker === 'candidate' && t.analysis);
  
  if (candidateTurns.length === 0) {
    return {
      overallScore: 70,
      pillars: { ownership: 70, quantification: 70, tradeoffs: 65, structure: 75, presence: 70 },
      matrix: { strategicDepth: 70, clarityAndStructure: 75, problemSolvingAndCrisis: 70 },
      keyStrengths: ['Completed interview session baseline.'],
      coachingNotes: ['Provide more quantified data in subsequent sessions.'],
      calibratedLevelRecommendation: targetLevel,
    };
  }

  const avgOwnership = Math.round(
    candidateTurns.reduce((acc, t) => acc + (t.analysis?.ownershipScore || 70), 0) / candidateTurns.length
  );
  const avgQuantification = Math.round(
    candidateTurns.reduce((acc, t) => acc + (t.analysis?.quantificationScore || 70), 0) / candidateTurns.length
  );
  const avgTradeoffs = Math.round(
    candidateTurns.reduce((acc, t) => acc + (t.analysis?.tradeoffScore || 65), 0) / candidateTurns.length
  );
  const avgStructure = Math.round(
    candidateTurns.reduce((acc, t) => acc + (t.analysis?.score || 75), 0) / candidateTurns.length
  );
  const avgPresence = Math.round((avgOwnership * 0.5 + avgTradeoffs * 0.5));

  const overallScore = Math.round(
    (avgOwnership + avgQuantification + avgTradeoffs + avgStructure + avgPresence) / 5
  );

  const strategicDepth = Math.round(avgQuantification * 0.5 + avgTradeoffs * 0.5);
  const clarityAndStructure = avgStructure;
  const problemSolvingAndCrisis = Math.round(avgOwnership * 0.6 + avgTradeoffs * 0.4);

  // Extract contextual keywords from candidate answers for tailored advice
  const candidateCorpus = candidateTurns.map((t) => t.text).join(' ');
  const hasLatency = /lat[êe]ncia|latency/i.test(candidateCorpus);
  const hasRevenue = /\$|R\$|receita|revenue|ARR|faturamento/i.test(candidateCorpus);
  const hasArchitecture = /arquitetura|architecture|migra|distributed|distribu/i.test(candidateCorpus);

  let keyStrengths: string[] = [];
  let coachingNotes: string[] = [];
  let calibratedLevelRecommendation = targetLevel;

  if (overallScore >= 88) {
    calibratedLevelRecommendation = targetLevel;
  } else if (overallScore >= 78) {
    calibratedLevelRecommendation = targetLevel === 'L7' ? 'L6 Staff' : targetLevel;
  } else {
    calibratedLevelRecommendation = targetLevel === 'L6' ? 'L5 Senior' : targetLevel;
  }

  if (language === 'pt') {
    keyStrengths = [
      'Articulação segura de decisões críticas com clareza de liderança individual (Ownership).',
      hasRevenue
        ? 'Forte ancoragem em impacto financeiro e ROI de negócio mensurável.'
        : 'Boa capacidade de síntese e condução da narrativa segundo o método STAR.',
      hasArchitecture
        ? 'Excelente compreensão de restrições de arquitetura de alta escala e disponibilidade.'
        : 'Boa fundamentação técnica ao expor os passos de resolução de crise.',
    ];

    coachingNotes = [
      hasArchitecture
        ? 'Ao defender as escolhas de arquitetura, explicite quais caminhos técnicos alternativos foram rejeitados e qual critério objetivo balizou sua decisão.'
        : 'Aprofunde os trade-offs técnicos: comitês Staff/Diretoria valorizam entender quais hipóteses foram descartadas.',
      hasLatency || hasRevenue
        ? 'Conecte os ganhos operacionais citados à sustentação de longo prazo: qual governança e SLAs foram instituídos para o time manter esse patamar autonomamente?'
        : 'Eleve a quantificação: inclua percentuais de melhoria, economia de recursos ou volume de clientes impactados para ancorar seu ROI.',
      'Em cenários de fricção com stakeholders executivos, detalhe a negociação baseada em dados e matriz de risco em vez de depender de autoridade hierárquica.',
    ];
  } else if (language === 'es') {
    keyStrengths = [
      'Articulación sólida de liderazgo individual y toma de decisiones críticas.',
      hasRevenue
        ? 'Excelente justificación basada en métricas financieras e impacto de negocio medible.'
        : 'Buena estructura comunicativa y claridad de exposición bajo el método STAR.',
      'Demostración de madurez ejecutiva al enfrentar momentos de alta presión.',
    ];

    coachingNotes = [
      hasArchitecture
        ? 'Al argumentar la arquitectura, explicita qué alternativas técnicas viables descartaste y qué criterios guiaron tu consenso.'
        : 'Profundiza en los trade-offs estratégicos: explica por qué no se eligieron caminos más simples o más baratos.',
      'Cierra tus respuestas mencionando la gobernanza y estabilidad de la solución a 6-12 meses plazo.',
      'En fricciones con directores escépticos, detalla la matriz de riesgo utilizada para alinear el roadmap.',
    ];
  } else {
    keyStrengths = [
      'Strong personal ownership without diffusing responsibility into generic team efforts.',
      hasRevenue
        ? 'Compelling quantitative grounding in financial ROI and business metrics.'
        : 'Structured, articulate narrative using the STAR behavioral framework.',
      'High-conviction decision making under deadline and organizational pressure.',
    ];

    coachingNotes = [
      hasArchitecture
        ? 'When justifying distributed systems choices, explicitly name the discarded architectures and the concrete SLA thresholds that drove your decision.'
        : 'Drill deeper into technical trade-offs: Staff+ bar raisers actively evaluate why viable paths were rejected.',
      'Conclude scenarios by framing long-term organizational durability: automated observability, team autonomy, or post-launch SLAs.',
      'When resolving stakeholder resistance, showcase data-driven consensus building rather than top-down mandate.',
    ];
  }

  return {
    overallScore,
    pillars: {
      ownership: avgOwnership,
      quantification: avgQuantification,
      tradeoffs: avgTradeoffs,
      structure: avgStructure,
      presence: avgPresence,
    },
    matrix: {
      strategicDepth,
      clarityAndStructure,
      problemSolvingAndCrisis,
    },
    keyStrengths,
    coachingNotes,
    calibratedLevelRecommendation,
  };
}
