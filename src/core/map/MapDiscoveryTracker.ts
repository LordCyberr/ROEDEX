import { Point } from '../../store/types';

/**
 * MapDiscoveryTracker — pure utility (no React, no Zustand)
 * Computes discovery % for a zone based on unique trail grid cells visited.
 */
export class MapDiscoveryTracker {
  // World-unit size per discovery cell. Larger = fewer cells = faster compute
  static readonly CELL_SIZE = 5;

  // Per-zone walkable area estimates (in world units²)
  // Tuned to give ~100% when the whole zone is walked
  private static readonly ZONE_AREAS: Record<string, number> = {
    'Forest':       22000,
    'Mine':         8000,
    'Mines Lower':  6000,
    'Cave':         5000,
    'Beach':        10000,
    'Village':      12000,
  };

  private static readonly DEFAULT_AREA = 15000;

  /**
   * Returns discovery percentage (0–100) for a zone.
   * Uses a Set of quantized cell keys for O(n) unique-cell counting.
   */
  static compute(trailPoints: Point[], zone: string): number {
    if (!trailPoints || trailPoints.length === 0) return 0;

    const visited = new Set<number>();
    const cs = this.CELL_SIZE;

    for (const p of trailPoints) {
      const cx = Math.round(p.x / cs);
      const cy = Math.round(p.y / cs);
      // Pack two 16-bit ints into a single 32-bit key (fast, no string alloc)
      visited.add(((cx + 32768) << 16) | (cy + 32768));
    }

    const area = this.ZONE_AREAS[zone] ?? this.DEFAULT_AREA;
    const maxCells = Math.ceil(area / (cs * cs));
    return Math.min(100, Math.round((visited.size / maxCells) * 100));
  }

  /**
   * Returns the count of unique discovered cells (for display / achievements).
   */
  static uniqueCells(trailPoints: Point[]): number {
    if (!trailPoints || trailPoints.length === 0) return 0;
    const visited = new Set<number>();
    const cs = this.CELL_SIZE;
    for (const p of trailPoints) {
      const cx = Math.round(p.x / cs);
      const cy = Math.round(p.y / cs);
      visited.add(((cx + 32768) << 16) | (cy + 32768));
    }
    return visited.size;
  }
}
