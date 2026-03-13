'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import {
  Users,
  Shield,
  BookOpen,
  Award,
  Activity,
  Cpu,
  HardDrive,
  Clock,
  AlertTriangle,
  Ban,
  CheckCircle,
  UserCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  MoreVertical,
  FileText,
  Server,
  Eye,
  UserX,
  UserPlus,
  Loader2,
  RefreshCw,
  Star,
  Code,
} from 'lucide-react';
import toast from 'react-hot-toast';
interface SystemStats {
  users: { total: number; students: number; teachers: number; admins: number; pending: number; banned: number };
  content: { total: number; published: number };
  certificates: number;
  examAttempts: number;
}

interface SystemMetrics {
  cpu: { usage: number; cores: number };
  memory: { total: string; used: string; free: string; percentage: number };
  uptime: string;
  platform: string;
  hostname: string;
}

interface UserItem {
  id: string;
  name: string;
  surname: string | null;
  email: string;
  image: string | null;
  role: string;
  studentId: string | null;
  teacherId: string | null;
  school: string | null;
  department: string | null;
  isBanned: boolean;
  isApproved: boolean;
  emailVerified: string | null;
  tag: string | null;
  createdAt: string;
  _count: { contents: number; certificates: number; examAttempts: number };
}

interface PromotionRequest {
  id: string;
  targetUser: { id: string; name: string; surname: string; email: string; role: string; tag: string | null };
  requestedBy: { id: string; name: string; surname: string; email: string };
  approvals: { id: string; approver: { id: string; name: string; surname: string; email: string }; createdAt: string }[];
  createdAt: string;
}

type TabType = 'overview' | 'users' | 'pending' | 'system' | 'logs';

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<TabType>('overview');

  const [stats, setStats] = useState<SystemStats | null>(null);
  const [system, setSystem] = useState<SystemMetrics | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [rateLimits, setRateLimits] = useState<any[]>([]);

  const [users, setUsers] = useState<UserItem[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotal, setUserTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<PromotionRequest[]>([]);

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }
    fetchSystemData();
    fetchPromotions();
  }, [session]);

  useEffect(() => {
    if (tab === 'users' || tab === 'pending') fetchUsers();
  }, [tab, userSearch, userRole, userPage]);

  const fetchSystemData = async () => {
    try {
      const res = await fetch('/api/admin/system');
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
        setSystem(data.system);
        setLogs(data.recentLogs);
        setRateLimits(data.rateLimitRecords);
      }
    } catch { toast.error('Veri yüklenemedi'); }
    finally { setIsLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      params.set('page', userPage.toString());
      if (userSearch) params.set('search', userSearch);
      if (tab === 'pending') params.set('status', 'pending');
      else if (userRole) params.set('role', userRole);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setUserTotal(data.pagination.total);
      }
    } catch { /* error */ }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchUsers();
        fetchSystemData();
      } else {
        toast.error(data.error);
      }
    } catch { toast.error('İşlem başarısız'); }
    setActionMenuId(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchUsers();
        fetchSystemData();
      } else {
        toast.error(data.error);
      }
    } catch { toast.error('Silme işlemi başarısız'); }
  };

  const fetchPromotions = async () => {
    try {
      const res = await fetch('/api/admin/promotions');
      const data = await res.json();
      if (res.ok) setPromotions(data.promotions || []);
    } catch { /* ignore */ }
  };

  const handleApprovePromotion = async (promotionId: string) => {
    try {
      const res = await fetch(`/api/admin/promotions/${promotionId}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchPromotions();
        fetchUsers();
        fetchSystemData();
      } else {
        toast.error(data.error);
      }
    } catch { toast.error('Onay işlemi başarısız'); }
  };

  const handleSetTag = async (userId: string, action: string, tag?: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, tag }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        fetchUsers();
      } else {
        toast.error(data.error);
      }
    } catch { toast.error('İşlem başarısız'); }
    setActionMenuId(null);
  };

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'overview', label: 'Genel Bakış', icon: Activity },
    { id: 'users', label: 'Kullanıcılar', icon: Users },
    { id: 'pending', label: 'Onay Bekleyenler', icon: UserCheck },
    { id: 'system', label: 'Sistem', icon: Server },
    { id: 'logs', label: 'Loglar', icon: FileText },
  ];

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
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-white">
              Admin Panel
            </motion.h1>
            <button onClick={() => { fetchSystemData(); fetchUsers(); }} className="btn-secondary text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Yenile
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? 'bg-brand-500 text-white' : 'bg-surface-800/50 text-surface-400 hover:text-white hover:bg-surface-800'
                  }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
                {t.id === 'pending' && stats?.users.pending ? (
                  <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{stats.users.pending}</span>
                ) : null}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Toplam Kullanıcı', value: stats?.users.total, icon: Users, color: 'from-blue-500 to-cyan-500' },
                  { label: 'Öğrenci', value: stats?.users.students, icon: Users, color: 'from-violet-500 to-purple-500' },
                  { label: 'Öğretmen', value: stats?.users.teachers, icon: Shield, color: 'from-emerald-500 to-green-500' },
                  { label: 'İçerik', value: stats?.content.published, icon: BookOpen, color: 'from-amber-500 to-orange-500' },
                  { label: 'Sertifika', value: stats?.certificates, icon: Award, color: 'from-pink-500 to-rose-500' },
                  { label: 'Yasaklı', value: stats?.users.banned, icon: Ban, color: 'from-red-500 to-red-600' },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xl font-bold text-white">{stat.value || 0}</p>
                    <p className="text-surface-500 text-xs">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* System Quick */}
              {system && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Cpu className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">CPU</span>
                    </div>
                    <div className="h-2 bg-surface-700 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${system.cpu?.usage ?? 0}%` }} />
                    </div>
                    <p className="text-surface-400 text-sm">{(system.cpu?.usage ?? 0).toFixed(1)}% — {system.cpu?.cores ?? 0} Çekirdek</p>
                  </div>

                  <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <HardDrive className="w-5 h-5 text-emerald-400" />
                      <span className="text-white font-medium">RAM</span>
                    </div>
                    <div className="h-2 bg-surface-700 rounded-full overflow-hidden mb-2">
                      <div className={`h-full rounded-full ${(system.memory?.percentage ?? 0) > 85 ? 'bg-red-500' : (system.memory?.percentage ?? 0) > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${system.memory?.percentage ?? 0}%` }} />
                    </div>
                    <p className="text-surface-400 text-sm">{system.memory?.used ?? '—'} / {system.memory?.total ?? '—'} ({(system.memory?.percentage ?? 0).toFixed(1)}%)</p>
                  </div>

                  <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="w-5 h-5 text-violet-400" />
                      <span className="text-white font-medium">Uptime</span>
                    </div>
                    <p className="text-2xl font-bold text-white mt-1">{system.uptime}</p>
                  </div>
                </div>
              )}

              {/* Pending Teachers Alert */}
              {(stats?.users.pending || 0) > 0 && (
                <div className="glass-card p-5 border-l-4 border-amber-500">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-white font-medium">{stats?.users.pending} Öğretmen Onay Bekliyor</p>
                      <p className="text-surface-400 text-sm">Onay bekleyen hesapları incelemek için Onay Bekleyenler sekmesine gidin.</p>
                    </div>
                    <button onClick={() => setTab('pending')} className="btn-secondary text-sm ml-auto">Görüntüle</button>
                  </div>
                </div>
              )}

              {/* Recent Logs */}
              <div className="glass-card p-5">
                <h3 className="text-white font-bold mb-4">Son İşlemler</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {logs.map((log: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-800/50 text-sm">
                      <Activity className="w-4 h-4 text-surface-500 flex-shrink-0" />
                      <span className="text-surface-300 truncate flex-1">{log.message}</span>
                      <span className="text-surface-600 text-xs whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  ))}
                  {logs.length === 0 && <p className="text-surface-500 text-sm text-center py-4">Henüz log yok</p>}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {(tab === 'users' || tab === 'pending') && (
            <div className="space-y-6">
              {tab === 'pending' && promotions.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-400" /> Admin Terfi Talepleri
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {promotions.map((promo) => {
                      const hasApproved = promo.approvals.some(a => a.approver.id === session?.user?.id);
                      const progressStr = `${promo.approvals.length} / 3 Onay`;
                      const progressPct = (promo.approvals.length / 3) * 100;
                      return (
                        <div key={promo.id} className="bg-surface-800/50 rounded-xl p-4 border border-surface-700/50">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="text-white font-medium">{promo.targetUser.name} {promo.targetUser.surname}</p>
                              <p className="text-surface-400 text-sm">{promo.targetUser.email}</p>
                            </div>
                            <div className="text-right">
                              <span className="inline-block px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-lg font-medium">Bekliyor</span>
                              <p className="text-surface-500 text-xs mt-1">Talep: {promo.requestedBy.name}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-surface-400">Onay Durumu</span>
                                <span className="text-surface-300 font-medium">{progressStr}</span>
                              </div>
                              <div className="h-2 w-full bg-surface-700 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                              {promo.approvals.map((appr, idx) => (
                                <div key={idx} className="w-6 h-6 rounded-full bg-surface-700 border-2 border-surface-800 flex items-center justify-center text-[10px] text-white tooltip" title={appr.approver.name}>
                                  {appr.approver.name[0]}
                                </div>
                              ))}

                              <div className="ml-auto">
                                <button
                                  onClick={() => handleApprovePromotion(promo.id)}
                                  disabled={hasApproved}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${hasApproved
                                      ? 'bg-surface-800 text-surface-500 cursor-not-allowed'
                                      : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                    }`}
                                >
                                  {hasApproved ? 'Onayladınız' : 'Onayla'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {tab === 'users' && (
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                    <input
                      value={userSearch}
                      onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                      placeholder="İsim, email veya numara ara..."
                      className="input-field pl-10"
                    />
                  </div>
                  <select
                    value={userRole}
                    onChange={(e) => { setUserRole(e.target.value); setUserPage(1); }}
                    className="input-field w-auto"
                  >
                    <option value="">Tüm Roller</option>
                    <option value="STUDENT">Öğrenci</option>
                    <option value="TEACHER">Öğretmen</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              )}

              <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-surface-800">
                        <th className="text-left text-xs font-medium text-surface-500 p-4">Kullanıcı</th>
                        <th className="text-left text-xs font-medium text-surface-500 p-4">Rol</th>
                        <th className="text-left text-xs font-medium text-surface-500 p-4">Okul</th>
                        <th className="text-left text-xs font-medium text-surface-500 p-4">Durum</th>
                        <th className="text-left text-xs font-medium text-surface-500 p-4">Tarih</th>
                        <th className="text-right text-xs font-medium text-surface-500 p-4">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-surface-800/50 hover:bg-surface-800/30">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center text-white text-sm font-bold">
                                {user.name?.[0]?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">{user.name} {user.surname}</p>
                                <p className="text-surface-500 text-xs">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${user.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400' :
                                user.role === 'TEACHER' ? 'bg-emerald-500/20 text-emerald-400' :
                                  'bg-blue-500/20 text-blue-400'
                                }`}>
                                {user.role === 'ADMIN' ? 'Admin' : user.role === 'TEACHER' ? 'Öğretmen' : 'Öğrenci'}
                              </span>
                              {user.tag && (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${user.tag === 'DEVELOPER' ? 'bg-violet-500/20 text-violet-400' : 'bg-amber-500/20 text-amber-400'
                                  }`}>
                                  {user.tag === 'DEVELOPER' ? <Code className="w-3 h-3" /> : <Star className="w-3 h-3" />}
                                  {user.tag}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-surface-400 text-sm">{user.school || '—'}</td>
                          <td className="p-4">
                            {user.isBanned ? (
                              <span className="text-red-400 text-xs flex items-center gap-1"><Ban className="w-3 h-3" /> Yasaklı</span>
                            ) : !user.isApproved && user.role === 'TEACHER' ? (
                              <span className="text-amber-400 text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Bekliyor</span>
                            ) : (
                              <span className="text-emerald-400 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Aktif</span>
                            )}
                          </td>
                          <td className="p-4 text-surface-500 text-xs">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</td>
                          <td className="p-4 text-right">
                            <div className="relative inline-block">
                              <button onClick={() => setActionMenuId(actionMenuId === user.id ? null : user.id)} className="p-1.5 rounded-lg hover:bg-surface-700">
                                <MoreVertical className="w-4 h-4 text-surface-400" />
                              </button>
                              {actionMenuId === user.id && (
                                <div className="absolute right-0 top-full mt-1 bg-surface-800 border border-surface-700 rounded-xl shadow-xl py-2 min-w-[180px] z-50">
                                  {user.isBanned ? (
                                    <button onClick={() => handleUserAction(user.id, 'unban')} className="w-full text-left px-4 py-2 text-sm text-emerald-400 hover:bg-surface-700 flex items-center gap-2">
                                      <CheckCircle className="w-4 h-4" /> Yasağı Kaldır
                                    </button>
                                  ) : (
                                    <button onClick={() => handleUserAction(user.id, 'ban')} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-surface-700 flex items-center gap-2">
                                      <Ban className="w-4 h-4" /> Yasakla
                                    </button>
                                  )}
                                  {user.role === 'TEACHER' && !user.isApproved && (
                                    <>
                                      <button onClick={() => handleUserAction(user.id, 'approve')} className="w-full text-left px-4 py-2 text-sm text-emerald-400 hover:bg-surface-700 flex items-center gap-2">
                                        <UserCheck className="w-4 h-4" /> Onayla
                                      </button>
                                      <button onClick={() => handleUserAction(user.id, 'reject')} className="w-full text-left px-4 py-2 text-sm text-amber-400 hover:bg-surface-700 flex items-center gap-2">
                                        <UserX className="w-4 h-4" /> Reddet
                                      </button>
                                    </>
                                  )}
                                  <div className="border-t border-surface-700 my-1" />
                                  {user.role !== 'ADMIN' && (
                                    <button onClick={() => handleUserAction(user.id, 'makeAdmin')} className="w-full text-left px-4 py-2 text-sm text-amber-400 hover:bg-surface-700 flex items-center gap-2">
                                      <Shield className="w-4 h-4" /> Admin Yap (3 Onay)
                                    </button>
                                  )}
                                  {user.role !== 'TEACHER' && (
                                    <button onClick={() => handleUserAction(user.id, 'makeTeacher')} className="w-full text-left px-4 py-2 text-sm text-emerald-400 hover:bg-surface-700 flex items-center gap-2">
                                      <UserPlus className="w-4 h-4" /> Öğretmen Yap
                                    </button>
                                  )}
                                  <div className="border-t border-surface-700 my-1" />
                                  {!user.tag && (
                                    <>
                                      <button onClick={() => handleSetTag(user.id, 'setTag', 'ADMIN')} className="w-full text-left px-4 py-2 text-sm text-amber-400 hover:bg-surface-700 flex items-center gap-2">
                                        <Star className="w-4 h-4" /> ADMIN Tag'i Ver
                                      </button>
                                      <button onClick={() => handleSetTag(user.id, 'setTag', 'DEVELOPER')} className="w-full text-left px-4 py-2 text-sm text-violet-400 hover:bg-surface-700 flex items-center gap-2">
                                        <Code className="w-4 h-4" /> DEVELOPER Tag'i Ver
                                      </button>
                                    </>
                                  )}
                                  {user.tag && (
                                    <button onClick={() => handleSetTag(user.id, 'removeTag')} className="w-full text-left px-4 py-2 text-sm text-surface-400 hover:bg-surface-700 flex items-center gap-2">
                                      <Star className="w-4 h-4" /> Tag'i Kaldır
                                    </button>
                                  )}
                                  <div className="border-t border-surface-700 my-1" />
                                  <button onClick={() => handleDeleteUser(user.id)} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-surface-700 flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" /> Sil
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-surface-500 text-sm">
                            {tab === 'pending' ? 'Onay bekleyen öğretmen yok' : 'Kullanıcı bulunamadı'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {userTotal > 20 && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  <button onClick={() => setUserPage((p) => Math.max(1, p - 1))} disabled={userPage === 1} className="btn-secondary text-sm p-2 disabled:opacity-40">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-surface-400 text-sm">{userPage} / {Math.ceil(userTotal / 20)}</span>
                  <button onClick={() => setUserPage((p) => p + 1)} disabled={userPage >= Math.ceil(userTotal / 20)} className="btn-secondary text-sm p-2 disabled:opacity-40">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* System Tab */}
          {tab === 'system' && system && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CPU */}
                <div className="glass-card p-6">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Cpu className="w-5 h-5 text-blue-400" /> CPU Kullanımı</h3>
                  <div className="relative w-40 h-40 mx-auto mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgb(30,30,40)" strokeWidth="8" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgb(59,130,246)" strokeWidth="8" strokeDasharray={`${(system.cpu?.usage ?? 0) * 2.83} ${283 - (system.cpu?.usage ?? 0) * 2.83}`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{(system.cpu?.usage ?? 0).toFixed(0)}%</span>
                    </div>
                  </div>
                  <p className="text-center text-surface-400">{system.cpu?.cores ?? 0} Çekirdek</p>
                </div>

                {/* RAM */}
                <div className="glass-card p-6">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2"><HardDrive className="w-5 h-5 text-emerald-400" /> RAM Kullanımı</h3>
                  <div className="relative w-40 h-40 mx-auto mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgb(30,30,40)" strokeWidth="8" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke={(system.memory?.percentage ?? 0) > 85 ? 'rgb(239,68,68)' : (system.memory?.percentage ?? 0) > 60 ? 'rgb(245,158,11)' : 'rgb(16,185,129)'} strokeWidth="8" strokeDasharray={`${(system.memory?.percentage ?? 0) * 2.83} ${283 - (system.memory?.percentage ?? 0) * 2.83}`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{(system.memory?.percentage ?? 0).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="text-center text-surface-400 space-y-1 text-sm">
                    <p>Kullanılan: {system.memory?.used ?? '—'}</p>
                    <p>Toplam: {system.memory?.total ?? '—'}</p>
                    <p>Boş: {system.memory?.free ?? '—'}</p>
                  </div>
                </div>
              </div>


              {/* Rate Limit */}
              {rateLimits.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" /> DDoS / Rate Limit Kayıtları (Son 24 Saat)
                  </h3>
                  <div className="space-y-2">
                    {rateLimits.map((record: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-surface-800/50 rounded-lg text-sm">
                        <Ban className="w-4 h-4 text-red-400" />
                        <span className="text-white font-mono">{record.ip}</span>
                        <span className="text-surface-400">{record.endpoint}</span>
                        <span className="text-surface-600 text-xs ml-auto">{new Date(record.createdAt).toLocaleString('tr-TR')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Logs Tab */}
          {tab === 'logs' && (
            <div className="glass-card p-6">
              <h3 className="text-white font-bold mb-4">Sistem Logları</h3>
              <div className="space-y-2">
                {logs.map((log: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-surface-800/30 rounded-lg">
                    <Activity className="w-4 h-4 text-surface-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">{log.level}: {log.metadata?.action || ''}</p>
                      <p className="text-surface-400 text-xs truncate">{log.message}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-surface-600 text-xs">{new Date(log.createdAt).toLocaleString('tr-TR')}</p>
                      <p className="text-surface-700 text-xs font-mono">{log.metadata?.ip || ''}</p>
                    </div>
                  </div>
                ))}
                {logs.length === 0 && <p className="text-surface-500 text-sm text-center py-8">Henüz log kaydı yok</p>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
