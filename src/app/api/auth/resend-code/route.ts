import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendVerificationEmail, generateCode } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = await checkRateLimit(ip, 'resend-code', 3, 300000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Çok fazla deneme.' }, { status: 429 });
    }

    const { email } = await request.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.emailVerified) {
      return NextResponse.json({ message: 'İşlem tamamlandı' });
    }

    // Delete old tokens
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    const code = generateCode();
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: code,
        code,
        expires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    try {
      await sendVerificationEmail(email, code);
    } catch (e) {
      console.error('Email error:', e);
    }

    return NextResponse.json({ message: 'Yeni kod gönderildi' });
  } catch (error) {
    console.error('Resend code error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
