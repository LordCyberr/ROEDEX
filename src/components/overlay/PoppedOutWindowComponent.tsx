import React from 'react';
import { motion, useMotionValue, useDragControls } from 'motion/react';
import { useTrackerStore, PoppedOutWindow } from '../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import { TrackingView } from '../views/TrackingView';
import { LootView } from '../views/LootView';
import { NPCView } from '../views/NPCView';
import { SettingsView } from '../views/SettingsView';
import { QuestView } from '../views/QuestView';
import { Globe2, Star, PackageOpen, Users, Settings, Minus, X, RefreshCw, ScrollText, Lock, Unlock, User, Activity } from 'lucide-react';

const tabsConfig = [
  { id: 'global', icon: Globe2, label: 'Global Data' },
  { id: 'favorites', icon: Star, label: 'Favorites' },
  { id: 'session', icon: PackageOpen, label: 'Session & Loot' },
  { id: 'npcs', icon: Users, label: 'NPCs & Players' },
  { id: 'quests', icon: ScrollText, label: 'Quests' },
  { id: 'settings', icon: Settings, label: 'Settings' },
  { id: 'session_profile', icon: User, label: 'Profile' },
  { id: 'session_session', icon: Activity, label: 'Session Stats' },
  { id: 'session_chest', icon: PackageOpen, label: 'Chest' }
];

export const PoppedOutWindowComponent = React.memo<{ window: PoppedOutWindow }>(({ window: win }) => {
  const { id, x, y, isMinimized, isLocked } = win;
  const {
    updatePoppedOutWindow, mergeTab,
    activeOpacity, idleOpacity, isUILocked,
    layoutMode, globalScale, tutorialStep
  } = useTrackerStore(useShallow((state) => ({
    updatePoppedOutWindow: state.updatePoppedOutWindow,
    mergeTab: state.mergeTab,
    activeOpacity: state.activeOpacity,
    idleOpacity: state.idleOpacity,
    isUILocked: state.isUILocked,
    layoutMode: state.layoutMode,
    globalScale: state.globalScale,
    tutorialStep: state.notificationSettings.tutorialStep,
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

  const tabConfig = tabsConfig.find(t => t.id === id);
  const Icon = tabConfig?.icon || Globe2;
  const label = tabConfig?.label || 'Tab';

  const renderContent = () => {
    switch (id) {
      case 'global':
      case 'favorites':
        return <TrackingView forcedTab={id} />;
      case 'session': return <LootView />;
      case 'session_profile': return <LootView forcedTab="profile" hideNavigation={true} />;
      case 'session_session': return <LootView forcedTab="session" hideNavigation={true} />;
      case 'session_chest': return <LootView forcedTab="chest" hideNavigation={true} />;
      case 'npcs': return <NPCView />;
      case 'quests': return <QuestView />;
      case 'settings': return <SettingsView />;
      default: return null;
    }
  };



  const dragConstraintsMinimized = React.useMemo(() => ({
    left: 0,
    top: 0,
    right: typeof window !== 'undefined' ? window.innerWidth - 48 : 1000,
    bottom: typeof window !== 'undefined' ? window.innerHeight - 48 : 800
  }), []);

  const dragConstraintsWindow = React.useMemo(() => ({
    left: 0,
    top: 0,
    right: typeof window !== 'undefined' ? window.innerWidth : 1000,
    bottom: typeof window !== 'undefined' ? window.innerHeight : 800
  }), []);

  if (isMinimized) {
    return (
      <motion.div
        key={`minimized-${id}`}
        style={{ x: motionX, y: motionY }}
        drag
        dragConstraints={dragConstraintsMinimized}
        dragMomentum={false}
        onDragEnd={() => {
          updatePoppedOutWindow(id, { x: motionX.get(), y: motionY.get() });
        }}
        className={`absolute top-0 left-0 ${effectiveLock ? 'pointer-events-none' : 'pointer-events-auto'} z-50 flex flex-col items-center gap-1 group`}
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
      key={`window-${id}`}
      ref={windowRef}
      onPointerDownCapture={() => {
        updatePoppedOutWindow(id, { zIndex: Date.now() % 2000000000 });
      }}
      style={{
        x: motionX,
        y: motionY,
        width: windowWidth,
        height: windowHeight,
        zIndex: win.zIndex || 40,
        '--idle-opacity': tutorialStep > 0 ? 1.0 : idleOpacity,
        '--active-opacity': tutorialStep > 0 ? 1.0 : activeOpacity,
        zoom: globalScale || 1,
      } as any}
      drag={!effectiveLock}
      dragControls={dragControls}
      dragConstraints={dragConstraintsWindow}
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
        bg-[var(--bg-base)]/95 flex-col min-h-[150px] min-w-[220px]
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
          <span className="text-[11px] font-bold tracking-wider uppercase">{label}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              windowWidth.set(defaultWidth);
              windowHeight.set('auto');
              updatePoppedOutWindow(id, { width: defaultWidth === 'auto' ? undefined : defaultWidth, height: undefined });
            }}
            title="Reset Size"
            className="p-1 rounded hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-colors"
          >
            <RefreshCw size={12} />
          </button>
          <button
            onClick={() => updatePoppedOutWindow(id, { isLocked: !effectiveLock })}
            title={effectiveLock ? "Unlock Window" : "Lock Window"}
            className={`p-1 rounded transition-colors ${effectiveLock ? 'text-amber-400 hover:text-amber-300' : 'text-[var(--text-muted)] hover:text-white hover:bg-white/10'}`}
          >
            {effectiveLock ? <Lock size={12} /> : <Unlock size={12} />}
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

      <div className={`flex-1 min-h-0 flex flex-col overflow-y-auto custom-scrollbar ${isHorizontal ? 'p-2 gap-1.5' : 'p-1'} ${effectiveLock ? 'pointer-events-none' : 'pointer-events-auto'}`}>
        {renderContent()}
      </div>

      {/* Custom Resize Handle */}
      {!effectiveLock && (
        <div
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            const startX = e.clientX;
            const startY = e.clientY;
            
            // If the value was 'auto', we need to read the actual computed pixel size to start resizing
            const rect = windowRef.current?.getBoundingClientRect();
            const startW = rect?.width || (typeof windowWidth.get() === 'number' ? windowWidth.get() as number : (typeof defaultWidth === 'number' ? defaultWidth : 600));
            const startH = rect?.height || (typeof windowHeight.get() === 'number' ? windowHeight.get() as number : (typeof defaultHeight === 'number' ? defaultHeight : 350));

            const onMove = (me: PointerEvent) => {
              windowWidth.set(Math.max(200, startW + (me.clientX - startX)));
              windowHeight.set(Math.max(150, startH + (me.clientY - startY)));
            };

            const onUp = () => {
              document.removeEventListener('pointermove', onMove);
              document.removeEventListener('pointerup', onUp);
              const w = windowWidth.get();
              const h = windowHeight.get();
              updatePoppedOutWindow(id, { 
                width: typeof w === 'number' ? w : undefined, 
                height: typeof h === 'number' ? h : undefined 
              });
            };

            document.addEventListener('pointermove', onMove);
            document.addEventListener('pointerup', onUp);
          }}
          className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize flex items-center justify-center opacity-30 hover:opacity-70 transition-opacity pointer-events-auto"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="text-[var(--text-muted)]">
            <circle cx="8" cy="8" r="1.2" />
            <circle cx="5" cy="8" r="1.2" />
            <circle cx="8" cy="5" r="1.2" />
          </svg>
        </div>
      )}
    </motion.div>
  );
});

PoppedOutWindowComponent.displayName = 'PoppedOutWindowComponent';
