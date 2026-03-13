'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import {
  Users,
  UserPlus,
  UserMinus,
  BookOpen,
  Trash2,
  ArrowLeft,
  Loader2,
  Mail,
  Plus,
  X,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner: { name: string; email: string; image: string | null };
  members: {
    id: string;
    role: string;
    joinedAt: string;
    user: { id: string; name: string; surname: string | null; email: string; image: string | null; studentId: string | null; role: string };
  }[];
  contents: {
    id: string;
    content: { id: string; title: string; contentId: string };
  }[];
}

export default function GroupDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => { fetchGroup(); }, []);

  const fetchGroup = async () => {
    try {
      const res = await fetch(`/api/groups/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setGroup(data.group);
      } else {
        router.push('/dashboard/groups');
      }
    } catch { router.push('/dashboard/groups'); }
    finally { setIsLoading(false); }
  };

  const isOwner = group?.ownerId === session?.user?.id || session?.user?.role === 'ADMIN';

  const addMember = async () => {
    if (!memberEmail) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/groups/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addMember', email: memberEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setMemberEmail('');
        setShowAddMember(false);
        fetchGroup();
      } else {
        toast.error(data.error);
      }
    } catch { toast.error('Hata'); }
    finally { setAdding(false); }
  };

  const removeMember = async (userId: string) => {
    if (!confirm('Bu üyeyi gruptan çıkarmak istediğinize emin misiniz?')) return;
    const res = await fetch(`/api/groups/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'removeMember', userId }),
    });
    if (res.ok) { toast.success('Üye çıkarıldı'); fetchGroup(); }
  };

  const deleteGroup = async () => {
    if (!confirm('Bu grubu silmek istediğinize emin misiniz?')) return;
    const res = await fetch(`/api/groups/${params.id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Grup silindi'); router.push('/dashboard/groups'); }
  };

  if (isLoading || !group) {
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
          <button onClick={() => router.push('/dashboard/groups')} className="flex items-center gap-2 text-surface-400 hover:text-white mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Gruplara Dön
          </button>

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">{group.name}</h1>
              {group.description && <p className="text-surface-400 mt-1">{group.description}</p>}
              <p className="text-surface-600 text-sm mt-1">Oluşturan: {group.owner.name} ({group.owner.email})</p>
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <button onClick={() => setShowAddMember(true)} className="btn-primary text-sm flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Üye Ekle
                </button>
                <button onClick={deleteGroup} className="btn-danger text-sm flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Add Member Modal */}
          {showAddMember && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
              <div className="glass-card p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold">Üye Ekle</h3>
                  <button onClick={() => setShowAddMember(false)}><X className="w-5 h-5 text-surface-400" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-surface-300 text-sm block mb-1.5">E-posta veya Öğrenci No</label>
                    <input value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} className="input-field" placeholder="ornek@mail.com veya STU-2024-..." />
                  </div>
                  <button onClick={addMember} disabled={adding} className="btn-primary w-full flex items-center justify-center gap-2">
                    {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ekle'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Members */}
            <div className="glass-card p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-400" /> Üyeler ({group.members.length})
              </h3>
              <div className="space-y-2">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-surface-800/30 rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center text-white text-sm font-bold">
                      {member.user.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-medium truncate">{member.user.name} {member.user.surname}</p>
                        {member.role === 'ADMIN' && (
                          <Shield className="w-3 h-3 text-amber-400" />
                        )}
                      </div>
                      <p className="text-surface-500 text-xs truncate">{member.user.email}</p>
                    </div>
                    {isOwner && member.user.id !== group.ownerId && (
                      <button onClick={() => removeMember(member.user.id)} className="text-red-400 hover:text-red-300 p-1">
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contents */}
            <div className="glass-card p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" /> İçerikler ({group.contents.length})
              </h3>
              {group.contents.length === 0 ? (
                <p className="text-surface-500 text-sm text-center py-8">Henüz içerik eklenmedi</p>
              ) : (
                <div className="space-y-2">
                  {group.contents.map((gc) => (
                    <div key={gc.id} className="flex items-center gap-3 p-3 bg-surface-800/30 rounded-xl">
                      <BookOpen className="w-5 h-5 text-surface-500" />
                      <span className="text-white text-sm flex-1 truncate">{gc.content.title}</span>
                      <span className="text-surface-600 text-xs font-mono">{gc.content.contentId}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
