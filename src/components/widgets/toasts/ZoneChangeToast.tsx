import { motion } from 'motion/react';
import { Map } from 'lucide-react';

export const ZoneChangeToast = ({ notif, animConfig, width, height, opacity, isTop, toastShape }: any) => {
  const type = notif.type || 'zone-change';
  
  let glowColor = '#3b82f6'; // default blue
  
  if (type.includes('forest')) { glowColor = '#22c55e'; } // green
  else if (type.includes('cave')) { glowColor = '#9ca3af'; } // gray
  else if (type.includes('forge')) { glowColor = '#f97316'; } // orange
  else if (type.includes('social')) { glowColor = '#a855f7'; } // purple
  else if (type.includes('home')) { glowColor = '#eab308'; } // yellow

  return (
    <motion.div
      layout
      initial={{ ...animConfig.initial, scale: 0.9 }}
      animate={{ ...animConfig.animate, x: 0, y: 0, scale: 1 }}
      exit={animConfig.exit}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{ 
        minWidth: width ? `${width * 0.9}px` : '260px',
        width: 'auto',
        maxWidth: 'calc(100vw - 32px)', 
        minHeight: height ? `${height * 0.9}px` : '50px',
        opacity,
        transformOrigin: isTop ? 'top center' : 'bottom center',
        borderColor: `${glowColor}60`,
        boxShadow: `0 0 15px ${glowColor}20`
      }}
      className={`flex flex-col justify-center backdrop-blur-xl px-6 py-3 pointer-events-auto bg-[var(--bg-panel)] border ${toastShape} relative overflow-hidden`}
    >
      <div 
        className="absolute top-0 left-0 w-full h-[3px]" 
        style={{ background: `linear-gradient(to right, transparent, ${glowColor}, transparent)` }} 
      />
      
      {/* Radar scanning line */}
      <div 
        className="absolute top-0 bottom-0 w-1/2 opacity-20 mix-blend-screen"
        style={{ 
          background: `linear-gradient(to right, transparent, ${glowColor}, transparent)`,
          filter: 'blur(10px)',
          animation: 'radarScan 2s linear infinite'
        }}
      />
      
      <div className="flex items-center gap-2 mb-1 justify-center w-full z-10 relative">
        <Map size={18} style={{ color: glowColor }} className="animate-pulse drop-shadow-sm" />
        <span style={{ color: glowColor, textShadow: `0 0 8px ${glowColor}40` }} className="font-black text-sm md:text-base tracking-[0.15em] uppercase whitespace-nowrap">
          {notif.title}
        </span>
      </div>
      <div className="flex items-center justify-center w-full z-10 relative">
        <span className="text-white/90 font-mono font-semibold tracking-wide text-[10px] md:text-[11px] text-center">
          {notif.message?.replace(/\.+$/, '').trim()}
        </span>
      </div>
    </motion.div>
  );
};

export const ForestZoneToast = ({ notif, animConfig, width, height, opacity, isTop, toastShape }: any) => {
  return (
    <motion.div
      layout
      initial={{ ...animConfig.initial, y: isTop ? -50 : 50, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)', transition: { duration: 0.3 } }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      style={{ 
        minWidth: width ? `${width * 1.2}px` : '320px',
        maxWidth: 'calc(100vw - 32px)', 
        minHeight: height ? `${height * 0.9}px` : '60px',
        opacity,
        transformOrigin: isTop ? 'top center' : 'bottom center',
        borderColor: '#22c55e60',
        boxShadow: '0 0 25px rgba(34, 197, 94, 0.25)'
      }}
      className={`flex flex-col justify-center backdrop-blur-2xl px-6 py-4 pointer-events-auto bg-[#064e3b]/80 border ${toastShape} relative overflow-hidden`}
    >
      {/* Scanning Radar Line */}
      <div 
        className="absolute left-0 right-0 h-10 mix-blend-screen opacity-50 z-0 pointer-events-none"
        style={{ 
          background: `linear-gradient(to bottom, transparent, #4ade80, transparent)`,
          animation: 'radarScanVertical 1.5s linear infinite'
        }}
      />
      
      {/* Animated Hexagon Background Pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4ade80 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="flex items-center gap-2 mb-2 justify-center w-full z-10 relative">
        <Map size={24} className="text-green-400 animate-pulse drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
        <span className="text-green-400 font-black text-base md:text-lg tracking-[0.2em] uppercase drop-shadow-[0_0_8px_rgba(74,222,128,0.6)] whitespace-nowrap">
          {notif.title}
        </span>
      </div>
      <div className="flex items-center justify-center w-full z-10 relative bg-black/30 py-1.5 px-3 rounded-md border border-green-500/20">
        <span className="text-green-300 font-mono font-semibold tracking-wide text-[11px] md:text-xs text-center flex items-center gap-1 justify-center">
          <span>[</span>
          {notif.message?.replace(/\.+$/, '').trim()}
          <span>]</span>
        </span>
      </div>
    </motion.div>
  );
};
