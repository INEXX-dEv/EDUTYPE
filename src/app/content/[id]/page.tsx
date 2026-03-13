'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
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
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDuration } from '@/lib/utils';

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
    } catch {
      toast.error('Bir hata oluştu');
    } finally {
      setIsLoading(false);
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
                <SmartVideoPlayer
                  src={currentVideo.url}
                  title={currentVideo.title}
                  videoId={currentVideo.id}
                  maxWatched={getVideoProgress(currentVideo.id)?.watchedSeconds || 0}
                  onProgress={handleProgress}
                  onComplete={handleVideoComplete}
                />
              ) : (
                <div className="aspect-video rounded-2xl bg-surface-900 flex items-center justify-center">
                  <p className="text-surface-400">Video bulunamadı</p>
                </div>
              )}

              {/* İçerik Bilgileri */}
              <div className="mt-6">
                <h1 className="text-2xl font-bold text-white mb-2">{content.title}</h1>
                <div className="flex items-center gap-4 text-surface-400 text-sm mb-4">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {content.creator?.name} {content.creator?.surname}
                  </span>
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
                    const accessible = isVideoAccessible(index);
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
