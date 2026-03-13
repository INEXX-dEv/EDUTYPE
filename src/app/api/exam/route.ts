import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST - Create exam for content
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();
    const { contentId, title, description, timeLimit, passingScore, questions } = body;

    if (!contentId || !title || !questions || questions.length === 0) {
      return NextResponse.json({ error: 'Gerekli alanlar eksik' }, { status: 400 });
    }

    // Validate questions (3-5 options each)
    for (const q of questions) {
      if (!q.options || q.options.length < 3 || q.options.length > 5) {
        return NextResponse.json({ error: 'Her soru 3-5 seçenek içermelidir' }, { status: 400 });
      }
      const correctCount = q.options.filter((o: any) => o.isCorrect).length;
      if (correctCount !== 1) {
        return NextResponse.json({ error: 'Her sorunun tam 1 doğru cevabı olmalıdır' }, { status: 400 });
      }
    }

    // Check content ownership
    const content = await prisma.content.findFirst({
      where: { id: contentId, creatorId: session.user.id },
    });
    if (!content && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'İçerik bulunamadı' }, { status: 404 });
    }

    // Delete existing exam if any
    await prisma.exam.deleteMany({ where: { contentId } });

    // Create exam with questions
    const exam = await prisma.exam.create({
      data: {
        contentId,
        title,
        description: description || '',
        timeLimit: timeLimit || null,
        passingScore: passingScore || 60,
        questions: {
          create: questions.map((q: any, qi: number) => ({
            question: q.question,
            order: qi,
            options: {
              create: q.options.map((o: any, oi: number) => ({
                text: o.text,
                isCorrect: o.isCorrect,
                order: oi,
              })),
            },
          })),
        },
      },
      include: {
        questions: { include: { options: true } },
      },
    });

    // Update content
    await prisma.content.update({
      where: { id: contentId },
      data: { hasExam: true },
    });

    return NextResponse.json({ exam, message: 'Sınav oluşturuldu' });
  } catch (error) {
    console.error('Exam create error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
