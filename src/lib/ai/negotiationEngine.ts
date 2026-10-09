export interface CompBenchmark {
  market: string;
  level: string;
  currency: string;
  baseMin: number;
  baseMid: number;
  baseMax: number;
  equityMin: number;
  equityMid: number;
  equityMax: number;
  signOnTypical: number;
  bonusPercent: number;
}

export const COMP_BENCHMARKS: Record<string, Record<string, CompBenchmark>> = {
  US: {
    L4: { market: 'US', level: 'L4', currency: 'USD', baseMin: 140000, baseMid: 160000, baseMax: 180000, equityMin: 35000, equityMid: 55000, equityMax: 75000, signOnTypical: 15000, bonusPercent: 10 },
    L5: { market: 'US', level: 'L5', currency: 'USD', baseMin: 180000, baseMid: 210000, baseMax: 240000, equityMin: 80000, equityMid: 120000, equityMax: 160000, signOnTypical: 25000, bonusPercent: 15 },
    L6: { market: 'US', level: 'L6', currency: 'USD', baseMin: 225000, baseMid: 265000, baseMax: 310000, equityMin: 160000, equityMid: 230000, equityMax: 320000, signOnTypical: 50000, bonusPercent: 20 },
    L7: { market: 'US', level: 'L7', currency: 'USD', baseMin: 280000, baseMid: 340000, baseMax: 410000, equityMin: 320000, equityMid: 480000, equityMax: 680000, signOnTypical: 100000, bonusPercent: 25 },
  },
  LATAM: {
    L4: { market: 'LATAM', level: 'L4', currency: 'USD', baseMin: 45000, baseMid: 60000, baseMax: 75000, equityMin: 10000, equityMid: 18000, equityMax: 25000, signOnTypical: 5000, bonusPercent: 10 },
    L5: { market: 'LATAM', level: 'L5', currency: 'USD', baseMin: 70000, baseMid: 95000, baseMax: 120000, equityMin: 25000, equityMid: 40000, equityMax: 65000, signOnTypical: 10000, bonusPercent: 12 },
    L6: { market: 'LATAM', level: 'L6', currency: 'USD', baseMin: 110000, baseMid: 145000, baseMax: 180000, equityMin: 50000, equityMid: 85000, equityMax: 130000, signOnTypical: 20000, bonusPercent: 15 },
    L7: { market: 'LATAM', level: 'L7', currency: 'USD', baseMin: 160000, baseMid: 210000, baseMax: 260000, equityMin: 100000, equityMid: 160000, equityMax: 240000, signOnTypical: 35000, bonusPercent: 20 },
  },
  Europe: {
    L4: { market: 'Europe', level: 'L4', currency: 'EUR', baseMin: 70000, baseMid: 85000, baseMax: 100000, equityMin: 20000, equityMid: 35000, equityMax: 50000, signOnTypical: 10000, bonusPercent: 10 },
    L5: { market: 'Europe', level: 'L5', currency: 'USD', baseMin: 110000, baseMid: 135000, baseMax: 160000, equityMin: 50000, equityMid: 75000, equityMax: 110000, signOnTypical: 18000, bonusPercent: 15 },
    L6: { market: 'Europe', level: 'L6', currency: 'EUR', baseMin: 150000, baseMid: 185000, baseMax: 220000, equityMin: 100000, equityMid: 150000, equityMax: 210000, signOnTypical: 30000, bonusPercent: 18 },
    L7: { market: 'Europe', level: 'L7', currency: 'EUR', baseMin: 200000, baseMid: 250000, baseMax: 310000, equityMin: 180000, equityMid: 270000, equityMax: 390000, signOnTypical: 60000, bonusPercent: 20 },
  },
};

export interface CounterOfferSimulationResult {
  recruiterResponseText: string;
  revisedOffer: {
    base: number;
    equity: number;
    signOn: number;
    bonus: number;
    totalComp: number;
  };
  deltaGained: {
    annualIncrease: number;
    year1TotalIncrease: number;
    percentIncrease: number;
  };
  scripts: {
    emailSubject: string;
    emailBody: string;
    phoneTalkingPoints: string[];
  };
}

export function simulateCounterOffer(
  company: string,
  roleTitle: string,
  market: string = 'US',
  level: string = 'L6',
  currentOffer: {
    base: number;
    equity: number;
    signOn: number;
    bonus: number;
  },
  strategy: 'competing_offer' | 'unvested_cliff' | 'level_elevation' | 'accelerated_review',
  candidateNotes: string = '',
  language: string = 'en'
): CounterOfferSimulationResult {
  const benchmarks = COMP_BENCHMARKS[market]?.[level] || COMP_BENCHMARKS.US.L6;
  const initialTotalComp = currentOffer.base + currentOffer.equity + currentOffer.signOn + currentOffer.bonus;

  let revisedBase = currentOffer.base;
  let revisedEquity = currentOffer.equity;
  let revisedSignOn = currentOffer.signOn;

  // Realistic negotiation adjustments
  if (strategy === 'competing_offer') {
    // Competitor leverage allows equity boost (+15-20%) and sign-on boost (+50-100%)
    revisedEquity = Math.min(benchmarks.equityMax, Math.round(currentOffer.equity * 1.18));
    revisedSignOn = Math.max(currentOffer.signOn + benchmarks.signOnTypical * 0.6, Math.round(currentOffer.signOn * 1.6));
    revisedBase = Math.min(benchmarks.baseMax, Math.round(currentOffer.base * 1.05));
  } else if (strategy === 'unvested_cliff') {
    // Unvested cliff directly targets sign-on bonus as the primary bridge tool
    revisedSignOn = Math.round(currentOffer.signOn + benchmarks.signOnTypical * 0.85);
    revisedEquity = Math.min(benchmarks.equityMax, Math.round(currentOffer.equity * 1.12));
  } else if (strategy === 'level_elevation') {
    // Higher leveling band unlocks base ceiling (+10%) and higher equity grant (+25%)
    revisedBase = Math.min(benchmarks.baseMax, Math.round(currentOffer.base * 1.08));
    revisedEquity = Math.min(benchmarks.equityMax, Math.round(currentOffer.equity * 1.22));
    revisedSignOn = Math.round(currentOffer.signOn * 1.25);
  } else {
    // Accelerated review
    revisedEquity = Math.min(benchmarks.equityMax, Math.round(currentOffer.equity * 1.15));
    revisedSignOn = Math.round(currentOffer.signOn * 1.3);
  }

  const revisedBonus = Math.round(revisedBase * (benchmarks.bonusPercent / 100));
  const revisedTotalComp = revisedBase + revisedEquity + revisedSignOn + revisedBonus;
  const year1TotalIncrease = Math.max(0, revisedTotalComp - initialTotalComp);
  const annualIncrease = (revisedBase - currentOffer.base) + (revisedEquity - currentOffer.equity);
  const percentIncrease = Math.round((year1TotalIncrease / initialTotalComp) * 100);

  const currencySymbol = benchmarks.currency === 'USD' ? '$' : '€';

  let recruiterResponseText = '';
  let emailSubject = '';
  let emailBody = '';
  let phoneTalkingPoints: string[] = [];

  if (language === 'pt') {
    emailSubject = `Agradecimento pela proposta e alinhamento de detalhes | ${roleTitle} (${company})`;
    
    if (strategy === 'competing_offer') {
      recruiterResponseText = `O comitê de remuneração analisou seu histórico e a oferta concorrente que você mencionou. Embora o nosso salário base esteja próximo do teto da faixa para ${level}, conseguimos aprovação executiva para elevar as ações (RSUs) para ${currencySymbol}${revisedEquity.toLocaleString()} anuais e aumentar o bônus de entrada (sign-on) para ${currencySymbol}${revisedSignOn.toLocaleString()}.`;
      emailBody = `Prezada equipe,\n\nMuito obrigada pela proposta para a cadeira de ${roleTitle} na ${company}. Estou verdadeiramente entusiasmada com o escopo e o impacto que podemos construir juntos.\n\nComo comentei de forma transparente, estou em fase final com outra oportunidade cujo pacote total está mais elevado, principalmente no componente de equity. Gostaria muito de fechar com a ${company} como minha prioridade número um. Se conseguirmos aproximar o valor anual de ações e ajustar o sign-on para amenizar essa diferença, estou pronta para assinar imediatamente.\n\nFico à disposição para uma breve conversa telefônica.\n\nAtenciosamente,\nAmanda Sandoval`;
      phoneTalkingPoints = [
        'Reitere que a empresa é sua prioridade e primeira escolha.',
        'Seja transparente e firme sobre a paridade de valor com a outra oportunidade.',
        'Proponha assinar no mesmo dia caso alcancem o alinhamento de equity e sign-on.'
      ];
    } else if (strategy === 'unvested_cliff') {
      recruiterResponseText = `Compreendemos perfeitamente o valor de equity não resgatado que você deixaria na mesa ao fazer a transição agora. Como o sign-on não impacta a estrutura de faixas dos outros membros do time, conseguimos aumentar o sign-on para ${currencySymbol}${revisedSignOn.toLocaleString()} para cobrir essa transição com segurança.`;
      emailBody = `Prezada equipe,\n\nAgradeço imensamente a oferta para ${roleTitle}. Estou muito animada com o desafio.\n\nAo calcular o custo de transição da minha posição atual, tenho um cliff significativo de ações a vencer nos próximos meses que deixarei para trás. Para que essa mudança faça sentido financeiro imediato sem comprometer meu patrimônio, gostaria de solicitar um ajuste no bônus de contratação (sign-on) para suprir essa lacuna.\n\nPodemos falar brevemente hoje para bater o martelo?\n\nUm abraço,\nAmanda Sandoval`;
      phoneTalkingPoints = [
        'Foque o argumento no custo de oportunidade do equity deixado para trás.',
        'Mostre que o sign-on é um pagamento único que não onera o orçamento contínuo da empresa.',
        'Demonstre compromisso com os resultados já no primeiro trimestre.'
      ];
    } else {
      recruiterResponseText = `Alinhamos com o VP e o comitê de contratação. O feedback das suas entrevistas foi muito consistente, o que nos permitiu esticar a proposta para o quartil superior de ${level}, elevando o base para ${currencySymbol}${revisedBase.toLocaleString()} e o pacote de ações para ${currencySymbol}${revisedEquity.toLocaleString()}.`;
      emailBody = `Prezada equipe,\n\nObrigada pela oferta para ${roleTitle}. O processo reforçou meu entusiasmo em liderar essa agenda na ${company}.\n\nConsiderando a amplitude de escopo discutida nas entrevistas e os benchmarks de mercado para profissionais com entregas comprovadas nesse patamar, gostaria de calibrar a remuneração no quartil superior da faixa (${currencySymbol}${revisedBase.toLocaleString()} de base e ${currencySymbol}${revisedEquity.toLocaleString()} em equity).\n\nCom esse alinhamento, terei total segurança para oficializar meu aceite.\n\nAtenciosamente,\nAmanda Sandoval`;
      phoneTalkingPoints = [
        'Ancore seu pedido no nível de impacto e complexidade esperado para a posição.',
        'Cite os dados de mercado e a consistência das suas avaliações na banca.',
        'Mantenha um tom parceiro e orientado a soluções.'
      ];
    }
  } else if (language === 'es') {
    emailSubject = `Agradecimiento y propuesta de alineación económica | ${roleTitle} (${company})`;

    if (strategy === 'competing_offer') {
      recruiterResponseText = `El comité de compensación revisó tu caso y la oferta competidora que compartiste. Aunque el salario base se encuentra en el límite de la banda interna de ${level}, obtuvimos aprobación de la dirección para elevar las acciones anuales a ${currencySymbol}${revisedEquity.toLocaleString()} e incrementar el bono de bienvenida a ${currencySymbol}${revisedSignOn.toLocaleString()}.`;
      emailBody = `Estimado equipo,\n\nMuchas gracias por la oferta para la posición de ${roleTitle} en ${company}. Me entusiasma enormemente el impacto que el equipo puede generar.\n\nComo mencioné con total transparencia, me encuentro evaluando una oferta paralela con una valoración de compensación superior, especialmente en el componente de equity. ${company} sigue siendo mi primera preferencia. Si logramos acercar el valor anual de acciones y ajustar el bono de entrada para compensar esa diferencia, estoy lista para firmar de inmediato.\n\nQuedo a su disposición para conversar hoy mismo.\n\nAtentamente,\nAmanda Sandoval`;
      phoneTalkingPoints = [
        'Enfatiza que la empresa es tu opción número uno.',
        'Explica con claridad el valor de la oferta alternativa sin sonar confrontativo.',
        'Ofrece firmar formalmente en cuanto se confirme el ajuste en equity y sign-on.'
      ];
    } else {
      recruiterResponseText = `Revisamos la propuesta con el VP de contratación. Tomando en cuenta tu trayectoria y la solidez de tus entrevistas, ajustamos el paquete a la parte alta de la banda: salario base de ${currencySymbol}${revisedBase.toLocaleString()} y ${currencySymbol}${revisedEquity.toLocaleString()} anuales en RSUs.`;
      emailBody = `Estimado equipo,\n\nMuchas gracias por la propuesta para ${roleTitle}. Estoy muy motivada por sumarme al equipo.\n\nTomando en cuenta la amplitud estratégica discutida en las entrevistas y los benchmarks del mercado para este rol, quisiera consultar si es posible ubicar la oferta en el cuartil superior de la banda (${currencySymbol}${revisedBase.toLocaleString()} base y ${currencySymbol}${revisedEquity.toLocaleString()} en equity).\n\nCon este acuerdo, formalizaré mi incorporación con total entusiasmo.\n\nSaludos cordiales,\nAmanda Sandoval`;
      phoneTalkingPoints = [
        'Vincula la solicitud al alcance y autonomía requeridos para el puesto.',
        'Haz referencia a las métricas concretas y resultados demostrados en tu trayectoria.',
        'Mantén una actitud ejecutiva y colaborativa.'
      ];
    }
  } else {
    emailSubject = `Gratitude for the offer & aligning on compensation terms | ${roleTitle} (${company})`;

    if (strategy === 'competing_offer') {
      recruiterResponseText = `Our compensation committee reviewed your candidate dossier and the competing offer details. While our base salary is at the band ceiling for ${level}, we received executive approval to bump your annual RSU grant to ${currencySymbol}${revisedEquity.toLocaleString()}/yr and increase your sign-on bonus to ${currencySymbol}${revisedSignOn.toLocaleString()}.`;
      emailBody = `Hi team,\n\nThank you so much for extending the offer for the ${roleTitle} position at ${company}. I am deeply impressed by the team and the ambitious roadmap ahead.\n\nAs I mentioned transparently, I am evaluating another active offer with higher total compensation, specifically weighted towards equity. However, ${company} remains my clear first choice. If we can bridge the gap by adjusting the annual equity grant and augmenting the sign-on bonus, I am ready to sign the offer immediately.\n\nI would be delighted to hop on a quick call today to finalize details.\n\nWarm regards,\nAmanda Sandoval`;
      phoneTalkingPoints = [
        'Reiterate that this company is your top choice and primary destination.',
        'Present the competing leverage objectively without playing games.',
        'Offer to sign immediately if the target equity and sign-on numbers are approved.'
      ];
    } else {
      recruiterResponseText = `We met with the Hiring VP and confirmed that your interview loop performance was outstanding. We have adjusted your package into the top quartile of the ${level} band: ${currencySymbol}${revisedBase.toLocaleString()} base salary, ${currencySymbol}${revisedEquity.toLocaleString()} in annual equity, and a ${currencySymbol}${revisedSignOn.toLocaleString()} sign-on.`;
      emailBody = `Hi team,\n\nThank you for putting together the offer for ${roleTitle} at ${company}. I am very excited about the opportunity to partner with the team.\n\nGiven the strategic scope outlined during our discussions and prevailing tier-1 market benchmarks, I would like to request that we position the package at the top quartile of the band (${currencySymbol}${revisedBase.toLocaleString()} base and ${currencySymbol}${revisedEquity.toLocaleString()} equity).\n\nWith this alignment in place, I will be thrilled to accept and commit my full focus to our launch milestones.\n\nSincerely,\nAmanda Sandoval`;
      phoneTalkingPoints = [
        'Ground the counter in the scope of ownership and business impact discussed in loops.',
        'Cite market percentiles and hiring committee feedback.',
        'Show enthusiasm and clarity of intent to join and deliver value.'
      ];
    }
  }

  return {
    recruiterResponseText,
    revisedOffer: {
      base: revisedBase,
      equity: revisedEquity,
      signOn: revisedSignOn,
      bonus: revisedBonus,
      totalComp: revisedTotalComp,
    },
    deltaGained: {
      annualIncrease,
      year1TotalIncrease,
      percentIncrease,
    },
    scripts: {
      emailSubject,
      emailBody,
      phoneTalkingPoints,
    },
  };
}
