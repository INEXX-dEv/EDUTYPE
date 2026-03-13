'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const next = document.getElementById(`code-${index + 1}`);
      next?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prev = document.getElementById(`code-${index - 1}`);
      prev?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      toast.error('Lütfen 6 haneli kodu girin');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Doğrulama başarısız');
        return;
      }

      toast.success('Email doğrulandı! Giriş yapabilirsiniz.');
      router.push('/auth/login');
    } catch {
      toast.error('Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success('Yeni kod gönderildi!');
        setResendTimer(60);
      }
    } catch {
      toast.error('Kod gönderilemedi');
    }
  };

  return (
    <div className="glass-card p-8 md:p-10">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-brand-400" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-white text-center mb-2">Email Doğrulama</h1>
      <p className="text-surface-400 text-center text-sm mb-8">
        <span className="text-brand-300">{email}</span> adresine gönderilen 6 haneli kodu girin
      </p>

      <div className="flex justify-center gap-3 mb-8">
        {code.map((digit, i) => (
          <input
            key={i}
            id={`code-${i}`}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleCodeChange(i, e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-12 h-14 text-center text-xl font-bold bg-surface-900 border border-surface-700 rounded-xl text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
          />
        ))}
      </div>

      <button
        onClick={handleVerify}
        disabled={isLoading}
        className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
          <>Doğrula <ArrowRight className="w-4 h-4" /></>
        )}
      </button>

      <p className="text-center text-surface-400 text-sm">
        Kod almadınız mı?{' '}
        {resendTimer > 0 ? (
          <span className="text-surface-500">{resendTimer}s</span>
        ) : (
          <button onClick={handleResend} className="text-brand-400 hover:text-brand-300 font-medium">
            Tekrar Gönder
          </button>
        )}
      </p>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-gradient-mesh" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <Suspense fallback={<div className="glass-card p-8 text-center text-surface-400">Yükleniyor...</div>}>
          <VerifyForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
