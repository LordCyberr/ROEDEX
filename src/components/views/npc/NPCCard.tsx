import React from 'react';
import { MapPin, Target, Sparkles } from 'lucide-react';
import { NPCInfo } from '../../../data/npcs';
import { Tooltip } from '../../ui/Tooltip';

interface NPCCardProps {
  npc: NPCInfo;
  isTracked: boolean;
  onToggle: () => void;
  t: any;
}

export const NPCCard: React.FC<NPCCardProps> = ({ npc, isTracked, onToggle, t }) => {
  const initial = npc.name.charAt(0).toUpperCase();

  const getCategoryStyles = (zoneKey: string = '') => {
    const k = zoneKey.toLowerCase();
    if (k.includes('guild')) {
      return {
        bg: 'from-blue-500/10 to-transparent border-blue-500/20 hover:border-blue-500/40',
        badge: 'text-blue-400',
        avatarBg: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 text-blue-300 border-blue-500/30',
        activeCard: 'bg-blue-950/40 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
      };
    }
    if (k.includes('mine')) {
      return {
        bg: 'from-amber-500/10 to-transparent border-amber-500/20 hover:border-amber-500/40',
        badge: 'text-amber-400',
        avatarBg: 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-300 border-amber-500/30',
        activeCard: 'bg-amber-950/40 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
      };
    }
    if (k.includes('alchemist')) {
      return {
        bg: 'from-purple-500/10 to-transparent border-purple-500/20 hover:border-purple-500/40',
        badge: 'text-purple-400',
        avatarBg: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 text-purple-300 border-purple-500/30',
        activeCard: 'bg-purple-950/40 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
      };
    }
    if (k.includes('blacksmith')) {
      return {
        bg: 'from-orange-500/10 to-transparent border-orange-500/20 hover:border-orange-500/40',
        badge: 'text-orange-400',
        avatarBg: 'bg-gradient-to-br from-orange-500/20 to-orange-600/10 text-orange-300 border-orange-500/30',
        activeCard: 'bg-orange-950/40 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
      };
    }
    if (k.includes('marketplace')) {
      return {
        bg: 'from-emerald-500/10 to-transparent border-emerald-500/20 hover:border-emerald-500/40',
        badge: 'text-emerald-400',
        avatarBg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 text-emerald-300 border-emerald-500/30',
        activeCard: 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
      };
    }
    if (k.includes('tavern')) {
      return {
        bg: 'from-pink-500/10 to-transparent border-pink-500/20 hover:border-pink-500/40',
        badge: 'text-pink-400',
        avatarBg: 'bg-gradient-to-br from-pink-500/20 to-pink-600/10 text-pink-300 border-pink-500/30',
        activeCard: 'bg-pink-950/40 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
      };
    }
    return {
      bg: 'from-indigo-500/10 to-transparent border-indigo-500/20 hover:border-indigo-500/40',
      badge: 'text-indigo-400',
      avatarBg: 'bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 text-indigo-300 border-indigo-500/30',
      activeCard: 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
    };
  };

  const styles = getCategoryStyles(npc.zone);

  return (
    <div 
      onClick={onToggle}
      className={`flex items-center justify-between p-2 rounded-xl border bg-gradient-to-r transition-all duration-200 cursor-pointer group w-full ${
        isTracked 
          ? styles.activeCard
          : `bg-[var(--bg-panel)] ${styles.bg}`
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 relative border shadow-inner ${styles.avatarBg}`}>
          {initial}
          {npc.isShop && (
             <div className="absolute -bottom-1 -right-1 bg-amber-400 border border-[#0d1117] rounded-full p-0.5 shadow-sm">
               <Sparkles size={8} className="text-[#0d1117]" />
             </div>
          )}
        </div>

        {/* Text Info */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors truncate">
              {npc.name}
            </span>
            {npc.x !== undefined && npc.y !== undefined && (
              <span className="text-[8.5px] font-mono font-bold text-[var(--text-secondary)] bg-[var(--bg-base)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] shrink-0">
                {npc.x.toFixed(0)}, {npc.y.toFixed(0)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1 mt-0.5 min-w-0">
            <MapPin size={9} className={`${styles.badge} shrink-0 opacity-80`} />
            <span className="text-[9.5px] text-[var(--text-muted)] font-medium truncate leading-none">
              {t(npc.location as any)}
            </span>
          </div>
        </div>
      </div>

      {/* Track Target Button */}
      {npc.x !== undefined && npc.y !== undefined && (
        <Tooltip content={isTracked ? 'Untrack NPC' : 'Track NPC'}>
          <div className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-all shrink-0 ml-2 ${
            isTracked 
              ? 'bg-[var(--accent-primary)]/20 border-[var(--accent-primary)]/50 text-[var(--accent-primary)] shadow-[0_0_10px_color-mix(in srgb,var(--accent-primary) 30%,transparent)]' 
              : 'bg-[var(--bg-base)] border-[var(--border-subtle)] hover:border-[var(--border-accent)] text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
          }`}>
            <Target size={13} className={isTracked ? 'animate-pulse' : ''} />
          </div>
        </Tooltip>
      )}
    </div>
  );
};
