import React, { useEffect, useRef, useState } from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence, useDragControls, useMotionValue } from 'motion/react';
import { Sparkles, Star, Info, Sword, Pickaxe, Map, CheckCircle2 } from 'lucide-react';

const BootSequenceToast = ({ notif, animConfig, width, height, opacity, isTop, toastShape }: any) => {
  const [displayText, setDisplayText] = useState('');
  const [subTextIndex, setSubTextIndex] = useState(0);
  const [cycleIndex, setCycleIndex] = useState(0);
  
  const subTexts = [
    'INITIALIZING MODULES...',
    'SYNCING GAME STATE...',
    'ESTABLISHING SECURE CONNECTION...'
  ];

  // 5 dots
  const dotsCount = 5;

  useEffect(() => {
    let currentChar = 0;
    const targetText = notif.title || 'SYSTEM BOOT';
    const typeInterval = setInterval(() => {
      setDisplayText(targetText.substring(0, currentChar + 1));
      if (currentChar < targetText.length) {
        currentChar++;
      } else {
        clearInterval(typeInterval);
      }
    }, 40);

    const subInterval = setInterval(() => {
      setSubTextIndex(prev => Math.min(prev + 1, subTexts.length - 1));
    }, 1500);

    const blockInterval = setInterval(() => {
      setCycleIndex(prev => (prev + 1) % dotsCount);
    }, 400);

    return () => {
      clearInterval(typeInterval);
      clearInterval(subInterval);
      clearInterval(blockInterval);
    };
  }, [notif.title]);

  return (
    <motion.div
      layout
      initial={animConfig.initial}
      animate={{ ...animConfig.animate, x: 0, y: 0 }}
      exit={animConfig.exit}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{ 
        minWidth: width ? `${width * 1.2}px` : '320px',
        width: 'auto',
        maxWidth: 'calc(100vw - 32px)', 
        minHeight: height ? `${height * 1.2}px` : '80px',
        opacity,
        transformOrigin: isTop ? 'top center' : 'bottom center'
      }}
      className={`flex flex-col justify-center backdrop-blur-xl px-10 py-6 pointer-events-auto bg-[var(--bg-panel)] border-2 border-[#22d3ee]/50 ${toastShape} shadow-[0_0_30px_rgba(34,211,238,0.4)] relative overflow-hidden`}
    >
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#22d3ee] to-transparent animate-pulse" />
      <div className="flex items-center gap-3 mb-4 justify-center w-full">
        <span className="text-[#22d3ee] font-mono text-xl md:text-2xl tracking-[0.2em] uppercase font-bold drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] whitespace-nowrap">
          &gt;_  {displayText}<span className="animate-pulse">_</span>
        </span>
      </div>
      <div className="flex items-center justify-between w-full px-4 mt-2">
        <span className="text-[#22d3ee]/80 font-mono text-sm md:text-base tracking-widest uppercase whitespace-nowrap">
          {subTexts[subTextIndex]}
        </span>
        <div className="flex gap-2 ml-6">
          {Array.from({ length: dotsCount }).map((_, i) => (
            <div 
              key={i} 
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i <= cycleIndex 
                  ? 'bg-[#22d3ee] shadow-[0_0_12px_#22d3ee] scale-125' 
                  : 'bg-[#22d3ee]/20'
              }`} 
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const SystemOnlineToast = ({ notif, animConfig, width, height, opacity, isTop, toastShape }: any) => {
  return (
    <motion.div
      layout
      initial={{ ...animConfig.initial, scale: 0.8 }}
      animate={{ ...animConfig.animate, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, scaleY: 0.05, scaleX: 1.5, filter: 'blur(10px)', transition: { duration: 0.3 } }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      style={{ 
        minWidth: width ? `${width * 1.2}px` : '320px',
        width: 'auto',
        maxWidth: 'calc(100vw - 32px)', 
        minHeight: height ? `${height * 1.2}px` : '80px',
        opacity,
        transformOrigin: isTop ? 'top center' : 'bottom center'
      }}
      className={`flex items-center justify-center backdrop-blur-xl px-10 py-6 pointer-events-auto bg-[var(--bg-panel)] border-2 border-green-500/60 ${toastShape} shadow-[0_0_35px_rgba(34,197,94,0.5)] relative overflow-hidden`}
    >
      <motion.div 
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0 bg-white z-10 mix-blend-screen"
      />
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_15px_#4ade80]" />
      
      <div className="flex flex-col items-center justify-center w-full gap-2 text-center relative z-20">
        <div className="flex items-center justify-center gap-3 mb-2">
          <CheckCircle2 size={28} className="text-green-400 drop-shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
          <span className="text-[18px] md:text-[22px] font-black text-green-400 tracking-[0.2em] uppercase drop-shadow-[0_0_15px_rgba(74,222,128,0.6)] whitespace-nowrap">
            {notif.title}
          </span>
        </div>
        <span className="text-white/90 font-mono font-bold tracking-wider text-sm md:text-base uppercase drop-shadow-lg whitespace-nowrap">
          {notif.message}
        </span>
      </div>
    </motion.div>
  );
};

export const NotificationToaster: React.FC = () => {
  // Single useShallow call — was 4 separate subscriptions
  const { notifications, removeNotification, notificationSettings, updateNotificationSettings } = useTrackerStore(
    useShallow((state) => ({
      notifications: state.notifications,
      removeNotification: state.removeNotification,
      notificationSettings: state.notificationSettings,
      updateNotificationSettings: state.updateNotificationSettings,
    }))
  );
  const { 
    position, animation, duration, width, height, scale, opacity, 
    customPositionX, customPositionY, toastShape, neonGlow 
  } = notificationSettings;
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Use a ref to track timers per notification id.
  // Bug fix: old code used [notifications, duration] as deps which restarted ALL timers
  // whenever 'duration' setting changed. Now each notification gets its own stable timer.
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const currentIds = new Set(notifications.map(n => n.id));
    
    // Clear timers for notifications that are gone
    Object.keys(timersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
      }
    });

    // Start timers only for NEW notifications (not already tracked)
    notifications.forEach(n => {
      if (n.id === 'placeholder') return;
      if (!(n.id in timersRef.current)) {
        timersRef.current[n.id] = setTimeout(() => {
          removeNotification(n.id);
          delete timersRef.current[n.id];
        }, duration);
      }
    });
  // Only re-run when the count changes, not on every notification reference
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications.length, removeNotification]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(t => clearTimeout(t));
    };
  }, []);

  const getPositionStyles = (): React.CSSProperties => {
    if (position === 'custom') {
      return { top: customPositionY, left: customPositionX };
    }
    return {};
  };

  const getPositionClasses = () => {
    if (position === 'custom') return '';
    switch (position) {
      case 'top-left': return 'top-4 left-4';
      case 'top-center': return 'top-4 left-1/2 -translate-x-1/2';
      case 'top-right': return 'top-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'bottom-center': return 'bottom-4 left-1/2 -translate-x-1/2';
      case 'bottom-right': return 'bottom-4 right-4';
      default: return 'top-4 right-4';
    }
  };

  const isTop = position.startsWith('top') || position === 'custom';

  const getAnimationConfig = () => {
    const yOffset = isTop ? -20 : 20;
    switch (animation) {
      case 'fade': return { initial: { opacity: 0, scale }, animate: { opacity: 1, scale }, exit: { opacity: 0, scale } };
      case 'pop': return { initial: { opacity: 0, scale: 0.8 * scale }, animate: { opacity: 1, scale }, exit: { opacity: 0, scale: 0.8 * scale } };
      case 'slide': default: return { initial: { opacity: 0, y: yOffset, scale: 0.95 * scale }, animate: { opacity: 1, y: 0, scale }, exit: { opacity: 0, scale: 0.95 * scale } };
    }
  };

  const animConfig = getAnimationConfig();

  const getShapeClass = () => {
    switch (toastShape) {
      case 'square': return 'rounded-none';
      case 'smooth': return 'rounded-2xl';
      case 'pill': return 'rounded-full px-6';
      case 'rectangle': default: return 'rounded-md';
    }
  };

  const getIcon = (type?: string) => {
    if (!type) return <Info size={16} className="text-blue-400" />;
    const t = type.toLowerCase();
    if (t.includes('mythic')) return <Sparkles size={16} className="text-purple-400" />;
    if (t.includes('rare')) return <Sparkles size={16} className="text-green-400" />;
    if (t.includes('achievement')) return <Star size={16} className="text-fuchsia-400" />;
    if (t.includes('combat')) return <Sword size={16} className="text-red-400" />;
    if (t.includes('mining')) return <Pickaxe size={16} className="text-gray-400" />;
    if (t.includes('zone')) return <Map size={16} className="text-emerald-400" />;
    return <Info size={16} className="text-blue-400" />;
  };

  const getGlowClass = (type?: string) => {
    if (!neonGlow) return 'shadow-lg border-[var(--border-subtle)]';
    if (!type) return 'shadow-lg border-[var(--border-subtle)]';
    const t = type.toLowerCase();
    if (t.includes('mythic')) return 'shadow-[0_0_20px_rgba(168,85,247,0.4)] border-purple-500/60';
    if (t.includes('rare')) return 'shadow-[0_0_20px_rgba(74,222,128,0.3)] border-green-500/50';
    if (t.includes('achievement')) return 'shadow-[0_0_20px_rgba(217,70,239,0.3)] border-fuchsia-500/50';
    return 'shadow-lg border-[var(--border-subtle)]';
  };

  const dragConstraints = React.useMemo(() => ({ 
    left: 0, 
    top: 0, 
    right: typeof globalThis !== 'undefined' ? globalThis.innerWidth - 60 : 1000, 
    bottom: typeof globalThis !== 'undefined' ? globalThis.innerHeight - 60 : 1000 
  }), []);

  return (
    <motion.div 
      className={`fixed ${getPositionClasses()} z-[60] flex flex-col gap-2 pointer-events-none max-w-[calc(100vw-32px)]`}
      style={{ ...getPositionStyles(), x, y }}
      drag={position === 'custom'}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragConstraints={dragConstraints}
      onDragEnd={() => {
        updateNotificationSettings({
          customPositionX: Math.max(0, customPositionX + x.get()),
          customPositionY: Math.max(0, customPositionY + y.get())
        });
        x.set(0);
        y.set(0);
      }}
    >
      <AnimatePresence>
        {notifications.map((notif) => {
          if (notif.type === 'boot-sequence') {
            return <BootSequenceToast key={notif.id} notif={notif} animConfig={animConfig} width={width} height={height} opacity={opacity} isTop={isTop} toastShape={getShapeClass()} />;
          }
          if (notif.type === 'system-online') {
            return <SystemOnlineToast key={notif.id} notif={notif} animConfig={animConfig} width={width} height={height} opacity={opacity} isTop={isTop} toastShape={getShapeClass()} />;
          }
          
          return (
          <motion.div
            key={notif.id}
            layout
            initial={animConfig.initial}
            animate={{ ...animConfig.animate, x: 0, y: 0 }}
            exit={animConfig.exit}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{ 
              width: `${width}px`,
              maxWidth: 'calc(100vw - 32px)', 
              minHeight: `${height}px`,
              opacity,
              transformOrigin: isTop ? 'top center' : 'bottom center'
            }}
            className={`flex items-center justify-center backdrop-blur-xl px-4 py-3 pointer-events-auto
              bg-[var(--bg-panel)] border ${getShapeClass()} ${getGlowClass(notif.type)}
              ${notif.id === 'placeholder' ? 'cursor-grab active:cursor-grabbing border-dashed border-indigo-400' : ''}
            `}
          >
            {notif.id === 'placeholder' && (
              <div 
                 className="absolute inset-0 cursor-grab active:cursor-grabbing z-10" 
                 onPointerDown={(e) => dragControls.start(e)}
              />
            )}
            
            <div className={`flex flex-col items-center justify-center w-full gap-1 text-center`}>
              {notif.title && (
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  {getIcon(notif.type)}
                  <span className="text-[11px] font-black text-[var(--accent-primary)] opacity-100 tracking-[0.15em] uppercase drop-shadow-sm">
                    {notif.id === 'placeholder' ? 'Drag Me' : notif.title}
                  </span>
                </div>
              )}
              <span className={`text-[var(--text-primary)] font-bold leading-relaxed break-words text-xs md:text-sm`}>
                {notif.message}
              </span>
            </div>
          </motion.div>
        );})}
      </AnimatePresence>
    </motion.div>
  );
};
