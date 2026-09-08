/**
 * AAAMinimap.tsx — Circular AAA Minimap matching concept design
 *
 * Layout matches concept image exactly:
 *  - Circular clipPath with thick cyan glow ring (multi-layer)
 *  - Dark bezel between ring and map content
 *  - Large zone pill overlapping top of circle
 *  - "X% Discovered" bar inside circle at top
 *  - Full compass rose (N/NW/NE/W/E/SW/SE/S) inside at top-right
 *  - +/- zoom buttons floating outside circle at right
 *  - Cardinal direction arrows at 3/6/9/12 o'clock on ring
 *  - All engine features: fog-of-war, torch rays, rarity icons, pathfinding
 *
 * v2 fixes:
 *  - Toggle bug fixed: isOn resolver uses proper defaults
 *  - Player arrow removed (no WASD detection possible in MV3) — pulsing dot
 *  - Resize handles added for square/rectangle shapes
 *  - Buttons hover-only + smart edge-aware placement
 *  - Fullscreen HUD: zone tabs + ESC + coord display
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTrackerStore } from '../../store/trackerStore';
import { AAAMapEngine } from '../../core/map/AAAMapEngine';
import { MapCompressor } from '../../core/map/MapCompressor';
import { MapDiscoveryTracker } from '../../core/map/MapDiscoveryTracker';
import { Point } from '../../store/types';
import { Settings, ZoomIn, ZoomOut, Maximize, Minimize, Lock, Unlock, Target, Move, Map } from 'lucide-react';
import { motion, useDragControls, useMotionValue, AnimatePresence } from 'motion/react';
import { Tooltip } from '../ui/Tooltip';
import { useTranslation } from '../../hooks/useTranslation';
import { STATIC_ENTRANCES } from '../../data/staticEntrances';
import { PathfinderService } from '../../core/pathfinding/PathfinderService';
import { getStaticSpawnsForZone, loadStaticSpawns } from '../../data/staticSpawnIndex';
import { FullscreenZoneTabs, FullscreenLegend, CompassRose } from './MinimapOverlays';
import { HoverTooltip } from './MinimapHoverTooltip';
import { AAAMapSettingsPanel } from './MinimapSettingsPanel';

let COMMUNITY_MAPS: any = null;
const communityTrailsCache: Record<string, Point[]> = {};

function getCommunityTrail(zone: string): Point[] {
  if (!zone) return [];
  const lowerZone = zone.toLowerCase();
  let matchKey: keyof typeof COMMUNITY_MAPS | null = null;
  
  if (lowerZone.includes('lower')) matchKey = 'minesLower';
  else if (lowerZone.includes('mines')) matchKey = 'mines';
  else if (lowerZone.includes('forest')) matchKey = 'forest';
  else if (lowerZone.includes('maze')) matchKey = 'maze';

  if (!COMMUNITY_MAPS) return [];
  if (!matchKey) {
    console.warn(`[AAAMinimap] getCommunityTrail: No community map key matched for zone: "${zone}"`);
    return [];
  }
  if (!communityTrailsCache[zone]) {
    communityTrailsCache[zone] = MapCompressor.unpackTrail(COMMUNITY_MAPS[matchKey].trail);
  }
  return communityTrailsCache[zone];
}

// ── Main Component ─────────────────────────────────────────────────────────────
export const AAAMinimap: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const canvasRef         = useRef<HTMLCanvasElement>(null);
  const engineRef         = useRef<AAAMapEngine | null>(null);
  const dragControls      = useDragControls();
  const coordElRef        = useRef<HTMLDivElement>(null);
  const lastTrailRef      = useRef<{ str: string; points: Point[] }>({ str: '', points: [] });
  const lastPathRef       = useRef<{ pos: Point | null; wp: Point | null }>({ pos: null, wp: null });
  const viewZoneRef       = useRef<string | null>(null);
  const entityCacheRef    = useRef<{
    enemies: any; resources: any; timers: any; drops: any; activeZone: string | null;
    cachedEnemies: any[]; cachedResources: any[]; cachedTimers: any[]; cachedEntries: any[]; cachedDrops: any[];
    mergedEnemies: any[]; mergedResources: any[];
  }>({ enemies: null, resources: null, timers: null, drops: null, activeZone: null, cachedEnemies: [], cachedResources: [], cachedTimers: [], cachedEntries: [], cachedDrops: [], mergedEnemies: [], mergedResources: [] });
  const pointerDownTime     = useRef<number>(0);
  const lastMousePos        = useRef<{ x: number; y: number } | null>(null);
  const lastClickedWpKey    = useRef<string | null>(null);
  const zoomTimeoutRef      = useRef<any>(null);
  const discoveryThrottleRef = useRef<number>(0);
  // Static spawn cache — reloaded on zone change
  const staticSpawnCacheRef = useRef<{ zone: string; resources: any[]; enemies: any[] }>(
    { zone: '', resources: [], enemies: [] }
  );

  const mapSettings = useTrackerStore(useShallow(s => s.mapSettings));

  useEffect(() => {
    async function loadData() {
      try {
        await loadStaticSpawns();
        if (!COMMUNITY_MAPS) {
          const res = await fetch('/maps.json');
          if (res.ok) {
            COMMUNITY_MAPS = await res.json();
          }
        }
      } catch (e) {
        console.error('[AAAMinimap] Failed to load map data:', e);
      }
    }
    loadData();
  }, []);

  const {
    zone, pan, zoom,
    setMapPan, setMapZoom,
    isRecordingTrail, setIsRecordingTrail,
    isEraserMode,
    eraseTrailPoints, setActiveWaypoint, updateMapSettings,
  } = useTrackerStore(useShallow(state => ({
    zone:                state.currentZone,
    pan:                 state.mapPan,
    zoom:                state.mapZoom,
    setMapPan:           state.setMapPan,
    setMapZoom:          state.setMapZoom,
    isRecordingTrail:    state.isRecordingTrail,
    setIsRecordingTrail: state.setIsRecordingTrail,
    isEraserMode:        state.isEraserMode,
    eraseTrailPoints:    state.eraseTrailPoints,
    setActiveWaypoint:   state.setActiveWaypoint,
    updateMapSettings:   state.updateMapSettings,
  })));

  // Shape-aware sizing: circle/square use mapSize, rectangle uses mapWidth x mapHeight
  const mapShape = mapSettings.mapShape || 'circle';
  const safeMapSize = typeof mapSettings.mapSize === 'number' && !isNaN(mapSettings.mapSize)
    ? Math.max(150, mapSettings.mapSize) : 220;
  const safeMapW = mapShape === 'rectangle'
    ? Math.max(150, mapSettings.mapWidth  ?? safeMapSize)
    : safeMapSize;
  const safeMapH = mapShape === 'rectangle'
    ? Math.max(120, mapSettings.mapHeight ?? safeMapSize)
    : safeMapSize;

  const mapWidthMotion  = useMotionValue(safeMapW);
  const mapHeightMotion = useMotionValue(safeMapH);
  // Keep legacy mapSizeMotion in sync for circle/square
  const mapSizeMotion   = useMotionValue(safeMapSize);

  const safeMapX = typeof mapSettings.mapPosition?.x === 'number' && !isNaN(mapSettings.mapPosition.x) ? mapSettings.mapPosition.x : 0;
  const safeMapY = typeof mapSettings.mapPosition?.y === 'number' && !isNaN(mapSettings.mapPosition.y) ? mapSettings.mapPosition.y : 0;
  const dragX = useMotionValue(safeMapX);
  const dragY = useMotionValue(safeMapY);

  const [isFullScreen, setIsFullScreen]         = useState(false);
  const [showSettings, setShowSettings]         = useState(false);
  const [viewZone, setViewZone]                 = useState<string | null>(zone);
  const [isLockedToPlayer, setIsLockedToPlayer] = useState(true);
  const [hoveredEntity, setHoveredEntity]       = useState<any>(null);
  const [liveTimers, setLiveTimers]             = useState<Record<string, any>>(useTrackerStore.getState().timers);
  // BUG-MINI-08: keep a ref so the 1s interval doesn't capture stale closures
  const liveTimersRef = useRef(liveTimers);
  const [isDragging, setIsDragging]             = useState(false);
  const [discoveryPct, setDiscoveryPct]         = useState(0);
  // hover-show HUD state
  const [isHudVisible, setIsHudVisible]         = useState(false);

  // BUG-MINI-08: Update liveTimers at 1 FPS — only used in HoverTooltip on hover, not in render loop.
  useEffect(() => {
    const id = setInterval(() => {
      const t = useTrackerStore.getState().timers;
      if (t !== liveTimersRef.current) {
        liveTimersRef.current = t;
        setLiveTimers(t);
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { viewZoneRef.current = viewZone; }, [viewZone]);

  useEffect(() => {
    if (!isFullScreen && zone) setViewZone(zone);
  }, [zone, isFullScreen]);

  useEffect(() => {
    mapWidthMotion.set(safeMapW);
    mapHeightMotion.set(safeMapH);
    mapSizeMotion.set(safeMapSize);
  }, [safeMapW, safeMapH, safeMapSize]);

  useEffect(() => {
    const handleResize = () => {
      if (!engineRef.current) return;
      if (isFullScreen) {
        engineRef.current.resize(window.innerWidth, window.innerHeight);
      } else {
        engineRef.current.resize(safeMapW, safeMapH);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullScreen, safeMapW, safeMapH]);

  useEffect(() => {
    setMapPan({ x: 0, y: 0 });
    setMapZoom(1);
    if (engineRef.current) {
      engineRef.current.updateState({ pan: { x: 0, y: 0 }, zoom: 1 });
    }
  }, [isFullScreen, setMapPan, setMapZoom]);

  // ESC key exits fullscreen
  useEffect(() => {
    if (!isFullScreen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsFullScreen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFullScreen]);

  // 8-way resize for square and rectangle shapes
  const handle8WayResize = useCallback((e: React.PointerEvent, dir: string) => {
    e.stopPropagation(); e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const startW = mapWidthMotion.get();
    const startH = mapHeightMotion.get();
    const startDX = dragX.get();
    const startDY = dragY.get();
    const isUniform = mapShape !== 'rectangle'; // circle/square keep w===h

    const onMove = (me: PointerEvent) => {
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;
      let newW = startW, newH = startH;
      let newDX = startDX, newDY = startDY;

      if (dir.includes('e')) newW = Math.max(150, Math.min(800, startW + dx));
      if (dir.includes('w')) { newW = Math.max(150, Math.min(800, startW - dx)); newDX = startDX + (startW - newW); }
      if (dir.includes('s')) newH = Math.max(120, Math.min(800, startH + dy));
      if (dir.includes('n')) { newH = Math.max(120, Math.min(800, startH - dy)); newDY = startDY + (startH - newH); }

      if (isUniform) { const s = Math.max(newW, newH); newW = s; newH = s; }

      mapWidthMotion.set(newW); mapHeightMotion.set(newH);
      mapSizeMotion.set(Math.max(newW, newH));
      dragX.set(newDX); dragY.set(newDY);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      const w = mapWidthMotion.get(), h = mapHeightMotion.get();
      updateMapSettings({
        mapWidth: w, mapHeight: h,
        mapSize: Math.max(w, h),
        mapPosition: { x: dragX.get(), y: dragY.get() }
      });
      if (engineRef.current) engineRef.current.resize(w, h);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [mapShape, mapWidthMotion, mapHeightMotion, mapSizeMotion, dragX, dragY, updateMapSettings]);


  // Engine init
  useEffect(() => {
    if (!canvasRef.current || engineRef.current || !mapSettings.enabled) return;
    engineRef.current = new AAAMapEngine({
      canvas: canvasRef.current,
      onHoverMarker: (info) => {
        setHoveredEntity((prev: any) => {
          if (!prev && !info) return prev;
          if (prev && info && prev.id === info.id) return prev;
          return info;
        });
      },
    });
    engineRef.current.start();
    return () => { engineRef.current?.destroy(); engineRef.current = null; };
  }, [mapSettings.enabled]);

  // BUG-01 compliant store subscription
  useEffect(() => {
    if (!engineRef.current) return;
    const sync = (state: any) => {
      if (!engineRef.current) return;

      if (state.playerPosition && coordElRef.current) {
        coordElRef.current.textContent = `${state.playerPosition.x.toFixed(1)}, ${state.playerPosition.y.toFixed(1)}`;
      }

      const activeZone = viewZoneRef.current || state.currentZone;
      // BUG-MINI-08: timers updated by 1s interval, not on every player move
      const isCurrentZone = activeZone === state.currentZone;

      let decodedTrail: Point[] = [];
      if (activeZone && state.trails[activeZone]) {
        const trailStr = state.trails[activeZone];
        if (lastTrailRef.current.str !== trailStr) {
          lastTrailRef.current.str = trailStr;
          lastTrailRef.current.points = MapCompressor.unpackTrail(trailStr);
        }
        decodedTrail = lastTrailRef.current.points;
      }

      let forceMerge = false;
      const cache = entityCacheRef.current;
      if (cache.enemies !== state.enemies || cache.activeZone !== activeZone) {
        cache.enemies = state.enemies;
        cache.cachedEnemies = isCurrentZone ? Object.values(state.enemies || {}).filter((e: any) => e.zone === activeZone) : [];
        forceMerge = true;
      }
      if (cache.resources !== state.resources || cache.activeZone !== activeZone) {
        cache.resources = state.resources;
        cache.cachedResources = isCurrentZone ? Object.values(state.resources || {}).filter((r: any) => r.zone === activeZone) : [];
        forceMerge = true;
      }
      if (cache.timers !== state.timers || cache.activeZone !== activeZone) {
        cache.timers = state.timers;
        cache.cachedTimers = Object.values(state.timers || {}).filter((t: any) => t.zone === activeZone);
      }
      if (cache.drops !== state.loot || cache.activeZone !== activeZone) {
        cache.drops = state.loot;
        cache.cachedDrops = isCurrentZone ? Object.values(state.loot || {}).filter((d: any) => d.zone === activeZone) : [];
      }
      if (cache.activeZone !== activeZone) {
        cache.cachedEntries = STATIC_ENTRANCES.filter((e: any) => e.zone === activeZone);
      }
      cache.activeZone = activeZone;

      // ── Static spawn data (mrsnorch ROE Tracker map) ──────────────────────
      // Reload only when zone changes — these are static background markers
      if (staticSpawnCacheRef.current.zone !== activeZone) {
        const staticData = getStaticSpawnsForZone(activeZone || '');
        // Shape static resources to match live entity format
        staticSpawnCacheRef.current = {
          zone: activeZone || '',
          resources: staticData.resources.map((s, i) => ({
            pos:         { x: s.x, y: s.y },
            resource:    s.statsKey,
            type:        s.type,
            zone:        activeZone,
            entityIndex: `static-res-${i}`,
            gathered:    false,
            isStatic:    true,
            spawnCategory: s.spawnCategory,
          })),
          enemies: staticData.enemies.map((s, i) => ({
            pos:         { x: s.x, y: s.y },
            statsKey:    s.statsKey,
            type:        s.type,
            zone:        activeZone,
            entityIndex: `static-mob-${i}`,
            isDead:      false,
            isStatic:    true,
          })),
        };
        forceMerge = true;
      }

      if (forceMerge) {
        cache.mergedEnemies = [...staticSpawnCacheRef.current.enemies, ...cache.cachedEnemies];
        cache.mergedResources = [...staticSpawnCacheRef.current.resources, ...cache.cachedResources];
      }

      // Discovery % throttle
      const now = Date.now();
      let discoveryPercent = engineRef.current.state.discoveryPercent;
      if (now - discoveryThrottleRef.current > 1200) {
        discoveryPercent = MapDiscoveryTracker.compute(decodedTrail, activeZone || '');
        discoveryThrottleRef.current = now;
        setDiscoveryPct(discoveryPercent);
      }

      engineRef.current.updateState({
        isFullScreen,
        playerPos:    isCurrentZone ? state.playerPosition : null,
        zone:         activeZone,
        communityTrail: activeZone ? getCommunityTrail(activeZone) : undefined,
        showCommon:   state.mapSettings.showCommon !== false,
        showUncommon: state.mapSettings.showUncommon !== false,
        showRare:     state.mapSettings.showRare !== false,
        showMythical: state.mapSettings.showMythical !== false,
        showOres:     state.mapSettings.showOres !== false,
        showTrees:    state.mapSettings.showTrees !== false,
        showPlants:   state.mapSettings.showPlants !== false,
        showMobs:     state.mapSettings.showMobs !== false,
        showDrops:    state.mapSettings.showDrops !== false,
        showPortals:  state.mapSettings.showPortals !== false,
        dimmedOpacity:  state.mapSettings.dimmedOpacity ?? 0.3,
        customColors:   state.mapSettings.customColors || {},
        fogOfWar:           state.mapSettings.fogOfWar ?? true,
        showDiscoveryBar:   state.mapSettings.showDiscoveryBar ?? true,
        discoveryBeam:      state.mapSettings.discoveryBeam ?? true,
        showOffScreenRadar: state.mapSettings.showOffScreenRadar ?? true,
        radarMinRarity:     state.mapSettings.radarMinRarity || 'rare',
        trailColor:         state.mapSettings.trailColor || '#facc15',
        trailGradient:      state.mapSettings.trailGradient ?? true,
        showGrid:           state.mapSettings.showGrid ?? false,
        mapShape:           state.mapSettings.shape || 'circle',
        discoveryPercent,
        trail:    decodedTrail,
        entries:  cache.cachedEntries,
        // Merge live entities with static background spawns (static rendered dimmer by engine)
        enemies:  cache.mergedEnemies,
        resources: cache.mergedResources,
        timers:   cache.cachedTimers,
        drops:    cache.cachedDrops,
        death:    state.deathSpot,
        activeWaypoint: state.activeWaypointZone === activeZone ? state.activeWaypoint : null,
      });

      // Pathfinding
      let wp = state.activeWaypointZone === activeZone ? state.activeWaypoint : null;
      const playerPos = isCurrentZone ? state.playerPosition : null;
      if (!wp && state.activeWaypoint && playerPos && state.activeWaypointZone !== activeZone) {
        const portals = STATIC_ENTRANCES.filter((e: any) => e.zone === activeZone && e.toZone === state.activeWaypointZone);
        if (portals.length > 0) {
          let closest = portals[0], minD = Infinity;
          for (const p of portals) {
            const d = Math.hypot(p.x - playerPos.x, p.y - playerPos.y);
            if (d < minD) { minD = d; closest = p; }
          }
          wp = { x: closest.x, y: closest.y, timestamp: 0 };
        }
      }
      if (wp && playerPos) {
        const last = lastPathRef.current;
        const dist = last.pos ? Math.hypot(playerPos.x - last.pos.x, playerPos.y - last.pos.y) : Infinity;
        const wpChanged = !last.wp || last.wp.x !== wp.x || last.wp.y !== wp.y;
        if (wpChanged || dist > 5) {
          lastPathRef.current = { pos: { ...playerPos }, wp: { ...wp } };
          PathfinderService.generatePath(playerPos, wp, state.trails[activeZone] || '').then(path => {
            if (engineRef.current) engineRef.current.updateState({ activePath: path });
          });
        }
      } else if (lastPathRef.current.wp || lastPathRef.current.pos) {
        lastPathRef.current = { pos: null, wp: null };
        engineRef.current.updateState({ activePath: undefined });
      }
    };

    sync(useTrackerStore.getState());
    const unsub = useTrackerStore.subscribe(sync);
    return () => unsub();
  }, [viewZone, isFullScreen]);

  useEffect(() => {
    if (engineRef.current) engineRef.current.updateState({ pan, zoom });
  }, [pan, zoom]);

  // Canvas pointer events
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    pointerDownTime.current = Date.now();
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (engineRef.current && canvasRef.current) {
      const r = canvasRef.current.getBoundingClientRect();
      engineRef.current.setHover(
        (e.clientX - r.left) * (canvasRef.current.width / r.width),
        (e.clientY - r.top)  * (canvasRef.current.height / r.height),
      );
    }
    if (!isDragging || !lastMousePos.current || !engineRef.current || !canvasRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    const dx = (e.clientX - lastMousePos.current.x) * (canvasRef.current.width / r.width);
    const dy = (e.clientY - lastMousePos.current.y) * (canvasRef.current.height / r.height);
    if (isLockedToPlayer) setIsLockedToPlayer(false);
    engineRef.current.panByPixels(dx, dy, canvasRef.current.width, canvasRef.current.height);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const elapsed = Date.now() - pointerDownTime.current;
    if (isDragging && engineRef.current) {
      setMapPan(engineRef.current.state.pan);
      engineRef.current.updateState({ isDragging: false });
    }
    setIsDragging(false);
    lastMousePos.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (elapsed > 250 || isEraserMode || e.button !== 0) return;

    if (hoveredEntity) {
      const st = useTrackerStore.getState();
      let pos: { x: number; y: number } | null = null;
      if (hoveredEntity.id?.includes('static')) {
        const parts = hoveredEntity.id.split('-');
        const idx = parseInt(parts[parts.length - 1] || '', 10);
        if (!isNaN(idx)) {
          if (hoveredEntity.type === 'mob') {
            const matched = staticSpawnCacheRef.current.enemies[idx];
            if (matched) pos = matched.pos;
          } else if (hoveredEntity.type === 'resource') {
            const matched = staticSpawnCacheRef.current.resources[idx];
            if (matched) pos = matched.pos;
          }
        }
      } else if (hoveredEntity.type === 'mob') {
        const enemy = st.enemies[`${st.currentZone}-${hoveredEntity.id?.split('-').pop()}`];
        if (enemy) pos = enemy.pos;
      } else if (hoveredEntity.type === 'resource') {
        const res = st.resources[`${st.currentZone}-${hoveredEntity.id?.split('-').pop()}`];
        if (res) pos = res.pos;
      } else if (hoveredEntity.type === 'entrance') {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect && engineRef.current) pos = engineRef.current.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
      }
      if (pos) {
        const wpKey = `${viewZone || zone}|${Math.round((pos as any).x)}|${Math.round((pos as any).y)}`;
        if (lastClickedWpKey.current === wpKey && useTrackerStore.getState().activeWaypoint) {
          setActiveWaypoint(null, null); lastClickedWpKey.current = null;
        } else {
          setActiveWaypoint(pos as any, hoveredEntity.name, viewZone || zone);
          lastClickedWpKey.current = wpKey;
        }
      }
    } else {
      if (useTrackerStore.getState().activeWaypoint) { setActiveWaypoint(null, null); lastClickedWpKey.current = null; }
    }
  };

  const handlePointerLeave = () => { engineRef.current?.setHover(-1, -1); setHoveredEntity(null); };

  const handleWheel = (e: React.WheelEvent) => {
    if (!engineRef.current) return;
    const nz = Math.max(0.1, Math.min(8, engineRef.current.state.zoom * (e.deltaY > 0 ? 0.9 : 1.1)));
    engineRef.current.updateState({ zoom: nz });
    if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
    zoomTimeoutRef.current = setTimeout(() => setMapZoom(nz), 500);
  };

  const handleEraserClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!engineRef.current || !canvasRef.current || !isEraserMode || isDragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const wp = engineRef.current.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    if (wp) eraseTrailPoints(viewZone || zone || '', wp, 8);
  };

  if (!mapSettings.enabled) return null;

  // ── Layout constants ──────────────────────────────────────────────────────
  const mapSize      = safeMapSize;
  const canvasSize   = mapSize;

  // Glow color driven by state
  const isRecording  = isRecordingTrail;
  const glowColor    = isEraserMode ? '#ef4444'
    : isRecording    ? '#f87171'
    : '#38bdf8';

  const showCompass = mapSettings.showCompass !== false;
  const compassSize = Math.round(mapSize * 0.28);

  const isSquare   = !isFullScreen && !!mapSettings.borderless;
  // Suppress lint – isSquare still used for legacy shape fallback checks
  void isSquare;

  const clipRadius = isFullScreen ? '0'
    : mapShape === 'circle'    ? '50%'
    : mapShape === 'rectangle' ? '7px'
    : '10px'; // square

  return (
    <>
      {/* CSS animations */}
      <style>{`
        @keyframes aaa-ring-pulse {
          0%, 100% {
            box-shadow: 0 0 6px rgba(56,189,248,0.5),
                        inset 0 0 3px rgba(56,189,248,0.2);
          }
          50% {
            box-shadow: 0 0 10px rgba(56,189,248,0.8),
                        inset 0 0 5px rgba(56,189,248,0.35);
          }
        }
        #aaa-ring-element {
          animation: aaa-ring-pulse 2.6s ease-in-out infinite;
        }
        .fullscreen-zone-tab {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fullscreen-zone-tab:hover {
          color: #38bdf8 !important;
          background: rgba(56, 189, 248, 0.1) !important;
          border-color: rgba(56, 189, 248, 0.3) !important;
          transform: translateY(-1px) scale(1.03);
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.15);
        }
        .fullscreen-zone-tab:active {
          transform: translateY(0) scale(0.98);
        }
      `}</style>

      {/* Root container — OUTSIDE the ring for overflow:visible glow bleed */}
      <motion.div
        id="aaa-minimap-root"
        className="fixed z-30 pointer-events-auto"
        style={{
          x: isFullScreen ? 0 : dragX,
          y: isFullScreen ? 0 : dragY,
          width:  isFullScreen ? '100vw'  : (mapShape === 'rectangle' ? mapWidthMotion  : mapSize),
          height: isFullScreen ? '100vh'  : (mapShape === 'rectangle' ? mapHeightMotion : mapSize),
          top:  isFullScreen ? 0 : undefined,
          left: isFullScreen ? 0 : undefined,
          opacity: mapSettings.opacity ?? 1,
          overflow: 'visible',
        }}
        drag={!isFullScreen}
        dragMomentum={false}
        dragListener={false}
        dragControls={dragControls}
        onDragEnd={() => updateMapSettings({ mapPosition: { x: dragX.get(), y: dragY.get() } })}
        onPointerEnter={() => setIsHudVisible(true)}
        onPointerLeave={() => setIsHudVisible(false)}
      >
        {/* ── Outer SVG glow ring removed ── */}
        {/* ── Dark bezel ring removed ── */}

        {/* ── Canvas container (clipped to circle/square, inset from ring) ── */}
        <div
          className={`absolute ${isEraserMode ? 'cursor-crosshair' : 'cursor-move'}`}
          style={{
            inset: 0,
            borderRadius: isFullScreen ? 0 : clipRadius,
            overflow: 'hidden',
          }}
          onClick={handleEraserClick}
        >
          <canvas
            ref={canvasRef}
            width={isFullScreen ? window.innerWidth : canvasSize}
            height={isFullScreen ? window.innerHeight : canvasSize}
            style={{ width: '100%', height: '100%', display: 'block' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            onWheel={handleWheel}
          />

          {/* ── HUD inside the circle ── */}
          <div className="absolute inset-0 pointer-events-none z-10">

            {/* Discovery bar — top center inside circle */}
            {mapSettings.showDiscoveryBar !== false && !isFullScreen && (
              <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                style={{ top: Math.round(canvasSize * 0.06) }}>
                <div className="flex flex-col items-center gap-0.5"
                  style={{
                    background: 'rgba(4,10,28,0.75)',
                    border: '1px solid rgba(56,189,248,0.2)',
                    borderRadius: 20,
                    padding: '3px 10px 4px',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
                    minWidth: Math.round(canvasSize * 0.58),
                  }}>
                  <span className="text-[8px] font-black tracking-wider text-slate-300/80 whitespace-nowrap">
                    {discoveryPct.toFixed(0)}% {t('minimap.discovered')}
                  </span>
                  <div className="w-full rounded-full overflow-hidden" style={{ height: 3, background: 'rgba(255,255,255,0.08)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${discoveryPct}%`,
                        background: 'linear-gradient(90deg, #22c55e, #4ade80)',
                        boxShadow: '0 0 6px rgba(74,222,128,0.8)',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Scale Ruler Bar (~50m) matching Concept Image 2 */}
            {!isFullScreen && (
              <div className="absolute bottom-[8%] left-[8%] flex flex-col items-start gap-0.5 pointer-events-none z-20 opacity-80">
                <span className="text-[8px] font-mono text-slate-300 tracking-wider">~50m</span>
                <div className="w-10 h-[3px] bg-cyan-400/40 border-b border-l border-r border-cyan-400/80 rounded-sm" />
              </div>
            )}

            {/* Hover tooltip */}
            <HoverTooltip
              hoveredEntity={hoveredEntity}
              timers={liveTimers}
              mapSize={canvasSize}
              ringInset={0}
            />

            {/* Coordinate readout */}
            <div ref={coordElRef} className="absolute bottom-[6%] left-1/2 -translate-x-1/2 text-[7px] font-mono text-slate-500/70 pointer-events-none" />

            {/* Recording indicator */}
            {isRecordingTrail && (
              <div className="absolute top-[10%] right-[10%] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ boxShadow: '0 0 8px #ef4444' }} />
                <span className="text-[7px] font-black text-red-400 tracking-widest uppercase">REC</span>
              </div>
            )}
          </div>

          {/* ── Floating Action Buttons (Moved outside overflow:hidden container to prevent clipping) ── */}
        </div>

        {/* Floating Action Buttons Pop-out System */}
        {!isFullScreen && (
          <div
            className="absolute z-50 flex flex-row-reverse items-start gap-1 pointer-events-auto group"
            style={{
              right: 6,
              top: 6,
              opacity: isHudVisible ? 1 : 0,
              pointerEvents: isHudVisible ? 'auto' : 'none',
              transition: 'opacity 0.2s ease',
            }}
          >
            {/* Main Menu Button (Always visible when HUD is visible) */}
            <Tooltip content={t('minimap.tools')} position="top">
              <div className="flex items-center justify-center rounded-full bg-slate-800 border border-slate-600 text-slate-300 shadow-lg cursor-pointer"
                   style={{ width: Math.round(mapSize * 0.12), height: Math.round(mapSize * 0.12) }}>
                <svg width={Math.round(mapSize * 0.056)} height={Math.round(mapSize * 0.056)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="1"></circle>
                  <circle cx="12" cy="5" r="1"></circle>
                  <circle cx="12" cy="19" r="1"></circle>
                </svg>
              </div>
            </Tooltip>
            
            {/* Expandable Menu Items */}
            <div className="flex-row-reverse gap-1 hidden group-hover:flex bg-slate-900/40 p-1 rounded-full backdrop-blur-md border border-slate-700/50">
              {/* Settings */}
              <div className="relative">
                <Tooltip content={t('minimap.title')} position="top">
                  <button
                    aria-label={t('minimap.title') || 'Minimap Settings'}
                    title={t('minimap.title') || 'Minimap Settings'}
                    onPointerDown={e => e.stopPropagation()}
                    onClick={() => setShowSettings(p => !p)}
                    className="flex items-center justify-center rounded-full transition-all duration-150"
                    style={{
                      width:  Math.round(mapSize * 0.12),
                      height: Math.round(mapSize * 0.12),
                      background: showSettings
                        ? 'linear-gradient(145deg, rgba(56,189,248,0.25), rgba(56,189,248,0.1))'
                        : 'linear-gradient(145deg, rgba(12,24,50,0.95), rgba(6,12,28,0.95))',
                      border: `1.5px solid ${showSettings ? 'rgba(56,189,248,0.6)' : 'rgba(56,189,248,0.2)'}`,
                      color: showSettings ? '#38bdf8' : 'rgba(148,163,184,0.7)',
                      boxShadow: showSettings ? '0 0 16px rgba(56,189,248,0.3)' : '0 2px 8px rgba(0,0,0,0.5)',
                    }}
                  >
                    <Settings size={Math.round(mapSize * 0.056)} />
                  </button>
                </Tooltip>
              </div>

              {/* Fullscreen */}
              <Tooltip content={isFullScreen ? t('minimap.exitFullscreen') : t('minimap.fullscreen')} position="top">
                <button
                  aria-label={isFullScreen ? t('minimap.exitFullscreen') || 'Exit Fullscreen' : t('minimap.fullscreen') || 'Fullscreen Map'}
                  title={isFullScreen ? t('minimap.exitFullscreen') || 'Exit Fullscreen' : t('minimap.fullscreen') || 'Fullscreen Map'}
                  onPointerDown={e => e.stopPropagation()}
                  onClick={() => setIsFullScreen(p => !p)}
                  className="flex items-center justify-center rounded-full transition-all duration-150"
                  style={{
                    width:  Math.round(mapSize * 0.12),
                    height: Math.round(mapSize * 0.12),
                    background: 'linear-gradient(145deg, rgba(12,24,50,0.95), rgba(6,12,28,0.95))',
                    border: '1.5px solid rgba(56,189,248,0.2)',
                    color: 'rgba(148,163,184,0.7)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  }}
                >
                  <Maximize size={Math.round(mapSize * 0.05)} />
                </button>
              </Tooltip>

              {/* Record trail */}
              <Tooltip content={isRecordingTrail ? t('minimap.stopRecording') : t('minimap.recordTrail')} position="top">
                <button
                  aria-label={isRecordingTrail ? t('minimap.stopRecording') || 'Stop Recording Trail' : t('minimap.recordTrail') || 'Record Trail'}
                  title={isRecordingTrail ? t('minimap.stopRecording') || 'Stop Recording Trail' : t('minimap.recordTrail') || 'Record Trail'}
                  onPointerDown={e => e.stopPropagation()}
                  onClick={() => setIsRecordingTrail(!isRecordingTrail)}
                  className="flex items-center justify-center rounded-full transition-all duration-150"
                  style={{
                    width:  Math.round(mapSize * 0.12),
                    height: Math.round(mapSize * 0.12),
                    background: isRecordingTrail
                      ? 'linear-gradient(145deg, rgba(248,113,113,0.3), rgba(239,68,68,0.15))'
                      : 'linear-gradient(145deg, rgba(12,24,50,0.95), rgba(6,12,28,0.95))',
                    border: `1.5px solid ${isRecordingTrail ? 'rgba(248,113,113,0.6)' : 'rgba(56,189,248,0.18)'}`,
                    color: isRecordingTrail ? '#f87171' : 'rgba(148,163,184,0.6)',
                    boxShadow: isRecordingTrail ? '0 0 16px rgba(248,113,113,0.35)' : '0 2px 8px rgba(0,0,0,0.5)',
                  }}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${isRecordingTrail ? 'bg-red-400 animate-pulse' : 'bg-slate-600'}`} />
                </button>
              </Tooltip>

              <Tooltip content={t('minimap.dragMove')} position="top">
                <button
                  aria-label={t('minimap.dragMove') || 'Drag Minimap'}
                  title={t('minimap.dragMove') || 'Drag Minimap'}
                  onPointerDown={e => { e.stopPropagation(); dragControls.start(e); }}
                  className="flex items-center justify-center rounded-full transition-all duration-150 cursor-grab active:cursor-grabbing"
                  style={{
                    width:  Math.round(mapSize * 0.13),
                    height: Math.round(mapSize * 0.13),
                    background: 'linear-gradient(145deg, rgba(56,189,248,0.35), rgba(12,24,50,0.95))',
                    border: '1.5px solid rgba(56,189,248,0.6)',
                    color: '#38bdf8',
                    boxShadow: '0 0 14px rgba(56,189,248,0.35), 0 4px 16px rgba(0,0,0,0.8)',
                  }}
                >
                  <Move size={Math.round(mapSize * 0.055)} />
                </button>
              </Tooltip>

              {/* Zoom In */}
              <Tooltip content={t('minimap.zoomIn')} position="top">
                <button
                  aria-label={t('minimap.zoomIn') || 'Zoom In'}
                  title={t('minimap.zoomIn') || 'Zoom In'}
                  onPointerDown={e => e.stopPropagation()}
                  onClick={() => {
                    if (!engineRef.current) return;
                    const nz = Math.min(8, engineRef.current.state.zoom * 1.3);
                    engineRef.current.updateState({ zoom: nz });
                    setMapZoom(nz);
                  }}
                  className="flex items-center justify-center rounded-full transition-all duration-150"
                  style={{
                    width:  Math.round(mapSize * 0.13),
                    height: Math.round(mapSize * 0.13),
                    background: 'linear-gradient(145deg, rgba(12,24,50,0.95), rgba(6,12,28,0.95))',
                    border: '1.5px solid rgba(56,189,248,0.3)',
                    color: '#38bdf8',
                    boxShadow: '0 0 12px rgba(56,189,248,0.15), 0 4px 16px rgba(0,0,0,0.7)',
                  }}
                >
                  <ZoomIn size={Math.round(mapSize * 0.065)} />
                </button>
              </Tooltip>

              {/* Zoom Out */}
              <Tooltip content={t('minimap.zoomOut')} position="top">
                <button
                  aria-label={t('minimap.zoomOut') || 'Zoom Out'}
                  title={t('minimap.zoomOut') || 'Zoom Out'}
                  onPointerDown={e => e.stopPropagation()}
                  onClick={() => {
                    if (!engineRef.current) return;
                    const nz = Math.max(0.1, engineRef.current.state.zoom * 0.77);
                    engineRef.current.updateState({ zoom: nz });
                    setMapZoom(nz);
                  }}
                  className="flex items-center justify-center rounded-full transition-all duration-150"
                  style={{
                    width:  Math.round(mapSize * 0.13),
                    height: Math.round(mapSize * 0.13),
                    background: 'linear-gradient(145deg, rgba(12,24,50,0.95), rgba(6,12,28,0.95))',
                    border: '1.5px solid rgba(56,189,248,0.25)',
                    color: 'rgba(56,189,248,0.7)',
                    boxShadow: '0 0 8px rgba(56,189,248,0.1), 0 4px 12px rgba(0,0,0,0.6)',
                  }}
                >
                  <ZoomOut size={Math.round(mapSize * 0.065)} />
                </button>
              </Tooltip>

              {/* Lock / Unlock camera */}
              <Tooltip content={isLockedToPlayer ? t('minimap.cameraLocked') : t('minimap.cameraFree')} position="top">
                <button
                  aria-label={isLockedToPlayer ? t('minimap.cameraLocked') || 'Unlock Camera' : t('minimap.cameraFree') || 'Lock Camera'}
                  title={isLockedToPlayer ? t('minimap.cameraLocked') || 'Unlock Camera' : t('minimap.cameraFree') || 'Lock Camera'}
                  onPointerDown={e => e.stopPropagation()}
                  onClick={() => {
                    setIsLockedToPlayer(p => !p);
                    if (engineRef.current) {
                      const rp = { x: 0, y: 0 };
                      engineRef.current.updateState({ pan: rp });
                      setMapPan(rp);
                    }
                  }}
                  className="flex items-center justify-center rounded-full transition-all duration-150"
                  style={{
                    width:  Math.round(mapSize * 0.13),
                    height: Math.round(mapSize * 0.13),
                    background: 'linear-gradient(145deg, rgba(12,24,50,0.95), rgba(6,12,28,0.95))',
                    border: `1.5px solid ${isLockedToPlayer ? 'rgba(56,189,248,0.5)' : 'rgba(239,68,68,0.4)'}`,
                    color: isLockedToPlayer ? '#38bdf8' : '#f87171',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  }}
                >
                  {isLockedToPlayer ? <Lock size={Math.round(mapSize * 0.06)} /> : <Unlock size={Math.round(mapSize * 0.06)} />}
                </button>
              </Tooltip>

              {/* Re-center */}
              <Tooltip content="Re-center Camera" position="top">
                <button
                  aria-label="Re-center Camera"
                  title="Re-center Camera"
                  onPointerDown={e => e.stopPropagation()}
                  onClick={() => {
                    const rp = { x: 0, y: 0 };
                    if (engineRef.current) engineRef.current.updateState({ pan: rp });
                    setMapPan(rp);
                    setIsLockedToPlayer(true);
                  }}
                  className="flex items-center justify-center rounded-full transition-all duration-150"
                  style={{
                    width:  Math.round(mapSize * 0.13),
                    height: Math.round(mapSize * 0.13),
                    background: 'linear-gradient(145deg, rgba(12,24,50,0.95), rgba(6,12,28,0.95))',
                    border: '1.5px solid rgba(56,189,248,0.25)',
                    color: '#38bdf8',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                  }}
                >
                  <Target size={Math.round(mapSize * 0.06)} />
                </button>
              </Tooltip>
            </div>
          </div>
        )}

        {/* ── Compass rose (inside, top-right quadrant, overlapping ring) ── */}
        {!isFullScreen && showCompass && (
          <div
            className="absolute pointer-events-none z-20"
            style={{
              top:   Math.round(mapSize * 0.04),
              right: Math.round(mapSize * 0.04),
              opacity: 0.88,
            }}
          >
            <CompassRose size={compassSize} />
          </div>
        )}

        {/* ── Cardinal direction arrows removed ── */}

        {/* ── Zone name pill (sleek, compact, toggleable) ── */}
        {!isFullScreen && mapSettings.showZonePill !== false && (
          <div
            className="absolute pointer-events-auto cursor-grab active:cursor-grabbing z-30 flex items-center gap-1.5"
            onPointerDown={e => { e.stopPropagation(); dragControls.start(e); }}
            title={t('minimap.dragToMove')}
            style={{
              top: Math.round(mapSize * 0.05),
              left: Math.round(mapSize * 0.05),
              background: 'linear-gradient(135deg, rgba(8,24,44,0.96) 0%, rgba(4,14,32,0.96) 100%)',
              border: `1px solid ${glowColor}70`,
              borderRadius: 100,
              padding: '2px 10px',
              backdropFilter: 'blur(20px)',
              boxShadow: `0 0 14px ${glowColor}35, 0 4px 14px rgba(0,0,0,0.85)`,
              whiteSpace: 'nowrap',
            }}
          >
            <span
              className="animate-pulse rounded-full shrink-0"
              style={{
                width: 5,
                height: 5,
                background: glowColor,
                boxShadow: `0 0 8px ${glowColor}`,
              }}
            />
            <span
              className="font-black uppercase tracking-widest text-[9.5px]"
              style={{
                color: '#38bdf8',
                letterSpacing: '0.12em',
                textShadow: '0 0 12px rgba(56,189,248,0.85)',
              }}
            >
              {viewZone || zone || 'FOREST'}
            </span>
          </div>
        )}

        {/* ── Fullscreen HUD: Zone Tabs + Legend + Controls ── */}
        {isFullScreen && (
          <>
            {/* Zone tab navigation */}
            <FullscreenZoneTabs
              activeZone={viewZone || zone}
              currentPlayerZone={zone}
              onSelectZone={(z) => {
                setViewZone(z);
                // Reset pan when switching zones
                if (engineRef.current) {
                  engineRef.current.updateState({ pan: { x: 0, y: 0 }, zoom: 1 });
                }
                setIsLockedToPlayer(z.toLowerCase() === (zone || '').toLowerCase());
              }}
            />

            {/* Legend panel */}
            <FullscreenLegend />

            {/* Fullscreen control buttons — right side */}
            <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 pointer-events-auto">
              {/* Close / Minimize */}
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-150 cursor-pointer"
                style={{
                  background: 'rgba(8,17,30,0.9)',
                  border: '1px solid rgba(56,189,248,0.3)',
                  color: '#38bdf8',
                  boxShadow: '0 0 20px rgba(56,189,248,0.2)',
                }}
                onClick={() => setIsFullScreen(false)}
                title="Exit Fullscreen (ESC)"
                aria-label="Exit Fullscreen (ESC)"
              >
                <Minimize size={18} />
              </button>

              {/* Zoom In */}
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-150 cursor-pointer"
                style={{
                  background: 'rgba(8,17,30,0.9)',
                  border: '1px solid rgba(56,189,248,0.25)',
                  color: '#38bdf8',
                  boxShadow: '0 0 12px rgba(56,189,248,0.1)',
                }}
                onClick={() => {
                  if (!engineRef.current) return;
                  const nz = Math.min(8, engineRef.current.state.zoom * 1.3);
                  engineRef.current.updateState({ zoom: nz });
                  setMapZoom(nz);
                }}
                title="Zoom In"
                aria-label="Zoom In"
              >
                <ZoomIn size={18} />
              </button>

              {/* Zoom Out */}
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-150 cursor-pointer"
                style={{
                  background: 'rgba(8,17,30,0.9)',
                  border: '1px solid rgba(56,189,248,0.2)',
                  color: 'rgba(56,189,248,0.7)',
                  boxShadow: '0 0 8px rgba(56,189,248,0.08)',
                }}
                onClick={() => {
                  if (!engineRef.current) return;
                  const nz = Math.max(0.1, engineRef.current.state.zoom * 0.77);
                  engineRef.current.updateState({ zoom: nz });
                  setMapZoom(nz);
                }}
                title="Zoom Out"
                aria-label="Zoom Out"
              >
                <ZoomOut size={18} />
              </button>

              {/* Re-center / Lock to player */}
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-150 cursor-pointer"
                style={{
                  background: 'rgba(8,17,30,0.9)',
                  border: `1px solid ${isLockedToPlayer ? 'rgba(56,189,248,0.5)' : 'rgba(239,68,68,0.3)'}`,
                  color: isLockedToPlayer ? '#38bdf8' : '#f87171',
                  boxShadow: '0 0 8px rgba(56,189,248,0.08)',
                }}
                onClick={() => {
                  setViewZone(zone);
                  setIsLockedToPlayer(true);
                  if (engineRef.current) {
                    engineRef.current.updateState({ pan: { x: 0, y: 0 } });
                    setMapPan({ x: 0, y: 0 });
                  }
                }}
                title="Return to Player"
                aria-label="Return to Player"
              >
                <Target size={18} />
              </button>
            </div>

            {/* Coordinate readout — bottom center */}
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
              style={{
                background: 'rgba(4,10,28,0.8)',
                border: '1px solid rgba(56,189,248,0.15)',
                borderRadius: 20,
                padding: '4px 14px',
                backdropFilter: 'blur(12px)',
              }}>
              <div ref={coordElRef} className="text-[10px] font-mono text-slate-400" />
            </div>

            {/* Zone name banner — top left */}
            <div className="fixed top-4 left-4 z-50 flex items-center gap-2 pointer-events-none">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{
                  background: 'rgba(4,10,28,0.9)',
                  border: '1px solid rgba(56,189,248,0.25)',
                  boxShadow: '0 0 20px rgba(56,189,248,0.15)',
                }}>
                <Map size={14} className="text-cyan-400" />
                <span className="text-[12px] font-black uppercase tracking-[0.15em] text-cyan-400"
                  style={{ textShadow: '0 0 12px rgba(56,189,248,0.7)' }}>
                  {viewZone || zone || 'UNKNOWN'}
                </span>
                {(viewZone || zone) !== zone && (
                  <span className="text-[9px] text-slate-500 font-medium">(Viewing)</span>
                )}
              </div>
            </div>
          </>
        )}



        {/* ── Resize handles (square / rectangle only) ── */}
        {!isFullScreen && mapShape !== 'circle' && isHudVisible && [
          { dir: 'n',  style: { top: -5,  left: '50%', transform: 'translateX(-50%)', width: 40, height: 10, cursor: 'n-resize'  } },
          { dir: 's',  style: { bottom: -5, left: '50%', transform: 'translateX(-50%)', width: 40, height: 10, cursor: 's-resize'  } },
          { dir: 'e',  style: { right: -5, top: '50%', transform: 'translateY(-50%)', width: 10, height: 40, cursor: 'e-resize'  } },
          { dir: 'w',  style: { left: -5,  top: '50%', transform: 'translateY(-50%)', width: 10, height: 40, cursor: 'w-resize'  } },
          { dir: 'ne', style: { top: -5,   right: -5,  width: 14, height: 14, cursor: 'ne-resize', borderRadius: '0 4px 0 0' } },
          { dir: 'nw', style: { top: -5,   left: -5,   width: 14, height: 14, cursor: 'nw-resize', borderRadius: '4px 0 0 0' } },
          { dir: 'se', style: { bottom: -5, right: -5,  width: 14, height: 14, cursor: 'se-resize', borderRadius: '0 0 4px 0' } },
          { dir: 'sw', style: { bottom: -5, left: -5,   width: 14, height: 14, cursor: 'sw-resize', borderRadius: '0 0 0 4px' } },
        ].map(({ dir, style }) => (
          <div
            key={dir}
            className="absolute z-40 pointer-events-auto"
            style={{
              ...style,
              background: 'transparent',
              border: 'none',
              transition: 'background 0.15s',
            }}
            onPointerDown={e => handle8WayResize(e, dir)}
          />
        ))}

        {/* ── Settings Panel Popout (rendered outside overflow:hidden canvas container) ── */}
        <AnimatePresence>
          {!isFullScreen && showSettings && (
            <div
              className="absolute z-[9999] pointer-events-auto"
              style={{
                top: 6,
                right: Math.round(mapSize * 0.12) + 14, // button width + spacing
              }}
            >
              <AAAMapSettingsPanel
                mapSettings={{ ...mapSettings, popoutLeft: true }}
                onUpdate={updateMapSettings}
                onClose={() => setShowSettings(false)}
              />
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
});
