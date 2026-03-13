'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validations';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Github, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ease = [0.22, 1, 0.36, 1] as const;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Başarıyla giriş yapıldı!');
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      toast.error('Bir sorun oluştu. Lütfen tekrar deneyin.');
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_30%_50%,rgba(99,102,241,0.18),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)`,
            backgroundSize: '56px 56px',
          }}
        />

        {/* blur blob'lar */}
        <motion.div
          className="absolute w-96 h-96 bg-brand-500/15 rounded-full blur-[100px]"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-72 h-72 bg-violet-500/10 rounded-full blur-[80px] translate-x-32 translate-y-20"
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        />

        {/* içerik */}
        <div className="relative z-10 max-w-sm px-8">
          <Link href="/" className="inline-flex mb-12">
            <span className="text-3xl font-black tracking-tight text-white">
              Lern<span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">Stack</span>
            </span>
          </Link>

          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Öğrenmeye<br />devam et.
          </h2>
          <p className="text-surface-400 text-base leading-relaxed mb-10">
            Kaldığınız yerden devam edin. Video dersleriniz, sertifikalarınız ve ilerlemeniz sizi bekliyor.
          </p>

          <div className="space-y-3">
            {[
              'Video dersler, dilediğiniz zamanda',
              'Güvenli sınav sistemi',
              'Anında doğrulanabilir sertifikalar',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3 text-surface-300 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sağ form paneli ── */}
      <div className="flex-1 lg:max-w-lg flex flex-col items-center justify-center px-6 py-12 relative">

        {/* mobil logo */}
        <div className="lg:hidden mb-10">
          <Link href="/">
            <span className="text-2xl font-black tracking-tight text-white">
              Lern<span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">Stack</span>
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
          className="w-full max-w-sm"
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Tekrar hoş geldiniz</h1>
            <p className="text-surface-400 text-sm">Hesabınıza giriş yapın</p>
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

          {/* ayraç */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-surface-800" />
            <span className="text-surface-600 text-xs">veya e-posta ile</span>
            <div className="flex-1 h-px bg-surface-800" />
          </div>

          {/* form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* e-posta */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="email"
                  placeholder="E-posta adresi"
                  className="input-field pl-10"
                  {...register('email')}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.email.message}</p>}
            </div>

            {/* şifre */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Şifre"
                  className="input-field pl-10 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.password.message}</p>}
            </div>

            {/* şifremi unuttum */}
            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="text-brand-400 text-xs hover:text-brand-300 transition-colors">
                Şifremi unuttum
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Giriş Yap <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-surface-500 text-sm mt-6 mb-8">
            Hesabınız yok mu?{' '}
            <Link href="/auth/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Kayıt olun
            </Link>
          </p>

          <div className="pt-6 border-t border-surface-800/50 flex flex-col items-center">
            <span className="text-[10px] tracking-widest text-surface-500 uppercase mb-1">Developed By</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              <span className="font-mono text-xs font-semibold tracking-wider text-surface-300">
                INEXX INTERACTIVE
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
