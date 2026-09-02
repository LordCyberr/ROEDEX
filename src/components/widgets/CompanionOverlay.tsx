import React, { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { ParticleGlobe } from './ParticleGlobe';
import { Lock, Unlock } from 'lucide-react';
import { AICompanion } from '../../core/companion/AICompanion';
import { COMPANIONS } from '../../data/companions';

export const CompanionOverlay: React.FC<{ constraintsRef?: React.RefObject<HTMLDivElement | null> }> = ({ constraintsRef }) => {
  const [expression, setExpression] = useState<'happy' | 'alert' | 'mining' | 'combat' | 'idle' | 'talking' | 'chop' | 'running'>('idle');
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [isAsleep, setIsAsleep] = useState(true);
  
  const { playerName, isWeaponLowDurability } = useTrackerStore(
    useShallow((state) => ({
      playerName: state.playerProfile?.name,
      isWeaponLowDurability: state.weapon ? (state.weapon.maxDurability > 0 && state.weapon.durability / state.weapon.maxDurability < 0.2) : false,
    }))
  );
  const { companionMessages, notificationSettings, companionPosition, setCompanionPosition, isUILocked, activeCompanion, isMinimized, performanceMode, orbClickThrough, setOrbClickThrough } = useSettingsStore(useShallow((state) => ({
      companionMessages: state.companionMessages,
      notificationSettings: state.notificationSettings,
      companionPosition: state.companionPosition,
      setCompanionPosition: state.setCompanionPosition,
      isUILocked: state.isUILocked,
      activeCompanion: state.activeCompanion,
      isMinimized: state.isMinimized,
      performanceMode: state.performanceMode,
      orbClickThrough: state.orbClickThrough,
      setOrbClickThrough: state.setOrbClickThrough
    }))
  );

  const companion = COMPANIONS[(activeCompanion as keyof typeof COMPANIONS) || 'bob'] || COMPANIONS['bob'];

  const safeCompX = typeof companionPosition?.x === 'number' && !isNaN(companionPosition.x) ? companionPosition.x : 800;
  const safeCompY = typeof companionPosition?.y === 'number' && !isNaN(companionPosition.y) ? companionPosition.y : 220;
  const x = useMotionValue(safeCompX);
  const y = useMotionValue(safeCompY);

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
    // Guard NaN: companionPosition values could be NaN from corrupted storage.
    // NaN !== null/undefined so ?? 800 won't help — explicit check needed.
    const sx = (typeof companionPosition?.x === 'number' && !isNaN(companionPosition.x)) ? companionPosition.x : 800;
    const sy = (typeof companionPosition?.y === 'number' && !isNaN(companionPosition.y)) ? companionPosition.y : 220;
    x.set(sx);
    y.set(sy);
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

  if (isMinimized && !currentMessage && companionMessages.length === 0) {
    return (
      <div
        style={{ position: 'fixed', left: companionPosition?.x ?? 800, top: companionPosition?.y ?? 220, zIndex: 9999 }}
        className="pointer-events-none"
      >
        <div className="w-3 h-3 rounded-full"
          style={{ backgroundColor: companion.color, boxShadow: `0 0 8px ${companion.color}` }}
        />
      </div>
    );
  }

  const getFaceMood = (): string => {
    if (isAsleep) return 'sleeping';
    if (isShaking) return 'thinking';
    if (notificationSettings.tutorialStep > 0) {
      return notificationSettings.companionMood || 'idle';
    }
    
    // Contextual awareness: if weapon durability is very low, Bob is worried/alert
    if (isWeaponLowDurability) {
      if (!currentMessage) return 'angry'; // Alert face when low durability
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
    // When performanceMode is true OR (minimized and no message), render a static dot instead of the full particle system
    // This completely stops the canvas animation loop and saves 15-25 FPS
    if (performanceMode || (isMinimized && !currentMessage)) {
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
      drag={!isUILocked && !orbClickThrough}
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
      className={`fixed top-0 left-0 w-16 h-16 group pointer-events-none ${notificationSettings.tutorialStep > 0 ? 'z-[9999999]' : 'z-[70]'}`}
    >
      <motion.div
        className="absolute inset-0 z-20 rounded-full"
        style={{ transform: `scale(${notificationSettings.companionIconScale || 1.0})` }}
        animate={
          faceMood === 'happy' ? { boxShadow: ['0 0 0px rgba(34,197,94,0)', '0 0 30px rgba(34,197,94,0.8)', '0 0 0px rgba(34,197,94,0)'] } :
          faceMood === 'angry' ? { boxShadow: ['0 0 0px rgba(239,68,68,0)', '0 0 30px rgba(239,68,68,0.8)', '0 0 0px rgba(239,68,68,0)'] } :
          faceMood === 'thinking' ? { boxShadow: ['0 0 0px rgba(59,130,246,0)', '0 0 30px rgba(59,130,246,0.8)', '0 0 0px rgba(59,130,246,0)'] } :
          { boxShadow: 'none' }
        }
        transition={{ duration: 3, repeat: 2 }}
      >
        <div 
          className={`w-full h-full flex items-center justify-center cursor-pointer overflow-visible rounded-full ${(isUILocked || orbClickThrough) ? 'pointer-events-none' : 'pointer-events-auto'}`}
          style={{ background: 'transparent', touchAction: 'none' }}
          onDoubleClick={handleWakeUp}
        >
          {renderFace()}
        </div>
      </motion.div>

      {/* Click-through Lock Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOrbClickThrough(!orbClickThrough);
        }}
        className={`absolute bottom-0 right-0 p-1.5 rounded-full border transition-all z-30 pointer-events-auto cursor-pointer shadow-lg ${
          orbClickThrough 
            ? 'opacity-85 hover:opacity-100 bg-amber-950/90 border-amber-500/70 text-amber-400 scale-100 hover:scale-110 shadow-[0_0_12px_rgba(245,158,11,0.6)]' 
            : 'opacity-0 group-hover:opacity-100 hover:opacity-100 bg-slate-900/90 border-white/20 text-slate-300 hover:bg-black hover:scale-110'
        }`}
        title={orbClickThrough ? "Click-Through Active (Click to Unlock)" : "Toggle Click-Through"}
      >
        {orbClickThrough ? <Lock size={10} className="text-amber-400" /> : <Unlock size={10} className="text-slate-300" />}
      </button>

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
            ${currentMessage ? (
              notificationSettings.companionBubbleTheme === 'floating' 
                ? 'rounded-[16px] backdrop-blur-xl bg-[#06090f]/95 shadow-[0_15px_40px_rgba(0,0,0,0.9)] border-[1px]' 
                : notificationSettings.companionBubbleTheme === 'holographic' 
                  ? 'rounded-[8px] backdrop-blur-md border-[1px]' 
                  : notificationSettings.bobBubbleStyle === 'cyber'
                    ? 'rounded-none backdrop-blur-md bg-black/95 border-t-2 border-b-2'
                    : notificationSettings.bobBubbleStyle === 'glass'
                      ? 'rounded-[20px] backdrop-blur-2xl bg-white/5 border border-white/20'
                      : 'rounded-[22px] backdrop-blur-2xl border-[1.5px] bg-[#06090f]/95 shadow-[0_15px_40px_rgba(0,0,0,0.9)]'
            ) : 'bg-transparent border-transparent rounded-[24px]'}
          `}
          style={{
            backgroundColor: currentMessage && notificationSettings.companionBubbleTheme === 'holographic' 
              ? `${currentOrbColor}20` 
              : currentMessage 
                ? 'rgba(6, 9, 15, 0.95)' 
                : undefined,
            borderColor: currentMessage 
              ? (notificationSettings.bobBubbleStyle === 'glass' ? 'rgba(255,255,255,0.2)' : currentOrbColor) 
              : 'transparent',
            boxShadow: currentMessage ? (
              notificationSettings.bobBubbleStyle === 'cyber'
                ? `0 0 20px ${currentOrbColor}90, inset 0 0 8px ${currentOrbColor}50`
                : notificationSettings.bobBubbleStyle === 'glass'
                  ? `0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.08)`
                  : notificationSettings.companionBubbleTheme === 'holographic' 
                    ? `0 0 20px ${currentOrbColor}80, inset 0 0 12px ${currentOrbColor}40` 
                    : `0 10px 35px -5px rgba(0,0,0,0.9), 0 0 25px ${currentOrbColor}35, inset 0 1px 0 rgba(255,255,255,0.1)`
            ) : 'none',
            clipPath: currentMessage 
              ? (notificationSettings.bobBubbleStyle === 'cyber' 
                  ? 'polygon(0 10px, 10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' 
                  : undefined)
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
          <div className="relative z-10 flex flex-col items-center">
            <div 
              className={`font-bold tracking-wide leading-relaxed whitespace-pre-wrap break-words max-w-[320px] sm:max-w-[400px] drop-shadow-md py-3 text-center
                ${notificationSettings.companionBubbleTheme === 'connected' || !notificationSettings.companionBubbleTheme ? (bubblePosition === 'left' ? 'pl-6 pr-[90px]' : bubblePosition === 'right' ? 'pr-6 pl-[90px]' : bubblePosition === 'top' ? 'px-6 pt-3 pb-[90px]' : 'px-6 pb-3 pt-[90px]') : 'px-6'}
              `}
              style={{ 
                color: notificationSettings.companionBubbleTheme === 'holographic' ? currentOrbColor : 'var(--text-primary)',
                fontSize: `calc(13px * ${notificationSettings.companionTextScale || 1.0})`
              }}
            >
              {displayedMessage}
            </div>

            {/* Equalizer Waveform Lines matching companion theme color */}
            <div className="flex items-end gap-1 mb-2.5 h-3 opacity-90 select-none">
              <span className="w-1 rounded-full animate-pulse" style={{ backgroundColor: currentOrbColor, height: '60%', animationDelay: '0.1s', boxShadow: `0 0 6px ${currentOrbColor}` }} />
              <span className="w-1 rounded-full animate-pulse" style={{ backgroundColor: currentOrbColor, height: '100%', animationDelay: '0.3s', boxShadow: `0 0 6px ${currentOrbColor}` }} />
              <span className="w-1 rounded-full animate-pulse" style={{ backgroundColor: currentOrbColor, height: '40%', animationDelay: '0.2s', boxShadow: `0 0 6px ${currentOrbColor}` }} />
              <span className="w-1 rounded-full animate-pulse" style={{ backgroundColor: currentOrbColor, height: '80%', animationDelay: '0.4s', boxShadow: `0 0 6px ${currentOrbColor}` }} />
              <span className="w-1 rounded-full animate-pulse" style={{ backgroundColor: currentOrbColor, height: '50%', animationDelay: '0.15s', boxShadow: `0 0 6px ${currentOrbColor}` }} />
            </div>
          </div>
        )}
      </motion.div>
    </div>
    </motion.div>
  );
};
