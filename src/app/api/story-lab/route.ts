import { NextResponse } from 'next/server';
import { getOrCreateDefaultUser } from '@/lib/seed';
import { generateStoryCard } from '@/lib/ai/storyEngine';
import { prisma } from '@/lib/db';
import { SupportedLanguage } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    const storyCards = await prisma.storyCard.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      storyCards: storyCards.map((sc) => ({
        id: sc.id,
        title: sc.title,
        language: sc.language,
        challenge: sc.challenge,
        action: sc.action,
        impact: sc.impact,
        competencies: sc.competencies ? JSON.parse(sc.competencies) : [],
        version30s: sc.version30s,
        version90s: sc.version90s,
        versionDeepDive: sc.versionDeepDive,
        createdAt: sc.createdAt,
      })),
    });
  } catch (err) {
    console.error('Error fetching story cards:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch stories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getOrCreateDefaultUser();
    const body = await req.json();
    const { rawText, title = 'Career Highlight', language = 'en' } = body;

    if (!rawText || !rawText.trim()) {
      return NextResponse.json(
        { success: false, error: 'Raw text is required to structure a story.' },
        { status: 400 }
      );
    }

    const lang: SupportedLanguage = ['en', 'pt', 'es'].includes(language) ? language : 'en';

    // Generate structured STAR story
    const result = await generateStoryCard(rawText, title, lang);

    // Persist in database
    const savedCard = await prisma.storyCard.create({
      data: {
        userId: user.id,
        title: result.title,
        language: lang,
        challenge: result.challenge,
        action: result.action,
        impact: result.impact,
        competencies: JSON.stringify(result.competencies),
        version30s: result.version30s,
        version90s: result.version90s,
        versionDeepDive: result.versionDeepDive,
      },
    });

    return NextResponse.json({
      success: true,
      storyCard: {
        ...result,
        id: savedCard.id,
      },
    });
  } catch (err) {
    console.error('Error creating story card:', err);
    return NextResponse.json({ success: false, error: 'Failed to generate story card' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Story card ID required' }, { status: 400 });
    }

    await prisma.storyCard.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting story card:', err);
    return NextResponse.json({ success: false, error: 'Failed to delete story card' }, { status: 500 });
  }
}
