import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Monitor, X, Check } from 'lucide-react';

const STORAGE_KEY = 'zenbonfire_desktop_site_notice_seen';

export const MobileDesktopNoticePopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem(STORAGE_KEY);
      if (!hasSeen) {
        // Small initial delay so it enters smoothly after app hydration
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // In case localStorage is blocked in private/sandboxed mode
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          role="status"
          aria-live="polite"
          className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md px-4 py-3 sm:py-3.5 rounded-2xl bg-[#0B1120]/95 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_20px_rgba(14,165,233,0.15)] text-white"
        >
          <div className="flex items-center gap-3">
            {/* Device aesthetic icon badge */}
            <div className="relative shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#0EA5E9]/20 to-emerald-500/20 border border-white/10 text-[#38BDF8]">
              <Smartphone className="w-4 h-4 text-[#38BDF8]" />
              <Monitor className="w-3 h-3 text-emerald-400 absolute -bottom-0.5 -right-0.5" />
            </div>

            {/* Popup message */}
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs sm:text-[13px] leading-snug font-medium text-slate-200">
                For the best experience on your phone, please use the desktop site.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleDismiss}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-[11px] font-semibold text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1"
                aria-label="Dismiss notice"
              >
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Got it</span>
              </button>

              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
