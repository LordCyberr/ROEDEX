import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CHANGELOG_DATA } from '../../data/changelog';
import { useTrackerStore } from '../../store/trackerStore';

export const ChangelogModal: React.FC = () => {
  const isChangelogOpen = useTrackerStore(state => state.isChangelogOpen);
  const setIsChangelogOpen = useTrackerStore(state => state.setIsChangelogOpen);

  return (
    <AnimatePresence>
      {isChangelogOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm pointer-events-auto"
          onClick={() => setIsChangelogOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[80vh] flex flex-col bg-[var(--bg-panel)]/95 backdrop-blur-xl border border-[var(--border-accent)] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/50">
              <h2 className="text-[16px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span className="text-[var(--accent-primary)]">✨</span> What's New
              </h2>
              <button 
                onClick={() => setIsChangelogOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
              {CHANGELOG_DATA.map((entry, idx) => (
                <div key={entry.version} className="relative">
                  {/* Timeline connecting line */}
                  {idx !== CHANGELOG_DATA.length - 1 && (
                    <div className="absolute left-[11px] top-8 bottom-[-32px] w-[2px] bg-[var(--border-subtle)]" />
                  )}
                  
                  <div className="flex gap-4">
                    {/* Version Circle */}
                    <div className="relative z-10 flex-shrink-0 w-6 h-6 rounded-full bg-[var(--bg-card)] border-2 border-[var(--accent-primary)] flex items-center justify-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" />
                    </div>

                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <h3 className="text-[14px] font-bold text-[var(--text-primary)]">v{entry.version} - {entry.title}</h3>
                        <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-base)] px-2 py-0.5 rounded border border-[var(--border-subtle)] w-fit">
                          {entry.date}
                        </span>
                      </div>

                      {entry.features.length > 0 && (
                        <ul className="mt-2 flex flex-col gap-2">
                          {entry.features.map((feature, i) => (
                            <li key={i} className="text-[11px] text-[var(--text-secondary)] leading-relaxed flex items-start gap-2">
                              <span className="text-[var(--accent-primary)] mt-0.5 opacity-80">✦</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}

                      {entry.fixes.length > 0 && (
                        <div className="mt-2">
                          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block">Fixes & Improvements</span>
                          <ul className="flex flex-col gap-1.5">
                            {entry.fixes.map((fix, i) => (
                              <li key={i} className="text-[10px] text-[var(--text-secondary)] leading-relaxed flex items-start gap-2">
                                <span className="text-[var(--text-muted)] mt-0.5">▪</span>
                                {fix}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Footer glow */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent opacity-50" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
