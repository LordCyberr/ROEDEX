import { MapCompressor } from '../map/MapCompressor';

// Priority Queue for A* algorithm
class MinHeap<T> {
  private heap: { node: T; score: number }[] = [];

  push(node: T, score: number) {
    this.heap.push({ node, score });
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const result = this.heap[0].node;
    const end = this.heap.pop();
    if (this.heap.length > 0 && end) {
      this.heap[0] = end;
      this.sinkDown(0);
    }
    return result;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  private bubbleUp(n: number) {
    const element = this.heap[n];
    let i = n;
    while (i > 0) {
      const parentIndex = Math.floor((i - 1) / 2);
      const parent = this.heap[parentIndex];
      if (element.score >= parent.score) break;
      this.heap[parentIndex] = element;
      this.heap[i] = parent;
      i = parentIndex;
    }
  }

  private sinkDown(n: number) {
    const length = this.heap.length;
    const element = this.heap[n];
    let i = n;
    while (true) {
      const leftChildIdx = 2 * i + 1;
      const rightChildIdx = 2 * i + 2;
      let leftChild, rightChild;
      let swap = null;

      if (leftChildIdx < length) {
        leftChild = this.heap[leftChildIdx];
        if (leftChild.score < element.score) {
          swap = leftChildIdx;
        }
      }
      if (rightChildIdx < length) {
        rightChild = this.heap[rightChildIdx];
        if (
          (swap === null && rightChild.score < element.score) ||
          (swap !== null && leftChild && rightChild.score < leftChild.score)
        ) {
          swap = rightChildIdx;
        }
      }

      if (swap === null) break;
      this.heap[i] = this.heap[swap];
      this.heap[swap] = element;
      i = swap;
    }
  }
}

let cachedPoints: { x: number, y: number }[] = [];
let cachedTrailData: string = '';
let spatialHash: Map<string, number[]> = new Map();

self.onmessage = (e: MessageEvent) => {
  const { start, target, trailData, msgId } = e.data;
  
  if (!start || !target || !trailData) {
    self.postMessage({ msgId, path: [start, target] });
    return;
  }

  try {
    if (trailData !== cachedTrailData) {
      cachedPoints = MapCompressor.unpackTrail(trailData);
      cachedTrailData = trailData;
      
      // Build spatial hash for shortcuts to allow crossing loops in the trail
      spatialHash = new Map();
      const cellSize = 50; // 50 units per cell
      for (let i = 0; i < cachedPoints.length; i++) {
        const p = cachedPoints[i];
        const key = `${Math.floor(p.x / cellSize)},${Math.floor(p.y / cellSize)}`;
        let cell = spatialHash.get(key);
        if (!cell) {
          cell = [];
          spatialHash.set(key, cell);
        }
        cell.push(i);
      }
    }

    if (cachedPoints.length === 0) {
      self.postMessage({ msgId, path: [start, target] });
      return;
    }

    // Find closest start and target points in the graph
    let startIdx = 0;
    let targetIdx = 0;
    let minStartDist = Infinity;
    let minTargetDist = Infinity;

    for (let i = 0; i < cachedPoints.length; i++) {
      const p = cachedPoints[i];
      const dStart = (p.x - start.x) ** 2 + (p.y - start.y) ** 2;
      if (dStart < minStartDist) {
        minStartDist = dStart;
        startIdx = i;
      }
      const dTarget = (p.x - target.x) ** 2 + (p.y - target.y) ** 2;
      if (dTarget < minTargetDist) {
        minTargetDist = dTarget;
        targetIdx = i;
      }
    }

    if (startIdx === targetIdx) {
      self.postMessage({ msgId, path: [start, cachedPoints[startIdx], target] });
      return;
    }

    // A* over the points graph
    const gScore = new Float64Array(cachedPoints.length);
    gScore.fill(Infinity);
    gScore[startIdx] = 0;
    
    const cameFrom = new Int32Array(cachedPoints.length);
    cameFrom.fill(-1);

    const heuristic = (idx: number) => {
      const p = cachedPoints[idx];
      const t = cachedPoints[targetIdx];
      return Math.sqrt((p.x - t.x)**2 + (p.y - t.y)**2);
    };

    const fScore = new Float64Array(cachedPoints.length);
    fScore.fill(Infinity);
    fScore[startIdx] = heuristic(startIdx);

    const openSet = new MinHeap<number>();
    openSet.push(startIdx, fScore[startIdx]);

    const cellSize = 50;
    const MAX_SHORTCUT_DIST_SQ = 60 * 60; // Max 60 units for a spatial shortcut jump

    let found = false;
    let iterations = 0;

    while (!openSet.isEmpty()) {
      iterations++;
      if (iterations > 100000) break;

      const current = openSet.pop()!;
      if (current === targetIdx) {
        found = true;
        break;
      }

      const currentG = gScore[current];
      const p = cachedPoints[current];

      const neighbors: {idx: number, cost: number}[] = [];
      
      // Sequential neighbors (following the trail perfectly)
      if (current > 0) {
        const prev = cachedPoints[current - 1];
        neighbors.push({ idx: current - 1, cost: Math.hypot(p.x - prev.x, p.y - prev.y) });
      }
      if (current < cachedPoints.length - 1) {
        const next = cachedPoints[current + 1];
        neighbors.push({ idx: current + 1, cost: Math.hypot(p.x - next.x, p.y - next.y) });
      }

      // Spatial shortcuts (jumping across loops)
      const cx = Math.floor(p.x / cellSize);
      const cy = Math.floor(p.y / cellSize);
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const key = `${cx + dx},${cy + dy}`;
          const cellPoints = spatialHash.get(key);
          if (cellPoints) {
            for (let i = 0; i < cellPoints.length; i++) {
              const nIdx = cellPoints[i];
              if (Math.abs(nIdx - current) > 5) { // Only consider if it skips points to prevent redundant edges
                const np = cachedPoints[nIdx];
                const distSq = (p.x - np.x)**2 + (p.y - np.y)**2;
                if (distSq < MAX_SHORTCUT_DIST_SQ) {
                  neighbors.push({ idx: nIdx, cost: Math.sqrt(distSq) });
                }
              }
            }
          }
        }
      }

      for (let i = 0; i < neighbors.length; i++) {
        const { idx, cost } = neighbors[i];
        const tentativeG = currentG + cost;
        if (tentativeG < gScore[idx]) {
          cameFrom[idx] = current;
          gScore[idx] = tentativeG;
          const f = tentativeG + heuristic(idx);
          fScore[idx] = f;
          openSet.push(idx, f);
        }
      }
    }

    if (found) {
      const pathPoints = [];
      let curr = targetIdx;
      while (curr !== startIdx) {
        pathPoints.unshift(cachedPoints[curr]);
        curr = cameFrom[curr];
      }
      pathPoints.unshift(cachedPoints[startIdx]);
      
      pathPoints.unshift(start);
      pathPoints.push(target);
      
      self.postMessage({ msgId, path: pathPoints });
    } else {
      // Fallback
      self.postMessage({ msgId, path: [start, target] });
    }

  } catch (err) {
    console.error("Pathfinder worker error:", err);
    self.postMessage({ msgId, path: [start, target] });
  }
};
