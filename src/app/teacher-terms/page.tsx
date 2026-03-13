'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft } from 'lucide-react';

export default function TeacherTermsPage() {
    return (
        <div className="min-h-screen bg-surface-950">
            <Navbar />
            <main className="pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/auth/register" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Kayıt Ol&apos;a Dön
                    </Link>
                    <h1 className="text-4xl font-black text-white mb-2">Öğretmen İçerik Sözleşmesi</h1>
                    <p className="text-surface-400 mb-12">Son güncelleme: 6 Mart 2026</p>
                    <div className="prose max-w-none space-y-8 text-surface-300 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Taraflar</h2>
                            <p>Bu sözleşme, LernStack platformunda (&quot;Platform&quot;) içerik yükleyen öğretmen (&quot;İçerik Sağlayıcı&quot;) ile platform işletmecisi INEXX INTERACTIVE (&quot;Şirket&quot;) arasında akdedilmiştir.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. İçerik Sorumlulukları</h2>
                            <p><strong className="text-white">2.1.</strong> İçerik Sağlayıcı, platforma yüklediği tüm içeriklerin hukuki sorumluluğunun tamamen kendisine ait olduğunu kabul eder.</p>
                            <p><strong className="text-white">2.2.</strong> İçerik Sağlayıcı, yüklediği içeriklerin:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Üçüncü kişilerin telif haklarını, ticari markalarını veya fikri mülkiyet haklarını ihlal etmediğini</li>
                                <li>Yasalara aykırı, müstehcen, nefret söylemi içeren veya ayrımcı unsurlar barındırmadığını</li>
                                <li>Kişisel verilerin korunması mevzuatına uygun olduğunu</li>
                                <li>Doğru, güncel ve eğitim amacına uygun olduğunu</li>
                            </ul>
                            <p>beyan ve taahhüt eder.</p>
                            <p><strong className="text-white">2.3.</strong> Şirket, içeriklerin doğruluğu, eksiksizliği veya kalitesi konusunda herhangi bir sorumluluk kabul etmez.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Telif Hakları ve Lisans</h2>
                            <p><strong className="text-white">3.1.</strong> Yüklenen içeriklerin tüm telif hakları İçerik Sağlayıcı&apos;ya aittir.</p>
                            <p><strong className="text-white">3.2.</strong> İçerik Sağlayıcı, Şirket&apos;e yalnızca platformda dağıtım amacıyla sınırlı, münhasır olmayan, coğrafi sınırlama içermeyen bir lisans tanır.</p>
                            <p><strong className="text-white">3.3.</strong> Bu lisans, 5846 sayılı Fikir ve Sanat Eserleri Kanunu, Bern Sözleşmesi, WIPO Telif Hakkı Anlaşması ve ABD DMCA (17 U.S.C. § 512) kapsamında tanımlanmıştır.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. İçerik Dağıtım Sınırlaması</h2>
                            <p><strong className="text-white">4.1.</strong> İçerik Sağlayıcı tarafından yüklenen içerikler, yalnızca İçerik Sağlayıcı&apos;nın oluşturduğu gruplara dahil olan öğrencilere sunulur.</p>
                            <p><strong className="text-white">4.2.</strong> Şirket, İçerik Sağlayıcı&apos;nın izni olmaksızın içerikleri başka gruplara veya genel erişime açamaz.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. DMCA ve Telif Hakkı Bildirimi</h2>
                            <p><strong className="text-white">5.1.</strong> Telif hakkı sahipleri, info@lernstack.com adresine bildirimde bulunabilir.</p>
                            <p><strong className="text-white">5.2.</strong> Şirket, geçerli bildirimleri 72 saat içinde işleme alır.</p>
                            <p><strong className="text-white">5.3.</strong> İçerik Sağlayıcı, karşı bildirim (counter-notice) hakkına sahiptir.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">6. Tazminat ve Sorumluluk</h2>
                            <p><strong className="text-white">6.1.</strong> İçerik Sağlayıcı, yüklediği içeriklerden kaynaklanan her türlü hukuki talep, dava, zarar ve masraftan Şirket&apos;i muaf tutar.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">7. Uygulanacak Hukuk</h2>
                            <p>Bu sözleşme Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıkların çözümünde İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.</p>
                        </section>
                        <section className="border-t border-surface-800/50 pt-8">
                            <p className="text-surface-500 text-sm">Bu sözleşme INEXX INTERACTIVE tarafından hazırlanmıştır. İletişim: info@lernstack.com</p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
