import React, { useEffect, useState, useRef } from 'react';
import { useBlacksmithStore } from '../../store/blacksmithStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useTranslation } from '../../hooks/useTranslation';
import { useShallow } from 'zustand/react/shallow';
import { motion, useMotionValue } from 'motion/react';
import { Hammer, X } from 'lucide-react';

export const BlacksmithUI: React.FC = () => {
  const { t } = useTranslation();
  const { activeJobs } = useBlacksmithStore(useShallow((state) => ({
    activeJobs: state.activeJobs
  })));

  const [now, setNow] = useState(Date.now());
  const [isVisible, setIsVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);

      const store = useBlacksmithStore.getState();
      store.activeJobs.forEach(job => {
        if (currentTime >= job.endTime && !job.notified) {
          useSettingsStore.getState().addNotification({
            type: 'system-online',
            title: 'BLACKSMITH FINISHED',
            message: `Your ${job.itemName} is now repaired, you can go to the blacksmith and collect your tool.`
          });
          store.markNotified(job.instanceId);
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const dragConstraints = React.useMemo(() => ({ 
    left: 0, top: 0, 
    right: typeof globalThis !== 'undefined' ? globalThis.innerWidth - 60 : 1000, 
    bottom: typeof globalThis !== 'undefined' ? globalThis.innerHeight - 60 : 1000 
  }), []);

  if (!isVisible || activeJobs.length === 0) return null;

  return (
    <motion.div 
      ref={ref}
      drag
      dragMomentum={false}
      dragConstraints={dragConstraints}
      dragElastic={0}
      className="fixed z-50 flex flex-col gap-2 items-center justify-center shadow-2xl select-none pointer-events-auto cursor-grab active:cursor-grabbing"
      style={{
        top: 100, left: 100,
        x, y,
        borderRadius: '8px',
        borderWidth: '1px',
        borderColor: 'rgba(255,255,255,0.1)',
        padding: '0.5rem',
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)'
      }}
    >
      <div className="flex w-full justify-between items-center px-1 mb-1 border-b border-white/10 pb-1">
        <div className="flex items-center gap-1 text-orange-400 text-xs font-bold font-mono">
          <Hammer size={12} />
          <span>{t('categories.blacksmith')}</span>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-white/50 hover:text-white/90 transition-colors pointer-events-auto"
        >
          <X size={14} />
        </button>
      </div>

      {activeJobs.map(job => {
        const totalDuration = job.duration * 1000;
        const timeRemaining = Math.max(0, job.endTime - now);
        const percentage = totalDuration > 0 ? Math.min(100, Math.max(0, 100 - (timeRemaining / totalDuration) * 100)) : 100;
        const isDone = timeRemaining === 0;

        const formatTime = (ms: number) => {
          if (ms <= 0) return 'DONE';
          const s = Math.floor(ms / 1000);
          const m = Math.floor(s / 60);
          return `${m}:${(s % 60).toString().padStart(2, '0')}`;
        };

        return (
          <div key={job.instanceId} className="flex flex-col w-40 gap-1 bg-black/40 rounded p-1.5 border border-white/5">
            <div className="flex justify-between w-full text-[10px] font-mono text-white/80">
              <span className="truncate max-w-[90px]">{job.itemName}</span>
              <span className={isDone ? 'text-green-400 font-bold' : 'text-orange-300'}>{formatTime(timeRemaining)}</span>
            </div>
            <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
              <motion.div 
                className={`h-full ${isDone ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]'}`}
                initial={false}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </div>
          </div>
        );
      })}
    </motion.div>
  );
};
