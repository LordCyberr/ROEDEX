/**
 * SpatialHashGrid.ts — O(1) Spatial Hash Grid for 2D Query Acceleration
 *
 * Buckets spatial objects into a grid based on world coordinates.
 * Used to accelerate hover detection and entity collision checks from O(N) to O(1).
 */

export interface SpatialItem<T> {
  x: number;
  y: number;
  item: T;
}

export class SpatialHashGrid<T> {
  private cellSize: number;
  private grid: Map<string, SpatialItem<T>[]>;

  constructor(cellSize = 50) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  private getKey(x: number, y: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    return `${cx},${cy}`;
  }

  public clear(): void {
    this.grid.clear();
  }

  public insert(x: number, y: number, item: T): void {
    const key = this.getKey(x, y);
    let cell = this.grid.get(key);
    if (!cell) {
      cell = [];
      this.grid.set(key, cell);
    }
    cell.push({ x, y, item });
  }

  public queryRadius(x: number, y: number, radius: number): T[] {
    const minCx = Math.floor((x - radius) / this.cellSize);
    const maxCx = Math.floor((x + radius) / this.cellSize);
    const minCy = Math.floor((y - radius) / this.cellSize);
    const maxCy = Math.floor((y + radius) / this.cellSize);

    const results: T[] = [];
    const radiusSq = radius * radius;

    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const key = `${cx},${cy}`;
        const cell = this.grid.get(key);
        if (cell) {
          for (let i = 0; i < cell.length; i++) {
            const dx = cell[i].x - x;
            const dy = cell[i].y - y;
            if (dx * dx + dy * dy <= radiusSq) {
              results.push(cell[i].item);
            }
          }
        }
      }
    }

    return results;
  }
}
