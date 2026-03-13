import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST - Update video progress
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 });
    }

    const { videoId, currentTime, maxWatched, totalDuration } = await request.json();

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID gereklidir' }, { status: 400 });
    }

    const progress = await prisma.videoProgress.upsert({
      where: {
        userId_videoId: {
          userId: session.user.id,
          videoId,
        },
      },
      update: {
        watchedSeconds: Math.max(maxWatched, 0),
        lastPosition: currentTime,
        totalDuration: totalDuration || 0,
        completed: maxWatched >= (totalDuration || 0) * 0.95, // 95% watched = complete
      },
      create: {
        userId: session.user.id,
        videoId,
        watchedSeconds: maxWatched || 0,
        lastPosition: currentTime || 0,
        totalDuration: totalDuration || 0,
      },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
