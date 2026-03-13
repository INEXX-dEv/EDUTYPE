# EDUTYPE - Ağ Temelleri Eğitim Platformu

Modern, güvenli ve interaktif bir eğitim platformu. **Next.js 14**, **TypeScript**, **Tailwind CSS**, **Prisma** ve **PostgreSQL** ile geliştirilmiştir.

## Özellikler

### 🎓 Kullanıcı Rolleri
- **Admin**: Tam yönetim yetkisi, kullanıcı yönetimi, sistem izleme
- **Öğretmen**: İçerik oluşturma, video yükleme, sınav hazırlama, grup yönetimi
- **Öğrenci**: İçerik izleme, sınav çözme, sertifika kazanma

### 📹 Akıllı Video Oynatıcı
- İzlenmemiş kısımlar atlanamaz
- İzlenen bölümlere geri sarılabilir
- Otomatik ilerleme takibi
- Video tamamlanma kontrolü

### 📝 Sınav Sistemi
- Her soru 3-5 seçenekli
- Sekme değiştirme tespiti (sınav yeniden başlar)
- Otomatik puanlama
- Başarılı olanlara sertifika

### 🏆 Sertifika Sistemi
- Unique sertifika kodu
- Doğrulanabilir sertifikalar
- Puan ve tarih bilgisi

### 👥 Öğrenci Grupları
- Grup oluşturma ve yönetim
- Üye ekleme/çıkarma
- İçerik paylaşma

### 🔐 Güvenlik
- OAuth (Google, GitHub) + Email/Şifre giriş
- Email doğrulama (6 haneli kod)
- Rate limiting & DDoS koruması
- Middleware ile route koruması
- Kullanıcı yasaklama

### 📊 Admin Paneli
- Kullanıcı yönetimi (CRUD, yasaklama, onaylama)
- Sistem izleme (CPU, RAM, Uptime)
- Rate limit / DDoS kayıtları
- Sistem logları

## Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL
- npm/yarn/pnpm

### Adımlar

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. .env dosyasını yapılandır
cp .env.example .env
# DATABASE_URL, NEXTAUTH_SECRET, OAuth keys vs. ayarla

# 3. Veritabanını oluştur
npx prisma db push

# 4. Prisma client oluştur
npx prisma generate

# 5. Örnek verilerle doldur (opsiyonel)
npm run db:seed

# 6. Geliştirme sunucusunu başlat
npm run dev
```

## Demo Hesaplar (Seed sonrası)

| Rol | Email | Şifre |
|-----|-------|-------|
| Admin | admin@edutype.com | admin123 |
| Öğretmen | teacher@edutype.com | teacher123 |
| Öğrenci | student@edutype.com | student123 |

## Proje Yapısı

```
src/
├── app/
│   ├── api/              # API Routes
│   │   ├── auth/         # NextAuth + kayıt/doğrulama
│   │   ├── admin/        # Admin API
│   │   ├── content/      # İçerik CRUD
│   │   ├── certificates/ # Sertifika API
│   │   ├── exam/         # Sınav API
│   │   ├── groups/       # Grup API
│   │   ├── notifications/# Bildirim API
│   │   ├── profile/      # Profil API
│   │   ├── progress/     # Video ilerleme
│   │   └── upload/       # Dosya yükleme
│   ├── admin/            # Admin paneli
│   ├── auth/             # Giriş/kayıt sayfaları
│   ├── certificate/      # Sertifika detay
│   ├── certificates/     # Sertifika listesi
│   ├── content/          # İçerik detay
│   ├── contents/         # İçerik listesi
│   ├── dashboard/        # Dashboard + alt sayfalar
│   ├── exam/             # Sınav sayfası
│   ├── notifications/    # Bildirimler
│   ├── profile/          # Profil sayfası
│   └── search/           # Arama
├── components/
│   ├── exam/             # Sınav bileşeni
│   ├── layout/           # Navbar, Footer, Cookie
│   └── video/            # Akıllı video oynatıcı
├── lib/                  # Yardımcı kütüphaneler
└── middleware.ts          # Route koruması
```

## Teknoloji Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **DB**: PostgreSQL
- **Auth**: NextAuth.js (Google, GitHub, Credentials)
- **UI**: Lucide Icons, React Hot Toast, Custom Glass UI

## Lisans

MIT
