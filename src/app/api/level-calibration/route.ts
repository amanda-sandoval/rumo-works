import { NextResponse } from 'next/server';
import { getOrCreateDefaultUser } from '@/lib/seed';
import { runLevelCalibration } from '@/lib/ai/levelCalibrationEngine';
import { CareerSourceData, SupportedLanguage } from '@/types';

export async function POST(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();
    const { targetLevel = 'L6', market = 'US', language = 'en' } = body;

    const lang: SupportedLanguage = ['en', 'pt', 'es'].includes(language) ? language : 'en';

    const careerSource: CareerSourceData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        defaultLanguage: user.defaultLanguage,
      },
      profile: {
        headline: user.profile?.headline || '',
        summary: user.profile?.summary || '',
        targetLevel: user.profile?.targetLevel || '',
        targetMarkets: user.profile?.targetMarkets || '',
        skills: user.profile?.skills ? JSON.parse(user.profile.skills) : [],
      },
      experiences: user.experiences.map((exp) => ({
        id: exp.id,
        company: exp.company,
        title: exp.title,
        location: exp.location || undefined,
        startDate: exp.startDate,
        endDate: exp.endDate || undefined,
        isCurrent: exp.isCurrent,
        teamScope: exp.teamScope || undefined,
        accomplishments: exp.accomplishments.map((acc) => ({
          id: acc.id,
          text: acc.text,
          businessProblem: acc.businessProblem || undefined,
          actionTaken: acc.actionTaken || undefined,
          quantifiedMetric: acc.quantifiedMetric || undefined,
          competencies: acc.competencies || undefined,
        })),
      })),
    };

    const calibration = await runLevelCalibration(careerSource, targetLevel, market, lang);

    return NextResponse.json({
      success: true,
      calibration,
    });
  } catch (err) {
    console.error('Error running level calibration:', err);
    return NextResponse.json({ success: false, error: 'Failed to run level calibration' }, { status: 500 });
  }
}
