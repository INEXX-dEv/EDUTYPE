'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import {
  BookOpen,
  Award,
  Users,
  Play,
  Plus,
  BarChart3,
  Clock,
  TrendingUp,
  Bell,
  ArrowRight,
  GraduationCap,
  Video,
  FileText,
} from 'lucide-react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [recentContents, setRecentContents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      const [contentsRes, notifsRes] = await Promise.all([
        fetch('/api/content?limit=6'),
        fetch('/api/notifications?limit=5'),
      ]);

      if (contentsRes.ok) {
        const data = await contentsRes.json();
        setRecentContents(data.contents || []);
      }
      if (notifsRes.ok) {
        const data = await notifsRes.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Dashboard data error:', err);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const isTeacher = session.user.role === 'TEACHER';
  const isAdmin = session.user.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              Hoş geldin, <span className="gradient-text">{session.user.name || 'Kullanıcı'}</span>
            </h1>
            <p className="text-surface-400">
              {isTeacher
                ? 'İçeriklerinizi yönetin ve öğrencilerinizin ilerlemesini takip edin.'
                : isAdmin
                ? 'Platformu yönetin, kullanıcıları ve içerikleri kontrol edin.'
                : 'Eğitim yolculuğunuzda kaldığınız yerden devam edin.'}
            </p>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: isTeacher ? 'Yüklenen İçerik' : 'Aktif Kurslar',
                value: recentContents.length,
                icon: BookOpen,
                color: 'from-brand-500 to-brand-600',
              },
              {
                label: 'Sertifikalar',
                value: '0',
                icon: Award,
                color: 'from-amber-500 to-amber-600',
              },
              {
                label: isTeacher ? 'Öğrenci Sayısı' : 'İlerleme',
                value: isTeacher ? '0' : '%0',
                icon: isTeacher ? Users : TrendingUp,
                color: 'from-emerald-500 to-emerald-600',
              },
              {
                label: 'Bildirimler',
                value: notifications.length,
                icon: Bell,
                color: 'from-violet-500 to-violet-600',
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-surface-400 text-sm">{stat.label}</span>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Actions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">Hızlı İşlemler</h3>
              <div className="space-y-3">
                {isTeacher || isAdmin ? (
                  <>
                    <Link href="/dashboard/content/new" className="flex items-center gap-3 p-3 bg-surface-800/50 hover:bg-surface-700/50 rounded-xl transition-all group">
                      <Plus className="w-5 h-5 text-brand-400" />
                      <span className="text-surface-300 group-hover:text-white text-sm">Yeni İçerik Oluştur</span>
                    </Link>
                    <Link href="/dashboard/content" className="flex items-center gap-3 p-3 bg-surface-800/50 hover:bg-surface-700/50 rounded-xl transition-all group">
                      <Video className="w-5 h-5 text-cyan-400" />
                      <span className="text-surface-300 group-hover:text-white text-sm">İçerikleri Yönet</span>
                    </Link>
                    <Link href="/dashboard/groups" className="flex items-center gap-3 p-3 bg-surface-800/50 hover:bg-surface-700/50 rounded-xl transition-all group">
                      <Users className="w-5 h-5 text-violet-400" />
                      <span className="text-surface-300 group-hover:text-white text-sm">Öğrenci Grupları</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/contents" className="flex items-center gap-3 p-3 bg-surface-800/50 hover:bg-surface-700/50 rounded-xl transition-all group">
                      <Play className="w-5 h-5 text-brand-400" />
                      <span className="text-surface-300 group-hover:text-white text-sm">İçeriklere Göz At</span>
                    </Link>
                    <Link href="/profile" className="flex items-center gap-3 p-3 bg-surface-800/50 hover:bg-surface-700/50 rounded-xl transition-all group">
                      <GraduationCap className="w-5 h-5 text-cyan-400" />
                      <span className="text-surface-300 group-hover:text-white text-sm">Profili Düzenle</span>
                    </Link>
                    <Link href="/certificates" className="flex items-center gap-3 p-3 bg-surface-800/50 hover:bg-surface-700/50 rounded-xl transition-all group">
                      <Award className="w-5 h-5 text-amber-400" />
                      <span className="text-surface-300 group-hover:text-white text-sm">Sertifikalarım</span>
                    </Link>
                  </>
                )}
                {isAdmin && (
                  <Link href="/admin" className="flex items-center gap-3 p-3 bg-brand-500/10 hover:bg-brand-500/20 rounded-xl transition-all group border border-brand-500/20">
                    <BarChart3 className="w-5 h-5 text-brand-400" />
                    <span className="text-brand-300 group-hover:text-brand-200 text-sm font-medium">Admin Panel</span>
                  </Link>
                )}
              </div>
            </motion.div>

            {/* Recent Contents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6 lg:col-span-2"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Son İçerikler</h3>
                <Link href="/contents" className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">
                  Tümünü Gör <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {recentContents.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-surface-600 mx-auto mb-3" />
                  <p className="text-surface-400">Henüz içerik yok</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recentContents.slice(0, 4).map((content: any) => (
                    <Link
                      key={content.id}
                      href={`/content/${content.id}`}
                      className="flex items-start gap-3 p-3 bg-surface-800/30 hover:bg-surface-800/50 rounded-xl transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-500/30 to-violet-500/30 flex-shrink-0 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-brand-400" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-white line-clamp-1">{content.title}</h4>
                        <p className="text-xs text-surface-400 mt-0.5">
                          {content._count?.videos || 0} video • {content.creator?.name || 'Anonim'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Bildirimler</h3>
              <Link href="/notifications" className="text-brand-400 text-sm hover:text-brand-300">
                Tümünü Gör
              </Link>
            </div>
            {notifications.length === 0 ? (
              <p className="text-surface-400 text-center py-6">Bildirim yok</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notif: any) => (
                  <div key={notif.id} className="flex items-start gap-3 p-3 bg-surface-800/30 rounded-xl">
                    <Bell className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-white">{notif.title}</p>
                      <p className="text-xs text-surface-400 mt-0.5">{notif.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
