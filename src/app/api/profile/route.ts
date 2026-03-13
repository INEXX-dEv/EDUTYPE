import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { profileSchema } from '@/lib/validations';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        image: true,
        role: true,
        studentId: true,
        teacherId: true,
        tcNumber: true,
        school: true,
        department: true,
        createdAt: true,
        _count: {
          select: {
            contents: true,
            examAttempts: true,
            certificates: true,
            videoProgress: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const body = await req.json();
    const result = profileSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const { name, surname, tcNumber, school, department } = result.data;

    // TC number uniqueness check
    if (tcNumber) {
      const existing = await prisma.user.findFirst({
        where: { tcNumber, NOT: { id: session.user.id } },
      });
      if (existing) {
        return NextResponse.json({ error: 'Bu TC kimlik numarası zaten kullanımda' }, { status: 400 });
      }
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, surname, tcNumber, school, department },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        tcNumber: true,
        school: true,
        department: true,
      },
    });

    return NextResponse.json({ user, message: 'Profil güncellendi' });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
