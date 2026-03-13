'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import {
  Bell,
  CheckCheck,
  Award,
  BookOpen,
  AlertTriangle,
  Info,
  Settings,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}

const typeIcons: Record<string, any> = {
  EXAM_RESULT: Award,
  CERTIFICATE: Award,
  CONTENT: BookOpen,
  SYSTEM: Info,
  WARNING: AlertTriangle,
};

const typeColors: Record<string, string> = {
  EXAM_RESULT: 'text-violet-400 bg-violet-500/20',
  CERTIFICATE: 'text-amber-400 bg-amber-500/20',
  CONTENT: 'text-blue-400 bg-blue-500/20',
  SYSTEM: 'text-cyan-400 bg-cyan-500/20',
  WARNING: 'text-red-400 bg-red-500/20',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications?page=${page}`);
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        setTotalPages(data.pagination.totalPages);
      }
    } catch { /* error */ }
    finally { setIsLoading(false); }
  };

  const markAsRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllAsRead = async () => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    toast.success('Tümü okundu');
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
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold text-white">Bildirimler</h1>
              {unreadCount > 0 && (
                <p className="text-surface-400 text-sm mt-1">{unreadCount} okunmamış bildirim</p>
              )}
            </motion.div>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="btn-secondary text-sm flex items-center gap-2">
                <CheckCheck className="w-4 h-4" /> Tümünü Oku
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Bell className="w-16 h-16 text-surface-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Bildirim Yok</h3>
              <p className="text-surface-400">Henüz bildiriminiz bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif, i) => {
                const Icon = typeIcons[notif.type] || Bell;
                const colorClass = typeColors[notif.type] || 'text-surface-400 bg-surface-700';

                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                    className={`glass-card p-4 cursor-pointer transition-all hover:bg-surface-800/60 ${
                      !notif.isRead ? 'border-l-2 border-brand-500' : 'opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white text-sm font-medium">{notif.title}</h4>
                          {!notif.isRead && <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />}
                        </div>
                        <p className="text-surface-400 text-sm mt-0.5">{notif.message}</p>
                        <p className="text-surface-600 text-xs mt-1">
                          {new Date(notif.createdAt).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm p-2 disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-surface-400 text-sm">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="btn-secondary text-sm p-2 disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
