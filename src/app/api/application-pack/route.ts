import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/seed';
import { generateApplicationPack } from '@/lib/ai/applicationPackEngine';

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    if (!user) {
      return NextResponse.json({ packs: [], jobTargets: [], storyCards: [] });
    }
    const fullUser = await (prisma.user as any).findUnique({
      where: { id: user.id },
      include: {
        applicationPacks: {
          include: { jobTarget: true },
          orderBy: { createdAt: 'desc' },
        },
        jobTargets: {
          orderBy: { createdAt: 'desc' },
        },
        storyCards: true,
      },
    });

    return NextResponse.json({
      packs: fullUser?.applicationPacks || [],
      jobTargets: fullUser?.jobTargets || [],
      storyCards: fullUser?.storyCards || [],
    });
  } catch (error) {
    console.error('Error fetching application packs:', error);
    return NextResponse.json({ error: 'Failed to fetch application packs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobTargetId, language = 'en' } = body;

    const defaultUser = await getOrCreateDefaultUser();
    if (!defaultUser) {
      return NextResponse.json({ error: 'Default user not found' }, { status: 404 });
    }
    const user = await (prisma.user as any).findUnique({
      where: { id: defaultUser.id },
      include: {
        profile: true,
        experiences: {
          include: { accomplishments: true },
        },
        storyCards: true,
        jobTargets: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine target company and role
    let company = 'Stripe';
    let roleTitle = 'Staff Product Manager';
    let targetLevel = 'L6';
    let selectedJobTarget = null;

    if (jobTargetId) {
      selectedJobTarget = user.jobTargets.find((jt: any) => jt.id === jobTargetId);
      if (selectedJobTarget) {
        company = selectedJobTarget.company;
        roleTitle = selectedJobTarget.roleTitle;
        targetLevel = selectedJobTarget.targetLevel || 'L6';
      }
    } else if (user.jobTargets.length > 0) {
      selectedJobTarget = user.jobTargets[0];
      company = selectedJobTarget.company;
      roleTitle = selectedJobTarget.roleTitle;
      targetLevel = selectedJobTarget.targetLevel || 'L6';
    }

    // Collect authentic accomplishments
    const accomplishments = user.experiences.flatMap((e: any) =>
      e.accomplishments.map((a: any) => a.text)
    );

    const pack = await generateApplicationPack(
      user.name,
      user.profile?.headline || 'Senior Product & Engineering Leader',
      accomplishments,
      company,
      roleTitle,
      targetLevel,
      language
    );

    // Save pack if target exists
    if (selectedJobTarget) {
      await (prisma as any).applicationPack.create({
        data: {
          userId: user.id,
          jobTargetId: selectedJobTarget.id,
          language,
          tailoredCvJson: JSON.stringify({ summary: pack.executiveSummary }),
          storyCardsJson: JSON.stringify(user.storyCards.slice(0, 3)),
          whyRoleStory: pack.whyThisRolePitch,
          interviewThemes: JSON.stringify(pack.outreachTemplates),
          strategicQuestions: JSON.stringify(pack.reverseInterviewQuestions),
        },
      });
    }

    return NextResponse.json({
      pack,
      company,
      roleTitle,
      targetLevel,
      relevantStories: user.storyCards.slice(0, 3),
    });
  } catch (error) {
    console.error('Error generating application pack:', error);
    return NextResponse.json({ error: 'Failed to generate application pack' }, { status: 500 });
  }
}
