import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;
    const userId = params.id;

    // Prevent self-modification
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'Kendi hesabınızı değiştiremezsiniz' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    let updateData: any = {};
    let message = '';

    switch (action) {
      case 'ban':
        updateData = { isBanned: true };
        message = 'Kullanıcı yasaklandı';
        // Create notification
        await prisma.notification.create({
          data: {
            recipientId: userId,
            type: 'SYSTEM',
            title: 'Hesap Yasaklandı',
            message: 'Hesabınız yönetici tarafından yasaklanmıştır.',
          },
        });
        break;

      case 'unban':
        updateData = { isBanned: false };
        message = 'Kullanıcı yasağı kaldırıldı';
        await prisma.notification.create({
          data: {
            recipientId: userId,
            type: 'SYSTEM',
            title: 'Hesap Aktifleştirildi',
            message: 'Hesap yasağınız kaldırılmıştır.',
          },
        });
        break;

      case 'approve':
        updateData = { isApproved: true };
        message = 'Öğretmen onaylandı';
        await prisma.notification.create({
          data: {
            recipientId: userId,
            type: 'SYSTEM',
            title: 'Hesap Onaylandı',
            message: 'Öğretmen hesabınız yönetici tarafından onaylanmıştır. Artık içerik oluşturabilirsiniz.',
          },
        });
        break;

      case 'reject':
        updateData = { isApproved: false };
        message = 'Öğretmen başvurusu reddedildi';
        break;

      case 'makeAdmin': {
        // Check if there's already a pending request
        const existingRequest = await prisma.adminPromotionRequest.findFirst({
          where: { targetUserId: userId, status: 'PENDING' },
        });
        if (existingRequest) {
          return NextResponse.json({ error: 'Bu kullanıcı için zaten bekleyen bir terfi talebi var' }, { status: 400 });
        }
        // Create promotion request with first approval
        await prisma.adminPromotionRequest.create({
          data: {
            targetUserId: userId,
            requestedById: session.user.id,
            approvals: {
              create: { approverId: session.user.id },
            },
          },
        });
        // Log and return without updating user
        await prisma.systemLog.create({
          data: {
            level: 'INFO',
            message: `Admin ${session.user.email} created promotion request for ${targetUser.email}`,
            metadata: JSON.stringify({ action: 'ADMIN_PROMOTION_REQUEST', adminId: session.user.id, ip: req.headers.get('x-forwarded-for') || 'unknown' }),
          },
        });
        return NextResponse.json({
          message: `Admin terfi talebi oluşturuldu. 2 admin onayı daha gerekiyor.`,
        });
      }

      case 'setTag': {
        const { tag } = body;
        if (!['ADMIN', 'DEVELOPER'].includes(tag)) {
          return NextResponse.json({ error: 'Geçersiz tag' }, { status: 400 });
        }
        updateData = { tag };
        message = `${tag} tag'i atandı`;
        break;
      }

      case 'removeTag':
        updateData = { tag: null };
        message = 'Tag kaldırıldı';
        break;

      case 'makeTeacher':
        updateData = { role: 'TEACHER', isApproved: true, teacherId: `TCH-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}` };
        message = 'Öğretmen yapıldı';
        break;

      case 'makeStudent':
        updateData = { role: 'STUDENT', isApproved: true };
        message = 'Öğrenci yapıldı';
        break;

      default:
        return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Log the action
    await prisma.systemLog.create({
      data: {
        level: 'INFO',
        message: `Admin ${session.user.email} performed ${action} on user ${targetUser.email}`,
        metadata: JSON.stringify({ action: `ADMIN_${action.toUpperCase()}`, adminId: session.user.id, ip: req.headers.get('x-forwarded-for') || 'unknown' }),
      },
    });

    return NextResponse.json({ user, message });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    if (params.id === session.user.id) {
      return NextResponse.json({ error: 'Kendi hesabınızı silemezsiniz' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: params.id } });

    return NextResponse.json({ message: 'Kullanıcı silindi' });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
