import { memo } from 'react';
import { useTrackerStore } from '../../../store/trackerStore';
import { Vector2 } from '../../../types/events';

export const DistanceDisplay = memo(({ targetPos }: { targetPos: Vector2 | undefined }) => {
  const playerPos = useTrackerStore((state) => state.playerPosition);
  
  if (!targetPos || !playerPos) return <span>--</span>;
  
  const dx = playerPos.x - targetPos.x;
  const dy = playerPos.y - targetPos.y;
  const dist = Math.round(Math.sqrt(dx * dx + dy * dy));
  
  return (
    <div className="flex items-center justify-end gap-1">
      <span>{dist}m</span>
    </div>
  );
});
