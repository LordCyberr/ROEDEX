import React from 'react';
import { Target, MapPin, Radio } from 'lucide-react';
import { OnlinePlayer } from '../../../store/types/PlayerSlice.types';

interface PlayerCardProps {
  player: OnlinePlayer;
  isTracked: boolean;
  onToggle: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, isTracked, onToggle }) => {
  const isOnline = !!player.position;

  return (
    <div 
      onClick={isOnline ? onToggle : undefined}
      className={`flex items-center justify-between p-2 rounded-xl border bg-gradient-to-r transition-all duration-300 group relative ${
        isTracked 
          ? 'from-rose-500/15 to-[var(--bg-panel)] border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.25)]' 
          : isOnline
            ? 'from-zinc-500/5 to-[var(--bg-card)] border-white/5 hover:border-rose-500/30 hover:shadow-lg cursor-pointer'
            : 'from-zinc-900/40 to-transparent border-transparent opacity-60 grayscale cursor-not-allowed'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Avatar Placeholder */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[12px] shrink-0 relative transition-transform group-hover:scale-105 shadow-inner border ${
          isOnline 
            ? 'bg-gradient-to-br from-rose-500/20 to-rose-600/5 text-rose-300 border-rose-500/20 shadow-[inset_0_0_8px_rgba(244,63,94,0.2)]' 
            : 'bg-zinc-800/50 text-zinc-500 border-zinc-700/30'
        }`}>
          {player.username.charAt(0).toUpperCase()}
          {isOnline && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border border-[#0d1117] rounded-full shadow-[0_0_6px_rgba(16,185,129,0.5)]">
               <div className="absolute inset-0 rounded-full animate-ping bg-emerald-400 opacity-75"></div>
            </div>
          )}
        </div>

        <div className="flex flex-col min-w-0 gap-0.5 flex-1">
          <div className={`text-[12px] font-black tracking-wide truncate transition-colors ${isTracked ? 'text-rose-400' : 'text-white group-hover:text-rose-300'}`}>
            {player.username}
          </div>
          
          <div className="flex items-center gap-1.5 flex-wrap">
            {isOnline ? (
              <>
                <div className="flex items-center gap-1 min-w-0 max-w-full">
                  <MapPin size={10} className="text-emerald-500/70 shrink-0" />
                  <span className="text-[9px] font-medium text-emerald-400/80 truncate uppercase tracking-widest">
                    {player.zone || 'Wilderness'}
                  </span>
                </div>
                {player.position && (
                  <span className="text-[8.5px] font-mono font-bold text-zinc-500/80 select-none bg-black/40 px-1 rounded">
                    {player.position.x.toFixed(0)}, {player.position.y.toFixed(0)}
                  </span>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1">
                <Radio size={10} className="text-zinc-500 shrink-0" />
                <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">Offline</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isOnline && (
        <div className="relative flex items-center justify-center p-1.5 rounded-lg bg-black/20 group-hover:bg-rose-500/10 transition-all border border-white/5 group-hover:border-rose-500/20 shrink-0 ml-2">
          {isTracked ? (
            <Target size={14} className="text-rose-400 animate-pulse drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
          ) : (
            <Target size={14} className="text-zinc-500 group-hover:text-rose-400/80 transition-colors" />
          )}
          <div className="absolute -top-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/95 px-2 py-1 rounded-md text-[9px] font-black tracking-wider uppercase text-white whitespace-nowrap pointer-events-none border border-white/10 z-[100] shadow-xl">
            {isTracked ? 'Untrack' : 'Track'}
          </div>
        </div>
      )}
    </div>
  );
};
