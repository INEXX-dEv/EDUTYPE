import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - List contents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const creatorId = searchParams.get('creatorId') || '';

    const where: any = { status: 'PUBLISHED' };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (creatorId) where.creatorId = creatorId;

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true, surname: true, image: true, teacherId: true } },
          category: true,
          videos: { select: { id: true, title: true, duration: true, order: true }, orderBy: { order: 'asc' } },
          _count: { select: { videos: true, certificates: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.content.count({ where }),
    ]);

    return NextResponse.json({
      contents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Content list error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// POST - Create content
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, categoryId, hasExam } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Başlık ve açıklama gereklidir' }, { status: 400 });
    }

    const content = await prisma.content.create({
      data: {
        title,
        description,
        categoryId: categoryId || null,
        creatorId: session.user.id,
        hasExam: hasExam || false,
        contentId: `CNT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      },
    });

    return NextResponse.json({ content, message: 'İçerik oluşturuldu' });
  } catch (error) {
    console.error('Content create error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
