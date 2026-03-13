'use client';

import Link from 'next/link';
import { Github, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-surface-950 border-t border-surface-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center mb-4">
              <span className="text-2xl font-black tracking-tight text-white">
                Lern<span className="bg-gradient-to-r from-brand-400 to-accent-violet bg-clip-text text-transparent">Stack</span>
              </span>
            </Link>
            <p className="text-surface-400 text-sm leading-relaxed">
              Modern eğitim platformu ile video dersler,
              interaktif sınavlar ve sertifikalar.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="#" className="w-9 h-9 rounded-lg bg-surface-800 hover:bg-brand-600 flex items-center justify-center text-surface-400 hover:text-white transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-surface-800 hover:bg-brand-600 flex items-center justify-center text-surface-400 hover:text-white transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-surface-800 hover:bg-brand-600 flex items-center justify-center text-surface-400 hover:text-white transition-all">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <nav className="space-y-3">
              <Link href="/contents" className="block text-surface-400 hover:text-brand-400 text-sm transition-colors">İçerikler</Link>
              <Link href="/auth/register" className="block text-surface-400 hover:text-brand-400 text-sm transition-colors">Kayıt Ol</Link>
              <Link href="/search" className="block text-surface-400 hover:text-brand-400 text-sm transition-colors">Ara</Link>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Destek</h4>
            <nav className="space-y-3">
              <Link href="/help" className="block text-surface-400 hover:text-brand-400 text-sm transition-colors">Yardım Merkezi</Link>
              <Link href="/privacy" className="block text-surface-400 hover:text-brand-400 text-sm transition-colors">Gizlilik Politikası</Link>
              <Link href="/terms" className="block text-surface-400 hover:text-brand-400 text-sm transition-colors">Kullanım Şartları</Link>
              <Link href="/teacher-terms" className="block text-surface-400 hover:text-brand-400 text-sm transition-colors">Öğretmen Sözleşmesi</Link>
              <Link href="/developer-terms" className="block text-surface-400 hover:text-brand-400 text-sm transition-colors">Geliştirici Sözleşmesi</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">İletişim</h4>
            <nav className="space-y-3">
              <a href="mailto:info@lernstack.com" className="block text-surface-400 hover:text-brand-400 text-sm transition-colors">info@lernstack.com</a>
            </nav>
          </div>
        </div>

        <div className="border-t border-surface-800/50 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-surface-500 text-sm">
            © {new Date().getFullYear()} LernStack. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-surface-500 text-sm font-mono tracking-wide">
              This.product = 
            </span>
            <a
              href="https://inexxinteractive.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-surface-900/40 px-3 py-1.5 rounded-lg border border-surface-800 hover:border-surface-700 transition-colors group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.5)] group-hover:bg-brand-400 group-hover:shadow-[0_0_12px_rgba(96,165,250,0.8)] transition-colors" />
              <span className="font-mono text-xs font-semibold tracking-widest text-surface-300 group-hover:text-white transition-colors">
                &quot;INEXX INTERACTIVE&quot;
              </span>
            </a>
            <span className="text-surface-500 text-sm font-mono">;</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
