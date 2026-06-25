import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';

const PROTOCOL_TEXTS = [
  "ROEDEX PROTOCOL",
  "PROTOCOLO ROEDEX",
  "ПРОТОКОЛ ROEDEX",
  "ROEDEX 프로토콜"
];

interface IntroPromptProps {
  onStart: () => void;
  onSkip?: () => void;
}

export const IntroPrompt: React.FC<IntroPromptProps> = ({ onStart, onSkip }) => {
  const { t } = useTranslation();
  const [langTextIndex, setLangTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLangTextIndex((prev) => (prev + 1) % PROTOCOL_TEXTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-[480px] max-w-[90vw] overflow-hidden rounded-2xl border border-cyan-500/30 bg-[#0a0f1a]/95 shadow-[0_0_50px_rgba(0,229,255,0.15)]"
      >
        {/* Cinematic top border glow */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />
        
        <div className="p-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.2)]"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </motion.div>
          
          <div className="h-8 mb-4 overflow-hidden flex items-center justify-center relative w-full">
            <AnimatePresence mode="wait">
              <motion.h2
                key={langTextIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-bold tracking-widest text-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] absolute"
              >
                {PROTOCOL_TEXTS[langTextIndex]}
              </motion.h2>
            </AnimatePresence>
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mb-8 text-[13px] leading-relaxed text-slate-400"
          >{t('wizard.welcomeMessage')}</motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex flex-col gap-3"
          >
            <button
              onClick={onStart}
              className="group relative w-full overflow-hidden rounded-xl bg-cyan-500/10 px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-cyan-400 transition-all hover:bg-cyan-500/20 hover:shadow-[0_0_30px_rgba(0,229,255,0.3)] border border-cyan-500/30 hover:border-cyan-400/60"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              INITIALIZE ROEDEX
            </button>
            
            {onSkip && (
              <button
                onClick={onSkip}
                className="w-full px-6 py-3 text-xs font-semibold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-300"
              >
                {t('tutorial.skipTutorial')}
              </button>
            )}
          </motion.div>
        </div>
      </motion.div>
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
