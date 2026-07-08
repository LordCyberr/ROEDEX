import { motion } from 'motion/react';

export const BootSequenceToast = ({ notif, animConfig, width, height, opacity, isTop, toastShape }: any) => {
  const subTexts = [
    'INITIALIZING MODULES',
    'SYNCING GAME STATE',
    'ESTABLISHING SECURE CONNECTION'
  ];

  const targetText = notif.title || 'SYSTEM BOOT';
  const chars = targetText.split('');

  return (
    <motion.div
      layout
      initial={animConfig.initial}
      animate={{ ...animConfig.animate, x: 0, y: 0 }}
      exit={animConfig.exit}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{ 
        minWidth: width ? `${width * 0.9}px` : '240px',
        width: 'auto',
        maxWidth: 'calc(100vw - 32px)', 
        minHeight: height ? `${height * 0.9}px` : '50px',
        opacity,
        transformOrigin: isTop ? 'top center' : 'bottom center'
      }}
      className={`flex flex-col justify-center backdrop-blur-xl px-5 py-3 pointer-events-auto bg-[var(--bg-panel)] border border-[#22d3ee]/50 ${toastShape} shadow-[0_0_15px_rgba(34,211,238,0.3)] relative overflow-hidden`}
    >
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#22d3ee] to-transparent animate-pulse" />
      
      {/* Scanning Radar Line for Boot Sequence */}
      <div 
        className="absolute top-0 bottom-0 w-1/2 opacity-20 mix-blend-screen"
        style={{ 
          background: `linear-gradient(to right, transparent, #22d3ee, transparent)`,
          filter: 'blur(10px)',
          animation: 'radarScan 2s linear infinite'
        }}
      />

      <div className="flex items-center gap-2 mb-1.5 justify-center w-full relative z-10">
        <span className="text-[#22d3ee] font-mono text-sm md:text-base tracking-[0.15em] uppercase font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] whitespace-nowrap">
          &gt;_  
          {chars.map((char: string, index: number) => (
            <span 
              key={index} 
              style={{ 
                opacity: 0, 
                animation: `charReveal 0.01s forwards`,
                animationDelay: `${index * 0.04}s`
              }}
            >
              {char}
            </span>
          ))}
          <span style={{ animation: 'blinkCursor 0.8s infinite' }}>_</span>
        </span>
      </div>
      <div className="flex items-center justify-center w-full px-2 mt-0.5 relative z-10 h-[15px]">
        {subTexts.map((text, i) => {
          return (
            <span 
              key={i}
              className="absolute text-[#22d3ee]/80 font-mono text-[10px] md:text-xs tracking-wider uppercase whitespace-nowrap"
              style={{
                opacity: 0,
                animation: `subtext${i + 1} 4.5s linear forwards`
              }}
            >
              {text}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
};
