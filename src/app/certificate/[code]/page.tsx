'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import {
  Award,
  User,
  School,
  BookOpen,
  Calendar,
  Hash,
  Shield,
  CheckCircle,
  Loader2,
  Download,
} from 'lucide-react';

interface CertificateDetail {
  id: string;
  certificateCode: string;
  score: number;
  studentIdRef: string | null;
  createdAt: string;
  user: {
    name: string;
    surname: string | null;
    studentId: string | null;
    school: string | null;
    department: string | null;
  };
  content: {
    title: string;
    contentId: string;
    description: string | null;
  };
}

export default function CertificateDetailPage() {
  const params = useParams();
  const [cert, setCert] = useState<CertificateDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchCertificate();
  }, []);

  const fetchCertificate = async () => {
    try {
      const res = await fetch(`/api/certificates/${params.code}`);
      if (res.ok) {
        const data = await res.json();
        setCert(data.certificate);
      } else {
        setNotFound(true);
      }
    } catch { setNotFound(true); }
    finally { setIsLoading(false); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (notFound || !cert) {
    return (
      <div className="min-h-screen bg-surface-950">
        <Navbar />
        <main className="pt-24 pb-16 flex items-center justify-center">
          <div className="text-center">
            <Award className="w-16 h-16 text-surface-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Sertifika Bulunamadı</h2>
            <p className="text-surface-400">Bu sertifika kodu geçerli değil.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', duration: 0.6 }}>
            {/* Certificate Card */}
            <div className="relative rounded-3xl overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-surface-900 to-orange-600/20" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500" />

              <div className="relative p-8 sm:p-12">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                    <Award className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-1">BAŞARI SERTİFİKASI</h1>
                  <p className="text-surface-400 text-sm">LernStack — Eğitim Platformu</p>
                </div>

                {/* Divider */}
                <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-8" />

                {/* Recipient */}
                <div className="text-center mb-8">
                  <p className="text-surface-400 text-sm mb-2">Bu sertifika</p>
                  <h2 className="text-2xl font-bold text-white">{cert.user.name} {cert.user.surname}</h2>
                  {cert.user.school && (
                    <p className="text-surface-300 text-sm mt-1">{cert.user.school} — {cert.user.department}</p>
                  )}
                  {cert.studentIdRef && (
                    <p className="text-surface-500 text-xs mt-1 font-mono">{cert.studentIdRef}</p>
                  )}
                </div>

                {/* Content */}
                <div className="text-center mb-8">
                  <p className="text-surface-400 text-sm mb-1">aşağıdaki içeriği başarıyla tamamlamıştır:</p>
                  <h3 className="text-xl font-bold text-amber-400">{cert.content.title}</h3>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-3 bg-surface-800/50 rounded-xl">
                    <Shield className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <p className="text-white font-bold text-lg">{cert.score}</p>
                    <p className="text-surface-500 text-xs">Puan</p>
                  </div>
                  <div className="text-center p-3 bg-surface-800/50 rounded-xl">
                    <Calendar className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <p className="text-white font-bold text-sm">{new Date(cert.createdAt).toLocaleDateString('tr-TR')}</p>
                    <p className="text-surface-500 text-xs">Tarih</p>
                  </div>
                  <div className="text-center p-3 bg-surface-800/50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                    <p className="text-white font-bold text-xs font-mono">{cert.certificateCode}</p>
                    <p className="text-surface-500 text-xs">Kod</p>
                  </div>
                </div>

                {/* Verification */}
                <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Doğrulanmış Sertifika</span>
                  </div>
                  <p className="text-surface-400 text-xs">Bu sertifika LernStack platformu tarafından doğrulanmıştır.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
