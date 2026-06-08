import React from 'react';
import { motion, useMotionValue, useDragControls } from 'motion/react';
import { useTrackerStore, PoppedOutWindow } from '../../store/trackerStore';
import { TrackingView } from '../views/TrackingView';
import { LootView } from '../views/LootView';
import { NPCView } from '../views/NPCView';
import { SettingsView } from '../views/SettingsView';
import { QuestView } from '../views/QuestView';
import { Globe2, Star, PackageOpen, Users, Settings, Minus, X, RefreshCw, ScrollText } from 'lucide-react';

const tabsConfig = [
  { id: 'global', icon: Globe2, label: 'Global Data' },
  { id: 'favorites', icon: Star, label: 'Favorites' },
  { id: 'session', icon: PackageOpen, label: 'Session & Loot' },
  { id: 'npcs', icon: Users, label: 'NPCs & Players' },
  { id: 'quests', icon: ScrollText, label: 'Quests' },
  { id: 'settings', icon: Settings, label: 'Settings' }
];

export const PoppedOutWindowComponent: React.FC<{ window: PoppedOutWindow }> = ({ window }) => {
  const { id, x, y, isMinimized } = window;
  const updatePoppedOutWindow = useTrackerStore((state) => state.updatePoppedOutWindow);
  const mergeTab = useTrackerStore((state) => state.mergeTab);
  const activeOpacity = useTrackerStore((state) => state.activeOpacity);
  const idleOpacity = useTrackerStore((state) => state.idleOpacity);
  const isUILocked = useTrackerStore((state) => state.isUILocked);
  
  const layoutMode = useTrackerStore((state) => state.layoutMode);
  const isHorizontal = layoutMode === 'horizontal';
  const tabDimensions = useTrackerStore((state) => state.tabDimensions);
  const setTabDimensions = useTrackerStore((state) => state.setTabDimensions);

  const [isHovered, setIsHovered] = React.useState(false);
  const dragControls = useDragControls();
  const windowRef = React.useRef<HTMLDivElement>(null);
  
  const motionX = useMotionValue(x);
  const motionY = useMotionValue(y);
  
  const tabConfig = tabsConfig.find(t => t.id === id);
  const Icon = tabConfig?.icon || Globe2;
  const label = tabConfig?.label || 'Tab';

  const renderContent = () => {
    switch (id) {
      case 'global':
      case 'favorites':
        return <TrackingView forcedTab={id} />;
      case 'session': return <LootView />;
      case 'npcs': return <NPCView />;
      case 'quests': return <QuestView />;
      case 'settings': return <SettingsView />;
      default: return null;
    }
  };

  // Default dimensions
  const defaultWidth = isHorizontal ? 600 : 300;
  const defaultHeight = isHorizontal ? 250 : 350;
  
  // Current dimensions from store
  const dims = tabDimensions[id];
  const width = dims?.width || defaultWidth;
  const height = dims?.height || defaultHeight;

  // Use a ResizeObserver to update store when native resize happens
  React.useEffect(() => {
    if (isMinimized || !windowRef.current) return;
    const el = windowRef.current;
    
    // We only want to save the size when the user STOPS resizing to avoid spamming the store
    // A simple way is to listen to mouseup on the window if we were resizing
    let resizeTimer: any;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width;
        const newHeight = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
        
        // Only trigger if it actually changed significantly from what we have
        if (Math.abs(newWidth - width) > 5 || Math.abs(newHeight - height) > 5) {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            setTabDimensions(id, newWidth, newHeight);
          }, 200); // debounce save
        }
      }
    });
    
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(resizeTimer);
    };
  }, [id, width, height, setTabDimensions, isMinimized]);

  if (isMinimized) {
    return (
      <motion.div
        style={{ x: motionX, y: motionY }}
        drag
        dragMomentum={false}
        onDragEnd={() => {
          updatePoppedOutWindow(id, { x: motionX.get(), y: motionY.get() });
        }}
        className={`absolute top-0 left-0 ${isUILocked ? 'pointer-events-none' : 'pointer-events-auto'} z-50 flex flex-col items-center gap-1 group`}
      >
        <button
          onDoubleClick={() => updatePoppedOutWindow(id, { isMinimized: false })}
          className="w-12 h-12 bg-black/90 border-2 border-[var(--border-accent)] rounded-full flex items-center justify-center text-[var(--text-primary)] shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:scale-110 hover:shadow-[0_0_25px_var(--border-accent)] transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--border-accent)]/20 to-transparent pointer-events-none" />
          <Icon size={24} className="relative z-10" />
        </button>
        <div className="bg-black/90 px-2 py-1 rounded text-[10px] font-bold text-white border border-[var(--border-subtle)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {label}
        </div>
      </motion.div>
    );
  }



  return (
    <motion.div
      ref={windowRef}
      onPointerDownCapture={() => {
        updatePoppedOutWindow(id, { zIndex: Date.now() });
      }}
      style={{
        x: motionX,
        y: motionY,
        width,
        height,
        opacity: isHovered ? activeOpacity : idleOpacity,
        resize: 'both',
        zIndex: window.zIndex || 40
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragElastic={0}
      dragMomentum={false}
      onDragEnd={() => {
        updatePoppedOutWindow(id, { x: motionX.get(), y: motionY.get() });
      }}
      className={`
        absolute top-0 left-0 ${isUILocked ? 'pointer-events-none' : 'pointer-events-auto'} z-50 
        shadow-[0_8px_30px_rgba(0,0,0,0.8)] border-[var(--border-accent)] 
        flex transition-opacity duration-300 overflow-hidden border
        bg-[var(--bg-base)] flex-col min-h-[150px] min-w-[200px]
      `}
    >
      <div 
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          dragControls.start(e);
        }}
        className="flex items-center justify-between bg-[var(--bg-panel)]/50 border-b border-[var(--border-subtle)] px-3 py-1.5 shrink-0 select-none cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2 text-[var(--text-primary)]">
          <Icon size={14} className="text-[var(--accent-primary)]" />
          <span className="text-[11px] font-bold tracking-wider uppercase">{label}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={() => {
              if (windowRef.current) {
                windowRef.current.style.removeProperty('width');
                windowRef.current.style.removeProperty('height');
              }
              // Also clear any stored dimensions for this tab in the global store just in case
              useTrackerStore.getState().setTabDimensions(id, undefined, undefined);
            }}
            title="Reset Size"
            className="p-1 rounded hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors"
          >
            <RefreshCw size={12} />
          </button>
          <button 
            onClick={() => updatePoppedOutWindow(id, { isMinimized: true })}
            className="p-1 rounded hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors"
          >
            <Minus size={12} />
          </button>
          <button 
            onClick={() => mergeTab(id)}
            className="p-1 rounded hover:bg-rose-500/20 text-[var(--text-muted)] hover:text-rose-400 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </div>
      
      <div className={`flex-1 flex flex-col overflow-hidden ${isHorizontal ? 'p-2 gap-1.5' : 'p-1'}`}>
        {renderContent()}
      </div>
    </motion.div>
  );
};
