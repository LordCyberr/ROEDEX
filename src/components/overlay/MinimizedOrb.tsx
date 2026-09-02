import React, { useEffect, useState, useRef } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { motion, useMotionValue } from 'motion/react';
import { Zap, Activity, Sword, Pickaxe, Shield } from 'lucide-react'; 
import { useTranslation } from '../../hooks/useTranslation';
import { getAssetUrl } from '../../utils/assetUrl';

export const MinimizedOrb: React.FC<{ constraintsRef?: any }> = ({ constraintsRef }) => {
  const { t } = useTranslation();
  const {
    connected, notifications, setIsMinimized,
    orbSize, orbBorderThickness, orbPosition, setOrbPosition,
    minimizedIcon, minimizedIconUrl, isUILocked, isMinimized,
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
    isMinimized: state.isMinimized,
  })));
  const [pulse, setPulse] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);

  const safeOrbX = typeof orbPosition?.x === 'number' && !isNaN(orbPosition.x) ? orbPosition.x : 16;
  const safeOrbY = typeof orbPosition?.y === 'number' && !isNaN(orbPosition.y) ? orbPosition.y : 16;
  const x = useMotionValue(safeOrbX);
  const y = useMotionValue(safeOrbY);

  // Sync initial position and handle hydration bounding
  useEffect(() => {
    // Guard against NaN from storage — NaN comparisons always return false so clamps are silently skipped
    let safeX = (typeof orbPosition?.x === 'number' && !isNaN(orbPosition.x)) ? orbPosition.x : 16;
    let safeY = (typeof orbPosition?.y === 'number' && !isNaN(orbPosition.y)) ? orbPosition.y : 16;

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
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
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
    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
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
    ? 'border-green-500' // Green connected
    : 'border-red-500'; // Red disconnected
    
  const shadowClass = isDragging ? 'shadow-none' : (connected ? 'shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'shadow-[0_0_15px_rgba(239,68,68,0.6)]');
  
  const iconColor = 'text-[var(--accent-primary)] drop-shadow-[0_0_10px_var(--accent-primary)]';
  
  const iconSize = Math.round(orbSize * 0.42);
  
  if (!isMinimized) return null;

  return (
    <motion.div 
      ref={dragRef}
      style={{ x, y, width: orbSize, height: orbSize, borderRadius: '50%' }}
      drag={!isUILocked}
      dragMomentum={false}
      dragConstraints={constraintsRef}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        setIsDragging(false);
        setOrbPosition({ x: x.get(), y: y.get() });
      }}
      className={`fixed top-0 left-0 z-50 ${isUILocked ? 'pointer-events-none' : 'pointer-events-auto'}`}
    >
      {/* Background Pulse Ring */}
      {!isDragging && (
        <div 
          className={`absolute inset-0 rounded-full ${glowColor} opacity-50 animate-slow-ping pointer-events-none`}
          style={{ borderWidth: orbBorderThickness }}
        />
      )}

      <div 
        id="tutorial-minimized-orb"
        style={{ width: orbSize, height: orbSize, borderWidth: orbBorderThickness }}
        className={`
        group relative flex items-center justify-center rounded-full cursor-pointer
        pointer-events-auto
        bg-[var(--bg-base)] backdrop-blur-md ${glowColor} ${shadowClass}
        transition-all duration-300 hover:scale-105 hover:brightness-110
        ${pulse ? 'animate-pulse' : ''}
      `}
      onDoubleClick={() => {
        setIsMinimized(false);
      }}
      >
        {/* Dynamic Icon */}
        {(!minimizedIcon || minimizedIcon === 'logo') && !logoError && (
          <img
            src={getAssetUrl('logo.webp')}
            alt="ROEDEX"
            onError={() => setLogoError(true)}
            style={{ 
              width: Math.round(orbSize * 0.82), 
              height: Math.round(orbSize * 0.82), 
              objectFit: 'contain',
              mixBlendMode: 'screen',
              maskImage: 'radial-gradient(circle, black 65%, transparent 78%)',
              WebkitMaskImage: 'radial-gradient(circle, black 65%, transparent 78%)'
            }}
            className="group-hover:scale-110 transition-transform pointer-events-none select-none"
          />
        )}
        {((!minimizedIcon || minimizedIcon === 'logo') && logoError) && (
          <span className={`font-black tracking-widest ${iconColor}`} style={{ fontSize: iconSize * 0.4, marginTop: 1 }}>ROEDEX</span>
        )}
        {minimizedIcon === 'pulse' && <Activity size={iconSize} className={iconColor} strokeWidth={2.5} />}
        {minimizedIcon === 'lightning' && <Zap size={iconSize} className={iconColor} strokeWidth={2} fill={connected ? 'currentColor' : 'none'} />}
        {minimizedIcon === 'sword' && <Sword size={iconSize} className={iconColor} strokeWidth={2} fill="currentColor" />}
        {minimizedIcon === 'pickaxe' && <Pickaxe size={iconSize} className={iconColor} strokeWidth={2} fill="currentColor" />}
        {minimizedIcon === 'shield' && <Shield size={iconSize} className={iconColor} strokeWidth={2} fill="currentColor" />}
        {minimizedIcon === 'roedex' && <span className={`font-black tracking-widest ${iconColor}`} style={{ fontSize: iconSize * 0.4, marginTop: 1 }}>ROEDEX</span>}
        {minimizedIcon === 'rx' && <span className={`font-black italic ${iconColor}`} style={{ fontSize: iconSize * 0.7, marginTop: 1 }}>RX</span>}
        {minimizedIcon === 'custom' && minimizedIconUrl && <img src={minimizedIconUrl} alt="orb" style={{ width: iconSize, height: iconSize, objectFit: 'cover', borderRadius: '50%' }} />}
        
        {minimizedIcon === 'jarvis' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-full">
            <div className="w-full h-full bg-red-600/40 rounded-full blur-[2px] shadow-[0_0_20px_rgba(220,38,38,0.8)_inset]" />
            <div className="absolute w-[60%] h-[60%] bg-red-500/60 rounded-full blur-[1px] animate-pulse" />
            <div className="absolute w-[30%] h-[30%] bg-white/90 rounded-full blur-[1px]" />
            
            {/* Floating Outer Rings (Removed overflow-hidden from parent so these can expand) */}
            <div className="absolute -inset-2 rounded-full animate-[spin_4s_linear_infinite]" style={{ borderTop: '2px solid rgba(220,38,38,0.8)', borderRight: '2px solid transparent', borderBottom: '1px solid rgba(220,38,38,0.3)', borderLeft: '1px solid transparent' }} />
            <div className="absolute -inset-1 rounded-full animate-[spin_3s_linear_infinite_reverse]" style={{ borderBottom: '2px solid rgba(220,38,38,0.6)', borderLeft: '2px solid transparent' }} />
            <div className="absolute inset-1 rounded-full animate-[spin_5s_linear_infinite]" style={{ borderTop: '2px dotted rgba(239,68,68,0.8)' }} />
          </div>
        )}

        {/* Pass-Through Badge / Tooltip */}
        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 border border-[var(--border-subtle)] text-[var(--text-primary)] text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] font-bold tracking-wider uppercase shadow-xl flex items-center gap-1">
          {t('ui.doubleTapToOpen')}
        </div>
      </div>
    </motion.div>
  );
};
