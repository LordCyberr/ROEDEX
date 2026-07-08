import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Header } from '../layout/Header';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';

import { WeaponUI } from '../widgets/WeaponUI';
import { ArmorUI } from '../widgets/ArmorUI';
import { NotificationToaster } from '../widgets/NotificationToaster';
import { CompanionOverlay } from '../widgets/CompanionOverlay';
import { EfficiencyHUD } from '../widgets/EfficiencyHUD';
import { DebugPanel } from '../widgets/DebugPanel';
import { MinimizedOrb } from './MinimizedOrb';
import { PoppedOutWindowComponent } from './PoppedOutWindowComponent';
import { ErrorBoundary } from '../widgets/ErrorBoundary';
// ChangelogModal lazy loaded
import { motion, useMotionValue, useDragControls } from 'motion/react';
import { MinimalChestHUD } from '../widgets/MinimalChestHUD';
import { BlacksmithUI } from '../widgets/BlacksmithUI';
import { PoppedOutWindow } from '../../store/storeTypes';
import { CompanionGuideOverlay } from './CompanionGuideOverlay';
import { FocusHighlight } from './FocusHighlight';
// Windows lazy loaded
import { NPCTranslationBubble } from './NPCTranslationBubble';
import { DirectionalArrow } from './DirectionalArrow';
import { Profiler, ProfilerOnRenderCallback } from 'react';

import { ChangelogModal } from '../ui/ChangelogModal';
import { LifetimeStatsWindow } from './LifetimeStatsWindow';
import { RunHistoryWindow } from './RunHistoryWindow';

import { TrackingView } from '../views/TrackingView';
import { LootView } from '../views/LootView';
import { NPCView } from '../views/NPCView';
import { QuestView } from '../views/QuestView';
import { PlayersView } from '../views/PlayersView';
import { SettingsView } from '../views/SettingsView';

export const OverlayContainer: React.FC = () => {
  const { currentZone } = useTrackerStore(useShallow((state: any) => ({
    currentZone: state.currentZone
  })));

  const {
    activeTab, isMinimized, layoutMode, poppedOutWindows,
    mergeTab, overlayPosition, setOverlayPosition,
    activeOpacity, idleOpacity, isUILocked, globalScale,
    tabDimensions, theme, tutorialStep, tutorialCompleted,
    devForceOverlay, visualQuality, developerMode
  } = useSettingsStore(useShallow((state: any) => ({
    activeTab: state.activeTab,
    isMinimized: state.isMinimized,
    layoutMode: state.layoutMode,
    poppedOutWindows: state.poppedOutWindows,
    mergeTab: state.mergeTab,
    overlayPosition: state.overlayPosition,
    setOverlayPosition: state.setOverlayPosition,
    activeOpacity: state.activeOpacity,
    idleOpacity: state.idleOpacity,
    isUILocked: state.isUILocked,
    tabDimensions: state.tabDimensions,
    theme: state.theme,
    globalScale: state.globalScale,
    tutorialStep: state.notificationSettings?.tutorialStep || 0,
    tutorialCompleted: state.notificationSettings?.tutorialCompleted || false,
    devForceOverlay: state.devForceOverlay,
    visualQuality: state.visualQuality,
    developerMode: state.developerMode
  })));
  const { t } = useTranslation();

  const isGameLoaded = devForceOverlay || developerMode || (!!currentZone && currentZone !== 'Unknown');
  const [isOverlayReady, setIsOverlayReady] = React.useState(false);

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    
    if (isGameLoaded) {
      if (devForceOverlay || developerMode) {
        setIsOverlayReady(true);
      } else {
        // Wait 3 seconds after receiving the first zone packet before showing overlay
        timer = setTimeout(() => {
          setIsOverlayReady(true);
        }, 3000);
      }
    } else {
      setIsOverlayReady(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isGameLoaded, devForceOverlay, developerMode]);

  const [isHovered, setIsHovered] = React.useState(false);
  
  const isHorizontal = layoutMode === 'horizontal';

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isRefReady, setIsRefReady] = React.useState(false);

  React.useEffect(() => {
    if (containerRef.current && !isRefReady) {
      setIsRefReady(true);
    }
  }, [isRefReady]);

  const dragControls = useDragControls();
  
  const x = useMotionValue(overlayPosition?.x ?? 103);
  const y = useMotionValue(overlayPosition?.y ?? 116);

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
  }, [overlayPosition?.x, overlayPosition?.y, x, y]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        let tabId = '';
        if (e.key === '1') tabId = 'global';
        else if (e.key === '2') tabId = 'session';
        else if (e.key === '3') tabId = 'npcs';
        else if (e.key === '4') tabId = 'quests';
        
        if (tabId) {
          e.preventDefault();
          useSettingsStore.getState().popOutTab(tabId, window.innerWidth / 2 - 150, window.innerHeight / 2 - 200);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  React.useEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        let currX = x.get();
        let currY = y.get();
        
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        
        const w = overlayRef.current ? overlayRef.current.getBoundingClientRect().width : 260;
        const h = overlayRef.current ? overlayRef.current.getBoundingClientRect().height : 200;

        let changed = false;
        if (currX < 0) { currX = 0; changed = true; }
        if (currX > screenW - w) { currX = Math.max(0, screenW - w); changed = true; }
        if (currY < 0) { currY = 0; changed = true; }
        if (currY > screenH - h) { currY = Math.max(0, screenH - h); changed = true; }

        if (changed) {
          x.set(currX);
          y.set(currY);
          setOverlayPosition({ x: currX, y: currY });
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [x, y, setOverlayPosition]);

  const renderContent = () => {
    if (poppedOutWindows[activeTab]) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full opacity-50 p-4 text-center">
          <div className="text-[var(--text-primary)] font-bold mb-2">{t('overlayContainer.poppedOut')}</div>
          <button 
            onClick={() => mergeTab(activeTab)}
            className="px-3 py-1.5 bg-[var(--accent-primary)]/20 hover:bg-[var(--accent-primary)]/40 text-[var(--accent-primary)] rounded transition-colors text-xs font-bold uppercase tracking-wider border border-[var(--accent-primary)]/30"
          >
            Merge Back
          </button>
        </div>
      );
    }

    const renderView = () => {
      switch (activeTab) {
        case 'global':
        case 'favorites':
          return <TrackingView forcedTab={activeTab} />;
        case 'session': return <LootView />;
        case 'npcs':
          return <NPCView />;
        case 'quests': return <QuestView />;
        case 'players': return <PlayersView />;
        case 'settings': return <SettingsView />;
        default: return null;
      }
    };
    
    return <ErrorBoundary>{renderView()}</ErrorBoundary>;
  };

  const overlayRef = React.useRef<HTMLDivElement>(null);

  // ResizeObserver removed in favor of onUp saving to prevent React render loops

  const activeDimKey = isHorizontal ? `${activeTab}_horizontal` : `${activeTab}_vertical`;
  const activeDim = tabDimensions[activeDimKey] || {};
  const currentWidth = activeDim.width ? `${activeDim.width}px` : undefined;
  const currentHeight = activeDim.height ? `${activeDim.height}px` : undefined;

  React.useEffect(() => {
    if (overlayRef.current) {
      if (!currentWidth) {
        overlayRef.current.style.width = '';
        overlayRef.current.style.minWidth = '';
      }
      if (!currentHeight) {
        overlayRef.current.style.height = '';
        overlayRef.current.style.minHeight = '';
      }
    }
  }, [currentWidth, currentHeight]);

  const handleResizeDown = (e: React.PointerEvent, dir: string) => {
    e.stopPropagation();
    e.preventDefault();
    const el = overlayRef.current;
    if (!el) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = el.getBoundingClientRect().width;
    const startH = el.getBoundingClientRect().height;
    const startOverlayX = x.get();
    const startOverlayY = y.get();
    
    const minW = isHorizontal ? 420 : 220;
    const minH = isHorizontal ? 150 : 200;
    const maxW = window.innerWidth - 16;
    const maxH = window.innerHeight * 0.85;
    
    const onMove = (me: PointerEvent) => {
      let newW = startW;
      let newH = startH;
      let newX = startOverlayX;
      let newY = startOverlayY;
      
      if (dir.includes('e')) {
        newW = Math.max(minW, Math.min(maxW, startW + (me.clientX - startX)));
      } else if (dir.includes('w')) {
        newW = Math.max(minW, Math.min(maxW, startW - (me.clientX - startX)));
        newX = startOverlayX + (startW - newW);
      }
      
      if (dir.includes('s')) {
        newH = Math.max(minH, Math.min(maxH, startH + (me.clientY - startY)));
      } else if (dir.includes('n')) {
        newH = Math.max(minH, Math.min(maxH, startH - (me.clientY - startY)));
        newY = startOverlayY + (startH - newH);
      }
      
      if (dir.includes('e') || dir.includes('w')) {
        el.style.width = `${newW}px`;
      }
      if (dir.includes('s') || dir.includes('n')) {
        // Apply height changes during drag. Even in vertical mode, this works because
        // on drag end, it converts to minHeight!
        el.style.height = `${newH}px`;
      }
      
      if (dir.includes('w')) x.set(newX);
      if (dir.includes('n')) y.set(newY);
    };
    
    const onUp = () => {
      const w = el.style.width;
      const h = el.style.height;
      const finalW = (w && w.endsWith('px')) ? parseInt(w) : undefined;
      const finalH = (h && h.endsWith('px')) ? parseInt(h) : undefined;
      
      const currentDimObj = useSettingsStore.getState().tabDimensions[activeDimKey] || {};
      
      const saveW = (dir.includes('e') || dir.includes('w')) ? finalW : currentDimObj.width;
      const saveH = (dir.includes('s') || dir.includes('n')) ? finalH : currentDimObj.height;
      
      if (saveW || saveH) {
        useSettingsStore.getState().setTabDimensions(activeDimKey, saveW, saveH);
      }
      useSettingsStore.getState().setOverlayPosition({ x: x.get(), y: y.get() });
      
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    };
    
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  };

  const onRender: ProfilerOnRenderCallback = (_id, _phase, actualDuration) => {
    const state = useSettingsStore.getState();
    const currentAvg = state.profilerMetrics.renderTime.average;
    const newAvg = currentAvg === 0 ? actualDuration : (currentAvg * 0.9) + (actualDuration * 0.1);
    
    state.profilerMetrics.renderTime.average = Number(newAvg.toFixed(3));
    state.profilerMetrics.renderTime.lastRender = Number(actualDuration.toFixed(3));
  };

  return (
    <Profiler id="OverlayContainer" onRender={onRender}>
      <div ref={containerRef} className={`fixed inset-0 pointer-events-none z-50 overflow-hidden text-[var(--text-primary)] font-[var(--font-body)] ${visualQuality === 'performance' ? 'perf-mode' : ''}`} data-theme={theme}>
      {isRefReady && (
        <div 
          className={`w-full h-full transition-opacity duration-1000 ${(!isGameLoaded || !isOverlayReady) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          {isGameLoaded && (
            <>
              {isMinimized ? (
                <MinimizedOrb constraintsRef={containerRef} />
              ) : (
                <motion.div 

                ref={overlayRef}
                style={{ 
                  x, y, 
                  opacity: tutorialStep > 0 ? 1.0 : (isHovered ? activeOpacity : idleOpacity),
                  width: isHorizontal ? "" : (currentWidth || ""),
                  height: isHorizontal ? (currentHeight || "") : "",
                  // To satisfy the paradox of "user can resize from any direction" AND "auto-expand always works", 
                  // we apply the fixed dimension to the dominant axis, but we apply it as a MINIMUM to the auto-expand axis!
                  // In Vertical mode: width is fixed, height is minHeight (so it can still grow!)
                  // In Horizontal mode: height is fixed, width is minWidth (so it can still grow!)
                  minHeight: !isHorizontal ? (currentHeight || "") : undefined,
                  minWidth: isHorizontal ? (currentWidth || "") : undefined,
                  zoom: globalScale || 1
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                drag={!isUILocked}
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
                    ? 'h-fit min-h-fit max-h-[85vh] w-fit min-w-[400px] max-w-[calc(100vw-1rem)] flex-col' 
                    : `h-fit min-h-fit max-h-[85vh] ${(activeTab === 'global' || activeTab === 'favorites') ? 'w-fit' : 'w-[220px]'} max-w-[360px] min-w-[180px] flex-col`
                  }
                `}
              >
                <Header onPointerDown={(e) => dragControls.start(e)} />
                
                <div className={`flex-1 overflow-hidden ${isHorizontal ? 'overflow-x-auto custom-scrollbar flex p-2 gap-1.5' : 'overflow-y-auto custom-scrollbar p-1'}`}>
                  {renderContent()}
                </div>

                {/* 8-Way Custom Resize Handles */}
                <div onPointerDown={(e) => handleResizeDown(e, 'n')} className="absolute top-0 left-4 right-4 h-1.5 cursor-n-resize z-[100]" />
                <div onPointerDown={(e) => handleResizeDown(e, 's')} className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize z-[100]" />
                <div onPointerDown={(e) => handleResizeDown(e, 'w')} className="absolute top-4 bottom-4 left-0 w-1.5 cursor-w-resize z-[100]" />
                <div onPointerDown={(e) => handleResizeDown(e, 'e')} className="absolute top-4 bottom-4 right-0 w-2 cursor-e-resize z-[100]" />
                <div onPointerDown={(e) => handleResizeDown(e, 'nw')} className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-[100]" />
                <div onPointerDown={(e) => handleResizeDown(e, 'ne')} className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-[100]" />
                <div onPointerDown={(e) => handleResizeDown(e, 'sw')} className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-[100]" />
                <div onPointerDown={(e) => handleResizeDown(e, 'se')} className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-[100]" />
              </motion.div>
            )}
            
            {(Object.values(poppedOutWindows) as PoppedOutWindow[]).map(win => (
              <ErrorBoundary key={win.id}>
                <PoppedOutWindowComponent window={win} constraintsRef={containerRef} />
              </ErrorBoundary>
            ))}
            
            <ErrorBoundary><WeaponUI /></ErrorBoundary>
            <ErrorBoundary><ArmorUI /></ErrorBoundary>
            <ErrorBoundary><EfficiencyHUD /></ErrorBoundary>
            <ErrorBoundary><BlacksmithUI /></ErrorBoundary>
            <ErrorBoundary><DebugPanel /></ErrorBoundary>
            <ErrorBoundary><MinimalChestHUD /></ErrorBoundary>
            <ErrorBoundary><FocusHighlight /></ErrorBoundary>
            {(tutorialCompleted || tutorialStep > 0) && (
              <ErrorBoundary><CompanionOverlay constraintsRef={containerRef} /></ErrorBoundary>
            )}
          </>
        )}
        
        <NPCTranslationBubble />

        <ErrorBoundary><DirectionalArrow /></ErrorBoundary>
      </div>
      )}
      
      <ErrorBoundary><NotificationToaster /></ErrorBoundary>
      <ErrorBoundary><CompanionGuideOverlay /></ErrorBoundary>
      <ErrorBoundary><ChangelogModal /></ErrorBoundary>
      <ErrorBoundary><LifetimeStatsWindow /></ErrorBoundary>
      <ErrorBoundary><RunHistoryWindow /></ErrorBoundary>

    </div>
    </Profiler>
  );
};
