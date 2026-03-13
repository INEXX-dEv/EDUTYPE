import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const contentId = formData.get('contentId') as string;
    const videoTitle = formData.get('title') as string;
    const description = formData.get('description') as string;
    const order = parseInt(formData.get('order') as string) || 0;

    if (!file || !contentId) {
      return NextResponse.json({ error: 'Dosya ve içerik ID gereklidir' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Geçersiz dosya formatı. MP4, WebM veya OGG kullanın.' }, { status: 400 });
    }

    // Max 500MB
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json({ error: 'Dosya boyutu 500MB\'ı aşamaz' }, { status: 400 });
    }

    // Verify content belongs to user
    const content = await prisma.content.findFirst({
      where: { id: contentId, creatorId: session.user.id },
    });
    if (!content && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'İçerik bulunamadı' }, { status: 404 });
    }

    // Save file
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name);
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(uploadDir, filename);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Create video record
    const video = await prisma.video.create({
      data: {
        title: videoTitle || file.name,
        description: description || '',
        url: `/uploads/videos/${filename}`,
        filename,
        size: file.size,
        order,
        contentId,
      },
    });

    return NextResponse.json({ video, message: 'Video başarıyla yüklendi' });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Yükleme sırasında bir hata oluştu' }, { status: 500 });
  }
}
