import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/seed';
import {
  simulateCounterOffer,
  COMP_BENCHMARKS,
} from '@/lib/ai/negotiationEngine';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const market = searchParams.get('market') || 'US';
    const level = searchParams.get('level') || 'L6';

    const benchmarks = COMP_BENCHMARKS[market]?.[level] || COMP_BENCHMARKS.US.L6;

    const user = await getOrCreateDefaultUser();
    const negotiations = await prisma.offerNegotiation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      benchmarks,
      allBenchmarks: COMP_BENCHMARKS,
      pastNegotiations: negotiations,
    });
  } catch (error) {
    console.error('Error fetching negotiation benchmarks:', error);
    return NextResponse.json({ error: 'Failed to fetch benchmarks' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      company = 'Stripe',
      roleTitle = 'Staff Product Manager',
      market = 'US',
      level = 'L6',
      currentOffer = {
        base: 235000,
        equity: 180000,
        signOn: 30000,
        bonus: 45000,
      },
      strategy = 'competing_offer',
      candidateNotes = '',
      language = 'en',
    } = body;

    const user = await getOrCreateDefaultUser();

    const simulation = simulateCounterOffer(
      company,
      roleTitle,
      market,
      level,
      currentOffer,
      strategy,
      candidateNotes,
      language
    );

    if (user) {
      await prisma.offerNegotiation.create({
        data: {
          userId: user.id,
          company,
          roleTitle,
          targetLevel: level,
          market,
          initialBase: currentOffer.base,
          initialEquity: currentOffer.equity,
          initialSignOn: currentOffer.signOn,
          initialBonus: currentOffer.bonus,
          counterBase: simulation.revisedOffer.base,
          counterEquity: simulation.revisedOffer.equity,
          counterSignOn: simulation.revisedOffer.signOn,
          strategy,
          recruiterNotes: simulation.recruiterResponseText,
          finalOutcome: 'countered',
          negotiationScript: simulation.scripts.emailBody,
        },
      });
    }

    return NextResponse.json({
      simulation,
    });
  } catch (error) {
    console.error('Error simulating counter-offer:', error);
    return NextResponse.json({ error: 'Failed to simulate counter-offer' }, { status: 500 });
  }
}
