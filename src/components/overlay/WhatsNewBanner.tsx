import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, ArrowRight, Zap } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { CHANGELOG_DATA } from '../../data/changelog';
import { useShallow } from 'zustand/react/shallow';

const LATEST = CHANGELOG_DATA[0];

export const WhatsNewBanner: React.FC = React.memo(() => {
  const { lastSeenVersion, dismissWhatsNew, setIsChangelogOpen } = useSettingsStore(
    useShallow((state) => ({
      lastSeenVersion: state.lastSeenVersion,
      dismissWhatsNew: state.dismissWhatsNew,
      setIsChangelogOpen: state.setIsChangelogOpen,
    }))
  );

  const shouldShow = LATEST && lastSeenVersion !== LATEST.version;

  const handleViewChangelog = () => {
    dismissWhatsNew();
    setIsChangelogOpen(true);
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          key="whats-new-banner"
          initial={{ opacity: 0, y: -24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28, delay: 1.2 }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[2147483640] pointer-events-auto"
          style={{ maxWidth: 420, width: 'calc(100vw - 32px)' }}
          role="alert"
          aria-label={`ROEDEX updated to version ${LATEST.version}`}
        >
          <div style={{
            background: 'linear-gradient(135deg, rgba(8,17,36,0.97) 0%, rgba(5,12,28,0.99) 100%)',
            border: '1px solid rgba(139,92,246,0.45)',
            borderRadius: 14,
            boxShadow: '0 0 0 1px rgba(139,92,246,0.12), 0 8px 40px rgba(0,0,0,0.85), 0 0 32px rgba(139,92,246,0.15)',
            backdropFilter: 'blur(24px)',
            overflow: 'hidden',
          }}>
            <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.8), rgba(59,130,246,0.8), transparent)' }} />
            <div className="flex items-start gap-3 px-4 py-3">
              <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
                style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.25),rgba(59,130,246,0.15))', border: '1px solid rgba(139,92,246,0.35)', boxShadow: '0 0 16px rgba(139,92,246,0.2)' }}>
                <Sparkles size={17} className="text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: 'rgba(139,92,246,0.9)' }}>ROEDEX Updated</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.35)', color: '#a78bfa' }}>v{LATEST.version}</span>
                  <Zap size={9} className="text-yellow-400 animate-pulse" />
                </div>
                <p className="text-[11px] font-semibold mb-1 leading-snug" style={{ color: 'rgba(226,232,240,0.92)' }}>{LATEST.title}</p>
                <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(148,163,184,0.8)' }}>
                  {LATEST.features.length} new feature{LATEST.features.length !== 1 ? 's' : ''} &amp; {LATEST.fixes.length} fix{LATEST.fixes.length !== 1 ? 'es' : ''} in this update.
                </p>
                <div className="flex items-center gap-2 mt-2.5">
                  <button onClick={handleViewChangelog}
                    aria-label="View changelog for this update"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer"
                    style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.25),rgba(59,130,246,0.15))', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd', boxShadow: '0 2px 12px rgba(139,92,246,0.15)' }}>
                    See What&apos;s New <ArrowRight size={10} />
                  </button>
                  <button onClick={dismissWhatsNew}
                    aria-label="Dismiss this update notification"
                    className="text-[10px] font-medium transition-colors cursor-pointer px-2 py-1.5 rounded-lg"
                    style={{ color: 'rgba(100,116,139,0.8)' }}>
                    Dismiss
                  </button>
                </div>
              </div>
              <button onClick={dismissWhatsNew} aria-label="Dismiss update notification"
                className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer mt-0.5"
                style={{ color: 'rgba(100,116,139,0.7)' }}>
                <X size={13} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

WhatsNewBanner.displayName = 'WhatsNewBanner';
