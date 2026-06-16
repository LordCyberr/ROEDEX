import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrackerStore } from '../../store/trackerStore';
import { COMPANIONS } from '../../data/companions';
import { useTranslation } from '../../hooks/useTranslation';

import { useShallow } from 'zustand/react/shallow';

interface WelcomeSplashProps {
  onStart: () => void;
  onSkip: () => void;
}

export const WelcomeSplash: React.FC<WelcomeSplashProps> = ({ onStart, onSkip }) => {
  const { t } = useTranslation();
  const { theme, activeCompanion } = useTrackerStore(useShallow(state => ({
    theme: state.theme,
    activeCompanion: state.activeCompanion
  })));

  const companion = COMPANIONS[activeCompanion as keyof typeof COMPANIONS] || COMPANIONS.bob;
  const companionColor = companion.color || '#22d3ee';

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto"
        data-theme={theme}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative max-w-lg w-full p-8 rounded-3xl overflow-hidden shadow-2xl border"
          style={{
            backgroundColor: 'rgba(15, 20, 30, 0.85)',
            borderColor: `${companionColor}50`,
            boxShadow: `0 0 50px ${companionColor}20, inset 0 0 20px ${companionColor}10`
          }}
        >
          {/* Glassmorphism gradient effect */}
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: `linear-gradient(135deg, ${companionColor}40, transparent 60%)` }} />
          
          <div className="relative z-10 flex flex-col items-center text-center text-[var(--text-primary)]">
            <h1 className="text-3xl font-black mb-2 tracking-wider" style={{ color: companionColor, textShadow: `0 0 10px ${companionColor}80` }}>
              {t('welcome.title')}
            </h1>
            <p className="text-sm font-medium mb-8 text-[var(--text-muted)] max-w-md leading-relaxed">
              {t('welcome.subtitle')}
            </p>

            <div className="flex flex-col gap-5 w-full text-left mb-8 px-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border" style={{ borderColor: `${companionColor}40`, backgroundColor: `${companionColor}20` }}>
                  <span className="text-xl" style={{ color: companionColor }}>⚔️</span>
                </div>
                <div>
                  <h3 className="font-bold text-[15px] mb-1">{t('welcome.feature1Title')}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{t('welcome.feature1Desc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border" style={{ borderColor: `${companionColor}40`, backgroundColor: `${companionColor}20` }}>
                  <span className="text-xl" style={{ color: companionColor }}>⏱️</span>
                </div>
                <div>
                  <h3 className="font-bold text-[15px] mb-1">{t('welcome.feature2Title')}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{t('welcome.feature2Desc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border" style={{ borderColor: `${companionColor}40`, backgroundColor: `${companionColor}20` }}>
                  <span className="text-xl" style={{ color: companionColor }}>🎯</span>
                </div>
                <div>
                  <h3 className="font-bold text-[15px] mb-1">{t('welcome.feature3Title')}</h3>
                  <p className="text-xs text-[var(--text-muted)]">{t('welcome.feature3Desc')}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 w-full mt-4">
              <button
                onClick={onSkip}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-bold border border-[var(--border-subtle)] hover:bg-white/5 transition-colors"
              >
                {t('welcome.skip')}
              </button>
              <button
                onClick={onStart}
                className="flex-[2] py-3 px-4 rounded-xl text-sm font-black text-black shadow-lg hover:brightness-110 transition-all uppercase tracking-wider"
                style={{
                  backgroundColor: companionColor,
                  boxShadow: `0 0 20px ${companionColor}60`
                }}
              >
                {t('welcome.start')}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
