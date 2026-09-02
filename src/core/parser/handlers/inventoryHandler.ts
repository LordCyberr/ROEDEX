import { useTrackerStore } from '../../../store/trackerStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { LootTracker } from '../../trackers/LootTracker';
import { getResellValue } from '../../../data/prices';
import { DROP_LOOKUP } from '../../../data/gameDatabase';
import { AICompanion } from '../../companion/AICompanion';
import { NotificationManager } from '../../notifications/NotificationManager';
import { DropSpawnEvent, LootDrop } from '../../../types/events';
import { InventoryEventPayload, InventoryEquipPayload, GameLootItemPayload } from '../../../types/inventory';
import { ArmorSlot } from '../../../store/types/PlayerSlice.types';
import { SAFE_ZONES } from '../../constants';

/**
 * O(n) structural diff for flat Record<string, number> maps.
 * Short-circuits on the first changed key — never serializes anything.
 * Replaces JSON.stringify equality guards on the inventory hot path.
 */
function inventoryChanged(prev: Record<string, number>, current: Record<string, number>): boolean {
  const prevKeys = Object.keys(prev);
  const currentKeys = Object.keys(current);
  if (prevKeys.length !== currentKeys.length) return true;
  for (const key of currentKeys) {
    if (prev[key] !== current[key]) return true;
  }
  return false;
}

export function evaluateToolWarnings(
  items?: any[], 
  quickBarInstances?: (string | null)[], 
  details?: any,
  parserState?: ParserState
) {
  const state = useTrackerStore.getState();
  const currentZone = state.currentZone.toLowerCase();
  const isSafeZone = SAFE_ZONES.some(z => currentZone.includes(z));

  if (isSafeZone) {
    NotificationManager.dismissToolWarningToast();
    return;
  }

  // If the player has ANY weapon equipped, assume they are managing their loadout properly
  // and suppress the warning to prevent false positives when swapping weapons.
  if (state.weapon?.name) {
    NotificationManager.dismissToolWarningToast();
    return;
  }

  const rawItems = items || parserState?.lastInventoryItems || [];
  const quickBar = quickBarInstances || state.quickBarInstances || [];

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return;
  }

  // Set of equipped/hotbar instance IDs
  const equippedInstances = new Set<string>();

  if (Array.isArray(quickBar)) {
    for (const instId of quickBar) {
      if (instId) equippedInstances.add(instId);
    }
  }

  if (details && details.equippedWeaponInstanceId) {
    equippedInstances.add(details.equippedWeaponInstanceId);
  }

  if (state.weapon && (state.weapon as any).instanceId) {
    equippedInstances.add((state.weapon as any).instanceId);
  }

  // Common keywords matching harvesting tools & weapons in Curse of Aros
  const toolKeywords = [
    'axe', 'pickaxe', 'pick', 'rod', 'net', 'sword', 'dagger', 'bow', 'spear', 
    'hammer', 'wand', 'staff', 'halberd', 'scythe', 'mace', 'blade', 
    'cleaver', 'scimitar', 'rapier', 'katana', 'whip'
  ];

  let unequippedToolName: string | null = null;

  for (const item of rawItems) {
    if (!item.itemId) continue;
    const lName = item.itemId.toLowerCase();

    // Check if this item is a tool or weapon
    const isToolOrWeapon = toolKeywords.some(kw => lName.includes(kw));
    if (isToolOrWeapon) {
      // If item has instanceId, check if it's equipped in quickbar/weapon slot
      // If item does NOT have instanceId (e.g. mock test without instanceId), check if weapon slot is empty or weapon name differs
      const isEquipped = item.instanceId 
        ? equippedInstances.has(item.instanceId)
        : (state.weapon?.name === item.itemId || (details && details.equippedWeaponInstanceId));

      if (!isEquipped) {
        const dbKey = lName.replace(/[^a-z0-9]/g, '');
        const dropInfo = DROP_LOOKUP[dbKey];
        unequippedToolName = dropInfo ? dropInfo.sanitizedName : item.itemId.replace(/([A-Z])/g, ' $1').trim().replace(/^./, (str: string) => str.toUpperCase());
        break;
      }
    }
  }

  if (unequippedToolName) {
    NotificationManager.showToolWarningToast(unequippedToolName);
  } else {
    NotificationManager.dismissToolWarningToast();
  }
}

import { ParserState } from '../index';

export function handleInventoryEvent(
  eventName: string, 
  payload: any, 
  _store: any, 
  parserState: ParserState
) {
  switch (eventName) {
    case 'chest_opened': {
      const state = useTrackerStore.getState();
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
      AICompanion.onChestOpen();
      
      const settings = useSettingsStore.getState();
      if (settings.autoMinimizeOnChest) {
        settings.setIsMinimized(true);
        settings.minimizeAllPoppedOutWindows(true);
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
          settings.minimizeAllPoppedOutWindows(false);
        }
      }, 500);
      break;
    }
    case 'chest': {
      const p = payload as InventoryEventPayload;
      const data = p?.data as any;
      const items = Array.isArray(data) ? data : (data?.InventoryItems || data?.ChestItems || data?.items || data?.chestItems || data?.Chest || data?.Inventory || data?.BankItems);
      
      const state = useTrackerStore.getState();
      if (!state.isChestOpen) {
        state.setIsChestOpen(true);
        AICompanion.onChestOpen();
      }

      if (Array.isArray(items)) {
        let bankVal = 0;
        const currentBank: Record<string, number> = {};
        
        for (const item of items) {
          const qty = item.Quantity ?? item.quantity ?? (item as any).qty ?? (item as any).Amount ?? (item as any).amount ?? 0;
          const anyItem = item as any;
          const id = item.itemId || anyItem.itemName || anyItem.name || anyItem.ItemName || anyItem.ItemId || anyItem.id || anyItem.Item;
          if (id && qty) {
            const rawId = typeof id === 'string' ? id.replace(/\s*\(.*?\)\s*/g, '') : id; // Strip any rarity tags if they exist
            if (rawId.toLowerCase() !== 'runes' && rawId.toLowerCase() !== 'runestone' && !rawId.toLowerCase().startsWith('runes_')) {
              bankVal += getResellValue(rawId, qty);
            }
            currentBank[rawId] = (currentBank[rawId] || 0) + qty;
          }
        }
        
        useTrackerStore.getState().setBankTotalValue(bankVal);
        // Structural diff guard: only dispatch if contents actually changed
        const prevBank = useTrackerStore.getState().bankInventory;
        if (inventoryChanged(prevBank, currentBank)) {
          useTrackerStore.getState().setBankInventory(currentBank);
        }
      }
      break;
    }
    case 'inventory': {
      const p = payload as InventoryEventPayload;
      const data = p?.data;
      const items = data?.InventoryItems;
      
      if (Array.isArray(items)) {
        parserState.lastInventoryItems = items;
      }

      if (data?.QuickBarInstances) {
        useTrackerStore.getState().setQuickBarInstances(data.QuickBarInstances);
      }
      
      if (Array.isArray(items)) {
        const itemMap = new Map();
        const instanceMapping: Record<string, string> = {};
        for (const item of items) {
           if (item.instanceId) {
              itemMap.set(item.instanceId, item);
              if (item.itemId) {
                instanceMapping[item.instanceId] = item.itemId;
              }
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
                  if (item) {
                     state.setWeapon({
                        name: item.itemId || 'Weapon',
                        durability: item.Durability !== undefined ? item.Durability : (item.MaxDurability || 0),
                        maxDurability: item.MaxDurability || 0,
                        slot: item.slot
                     });
                  } else {
                     state.setWeapon(null);
                  }
               } else {
                  state.setWeapon(null);
               }
            } else {
               state.setWeapon(null);
            }
        }
        
        useTrackerStore.getState().setInventoryInstances(instanceMapping);

        const processInventory = () => {
          let chestItemsVal = 0;
          const currentInventory: Record<string, number> = {};
          
          for (const item of items) {
            const qty = item.Quantity ?? item.quantity ?? (item as any).qty ?? (item as any).Amount ?? (item as any).amount ?? 0;
            const anyItem = item as any;
            const id = item.itemId || anyItem.itemName || anyItem.name || anyItem.ItemName || anyItem.ItemId;
            if (id && qty) {
              const lName = id.toLowerCase();
              if (lName !== 'runes' && lName !== 'runestone' && !lName.startsWith('runes_')) {
                chestItemsVal += getResellValue(id, qty);
              }
              currentInventory[id] = (currentInventory[id] || 0) + qty;
            }
          }

          if (eventName === 'inventory') {
            const invDetails = data?.InventoryDetails || (data as any)?.details || (payload as any)?.details || (payload as any)?.InventoryDetails;
            evaluateToolWarnings(items, data?.QuickBarInstances, invDetails, parserState);
          }

          useTrackerStore.getState().setChestTotalValue(chestItemsVal);
          // Structural diff guard: only dispatch if inventory actually changed to prevent render storms
          const prevInv = useTrackerStore.getState().chestInventory;
          if (inventoryChanged(prevInv, currentInventory)) {
            useTrackerStore.getState().setChestInventory(currentInventory);
          }
          if (eventName === 'inventory' && Object.keys(parserState.previousInventory).length > 0) {
            const state = useTrackerStore.getState();
            for (const [itemId, currentQty] of Object.entries(currentInventory)) {
              const prevQty = parserState.previousInventory[itemId] || 0;
              if (currentQty > prevQty) {
                const diff = currentQty - prevQty;
                
                // Clear death drop if player recovered their runes
                if (itemId.toLowerCase().includes('rune') && state.pendingDeathDrop && !state.isChestOpen) {
                  if (diff >= state.pendingDeathDrop.quantity * 0.9) {
                    state.setPendingDeathDrop(null);
                  }
                }

                if (diff < 5000) {
                  if (itemId.toLowerCase().includes('rune')) {
                    if (state.sessionActive) {
                      state.setSessionRunes((prev: number) => prev + diff);
                      state.addSessionRuneDrop(diff);
                    }
                    NotificationManager.queueLootToast('Runes', diff, true);
                  } else {
                    if (state.sessionActive) state.addSessionLoot(itemId, diff);
                    LootTracker.notifyLoot(itemId, diff);
                    const dbKey = itemId.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const dropInfo = DROP_LOOKUP[dbKey];
                    const displayName = dropInfo ? dropInfo.sanitizedName : itemId;
                    NotificationManager.queueLootToast(displayName, diff, false);
                  }
                }
              }
            }
          }
          
          if (eventName === 'inventory') {
            parserState.previousInventory = currentInventory;
            const wpn = useTrackerStore.getState().weapon;
            parserState.previousEquippedWeaponId = wpn ? wpn.name : null;
          }
        };

        processInventory();
      }
      break;
    }

    case 'game_loot': {
      const state = useTrackerStore.getState();
      let totalAddedValue = 0;
      const currentInv = { ...state.chestInventory };
      const lootPayload = payload as GameLootItemPayload[];

      lootPayload.forEach((item) => {
        if (item.name && item.qty) {
          const qty = item.qty;
          state.addLoot({
            dropId: Math.random().toString(36).substring(7),
            itemName: item.name,
            quantity: qty,
            pos: state.playerPosition || { x: 0, y: 0 },
            spawnTime: Date.now()
          });
          LootTracker.notifyLoot(item.name, qty);
          const isRune = item.name.toLowerCase().includes('rune');
          if (state.sessionActive) {
            if (isRune) {
              state.setSessionRunes((prev: number) => prev + qty);
              state.addSessionRuneDrop(qty);
            }
            else state.addSessionLoot(item.name, qty);
          }
          NotificationManager.queueLootToast(item.name, qty, isRune);

          // Optimistically update the chest inventory
          currentInv[item.name] = (currentInv[item.name] || 0) + qty;
          const lName = item.name.toLowerCase();
          if (lName !== 'runes' && lName !== 'runestone' && !lName.startsWith('runes_')) {
            totalAddedValue += getResellValue(item.name, qty);
          }
        }
      });
      
      // Structural diff guard for game_loot path too
      const prevGLInv = useTrackerStore.getState().chestInventory;
      if (inventoryChanged(prevGLInv, currentInv)) {
        state.setChestInventory(currentInv);
      }
      if (totalAddedValue > 0) {
        state.setChestTotalValue(state.chestTotalValue + totalAddedValue);
      }
      break;
    }

    case 'loot_drop': {
      const state = useTrackerStore.getState();
      if (payload && payload.dropId && payload.itemId && payload.position) {
        const drop: LootDrop = {
          dropId: payload.dropId,
          itemName: payload.itemId,
          quantity: payload.quantity || 1,
          pos: { x: payload.position.x, y: payload.position.y },
          spawnTime: Date.now()
        };
        state.addLoot(drop);
        LootTracker.notifyLoot(payload.itemId, payload.quantity || 1);
      }
      break;
    }

    case 'loot_spawn':
    case 'drop_spawn': {
      LootTracker.handleSpawn(payload as DropSpawnEvent);
      break;
    }

    case 'pickup_death_drop_ack': {
      const d = payload?.data || payload;
      if (d?.success) {
        const state = useTrackerStore.getState();
        state.setPendingDeathDrop(null);
        if (state.activeWaypointName?.includes('Recover')) {
          state.setActiveWaypoint(null, null);
        }
      }
      break;
    }

    case 'item_pickup_ack': {
      const d = payload?.data || payload;
      const state = useTrackerStore.getState();
      
      // If the ack has a dropId that matches our pending death drop
      if (d?.dropId && state.pendingDeathDrop?.dropId === d.dropId) {
        state.setPendingDeathDrop(null);
        if (state.activeWaypointName?.includes('Recover')) {
          state.setActiveWaypoint(null, null);
        }
      }

      if (d && (d.itemName || d.itemId)) {
        const name = d.itemName || d.itemId;
        const qty = d.quantity || 1;
        const isRune = name.toLowerCase().includes('rune');
        const state = useTrackerStore.getState();
        if (state.sessionActive) {
          if (isRune) {
            state.setSessionRunes((prev: number) => prev + qty);
            state.addSessionRuneDrop(qty);
          }
          else state.addSessionLoot(name, qty);
        }
        const dbKey = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const dropInfo = DROP_LOOKUP[dbKey];
        const displayName = dropInfo ? dropInfo.sanitizedName : name;
        state.addLootLogEntry(isRune ? 'Runestone' : displayName, qty, isRune);
        LootTracker.notifyLoot(name, qty);
        NotificationManager.queueLootToast(displayName, qty, isRune);
      }
      break;
    }

    case 'item_pickup':
    case 'loot_pickup': {
      if (payload && payload.dropId) {
        LootTracker.handlePickup(payload.dropId);
      } else if (payload && (payload.itemName || payload.itemId)) {
        const name = payload.itemName || payload.itemId;
        const qty = payload.quantity || 1;
        const isRune = name.toLowerCase().includes('rune');
        const state = useTrackerStore.getState();
        const dbKey = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        const dropInfo = DROP_LOOKUP[dbKey];
        const displayName = dropInfo ? dropInfo.sanitizedName : name;
        state.addLootLogEntry(isRune ? 'Runestone' : displayName, qty, isRune);
        NotificationManager.queueLootToast(displayName, qty, isRune);
      }
      break;
    }

    case 'inventory_equip': {
       const state = useTrackerStore.getState();
       const p = payload as InventoryEquipPayload;
       const slot = p?.inventorySlot !== undefined ? p.inventorySlot : -1;
       const maxDurability = slot !== -1 ? (state.slotDurabilities[slot] || 150) : 150;
       
       if (p?.equipSlot === 'weapon') {
          state.setWeapon({
             name: p.itemId || 'Weapon',
             durability: maxDurability,
             maxDurability: maxDurability,
             slot: slot
          });
          NotificationManager.dismissToolWarningToast();
       } else if (p?.equipSlot?.startsWith('armor')) {
          const slotType = p.equipSlot.split(':')[1] as ArmorSlot;
          state.setArmor(slotType, {
             name: p.itemId || 'Armor',
             durability: maxDurability,
             maxDurability: maxDurability,
             instanceId: p.instanceId || ''
          } as any);
       }
       break;
    }

    case 'inventory_unequip': {
       const state = useTrackerStore.getState();
       const p = payload as InventoryEquipPayload;
       if (p?.equipSlot === 'weapon') {
          const oldWeapon = state.weapon?.name;
          state.setWeapon(null);
          if (oldWeapon) {
             AICompanion.onWeaponUnequipped(oldWeapon);
             NotificationManager.onWeaponUnequipped(oldWeapon);
          }
       } else if (p?.equipSlot?.startsWith('armor')) {
          const slotType = p.equipSlot.split(':')[1] as ArmorSlot;
          state.setArmor(slotType, null);
       }
       break;
    }
    
    case 'quickbar_set':
    case 'quickbar_set_ack': {
       const state = useTrackerStore.getState();
       const d = payload?.data || payload;
       if (d?.quickBarSlot !== undefined) {
         state.updateQuickBarInstance(d.quickBarSlot, d.instanceId || null);
       }
       evaluateToolWarnings(undefined, undefined, undefined, parserState);
       break;
    }
  }
}
