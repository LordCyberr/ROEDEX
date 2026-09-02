import { Point } from '../../store/types';

const MAZE_TRAIL_MIN_STEP = 2.2; // Based on MrSnorch's grid dedup setting

export class MapCompressor {
  /**
   * Packs an array of points into a compressed Base64 string.
   * Coordinates are divided by MAZE_TRAIL_MIN_STEP, rounded, and stored as Int16.
   */
  static packTrail(points: Point[]): string {
    const buf = new Int16Array(points.length * 2);
    for (let i = 0; i < points.length; i++) {
      buf[i * 2] = Math.round(points[i].x / MAZE_TRAIL_MIN_STEP);
      buf[i * 2 + 1] = Math.round(points[i].y / MAZE_TRAIL_MIN_STEP);
    }
    
    const bytes = new Uint8Array(buf.buffer);
    let bin = '';
    // Use chunks to avoid call stack exceeded on very large arrays
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      bin += String.fromCharCode.apply(null, Array.from(bytes.slice(i, i + chunkSize)));
    }
    return btoa(bin);
  }

  /**
   * Unpacks a Base64 string back into an array of points.
   */
  static unpackTrail(b64: string): Point[] {
    if (!b64) return [];
    try {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
      }
      
      const buf = new Int16Array(bytes.buffer, 0, Math.floor(bytes.length / 2));
      const points: Point[] = [];
      for (let i = 0; i + 1 < buf.length; i += 2) {
        points.push({
          x: buf[i] * MAZE_TRAIL_MIN_STEP,
          y: buf[i + 1] * MAZE_TRAIL_MIN_STEP
        });
      }
      return points;
    } catch (e) {
      console.error("Failed to unpack trail string:", e);
      return [];
    }
  }
}
