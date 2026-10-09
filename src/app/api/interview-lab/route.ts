import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getOrCreateDefaultUser } from '@/lib/seed';
import {
  InterviewTrack,
  getInitialInterviewQuestion,
  evaluateTurnAndAskFollowUp,
  generatePostSessionDiagnostic,
  InterviewTurnData,
} from '@/lib/ai/interviewEngine';

export async function GET() {
  try {
    const user = await getOrCreateDefaultUser();
    const sessions = await prisma.interviewSession.findMany({
      where: { userId: user.id },
      include: { turns: { orderBy: { turnIndex: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching interview sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      action,
      sessionId,
      track = 'behavioral',
      targetLevel = 'L6',
      roleTitle = 'Staff Product Manager',
      company = 'Stripe',
      candidateAnswer,
      language = 'en',
      durationSeconds = 0,
      isAudio = false,
    } = body;

    const user = await getOrCreateDefaultUser();

    // Action 1: Start a new mock session
    if (action === 'start') {
      const initialQuestion = getInitialInterviewQuestion(
        track as InterviewTrack,
        targetLevel,
        company,
        roleTitle,
        language
      );

      const session = await prisma.interviewSession.create({
        data: {
          userId: user.id,
          jobTitle: roleTitle,
          company,
          language,
          targetLevel,
          status: 'active',
          turns: {
            create: {
              speaker: 'interviewer',
              text: initialQuestion,
              turnIndex: 1,
            },
          },
        },
        include: { turns: true },
      });

      return NextResponse.json({
        sessionId: session.id,
        firstQuestion: initialQuestion,
        session,
      });
    }

    // Action 2: Submit candidate answer & evaluate turn
    if (action === 'turn') {
      if (!sessionId || !candidateAnswer) {
        return NextResponse.json({ error: 'Missing sessionId or candidateAnswer' }, { status: 400 });
      }

      const session = await prisma.interviewSession.findUnique({
        where: { id: sessionId },
        include: { turns: { orderBy: { turnIndex: 'asc' } } },
      });

      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const turnIndex = session.turns.length + 1;

      // Evaluate the candidate's answer with memory of past turns
      const mappedTurns: InterviewTurnData[] = session.turns.map((t) => ({
        turnIndex: t.turnIndex,
        speaker: t.speaker as 'interviewer' | 'candidate',
        text: t.text,
        analysis: t.analysis ? JSON.parse(t.analysis) : undefined,
      }));

      const evaluation = await evaluateTurnAndAskFollowUp(
        candidateAnswer,
        mappedTurns,
        track as InterviewTrack,
        session.targetLevel,
        session.jobTitle,
        session.company,
        session.language,
        { durationSeconds, isAudio }
      );

      // Save candidate turn with analysis
      await prisma.interviewTurn.create({
        data: {
          sessionId: session.id,
          speaker: 'candidate',
          text: candidateAnswer,
          analysis: JSON.stringify(evaluation.analysis),
          turnIndex,
        },
      });

      // Save next interviewer question
      await prisma.interviewTurn.create({
        data: {
          sessionId: session.id,
          speaker: 'interviewer',
          text: evaluation.nextQuestion,
          turnIndex: turnIndex + 1,
        },
      });

      return NextResponse.json({
        analysis: evaluation.analysis,
        nextQuestion: evaluation.nextQuestion,
      });
    }

    // Action 3: Finish session & generate full diagnostic report
    if (action === 'finish') {
      if (!sessionId) {
        return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
      }

      const session = await prisma.interviewSession.findUnique({
        where: { id: sessionId },
        include: { turns: { orderBy: { turnIndex: 'asc' } } },
      });

      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }

      const mappedTurns: InterviewTurnData[] = session.turns.map((t) => ({
        turnIndex: t.turnIndex,
        speaker: t.speaker as 'interviewer' | 'candidate',
        text: t.text,
        analysis: t.analysis ? JSON.parse(t.analysis) : undefined,
      }));

      const diagnostic = generatePostSessionDiagnostic(
        mappedTurns,
        session.targetLevel,
        track as InterviewTrack,
        session.language
      );

      // Persist status and report
      await prisma.interviewSession.update({
        where: { id: sessionId },
        data: {
          status: 'completed',
          overallScore: diagnostic.overallScore,
          feedbackReport: JSON.stringify(diagnostic),
        },
      });

      return NextResponse.json({ diagnostic });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (error) {
    console.error('Error in interview-lab API:', error);
    return NextResponse.json({ error: 'Failed to process interview action' }, { status: 500 });
  }
}
