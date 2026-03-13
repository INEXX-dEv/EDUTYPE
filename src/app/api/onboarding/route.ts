import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
        }

        const { newPassword, termsAccepted } = await req.json();

        const updateData: any = {};

        // Handle password change 
        if (newPassword) {
            if (newPassword.length < 8) {
                return NextResponse.json({ error: 'Şifre en az 8 karakter olmalıdır' }, { status: 400 });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 12);
            updateData.password = hashedPassword;
            updateData.mustChangePassword = false;
        }

        // Handle terms acceptance
        if (termsAccepted) {
            updateData.termsAcceptedAt = new Date();
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'Güncelleme verisi gerekli' }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Onboarding error:', error);
        return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 });
    }
}
