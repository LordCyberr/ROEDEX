import React, { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { Bot, AlertTriangle, PartyPopper, Ghost, Cat, Wand2, Skull, Smile, Dog } from 'lucide-react';
import { useTrackerStore } from '../../store/trackerStore';

export const BobOverlay: React.FC<{ constraintsRef?: React.RefObject<HTMLDivElement | null> }> = ({ constraintsRef }) => {
  const [expression, setExpression] = useState<'idle' | 'happy' | 'scared' | 'talking'>('idle');
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  
  const bobMessages = useTrackerStore((state) => state.bobMessages);
  const notificationSettings = useTrackerStore((state) => state.notificationSettings);
  const bobPosition = useTrackerStore((state) => state.bobPosition);
  const setBobPosition = useTrackerStore((state) => state.setBobPosition);
  const isUILocked = useTrackerStore((state) => state.isUILocked);

  const x = useMotionValue(bobPosition.x);
  const y = useMotionValue(bobPosition.y);

  const [isRight, setIsRight] = useState(bobPosition.x > (typeof window !== 'undefined' ? window.innerWidth / 2 : 500));
  const [isTop, setIsTop] = useState(bobPosition.y < (typeof window !== 'undefined' ? window.innerHeight / 2 : 500));

  useEffect(() => {
    let currentRight = bobPosition.x > window.innerWidth / 2;
    let currentTop = bobPosition.y < window.innerHeight / 2;

    const unsubX = x.on('change', (latestX) => {
      const newRight = latestX > window.innerWidth / 2;
      if (currentRight !== newRight) {
        currentRight = newRight;
        setIsRight(newRight);
      }
    });

    const unsubY = y.on('change', (latestY) => {
      const newTop = latestY < window.innerHeight / 2;
      if (currentTop !== newTop) {
        currentTop = newTop;
        setIsTop(newTop);
      }
    });
    return () => {
      unsubX();
      unsubY();
    };
  }, [x, y, bobPosition.x, bobPosition.y]);

  // Sync motion values if store changes from outside
  useEffect(() => {
    x.set(bobPosition.x);
    y.set(bobPosition.y);
  }, [bobPosition.x, bobPosition.y, x, y]);

  useEffect(() => {
    // Find the latest Bob message
    if (bobMessages.length > 0) {
      const latest = bobMessages[bobMessages.length - 1];
      setCurrentMessage(latest.message);
      
      // Determine expression based on message content
      const msg = latest.message.toLowerCase();
      if (msg.includes('slayer') || msg.includes('found') || msg.includes('wow')) {
        setExpression('happy');
      } else if (msg.includes('broke') || msg.includes('durability') || msg.includes('accidentally') || msg.includes('die')) {
        setExpression('scared');
      } else {
        setExpression('talking');
      }

      if (latest.id === 'placeholder_bob') return;

      // Reset to idle after message disappears
      const timeout = setTimeout(() => {
        setCurrentMessage(null);
        setExpression('idle');
      }, notificationSettings.bobDuration || 5000);
      
      return () => clearTimeout(timeout);
    } else {
      setCurrentMessage(null);
      setExpression('idle');
    }
  }, [bobMessages, notificationSettings.bobDuration]);

  if (!notificationSettings.bobMode || !notificationSettings.enabled) return null;

  const getIcon = () => {
    switch(notificationSettings.bobIcon) {
      case 'ghost': return Ghost;
      case 'cat': return Cat;
      case 'wizard': return Wand2;
      case 'skull': return Skull;
      case 'alien': return Smile;
      case 'dog': return Dog;
      default: return Bot;
    }
  };
  const BobIcon = getIcon();

  const renderFace = () => {
    return (
      <div className="relative w-full h-full flex items-center justify-center text-indigo-400">
        <BobIcon size={28} className={expression === 'talking' ? 'animate-pulse' : ''} />
        <div className="absolute -bottom-1 -right-1 bg-black/80 rounded-full p-0.5">
          {expression === 'happy' && <PartyPopper size={14} className="text-yellow-400" />}
          {expression === 'scared' && <AlertTriangle size={14} className="text-red-400" />}
          {expression === 'talking' && <BobIcon size={14} className="text-indigo-400" />}
          {expression === 'idle' && <div className="w-3.5 h-3.5 rounded-full bg-green-500/50"></div>}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      style={{ 
        x, 
        y, 
        transformOrigin: 'bottom left'
      }}
      drag
      dragMomentum={false}
      dragConstraints={constraintsRef}
      dragElastic={0}
      onDragEnd={() => {
        setBobPosition({ x: x.get(), y: y.get() });
      }}
      className={`fixed top-0 left-0 z-[70] ${isUILocked ? 'pointer-events-none' : 'pointer-events-auto'}`}
    >
      <div className="relative flex items-center justify-center w-14 h-14">
        <div 
          className="w-14 h-14 absolute inset-0 rounded-full bg-black/60 border-2 border-indigo-500/50 flex items-center justify-center backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:border-indigo-400 transition-all hover:scale-105 cursor-grab active:cursor-grabbing"
        style={{ transform: `scale(${notificationSettings.bobIconScale || 1.0})`, transformOrigin: `${isTop ? 'top' : 'bottom'} ${isRight ? 'right' : 'left'}`, touchAction: 'none' }}
      >
        {renderFace()}
      </div>
      {currentMessage && (() => {
        let themeClasses = 'bg-white text-black border-indigo-200 shadow-lg border';
        if (notificationSettings.bobTheme === 'cyberpunk') {
          themeClasses = 'bg-yellow-400 text-black border-pink-500 font-mono shadow-[0_0_10px_rgba(236,72,153,0.8)] border-2';
        } else if (notificationSettings.bobTheme === 'fantasy') {
          themeClasses = 'bg-[#2d1b11] text-[#fcd34d] border-[#b45309] shadow-[0_4px_15px_rgba(0,0,0,0.8)] border-2 font-serif';
        } else if (notificationSettings.bobTheme === 'minimal') {
          themeClasses = 'bg-black/80 text-white border-white/10 backdrop-blur-md shadow-lg border';
        } else if (notificationSettings.bobTheme === 'hologram') {
          themeClasses = 'bg-cyan-900/40 text-cyan-200 border-cyan-400 backdrop-blur shadow-[0_0_15px_rgba(34,211,238,0.5)] border';
        }

        return (
          <motion.div 
            onPointerDown={(e) => e.stopPropagation()}
            initial={{ opacity: 0, x: isRight ? 10 : -10, scale: 0.9 * (notificationSettings.bobTextScale || 1.0) }}
            animate={{ opacity: 1, x: 0, scale: 1 * (notificationSettings.bobTextScale || 1.0) }}
            style={{ 
              transformOrigin: `${isTop ? 'top' : 'bottom'} ${isRight ? 'right' : 'left'}`,
              [isRight ? 'right' : 'left']: `calc(100% + ${notificationSettings.bobBubbleDistance ?? 16}px)`,
              [isTop ? 'top' : 'bottom']: `${notificationSettings.bobBubbleOffsetY ?? 0}px`
            }}
            className={`absolute px-4 py-2 w-max max-w-[300px] cursor-default ${themeClasses}
              ${isTop && isRight ? 'rounded-2xl rounded-tr-sm' : ''}
              ${isTop && !isRight ? 'rounded-2xl rounded-tl-sm' : ''}
              ${!isTop && isRight ? 'rounded-2xl rounded-br-sm' : ''}
              ${!isTop && !isRight ? 'rounded-2xl rounded-bl-sm' : ''}
            `}
          >
            <p className="text-[11px] font-bold leading-tight whitespace-normal">{currentMessage}</p>
          </motion.div>
        );
      })()}
      </div>
    </motion.div>
  );
};
