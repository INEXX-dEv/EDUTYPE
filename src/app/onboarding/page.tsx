'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Lock,
    Check,
    ArrowRight,
    Loader2,
    Eye,
    EyeOff,
    Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OnboardingPage() {
    const { data: session, update } = useSession();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [termsScrolled, setTermsScrolled] = useState(false);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const needsPasswordChange = session?.user?.mustChangePassword;

    const handleAcceptTerms = async () => {
        if (!termsAccepted) {
            toast.error('Sözleşmeleri kabul etmelisiniz');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ termsAccepted: true }),
            });

            if (!res.ok) {
                const data = await res.json();
                toast.error(data.error);
                return;
            }

            toast.success('Sözleşmeler kabul edildi');

            if (needsPasswordChange) {
                setStep(2);
            } else {
                await update();
                router.push('/dashboard');
                router.refresh();
            }
        } catch {
            toast.error('Bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword.length < 8) {
            toast.error('Şifre en az 8 karakter olmalıdır');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Şifreler eşleşmiyor');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword }),
            });

            if (!res.ok) {
                const data = await res.json();
                toast.error(data.error);
                return;
            }

            toast.success('Şifre değiştirildi! Hoş geldiniz.');
            await update();
            router.push('/dashboard');
            router.refresh();
        } catch {
            toast.error('Bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-950 flex items-center justify-center relative overflow-hidden py-12">
            <div className="absolute inset-0 bg-hero-gradient" />
            <div className="absolute inset-0 bg-gradient-mesh" />
            <div className="blob w-96 h-96 bg-brand-500/15 top-1/4 -left-48" />
            <div className="blob w-96 h-96 bg-accent-violet/15 bottom-1/4 -right-48" />

            <div className="relative z-10 w-full max-w-2xl mx-4">
                {/* Progress */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-brand-400' : 'text-surface-500'}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${step === 1 ? 'bg-brand-500 text-white' : step > 1 ? 'bg-emerald-500 text-white' : 'bg-surface-800 text-surface-500'}`}>
                            {step > 1 ? <Check className="w-5 h-5" /> : '1'}
                        </div>
                        <span className="text-sm font-medium hidden sm:block">Sözleşmeler</span>
                    </div>

                    {needsPasswordChange && (
                        <>
                            <div className="w-12 h-px bg-surface-700" />
                            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-brand-400' : 'text-surface-500'}`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${step === 2 ? 'bg-brand-500 text-white' : 'bg-surface-800 text-surface-500'}`}>
                                    2
                                </div>
                                <span className="text-sm font-medium hidden sm:block">Şifre Değiştir</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Step 1: Terms */}
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card overflow-hidden"
                    >
                        <div className="p-6 border-b border-surface-700/50">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-brand-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Hoş Geldiniz!</h2>
                                    <p className="text-surface-400 text-sm">Devam etmek için sözleşmeleri kabul edin</p>
                                </div>
                            </div>
                        </div>

                        <div
                            className="max-h-[400px] overflow-y-auto p-6 text-surface-300 text-sm leading-relaxed space-y-4"
                            onScroll={(e) => {
                                const el = e.target as HTMLElement;
                                if (el.scrollHeight - el.scrollTop - el.clientHeight < 50) {
                                    setTermsScrolled(true);
                                }
                            }}
                        >
                            <p><strong className="text-white">1. Kullanım Şartları:</strong> LernStack platformunu kullanarak Kullanım Şartları&apos;nı, Gizlilik Politikası&apos;nı ve ilgili tüm sözleşmeleri kabul etmiş sayılırsınız.</p>
                            <p><strong className="text-white">2. Hesap Güvenliği:</strong> Hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi üçüncü kişilerle paylaşmamalısınız.</p>
                            <p><strong className="text-white">3. İçerik Kullanımı:</strong> Platform üzerindeki içerikleri izinsiz kopyalayamaz, dağıtamaz, satamaz veya ticari amaçlarla kullanamazsınız.</p>
                            <p><strong className="text-white">4. Kişisel Veriler:</strong> Kişisel verileriniz KVKK ve GDPR kapsamında işlenmektedir.</p>
                            <p><strong className="text-white">5. İçerik Sorumluluğu (Öğretmenler):</strong> Öğretmenler, yükledikleri içeriklerin hukuki sorumluluğunun tamamen kendilerine ait olduğunu kabul eder.</p>
                            <p><strong className="text-white">6. Telif Hakları:</strong> Yüklenen içeriklerin telif hakları içerik sahiplerine aittir.</p>
                            <p><strong className="text-white">7. Sınav Güvenliği:</strong> Sınav sırasında sayfa değiştirme algılanır.</p>
                            <p><strong className="text-white">8. Uyuşmazlık:</strong> Bu sözleşme Türkiye Cumhuriyeti kanunlarına tabidir.</p>
                            <div className="flex gap-4 pt-4 border-t border-surface-700/50 text-xs text-surface-500">
                                <Link href="/terms" target="_blank" className="text-brand-400 underline">Kullanım Şartları</Link>
                                <Link href="/privacy" target="_blank" className="text-brand-400 underline">Gizlilik Politikası</Link>
                                <Link href="/teacher-terms" target="_blank" className="text-brand-400 underline">Öğretmen Sözleşmesi</Link>
                                <Link href="/developer-terms" target="_blank" className="text-brand-400 underline">Geliştirici Sözleşmesi</Link>
                            </div>
                        </div>

                        <div className="p-6 border-t border-surface-700/50">
                            <label className="flex items-start gap-3 mb-4 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    disabled={!termsScrolled}
                                    className="mt-1 w-4 h-4 rounded border-surface-600 bg-surface-800 text-brand-500 focus:ring-brand-500"
                                />
                                <span className={`text-sm ${termsScrolled ? 'text-surface-200' : 'text-surface-500'}`}>
                                    Tüm sözleşmeleri okudum, anladım ve kabul ediyorum.
                                </span>
                            </label>
                            <button
                                onClick={handleAcceptTerms}
                                disabled={isLoading || !termsAccepted}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>{needsPasswordChange ? 'Devam Et' : 'Başla'} <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Password Change */}
                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                                <Lock className="w-6 h-6 text-brand-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Şifre Değiştir</h2>
                                <p className="text-surface-400 text-sm">Güvenliğiniz için yeni bir şifre belirleyin</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-surface-300 mb-1.5 block">Yeni Şifre</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="En az 8 karakter"
                                        className="input-field pl-10 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-surface-300 mb-1.5 block">Şifre Tekrar</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Şifreyi tekrar girin"
                                        className="input-field pl-10"
                                    />
                                </div>
                            </div>

                            <div className="glass-card p-4 space-y-2">
                                <p className="text-xs font-medium text-surface-300 mb-2">Şifre Gereksinimleri:</p>
                                <RequirementRow met={newPassword.length >= 8} text="En az 8 karakter" />
                                <RequirementRow met={/[A-Z]/.test(newPassword)} text="En az bir büyük harf" />
                                <RequirementRow met={/[a-z]/.test(newPassword)} text="En az bir küçük harf" />
                                <RequirementRow met={/[0-9]/.test(newPassword)} text="En az bir rakam" />
                                <RequirementRow met={newPassword.length > 0 && newPassword === confirmPassword} text="Şifreler eşleşiyor" />
                            </div>

                            <button
                                onClick={handleChangePassword}
                                disabled={isLoading || newPassword.length < 8 || newPassword !== confirmPassword}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>Şifreyi Değiştir ve Başla <Check className="w-4 h-4" /></>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function RequirementRow({ met, text }: { met: boolean; text: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${met ? 'bg-emerald-500' : 'bg-surface-700'}`}>
                {met && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <span className={`text-xs ${met ? 'text-emerald-400' : 'text-surface-500'}`}>{text}</span>
        </div>
    );
}
