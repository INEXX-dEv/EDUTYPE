import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        surname: true,
        image: true,
        role: true,
        school: true,
        department: true,
        createdAt: true,
        _count: {
          select: {
            contents: true,
            certificates: true,
            videoProgress: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const contents = await prisma.content.findMany({
      where: {
        creatorId: params.id,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnail: true,
        contentId: true,
        createdAt: true,
        viewCount: true,
        _count: {
          select: {
            videos: true,
            certificates: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 24,
    });

    return NextResponse.json({ user, contents });
  } catch (error) {
    console.error('User profile fetch error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
