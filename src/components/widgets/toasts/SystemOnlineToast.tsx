import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

export const SystemOnlineToast = ({ notif, animConfig, width, height, opacity, isTop, toastShape }: any) => {
  return (
    <motion.div
      layout
      initial={{ ...animConfig.initial, scale: 0.8 }}
      animate={{ ...animConfig.animate, x: 0, y: 0, scale: 1 }}
      exit={{ opacity: 0, scaleY: 0.05, scaleX: 1.5, filter: 'blur(10px)', transition: { duration: 0.3 } }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      style={{ 
        minWidth: width ? `${width * 0.9}px` : '240px',
        width: 'auto',
        maxWidth: 'calc(100vw - 32px)', 
        minHeight: height ? `${height * 0.9}px` : '50px',
        opacity,
        transformOrigin: isTop ? 'top center' : 'bottom center'
      }}
      className={`flex items-center justify-center backdrop-blur-xl px-5 py-3 pointer-events-auto bg-[var(--bg-panel)] border border-green-500/60 ${toastShape} shadow-[0_0_15px_rgba(34,197,94,0.3)] relative overflow-hidden`}
    >
      <motion.div 
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0 bg-white z-10 mix-blend-screen"
      />
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_15px_#4ade80]" />
      
      <div className="flex flex-col items-center justify-center w-full gap-1 text-center relative z-20">
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <CheckCircle2 size={18} className="text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
          <span className="text-sm md:text-base font-black text-green-400 tracking-[0.15em] uppercase drop-shadow-[0_0_8px_rgba(74,222,128,0.5)] whitespace-nowrap">
            {notif.title}
          </span>
        </div>
        <span className="text-white/90 font-mono font-bold tracking-wide text-[10px] md:text-xs uppercase drop-shadow-md whitespace-nowrap">
          {notif.message}
        </span>
      </div>
    </motion.div>
  );
};
