'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Play,
  Lock,
  Eye,
  FileText,
  Video,
} from 'lucide-react';

export default function ContentsPage() {
  const { data: session } = useSession();
  const [contents, setContents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    fetchContents();
  }, [page, search]);

  const fetchContents = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search && { search }),
      });
      const res = await fetch(`/api/content?${params}`);
      if (res.ok) {
        const data = await res.json();
        setContents(data.contents);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchContents();
  };

  const contentImages = [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop',
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-black text-gray-900 mb-3">
              İçerikler
            </h1>
            <p className="text-gray-500 max-w-lg mx-auto">
              Video dersler, PDF materyaller ve sertifikalarla öğrenin
            </p>
          </motion.div>

          {/* Search */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSearch}
            className="max-w-xl mx-auto mb-12"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="İçerik ara..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all text-lg"
              />
            </div>
          </motion.form>

          {/* Content Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse shadow-sm">
                  <div className="h-48 bg-gray-100" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : contents.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl text-gray-900 mb-2">İçerik Bulunamadı</h3>
              <p className="text-gray-500">Aramanızı değiştirmeyi deneyin</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {contents.map((content, i) => (
                  <motion.div
                    key={content.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={session ? `/content/${content.id}` : '/auth/login'}>
                      <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1">
                        {/* Thumbnail */}
                        <div className="relative h-48 overflow-hidden">
                          {content.thumbnail ? (
                            <img
                              src={content.thumbnail}
                              alt={content.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <img
                              src={contentImages[i % contentImages.length]}
                              alt={content.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                          {!session && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex items-center gap-2 px-4 py-2 bg-white/90 rounded-xl">
                                <Lock className="w-4 h-4 text-gray-700" />
                                <span className="text-gray-700 text-sm font-medium">Giriş Gerekli</span>
                              </div>
                            </div>
                          )}

                          {/* Badges */}
                          <div className="absolute top-3 left-3 flex gap-2">
                            {(content._count?.videos || 0) > 0 && (
                              <div className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg flex items-center gap-1.5">
                                <Video className="w-3 h-3 text-brand-500" />
                                <span className="text-gray-700 text-xs font-medium">{content._count?.videos} video</span>
                              </div>
                            )}
                            {content.pdfUrl && (
                              <div className="px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg flex items-center gap-1.5">
                                <FileText className="w-3 h-3 text-emerald-500" />
                                <span className="text-gray-700 text-xs font-medium">PDF</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="p-5">
                          <h3 className="text-gray-900 font-semibold mb-2 line-clamp-1 group-hover:text-brand-600 transition-colors">
                            {content.title}
                          </h3>
                          <p className="text-gray-500 text-sm line-clamp-2 mb-4">{content.description}</p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-accent-violet flex items-center justify-center text-[10px] text-white font-bold">
                                {content.creator?.name?.[0] || '?'}
                              </div>
                              <span className="text-gray-600 text-xs font-medium">
                                {content.creator?.name} {content.creator?.surname}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400 text-xs">
                              <Eye className="w-3.5 h-3.5" />
                              {content.viewCount}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {Array.from({ length: pagination.pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${page === i + 1
                          ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* CTA for non-logged users */}
          {!session && contents.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-12 bg-gray-50 rounded-2xl border border-gray-100 p-10"
            >
              <Lock className="w-10 h-10 text-brand-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tüm İçeriklere Erişin</h3>
              <p className="text-gray-500 mb-6">Tüm içeriklere erişmek için giriş yapmanız gerekmektedir</p>
              <Link href="/auth/register" className="btn-primary inline-flex items-center gap-2">
                Ücretsiz Kayıt Ol
              </Link>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
