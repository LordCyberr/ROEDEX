import React from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { motion, useDragControls, useMotionValue } from 'motion/react';
import { Terminal, Activity, Server, Users, Box, Cpu, Download } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

export const DebugPanel: React.FC = () => {
  const { t } = useTranslation();
  const { connected } = useTrackerStore(
    useShallow((state) => ({
      connected: state.connected,
    }))
  );
  
  const { 
    isDebugPanelOpen, 
    debugStats, 
    profilerMetrics,
    overlayPosition,
    orbPosition,
    companionPosition,
    weaponUISettings,
    armorUISettings
  } = useSettingsStore(useShallow((state: any) => ({
      isDebugPanelOpen: state.isDebugPanelOpen,
      debugStats: state.debugStats,
      profilerMetrics: state.profilerMetrics,
      overlayPosition: state.overlayPosition,
      orbPosition: state.orbPosition,
      companionPosition: state.companionPosition,
      weaponUISettings: state.weaponUISettings,
      armorUISettings: state.armorUISettings
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
  const height = useMotionValue(400); // Increased height to fit new section

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
      const settings = useSettingsStore.getState();
      const safeData = {
        timestamp: new Date().toISOString(),
        appState: {
          layoutMode: settings.layoutMode,
          verticalGroupingMode: settings.verticalGroupingMode,
          isMinimized: settings.isMinimized,
          globalScale: settings.globalScale,
          theme: settings.theme,
          connected: state.connected,
          developerMode: settings.developerMode,
          language: settings.language
        },
        diagnostics: {
          fps,
          ram,
          debugStats: settings.debugStats,
          profilerMetrics: settings.profilerMetrics,
          packetCounts: state.packetCounts
        },
        overlaySettings: {
          poppedOutWindows: settings.poppedOutWindows,
          weaponUISettings: settings.weaponUISettings,
          armorUISettings: settings.armorUISettings,
          notificationSettings: settings.notificationSettings,
          tableSettings: settings.tableSettings,
          activeTab: settings.activeTab
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
      style={{ x, y, width, height, minHeight: 400, minWidth: 240 }}
      drag
      dragMomentum={false}
      dragListener={false}
      dragControls={dragControls}
      className="fixed bottom-4 right-4 z-[100] bg-black/90 backdrop-blur-md border border-green-500/30 rounded-lg shadow-[0_0_20px_rgba(34,197,94,0.15)] font-mono text-[10px] uppercase overflow-y-auto pointer-events-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-black/40 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-green-500/30 hover:[&::-webkit-scrollbar-thumb]:bg-green-500/50 [&::-webkit-scrollbar-thumb]:rounded-full"
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
        <span className="text-green-400 font-bold tracking-widest flex-1">ROEDEX // {t('debug.title')}</span>
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-3 text-green-400/80">
        
        {/* Network Stats */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-green-400 font-bold mb-2">
            <Activity size={12} />
            <span>{t('debug.network')}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('debug.socketStatus')}</span>
            <span className={connected ? 'text-green-400' : 'text-red-400'}>{connected ? (t('debug.active') || 'ACTIVE') : (t('debug.offline') || 'OFFLINE')}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('debug.packetsSec')}</span>
            <span className="text-green-300 font-bold">{debugStats.pps}</span>
          </div>
        </div>

        <div className="w-full h-px bg-green-500/20" />

        {/* System Stats */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-green-400 font-bold mb-2">
            <Cpu size={12} />
            <span>{t('debug.systemUsage')}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('debug.fps')}</span>
            <span className="text-green-300 font-bold">{fps}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('debug.ram')}</span>
            <span className="text-green-300 font-bold">{ram > 0 ? `${ram} MB` : 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <Tooltip content={t('debug.avgParseDuration')}><span>{t('debug.parseAvg')}</span></Tooltip>
            <span className={`${(profilerMetrics?.parseTime?.average || 0) > 2 ? 'text-red-400' : 'text-green-300'} font-bold`}>{profilerMetrics?.parseTime?.average || 0} ms</span>
          </div>
          <div className="flex justify-between">
            <Tooltip content={t('debug.maxSpikeDuration')}><span>{t('debug.parseMax')}</span></Tooltip>
            <span className={`${(profilerMetrics?.parseTime?.max || 0) > 5 ? 'text-red-400' : 'text-green-300'} font-bold`}>{profilerMetrics?.parseTime?.max || 0} ms</span>
          </div>
          <div className="flex justify-between">
            <Tooltip content={t('debug.avgRenderDuration')}><span>{t('debug.renderAvg')}</span></Tooltip>
            <span className={`${(profilerMetrics?.renderTime?.average || 0) > 16 ? 'text-red-400' : 'text-green-300'} font-bold`}>{profilerMetrics?.renderTime?.average || 0} ms</span>
          </div>
        </div>

        <div className="w-full h-px bg-green-500/20" />

        {/* State Size Stats */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-green-400 font-bold mb-2">
            <Server size={12} />
            <span>{t('debug.storeMemory')}</span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-1.5"><Users size={10} /> {t('debug.playersInZone') || 'PLAYERS IN ZONE:'}</div>
            <span className="text-green-300 font-bold">{playerCount}</span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-1.5"><Box size={10} /> {t('debug.nodesTracked') || 'NODES TRACKED:'}</div>
            <span className="text-green-300 font-bold">{resourceCount}</span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-1.5"><Cpu size={10} /> {t('debug.mobsTracked') || 'MOBS TRACKED:'}</div>
            <span className="text-green-300 font-bold">{mobCount}</span>
          </div>
        </div>

        <div className="w-full h-px bg-green-500/20" />

        {/* Mock Data Injection */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-green-400 font-bold mb-2">
            <Box size={12} />
            <span>{t('debug.mockUiTests')}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                useSettingsStore.getState().setCurrentNpcDialogue({
                  speaker: 'Tessa',
                  originalText: "I swear...",
                  translatedText: "¡Lo juro, por cada tronco que corto, aparecen dos más detrás de mí. O alguien está haciendo trabajo extra a escondidas... o el bosque está creciendo por despecho!"
                });
                setTimeout(() => useSettingsStore.getState().setCurrentNpcDialogue(null), 6000);
              }}
              className="flex-1 py-1 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/50 rounded text-blue-300 transition-colors text-[9px]"
            >
              {t('debug.spawnTessa') || 'SPAWN TESSA'}
            </button>
            <button
              onClick={() => {
                useSettingsStore.getState().setCurrentNpcDialogue({
                  speaker: 'Finn',
                  originalText: "Shhh...",
                  translatedText: "¡Shhh! Me estoy escondiendo de los demás. ¡Si me encuentran, tendré que ser el limo de nuevo!"
                });
                setTimeout(() => useSettingsStore.getState().setCurrentNpcDialogue(null), 5000);
              }}
              className="flex-1 py-1 bg-purple-500/20 hover:bg-purple-500/40 border border-purple-500/50 rounded text-purple-300 transition-colors text-[9px]"
            >
              {t('debug.spawnFinn') || 'SPAWN FINN'}
            </button>
          </div>
        </div>

        <div className="w-full h-px bg-green-500/20" />

        {/* Overlay Positions */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-green-400 font-bold mb-2">
            <Box size={12} />
            <span>{t('debug.overlayPositions')}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('debug.mainOverlay')}</span>
            <span className="text-green-300 font-bold">X:{Math.round(overlayPosition?.x || 0)} Y:{Math.round(overlayPosition?.y || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('debug.minimizedOrb')}</span>
            <span className="text-green-300 font-bold">X:{Math.round(orbPosition?.x || 0)} Y:{Math.round(orbPosition?.y || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('debug.companion')}</span>
            <span className="text-green-300 font-bold">X:{Math.round(companionPosition?.x || 0)} Y:{Math.round(companionPosition?.y || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('debug.weaponUi')}</span>
            <span className="text-green-300 font-bold">X:{Math.round(weaponUISettings?.customPositionX || 0)} Y:{Math.round(weaponUISettings?.customPositionY || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span>{t('debug.armorUi')}</span>
            <span className="text-green-300 font-bold">X:{Math.round(armorUISettings?.customPositionX || 0)} Y:{Math.round(armorUISettings?.customPositionY || 0)}</span>
          </div>
        </div>

        <div className="w-full h-px bg-green-500/20" />

        {/* Export Data */}
        <div className="flex flex-col gap-2 mt-1">
          <Tooltip content={t('debug.exportDiagnostics')}>
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-500/60 rounded text-green-400 font-bold transition-colors w-full justify-center"
            >
              <Download size={12} />
              <span>{t('debug.exportReport')}</span>
            </button>
          </Tooltip>
          
          <Tooltip content={t('debug.wipeDataWarning')}>
            <button
              onClick={() => {
                if (window.confirm("WARNING! This will WIPE ALL ROEDEX data including settings, custom layouts, and stats! Are you absolutely sure?")) {
                  import('../../store/trackerStore').then(m => m.clearAllStorageAndReload());
                }
              }}
              className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 hover:border-red-500/80 rounded text-red-400 font-bold transition-colors w-full justify-center"
            >
              <Activity size={12} />
              <span>FACTORY RESET</span>
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
import { useTranslation } from '../../hooks/useTranslation'; 
