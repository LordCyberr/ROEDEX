import React, { Profiler, ProfilerOnRenderCallback, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Header } from '../layout/Header';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';

import { useOverlayResize } from '../../hooks/useOverlayResize';

import { HUDLayer } from './HUDLayer';
import { ModalLayer } from './ModalLayer';
import { FloatingWidgetLayer } from './FloatingWidgetLayer';
import { MinimizedOrb } from './MinimizedOrb';
import { PoppedOutWindowManager } from './PoppedOutWindowManager';
import { ErrorBoundary } from '../widgets/ErrorBoundary';
import { motion, useMotionValue, useDragControls, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

import { useDeathDropRouter } from '../../hooks/useDeathDropRouter';
import { useDynamicWaypointRouter } from '../../hooks/useDynamicWaypointRouter';

import { TrackingView } from '../views/TrackingView';
import { ProfileView } from '../views/profile/ProfileView';
import { SessionTab } from '../views/loot/SessionTab';
import { ChestTab } from '../views/loot/ChestTab';
import { NPCView } from '../views/NPCView';

import { AAAMinimap } from '../map/AAAMinimap';
import { QuestView } from '../views/QuestView';
import { DebugPanel } from '../widgets/DebugPanel';
import { RoepediaView } from '../views/RoepediaView';
import { SettingsView } from '../views/SettingsView';
import { usePlayerProfile, usePendingDeathDrop, useChestInventory, useWeapon, useCurrentZone } from '../../store/hooks/useTrackerSelector';
import { useLayoutMode, useIsMinimized, useGlobalScale, useTheme, usePoppedOutWindows } from '../../store/hooks/useSettingsSelector';

export const OverlayContainer: React.FC = React.memo(() => {
  const currentZone = useCurrentZone();
  const playerProfile = usePlayerProfile();
  const pendingDeathDrop = usePendingDeathDrop();
  
  // Note: loadStaticBarriers was removed
  const chestInventory = useChestInventory();

  const weapon = useWeapon();
  const quickBarInstances = useTrackerStore(s => s.quickBarInstances);
  const inventoryInstances = useTrackerStore(s => s.inventoryInstances);
  const mapSettingsEnabled = useTrackerStore(s => s.mapSettings.enabled);
  
  const [dismissedWarnings, setDismissedWarnings] = React.useState<string[]>([]);

  const unequippedTools = React.useMemo(() => {
    // If the player has a weapon equipped, assume they are managing their hotbar properly
    // and suppress the warning to prevent false positives for other tools in the hotbar.
    if (weapon?.name) return [];
    
    const hotkeyCounts: Record<string, number> = {};
    quickBarInstances.forEach(inst => {
      if (inst && inventoryInstances[inst]) {
        const itemId = inventoryInstances[inst];
        hotkeyCounts[itemId] = (hotkeyCounts[itemId] || 0) + 1;
      }
    });
    
    return Object.keys(chestInventory || {}).filter(k => {
      let count = (chestInventory[k] || 0) - (hotkeyCounts[k] || 0);
      if (count <= 0) return false;
      if (dismissedWarnings.includes(k)) return false;
      const lName = k.toLowerCase();
      return lName.includes('sword') || 
             lName.includes('pickaxe') || 
             lName.includes('axe') || 
             lName.includes('tool') || 
             lName.includes('weapon') || 
             lName.includes('bow') || 
             lName.includes('staff') ||
             lName.includes('wand') ||
             lName.includes('dagger') ||
             lName.includes('blade');
    });
  }, [chestInventory, weapon?.name, quickBarInstances, inventoryInstances, dismissedWarnings]);

  useDeathDropRouter();
  useDynamicWaypointRouter();

  // Load static barrier walls once on mount
  useEffect(() => {
    // Removed loadStaticBarriers call
  }, []);

  const activeTab = useSettingsStore(s => s.activeTab);
  const isMinimized = useIsMinimized();
  const layoutMode = useLayoutMode();
  const poppedOutWindows = usePoppedOutWindows();
  const mergeTab = useSettingsStore(s => s.mergeTab);
  const overlayPosition = useSettingsStore(s => s.overlayPosition);
  const setOverlayPosition = useSettingsStore(s => s.setOverlayPosition);
  const isUILocked = useSettingsStore(s => s.isUILocked);
  const tabDimensions = useSettingsStore(s => s.tabDimensions);
  const theme = useTheme();
  const globalScale = useGlobalScale();
  const devForceOverlay = useSettingsStore(s => s.devForceOverlay);
  const visualQuality = useSettingsStore(s => s.visualQuality);
  const developerMode = useSettingsStore(s => s.developerMode);

  // P4: Separated frequently changing or visual fields to prevent full container re-renders
  const activeOpacity = useSettingsStore(s => s.activeOpacity);
  const idleOpacity = useSettingsStore(s => s.idleOpacity);
  const tutorialStep = useSettingsStore(s => s.notificationSettings?.tutorialStep ?? 0);
  const { t } = useTranslation();

  // Fix theme hydration
  useEffect(() => {
    if (typeof document !== 'undefined' && theme) {
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const hasGameData = devForceOverlay || developerMode || (!!currentZone && currentZone !== 'Unknown' && !!playerProfile?.name);
  const [isCanvasReady, setIsCanvasReady] = React.useState(devForceOverlay || developerMode);

  React.useEffect(() => {
    if (devForceOverlay || developerMode) {
      setIsCanvasReady(true);
      return;
    }
    
    // Check if the game canvas is actually in the DOM
    const checkCanvas = () => {
      const canvas = document.querySelector('canvas');
      // The canvas should be reasonably sized, not a hidden 1x1 tracking canvas
      if (canvas && canvas.clientWidth > 100 && canvas.clientHeight > 100 && canvas.style.display !== 'none') {
        setIsCanvasReady(true);
        return true;
      }
      return false;
    };

    if (checkCanvas()) return;

    const interval = setInterval(() => {
      if (checkCanvas()) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [devForceOverlay, developerMode]);

  const isGameLoaded = hasGameData && isCanvasReady;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← intentionally empty: runs once on mount to mark containerRef as ready

  const dragControls = useDragControls();
  
  const safeOverlayX = typeof overlayPosition?.x === 'number' && !isNaN(overlayPosition.x) ? overlayPosition.x : 103;
  const safeOverlayY = typeof overlayPosition?.y === 'number' && !isNaN(overlayPosition.y) ? overlayPosition.y : 116;
  const x = useMotionValue(safeOverlayX);
  const y = useMotionValue(safeOverlayY);

  // Sync initial position and handle hydration bounding
  React.useEffect(() => {
    // Clamp to safe screen boundaries to prevent it from getting lost off-screen.
    // CRITICAL: Must guard against NaN first — NaN comparisons always return false,
    // so NaN < 0 and NaN > screenW are BOTH false, letting NaN pass through to x.set(NaN)
    // which triggers Framer Motion's infinite physics loop and crashes the app.
    let safeX = (typeof overlayPosition?.x === 'number' && !isNaN(overlayPosition.x)) ? overlayPosition.x : 103;
    let safeY = (typeof overlayPosition?.y === 'number' && !isNaN(overlayPosition.y)) ? overlayPosition.y : 116;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    // Clamp to screen bounds with a grabbable buffer
    if (safeX < 0) safeX = 0;
    if (safeX > screenW - 100) safeX = Math.max(0, screenW - 260);

    if (safeY < 0) safeY = 0;
    if (safeY > screenH - 100) safeY = Math.max(0, screenH - 200);

    x.set(safeX);
    y.set(safeY);
  }, [overlayPosition?.x, overlayPosition?.y, x, y]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyTarget = e.target as Element | null;
      const activeEl = document.activeElement;
      const isTypingInInput =
        keyTarget instanceof HTMLInputElement ||
        keyTarget instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl as HTMLElement)?.isContentEditable ||
        !!(keyTarget?.closest?.('input, textarea, [contenteditable="true"]'));
      if (isTypingInInput) return;

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
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
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

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    } else {
      resizeObserver.observe(document.body);
    }

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeObserver.disconnect();
    };
  }, [x, y, setOverlayPosition]);

  const renderContent = () => {
    if (poppedOutWindows[activeTab]) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full opacity-50 p-4 text-center pointer-events-auto">
          <div className="text-[var(--text-primary)] font-bold mb-2">{t('overlayContainer.poppedOut')}</div>
          <button 
            onPointerDown={(e) => { e.stopPropagation(); mergeTab(activeTab); }}
            className="px-3 py-1.5 bg-[var(--accent-primary)]/20 hover:bg-[var(--accent-primary)]/40 text-[var(--accent-primary)] rounded transition-colors text-xs font-bold uppercase tracking-wider border border-[var(--accent-primary)]/30 cursor-pointer"
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
        case 'profile': return <ProfileView />;
        case 'session': return <SessionTab isHorizontal={isHorizontal} compactHeightClass="" />;
        case 'chest': return <ChestTab isHorizontal={isHorizontal} compactHeightClass="" />;
        case 'npcs': return <NPCView />;
        case 'quests': return <QuestView />;
        case 'roepedia': return <RoepediaView />;
        case 'settings': return <SettingsView />;
        default: return null;
      }
    };
    
    return (
      <ErrorBoundary>
        {renderView()}
      </ErrorBoundary>
    );
  };

  const overlayRef = React.useRef<HTMLDivElement>(null);

  // ResizeObserver removed in favor of onUp saving to prevent React render loops

  const activeDimKey = isHorizontal ? `${activeTab}_horizontal` : `${activeTab}_vertical`;
  const activeDim = tabDimensions[activeDimKey] || {};
  const currentWidth = activeDim.width ? `${activeDim.width}px` : undefined;
  const currentHeight = activeDim.height ? `${activeDim.height}px` : undefined;

  const { handleResizeDown } = useOverlayResize({
    overlayRef,
    isHorizontal,
    activeDimKey,
    x,
    y
  });

  const renderStatsRef = React.useRef({ count: 0, total: 0, lastUpdate: 0 });

  const onRender: ProfilerOnRenderCallback = (_id, _phase, actualDuration) => {
    renderStatsRef.current.count++;
    renderStatsRef.current.total += actualDuration;
    
    const now = performance.now();
    if (now - renderStatsRef.current.lastUpdate > 1000) {
      const avg = renderStatsRef.current.total / renderStatsRef.current.count;
      const state = useSettingsStore.getState();
      const currentAvg = state.profilerMetrics.renderTime.average;
      const newAvg = currentAvg === 0 ? avg : (currentAvg * 0.9) + (avg * 0.1);
      
      state.updateProfilerMetrics({
        renderTime: {
          average: Number(newAvg.toFixed(3)),
          lastRender: Number(actualDuration.toFixed(3)),
        }
      });
      
      renderStatsRef.current.count = 0;
      renderStatsRef.current.total = 0;
      renderStatsRef.current.lastUpdate = now;
    }
  };

  const DEFAULT_TAB_HEIGHTS: Record<string, string> = {
    global: '380px',
    favorites: '380px',
    session: '400px',
    npcs: '400px',
    quests: '400px',
    roepedia: '440px',
    settings: '400px',
  };

  const defaultTabHeight = DEFAULT_TAB_HEIGHTS[activeTab] || '400px';

  const calculatedHeight = isHorizontal 
    ? (currentHeight || defaultTabHeight)
    : (currentHeight || 'auto');

  const content = (
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
                  width: isHorizontal ? (currentWidth || "720px") : (currentWidth || ""),
                  height: calculatedHeight,
                  maxHeight: '85vh',
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
                  const snapX = Math.round(x.get());
                  const snapY = Math.round(y.get());
                  x.set(snapX);
                  y.set(snapY);
                  setOverlayPosition({ x: snapX, y: snapY });
                }}
                className={`flex flex-col bg-[var(--bg-base)] overflow-hidden flex-1 pointer-events-auto shadow-2xl relative rounded-xl border border-[var(--border-accent)] shadow-[0_8px_30px_rgba(0,0,0,0.8)]
                  ${isHorizontal 
                    ? `h-full min-w-[300px] w-full ${activeTab === 'chest' ? 'max-w-[700px]' : 'max-w-[380px]'}` 
                    : `max-h-[85vh] ${(activeTab === 'roepedia') ? 'w-[290px]' : 'w-[260px]'} max-w-[700px] min-w-[200px] flex-col`
                  }`}
              >
                <Header onPointerDown={(e) => dragControls.start(e)} />
                
                <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${isHorizontal ? 'overflow-x-auto custom-scrollbar flex p-2 gap-1.5' : 'overflow-y-auto overflow-x-hidden custom-scrollbar p-1'}`}>
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
            
            <AnimatePresence>
              {pendingDeathDrop && !isMinimized && (
                <motion.div
                  initial={{ opacity: 0, y: -20, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: -20, x: '-50%' }}
                  className="fixed top-6 left-1/2 z-[1000] pointer-events-none"
                >
                  <div className="px-3.5 py-2 rounded-xl bg-black/85 border border-red-500/40 backdrop-blur-xl flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                    <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 shadow-inner">
                      <AlertTriangle size={18} className="animate-pulse" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-black text-red-400 tracking-widest uppercase leading-none mb-0.5">
                        Death Drop Tracker Active
                      </span>
                      <span className="text-[11px] font-bold text-slate-200 leading-tight">
                        Recover {pendingDeathDrop.quantity.toLocaleString()} Runes in {pendingDeathDrop.zone}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
              {unequippedTools.length > 0 && !isMinimized && (
                <motion.div
                  initial={{ opacity: 0, y: -20, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: -20, x: '-50%' }}
                  className={`fixed ${pendingDeathDrop ? 'top-[75px]' : 'top-6'} left-1/2 z-[1000] pointer-events-none`}
                >
                  <div className="px-3.5 py-2 rounded-xl bg-black/85 border border-amber-500/40 backdrop-blur-xl flex items-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                      <AlertTriangle size={18} className="animate-pulse" />
                    </div>
                    <div className="flex flex-col text-left max-w-[250px] pr-6">
                      <span className="text-[10px] font-black text-amber-400 tracking-widest uppercase leading-none mb-0.5 truncate">
                        Tool in Inventory
                      </span>
                      <span className="text-[10px] font-bold text-slate-300 leading-tight">
                        Equip your {unequippedTools[0]} to prevent losing it on death!
                      </span>
                    </div>
                    <button 
                      onClick={() => setDismissedWarnings(prev => [...prev, unequippedTools[0]])}
                      className="absolute top-1.5 right-1.5 p-1 text-amber-500/50 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-colors"
                      title="Dismiss Warning"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <ErrorBoundary>
              <PoppedOutWindowManager constraintsRef={containerRef} />
            </ErrorBoundary>

            <ErrorBoundary><HUDLayer /></ErrorBoundary>
            <ErrorBoundary><DebugPanel /></ErrorBoundary>
          </>
        )}

        <FloatingWidgetLayer containerRef={containerRef} />
      </div>
      )}

      <ModalLayer />

      {/* ── Minimap Layer — MUST be outside overflow-hidden container ──────────
          AAAMinimap is a floating, independently-positioned widget. Placing it
          inside any overflow:hidden ancestor clips it when the main overlay
          expands. This sibling layer uses overflow:visible and z-60 so the
          minimap is always visible and stays on top of the main overlay (z-50). */}
      {isGameLoaded && mapSettingsEnabled && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          <ErrorBoundary><AAAMinimap /></ErrorBoundary>
        </div>
      )}
    </div>
  );

  return developerMode ? (
    <Profiler id="OverlayContainer" onRender={onRender}>
      {content}
    </Profiler>
  ) : content;
});
