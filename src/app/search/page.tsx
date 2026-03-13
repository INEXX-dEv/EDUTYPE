'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';
import {
  Search as SearchIcon,
  BookOpen,
  Eye,
  Clock,
  Loader2,
  Filter,
  X,
} from 'lucide-react';

interface ContentResult {
  id: string;
  title: string;
  description: string;
  contentId: string;
  status: string;
  hasExam: boolean;
  viewCount: number;
  createdAt: string;
  creator: { name: string };
  _count: { videos: number };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ContentResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) handleSearch(initialQuery);
  }, []);

  const handleSearch = async (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/content?search=${encodeURIComponent(searchQuery)}&limit=20`);
      const data = await res.json();
      if (res.ok) setResults(data.contents);
    } catch { /* error */ }
    finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">İçerik Ara</h1>
            <div className="flex gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="İçerik ara..."
                  className="input-field pl-12 text-lg py-3"
                  autoFocus
                />
                {query && (
                  <button onClick={() => { setQuery(''); setResults([]); setSearched(false); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-5 h-5 text-surface-500 hover:text-white" />
                  </button>
                )}
              </div>
              <button onClick={() => handleSearch()} disabled={isLoading} className="btn-primary px-6">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ara'}
              </button>
            </div>
          </motion.div>

          {/* Results */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
          ) : searched ? (
            results.length === 0 ? (
              <div className="text-center py-12">
                <SearchIcon className="w-16 h-16 text-surface-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Sonuç Bulunamadı</h3>
                <p className="text-surface-400">"{query}" için sonuç bulunamadı. Farklı terimler deneyin.</p>
              </div>
            ) : (
              <div>
                <p className="text-surface-400 text-sm mb-4">{results.length} sonuç bulundu</p>
                <div className="space-y-3">
                  {results.map((content, i) => (
                    <motion.div key={content.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Link href={`/content/${content.id}`} className="glass-card-hover p-5 flex items-start gap-4 block">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold mb-1">{content.title}</h3>
                          <p className="text-surface-400 text-sm line-clamp-2">{content.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-surface-500">
                            <span>{content.creator?.name}</span>
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{content.viewCount}</span>
                            <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{content._count.videos} video</span>
                            {content.hasExam && <span className="text-amber-400">Sınav var</span>}
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(content.createdAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <SearchIcon className="w-16 h-16 text-surface-700 mx-auto mb-4" />
              <p className="text-surface-500">Arama yapmak için yukarıdaki kutuya yazın</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
