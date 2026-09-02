import React from 'react';
import { motion, useMotionValue, useDragControls } from 'motion/react';
import { PoppedOutWindow } from '../../store/storeTypes';
import { useSettingsStore } from '../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';


import { TrackingView } from '../views/TrackingView';
import { LootView } from '../views/LootView';
import { NPCView } from '../views/NPCView';
import { SettingsView } from '../views/SettingsView';
import { QuestView } from '../views/QuestView';
import { RecentLootView } from '../views/loot/RecentLootView';
import { RoepediaView } from '../views/RoepediaView';

import { Tooltip } from '../ui/Tooltip';
import { Globe2, Star, PackageOpen, Users, Settings, Minus, X, RefreshCw, ScrollText, Lock, Unlock, User, Activity, ListPlus, ChevronUp, Book, Ghost } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { ErrorBoundary } from '../widgets/ErrorBoundary';

const tabsConfig = [
  { id: 'global', icon: Globe2, label: 'Global Data' },
  { id: 'favorites', icon: Star, label: 'Favorites' },
  { id: 'profile', icon: User, label: 'Profile' },
  { id: 'session', icon: Activity, label: 'Session Stats' },
  { id: 'recentLoot', icon: ListPlus, label: 'Recent Loot' },
  { id: 'chest', icon: PackageOpen, label: 'Chest' },
  { id: 'npcs', icon: Users, label: 'NPCs & Players' },
  { id: 'quests', icon: ScrollText, label: 'Quests' },
  { id: 'roepedia', icon: Book, label: 'ROEpedia' },
  { id: 'settings', icon: Settings, label: 'Settings' }
];

export const PoppedOutWindowComponent = React.memo<{ window: PoppedOutWindow, constraintsRef?: any }>(({ window: win, constraintsRef }) => {
  const { t } = useTranslation();
  const { id, x, y, isMinimized, isLocked } = win;
  const {
    updatePoppedOutWindow, mergeTab,
    activeOpacity, idleOpacity, isUILocked,
    layoutMode, globalScale, tutorialStep
  } = useSettingsStore(useShallow((state: any) => ({
    updatePoppedOutWindow: state.updatePoppedOutWindow,
    mergeTab: state.mergeTab,
    activeOpacity: state.activeOpacity,
    idleOpacity: state.idleOpacity,
    isUILocked: state.isUILocked,
    layoutMode: state.layoutMode,
    globalScale: state.globalScale,
    tutorialStep: state.notificationSettings?.tutorialStep || 0,
  })));
  const isHorizontal = layoutMode === 'horizontal';

  // If the user explicitly toggled the window's lock state, respect it.
  // Otherwise, fallback to the master UI lock.
  const effectiveLock = isLocked !== undefined ? isLocked : isUILocked;

  const dragControls = useDragControls();
  const windowRef = React.useRef<HTMLDivElement>(null);

  const defaultWidth = isHorizontal ? 'auto' : 300;
  const defaultHeight = isHorizontal ? 250 : 'auto';

  const safeX = typeof x === 'number' && !isNaN(x) ? x : 0;
  const safeY = typeof y === 'number' && !isNaN(y) ? y : 0;
  const motionX = useMotionValue(safeX);
  const motionY = useMotionValue(safeY);

  // Custom resize motion values initialized from store or defaults. 
  // Height defaults to 'auto' in vertical, width defaults to 'auto' in horizontal.
  const w = win.width || defaultWidth;
  const h = win.height || defaultHeight;
  const safeWidth = typeof w === 'number' && !isNaN(w as number) ? w : (typeof w === 'string' ? w : defaultWidth);
  const safeHeight = typeof h === 'number' && !isNaN(h as number) ? h : (typeof h === 'string' ? h : defaultHeight);
  const windowWidth = useMotionValue(safeWidth);
  const windowHeight = useMotionValue(safeHeight);

  // Sync MotionValues if store gets updated externally (e.g. Shift+R Reset Size hotkey)
  React.useEffect(() => {
    const newW = win.width || defaultWidth;
    const newH = win.height || defaultHeight;
    const sw = typeof newW === 'number' && !isNaN(newW) ? newW : (typeof newW === 'string' ? newW : defaultWidth);
    const sh = typeof newH === 'number' && !isNaN(newH) ? newH : (typeof newH === 'string' ? newH : defaultHeight);
    windowWidth.set(sw);
    windowHeight.set(sh);
  }, [win.width, win.height, defaultWidth, defaultHeight, windowWidth, windowHeight]);

  const tabConfig = tabsConfig.find(t => t.id === id);
  const Icon = tabConfig?.icon || Globe2;
  const label = tabConfig?.label || 'Tab';
  const handleResizeDown = (e: React.PointerEvent, dir: string) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    
    const rect = windowRef.current?.getBoundingClientRect();
    const startW = rect?.width || (typeof windowWidth.get() === 'number' ? windowWidth.get() as number : (typeof defaultWidth === 'number' ? defaultWidth : 600));
    const startH = rect?.height || (typeof windowHeight.get() === 'number' ? windowHeight.get() as number : (typeof defaultHeight === 'number' ? defaultHeight : 350));

    const startOverlayX = motionX.get();
    const startOverlayY = motionY.get();

    const minW = isHorizontal ? 400 : 240;
    const minH = isHorizontal ? 150 : 200;

    const onMove = (me: PointerEvent) => {
      let newW = startW;
      let newH = startH;
      let newX = startOverlayX;
      let newY = startOverlayY;
      
      if (dir.includes('e')) {
        newW = Math.max(minW, startW + (me.clientX - startX));
      } else if (dir.includes('w')) {
        newW = Math.max(minW, startW - (me.clientX - startX));
        newX = startOverlayX + (startW - newW);
      }
      
      if (dir.includes('s')) {
        newH = Math.max(minH, startH + (me.clientY - startY));
      } else if (dir.includes('n')) {
        newH = Math.max(minH, startH - (me.clientY - startY));
        newY = startOverlayY + (startH - newH);
      }
      
      windowWidth.set(newW);
      windowHeight.set(newH);
      motionX.set(newX);
      motionY.set(newY);
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      
      updatePoppedOutWindow(id, { 
        width: windowWidth.get() as number, 
        height: windowHeight.get() as number,
        x: motionX.get(),
        y: motionY.get()
      });
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  // Ensure window stays within screen bounds when resized or screen dimensions change
  React.useEffect(() => {
    const handleResize = () => {
      if (!windowRef.current) return;
      const rect = windowRef.current.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;
      
      let currentX = motionX.get();
      let currentY = motionY.get();
      
      let changed = false;
      if (currentX > maxX) { currentX = maxX; changed = true; }
      if (currentX < 0) { currentX = 0; changed = true; }
      if (currentY > maxY) { currentY = maxY; changed = true; }
      if (currentY < 0) { currentY = 0; changed = true; }
      
      if (changed) {
        motionX.set(currentX);
        motionY.set(currentY);
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          updatePoppedOutWindow(id, { x: currentX, y: currentY });
        }, 500);
      }
    };

    let resizeTimer: any;
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial clamp
    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, [id, motionX, motionY, windowWidth, windowHeight, isMinimized, updatePoppedOutWindow, defaultWidth, defaultHeight]);

  const renderContent = () => {
    switch (id) {
      case 'global':
      case 'favorites':
        return <TrackingView forcedTab={id} />;
      case 'session': return <LootView forcedTab="session" hideNavigation={true} />;
      case 'recentLoot': return <RecentLootView />;
      case 'profile': return <LootView forcedTab="profile" hideNavigation={true} />;
      case 'chest': return <LootView forcedTab="chest" hideNavigation={true} />;
      case 'npcs': return <NPCView />;
      case 'quests': return <QuestView />;
      case 'roepedia': return <RoepediaView />;
      case 'settings': return <SettingsView />;
      default: return null;
    }
  };



  if (isMinimized) {
    return (
      <motion.div
        key={`minimized-${id}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        style={{ x: motionX, y: motionY }}
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.15}
        dragMomentum={false}
        onDragEnd={() => {
          const snapX = Math.round(motionX.get());
          const snapY = Math.round(motionY.get());
          motionX.set(snapX);
          motionY.set(snapY);
          updatePoppedOutWindow(id, { x: snapX, y: snapY });
        }}
        className={`absolute top-0 left-0 ${effectiveLock ? 'pointer-events-none' : 'pointer-events-auto'} z-50 flex flex-col items-center gap-1 group`}
      >
        <motion.button
          onTap={() => updatePoppedOutWindow(id, { isMinimized: false })}
          className="w-12 h-12 bg-black/90 border-2 border-[var(--border-accent)] rounded-full flex items-center justify-center text-[var(--text-primary)] shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:scale-110 hover:shadow-[0_0_25px_var(--border-accent)] transition-all cursor-pointer relative overflow-hidden pointer-events-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--border-accent)]/20 to-transparent pointer-events-none" />
          <Icon size={24} className="relative z-10" />
        </motion.button>
        <div className="bg-black/90 px-2 py-1 rounded text-[10px] font-bold text-white border border-[var(--border-subtle)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {label}
        </div>
      </motion.div>
    );
  }



  return (
    <motion.div
      key={`window-${id}`}
      ref={windowRef}
      role="region"
      aria-label={`ROEDEX ${label} Window`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onPointerDownCapture={() => {
        updatePoppedOutWindow(id, { zIndex: Date.now() % 2000000000 });
      }}
      style={{
        x: motionX,
        y: motionY,
        width: isHorizontal ? undefined : windowWidth,
        height: isHorizontal ? windowHeight : undefined,
        minWidth: isHorizontal ? windowWidth : undefined,
        minHeight: isHorizontal || win.isCollapsed ? undefined : windowHeight,
        zIndex: win.zIndex || 40,
        '--idle-opacity': tutorialStep > 0 ? 1.0 : idleOpacity,
        '--active-opacity': tutorialStep > 0 ? 1.0 : activeOpacity,
        zoom: globalScale || 1,
      } as any}
      drag={!effectiveLock}
      dragControls={dragControls}
      dragConstraints={constraintsRef}
      dragListener={false}
      dragElastic={0.15}
      dragMomentum={false}
      onDragEnd={() => {
        const snapX = Math.round(motionX.get());
        const snapY = Math.round(motionY.get());
        motionX.set(snapX);
        motionY.set(snapY);
        updatePoppedOutWindow(id, { x: snapX, y: snapY });
      }}
      className={`
        absolute top-0 left-0 ${effectiveLock ? 'pointer-events-none' : 'pointer-events-auto'} z-50 
        shadow-[0_12px_40px_rgba(0,0,0,0.9)] border-[var(--border-accent)] 
        flex transition-opacity duration-300 rounded-xl border
        bg-[var(--bg-base)]/95 flex-col ${win.isCollapsed ? 'min-h-0 min-w-[240px]' : 'min-h-[50px] min-w-[240px]'} max-h-[85vh]
        opacity-[var(--idle-opacity)] hover:opacity-[var(--active-opacity)]
        overflow-hidden
        ${effectiveLock ? 'ring-1 ring-amber-500/30' : ''}
      `}
    >
      {win.isHeadless ? (
        <div 
          className="absolute top-0 left-0 right-0 h-4 bg-transparent hover:bg-white/10 z-[100] cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-auto"
          onDoubleClick={() => updatePoppedOutWindow(id, { isHeadless: false })}
          title="Double click to restore header"
        >
          <div className="w-8 h-1 rounded-full bg-white/50 pointer-events-none" />
        </div>
      ) : (
        <div
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest('button') || effectiveLock) return;
            e.preventDefault();
            dragControls.start(e);
          }}
          onDoubleClick={() => updatePoppedOutWindow(id, { isCollapsed: !win.isCollapsed })}
          className={`flex items-center justify-between bg-[var(--bg-panel)]/50 border-b ${win.isCollapsed ? 'border-transparent' : 'border-[var(--border-subtle)]'} px-3 py-1.5 shrink-0 select-none pointer-events-auto ${effectiveLock ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
        >
          <div className="flex items-center gap-2 text-[var(--text-primary)] pr-4 min-w-0 flex-1">
            <Icon size={14} className="text-[var(--accent-primary)] shrink-0" />
            <span className="text-[11px] font-bold tracking-wider uppercase truncate">ROEDEX // {label}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
          <Tooltip content={t('ui.resetSize')}>
            <button
              aria-label={t('ui.resetSize') || 'Reset Size'}
              onClick={() => {
                windowWidth.set(defaultWidth);
                windowHeight.set('auto');
                updatePoppedOutWindow(id, { width: defaultWidth === 'auto' ? undefined : defaultWidth, height: undefined });
              }}
              className="p-1 rounded hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw size={12} />
            </button>
          </Tooltip>
          <Tooltip content={effectiveLock ? "Unlock Window" : "Lock Window"}>
            <button
              aria-label={effectiveLock ? "Unlock Window" : "Lock Window"}
              onClick={() => updatePoppedOutWindow(id, { isLocked: !effectiveLock })}
              className={`p-1 rounded transition-colors cursor-pointer ${effectiveLock ? 'text-amber-400 hover:text-amber-300' : 'text-[var(--text-muted)] hover:text-white hover:bg-white/10'}`}
            >
              {effectiveLock ? <Lock size={12} /> : <Unlock size={12} />}
            </button>
          </Tooltip>
          <Tooltip content={win.isCollapsed ? "Expand" : "Collapse"}>
            <button
              aria-label={win.isCollapsed ? "Expand" : "Collapse"}
              onClick={() => updatePoppedOutWindow(id, { isCollapsed: !win.isCollapsed })}
              className="p-1 rounded hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer"
            >
              <div className={`transition-transform duration-300 ${win.isCollapsed ? 'rotate-180' : 'rotate-0'}`}>
                <ChevronUp size={12} />
              </div>
            </button>
          </Tooltip>
          <Tooltip content="Headless Mode">
            <button
              aria-label="Headless Mode"
              onClick={() => updatePoppedOutWindow(id, { isHeadless: true })}
              className="p-1 rounded hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer"
            >
              <Ghost size={12} />
            </button>
          </Tooltip>
          <Tooltip content="Minimize to Bubble">
            <button
              aria-label="Minimize to Bubble"
              onClick={() => updatePoppedOutWindow(id, { isMinimized: true })}
              className="p-1 rounded hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer"
            >
              <Minus size={12} />
            </button>
          </Tooltip>
          <Tooltip content="Close">
            <button
              aria-label={`Close ${label} window`}
              onClick={() => mergeTab(id)}
              className="p-1 rounded hover:bg-rose-500/20 text-[var(--text-muted)] hover:text-rose-400 transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          </Tooltip>
        </div>
      </div>
      )}

      {!win.isCollapsed && (
        <div className={`flex-1 min-h-0 flex flex-col overflow-y-auto custom-scrollbar ${isHorizontal ? 'p-2 gap-1.5' : 'p-1'} ${effectiveLock ? 'pointer-events-none' : 'pointer-events-auto'}`}>
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </div>
      )}

      {/* Custom Resize Handles */}
      {!win.isCollapsed && !effectiveLock && (
        <>
          <div onPointerDown={(e) => handleResizeDown(e, 'n')} className="absolute top-0 left-4 right-4 h-1.5 cursor-n-resize z-[100]" />
          <div onPointerDown={(e) => handleResizeDown(e, 's')} className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize z-[100]" />
          <div onPointerDown={(e) => handleResizeDown(e, 'w')} className="absolute top-4 bottom-4 left-0 w-1.5 cursor-w-resize z-[100]" />
          <div onPointerDown={(e) => handleResizeDown(e, 'e')} className="absolute top-4 bottom-4 right-0 w-2 cursor-e-resize z-[100]" />
          <div onPointerDown={(e) => handleResizeDown(e, 'nw')} className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-[100]" />
          <div onPointerDown={(e) => handleResizeDown(e, 'ne')} className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-[100]" />
          <div onPointerDown={(e) => handleResizeDown(e, 'sw')} className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-[100]" />
          <div onPointerDown={(e) => handleResizeDown(e, 'se')} className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-[100]" />
        </>
      )}
    </motion.div>
  );
});

PoppedOutWindowComponent.displayName = 'PoppedOutWindowComponent';
