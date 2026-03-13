'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';
import {
  Users,
  Plus,
  BookOpen,
  Calendar,
  Loader2,
  X,
  UserPlus,
  Trash2,
  Settings,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Group {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  owner: { name: string; email: string };
  _count: { members: number; contents: number };
}

export default function GroupsPage() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      if (res.ok) setGroups(data.groups);
    } catch { /* error */ }
    finally { setIsLoading(false); }
  };

  const handleCreate = async () => {
    if (!newGroupName) { toast.error('Grup adı gerekli'); return; }
    setCreating(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName, description: newGroupDesc }),
      });
      if (res.ok) {
        toast.success('Grup oluşturuldu');
        setShowCreate(false);
        setNewGroupName('');
        setNewGroupDesc('');
        fetchGroups();
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch { toast.error('Hata oluştu'); }
    finally { setCreating(false); }
  };

  const isTeacherOrAdmin = session?.user?.role === 'TEACHER' || session?.user?.role === 'ADMIN';

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
          <div className="flex items-center justify-between mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold text-white">Gruplar</h1>
              <p className="text-surface-400 text-sm mt-1">Öğrenci gruplarınızı yönetin</p>
            </motion.div>
            {isTeacherOrAdmin && (
              <button onClick={() => setShowCreate(true)} className="btn-primary text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Grup Oluştur
              </button>
            )}
          </div>

          {/* Create Modal */}
          {showCreate && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass-card p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-lg">Yeni Grup</h3>
                  <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-surface-400" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-surface-300 text-sm block mb-1.5">Grup Adı</label>
                    <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="input-field" placeholder="Grup adı" />
                  </div>
                  <div>
                    <label className="text-surface-300 text-sm block mb-1.5">Açıklama</label>
                    <textarea value={newGroupDesc} onChange={(e) => setNewGroupDesc(e.target.value)} className="input-field resize-none" rows={3} placeholder="Opsiyonel" />
                  </div>
                  <button onClick={handleCreate} disabled={creating} className="btn-primary w-full flex items-center justify-center gap-2">
                    {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Oluştur'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {groups.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Users className="w-16 h-16 text-surface-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Grup Bulunamadı</h3>
              <p className="text-surface-400">
                {isTeacherOrAdmin ? 'Henüz grup oluşturmadınız. Yeni bir grup oluşturarak başlayın.' : 'Henüz bir gruba dahil değilsiniz.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group, i) => (
                <motion.div key={group.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/dashboard/groups/${group.id}`} className="glass-card-hover p-5 block">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-violet flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold">{group.name}</h3>
                        {group.description && <p className="text-surface-400 text-sm line-clamp-1 mt-0.5">{group.description}</p>}
                        <div className="flex items-center gap-4 mt-3 text-xs text-surface-500">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{group._count.members} Üye</span>
                          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{group._count.contents} İçerik</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(group.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                    </div>
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
