import React from 'react';
import { Header } from '../layout/Header';
import { useTrackerStore } from '../../store/trackerStore';
import { TrackingView } from '../views/TrackingView';
import { LootView } from '../views/LootView';
import { NPCView } from '../views/NPCView';
import { SettingsView } from '../views/SettingsView';
import { WeaponUI } from '../widgets/WeaponUI';
import { ArmorUI } from '../widgets/ArmorUI';
import { NotificationToaster } from '../widgets/NotificationToaster';
import { MinimizedOrb } from './MinimizedOrb';
import { motion, useMotionValue, useDragControls } from 'motion/react';
export const OverlayContainer: React.FC = () => {
  const activeTab = useTrackerStore((state) => state.activeTab);
  const isMinimized = useTrackerStore((state) => state.isMinimized);
  const layoutMode = useTrackerStore((state) => state.layoutMode);
  const overlayPosition = useTrackerStore((state) => state.overlayPosition);
  const setOverlayPosition = useTrackerStore((state) => state.setOverlayPosition);
  const activeOpacity = useTrackerStore((state) => state.activeOpacity);
  const idleOpacity = useTrackerStore((state) => state.idleOpacity);
  
  const [isHovered, setIsHovered] = React.useState(false);
  
  const isHorizontal = layoutMode === 'horizontal';

  const containerRef = React.useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  
  const x = useMotionValue(overlayPosition.x);
  const y = useMotionValue(overlayPosition.y);

  // Sync initial position and handle hydration bounding
  React.useEffect(() => {
    // Clamp to safe screen boundaries to prevent it from getting lost off-screen
    // Especially important since we changed the anchor from top-right to top-left!
    let safeX = overlayPosition.x;
    let safeY = overlayPosition.y;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    // Give it a safe 100px buffer so it's always grabbable
    if (safeX < 0) safeX = 0;
    if (safeX > screenW - 100) safeX = screenW - 260; // 260 is typical width
    
    if (safeY < 0) safeY = 0;
    if (safeY > screenH - 100) safeY = screenH - 200;

    x.set(safeX);
    y.set(safeY);
  }, [overlayPosition.x, overlayPosition.y, x, y]);

  React.useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        let currX = x.get();
        let currY = y.get();
        
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        if (currX < 0) currX = 0;
        if (currX > screenW - 100) currX = screenW - 260;
        if (currY < 0) currY = 0;
        if (currY > screenH - 100) currY = screenH - 200;

        x.set(currX);
        y.set(currY);
        setOverlayPosition({ x: currX, y: currY });
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [x, y, setOverlayPosition]);

  const renderContent = () => {
    switch (activeTab) {
      case 'global':
      case 'favorites':
        return <TrackingView />;
      case 'session': return <LootView />;
      case 'npcs': return <NPCView />;
      case 'settings': return <SettingsView />;
      default: return null;
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50 overflow-hidden" data-theme={useTrackerStore(s => s.theme)}>
      {isMinimized ? (
        <MinimizedOrb />
      ) : (
        <motion.div 
          style={{ 
            x, y, 
            opacity: isHovered ? activeOpacity : idleOpacity,
            resize: isHorizontal ? 'vertical' : 'horizontal',
            height: isHorizontal ? undefined : 'auto',
            width: isHorizontal ? 'auto' : undefined
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          drag
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={containerRef}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={() => {
            setOverlayPosition({ x: x.get(), y: y.get() });
          }}
          className={`
            absolute top-0 left-0 pointer-events-auto shadow-[0_8px_30px_rgba(0,0,0,0.8)] border-[var(--border-accent)] flex transition-opacity duration-300 overflow-hidden rounded-xl border
            bg-[var(--bg-base)]
            ${isHorizontal 
              ? 'h-auto max-h-[90vh] min-h-[100px] w-fit max-w-[calc(100vw-1rem)] flex-col' 
              : 'h-auto max-h-[90vh] min-h-[100px] w-[260px] min-w-[220px] flex-col'
            }
          `}
        >
          <Header onPointerDown={(e) => dragControls.start(e)} />
          
          <div className={`flex-1 overflow-hidden ${isHorizontal ? 'overflow-x-auto custom-scrollbar flex p-2 gap-1.5' : 'overflow-y-auto custom-scrollbar p-1'}`}>
            {renderContent()}
          </div>
        </motion.div>
      )}
      
      <WeaponUI />
      <ArmorUI />
      <NotificationToaster />
    </div>
  );
};
