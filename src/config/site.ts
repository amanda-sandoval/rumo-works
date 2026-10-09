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
  tagline: "Iniciativa Voluntária de Mentoria e Desenvolvimento Profissional",
  title: "Rumo Works | Mentoria Voluntária e Desenvolvimento Profissional",
  description:
    "Iniciativa voluntária e independente de mentoria voltada ao desenvolvimento profissional geral: autoconhecimento, liderança, comunicação, organização e tomada de decisão.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://rumo-works.vercel.app",
  language: "pt-BR",
  brand: {
    rumoMeaning: "autoconhecimento, clareza de direção e propósito profissional",
    worksMeaning: "ação prática, desenvolvimento de competências e evolução contínua",
  },
  navigation: [
    { label: "Desafios", href: "#desafios" },
    { label: "Metodologia", href: "#metodologia" },
    { label: "Sobre a Amanda", href: "#sobre" },
    { label: "Para quem é", href: "#para-quem" },
  ],
  hero: {
    headline: "Clareza de direção e evolução prática para a sua trajetória profissional.",
    supportingCopy:
      "Uma iniciativa voluntária e independente dedicada a apoiar profissionais em momentos de reflexão e crescimento, com foco em autoconhecimento, postura profissional, comunicação e estratégia de desenvolvimento.",
    primaryCta: "Tenho interesse",
    secondaryCta: "Conheça a metodologia",
  },
  challenges: {
    headline: "O desenvolvimento profissional começa com clareza e intencionalidade.",
    intro:
      "Crescer profissionalmente exige mais do que apenas responder às demandas diárias. Uma trajetória sólida e sustentável se constrói quando você desenvolve autoconsciência sobre suas forças, alinha objetivos e transforma reflexões em hábitos práticos.",
    items: [
      {
        id: "autoconhecimento",
        title: "Autoconhecimento e clareza de direção",
        description:
          "Dificuldade em identificar pontos fortes, valores essenciais e priorizar o foco certo para os próximos ciclos da vida profissional.",
        highlight: "Consciência profissional",
      },
      {
        id: "comunicacao",
        title: "Comunicação e relacionamento interpessoal",
        description:
          "Desafios em expressar ideias com segurança, dialogar de forma construtiva em equipe, praticar escuta ativa e lidar com feedbacks.",
        highlight: "Habilidades interpessoais",
      },
      {
        id: "organizacao",
        title: "Organização, foco e tomada de decisão",
        description:
          "Sobrecarga com a rotina e dificuldade em transformar objetivos abstratos em prioridades claras, rotinas produtivas e decisões conscientes.",
        highlight: "Gestão e consistência",
      },
    ],
  },
  methodology: {
    headline: "Uma abordagem estruturada para o seu desenvolvimento.",
    subheadline:
      "Um método em quatro etapas reflexivas desenhado para transformar desafios cotidianos em um plano prático de evolução contínua.",
    pilotNotice:
      "Iniciativa voluntária e gratuita, conduzida em conversas individuais (1:1) com foco em escuta atenta, ética e desenvolvimento humano.",
    stages: [
      {
        step: "01",
        title: "Diagnóstico e Autoconhecimento",
        description:
          "Mapeamento reflexivo do seu histórico profissional, competências consolidadas, valores, áreas de interesse e objetivos de vida.",
        details: [
          "Mapeamento de competências e pontos fortes",
          "Identificação de desafios atuais no trabalho",
          "Alinhamento de valores e expectativas de carreira",
        ],
      },
      {
        step: "02",
        title: "Comunicação e Postura",
        description:
          "Aprimoramento da presença profissional, clareza na transmissão de perspectivas, escuta ativa e segurança na troca com equipes e lideranças.",
        details: [
          "Expressão clara e segura de ideias",
          "Colaboração eficaz e relacionamento interpessoal",
          "Postura profissional e maturidade em conversas difíceis",
        ],
      },
      {
        step: "03",
        title: "Priorização e Decisão",
        description:
          "Estruturação de critérios para tomada consciente de decisões, organização da rotina, gestão de limites e foco no que gera impacto real.",
        details: [
          "Gestão do tempo e organização do dia a dia",
          "Critérios para tomada de decisão responsável",
          "Prevenção de sobrecarga e equilíbrio sustentável",
        ],
      },
      {
        step: "04",
        title: "Plano de Desenvolvimento",
        description:
          "Construção de um roteiro individual de desenvolvimento pessoal com metas realizáveis, hábitos de aprendizagem contínua e acompanhamento prático.",
        details: [
          "Definição de metas claras de curto e médio prazo",
          "Hábitos de desenvolvimento pessoal contínuo",
          "Roteiro prático para sustentabilidade profissional",
        ],
      },
    ],
  },
  mentor: {
    greeting: "Prazer, sou a Amanda Sandoval.",
    name: "Amanda Sandoval",
    portraitPath: "/images/amanda-sandoval.png",
    bioParagraphs: [
      "Com mais de 10 anos de experiência profissional atuando em ambientes corporativos dinâmicos, minha trajetória é marcada pelo desenvolvimento de pessoas, liderança de projetos colaborativos e condução de iniciativas focadas em impacto e resolução de problemas.",
      "Sou graduada em Marketing pela Universidade de São Paulo (USP) com formação complementar em marketing digital pela University of California (UCLA).",
      "Acredito que o desenvolvimento profissional ganha força quando as pessoas compreendem com nitidez suas competências, comunicam suas ideias com autenticidade e constroem planos de ação estruturados para evoluir com sustentabilidade.",
    ],
    linkedInUrl: "https://www.linkedin.com/in/amandasandoval/",
  },
  targetAudience: {
    headline: "Um passo mais consciente para o seu desenvolvimento.",
    intro:
      "A mentoria voluntária foi pensada para profissionais que buscam intencionalidade, método e autoconhecimento em sua trajetória:",
    items: [
      {
        title: "Profissionais no início da trajetória",
        description:
          "Pessoas começando suas carreiras ou em primeiros anos de atuação que buscam desenvolver maturidade profissional, postura e compreensão do ambiente corporativo.",
      },
      {
        title: "Profissionais em momento de reflexão ou transição",
        description:
          "Quem deseja reavaliar prioridades, compreender habilidades transferíveis e planejar novos ciclos profissionais de forma consciente e estruturada.",
      },
      {
        title: "Desenvolvimento de comunicação e liderança",
        description:
          "Profissionais que buscam fortalecer sua comunicação interpessoal, escuta ativa, colaboração em equipe e capacidade de liderar iniciativas.",
      },
      {
        title: "Organização, priorização e tomada de decisão",
        description:
          "Pessoas que sentem sobrecarga no dia a dia e desejam aprimorar a gestão do tempo, organização pessoal e consistência na rotina profissional.",
      },
    ],
    pilotNote:
      "Aviso de alinhamento: A iniciativa é 100% voluntária, gratuita e sem fins comerciais. As sessões acontecem em formato 1:1, respeitando disponibilidade e alinhamento de objetivos mútuos.",
  },
  interest: {
    headline: "Vamos conversar sobre seu próximo rumo?",
    copy:
      "O Rumo Works é uma iniciativa voluntária dedicada a oferecer um espaço acolhedor e estruturado de reflexão para profissionais comprometidos com sua evolução contínua. Deixe seu interesse para participar das sessões.",
    primaryCta: "Tenho interesse",
    formUrl: "https://forms.gle/PfPafWM4pJMSH7E26",
    modal: {
      title: "Mentoria Voluntária de Carreira",
      badge: "Iniciativa Voluntária e Gratuita",
      message:
        "As sessões do Rumo Works são 100% voluntárias e focadas em desenvolvimento profissional geral, autoconhecimento e liderança. Preencha o formulário para registrar seu interesse e entendermos seu momento profissional.",
      statusNote:
        "O preenchimento leva aproximadamente 5 minutos. Seus dados são confidenciais e utilizados exclusivamente para contato e avaliação das sessões.",
      externalActionText: "Acessar formulário de interesse",
      closeText: "Voltar para a página",
    },
  },
  footer: {
    statement:
      "Iniciativa voluntária e independente dedicada ao desenvolvimento profissional geral, autoconhecimento e liderança.",
    independentNotice:
      "Rumo Works é uma iniciativa estritamente pessoal e voluntária. Não possui afiliação oficial, vínculo institucional, comercial, patrocínio ou endosso corporativo de empregadores passados ou presentes.",
  },
};
