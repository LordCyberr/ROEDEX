import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ParticleGlobe } from '../widgets/ParticleGlobe';
import { COMPANIONS, CompanionId } from '../../data/companions';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettingsStore } from '../../store/settingsStore';


const SELECT_LANGUAGE_TEXTS = [
  "SELECT LANGUAGE",
  "SELECCIONAR IDIOMA",
  "ВЫБЕРИТЕ ЯЗЫК",
  "언어 선택"
];

interface BootSequenceProps {
  onComplete: (companionId: CompanionId) => void;
  playerName?: string;
  currentZone?: string;
}

export const BootSequence: React.FC<BootSequenceProps> = ({ onComplete, playerName = 'UNKNOWN_USER', currentZone = 'UNKNOWN_SECTOR' }) => {
  const { t } = useTranslation();
  const displayPlayerName = (playerName || 'UNKNOWN_USER').toUpperCase();
  const displayZone = (currentZone || 'UNKNOWN_SECTOR').toUpperCase();

  const bootMessagesRef = useRef([
    t('bootSequence.initializing'),
    t('bootSequence.biometric'),
    `${t('bootSequence.welcome')}, ${displayPlayerName}...`,
    `${t('bootSequence.calibrating')} ${displayZone}...`,
    t('bootSequence.online')
  ]);
  
  useEffect(() => {
    bootMessagesRef.current = [
      t('bootSequence.initializing'),
      t('bootSequence.biometric'),
      `${t('bootSequence.welcome')}, ${displayPlayerName}...`,
      `${t('bootSequence.calibrating')} ${displayZone}...`,
      t('bootSequence.online')
    ];
  }, [displayPlayerName, displayZone, t]);

  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [hoveredId, setHoveredId] = useState<CompanionId | null>(null);
  const [selectedCompanion, setSelectedCompanion] = useState<CompanionId | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [langTextIndex, setLangTextIndex] = useState(0);

  useEffect(() => {
    if (hasSelectedLanguage) return;
    const interval = setInterval(() => {
      setLangTextIndex((prev) => (prev + 1) % SELECT_LANGUAGE_TEXTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [hasSelectedLanguage]);

  const handleSelectLanguage = (lang: string) => {
    useSettingsStore.getState().setLanguage(lang as any);
    setHasSelectedLanguage(true);
  };

  const handleGoBack = () => {
    setHasSelectedLanguage(false);
    setIsReady(false);
    setProgress(0);
    setMessageIndex(0);
    setDisplayText('');
    setSelectedCompanion(null);
    setHoveredId(null);
  };

  // Escape key to skip language selection
  useEffect(() => {
    if (hasSelectedLanguage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSelectLanguage('en');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasSelectedLanguage]);

  // Typewriter effect for messages
  useEffect(() => {
    if (!hasSelectedLanguage) return;
    
    let currentChar = 0;
    
    const typeInterval = setInterval(() => {
      const msgs = bootMessagesRef.current;
      if (messageIndex >= msgs.length) {
        clearInterval(typeInterval);
        return;
      }
      
      const targetText = msgs[messageIndex];
      setDisplayText(targetText.substring(0, currentChar + 1));
      
      if (currentChar < targetText.length) {
        currentChar++;
      } else {
        clearInterval(typeInterval);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [messageIndex, hasSelectedLanguage]);

  // Loading progress and message swapping
  useEffect(() => {
    if (!hasSelectedLanguage) return;
    let startTime = Date.now();
    const duration = 8000; // 8 seconds boot

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(p);

      // Change messages based on progress
      const msgs = bootMessagesRef.current;
      let msgIdx = 0;
      if (p < 15) msgIdx = 0;
      else if (p < 25) msgIdx = 1;
      else if (p < 75) msgIdx = 2; // Keep username on screen for 50% of the boot!
      else if (p < 90) msgIdx = 3;
      else msgIdx = 4;
      
      if (msgIdx !== messageIndex && p < 100) {
        setMessageIndex(msgIdx);
      }

      if (p >= 100) {
        setIsReady(true);
        setMessageIndex(msgs.length - 1);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [hasSelectedLanguage]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 z-[9999999] bg-[#050505] flex flex-col items-center justify-center overflow-hidden pointer-events-auto"
    >
      {/* Subtle background scanlines */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ 
          background: 'linear-gradient(to bottom, transparent 50%, rgba(255, 255, 255, 0.1) 51%)', 
          backgroundSize: '100% 4px' 
        }} 
      />

      {/* Cinematic Flash Overlay */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-white z-[999999999] pointer-events-none mix-blend-screen"
            style={{ boxShadow: 'inset 0 0 100px white' }}
          />
        )}
      </AnimatePresence>

      {/* Language Selection Screen */}
      <AnimatePresence>
        {!hasSelectedLanguage && (
          <motion.div
            key="language-screen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            className="flex flex-col items-center gap-8 z-30"
          >
            <div className="absolute top-8 right-8 z-[100]">
              <button 
                onClick={() => handleSelectLanguage('en')}
                className="text-[#22d3ee] font-mono tracking-widest text-sm opacity-50 hover:opacity-100 hover:scale-110 transition-all uppercase font-bold px-4 py-2"
              >
                {t('bootSequence.skipStep')}
              </button>
            </div>

            <div className="flex flex-col items-center gap-2 mb-8">
              <h1 className="font-black text-6xl sm:text-8xl tracking-[0.4em] ml-[0.4em] text-[#22d3ee] drop-shadow-[0_0_30px_rgba(34,211,238,0.8)] opacity-90">
                ROEDEX
              </h1>
            </div>

            <div className="h-10 mt-4 overflow-hidden flex items-center justify-center relative w-full mb-2">
              <AnimatePresence mode="wait">
                <motion.h2 
                  key={langTextIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="font-mono text-xl sm:text-2xl text-[#22d3ee] tracking-[0.3em] font-bold drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] absolute"
                >
                  {SELECT_LANGUAGE_TEXTS[langTextIndex]}
                </motion.h2>
              </AnimatePresence>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { code: 'en', label: 'ENGLISH' },
                { code: 'es', label: 'ESPAÑOL' },
                { code: 'ru', label: 'РУССКИЙ' },
                { code: 'ko', label: '한국어' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className="px-8 py-4 bg-[rgba(34,211,238,0.1)] border border-[#22d3ee] text-[#22d3ee] font-mono tracking-widest rounded-xl hover:bg-[#22d3ee] hover:text-[#050505] hover:scale-110 hover:shadow-[0_0_30px_rgba(34,211,238,0.8)] transition-all duration-200 font-bold cursor-pointer"
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Central Orb during boot */}
      <AnimatePresence>
        {hasSelectedLanguage && !isReady && (
          <motion.div 
            key="boot-orb"
            initial={{ scale: 0.1, opacity: 0 }}
            animate={{ scale: 1.5 + (progress / 200), opacity: 0.4 + (progress / 200) }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative w-32 h-32 mb-16 flex items-center justify-center pointer-events-none"
          >
            {/* Holographic scanning ring 1 */}
            <motion.div 
              className="absolute inset-[-40px] rounded-full border border-[#22d3ee]/20 border-t-[#22d3ee]/60 border-l-[#22d3ee]/60"
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ rotate: { repeat: Infinity, duration: 3, ease: "linear" }, scale: { repeat: Infinity, duration: 2, ease: "easeInOut" } }}
            />
            {/* Holographic scanning ring 2 */}
            <motion.div 
              className="absolute inset-[-20px] rounded-full border border-dashed border-[#22d3ee]/30"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            />
            {/* Core Orb */}
            <ParticleGlobe color={'#22d3ee'} isTalking={false} mood={'idle'} forceHighFPS={true} />
            
            {/* Data particles flowing up */}
            <motion.div 
              className="absolute inset-0 overflow-hidden rounded-full mask-image-radial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`data-dot-${i}`}
                  className="absolute w-1 h-1 bg-[#22d3ee] rounded-full"
                  style={{ left: `${20 + i * 15}%`, top: '100%' }}
                  animate={{ top: '-10%', opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 + i * 0.2, delay: i * 0.3, ease: "linear" }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title / Instructions when Ready */}
      <AnimatePresence>
        {isReady && !selectedCompanion && (
          <>
            <motion.div
              key="back-button"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute top-8 left-8 z-[100]"
            >
              <button
                onClick={handleGoBack}
                className="text-[#22d3ee] font-mono tracking-widest text-sm opacity-50 hover:opacity-100 transition-all uppercase font-bold px-4 py-2 flex items-center gap-2 group"
              >
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('bootSequence.back')}
              </button>
            </motion.div>
            <motion.div
              key="ready-text"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute top-[10vh] sm:top-[12vh] flex flex-col items-center gap-6 z-20 w-full"
            >
              <p className="font-mono text-3xl sm:text-5xl md:text-6xl uppercase tracking-[0.3em] font-black text-[#22d3ee] drop-shadow-[0_0_30px_rgba(34,211,238,0.8)] text-center">
                {t('bootSequence.chooseCompanion')}
              </p>
              <p className="font-mono text-sm sm:text-lg text-[#22d3ee]/80 uppercase tracking-[0.4em] text-center max-w-2xl mt-2">
                {t('bootSequence.hoverToPreview')}
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Selection Screen */}
      <AnimatePresence>
        {isReady && (
          <motion.div 
            key="selection-screen"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute top-[30vh] sm:top-[35vh] flex flex-row justify-evenly items-start z-20 w-full max-w-[95vw] px-4"
          >
            {Object.values(COMPANIONS).map(comp => (
              <motion.div 
                key={comp.id} 
                className="flex flex-col items-center gap-4 cursor-pointer group relative z-20"
                initial={false}
                animate={{
                   opacity: selectedCompanion ? (selectedCompanion === comp.id ? 1 : 0) : 1,
                   scale: selectedCompanion ? (selectedCompanion === comp.id ? 2.5 : 0.8) : 1,
                   y: selectedCompanion === comp.id ? -30 : (selectedCompanion ? 50 : 0)
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                onHoverStart={() => !selectedCompanion && setHoveredId(comp.id as CompanionId)}
                onHoverEnd={() => !selectedCompanion && setHoveredId(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedCompanion) return;
                  setSelectedCompanion(comp.id as CompanionId);
                  setHoveredId(comp.id as CompanionId);
                  
                  setTimeout(() => {
                    setIsFlashing(true);
                  }, 800);
                  
                  setTimeout(() => {
                    onComplete(comp.id as CompanionId);
                  }, 1200);
                }}
                whileHover={!selectedCompanion ? { scale: 1.1 } : {}}
                whileTap={!selectedCompanion ? { scale: 0.9 } : {}}
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 relative">
                  <ParticleGlobe 
                    color={comp.color}
                    isTalking={hoveredId === comp.id || selectedCompanion === comp.id}
                    mood={hoveredId === comp.id || selectedCompanion === comp.id ? 'happy' : 'dimmed'}
                    forceHighFPS={true}
                  />
                </div>
                <div 
                  className={`font-mono text-sm sm:text-2xl tracking-[0.4em] uppercase transition-all duration-500 mt-2 ${(hoveredId === comp.id || selectedCompanion === comp.id) ? 'opacity-100 font-black' : 'opacity-40 font-bold'}`}
                  style={{ color: (hoveredId === comp.id || selectedCompanion === comp.id) ? comp.color : '#888888', textShadow: (hoveredId === comp.id || selectedCompanion === comp.id) ? `0 0 20px ${comp.color}, 0 0 10px ${comp.color}` : 'none' }}
                >
                  {comp.name}
                </div>

                {/* Personality Card */}
                <div 
                  className={`absolute top-full mt-8 w-48 sm:w-56 p-4 sm:p-5 rounded-2xl border transition-all duration-500 flex flex-col items-center text-center backdrop-blur-xl pointer-events-none
                    ${(hoveredId === comp.id || selectedCompanion === comp.id) 
                      ? 'opacity-100 translate-y-0 shadow-[0_10px_40px_rgba(0,0,0,0.5)] scale-105' 
                      : 'opacity-0 translate-y-4 shadow-none scale-95'}`}
                  style={{
                    borderColor: (hoveredId === comp.id || selectedCompanion === comp.id) ? `${comp.color}80` : `${comp.color}30`, 
                    backgroundColor: (hoveredId === comp.id || selectedCompanion === comp.id) ? `${comp.color}15` : `${comp.color}05`, 
                    boxShadow: (hoveredId === comp.id || selectedCompanion === comp.id) ? `0 0 30px ${comp.color}20 inset` : 'none'
                  }}
                >
                  <p className="text-sm font-mono tracking-wide leading-relaxed" style={{ color: `${comp.color}cc` }}>
                    {t(`companions.${comp.id}.description` as any) || comp.description}
                  </p>
                  <div className="mt-4 pt-4 w-full border-t border-white/5">
                    <p className="text-xs italic font-serif leading-relaxed text-white/50">
                      "{t(`companions.${comp.id}.quote` as any) || comp.quotes.idle[0]}"
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boot Logs */}
      {hasSelectedLanguage && !isReady && (
        <div className="flex flex-col items-center justify-center z-10 w-full max-w-lg px-8">
          <div className="w-full flex justify-between items-end mb-2 font-mono text-[10px] tracking-widest text-[#22d3ee]">
            <span className="uppercase opacity-70">{t('bootSequence.systemBoot')}</span>
            <span className="font-bold">{progress}%</span>
          </div>
        
          {/* Progress Bar */}
          <div className="w-full h-1 bg-white/10 overflow-hidden mb-8 rounded-full">
            <motion.div 
              className="h-full bg-[#22d3ee]"
              style={{ width: `${progress}%` }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>

          {/* Typing Text */}
          <div className="h-8 flex items-center justify-center text-center">
            <AnimatePresence mode="wait">
              <motion.p 
                key="loading-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="font-mono text-xs uppercase tracking-widest text-white/60"
              >
                {displayText}
                <span className="animate-pulse">_</span>
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
};
