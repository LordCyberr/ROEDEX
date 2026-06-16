import React from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import { motion, useDragControls, useMotionValue } from 'motion/react';
import { Terminal, Activity, Server, Users, Box, Cpu, Download } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

export const DebugPanel: React.FC = () => {
  const { isDebugPanelOpen, debugStats, connected, profilerMetrics } = useTrackerStore(
    useShallow((state) => ({
      isDebugPanelOpen: state.isDebugPanelOpen,
      debugStats: state.debugStats,
      connected: state.connected,
      profilerMetrics: state.profilerMetrics
    }))
  );

  const playerCount = useTrackerStore(state => Object.keys(state.enemies).filter(k => state.enemies[k].type === 'player').length);
  const mobCount = useTrackerStore(state => Object.keys(state.enemies).filter(k => state.enemies[k].type !== 'player').length);
  const resourceCount = useTrackerStore(state => Object.keys(state.resources).length);

  const dragControls = useDragControls();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const width = useMotionValue(240);
  const height = useMotionValue(300); // Increased height to fit new section

  const [fps, setFps] = React.useState(0);
  const [ram, setRam] = React.useState(0);

  React.useEffect(() => {
    if (!isDebugPanelOpen) return;
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const update = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
        
        const memory = (performance as any).memory;
        if (memory) {
          setRam(Math.round(memory.usedJSHeapSize / 1024 / 1024));
        }
      }
      animationFrameId = requestAnimationFrame(update);
    };
    
    animationFrameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isDebugPanelOpen]);

  if (!isDebugPanelOpen) return null;

  const handleExportData = () => {
    try {
      const state = useTrackerStore.getState();
      const safeData = {
        timestamp: new Date().toISOString(),
        appState: {
          layoutMode: state.layoutMode,
          verticalGroupingMode: state.verticalGroupingMode,
          isMinimized: state.isMinimized,
          globalScale: state.globalScale,
          theme: state.theme,
          connected: state.connected,
          developerMode: state.developerMode,
          language: state.language
        },
        diagnostics: {
          fps,
          ram,
          debugStats: state.debugStats,
          profilerMetrics: state.profilerMetrics,
          packetCounts: state.packetCounts
        },
        overlaySettings: {
          poppedOutWindows: state.poppedOutWindows,
          weaponUISettings: state.weaponUISettings,
          armorUISettings: state.armorUISettings,
          notificationSettings: state.notificationSettings,
          tableSettings: state.tableSettings,
          activeTab: state.activeTab
        },
        gameStateMetrics: {
          currentZone: state.currentZone,
          playersTracked: Object.keys(state.enemies).filter(k => state.enemies[k].type === 'player').length,
          mobsTracked: Object.keys(state.enemies).filter(k => state.enemies[k].type !== 'player').length,
          resourcesTracked: Object.keys(state.resources).length,
          lootTracked: Object.keys(state.loot).length,
          questsTracked: state.quests.length,
          sessionActive: state.sessionActive,
          isChestOpen: state.isChestOpen
        }
      };
      
      const jsonString = JSON.stringify(safeData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `roedex-debug-data-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to export data', e);
    }
  };

  return (
    <motion.div
      ref={panelRef}
      style={{ x, y, width, height, minHeight: 300, minWidth: 240 }}
      drag
      dragMomentum={false}
      dragListener={false}
      dragControls={dragControls}
      className="fixed bottom-4 right-4 z-[100]  bg-black/90 backdrop-blur-md border border-green-500/30 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.15)] font-mono text-[10px] uppercase overflow-hidden pointer-events-auto"
    >
      {/* Header */}
      <div 
        className="flex items-center gap-2 p-2 bg-green-500/10 border-b border-green-500/30 cursor-grab active:cursor-grabbing select-none"
        onPointerDown={(e) => {
          e.preventDefault();
          dragControls.start(e);
        }}
      >
        <Terminal size={14} className="text-green-400" />
        <span className="text-green-400 font-bold tracking-widest flex-1">ROEDEX // DIAGNOSTICS</span>
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-3 text-green-400/80">
        
        {/* Network Stats */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-green-400 font-bold mb-2">
            <Activity size={12} />
            <span>NETWORK</span>
          </div>
          <div className="flex justify-between">
            <span>SOCKET STATUS:</span>
            <span className={connected ? 'text-green-400' : 'text-red-400'}>{connected ? 'ACTIVE' : 'OFFLINE'}</span>
          </div>
          <div className="flex justify-between">
            <span>PACKETS/SEC:</span>
            <span className="text-green-300 font-bold">{debugStats.pps}</span>
          </div>
        </div>

        <div className="w-full h-px bg-green-500/20" />

        {/* System Stats */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-green-400 font-bold mb-2">
            <Cpu size={12} />
            <span>SYSTEM USAGE</span>
          </div>
          <div className="flex justify-between">
            <span>FPS:</span>
            <span className="text-green-300 font-bold">{fps}</span>
          </div>
          <div className="flex justify-between">
            <span>RAM (JS HEAP):</span>
            <span className="text-green-300 font-bold">{ram > 0 ? `${ram} MB` : 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <Tooltip content="Average duration to parse a WebSocket event"><span>PARSE AVG:</span></Tooltip>
            <span className={`${(profilerMetrics?.parseTime?.average || 0) > 2 ? 'text-red-400' : 'text-green-300'} font-bold`}>{profilerMetrics?.parseTime?.average || 0} ms</span>
          </div>
          <div className="flex justify-between">
            <Tooltip content="Max spike duration in parse processing"><span>PARSE MAX:</span></Tooltip>
            <span className={`${(profilerMetrics?.parseTime?.max || 0) > 5 ? 'text-red-400' : 'text-green-300'} font-bold`}>{profilerMetrics?.parseTime?.max || 0} ms</span>
          </div>
          <div className="flex justify-between">
            <Tooltip content="Average duration for main overlay React render"><span>RENDER AVG:</span></Tooltip>
            <span className={`${(profilerMetrics?.renderTime?.average || 0) > 16 ? 'text-red-400' : 'text-green-300'} font-bold`}>{profilerMetrics?.renderTime?.average || 0} ms</span>
          </div>
        </div>

        <div className="w-full h-px bg-green-500/20" />

        {/* State Size Stats */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-green-400 font-bold mb-2">
            <Server size={12} />
            <span>STORE MEMORY</span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-1.5"><Users size={10} /> PLAYERS IN ZONE:</div>
            <span className="text-green-300 font-bold">{playerCount}</span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-1.5"><Box size={10} /> NODES TRACKED:</div>
            <span className="text-green-300 font-bold">{resourceCount}</span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-1.5"><Cpu size={10} /> MOBS TRACKED:</div>
            <span className="text-green-300 font-bold">{mobCount}</span>
          </div>
        </div>

        <div className="w-full h-px bg-green-500/20" />

        {/* Export Data */}
        <div className="flex justify-center mt-1">
          <Tooltip content="Export safe overlay diagnostics (no personal data) to JSON">
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/60 rounded text-green-400 font-bold transition-colors w-full justify-center"
            >
              <Download size={12} />
              <span>EXPORT SAFE DEBUG REPORT</span>
            </button>
          </Tooltip>
        </div>

      </div>
    
      {/* Custom Resize Handle */}
      <div 
        onPointerDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          const startX = e.clientX;
          const startY = e.clientY;
          const startW = width.get();
          const startH = height.get();
          
          const onMove = (me: PointerEvent) => {
            width.set(Math.max(240, startW + (me.clientX - startX)));
            height.set(Math.max(160, startH + (me.clientY - startY)));
          };
          
          const onUp = () => {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
          };
          
          document.addEventListener('pointermove', onMove);
          document.addEventListener('pointerup', onUp);
        }}
        className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-[100]"
      />
    </motion.div>

  );
};
