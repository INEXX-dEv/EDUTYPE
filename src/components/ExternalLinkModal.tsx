'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface ExternalLinkModalProps {
  url: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ease = [0.22, 1, 0.36, 1] as const;

export function ExternalLinkModal({ url, onConfirm, onCancel }: ExternalLinkModalProps) {
  // URL'den alan adını çıkar (güzel gösterim için)
  let displayUrl = url;
  try {
    const parsed = new URL(url);
    displayUrl = parsed.hostname + (parsed.pathname !== '/' ? parsed.pathname.substring(0, 30) + '…' : '');
  } catch { /* geçersiz URL */ }

  return (
    <AnimatePresence>
      {/* arka plan overlay */}
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-[3px] flex items-center justify-center px-4"
        onClick={onCancel}
      >
        {/* modal kutusu */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.35, ease }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(9,14,28,0.99) 100%)',
            border: '1px solid rgba(99,102,241,0.18)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
          }}
        >
          {/* üst renk şeridi */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />

          {/* kapat butonu */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-surface-500 hover:text-surface-300 hover:bg-surface-800/60 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-8 pt-7">
            {/* ikon */}
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
              <ShieldAlert className="w-7 h-7 text-amber-400" />
            </div>

            {/* başlık */}
            <h2 className="text-xl font-bold text-white mb-2">
              Harici bir siteye gidiyorsunuz
            </h2>

            {/* açıklama */}
            <p className="text-surface-400 text-sm leading-relaxed mb-5">
              Bu bağlantı <span className="font-semibold text-surface-200">LernStack</span>&apos;in dışına
              çıkıyor. Ziyaret etmek üzere olduğunuz sitenin güvenliğini ve içeriğini
              doğrulayamayız.
            </p>

            {/* hedef URL kartı */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-800/60 border border-surface-700/40 mb-6">
              <ExternalLink className="w-4 h-4 text-surface-500 flex-shrink-0" />
              <span className="text-surface-300 text-xs font-mono truncate">{displayUrl}</span>
            </div>

            {/* sorumluluk notu */}
            <div className="flex gap-2.5 p-3.5 rounded-xl bg-amber-500/6 border border-amber-500/15 mb-7">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-200/80 text-xs leading-relaxed">
                Bu bağlantıya tıklayarak ilgili sitenin kullanım koşullarını ve gizlilik
                politikasını kabul etmiş olursunuz. Bu ziyaretten doğabilecek her türlü
                durumdan yalnızca siz sorumlusunuz.
              </p>
            </div>

            {/* butonlar */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl bg-surface-800 hover:bg-surface-700 border border-surface-700/60 text-surface-300 text-sm font-medium transition-all duration-200 hover:border-surface-600"
              >
                Geri Dön
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/25 hover:border-amber-500/40 text-amber-300 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
              >
                Devam Et
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
