import { useTrackerStore } from '../../../store/trackerStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { LootTracker } from '../../trackers/LootTracker';
import { getResellValue } from '../../../data/prices';
import { AICompanion } from '../../companion/AICompanion';
import { NotificationManager } from '../../notifications/NotificationManager';
import { DropSpawnEvent } from '../../../types/events';

export function handleInventoryEvent(
  eventName: string, 
  payload: any, 
  _store: any, 
  parserState: { 
    lastWeaponBreakTime: number; 
    lastChestOpenTime: number; 
    previousInventory: Record<string, number>;
    isBlacksmithOpen: boolean;
    loginTime: number;
    chestCloseTimeout?: ReturnType<typeof setTimeout> | null;
    lastDeathTime?: number;
  }
) {
  switch (eventName) {
    case 'chest_opened': {
      const state = useTrackerStore.getState();
      const settings = useSettingsStore.getState();
      if (Date.now() - parserState.lastWeaponBreakTime < 2000) {
        break;
      }
      
      // If the chest is already open, don't reset the timer or re-trigger the UI changes.
      // This prevents the 500ms debounce on chest_closed from breaking if they move an item right before closing.
      if (state.isChestOpen) {
        break;
      }
      
      if (parserState.chestCloseTimeout) {
        clearTimeout(parserState.chestCloseTimeout);
        parserState.chestCloseTimeout = null;
      }
      
      parserState.lastChestOpenTime = Date.now();
      state.setIsChestOpen(true);
      settings.setMinimalChestHud(true);
      AICompanion.onChestOpen();
      
      if (settings.autoMinimizeOnChest) {
        settings.setIsMinimized(true);
        Object.keys(settings.poppedOutWindows).forEach(id => {
          settings.updatePoppedOutWindow(id, { isMinimized: true });
        });
      }
      break;
    }
    case 'blacksmith_opened': {
      parserState.isBlacksmithOpen = true;
      break;
    }
    case 'blacksmith_closed': {
      parserState.isBlacksmithOpen = false;
      break;
    }
    case 'chest_closed': {
      if (parserState.chestCloseTimeout) {
        clearTimeout(parserState.chestCloseTimeout);
      }
      parserState.chestCloseTimeout = setTimeout(() => {
        const state = useTrackerStore.getState();
        const settings = useSettingsStore.getState();
        state.setIsChestOpen(false);
        if (settings.autoMinimizeOnChest) {
          settings.setIsMinimized(false);
          Object.keys(settings.poppedOutWindows).forEach(id => {
            settings.updatePoppedOutWindow(id, { isMinimized: false });
          });
        }
      }, 500);
      break;
    }
    case 'chest': {
      const data = payload?.data;
      const items = data?.InventoryItems;
      
      if (Array.isArray(items)) {
        const processChest = () => {
          let bankVal = 0;
          const currentBank: Record<string, number> = {};
          
          for (const item of items) {
            const qty = item.Quantity ?? item.quantity ?? item.qty ?? item.Amount ?? item.amount ?? 0;
            if (item.itemId && qty) {
              if (item.itemId.toLowerCase() !== 'runes' && item.itemId.toLowerCase() !== 'runestone' && !item.itemId.toLowerCase().startsWith('runes_')) {
                bankVal += getResellValue(item.itemId, qty);
              }
              currentBank[item.itemId] = (currentBank[item.itemId] || 0) + qty;
            }
          }
          
          useTrackerStore.getState().setBankTotalValue(bankVal);
          useTrackerStore.getState().setBankInventory(currentBank);
        };
        
        processChest();
      }
      break;
    }
    case 'inventory': {
      const data = payload?.data;
      const items = data?.InventoryItems;
      
      if (Array.isArray(items)) {
        const itemMap = new Map();
        for (const item of items) {
           if (item.instanceId) {
              itemMap.set(item.instanceId, item);
           }
           if (item.MaxDurability && item.slot !== undefined) {
              useTrackerStore.getState().updateSlotDurability(item.slot, item.MaxDurability);
              
              const currentWeapon = useTrackerStore.getState().weapon;
              if (currentWeapon && currentWeapon.slot === item.slot) {
                 useTrackerStore.getState().setWeapon({
                    ...currentWeapon,
                    maxDurability: item.MaxDurability,
                    durability: item.Durability !== undefined ? item.Durability : currentWeapon.durability
                 });
              }
           }
        }
        
        if (eventName === 'inventory' && data?.InventoryDetails) {
            const details = data.InventoryDetails;
            const state = useTrackerStore.getState();
            
            const armorMap: Record<string, 'Helmet' | 'Torso' | 'Pants' | 'Gloves' | 'Boots'> = {
              equippedArmorHelmetInstanceId: 'Helmet',
              equippedArmorTorsoInstanceId: 'Torso',
              equippedArmorPantsInstanceId: 'Pants',
              equippedArmorGlovesInstanceId: 'Gloves',
              equippedArmorBootsInstanceId: 'Boots'
            };
            
            for (const [key, slotName] of Object.entries(armorMap)) {
               const instanceId = details[key];
               if (instanceId) {
                  const item = itemMap.get(instanceId);
                  if (item && item.MaxDurability) {
                    state.setArmor(slotName, {
                      name: item.itemId,
                      durability: item.Durability !== undefined ? item.Durability : item.MaxDurability,
                      maxDurability: item.MaxDurability,
                      instanceId: instanceId
                    });
                  }
               } else {
                  state.setArmor(slotName, null);
               }
            }

            const weaponKey = Object.keys(details).find(k => 
              k.toLowerCase().includes('instanceid') &&
              (k.toLowerCase().includes('weapon') || k.toLowerCase().includes('tool') || k.toLowerCase().includes('mainhand'))
            );
            
            if (weaponKey && !armorMap[weaponKey as keyof typeof armorMap]) {
               const weaponInstanceId = details[weaponKey];
               if (weaponInstanceId) {
                  const item = itemMap.get(weaponInstanceId);
                  if (item && item.MaxDurability) {
                     state.setWeapon({
                        name: item.itemId || 'Weapon',
                        durability: item.Durability !== undefined ? item.Durability : item.MaxDurability,
                        maxDurability: item.MaxDurability,
                        slot: item.slot
                     });
                  }
               }
            }
        }

        const processInventory = () => {
          let chestItemsVal = 0;
          const currentInventory: Record<string, number> = {};
          
          for (const item of items) {
            const qty = item.Quantity ?? item.quantity ?? item.qty ?? item.Amount ?? item.amount ?? 0;
            if (item.itemId && qty) {
              if (item.itemId.toLowerCase() !== 'runes' && item.itemId.toLowerCase() !== 'runestone' && !item.itemId.toLowerCase().startsWith('runes_')) {
                chestItemsVal += getResellValue(item.itemId, qty);
              }
              currentInventory[item.itemId] = (currentInventory[item.itemId] || 0) + qty;
            }
          }

          useTrackerStore.getState().setChestTotalValue(chestItemsVal);
          useTrackerStore.getState().setChestInventory(currentInventory);
          if (eventName === 'inventory' && Object.keys(parserState.previousInventory).length > 0) {
            const state = useTrackerStore.getState();
            for (const [itemId, currentQty] of Object.entries(currentInventory)) {
              const prevQty = parserState.previousInventory[itemId] || 0;
              if (currentQty > prevQty) {
                const diff = currentQty - prevQty;
                if (diff < 5000) {
                  if (itemId.toLowerCase().includes('rune')) {
                    if (state.sessionActive) state.setSessionRunes((prev: number) => prev + diff);
                  } else {
                    if (state.sessionActive) state.addSessionLoot(itemId, diff);
                    LootTracker.notifyLoot(itemId, diff);
                  }
                }
              }
            }
          }
          
          if (eventName === 'inventory') {
            parserState.previousInventory = currentInventory;
          }
        };

        processInventory();
      }
      break;
    }

    case 'game_loot': {
      const state = useTrackerStore.getState();
      payload.forEach((item: any) => {
        if (item.name && item.qty) {
          const qty = item.qty;
          useTrackerStore.getState().addLoot({
            dropId: Math.random().toString(36).substring(7),
            itemName: item.name,
            quantity: qty,
            pos: state.playerPosition || { x: 0, y: 0 },
            spawnTime: Date.now()
          });
          LootTracker.notifyLoot(item.name, qty);
        }
      });
      break;
    }

    case 'loot_spawn':
    case 'drop_spawn': {
      LootTracker.handleSpawn(payload as DropSpawnEvent);
      break;
    }

    case 'loot_pickup': {
      LootTracker.handlePickup(payload.dropId);
      break;
    }

    case 'inventory_equip': {
       const state = useTrackerStore.getState();
       const slot = payload?.inventorySlot !== undefined ? payload.inventorySlot : -1;
       const maxDurability = slot !== -1 ? (state.slotDurabilities[slot] || 150) : 150;
       
       if (payload?.equipSlot === 'weapon') {
          state.setWeapon({
             name: payload.itemId || 'Weapon',
             durability: maxDurability,
             maxDurability: maxDurability,
             slot: slot
          });
       } else if (payload?.equipSlot?.startsWith('armor')) {
          state.setArmor(payload.equipSlot, {
             name: payload.itemId || 'Armor',
             durability: maxDurability,
             maxDurability: maxDurability,
             instanceId: payload.instanceId || ''
          } as any);
       }
       break;
    }

    case 'inventory_unequip': {
       const state = useTrackerStore.getState();
       if (payload?.equipSlot === 'weapon') {
          const oldWeapon = state.weapon?.name;
          state.setWeapon(null);
          if (oldWeapon) {
             AICompanion.onWeaponUnequipped(oldWeapon);
             NotificationManager.onWeaponUnequipped(oldWeapon);
          }
       } else if (payload?.equipSlot?.startsWith('armor')) {
          state.setArmor(payload.equipSlot, null);
       }
       break;
    }
  }
}
