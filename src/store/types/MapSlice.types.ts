export interface Point { x: number, y: number }

export interface MapSettings {
  enabled: boolean;
  borderless?: boolean;
  mapSize?: number;
  opacity?: number;
  edgeGlow?: boolean;
  crtGlitch?: boolean;
  showCommon?: boolean;
  showUncommon?: boolean;
  showRare?: boolean;
  showMythical?: boolean;
  showOres?: boolean;
  showTrees?: boolean;
  showPlants?: boolean;
  showResources?: boolean;
  showDrops?: boolean;
  showMobs?: boolean;
  showPortals?: boolean;
  hiddenMobs?: string[];
  hiddenResources?: string[];
  autoRecenter?: boolean;
  autoRecenterDelay?: number;
  mapRefreshRate?: '60' | '144' | 'uncapped';
  mapTheme?: 'glass' | 'cyber' | 'tactical' | 'minimal' | 'dark' | 'satellite';
  defaultZoom?: number;
  mapPosition?: { x: number; y: number };
  iconStyle?: 'vector_detailed' | 'minimal_icons' | 'geometric' | 'hollow_shapes' | 'high_contrast' | 'retro_pixel';
  iconScaleMultiplier?: number;
  dimmedOpacity?: number;
  customColors?: Record<string, string>;
  showCompass?: boolean;
  showGrid?: boolean;
  showScaleBar?: boolean;
  showCoordinates?: boolean;
  recordPaths?: boolean;

  // ── AAA Map v2 Features ──────────────────────────────────────────────────
  fogOfWar?: boolean;
  showDiscoveryBar?: boolean;
  discoveryBeam?: boolean;
  showOffScreenRadar?: boolean;
  radarMinRarity?: 'uncommon' | 'rare' | 'mystical';
  borderGlowStyle?: 'pulse' | 'static' | 'off';
  trailColor?: string;
  trailGradient?: boolean;

  showZonePill?: boolean;
  mapShape?: 'circle' | 'square' | 'rectangle';
  mapWidth?: number;   // used when mapShape === 'rectangle' (or square as alias for mapSize)
  mapHeight?: number;  // used when mapShape === 'rectangle'
}

export interface MapSlice {
  // Config
  mapSettings: MapSettings;

  // Stored state
  trails: Record<string, string>; // zone -> base64 packed trail
  customZones: string[];
  deathSpot: Point | null;
  isRecordingTrail: boolean;
  isEraserMode: boolean;

  // Transient Map View State
  mapPan: Point;
  mapZoom: number;

  // Actions
  updateMapSettings: (settings: Partial<MapSettings>) => void;
  appendTrailPoints: (zone: string, points: Point[]) => void;
  eraseTrailPoints: (zone: string, center: Point, radius: number) => void;
  setDeathSpot: (point: Point | null) => void;
  setMapPan: (pan: Point) => void;
  setMapZoom: (zoom: number) => void;
  clearTrail: (zone: string) => void;
  setIsRecordingTrail: (val: boolean) => void;
  setIsEraserMode: (val: boolean) => void;
}
