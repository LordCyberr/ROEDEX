import React from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';

import { useShallow } from 'zustand/react/shallow';
import { motion } from 'motion/react';
import { getResellValue } from '../../data/prices';
import { useTranslation } from '../../hooks/useTranslation';
import { Package, Backpack, X, Lock, Unlock } from 'lucide-react';

export const MinimalChestHUD: React.FC = () => {
  const { t } = useTranslation();
  const settingsStore = useSettingsStore(useShallow(state => ({
    minimalChestHud: state.minimalChestHud,
    setMinimalChestHud: state.setMinimalChestHud,
    minimalChestHudLocked: state.minimalChestHudLocked,
    setMinimalChestHudLocked: state.setMinimalChestHudLocked,
    chestWidgetPositions: state.chestWidgetPositions,
    setChestWidgetPosition: state.setChestWidgetPosition,
    globalScale: state.globalScale,
    minimalChestTutorialSeen: state.minimalChestTutorialSeen,
    setMinimalChestTutorialSeen: state.setMinimalChestTutorialSeen
  })));

  const gameStore = useTrackerStore(useShallow(state => ({
    chestInventory: state.chestInventory,
    bankInventory: state.bankInventory,
  })));

  if (!settingsStore.minimalChestHud) return null;

  // Calculate values
  const isToolOrWeapon = (name: string) => {
    const n = name.toLowerCase();
    return n.includes('sword') || n.includes('pickaxe') || n.includes('axe') || n.includes('tool') || n.includes('weapon');
  };

  const inventoryLootValue = Object.entries(gameStore.chestInventory).reduce((acc, [name, qty]) => {
    if (isToolOrWeapon(name)) return acc;
    if (name.toLowerCase() === 'runes' || name.toLowerCase() === 'runestone' || name.toLowerCase().startsWith('runes_')) return acc;
    return acc + getResellValue(name, qty);
  }, 0);

  const displayTotalValue = Object.entries(gameStore.bankInventory || {}).reduce((acc, [name, qty]) => {
    return acc + getResellValue(name, qty);
  }, 0);

  const formatVal = (val: number) => {
    if (val >= 1000) return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return val.toString();
  };

  const handleDragEnd = (_: any, info: any) => {
    const current = settingsStore.chestWidgetPositions?.chest || { x: 50, y: 220 };
    settingsStore.setChestWidgetPosition('chest', {
      x: current.x + info.offset.x,
      y: current.y + info.offset.y
    });
  };

  return (
    <>
    <motion.div
      drag={!settingsStore.minimalChestHudLocked}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      initial={{ x: settingsStore.chestWidgetPositions?.chest?.x ?? 50, y: settingsStore.chestWidgetPositions?.chest?.y ?? 220 }}
      animate={{ x: settingsStore.chestWidgetPositions?.chest?.x ?? 50, y: settingsStore.chestWidgetPositions?.chest?.y ?? 220 }}
      className={`!absolute z-40 rounded-xl overflow-hidden shadow-2xl flex flex-col border ${
        !settingsStore.minimalChestHudLocked 
          ? 'pointer-events-auto cursor-move border-[var(--accent-primary)] bg-[var(--bg-panel)]' 
          : 'pointer-events-auto border-[var(--border-accent)] bg-[var(--bg-panel)] glass-panel'
      }`}
      style={{ scale: settingsStore.globalScale, transformOrigin: 'top left', minWidth: 160 }}
    >
      {/* Header */}
      <div className={`flex items-center justify-between bg-black/40 px-2 py-1.5 border-b border-white/10 group ${!settingsStore.minimalChestHudLocked ? 'cursor-move' : ''}`}>
        <span className="text-[9px] font-black tracking-widest text-[var(--text-primary)] uppercase opacity-80 flex items-center gap-1">
          <Package size={10} className="text-[var(--accent-primary)]" />
          {t('overlay.storageWealth')}
        </span>
        <div className="flex items-center gap-1 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              settingsStore.setMinimalChestHudLocked(!settingsStore.minimalChestHudLocked);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            className={`p-0.5 transition-colors ${settingsStore.minimalChestHudLocked ? 'text-[var(--accent-primary)]' : 'text-slate-400 hover:text-white'}`}
            title={settingsStore.minimalChestHudLocked ? "Unlock Tracker" : "Lock Tracker"}
          >
            {settingsStore.minimalChestHudLocked ? <Lock size={10} /> : <Unlock size={10} />}
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              settingsStore.setMinimalChestHud(false);
            }} 
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            className="text-slate-400 hover:text-red-400 transition-colors p-0.5"
            title="Hide Tracker"
          >
            <X size={10} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col p-2 gap-1.5">
        
        {/* Backpack Value */}
        <div className="flex items-center justify-between bg-[var(--bg-card)] rounded p-1.5 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
            <Backpack size={12} className="opacity-70" />
            <span className="text-[9px] uppercase tracking-wider font-bold">{t('overlay.backpack')}</span>
          </div>
          <span className="font-mono text-[12px] font-black text-[var(--accent-primary)] drop-shadow">
            {formatVal(inventoryLootValue)}
          </span>
        </div>

        {/* Chest Value */}
        <div className="flex items-center justify-between bg-[var(--bg-card)] rounded p-1.5 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
            <Package size={12} className="opacity-70 text-[var(--text-primary)]" />
            <span className="text-[9px] uppercase tracking-wider font-bold">{t('overlay.chest')}</span>
          </div>
          <span className="font-mono text-[12px] font-black text-[var(--text-primary)] drop-shadow">
            {formatVal(displayTotalValue)}
          </span>
        </div>

      </div>

      {/* Drag Warning overlay */}
      {!settingsStore.minimalChestHudLocked && (
        <div className="absolute inset-0 bg-[var(--accent-primary)]/10 pointer-events-none rounded-xl border border-dashed border-[var(--accent-primary)]/50 flex items-center justify-center">
          <span className="text-[var(--accent-primary)] font-bold text-[8px] uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded">{t('ui.dragMode')}</span>
        </div>
      )}
    </motion.div>

    {/* Detailed Step Guide Tutorial - Rendered outside to avoid overflow hidden and transform context */}
    {!settingsStore.minimalChestTutorialSeen && (
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--bg-panel)] backdrop-blur-xl z-[9999] rounded-2xl flex flex-col p-6 text-left border border-[var(--accent-primary)] shadow-[0_0_50px_rgba(0,0,0,0.8)] pointer-events-auto min-w-[320px]">
        <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
          <div className="p-2 bg-[var(--accent-primary)]/20 rounded-lg">
            <Package size={24} className="text-[var(--accent-primary)] animate-pulse" />
          </div>
          <div>
            <h3 className="text-[16px] font-black text-white uppercase tracking-wider leading-tight">Storage Wealth Tracker</h3>
            <p className="text-[10px] text-[var(--accent-primary)] font-bold uppercase tracking-widest">New Feature Setup</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex items-start gap-3 bg-black/30 p-3 rounded-lg border border-white/5">
            <div className="w-5 h-5 rounded bg-[var(--accent-primary)] text-black font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</div>
            <div>
              <p className="text-[11px] font-bold text-white mb-1">Persistent Tracker</p>
              <p className="text-[10px] text-slate-400 leading-relaxed">The Chest HUD now remains permanently on your screen if enabled. It will track your total wealth automatically as you play.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 bg-black/30 p-3 rounded-lg border border-white/5">
            <div className="w-5 h-5 rounded bg-[var(--accent-primary)] text-black font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</div>
            <div>
              <p className="text-[11px] font-bold text-white mb-1">Position & Lock</p>
              <p className="text-[10px] text-slate-400 leading-relaxed">Click and drag this widget anywhere on your screen. Once positioned, go to Settings &gt; Tracking &amp; Data to lock it.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-black/30 p-3 rounded-lg border border-white/5">
            <div className="w-5 h-5 rounded bg-[var(--accent-primary)] text-black font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</div>
            <div>
              <p className="text-[11px] font-bold text-white mb-1">Toggle Visibility</p>
              <p className="text-[10px] text-slate-400 leading-relaxed">If you want to hide this HUD, you can toggle "Minimal Chest Hud" off in the Settings menu at any time.</p>
            </div>
          </div>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            settingsStore.setMinimalChestTutorialSeen(true);
          }}
          className="w-full py-3 bg-[var(--accent-primary)] text-black text-[12px] font-black rounded-lg hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(255,165,0,0.3)]"
        >
          I Understand, Let's Go
        </button>
      </div>
    )}
    </>
  );
};
