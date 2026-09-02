import React from 'react';
import { motion } from 'motion/react';
import { Gem, Package } from 'lucide-react';
import { getRarityColor } from '../../../utils/formatters';
import { getItemInfo } from '../../../data/rarity';

export const LootPopupToast: React.FC<{
  notif: any;
  animConfig: any;
  width?: number;
  height?: number;
  opacity?: number;
  isTop?: boolean;
  toastShape?: string;
}> = ({ notif, animConfig, opacity, isTop, toastShape = 'rounded-xl' }) => {
  const items: Array<{ name: string; qty: number; rarity?: string }> = notif.items || [];
  const runestones: number = notif.runestones || 0;

  return (
    <motion.div
      layout
      initial={{ ...animConfig.initial, scale: 0.9, y: isTop ? -30 : 30 }}
      animate={{ ...animConfig.animate, x: 0, y: 0, scale: 1 }}
      exit={{ ...animConfig.exit, scale: 0.9, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
      style={{
        opacity,
        transformOrigin: isTop ? 'top center' : 'bottom center',
      }}
      className={`relative flex items-center justify-between gap-4 backdrop-blur-2xl px-4 py-3 bg-slate-950/90 border border-cyan-500/40 ${toastShape} shadow-[0_8px_30px_rgba(0,0,0,0.85)] min-w-[280px] max-w-[420px] overflow-hidden pointer-events-auto z-50`}
    >
      {/* Top glowing cyan line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

      {/* Left Column: Item Drops */}
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Package className="w-3.5 h-3.5 text-cyan-400 shrink-0 animate-bounce" />
          <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
            {notif.title || 'Loot Collected'}
          </span>
        </div>

        {items.length > 0 ? (
          <div className="flex flex-col gap-1 max-h-[100px] overflow-y-auto pr-1">
            {items.map((item, idx) => {
              const info = getItemInfo(item.name);
              const rarityKey = (item.rarity || info?.rarity || 'common').toLowerCase();
              const color = getRarityColor(rarityKey);

              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono"
                  style={{ borderLeftColor: color, borderLeftWidth: 3 }}
                >
                  <span className="font-bold text-amber-300 shrink-0">+{item.qty}</span>
                  <span className="font-semibold text-white truncate">{item.name}</span>
                  <span
                    className="text-[8px] font-black uppercase px-1 py-0.2 rounded ml-auto shrink-0"
                    style={{ color, backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
                  >
                    {rarityKey}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <span className="text-[10px] text-slate-400 font-mono italic">Monster Slain</span>
        )}
      </div>

      {/* Right Column / Badge: Runestones Gained */}
      {runestones > 0 && (
        <div className="flex flex-col items-center justify-center px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-400/40 shadow-[0_0_15px_rgba(34,211,238,0.2)] shrink-0 self-center">
          <div className="flex items-center gap-1 text-cyan-300 font-black text-xs">
            <Gem className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>+{runestones.toLocaleString()}</span>
          </div>
          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">Runes</span>
        </div>
      )}
    </motion.div>
  );
};
