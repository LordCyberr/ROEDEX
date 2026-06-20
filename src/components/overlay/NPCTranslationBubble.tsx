import React, { useEffect, useState } from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { motion, AnimatePresence } from 'framer-motion';

export const NPCTranslationBubble: React.FC = () => {
  const currentDialogue = useTrackerStore((state) => state.currentNpcDialogue);
  const language = useTrackerStore((state) => state.language);
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    if (!currentDialogue?.translatedText) {
      setDisplayedText('');
      return;
    }

    // Typing effect
    let i = 0;
    const fullText = currentDialogue.translatedText;
    setDisplayedText('');
    
    const intervalId = setInterval(() => {
      setDisplayedText(fullText.substring(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(intervalId);
      }
    }, 30); // 30ms per character

    return () => clearInterval(intervalId);
  }, [currentDialogue?.translatedText]);

  if (!currentDialogue || !currentDialogue.translatedText) return null;

  // We only show it if the target language is not English, or if we are testing
  // (We'll render it anyway for testing purposes)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 pointer-events-none"
      >
        <div className="relative group">
          {/* Glowing border effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
          
          {/* Main Bubble */}
          <div className="relative bg-[#1a1b26]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-4">
            
            {/* Speaker Name Tag */}
            <div className="absolute -top-3 left-4 bg-blue-500/20 border border-blue-500/50 px-3 py-0.5 rounded-full backdrop-blur-sm">
              <span className="text-xs font-bold text-blue-200 tracking-wide uppercase">
                {currentDialogue.speaker} <span className="text-blue-400/50 ml-1">[{language.toUpperCase()}]</span>
              </span>
            </div>

            {/* Translated Text */}
            <div className="mt-2 min-h-[48px] flex items-center">
              <p className="text-gray-100 text-[15px] leading-relaxed font-medium">
                {displayedText}
                <span className="inline-block w-1.5 h-4 ml-1 bg-blue-400/50 animate-pulse align-middle"></span>
              </p>
            </div>
            
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
