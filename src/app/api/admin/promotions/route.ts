import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET — list pending promotion requests
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
        }

        const promotions = await prisma.adminPromotionRequest.findMany({
            where: { status: 'PENDING' },
            include: {
                targetUser: { select: { id: true, name: true, surname: true, email: true, role: true, tag: true } },
                requestedBy: { select: { id: true, name: true, surname: true, email: true } },
                approvals: {
                    include: {
                        approver: { select: { id: true, name: true, surname: true, email: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ promotions });
    } catch {
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}

// POST — create a new promotion request
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
        }

        const { targetUserId } = await req.json();

        // Check if user exists and is not already admin
        const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
        if (!targetUser) {
            return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
        }
        if (targetUser.role === 'ADMIN') {
            return NextResponse.json({ error: 'Kullanıcı zaten admin' }, { status: 400 });
        }

        // Check if there's already a pending request for this user
        const existingRequest = await prisma.adminPromotionRequest.findFirst({
            where: { targetUserId, status: 'PENDING' },
        });

        if (existingRequest) {
            return NextResponse.json({ error: 'Bu kullanıcı için zaten bekleyen bir terfi talebi var' }, { status: 400 });
        }

        // Create promotion request and first approval (from the requester)
        const promotion = await prisma.adminPromotionRequest.create({
            data: {
                targetUserId,
                requestedById: session.user.id,
                approvals: {
                    create: {
                        approverId: session.user.id,
                    },
                },
            },
            include: {
                targetUser: { select: { name: true, surname: true, email: true } },
                approvals: true,
            },
        });

        await prisma.systemLog.create({
            data: {
                level: 'INFO',
                message: `Admin ${session.user.email} created promotion request for ${targetUser.email}`,
                metadata: JSON.stringify({ action: 'ADMIN_PROMOTION_REQUEST', adminId: session.user.id, targetUserId }),
            },
        });

        return NextResponse.json({
            promotion,
            message: `Admin terfi talebi oluşturuldu. ${targetUser.name} ${targetUser.surname} için 2 admin onayı daha gerekiyor.`,
        });
    } catch {
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
