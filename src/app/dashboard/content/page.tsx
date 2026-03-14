'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import {
  Loader2,
  Search,
  Plus,
  Video,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ContentItem {
  id: string;
  contentId: string;
  title: string;
  description: string;
  status: string;
  updatedAt: string;
  creator: {
    id: string;
    name: string | null;
    surname: string | null;
    image: string | null;
  };
  _count: {
    videos: number;
    certificates: number;
  };
}

export default function ManageContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [contents, setContents] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{ page: number; pages: number; total: number } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (session?.user?.role === 'STUDENT') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (!session || (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN')) return;
    fetchContents();
  }, [session, page, search, statusFilter]);

  const fetchContents = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9',
        status: statusFilter,
        ...(search ? { search } : {}),
      });

      const res = await fetch(`/api/content/manage?${params}`);
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'İçerikler yüklenemedi');
        return;
      }

      setContents(data.contents || []);
      setPagination(data.pagination || null);
    } catch {
      toast.error('İçerikler yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublish = async (content: ContentItem) => {
    const nextStatus = content.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    setIsMutating(true);
    try {
      const res = await fetch(`/api/content/${content.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Durum güncellenemedi');
        return;
      }

      toast.success(nextStatus === 'PUBLISHED' ? 'İçerik yayınlandı' : 'İçerik taslağa alındı');
      fetchContents();
    } catch {
      toast.error('Durum güncellenemedi');
    } finally {
      setIsMutating(false);
    }
  };

  const handleDelete = async (contentId: string) => {
    if (!confirm('Bu içeriği silmek istediğinize emin misiniz?')) return;

    setIsMutating(true);
    try {
      const res = await fetch(`/api/content/${contentId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Silme işlemi başarısız');
        return;
      }

      toast.success('İçerik silindi');
      fetchContents();
    } catch {
      toast.error('Silme işlemi başarısız');
    } finally {
      setIsMutating(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  if (isLoading && contents.length === 0) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">İçerikleri Yönet</h1>
              <p className="text-surface-400 text-sm mt-1">İçeriklerinizi düzenleyin, yayınlayın veya kaldırın</p>
            </div>

            <Link href="/dashboard/content/new" className="btn-primary text-sm inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Yeni İçerik
            </Link>
          </motion.div>

          <div className="glass-card p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 text-surface-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Başlık, açıklama veya içerik ID ile ara"
                    className="input-field pl-10"
                  />
                </div>
              </form>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="input-field md:w-48"
              >
                <option value="ALL">Tüm Durumlar</option>
                <option value="DRAFT">Taslak</option>
                <option value="PUBLISHED">Yayında</option>
              </select>
            </div>
          </div>

          {contents.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <Video className="w-12 h-12 text-surface-600 mx-auto mb-3" />
              <h3 className="text-white text-xl font-bold mb-2">İçerik bulunamadı</h3>
              <p className="text-surface-400 text-sm">Filtreleri değiştirin veya yeni içerik ekleyin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contents.map((content, index) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="glass-card p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-white font-semibold line-clamp-2">{content.title}</h3>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                        content.status === 'PUBLISHED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {content.status === 'PUBLISHED' ? 'YAYINDA' : 'TASLAK'}
                    </span>
                  </div>

                  <p className="text-surface-400 text-sm line-clamp-2 mt-2">{content.description}</p>

                  <div className="mt-4 space-y-2 text-xs text-surface-500">
                    <p>ID: {content.contentId}</p>
                    <p className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Güncelleme: {new Date(content.updatedAt).toLocaleString('tr-TR')}
                    </p>
                    <p>{content._count.videos} video • {content._count.certificates} sertifika</p>
                    {session?.user?.role === 'ADMIN' && (
                      <p className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {content.creator?.name} {content.creator?.surname}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <Link
                      href={`/content/${content.id}`}
                      className="px-2 py-2 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 text-xs font-medium inline-flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Gör
                    </Link>

                    <button
                      onClick={() => handleTogglePublish(content)}
                      disabled={isMutating}
                      className="px-2 py-2 rounded-lg bg-brand-500/15 hover:bg-brand-500/25 text-brand-300 text-xs font-medium inline-flex items-center justify-center gap-1 disabled:opacity-60"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {content.status === 'PUBLISHED' ? 'Taslak' : 'Yayınla'}
                    </button>

                    <button
                      onClick={() => handleDelete(content.id)}
                      disabled={isMutating}
                      className="px-2 py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 text-xs font-medium inline-flex items-center justify-center gap-1 disabled:opacity-60"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Sil
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === i + 1
                      ? 'bg-brand-500 text-white'
                      : 'bg-surface-800 text-surface-300 hover:bg-surface-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
