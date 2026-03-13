'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import {
  User,
  Mail,
  Shield,
  School,
  BookOpen,
  CreditCard,
  Save,
  Loader2,
  Award,
  Calendar,
  Hash,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileData {
  id: string;
  name: string;
  surname: string | null;
  email: string;
  image: string | null;
  role: string;
  studentId: string | null;
  teacherId: string | null;
  tcNumber: string | null;
  school: string | null;
  department: string | null;
  createdAt: string;
  _count: {
    contents: number;
    examAttempts: number;
    certificates: number;
    videoProgress: number;
  };
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [tcNumber, setTcNumber] = useState('');
  const [school, setSchool] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setName(data.user.name || '');
        setSurname(data.user.surname || '');
        setTcNumber(data.user.tcNumber || '');
        setSchool(data.user.school || '');
        setDepartment(data.user.department || '');
      }
    } catch { toast.error('Profil yüklenemedi'); }
    finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    if (tcNumber && tcNumber.length !== 11) {
      toast.error('TC kimlik numarası 11 haneli olmalıdır');
      return;
    }
    if (!school || !department) {
      toast.error('Okul ve bölüm bilgileri gereklidir');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, surname, tcNumber, school, department }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Profil güncellendi');
        fetchProfile();
      } else {
        toast.error(data.error);
      }
    } catch { toast.error('Hata oluştu'); }
    finally { setIsSaving(false); }
  };

  const roleLabels: Record<string, string> = {
    STUDENT: 'Öğrenci',
    TEACHER: 'Öğretmen',
    ADMIN: 'Admin',
  };

  const roleColors: Record<string, string> = {
    STUDENT: 'bg-blue-500/20 text-blue-400',
    TEACHER: 'bg-emerald-500/20 text-emerald-400',
    ADMIN: 'bg-amber-500/20 text-amber-400',
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
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-white mb-8">
            Profilim
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 text-center">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-cyan mx-auto mb-4 flex items-center justify-center overflow-hidden">
                {profile?.image ? (
                  <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <h2 className="text-xl font-bold text-white">{profile?.name} {profile?.surname}</h2>
              <p className="text-surface-400 text-sm mb-3">{profile?.email}</p>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${roleColors[profile?.role || 'STUDENT']}`}>
                <Shield className="w-3 h-3" />
                {roleLabels[profile?.role || 'STUDENT']}
              </span>

              {profile?.studentId && (
                <div className="mt-4 p-3 bg-surface-800/50 rounded-xl">
                  <p className="text-surface-500 text-xs">Öğrenci No</p>
                  <p className="text-white text-sm font-mono">{profile.studentId}</p>
                </div>
              )}
              {profile?.teacherId && (
                <div className="mt-4 p-3 bg-surface-800/50 rounded-xl">
                  <p className="text-surface-500 text-xs">Öğretmen No</p>
                  <p className="text-white text-sm font-mono">{profile.teacherId}</p>
                </div>
              )}

              <div className="mt-4 flex items-center justify-center gap-1 text-surface-500 text-xs">
                <Calendar className="w-3 h-3" />
                Katılım: {new Date(profile?.createdAt || '').toLocaleDateString('tr-TR')}
              </div>
            </motion.div>

            {/* Form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 glass-card p-6 space-y-5">
              <h3 className="text-lg font-bold text-white mb-4">Profil Bilgileri</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-surface-300 mb-1.5 block">Ad</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                    <input value={name} onChange={(e) => setName(e.target.value)} className="input-field pl-10" placeholder="Adınız" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-surface-300 mb-1.5 block">Soyad</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                    <input value={surname} onChange={(e) => setSurname(e.target.value)} className="input-field pl-10" placeholder="Soyadınız" />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-surface-300 mb-1.5 block">E-posta</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input value={profile?.email || ''} disabled className="input-field pl-10 opacity-60 cursor-not-allowed" />
                </div>
              </div>

              <div>
                <label className="text-sm text-surface-300 mb-1.5 block">TC Kimlik No</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                  <input value={tcNumber} onChange={(e) => setTcNumber(e.target.value.replace(/\D/g, '').slice(0, 11))} className="input-field pl-10" placeholder="11 haneli TC kimlik no" maxLength={11} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-surface-300 mb-1.5 block">Okul *</label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                    <input value={school} onChange={(e) => setSchool(e.target.value)} className="input-field pl-10" placeholder="Okulunuz" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-surface-300 mb-1.5 block">Bölüm *</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                    <input value={department} onChange={(e) => setDepartment(e.target.value)} className="input-field pl-10" placeholder="Bölümünüz" />
                  </div>
                </div>
              </div>

              <button onClick={handleSave} disabled={isSaving} className="btn-primary w-full flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Kaydet</>}
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'İzlenen Video', value: profile?._count.videoProgress || 0, icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
                { label: 'Sınav Girişi', value: profile?._count.examAttempts || 0, icon: Hash, color: 'from-violet-500 to-purple-500' },
                { label: 'Sertifika', value: profile?._count.certificates || 0, icon: Award, color: 'from-amber-500 to-orange-500' },
                { label: profile?.role === 'STUDENT' ? 'Tamamlanan' : 'Yayınlanan', value: profile?._count.contents || 0, icon: CheckCircle, color: 'from-emerald-500 to-green-500' },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-surface-400 text-xs">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
