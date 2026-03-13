'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, KeyRound, ArrowLeft, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const ease = [0.22, 1, 0.36, 1] as const;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'code' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) { toast.error('E-posta adresi gereklidir'); return; }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Şifre sıfırlama kodu gönderildi!');
      setStep('code');
    } catch { toast.error('Bir hata oluştu'); }
    finally { setIsLoading(false); }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) { toast.error('Lütfen 6 haneli kodu girin'); return; }
    setStep('reset');
  };

  const handleResetPassword = async () => {
    if (password !== confirmPassword) { toast.error('Şifreler eşleşmiyor'); return; }
    if (password.length < 8) { toast.error('Şifre en az 8 karakter olmalıdır'); return; }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success('Şifre başarıyla güncellendi!');
      router.push('/auth/login');
    } catch { toast.error('Bir hata oluştu'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex relative overflow-hidden">
      
      {/* ── Sol dekorasyon paneli (büyük ekranlarda) ── */}
      <div className="hidden lg:flex lg:flex-1 relative items-center justify-center overflow-hidden">
        {/* arka plan */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_70%_50%,rgba(244,63,94,0.12),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)`,
            backgroundSize: '56px 56px',
          }}
        />

        {/* blur blob'lar */}
        <motion.div
          className="absolute w-96 h-96 bg-rose-500/15 rounded-full blur-[100px]"
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-72 h-72 bg-orange-500/10 rounded-full blur-[80px] -translate-x-20 translate-y-32"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        {/* içerik */}
        <div className="relative z-10 max-w-sm px-8">
          <Link href="/" className="inline-flex mb-12">
            <span className="text-3xl font-black tracking-tight text-white">
              Lern<span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">Stack</span>
            </span>
          </Link>

          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6">
            <ShieldCheck className="w-8 h-8 text-rose-400" />
          </div>

          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Güvenliğe<br />önem veriyoruz.
          </h2>
          <p className="text-surface-400 text-base leading-relaxed">
            Hesabınızı korumak için buradayız. Şifrenizi unuttuysanız endişelenmeyin, 3 adımda güvenli bir şekilde sıfırlayabilirsiniz.
          </p>
        </div>
      </div>

      {/* ── Sağ form paneli ── */}
      <div className="flex-1 lg:max-w-xl flex flex-col items-center justify-center px-6 py-12 relative overflow-y-auto">
        
        {/* mobil logo */}
        <div className="lg:hidden mb-10 text-center">
          <Link href="/" className="inline-flex">
            <span className="text-2xl font-black tracking-tight text-white">
              Lern<span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">Stack</span>
            </span>
          </Link>
        </div>

        {/* geri bağlantısı */}
        <Link
          href="/auth/login"
          className="absolute top-6 right-6 text-surface-500 hover:text-surface-200 transition-colors flex items-center gap-1.5 text-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Giriş sayfasına dön
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease }}
          className="w-full max-w-sm pb-8"
        >
          <div className="mb-8 mt-6 lg:mt-0">
            <h1 className="text-2xl font-bold text-white mb-2">
              {step === 'email' ? 'Kilitli mi kaldınız?' : step === 'code' ? 'Doğrulama' : 'Yeni Şifre'}
            </h1>
            <p className="text-surface-400 text-sm leading-relaxed">
              {step === 'email'
                ? 'E-posta adresinizi girin, size şifrenizi yenilemek için 6 haneli bir kod gönderelim.'
                : step === 'code'
                ? `${email} adresine gönderilen 6 haneli güvenli kodu aşağıya girin.`
                : 'Lütfen tahmin edilmesi zor, yeni ve güvenli bir şifre belirleyin.'}
            </p>
          </div>

          {step === 'email' && (
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="email"
                  placeholder="E-posta adresi"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10 h-12"
                />
              </div>
              <button 
                onClick={handleSendCode} 
                disabled={isLoading} 
                className="btn-primary w-full flex items-center justify-center gap-2 h-12 mt-2 bg-rose-600 hover:bg-rose-500 shadow-rose-500/20 text-white"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Kod Gönder <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}

          {step === 'code' && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                className="input-field h-14 text-center text-3xl tracking-[0.5em] font-bold bg-surface-900/40"
              />
              <button 
                onClick={handleVerifyCode} 
                className="btn-primary w-full flex items-center justify-center gap-2 h-12 mt-2 bg-rose-600 hover:bg-rose-500 shadow-rose-500/20 text-white"
              >
                Doğrula <ArrowRight className="w-4 h-4" />
              </button>
              
              <p className="text-center text-xs text-surface-500 mt-4">
                Kod gelmedi mi?{' '}
                <button type="button" onClick={() => setStep('email')} className="text-rose-400 hover:text-rose-300">
                  E-posta adresini değiştir
                </button>
              </p>
            </div>
          )}

          {step === 'reset' && (
            <div className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Yeni şifre (en az 8 karakter)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10 h-12"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="password"
                  placeholder="Şifreyi tekrarla"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-10 h-12"
                />
              </div>
              <button 
                onClick={handleResetPassword} 
                disabled={isLoading} 
                className="btn-primary w-full flex items-center justify-center gap-2 h-12 mt-2 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 text-white"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Şifreyi Güncelle <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}

          <div className="pt-10 mt-10 border-t border-surface-800/50 flex flex-col items-center">
            <span className="text-[10px] tracking-widest text-surface-600 uppercase mb-2">Developed By</span>
            <div className="flex items-center gap-2 bg-surface-900/50 px-3 py-1.5 rounded-lg border border-surface-800">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
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
