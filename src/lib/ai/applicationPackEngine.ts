import { callGeminiApi } from './gemini';

export interface ApplicationPackContent {
  executiveSummary: string;
  whyThisRolePitch: string;
  outreachTemplates: {
    linkedinInMail: { subject: string; body: string };
    coldEmailHiringManager: { subject: string; body: string };
    warmPeerReferral: { subject: string; body: string };
  };
  reverseInterviewQuestions: {
    question: string;
    strategicRationale: string;
    committeeTarget: string; // e.g., "VP / Director", "Staff Peer", "Cross-Functional Partner"
  }[];
}

export async function generateApplicationPack(
  candidateName: string,
  candidateHeadline: string,
  keyAccomplishments: string[],
  company: string,
  roleTitle: string,
  targetLevel: string = 'L6',
  language: string = 'en'
): Promise<ApplicationPackContent> {
  const systemPrompt = `You are an Executive Career Agent creating an authentic Application Pack for ${candidateName}, targeting ${roleTitle} (${targetLevel}) at ${company}. Language: ${language}. Return strictly JSON.`;

  const userPrompt = `
Headline: ${candidateHeadline}
Accomplishments:
${keyAccomplishments.slice(0, 5).map((a) => `- ${a}`).join('\n')}

Generate strictly valid JSON with:
1. "executiveSummary": 2-3 sentences summarizing authentic candidate strengths relevant to ${company}.
2. "whyThisRolePitch": 1 structured paragraph explaining why the candidate's authentic trajectory fits ${company}'s challenges.
3. "outreachTemplates":
   - "linkedinInMail": { "subject": "...", "body": "..." } (under 120 words, punchy, executive).
   - "coldEmailHiringManager": { "subject": "...", "body": "..." } (focus on business impact, metric proof).
   - "warmPeerReferral": { "subject": "...", "body": "..." } (friendly, respectful of time, easy forward).
4. "reverseInterviewQuestions": 5 strategic questions with rationale and committeeTarget.

NEVER invent fake experience. Base everything on the candidate's achievements.
`;

  try {
    const rawResult = await callGeminiApi(systemPrompt, userPrompt);
    if (rawResult) {
      const cleaned = rawResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.executiveSummary && parsed.outreachTemplates) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Gemini API call failed for Application Pack, using deterministic engine:', e);
  }

  return generateApplicationPackHeuristic(
    candidateName,
    candidateHeadline,
    keyAccomplishments,
    company,
    roleTitle,
    targetLevel,
    language
  );
}

function generateApplicationPackHeuristic(
  name: string,
  headline: string,
  accomplishments: string[],
  company: string,
  roleTitle: string,
  targetLevel: string,
  language: string
): ApplicationPackContent {
  const topProof = accomplishments[0] || 'Led enterprise multi-region scaling and distributed architecture delivering 99.99% uptime.';
  const firstName = name.split(' ')[0] || name;

  if (language === 'pt') {
    return {
      executiveSummary: `${name} combina forte liderança técnica com foco rigoroso em resultados de negócio, com histórico comprovado em escala e resiliência (${topProof}). Posicionamento voltado para governança técnica e impacto mensurável na ${company}.`,
      whyThisRolePitch: `A oportunidade para ${roleTitle} (${targetLevel}) na ${company} representa a intersecção ideal entre minha experiência prática em sistemas de alta escala e minha capacidade de articular visão estratégica com times multifuncionais. Meu foco é reduzir complexidade operacional e entregar valor de negócio com rapidez e segurança.`,
      outreachTemplates: {
        linkedinInMail: {
          subject: `${roleTitle} | Conexão & Alinhamento de Perfil (${name})`,
          body: `Olá, tudo bem?\n\nAcompanho a trajetória da ${company} e vi a oportunidade para ${roleTitle}. Com histórico liderando iniciativas de escala (${topProof}), vejo forte alinhamento entre os desafios da área e meu background prático.\n\nSeria excelente bater um papo rápido de 10 minutos se fizer sentido para a liderança técnica da vaga.\n\nAbraço,\n${firstName}`,
        },
        coldEmailHiringManager: {
          subject: `${roleTitle} @ ${company} — Background em escala e resultados (${name})`,
          body: `Olá,\n\nEscrevo para apresentar meu interesse na posição de ${roleTitle} na ${company}.\n\nAo longo dos últimos anos, liderei arquiteturas críticas e alinhamento de roadmap estratégico, com entregas chave como:\n• ${accomplishments[0] || 'Redução substancial de latência e aumento de resiliência'}\n• ${accomplishments[1] || 'Liderança técnica transversal entre produto, engenharia e comitês executivos'}\n\nSei que a ${company} prioriza excelência operacional e velocidade. Caso esteja avaliando lideranças para a equipe, adoraria compartilhar aprendizados práticos.\n\nAtenciosamente,\n${name}`,
        },
        warmPeerReferral: {
          subject: `Indicação / Bate-papo rápido sobre ${company}`,
          body: `Oi! Espero que esteja tudo ótimo por aí.\n\nVi que você está na ${company} e notei a abertura da cadeira de ${roleTitle}. Meu background tem bastante afinidade com o momento do time (${topProof}).\n\nVocê teria 5 minutinhos para compartilhar como está a cultura do time ou indicar meu perfil diretamente para o hiring team?\n\nMuito obrigada!\n${firstName}`,
        },
      },
      reverseInterviewQuestions: [
        {
          question: `Como a liderança de engenharia e produto na ${company} prioriza débitos técnicos estruturais versus velocidade de entrega de novas features?`,
          strategicRationale: 'Avalia a maturidade técnica da liderança e a sustentabilidade de longo prazo do código.',
          committeeTarget: 'VP / Diretor de Engenharia',
        },
        {
          question: `Qual é o maior gargalo operacional ou arquitetural que impede este time de acelerar 2x no próximo ciclo?`,
          strategicRationale: 'Demonstra orientação imediata a resolução de problemas e impacto no primeiro trimestre.',
          committeeTarget: 'Hiring Manager',
        },
        {
          question: `Como as decisões de arquitetura e roadmap são comunicadas e validadas com stakeholders de negócio que não têm viés técnico?`,
          strategicRationale: 'Mede o nível de fricção cross-functional e a autonomia concedida aos líderes de time.',
          committeeTarget: 'Parceiro de Produto / Design',
        },
        {
          question: `Qual foi a última grande divergência técnica no time e como ela foi arbitrada com a equipe?`,
          strategicRationale: 'Revela a segurança psicológica real e os mecanismos de resolução de conflitos.',
          committeeTarget: 'Pares Técnicos (Staff / Lead)',
        },
        {
          question: `O que diferencia um profissional de nível ${targetLevel} de alto desempenho na ${company} de alguém que apenas atende as expectativas?`,
          strategicRationale: 'Explicita os critérios implícitos de promoção e calibragem de senioridade da empresa.',
          committeeTarget: 'Bar Raiser / Comitê Executivo',
        },
      ],
    };
  }

  if (language === 'es') {
    return {
      executiveSummary: `${name} aporta liderazgo técnico y orientación al impacto de negocio cuantificado (${topProof}). Posicionamiento centrado en arquitectura resiliente y visión estratégica para ${company}.`,
      whyThisRolePitch: `La oportunidad como ${roleTitle} (${targetLevel}) en ${company} se alinea con mi trayectoria resolviendo retos de escala y gobernanza técnica. Mi propósito es eliminar fricción operativa y acelerar resultados sostenibles para el equipo.`,
      outreachTemplates: {
        linkedinInMail: {
          subject: `${roleTitle} | Interés y Conversación (${name})`,
          body: `Hola, ¿cómo estás?\n\nSigo de cerca la evolución de ${company} y vi la vacante abierta para ${roleTitle}. Cuento con experiencia liderando proyectos de alta disponibilidad y escala (${topProof}), por lo que veo gran afinidad con sus prioridades actuales.\n\nMe encantaría tener un breve diálogo si consideran oportuno explorar perfiles con mi trayectoria.\n\nSaludos cordiales,\n${firstName}`,
        },
        coldEmailHiringManager: {
          subject: `${roleTitle} @ ${company} — Experiencia en escala e impacto (${name})`,
          body: `Estimado/a,\n\nTe contacto para compartir mi interés en la posición de ${roleTitle} en ${company}.\n\nEn mis roles recientes he liderado iniciativas estratégicas de arquitectura e ingeniería, logrando hitos concretos como:\n• ${accomplishments[0] || 'Optimización de latencia y disponibilidad a gran escala'}\n• ${accomplishments[1] || 'Alineación transversal entre ingeniería, producto y negocio'}\n\nEntiendo el foco de ${company} en ejecución y calidad. Si estás buscando sumar talento con este enfoque, con gusto profundizaría en una breve llamada.\n\nAtentamente,\n${name}`,
        },
        warmPeerReferral: {
          subject: `Consulta rápida sobre la vacante de ${roleTitle} en ${company}`,
          body: `¡Hola! Espero que todo vaya excelente.\n\nVi que formas parte del equipo en ${company} y descubrí la posición de ${roleTitle}. Mi perfil tiene gran sintonía con las responsabilidades del cargo (${topProof}).\n\n¿Tendrías unos minutos para comentarme cómo es la dinámica del área o canalizar mi CV con el equipo de reclutamiento?\n\n¡Muchas gracias de antemano!\n${firstName}`,
        },
      },
      reverseInterviewQuestions: [
        {
          question: `¿Cómo balancea la dirección de ${company} la inversión en deuda técnica frente a la urgencia de entrega de negocio?`,
          strategicRationale: 'Permite medir la salud arquitectónica y la madurez cultural de la organización.',
          committeeTarget: 'VP / Director de Ingeniería',
        },
        {
          question: `¿Cuál es el mayor desafío operativo que enfrenta este equipo en los próximos 6 meses?`,
          strategicRationale: 'Demuestra iniciativa y preparación para asumir responsabilidades desde el día uno.',
          committeeTarget: 'Hiring Manager',
        },
        {
          question: `¿Cómo se gestiona el consenso cuando ingeniería y producto tienen prioridades en conflicto?`,
          strategicRationale: 'Mide la colaboración cross-functional y los niveles reales de fricción interna.',
          committeeTarget: 'Product Lead / Stakeholder',
        },
        {
          question: `¿Cómo se define el éxito para un ${targetLevel} en ${company} al cabo de su primer año?`,
          strategicRationale: 'Aclara las expectativas implícitas para superar el estándar del nivel.',
          committeeTarget: 'Bar Raiser / Comité Evaluador',
        },
        {
          question: `¿Qué autonomía real tiene el equipo para adoptar nuevas herramientas y modernizar infraestructura?`,
          strategicRationale: 'Valora la agilidad frente a la burocracia en procesos de decisión técnica.',
          committeeTarget: 'Colegas Técnicos (Staff)',
        },
      ],
    };
  }

  // English fallback
  return {
    executiveSummary: `${name} pairs strategic product & technical leadership with proven scale delivery (${topProof}). Tailored positioning focused on architectural resilience and measurable business impact at ${company}.`,
    whyThisRolePitch: `The ${roleTitle} (${targetLevel}) role at ${company} represents the ideal inflection point for my background. Having delivered high-availability platforms and aligned multi-functional roadmaps, I am eager to apply this rigorous execution mindset to accelerate ${company}'s core business priorities.`,
    outreachTemplates: {
      linkedinInMail: {
        subject: `${roleTitle} | Exploring Alignment (${name})`,
        body: `Hi there,\n\nI have been following ${company}'s recent momentum and noticed the opening for ${roleTitle}. Having spearheaded large-scale technical and product initiatives (${topProof}), I see strong synergy with your current roadmap priorities.\n\nI would welcome a brief conversation if you are exploring senior talent for this team.\n\nBest regards,\n${firstName}`,
      },
      coldEmailHiringManager: {
        subject: `${roleTitle} @ ${company} — Scaled Delivery & Architecture (${name})`,
        body: `Hi,\n\nI am writing to express my strong interest in the ${roleTitle} opportunity at ${company}.\n\nIn my recent leadership roles, I drove high-stakes initiatives centered on engineering velocity and scale, including:\n• ${accomplishments[0] || 'Multi-region distributed system scaling under zero downtime'}\n• ${accomplishments[1] || 'Cross-functional alignment across product, infrastructure, and executive leadership'}\n\nGiven ${company}'s bar for technical craft and operational rigor, I would value the chance to share practical learnings on how I can add immediate leverage to your team.\n\nSincerely,\n${name}`,
      },
      warmPeerReferral: {
        subject: `Quick question regarding ${roleTitle} @ ${company}`,
        body: `Hi! Hope you are doing well.\n\nI noticed you are currently at ${company} and saw the open ${roleTitle} role. Given my experience scaling complex platforms (${topProof}), I felt there is great alignment with what the team is tackling.\n\nWould you have 5 minutes to share brief perspective on the team culture, or would you be open to submitting an internal referral?\n\nThanks so much!\n${firstName}`,
      },
    },
    reverseInterviewQuestions: [
      {
        question: `How does leadership at ${company} strategically balance addressing legacy technical debt versus pushing net-new roadmap commitments?`,
        strategicRationale: 'Evaluates architectural health, engineering leadership autonomy, and long-term codebase viability.',
        committeeTarget: 'VP / Director of Engineering',
      },
      {
        question: `What is the single biggest bottleneck currently holding this organization back from shipping twice as fast?`,
        strategicRationale: 'Signals an immediate problem-solving mindset and readiness to tackle high-leverage friction.',
        committeeTarget: 'Hiring Manager',
      },
      {
        question: `Can you walk me through the last major cross-functional disagreement between Product and Engineering, and how it was resolved?`,
        strategicRationale: 'Tests for psychological safety, collaborative culture, and decision-making frameworks.',
        committeeTarget: 'Product Partner / Cross-Functional Lead',
      },
      {
        question: `What distinguishes an exceptional ${targetLevel} at ${company} from someone who is merely meeting expectations?`,
        strategicRationale: 'Surfaces unwritten committee standards and leveling calibration rubrics.',
        committeeTarget: 'Bar Raiser / Hiring Committee',
      },
      {
        question: `How much autonomy does a Staff/Lead engineer have in setting multi-quarter architectural technical roadmaps?`,
        strategicRationale: 'Assesses top-down mandate versus bottom-up technical stewardship.',
        committeeTarget: 'Staff Peer',
      },
    ],
  };
}
