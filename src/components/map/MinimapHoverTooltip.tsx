import React, { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';
import { ResourceTracker } from '../../core/trackers/ResourceTracker';

// ── Hover Tooltip ─────────────────────────────────────────────────────────────
export const HoverTooltip: React.FC<{
  hoveredEntity: any;
  timers: Record<string, any>;
  mapSize: number;
  ringInset: number;
}> = React.memo(({ hoveredEntity, timers, mapSize, ringInset }) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!hoveredEntity) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [hoveredEntity]);

  if (!hoveredEntity) return null;

  const timer = timers[hoveredEntity.id];
  const hasTimer = timer && timer.expectedRespawnTime > now;
  const remaining = hasTimer ? Math.ceil((timer.expectedRespawnTime - now) / 1000) : 0;
  const mm = Math.floor(remaining / 60).toString().padStart(2, '0');
  const ss = (remaining % 60).toString().padStart(2, '0');
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const posX = clamp((hoveredEntity.screenX ?? 0) + ringInset, 50, mapSize - 50);
  const posY = clamp((hoveredEntity.screenY ?? 0) + ringInset - 20, 20, mapSize - 20);
  const accentColor = hoveredEntity.type === 'mob' ? '#f87171' : hoveredEntity.type === 'entrance' ? '#22ff66' : '#38bdf8';

  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{
        left: posX, top: posY,
        transform: 'translate(-50%, -100%)',
        background: 'rgba(4,10,28,0.95)',
        border: `1px solid ${accentColor}50`,
        borderRadius: 8,
        padding: '5px 10px',
        backdropFilter: 'blur(20px)',
        boxShadow: `0 4px 20px rgba(0,0,0,0.9), 0 0 10px ${accentColor}25`,
        minWidth: 80,
      }}
    >
      {hasTimer ? (
        <>
          <div className="font-bold text-[11px] text-center whitespace-nowrap" style={{ color: accentColor }}>
            {ResourceTracker.sanitizeResourceName(hoveredEntity.name)}
          </div>
          <div className="text-[9px] font-black mt-0.5 text-amber-400 flex items-center justify-center gap-1">
            <Timer size={9} className="animate-pulse" />
            <span>{mm}:{ss}</span>
          </div>
        </>
      ) : (
        <div className="font-bold text-[11px] whitespace-nowrap flex items-center gap-1.5" style={{ color: accentColor }}>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accentColor, boxShadow: `0 0 6px ${accentColor}` }} />
          {ResourceTracker.sanitizeResourceName(hoveredEntity.name)}
        </div>
      )}
    </div>
  );
});
