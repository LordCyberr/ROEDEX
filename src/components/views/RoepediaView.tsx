import React, { useState, useMemo } from 'react';
import { Search, DollarSign, Package } from 'lucide-react';
import { RESELL_VALUES } from '../../data/prices';
import { RARITY_DB } from '../../data/rarity';
import { formatInternalName } from '../../utils/formatters';

export const RoepediaView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const pediaItems = useMemo(() => {
    const items: Array<{ id: string, name: string, price: number, rarity: string, source: string }> = [];
    
    for (const [key, price] of Object.entries(RESELL_VALUES)) {
        const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        const rarityInfo = RARITY_DB[normalized] || { rarity: 'common', source: 'unknown' };
        
        items.push({
            id: key,
            name: formatInternalName(key),
            price,
            rarity: rarityInfo.rarity,
            source: rarityInfo.source
        });
    }
    
    return items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  return (
    <div className="flex flex-col h-full w-full min-w-[280px] bg-[var(--bg-panel)] rounded-md border border-[var(--border-subtle)] overflow-hidden shadow-lg">
      <div className="p-2 border-b border-[var(--border-subtle)] bg-black/20 flex gap-2 items-center backdrop-blur-sm">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2.5 top-1.5 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="Search items, prices, or rarity..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-[var(--border-accent)] rounded-md pl-8 pr-2 py-1 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]/50 transition-all"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1.5">
        {pediaItems.map(item => (
            <div key={item.id} className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-md p-2 flex flex-col gap-1.5 hover:bg-[var(--bg-hover)] transition-all hover:border-[var(--border-accent)]">
                <div className="flex justify-between items-center">
                    <span className="font-bold text-xs tracking-wide capitalize [text-shadow:0_1px_1px_rgba(0,0,0,0.8)]">{item.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-black tracking-wider ${
                        item.rarity === 'mythic' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-[0_0_8px_rgba(168,85,247,0.3)]' :
                        item.rarity === 'rare' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]' :
                        item.rarity === 'uncommon' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' :
                        'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                    }`}>
                        {item.rarity}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)] mt-0.5 font-mono">
                    <div className="flex items-center gap-1.5">
                        <DollarSign size={12} className="text-yellow-400" />
                        <span>{item.price} G</span>
                    </div>
                    {item.source !== 'unknown' && (
                        <div className="flex items-center gap-1.5 capitalize text-[var(--text-secondary)]">
                            <Package size={12} className="opacity-70" />
                            <span>{item.source}</span>
                        </div>
                    )}
                </div>
            </div>
        ))}
        {pediaItems.length === 0 && (
            <div className="col-span-full flex items-center justify-center h-20 text-[var(--text-muted)] text-xs italic">
                No items found matching "{searchTerm}"
            </div>
        )}
      </div>
    </div>
  );
};
