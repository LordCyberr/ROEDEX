import React, { useMemo } from 'react';
import { useTrackerStore } from '../../../store/trackerStore';
import { motion } from 'motion/react';
import { Flame, Zap } from 'lucide-react';

export const MarketDashboard: React.FC = () => {
  const { marketSales } = useTrackerStore();

  // Top Volume in 24 hours
  const topVolume = useMemo(() => {
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const recentSales = marketSales.filter(s => now - s.seenAt < ONE_DAY);
    
    const volumeMap = new Map<string, { itemId: string, itemName: string, totalWei: bigint }>();
    recentSales.forEach(sale => {
      let entry = volumeMap.get(sale.itemId);
      if (!entry) {
        entry = { itemId: sale.itemId, itemName: sale.itemName, totalWei: 0n };
        volumeMap.set(sale.itemId, entry);
      }
      entry.totalWei += BigInt(sale.totalWei);
    });

    return Array.from(volumeMap.values())
      .sort((a, b) => Number(b.totalWei - a.totalWei))
      .slice(0, 10);
  }, [marketSales]);

  // Recent 10 sales
  const recentSales = useMemo(() => marketSales.slice(0, 10), [marketSales]);

  return (
    <div className="flex h-full w-full p-6 gap-6 bg-[var(--bg-base)] overflow-y-auto">
      {/* Top Volume Panel */}
      <div className="flex-1 flex flex-col bg-[var(--bg-panel)] rounded-xl border border-[var(--border-subtle)] overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-panel-secondary)]">
          <h2 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
            <Flame size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] fill-amber-400/20" /> Top Volume (24h)
          </h2>
        </div>
        <div className="flex-1 p-2 flex flex-col gap-1 overflow-y-auto">
          {topVolume.length === 0 && (
            <div className="p-4 text-center text-sm text-[var(--text-muted)] italic">
              Gathering data...
            </div>
          )}
          {topVolume.map((item, idx) => (
            <div key={item.itemId} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-6 text-center font-black text-[var(--text-muted)] text-sm">{idx + 1}</div>
                <div className="font-bold text-sm text-white">{item.itemName}</div>
              </div>
              <div className="font-mono text-emerald-400 font-bold text-sm">
                {Number(item.totalWei).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Last Trades Panel */}
      <div className="flex-1 flex flex-col bg-[var(--bg-panel)] rounded-xl border border-[var(--border-subtle)] overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-panel-secondary)]">
          <h2 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
            <Zap size={18} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] fill-cyan-400/20" /> Last Trades
          </h2>
        </div>
        <div className="flex-1 p-2 flex flex-col gap-1 overflow-y-auto">
          {recentSales.length === 0 && (
            <div className="p-4 text-center text-sm text-[var(--text-muted)] italic">
              Gathering data...
            </div>
          )}
          {recentSales.map((sale) => (
            <motion.div 
              key={sale.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="flex flex-col">
                <div className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">{sale.itemName}</div>
                <div className="text-xs text-[var(--text-muted)]">Qty: {sale.qty.toLocaleString()}</div>
              </div>
              <div className="flex flex-col items-end">
                <div className="font-mono text-emerald-400 font-bold text-sm">
                  {Number(sale.priceWei).toLocaleString()}
                </div>
                <div className="text-[10px] text-[var(--text-muted)]/70 mt-0.5">
                  {new Date(sale.seenAt).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
