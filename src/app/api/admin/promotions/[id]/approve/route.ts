import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const REQUIRED_APPROVALS = 3;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
        }

        const promotionId = params.id;

        const promotion = await prisma.adminPromotionRequest.findUnique({
            where: { id: promotionId },
            include: {
                approvals: true,
                targetUser: { select: { id: true, name: true, surname: true, email: true } },
            },
        });

        if (!promotion) {
            return NextResponse.json({ error: 'Terfi talebi bulunamadı' }, { status: 404 });
        }

        if (promotion.status !== 'PENDING') {
            return NextResponse.json({ error: 'Bu talep artık aktif değil' }, { status: 400 });
        }

        // Check if this admin already approved
        const alreadyApproved = promotion.approvals.some((a) => a.approverId === session.user.id);
        if (alreadyApproved) {
            return NextResponse.json({ error: 'Bu talebi zaten onayladınız' }, { status: 400 });
        }

        // Add approval
        await prisma.adminPromotionApproval.create({
            data: {
                promotionId,
                approverId: session.user.id,
            },
        });

        const totalApprovals = promotion.approvals.length + 1;

        // If we reached the required number of approvals, promote the user
        if (totalApprovals >= REQUIRED_APPROVALS) {
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: promotion.targetUserId },
                    data: { role: 'ADMIN' },
                }),
                prisma.adminPromotionRequest.update({
                    where: { id: promotionId },
                    data: { status: 'APPROVED' },
                }),
                prisma.notification.create({
                    data: {
                        recipientId: promotion.targetUserId,
                        type: 'SYSTEM',
                        title: 'Admin Yetkisi Verildi',
                        message: 'Hesabınıza admin yetkisi verilmiştir. 3 admin tarafından onaylanmıştır.',
                    },
                }),
                prisma.systemLog.create({
                    data: {
                        level: 'INFO',
                        message: `User ${promotion.targetUser.email} promoted to ADMIN with ${REQUIRED_APPROVALS} approvals`,
                        metadata: JSON.stringify({ action: 'ADMIN_PROMOTION_COMPLETED', targetUserId: promotion.targetUserId }),
                    },
                }),
            ]);

            return NextResponse.json({
                message: `${promotion.targetUser.name} ${promotion.targetUser.surname} artık admin! (${REQUIRED_APPROVALS}/${REQUIRED_APPROVALS} onay)`,
                completed: true,
            });
        }

        return NextResponse.json({
            message: `Onay kaydedildi. ${totalApprovals}/${REQUIRED_APPROVALS} onay tamamlandı.`,
            completed: false,
            approvalCount: totalApprovals,
        });
    } catch {
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
