import React, { useEffect, useState } from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { Activity, ShieldAlert, Cpu, MemoryStick, Database, Wifi } from 'lucide-react';

export const DebugPanel: React.FC = () => {
  const connected = useTrackerStore(state => state.connected);
  const [fps, setFps] = useState(0);
  const [memory, setMemory] = useState(0);
  const [packetsPerSec, setPacketsPerSec] = useState(0);
  const [totalEnemies, setTotalEnemies] = useState(0);
  const [totalResources, setTotalResources] = useState(0);

  // FPS and Memory tracking
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const tick = () => {
      frameCount++;
      const now = performance.now();
      
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
        
        // Memory (Chrome only)
        if ((performance as any).memory) {
          setMemory(Math.round((performance as any).memory.usedJSHeapSize / 1048576));
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };
    
    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Packets/sec tracking & stats
  useEffect(() => {
    let prevCounts = { ...useTrackerStore.getState().packetCounts };
    
    const interval = setInterval(() => {
      let currentTotal = 0;
      let prevTotal = 0;
      
      const state = useTrackerStore.getState();
      
      Object.values(state.packetCounts).forEach(c => currentTotal += c);
      Object.values(prevCounts).forEach(c => prevTotal += c);
      
      setPacketsPerSec(currentTotal - prevTotal);
      
      // Update prev
      Object.keys(state.packetCounts).forEach(k => {
        prevCounts[k] = state.packetCounts[k];
      });
      
      setTotalEnemies(Object.keys(state.enemies).length);
      setTotalResources(Object.keys(state.resources).length);
      
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-4 p-3 rounded-md bg-black/40 border border-red-500/20 text-xs font-mono">
      <div className="flex items-center gap-2 mb-3 text-red-400 font-bold uppercase tracking-wider">
        <ShieldAlert size={14} />
        Advanced Debug
      </div>

      <div className="grid grid-cols-2 gap-y-2 gap-x-4">
        <div className="flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-1.5"><Wifi size={12} className="text-slate-500" /> Socket</div>
          <span className={connected ? 'text-emerald-400' : 'text-rose-400'}>
            {connected ? 'CONNECTED' : 'OFFLINE'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-1.5"><Activity size={12} className="text-slate-500" /> PKT/S</div>
          <span className="text-blue-400">{packetsPerSec}</span>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-1.5"><Database size={12} className="text-slate-500" /> Mobs</div>
          <span className="text-amber-400">{totalEnemies}</span>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-1.5"><Database size={12} className="text-slate-500" /> Nodes</div>
          <span className="text-emerald-400">{totalResources}</span>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-1.5"><Cpu size={12} className="text-slate-500" /> FPS</div>
          <span className={fps > 30 ? 'text-emerald-400' : 'text-rose-400'}>{fps}</span>
        </div>

        <div className="flex items-center justify-between text-slate-300">
          <div className="flex items-center gap-1.5"><MemoryStick size={12} className="text-slate-500" /> MEM</div>
          <span className="text-purple-400">{memory} MB</span>
        </div>
      </div>
    </div>
  );
};
