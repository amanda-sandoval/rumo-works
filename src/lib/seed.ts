import { prisma } from './db';

export async function getOrCreateDefaultUser() {
  const email = 'amanda@careerlab.ai';
  let user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
      experiences: {
        include: { accomplishments: true },
        orderBy: { orderIndex: 'asc' },
      },
      jobTargets: {
        include: { matchAnalyses: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: 'Amanda Sandoval',
        passwordHash: 'demo_password_hash',
        defaultLanguage: 'en',
        profile: {
          create: {
            headline: 'Staff Product Manager & Tech Executive | Enterprise AI & Scaled Systems',
            summary:
              'Product leader with 10+ years scaling high-throughput enterprise platforms, distributed cloud services, and AI/ML developer infrastructure. Proven track record driving 0-to-1 bets into $50M+ ARR businesses while leading high-caliber engineering and product teams across US, LATAM, and global markets.',
            targetLevel: 'L6 / Staff / Principal Product Manager',
            targetMarkets: 'US, LATAM, Europe',
            skills: JSON.stringify([
              'Strategic Product Roadmapping',
              'Distributed Systems & APIs',
              'Enterprise SaaS & Monetization',
              'Cross-Functional Executive Influence',
              'AI/ML Infrastructure',
              'P&L / Growth Ownership',
              'Team Mentorship & High-Scale Hiring',
            ]),
          },
        },
        experiences: {
          create: [
            {
              company: 'CloudScale Technologies',
              title: 'Director of Product & Principal Platform Architect',
              location: 'San Francisco, CA / Hybrid',
              startDate: '2021-06',
              endDate: 'Present',
              isCurrent: true,
              teamScope: 'Directly led 4 Senior PMs, 16 Staff/Senior Engineers, and managed $12M annual R&D cloud spend.',
              orderIndex: 0,
              accomplishments: {
                create: [
                  {
                    text: 'Architected and launched next-gen Enterprise Data Mesh platform serving 450+ Fortune 500 organizations.',
                    businessProblem: 'Legacy data ingestion was hitting severe throttling, causing 14-hour pipeline delays for enterprise tenants.',
                    actionTaken: 'Spearheaded end-to-end technical restructuring, defining multi-region partitioning and unified governance APIs.',
                    quantifiedMetric: '+310% tenant throughput, reduced p99 query latency by 44%, generated $14.2M new ARR in first year',
                    competencies: 'High-Scale Architecture, Revenue Growth, Executive Ownership',
                    orderIndex: 0,
                  },
                  {
                    text: 'Spearheaded company-wide developer velocity transformation across 120+ microservices.',
                    businessProblem: 'Deployment cycles averaged 9 days with an unstable CI/CD failure rate exceeding 22%.',
                    actionTaken: 'Devised standardized deployment matrix, automated canary rollouts, and established developer self-service portals.',
                    quantifiedMetric: 'Deployment frequency improved 6x (from weekly to multiple daily), lowering change failure rate from 22% to 1.8%',
                    competencies: 'Developer Productivity, Operational Rigor, Engineering Leadership',
                    orderIndex: 1,
                  },
                  {
                    text: 'Negotiated multi-year strategic cloud and compute contracts with AWS and GCP executives.',
                    businessProblem: 'Unbounded compute consumption was eroding gross margins down to 54%.',
                    actionTaken: 'Executed workload right-sizing, reserved instances governance, and predictive auto-scaling algorithms.',
                    quantifiedMetric: 'Saved $3.6M annually in cloud infrastructure overhead while boosting gross margin to 71%',
                    competencies: 'P&L Optimization, Vendor Negotiation, Executive Influence',
                    orderIndex: 2,
                  },
                ],
              },
            },
            {
              company: 'FintechGlobal Innovations',
              title: 'Senior Product Manager — Core Payment Infrastructure',
              location: 'São Paulo & Remote',
              startDate: '2018-02',
              endDate: '2021-05',
              isCurrent: false,
              teamScope: 'Led cross-functional team of 9 backend engineers, 2 data scientists, and 1 compliance counsel.',
              orderIndex: 1,
              accomplishments: {
                create: [
                  {
                    text: 'Designed and deployed real-time multi-currency payment routing engine across Latin America and the US.',
                    businessProblem: 'Cross-border transaction rejection rates hovered at 11% due to banking gateway timeouts.',
                    actionTaken: 'Engineered dynamic smart routing algorithm with automatic fallback rails and liquidity balancing.',
                    quantifiedMetric: 'Processed $1.2B in annual GMV, dropping settlement failure rates to 0.4% and boosting net transaction margin by 18 bps',
                    competencies: 'Fintech Infrastructure, Distributed Systems, Payment Rails',
                    orderIndex: 0,
                  },
                  {
                    text: 'Instituted zero-downtime PCI-DSS Level 1 compliance security overhaul ahead of European expansion.',
                    businessProblem: 'European regulatory requirements threatened a 9-month launch delay if compliance was not certified.',
                    actionTaken: 'Led automated tokenization vault migration and orchestrated external audit defense without disrupting live merchants.',
                    quantifiedMetric: 'Passed external audit with 0 critical findings in 90 days; enabled unblocked launch in 4 EU markets',
                    competencies: 'Compliance & Security, Global Expansion, Cross-Border Regulatory Rigor',
                    orderIndex: 1,
                  },
                ],
              },
            },
          ],
        },
      },
      include: {
        profile: true,
        experiences: {
          include: { accomplishments: true },
          orderBy: { orderIndex: 'asc' },
        },
        jobTargets: {
          include: { matchAnalyses: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  return user;
}
