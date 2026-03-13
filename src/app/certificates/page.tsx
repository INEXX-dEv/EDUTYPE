'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';
import {
  Award,
  Download,
  ExternalLink,
  Calendar,
  Hash,
  BookOpen,
  Loader2,
  Shield,
} from 'lucide-react';

interface Certificate {
  id: string;
  certificateCode: string;
  score: number;
  studentIdRef: string | null;
  createdAt: string;
  content: { title: string; contentId: string };
}

export default function CertificatesPage() {
  const { data: session } = useSession();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/certificates');
      const data = await res.json();
      if (res.ok) setCertificates(data.certificates);
    } catch { /* error */ }
    finally { setIsLoading(false); }
  };

  if (isLoading) {
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
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-bold text-white mb-2">Sertifikalarım</h1>
            <p className="text-surface-400 mb-8">Başarıyla tamamladığınız sınavlar için kazandığınız sertifikalar</p>
          </motion.div>

          {certificates.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
              <Award className="w-16 h-16 text-surface-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Henüz Sertifikanız Yok</h3>
              <p className="text-surface-400 mb-6">İçerikleri tamamlayın ve sınavları geçerek sertifika kazanın</p>
              <Link href="/contents" className="btn-primary">İçeriklere Göz At</Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert, i) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card-hover p-6 group"
                >
                  {/* Certificate Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <Award className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold truncate">{cert.content.title}</h3>
                      <p className="text-surface-500 text-xs mt-0.5">Sertifika Başarıyla Kazanıldı</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Hash className="w-4 h-4 text-surface-500" />
                      <span className="text-surface-400">Kod:</span>
                      <span className="text-white font-mono text-xs">{cert.certificateCode}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-surface-500" />
                      <span className="text-surface-400">Puan:</span>
                      <span className="text-emerald-400 font-bold">{cert.score}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-surface-500" />
                      <span className="text-surface-400">Tarih:</span>
                      <span className="text-surface-300">{new Date(cert.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/certificate/${cert.certificateCode}`} className="btn-primary text-xs flex-1 flex items-center justify-center gap-1.5 py-2">
                      <ExternalLink className="w-3.5 h-3.5" /> Görüntüle
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
