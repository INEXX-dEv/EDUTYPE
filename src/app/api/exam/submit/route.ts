import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

// POST - Submit exam
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 });
    }

    const body = await request.json();
    const { examId, answers, tabSwitchCount } = body;

    if (!examId || !answers) {
      return NextResponse.json({ error: 'Sınav ID ve cevaplar gereklidir' }, { status: 400 });
    }

    // Tab switch penalty - if more than 0, restart required
    if (tabSwitchCount > 0) {
      return NextResponse.json({
        error: 'Sınav sırasında sayfa değiştirdiniz. Sınav baştan başlamalıdır.',
        restart: true,
      }, { status: 400 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          include: { options: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Sınav bulunamadı' }, { status: 404 });
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = exam.questions.length;

    for (const question of exam.questions) {
      const userAnswer = answers[question.id];
      if (userAnswer) {
        const correctOption = question.options.find((o) => o.isCorrect);
        if (correctOption && correctOption.id === userAnswer) {
          correctAnswers++;
        }
      }
    }

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= exam.passingScore;

    // Save attempt
    const attempt = await prisma.examAttempt.create({
      data: {
        userId: session.user.id,
        examId,
        score,
        totalQuestions,
        correctAnswers,
        passed,
        tabSwitchCount: tabSwitchCount || 0,
        completedAt: new Date(),
        answers: answers,
      },
    });

    // if passed, create certificate
    let certificate = null;
    if (passed) {
      const existingCert = await prisma.certificate.findUnique({
        where: {
          userId_contentId: {
            userId: session.user.id,
            contentId: exam.contentId,
          },
        },
      });

      if (!existingCert) {
        const user = await prisma.user.findUnique({ where: { id: session.user.id } });
        
        certificate = await prisma.certificate.create({
          data: {
            certificateCode: `CERT-${Date.now().toString(36).toUpperCase()}-${uuidv4().substring(0, 8).toUpperCase()}`,
            userId: session.user.id,
            contentId: exam.contentId,
            studentIdRef: user?.studentId || null,
          },
        });

        // Send notification
        await prisma.notification.create({
          data: {
            type: 'CERTIFICATE',
            title: 'Sertifika Kazandınız!',
            message: `Tebrikler! Sınavı ${score}% başarıyla tamamladınız ve sertifikanız oluşturuldu.`,
            recipientId: session.user.id,
          },
        });
      }
    }

    return NextResponse.json({
      attempt,
      certificate,
      score,
      passed,
      correctAnswers,
      totalQuestions,
    });
  } catch (error) {
    console.error('Exam submit error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
