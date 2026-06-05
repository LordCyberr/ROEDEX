import React, { useEffect } from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { Bot } from 'lucide-react';

export const NotificationToaster: React.FC = () => {
  const notifications = useTrackerStore((state) => state.notifications);
  const removeNotification = useTrackerStore((state) => state.removeNotification);
  const notificationSettings = useTrackerStore((state) => state.notificationSettings);
  const updateNotificationSettings = useTrackerStore((state) => state.updateNotificationSettings);
  
  const { 
    position, animation, duration, width, height, scale, opacity, 
    compactMode, customPositionX, customPositionY 
  } = notificationSettings;

  const dragControls = useDragControls();

  // Auto-remove notifications
  useEffect(() => {
    if (notifications.length === 0) return;
    
    const timeouts = notifications.map(n => {
      if (n.id === 'placeholder') return null;
      return setTimeout(() => removeNotification(n.id), duration);
    });

    return () => timeouts.forEach(t => t && clearTimeout(t));
  }, [notifications, removeNotification, duration]);

  const getPositionStyles = (): React.CSSProperties => {
    if (position === 'custom') {
      return { top: customPositionY, left: customPositionX };
    }
    return {};
  };

  const getPositionClasses = () => {
    if (position === 'custom') return '';
    switch (position) {
      case 'top-left': return 'top-4 left-4';
      case 'top-center': return 'top-4 left-1/2 -translate-x-1/2';
      case 'top-right': return 'top-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'bottom-center': return 'bottom-4 left-1/2 -translate-x-1/2';
      case 'bottom-right': return 'bottom-4 right-4';
      default: return 'top-4 right-4';
    }
  };

  const isTop = position.startsWith('top') || position === 'custom';

  const getAnimationConfig = () => {
    const yOffset = isTop ? -20 : 20;
    switch (animation) {
      case 'fade': return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
      case 'pop': return { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.8 } };
      case 'slide': default: return { initial: { opacity: 0, y: yOffset, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, scale: 0.95 } };
    }
  };

  const animConfig = getAnimationConfig();

  return (
    <div 
      className={`fixed ${getPositionClasses()} z-[60] flex flex-col gap-2 pointer-events-none max-w-[calc(100vw-32px)]`}
      style={getPositionStyles()}
    >
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            layout
            initial={animConfig.initial}
            animate={{ ...animConfig.animate, scale }}
            exit={animConfig.exit}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            style={{ 
              width: 'fit-content',
              minWidth: '220px',
              maxWidth: `min(${width}px, calc(100vw - 32px))`, 
              minHeight: `${height}px`,
              opacity 
            }}
            drag={notif.id === 'placeholder'}
            dragControls={dragControls}
            dragListener={false}
            onDragEnd={(_, info) => {
               if (notif.id === 'placeholder') {
                 // Update custom position based on drag offset
                 updateNotificationSettings({
                   customPositionX: customPositionX + info.offset.x,
                   customPositionY: customPositionY + info.offset.y
                 });
               }
            }}
            className={`flex items-center justify-center backdrop-blur-md rounded-md px-3 py-2 pointer-events-auto
              border border-[var(--border-subtle)] bg-black/60 shadow-md
              ${notif.id === 'placeholder' ? 'cursor-grab active:cursor-grabbing border-dashed' : ''}
              ${compactMode ? 'py-1 px-2' : ''}
            `}
          >
            {notif.id === 'placeholder' && (
              <div 
                 className="absolute inset-0 cursor-grab active:cursor-grabbing z-10" 
                 onPointerDown={(e) => dragControls.start(e)}
              />
            )}
            
            <div className={`flex items-center w-full gap-2 ${notif.title === 'Bob' ? 'justify-start text-left' : 'flex-col justify-center text-center'}`}>
              
              {notif.title === 'Bob' && (
                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]">
                  <Bot size={18} />
                </div>
              )}

              <div className={`flex flex-col flex-1 overflow-hidden w-full ${notif.title === 'Bob' ? 'text-left' : 'text-center'}`}>
                {!compactMode && notif.title && notif.title !== 'Bob' && (
                  <div className="flex items-center justify-center gap-1.5 mb-0.5">
                    <span className="text-[9px] font-bold text-[var(--accent-primary)] opacity-90 tracking-widest uppercase">
                      {notif.id === 'placeholder' ? 'Drag Me' : notif.title}
                    </span>
                  </div>
                )}
                {notif.title === 'Bob' && !compactMode && (
                   <div className="text-[9px] font-bold text-indigo-400 opacity-90 tracking-widest uppercase mb-0.5">BOB</div>
                )}
                <span className={`text-slate-200 font-medium leading-snug break-words ${compactMode ? 'text-[11px]' : 'text-xs'} ${notif.title === 'Bob' ? 'italic text-indigo-100' : ''}`}>
                  {notif.title === 'Bob' ? `"${notif.message}"` : notif.message}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
