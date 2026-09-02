import { Point } from '../../store/types';
// @ts-ignore
import PathfinderWorker from './pathfinder.worker?worker&inline';

export class PathfinderService {
  private static worker: Worker | null = null;
  private static pendingResolves: Map<number, (path: Point[]) => void> = new Map();
  private static msgCounter = 0;


  private static initWorker() {
    if (!this.worker) {
      this.worker = new PathfinderWorker();
      this.worker!.onmessage = (e) => {
        const { msgId, path } = e.data;
        const resolve = this.pendingResolves.get(msgId);
        if (resolve) {
          resolve(path);
          this.pendingResolves.delete(msgId);
        }
      };
    }
  }

  /**
   * Generates an A* route from start to target using the trail grid.
   */
  public static async generatePath(
    start: Point,
    end: Point,
    trailData: string
  ): Promise<Point[]> {
    if (!start || !end) return [];
    if (!trailData) return [start, end];

    this.initWorker();

    this.msgCounter++;
    const msgId = this.msgCounter;


    // Reject all older pending requests to avoid queue clogging
    for (const [id, resolve] of Array.from(this.pendingResolves.entries())) {
      if (id < msgId) {
        resolve([start, end]); // Fallback immediately
        this.pendingResolves.delete(id);
      }
    }

    return new Promise((resolve) => {
      this.pendingResolves.set(msgId, resolve);
      this.worker!.postMessage({ start, target: end, trailData, msgId });
    });
  }
}
