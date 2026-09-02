import React, { useEffect, useState } from 'react';
import { motion, useMotionValue } from 'motion/react';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { Move } from 'lucide-react';
import { ResourceTracker } from '../../core/trackers/ResourceTracker';
import { DB_LOOKUP } from '../../data/gameDatabase';

export const TargetUI: React.FC = React.memo(() => {
  const currentTarget = useTrackerStore(state => state.currentTarget);
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

    if (currentTarget.key === 'dummy-target') {
      setIsVisible(true);
      return;
    }

    const now = Date.now();
    const timeSinceHit = now - currentTarget.lastHit;
    const isDead = currentTarget.hp <= 0;
    
    if (isDead) {
      if (timeSinceHit > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    } else {
      if (timeSinceHit < 7000) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }

    const timeoutDelay = isDead ? 50 - timeSinceHit : 7000 - timeSinceHit;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    
    if (timeoutDelay > 0) {
      timeout = setTimeout(() => {
        setIsVisible(false);
      }, timeoutDelay);
    }

    return () => { if (timeout) clearTimeout(timeout); };
  }, [currentTarget, targetUISettings]);

  const { position, customPositionX, customPositionY, locked, opacity, width = 300, height = 16, scale = 1.0 } = targetUISettings;

  const ref = React.useRef<HTMLDivElement>(null);
  const safeX = typeof customPositionX === 'number' && !isNaN(customPositionX) ? customPositionX : 0;
  const safeY = typeof customPositionY === 'number' && !isNaN(customPositionY) ? customPositionY : 0;
  const x = useMotionValue(position === 'custom' ? safeX : 0);
  const y = useMotionValue(position === 'custom' ? safeY : 0);

  React.useEffect(() => {
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

  const dragConstraints = React.useMemo(() => ({ 
    left: 0, 
    top: 0, 
    right: typeof globalThis !== 'undefined' ? globalThis.innerWidth - (width * scale) : 1000, 
    bottom: typeof globalThis !== 'undefined' ? globalThis.innerHeight - 100 : 1000 
  }), [width, scale]);

  if (!currentTarget) return null;

  const isDraggable = !locked && position === 'custom';
  const percentRaw = currentTarget.hp / currentTarget.maxHp;
  const percent = isNaN(percentRaw) ? 0 : Math.max(0, Math.min(100, percentRaw * 100));
  const isDead = currentTarget.hp <= 0;

  const getPositionStyles = (): React.CSSProperties => {
    if (position === 'custom') {
      return { top: 0, left: 0 };
    }
    
    switch (position) {
      case 'bottom-center':
        return { bottom: '50px', left: `calc(50% - ${(width * scale) / 2}px)` };
      case 'center':
        return { top: `calc(50% - ${(height * scale) / 2}px)`, left: `calc(50% - ${(width * scale) / 2}px)` };
      case 'top-left':
        return { top: '50px', left: '50px' };
      case 'top-right':
        return { top: '50px', right: '50px' };
      case 'bottom-left':
        return { bottom: '50px', left: '50px' };
      case 'bottom-right':
        return { bottom: '50px', right: '50px' };
      case 'top-center':
      default:
        return { top: '50px', left: `calc(50% - ${(width * scale) / 2}px)` };
    }
  };

  const nameKey = currentTarget.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const dbEntry = DB_LOOKUP[nameKey];
  const isOre = dbEntry?.category === 'ore';
  const barColor = currentTarget.type === 'mob' ? 'bg-red-500' : isOre ? 'bg-amber-500' : 'bg-emerald-500';
  const shadowColor = currentTarget.type === 'mob' ? '0 0 10px rgba(239, 68, 68, 0.5)' : isOre ? '0 0 10px rgba(245, 158, 11, 0.5)' : '0 0 10px rgba(16, 185, 129, 0.5)';

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
      initial={{ x: position === 'custom' ? customPositionX : 0, y: position === 'custom' ? customPositionY : 0, opacity: 0 }}
      animate={{ opacity: isVisible ? opacity : 0 }}
      className={`fixed z-40 overflow-hidden transition-opacity duration-500
        ${isVisible ? (isDraggable ? 'pointer-events-auto cursor-grab active:cursor-grabbing' : 'pointer-events-auto') : 'pointer-events-none'}
      `}
      style={{
        ...getPositionStyles(),
        x, y,
      }}
    >
      <div 
        className={`group bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-subtle)] rounded-lg p-3 shadow-lg flex flex-col relative overflow-hidden ${isDraggable ? 'outline outline-2 outline-dashed outline-[var(--accent-primary)] outline-offset-2' : ''}`}
        style={{
          width: `${width}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center'
        }}
      >
        {/* Drag Handle */}
        {isDraggable && (
          <div 
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-[var(--bg-base)]/40 hover:bg-[var(--bg-base)]/80 rounded cursor-move text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors z-10"
          >
            <Move size={14} />
          </div>
        )}

        {/* Title */}
        <div className="flex justify-between items-end mb-2 relative z-10">
          <div className="font-bold text-sm text-[var(--text-primary)] tracking-wide truncate pr-6 drop-shadow-md">
            {ResourceTracker.sanitizeResourceName(currentTarget.name)}
          </div>
          <div className="font-mono text-[10px] text-[var(--text-secondary)] font-bold">
            {isDead ? 'DEAD' : `${Math.ceil(percent)}%`}
          </div>
        </div>

        {/* Health Bar */}
        <div 
          className="w-full bg-[var(--bg-base)]/80 rounded-sm border border-[var(--border-subtle)] relative overflow-hidden"
          style={{ height: `${height}px` }}
        >
          <motion.div 
            className={`h-full ${barColor}`}
            initial={{ width: `${percent}%` }}
            animate={{ width: `${percent}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ boxShadow: shadowColor }}
          />
        </div>

        {/* HP Text */}
        <div className="absolute inset-x-0 bottom-3 flex justify-center items-center pointer-events-none z-10">
           <span className="text-[10px] font-mono text-white/90 font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
             {Math.ceil(currentTarget.hp)} / {Math.ceil(currentTarget.maxHp)}
           </span>
        </div>
      </div>
    </motion.div>
  );
});
