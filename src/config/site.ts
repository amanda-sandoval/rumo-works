export interface NavItem {
  label: string;
  href: string;
}

export interface MethodologyStage {
  step: string;
  title: string;
  description: string;
  details: string[];
}

export interface ChallengeItem {
  id: string;
  title: string;
  description: string;
  highlight: string;
}

export interface TargetAudienceItem {
  title: string;
  description: string;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  title: string;
  description: string;
  url: string;
  language: string;
  brand: {
    rumoMeaning: string;
    worksMeaning: string;
  };
  navigation: NavItem[];
  hero: {
    headline: string;
    supportingCopy: string;
    primaryCta: string;
    secondaryCta: string;
  };
  challenges: {
    headline: string;
    intro: string;
    items: ChallengeItem[];
  };
  methodology: {
    headline: string;
    subheadline: string;
    pilotNotice: string;
    stages: MethodologyStage[];
  };
  mentor: {
    greeting: string;
    name: string;
    portraitPath: string | null;
    bioParagraphs: string[];
    linkedInUrl: string;
  };
  targetAudience: {
    headline: string;
    intro: string;
    items: TargetAudienceItem[];
    pilotNote: string;
  };
  interest: {
    headline: string;
    copy: string;
    primaryCta: string;
    formUrl: string | null;
    modal: {
      title: string;
      badge: string;
      message: string;
      statusNote: string;
      externalActionText: string;
      closeText: string;
    };
  };
  footer: {
    statement: string;
    independentNotice: string;
  };
}

export const siteConfig: SiteConfig = {
  name: "Rumo Works",
  tagline: "Mentoria de Carreira em Tecnologia",
  title: "Rumo Works | Mentoria de Carreira em Tecnologia",
  description:
    "Mentoria prática para quem quer entrar ou crescer em Big Tech, marketing digital e tecnologia — com mais clareza sobre o mercado, posicionamento profissional e estratégia para o próximo passo.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://rumo-works.vercel.app",
  language: "pt-BR",
  brand: {
    rumoMeaning: "direcionamento, propósito e caminho claro",
    worksMeaning: "ação prática, desenvolvimento e progresso real",
  },
  navigation: [
    { label: "Desafios", href: "#desafios" },
    { label: "Metodologia", href: "#metodologia" },
    { label: "Sobre a Amanda", href: "#sobre" },
    { label: "Para quem é", href: "#para-quem" },
  ],
  hero: {
    headline: "Dê um novo rumo à sua carreira.",
    supportingCopy:
      "Mentoria prática para quem quer entrar ou crescer em Big Tech, marketing digital e tecnologia — com mais clareza sobre o mercado, posicionamento profissional e estratégia para o próximo passo.",
    primaryCta: "Tenho interesse",
    secondaryCta: "Conheça a metodologia",
  },
  challenges: {
    headline: "Você não precisa descobrir sua carreira inteira de uma vez.",
    intro:
      "Encontrar a oportunidade certa envolve muito mais do que se candidatar ao maior número possível de vagas. Uma trajetória consistente começa quando você substitui o volume pela estratégia.",
    items: [
      {
        id: "oportunidades",
        title: "Compreensão de oportunidades alinhadas",
        description:
          "Dificuldade em identificar quais caminhos, tipos de empresa e funções realmente fazem sentido para a sua bagagem e ambições de longo prazo.",
        highlight: "Direcionamento focado",
      },
      {
        id: "posicionamento",
        title: "Narrativa e comunicação de competências",
        description:
          "Desafio em articular experiências passadas e habilidades transferíveis em uma narrativa profissional clara, atraente e sem ruídos.",
        highlight: "Posicionamento claro",
      },
      {
        id: "plano",
        title: "Estruturação de um plano realista",
        description:
          "Sensação de sobrecarga com o processo de busca e dificuldade em transformar objetivos abstratos em prioridades e passos práticos do dia a dia.",
        highlight: "Ação estruturada",
      },
    ],
  },
  methodology: {
    headline: "Clareza para escolher. Estratégia para agir.",
    subheadline:
      "Um método em quatro etapas desenhado para transformar incerteza em um plano de carreira estruturado e executável.",
    pilotNotice:
      "Apresentamos a metodologia como um framework vivo, que continuará sendo refinado e validado junto aos participantes do piloto voluntário.",
    stages: [
      {
        step: "01",
        title: "Diagnóstico",
        description:
          "Mapeamento profundo do seu histórico profissional, competências consolidadas, áreas de interesse genuíno e objetivos para os próximos ciclos.",
        details: [
          "Mapeamento de competências e pontos fortes",
          "Identificação de gargalos atuais na carreira",
          "Alinhamento de expectativas e horizontes de tempo",
        ],
      },
      {
        step: "02",
        title: "Posicionamento",
        description:
          "Tradução da sua trajetória em uma narrativa profissional consistente, evidenciando habilidades transferíveis e o valor que você gera.",
        details: [
          "Definição de mensagem central e proposta de valor",
          "Articulação de experiências anteriores com contexto",
          "Alinhamento da presença profissional",
        ],
      },
      {
        step: "03",
        title: "Estratégia",
        description:
          "Mapeamento intencional dos caminhos possíveis: tipos de função, verticais de mercado e critérios objetivos de priorização de oportunidades.",
        details: [
          "Critérios de fit entre seu perfil e tipos de vagas",
          "Compreensão de dinâmicas do mercado tech",
          "Foco nos papéis com maior potencial de crescimento",
        ],
      },
      {
        step: "04",
        title: "Plano de Ação",
        description:
          "Construção de um roteiro prático com prioridades claras, rotina de preparação e próximos passos bem delimitados para você avançar.",
        details: [
          "Definição de metas imediatas e de médio prazo",
          "Priorização de ações de desenvolvimento",
          "Roteiro de execução sem sobrecarga",
        ],
      },
    ],
  },
  mentor: {
    greeting: "Prazer, sou a Amanda.",
    name: "Amanda",
    portraitPath: "/images/amanda-sandoval.png",
    bioParagraphs: [
      "Tenho mais de 10 anos de experiência profissional atuando em adtech, publicidade digital, funções de relacionamento com clientes e estratégia comercial. Minha vivência inclui suporte consultivo a clientes, trabalho com soluções de publicidade digital e o desafio de ajudar empresas a navegar questões comerciais e operacionais complexas.",
      "Sou graduada em Marketing pela Universidade de São Paulo com formação complementar em marketing digital pela University of California - UCLA.",
      "Acredito que a evolução de carreira se torna muito mais intencional quando profissionais compreendem com nitidez seus pontos fortes, comunicam seu valor sem rodeios e abordam oportunidades com um plano bem estruturado.",
    ],
    linkedInUrl: "https://www.linkedin.com/in/amandasandoval/",
  },
  targetAudience: {
    headline: "Um próximo passo mais consciente para sua carreira.",
    intro:
      "A mentoria foi pensada para profissionais que buscam intencionalidade, método e orientação prática em momentos decisivos de trajetória:",
    items: [
      {
        title: "Profissionais no início da trajetória",
        description:
          "Pessoas começando suas carreiras ou com primeiras experiências que buscam entender como o mercado funciona e onde concentrar energia.",
      },
      {
        title: "Interessados em tecnologia e marketing digital",
        description:
          "Profissionais que querem explorar oportunidades no ecossistema de Big Tech, adtech, marketing de crescimento ou funções de negócios.",
      },
      {
        title: "Em transição de carreira ou função",
        description:
          "Quem busca migrar de setor ou de especialidade e precisa traduzir sua bagagem anterior para uma nova área de atuação.",
      },
      {
        title: "Buscando clareza de posicionamento",
        description:
          "Profissionais experientes que sentem dificuldade em sintetizar o valor que entregam e definir prioridades claras para os próximos passos.",
      },
    ],
    pilotNote:
      "Importante: a participação na fase piloto é limitada e passará por uma análise de alinhamento e disponibilidade, garantindo que o programa gere valor real para os mentorados.",
  },
  interest: {
    headline: "Vamos conversar sobre seu próximo rumo?",
    copy:
      "Estou estruturando uma primeira fase de mentorias voluntárias para conhecer diferentes trajetórias, entender desafios reais de carreira e evoluir a metodologia. Se você acredita que essa iniciativa pode fazer sentido para você, deixe seu interesse.",
    primaryCta: "Tenho interesse",
    formUrl: null,
    modal: {
      title: "Primeira fase piloto de mentorias",
      badge: "Inscrições em estruturação",
      message:
        "O formulário detalhado de interesse está sendo preparado para a abertura oficial do piloto voluntário do Rumo Works. Essa etapa inicial terá vagas reduzidas para garantir uma mentoria próxima e focada.",
      statusNote:
        "Nenhum dado pessoal é coletado nesta versão. Acompanhe as novidades e visite o perfil no LinkedIn para atualizações sobre a abertura do formulário.",
      externalActionText: "Acessar formulário de interesse",
      closeText: "Voltar para a página",
    },
  },
  footer: {
    statement:
      "Iniciativa independente de mentoria e direcionamento de carreira. Clareza para escolher, estratégia para agir.",
    independentNotice:
      "Rumo Works é um projeto pessoal independente. Não possui afiliação oficial, patrocínio ou endosso de empresas ou plataformas de tecnologia.",
  },
};
