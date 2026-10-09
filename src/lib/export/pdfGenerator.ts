import { jsPDF } from 'jspdf';
import { CareerSourceData, CuratedCvData, SupportedLanguage } from '@/types';

export function generatePdfCv(
  data: CareerSourceData | CuratedCvData,
  targetCompany: string,
  targetRole: string,
  lang: SupportedLanguage = 'en'
): Buffer {
  const isCurated = 'curatedAccomplishments' in ((data as any).experiences?.[0] || {});
  
  const userName = 'name' in data ? (data as any).name : data.user.name;
  const userEmail = 'email' in data ? (data as any).email : data.user.email;
  const headline = 'headline' in data ? (data as any).headline : data.profile.headline;
  const summary = 'summary' in data ? (data as any).summary : data.profile.summary;
  const skills = 'skills' in data ? (data as any).skills : data.profile.skills;
  const experiences = data.experiences;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = 45;

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - margin) {
      doc.addPage();
      cursorY = 45;
    }
  };

  const sectionHeaders = {
    en: {
      summary: 'EXECUTIVE PROFILE',
      experience: 'PROFESSIONAL EXPERIENCE',
      scope: 'Leadership & Scope:',
      skills: 'CORE COMPETENCIES & DOMAIN RIGOR',
    },
    pt: {
      summary: 'PERFIL EXECUTIVO',
      experience: 'EXPERIÊNCIA PROFISSIONAL',
      scope: 'Liderança e Escopo:',
      skills: 'COMPETÊNCIAS E DOMÍNIO TÉCNICO',
    },
    es: {
      summary: 'PERFIL EJECUTIVO',
      experience: 'EXPERIENCIA PROFESIONAL',
      scope: 'Liderazgo y Alcance:',
      skills: 'COMPETENCIAS Y RIGOR DE DOMINIO',
    },
  }[lang];

  // Header: Full Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(17, 24, 39);
  doc.text(userName.toUpperCase(), pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 18;

  // Header: Subtitle & Contact
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(75, 85, 99);
  const headerContact = `${headline}  |  ${userEmail}`;
  const splitContact = doc.splitTextToSize(headerContact, contentWidth);
  doc.text(splitContact, pageWidth / 2, cursorY, { align: 'center' });
  cursorY += splitContact.length * 12 + 8;

  // Divider line
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(1);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 16;

  // Section Header Function
  const renderSectionHeader = (title: string) => {
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(124, 58, 237); // Brand Purple
    doc.text(title, margin, cursorY);
    cursorY += 4;
    doc.setDrawColor(124, 58, 237);
    doc.setLineWidth(0.75);
    doc.line(margin, cursorY, margin + 140, cursorY);
    cursorY += 14;
  };

  // Section: Executive Profile
  renderSectionHeader(sectionHeaders.summary);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(55, 65, 81);
  const summaryLines = doc.splitTextToSize(summary, contentWidth);
  checkPageBreak(summaryLines.length * 13 + 10);
  doc.text(summaryLines, margin, cursorY);
  cursorY += summaryLines.length * 13 + 14;

  // Section: Experience
  renderSectionHeader(sectionHeaders.experience);

  for (const exp of experiences) {
    checkPageBreak(50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text(exp.company, margin, cursorY);

    const companyWidth = doc.getTextWidth(exp.company);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);
    doc.text(` — ${exp.title}`, margin + companyWidth, cursorY);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(107, 114, 128);
    const dateText = `${exp.startDate} – ${exp.endDate || (exp.isCurrent ? 'Present' : '')}`;
    doc.text(dateText, pageWidth - margin, cursorY, { align: 'right' });
    cursorY += 14;

    if (exp.teamScope) {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      doc.text(`${sectionHeaders.scope} `, margin, cursorY);
      const scopeLabelWidth = doc.getTextWidth(`${sectionHeaders.scope} `);

      doc.setFont('helvetica', 'italic');
      const scopeLines = doc.splitTextToSize(exp.teamScope, contentWidth - scopeLabelWidth);
      doc.text(scopeLines, margin + scopeLabelWidth, cursorY);
      cursorY += scopeLines.length * 11 + 5;
    }

    // Bullets (curated or standard)
    const bullets = (exp as any).curatedAccomplishments || (exp as any).accomplishments || [];
    for (const acc of bullets) {
      let bulletText = `•  ${acc.text}`;
      if (acc.quantifiedMetric && !bulletText.includes(acc.quantifiedMetric)) {
        bulletText += ` [${acc.quantifiedMetric}]`;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(31, 41, 55);
      const bulletLines = doc.splitTextToSize(bulletText, contentWidth - 10);
      checkPageBreak(bulletLines.length * 12 + 4);
      doc.text(bulletLines, margin + 5, cursorY);
      cursorY += bulletLines.length * 12 + 4;
    }

    cursorY += 8;
  }

  // Section: Core Competencies
  if (skills && skills.length > 0) {
    renderSectionHeader(sectionHeaders.skills);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    const skillsText = skills.join('   •   ');
    const skillLines = doc.splitTextToSize(skillsText, contentWidth);
    checkPageBreak(skillLines.length * 12 + 10);
    doc.text(skillLines, margin, cursorY);
    cursorY += skillLines.length * 12 + 10;
  }

  const outputArrayBuffer = doc.output('arraybuffer');
  return Buffer.from(outputArrayBuffer);
}

export function formatCvFilename(
  userName: string,
  company: string,
  role: string,
  lang: SupportedLanguage,
  extension: 'pdf' | 'docx'
): string {
  const firstName = userName.trim().split(' ')[0].replace(/[^a-zA-Z0-9]/g, '') || 'Executive';
  const cleanCompany = (company || 'BigTech').trim().replace(/[^a-zA-Z0-9]/g, '');
  const cleanRole = (role || 'Role').trim().replace(/[^a-zA-Z0-9]/g, '');
  const langUpper = lang.toUpperCase();

  return `${firstName}_CV_${cleanCompany}_${cleanRole}_${langUpper}.${extension}`;
}
