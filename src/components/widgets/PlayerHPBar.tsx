import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { Move } from 'lucide-react';
import { DB_LOOKUP } from '../../data/gameDatabase';

export const PlayerHPBar: React.FC = () => {
  const { currentTarget, isDeathRecoveryMode, pendingDeathDrop } = useTrackerStore(
    useShallow(state => ({
      currentTarget: state.currentTarget,
      isDeathRecoveryMode: state.isDeathRecoveryMode,
      pendingDeathDrop: state.pendingDeathDrop
    }))
  );

  const { targetUISettings, updateTargetUISettings } = useSettingsStore(useShallow((state: any) => ({
    targetUISettings: state.targetUISettings,
    updateTargetUISettings: state.updateTargetUISettings,
  })));

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!currentTarget) {
      setIsVisible(false);
      return;
    }

    const nameKey = currentTarget.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const dbEntry = DB_LOOKUP[nameKey];

    let resourceType: 'ore' | 'tree' | 'plant' = 'plant';
    if (dbEntry) {
      if (dbEntry.category === 'ore') resourceType = 'ore';
      else if (dbEntry.category === 'tree') resourceType = 'tree';
      else if (dbEntry.category === 'plant') resourceType = 'plant';
    }

    if (currentTarget.type === 'mob' && !targetUISettings.showMobHealth) { setIsVisible(false); return; }
    if (currentTarget.type === 'resource' && resourceType === 'ore' && !targetUISettings.showOreHealth) { setIsVisible(false); return; }
    if (currentTarget.type === 'resource' && resourceType === 'tree' && !targetUISettings.showTreeHealth) { setIsVisible(false); return; }
    if (currentTarget.type === 'resource' && resourceType === 'plant') { setIsVisible(false); return; }

    // If it's a dummy target, always show it and don't set a timeout
    if (currentTarget.key === 'dummy-target') {
      setIsVisible(true);
      return;
    }

    const now = Date.now();
    const timeSinceHit = now - currentTarget.lastHit;
    const isDead = currentTarget.hp <= 0;
    
    // Hide immediately if dead (or within 50ms to allow final render)
    if (isDead) {
      if (timeSinceHit > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    } else {
      // Show if hit within last 7 seconds
      if (timeSinceHit < 7000) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }

    // Set a timeout to hide it when the duration expires
    const timeoutDelay = isDead ? 50 - timeSinceHit : 7000 - timeSinceHit;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    
    if (timeoutDelay > 0) {
      timeout = setTimeout(() => {
        setIsVisible(false);
      }, timeoutDelay);
    }

    return () => { if (timeout) clearTimeout(timeout); };
  }, [currentTarget, targetUISettings]);

  const { position, customPositionX, customPositionY, locked, scale = 1.0, width = 300, opacity = 1.0 } = targetUISettings;

  const ref = useRef<HTMLDivElement>(null);
  const safeX = typeof customPositionX === 'number' && !isNaN(customPositionX) ? customPositionX : 0;
  const safeY = typeof customPositionY === 'number' && !isNaN(customPositionY) ? customPositionY : 0;
  const x = useMotionValue(position === 'custom' ? safeX : 0);
  const y = useMotionValue(position === 'custom' ? safeY : 0);

  useEffect(() => {
    if (position === 'custom') {
      const sx = typeof customPositionX === 'number' && !isNaN(customPositionX) ? customPositionX : 0;
      const sy = typeof customPositionY === 'number' && !isNaN(customPositionY) ? customPositionY : 0;
      x.set(sx);
      y.set(sy);
    } else {
      x.set(0);
      y.set(0);
    }
  }, [position, customPositionX, customPositionY, x, y]);

  const dragConstraints = useMemo(() => ({ 
    left: 0, 
    top: 0, 
    right: typeof globalThis !== 'undefined' ? globalThis.innerWidth - (width * scale) : 1000, 
    bottom: typeof globalThis !== 'undefined' ? globalThis.innerHeight - 100 : 1000 
  }), [width, scale]);

  const isDraggable = !locked && position === 'custom';

  const hp = currentTarget?.hp ?? 0;
  const maxHp = currentTarget?.maxHp ?? 0;

  const percentRaw = maxHp > 0 ? hp / maxHp : 0;
  const percent = isNaN(percentRaw) ? 0 : Math.max(0, Math.min(100, percentRaw * 100));
  const hpColor =
    percent > 60 ? 'from-emerald-600 to-emerald-400' :
    percent > 30 ? 'from-amber-600 to-amber-400' :
    'from-red-600 to-red-400';

  const getPositionStyles = (): React.CSSProperties => {
    if (position === 'custom') {
      return { top: 0, left: 0 };
    }
    
    switch (position) {
      case 'top-center':
        return { top: '50px', left: '50%', transform: 'translateX(-50%)' };
      case 'center':
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      case 'bottom-center':
        return { bottom: '8px', left: '50%', transform: 'translateX(-50%)' };
      case 'top-left':
        return { top: '50px', left: '20px' };
      case 'top-right':
        return { top: '50px', right: '20px' };
      case 'bottom-left':
        return { bottom: '20px', left: '20px' };
      case 'bottom-right':
        return { bottom: '20px', right: '20px' };
      default:
        // Default to bottom-center if unknown
        return { bottom: '8px', left: '50%', transform: 'translateX(-50%)' };
    }
  };

  return (
    <motion.div
      ref={ref}
      drag={isDraggable}
      dragMomentum={false}
      dragConstraints={dragConstraints}
      dragElastic={0}
      onDragEnd={() => {
        if (!locked && position === 'custom') {
          const rect = ref.current?.getBoundingClientRect();
          if (rect) {
            x.set(rect.x);
            y.set(rect.y);
            updateTargetUISettings({
              customPositionX: rect.x,
              customPositionY: rect.y
            });
          }
        }
      }}
      initial={{ x: position === 'custom' ? safeX : 0, y: position === 'custom' ? safeY : 0, opacity: 0 }}
      animate={{ opacity: isVisible || (isDeathRecoveryMode && pendingDeathDrop) ? opacity : 0 }}
      className={`fixed z-50 transition-opacity duration-500
        ${isVisible || (isDeathRecoveryMode && pendingDeathDrop) ? (isDraggable ? 'pointer-events-auto cursor-grab active:cursor-grabbing' : 'pointer-events-auto') : 'pointer-events-none'}
      `}
      style={{
        ...getPositionStyles(),
        x, y,
      }}
    >
      <div 
        className={`flex flex-col items-center gap-1 w-[300px] relative ${isDraggable ? 'outline outline-2 outline-dashed outline-white/50 outline-offset-2 rounded' : ''}`}
        style={{
          width: `${width}px`,
          transform: `scale(${scale})`,
          transformOrigin: position === 'custom' ? 'top left' : 'bottom center'
        }}
      >
        {isDraggable && (
          <div className="absolute -top-6 right-0 w-6 h-6 flex items-center justify-center bg-black/40 hover:bg-black/80 rounded cursor-move text-slate-400 hover:text-white transition-colors z-10">
            <Move size={14} />
          </div>
        )}

        {/* Death Recovery Banner */}
        {isDeathRecoveryMode && pendingDeathDrop && (
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/60 backdrop-blur-sm shadow-lg animate-pulse w-full justify-center"
            style={{ animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
          >
            <span className="text-amber-300 text-[11px]">⚠</span>
            <span className="text-[10px] font-black text-amber-200 uppercase tracking-wider">
              Recover {pendingDeathDrop.quantity} Runestones
            </span>
            <span className="text-amber-300 text-[11px]">⚠</span>
          </div>
        )}

        {isVisible && maxHp > 0 && (
          <>
            {/* HP Label */}
            <div className="text-[10px] font-black text-white drop-shadow-md">
              HP {Math.ceil(hp)} / {Math.ceil(maxHp)}
            </div>

            {/* HP Bar */}
            <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10 shadow-lg">
              <div
                className={`h-full bg-gradient-to-r ${hpColor} transition-all duration-300`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};
