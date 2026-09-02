import React, { useRef, useState, useEffect } from 'react';
import { useTrackerStore, clearAllStorageAndReload } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { motion, useDragControls, useMotionValue, AnimatePresence } from 'motion/react';
import {
  Terminal, Activity, Server, Users, Box, Cpu, Download, Copy, AlertTriangle,
  Map, Network, Database, FileText, MonitorDot, RefreshCw, Trash2
} from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { useTranslation } from '../../hooks/useTranslation';
import { getQueueDiagnostics, resetQueuePeakDepth } from '../../core/parser';
import {
  AreaChart, Area,
  ResponsiveContainer,
} from 'recharts';

const EMPTY_LOGS: any[] = [];
const MAX_HISTORY = 60; // 60s of history

// ── Tab Button ────────────────────────────────────────────────────────────────
const TabBtn: React.FC<{ id: string; label: string; icon: React.ReactNode; active: boolean; badge?: number; onClick: () => void }> =
  ({ id, label, icon, active, badge, onClick }) => (
    <button
      id={id}
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all duration-200 relative shrink-0"
      style={{
        background: active ? 'rgba(34, 197, 94, 0.12)' : 'transparent',
        color: active ? '#4ade80' : '#16a34a',
        border: active ? '1px solid rgba(34,197,94,0.3)' : '1px solid transparent',
      }}
    >
      <span className={active ? 'text-green-400' : 'text-green-700'}>{icon}</span>
      {label}
      {badge != null && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-[7px] flex items-center justify-center text-white font-black">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );

// ── Stat Row ──────────────────────────────────────────────────────────────────
const StatRow: React.FC<{ label: React.ReactNode; value: React.ReactNode; warn?: boolean; crit?: boolean }> =
  ({ label, value, warn, crit }) => (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-[9px]" style={{ color: '#16a34a' }}>{label}</span>
      <span className={`text-[9px] font-bold font-mono ${crit ? 'text-red-400' : warn ? 'text-amber-400' : 'text-green-300'}`}>{value}</span>
    </div>
  );

// ── Divider ───────────────────────────────────────────────────────────────────
const Divider = () => <div className="w-full h-px" style={{ background: 'rgba(34,197,94,0.15)' }} />;

// ── Section Header ────────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ icon: React.ReactNode; label: string }> =
  ({ icon, label }) => (
    <div className="flex items-center gap-2 text-green-400 font-bold mb-1.5">
      <span className="text-green-500">{icon}</span>
      <span className="text-[9px] uppercase tracking-widest">{label}</span>
    </div>
  );

// ── MiniChart ─────────────────────────────────────────────────────────────────
const MiniLineChart: React.FC<{ data: number[]; color: string; label: string; unit?: string }> = ({
  data, color, label, unit = ''
}) => {
  const chartData = data.map((v, i) => ({ t: i, v }));
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-[8px] uppercase tracking-widest" style={{ color: '#16a34a' }}>{label}</span>
        <span className="text-[9px] font-bold font-mono text-green-300">{data[data.length - 1] ?? 0}{unit}</span>
      </div>
      <div style={{ height: 36 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
              fill={`url(#grad-${label})`} dot={false} isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ── DebugPanel v2 ─────────────────────────────────────────────────────────────
export const DebugPanelComponent: React.FC = () => {
  const { t } = useTranslation();
  const { connected, currentZone, sessionActive } = useTrackerStore(useShallow(state => ({ connected: state.connected, currentZone: state.currentZone, sessionActive: state.sessionActive })));

  const isDebugPanelOpen = useSettingsStore(state => state.isDebugPanelOpen);
  const debugStats = useSettingsStore(state => state.debugStats);
  const profilerMetrics = useSettingsStore(state => state.profilerMetrics);
  const overlayPosition = useSettingsStore(state => state.overlayPosition);
  const orbPosition = useSettingsStore(state => state.orbPosition);
  const companionPosition = useSettingsStore(state => state.companionPosition);
  const weaponUISettings = useSettingsStore(state => state.weaponUISettings);
  const armorUISettings = useSettingsStore(state => state.armorUISettings);

  const { playerCount, mobCount } = useTrackerStore(
    useShallow((state: any) => {
      let pCount = 0, mCount = 0;
      if (isDebugPanelOpen && state.enemies) {
        for (const k in state.enemies) {
          if (state.enemies[k].type === 'player') pCount++; else mCount++;
        }
      }
      return { playerCount: pCount, mobCount: mCount };
    })
  );

  const resourceCount = useTrackerStore(state => 
    (isDebugPanelOpen && state.resources) ? Object.keys(state.resources).length : 0
  );
  
  const errorLogs = useTrackerStore(state => 
    isDebugPanelOpen ? (state.errorLogs || EMPTY_LOGS) : EMPTY_LOGS
  );

  const packetCounts = useTrackerStore(state => 
    isDebugPanelOpen ? (state.packetCounts || EMPTY_LOGS) : EMPTY_LOGS // Using EMPTY_LOGS just as a stable fallback for object/array
  );

  const dragControls = useDragControls();
  const panelRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const width = useMotionValue(300);
  const height = useMotionValue(480);

  const [activeTab, setActiveTab] = useState<'system' | 'network' | 'store' | 'logs' | 'map'>('system');
  const [fps, setFps] = useState(0);
  const [ram, setRam] = useState(0);
  const [queueDiag, setQueueDiag] = useState({ currentDepth: 0, peakDepth: 0 });

  // Ring buffers for charts
  const fpsHistory = useRef<number[]>(Array(MAX_HISTORY).fill(0));
  const ramHistory = useRef<number[]>(Array(MAX_HISTORY).fill(0));
  const parseHistory = useRef<number[]>(Array(MAX_HISTORY).fill(0));
  const [, setChartTick] = useState(0); // triggers re-render for ring buffer chart updates

  useEffect(() => {
    if (!isDebugPanelOpen) return;
    resetQueuePeakDepth();
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const update = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        const currentFps = frameCount;
        const mem = (performance as any).memory;
        const currentRam = mem ? Math.round(mem.usedJSHeapSize / 1024 / 1024) : 0;
        // Read profilerMetrics from store directly — NOT from closure to avoid dependency churn
        // (having profilerMetrics in deps caused infinite loop: onRender → updateProfilerMetrics → dep changed → RAF restart → re-render → onRender)
        const currentParse = useSettingsStore.getState().profilerMetrics?.parseTime?.average || 0;

        setFps(currentFps);
        setRam(currentRam);
        setQueueDiag(getQueueDiagnostics());

        fpsHistory.current = [...fpsHistory.current.slice(1), currentFps];
        ramHistory.current = [...ramHistory.current.slice(1), currentRam];
        parseHistory.current = [...parseHistory.current.slice(1), currentParse];
        setChartTick(t => t + 1);

        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  // IMPORTANT: profilerMetrics intentionally excluded — reading from store directly inside RAF to prevent infinite loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDebugPanelOpen]);

  if (!isDebugPanelOpen) return null;

  const getExportData = () => {
    const state = useTrackerStore.getState();
    const settings = useSettingsStore.getState();
    return {
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      appState: {
        layoutMode: settings.layoutMode, theme: settings.theme,
        connected: state.connected, developerMode: settings.developerMode,
        language: settings.language, visualQuality: settings.visualQuality,
      },
      environment: {
        userAgent: navigator.userAgent, screenWidth: window.screen.width,
        screenHeight: window.screen.height, devicePixelRatio: window.devicePixelRatio,
      },
      diagnostics: {
        fps, ram, debugStats: settings.debugStats,
        profilerMetrics: settings.profilerMetrics,
        packetCounts: state.packetCounts, queueDiag,
      },
      gameStateMetrics: {
        currentZone: state.currentZone,
        playersTracked: playerCount, mobsTracked: mobCount,
        resourcesTracked: resourceCount,
        lootTracked: Object.keys(state.loot || {}).length,
        questsTracked: (state.quests || []).length,
        sessionActive: state.sessionActive,
      },
      errorLogs: state.errorLogs,
    };
  };

  const handleExport = () => {
    try {
      const blob = new Blob([JSON.stringify(getExportData(), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `roedex-debug-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) { console.error('Export failed', e); }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(getExportData(), null, 2));
      useSettingsStore.getState().addNotification({ type: 'success', message: 'Debug report copied!', title: 'ROEDEX DEBUG' });
    } catch (e) { console.error('Copy failed', e); }
  };

  const sortedPackets = Object.entries(packetCounts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 8);

  const maxPacket = sortedPackets[0]?.[1] as number || 1;

  return (
    <motion.div
      ref={panelRef}
      drag dragMomentum={false} dragElastic={0.05}
      dragListener={false} dragControls={dragControls}
      initial={{ opacity: 0, scale: 0.96, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 10 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className="fixed bottom-4 right-4 z-[100] rounded-xl overflow-hidden pointer-events-auto flex flex-col"
      style={{
        x, y, width, height, minHeight: 480, minWidth: 280,
        background: 'rgba(0,5,0,0.96)',
        border: '1px solid rgba(34,197,94,0.25)',
        boxShadow: '0 0 40px rgba(34,197,94,0.08), 0 20px 60px rgba(0,0,0,0.8)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-grab active:cursor-grabbing select-none shrink-0"
        style={{ background: 'rgba(34,197,94,0.06)', borderBottom: '1px solid rgba(34,197,94,0.2)' }}
        onPointerDown={e => { e.preventDefault(); dragControls.start(e); }}
      >
        <Terminal size={13} className="text-green-400 shrink-0" />
        <span className="text-green-400 font-black tracking-widest text-[10px] flex-1 uppercase">
          ROEDEX // Debug Console v2
        </span>
        {errorLogs.length > 0 && (
          <div className="flex items-center gap-1 text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded text-[9px]">
            <AlertTriangle size={9} />
            <span className="font-bold">{errorLogs.length}</span>
          </div>
        )}
        <div className={`w-2 h-2 rounded-full shrink-0 ${connected ? 'bg-green-400 shadow-[0_0_6px_#4ade80]' : 'bg-red-400 shadow-[0_0_6px_#f87171]'}`} />
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex gap-1 px-2 py-1.5 shrink-0 overflow-x-auto no-scrollbar" style={{ borderBottom: '1px solid rgba(34,197,94,0.12)' }}>
        <TabBtn id="debug-tab-system" label="System" icon={<Cpu size={9} />} active={activeTab === 'system'} onClick={() => setActiveTab('system')} />
        <TabBtn id="debug-tab-network" label="Network" icon={<Network size={9} />} active={activeTab === 'network'} onClick={() => setActiveTab('network')} />
        <TabBtn id="debug-tab-store" label="Store" icon={<Database size={9} />} active={activeTab === 'store'} onClick={() => setActiveTab('store')} />
        <TabBtn id="debug-tab-logs" label="Logs" icon={<FileText size={9} />} active={activeTab === 'logs'} badge={errorLogs.length} onClick={() => setActiveTab('logs')} />
        <TabBtn id="debug-tab-map" label="Map" icon={<Map size={9} />} active={activeTab === 'map'} onClick={() => setActiveTab('map')} />
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-y-auto p-3 text-[9px] text-green-400/80 font-mono custom-scrollbar">
        <AnimatePresence mode="wait">

          {/* ── SYSTEM TAB ── */}
          {activeTab === 'system' && (
            <motion.div key="system" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }} className="flex flex-col gap-3">
              <MiniLineChart data={fpsHistory.current} color="#4ade80" label="FPS" unit=" fps" />
              <MiniLineChart data={ramHistory.current} color="#38bdf8" label="RAM" unit=" MB" />
              <MiniLineChart data={parseHistory.current} color="#fbbf24" label="Parse Avg" unit=" ms" />
              <Divider />
              <SectionHeader icon={<Cpu size={10} />} label="System" />
              <StatRow label="FPS" value={fps} warn={fps < 30} crit={fps < 15} />
              <StatRow label="RAM" value={ram > 0 ? `${ram} MB` : 'N/A'} warn={ram > 200} crit={ram > 400} />
              <StatRow
                label={<Tooltip content={t('debug.avgParseDuration')}>PARSE AVG</Tooltip>}
                value={`${profilerMetrics?.parseTime?.average || 0} ms`}
                warn={(profilerMetrics?.parseTime?.average || 0) > 2}
                crit={(profilerMetrics?.parseTime?.average || 0) > 5}
              />
              <StatRow
                label={<Tooltip content={t('debug.maxSpikeDuration')}>PARSE MAX</Tooltip>}
                value={`${profilerMetrics?.parseTime?.max || 0} ms`}
                warn={(profilerMetrics?.parseTime?.max || 0) > 5}
                crit={(profilerMetrics?.parseTime?.max || 0) > 15}
              />
              <StatRow
                label="RENDER AVG"
                value={`${profilerMetrics?.renderTime?.average || 0} ms`}
                warn={(profilerMetrics?.renderTime?.average || 0) > 16}
              />
            </motion.div>
          )}

          {/* ── NETWORK TAB ── */}
          {activeTab === 'network' && (
            <motion.div key="network" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }} className="flex flex-col gap-3">
              <SectionHeader icon={<Activity size={10} />} label="Connection" />
              <StatRow
                label={t('debug.socketStatus')}
                value={connected ? (t('debug.active') || 'ACTIVE') : (t('debug.offline') || 'OFFLINE')}
                crit={!connected}
              />
              <StatRow label={t('debug.packetsSec')} value={debugStats.pps} />
              <StatRow
                label={<Tooltip content="Packets dropped before parsing to save CPU">INTERCEPTOR DROPS</Tooltip>}
                value={profilerMetrics?.parseTime?.droppedEvents || 0}
                warn={(profilerMetrics?.parseTime?.droppedEvents || 0) > 100}
              />
              <StatRow
                label={<Tooltip content="Current and peak event queue depth">PARSER BACKLOG</Tooltip>}
                value={`${queueDiag.currentDepth} (PEAK: ${queueDiag.peakDepth})`}
                warn={queueDiag.currentDepth > 20}
                crit={queueDiag.currentDepth > 50}
              />
              <Divider />
              <SectionHeader icon={<MonitorDot size={10} />} label="Event Breakdown" />
              {sortedPackets.length === 0 && (
                <span className="text-[8px] text-green-900 italic">No packets captured yet</span>
              )}
              {sortedPackets.map(([type, count]) => (
                <div key={type} className="flex flex-col gap-0.5">
                  <div className="flex justify-between">
                    <span className="text-[8px] truncate max-w-[170px] text-green-600">{type}</span>
                    <span className="text-green-300 font-bold">{count as number}</span>
                  </div>
                  <div className="w-full h-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${((count as number) / maxPacket) * 100}%`, background: 'rgba(34,197,94,0.5)' }}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* ── STORE TAB ── */}
          {activeTab === 'store' && (
            <motion.div key="store" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }} className="flex flex-col gap-3">
              <SectionHeader icon={<Server size={10} />} label="Game State" />
              <StatRow label={<><Users size={9} className="inline mr-1" />{t('debug.playersInZone') || 'PLAYERS'}</>} value={playerCount} />
              <StatRow label={<><Box size={9} className="inline mr-1" />{t('debug.nodesTracked') || 'NODES'}</>} value={resourceCount} />
              <StatRow label={<><Cpu size={9} className="inline mr-1" />{t('debug.mobsTracked') || 'MOBS'}</>} value={mobCount} />
              <StatRow label="CURRENT ZONE" value={currentZone || '—'} />
              <StatRow label="SESSION ACTIVE" value={sessionActive ? 'YES' : 'NO'} />
              <Divider />
              <SectionHeader icon={<Box size={10} />} label="Overlay Positions" />
              <StatRow label={t('debug.mainOverlay')} value={`X:${Math.round(overlayPosition?.x || 0)} Y:${Math.round(overlayPosition?.y || 0)}`} />
              <StatRow label={t('debug.minimizedOrb')} value={`X:${Math.round(orbPosition?.x || 0)} Y:${Math.round(orbPosition?.y || 0)}`} />
              <StatRow label={t('debug.companion')} value={`X:${Math.round(companionPosition?.x || 0)} Y:${Math.round(companionPosition?.y || 0)}`} />
              <StatRow label={t('debug.weaponUi')} value={`X:${Math.round(weaponUISettings?.customPositionX || 0)} Y:${Math.round(weaponUISettings?.customPositionY || 0)}`} />
              <StatRow label={t('debug.armorUi')} value={`X:${Math.round(armorUISettings?.customPositionX || 0)} Y:${Math.round(armorUISettings?.customPositionY || 0)}`} />
            </motion.div>
          )}

          {/* ── LOGS TAB ── */}
          {activeTab === 'logs' && (
            <motion.div key="logs" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }} className="flex flex-col gap-2">
              <div className="flex justify-between items-center mb-1">
                <SectionHeader icon={<AlertTriangle size={10} />} label={`Error Log (${errorLogs.length})`} />
                <button
                  onClick={() => useTrackerStore.setState({ errorLogs: [] } as any)}
                  className="flex items-center gap-1 text-[8px] text-red-400/60 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={8} /> Clear
                </button>
              </div>
              {errorLogs.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-6" style={{ color: 'rgba(34,197,94,0.3)' }}>
                  <span className="text-2xl">✓</span>
                  <span className="text-[8px] uppercase tracking-widest">No errors captured</span>
                </div>
              )}
              {[...errorLogs].reverse().map((log: any, i: number) => (
                <div key={i} className="rounded-lg p-2 flex flex-col gap-0.5" style={{
                  background: log.severity === 'error' ? 'rgba(239,68,68,0.06)' : 'rgba(251,191,36,0.06)',
                  border: `1px solid ${log.severity === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(251,191,36,0.2)'}`,
                }}>
                  <div className="flex justify-between items-center">
                    <span className={`text-[8px] font-bold uppercase ${log.severity === 'error' ? 'text-red-400' : 'text-amber-400'}`}>
                      {log.severity || 'ERROR'}
                    </span>
                    <span className="text-[7px]" style={{ color: 'rgba(34,197,94,0.4)' }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                    </span>
                  </div>
                  <span className="text-[8px] text-green-400/70 break-all">{log.message || String(log)}</span>
                  {log.stack && (
                    <details className="mt-0.5">
                      <summary className="text-[7px] text-green-800 cursor-pointer">Stack trace</summary>
                      <pre className="text-[6px] text-green-900 mt-0.5 whitespace-pre-wrap break-all">{log.stack}</pre>
                    </details>
                  )}
                </div>
              ))}

              <Divider />
              {/* Bug Report Builder */}
              <SectionHeader icon={<FileText size={10} />} label="Bug Report Builder" />
              <p className="text-[8px] text-green-800">Auto-assembles a structured report with state snapshot, error logs, and system info.</p>
              <div className="flex gap-2 mt-1">
                <button onClick={handleExport} className="flex-1 flex items-center gap-1.5 justify-center px-2 py-1.5 rounded-lg text-[9px] font-bold text-green-400 transition-colors"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <Download size={10} /> Export JSON
                </button>
                <button onClick={handleCopy} className="flex-1 flex items-center gap-1.5 justify-center px-2 py-1.5 rounded-lg text-[9px] font-bold text-blue-400 transition-colors"
                  style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)' }}>
                  <Copy size={10} /> Copy
                </button>
              </div>
            </motion.div>
          )}

          {/* ── MAP TAB ── */}
          {activeTab === 'map' && (
            <motion.div key="map" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }} className="flex flex-col gap-3">
              <SectionHeader icon={<Map size={10} />} label="Map Engine" />
              {(() => {
                const ts = useTrackerStore.getState();
                const zone = ts.currentZone;
                const trail = zone ? ts.trails[zone] : null;
                const trailLen = trail ? trail.length : 0;
                const enemies = Object.values(ts.enemies || {}).filter((e: any) => e.zone === zone).length;
                const resources = Object.values(ts.resources || {}).filter((r: any) => r.zone === zone).length;
                const drops = Object.values(ts.loot || {}).filter((d: any) => d.zone === zone).length;
                const mapSettings = ts.mapSettings;
                return (
                  <>
                    <StatRow label="CURRENT ZONE" value={zone || '—'} />
                    <StatRow label="TRAIL CHARS" value={trailLen} warn={trailLen > 50000} />
                    <StatRow label="ENTITIES ON MAP" value={enemies + resources + drops} />
                    <StatRow label="  ↳ MOBS" value={enemies} />
                    <StatRow label="  ↳ RESOURCES" value={resources} />
                    <StatRow label="  ↳ DROPS" value={drops} />
                    <Divider />
                    <SectionHeader icon={<MonitorDot size={10} />} label="Map Settings State" />
                    <StatRow label="MAP SIZE" value={`${mapSettings.mapSize || 180}px`} />
                    <StatRow label="ZOOM" value={ts.mapZoom?.toFixed(2) || '—'} />
                    <StatRow label="OPACITY" value={mapSettings.opacity?.toFixed(2) || '1.00'} />
                    <StatRow label="BORDERLESS" value={mapSettings.borderless ? 'YES' : 'NO'} />
                    <StatRow label="ICON STYLE" value={mapSettings.iconStyle || 'vector'} />
                    <StatRow label="EDGE GLOW" value={mapSettings.edgeGlow ? 'ON' : 'OFF'} />
                    <StatRow label="CRT GLITCH" value={mapSettings.crtGlitch ? 'ON' : 'OFF'} />
                  </>
                );
              })()}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Footer Actions ── */}
      <div className="shrink-0 p-2.5 flex flex-col gap-1.5" style={{ borderTop: '1px solid rgba(34,197,94,0.15)' }}>
        <div className="flex gap-2">
          <Tooltip content={t('debug.exportDiagnostics')}>
            <button onClick={handleExport}
              className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] font-bold text-green-400 justify-center transition-colors"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
              <Download size={10} /> {t('ui.export')}
            </button>
          </Tooltip>
          <Tooltip content="Copy full diagnostic report">
            <button onClick={handleCopy}
              className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] font-bold text-blue-400 justify-center transition-colors"
              style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)' }}>
              <Copy size={10} /> {t('ui.copyLogs')}
            </button>
          </Tooltip>
        </div>
        <Tooltip content={t('debug.wipeDataWarning')}>
          <button
            onClick={() => {
              if (window.confirm('WARNING! This will WIPE ALL ROEDEX data. Are you absolutely sure?')) {
                useSettingsStore.getState().setFirstTimeWizardCompleted(false);
                useSettingsStore.getState().updateProfilerMetrics({
                  parseTime: { average: 0, max: 0, droppedEvents: 0 },
                  renderTime: { average: 0, lastRender: 0 }
                });
                clearAllStorageAndReload();
              }
            }}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[9px] font-bold text-red-400 justify-center transition-colors"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <RefreshCw size={10} /> {t('ui.factoryReset')}
          </button>
        </Tooltip>
      </div>

      {/* ── Resize Handle ── */}
      <div
        onPointerDown={e => {
          e.stopPropagation(); e.preventDefault();
          const startX = e.clientX, startY = e.clientY;
          const startW = width.get(), startH = height.get();
          const onMove = (me: PointerEvent) => {
            width.set(Math.max(280, startW + (me.clientX - startX)));
            height.set(Math.max(200, startH + (me.clientY - startY)));
          };
          const onUp = () => {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
          };
          document.addEventListener('pointermove', onMove);
          document.addEventListener('pointerup', onUp);
        }}
        className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-[110]"
        style={{ opacity: 0.4 }}
      >
        <svg viewBox="0 0 12 12" fill="none" className="w-full h-full">
          <path d="M11 1L1 11M11 6L6 11M11 11L11 11" stroke="rgba(34,197,94,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </motion.div>
  );
};

export const DebugPanel = React.memo(DebugPanelComponent);
