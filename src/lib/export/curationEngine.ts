import {
  CareerSourceData,
  StoryCardData,
  CuratedCvData,
  CuratedExperience,
  CuratedAccomplishment,
  SupportedLanguage,
} from '@/types';

export function curateCvForTargetRole(
  careerSource: CareerSourceData,
  storyCards: StoryCardData[],
  targetCompany: string,
  targetRole: string,
  rawJd: string,
  lang: SupportedLanguage = 'en'
): CuratedCvData {
  const jdLower = (rawJd || '').toLowerCase();
  const companyLower = (targetCompany || '').toLowerCase();
  const roleLower = (targetRole || '').toLowerCase();

  // 1. Detect target domain signals from JD
  const isFintech =
    jdLower.includes('payment') ||
    jdLower.includes('ledger') ||
    jdLower.includes('financial') ||
    companyLower.includes('stripe') ||
    companyLower.includes('nubank');

  const isPlatformAi =
    jdLower.includes('ai') ||
    jdLower.includes('data mesh') ||
    jdLower.includes('machine learning') ||
    jdLower.includes('ecosystem') ||
    companyLower.includes('miro') ||
    companyLower.includes('google');

  const isHighScale =
    jdLower.includes('scale') ||
    jdLower.includes('latency') ||
    jdLower.includes('throughput') ||
    jdLower.includes('distributed');

  // 2. Curate Experiences & Accomplishments
  const curatedExperiences: CuratedExperience[] = careerSource.experiences.map((exp) => {
    const scoredBullets: CuratedAccomplishment[] = exp.accomplishments.map((acc) => {
      const bulletTextLower = (acc.text + ' ' + (acc.competencies || '')).toLowerCase();
      let relevance = 50; // base score

      // Prioritize bullets aligning with the domain
      if (isFintech && (bulletTextLower.includes('payment') || bulletTextLower.includes('transaction') || bulletTextLower.includes('pci'))) {
        relevance += 40;
      }
      if (isPlatformAi && (bulletTextLower.includes('data') || bulletTextLower.includes('platform') || bulletTextLower.includes('api') || bulletTextLower.includes('mesh'))) {
        relevance += 40;
      }
      if (isHighScale && (bulletTextLower.includes('throughput') || bulletTextLower.includes('latency') || bulletTextLower.includes('scale'))) {
        relevance += 30;
      }
      if (acc.quantifiedMetric) {
        relevance += 20; // Verified metrics always increase weight
      }

      // Check if user has a corresponding Story Card in Story Lab
      const matchingStory = storyCards.find((sc) => {
        const scText = (sc.title + ' ' + sc.challenge + ' ' + sc.action).toLowerCase();
        return (
          (bulletTextLower.includes('payment') && scText.includes('payment')) ||
          (bulletTextLower.includes('data mesh') && scText.includes('data')) ||
          (bulletTextLower.includes('latency') && scText.includes('latency')) ||
          (bulletTextLower.includes('outage') && scText.includes('outage')) ||
          (bulletTextLower.includes('velocity') && scText.includes('velocity'))
        );
      });

      let finalText = acc.text;
      let sourceStoryTitle: string | undefined = undefined;

      // Enrich bullet using the user's own Story Card details if available
      if (matchingStory) {
        sourceStoryTitle = matchingStory.title;
        relevance += 25;

        // If story card has a quantified impact, synthesize into the bullet cleanly
        if (matchingStory.impact && !finalText.includes(matchingStory.impact)) {
          finalText = `${acc.text} [${matchingStory.impact}]`;
        }
      }

      return {
        text: finalText,
        quantifiedMetric: acc.quantifiedMetric || undefined,
        sourceStoryTitle,
        relevanceScore: relevance,
      };
    });

    // Sort by relevance (highest first) and take the top 3-4 most impactful accomplishments
    scoredBullets.sort((a, b) => b.relevanceScore - a.relevanceScore);
    const topBullets = scoredBullets.slice(0, 4);

    return {
      id: exp.id,
      company: exp.company,
      title: exp.title,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate,
      isCurrent: exp.isCurrent,
      teamScope: exp.teamScope,
      curatedAccomplishments: topBullets,
    };
  });

  // 3. Tailor Executive Summary to Highlight Intersecting Strengths
  let curatedSummary = careerSource.profile.summary;
  if (isFintech) {
    if (lang === 'pt') {
      curatedSummary = `Liderança sênior de tecnologia com histórico comprovado em infraestrutura financeira de missão crítica, pagamentos globais em tempo real e arquitetura de alta escala. ${careerSource.profile.summary}`;
    } else if (lang === 'es') {
      curatedSummary = `Líder senior de tecnología con trayectoria comprobada en infraestructura financiera crítica, procesamiento de pagos globales y plataformas de alta escala. ${careerSource.profile.summary}`;
    } else {
      curatedSummary = `Senior technology product leader with proven track record scaling mission-critical financial infrastructure, global payment routing, and high-throughput distributed systems. ${careerSource.profile.summary}`;
    }
  } else if (isPlatformAi) {
    if (lang === 'pt') {
      curatedSummary = `Liderança executiva focada em plataformas de dados, ecossistemas de desenvolvedores e iniciativas de IA corporativa com escala de dezenas de milhões em receita. ${careerSource.profile.summary}`;
    } else if (lang === 'es') {
      curatedSummary = `Líder ejecutivo especializado en plataformas de datos, ecosistemas de desarrolladores e iniciativas de IA empresarial con impacto medible en ARR. ${careerSource.profile.summary}`;
    } else {
      curatedSummary = `Executive product leader specializing in developer platforms, enterprise data ecosystems, and scaled architecture driving multi-million ARR expansion. ${careerSource.profile.summary}`;
    }
  }

  // 4. Reorder Skills based on role focus
  const rawSkills = careerSource.profile.skills || [];
  const prioritizedSkills = [...rawSkills].sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    let aWeight = 0;
    let bWeight = 0;

    if (isFintech) {
      if (aLower.includes('payment') || aLower.includes('distributed') || aLower.includes('api')) aWeight += 2;
      if (bLower.includes('payment') || bLower.includes('distributed') || bLower.includes('api')) bWeight += 2;
    }
    if (isPlatformAi) {
      if (aLower.includes('ai') || aLower.includes('infrastructure') || aLower.includes('product')) aWeight += 2;
      if (bLower.includes('ai') || bLower.includes('infrastructure') || bLower.includes('product')) bWeight += 2;
    }

    return bWeight - aWeight;
  });

  return {
    name: careerSource.user.name,
    email: careerSource.user.email,
    headline: `${careerSource.profile.headline} • Target: ${targetRole} @ ${targetCompany}`,
    summary: curatedSummary,
    targetCompany,
    targetRole,
    language: lang,
    experiences: curatedExperiences,
    skills: prioritizedSkills,
  };
}
