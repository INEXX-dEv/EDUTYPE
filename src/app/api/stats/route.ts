import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const [studentCount, teacherCount, videoCount, contentCount] = await Promise.all([
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.user.count({ where: { role: 'TEACHER', isApproved: true } }),
            prisma.video.count(),
            prisma.content.count({ where: { status: 'PUBLISHED' } }),
        ]);

        return NextResponse.json({
            students: studentCount,
            teachers: teacherCount,
            videos: videoCount,
            contents: contentCount,
        });
    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json(
            { students: 0, teachers: 0, videos: 0, contents: 0 }
        );
    }
}
