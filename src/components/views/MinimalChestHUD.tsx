import React from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { motion } from 'motion/react';
import { getResellValue } from '../../data/prices';

export const MinimalChestHUD: React.FC = () => {
  const store = useTrackerStore();

  if (!store.isChestOpen || !store.minimalChestHud) return null;

  // Calculate values (copied from LootView logic)
  const isToolOrWeapon = (name: string) => {
    const n = name.toLowerCase();
    return n.includes('sword') || n.includes('pickaxe') || n.includes('axe') || n.includes('tool') || n.includes('weapon');
  };

  const inventoryLootValue = Object.entries(store.chestInventory).reduce((acc, [name, qty]) => {
    if (isToolOrWeapon(name)) return acc;
    if (name.toLowerCase() === 'runes' || name.toLowerCase() === 'runestone' || name.toLowerCase().startsWith('runes_')) return acc;
    return acc + getResellValue(name, qty);
  }, 0);

  const displayTotalValue = Object.entries(store.bankInventory || {}).reduce((acc, [name, qty]) => {
    // Note: Since we don't have excludedItems state here directly (it's local to LootView),
    // we'll just calculate the raw total. For the minimal HUD, this is usually what they want anyway.
    return acc + getResellValue(name, qty);
  }, 0);

  const formatVal = (val: number) => {
    if (val >= 1000) return (val / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return val.toString();
  };

  const handleClose = () => {
    // Only close if the minimal HUD is locked (so they can drag it while unlocked)
    if (store.minimalChestHudLocked) {
      store.setIsChestOpen(false);

      const dispatchEscape = () => {
        // Dispatch Escape
        const escapeEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
          keyCode: 27,
          which: 27,
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(escapeEvent);
        window.dispatchEvent(escapeEvent);
        
        // Dispatch 'E' or 'e' as fallback
        const eEvent = new KeyboardEvent('keydown', {
          key: 'e',
          code: 'KeyE',
          keyCode: 69,
          which: 69,
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(eEvent);
        window.dispatchEvent(eEvent);

        const canvas = document.querySelector('canvas');
        if (canvas) {
          canvas.dispatchEvent(escapeEvent);
          canvas.dispatchEvent(eEvent);
        }
      };

      // Game requires TWO escape presses to fully close the chest reliably!
      dispatchEscape();
      setTimeout(dispatchEscape, 100);
    }
  };

  // Common drag handler
  const createDragEndHandler = (key: 'chest' | 'inventory' | 'closeZone') => (_: any, info: any) => {
    const current = store.chestWidgetPositions[key];
    store.setChestWidgetPosition(key, {
      x: current.x + info.offset.x,
      y: current.y + info.offset.y
    });
  };

  return (
    <>
      {/* 1. Inventory Loot Value Widget */}
      <motion.div
        drag={!store.minimalChestHudLocked}
        dragMomentum={false}
        onDragEnd={createDragEndHandler('inventory')}
        initial={{ x: store.chestWidgetPositions.inventory.x, y: store.chestWidgetPositions.inventory.y }}
        className={`absolute z-40 p-2 rounded ${!store.minimalChestHudLocked ? 'pointer-events-auto border border-dashed border-white/50 cursor-move bg-black/40' : 'pointer-events-none'}`}
        style={{ scale: store.globalScale, transformOrigin: 'top left' }}
      >
        <div className="flex flex-col items-center justify-center drop-shadow-md text-center">
          <span className="text-[10px] text-slate-300 uppercase tracking-widest font-black" style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}>Backpack Value</span>
          <div className="text-emerald-400 font-mono font-black text-[16px] leading-none mt-0.5" style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}>
            {formatVal(inventoryLootValue)}
          </div>
        </div>
      </motion.div>

      {/* 2. Chest Worth Widget */}
      <motion.div
        drag={!store.minimalChestHudLocked}
        dragMomentum={false}
        onDragEnd={createDragEndHandler('chest')}
        initial={{ x: store.chestWidgetPositions.chest.x, y: store.chestWidgetPositions.chest.y }}
        className={`absolute z-40 p-2 rounded ${!store.minimalChestHudLocked ? 'pointer-events-auto border border-dashed border-white/50 cursor-move bg-black/40' : 'pointer-events-none'}`}
        style={{ scale: store.globalScale, transformOrigin: 'top left' }}
      >
        <div className="flex flex-col items-center justify-center drop-shadow-md text-center">
          <span className="text-[10px] text-slate-300 uppercase tracking-widest font-black" style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}>Chest Value</span>
          <div className="text-cyan-400 font-mono font-black text-[16px] leading-none mt-0.5" style={{ textShadow: '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000' }}>
            {formatVal(displayTotalValue)}
          </div>
        </div>
      </motion.div>

      {/* 3. Invisible Close Zone */}
      <motion.div
        drag={!store.minimalChestHudLocked}
        dragMomentum={false}
        onDragEnd={createDragEndHandler('closeZone')}
        initial={{ x: store.chestWidgetPositions.closeZone.x, y: store.chestWidgetPositions.closeZone.y }}
        onClick={handleClose}
        className={`absolute z-40 w-8 h-8 rounded ${!store.minimalChestHudLocked ? 'border-2 border-red-500 bg-red-500/20 cursor-move flex items-center justify-center' : 'cursor-pointer'}`}
        style={{ 
          scale: store.globalScale, 
          transformOrigin: 'top left',
          pointerEvents: 'auto' // Important: must receive clicks even when locked
        }}
      >
        {!store.minimalChestHudLocked && <span className="text-red-300 text-[10px] font-bold select-none">X</span>}
      </motion.div>
    </>
  );
};
