import React from 'react';
import { Header } from '../layout/Header';
import { useTrackerStore } from '../../store/trackerStore';
import { TrackingView } from '../views/TrackingView';
import { LootView } from '../views/LootView';
import { NPCView } from '../views/NPCView';
import { QuestView } from '../views/QuestView';
import { SettingsView } from '../views/SettingsView';
import { WeaponUI } from '../widgets/WeaponUI';
import { ArmorUI } from '../widgets/ArmorUI';
import { NotificationToaster } from '../widgets/NotificationToaster';
import { BobOverlay } from '../widgets/BobOverlay';
import { MinimizedOrb } from './MinimizedOrb';
import { PoppedOutWindowComponent } from './PoppedOutWindowComponent';
import { motion, useMotionValue, useDragControls } from 'motion/react';
export const OverlayContainer: React.FC = () => {
  const activeTab = useTrackerStore((state) => state.activeTab);
  const isMinimized = useTrackerStore((state) => state.isMinimized);
  const layoutMode = useTrackerStore((state) => state.layoutMode);
  const poppedOutWindows = useTrackerStore((state) => state.poppedOutWindows);
  const mergeTab = useTrackerStore((state) => state.mergeTab);
  const overlayPosition = useTrackerStore((state) => state.overlayPosition);
  const setOverlayPosition = useTrackerStore((state) => state.setOverlayPosition);
  const activeOpacity = useTrackerStore((state) => state.activeOpacity);
  const idleOpacity = useTrackerStore((state) => state.idleOpacity);
  const isUILocked = useTrackerStore((state) => state.isUILocked);
  const tabDimensions = useTrackerStore((state) => state.tabDimensions);
  const setTabDimensions = useTrackerStore((state) => state.setTabDimensions);
  
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
    if (poppedOutWindows[activeTab]) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full opacity-50 p-4 text-center">
          <div className="text-[var(--text-primary)] font-bold mb-2">This tab is popped out</div>
          <button 
            onClick={() => mergeTab(activeTab)}
            className="px-3 py-1.5 bg-[var(--accent-primary)]/20 hover:bg-[var(--accent-primary)]/40 text-[var(--accent-primary)] rounded transition-colors text-xs font-bold uppercase tracking-wider border border-[var(--accent-primary)]/30"
          >
            Merge Back
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'global':
      case 'favorites':
        return <TrackingView forcedTab={activeTab} />;
      case 'session': return <LootView />;
      case 'npcs':
        return <NPCView />;
      case 'quests':
        return <QuestView />;
      case 'settings': return <SettingsView />;
      default: return null;
    }
  };

  const overlayRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    
    let isInitialMount = true;
    const observer = new ResizeObserver(() => {
      if (isInitialMount) {
        isInitialMount = false;
        return;
      }
      const w = el.style.width;
      const h = el.style.height;
      
      const newWidth = (!isHorizontal && w.endsWith('px')) ? parseInt(w) : undefined;
      const newHeight = (isHorizontal && h.endsWith('px')) ? parseInt(h) : undefined;
      
      if (w.endsWith('px') || h.endsWith('px')) {
        setTabDimensions(activeTab, newWidth, newHeight);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [activeTab, setTabDimensions, isHorizontal]);

  const activeDim = tabDimensions[activeTab] || {};
  const currentWidth = activeDim.width ? `${activeDim.width}px` : (isHorizontal ? 'auto' : undefined);
  const currentHeight = activeDim.height ? `${activeDim.height}px` : (isHorizontal ? undefined : 'auto');

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50 overflow-hidden text-[var(--text-primary)] font-[var(--font-body)]" data-theme={useTrackerStore(s => s.theme)}>
      {isMinimized ? (
        <MinimizedOrb />
      ) : (
        <motion.div 
          ref={overlayRef}
          style={{ 
            x, y, 
            opacity: isHovered ? activeOpacity : idleOpacity,
            resize: isHorizontal ? 'vertical' : 'horizontal',
            height: currentHeight,
            width: currentWidth
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
            absolute top-0 left-0 ${isUILocked ? 'pointer-events-none' : 'pointer-events-auto'} shadow-[0_8px_30px_rgba(0,0,0,0.8)] border-[var(--border-accent)] flex transition-opacity duration-300 overflow-hidden rounded-xl border
            bg-[var(--bg-base)]
            ${isHorizontal 
              ? 'h-auto max-h-[90vh] min-h-[100px] w-fit max-w-[calc(100vw-1rem)] flex-col' 
              : `${activeTab === 'session' ? 'h-[350px]' : 'h-auto'} max-h-[90vh] min-h-[100px] w-fit max-w-[400px] min-w-[180px] flex-col`
            }
          `}
        >
          <Header onPointerDown={(e) => dragControls.start(e)} />
          
          <div className={`flex-1 overflow-hidden ${isHorizontal ? 'overflow-x-auto custom-scrollbar flex p-2 gap-1.5' : 'overflow-y-auto custom-scrollbar p-1'}`}>
            {renderContent()}
          </div>
        </motion.div>
      )}
      
      {Object.values(poppedOutWindows).map(win => (
        <PoppedOutWindowComponent key={win.id} window={win} />
      ))}
      
      <WeaponUI />
      <ArmorUI />
      <NotificationToaster />
      <BobOverlay constraintsRef={containerRef} />
    </div>
  );
};
