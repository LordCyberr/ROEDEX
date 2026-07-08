import React from 'react';
import { motion, useMotionValue, useDragControls } from 'motion/react';
import { PoppedOutWindow } from '../../store/storeTypes';
import { useSettingsStore } from '../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { Suspense } from 'react';

import { TrackingView } from '../views/TrackingView';
import { LootView } from '../views/LootView';
import { NPCView } from '../views/NPCView';
import { SettingsView } from '../views/SettingsView';

import { Tooltip } from '../ui/Tooltip';
import { Globe2, Star, PackageOpen, Users, Settings, Minus, X, RefreshCw, ScrollText, Lock, Unlock, User, Activity, Radar } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const tabsConfig = [
  { id: 'global', icon: Globe2, label: 'Global Data' },
  { id: 'favorites', icon: Star, label: 'Favorites' },
  { id: 'session', icon: PackageOpen, label: 'Session & Loot' },
  { id: 'npcs', icon: Users, label: 'NPCs & Players' },
  { id: 'quests', icon: ScrollText, label: 'Quests' },
  { id: 'players', icon: Radar, label: 'Players' },
  { id: 'settings', icon: Settings, label: 'Settings' },
  { id: 'session_profile', icon: User, label: 'Profile' },
  { id: 'session_session', icon: Activity, label: 'Session Stats' },
  { id: 'session_chest', icon: PackageOpen, label: 'Chest' }
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

  const motionX = useMotionValue(x);
  const motionY = useMotionValue(y);

  // Custom resize motion values initialized from store or defaults. 
  // Height defaults to 'auto' in vertical, width defaults to 'auto' in horizontal.
  const windowWidth = useMotionValue(win.width || defaultWidth);
  const windowHeight = useMotionValue(win.height || defaultHeight);

  // Sync MotionValues if store gets updated externally (e.g. Shift+R Reset Size hotkey)
  React.useEffect(() => {
    windowWidth.set(win.width || defaultWidth);
    windowHeight.set(win.height || defaultHeight);
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

    const minW = isHorizontal ? 400 : 200;
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
      
      if (dir.includes('e') || dir.includes('w')) {
        windowWidth.set(newW);
      }
      
      if (dir.includes('s') || dir.includes('n')) {
        windowHeight.set(newH);
      }

      if (dir.includes('w')) motionX.set(newX);
      if (dir.includes('n')) motionY.set(newY);
    };

    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      const w = windowWidth.get();
      const h = windowHeight.get();
      updatePoppedOutWindow(id, { 
        width: typeof w === 'number' ? w : undefined, 
        height: typeof h === 'number' ? h : undefined,
        x: motionX.get(),
        y: motionY.get()
      });
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  React.useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        let currX = motionX.get();
        let currY = motionY.get();
        
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        const w = isMinimized ? 48 : (typeof windowWidth.get() === 'number' ? windowWidth.get() as number : (typeof defaultWidth === 'number' ? defaultWidth : 300));
        const h = isMinimized ? 48 : (typeof windowHeight.get() === 'number' ? windowHeight.get() as number : (typeof defaultHeight === 'number' ? defaultHeight : 200));

        let changed = false;
        if (currX < 0) { currX = 0; changed = true; }
        if (currX > screenW - 100) { currX = Math.max(0, screenW - w); changed = true; }
        if (currY < 0) { currY = 0; changed = true; }
        if (currY > screenH - 100) { currY = Math.max(0, screenH - Math.min(h, screenH * 0.85)); changed = true; }

        if (changed) {
          motionX.set(currX);
          motionY.set(currY);
          updatePoppedOutWindow(id, { x: currX, y: currY });
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial clamp
    return () => window.removeEventListener('resize', handleResize);
  }, [id, motionX, motionY, windowWidth, windowHeight, isMinimized, updatePoppedOutWindow, defaultWidth, defaultHeight]);

  const renderContent = () => {
    switch (id) {
      case 'global':
      case 'favorites':
        return <Suspense fallback={null}><TrackingView forcedTab={id} /></Suspense>;
      case 'session': return <Suspense fallback={null}><LootView /></Suspense>;
      case 'session_profile': return <Suspense fallback={null}><LootView forcedTab="profile" hideNavigation={true} /></Suspense>;
      case 'session_session': return <Suspense fallback={null}><LootView forcedTab="session" hideNavigation={true} /></Suspense>;
      case 'session_chest': return <Suspense fallback={null}><LootView forcedTab="chest" hideNavigation={true} /></Suspense>;
      case 'npcs': return <Suspense fallback={null}><NPCView /></Suspense>;
      case 'quests': return <Suspense fallback={null}><TrackingView forcedTab="quests" /></Suspense>;
      case 'settings': return <Suspense fallback={null}><SettingsView /></Suspense>;
      default: return null;
    }
  };



  if (isMinimized) {
    return (
      <motion.div
        key={`minimized-${id}`}
        style={{ x: motionX, y: motionY }}
        drag
        dragConstraints={constraintsRef}
        dragMomentum={false}
        onDragEnd={() => {
          updatePoppedOutWindow(id, { x: motionX.get(), y: motionY.get() });
        }}
        className={`absolute top-0 left-0 ${effectiveLock ? 'pointer-events-none' : 'pointer-events-auto'} z-50 flex flex-col items-center gap-1 group`}
      >
        <button
          onDoubleClick={() => updatePoppedOutWindow(id, { isMinimized: false })}
          className="w-12 h-12 bg-black/90 border-2 border-[var(--border-accent)] rounded-full flex items-center justify-center text-[var(--text-primary)] shadow-[0_0_20px_rgba(0,0,0,0.8)] hover:scale-110 hover:shadow-[0_0_25px_var(--border-accent)] transition-all cursor-pointer relative overflow-hidden pointer-events-auto"
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
      key={`window-${id}`}
      ref={windowRef}
      onPointerDownCapture={() => {
        updatePoppedOutWindow(id, { zIndex: Date.now() % 2000000000 });
      }}
      style={{
        x: motionX,
        y: motionY,
        width: isHorizontal ? "" : windowWidth,
        height: isHorizontal ? windowHeight : "",
        minWidth: isHorizontal ? windowWidth : "",
        minHeight: isHorizontal ? "" : windowHeight,
        zIndex: win.zIndex || 40,
        '--idle-opacity': tutorialStep > 0 ? 1.0 : idleOpacity,
        '--active-opacity': tutorialStep > 0 ? 1.0 : activeOpacity,
        zoom: globalScale || 1,
      } as any}
      drag={!effectiveLock}
      dragControls={dragControls}
      dragConstraints={constraintsRef}
      dragListener={false}
      dragElastic={0}
      dragMomentum={false}
      onDragEnd={() => {
        updatePoppedOutWindow(id, { x: motionX.get(), y: motionY.get() });
      }}
      className={`
        absolute top-0 left-0 ${effectiveLock ? 'pointer-events-none' : 'pointer-events-auto'} z-50 
        shadow-[0_12px_40px_rgba(0,0,0,0.9)] border-[var(--border-accent)] 
        flex transition-opacity duration-300 rounded-xl border
        bg-[var(--bg-base)]/95 flex-col min-h-[50px] min-w-[150px] max-h-[85vh]
        opacity-[var(--idle-opacity)] hover:opacity-[var(--active-opacity)]
        overflow-hidden
        ${effectiveLock ? 'ring-1 ring-amber-500/30' : ''}
      `}
    >
      <div
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest('button') || effectiveLock) return;
          e.preventDefault();
          dragControls.start(e);
        }}
        className={`flex items-center justify-between bg-[var(--bg-panel)]/50 border-b border-[var(--border-subtle)] px-3 py-1.5 shrink-0 select-none pointer-events-auto ${effectiveLock ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
      >
        <div className="flex items-center gap-2 text-[var(--text-primary)]">
          <Icon size={14} className="text-[var(--accent-primary)]" />
          <span className="text-[11px] font-bold tracking-wider uppercase">ROEDEX // {label}</span>
        </div>

        <div className="flex items-center gap-1">
          <Tooltip content={t('ui.resetSize')}>
            <button
              onClick={() => {
                windowWidth.set(defaultWidth);
                windowHeight.set('auto');
                updatePoppedOutWindow(id, { width: defaultWidth === 'auto' ? undefined : defaultWidth, height: undefined });
              }}
              className="p-1 rounded hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors"
            >
              <RefreshCw size={12} />
            </button>
          </Tooltip>
          <Tooltip content={effectiveLock ? "Unlock Window" : "Lock Window"}>
            <button
              onClick={() => updatePoppedOutWindow(id, { isLocked: !effectiveLock })}
              className={`p-1 rounded transition-colors ${effectiveLock ? 'text-amber-400 hover:text-amber-300' : 'text-[var(--text-muted)] hover:text-white hover:bg-white/10'}`}
            >
              {effectiveLock ? <Lock size={12} /> : <Unlock size={12} />}
            </button>
          </Tooltip>
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

      <div className={`flex-1 min-h-0 flex flex-col overflow-y-auto custom-scrollbar ${isHorizontal ? 'p-2 gap-1.5' : 'p-1'} ${effectiveLock ? 'pointer-events-none' : 'pointer-events-auto'}`}>
        {renderContent()}
      </div>

      {/* Custom Resize Handles */}
      {!effectiveLock && (
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
