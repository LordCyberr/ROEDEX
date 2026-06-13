import React, { useEffect, useState, useRef } from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import { motion, useMotionValue } from 'motion/react';
import { Shield, Shirt, Footprints, HardHat, Hand, Lock, Unlock } from 'lucide-react';

export const ArmorUI: React.FC = () => {
  const { armor, settings, updateSettings } = useTrackerStore(useShallow((state) => ({
    armor: state.armor,
    settings: state.armorUISettings,
    updateSettings: state.updateArmorUISettings,
  })));
  
  const [isFlashing, setIsFlashing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Check if any piece is flashing
  useEffect(() => {
    if (!settings.enableAlerts) {
      setIsFlashing(false);
      return;
    }
    
    let flashing = false;
    for (const item of Object.values(armor)) {
      if (!item) continue;
      const percentage = (item.durability / item.maxDurability) * 100;
      if (percentage <= settings.alertThreshold) {
        flashing = true;
        break;
      }
    }
    setIsFlashing(flashing);
  }, [armor, settings.enableAlerts, settings.alertThreshold]);

  const {
    style = 'bar_percent',
    scale = 1,
    opacity = 1,
    width = 160,
    height = 4,
    borderRadius = 8,
    glassStrength = 10,
    enableAnimations = true,
    position = 'bottom-left',
    customPositionX = 0,
    customPositionY = 0,
    locked = true,
    layout = 'vertical',
    borderWidth = 1,
    dynamicBorderColor = true
  } = settings;

  const x = useMotionValue(position === 'custom' ? customPositionX : 0);
  const y = useMotionValue(position === 'custom' ? customPositionY : 0);

  useEffect(() => {
    if (position === 'custom') {
      x.set(customPositionX);
      y.set(customPositionY);
    }
  }, [position, customPositionX, customPositionY, x, y]);

  let displayArmor: any = armor;
  if (Object.keys(armor).length === 0 && !locked) {
    displayArmor = {
      Helmet: { name: 'Mock Helmet', instanceId: '1', durability: 850, maxDurability: 1000 },
      Torso: { name: 'Mock Torso', instanceId: '2', durability: 500, maxDurability: 1000 },
      Pants: { name: 'Mock Pants', instanceId: '3', durability: 200, maxDurability: 1000 },
      Boots: { name: 'Mock Boots', instanceId: '4', durability: 50, maxDurability: 1000 }
    };
  }

  const dragConstraints = React.useMemo(() => ({ 
    left: 0, 
    top: 0, 
    right: typeof globalThis !== 'undefined' ? globalThis.innerWidth - 60 : 1000, 
    bottom: typeof globalThis !== 'undefined' ? globalThis.innerHeight - 60 : 1000 
  }), []);

  if (!settings.show || Object.keys(displayArmor).length === 0) return null;

  const isDraggable = !locked;

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

  const hasText = style !== 'bar';
  const hasBar = style === 'bar' || style.includes('bar_');
  const showPct = style === 'text_percent' || style === 'bar_percent';
  const showDur = style === 'text_durability' || style === 'bar_durability';

  const getIcon = (slot: string) => {
    switch (slot) {
      case 'Helmet': return <HardHat size={12} />;
      case 'Torso': return <Shirt size={12} />;
      case 'Gloves': return <Hand size={12} />;
      case 'Pants': return <Shield size={12} />; // lucide doesn't have good pants, shield fallback
      case 'Boots': return <Footprints size={12} />;
      default: return <Shield size={12} />;
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
        if (!locked) {
          updateSettings({
            position: 'custom',
            customPositionX: x.get(),
            customPositionY: y.get()
          });
        }
      }}
      className={`fixed z-50 flex ${layout === 'vertical' ? 'flex-col gap-1' : 'flex-row gap-2'} items-center justify-center shadow-2xl select-none
        ${isDraggable ? 'pointer-events-auto cursor-grab active:cursor-grabbing border-dashed border-emerald-400 p-2' : 'pointer-events-none border-solid'}
        ${isFlashing && enableAnimations ? 'animate-pulse' : ''}
      `}
      style={{
        ...getPositionStyles(),
        x, y,
        scale,
        opacity,
        backdropFilter: hasText ? `blur(${glassStrength}px)` : 'none',
        backgroundColor: hasText ? 'rgba(0, 0, 0, 0.6)' : 'transparent',
        borderRadius: `${borderRadius}px`,
        borderWidth: isDraggable ? '2px' : '0px',
        borderColor: isDraggable ? undefined : 'transparent',
        padding: hasText && !isDraggable ? '6px' : undefined
      }}
    >
      {/* Lock/Unlock Icon Overlay */}
      <button 
        onClick={() => updateSettings({ locked: !locked })}
        className="absolute -top-6 right-0 p-1 pointer-events-auto text-[var(--text-muted)] opacity-30 hover:opacity-100 transition-opacity bg-black/40 rounded-full"
        title={locked ? "Unlock Position" : "Lock Position"}
      >
        {locked ? <Lock size={12} /> : <Unlock size={12} />}
      </button>

      {Object.entries(displayArmor).map(([slot, item]: [string, any]) => {
        if (!item) return null;
        
        const percentage = Math.max(0, Math.min(100, (item.durability / item.maxDurability) * 100));
        let color = 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
        let textColor = 'text-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]';
        let borderColor = 'border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
        
        if (percentage <= 20) {
          color = 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
          textColor = 'text-red-400 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]';
          borderColor = 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
        } else if (percentage <= 40) {
          color = 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]';
          textColor = 'text-orange-400 drop-shadow-[0_0_4px_rgba(249,115,22,0.5)]';
          borderColor = 'border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]';
        } else if (percentage <= 75) {
          color = 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]';
          textColor = 'text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)]';
          borderColor = 'border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]';
        }

        const pctStr = `${Math.round(percentage)}%`;
        const durStr = `${item.durability} / ${item.maxDurability}`;
        const borderColorClass = dynamicBorderColor ? borderColor : 'border-white/20';

        return (
          <div key={slot} className={`relative flex items-center justify-center overflow-hidden ${!isDraggable && borderWidth > 0 ? `border-solid ${borderColorClass}` : ''}`} style={{ width: hasBar ? `${width}px` : 'max-content', height: hasText ? `${Math.max(20, height + 12)}px` : `${height}px`, borderRadius: `${borderRadius}px`, borderWidth: borderWidth > 0 && !isDraggable ? `${borderWidth}px` : undefined, borderColor: borderWidth > 0 && !isDraggable ? undefined : (hasText ? 'rgba(255,255,255,0.05)' : 'transparent'), padding: !hasBar ? '0px 8px' : '0px' }}>
            {/* Background Health Bar */}
            {hasBar && (
              <div 
                className={`absolute left-0 top-0 bottom-0 w-full ${!hasText ? 'bg-black/40 border border-white/5' : 'bg-black/20'}`} 
                style={{ borderRadius: borderRadius }}
              >
                <motion.div 
                  className={`h-full ${color} ${hasText ? 'opacity-80' : ''}`}
                  initial={false}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: enableAnimations ? 0.3 : 0 }}
                  style={{ borderRadius: borderRadius }}
                />
              </div>
            )}

            {/* Foreground Text */}
            {hasText && (
              <div className="relative z-10 w-full px-2 flex items-center justify-between gap-2 drop-shadow-md">
                <div className={`flex items-center gap-1.5 ${textColor}`}>
                  {getIcon(slot)}
                </div>
                  <span className={`font-mono font-black text-[10px] text-white tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,1)] text-right w-full`}>
                  {showPct && pctStr}
                  {showDur && durStr}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
};
