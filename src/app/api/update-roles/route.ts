import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const rawPassword = 'cSgo.2344';
    const hashedPassword = await bcrypt.hash(rawPassword, 12);
    
    // Update Nesibe
    await prisma.user.updateMany({
      where: { email: 'nesibe@lernstack.com' },
      data: {
        role: 'TEACHER',
        tag: 'TEACHER'
      }
    });

    let mamiUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'mami@lernstack.com' },
          { name: { contains: 'mami' } },
          { name: { contains: 'Mami' } }
        ]
      }
    });

    if (mamiUser) {
      await prisma.user.update({
        where: { id: mamiUser.id },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          tag: 'ADMIN',
          emailVerified: new Date()
        }
      });
      return NextResponse.json({ success: true, message: 'Mami hesabı güncellendi.', user: mamiUser });
    } else {
      mamiUser = await prisma.user.create({
        data: {
          email: 'mami@lernstack.com',
          name: 'Mami',
          password: hashedPassword,
          role: 'ADMIN',
          isApproved: true,
          emailVerified: new Date(),
          tag: 'ADMIN'
        }
      });
      return NextResponse.json({ success: true, message: 'Mami hesabı yeni oluşturuldu.', user: mamiUser });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
