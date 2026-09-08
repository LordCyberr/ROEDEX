import React, { useEffect, useRef } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { OverlayNotification } from '../../types/events';
import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence, useDragControls, useMotionValue } from 'motion/react';
import { Sparkles, Star, Info, Sword, Pickaxe, Map, X } from 'lucide-react';

import { useWindowSize } from '../../hooks/useWindowSize';
import { BootSequenceToast } from './toasts/BootSequenceToast';
import { SystemOnlineToast } from './toasts/SystemOnlineToast';
import { ZoneChangeToast, ForestZoneToast } from './toasts/ZoneChangeToast';
import { ThemeColors } from '../../utils/theme';
import { useTrackerStore } from '../../store/trackerStore';
import { NotificationManager } from '../../core/notifications/NotificationManager';

export const NotificationToaster: React.FC = React.memo(() => {
  const currentTarget = useTrackerStore(useShallow((state: any) => state.currentTarget));

  // Single useShallow call — was 4 separate subscriptions
  const { notifications, removeNotification, notificationSettings, updateNotificationSettings } = useSettingsStore(useShallow((state: any) => ({
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
  const lastTimestampsRef = useRef<Record<string, number>>({});
  const pingedTimersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentIds = new Set(notifications.map((n: OverlayNotification) => n.id));
    
    // Clear timers for notifications that are gone
    Object.keys(timersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        clearTimeout(timersRef.current[id]);
        delete timersRef.current[id];
        delete lastTimestampsRef.current[id];
      }
    });

    // Start or reset timers for active notifications
    notifications.forEach((n: OverlayNotification) => {
      if (n.id === 'placeholder') return;
      const lastTs = lastTimestampsRef.current[n.id];
      
      if (!(n.id in timersRef.current) || (lastTs && lastTs !== n.timestamp)) {
        if (timersRef.current[n.id]) {
          clearTimeout(timersRef.current[n.id]);
        }
        lastTimestampsRef.current[n.id] = n.timestamp;

        let toastDuration = duration;
        
        // Ensure boot toasts stay on screen long enough
        if (n.type === 'boot-sequence') {
          toastDuration = 8000;
        } else if (n.type === 'system-online') {
          toastDuration = 5000;
        }

        timersRef.current[n.id] = setTimeout(() => {
          removeNotification(n.id);
          delete timersRef.current[n.id];
          delete lastTimestampsRef.current[n.id];
        }, toastDuration);
      }
    });
  }, [notifications, duration, removeNotification]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(t => clearTimeout(t));
    };
  }, []);

  // Polling to clean up expired resource/mob respawn timers
  useEffect(() => {
    // Keep running timer cleanup even if alerts are disabled, as the minimap uses these timers
    const interval = setInterval(() => {
      const now = Date.now();
      const currentTimers = useTrackerStore.getState().timers;
      const timersToRemove: string[] = [];

      Object.values(currentTimers).forEach(timer => {
        const timeRemaining = timer.expectedRespawnTime - now;
        if (timeRemaining <= 0) {
          timersToRemove.push(timer.id);
        } else if (timeRemaining <= 10000 && timeRemaining > 9000 && !pingedTimersRef.current.has(timer.id)) {
          pingedTimersRef.current.add(timer.id);
          const disabledTimers = useSettingsStore.getState().notificationSettings.disabledTimers || {};
          const isTimerMuted = !!disabledTimers[timer.name.toLowerCase()];
          if (!isTimerMuted) {
            NotificationManager.timerPing(timer.name);
          }
        }
      });

      timersToRemove.forEach(id => {
        useTrackerStore.getState().removeTimer(id);
        pingedTimersRef.current.delete(id);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPositionStyles = (): React.CSSProperties => {
    if (position === 'custom') {
      return { top: customPositionY, left: customPositionX };
    }
    return {};
  };

  const getPositionClasses = React.useCallback(() => {
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
  }, [position]);

  const isTop = position.startsWith('top') || position === 'custom';

  const getAnimationConfig = React.useCallback(() => {
    const yOffset = isTop ? -20 : 20;
    switch (animation) {
      case 'fade': return { initial: { opacity: 0, scale }, animate: { opacity: 1, scale }, exit: { opacity: 0, scale } };
      case 'pop': return { initial: { opacity: 0, scale: 0.8 * scale }, animate: { opacity: 1, scale }, exit: { opacity: 0, scale: 0.8 * scale } };
      case 'slide': default: return { initial: { opacity: 0, y: yOffset, scale: 0.95 * scale }, animate: { opacity: 1, y: 0, scale }, exit: { opacity: 0, scale: 0.95 * scale } };
    }
  }, [animation, isTop, scale]);

  const positionClasses = React.useMemo(() => getPositionClasses(), [getPositionClasses]);
  const animConfig = React.useMemo(() => getAnimationConfig(), [getAnimationConfig]);

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
    if (t.includes('uncommon')) return <Sparkles size={16} className="text-blue-400" />;
    if (t.includes('achievement')) return <Star size={16} className="text-fuchsia-400" />;
    if (t.includes('combat')) return <Sword size={16} className="text-red-400" />;
    if (t.includes('mining')) return <Pickaxe size={16} className="text-gray-400" />;
    if (t.includes('zone')) return <Map size={16} className="text-emerald-400" />;
    return <Info size={16} className="text-blue-400" />;
  };

  const getGlowClass = (type?: string) => {
    if (!neonGlow) return 'shadow-lg border-[var(--border-subtle)]';
    if (type?.toLowerCase().includes('mythic')) return ThemeColors.rarity.mythic.glow;
    if (type?.toLowerCase().includes('rare')) return ThemeColors.rarity.rare.glow;
    if (type?.toLowerCase().includes('uncommon')) return ThemeColors.rarity.uncommon.glow;
    if (type?.toLowerCase().includes('combat') || type?.toLowerCase().includes('error')) return ThemeColors.status.error;
    if (type?.toLowerCase().includes('success')) return ThemeColors.status.success;
    if (type?.toLowerCase().includes('achievement')) return ThemeColors.status.achievement;
    if (type?.toLowerCase().includes('system-online')) return ThemeColors.status.systemOnline;
    if (!type) return 'shadow-lg border-[var(--border-subtle)]';
    const t = type.toLowerCase();
    if (t.includes('mythic')) return 'shadow-[0_0_20px_rgba(168,85,247,0.4)] border-purple-500/60';
    if (t.includes('rare')) return 'shadow-[0_0_20px_rgba(74,222,128,0.3)] border-green-500/50';
    if (t.includes('achievement')) return 'shadow-[0_0_20px_rgba(217,70,239,0.3)] border-fuchsia-500/50';
    return 'shadow-lg border-[var(--border-subtle)]';
  };

  const windowSize = useWindowSize();
  const dragConstraints = React.useMemo(() => ({ 
    left: 0, 
    top: 0, 
    right: windowSize.width > 60 ? windowSize.width - 60 : 1000, 
    bottom: windowSize.height > 60 ? windowSize.height - 60 : 1000 
  }), [windowSize]);

  return (
    <motion.div 
      className={`fixed ${positionClasses} z-[9999] flex flex-col gap-2 pointer-events-none max-w-[calc(100vw-32px)] transition-transform duration-300 ${currentTarget && isTop ? 'translate-y-[84px]' : ''}`}
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
      <AnimatePresence mode="popLayout">
        {notifications.map((notif: OverlayNotification) => {
          if (notif.type === 'death_drop') {
            // Death drop renders as a PROMINENT fixed banner — not a normal toast
            return (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, y: -30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{ width, opacity, maxWidth: 'calc(100vw - 32px)' }}
                className="flex items-center gap-3 px-4 py-3 pointer-events-auto relative overflow-hidden
                  bg-red-950/90 backdrop-blur-xl border-2 rounded-xl
                  shadow-[0_0_30px_rgba(239,68,68,0.5)]
                  animate-rarity-mythic"
              >
                {/* Pulsing red glow overlay */}
                <div className="absolute inset-0 rounded-[inherit] pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.15) 0%, transparent 70%)' }} />
                
                {/* Skull icon */}
                <div className="text-2xl shrink-0 z-10">💀</div>
                
                <div className="flex flex-col gap-0.5 flex-1 z-10 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-red-400 uppercase tracking-[0.2em]">YOU DIED</span>
                    <span className="text-[9px] font-bold text-red-300/70 bg-red-900/60 px-1.5 py-0.5 rounded-full border border-red-700/50 animate-pulse">
                      TRACKER ACTIVE
                    </span>
                  </div>
                  <span className="text-[12px] font-bold text-red-100 truncate">{notif.message}</span>
                </div>
              </motion.div>
            );
          }
          if (notif.type === 'loot-popup') {
            return null;
          }
          if (notif.type === 'boot-sequence') {
            return <BootSequenceToast key={notif.id} notif={notif} animConfig={animConfig} width={width} height={height} opacity={opacity} isTop={isTop} toastShape={getShapeClass()} />;
          }
          if (notif.type === 'system-online') {
            return <SystemOnlineToast key={notif.id} notif={notif} animConfig={animConfig} width={width} height={height} opacity={opacity} isTop={isTop} toastShape={getShapeClass()} />;
          }
          if (notif.type === 'zone-change-forest') {
            return <ForestZoneToast key={notif.id} notif={notif} animConfig={animConfig} width={width} height={height} opacity={opacity} isTop={isTop} toastShape={getShapeClass()} />;
          }
          if (notif.type && notif.type.startsWith('zone-change')) {
            return <ZoneChangeToast key={notif.id} notif={notif} animConfig={animConfig} width={width} height={height} opacity={opacity} isTop={isTop} toastShape={getShapeClass()} />;
          }
          
          return (
          <motion.div
            layout
            key={notif.id}
            initial={animConfig.initial}
            animate={{ ...animConfig.animate, x: 0, y: 0 }}
            exit={animConfig.exit}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            style={{ 
              width,
              minHeight: height,
              maxWidth: 'calc(100vw - 32px)', 
              opacity,
              transformOrigin: isTop ? 'top center' : 'bottom center'
            }}
            className={`flex items-center justify-center backdrop-blur-xl px-3 py-2 pointer-events-auto relative overflow-hidden bg-[var(--bg-panel)] border ${getShapeClass()} ${getGlowClass(notif.type)}
              ${notif.id === 'placeholder' ? 'cursor-grab active:cursor-grabbing border-dashed border-indigo-400' : ''}
            `}
          >
            {notif.id === 'placeholder' && (
              <div 
                 className="absolute inset-0 cursor-grab active:cursor-grabbing z-10" 
                 onPointerDown={(e) => dragControls.start(e)}
              />
            )}
            
            {(notif.type?.toLowerCase().includes('mythic') || notif.type?.toLowerCase().includes('achievement')) && (
              <div className="absolute inset-0 gold-sheen-effect pointer-events-none rounded-[inherit] z-0" />
            )}

            {/* Interactive Close (X) Button */}
            {notif.id !== 'placeholder' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notif.id);
                }}
                className="absolute top-1.5 right-1.5 z-30 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer pointer-events-auto"
                title="Close Notification"
              >
                <X size={12} />
              </button>
            )}

            <div className={`flex flex-col items-center justify-center w-full gap-1 text-center z-10 pr-3`}>
              {notif.title && (
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  {getIcon(notif.type)}
                  <span className="text-[11px] font-black text-[var(--accent-primary)] opacity-100 tracking-[0.15em] uppercase drop-shadow-sm">
                    {notif.id === 'placeholder' ? 'Drag Me' : notif.title}
                  </span>
                </div>
              )}
              <span className={`text-[var(--text-primary)] font-bold leading-relaxed break-words text-[11px] md:text-[13px]`}>
                {notif.message?.replace(/\.+$/, '').trim()}
              </span>
            </div>
          </motion.div>
        );})}
      </AnimatePresence>
    </motion.div>
  );
});
