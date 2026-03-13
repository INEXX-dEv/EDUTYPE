'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/lib/validations';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Github, Loader2, ArrowLeft, BookOpen, Award, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const ease = [0.22, 1, 0.36, 1] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'STUDENT' },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'Kayıt sırasında bir hata oluştu');
        return;
      }

      toast.success('Kayıt başarılı! Doğrulama kodunuzu kontrol edin.');
      router.push(`/auth/verify?email=${encodeURIComponent(data.email)}`);
    } catch {
      toast.error('Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSign = (_provider: string) => {
    toast('Bu özellik henüz aktif değil — çalışmalar sürüyor 🚧', {
      icon: '⚙️',
      style: {
        background: '#1e293b',
        color: '#e2e8f0',
        border: '1px solid #334155',
        borderRadius: '12px',
        fontSize: '14px',
      },
    });
  };

  return (
    <div className="min-h-screen bg-surface-950 flex relative overflow-hidden">

      {/* ── Sol dekorasyon paneli (büyük ekranlarda) ── */}
      <div className="hidden lg:flex lg:flex-1 relative items-center justify-center overflow-hidden">
        {/* arka plan */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_30%_50%,rgba(16,185,129,0.12),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)`,
            backgroundSize: '56px 56px',
          }}
        />

        {/* blur blob'lar */}
        <motion.div
          className="absolute w-96 h-96 bg-emerald-500/15 rounded-full blur-[100px]"
          animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-72 h-72 bg-teal-500/10 rounded-full blur-[80px] -translate-x-32 -translate-y-20"
          animate={{ x: [0, 20, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />

        {/* içerik */}
        <div className="relative z-10 max-w-sm px-8">
          <Link href="/" className="inline-flex mb-12">
            <span className="text-3xl font-black tracking-tight text-white">
              Lern<span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Stack</span>
            </span>
          </Link>

          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Aramıza<br />katılın.
          </h2>
          <p className="text-surface-400 text-base leading-relaxed mb-10">
            Binlerce öğrencinin ücretsiz olarak yeteneklerini geliştirdiği platformda yerinizi alın.
          </p>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-shrink-0 items-center justify-center mt-1">
                <BookOpen className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Zengin Kütüphane</h4>
                <p className="text-xs text-surface-400 leading-relaxed">Farklı kategorilerde onlarca eğitim içeriğine tek tıkla erişim.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex flex-shrink-0 items-center justify-center mt-1">
                <Award className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Geçerli Sertifikalar</h4>
                <p className="text-xs text-surface-400 leading-relaxed">Sınavları tamamlayın, QR kodlu doğrulanabilir sertifikalar kazanın.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex flex-shrink-0 items-center justify-center mt-1">
                <Users className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h4 className="text-white font-medium mb-1">Topluluk Odaklı</h4>
                <p className="text-xs text-surface-400 leading-relaxed">Eğitmenler ve sınıf arkadaşlarınızla etkileşimde bulunun.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sağ form paneli ── */}
      <div className="flex-1 lg:max-w-xl flex flex-col items-center justify-center px-6 py-12 relative overflow-y-auto">

        {/* mobil logo */}
        <div className="lg:hidden mb-8 mt-8">
          <Link href="/">
            <span className="text-2xl font-black tracking-tight text-white">
              Lern<span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Stack</span>
            </span>
          </Link>
        </div>

        {/* geri bağlantısı */}
        <Link
          href="/"
          className="absolute top-6 right-6 text-surface-500 hover:text-surface-200 transition-colors flex items-center gap-1.5 text-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Ana sayfa
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease }}
          className="w-full max-w-sm pb-8"
        >
          <div className="mb-8 mt-4 lg:mt-0">
            <h1 className="text-2xl font-bold text-white mb-1">Hesap oluştur</h1>
            <p className="text-surface-400 text-sm">Ücretsiz eğitim yolculuğuna başla</p>
          </div>

          {/* OAuth butonları */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => handleOAuthSign('google')}
              className="btn-secondary py-2.5 px-4 text-sm flex items-center justify-center gap-2 hover:border-surface-500"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button
              onClick={() => handleOAuthSign('github')}
              className="btn-secondary py-2.5 px-4 text-sm flex items-center justify-center gap-2 hover:border-surface-500"
            >
              <Github className="w-4 h-4" />
              GitHub
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-surface-800" />
            <span className="text-surface-600 text-xs">veya e-posta ile</span>
            <div className="flex-1 h-px bg-surface-800" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input type="text" placeholder="İsim" className="input-field pl-10" {...register('name')} />
                </div>
                {errors.name && <p className="text-red-400 text-xs mt-1 ml-1">{errors.name.message}</p>}
              </div>
              <div>
                <input type="text" placeholder="Soyisim" className="input-field" {...register('surname')} />
                {errors.surname && <p className="text-red-400 text-xs mt-1 ml-1">{errors.surname.message}</p>}
              </div>
            </div>

            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input type="email" placeholder="E-posta adresi" className="input-field pl-10" {...register('email')} />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input type={showPassword ? 'text' : 'password'} placeholder="Şifre" className="input-field pl-10 pr-10" {...register('password')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1 ml-1">{errors.password.message}</p>}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input type="password" placeholder="Şifre tekrar" className="input-field pl-10" {...register('confirmPassword')} />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1 ml-1">{errors.confirmPassword.message}</p>}
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="termsAccepted"
                className="mt-1 w-4 h-4 rounded border-surface-600 bg-surface-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                {...register('termsAccepted')}
              />
              <label htmlFor="termsAccepted" className="text-surface-400 text-xs leading-relaxed cursor-pointer select-none">
                <Link href="/terms" target="_blank" className="text-brand-400 hover:text-brand-300 underline">Kullanım Şartları</Link>,{' '}
                <Link href="/privacy" target="_blank" className="text-brand-400 hover:text-brand-300 underline">Gizlilik Politikası</Link> ve{' '}
                <Link href="/developer-terms" target="_blank" className="text-brand-400 hover:text-brand-300 underline">Geliştirici Sözleşmesi</Link>&apos;ni
                okudum, onaylıyorum.
              </label>
            </div>
            {errors.termsAccepted && <p className="text-red-400 text-xs ml-1">{errors.termsAccepted.message}</p>}

            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (<>Ücretsiz Kayıt Ol <ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>

          <p className="text-center text-surface-500 text-sm mt-6 mb-8">
            Zaten hesabınız var mı?{' '}
            <Link href="/auth/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Giriş yapın</Link>
          </p>

          <div className="pt-6 border-t border-surface-800/50 flex flex-col items-center">
            <span className="text-[10px] tracking-widest text-surface-600 uppercase mb-2">Developed By</span>
            <div className="flex items-center gap-2 bg-surface-900/50 px-3 py-1.5 rounded-lg border border-surface-800">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="font-mono text-xs font-medium tracking-wider text-surface-400">
                INEXX INTERACTIVE
              </span>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
