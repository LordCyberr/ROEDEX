import React, { useEffect, useState, useRef } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { motion, useMotionValue } from 'motion/react';
import { Zap, Activity, Sword, Pickaxe, Shield } from 'lucide-react'; 
import { useTranslation } from '../../hooks/useTranslation';

export const MinimizedOrb: React.FC<{ constraintsRef?: any }> = ({ constraintsRef }) => {
  const { t } = useTranslation();
  const {
    connected, notifications, setIsMinimized,
    orbSize, orbBorderThickness, orbPosition, setOrbPosition,
    minimizedIcon, minimizedIconUrl, isUILocked,
  } = useSettingsStore(useShallow((state: any) => ({
    connected: state.connected,
    notifications: state.notifications,
    setIsMinimized: state.setIsMinimized,
    orbSize: state.orbSize || 56,
    orbBorderThickness: state.orbBorderThickness || 2,
    orbPosition: state.orbPosition || { x: 16, y: 16 },
    setOrbPosition: state.setOrbPosition,
    minimizedIcon: state.minimizedIcon,
    minimizedIconUrl: state.minimizedIconUrl,
    isUILocked: state.isUILocked,
  })));
  const [pulse, setPulse] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(orbPosition?.x ?? 16);
  const y = useMotionValue(orbPosition?.y ?? 16);

  // Sync initial position and handle hydration bounding
  useEffect(() => {
    let safeX = orbPosition?.x ?? 16;
    let safeY = orbPosition?.y ?? 16;

    const screenW = globalThis.innerWidth;
    const screenH = globalThis.innerHeight;

    if (safeX < 0) safeX = 0;
    if (safeX > screenW - orbSize) safeX = screenW - orbSize;
    if (safeY < 0) safeY = 0;
    if (safeY > screenH - orbSize) safeY = screenH - orbSize;

    x.set(safeX);
    y.set(safeY);
  }, [orbPosition?.x, orbPosition?.y, x, y, orbSize]);

  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        let currX = x.get();
        let currY = y.get();
        
        const screenW = globalThis.innerWidth;
        const screenH = globalThis.innerHeight;

        if (currX < 0) currX = 0;
        if (currX > screenW - orbSize) currX = screenW - orbSize;
        if (currY < 0) currY = 0;
        if (currY > screenH - orbSize) currY = screenH - orbSize;

        x.set(currX);
        y.set(currY);
        setOrbPosition({ x: currX, y: currY });
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [x, y, setOrbPosition, orbSize]);

  useEffect(() => {
    if (notifications.length > 0) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 500);
      return () => clearTimeout(t);
    }
  }, [notifications.length]);

  // Connected = Green/Cyan Status Glow
  // Disconnected = Dim/Grey/Dark (NO red default glow)
  
  const glowColor = connected 
    ? 'shadow-[0_0_15px_rgba(34,197,94,0.6)] border-green-500' // Green connected
    : 'shadow-[0_0_15px_rgba(239,68,68,0.6)] border-red-500'; // Red disconnected
    
  const iconColor = 'text-[var(--accent-primary)] drop-shadow-[0_0_10px_var(--accent-primary)]';
  
  const iconSize = Math.round(orbSize * 0.42);
  return (
    <motion.div 
      ref={dragRef}
      style={{ x, y, width: orbSize, height: orbSize, borderRadius: '50%' }}
      drag={!isUILocked}
      dragMomentum={false}
      dragConstraints={constraintsRef}
      onDragEnd={() => {
        setOrbPosition({ x: x.get(), y: y.get() });
      }}
      className={`fixed top-0 left-0 z-50 ${isUILocked ? 'pointer-events-none' : 'pointer-events-auto'}`}
    >
      {/* Background Pulse Ring */}
      <div 
        className={`absolute inset-0 rounded-full ${glowColor.replace('border-', 'border-')} opacity-50 animate-slow-ping pointer-events-none`}
        style={{ borderWidth: orbBorderThickness }}
      />

      <div 
        id="tutorial-minimized-orb"
        style={{ width: orbSize, height: orbSize, borderWidth: orbBorderThickness }}
        className={`
        group relative flex items-center justify-center rounded-full cursor-pointer pointer-events-auto
        bg-[var(--bg-base)] backdrop-blur-md ${glowColor}
        transition-all duration-300 hover:scale-105 hover:brightness-110
        ${pulse ? 'animate-pulse' : ''}
      `}
      onDoubleClick={() => setIsMinimized(false)}
      >
        {/* Dynamic Icon */}
        {minimizedIcon === 'pulse' && <Activity size={iconSize} className={iconColor} strokeWidth={2.5} />}
        {minimizedIcon === 'lightning' && <Zap size={iconSize} className={iconColor} strokeWidth={2} fill={connected ? 'currentColor' : 'none'} />}
        {minimizedIcon === 'sword' && <Sword size={iconSize} className={iconColor} strokeWidth={2} fill="currentColor" />}
        {minimizedIcon === 'pickaxe' && <Pickaxe size={iconSize} className={iconColor} strokeWidth={2} fill="currentColor" />}
        {minimizedIcon === 'shield' && <Shield size={iconSize} className={iconColor} strokeWidth={2} fill="currentColor" />}
        {minimizedIcon === 'roedex' && <span className={`font-black tracking-widest ${iconColor}`} style={{ fontSize: iconSize * 0.4, marginTop: 1 }}>ROEDEX</span>}
        {minimizedIcon === 'rx' && <span className={`font-black italic ${iconColor}`} style={{ fontSize: iconSize * 0.7, marginTop: 1 }}>RX</span>}
        {minimizedIcon === 'custom' && minimizedIconUrl && <img src={minimizedIconUrl} alt="orb" style={{ width: iconSize, height: iconSize, objectFit: 'cover', borderRadius: '50%' }} />}

        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 border border-[var(--border-subtle)] text-[var(--text-primary)] text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] font-bold tracking-wider uppercase shadow-xl">{t('ui.doubleTapToOpen')}
        </div>
      </div>
    </motion.div>
  );
};
