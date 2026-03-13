'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-surface-950">
            <Navbar />
            <main className="pt-24 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link href="/auth/register" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Kayıt Ol&apos;a Dön
                    </Link>
                    <h1 className="text-4xl font-black text-white mb-2">Gizlilik Politikası</h1>
                    <p className="text-surface-400 mb-12">Son güncelleme: 6 Mart 2026</p>
                    <div className="prose max-w-none space-y-8 text-surface-300 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Toplanan Veriler</h2>
                            <p>INEXX INTERACTIVE olarak, 6698 sayılı KVKK ve AB GDPR kapsamında aşağıdaki kişisel verileri toplamaktayız:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong className="text-white">Kimlik bilgileri:</strong> İsim, soyisim, email adresi</li>
                                <li><strong className="text-white">Hesap bilgileri:</strong> Öğrenci/öğretmen numarası, okul, bölüm</li>
                                <li><strong className="text-white">Kullanım verileri:</strong> İzleme geçmişi, sınav sonuçları, ilerleme bilgileri</li>
                                <li><strong className="text-white">Teknik veriler:</strong> IP adresi, tarayıcı bilgisi, cihaz bilgisi</li>
                            </ul>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Veri İşleme Amaçları</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Platform hizmetlerinin sunulması ve iyileştirilmesi</li>
                                <li>Kullanıcı hesaplarının yönetimi ve güvenliği</li>
                                <li>Eğitim ilerlemesinin takibi ve raporlanması</li>
                                <li>Sertifika oluşturma ve doğrulama</li>
                                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                            </ul>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Veri Saklama ve Güvenlik</h2>
                            <p>3.1. Veriler SSL/TLS şifreleme ile korunmaktadır.</p>
                            <p>3.2. Şifreler bcrypt ile hash&apos;lenerek saklanır, düz metin olarak asla saklanmaz.</p>
                            <p>3.3. Kişisel veriler, hesap aktif olduğu sürece veya yasal zorunlulukların gerektirdiği süre boyunca saklanır.</p>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Kullanıcı Hakları</h2>
                            <p>KVKK m.11 ve GDPR m.15-22 kapsamında haklarınız:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Kişisel verilerinize erişim hakkı</li>
                                <li>Verilerin düzeltilmesini isteme hakkı</li>
                                <li>Verilerin silinmesini isteme hakkı (unutulma hakkı)</li>
                                <li>Veri işlemenin kısıtlanmasını isteme hakkı</li>
                                <li>Veri taşınabilirliği hakkı</li>
                                <li>Otomatik karar almaya itiraz hakkı</li>
                            </ul>
                            <p>Haklarınızı kullanmak için info@lernstack.com adresinden bize ulaşabilirsiniz.</p>
                        </section>
                        <section className="border-t border-surface-800/50 pt-8">
                            <p className="text-surface-500 text-sm">Bu gizlilik politikası INEXX INTERACTIVE tarafından hazırlanmıştır. İletişim: info@lernstack.com</p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
