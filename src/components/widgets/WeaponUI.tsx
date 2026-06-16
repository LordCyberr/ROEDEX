import React, { useEffect, useState } from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import { motion, useMotionValue } from 'motion/react';
import { Sword, Lock, Unlock, Axe, Pickaxe } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

export const WeaponUI: React.FC = () => {
  const { weapon, weaponUISettings, updateWeaponUISettings } = useTrackerStore(useShallow((state) => ({
    weapon: state.weapon,
    weaponUISettings: state.weaponUISettings,
    updateWeaponUISettings: state.updateWeaponUISettings,
  })));
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
    layout = 'horizontal',
    borderWidth = 1,
    dynamicBorderColor = true
  } = weaponUISettings;

  const ref = React.useRef<HTMLDivElement>(null);

  const x = useMotionValue(position === 'custom' ? customPositionX : 0);
  const y = useMotionValue(position === 'custom' ? customPositionY : 0);

  React.useEffect(() => {
    if (position === 'custom') {
      x.set(customPositionX);
      y.set(customPositionY);
    }
  }, [position, customPositionX, customPositionY, x, y]);

  const dragConstraints = React.useMemo(() => ({ 
    left: 0, 
    top: 0, 
    right: typeof globalThis !== 'undefined' ? globalThis.innerWidth - 60 : 1000, 
    bottom: typeof globalThis !== 'undefined' ? globalThis.innerHeight - 60 : 1000 
  }), []);

  const displayWeapon: any = weapon || (!locked ? { name: 'Mock Weapon', instanceId: '5', durability: 750, maxDurability: 1000 } : null);

  if (!displayWeapon || !weaponUISettings.show) return null;

  const isDraggable = !locked;

  const percentage = Math.max(0, Math.min(100, (displayWeapon.durability / displayWeapon.maxDurability) * 100));
  
  let color = 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
  let textColor = 'text-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]';
  let borderColor = 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
  
  if (percentage <= 11) {
    color = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
    textColor = 'text-red-400 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]';
    borderColor = 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
  } else if (percentage <= 50) {
    color = 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]';
    textColor = 'text-orange-400 drop-shadow-[0_0_4px_rgba(249,115,22,0.5)]';
    borderColor = 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]';
  }

  const borderColorClass = dynamicBorderColor ? borderColor : 'border-white/20';

  const getPositionStyles = (): React.CSSProperties => {
    if (position === 'custom') {
      return { top: 0, left: 0 };
    }
    const margin = 16;
    const pos: React.CSSProperties = {};
    if (position.includes('top')) pos.top = margin;
    else pos.bottom = position === 'bottom-center' ? 120 : margin;
    
    if (position.includes('left')) {
      pos.left = margin;
    } else if (position.includes('right')) {
      pos.right = margin;
    } else if (position.includes('center')) {
      pos.left = 0;
      pos.right = 0;
      pos.margin = '0 auto';
    }
    
    return pos;
  };

  const pctStr = `${Math.round(percentage)}%`;
  const durStr = `${displayWeapon.durability} / ${displayWeapon.maxDurability}`;

  const hasText = style !== 'bar';
  const hasBar = style === 'bar' || style.includes('bar_');
  const showPct = style === 'text_percent' || style === 'bar_percent';
  const showDur = style === 'text_durability' || style === 'bar_durability';

  return (
    <motion.div 
      ref={ref}
      drag={isDraggable}
      dragMomentum={false}
      dragConstraints={dragConstraints}
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
        ${isDraggable ? 'pointer-events-auto cursor-grab active:cursor-grabbing border-dashed border-indigo-400' : 'pointer-events-none border-solid'}
        ${isFlashing && enableAnimations ? 'animate-pulse' : ''}
        ${!isDraggable && borderWidth > 0 ? borderColorClass : ''}
      `}
      style={{
        ...getPositionStyles(),
        x, y,
        scale,
        opacity,
        backdropFilter: hasText ? `blur(${glassStrength}px)` : 'none',
        backgroundColor: hasText ? 'rgba(0, 0, 0, 0.6)' : 'transparent',
        borderRadius: `${borderRadius}px`,
        borderWidth: isDraggable ? '2px' : (borderWidth > 0 ? `${borderWidth}px` : (hasText ? '1px' : '0px')),
        borderColor: isDraggable ? undefined : (borderWidth > 0 ? undefined : (hasText ? 'rgba(255,255,255,0.05)' : 'transparent')),
        padding: !hasBar ? (layout === 'horizontal' ? '4px 10px' : '10px 4px') : '0px',
        width: layout === 'horizontal'
          ? (hasBar ? `${width}px` : 'max-content') 
          : 'max-content',
        height: layout === 'horizontal'
          ? (hasBar ? `${height}px` : 'max-content')
          : (hasBar ? `${width}px` : 'max-content'),
        minWidth: layout === 'vertical' ? (hasBar ? `${height}px` : undefined) : undefined,
      }}
    >
      {/* Lock/Unlock Icon Overlay */}
      <Tooltip content={locked ? "Unlock Position" : "Lock Position"}>
        <button 
          onClick={() => updateWeaponUISettings({ locked: !locked })}
          className="absolute -top-6 right-0 p-1 pointer-events-auto text-[var(--text-muted)] opacity-30 hover:opacity-100 transition-opacity bg-black/40 rounded-full"
        >
          {locked ? <Lock size={12} /> : <Unlock size={12} />}
        </button>
      </Tooltip>

      {/* Background Health Bar */}
      {hasBar && (
        <div 
          className={`absolute ${layout === 'horizontal' ? 'left-0 top-0 bottom-0 w-full' : 'bottom-0 left-0 right-0 h-full flex items-end'} ${!hasText ? 'bg-black/40 border border-white/5' : ''}`} 
          style={{ borderRadius: hasText ? 0 : borderRadius }}
        >
          <motion.div 
            className={`${layout === 'horizontal' ? 'h-full' : 'w-full'} ${color} ${hasText ? 'opacity-80' : ''}`}
            initial={false}
            animate={layout === 'horizontal' ? { width: `${percentage}%` } : { height: `${percentage}%` }}
            transition={{ duration: enableAnimations ? 0.3 : 0 }}
          />
        </div>
      )}

      {/* Foreground Text */}
      {hasText && (
        <div className={`relative z-10 flex ${layout === 'vertical' ? 'flex-col items-center justify-between h-full py-2' : 'w-full px-2 items-center justify-between'} gap-2 drop-shadow-md`}>
          <div className={`flex items-center gap-1.5 ${textColor}`}>
            {(() => {
              const nameLower = (displayWeapon.name || '').toLowerCase();
              if (nameLower.includes('pickaxe') || nameLower.includes('pick')) return <Pickaxe size={14} />;
              if (nameLower.includes('axe') || nameLower.includes('hatchet')) return <Axe size={14} />;
              return <Sword size={14} />;
            })()}
          </div>
          <div className={`flex ${layout === 'vertical' ? 'flex-col items-center' : 'items-baseline gap-1'} font-mono font-black text-[12px] text-white tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,1)]`}>
            {showPct && <span>{pctStr}</span>}
            {showDur && <span className={`opacity-80 ${layout === 'vertical' ? 'text-[9px]' : 'text-[10px]'}`}>{durStr}</span>}
          </div>
        </div>
      )}
    </motion.div>
  );
};
