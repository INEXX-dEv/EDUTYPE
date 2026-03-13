const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'nesibe@lernstack.com';
  const rawPassword = 'nEsibe.3444';
  
  // Şifreyi hashle
  const hashedPassword = await bcrypt.hash(rawPassword, 12);
  
  // Kullanıcıyı veritabanına ekle / güncelle
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name: 'Nesibe',
      role: 'ADMIN',
      isApproved: true,
      tag: 'ADMIN' // Tam yetkili olması için ADMIN etiketi eklendi
    },
    create: {
      email,
      password: hashedPassword,
      name: 'Nesibe',
      role: 'ADMIN',
      isApproved: true,
      tag: 'ADMIN'
    }
  });
  
  console.log(`✅ Kullanıcı oluşturuldu veya güncellendi: ${user.email} (Rol: ${user.role})`);
}

main()
  .catch(e => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
