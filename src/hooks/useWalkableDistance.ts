import { useState, useEffect } from 'react';
import { Vector2 } from '../types/events';
import { PathfinderService } from '../core/pathfinding/PathfinderService';
import { useTrackerStore } from '../store/trackerStore';

export const useWalkableDistance = (
  zone: string, 
  p1: Vector2 | null, 
  p2: Vector2 | null,
  showDistance: boolean
) => {
  const [result, setResult] = useState<{distance: number, path: {x: number, y: number}[]}>({distance: -1, path: []});

  useEffect(() => {
    if (!p1 || !p2 || !showDistance) {
      setResult({distance: -1, path: []});
      return;
    }

    const trailData = useTrackerStore.getState().trails[zone] || '';
    
    let isMounted = true;
    PathfinderService.generatePath(p1, p2, trailData).then(path => {
      if (!isMounted) return;
      if (path && path.length > 0) {
        let dist = 0;
        for (let i = 0; i < path.length - 1; i++) {
          dist += Math.hypot(path[i+1].x - path[i].x, path[i+1].y - path[i].y);
        }
        setResult({ distance: dist, path });
      } else {
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        setResult({ distance: dist, path: [] });
      }
    });

    return () => { isMounted = false; };
  }, [zone, p1?.x, p1?.y, p2?.x, p2?.y, showDistance]);

  return result;
};
