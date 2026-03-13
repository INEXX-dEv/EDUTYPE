'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Check } from 'lucide-react';
import Cookies from 'js-cookie';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = Cookies.get('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = { necessary: true, analytics: true, marketing: true };
    Cookies.set('cookie-consent', JSON.stringify(consent), { expires: 365 });
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    Cookies.set('cookie-consent', JSON.stringify(preferences), { expires: 365 });
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    const consent = { necessary: true, analytics: false, marketing: false };
    Cookies.set('cookie-consent', JSON.stringify(consent), { expires: 365 });
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-50"
        >
          <div className="glass-card p-6 shadow-2xl shadow-black/40">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-brand-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm">Çerez Kullanımı</h3>
                <p className="text-surface-400 text-xs mt-1 leading-relaxed">
                  Deneyiminizi iyileştirmek için çerezler kullanıyoruz. Tercihlerinizi yönetebilirsiniz.
                </p>
              </div>
              <button onClick={() => setIsVisible(false)} className="text-surface-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="space-y-3 mb-4 pb-4 border-b border-surface-700/50"
              >
                <label className="flex items-center justify-between">
                  <span className="text-xs text-surface-300">Zorunlu Çerezler</span>
                  <div className="w-8 h-5 bg-brand-500 rounded-full flex items-center justify-end px-0.5">
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                </label>
                <label className="flex items-center justify-between cursor-pointer" onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}>
                  <span className="text-xs text-surface-300">Analitik Çerezler</span>
                  <div className={`w-8 h-5 rounded-full flex items-center px-0.5 transition-colors ${preferences.analytics ? 'bg-brand-500 justify-end' : 'bg-surface-600 justify-start'}`}>
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                </label>
                <label className="flex items-center justify-between cursor-pointer" onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}>
                  <span className="text-xs text-surface-300">Pazarlama Çerezleri</span>
                  <div className={`w-8 h-5 rounded-full flex items-center px-0.5 transition-colors ${preferences.marketing ? 'bg-brand-500 justify-end' : 'bg-surface-600 justify-start'}`}>
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                </label>
              </motion.div>
            )}

            <div className="flex gap-2">
              <button onClick={handleRejectAll} className="btn-ghost text-xs py-2 px-3 flex-1">
                Reddet
              </button>
              <button
                onClick={() => showDetails ? handleAcceptSelected() : setShowDetails(true)}
                className="btn-secondary text-xs py-2 px-3 flex-1"
              >
                {showDetails ? 'Seçilenleri Kabul Et' : 'Tercihler'}
              </button>
              <button onClick={handleAcceptAll} className="btn-primary text-xs py-2 px-3 flex-1">
                <Check className="w-3 h-3 inline mr-1" />
                Tümünü Kabul Et
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
