import React, { useEffect, useState } from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { motion, useMotionValue } from 'motion/react';
import { Sword } from 'lucide-react';

export const WeaponUI: React.FC = () => {
  const weapon = useTrackerStore((state) => state.weapon);
  const weaponUISettings = useTrackerStore((state) => state.weaponUISettings);
  const updateWeaponUISettings = useTrackerStore((state) => state.updateWeaponUISettings);
  
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (!weapon || !weaponUISettings.enableAlerts) {
      setIsFlashing(false);
      return;
    }
    const percentage = (weapon.durability / weapon.maxDurability) * 100;
    if (percentage <= weaponUISettings.alertThreshold) {
      setIsFlashing(true);
    } else {
      setIsFlashing(false);
    }
  }, [weapon?.durability, weapon?.maxDurability, weaponUISettings.enableAlerts, weaponUISettings.alertThreshold]);

  if (!weapon || !weaponUISettings.show) return null;

  const percentage = Math.max(0, Math.min(100, (weapon.durability / weapon.maxDurability) * 100));
  
  let color = 'bg-emerald-400';
  let textColor = 'text-emerald-400';
  
  if (percentage <= 9) {
    color = 'bg-red-500';
    textColor = 'text-red-400';
  } else if (percentage <= 39) {
    color = 'bg-orange-500';
    textColor = 'text-orange-400';
  } else if (percentage <= 79) {
    color = 'bg-yellow-400';
    textColor = 'text-yellow-400';
  }

  const {
    style = 'bar_percent',
    scale = 1,
    opacity = 1,
    width = 180,
    height = 6,
    borderRadius = 8,
    glassStrength = 10,
    enableAnimations = true,
    position = 'bottom-right',
    customPositionX = 0,
    customPositionY = 0,
    locked = true,
    layout = 'horizontal'
  } = weaponUISettings;

  const getPositionStyles = (): React.CSSProperties => {
    if (position === 'custom') {
      return { top: 0, left: 0 };
    }
    const margin = 16;
    const pos: React.CSSProperties = {};
    if (position.includes('top')) pos.top = margin;
    else pos.bottom = margin;
    
    if (position.includes('left')) pos.left = margin;
    else pos.right = margin;
    
    return pos;
  };

  const isDraggable = !locked;
  const ref = React.useRef<HTMLDivElement>(null);

  const pctStr = `${Math.round(percentage)}%`;
  const durStr = `${weapon.durability} / ${weapon.maxDurability}`;

  const hasText = style !== 'bar';
  const hasBar = style === 'bar' || style.includes('bar_');
  const showPct = style === 'text_percent' || style === 'bar_percent';
  const showDur = style === 'text_durability' || style === 'bar_durability';

  const x = useMotionValue(position === 'custom' ? customPositionX : 0);
  const y = useMotionValue(position === 'custom' ? customPositionY : 0);

  React.useEffect(() => {
    if (position === 'custom') {
      x.set(customPositionX);
      y.set(customPositionY);
    }
  }, [position, customPositionX, customPositionY, x, y]);

  return (
    <motion.div 
      ref={ref}
      drag={isDraggable}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={() => {
        if (!locked) {
          updateWeaponUISettings({
            position: 'custom',
            customPositionX: x.get(),
            customPositionY: y.get()
          });
        }
      }}
      className={`fixed z-50 flex items-center justify-center overflow-hidden shadow-2xl select-none
        ${isDraggable ? 'pointer-events-auto cursor-grab active:cursor-grabbing border-2 border-dashed border-indigo-400' : 'pointer-events-none'}
        ${isFlashing && enableAnimations ? 'animate-pulse' : ''}
      `}
      style={{
        ...getPositionStyles(),
        x, y,
        scale,
        opacity,
        backdropFilter: hasText ? `blur(${glassStrength}px)` : 'none',
        backgroundColor: hasText ? 'rgba(0, 0, 0, 0.4)' : 'transparent',
        borderRadius: `${borderRadius}px`,
        border: isDraggable ? undefined : (hasText ? '1px solid rgba(255,255,255,0.05)' : 'none'),
        width: layout === 'horizontal' 
          ? `${width}px` 
          : (hasText ? `${Math.max(24, height + 16)}px` : `${height}px`),
        height: layout === 'horizontal'
          ? (hasText ? `${Math.max(24, height + 16)}px` : `${height}px`)
          : `${width}px`,
      }}
    >
      {/* Background Health Bar */}
      {hasBar && (
        <div 
          className={`absolute ${layout === 'horizontal' ? 'left-0 top-0 bottom-0 w-full' : 'left-0 bottom-0 right-0 h-full flex items-end'} ${!hasText ? 'bg-black/40 border border-white/5' : ''}`} 
          style={{ borderRadius: hasText ? 0 : borderRadius }}
        >
          <motion.div 
            className={`${layout === 'horizontal' ? 'h-full' : 'w-full'} ${color} ${hasText ? 'opacity-30 mix-blend-screen' : ''}`}
            initial={false}
            animate={layout === 'horizontal' ? { width: `${percentage}%` } : { height: `${percentage}%` }}
            transition={{ duration: enableAnimations ? 0.3 : 0 }}
          />
        </div>
      )}

      {/* Foreground Text */}
      {hasText && (
        <div className={`relative z-10 flex ${layout === 'vertical' ? 'flex-col' : 'items-center'} gap-2 drop-shadow-md`}>
          <Sword size={14} className={textColor} />
          <span 
            className={`font-mono font-bold text-[12px] text-white tracking-wide drop-shadow-sm ${layout === 'vertical' ? 'writing-vertical-rl rotate-180' : ''}`}
            style={layout === 'vertical' ? { writingMode: 'vertical-rl' } : {}}
          >
            {showPct && pctStr}
            {showDur && durStr}
          </span>
        </div>
      )}
    </motion.div>
  );
};
