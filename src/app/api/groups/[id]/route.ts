import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const group = await prisma.studentGroup.findUnique({
      where: { id: params.id },
      include: {
        owner: { select: { name: true, email: true, image: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, surname: true, email: true, image: true, studentId: true, role: true } },
          },
          orderBy: { joinedAt: 'asc' },
        },
        contents: {
          include: {
            content: { select: { id: true, title: true, contentId: true } },
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
    }

    // Check membership
    const isMember = group.members.some((m) => m.userId === session.user.id);
    if (!isMember && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Bu gruba erişiminiz yok' }, { status: 403 });
    }

    return NextResponse.json({ group });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const body = await req.json();
    const { action, userId, email, contentId } = body;

    const group = await prisma.studentGroup.findUnique({ where: { id: params.id } });
    if (!group) {
      return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
    }

    if (group.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    switch (action) {
      case 'addMember': {
        const targetUser = await prisma.user.findFirst({
          where: { OR: [{ email }, { studentId: email }] },
        });
        if (!targetUser) {
          return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
        }
        const existing = await prisma.groupMember.findUnique({
          where: { groupId_userId: { groupId: params.id, userId: targetUser.id } },
        });
        if (existing) {
          return NextResponse.json({ error: 'Kullanıcı zaten grupta' }, { status: 400 });
        }
        await prisma.groupMember.create({
          data: { groupId: params.id, userId: targetUser.id },
        });
        await prisma.notification.create({
          data: {
            recipientId: targetUser.id,
            type: 'SYSTEM',
            title: 'Gruba Eklendi',
            message: `"${group.name}" grubuna eklendiniz.`,
          },
        });
        return NextResponse.json({ message: 'Üye eklendi' });
      }

      case 'removeMember': {
        if (userId === group.ownerId) {
          return NextResponse.json({ error: 'Grup sahibi çıkarılamaz' }, { status: 400 });
        }
        await prisma.groupMember.delete({
          where: { groupId_userId: { groupId: params.id, userId } },
        });
        return NextResponse.json({ message: 'Üye çıkarıldı' });
      }

      case 'addContent': {
        await prisma.groupContent.create({
          data: { groupId: params.id, contentId },
        });
        return NextResponse.json({ message: 'İçerik eklendi' });
      }

      case 'removeContent': {
        await prisma.groupContent.deleteMany({
          where: { groupId: params.id, contentId },
        });
        return NextResponse.json({ message: 'İçerik çıkarıldı' });
      }

      default:
        return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const group = await prisma.studentGroup.findUnique({ where: { id: params.id } });
    if (!group) {
      return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
    }

    if (group.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    await prisma.studentGroup.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Grup silindi' });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
