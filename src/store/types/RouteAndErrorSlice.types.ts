export interface RoutePoint {
  timestamp: number;
  action: 'move' | 'kill' | 'gather' | 'enter_zone' | 'custom_marker' | 'jump' | 'erased';
  x: number;
  y: number;
  detail?: string;
  lineWidth?: number;
  dir?: 'U' | 'D' | 'L' | 'R';
  z?: number;
}

export interface RouteRecorderSlice {
  isRecording: boolean;
  isRecordingBarrier: boolean;
  currentBarrierSessionTime: number;
  recordedRoutes: Record<string, RoutePoint[]>;
  recordedBarriers: Record<string, RoutePoint[]>;

  /** Polygon being drawn in real-time while barrier recording (for live preview). */
  barrierPreviewPolygon: { x: number; y: number }[];

  startRecording: () => void;
  stopRecording: () => void;
  toggleBarrierRecording: () => void;
  addRoutePoint: (point: Omit<RoutePoint, 'timestamp'>, zoneOverride?: string, target?: 'path' | 'barrier') => void;
  manualDrawPoint: (point: Omit<RoutePoint, 'timestamp'>, zone: string, target: 'path' | 'barrier') => void;

  /** When barrier forms a closed loop, fills the interior as explored fog cells. */
  closeAndFillCurrentBarrier: (zone: string) => void;

  /** Update the live barrier polygon preview (called from RAF loop). */
  setBarrierPreviewPolygon: (pts: { x: number; y: number }[]) => void;

  exportRoute: () => void;
  exportDiscoveredArea: () => void;
  importMergedData: (data: any) => void;
  cleanTeleportLines: (targetZone?: string) => void;
  eraseRoutePointsNear: (zone: string, x: number, y: number, radius?: number) => void;
  clearRoute: (zone?: string) => void;
  currentZLevel: number;
  setZLevel: (z: number) => void;
  /** Fetches staticBarriers.json at runtime and merges it into recordedBarriers. */
  loadStaticBarriers: () => Promise<void>;

  zonePortals: Record<string, any[]>;
  pendingPortalEntrance: any | null;
  registerPortal: (portal: any) => void;
  clearZonePortals: (zone?: string) => void;
}


export interface ErrorLog {
  timestamp: string;
  message: string;
  stack?: string;
  zone: string | null;
}

export interface ErrorLogSlice {
  errorLogs: ErrorLog[];
  logError: (message: string, stack?: string) => void;
  clearErrors: () => void;
}
