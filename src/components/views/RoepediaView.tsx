import React, { useState, useMemo, useCallback } from 'react';
import { Search, Sword, Axe, Sprout, Flame, Hexagon, Heart, Timer, ChevronRight, ArrowLeft, Coins, Grid2X2, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getRarityColor, getRarityClass } from '../../utils/rarity';
import { RESELL_VALUES } from '../../data/prices';
import { formatInternalName } from '../../utils/formatters';
import { GAME_DATABASE } from '../../data/gameDatabase';
import { CustomSelect } from '../ui/CustomSelect';
import { IsolatedInput } from '../ui/IsolatedInput';
import { useTranslation } from '../../hooks/useTranslation';

type TabType = 'FOREST' | 'MINES' | 'RESELL';

// --- Shared Helpers ---
const getSourceIcon = (category: string, name: string) => {
  if (category === 'PLANTS') return <Sprout size={13} className="text-emerald-400" />;
  if (category === 'TREES') return <Axe size={13} className="text-amber-400" />;
  if (category === 'ORES') return <Hexagon size={13} className="text-cyan-400" />;
  if (category === 'RESELL') return <Coins size={13} className="text-yellow-400" />;
  if (name.toLowerCase().includes('boss')) return <Flame size={13} className="text-red-500" />;
  return <Sword size={13} className="text-rose-400" />;
};

const getItemCategoryTag = (key: string): { label: string; color: string } => {
  const k = key.toLowerCase();
  if (k.includes('sword') || k.includes('axe') || k.includes('pickaxe') || k.includes('dagger')) {
    return { label: 'Weapon', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
  }
  if (k.includes('armor') || k.includes('helm') || k.includes('greaves') || k.includes('boots') || k.includes('hood') || k.includes('gambeson') || k.includes('leggings') || k.includes('shoes') || k.includes('gloves') || k.includes('pants') || k.includes('bracers') || k.includes('mail')) {
    return { label: 'Armor', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10' };
  }
  if (k.includes('potion') || k.includes('elixir') || k.includes('bread') || k.includes('soup') || k.includes('stew') || k.includes('tea') || k.includes('feast') || k.includes('meal') || k.includes('pie') || k.includes('brew') || k.includes('jelly') || k.includes('steak') || k.includes('lunch') || k.includes('delight') || k.includes('treat')) {
    return { label: 'Consumable', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
  }
  if (k.includes('ore') || k.includes('fragment') || k.includes('teeth') || k.includes('dust') || k.includes('shard')) {
    return { label: 'Mineral / Ore', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' };
  }
  if (k.includes('wood') || k.includes('oak') || k.includes('bark') || k.includes('heart') || k.includes('leaf') || k.includes('vine') || k.includes('lily') || k.includes('petal') || k.includes('weed') || k.includes('bane')) {
    return { label: 'Wood / Flora', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
  }
  return { label: 'Loot Drop', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' };
};

// --- Subcomponents ---

const ResellItemCard = React.memo(({ item }: { item: { key: string; name: string; price: number } }) => {
  const tag = getItemCategoryTag(item.key);
  return (
    <motion.div 
      whileHover={{ scale: 1.01, x: 2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-yellow-400/40 rounded-xl p-2 flex justify-between items-center transition-all shrink-0 shadow-md group"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
        <div className="p-1.5 bg-black/40 rounded-lg border border-white/10 shrink-0 group-hover:scale-105 transition-transform">
          <Coins size={13} className="text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className={`font-bold text-[10px] tracking-wide truncate ${getRarityColor(item.name)}`}>{item.name}</span>
          <span className={`text-[7.5px] font-black px-1.5 py-0.2 rounded border uppercase tracking-wider w-max ${tag.color}`}>
            {tag.label}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 font-mono font-black text-[11px] text-yellow-300 bg-yellow-500/15 border border-yellow-400/30 px-2.5 py-1 rounded-xl shrink-0 shadow-[0_0_10px_rgba(250,204,21,0.15)]">
        <span>{item.price.toLocaleString()}</span>
        <span className="text-[7.5px] text-yellow-400/80 font-sans font-bold uppercase">Runes</span>
      </div>
    </motion.div>
  );
});

const EntityCard = React.memo(({ entity, onClick, viewMode = 'list' }: { entity: any, onClick: (id: string) => void, viewMode?: 'list' | 'grid' }) => {
  if (viewMode === 'grid') {
    return (
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={() => onClick(entity.id)}
        className="bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-[var(--accent-primary)]/60 hover:bg-white/[0.07] rounded-xl overflow-hidden shadow-md transition-all flex flex-col items-center justify-center p-2.5 gap-2 cursor-pointer group"
      >
        <div className="p-2 bg-black/40 rounded-lg border border-white/10 group-hover:scale-110 transition-transform">
          {getSourceIcon(entity.category, entity.name)}
        </div>
        <h3 className={`font-bold text-[9px] tracking-wide uppercase text-center w-full truncate ${getRarityClass(entity.rarity)}`}>
          {entity.name}
        </h3>
        <div className="flex flex-col items-center gap-1 w-full">
          <span className={`text-[7px] px-1.5 py-0.5 bg-black/40 rounded-md border font-black uppercase tracking-wider ${
            entity.rarity === 'mystical' ? 'text-purple-400 border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.3)]' :
            entity.rarity === 'rare' ? 'text-blue-400 border-blue-500/40 shadow-[0_0_8px_rgba(59,130,246,0.3)]' :
            entity.rarity === 'uncommon' ? 'text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]' :
            'text-slate-400 border-white/10'
          }`}>
            {entity.rarity}
          </span>
          <div className="text-[7px] font-black bg-black/40 border border-white/10 px-1.5 py-0.5 rounded-md text-slate-300 w-full text-center">
            {entity.drops.length} DROPS
          </div>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button 
      whileHover={{ scale: 1.01, x: 2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={() => onClick(entity.id)}
      className="w-full text-left bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-[var(--accent-primary)]/60 hover:bg-white/[0.07] rounded-xl overflow-hidden shadow-md transition-all flex items-center p-2.5 gap-2.5 cursor-pointer shrink-0 group"
    >
      <div className="p-1.5 bg-black/40 rounded-lg border border-white/10 shrink-0 group-hover:scale-110 transition-transform">
        {getSourceIcon(entity.category, entity.name)}
      </div>
      <h3 className={`font-bold text-[10px] tracking-wide uppercase flex-1 truncate pr-1 ${getRarityClass(entity.rarity)}`}>
        {entity.name}
      </h3>
      
      <div className="flex items-center gap-1.5 shrink-0 select-none">
        <span className={`text-[7.5px] px-1.5 py-0.5 bg-black/40 rounded-md border font-black uppercase tracking-wider ${
          entity.rarity === 'mystical' ? 'text-purple-400 border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.3)]' :
          entity.rarity === 'rare' ? 'text-blue-400 border-blue-500/40 shadow-[0_0_8px_rgba(59,130,246,0.3)]' :
          entity.rarity === 'uncommon' ? 'text-emerald-400 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]' :
          'text-slate-400 border-white/10'
        }`}>
          {entity.rarity}
        </span>
        <div className="text-[7.5px] font-black bg-black/40 border border-white/10 px-1.5 py-0.5 rounded-md text-slate-300">
          {entity.drops.length} DROPS
        </div>
        <ChevronRight size={13} className="text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
      </div>
    </motion.button>
  );
});

const EntityDetails = React.memo(({ entity, onBack }: { entity: any, onBack: () => void }) => {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden p-3.5">
      {/* Back Navigation Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors text-[9px] font-black uppercase tracking-wider mb-3 w-fit cursor-pointer select-none"
      >
        <ArrowLeft size={11} /> Back
      </button>

      {/* Details Content Wrapper */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3.5 min-h-0 pr-1">
        
        {/* Detailed Header Card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3 flex items-center gap-3 shadow-md shrink-0">
          <div className="p-2 bg-[var(--bg-base)] rounded-xl border border-[var(--border-subtle)] shadow-inner">
            {getSourceIcon(entity.category, entity.name)}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] leading-none">{entity.category}</span>
            <h2 className={`font-black text-[13px] tracking-wider uppercase truncate mt-0.5 ${getRarityClass(entity.rarity)}`}>{entity.name}</h2>
          </div>
          <span className={`text-[7.5px] px-2 py-0.5 bg-[var(--bg-base)] rounded-lg border font-black uppercase tracking-wider ${
            entity.rarity === 'mystical' ? 'text-purple-400 border-purple-500/30' :
            entity.rarity === 'rare' ? 'text-blue-400 border-blue-500/30' :
            entity.rarity === 'uncommon' ? 'text-emerald-400 border-emerald-500/30' :
            'text-[var(--text-muted)] border-[var(--border-subtle)]'
          }`}>
            {entity.rarity}
          </span>
        </div>

        {/* Stats Row */}
        <div className="flex gap-2.5 select-none shrink-0">
          <div className="flex-1 flex items-center gap-2 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20 text-[9.5px]">
            <Heart size={11} className="text-rose-400 shrink-0" />
            <span className="font-mono text-rose-300 font-bold">{entity.hp} HP</span>
          </div>
          <div className="flex-1 flex items-center gap-2 bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20 text-[9.5px]">
            <Timer size={11} className="text-blue-400 shrink-0" />
            <span className="font-mono text-blue-300 font-bold">{entity.respawn}</span>
          </div>
        </div>

        {/* Drop table */}
        <div className="flex flex-col gap-1.5 flex-1 min-h-[120px]">
          <h3 className="text-[8.5px] text-[var(--text-muted)] font-black uppercase tracking-widest mb-0.5 select-none">Loot Drop Table</h3>
          <div className="flex flex-col gap-1.5 overflow-y-auto custom-scrollbar flex-1 pr-1 pb-1">
            {entity.drops.map((item: any) => (
              <div 
                key={item.id} 
                className="bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] hover:bg-[var(--bg-hover)] rounded-xl p-2 flex justify-between items-center transition-colors shrink-0"
              >
                <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                  <span className={`font-bold text-[10px] tracking-wide capitalize truncate ${getRarityColor(item.name)}`}>{item.name}</span>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono mt-0.5 select-none">
                    <Coins size={10} className="text-yellow-400 shrink-0" />
                    <span className="text-yellow-300 font-black">{item.price.toLocaleString()} Runestones</span>
                  </div>
                </div>
                
                <span className={`text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider shrink-0 ${
                  item.rarity === 'mystical' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                  item.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                  item.rarity === 'uncommon' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                  'bg-slate-500/10 text-slate-400 border-slate-500/20'
                }`}>
                  {item.rarity}
                </span>
              </div>
            ))}
            {entity.drops.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 text-[var(--text-muted)] select-none italic text-[9.5px]">
                No drop records available for this source.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
});

const RoepediaViewComponent: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('FOREST');
  const [rarityFilter, setRarityFilter] = useState<string>('ALL');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const handleEntityClick = useCallback((id: string) => setSelectedEntityId(id), []);
  const handleBack = useCallback(() => setSelectedEntityId(null), []);

  const entitiesList = useMemo(() => {
    return GAME_DATABASE.map(entity => {
      const catMap: Record<string, 'MOBS' | 'TREES' | 'ORES' | 'PLANTS'> = {
        'monster': 'MOBS',
        'boss': 'MOBS',
        'tree': 'TREES',
        'ore': 'ORES',
        'plant': 'PLANTS',
        'misc': 'PLANTS'
      };
      const cat = catMap[entity.category] || 'MOBS';

      return {
        id: entity.rawName,
        name: entity.sanitizedName,
        category: cat,
        hp: entity.hp,
        respawn: `${Math.round(entity.cooldown / 60)}m`,
        rarity: entity.rarity.toLowerCase(),
        drops: entity.drops.map(d => {
          const normName = d.sanitizedName.toLowerCase().replace(/[^a-z0-9]/g, '');
          return {
            id: d.itemId,
            name: d.sanitizedName,
            price: RESELL_VALUES[normName] || RESELL_VALUES[d.itemId] || 0,
            rarity: d.rarity.toLowerCase()
          };
        })
      };
    });
  }, []);

  // Resell values list
  const resellItemsList = useMemo(() => {
    const uniqueMap = new Map<string, { key: string; name: string; price: number }>();
    Object.entries(RESELL_VALUES).forEach(([rawKey, price]) => {
      const norm = rawKey.toLowerCase().replace(/[^a-z0-9]/g, '');
      const numPrice = price as number;
      if (!uniqueMap.has(norm) && numPrice > 0) {
        uniqueMap.set(norm, {
          key: rawKey,
          name: formatInternalName(rawKey),
          price: numPrice
        });
      }
    });
    return Array.from(uniqueMap.values()).sort((a, b) => b.price - a.price);
  }, []);

  const filteredResellItems = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return resellItemsList;
    return resellItemsList.filter(item => item.name.toLowerCase().includes(term) || item.key.toLowerCase().includes(term));
  }, [resellItemsList, searchTerm]);

  const filteredEntities = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    
    let list = entitiesList.filter(e => {
      if (activeTab === 'RESELL') return false;

      const forestMobs = ['forestslime', 'mushroomsprite', 'shadowwolf', 'woodengolem'];
      const isForestMob = e.category === 'MOBS' && forestMobs.includes(e.id.toLowerCase());
      const isMinesMob = e.category === 'MOBS' && !forestMobs.includes(e.id.toLowerCase());

      if (activeTab === 'FOREST') {
        if (!isForestMob && e.category !== 'TREES' && e.category !== 'PLANTS') return false;
      } else if (activeTab === 'MINES') {
        if (!isMinesMob && e.category !== 'ORES') return false;
      }

      
      const isSpecificFilter = ['common', 'uncommon', 'rare', 'mystical'].includes(rarityFilter);
      if (isSpecificFilter && e.rarity !== rarityFilter) {
        return false;
      }
      
      if (!term) return true;
      const matchesEntity = e.name.toLowerCase().includes(term);
      const matchesDrops = e.drops.some(d => d.name.toLowerCase().includes(term));
      return matchesEntity || matchesDrops;
    });

    const getRarityWeight = (rarity: string) => {
      const r = rarity.toLowerCase();
      if (r === 'mystical') return 4;
      if (r === 'rare') return 3;
      if (r === 'uncommon') return 2;
      return 1;
    };

    // Default sort: Rarity Low to High (Common first)
    list = [...list].sort((a, b) => getRarityWeight(a.rarity) - getRarityWeight(b.rarity));

    if (rarityFilter === 'high-low') {
      list = [...list].sort((a, b) => getRarityWeight(b.rarity) - getRarityWeight(a.rarity));
    }

    return list;
  }, [entitiesList, activeTab, rarityFilter, searchTerm]);

  const selectedEntity = useMemo(() => {
    if (!selectedEntityId) return null;
    return entitiesList.find(e => e.id === selectedEntityId) || null;
  }, [entitiesList, selectedEntityId]);

  const groupedEntities = useMemo(() => {
    const groups = [
      { key: 'forest-mobs', label: 'Forest Mobs', color: 'bg-emerald-500', items: [] as typeof filteredEntities },
      { key: 'mines-mobs', label: 'Mines Mobs', color: 'bg-rose-500', items: [] as typeof filteredEntities },
      { key: 'trees', label: 'Trees', color: 'bg-amber-500', items: [] as typeof filteredEntities },
      { key: 'ores', label: 'Ores', color: 'bg-cyan-500', items: [] as typeof filteredEntities },
      { key: 'plants', label: 'Plants', color: 'bg-teal-400', items: [] as typeof filteredEntities }
    ];

    filteredEntities.forEach(entity => {
      if (entity.category === 'MOBS') {
        const forestKeys = ['forestslime', 'mushroomsprite', 'shadowwolf', 'woodengolem'];
        if (forestKeys.includes(entity.id.toLowerCase())) {
          groups[0].items.push(entity);
        } else {
          groups[1].items.push(entity);
        }
      } else if (entity.category === 'TREES') {
        groups[2].items.push(entity);
      } else if (entity.category === 'ORES') {
        groups[3].items.push(entity);
      } else if (entity.category === 'PLANTS') {
        groups[4].items.push(entity);
      }
    });

    return groups.filter(g => g.items.length > 0);
  }, [filteredEntities]);

  return (
    <div className="flex flex-col h-full flex-1 min-h-0 w-full min-w-[280px] bg-[var(--bg-panel)] rounded-xl border border-[var(--border-accent)] overflow-hidden shadow-2xl relative text-[var(--text-primary)]">
      <AnimatePresence mode="wait">
        {!selectedEntity ? (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full w-full overflow-hidden"
          >
            {/* Top Navigation Tabs */}
            <div className="flex bg-black/40 backdrop-blur-md border-b border-white/10 shrink-0 select-none p-1.5 gap-1.5">
              {(['FOREST', 'MINES', 'RESELL'] as TabType[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSelectedEntityId(null); }}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-black tracking-wider transition-all duration-200 cursor-pointer ${
                    activeTab === tab 
                      ? 'bg-[var(--accent-primary)] text-white shadow-[0_2px_10px_rgba(249,115,22,0.35)] border border-white/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Filters Row */}
            <div className="p-2 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/50 flex gap-2 items-center shrink-0 select-none">
              <div className="relative flex-1 min-w-0">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <IsolatedInput 
                  type="text" 
                  placeholder={activeTab === 'RESELL' ? (t('stats.searchEntries') || 'Search resell prices...') : `Search ${activeTab.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] rounded-lg pl-7.5 pr-2 py-1 text-[10px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-colors"
                />
              </div>
              {activeTab !== 'RESELL' && (
                <>
                  <button 
                    onClick={() => setViewMode(v => v === 'list' ? 'grid' : 'list')}
                    className="w-7 h-[22px] flex items-center justify-center bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    {viewMode === 'list' ? <Grid2X2 size={12} /> : <List size={12} />}
                  </button>
                  <div className="w-[85px] shrink-0">
                    <CustomSelect
                      value={rarityFilter}
                      onChange={(v) => setRarityFilter(v)}
                      options={[
                        { label: 'All Rarity', value: 'ALL' },
                        { label: 'Rarity: ↑', value: 'low-high' },
                        { label: 'Rarity: ↓', value: 'high-low' },
                        { label: 'Common', value: 'common' },
                        { label: 'Uncommon', value: 'uncommon' },
                        { label: 'Rare', value: 'rare' },
                        { label: 'Mystical', value: 'mystical' }
                      ]}
                      className="w-full h-[22px] bg-[var(--bg-card)] text-[9px] text-[var(--text-secondary)] uppercase tracking-widest font-black px-2 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-colors flex items-center justify-center text-center cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>
            
            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2.5 flex flex-col gap-2 min-h-0">
              
              {/* RESELL VALUES TAB */}
              {activeTab === 'RESELL' ? (
                <div className="flex flex-col gap-1.5">
                  <div className="text-[8.5px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1 flex items-center justify-between px-1">
                    <span>Item Name &amp; Category</span>
                    <span>Resell Value</span>
                  </div>
                  {filteredResellItems.map(item => (
                    <ResellItemCard key={item.key} item={item} />
                  ))}
                  {filteredResellItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-[var(--text-muted)] select-none italic text-[9.5px]">
                      No matching item resell values found.
                    </div>
                  )}
                </div>
              ) : (
                <>
                    {groupedEntities.map(group => (
                      <div key={group.key} className="flex flex-col gap-1.5 mt-2.5 first:mt-0 shrink-0">
                        <div className="flex items-center gap-1.5 text-[8.5px] font-black uppercase tracking-widest text-[var(--text-muted)] my-0.5 select-none">
                          <div className={`w-1.5 h-1.5 rounded-full ${group.color}`} />
                          <span>{group.label}</span>
                          <div className="flex-1 h-[1px] bg-white/5" />
                        </div>
                        <div className={viewMode === 'grid' ? "grid grid-cols-3 gap-1.5" : "flex flex-col gap-1.5"}>
                          {group.items.map(entity => (
                            <EntityCard key={entity.id} entity={entity} onClick={handleEntityClick} viewMode={viewMode} />
                          ))}
                        </div>
                      </div>
                    ))}
                  
                  {filteredEntities.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-[var(--text-muted)] select-none">
                      <Search size={20} className="opacity-20 mb-2" />
                      <span className="text-[9.5px] italic">No matching records found.</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        ) : (
          <EntityDetails key="detail-view" entity={selectedEntity} onBack={handleBack} />
        )}
      </AnimatePresence>
    </div>
  );
};

export const RoepediaView = React.memo(RoepediaViewComponent);
