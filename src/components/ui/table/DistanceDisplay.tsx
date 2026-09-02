import { memo } from 'react';
import { useTrackerStore } from '../../../store/trackerStore';
import { Vector2 } from '../../../types/events';

export const DistanceDisplay = memo(({ targetPos }: { targetPos: Vector2 | undefined }) => {
  const dist = useTrackerStore((state) => {
    const pp = state.playerPosition;
    if (!pp || !targetPos) return null;
    const dx = pp.x - targetPos.x;
    const dy = pp.y - targetPos.y;
    return Math.round(Math.sqrt(dx * dx + dy * dy));
  });
  
  if (dist === null) return <span>--</span>;
  
  return (
    <div className="flex items-center justify-end gap-1">
      <span>{dist}m</span>
    </div>
  );
});
