'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-surface-950">
            <Navbar />
            <main className="pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/auth/register" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Kayıt Ol&apos;a Dön
                    </Link>
                    <h1 className="text-4xl font-black text-white mb-2">Kullanım Şartları</h1>
                    <p className="text-surface-400 mb-12">Son güncelleme: 6 Mart 2026</p>
                    <div className="prose max-w-none space-y-8 text-surface-300 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Genel Hükümler</h2>
                            <p>Bu Kullanım Şartları (&quot;Sözleşme&quot;), LernStack platformunu (&quot;Platform&quot;) kullanan tüm kullanıcılar (&quot;Kullanıcı&quot;) ile INEXX INTERACTIVE (&quot;Şirket&quot;) arasındaki hukuki ilişkiyi düzenler. Platformu kullanarak bu şartları kabul etmiş sayılırsınız.</p>
                            <p>Bu sözleşme Türkiye Cumhuriyeti Anayasası, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK), 6502 sayılı Tüketicinin Korunması Hakkında Kanun, Avrupa Birliği Genel Veri Koruma Tüzüğü (GDPR), ABD Dijital Milenyum Telif Hakkı Yasası (DMCA) ve ilgili uluslararası mevzuat çerçevesinde hazırlanmıştır.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Hesap Oluşturma ve Sorumluluklar</h2>
                            <p>2.1. Platforma kayıt olmak için en az 13 yaşında olmanız gerekmektedir. 18 yaşından küçük kullanıcılar veli/vasi onayı ile kayıt olabilir.</p>
                            <p>2.2. Kayıt sırasında doğru ve güncel bilgiler vermekle yükümlüsünüz.</p>
                            <p>2.3. Hesap güvenliğinden siz sorumlusunuz. Şifrenizi üçüncü kişilerle paylaşmamalısınız.</p>
                            <p>2.4. Hesabınız üzerinden gerçekleştirilen tüm işlemlerden siz sorumlusunuz.</p>
                            <p>2.5. Şirket, herhangi bir zamanda, herhangi bir sebep belirtmeksizin hesabınızı askıya alabilir veya kapatabilir.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Platform Kullanım Kuralları</h2>
                            <p>Kullanıcılar aşağıdaki kurallara uymakla yükümlüdür:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Yasalara aykırı, müstehcen, ayrımcı veya taciz edici içerik paylaşmamak</li>
                                <li>Platform güvenliğini tehlikeye atacak eylemlerde bulunmamak</li>
                                <li>Diğer kullanıcıların kişisel bilgilerini izinsiz toplamak veya paylaşmamak</li>
                                <li>Platformun teknik altyapısına zarar verecek işlemler yapmamak</li>
                                <li>Otomatik bot, scraper veya benzeri araçlar kullanmamak</li>
                                <li>Sınav güvenliğini ihlal edecek davranışlarda bulunmamak</li>
                            </ul>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Fikri Mülkiyet Hakları</h2>
                            <p>4.1. Platform üzerindeki tüm içerikler (yazılım, tasarım, metin, görseller) 5846 sayılı Fikir ve Sanat Eserleri Kanunu kapsamında korunmaktadır.</p>
                            <p>4.2. Öğretmenler tarafından yüklenen içerikler, ilgili öğretmenin mülkiyetinde kalır.</p>
                            <p>4.3. Kullanıcılar, platform içeriklerini izinsiz kopyalayamaz, dağıtamaz, satamaz veya ticari amaçlarla kullanamaz.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Sınav ve Sertifika Kuralları</h2>
                            <p>5.1. Sınavlar sırasında sayfa değiştirme tespiti yapılmaktadır. Tespit edilen usulsüzlüklerde sınav geçersiz sayılır.</p>
                            <p>5.2. Sertifikalar, belirtilen başarı koşullarının sağlanması halinde otomatik olarak oluşturulur.</p>
                            <p>5.3. Her sertifika benzersiz bir doğrulama koduna sahiptir ve QR kod ile doğrulanabilir.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">6. Sorumluluk Sınırlandırması</h2>
                            <p>6.1. Platform &quot;olduğu gibi&quot; sunulmaktadır. Kesintisiz veya hatasız çalışma garantisi verilmez.</p>
                            <p>6.2. Şirket, platform kullanımından kaynaklanan doğrudan veya dolaylı zararlardan sorumlu tutulamaz.</p>
                            <p>6.3. 6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamındaki tüketici hakları saklıdır.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">7. Uyuşmazlık ve Yetkili Mahkeme</h2>
                            <p>Bu sözleşme Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıkların çözümünde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir. AB kullanıcıları, GDPR kapsamındaki haklarını kendi ülkelerindeki Veri Koruma Otoritelerine başvurarak kullanabilir.</p>
                        </section>
                        <section className="border-t border-surface-800/50 pt-8">
                            <p className="text-surface-500 text-sm">Bu sözleşme INEXX INTERACTIVE tarafından hazırlanmıştır. Sorularınız için info@lernstack.com adresinden iletişime geçebilirsiniz.</p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
