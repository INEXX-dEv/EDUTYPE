import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const certificate = await prisma.certificate.findUnique({
      where: { certificateCode: params.code },
      include: {
        user: { select: { name: true, surname: true, studentId: true, school: true, department: true } },
        content: { select: { title: true, contentId: true, description: true } },
      },
    });

    if (!certificate) {
      return NextResponse.json({ error: 'Sertifika bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ certificate });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
