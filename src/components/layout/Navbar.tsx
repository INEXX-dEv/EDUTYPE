'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  BookOpen,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
  Plus,
  Users,
  GraduationCap,
  Sun,
  Moon,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useTheme } from '@/components/ThemeProvider';

export function Navbar() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setIsProfileOpen(false);
    if (isProfileOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'bg-surface-950/80 backdrop-blur-2xl border-b border-surface-800/50 shadow-lg shadow-black/20'
        : 'bg-surface-950/95 backdrop-blur-2xl'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-2xl font-black tracking-tight text-white transition-opacity group-hover:opacity-90">
              Lern<span className="bg-gradient-to-r from-brand-400 to-accent-violet bg-clip-text text-transparent">Stack</span>
            </span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500 group-focus-within:text-brand-400 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="İçerik ara..."
                className="w-full pl-10 pr-4 py-2.5 bg-surface-900/60 border border-surface-700/50 rounded-xl text-sm text-surface-200 placeholder:text-surface-500 focus:outline-none focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/10 transition-all"
              />
            </div>
          </form>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            <Link href="/contents" className="flex items-center gap-2 px-4 py-2.5 text-surface-400 hover:text-white hover:bg-white/5 rounded-xl text-sm font-medium transition-all">
              <BookOpen className="w-4 h-4" />
              İçerikler
            </Link>

            {session ? (
              <>
                {(session.user.role === 'TEACHER' || session.user.role === 'ADMIN') && (
                  <Link href="/dashboard/content/new" className="flex items-center gap-2 px-4 py-2.5 text-surface-400 hover:text-white hover:bg-white/5 rounded-xl text-sm font-medium transition-all">
                    <Plus className="w-4 h-4" />
                    İçerik Ekle
                  </Link>
                )}

                <Link href="/notifications" className="relative p-2.5 text-surface-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                  <Bell className="w-5 h-5" />
                </Link>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2.5 text-surface-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  title={theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setIsProfileOpen(!isProfileOpen); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-violet flex items-center justify-center text-sm font-bold text-white">
                      {session.user.name?.[0] || 'U'}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-56 glass-card py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-surface-700/50">
                        <p className="text-sm font-semibold text-white">{session.user.name}</p>
                        <p className="text-xs text-surface-400">{session.user.email}</p>
                      </div>

                      <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-surface-300 hover:bg-white/5 hover:text-white text-sm transition-colors">
                        <BookOpen className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-surface-300 hover:bg-white/5 hover:text-white text-sm transition-colors">
                        <User className="w-4 h-4" />
                        Profil
                      </Link>
                      {session.user.role === 'TEACHER' && (
                        <Link href="/dashboard/groups" className="flex items-center gap-3 px-4 py-2.5 text-surface-300 hover:bg-white/5 hover:text-white text-sm transition-colors">
                          <Users className="w-4 h-4" />
                          Gruplarım
                        </Link>
                      )}
                      {session.user.role === 'ADMIN' && (
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-surface-300 hover:bg-white/5 hover:text-white text-sm transition-colors">
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}

                      <div className="border-t border-surface-700/50 mt-1">
                        <button
                          onClick={() => signOut({ callbackUrl: '/auth/login' })}
                          className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 text-sm w-full transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Çıkış Yap
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Theme Toggle for non-logged in users */}
                <button
                  onClick={toggleTheme}
                  className="p-2.5 text-surface-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                  title={theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <Link href="/auth/login" className="px-4 py-2.5 text-surface-300 hover:text-white text-sm font-medium transition-colors">
                  Giriş Yap
                </Link>
                <Link href="/auth/register" className="btn-primary text-sm !px-5 !py-2.5">
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 text-surface-300 hover:bg-white/5 rounded-xl transition-colors"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="lg:hidden bg-surface-950 border-t border-surface-800/50"
        >
          <div className="px-4 py-6 space-y-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="İçerik ara..."
                  className="input-field pl-10"
                />
              </div>
            </form>

            <Link href="/contents" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-surface-300 hover:bg-white/5 rounded-xl text-sm font-medium">
              <BookOpen className="w-4 h-4" />
              İçerikler
            </Link>

            {/* Mobile Theme Toggle */}
            <button onClick={toggleTheme} className="flex items-center gap-3 px-4 py-3 text-surface-300 hover:bg-white/5 rounded-xl text-sm font-medium w-full">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Açık Tema' : 'Koyu Tema'}
            </button>

            {session ? (
              <>
                <Link href="/dashboard" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-surface-300 hover:bg-white/5 rounded-xl text-sm font-medium">
                  <GraduationCap className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link href="/profile" onClick={() => setIsMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-surface-300 hover:bg-white/5 rounded-xl text-sm font-medium">
                  <User className="w-4 h-4" />
                  Profil
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/login' })}
                  className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Çıkış Yap
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link href="/auth/login" className="btn-secondary flex-1 text-center text-sm !py-3">
                  Giriş Yap
                </Link>
                <Link href="/auth/register" className="btn-primary flex-1 text-center text-sm !py-3">
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
