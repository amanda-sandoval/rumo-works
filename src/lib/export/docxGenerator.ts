import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, BorderStyle } from 'docx';
import { CareerSourceData, CuratedCvData, SupportedLanguage } from '@/types';

export async function generateDocxCv(
  data: CareerSourceData | CuratedCvData,
  targetCompany: string,
  targetRole: string,
  lang: SupportedLanguage = 'en'
): Promise<Buffer> {
  const userName = 'name' in data ? (data as any).name : data.user.name;
  const userEmail = 'email' in data ? (data as any).email : data.user.email;
  const headline = 'headline' in data ? (data as any).headline : data.profile.headline;
  const summary = 'summary' in data ? (data as any).summary : data.profile.summary;
  const skills = 'skills' in data ? (data as any).skills : data.profile.skills;
  const experiences = data.experiences;

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

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children: [
          // Header: Name
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: userName.toUpperCase(),
                bold: true,
                size: 32,
                font: 'Arial',
                color: '111827',
              }),
            ],
          }),

          // Header: Professional Headline & Target
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: `${headline}  |  ${userEmail}`,
                size: 20,
                font: 'Arial',
                color: '4B5563',
              }),
            ],
          }),

          // Horizontal rule / separator
          new Paragraph({
            spacing: { after: 200 },
            border: {
              bottom: {
                color: '9CA3AF',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            },
          }),

          // Section: Executive Profile
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 150, after: 100 },
            children: [
              new TextRun({
                text: sectionHeaders.summary,
                bold: true,
                size: 22,
                font: 'Arial',
                color: '7C3AED',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 250 },
            children: [
              new TextRun({
                text: summary,
                size: 20,
                font: 'Arial',
                color: '374151',
              }),
            ],
          }),

          // Section: Experience
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: sectionHeaders.experience,
                bold: true,
                size: 22,
                font: 'Arial',
                color: '7C3AED',
              }),
            ],
          }),

          // Experience entries
          ...experiences.flatMap((exp) => {
            const bullets = (exp as any).curatedAccomplishments || (exp as any).accomplishments || [];
            return [
              new Paragraph({
                spacing: { before: 140, after: 60 },
                children: [
                  new TextRun({
                    text: `${exp.company}`,
                    bold: true,
                    size: 22,
                    font: 'Arial',
                    color: '111827',
                  }),
                  new TextRun({
                    text: ` — ${exp.title}`,
                    bold: true,
                    size: 20,
                    font: 'Arial',
                    color: '1F2937',
                  }),
                  new TextRun({
                    text: `  |  ${exp.startDate} – ${exp.endDate || (exp.isCurrent ? 'Present' : '')}`,
                    italics: true,
                    size: 19,
                    font: 'Arial',
                    color: '6B7280',
                  }),
                ],
              }),
              ...(exp.teamScope
                ? [
                    new Paragraph({
                      spacing: { after: 80 },
                      children: [
                        new TextRun({
                          text: `${sectionHeaders.scope} `,
                          bold: true,
                          size: 18,
                          font: 'Arial',
                          color: '4B5563',
                        }),
                        new TextRun({
                          text: exp.teamScope,
                          size: 18,
                          font: 'Arial',
                          italics: true,
                          color: '4B5563',
                        }),
                      ],
                    }),
                  ]
                : []),
              ...bullets.map(
                (acc: any) =>
                  new Paragraph({
                    bullet: { level: 0 },
                    spacing: { before: 40, after: 60 },
                    children: [
                      new TextRun({
                        text: acc.text,
                        size: 20,
                        font: 'Arial',
                        color: '1F2937',
                      }),
                      ...(acc.quantifiedMetric && !acc.text.includes(acc.quantifiedMetric)
                        ? [
                            new TextRun({
                              text: ` [${acc.quantifiedMetric}]`,
                              bold: true,
                              size: 19,
                              font: 'Arial',
                              color: '7C3AED',
                            }),
                          ]
                        : []),
                    ],
                  })
              ),
            ];
          }),

          // Section: Skills / Competencies
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({
                text: sectionHeaders.skills,
                bold: true,
                size: 22,
                font: 'Arial',
                color: '7C3AED',
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: (skills || []).join('  •  '),
                size: 20,
                font: 'Arial',
                color: '374151',
              }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
