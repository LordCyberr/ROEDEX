import React from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';

import { useShallow } from 'zustand/react/shallow';
import { motion } from 'motion/react';
import { getResellValue } from '../../data/prices';
import { useTranslation } from '../../hooks/useTranslation';
import { Package, Backpack, X } from 'lucide-react';

export const MinimalChestHUD: React.FC = () => {
  const { t } = useTranslation();
  const settingsStore = useSettingsStore(useShallow(state => ({
    minimalChestHud: state.minimalChestHud,
    minimalChestHudLocked: state.minimalChestHudLocked,
    chestWidgetPositions: state.chestWidgetPositions,
    setChestWidgetPosition: state.setChestWidgetPosition,
    globalScale: state.globalScale
  })));

  const gameStore = useTrackerStore(useShallow(state => ({
    isChestOpen: state.isChestOpen,
    chestInventory: state.chestInventory,
    bankInventory: state.bankInventory,
    setIsChestOpen: state.setIsChestOpen,
  })));

  if (!gameStore.isChestOpen || !settingsStore.minimalChestHud) return null;

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

  const handleClose = () => {
    if (settingsStore.minimalChestHudLocked) {
      gameStore.setIsChestOpen(false);
      const dispatchEscape = () => {
        const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, which: 27, bubbles: true, cancelable: true });
        document.dispatchEvent(escapeEvent);
        window.dispatchEvent(escapeEvent);
        const eEvent = new KeyboardEvent('keydown', { key: 'e', code: 'KeyE', keyCode: 69, which: 69, bubbles: true, cancelable: true });
        document.dispatchEvent(eEvent);
        window.dispatchEvent(eEvent);
        const canvas = document.querySelector('canvas');
        if (canvas) {
          canvas.dispatchEvent(escapeEvent);
          canvas.dispatchEvent(eEvent);
        }
      };
      dispatchEscape();
      setTimeout(dispatchEscape, 100);
    }
  };

  const handleDragEnd = (_: any, info: any) => {
    const current = settingsStore.chestWidgetPositions?.chest || { x: 50, y: 220 };
    settingsStore.setChestWidgetPosition('chest', {
      x: current.x + info.offset.x,
      y: current.y + info.offset.y
    });
  };

  return (
    <motion.div
      drag={!settingsStore.minimalChestHudLocked}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      initial={{ x: settingsStore.chestWidgetPositions?.chest?.x ?? 50, y: settingsStore.chestWidgetPositions?.chest?.y ?? 220 }}
      className={`absolute z-40 rounded-xl overflow-hidden shadow-2xl flex flex-col border ${
        !settingsStore.minimalChestHudLocked 
          ? 'pointer-events-auto cursor-move border-emerald-500/50 bg-[var(--bg-panel)]' 
          : 'pointer-events-auto border-[var(--border-accent)] bg-[var(--bg-panel)] glass-panel'
      }`}
      style={{ scale: settingsStore.globalScale, transformOrigin: 'top left', minWidth: 160 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-black/40 px-2 py-1.5 border-b border-white/10">
        <span className="text-[9px] font-black tracking-widest text-white uppercase opacity-80 flex items-center gap-1">
          <Package size={10} className="text-emerald-400" />
          {t('overlay.storageWealth')}
        </span>
        {!settingsStore.minimalChestHudLocked && (
          <button onClick={() => gameStore.setIsChestOpen(false)} className="text-slate-400 hover:text-red-400 transition-colors ml-2 p-0.5">
            <X size={10} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col p-2 gap-1.5" onClick={handleClose}>
        
        {/* Backpack Value */}
        <div className="flex items-center justify-between bg-[var(--bg-card)] rounded p-1.5 border border-white/5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Backpack size={12} className="opacity-70" />
            <span className="text-[9px] uppercase tracking-wider font-bold">{t('overlay.backpack')}</span>
          </div>
          <span className="font-mono text-[12px] font-black text-emerald-400 drop-shadow">
            {formatVal(inventoryLootValue)}
          </span>
        </div>

        {/* Chest Value */}
        <div className="flex items-center justify-between bg-[var(--bg-card)] rounded p-1.5 border border-white/5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Package size={12} className="opacity-70 text-cyan-400" />
            <span className="text-[9px] uppercase tracking-wider font-bold">{t('overlay.chest')}</span>
          </div>
          <span className="font-mono text-[12px] font-black text-cyan-400 drop-shadow">
            {formatVal(displayTotalValue)}
          </span>
        </div>

      </div>

      {/* Drag Warning overlay */}
      {!settingsStore.minimalChestHudLocked && (
        <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none rounded-xl border border-dashed border-emerald-500/50 flex items-center justify-center">
          <span className="text-emerald-300 font-bold text-[8px] uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded">{t('ui.dragMode')}</span>
        </div>
      )}
    </motion.div>
  );
};
