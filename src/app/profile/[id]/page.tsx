'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import {
  Loader2,
  User,
  School,
  BookOpen,
  Award,
  Eye,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PresenterProfile {
  id: string;
  name: string | null;
  surname: string | null;
  image: string | null;
  role: string;
  school: string | null;
  department: string | null;
  createdAt: string;
  _count: {
    contents: number;
    certificates: number;
    videoProgress: number;
  };
}

interface PresenterContent {
  id: string;
  title: string;
  description: string;
  contentId: string;
  thumbnail: string | null;
  createdAt: string;
  viewCount: number;
  _count: {
    videos: number;
    certificates: number;
  };
}

export default function PublicProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [profile, setProfile] = useState<PresenterProfile | null>(null);
  const [contents, setContents] = useState<PresenterContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (!userId || !session) return;
    fetchPresenterData();
  }, [userId, session]);

  const fetchPresenterData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Profil bilgisi yüklenemedi');
        router.push('/contents');
        return;
      }

      setProfile(data.user);
      setContents(data.contents || []);
    } catch {
      toast.error('Profil bilgisi yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const fullName = `${profile.name || ''} ${profile.surname || ''}`.trim() || 'Kullanıcı';
  const initials = `${profile.name?.[0] || ''}${profile.surname?.[0] || ''}`.trim() || 'KU';

  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center text-white font-bold text-xl">
                {profile.image ? (
                  <img src={profile.image} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-white line-clamp-1">{fullName}</h1>
                <p className="text-surface-400 text-sm mt-1">İçerik Sunan Profili</p>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-surface-400">
                  <span className="px-2.5 py-1 rounded-lg bg-brand-500/15 text-brand-300 font-medium">{profile.role}</span>
                  {profile.school && (
                    <span className="flex items-center gap-1">
                      <School className="w-3.5 h-3.5" />
                      {profile.school}
                    </span>
                  )}
                  {profile.department && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {profile.department}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Katılım: {new Date(profile.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              </div>

              {session?.user?.id === profile.id && (
                <Link href="/profile" className="btn-secondary text-sm">
                  Profili Düzenle
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              <div className="bg-surface-800/50 rounded-xl p-3">
                <p className="text-surface-500 text-xs">Yayınlanan İçerik</p>
                <p className="text-white text-xl font-bold mt-1">{contents.length}</p>
              </div>
              <div className="bg-surface-800/50 rounded-xl p-3">
                <p className="text-surface-500 text-xs">Toplam İçerik</p>
                <p className="text-white text-xl font-bold mt-1">{profile._count.contents}</p>
              </div>
              <div className="bg-surface-800/50 rounded-xl p-3">
                <p className="text-surface-500 text-xs">Sertifika</p>
                <p className="text-white text-xl font-bold mt-1">{profile._count.certificates}</p>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Diğer İçerikleri</h2>
            <span className="text-surface-500 text-sm">{contents.length} içerik</span>
          </div>

          {contents.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <User className="w-12 h-12 text-surface-600 mx-auto mb-3" />
              <p className="text-surface-400">Bu kullanıcı henüz yayınlanmış içerik paylaşmadı.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contents.map((content, index) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="glass-card p-4"
                >
                  <h3 className="text-white font-semibold line-clamp-2 min-h-[44px]">{content.title}</h3>
                  <p className="text-surface-400 text-sm mt-2 line-clamp-2 min-h-[40px]">{content.description}</p>

                  <div className="mt-3 text-xs text-surface-500 space-y-1">
                    <p>{content._count.videos} video • {content._count.certificates} sertifika</p>
                    <p className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {content.viewCount} görüntülenme</p>
                    <p className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> {content.contentId}</p>
                  </div>

                  <Link
                    href={`/content/${content.id}`}
                    className="mt-4 inline-flex items-center gap-1 text-brand-300 hover:text-brand-200 text-sm font-medium"
                  >
                    İçeriğe Git <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
