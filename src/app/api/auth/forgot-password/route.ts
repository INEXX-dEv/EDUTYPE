import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPasswordResetEmail, generateCode } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = await checkRateLimit(ip, 'forgot-password', 3, 300000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Çok fazla deneme. 5 dakika bekleyin.' }, { status: 429 });
    }

    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email gereklidir' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists
      return NextResponse.json({ message: 'Eğer hesap varsa, kod gönderildi' });
    }

    const code = generateCode();

    await prisma.passwordResetToken.deleteMany({ where: { email } });
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: code,
        code,
        expires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    try {
      await sendPasswordResetEmail(email, code);
    } catch (e) {
      console.error('Email error:', e);
    }

    return NextResponse.json({ message: 'Şifre sıfırlama kodu gönderildi' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
