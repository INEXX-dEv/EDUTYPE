import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, code, password } = await request.json();

    if (!email || !code || !password) {
      return NextResponse.json({ error: 'Tüm alanlar gereklidir' }, { status: 400 });
    }

    const token = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        code,
        expires: { gte: new Date() },
      },
    });

    if (!token) {
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş kod' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.deleteMany({ where: { email } });

    return NextResponse.json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
