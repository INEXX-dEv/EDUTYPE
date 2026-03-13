import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - Get single content with details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    const content = await prisma.content.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: { id: true, name: true, surname: true, image: true, teacherId: true, isApproved: true },
        },
        category: true,
        videos: { orderBy: { order: 'asc' } },
        exam: {
          include: {
            questions: {
              include: { options: { orderBy: { order: 'asc' } } },
              orderBy: { order: 'asc' },
            },
          },
        },
        _count: { select: { videos: true, certificates: true } },
      },
    });

    if (!content) {
      return NextResponse.json({ error: 'İçerik bulunamadı' }, { status: 404 });
    }

    // Get user progress if logged in
    let progress = null;
    let certificate = null;
    if (session) {
      progress = await prisma.videoProgress.findMany({
        where: {
          userId: session.user.id,
          video: { contentId: params.id },
        },
      });

      certificate = await prisma.certificate.findUnique({
        where: {
          userId_contentId: {
            userId: session.user.id,
            contentId: params.id,
          },
        },
      });
    }

    // Increment view count
    await prisma.content.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ content, progress, certificate });
  } catch (error) {
    console.error('Content get error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// PUT - Update content
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 });
    }

    const content = await prisma.content.findUnique({ where: { id: params.id } });
    if (!content) {
      return NextResponse.json({ error: 'İçerik bulunamadı' }, { status: 404 });
    }

    if (content.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();
    const updated = await prisma.content.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        categoryId: body.categoryId,
        status: body.status,
        hasExam: body.hasExam,
        thumbnail: body.thumbnail,
      },
    });

    return NextResponse.json({ content: updated });
  } catch (error) {
    console.error('Content update error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// DELETE - Delete content
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 });
    }

    const content = await prisma.content.findUnique({ where: { id: params.id } });
    if (!content) {
      return NextResponse.json({ error: 'İçerik bulunamadı' }, { status: 404 });
    }

    if (content.creatorId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    await prisma.content.delete({ where: { id: params.id } });

    return NextResponse.json({ message: 'İçerik silindi' });
  } catch (error) {
    console.error('Content delete error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
