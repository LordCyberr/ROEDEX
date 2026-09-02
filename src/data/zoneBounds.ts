export interface ZoneBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  displayName: string;
}

export const ZONE_BOUNDS: Record<string, ZoneBounds> = {
  mines: { minX: -325, maxX: 157, minY: -59, maxY: 161, displayName: 'The Mines' },
  town: { minX: -100, maxX: 200, minY: -100, maxY: 200, displayName: 'Town Square' },
  forest: { minX: -200, maxX: 300, minY: -150, maxY: 250, displayName: 'Dark Forest' },
  beach: { minX: -150, maxX: 250, minY: -100, maxY: 200, displayName: 'Sunkissed Shore' }
};

// Returns the bounds for the current zone string, or null if uncalibrated
export function getBoundsForZone(zone: string): ZoneBounds | null {
  if (!zone) return null;
  const key = zone.toLowerCase().trim();
  for (const [k, v] of Object.entries(ZONE_BOUNDS)) {
    if (key.includes(k)) return v;
  }
  return null;
}
