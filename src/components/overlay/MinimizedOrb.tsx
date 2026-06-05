import React, { useEffect, useState, useRef } from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { motion, useMotionValue } from 'motion/react';
// We'll use the Zap icon (Lightning) to represent connection and the overlay
import { Zap, Activity, Sword, Pickaxe, Shield } from 'lucide-react'; 

export const MinimizedOrb: React.FC = () => {
  const connected = useTrackerStore((state) => state.connected);
  const notifications = useTrackerStore((state) => state.notifications);
  const setIsMinimized = useTrackerStore((state) => state.setIsMinimized);
  const orbSize = useTrackerStore((state) => state.orbSize || 56);
  const orbPosition = useTrackerStore((state) => state.orbPosition || { x: 16, y: 16 });
  const setOrbPosition = useTrackerStore((state) => state.setOrbPosition);
  const minimizedIcon = useTrackerStore((state) => state.minimizedIcon);
  
  const [pulse, setPulse] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(orbPosition.x);
  const y = useMotionValue(orbPosition.y);

  // Sync initial position and handle hydration bounding
  useEffect(() => {
    let safeX = orbPosition.x;
    let safeY = orbPosition.y;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    if (safeX < 0) safeX = 0;
    if (safeX > screenW - orbSize) safeX = screenW - orbSize;
    if (safeY < 0) safeY = 0;
    if (safeY > screenH - orbSize) safeY = screenH - orbSize;

    x.set(safeX);
    y.set(safeY);
  }, [orbPosition.x, orbPosition.y, x, y, orbSize]);

  useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        let currX = x.get();
        let currY = y.get();
        
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

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
      style={{ x, y }}
      drag 
      dragMomentum={false}
      onDragEnd={() => {
        setOrbPosition({ x: x.get(), y: y.get() });
      }}
      className="fixed top-0 left-0 z-50 pointer-events-auto"
    >
      {/* Background Pulse Ring */}
      <div 
        className={`absolute inset-0 rounded-full border-2 ${glowColor} opacity-50 animate-slow-ping pointer-events-none`}
      />

      <div 
        style={{ width: orbSize, height: orbSize }}
        className={`
        group relative flex items-center justify-center rounded-full cursor-pointer
        bg-[var(--bg-base)] backdrop-blur-md border-2 ${glowColor}
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

        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 border border-[var(--border-subtle)] text-[var(--text-primary)] text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] font-bold tracking-wider uppercase shadow-xl">
          Double tap to open
        </div>
      </div>
    </motion.div>
  );
};
