import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';
import { sendVerificationEmail, generateCode } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = await checkRateLimit(ip, 'register', 5, 300000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Çok fazla deneme yaptınız. Lütfen 5 dakika bekleyin.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, name, surname, role } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = generateCode();

    // Generate unique IDs
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    const studentId = role === 'STUDENT' ? `STU-${year}-${random}` : null;
    const teacherId = role === 'TEACHER' ? `TCH-${year}-${random}` : null;

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        surname,
        role: role as any,
        studentId,
        teacherId,
        isApproved: role === 'STUDENT', // Students auto-approved, teachers need admin approval
      },
    });

    // Create verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationCode,
        code: verificationCode,
        expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Still return success - user can request a new code
    }

    return NextResponse.json({
      message: 'Kayıt başarılı. Doğrulama kodunuz email adresinize gönderildi.',
      userId: user.id,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }
}
