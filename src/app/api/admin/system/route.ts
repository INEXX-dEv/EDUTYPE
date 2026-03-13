import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSystemMetrics, formatBytes, formatUptime } from '@/lib/system-monitor';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 });
    }

    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalAdmins,
      pendingTeachers,
      bannedUsers,
      totalContents,
      publishedContents,
      totalCertificates,
      totalExamAttempts,
      recentLogs,
      rateLimitRecords,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'TEACHER', isApproved: false } }),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.content.count(),
      prisma.content.count({ where: { status: 'PUBLISHED' } }),
      prisma.certificate.count(),
      prisma.examAttempt.count(),
      prisma.systemLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.rateLimitRecord.findMany({
        where: { windowStart: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        orderBy: { windowStart: 'desc' },
        take: 10,
      }),
    ]);

    const rawMetrics = getSystemMetrics();
    const systemMetrics = {
      cpu: rawMetrics.cpu,
      memory: {
        total: formatBytes(rawMetrics.memory.total),
        used: formatBytes(rawMetrics.memory.used),
        free: formatBytes(rawMetrics.memory.free),
        percentage: rawMetrics.memory.usagePercentage,
      },
      uptime: formatUptime(rawMetrics.uptime),
      platform: rawMetrics.platform,
      hostname: rawMetrics.hostname,
    };

    return NextResponse.json({
      stats: {
        users: { total: totalUsers, students: totalStudents, teachers: totalTeachers, admins: totalAdmins, pending: pendingTeachers, banned: bannedUsers },
        content: { total: totalContents, published: publishedContents },
        certificates: totalCertificates,
        examAttempts: totalExamAttempts,
      },
      system: systemMetrics,
      recentLogs,
      rateLimitRecords,
    });
  } catch {
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}
