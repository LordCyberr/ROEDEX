import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { ZoneEntrances } from '../../data/routing';
import { X } from 'lucide-react';

export const DirectionalArrow: React.FC = () => {
  const waypoint = useTrackerStore(state => state.activeWaypoint);
  const waypointName = useTrackerStore(state => state.activeWaypointName);
  const targetZone = useTrackerStore(state => state.activeWaypointZone);
  const playerPos = useTrackerStore(state => state.playerPosition);
  const playerZone = useTrackerStore(state => state.playerZone);
  
  const trackingStyle = useSettingsStore(state => state.tableSettings.trackingStyle) || 'center';

  const zoneGraph = useTrackerStore(state => state.zoneGraph) || {};
  const [rotation, setRotation] = useState(0);
  const [distance, setDistance] = useState(0);

  const findNextZone = (start: string, end: string) => {
    if (start === end) return start;
    
    const adj: Record<string, string[]> = {};
    
    Object.keys(ZoneEntrances).forEach(zone => {
      if (!adj['Town']) adj['Town'] = [];
      if (!adj[zone]) adj[zone] = [];
      adj['Town'].push(zone);
      adj[zone].push('Town');
    });
    
    Object.keys(zoneGraph).forEach(z1 => {
      if (!adj[z1]) adj[z1] = [];
      Object.keys(zoneGraph[z1]).forEach(z2 => {
        if (!adj[z1].includes(z2)) adj[z1].push(z2);
        if (!adj[z2]) adj[z2] = [];
        if (!adj[z2].includes(z1)) adj[z2].push(z1);
      });
    });
    
    const queue: string[][] = [[start]];
    const visited = new Set<string>([start]);
    
    while (queue.length > 0) {
      const path = queue.shift()!;
      const node = path[path.length - 1];
      if (node === end) return path[1]; 
      
      const neighbors = adj[node] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }
    return null;
  };

  useEffect(() => {
    if (!waypoint || !playerPos) return;
    let effectiveWaypoint = waypoint;
    let isRoutingToEntrance = false;

    if (targetZone && playerZone && targetZone !== playerZone && playerZone !== 'Unknown') {
      const nextZone = findNextZone(playerZone, targetZone);
      
      if (nextZone) {
         // Try to find coordinate to go from playerZone -> nextZone
         let doorCoord = null;
         
         // 1. Check dynamic graph
         if (zoneGraph[playerZone] && zoneGraph[playerZone][nextZone]) {
            doorCoord = zoneGraph[playerZone][nextZone];
         }
         // 2. Check hardcoded Town routing
         else if ((playerZone === 'Town' || playerZone === 'South Town' || playerZone === 'East Town') && ZoneEntrances[nextZone]) {
            doorCoord = ZoneEntrances[nextZone].townSide;
         }
         // 3. Check hardcoded exit to Town
         else if (nextZone === 'Town' && ZoneEntrances[playerZone]) {
            doorCoord = ZoneEntrances[playerZone].insideSide;
         }
         
         if (doorCoord) {
            effectiveWaypoint = doorCoord;
            isRoutingToEntrance = true;
         }
      }
    }

    const dx = effectiveWaypoint.x - playerPos.x;
    const dy = effectiveWaypoint.y - playerPos.y;
    
    // In game, +y is North (Up), but in DOM +y is Down.
    // So we invert dy for the angle calculation to match DOM screen coordinates.
    const screenDy = -dy;
    
    const angleRad = Math.atan2(screenDy, dx);
    const angleDeg = (angleRad * 180) / Math.PI;
    
    setRotation(angleDeg);

    const dist = Math.sqrt(dx * dx + dy * dy);
    const roundedDist = Math.round(dist);
    setDistance(roundedDist);

    if (roundedDist <= 2 && !isRoutingToEntrance) {
      useTrackerStore.getState().setActiveWaypoint(null, null);
    }
  }, [playerPos, waypoint, playerZone, targetZone]);

  if (!waypoint || !playerPos) return null;

  let effectiveWaypointName = waypointName;
  if (targetZone && playerZone && targetZone !== playerZone && playerZone !== 'Unknown') {
     const nextZone = findNextZone(playerZone, targetZone);
     if (nextZone) {
       effectiveWaypointName = nextZone === 'Town' ? `Exit ${playerZone}` : `To ${nextZone}`;
     }
  }

  const stopTracking = () => {
    useTrackerStore.getState().setActiveWaypoint(null, null);
  };

  const trackingBadge = (
    <div className="bg-black/50 border border-white/10 rounded pl-2 pr-1 py-0.5 mb-2 backdrop-blur-sm shadow-lg flex items-center gap-2 pointer-events-auto">
      <div className="flex flex-col items-center">
        {effectiveWaypointName && (
          <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider drop-shadow-md">
            {effectiveWaypointName}
          </span>
        )}
        <span className="text-xs font-mono font-bold text-white drop-shadow-md leading-none pb-0.5">
          {distance}m
        </span>
      </div>
      <button 
        onClick={stopTracking}
        className="text-white/50 hover:text-red-400 hover:bg-white/10 p-1 rounded transition-colors"
        title="Stop Tracking"
      >
        <X size={12} />
      </button>
    </div>
  );

  const arrowSvg = (
    <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(24, 24) rotate(90) translate(-24, -24)">
        <path d="M24 2L38 44L24 36Z" fill="url(#rightFace)" stroke="rgba(34,197,94,0.8)" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M24 2L10 44L24 36Z" fill="url(#leftFace)" stroke="rgba(34,197,94,0.6)" strokeWidth="1" strokeLinejoin="round"/>
        <path d="M10 44L24 36L38 44L24 40Z" fill="url(#bottomFace)" stroke="rgba(134,239,172,1)" strokeWidth="0.5"/>
      </g>
      <defs>
        <linearGradient id="rightFace" x1="24" y1="2" x2="38" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#bef264" />
          <stop offset="0.3" stopColor="#4ade80" />
          <stop offset="1" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id="leftFace" x1="24" y1="2" x2="10" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4ade80" />
          <stop offset="0.4" stopColor="#16a34a" />
          <stop offset="1" stopColor="#064e3b" />
        </linearGradient>
        <linearGradient id="bottomFace" x1="24" y1="36" x2="24" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#bbf7d0" />
          <stop offset="0.5" stopColor="#ffffff" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
      </defs>
    </svg>
  );



  if (trackingStyle === 'ring') {
    const ringRadius = 150;
    const rad = (rotation * Math.PI) / 180;
    const xOffset = Math.cos(rad) * ringRadius;
    const yOffset = Math.sin(rad) * ringRadius;

    return (
      <div className="fixed inset-0 pointer-events-none z-[40] flex items-center justify-center">
        <div className="relative" style={{ width: ringRadius * 2, height: ringRadius * 2 }}>
          <div className="fixed top-24 left-1/2 -translate-x-1/2">
            {trackingBadge}
          </div>
          <motion.div
            className="absolute top-1/2 left-1/2 w-0 h-0"
            animate={{ x: xOffset, y: yOffset }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          >
            <motion.div
              animate={{ rotate: rotation }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute -ml-7 -mt-7 filter drop-shadow-[0_0_8px_rgba(34,197,94,0.6)]"
            >
              {arrowSvg}
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Default Center Arrow
  return (
    <div className="fixed inset-0 pointer-events-none z-[40] overflow-hidden flex items-center justify-center">
      <div className="absolute flex flex-col items-center justify-center -translate-y-32">
        <div className="mb-4">
          {trackingBadge}
        </div>
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="filter drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] flex items-center justify-center"
        >
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex items-center justify-center"
          >
            {arrowSvg}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
