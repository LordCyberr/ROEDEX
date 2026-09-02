import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { ZoneEntrances } from '../../data/routing';
import { X } from 'lucide-react';
import { useWalkableDistance } from '../../hooks/useWalkableDistance';

export const DirectionalArrowComponent: React.FC = () => {
  const { waypoint, waypointName, targetZone, playerPos, playerZone, zoneGraph } = useTrackerStore(
    useShallow(state => ({
      waypoint: state.activeWaypoint,
      waypointName: state.activeWaypointName,
      targetZone: state.activeWaypointZone,
      playerPos: state.playerPosition,
      playerZone: state.playerZone,
      zoneGraph: state.zoneGraph
    }))
  );
  const trackingStyle = useSettingsStore(state => state.tableSettings.trackingStyle) || 'center';
  const safeZoneGraph = zoneGraph || {};
  const [rotation, setRotation] = useState(0);

  const waypointSetTimeRef = React.useRef<number>(0);
  const prevWaypointRef = React.useRef<string | null>(null);
  const [pingTrigger, setPingTrigger] = useState(0);

  useEffect(() => {
    if (waypoint) {
      const wpKey = `${waypoint.x},${waypoint.y}`;
      if (prevWaypointRef.current !== wpKey) {
        waypointSetTimeRef.current = Date.now();
        prevWaypointRef.current = wpKey;
        setPingTrigger(t => t + 1); // Trigger wave ripple ping
      }
    } else {
      prevWaypointRef.current = null;
    }
  }, [waypoint]);

  const findNextZone = (start: string, end: string) => {
    if (start === end) return start;
    
    const adj: Record<string, string[]> = {};
    
    Object.keys(ZoneEntrances).forEach(zone => {
      if (!adj['Town']) adj['Town'] = [];
      if (!adj[zone]) adj[zone] = [];
      adj['Town'].push(zone);
      adj[zone].push('Town');
    });
    
    Object.keys(safeZoneGraph).forEach(z1 => {
      if (!adj[z1]) adj[z1] = [];
      Object.keys(safeZoneGraph[z1]).forEach(z2 => {
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
         let doorCoord = null;
         if (safeZoneGraph[playerZone] && safeZoneGraph[playerZone][nextZone]) {
            doorCoord = safeZoneGraph[playerZone][nextZone];
         }
         else if ((playerZone === 'Town' || playerZone === 'South Town' || playerZone === 'East Town') && ZoneEntrances[nextZone]) {
            doorCoord = ZoneEntrances[nextZone].townSide;
         }
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
    const screenDy = -dy;
    
    const angleRad = Math.atan2(screenDy, dx);
    const angleDeg = (angleRad * 180) / Math.PI;
    
    setRotation(angleDeg);

    const dist = Math.sqrt(dx * dx + dy * dy);
    const roundedDist = Math.round(dist);

    if (roundedDist <= 2 && !isRoutingToEntrance) {
      if (Date.now() - waypointSetTimeRef.current > 3000) {
        useTrackerStore.getState().setActiveWaypoint(null, null);
      }
    }
  }, [playerPos, waypoint, playerZone, targetZone]);

  const effectiveWaypointInfo = React.useMemo(() => {
    if (!waypoint || !playerPos) return null;
    let effectiveWaypoint = waypoint;
    let isRoutingToEntrance = false;

    if (targetZone && playerZone && targetZone !== playerZone && playerZone !== 'Unknown') {
      const nextZone = findNextZone(playerZone, targetZone);
      
      if (nextZone) {
         let doorCoord = null;
         if (safeZoneGraph[playerZone] && safeZoneGraph[playerZone][nextZone]) doorCoord = safeZoneGraph[playerZone][nextZone];
         else if ((playerZone === 'Town' || playerZone === 'South Town' || playerZone === 'East Town') && ZoneEntrances[nextZone]) doorCoord = ZoneEntrances[nextZone].townSide;
         else if (nextZone === 'Town' && ZoneEntrances[playerZone]) doorCoord = ZoneEntrances[playerZone].insideSide;
         
         if (doorCoord) {
            effectiveWaypoint = doorCoord;
            isRoutingToEntrance = true;
         }
      }
    }
    return { effectiveWaypoint, isRoutingToEntrance };
  }, [waypoint, playerPos, playerZone, targetZone, safeZoneGraph]);

  const { distance, path } = useWalkableDistance(
    playerZone || 'Forest', 
    playerPos, 
    effectiveWaypointInfo?.effectiveWaypoint || null, 
    true
  );

  useEffect(() => {
    if (!playerPos || !effectiveWaypointInfo) return;
    
    let targetP = effectiveWaypointInfo.effectiveWaypoint;
    if (path && path.length > 0) {
      for (const p of path) {
        const d = Math.sqrt(Math.pow(p.x - playerPos.x, 2) + Math.pow(p.y - playerPos.y, 2));
        if (d > 3) {
          targetP = p;
          break;
        }
      }
    }

    const dx = targetP.x - playerPos.x;
    const dy = targetP.y - playerPos.y;
    const screenDy = -dy;
    
    const angleRad = Math.atan2(screenDy, dx);
    const angleDeg = (angleRad * 180) / Math.PI;
    setRotation(angleDeg);
  }, [playerPos, path, effectiveWaypointInfo]);

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

  const displayDist = (distance < 0 && waypoint && playerPos) 
    ? Math.round(Math.sqrt(Math.pow(waypoint.x - playerPos.x, 2) + Math.pow(waypoint.y - playerPos.y, 2))) 
    : Math.max(0, Math.round(distance));

  const trackingBadge = (
    <div className="bg-black/85 border border-cyan-500/30 rounded-xl px-3 py-1.5 mb-2 backdrop-blur-xl shadow-[0_8px_25px_rgba(0,0,0,0.7)] flex items-center gap-2.5 pointer-events-auto transform hover:scale-105 transition-all relative">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent rounded-xl pointer-events-none" />
      <div className="flex flex-col items-start relative z-10">
        {effectiveWaypointName && (
          <span className="text-[8.5px] font-black text-cyan-400 uppercase tracking-widest leading-none mb-0.5 drop-shadow-sm">
            {effectiveWaypointName}
          </span>
        )}
        <span className="text-xs font-mono font-black text-white leading-none">
          {displayDist}m
        </span>
      </div>
      <button 
        onClick={stopTracking}
        className="text-slate-400 hover:text-red-400 hover:bg-red-500/20 p-1 rounded-lg transition-all relative z-10 ml-1 border border-transparent hover:border-red-500/30 cursor-pointer"
        title="Stop Tracking"
      >
        <X size={12} />
      </button>
    </div>
  );

  const arrowSvg = (
    <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <g transform="translate(24, 24) rotate(90) translate(-24, -24)">
        {/* Holographic scan outlines */}
        <path d="M24 2L38 44L24 36Z" fill="url(#rightFaceHolo)" stroke="rgba(6,182,212,0.8)" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M24 2L10 44L24 36Z" fill="url(#leftFaceHolo)" stroke="rgba(6,182,212,0.6)" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M10 44L24 36L38 44L24 40Z" fill="url(#bottomFaceHolo)" stroke="rgba(34,211,238,0.9)" strokeWidth="0.75" strokeLinejoin="round"/>
      </g>
      <defs>
        <linearGradient id="rightFaceHolo" x1="24" y1="2" x2="38" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="#0891b2" stopOpacity="0.75" />
          <stop offset="1" stopColor="#0e7490" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="leftFaceHolo" x1="24" y1="2" x2="10" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06b6d4" stopOpacity="0.75" />
          <stop offset="0.6" stopColor="#0891b2" stopOpacity="0.6" />
          <stop offset="1" stopColor="#155e75" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="bottomFaceHolo" x1="24" y1="36" x2="24" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ecfeff" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#22d3ee" stopOpacity="0.7" />
          <stop offset="1" stopColor="#0891b2" stopOpacity="0.5" />
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
            {/* Holographic Ping Wave on Ring Arrow */}
            <AnimatePresence>
              {pingTrigger > 0 && (
                <motion.div
                  key={`ping-ring-${pingTrigger}`}
                  initial={{ scale: 0.5, opacity: 1 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute -ml-7 -mt-7 w-14 h-14 border border-cyan-400/80 rounded-full pointer-events-none filter drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]"
                />
              )}
            </AnimatePresence>

            <motion.div
              animate={{ rotate: rotation, filter: ["drop-shadow(0 0 4px rgba(6,182,212,0.4))", "drop-shadow(0 0 12px rgba(6,182,212,0.8))", "drop-shadow(0 0 4px rgba(6,182,212,0.4))"] }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="absolute -ml-7 -mt-7 w-14 h-14 flex items-center justify-center"
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
      <div className="absolute flex flex-col items-center justify-center -translate-y-44">
        <div className="mb-6 relative">
          {trackingBadge}
        </div>
        
        <div className="relative flex items-center justify-center">
          {/* Ground Compass Underlay */}
          <motion.div
            animate={{ rotate: -rotation }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="absolute -bottom-8 w-24 h-24 border border-cyan-500/10 rounded-full flex items-center justify-center opacity-60"
          >
            <div className="absolute top-1 text-[7px] text-cyan-400 font-bold font-mono">N</div>
            <div className="absolute bottom-1 text-[7px] text-cyan-500/50 font-bold font-mono">S</div>
            <div className="absolute right-1 text-[7px] text-cyan-500/50 font-bold font-mono">E</div>
            <div className="absolute left-1 text-[7px] text-cyan-500/50 font-bold font-mono">W</div>
            <div className="absolute inset-1.5 border border-dashed border-cyan-500/10 rounded-full" />
          </motion.div>

          {/* 3D Ground Shadow (synced with y bounce) */}
          <motion.div 
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.15, 0.35, 0.15] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute -bottom-6 w-16 h-4 bg-black/60 blur-[4px] pointer-events-none rounded-[100%]" 
          />
          
          {/* Holographic Ripple Ping Wave */}
          <AnimatePresence>
            {pingTrigger > 0 && (
              <motion.div
                key={`ping-${pingTrigger}`}
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 2.2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute w-14 h-14 border border-cyan-400/80 rounded-full pointer-events-none filter drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]"
              />
            )}
          </AnimatePresence>

          <motion.div
            animate={{ y: [-6, 6, -6], filter: ["drop-shadow(0 0 4px rgba(6,182,212,0.4))", "drop-shadow(0 0 12px rgba(6,182,212,0.8))", "drop-shadow(0 0 4px rgba(6,182,212,0.4))"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-14 h-14 flex items-center justify-center relative z-10"
          >
            <motion.div
              animate={{ rotate: rotation }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="w-full h-full flex items-center justify-center"
            >
              {arrowSvg}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export const DirectionalArrow = React.memo(DirectionalArrowComponent);
