import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../../../hooks/useTranslation';

interface Props {
  bobX: number;
  bobY: number;
  bubblePosition: 'left' | 'right' | 'top' | 'bottom';
  notificationSettings: any;
  companionColor: string;
  tutorialStep: number;
  stepsLength: number;
  currentStepData: any;
  actionCompleted: boolean;
  kills: number;
  handleNext: () => void;
  handlePrevious: () => void;
}

export const TutorialChatBubble: React.FC<Props> = ({
  bobX, bobY, bubblePosition, notificationSettings, companionColor,
  tutorialStep, stepsLength, currentStepData, actionCompleted, kills,
  handleNext, handlePrevious
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="absolute w-16 h-16 pointer-events-none z-[9999999]" style={{ left: bobX, top: bobY }}>
      <AnimatePresence>
        <motion.div
          key="bob-tutorial-bubble"
          initial={{ opacity: 0, scale: 0.8, x: bubblePosition === 'right' ? -20 : bubblePosition === 'left' ? 20 : 0, y: bubblePosition === 'top' ? 20 : bubblePosition === 'bottom' ? -20 : 0 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: bubblePosition === 'right' ? -20 : bubblePosition === 'left' ? 20 : 0, y: bubblePosition === 'top' ? 20 : bubblePosition === 'bottom' ? -20 : 0 }}
          className={`absolute flex flex-col items-start gap-4 transition-all duration-500 pointer-events-auto`}
          style={{
            left: bubblePosition === 'right' ? '100%' : bubblePosition === 'left' ? 'auto' : '50%',
            right: bubblePosition === 'left' ? '100%' : 'auto',
            top: bubblePosition === 'bottom' ? '100%' : bubblePosition === 'top' ? 'auto' : '50%',
            bottom: bubblePosition === 'top' ? '100%' : 'auto',
            transform: bubblePosition === 'left' ? `translate(calc(50px + ${-(notificationSettings?.companionBubbleDistance ?? 16)}px), calc(-50% + ${notificationSettings?.companionBubbleOffsetY ?? 0}px))` 
                     : bubblePosition === 'right' ? `translate(calc(-50px + ${notificationSettings?.companionBubbleDistance ?? 16}px), calc(-50% + ${notificationSettings?.companionBubbleOffsetY ?? 0}px))`
                     : bubblePosition === 'top' ? `translate(calc(-50%), calc(50px + ${-(notificationSettings?.companionBubbleDistance ?? 16)}px))`
                     : `translate(calc(-50%), calc(-50px + ${notificationSettings?.companionBubbleDistance ?? 16}px))`
          }}
        >
          <div 
            className="relative bg-[rgba(10,15,25,0.85)] backdrop-blur-xl border-[1px] p-5 rounded-3xl max-w-[350px] w-max"
            style={{
              borderColor: companionColor,
              boxShadow: `0 0 20px ${companionColor}40, inset 0 0 10px ${companionColor}20`,
            }}
          >
            {/* Scanline effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20 rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(255, 255, 255, 0.1) 51%)', backgroundSize: '100% 4px' }} />
            
            {/* Progress Bar */}
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mb-3">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${(tutorialStep / stepsLength) * 100}%`,
                  backgroundColor: companionColor
                }}
              />
            </div>

            <div className="relative z-10 text-[13px] font-bold tracking-wide leading-relaxed drop-shadow-md mb-2 text-center" style={{ color: 'var(--text-primary)' }}>
              {currentStepData ? (t(`tutorial.s${tutorialStep}` as any) || currentStepData.text) : ''}
              {currentStepData?.id === 'tutorial-quest' && (
                <div className="mt-3 p-2 bg-black/40 rounded border border-white/10 text-center font-mono tracking-widest text-[10px]" style={{ color: companionColor }}>
                  {t('tutorial.mobsKilled' as any) || 'MOBS KILLED'}: {kills} / 3
                </div>
              )}
            </div>

            {/* Step Dots Row */}
            <div className="flex items-center justify-center gap-1 my-1.5">
              {Array.from({ length: stepsLength }).map((_, i) => {
                const stepNum = i + 1;
                const isDone = stepNum < tutorialStep;
                const isCurrent = stepNum === tutorialStep;
                return (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full flex items-center justify-center text-[5px] font-black transition-all ${
                      isCurrent ? 'scale-125 ring-1' : isDone ? 'opacity-80' : 'opacity-30'
                    }`}
                    style={{
                      backgroundColor: isDone || isCurrent ? companionColor : 'rgba(255,255,255,0.3)',
                      borderColor: companionColor
                    }}
                  />
                );
              })}
            </div>
            
            <div className="relative z-10 flex justify-between items-center mt-2 pt-3 border-t" style={{ borderColor: `${companionColor}40` }}>
              <span className="text-[10px] uppercase font-mono tracking-widest" style={{ color: `${companionColor}aa` }}>{t('tutorial.step' as any)} {tutorialStep} / {stepsLength}</span>
              <div className="flex gap-2 items-center">
                {tutorialStep > 1 && (
                  <button
                    onClick={handlePrevious}
                    className="px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors hover:text-white"
                    style={{ color: 'var(--text-muted)' }}
                  >{t('tutorial.previous' as any)}</button>
                )}
                <button
                  onClick={handleNext}
                  className="px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors hover:text-white"
                  style={{ color: 'var(--text-muted)' }}
                >{t('tutorial.skip' as any)}</button>
                {(!currentStepData?.actionRequired || actionCompleted) ? (
                  <div className="relative">
                    <div className="absolute inset-[-6px] pointer-events-none rounded-xl animate-ring-zoom-in" style={{ borderColor: companionColor }} />
                    <button
                      onClick={handleNext}
                      className="relative px-5 py-1.5 rounded-lg text-[11px] font-black tracking-widest uppercase transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:brightness-125 animate-pulse z-10"
                      style={{
                        backgroundColor: `${companionColor}40`,
                        color: companionColor,
                        border: `1px solid ${companionColor}`,
                        boxShadow: `0 0 15px ${companionColor}80`
                      }}
                    >{t('tutorial.next' as any)}</button>
                  </div>
                ) : (
                  <span className="text-[10px] font-mono tracking-widest animate-pulse" style={{ color: companionColor }}>{t('tutorial.awaitingInput' as any)}</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
