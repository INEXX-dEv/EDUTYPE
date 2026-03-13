import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email ve kod gereklidir' }, { status: 400 });
    }

    const token = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        code: code,
        expires: { gte: new Date() },
      },
    });

    if (!token) {
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş kod' }, { status: 400 });
    }

    // Update user
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // Delete token
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token: token.token } },
    });

    return NextResponse.json({ message: 'Email başarıyla doğrulandı' });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
