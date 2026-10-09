import { NextResponse } from 'next/server';
import { getOrCreateDefaultUser } from '@/lib/seed';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    const u = user as any;
    const skills = u.profile?.skills ? JSON.parse(u.profile.skills) : [];

    return NextResponse.json({
      success: true,
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        defaultLanguage: u.defaultLanguage,
      },
      profile: {
        headline: u.profile?.headline || '',
        summary: u.profile?.summary || '',
        targetLevel: u.profile?.targetLevel || '',
        targetMarkets: u.profile?.targetMarkets || '',
        skills,
      },
      experiences: (u.experiences || []).map((exp: any) => ({
        id: exp.id,
        company: exp.company,
        title: exp.title,
        location: exp.location,
        startDate: exp.startDate,
        endDate: exp.endDate,
        isCurrent: exp.isCurrent,
        teamScope: exp.teamScope,
        accomplishments: (exp.accomplishments || []).map((acc: any) => ({
          id: acc.id,
          text: acc.text,
          businessProblem: acc.businessProblem,
          actionTaken: acc.actionTaken,
          quantifiedMetric: acc.quantifiedMetric,
          competencies: acc.competencies,
        })),
      })),
      recentTargets: (u.jobTargets || []).map((jt: any) => ({
        id: jt.id,
        company: jt.company,
        roleTitle: jt.roleTitle,
        language: jt.language,
        createdAt: jt.createdAt,
        latestScore: jt.matchAnalyses[0]?.score || null,
      })),
    });
  } catch (error) {
    console.error('Error fetching Career Source:', error);
    return NextResponse.json({ success: false, error: 'Failed to load Career Source' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    const body = await req.json();

    if (body.type === 'update_profile') {
      const { headline, summary, targetLevel, targetMarkets, skills } = body;
      await (prisma as any).careerProfile.upsert({
        where: { userId: (user as any).id },
        update: {
          headline,
          summary,
          targetLevel,
          targetMarkets,
          skills: JSON.stringify(skills || []),
        },
        create: {
          userId: user.id,
          headline,
          summary,
          targetLevel,
          targetMarkets,
          skills: JSON.stringify(skills || []),
        },
      });
      return NextResponse.json({ success: true, message: 'Profile updated' });
    }

    if (body.type === 'add_experience') {
      const { company, title, location, startDate, endDate, isCurrent, teamScope } = body;
      const newExp = await prisma.experience.create({
        data: {
          userId: user.id,
          company,
          title,
          location,
          startDate,
          endDate,
          isCurrent: !!isCurrent,
          teamScope,
        },
      });
      return NextResponse.json({ success: true, experience: newExp });
    }

    if (body.type === 'add_accomplishment') {
      const { experienceId, text, businessProblem, actionTaken, quantifiedMetric, competencies } = body;
      const newAcc = await prisma.accomplishment.create({
        data: {
          experienceId,
          text,
          businessProblem,
          actionTaken,
          quantifiedMetric,
          competencies,
        },
      });
      return NextResponse.json({ success: true, accomplishment: newAcc });
    }

    return NextResponse.json({ success: false, error: 'Invalid operation type' }, { status: 400 });
  } catch (error) {
    console.error('Error modifying Career Source:', error);
    return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
  }
}
