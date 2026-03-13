'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft } from 'lucide-react';

export default function DeveloperTermsPage() {
    return (
        <div className="min-h-screen bg-surface-950">
            <Navbar />
            <main className="pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/auth/register" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Kayıt Ol&apos;a Dön
                    </Link>
                    <h1 className="text-4xl font-black text-white mb-2">Geliştirici Sözleşmesi</h1>
                    <p className="text-surface-400 mb-4">INEXX INTERACTIVE — Platform Geliştirme ve Bakım Sözleşmesi</p>
                    <p className="text-surface-400 mb-12">Son güncelleme: 6 Mart 2026</p>
                    <div className="prose max-w-none space-y-8 text-surface-300 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Taraflar</h2>
                            <p>Bu sözleşme, LernStack platformunun (&quot;Platform&quot;) geliştiricisi ve işletmecisi olan INEXX INTERACTIVE (&quot;Geliştirici&quot;) ile platform kullanıcıları (&quot;Kullanıcılar&quot;) arasındaki hukuki çerçeveyi tanımlar.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Geliştirici Sorumlulukları</h2>
                            <p><strong className="text-white">2.1.</strong> INEXX INTERACTIVE, platform altyapısının güvenli ve stabil çalışmasını sağlamakla yükümlüdür.</p>
                            <p><strong className="text-white">2.2.</strong> Geliştirici, kullanıcı verilerinin 6698 sayılı KVKK ve AB GDPR&apos;ye uygun şekilde işlenmesini taahhüt eder.</p>
                            <p><strong className="text-white">2.3.</strong> Geliştirici, aşağıdaki güvenlik önlemlerini uygulamakla yükümlüdür:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>SSL/TLS şifreleme</li>
                                <li>Şifrelenmiş parola saklama (bcrypt)</li>
                                <li>Oturum güvenliği ve token yönetimi</li>
                                <li>Rate limiting ve brute-force koruması</li>
                                <li>Düzenli güvenlik güncellemeleri</li>
                            </ul>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Veri İşleme Sorumlulukları</h2>
                            <p><strong className="text-white">3.1.</strong> Geliştirici, KVKK ve GDPR kapsamında &quot;Veri İşleyen&quot; (Data Processor) sıfatıyla hareket eder.</p>
                            <p><strong className="text-white">3.2.</strong> Veri ihlali durumunda, Geliştirici 72 saat içinde KVKK Kurulu&apos;na ve gerektiğinde AB otoritelerine bildirir.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Fikri Mülkiyet</h2>
                            <p><strong className="text-white">4.1.</strong> Platform kaynak kodu, tasarımı, algoritmaları ve teknik altyapısına ilişkin tüm fikri mülkiyet hakları INEXX INTERACTIVE&apos;e aittir.</p>
                            <p><strong className="text-white">4.2.</strong> Kullanıcılar tarafından yüklenen içerikler üzerinde Geliştirici herhangi bir mülkiyet hakkı talep etmez.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">5. Servis Garantisi</h2>
                            <p><strong className="text-white">5.1.</strong> Platform &quot;olduğu gibi&quot; (as-is) sunulmaktadır.</p>
                            <p><strong className="text-white">5.2.</strong> Planlı bakım çalışmaları önceden duyurulur.</p>
                            <p><strong className="text-white">5.3.</strong> Force majeure durumlarında Geliştirici hizmet kesintisinden sorumlu tutulamaz.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">6. Uyuşmazlık ve Yetkili Mahkeme</h2>
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
