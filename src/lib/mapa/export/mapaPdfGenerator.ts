import { jsPDF } from 'jspdf';
import { AssessmentResultData } from '../types';

interface PdfParticipantInfo {
  name: string;
  email?: string;
  createdAt?: string | Date;
}

const BRAND_COLORS = {
  charcoalDark: [26, 24, 22] as [number, number, number],
  charcoalMuted: [75, 85, 99] as [number, number, number],
  sageGreen: [46, 71, 59] as [number, number, number],
  sageLight: [240, 247, 243] as [number, number, number],
  borderWarm: [229, 226, 217] as [number, number, number],
  ivoryBg: [250, 248, 245] as [number, number, number],
  terracotta: [194, 65, 12] as [number, number, number],
  cobalt: [37, 99, 235] as [number, number, number],
};

function formatDatePtBr(dateInput?: string | Date): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const day = d.getDate().toString().padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} de ${month} de ${year}`;
}

/**
 * Utilitário de quebra de página automática com cabeçalho contínuo
 */
function createPdfBuilder(title: string, subtitle: string, participant: PdfParticipantInfo) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 44;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 44;
  let pageNumber = 1;

  const renderHeader = () => {
    // Faixa superior decorativa
    doc.setFillColor(...BRAND_COLORS.sageGreen);
    doc.rect(margin, 20, contentWidth, 3, 'F');

    // Identificação da Rumo Works
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND_COLORS.sageGreen);
    doc.text('RUMO WORKS  •  MAPA RUMO', margin, 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND_COLORS.charcoalMuted);
    const dateText = formatDatePtBr(participant.createdAt);
    doc.text(dateText, pageWidth - margin, 32, { align: 'right' });

    // Linha divisória sutil
    doc.setDrawColor(...BRAND_COLORS.borderWarm);
    doc.setLineWidth(0.5);
    doc.line(margin, 36, pageWidth - margin, 36);
  };

  const renderFooter = () => {
    const footerY = pageHeight - 24;
    doc.setDrawColor(...BRAND_COLORS.borderWarm);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...BRAND_COLORS.charcoalMuted);
    doc.text('Mapa Rumo — Ferramenta estruturada de autorreflexão profissional  •  www.rumoworkshub.com.br', margin, footerY);
    doc.text(`Página ${pageNumber}`, pageWidth - margin, footerY, { align: 'right' });
  };

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 44) {
      renderFooter();
      doc.addPage();
      pageNumber++;
      renderHeader();
      cursorY = 52;
    }
  };

  // Inicializar primeira página
  renderHeader();
  cursorY = 56;

  // Título e identificação do participante
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...BRAND_COLORS.charcoalDark);
  doc.text(title, margin, cursorY);
  cursorY += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...BRAND_COLORS.charcoalMuted);
  doc.text(subtitle, margin, cursorY);
  cursorY += 16;

  // Caixa de identificação do participante
  doc.setFillColor(...BRAND_COLORS.ivoryBg);
  doc.setDrawColor(...BRAND_COLORS.borderWarm);
  doc.roundedRect(margin, cursorY, contentWidth, 32, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...BRAND_COLORS.charcoalDark);
  doc.text(`Participante: ${participant.name}`, margin + 12, cursorY + 18);

  if (participant.email) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND_COLORS.charcoalMuted);
    doc.text(`E-mail: ${participant.email}`, pageWidth - margin - 12, cursorY + 18, { align: 'right' });
  }

  cursorY += 46;

  const forcePageBreak = () => {
    renderFooter();
    doc.addPage();
    pageNumber++;
    renderHeader();
    cursorY = 52;
  };

  return {
    doc,
    margin,
    contentWidth,
    pageWidth,
    pageHeight,
    getCursorY: () => cursorY,
    setCursorY: (y: number) => { cursorY = y; },
    addCursorY: (delta: number) => { cursorY += delta; },
    checkPageBreak,
    forcePageBreak,
    finish: () => {
      renderFooter();
      const arrayBuffer = doc.output('arraybuffer');
      return Buffer.from(arrayBuffer);
    },
  };
}

/**
 * GERAÇÃO DE PDF — PRÉVIA GRATUITA (DIAGNÓSTICO ESSENCIAL)
 */
export function generateMapaPreviewPdf(
  participant: PdfParticipantInfo,
  previewData: any
): Buffer {
  const builder = createPdfBuilder(
    'Mapa Rumo — Diagnóstico Essencial (Prévia)',
    'Síntese das 3 dimensões fundamentais de energia e rotina profissional',
    participant
  );

  const { doc, margin, contentWidth, checkPageBreak, addCursorY, getCursorY, setCursorY } = builder;

  // 1. Dimensões Analisadas na Prévia
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...BRAND_COLORS.charcoalDark);
  doc.text('1. Dimensões Analisadas na Prévia Gratuita', margin, getCursorY());
  addCursorY(16);

  const FREE_DIMS = [
    { key: 'motivacaoEnergia', label: 'Motivação e Energia' },
    { key: 'valoresLimites', label: 'Valores e Limites' },
    { key: 'ambienteEstrutura', label: 'Ambiente e Estrutura' },
  ];

  FREE_DIMS.forEach((dim) => {
    const scoreItem = previewData?.scores?.[dim.key] || { score: 70, level: 'estruturado', summary: '' };
    checkPageBreak(54);

    // Box da Dimensão
    const y = getCursorY();
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...BRAND_COLORS.borderWarm);
    doc.roundedRect(margin, y, contentWidth, 46, 3, 3, 'FD');

    // Nome e Score
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...BRAND_COLORS.charcoalDark);
    doc.text(dim.label, margin + 10, y + 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...BRAND_COLORS.sageGreen);
    doc.text(`${scoreItem.score}/100`, margin + contentWidth - 10, y + 16, { align: 'right' });

    // Barra de Progresso
    const barWidth = contentWidth - 20;
    const barHeight = 4.5;
    const barY = y + 22;
    doc.setFillColor(235, 233, 227);
    doc.roundedRect(margin + 10, barY, barWidth, barHeight, 2, 2, 'F');

    const fillWidth = Math.max(6, (scoreItem.score / 100) * barWidth);
    doc.setFillColor(...BRAND_COLORS.sageGreen);
    doc.roundedRect(margin + 10, barY, fillWidth, barHeight, 2, 2, 'F');

    // Resumo da Dimensão
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND_COLORS.charcoalMuted);
    const summaryLines = doc.splitTextToSize(scoreItem.summary || 'Avaliação preliminar estruturada.', barWidth);
    doc.text(summaryLines[0] || '', margin + 10, y + 38);

    addCursorY(52);
  });

  // 2. Primeiras Descobertas e Observações
  addCursorY(10);
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...BRAND_COLORS.charcoalDark);
  doc.text('2. Primeiras Descobertas do Seu Perfil', margin, getCursorY());
  addCursorY(16);

  const obsList = previewData?.initialObservations || [];
  obsList.slice(0, 3).forEach((obs: any, idx: number) => {
    checkPageBreak(56);
    const y = getCursorY();

    doc.setFillColor(...BRAND_COLORS.ivoryBg);
    doc.setDrawColor(...BRAND_COLORS.borderWarm);
    doc.roundedRect(margin, y, contentWidth, 48, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...BRAND_COLORS.charcoalDark);
    doc.text(`[Descoberta ${idx + 1}]  ${obs.title || 'Padrão Identificado'}`, margin + 10, y + 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND_COLORS.charcoalMuted);
    const textLines = doc.splitTextToSize(obs.text || obs.summary || '', contentWidth - 20);
    doc.text(textLines.slice(0, 2), margin + 10, y + 28);

    addCursorY(54);
  });

  // 3. Provocação Reflexiva e Próximo Passo
  addCursorY(10);
  checkPageBreak(65);
  const reflY = getCursorY();
  doc.setFillColor(...BRAND_COLORS.sageLight);
  doc.setDrawColor(...BRAND_COLORS.sageGreen);
  doc.roundedRect(margin, reflY, contentWidth, 54, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...BRAND_COLORS.sageGreen);
  doc.text('Pergunta Reflexiva para a sua Semana:', margin + 12, reflY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND_COLORS.charcoalDark);
  const qLines = doc.splitTextToSize(
    previewData?.deepReflectionQuestion ||
    'O que torna suas escolhas profissionais verdadeiramente sustentáveis hoje?',
    contentWidth - 24
  );
  doc.text(qLines.slice(0, 2), margin + 12, reflY + 30);
  addCursorY(64);

  // 4. Nota de Escopo e Relatório Completo
  checkPageBreak(50);
  const notaY = getCursorY();
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...BRAND_COLORS.borderWarm);
  doc.roundedRect(margin, notaY, contentWidth, 44, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND_COLORS.charcoalDark);
  doc.text('Nota de Escopo da Versão Gratuita:', margin + 10, notaY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...BRAND_COLORS.charcoalMuted);
  const escopoText =
    'Esta prévia contempla 3 das 8 dimensões. As dimensões de Clareza de Direção, Forças & Competências, Comunicação & Influência, Priorização & Execução e Aprendizagem & Adaptabilidade, juntamente com a Matriz de Fricções e o Plano de 30 Dias, são exclusivas do Relatório Completo.';
  const escopoLines = doc.splitTextToSize(escopoText, contentWidth - 20);
  doc.text(escopoLines.slice(0, 2), margin + 10, notaY + 27);

  return builder.finish();
}

/**
 * GERAÇÃO DE PDF — RELATÓRIO COMPLETO & PLANO DE 30 DIAS (8 DIMENSÕES)
 */
export function generateMapaCompletePdf(
  participant: PdfParticipantInfo,
  reportData: any
): Buffer {
  const builder = createPdfBuilder(
    'Mapa Rumo — Relatório Analítico Completo',
    'Diagnóstico profundo em 8 dimensões, matriz de fricções e plano pessoal de 30 dias',
    participant
  );

  const { doc, margin, contentWidth, checkPageBreak, forcePageBreak, addCursorY, getCursorY } = builder;

  // 1. As 8 Dimensões Integradas
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...BRAND_COLORS.charcoalDark);
  doc.text('1. Síntese das 8 Dimensões Integradas', margin, getCursorY());
  addCursorY(16);

  const ALL_DIMS = [
    { key: 'motivacaoEnergia', label: 'Motivação e Energia' },
    { key: 'clarezaDirecao', label: 'Clareza de Direção' },
    { key: 'forcasCompetencias', label: 'Forças e Competências' },
    { key: 'comunicacaoInfluencia', label: 'Comunicação e Influência' },
    { key: 'priorizacaoExecucao', label: 'Priorização e Execução' },
    { key: 'ambienteEstrutura', label: 'Ambiente e Estrutura' },
    { key: 'valoresLimites', label: 'Valores e Limites' },
    { key: 'aprendizagemAdaptabilidade', label: 'Aprendizagem e Adaptabilidade' },
  ];

  ALL_DIMS.forEach((dim) => {
    const scoreItem = reportData?.scores?.[dim.key] || { score: 75, level: 'estruturado', summary: '' };
    checkPageBreak(40);

    const y = getCursorY();
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...BRAND_COLORS.borderWarm);
    doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...BRAND_COLORS.charcoalDark);
    doc.text(dim.label, margin + 8, y + 14);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...BRAND_COLORS.sageGreen);
    doc.text(`${scoreItem.score}/100`, margin + contentWidth - 8, y + 14, { align: 'right' });

    // Barra de progresso compacta
    const barWidth = contentWidth - 16;
    const barY = y + 20;
    doc.setFillColor(235, 233, 227);
    doc.roundedRect(margin + 8, barY, barWidth, 4, 1.5, 1.5, 'F');

    const fillWidth = Math.max(6, (scoreItem.score / 100) * barWidth);
    doc.setFillColor(...BRAND_COLORS.sageGreen);
    doc.roundedRect(margin + 8, barY, fillWidth, 4, 1.5, 1.5, 'F');

    addCursorY(38);
  });

  // 2. Matriz de Fricções (Importância vs Satisfação)
  addCursorY(12);
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...BRAND_COLORS.charcoalDark);
  doc.text('2. Matriz de Fricções (Onde seus valores estão sob pressão)', margin, getCursorY());
  addCursorY(16);

  const gaps = reportData?.gaps || [];
  const criticalGaps = gaps.filter((g: any) => g.status === 'friccao_critica');
  const alignedGaps = gaps.filter((g: any) => g.status === 'alinhado');

  checkPageBreak(50);
  const gapBoxY = getCursorY();
  doc.setFillColor(...BRAND_COLORS.ivoryBg);
  doc.setDrawColor(...BRAND_COLORS.borderWarm);
  doc.roundedRect(margin, gapBoxY, contentWidth, 46, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND_COLORS.terracotta);
  doc.text(`Fricções Críticas (${criticalGaps.length}):`, margin + 10, gapBoxY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND_COLORS.charcoalDark);
  const critText = criticalGaps.map((g: any) => g.label).join('  •  ') || 'Nenhuma fricção crítica severa detectada.';
  doc.text(doc.splitTextToSize(critText, contentWidth - 20)[0] || '', margin + 10, gapBoxY + 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND_COLORS.sageGreen);
  doc.text(`Motivadores Nutridos (${alignedGaps.length}):`, margin + 10, gapBoxY + 38);
  const aligText = alignedGaps.slice(0, 4).map((g: any) => g.label).join('  •  ') || 'Equilíbrio global mantido.';
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BRAND_COLORS.charcoalMuted);
  doc.text(doc.splitTextToSize(aligText, contentWidth - 140)[0] || '', margin + 120, gapBoxY + 38);

  addCursorY(56);

  // 3. Prioridades Estratégicas
  addCursorY(10);
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...BRAND_COLORS.charcoalDark);
  doc.text('3. Três Prioridades para os Próximos Passos', margin, getCursorY());
  addCursorY(16);

  const priorities = reportData?.priorities || [];
  priorities.slice(0, 3).forEach((p: any, idx: number) => {
    checkPageBreak(46);
    const py = getCursorY();

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...BRAND_COLORS.borderWarm);
    doc.roundedRect(margin, py, contentWidth, 38, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...BRAND_COLORS.charcoalDark);
    doc.text(`Prioridade 0${idx + 1}:  ${p.title || 'Foco Estratégico'}`, margin + 8, py + 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND_COLORS.charcoalMuted);
    const pLines = doc.splitTextToSize(p.concreteAction || p.rationale || '', contentWidth - 16);
    doc.text(pLines[0] || '', margin + 8, py + 26);

    addCursorY(42);
  });

  // 4. Plano Pessoal de 30 Dias (Semanas 1 a 4) — Inicia limpo na Página 2
  forcePageBreak();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...BRAND_COLORS.charcoalDark);
  doc.text('4. Plano de Ação Estruturado de 30 Dias', margin, getCursorY());
  addCursorY(14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND_COLORS.charcoalMuted);
  doc.text('Quatro semanas de implementação progressiva para transformar diagnósticos em rotinas sustentáveis:', margin, getCursorY());
  addCursorY(16);

  const actionPlan = reportData?.actionPlan || [];
  const weeks = [1, 2, 3, 4];
  const weekThemes = [
    'Semana 01 — Diagnóstico e Mapeamento de Foco',
    'Semana 02 — Alinhamento de Fronteiras e Expectativas',
    'Semana 03 — Execução e Blocos de Trabalho Profundo',
    'Semana 04 — Consolidação e Sustentabilidade de Rotina',
  ];

  weeks.forEach((wk) => {
    const weekActions = actionPlan.filter((a: any) => a.week === wk);
    checkPageBreak(65);

    const wy = getCursorY();
    doc.setFillColor(...BRAND_COLORS.sageLight);
    doc.setDrawColor(...BRAND_COLORS.borderWarm);
    doc.roundedRect(margin, wy, contentWidth, 52, 4, 4, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...BRAND_COLORS.sageGreen);
    doc.text(weekThemes[wk - 1], margin + 10, wy + 16);

    const firstAction = weekActions[0] || { title: 'Implementar bloco de foco e alinhamento prático', deliverable: 'Registro de aprendizados da semana' };
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND_COLORS.charcoalDark);
    doc.text(`• ${firstAction.title}`, margin + 10, wy + 30);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...BRAND_COLORS.charcoalMuted);
    doc.text(`Evidência de sucesso: ${firstAction.deliverable || 'Execução prática e sustentável'}`, margin + 18, wy + 42);

    addCursorY(58);
  });

  // 5. Compromisso Pessoal e Próximos Passos
  addCursorY(10);
  checkPageBreak(70);
  const compY = getCursorY();
  doc.setFillColor(...BRAND_COLORS.ivoryBg);
  doc.setDrawColor(...BRAND_COLORS.borderWarm);
  doc.roundedRect(margin, compY, contentWidth, 60, 4, 4, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...BRAND_COLORS.sageGreen);
  doc.text('5. Compromisso de Desenvolvimento Profissional', margin + 12, compY + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND_COLORS.charcoalDark);
  const compText =
    reportData?.personalCommitment ||
    'Construir um ritmo profissional onde excelência de entrega, clareza estratégica e preservação de energia coexistam em equilíbrio sustentável ao longo de todo o ciclo.';
  const compLines = doc.splitTextToSize(compText, contentWidth - 24);
  doc.text(compLines.slice(0, 2), margin + 12, compY + 34);

  return builder.finish();
}
