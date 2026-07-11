import React, { useEffect, useRef, useMemo } from 'react';
import { motion, useMotionValue, useDragControls } from 'motion/react';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Radar, X } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';


import mapNodes from '../../data/staticMapNodes.json';
import collisionData from '../../data/collisionData.json';

const RADAR_RADIUS = 120; // Pixel radius of the minimap
const ZOOM = 2.5; // How many pixels per map unit (x, y)
const VIEW_DISTANCE = RADAR_RADIUS / ZOOM; // How many map units are visible

export const RadarMinimap: React.FC = () => {
  const { showRadarMinimap, radarMinimapPosition, setRadarMinimapPosition, setShowRadarMinimap } = useSettingsStore(
    useShallow(state => ({
      showRadarMinimap: state.showRadarMinimap,
      radarMinimapPosition: state.radarMinimapPosition,
      setRadarMinimapPosition: state.setRadarMinimapPosition,
      setShowRadarMinimap: state.setShowRadarMinimap,
    }))
  );

  const { playerPosition, playerZone, activeWaypoint } = useTrackerStore(
    useShallow(state => ({
      playerPosition: state.playerPosition,
      playerZone: state.playerZone,
      activeWaypoint: state.activeWaypoint,
    }))
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragControls = useDragControls();
  const x = useMotionValue(radarMinimapPosition?.x ?? window.innerWidth - 300);
  const y = useMotionValue(radarMinimapPosition?.y ?? 150);

  // Parse data for the current zone
  const { nodes, collisions } = useMemo(() => {
    // Map in-game zone to TMJ filename mapping
    let zoneKey = 'Forest';
    if (playerZone === 'Mine' || playerZone === 'Mine_bottom') zoneKey = 'Mine_bottom';
    // TODO: Add mapping for other zones if needed

    return {
      nodes: (mapNodes as any)[zoneKey] || {},
      collisions: (collisionData as any)[zoneKey] || {}
    };
  }, [playerZone]);

  useEffect(() => {
    if (!showRadarMinimap || !playerPosition || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const canvasSize = RADAR_RADIUS * 2;
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Set origin to center
    ctx.save();
    ctx.translate(RADAR_RADIUS, RADAR_RADIUS);

    // Draw Grid Background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 10 * ZOOM;
    
    // Calculate grid offset based on player pos
    const offsetX = (playerPosition.x * ZOOM) % gridSize;
    const offsetY = (playerPosition.y * ZOOM) % gridSize;

    ctx.beginPath();
    for (let i = -RADAR_RADIUS; i <= RADAR_RADIUS; i += gridSize) {
      ctx.moveTo(i - offsetX, -RADAR_RADIUS);
      ctx.lineTo(i - offsetX, RADAR_RADIUS);
      ctx.moveTo(-RADAR_RADIUS, i - offsetY);
      ctx.lineTo(RADAR_RADIUS, i - offsetY);
    }
    ctx.stroke();

    // Helper to get screen coords from world coords
    const toScreen = (wx: number, wy: number) => {
      return {
        x: (wx - playerPosition.x) * ZOOM,
        y: (wy - playerPosition.y) * ZOOM,
      };
    };

    // Draw Collisions
    ctx.lineWidth = 1.5;

    for (const [layerName, objects] of Object.entries(collisions)) {
      if (!Array.isArray(objects)) continue;
      
      // Different colors for different colliders
      if (layerName === 'RiverCollisions') {
        ctx.fillStyle = 'rgba(0, 150, 255, 0.2)';
        ctx.strokeStyle = 'rgba(0, 150, 255, 0.6)';
      } else if (layerName === 'stumpcollider') {
        ctx.fillStyle = 'rgba(150, 100, 50, 0.3)';
        ctx.strokeStyle = 'rgba(150, 100, 50, 0.7)';
      } else {
        ctx.fillStyle = 'rgba(200, 200, 200, 0.2)';
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
      }

      for (const obj of objects) {
        // Fast culling (rough bounding box check)
        if (Math.abs(obj.x - playerPosition.x) > VIEW_DISTANCE * 2 || 
            Math.abs(obj.y - playerPosition.y) > VIEW_DISTANCE * 2) {
          continue;
        }

        const screenPos = toScreen(obj.x, obj.y);

        ctx.beginPath();
        if (obj.polygon) {
          ctx.moveTo(screenPos.x, screenPos.y);
          for (const pt of obj.polygon) {
            ctx.lineTo(screenPos.x + pt.x * ZOOM, screenPos.y + pt.y * ZOOM);
          }
        } else {
          // Box
          const w = obj.width * ZOOM;
          const h = obj.height * ZOOM;
          ctx.rect(screenPos.x, screenPos.y, w, h);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // Draw Nodes
    for (const [layerName, pts] of Object.entries(nodes)) {
      if (!Array.isArray(pts)) continue;
      
      let dotColor = 'rgba(255,255,255,0.5)';
      if (layerName === 'Monster indicator') dotColor = 'rgba(255,50,50,0.8)';
      else if (layerName === 'ore' || layerName === 'treasure') dotColor = 'rgba(255,215,0,0.8)';
      else if (layerName === 'Flowers' || layerName === 'Tree indicator') dotColor = 'rgba(50,255,50,0.8)';
      else if (layerName === 'Free zone indicator') dotColor = 'rgba(100,255,255,0.3)';

      ctx.fillStyle = dotColor;

      for (const pt of pts) {
        const dx = pt.x - playerPosition.x;
        const dy = pt.y - playerPosition.y;
        if (Math.abs(dx) > VIEW_DISTANCE || Math.abs(dy) > VIEW_DISTANCE) continue;

        const screenPos = toScreen(pt.x, pt.y);
        
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, layerName.includes('indicator') ? 3 : 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw Active Waypoint
    if (activeWaypoint) {
       const screenPos = toScreen(activeWaypoint.x, activeWaypoint.y);
       ctx.fillStyle = '#facc15';
       ctx.shadowColor = '#facc15';
       ctx.shadowBlur = 10;
       ctx.beginPath();
       ctx.arc(screenPos.x, screenPos.y, 4, 0, Math.PI * 2);
       ctx.fill();
       ctx.shadowBlur = 0; // reset
       
       // Draw a line to the waypoint
       ctx.strokeStyle = 'rgba(250, 204, 21, 0.4)';
       ctx.setLineDash([5, 5]);
       ctx.beginPath();
       ctx.moveTo(0, 0);
       ctx.lineTo(screenPos.x, screenPos.y);
       ctx.stroke();
       ctx.setLineDash([]);
    }

    // Draw Player (Center)
    ctx.fillStyle = '#3b82f6';
    ctx.shadowColor = '#60a5fa';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    ctx.restore();
  }, [playerPosition, nodes, collisions, activeWaypoint, showRadarMinimap]);

  if (!showRadarMinimap) return null;

  return (
    <motion.div
      style={{ x, y }}
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onDragEnd={() => setRadarMinimapPosition({ x: x.get(), y: y.get() })}
      className="fixed top-0 left-0 z-[100] pointer-events-auto"
    >
      <div 
        className="relative bg-[#0f172a]/90 backdrop-blur-md rounded-full border-2 border-[var(--border-accent)] shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden group transition-all duration-300 hover:shadow-[0_10px_50px_rgba(59,130,246,0.3)] hover:border-blue-500/50"
        style={{ width: RADAR_RADIUS * 2, height: RADAR_RADIUS * 2 }}
      >
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className="absolute inset-0 cursor-move z-10"
        />
        
        {/* Radar Scanner Effect */}
        <div className="absolute inset-0 z-20 pointer-events-none rounded-full border border-blue-500/20" />
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-blue-500/20 z-20 pointer-events-none" />
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-blue-500/20 z-20 pointer-events-none" />
        
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 z-20 pointer-events-none"
        >
          <div className="w-1/2 h-1/2 bg-gradient-to-tr from-blue-500/30 to-transparent origin-bottom-right" />
        </motion.div>

        <canvas
          ref={canvasRef}
          width={RADAR_RADIUS * 2}
          height={RADAR_RADIUS * 2}
          className="absolute inset-0 z-0 rounded-full"
        />

        <button 
          onClick={() => setShowRadarMinimap(false)}
          className="absolute top-4 right-4 z-30 p-1.5 rounded-full bg-black/50 text-white/50 hover:text-white hover:bg-red-500/80 transition-all opacity-0 group-hover:opacity-100"
        >
          <X size={14} />
        </button>
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Radar size={12} className="text-blue-400" />
          <span className="text-[10px] font-bold text-blue-200 tracking-wider">TACTICAL RADAR</span>
        </div>
      </div>
    </motion.div>
  );
};
