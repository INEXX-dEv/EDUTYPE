'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Play,
  Shield,
  Award,
  Users,
  BookOpen,
  ArrowRight,
  Monitor,
  CheckCircle2,
  Lock,
  GraduationCap,
  BarChart3,
  Globe,
  ChevronDown,
  Zap,
} from 'lucide-react';

/* ─── animasyon yardımcıları ─── */
const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

/* ─── statik veri ─── */
const features = [
  {
    icon: Play,
    title: 'Akıllı Video Oynatıcı',
    description: 'İzlemediğiniz bölümlere atlayamazsınız — öğrenme süreci eksiksiz tamamlanır.',
    color: 'from-blue-500 to-cyan-400',
    delay: 0,
  },
  {
    icon: Shield,
    title: 'Güvenli Sınav Sistemi',
    description: 'Sekme değiştirme algılama ile her sınav dürüst ve güvenilir bir ortamda gerçekleşir.',
    color: 'from-violet-500 to-purple-400',
    delay: 0.08,
  },
  {
    icon: Award,
    title: 'Doğrulanabilir Sertifikalar',
    description: 'QR kodlu dijital sertifikalar — her zaman, her yerden anında doğrulanabilir.',
    color: 'from-amber-500 to-orange-400',
    delay: 0.16,
  },
  {
    icon: Users,
    title: 'Grup Yönetimi',
    description: 'Öğrencilerinizi gruplara ayırın, ilerlemeleri tek ekrandan takip edin.',
    color: 'from-emerald-500 to-teal-400',
    delay: 0.24,
  },
  {
    icon: BarChart3,
    title: 'İlerleme Takibi',
    description: 'Gerçek zamanlı grafiklerle her öğrencinin yolculuğunu net görün.',
    color: 'from-rose-500 to-pink-400',
    delay: 0.32,
  },
  {
    icon: Zap,
    title: 'Hızlı & Kesintisiz',
    description: 'Optimize edilmiş altyapı ile yavaş bağlantılarda bile pürüzsüz deneyim.',
    color: 'from-indigo-500 to-blue-400',
    delay: 0.4,
  },
];

const steps = [
  { step: '01', title: 'Kayıt Olun', desc: 'Google, GitHub veya e-posta ile saniyeler içinde başlayın.', icon: Globe },
  { step: '02', title: 'Dersleri İzleyin', desc: 'Video dersleri sırayla tamamlayın, notlar alın.', icon: Monitor },
  { step: '03', title: 'Sertifika Alın', desc: 'Sınavı geçin ve doğrulanabilir sertifikanızı indirin.', icon: Award },
];

/* ─── sayaç animasyonu bileşeni ─── */
function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1400;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);

  return <span ref={ref}>{value}{suffix}</span>;
}

/* ─── yatay kayan çizgi dekorasyon ─── */
function HorizontalLine() {
  return (
    <div className="overflow-hidden h-px w-full">
      <motion.div
        className="h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent"
        initial={{ x: '-100%' }}
        whileInView={{ x: '100%' }}
        transition={{ duration: 1.4, ease }}
        viewport={{ once: true }}
      />
    </div>
  );
}

/* ─── ana sayfa ─── */
export default function HomePage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState([
    { value: 0, suffix: '+', label: 'Öğrenci', icon: GraduationCap },
    { value: 0, suffix: '+', label: 'Video Ders', icon: Monitor },
    { value: 0, suffix: '', label: 'Öğretmen', icon: Users },
    { value: 0, suffix: '', label: 'İçerik', icon: BookOpen },
  ]);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats([
          { value: Number(data.students || 0), suffix: '+', label: 'Öğrenci', icon: GraduationCap },
          { value: Number(data.videos || 0), suffix: '+', label: 'Video Ders', icon: Monitor },
          { value: Number(data.teachers || 0), suffix: '', label: 'Öğretmen', icon: Users },
          { value: Number(data.contents || 0), suffix: '', label: 'İçerik', icon: BookOpen },
        ]);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-surface-950 overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* arka plan katmanları */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 pointer-events-none">
          {/* koyu gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(99,102,241,0.18),transparent)]" />

          {/* ince ızgara */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)
              `,
              backgroundSize: '72px 72px',
            }}
          />

          {/* sıvı blob'lar */}
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full bg-brand-600/10 blur-[120px] -top-40 -left-40"
            animate={{ x: [0, 40, 0], y: [0, 24, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[100px] top-1/3 -right-32"
            animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full bg-cyan-600/8 blur-[80px] bottom-0 left-1/3"
            animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          />
        </motion.div>

        {/* içerik */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 text-center">
          {/* amblem etiketi */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/8 text-brand-300 text-sm font-medium mb-10 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            Eğitimin gerçek adresi
          </motion.div>

          {/* başlık */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.15 }}
            className="text-5xl sm:text-7xl lg:text-[88px] font-black tracking-tight leading-[1.02] mb-7"
          >
            <span className="text-white">Öğrenmenin</span>
            <br />
            <span className="bg-gradient-to-r from-brand-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              tam da kendisi.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease, delay: 0.3 }}
            className="text-lg sm:text-xl text-surface-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Video dersler, güvenli sınavlar ve anında doğrulanabilir sertifikalar.
            Eğitimi ciddiye alan herkes için tasarlandı.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {session ? (
              <Link href="/dashboard" className="group btn-primary text-base py-4 px-8 flex items-center gap-2">
                Dashboard&apos;a Git
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link href="/auth/register" className="group btn-primary text-base py-4 px-8 flex items-center gap-2">
                  Ücretsiz Başla
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/contents" className="btn-secondary text-base py-4 px-8 flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  İçeriklere Göz At
                </Link>
              </>
            )}
          </motion.div>

          {/* güven satırı */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="mt-10 flex items-center justify-center gap-6 text-surface-500 text-sm"
          >
            {['Ücretsiz kayıt', 'Kredi kartı gerekmez', 'Anında erişim'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* dashboard önizleme */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease, delay: 0.6 }}
          className="relative z-10 w-full max-w-5xl mx-auto px-4 pb-16"
        >
          <div className="relative rounded-2xl overflow-hidden border border-surface-700/50 shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
            {/* tarayıcı çubuğu */}
            <div className="bg-surface-900/90 backdrop-blur-xl px-5 py-3 border-b border-surface-700/50 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-1 bg-surface-800 rounded-lg text-xs text-surface-400 flex items-center gap-2">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  lernstack.com/dashboard
                </div>
              </div>
            </div>

            {/* dashboard içi */}
            <div className="bg-surface-950 p-6">
              {/* üst kartlar */}
              <div className="grid grid-cols-3 gap-4 mb-5">
                {[
                  { label: 'Aktif Kurslar', value: '12', bar: 60, color: 'from-brand-500 to-brand-600' },
                  { label: 'Tamamlanan', value: '8', bar: 80, color: 'from-emerald-500 to-emerald-600' },
                  { label: 'Sertifikalar', value: '5', bar: 50, color: 'from-amber-500 to-amber-600' },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 + i * 0.12 }}
                    className="bg-surface-900/80 rounded-xl p-4 border border-surface-700/40"
                  >
                    <div className={`text-2xl font-black bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>{s.value}</div>
                    <div className="text-xs text-surface-400 mt-1 mb-3">{s.label}</div>
                    <div className="h-1 bg-surface-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${s.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${s.bar}%` }}
                        transition={{ duration: 1, delay: 1.3 + i * 0.12, ease }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* içerik kartları */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { from: 'from-brand-600/25', to: 'to-violet-600/25', title: 'Veri Analizi 101', prog: 75 },
                  { from: 'from-cyan-600/25', to: 'to-blue-600/25', title: 'İleri Seviye Excel', prog: 42 },
                  { from: 'from-emerald-600/25', to: 'to-teal-600/25', title: 'Sunum Teknikleri', prog: 100 },
                ].map((c, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 + i * 0.1 }}
                    className="bg-surface-900/60 rounded-xl overflow-hidden border border-surface-700/30"
                  >
                    <div className={`h-20 bg-gradient-to-br ${c.from} ${c.to}`} />
                    <div className="p-3">
                      <p className="text-xs font-medium text-surface-200 mb-2">{c.title}</p>
                      <div className="h-1 bg-surface-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-brand-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${c.prog}%` }}
                          transition={{ duration: 1.2, delay: 1.8 + i * 0.1, ease }}
                        />
                      </div>
                      <p className="text-[10px] text-surface-500 mt-1">{c.prog}% tamamlandı</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* alt parıltı */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-brand-500/15 blur-3xl rounded-full pointer-events-none" />
        </motion.div>

        {/* aşağı ok */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-surface-600"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="relative py-20 border-y border-surface-800/40">
        <HorizontalLine />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease }}
                className="text-center group"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <s.icon className="w-5 h-5 text-brand-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white tabular-nums">
                  <CountUp target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-surface-400 text-sm mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
        <HorizontalLine />
      </section>

      {/* ── ÖZELLİKLER ── */}
      <section className="relative py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-20"
          >
            <span className="text-brand-400 text-xs font-bold tracking-[0.2em] uppercase">Platform özellikleri</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mt-4 mb-4">
              Neden <span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">LernStack</span>?
            </h2>
            <p className="text-surface-400 text-lg max-w-xl mx-auto">
              Eğitim sürecinin her adımını düşünerek şekillendirdik.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: f.delay, duration: 0.65, ease }}
                whileHover={{ y: -4 }}
                className="glass-card p-8 group cursor-default"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-surface-400 text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NASIL ÇALIŞIR ── */}
      <section className="relative py-28 bg-surface-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-20"
          >
            <span className="text-cyan-400 text-xs font-bold tracking-[0.2em] uppercase">Başlangıç rehberi</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mt-4">
              3 adımda <span className="bg-gradient-to-r from-cyan-400 to-brand-400 bg-clip-text text-transparent">hazırsınız</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* bağlantı çizgisi */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px border-t border-dashed border-surface-700 z-0" />

            {steps.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.65, ease }}
                className="relative glass-card p-8 text-center z-10"
              >
                {/* adım numarası */}
                <div className="text-[72px] font-black text-brand-500/8 absolute top-3 right-5 leading-none select-none">{item.step}</div>

                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-brand-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-surface-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-36 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(99,102,241,0.12),transparent)]" />
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-brand-500/10 blur-[100px] top-0 left-1/4"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-violet-500/10 blur-[100px] bottom-0 right-1/4"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
              Eğitim yolculuğunuza
              <br />
              <span className="bg-gradient-to-r from-brand-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                bugün başlayın.
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-surface-400 text-lg mb-10 max-w-lg mx-auto">
              Kayıt ücretsiz. Kredi kartı gerekmez. İstediğiniz zaman iptal edebilirsiniz.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/auth/register"
                className="group btn-primary text-lg py-4 px-12 inline-flex items-center gap-2"
              >
                Ücretsiz hesap oluştur
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
