/**
 * AAAMapEngine.ts — Premium AAA minimap canvas renderer for ROEDEX
 *
 * Architecture:
 *  - Multi-layer canvas composite: fog, trail, entities, HUD
 *  - All contexts use { desynchronized: true } per cartographer-expert directive
 *  - Trail baking with RDP-smoothed luminance bloom
 *  - Fog-of-War via destination-out compositing
 *  - Rarity-colored entity icons (orbs, diamonds, stars)
 *  - Directional player arrow with pulse ring
 *  - Off-screen edge radar for rare/mythic nodes
 *  - Discovery % bar and animated border ring
 */
import { Point } from '../../store/types';
import { DB_LOOKUP } from '../../data/gameDatabase';
import { getBoundsForZone } from '../../data/zoneBounds';

// ─── Rarity color palette (matches CSS variables from rarity.ts) ─────────────
const RARITY_COLORS: Record<string, string> = {
  common:    '#9ca3af',
  uncommon:  '#60a5fa',
  rare:      '#4ade80',
  mystical:  '#c084fc',
  mythical:  '#c084fc',
};

const RARITY_GLOW: Record<string, string> = {
  common:    'rgba(156,163,175,0.5)',
  uncommon:  'rgba(96,165,250,0.6)',
  rare:      'rgba(74,222,128,0.7)',
  mystical:  'rgba(192,132,252,0.8)',
  mythical:  'rgba(192,132,252,0.8)',
};

// ─── Config ──────────────────────────────────────────────────────────────────
export interface AAAMapEngineConfig {
  canvas: HTMLCanvasElement;
  onHoverMarker?: (info: MarkerInfo | null) => void;
}

export interface MarkerInfo {
  type: 'mob' | 'resource' | 'entrance' | 'drop';
  id: string;
  name: string;
  screenX: number;
  screenY: number;
}

// ─── State ───────────────────────────────────────────────────────────────────
export interface AAAMapEngineState {
  playerPos:   Point | null;
  playerFacing?: number; // radians, 0 = north
  zone:        string | null;
  isFullScreen?: boolean;

  // Visibility toggles
  showCommon:    boolean;
  showUncommon:  boolean;
  showRare:      boolean;
  showMythical:  boolean;
  showOres:      boolean;
  showTrees:     boolean;
  showPlants:    boolean;
  showMobs:      boolean;
  showDrops:     boolean;
  showPortals:   boolean;

  // Style
  dimmedOpacity: number;
  customColors:  Record<string, string>;

  // New AAA features
  fogOfWar:         boolean;
  showDiscoveryBar: boolean;
  discoveryBeam:    boolean;
  showOffScreenRadar: boolean;
  radarMinRarity:   'uncommon' | 'rare' | 'mystical';
  borderGlowMode:   'idle' | 'recording' | 'eraser';
  trailColor:       string;
  trailGradient:    boolean;
  showGrid:         boolean;
  mapShape?:        'circle' | 'square' | 'rectangle';

  // Discovery
  discoveryPercent: number;

  // Data
  trail:    Point[];
  communityTrail?: Point[];
  entries:  any[];
  stairs:   Point[];
  death:    Point | null;
  enemies:  any[];
  resources: any[];
  drops:    any[];
  timers:   any[];

  // Viewport
  pan:  Point;
  zoom: number;

  // Navigation
  activeWaypoint?: Point | null;
  activePath?:     Point[];
  isDragging?:     boolean;
}

// ─── Engine ──────────────────────────────────────────────────────────────────
export class AAAMapEngine {
  private canvas:  HTMLCanvasElement;
  private ctx:     CanvasRenderingContext2D;
  private config:  AAAMapEngineConfig;
  private rafId:   number | null = null;

  // Trail baking layers
  private trailCanvas:    HTMLCanvasElement;
  private trailCtx:       CanvasRenderingContext2D;
  private rawTrailCanvas: HTMLCanvasElement;

  // Fog-of-war baking layer
  private fogCanvas:  HTMLCanvasElement;
  private fogCtx:     CanvasRenderingContext2D;
  private fogBaked:   boolean = false;

  // Internal tracking
  private scale      = 0;
  private originX    = 0;
  private originY    = 0;
  private bakedCount = 0;
  private trailBounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, count: 0 };
  private trailCenterX?: number;
  private trailCenterY?: number;

  // Physics
  private smoothPos:  Point | null = null;
  private smoothPan:  Point = { x: 0, y: 0 };
  private smoothZoom: number = 1;

  // Hover
  private mouseX = -10000;
  private mouseY = -10000;

  // Render control
  private needsRender = true;

  // Type cache (avoids repeated DB_LOOKUP per entity per frame)
  private typeCache = new Map<string, { dbEntry: any; rarity: string; category: string; sanitizedName: string }>();

  // ── BUG-MINI-01/02/03: Cached per-canvas gradients (recreated only on resize) ──
  private cachedGradW = 0;
  private cachedGradH = 0;
  private cachedBgGrad:      CanvasGradient | null = null;
  private cachedVignGrad:    CanvasGradient | null = null;
  private cachedCornerGrad:  CanvasGradient | null = null;
  private cachedDiscBarGrad: CanvasGradient | null = null;

  // ── BUG-MINI-09: Pre-baked scanline overlay canvas ──
  private scanlineCanvas: HTMLCanvasElement | null = null;

  // ── UPGRADE-MAP-01: Incremental fog-of-war bake tracking ──
  private fogBakedCount = 0;

  // ── BUG-MINI-07: Discovery beam offscreen cache ──
  private lastBeamSX = -Infinity;
  private lastBeamSY = -Infinity;
  private beamOffscreen: HTMLCanvasElement | null = null;
  private beamOffscreenW = 0;
  private beamOffscreenH = 0;

  public state: AAAMapEngineState = {
    playerPos:    null,
    playerFacing: 0,
    zone:         null,
    showCommon:   true,
    showUncommon: true,
    showRare:     true,
    showMythical: true,
    showOres:     true,
    showTrees:    true,
    showPlants:   true,
    showMobs:     true,
    showDrops:    true,
    showPortals:  true,
    dimmedOpacity:  0.3,
    customColors:   {},
    fogOfWar:         true,
    showDiscoveryBar: true,
    discoveryBeam:    true,
    showOffScreenRadar: true,
    radarMinRarity:   'rare',
    borderGlowMode:   'idle',
    trailColor:       '#facc15',
    trailGradient:    true,
    showGrid:         false,
    discoveryPercent: 0,
    trail:    [],
    entries:  [],
    stairs:   [],
    death:    null,
    enemies:  [],
    resources: [],
    drops:    [],
    timers:   [],
    pan:      { x: 0, y: 0 },
    zoom:     1,
    isDragging: false,
  };

  constructor(config: AAAMapEngineConfig) {
    this.config = config;
    this.canvas = config.canvas;
    this.ctx    = this.canvas.getContext('2d', { desynchronized: true, alpha: true })!;

    this.trailCanvas    = document.createElement('canvas');
    this.trailCtx       = this.trailCanvas.getContext('2d', { desynchronized: true, alpha: true })!;
    this.rawTrailCanvas = document.createElement('canvas');
    this.fogCanvas      = document.createElement('canvas');
    this.fogCtx         = this.fogCanvas.getContext('2d', { desynchronized: true, alpha: true })!;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  public updateState(partial: Partial<AAAMapEngineState>) {
    const prevTrailLen = this.state.trail.length;
    // BUG-MINI-10: in-place mutation — no GC pressure from object spread
    Object.assign(this.state, partial);

    // If trail grew, only new fog points need baking (incremental)
    if (partial.trail && this.state.trail.length !== prevTrailLen) {
      this.fogBaked = false; // signals ensureFogLayer to run
    }

    this.needsRender = true;
    if (!this.rafId) this.start();
  }

  public panByPixels(dx: number, dy: number, W: number, H: number) {
    const fullArea = 200 * 200;
    const camAspect = W / Math.max(H, 1);
    const halfH = Math.sqrt(fullArea / camAspect) / 2 / this.state.zoom;
    const halfW = halfH * camAspect;
    const screenScale = Math.min(W / (halfW * 2), H / (halfH * 2));
    this.updateState({
      pan: {
        x: this.state.pan.x + dx / screenScale,
        y: this.state.pan.y + dy / screenScale,
      },
      isDragging: true,
    });
  }

  public setHover(x: number, y: number) {
    if (x < 0 || y < 0) { x = -10000; y = -10000; }
    if (this.mouseX !== x || this.mouseY !== y) {
      this.mouseX = x; this.mouseY = y;
      this.needsRender = true;
      if (!this.rafId) this.start();
    }
  }

  public screenToWorld(sx: number, sy: number): Point | null {
    if (!this.smoothPos && !this.state.playerPos) return null;
    const W = this.canvas.width, H = this.canvas.height;
    const { vMinX, vMinY, screenScale, offX, offY } = this.calculateViewport(W, H);
    return {
      x: vMinX + (sx - offX) / screenScale,
      y: vMinY + (H - sy - offY) / screenScale,
    };
  }

  public resize(width: number, height: number) {
    this.canvas.width  = width;
    this.canvas.height = height;
    this.scale = 0;
    this.bakedCount = 0;
    this.fogBaked = false;
    this.fogBakedCount = 0; // full fog re-bake required
    this.needsRender = true;
    // Invalidate all cached gradients — they depend on W/H
    this.cachedBgGrad = null;
    this.cachedVignGrad = null;
    this.cachedCornerGrad = null;
    this.cachedDiscBarGrad = null;
    this.cachedGradW = 0;
    this.cachedGradH = 0;
    // Invalidate beam cache
    this.beamOffscreen = null;
    // BUG-MINI-09: pre-bake scanline overlay
    this._bakeScanlines(width, height);
  }

  public forceRebake() {
    this.scale = 0;
    this.bakedCount = 0;
    this.fogBaked = false;
    this.fogBakedCount = 0;
  }

  /** BUG-MINI-09: Bake the scanline CRT pattern once per resize into an offscreen canvas */
  private _bakeScanlines(W: number, H: number) {
    const sc = document.createElement('canvas');
    sc.width = W; sc.height = H;
    const sCtx = sc.getContext('2d')!;
    sCtx.fillStyle = 'rgba(0,0,0,0.06)';
    sCtx.globalAlpha = 0.5;
    for (let sy = 0; sy < H; sy += 8) sCtx.fillRect(0, sy, W, 1);
    this.scanlineCanvas = sc;
  }

  /** BUG-MINI-01/02/03: Create/reuse all frame-level gradients — runs only on resize */
  private _ensureGradients(W: number, H: number) {
    if (this.cachedGradW === W && this.cachedGradH === H && this.cachedBgGrad) return;
    this.cachedGradW = W;
    this.cachedGradH = H;

    this.cachedBgGrad = this.ctx.createRadialGradient(
      W * 0.5, H * 0.4, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.85);
    this.cachedBgGrad.addColorStop(0,   '#0d1f3c');
    this.cachedBgGrad.addColorStop(0.5, '#070f1e');
    this.cachedBgGrad.addColorStop(1,   '#030810');

    this.cachedVignGrad = this.ctx.createRadialGradient(
      W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.75);
    this.cachedVignGrad.addColorStop(0,    'rgba(0,0,0,0)');
    this.cachedVignGrad.addColorStop(0.65, 'rgba(0,0,0,0.15)');
    this.cachedVignGrad.addColorStop(1,    'rgba(0,0,0,0.75)');

    this.cachedCornerGrad = this.ctx.createRadialGradient(
      W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.5);
    this.cachedCornerGrad.addColorStop(0,   'rgba(56,189,248,0.04)');
    this.cachedCornerGrad.addColorStop(0.7, 'rgba(56,189,248,0.02)');
    this.cachedCornerGrad.addColorStop(1,   'rgba(56,189,248,0)');

    const barW = Math.round(W * 0.75);
    const barX = Math.round((W - barW) / 2);
    this.cachedDiscBarGrad = this.ctx.createLinearGradient(barX, 6, barX + barW, 6);
    this.cachedDiscBarGrad.addColorStop(0,   '#38bdf8');
    this.cachedDiscBarGrad.addColorStop(0.5, '#818cf8');
    this.cachedDiscBarGrad.addColorStop(1,   '#c084fc');
  }

  public start() {
    if (this.rafId) return;
    let last = performance.now();
    let lastRender = performance.now();
    let lastWaypointAnim = 0;

    const loop = (time: number) => {
      const dt = Math.min((time - last) / 1000, 0.1);
      last = time;

      const isMoving = (this.state.playerPos && this.smoothPos && Math.hypot(this.state.playerPos.x - this.smoothPos.x, this.state.playerPos.y - this.smoothPos.y) > 0.05)
        || Math.hypot(this.state.pan.x - this.smoothPan.x, this.state.pan.y - this.smoothPan.y) > 0.05
        || Math.abs(this.state.zoom - this.smoothZoom) > 0.005
        || this.state.isDragging;

      // Hard cap at 30 FPS to save CPU/GPU, as per profiler skill
      const MIN_FRAME_MS = 1000 / 30;

      // Enforce minimum frame gap
      if (time - lastRender < MIN_FRAME_MS) {
        this.rafId = requestAnimationFrame(loop);
        return;
      }

      let should = this.needsRender;
      if (isMoving) should = true;

      // Waypoint dashed-line animation: only tick at 15 FPS to avoid rendering
      // every frame just for the marching-ants effect.
      if (this.state.activeWaypoint && time - lastWaypointAnim > 1000 / 15) {
        should = true;
        lastWaypointAnim = time;
      }

      // No-signal: throttle to 10fps
      if (!this.state.trail.length && !this.state.playerPos && time - lastRender > 1000 / 10) should = true;

      if (should) {
        this.render(dt);
        lastRender = time;
        this.needsRender = false;
        this.rafId = requestAnimationFrame(loop);
      } else {
        this.rafId = null;
      }
    };
    this.rafId = requestAnimationFrame(loop);
  }

  public stop() {
    if (this.rafId) { cancelAnimationFrame(this.rafId); this.rafId = null; }
  }

  public destroy() {
    this.stop();
    (this as any).canvas = null;
    (this as any).ctx = null;
    (this as any).trailCanvas = null;
    (this as any).fogCanvas = null;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private getCachedType(typeStr: string) {
    if (!typeStr) return null;
    let cached = this.typeCache.get(typeStr);
    if (!cached) {
      const key = typeStr.toLowerCase().replace(/[^a-z0-9]/g, '');
      const dbEntry = DB_LOOKUP[key];
      const rarity = dbEntry?.rarity ??
        (typeStr.toLowerCase().includes('mystic') ? 'mystical' :
          typeStr.toLowerCase().includes('rare') ? 'rare' : 'common');
      const category = dbEntry?.category ??
        (typeStr.toLowerCase().includes('tree') ? 'tree' :
          (typeStr.toLowerCase().includes('bush') || typeStr.toLowerCase().includes('flower') ? 'plant' : 'ore'));
      const sanitizedName = dbEntry?.sanitizedName ?? typeStr;
      cached = { dbEntry, rarity, category, sanitizedName };
      this.typeCache.set(typeStr, cached);
    }
    return cached;
  }

  private calculateViewport(W: number, H: number) {
    if (this.state.isFullScreen) {
      let bounds = { minX: -200, maxX: 200, minY: -200, maxY: 200 };
      let hasBounds = false;

      // 1. Try community trail bounds
      if (this.state.communityTrail && this.state.communityTrail.length > 0) {
        let tMinX = Infinity, tMaxX = -Infinity, tMinY = Infinity, tMaxY = -Infinity;
        for (const p of this.state.communityTrail) {
          if (p.x < tMinX) tMinX = p.x;
          if (p.x > tMaxX) tMaxX = p.x;
          if (p.y < tMinY) tMinY = p.y;
          if (p.y > tMaxY) tMaxY = p.y;
        }
        if (tMinX !== Infinity) {
          bounds = { minX: tMinX, maxX: tMaxX, minY: tMinY, maxY: tMaxY };
          hasBounds = true;
        }
      }

      // 2. Try zone bounds fallback
      if (!hasBounds && this.state.zone) {
        const zb = getBoundsForZone(this.state.zone);
        if (zb) {
          bounds = { minX: zb.minX, maxX: zb.maxX, minY: zb.minY, maxY: zb.maxY };
          hasBounds = true;
        }
      }

      const cx = (bounds.minX + bounds.maxX) / 2;
      const cy = (bounds.minY + bounds.maxY) / 2;
      const zW = Math.max(bounds.maxX - bounds.minX, 20);
      const zH = Math.max(bounds.maxY - bounds.minY, 20);

      // Fit with 15% padding
      const padding = 1.15;
      let viewW = zW * padding;
      let viewH = zH * padding;

      const camAspect = W / Math.max(H, 1);
      if (camAspect > viewW / viewH) {
        viewW = viewH * camAspect;
      } else {
        viewH = viewW / camAspect;
      }

      // Apply zoom on top of the base view window
      const halfW = (viewW / 2) / this.smoothZoom;
      const halfH = (viewH / 2) / this.smoothZoom;

      // Pan is applied relative to center
      const vCX = cx - this.smoothPan.x;
      const vCY = cy + this.smoothPan.y;

      const vMinX = vCX - halfW, vMaxX = vCX + halfW;
      const vMinY = vCY - halfH, vMaxY = vCY + halfH;
      const rangeX = Math.max(vMaxX - vMinX, 1);
      const rangeY = Math.max(vMaxY - vMinY, 1);

      const screenScale = Math.min(W / rangeX, H / rangeY);
      const offX = (W - rangeX * screenScale) / 2;
      const offY = (H - rangeY * screenScale) / 2;

      const toScreen = (p: Point) => ({
        x: offX + (p.x - vMinX) * screenScale,
        y: H - (offY + (p.y - vMinY) * screenScale),
      });

      return { vMinX, vMaxX, vMinY, vMaxY, rangeX, rangeY, screenScale, offX, offY, toScreen };
    }

    let cx = 0, cy = 0;
    if (this.smoothPos) { cx = this.smoothPos.x; cy = this.smoothPos.y; }
    else if (this.trailCenterX !== undefined) { cx = this.trailCenterX; cy = this.trailCenterY!; }

    const fullArea = 200 * 200;
    const camAspect = W / Math.max(H, 1);
    const halfH = Math.sqrt(fullArea / camAspect) / 2 / this.smoothZoom;
    const halfW = halfH * camAspect;

    const vCX = cx - this.smoothPan.x;
    const vCY = cy + this.smoothPan.y;

    const vMinX = vCX - halfW, vMaxX = vCX + halfW;
    const vMinY = vCY - halfH, vMaxY = vCY + halfH;
    const rangeX = Math.max(vMaxX - vMinX, 1);
    const rangeY = Math.max(vMaxY - vMinY, 1);

    const screenScale = Math.min(W / rangeX, H / rangeY);
    const offX = (W - rangeX * screenScale) / 2;
    const offY = (H - rangeY * screenScale) / 2;

    const toScreen = (p: Point) => ({
      x: offX + (p.x - vMinX) * screenScale,
      y: H - (offY + (p.y - vMinY) * screenScale),
    });

    return { vMinX, vMaxX, vMinY, vMaxY, rangeX, rangeY, screenScale, offX, offY, toScreen };
  }

  private updatePhysics(dt: number) {
    const posLerp  = 1 - Math.exp(-dt * 12);
    const zoomLerp = 1 - Math.exp(-dt * 15);
    const panLerp  = 1 - Math.exp(-dt * 15);

    if (this.state.playerPos) {
      if (!this.smoothPos) {
        this.smoothPos = { x: this.trailCenterX ?? this.state.playerPos.x, y: this.trailCenterY ?? this.state.playerPos.y };
      } else {
        const dx = this.state.playerPos.x - this.smoothPos.x;
        const dy = this.state.playerPos.y - this.smoothPos.y;
        if (dx * dx + dy * dy > 225) this.smoothPos = { ...this.state.playerPos };
        else { this.smoothPos.x += dx * posLerp; this.smoothPos.y += dy * posLerp; }
      }
    } else {
      this.smoothPos = null;
    }

    const zd = this.state.zoom - this.smoothZoom;
    this.smoothZoom += zd * zoomLerp;
    if (Math.abs(zd) < 0.001) this.smoothZoom = this.state.zoom;

    const pdLerp = this.state.isDragging ? 1 - Math.exp(-dt * 30) : panLerp;
    this.smoothPan.x += (this.state.pan.x - this.smoothPan.x) * pdLerp;
    this.smoothPan.y += (this.state.pan.y - this.smoothPan.y) * pdLerp;
    if (!this.state.isDragging && Math.abs(this.state.pan.x - this.smoothPan.x) < 0.01) this.smoothPan.x = this.state.pan.x;
    if (!this.state.isDragging && Math.abs(this.state.pan.y - this.smoothPan.y) < 0.01) this.smoothPan.y = this.state.pan.y;
  }

  // ── Trail baking (adapted from MapRenderEngine with gradient overlay) ──────

  private ensureTrailLayer() {
    const pts = this.state.trail;
    if (!pts.length) { this.scale = 0; return; }

    if (pts.length < this.trailBounds.count) {
      this.trailBounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, count: 0 };
    }
    for (let i = this.trailBounds.count; i < pts.length; i++) {
      const p = pts[i];
      if (p.x < this.trailBounds.minX) this.trailBounds.minX = p.x;
      if (p.x > this.trailBounds.maxX) this.trailBounds.maxX = p.x;
      if (p.y < this.trailBounds.minY) this.trailBounds.minY = p.y;
      if (p.y > this.trailBounds.maxY) this.trailBounds.maxY = p.y;
    }
    this.trailBounds.count = pts.length;

    let { minX, maxX, minY, maxY } = this.trailBounds;
    this.trailCenterX = (minX + maxX) / 2;
    this.trailCenterY = (minY + maxY) / 2;

    const PAD = 20, BAKE_SCALE = 6;
    const needsGrow = !this.scale ||
      minX < this.originX + 10 || maxX > (this.originX + this.trailCanvas.width / this.scale) - 10 ||
      minY < (this.originY - this.trailCanvas.height / this.scale) + 10 || maxY > this.originY - 10;

    if (needsGrow) {
      minX -= PAD; maxX += PAD; minY -= PAD; maxY += PAD;
      const w = Math.ceil((maxX - minX) * BAKE_SCALE);
      const h = Math.ceil((maxY - minY) * BAKE_SCALE);
      this.trailCanvas.width    = w;
      this.trailCanvas.height   = h;
      this.rawTrailCanvas.width = w;
      this.rawTrailCanvas.height = h;
      this.fogCanvas.width      = w;
      this.fogCanvas.height     = h;
      this.scale   = BAKE_SCALE;
      this.originX = minX;
      this.originY = maxY;
      this.bakedCount = 0;
      this.fogBaked = false;
    }

    if (pts.length > this.bakedCount) {
      this.paintTrailRange(this.bakedCount, pts.length);
    }
  }

  private paintTrailRange(from: number, to: number) {
    if (!this.scale || from >= to) return;
    const pts = this.state.trail;
    if (pts.length < 2) return;

    const color = this.state.trailColor || '#facc15';

    // Helper: convert world point → baked canvas pixel
    const toCanvas = (p: Point) => ({
      x: (p.x - this.originX) * this.scale,
      y: (this.originY - p.y) * this.scale,
    });

    // Draw on the raw trail canvas
    const rawCtx = this.rawTrailCanvas.getContext('2d')!;

    rawCtx.save();
    rawCtx.lineCap       = 'round';
    rawCtx.lineJoin      = 'round';

    // 1. Draw community base trail (if any) - ONLY on fresh canvas bake
    if (from === 0 && this.state.communityTrail && this.state.communityTrail.length > 1) {
      rawCtx.globalAlpha = 1.0;
      rawCtx.strokeStyle = 'rgba(56, 189, 248, 0.25)'; // Subtle cyan background path
      rawCtx.lineWidth = Math.max(2.5, this.scale * 1.5);
      this._drawSmoothPath(rawCtx, this.state.communityTrail, toCanvas);
    }

    // 2. Draw user's live trail
    if (pts.length > 1) {
      rawCtx.globalAlpha = 1.0;
      rawCtx.strokeStyle = color;
      rawCtx.lineWidth = Math.max(1.8, this.scale * 0.9);
      // Only draw the newly added points (overlap by 1 to connect segments)
      const sliceStart = Math.max(0, from - 1);
      const newPts = pts.slice(sliceStart, to);
      this._drawSmoothPath(rawCtx, newPts, toCanvas);
    }
    
    rawCtx.restore();

    // Copy raw → display canvas
    const W = this.trailCanvas.width, H = this.trailCanvas.height;
    this.trailCtx.clearRect(0, 0, W, H);
    this.trailCtx.drawImage(this.rawTrailCanvas, 0, 0);

    // UPGRADE-MAP-01: Do NOT reset fogBaked on trail paint.
    // New trail points are incrementally punched in ensureFogLayer().
    this.bakedCount = to;
  }

  /** Draw a smooth path through world points via quadratic bezier curves to midpoints */
  private _drawSmoothPath(
    ctx: CanvasRenderingContext2D,
    pts: Point[],
    toCanvas: (p: Point) => { x: number; y: number },
  ) {
    if (pts.length < 2) return;
    const sp = pts.map(toCanvas);

    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(sp[0].x, sp[0].y);

    // Teleportation detection: 25-unit threshold catches zone jumps and session
    // boundary gaps without drawing spaghetti lines across the map.
    // The Forest zone is ~500 units wide — 25 units ≈ ~1.5 tiles, a safe gap.
    const MAX_WORLD_DIST_SQ = 25 * 25;

    // Quadratic bezier to midpoints for perfectly smooth trails
    for (let i = 1; i < sp.length - 1; i++) {
      const wDx = pts[i].x - pts[i - 1].x;
      const wDy = pts[i].y - pts[i - 1].y;
      
      if (wDx * wDx + wDy * wDy > MAX_WORLD_DIST_SQ) {
         ctx.moveTo(sp[i].x, sp[i].y);
      }

      const xc = (sp[i].x + sp[i + 1].x) / 2;
      const yc = (sp[i].y + sp[i + 1].y) / 2;
      ctx.quadraticCurveTo(sp[i].x, sp[i].y, xc, yc);
    }
    
    // Check last segment
    const lastIdx = sp.length - 1;
    const lDx = pts[lastIdx].x - pts[lastIdx - 1].x;
    const lDy = pts[lastIdx].y - pts[lastIdx - 1].y;
    if (lDx * lDx + lDy * lDy > MAX_WORLD_DIST_SQ) {
      ctx.moveTo(sp[lastIdx].x, sp[lastIdx].y);
    } else {
      ctx.lineTo(sp[lastIdx].x, sp[lastIdx].y);
    }
    ctx.stroke();
  }

  private ensureFogLayer() {
    if (!this.scale || !this.state.trail.length) return;
    const trail = this.state.trail;

    // UPGRADE-MAP-01: Incremental bake — only process NEW trail points since last call
    if (this.fogBakedCount >= trail.length && this.fogBaked) return;

    const W = this.fogCanvas.width, H = this.fogCanvas.height;
    const STEP   = 2.2;
    const REVEAL  = Math.max(8, this.scale * STEP * 3.5);

    if (this.fogBakedCount === 0) {
      // Fresh bake: paint the solid black base once
      this.fogCtx.clearRect(0, 0, W, H);
      this.fogCtx.fillStyle = '#000';
      this.fogCtx.fillRect(0, 0, W, H);
    }

    // Punch out only the new points (destination-out)
    this.fogCtx.globalCompositeOperation = 'destination-out';
    for (let i = this.fogBakedCount; i < trail.length; i++) {
      const p = trail[i];
      const cx = Math.round(p.x / STEP) * STEP;
      const cy = Math.round(p.y / STEP) * STEP;
      const sx = (cx - this.originX) * this.scale;
      const sy = (this.originY - cy) * this.scale;
      const grad = this.fogCtx.createRadialGradient(sx, sy, 0, sx, sy, REVEAL);
      grad.addColorStop(0,   'rgba(0,0,0,1)');
      grad.addColorStop(0.6, 'rgba(0,0,0,0.85)');
      grad.addColorStop(1,   'rgba(0,0,0,0)');
      this.fogCtx.fillStyle = grad;
      this.fogCtx.beginPath();
      this.fogCtx.arc(sx, sy, REVEAL, 0, Math.PI * 2);
      this.fogCtx.fill();
    }
    this.fogCtx.globalCompositeOperation = 'source-over';
    this.fogBakedCount = trail.length;
    this.fogBaked = true;
  }

  // ── Renderers ──────────────────────────────────────────────────────────────

  private renderTrailLayer(vMinX: number, vMaxY: number, rangeX: number, rangeY: number, screenScale: number, offX: number, offY: number) {
    if (!this.scale) return;
    const sx = (vMinX - this.originX) * this.scale;
    const sy = (this.originY - vMaxY) * this.scale;
    const sw = rangeX * this.scale;
    const sh = rangeY * this.scale;
    const dW = rangeX * screenScale;
    const dH = rangeY * screenScale;

    if (sw <= 0 || sh <= 0) return;

    // Crisp pixel-perfect micro-path rendering
    this.ctx.save();
    this.ctx.globalAlpha = 1.0;
    this.ctx.drawImage(this.trailCanvas, sx, sy, sw, sh, offX, offY, dW, dH);
    this.ctx.restore();
  }

  private renderCommunityBoundary(toScreen: (p: Point) => Point) {
    if (!this.state.communityTrail || this.state.communityTrail.length < 2) return;

    const now = Date.now();
    const pulseAlpha = 0.65 + 0.15 * Math.sin(now / 350);
    const pulseBlur = 6 + 4 * Math.sin(now / 350);

    this.ctx.save();
    this.ctx.globalAlpha = this.state.isFullScreen ? pulseAlpha : 0.25;
    this.ctx.strokeStyle = '#38bdf8'; // Glowing cyan boundary line
    this.ctx.lineWidth = this.state.isFullScreen ? 3.5 : 1.5;
    if (this.state.isFullScreen) {
      this.ctx.shadowColor = '#38bdf8';
      this.ctx.shadowBlur = pulseBlur;
    }

    this._drawSmoothPath(this.ctx, this.state.communityTrail, toScreen);
    this.ctx.restore();
  }

  private renderFogLayer(vMinX: number, vMaxY: number, rangeX: number, rangeY: number, screenScale: number, offX: number, offY: number) {
    if (this.state.isFullScreen) return; // Disable fog in fullscreen mode
    if (!this.state.fogOfWar || !this.scale || this.fogBakedCount === 0) return;
    const sx = (vMinX - this.originX) * this.scale;
    const sy = (this.originY - vMaxY) * this.scale;
    const sw = rangeX * this.scale;
    const sh = rangeY * this.scale;
    if (sw <= 0 || sh <= 0) return;

    this.ctx.save();
    this.ctx.globalAlpha = 0.82;
    this.ctx.drawImage(this.fogCanvas, sx, sy, sw, sh, offX, offY, rangeX * screenScale, rangeY * screenScale);
    this.ctx.restore();
  }

  private renderDiscoveryBeam(toScreen: (p: Point) => Point) {
    if (this.state.isFullScreen) return; // Hide discovery beam in fullscreen mode
    // BUG-MINI-07: Beam is cached to an offscreen canvas and only redrawn when
    // the player's screen position changes by >= 1px. Zero gradient allocations
    // when stationary — just a single drawImage call.
    if (!this.smoothPos || !this.state.discoveryBeam) return;

    const sp = toScreen(this.smoothPos);
    const W  = this.canvas.width;
    const H  = this.canvas.height;

    const dx = sp.x - this.lastBeamSX;
    const dy = sp.y - this.lastBeamSY;
    const needsRedraw = dx * dx + dy * dy >= 1
      || !this.beamOffscreen
      || this.beamOffscreenW !== W
      || this.beamOffscreenH !== H;

    if (needsRedraw) {
      this.lastBeamSX = sp.x;
      this.lastBeamSY = sp.y;

      if (!this.beamOffscreen || this.beamOffscreenW !== W || this.beamOffscreenH !== H) {
        this.beamOffscreen = document.createElement('canvas');
        this.beamOffscreen.width  = W;
        this.beamOffscreen.height = H;
        this.beamOffscreenW = W;
        this.beamOffscreenH = H;
      }
      const bCtx = this.beamOffscreen.getContext('2d', { desynchronized: true })!;
      bCtx.clearRect(0, 0, W, H);

      const heading    = (this.state.playerFacing ?? 0) - Math.PI / 2;
      const coneAngle  = Math.PI / 2;
      const beamLength = 130 * Math.max(0.8, this.state.zoom);

      const beamGrad = bCtx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, beamLength);
      beamGrad.addColorStop(0,    'rgba(253,224,71,0.45)');
      beamGrad.addColorStop(0.35, 'rgba(234,179,8,0.3)');
      beamGrad.addColorStop(0.75, 'rgba(56,189,248,0.15)');
      beamGrad.addColorStop(1,    'rgba(56,189,248,0)');
      bCtx.fillStyle = beamGrad;
      bCtx.beginPath();
      bCtx.moveTo(sp.x, sp.y);
      bCtx.arc(sp.x, sp.y, beamLength, heading - coneAngle / 2, heading + coneAngle / 2);
      bCtx.closePath();
      bCtx.fill();

      const haloGrad = bCtx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, 45);
      haloGrad.addColorStop(0,   'rgba(253,224,71,0.28)');
      haloGrad.addColorStop(0.5, 'rgba(56,189,248,0.12)');
      haloGrad.addColorStop(1,   'rgba(0,0,0,0)');
      bCtx.fillStyle = haloGrad;
      bCtx.beginPath();
      bCtx.arc(sp.x, sp.y, 45, 0, Math.PI * 2);
      bCtx.fill();
    }

    if (this.beamOffscreen) this.ctx.drawImage(this.beamOffscreen, 0, 0);
  }

  private renderGrid(W: number, H: number, toScreen: (p: Point) => Point, vMinX: number, vMaxX: number, vMinY: number, vMaxY: number) {
    if (!this.state.showGrid) return;
    const spacing = 20;
    this.ctx.save();
    this.ctx.globalAlpha = 0.06;
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    for (let x = Math.floor(vMinX / spacing) * spacing; x <= vMaxX; x += spacing) {
      const sx = toScreen({ x, y: 0 }).x;
      this.ctx.moveTo(sx, 0); this.ctx.lineTo(sx, H);
    }
    for (let y = Math.floor(vMinY / spacing) * spacing; y <= vMaxY; y += spacing) {
      const sy = toScreen({ x: 0, y }).y;
      this.ctx.moveTo(0, sy); this.ctx.lineTo(W, sy);
    }
    this.ctx.stroke();
    this.ctx.restore();
  }

  private renderEntityDiamond(cx: number, cy: number, r: number, color: string, alpha: number, glowColor: string, outlineOnly = false) {
    // BUG-MINI-05/06: No shadowBlur (GPU compositing pass), no per-entity linear gradient.
    // Fake glow = solid semi-transparent larger circle drawn first (zero GPU overhead).
    this.ctx.save();

    if (glowColor !== 'transparent') {
      this.ctx.globalAlpha = alpha * 0.3;
      this.ctx.fillStyle   = glowColor;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.globalAlpha = alpha;

    if (outlineOnly) {
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth   = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy - r);
      this.ctx.lineTo(cx + r * 0.85, cy);
      this.ctx.lineTo(cx, cy + r);
      this.ctx.lineTo(cx - r * 0.85, cy);
      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.fillStyle = 'rgba(6, 18, 12, 0.7)';
      this.ctx.fill();
    } else {
      // BUG-MINI-05: Solid fill — no linear gradient per entity
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy - r);
      this.ctx.lineTo(cx + r * 0.8, cy);
      this.ctx.lineTo(cx, cy + r);
      this.ctx.lineTo(cx - r * 0.8, cy);
      this.ctx.closePath();
      this.ctx.fill();
      // Subtle top-half highlight (static, no gradient)
      this.ctx.fillStyle = 'rgba(255,255,255,0.28)';
      const hr = r * 0.45;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy - hr);
      this.ctx.lineTo(cx + hr * 0.8, cy - hr * 0.3);
      this.ctx.lineTo(cx, cy);
      this.ctx.lineTo(cx - hr * 0.8, cy - hr * 0.3);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      this.ctx.lineWidth   = 0.8;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  private renderEntityOrb(cx: number, cy: number, r: number, color: string, alpha: number, glowColor: string) {
    // BUG-MINI-04/06: No shadowBlur, no per-entity radial gradient.
    // Fake glow = semi-transparent circle behind orb (zero GPU compositing cost).
    this.ctx.save();

    if (glowColor !== 'transparent') {
      this.ctx.globalAlpha = alpha * 0.28;
      this.ctx.fillStyle   = glowColor;
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.globalAlpha = alpha;
    // BUG-MINI-04: Solid fill — no radial gradient per entity
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
    this.ctx.fill();
    // Static highlight dot top-left (replaces gradient shimmer)
    this.ctx.fillStyle = 'rgba(255,255,255,0.42)';
    this.ctx.beginPath();
    this.ctx.arc(cx - r * 0.28, cy - r * 0.28, r * 0.32, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(0,0,0,0.28)';
    this.ctx.lineWidth   = 0.8;
    this.ctx.stroke();

    this.ctx.restore();
  }

  private renderEnemies(W: number, H: number, toScreen: (p: Point) => Point, hovered: { entity: any; distSq: number }) {
    if (!this.state.showMobs) return;
    for (const e of this.state.enemies) {
      if (!e.pos) continue;
      const s = toScreen(e.pos);
      // Early viewport cull — applies to both static and live enemies
      if (s.x < -20 || s.y < -20 || s.x > W + 20 || s.y > H + 20) continue;

      // ── Static background mob (mrsnorch ROE Tracker data) ──────────────────
      // Render as tiny dim triangle marker, no hover interaction, unless in fullscreen
      if (e.isStatic && !this.state.isFullScreen) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.38;
        this.ctx.fillStyle = '#fca5a5'; // muted red
        this.ctx.beginPath();
        this.ctx.moveTo(s.x,       s.y - 3.5);
        this.ctx.lineTo(s.x + 3.5, s.y + 2.5);
        this.ctx.lineTo(s.x - 3.5, s.y + 2.5);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
        continue; // no hover, no glow
      }

      const info = this.getCachedType(e.type || e.statsKey || '');
      const sanitizedName = info?.sanitizedName || e.type || 'Enemy';

      const isDead = e.isDead;
      const alpha  = e.isStatic ? 0.75 : (isDead ? (this.state.dimmedOpacity ?? 0.3) : 1);

      // Concept Image: Mobs are sharp red solid diamonds (♦)
      const color = '#ef4444';
      const glow  = 'rgba(239, 68, 68, 0.8)';
      const radius = 8;

      this.renderEntityDiamond(s.x, s.y, radius, color, alpha, isDead ? 'transparent' : glow, false);

      const distSq = (s.x - this.mouseX) ** 2 + (s.y - this.mouseY) ** 2;
      if (distSq <= 64 && distSq < hovered.distSq) {
        hovered.entity = { type: 'mob', id: `mob-${this.state.zone}-${e.entityIndex}`, name: sanitizedName, screenX: s.x, screenY: s.y };
        hovered.distSq = distSq;
      }
    }
  }

  private renderResources(W: number, H: number, toScreen: (p: Point) => Point, hovered: { entity: any; distSq: number }) {
    for (const res of this.state.resources) {
      if (!res.pos) continue;
      const s = toScreen(res.pos);
      // Early viewport cull — applies to both static and live resources
      if (s.x < -20 || s.y < -20 || s.x > W + 20 || s.y > H + 20) continue;

      // ── Static background resource (mrsnorch ROE Tracker data) ─────────────
      // Render as tiny dim square marker, no hover interaction, unless in fullscreen
      if (res.isStatic && !this.state.isFullScreen) {
        const cat = res.spawnCategory || 'ore';
        // Color by category: ore=purple, tree=green, plant=lime-green
        const staticColor =
          cat === 'ore'   ? '#c4b5fd' :
          cat === 'tree'  ? '#86efac' :
                            '#d9f99d'; // plant
        const half = 2.5;
        this.ctx.save();
        this.ctx.globalAlpha = 0.4;
        this.ctx.fillStyle = staticColor;
        this.ctx.fillRect(s.x - half, s.y - half, half * 2, half * 2);
        this.ctx.restore();
        continue; // no hover, no glow
      }

      const info = this.getCachedType(res.resource || res.type || '');
      const rarity = info?.rarity || 'common';
      const sanitizedName = info?.sanitizedName || res.type;
      const category = info?.category || 'ore';

      if (rarity === 'common'   && !this.state.showCommon)   continue;
      if (rarity === 'uncommon' && !this.state.showUncommon) continue;
      if (rarity === 'rare'     && !this.state.showRare)     continue;
      if ((rarity === 'mystical' || rarity === 'mythical') && !this.state.showMythical) continue;
      if (category === 'ore'   && !this.state.showOres)   continue;
      if (category === 'tree'  && !this.state.showTrees)  continue;
      if (category === 'plant' && !this.state.showPlants) continue;

      const isReady = !res.gathered;
      const alpha   = res.isStatic ? 0.75 : (isReady ? 1 : (this.state.dimmedOpacity ?? 0.3));

      if (rarity === 'rare' || rarity === 'uncommon') {
        // Concept Image: Green outlined diamond frame (◇) for resources
        const color = '#4ade80';
        const glow  = 'rgba(74, 222, 128, 0.8)';
        this.renderEntityDiamond(s.x, s.y, 8, color, alpha, isReady ? glow : 'transparent', true);
      } else {
        // Colored circular nodes (Blue for rare/uncommon, Purple for mythic, Grey for common)
        const color = RARITY_COLORS[rarity] || RARITY_COLORS.common;
        const glow  = RARITY_GLOW[rarity]   || RARITY_GLOW.common;
        const radius = (rarity === 'mystical' || rarity === 'mythical') ? 8 : 6;
        this.renderEntityOrb(s.x, s.y, radius, color, alpha, isReady ? glow : 'transparent');
      }

      const distSq = (s.x - this.mouseX) ** 2 + (s.y - this.mouseY) ** 2;
      if (distSq <= 64 && distSq < hovered.distSq) {
        hovered.entity = { type: 'resource', id: `res-${this.state.zone}-${res.entityIndex}`, name: sanitizedName, screenX: s.x, screenY: s.y };
        hovered.distSq = distSq;
      }
    }
  }

  private renderDrops(W: number, H: number, toScreen: (p: Point) => Point) {
    if (!this.state.showDrops) return;
    for (const d of this.state.drops) {
      if (!d.pos) continue;
      const s = toScreen(d.pos);
      if (s.x < -10 || s.y < -10 || s.x > W + 10 || s.y > H + 10) continue;
      this.ctx.save();
      this.ctx.shadowColor = 'rgba(254,240,138,0.8)';
      this.ctx.shadowBlur  = 6;
      this.ctx.fillStyle   = '#fef08a';
      // Star shape
      const R = 5, r2 = 2.5, spikes = 5;
      this.ctx.beginPath();
      for (let k = 0; k < spikes * 2; k++) {
        const ang = (k * Math.PI) / spikes - Math.PI / 2;
        const rad = k % 2 === 0 ? R : r2;
        k === 0 ? this.ctx.moveTo(s.x + Math.cos(ang) * rad, s.y + Math.sin(ang) * rad)
                : this.ctx.lineTo(s.x + Math.cos(ang) * rad, s.y + Math.sin(ang) * rad);
      }
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  private renderPortals(W: number, H: number, toScreen: (p: Point) => Point, hovered: { entity: any; distSq: number }) {
    if (!this.state.showPortals) return;
    for (const ent of this.state.entries) {
      if (ent.x === undefined || ent.y === undefined) continue;
      const s = toScreen({ x: ent.x, y: ent.y });
      if (s.x < -15 || s.y < -15 || s.x > W + 15 || s.y > H + 15) continue;

      this.ctx.save();
      this.ctx.shadowColor  = 'rgba(34,255,102,0.9)';
      this.ctx.shadowBlur   = 12;
      // Outer ring
      this.ctx.strokeStyle  = 'rgba(34,255,102,0.5)';
      this.ctx.lineWidth    = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, 8, 0, Math.PI * 2);
      this.ctx.stroke();
      // Diamond core
      this.ctx.fillStyle    = '#22ff66';
      this.ctx.beginPath();
      this.ctx.moveTo(s.x, s.y - 5);
      this.ctx.lineTo(s.x + 5, s.y);
      this.ctx.lineTo(s.x, s.y + 5);
      this.ctx.lineTo(s.x - 5, s.y);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.restore();

      const distSq = (s.x - this.mouseX) ** 2 + (s.y - this.mouseY) ** 2;
      if (distSq <= 64 && distSq < hovered.distSq) {
        hovered.entity = { type: 'entrance', name: ent.portalType || 'Portal', screenX: s.x, screenY: s.y };
        hovered.distSq = distSq;
      }
    }
  }

  private renderPlayerArrow(toScreen: (p: Point) => Point) {
    if (!this.smoothPos) return;
    const sp  = toScreen(this.smoothPos);
    
    this.ctx.save();
    this.ctx.translate(sp.x, sp.y);

    if (this.state.isFullScreen) {
      // Pulsing green blip matching ROE Tracker style
      const now = Date.now();
      const pulseRadius = 7 + 3.5 * Math.sin(now / 150);
      
      // Pulsing outer ring
      this.ctx.strokeStyle = '#22ff66';
      this.ctx.globalAlpha = Math.max(0.2, 0.6 + 0.4 * Math.sin(now / 150));
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // Core green dot
      this.ctx.shadowColor = '#22ff66';
      this.ctx.shadowBlur = 12;
      this.ctx.globalAlpha = 1.0;
      const coreGrad = this.ctx.createRadialGradient(-1.5, -1.5, 0, 0, 0, 5);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.4, '#86efac');
      coreGrad.addColorStop(1, '#22c55e');
      this.ctx.fillStyle = coreGrad;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 5, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      // Core filled dot with radial gradient
      this.ctx.shadowBlur  = 12;
      const coreGrad = this.ctx.createRadialGradient(-2, -2, 0, 0, 0, 7);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.4, '#7dd3fc');
      coreGrad.addColorStop(1, '#0284c7');
      this.ctx.fillStyle = coreGrad;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 7, 0, Math.PI * 2);
      this.ctx.fill();

      // Center white pinpoint
      this.ctx.shadowBlur  = 0;
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }


  private renderDeathSpot(toScreen: (p: Point) => Point) {
    if (!this.state.death) return;
    const s = toScreen(this.state.death);
    this.ctx.save();
    this.ctx.shadowColor = '#f87171';
    this.ctx.shadowBlur  = 8;
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth   = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(s.x - 6, s.y - 6); this.ctx.lineTo(s.x + 6, s.y + 6);
    this.ctx.moveTo(s.x + 6, s.y - 6); this.ctx.lineTo(s.x - 6, s.y + 6);
    this.ctx.stroke();
    this.ctx.strokeStyle = '#f87171';
    this.ctx.lineWidth   = 2;
    this.ctx.stroke();
    this.ctx.restore();
  }

  private renderWaypoint(W: number, H: number, toScreen: (p: Point) => Point) {
    if (!this.state.activeWaypoint || !this.smoothPos) return;

    const path = this.state.activePath ? [...this.state.activePath] : [];
    const worldPts = path.length > 0 ? [this.smoothPos, ...path] : [this.smoothPos, this.state.activeWaypoint];
    const screenPts = worldPts.map(toScreen);

    this.ctx.save();
    const now = Date.now();

    // Concept Image: Dashed white/cyan route line
    this.ctx.setLineDash([7, 5]);
    this.ctx.lineDashOffset = -(now % 10000) / 30;
    this.ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    this.ctx.lineWidth = 2.5;
    this.ctx.shadowColor = '#38bdf8';
    this.ctx.shadowBlur = 8;
    this.ctx.beginPath();
    if (screenPts.length >= 2) {
      const pts = screenPts;
      this.ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const mid = { x: (pts[i].x + pts[i + 1].x) / 2, y: (pts[i].y + pts[i + 1].y) / 2 };
        this.ctx.quadraticCurveTo(pts[i].x, pts[i].y, mid.x, mid.y);
      }
      this.ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    }
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Concept Image: Red Location Pin 📍 at destination
    const dest = screenPts[screenPts.length - 1];
    if (dest.x >= -30 && dest.y >= -30 && dest.x <= W + 30 && dest.y <= H + 30) {
      this.ctx.shadowColor = 'rgba(239, 68, 68, 0.9)';
      this.ctx.shadowBlur = 12;

      // Ground pulse ring under pin
      const pulseR = 10 + 4 * Math.sin(now / 300);
      this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(dest.x, dest.y, pulseR, 0, Math.PI * 2);
      this.ctx.stroke();

      // Red Pin teardrop body
      const pinR = 10;
      this.ctx.fillStyle = '#ef4444';
      this.ctx.beginPath();
      this.ctx.arc(dest.x, dest.y - 14, pinR, Math.PI * 0.85, Math.PI * 0.15, false);
      this.ctx.lineTo(dest.x, dest.y);
      this.ctx.closePath();
      this.ctx.fill();

      // Pin stroke
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();

      // Pin inner white dot
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(dest.x, dest.y - 14, 3.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();

    // Off-screen waypoint arrow
    const wp = toScreen(this.state.activeWaypoint);
    if (wp.x < 0 || wp.x > W || wp.y < 0 || wp.y > H) {
      this.renderEdgeArrow(W, H, wp.x, wp.y, '#38bdf8',
        this.smoothPos ? Math.round(Math.hypot(this.state.activeWaypoint.x - this.smoothPos.x, this.state.activeWaypoint.y - this.smoothPos.y)) + 'm' : '');
    }
  }

  private renderOffScreenRadar(W: number, H: number, toScreen: (p: Point) => Point) {
    if (this.state.isFullScreen) return;
    if (!this.state.showOffScreenRadar) return;
    const minRarityOrder: Record<string, number> = { common: 0, uncommon: 1, rare: 2, mystical: 3, mythical: 3 };
    const minRarityThreshold = minRarityOrder[this.state.radarMinRarity || 'rare'] ?? 2;

    // Helper: map angle (radians) to one of 8 named sectors
    const angleToSector = (angle: number): string => {
      // Normalize to [0, 2π)
      const a = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const step = Math.PI / 4; // 45° per sector
      const idx = Math.round(a / step) % 8;
      return ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'][idx];
    };

    const cx = W / 2, cy = H / 2;

    interface SectorData {
      count: number;
      highestRank: number;
      color: string;
      bestTx: number;   // screen coords of the closest entity in this sector
      bestTy: number;
      bestDist: number; // distance from player for label
    }
    const sectors: Record<string, SectorData> = {};

    const processEntity = (e: any) => {
      if (!e.pos) return;
      const info = this.getCachedType(e.type || e.resource || e.statsKey || '');
      if (!info) return;
      const rarityRank = minRarityOrder[info.rarity] ?? 0;
      if (rarityRank < minRarityThreshold) return;

      const s = toScreen(e.pos);
      if (s.x >= 0 && s.x <= W && s.y >= 0 && s.y <= H) return; // on-screen, skip

      const angle = Math.atan2(s.y - cy, s.x - cx);
      const sectorKey = angleToSector(angle);

      const dist = this.smoothPos
        ? Math.round(Math.hypot(e.pos.x - this.smoothPos.x, e.pos.y - this.smoothPos.y))
        : 0;

      if (!sectors[sectorKey]) {
        sectors[sectorKey] = {
          count: 1,
          highestRank: rarityRank,
          color: RARITY_COLORS[info.rarity] || RARITY_COLORS.common,
          bestTx: s.x,
          bestTy: s.y,
          bestDist: dist,
        };
      } else {
        sectors[sectorKey].count++;
        // Upgrade to higher rarity
        if (rarityRank > sectors[sectorKey].highestRank) {
          sectors[sectorKey].highestRank = rarityRank;
          sectors[sectorKey].color = RARITY_COLORS[info.rarity] || RARITY_COLORS.common;
          sectors[sectorKey].bestTx = s.x;
          sectors[sectorKey].bestTy = s.y;
          sectors[sectorKey].bestDist = dist;
        }
        // Track closest entity as the arrow representative
        if (rarityRank === sectors[sectorKey].highestRank && dist < sectors[sectorKey].bestDist) {
          sectors[sectorKey].bestTx = s.x;
          sectors[sectorKey].bestTy = s.y;
          sectors[sectorKey].bestDist = dist;
        }
      }
    };

    for (const e of this.state.enemies) {
      if (!e.isDead && !e.isStatic) processEntity(e);
    }
    for (const r of this.state.resources) {
      if (!r.gathered && !r.isStatic) processEntity(r);
    }

    // Render one clustered badge arrow per occupied sector
    for (const data of Object.values(sectors)) {
      const label = data.count > 1
        ? `×${data.count}`
        : `${data.bestDist}m`;
      this.renderEdgeArrow(W, H, data.bestTx, data.bestTy, data.color, label);
    }
  }

  private renderEdgeArrow(W: number, H: number, tx: number, ty: number, color: string, label: string) {
    const cx = W / 2, cy = H / 2;
    const MARGIN = 18;
    const angle = Math.atan2(ty - cy, tx - cx);
    const adx = Math.cos(angle), ady = Math.sin(angle);
    const halfW = cx - MARGIN, halfH = cy - MARGIN;
    const t = Math.min(adx !== 0 ? Math.abs(halfW / adx) : Infinity, ady !== 0 ? Math.abs(halfH / ady) : Infinity);
    const tipX = cx + adx * t, tipY = cy + ady * t;

    this.ctx.save();
    this.ctx.translate(tipX, tipY);
    this.ctx.rotate(angle);
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur  = 8;
    this.ctx.fillStyle   = color;
    this.ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    this.ctx.lineWidth   = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(11, 0); this.ctx.lineTo(-7, -6); this.ctx.lineTo(-7, 6);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.restore();

    if (label) {
      this.ctx.save();
      this.ctx.font = 'bold 9px Inter,sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      let lx = tipX, ly = tipY;
      if (tipY <= cy - halfH + 1) ly += 16;
      else if (tipY >= cy + halfH - 1) ly -= 22;
      if (tipX <= cx - halfW + 1) lx += 20;
      else if (tipX >= cx + halfW - 1) lx -= 20;
      const tw = this.ctx.measureText(label).width;
      lx = Math.max(tw / 2 + 2, Math.min(W - tw / 2 - 2, lx));
      ly = Math.max(2, Math.min(H - 12, ly));
      this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
      this.ctx.fillText(label, lx + 1, ly + 1);
      this.ctx.fillStyle = '#e0f2fe';
      this.ctx.fillText(label, lx, ly);
      this.ctx.restore();
    }
  }

  private renderHoverHint(toScreen: (p: Point) => Point) {
    if (this.state.activeWaypoint) return;
    if (this.mouseX < 0) return;
    const now = Date.now();
    const pulse = 1 + 0.15 * Math.sin(now / 250);

    const checkAndDraw = (entities: any[], colorFn: (e: any) => string, rFn: (e: any) => number) => {
      for (const e of entities) {
        const pos = e.pos || (e.x !== undefined ? { x: e.x, y: e.y } : null);
        if (!pos) continue;
        const s = toScreen(pos);
        const baseR = rFn(e);
        if (Math.hypot(s.x - this.mouseX, s.y - this.mouseY) <= baseR + 8) {
          const r = (baseR + 6) * pulse;
          const color = colorFn(e);
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
          this.ctx.setLineDash([4, 4]);
          this.ctx.lineDashOffset = -(now % 10000) / 40;
          this.ctx.strokeStyle = color;
          this.ctx.lineWidth   = 1.5;
          this.ctx.globalAlpha = 0.8;
          this.ctx.shadowColor = color;
          this.ctx.shadowBlur  = 6;
          this.ctx.stroke();
          this.ctx.setLineDash([]);
          this.ctx.restore();
          return true;
        }
      }
      return false;
    };

    checkAndDraw(this.state.enemies,  () => '#f87171', () => 6) ||
    checkAndDraw(this.state.resources, (r) => {
      const info = this.getCachedType(r.resource || r.type || '');
      return RARITY_COLORS[info?.rarity || 'common'] || '#38bdf8';
    }, () => 5) ||
    checkAndDraw(this.state.entries, () => '#22ff66', () => 7);
  }

  private renderDiscoveryBar(W: number, _H: number) {
    if (this.state.isFullScreen) return;
    // BUG-MINI-03: Uses cached gradient — no allocation per frame.
    if (!this.state.showDiscoveryBar) return;
    const pct = this.state.discoveryPercent / 100;
    const BAR_W = Math.round(W * 0.75);
    const BAR_H = 3;
    const x = Math.round((W - BAR_W) / 2);
    const y = 6;

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, BAR_W, BAR_H, 2);
    this.ctx.fill();

    if (pct > 0 && this.cachedDiscBarGrad) {
      this.ctx.fillStyle = this.cachedDiscBarGrad;
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, Math.round(BAR_W * pct), BAR_H, 2);
      this.ctx.fill();
    }

    this.ctx.font         = 'bold 8px Inter,monospace';
    this.ctx.fillStyle    = 'rgba(255,255,255,0.55)';
    this.ctx.textAlign    = 'right';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(`${Math.round(this.state.discoveryPercent)}%`, x + BAR_W, y + 5);
    this.ctx.restore();
  }

  private renderNoSignal(W: number, H: number) {
    this.ctx.fillStyle = '#080c14';
    this.ctx.fillRect(0, 0, W, H);
    // Scan lines
    for (let y = 0; y < H; y += 4) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
      this.ctx.fillRect(0, y, W, 2);
    }
    const now = Date.now();
    const blink = Math.sin(now / 700) > 0;
    this.ctx.save();
    this.ctx.textAlign    = 'center';
    this.ctx.textBaseline = 'middle';
    const fs = Math.max(11, Math.round(H * 0.12));
    this.ctx.font = `bold ${fs}px monospace`;
    if (blink) {
      this.ctx.shadowColor = '#5aff78';
      this.ctx.shadowBlur  = 6;
      this.ctx.fillStyle   = '#5aff78';
    } else {
      this.ctx.fillStyle = '#2a4a30';
    }
    this.ctx.fillText('NO SIGNAL', W / 2, H / 2);
    this.ctx.restore();

    // Vignette
    const vign = this.ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.6);
    vign.addColorStop(0, 'rgba(0,0,0,0)');
    vign.addColorStop(1, 'rgba(0,0,0,0.95)');
    this.ctx.fillStyle = vign;
    this.ctx.fillRect(0, 0, W, H);
  }

  // ── Main render ────────────────────────────────────────────────────────────

  private render(dt: number) {
    const W = this.canvas.width, H = this.canvas.height;

    // No-signal state
    if (!this.state.isFullScreen && !this.state.trail.length && !this.state.playerPos && !this.state.entries.length) {
      this.renderNoSignal(W, H);
      return;
    }

    this.ensureTrailLayer();
    this.ensureFogLayer();
    this.updatePhysics(dt);

    const vp = this.calculateViewport(W, H);
    const { vMinX, vMaxX, vMinY, vMaxY, rangeX, rangeY, screenScale, offX, offY, toScreen } = vp;

    // ── 1. Atmospheric dark background (BUG-MINI-01: cached gradient) ──
    this._ensureGradients(W, H);
    this.ctx.fillStyle = this.cachedBgGrad!;
    this.ctx.fillRect(0, 0, W, H);

    // BUG-MINI-09: Scanline overlay — single drawImage from pre-baked canvas
    if (this.scanlineCanvas) {
      this.ctx.globalAlpha = 0.5;
      this.ctx.drawImage(this.scanlineCanvas, 0, 0);
      this.ctx.globalAlpha = 1;
    }

    // ── 2. Fog of war ──────────────────────────────────────────────────────
    this.renderFogLayer(vMinX, vMaxY, rangeX, rangeY, screenScale, offX, offY);

    // ── 3. Trail layer ─────────────────────────────────────────────────────
    this.renderTrailLayer(vMinX, vMaxY, rangeX, rangeY, screenScale, offX, offY);

    // ── 3.5. Community boundary outline ────────────────────────────────────
    this.renderCommunityBoundary(toScreen);

    // ── 4. Discovery beam ──────────────────────────────────────────────────
    this.renderDiscoveryBeam(toScreen);

    // ── 5. Grid ────────────────────────────────────────────────────────────
    this.renderGrid(W, H, toScreen, vMinX, vMaxX, vMinY, vMaxY);

    // ── 6–9. Entities ──────────────────────────────────────────────────────
    const hovered: { entity: any; distSq: number } = { entity: null, distSq: Infinity };
    this.renderResources(W, H, toScreen, hovered);
    this.renderEnemies(W, H, toScreen, hovered);
    this.renderDrops(W, H, toScreen);
    this.renderPortals(W, H, toScreen, hovered);

    // ── 10. Hover hint ─────────────────────────────────────────────────────
    this.renderHoverHint(toScreen);

    // ── 11. Player ─────────────────────────────────────────────────────────
    this.renderPlayerArrow(toScreen);

    // ── 12. Waypoint + path ────────────────────────────────────────────────
    this.renderWaypoint(W, H, toScreen);

    // ── 13. Death spot ─────────────────────────────────────────────────────
    this.renderDeathSpot(toScreen);

    // ── 14. Off-screen radar ───────────────────────────────────────────────
    this.renderOffScreenRadar(W, H, toScreen);

    // ── 15. Discovery bar ──────────────────────────────────────────────────
    this.renderDiscoveryBar(W, H);

    // ── 16. Premium edge vignette (BUG-MINI-02: cached gradient) ──
    this.ctx.fillStyle = this.cachedVignGrad!;
    this.ctx.fillRect(0, 0, W, H);
    // Subtle inner corner glow (cached)
    this.ctx.fillStyle = this.cachedCornerGrad!;
    this.ctx.fillRect(0, 0, W, H);

    // Only request frame if physics/animations are active
    const hasPhysicsMoving = (this.state.playerPos && this.smoothPos && Math.hypot(this.state.playerPos.x - this.smoothPos.x, this.state.playerPos.y - this.smoothPos.y) > 0.05)
      || Math.hypot(this.state.pan.x - this.smoothPan.x, this.state.pan.y - this.smoothPan.y) > 0.05
      || Math.abs(this.state.zoom - this.smoothZoom) > 0.005
      || !!this.state.activeWaypoint
      || (this.state.isFullScreen && this.state.communityTrail && this.state.communityTrail.length > 0);

    if (hasPhysicsMoving) {
      this.needsRender = true;
    }

    // Hover callback
    if (this.config.onHoverMarker) this.config.onHoverMarker(hovered.entity);

    this.ctx.globalAlpha = 1;
  }
}
