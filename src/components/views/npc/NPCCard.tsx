
import { MapPin, Target } from 'lucide-react';
import { NPCInfo } from '../../../data/npcs';

export const NPCCard = ({ npc, isTracked, onToggle, t }: { npc: NPCInfo, isTracked: boolean, onToggle: () => void, t: any }) => {
  return (
    <div 
      onClick={onToggle}
      className={`flex flex-col p-2 rounded-xl border bg-gradient-to-r shadow-sm transition-all duration-200 cursor-pointer group ${
        isTracked 
          ? 'from-[#22d3ee]/10 to-[var(--bg-panel)] border-[#22d3ee]/30 shadow-[0_0_8px_rgba(34,211,238,0.15)]' 
          : 'from-[var(--bg-panel)] to-[var(--bg-base)] border-white/5 hover:border-white/10 hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex flex-col gap-0.5">
          <div className="text-[12px] font-bold text-[var(--text-primary)]">{npc.name}</div>
        </div>
        
        {npc.x !== undefined && npc.y !== undefined && (
          <div className="relative flex items-center justify-center p-1 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
            {isTracked ? (
              <Target size={14} className="text-[#22d3ee] animate-pulse drop-shadow-[0_0_4px_rgba(34,211,238,0.5)]" />
            ) : (
              <Target size={14} className="text-zinc-400 group-hover:text-white transition-colors" />
            )}
            <div className="absolute -top-7 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 px-1.5 py-1 rounded text-[9px] font-bold text-white whitespace-nowrap pointer-events-none border border-white/10 z-10 shadow-lg">
              {isTracked ? 'Click to not track' : 'Click to track'}
            </div>
          </div>
        )}
      </div>
      <div className="flex items-start gap-1">
         <MapPin size={10} className="text-zinc-500 mt-0.5 shrink-0" />
         <div className="text-[10px] text-zinc-400 leading-tight whitespace-normal">
           {t(npc.location as any)}
         </div>
      </div>
    </div>
  );
};
