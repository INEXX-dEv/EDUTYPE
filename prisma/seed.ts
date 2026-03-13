import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin
  const adminPassword = await bcrypt.hash('XANTARES', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@lernstack.com' },
    update: {},
    create: {
      name: 'Admin',
      surname: 'User',
      email: 'admin@lernstack.com',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
      isApproved: true,
      school: 'EDUTYPE',
      department: 'Yönetim',
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // Create Teacher
  const teacherPassword = await bcrypt.hash('teacher123', 12);
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@edutype.com' },
    update: {},
    create: {
      name: 'Öğretmen',
      surname: 'Demo',
      email: 'teacher@edutype.com',
      password: teacherPassword,
      role: 'TEACHER',
      teacherId: 'TCH-2024-DEMO01',
      emailVerified: new Date(),
      isApproved: true,
      school: 'Demo Üniversitesi',
      department: 'Bilgisayar Mühendisliği',
    },
  });
  console.log(`✅ Teacher: ${teacher.email}`);

  // Create Student
  const studentPassword = await bcrypt.hash('student123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@edutype.com' },
    update: {},
    create: {
      name: 'Öğrenci',
      surname: 'Demo',
      email: 'student@edutype.com',
      password: studentPassword,
      role: 'STUDENT',
      studentId: 'STU-2024-DEMO01',
      emailVerified: new Date(),
      isApproved: true,
      school: 'Demo Üniversitesi',
      department: 'Bilgisayar Mühendisliği',
    },
  });
  console.log(`✅ Student: ${student.email}`);

  // Create sample content
  const content = await prisma.content.upsert({
    where: { contentId: 'NT-001' },
    update: {},
    create: {
      title: 'Ağ Temelleri - Giriş',
      description: 'Bu içerikte ağ temellerinin genel bir giriş dersi yer almaktadır. OSI modeli, TCP/IP protokol yapısı ve temel ağ kavramları işlenmektedir.',
      contentId: 'NT-001',
      status: 'PUBLISHED',
      hasExam: true,
      creatorId: teacher.id,
    },
  });

  const content2 = await prisma.content.upsert({
    where: { contentId: 'NT-002' },
    update: {},
    create: {
      title: 'IP Adresleme ve Alt Ağlar',
      description: 'IPv4 ve IPv6 adresleme yapıları, alt ağ maskeleri, CIDR notasyonu ve subnetting hesaplamaları.',
      contentId: 'NT-002',
      status: 'PUBLISHED',
      hasExam: true,
      creatorId: teacher.id,
    },
  });

  const content3 = await prisma.content.upsert({
    where: { contentId: 'NT-003' },
    update: {},
    create: {
      title: 'Ağ Cihazları ve Protokoller',
      description: 'Router, switch, hub, firewall gibi ağ cihazları ve HTTP, DNS, DHCP, ARP gibi temel protokollerin incelenmesi.',
      contentId: 'NT-003',
      status: 'PUBLISHED',
      hasExam: false,
      creatorId: teacher.id,
    },
  });
  console.log(`✅ 3 sample contents created`);

  // Create exam for content 1
  const exam = await prisma.exam.create({
    data: {
      title: 'Ağ Temelleri Giriş Sınavı',
      contentId: content.id,
      passingScore: 60,
      questions: {
        create: [
          {
            question: 'OSI modelinde kaç katman bulunur?',
            order: 0,
            options: {
              create: [
                { text: '5', isCorrect: false, order: 0 },
                { text: '6', isCorrect: false, order: 1 },
                { text: '7', isCorrect: true, order: 2 },
                { text: '8', isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: 'TCP/IP modelinde taşıma katmanında hangi protokol bağlantı odaklıdır?',
            order: 1,
            options: {
              create: [
                { text: 'UDP', isCorrect: false, order: 0 },
                { text: 'TCP', isCorrect: true, order: 1 },
                { text: 'ICMP', isCorrect: false, order: 2 },
              ],
            },
          },
          {
            question: 'IP adresi hangi OSI katmanında çalışır?',
            order: 2,
            options: {
              create: [
                { text: 'Veri Bağlantı', isCorrect: false, order: 0 },
                { text: 'Ağ', isCorrect: true, order: 1 },
                { text: 'Taşıma', isCorrect: false, order: 2 },
                { text: 'Uygulama', isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: 'MAC adresi kaç bittir?',
            order: 3,
            options: {
              create: [
                { text: '32 bit', isCorrect: false, order: 0 },
                { text: '48 bit', isCorrect: true, order: 1 },
                { text: '64 bit', isCorrect: false, order: 2 },
                { text: '128 bit', isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: 'DNS\'nin temel görevi nedir?',
            order: 4,
            options: {
              create: [
                { text: 'IP adresi atama', isCorrect: false, order: 0 },
                { text: 'Alan adlarını IP adreslerine çevirme', isCorrect: true, order: 1 },
                { text: 'Paket yönlendirme', isCorrect: false, order: 2 },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Exam created with 5 questions`);

  // Create a notification for student
  await prisma.notification.create({
    data: {
      recipientId: student.id,
      type: 'SYSTEM',
      title: 'Hoş Geldiniz!',
      message: 'EDUTYPE platformuna hoş geldiniz. Ağ Temelleri derslerine hemen başlayabilirsiniz.',
    },
  });
  console.log(`✅ Welcome notification created`);

  // Create a student group
  const group = await prisma.studentGroup.create({
    data: {
      name: 'Ağ Temelleri - 2024 Güz',
      description: '2024 güz dönemi Ağ Temelleri dersi öğrenci grubu',
      ownerId: teacher.id,
      members: {
        create: [
          { userId: teacher.id },
          { userId: student.id },
        ],
      },
    },
  });
  console.log(`✅ Student group created`);

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📌 Login credentials:');
  console.log('  Admin:    admin@edutype.com    / admin123');
  console.log('  Teacher:  teacher@edutype.com  / teacher123');
  console.log('  Student:  student@edutype.com  / student123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
