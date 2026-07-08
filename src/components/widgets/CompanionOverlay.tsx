import React, { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { ParticleGlobe } from './ParticleGlobe';
import { AICompanion } from '../../core/companion/AICompanion';
import { COMPANIONS } from '../../data/companions';

export const CompanionOverlay: React.FC<{ constraintsRef?: React.RefObject<HTMLDivElement | null> }> = ({ constraintsRef }) => {
  const [expression, setExpression] = useState<'happy' | 'alert' | 'mining' | 'combat' | 'idle' | 'talking' | 'chop' | 'running'>('idle');
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [isAsleep, setIsAsleep] = useState(true);
  
  const { playerName } = useTrackerStore(
    useShallow((state) => ({
      playerName: state.playerProfile?.name,
    }))
  );
  const { companionMessages, notificationSettings, companionPosition, setCompanionPosition, isUILocked, activeCompanion, isMinimized } = useSettingsStore(useShallow((state) => ({
      companionMessages: state.companionMessages,
      notificationSettings: state.notificationSettings,
      companionPosition: state.companionPosition,
      setCompanionPosition: state.setCompanionPosition,
      isUILocked: state.isUILocked,
      activeCompanion: state.activeCompanion,
      isMinimized: state.isMinimized
    }))
  );

  const companion = COMPANIONS[activeCompanion || 'bob'] || COMPANIONS['bob'];

  const x = useMotionValue(companionPosition?.x ?? 800);
  const y = useMotionValue(companionPosition?.y ?? 220);

  const getBubblePosition = (bx: number, by: number): 'left' | 'right' | 'top' | 'bottom' => {
    if (typeof window === 'undefined') return 'right';
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    
    // Bottom: bottom 20%
    if (by > winH * 0.8) return 'top';
    
    // Extreme top center: top 15%, middle third
    if (by < winH * 0.15 && bx > winW * 0.33 && bx < winW * 0.66) return 'bottom';
    
    // Right half
    if (bx > winW / 2) return 'left';
    
    // Left half
    return 'right';
  };

  const [bubblePosition, setBubblePosition] = useState<'left' | 'right' | 'top' | 'bottom'>(
    getBubblePosition(companionPosition?.x ?? 800, companionPosition?.y ?? 220)
  );
  const [isShaking, setIsShaking] = useState(false);
  const [displayedMessage, setDisplayedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentMessage) {
      setDisplayedMessage(currentMessage);
    }
  }, [currentMessage]);

  const handleWakeUp = () => {
    if (!isAsleep) return;
    setIsAsleep(false);
    AICompanion.wakeUp(playerName);
  };

  useEffect(() => {
    const unsubX = x.on('change', (latestX) => {
      setBubblePosition(getBubblePosition(latestX, y.get()));
    });

    const unsubY = y.on('change', (latestY) => {
      setBubblePosition(getBubblePosition(x.get(), latestY));
    });

    const handleResize = () => {
      setBubblePosition(getBubblePosition(x.get(), y.get()));
    };
    window.addEventListener('resize', handleResize);

    return () => {
      unsubX();
      unsubY();
      window.removeEventListener('resize', handleResize);
    };
  }, [x, y, companionPosition?.x, companionPosition?.y]);

  // Sync motion values if store changes from outside
  useEffect(() => {
    x.set(companionPosition?.x ?? 800);
    y.set(companionPosition?.y ?? 220);
  }, [companionPosition?.x, companionPosition?.y, x, y]);

  useEffect(() => {
    if (isShaking) {
      setExpression('alert');
      const timer = setTimeout(() => setIsShaking(false), 2000);
      return () => clearTimeout(timer);
    }
    
    // Find the latest Bob message
    if (companionMessages.length > 0) {
      const latest = companionMessages[companionMessages.length - 1];
      setCurrentMessage(latest.message);
      
      // Auto-wake if a message comes in while sleeping
      if (isAsleep && latest.id !== 'placeholder_companion') {
        setIsAsleep(false);
      }
      
      // Determine expression based on message content or explicit emotion
      if (latest.emotion) {
        setExpression(latest.emotion);
      } else {
        const msg = latest.message.toLowerCase();
        if (msg.includes('slayer') || msg.includes('found') || msg.includes('wow') || msg.includes('level up') || msg.includes('rare')) {
          setExpression('happy');
        } else if (msg.includes('broke') || msg.includes('durability') || msg.includes('die') || msg.includes('dead') || msg.includes('danger')) {
          setExpression('alert');
        } else if (msg.includes('combat') || msg.includes('hit') || msg.includes('kill') || msg.includes('sword') || msg.includes('slash')) {
          setExpression('combat');
        } else if (msg.includes('mine') || msg.includes('ore') || msg.includes('pickaxe') || msg.includes('rock') || msg.includes('stone')) {
          setExpression('mining');
        } else if (msg.includes('chop') || msg.includes('wood') || msg.includes('tree') || msg.includes('log') || msg.includes('axe')) {
          setExpression('chop');
        } else {
          setExpression('talking');
        }
      }

      if (latest.id === 'placeholder_companion') return;

      // Reset to idle after message disappears
      const timeout = setTimeout(() => {
        setCurrentMessage(null);
        setExpression('idle');
      }, notificationSettings.companionDuration || 5000);
      
      return () => clearTimeout(timeout);
    } else {
      setCurrentMessage(null);
      setExpression('idle');
    }
  }, [companionMessages, notificationSettings.companionDuration, isShaking]);

  if (!notificationSettings.companionMode || !notificationSettings.enabled) return null;

  const getFaceMood = (): string => {
    if (isAsleep) return 'sleeping';
    if (isShaking) return 'thinking';
    if (notificationSettings.tutorialStep > 0) {
      return notificationSettings.companionMood || 'idle';
    }
    
    switch(expression) {
      case 'happy': return 'happy';
      case 'alert': return 'angry';
      case 'talking': return 'talking';
      case 'mining':
      case 'combat':
      case 'chop':
      case 'running': return 'talking';
      default: return 'idle';
    }
  };

  const renderFace = () => {
    // When minimized and no message, render a static dot instead of the full particle system
    // This completely stops the canvas animation loop and saves 15-25 FPS
    if (isMinimized && !currentMessage) {
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Radial Pulse / Beep Effect */}
          <div className="absolute w-6 h-6 rounded-full animate-ping opacity-70" 
            style={{ backgroundColor: companion.color }} 
          />
          {/* Core Dot */}
          <div className="w-3 h-3 rounded-full relative z-10" 
            style={{ backgroundColor: companion.color, boxShadow: `0 0 10px ${companion.color}` }} 
          />
        </div>
      );
    }
    return (
      <div className="relative w-full h-full flex items-center justify-center text-indigo-400">
        {/* Solid dark core to occlude the chat bubble passing behind it */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#0a0f19] shadow-[0_0_15px_12px_#0a0f19]" />
        <ParticleGlobe 
          mood={getFaceMood()} 
          isTalking={!!currentMessage} 
          color={companion.color} 
        />
      </div>
    );
  };

  const faceMood = getFaceMood();
  let currentOrbColor = companion.color;
  if (faceMood === 'angry') currentOrbColor = '#ff2222';
  else if (faceMood === 'sleeping') currentOrbColor = '#334455';

  return (
    <motion.div
      style={{ 
        x, 
        y, 
        transformOrigin: 'bottom left',
        willChange: 'transform'
      }}
      animate={isShaking ? { rotate: [-15, 15, -15, 15, -10, 10, -5, 5, 0] } : {}}
      transition={{ duration: 0.5 }}
      drag
      dragMomentum={false}
      dragConstraints={constraintsRef}
      dragElastic={0}
      onDrag={(_, info) => {
        if (Math.abs(info.velocity.x) > 600 || Math.abs(info.velocity.y) > 600) {
          setIsShaking(true);
        }
      }}
      onDragEnd={() => {
        setCompanionPosition({ x: x.get(), y: y.get() });
      }}
      className={`fixed top-0 left-0 w-16 h-16 ${notificationSettings.tutorialStep > 0 ? 'z-[9999999]' : 'z-[70]'} ${isUILocked ? 'pointer-events-none' : 'pointer-events-auto'}`}
    >
      <motion.div
        className="absolute inset-0 z-20"
        style={{ transform: `scale(${notificationSettings.companionIconScale || 1.0})` }}
      >
        <div 
          className="w-full h-full flex items-center justify-center cursor-pointer overflow-visible rounded-none"
          style={{ background: 'transparent', touchAction: 'none' }}
          onDoubleClick={handleWakeUp}
        >
          {renderFace()}
        </div>
      </motion.div>

      <div
        className="absolute z-10 pointer-events-none"
        style={{
          left: bubblePosition === 'right' ? '100%' : bubblePosition === 'left' ? 'auto' : '50%',
          right: bubblePosition === 'left' ? '100%' : 'auto',
          top: bubblePosition === 'bottom' ? '100%' : bubblePosition === 'top' ? 'auto' : '50%',
          bottom: bubblePosition === 'top' ? '100%' : 'auto',
          transform: bubblePosition === 'left' ? `translate(calc(50px + ${-(notificationSettings.companionBubbleDistance ?? 16)}px), calc(-50% + ${notificationSettings.companionBubbleOffsetY ?? 0}px))` 
                   : bubblePosition === 'right' ? `translate(calc(-50px + ${notificationSettings.companionBubbleDistance ?? 16}px), calc(-50% + ${notificationSettings.companionBubbleOffsetY ?? 0}px))`
                   : bubblePosition === 'top' ? `translate(calc(-50%), calc(50px + ${-(notificationSettings.companionBubbleDistance ?? 16)}px))`
                   : `translate(calc(-50%), calc(-50px + ${notificationSettings.companionBubbleDistance ?? 16}px))`
        }}
      >
        <motion.div 
          layout
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ 
            opacity: currentMessage ? 1 : 0, 
            scale: currentMessage ? 1 : 0.8,
            y: currentMessage ? 0 : 10
          }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 25 
          }}
          className={`w-max max-w-[350px] min-h-[48px] flex items-center justify-center ${isUILocked ? 'pointer-events-none' : 'pointer-events-auto'}
            ${currentMessage ? (notificationSettings.companionBubbleTheme === 'floating' ? 'rounded-[16px] backdrop-blur-md bg-[rgba(20,25,35,0.9)] shadow-xl border-[1px]' : notificationSettings.companionBubbleTheme === 'holographic' ? 'rounded-[8px] backdrop-blur-sm border-[1px]' : 'rounded-[24px] backdrop-blur-xl border-[2px] bg-[rgba(10,15,25,0.85)]') : 'bg-transparent border-transparent rounded-[24px]'}
          `}
          style={{
            backgroundColor: currentMessage && notificationSettings.companionBubbleTheme === 'holographic' ? `${currentOrbColor}25` : undefined,
            borderColor: currentMessage ? currentOrbColor : 'transparent',
            boxShadow: currentMessage ? (notificationSettings.companionBubbleTheme === 'holographic' ? `0 0 15px ${currentOrbColor}80, inset 0 0 10px ${currentOrbColor}40` : `0 0 20px ${currentOrbColor}40, inset 0 0 10px ${currentOrbColor}20`) : 'none',
            clipPath: currentMessage 
              ? 'inset(0% 0% 0% 0%)' 
              : bubblePosition === 'left' ? 'inset(0% 56px 0% calc(100% - 56px))' 
              : bubblePosition === 'right' ? 'inset(0% calc(100% - 56px) 0% 56px)' 
              : bubblePosition === 'top' ? 'inset(calc(100% - 56px) 0% 56px 0%)' 
              : 'inset(56px 0% calc(100% - 56px) 0%)'
          }}
        >
        {/* Scanline effect */}
        {displayedMessage && (
          <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden rounded-inherit" 
            style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(255, 255, 255, 0.1) 51%)', backgroundSize: '100% 4px' }} 
          />
        )}

        {/* The Text */}
        {displayedMessage && (
          <div 
            className={`relative z-10 font-bold tracking-wide leading-relaxed whitespace-pre-wrap break-words max-w-[320px] sm:max-w-[400px] drop-shadow-md py-3 text-center
              ${notificationSettings.companionBubbleTheme === 'connected' || !notificationSettings.companionBubbleTheme ? (bubblePosition === 'left' ? 'pl-6 pr-[90px]' : bubblePosition === 'right' ? 'pr-6 pl-[90px]' : bubblePosition === 'top' ? 'px-6 pt-3 pb-[90px]' : 'px-6 pb-3 pt-[90px]') : 'px-6'}
            `}
            style={{ 
              color: notificationSettings.companionBubbleTheme === 'holographic' ? currentOrbColor : 'var(--text-primary)',
              fontSize: `calc(13px * ${notificationSettings.companionTextScale || 1.0})`
            }}
          >
            {displayedMessage}
          </div>
        )}
      </motion.div>
    </div>
    </motion.div>
  );
};
