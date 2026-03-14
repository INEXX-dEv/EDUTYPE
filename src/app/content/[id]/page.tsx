'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { SmartVideoPlayer } from '@/components/video/SmartVideoPlayer';
import { ExternalLinkModal } from '@/components/ExternalLinkModal';
import {
  Play,
  CheckCircle2,
  Lock,
  Clock,
  User,
  Award,
  BookOpen,
  ArrowRight,
  FileText,
  Loader2,
  ExternalLink,
  UserPlus,
  Unlock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDuration } from '@/lib/utils';

const getEnrollmentStorageKey = (userId: string) => `lernstack-enrollments:${userId}`;

const readEnrollmentFromStorage = (userId: string, contentId: string) => {
  if (typeof window === 'undefined') return false;

  try {
    const raw = window.localStorage.getItem(getEnrollmentStorageKey(userId));
    if (!raw) return false;
    const parsed = JSON.parse(raw) as string[];
    return parsed.includes(contentId);
  } catch {
    return false;
  }
};

const writeEnrollmentToStorage = (userId: string, contentId: string) => {
  if (typeof window === 'undefined') return;

  try {
    const raw = window.localStorage.getItem(getEnrollmentStorageKey(userId));
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    const next = parsed.includes(contentId) ? parsed : [...parsed, contentId];
    window.localStorage.setItem(getEnrollmentStorageKey(userId), JSON.stringify(next));
  } catch {
    // Ignore storage parse errors to avoid blocking playback.
  }
};

export default function ContentDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const contentId = params.id as string;

  const [content, setContent] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [certificate, setCertificate] = useState<any>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Dış link modalı state
  const [externalLinkModal, setExternalLinkModal] = useState<{ url: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (contentId && session) {
      fetchContent();
    }
  }, [contentId, session]);

  const fetchContent = async () => {
    try {
      const res = await fetch(`/api/content/${contentId}`);
      if (!res.ok) {
        toast.error('İçerik bulunamadı');
        router.push('/contents');
        return;
      }
      const data = await res.json();
      setContent(data.content);
      setProgress(data.progress || []);
      setCertificate(data.certificate);

      const isCreatorOrAdmin =
        session?.user?.role === 'ADMIN' ||
        data.content?.creator?.id === session?.user?.id;
      const hasServerEnrollment = (data.progress?.length || 0) > 0 || Boolean(data.certificate);
      const hasStoredEnrollment = session?.user?.id
        ? readEnrollmentFromStorage(session.user.id, contentId)
        : false;

      setIsEnrolled(isCreatorOrAdmin || hasServerEnrollment || hasStoredEnrollment);
    } catch {
      toast.error('Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!session?.user?.id) {
      router.push('/auth/login');
      return;
    }

    setIsRegistering(true);
    try {
      const firstVideo = content?.videos?.[0];

      // Persist server-side by creating initial progress on first video.
      if (firstVideo) {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoId: firstVideo.id,
            currentTime: 0,
            maxWatched: 0,
            totalDuration: firstVideo.duration || 0,
          }),
        });
      }

      writeEnrollmentToStorage(session.user.id, contentId);
      setIsEnrolled(true);
      toast.success('İçeriğe kayıt oldunuz. Kilit açıldı!');
      fetchContent();
    } catch {
      toast.error('Kayıt işlemi sırasında bir hata oluştu');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleProgress = async (currentTime: number, maxWatched: number) => {
    if (!content?.videos?.[currentVideoIndex]) return;
    const video = content.videos[currentVideoIndex];

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video.id,
          currentTime,
          maxWatched,
          totalDuration: video.duration,
        }),
      });
    } catch {}
  };

  const handleVideoComplete = () => {
    toast.success('Video tamamlandı!');
    if (content?.videos && currentVideoIndex < content.videos.length - 1) {
      setTimeout(() => setCurrentVideoIndex(currentVideoIndex + 1), 1500);
    }
  };

  const getVideoProgress = (videoId: string) => {
    return progress.find((p) => p.videoId === videoId);
  };

  const isVideoAccessible = (index: number) => {
    if (index === 0) return true;
    const prevVideo = content?.videos?.[index - 1];
    if (!prevVideo) return true;
    const prevProgress = getVideoProgress(prevVideo.id);
    return prevProgress?.completed || false;
  };

  const allVideosCompleted = content?.videos?.every((v: any) => {
    const p = getVideoProgress(v.id);
    return p?.completed;
  });

  // Dış link tıklama işleyicisi — modal açar
  const handleExternalLink = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    setExternalLinkModal({ url });
  };

  // Modal onaylandında linki aç
  const confirmExternalLink = () => {
    if (externalLinkModal) {
      window.open(externalLinkModal.url, '_blank', 'noopener,noreferrer');
    }
    setExternalLinkModal(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (!content) return null;

  const currentVideo = content.videos?.[currentVideoIndex];
  const isCreatorOrAdmin =
    session?.user?.role === 'ADMIN' ||
    content?.creator?.id === session?.user?.id;
  const hasServerEnrollment = progress.length > 0 || Boolean(certificate);
  const canAccessContent = isCreatorOrAdmin || isEnrolled || hasServerEnrollment;
  const creatorName = `${content.creator?.name || ''} ${content.creator?.surname || ''}`.trim() || 'İçerik Sahibi';
  const creatorInitials = `${content.creator?.name?.[0] || ''}${content.creator?.surname?.[0] || ''}`.trim() || 'IS';

  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />

      {/* Dış Link Uyarı Modalı */}
      {externalLinkModal && (
        <ExternalLinkModal
          url={externalLinkModal.url}
          onConfirm={confirmExternalLink}
          onCancel={() => setExternalLinkModal(null)}
        />
      )}

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Oynatıcı */}
            <div className="lg:col-span-2">
              {currentVideo ? (
                canAccessContent ? (
                  <SmartVideoPlayer
                    src={currentVideo.url}
                    title={currentVideo.title}
                    videoId={currentVideo.id}
                    maxWatched={getVideoProgress(currentVideo.id)?.watchedSeconds || 0}
                    onProgress={handleProgress}
                    onComplete={handleVideoComplete}
                  />
                ) : (
                  <div className="aspect-video rounded-2xl bg-surface-900 border border-surface-700/60 flex items-center justify-center p-6">
                    <div className="text-center max-w-md">
                      <div className="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-7 h-7 text-brand-400" />
                      </div>
                      <h3 className="text-white font-bold text-xl mb-2">Bu içerik kilitli</h3>
                      <p className="text-surface-400 text-sm mb-5">
                        Videoları izlemek için önce içeriğe kayıt olun. Kayıt sonrası oynatıcı ve video listesi açılır.
                      </p>
                      <button
                        onClick={handleEnroll}
                        disabled={isRegistering}
                        className="btn-primary inline-flex items-center gap-2"
                      >
                        {isRegistering ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" /> İçeriğe Kayıt Ol
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="aspect-video rounded-2xl bg-surface-900 flex items-center justify-center">
                  <p className="text-surface-400">Video bulunamadı</p>
                </div>
              )}

              {/* İçerik Bilgileri */}
              <div className="mt-6">
                <h1 className="text-2xl font-bold text-white mb-2">{content.title}</h1>
                <div className="flex items-center gap-4 text-surface-400 text-sm mb-4">
                  {content.creator?.id ? (
                    <Link
                      href={`/profile/${content.creator.id}`}
                      className="flex items-center gap-1 hover:text-brand-300 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      {creatorName}
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {creatorName}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {content.videos?.length || 0} video
                  </span>
                  <span className="text-xs bg-surface-800 px-2 py-1 rounded-lg">
                    ID: {content.contentId}
                  </span>
                </div>
                <div className="glass-card p-4">
                  <p className="text-surface-300 leading-relaxed">{content.description}</p>
                </div>

                {!canAccessContent && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-amber-300 text-sm">
                      <Unlock className="w-4 h-4" />
                      İçeriğe kayıt olunca kilit açılır.
                    </div>
                    <button
                      onClick={handleEnroll}
                      disabled={isRegistering}
                      className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-medium transition-colors disabled:opacity-60"
                    >
                      {isRegistering ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                    </button>
                  </div>
                )}

                {content.creator?.id && (
                  <div className="mt-6 glass-card p-5">
                    <p className="text-surface-400 text-xs mb-3">İçeriği Sunan</p>
                    <Link
                      href={`/profile/${content.creator.id}`}
                      className="flex items-center gap-4 p-3 rounded-xl bg-surface-800/40 hover:bg-surface-800/70 border border-surface-700/50 hover:border-brand-500/40 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center text-white font-bold">
                        {content.creator?.image ? (
                          <img src={content.creator.image} alt={creatorName} className="w-full h-full object-cover" />
                        ) : (
                          creatorInitials
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold line-clamp-1">{creatorName}</p>
                        <p className="text-surface-400 text-xs mt-0.5 line-clamp-1">
                          {content._count?.videos || 0} video • {content.viewCount || 0} görüntülenme
                        </p>
                        <p className="text-brand-300 text-xs mt-1">Diğer içeriklerini görüntüle</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-surface-500 group-hover:text-brand-300 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Ders Kaynakları / Ek Linkler */}
              {content.resources && content.resources.length > 0 && (
                <div className="mt-6 glass-card p-6">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-brand-400" />
                    Ders Kaynakları
                  </h3>
                  <div className="space-y-3">
                    {content.resources.map((resource: any, i: number) => (
                      <button
                        key={i}
                        onClick={(e) => handleExternalLink(resource.url, e)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-800/50 hover:bg-surface-800 border border-surface-700/40 hover:border-brand-500/30 transition-all text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
                          <ExternalLink className="w-4 h-4 text-brand-400" />
                        </div>
                        <span className="text-surface-300 text-sm group-hover:text-white transition-colors flex-1 truncate">
                          {resource.title || resource.url}
                        </span>
                        <ArrowRight className="w-4 h-4 text-surface-600 group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sınav Bölümü */}
              {content.hasExam && content.exam && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 glass-card p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-brand-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Sınav</h3>
                      <p className="text-surface-400 text-sm">{content.exam.questions?.length || 0} soru</p>
                    </div>
                  </div>

                  {allVideosCompleted ? (
                    <a
                      href={`/exam/${content.exam.id}?contentId=${contentId}`}
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      Sınava Başla <ArrowRight className="w-4 h-4" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-300 text-sm">Sınava girmek için tüm videoları tamamlayın</span>
                    </div>
                  )}

                  {certificate && (
                    <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3">
                      <Award className="w-6 h-6 text-emerald-400" />
                      <div>
                        <p className="text-emerald-300 font-medium text-sm">Sertifika Kazanıldı!</p>
                        <p className="text-emerald-400/60 text-xs">Kod: {certificate.certificateCode}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Video Listesi Kenar Çubuğu */}
            <div className="lg:col-span-1">
              <div className="glass-card p-4 sticky top-24">
                <h3 className="text-white font-bold mb-4">Video Listesi</h3>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {content.videos?.map((video: any, index: number) => {
                    const videoProgress = getVideoProgress(video.id);
                    const accessible = canAccessContent && isVideoAccessible(index);
                    const isActive = index === currentVideoIndex;

                    return (
                      <button
                        key={video.id}
                        onClick={() => accessible && setCurrentVideoIndex(index)}
                        disabled={!accessible}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                          isActive
                            ? 'bg-brand-500/20 border border-brand-500/30'
                            : accessible
                            ? 'hover:bg-surface-800/50'
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          videoProgress?.completed
                            ? 'bg-emerald-500/20'
                            : isActive
                            ? 'bg-brand-500'
                            : 'bg-surface-800'
                        }`}>
                          {videoProgress?.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : !accessible ? (
                            <Lock className="w-3 h-3 text-surface-500" />
                          ) : (
                            <Play className="w-3 h-3 text-white" fill={isActive ? 'white' : 'transparent'} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium line-clamp-1 ${isActive ? 'text-brand-300' : 'text-surface-300'}`}>
                            {video.title}
                          </p>
                          {video.duration > 0 && (
                            <p className="text-xs text-surface-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(video.duration)}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
