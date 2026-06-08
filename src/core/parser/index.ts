import { useTrackerStore } from '../../store/trackerStore';
import { TrackerValidator } from '../../utils/trackerValidator';
import { MobTracker } from '../trackers/MobTracker';
import { ResourceTracker } from '../trackers/ResourceTracker';
import { LootTracker } from '../trackers/LootTracker';
import { 
  SpawnStateEvent,
  EnemyRespawnEvent, 
  DropSpawnEvent, 
  ResourceRespawnEvent 
} from '../../types/events';
import { getRunesRequired } from '../../data/levelRequirements';
import { getResellValue } from '../../data/prices';
import { BobCompanion } from '../companion/BobCompanion';

// Ensure the parser is loaded
console.log('[ROEDEX] Parser Loaded');

// List of rare resources to track for notifications
const RARE_RESOURCES = [
  'diamond', 'void', 'godwood', 'moonpetal', 'shadow', 'cinder', 'crystal'
];

/**
 * Parses raw Socket.IO packets (e.g. `42/game,["event_name", {...}]`)
 */
let previousInventory: Record<string, number> = {};
let lastWeaponBreakTime = 0;

export function parsePacket(rawMessage: string) {
  const store = useTrackerStore.getState();
  
  // 1. Strip the prefix
  let jsonString = rawMessage;
  if (jsonString.startsWith('42["')) {
    jsonString = jsonString.slice(2);
  } else if (jsonString.startsWith('42/game,[')) {
    jsonString = jsonString.slice(8);
  } else {
    // Unknown or internal packet format
    return;
  }
  
  // 2. Parse the JSON array
  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    return;
  }

  // Socket.IO normally sends: ["event_name", { payload... }]
  if (!Array.isArray(parsed) || parsed.length < 2) return;

  const eventName = parsed[0];
  const payload = parsed[1];

  try {
    // Attempt to extract username from any packet payload
    if (payload && typeof payload === 'object') {
      const possibleName = payload.username || payload.characterName || payload.name || payload.data?.username || payload.data?.characterName || payload.data?.name || payload.player?.name;
      if (possibleName && typeof possibleName === 'string') {
         BobCompanion.greetUser(possibleName);
         import('../notifications/NotificationManager').then(({ NotificationManager }) => NotificationManager.greetUser(possibleName));
      }
    }

    // Activity tracker for Bob
    BobCompanion.onActivity();

    // Aggressive player position sniffing to ensure distance updates as player moves
    if (typeof eventName === 'string') {
      const en = eventName.toLowerCase();
      if (['move', 'm', 'walk', 'pos', 'update', 'hero', 'player', 'sync'].some(k => en.includes(k))) {
        let newPos = null;
        if (payload && typeof payload.x === 'number' && typeof payload.y === 'number') {
          newPos = { x: payload.x, y: payload.y };
        } else if (payload && payload.pos && typeof payload.pos.x === 'number') {
          newPos = payload.pos;
        } else if (payload && payload.position && typeof payload.position.x === 'number') {
          newPos = payload.position;
        } else if (payload && payload.playerPosition && typeof payload.playerPosition.x === 'number') {
          newPos = payload.playerPosition;
        } else if (payload && payload.data && payload.data.position && typeof payload.data.position.x === 'number') {
          newPos = payload.data.position;
        } else if (typeof parsed[1] === 'number' && typeof parsed[2] === 'number') {
          newPos = { x: parsed[1], y: parsed[2] };
        }
        if (newPos) {
          store.setPlayerPosition(newPos);
        }
      }
    }
    
    switch (eventName) {
      case 'spawn_state': {
        const data = payload as SpawnStateEvent;
        
        // SESSION TRACKING: DO NOT wipe old state entirely.
        // store.clearEnemies();
        // store.clearResources();
        // store.clearLoot();
        
        const currentZone = data.zone || 'Unknown';
        store.setCurrentZone(currentZone);

        // 1. Process Enemies
        if (data.enemies) {
          const validEnemies = data.enemies.filter((e: any) => TrackerValidator.validateEnemySpawn(e));
          const parsedEnemies = validEnemies.map((e: any) => MobTracker.parseSpawn(e as EnemyRespawnEvent, currentZone));
          store.batchSetEnemies(parsedEnemies);
        }

        // 2. Process Resources
        if (data.resources) {
          const validResources = data.resources.filter((r: any) => TrackerValidator.validateResourceSpawn(r));
          
          // Group rare resources to prevent notification spam on zone load
          const rareCount: Record<string, number> = {};
          validResources.forEach((r: any) => {
            if (r.resource) {
              const matchedRare = RARE_RESOURCES.find(rare => r.resource.toLowerCase().includes(rare.toLowerCase()));
              if (matchedRare) {
                 rareCount[matchedRare] = (rareCount[matchedRare] || 0) + 1;
              }
            }
          });
          
          const parsedResources = validResources.map((r: any) => ResourceTracker.parseSpawn(r as ResourceRespawnEvent, currentZone));
          store.batchSetResources(parsedResources);
        }
        
        break;
      }

      case 'stats':
      case 'player_state': {
        const d = payload?.data || payload; // handle both "stats" nested data or direct
        
        if (d) {
          // Attempt to capture player position from stats/state packets if available
          if (d.pos) {
            useTrackerStore.getState().setPlayerPosition(d.pos);
          } else if (d.playerPosition) {
            useTrackerStore.getState().setPlayerPosition(d.playerPosition);
          }
          
          // Attempt to capture weapon durability
          if (d.weapon) {
            const state = useTrackerStore.getState();
            const currentWeapon = state.weapon;
            const newMax = d.weapon.maxDurability || currentWeapon?.maxDurability || 150;
            
            state.setWeapon({
              name: d.weapon.name || currentWeapon?.name || 'Weapon',
              durability: d.weapon.durability || 0,
              maxDurability: newMax,
              slot: d.weapon.slot !== undefined ? d.weapon.slot : currentWeapon?.slot
            });
          } // <-- Added missing bracket

          // Attempt to capture level and runes/exp
          const store = useTrackerStore.getState();
          const profileUpdate: any = {};
          
          if (d.level !== undefined || d.Level !== undefined || d.lvl !== undefined) {
             profileUpdate.level = d.level ?? d.Level ?? d.lvl;
          }
          
          if (d.name || d.playerName) {
             profileUpdate.name = d.name || d.playerName;
          }
          
          if (d.exp !== undefined || d.Exp !== undefined || d.runes !== undefined || d.experience !== undefined) {
             profileUpdate.currentRunes = d.runes ?? d.exp ?? d.Exp ?? d.experience;
          }
          
          if (d.nextLevelExp !== undefined || d.next_exp !== undefined || d.NextExp !== undefined || d.nextLevel !== undefined) {
             profileUpdate.runesRequired = d.nextLevelExp ?? d.next_exp ?? d.NextExp ?? d.nextLevel;
          }
          
          // Only update if we found something
          if (Object.keys(profileUpdate).length > 0) {
             const finalLevel = profileUpdate.level || store.playerProfile.level || 1;
             
             // Fallback using our new levelRequirements table
             if (!profileUpdate.runesRequired && (!store.playerProfile.runesRequired || profileUpdate.level)) {
               profileUpdate.runesRequired = getRunesRequired(finalLevel);
             }
             
             store.setPlayerProfile(profileUpdate);
             
             const updatedProfile = useTrackerStore.getState().playerProfile;
             if (updatedProfile.currentRunes >= updatedProfile.runesRequired && updatedProfile.runesRequired > 0) {
               BobCompanion.onLevelUpReady(updatedProfile.level);
             }
          }

          if (d.t && typeof d.t === 'string') {
            const resourceType = d.t.toLowerCase();
            if (resourceType.includes('ore') || resourceType.includes('rock') || resourceType.includes('copper') || resourceType.includes('iron') || resourceType.includes('gold')) {
               BobCompanion.onMine();
            } else if (resourceType.includes('tree') || resourceType.includes('wood') || resourceType.includes('log')) {
               BobCompanion.onChop();
            } else {
               BobCompanion.onGather();
            }
          }
        }
        break;
      }
      case 'chest_opened': {
        const state = useTrackerStore.getState();
        
        // Fix: Ignore false-positive chest_opened events that happen right after a weapon breaks
        if (Date.now() - lastWeaponBreakTime < 2000) {
          break;
        }
        
        if (state.autoMinimizeOnChest) {
          state.setIsMinimized(true);
          Object.keys(state.poppedOutWindows).forEach(id => {
            state.updatePoppedOutWindow(id, { isMinimized: true });
          });
        }
        break;
      }
      case 'chest_closed': {
        const state = useTrackerStore.getState();
        if (state.autoMinimizeOnChest) {
          state.setIsMinimized(false);
          Object.keys(state.poppedOutWindows).forEach(id => {
            state.updatePoppedOutWindow(id, { isMinimized: false });
          });
        }
        break;
      }
      case 'inventory': {
        
        // payload = {"data": {"InventoryItems": [...]}}
        const data = payload?.data;
        const items = data?.InventoryItems;
        
        if (Array.isArray(items)) {
          let chestItemsVal = 0;
          const currentInventory: Record<string, number> = {};
          
          const itemMap = new Map();
          for (const item of items) {
            if (item.instanceId) {
              itemMap.set(item.instanceId, item);
            }
            if (item.itemId && item.Quantity) {
              chestItemsVal += getResellValue(item.itemId, item.Quantity);
              currentInventory[item.itemId] = (currentInventory[item.itemId] || 0) + item.Quantity;
            }
            
            // Sync true MaxDurability and Durability from server if present
            if (item.MaxDurability && item.slot !== undefined) {
              useTrackerStore.getState().updateSlotDurability(item.slot, item.MaxDurability);
              
              // If this is our currently equipped weapon's slot, instantly sync it!
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

          // --- LIVE LOOT TRACKING VIA INVENTORY DIFF ---
          if (eventName === 'inventory' && Object.keys(previousInventory).length > 0) {
            const state = useTrackerStore.getState();
            if (state.sessionActive) {
              for (const [itemId, currentQty] of Object.entries(currentInventory)) {
                const prevQty = previousInventory[itemId] || 0;
                if (currentQty > prevQty) {
                  const diff = currentQty - prevQty;
                  
                  // Ignore massive diffs (likely withdrawing from bank)
                  if (diff < 5000) {
                    if (itemId.toLowerCase().includes('rune')) {
                      state.setSessionRunes((prev: number) => prev + diff);
                    } else {
                      state.addSessionLoot(itemId, diff);
                    }
                  }
                }
              }
            }
          }
          
          if (eventName === 'inventory') {
            previousInventory = currentInventory;
          }

          if (eventName === 'inventory' && data?.InventoryDetails) {
            const details = data.InventoryDetails;
            const state = useTrackerStore.getState();
            
            // --- Parse Armor ---
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

            // --- Parse Weapon ---
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
                        slot: item.slot !== undefined ? item.slot : 6
                     });
                  }
               }
            }
          }
          
          // Set the literal value of what is in the physical chest / inventory
          useTrackerStore.getState().setChestTotalValue(chestItemsVal);
          useTrackerStore.getState().setChestInventory(currentInventory);
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
          }
        });
        
        // Live update the chest value with the new loot!
        // Removed as per user request: only items literally inside the "chest" event should count for the Chest Value.
        break;
      }

      case 'enemy_respawn':
      case 'enemy_spawn': {
        if (TrackerValidator.validateEnemySpawn(payload as EnemyRespawnEvent)) {
          MobTracker.handleSpawn(payload as EnemyRespawnEvent, store.currentZone);
        }
        break;
      }

      case 'combat_hit_ack': {
        const d = payload?.data || payload;
        if (d?.weaponDurability !== undefined) {
           const state = useTrackerStore.getState();
           const slot = d.weaponSlot !== undefined ? d.weaponSlot : -1;
           const currentMax = slot !== -1 ? (state.slotDurabilities[slot] || 150) : 150;
           const newMax = Math.max(currentMax, d.weaponDurability !== -1 ? d.weaponDurability : 0);
           
           if (slot !== -1 && newMax > currentMax) {
             state.updateSlotDurability(slot, newMax);
           }

           const name = state.weapon?.name || 'weapon';
           
           if (d.weaponDurability === -1) {
             const oldWeapon = state.weapon?.name;
             if (oldWeapon) {
                state.setWeapon(null);
                BobCompanion.checkDurability(oldWeapon, 0, newMax);
                import('../notifications/NotificationManager').then(({ NotificationManager }) => NotificationManager.checkDurability(oldWeapon, 0, newMax));
             }
           } else {
             if (d.weaponDurability === 0 && state.weapon?.durability && state.weapon.durability > 0) {
               lastWeaponBreakTime = Date.now();
             }

             state.setWeapon({
               name: name,
               durability: d.weaponDurability,
               maxDurability: newMax,
               slot: slot
             });

             BobCompanion.checkDurability(name, d.weaponDurability, newMax);
             import('../notifications/NotificationManager').then(({ NotificationManager }) => NotificationManager.checkDurability(name, d.weaponDurability, newMax));
           }
        }
        if (TrackerValidator.validateCombatHit(payload)) {
          MobTracker.handleDamage(payload, store.currentZone);
        }
        break;
      }

      case 'resource_respawn':
      case 'resource_spawn': {
        if (TrackerValidator.validateResourceSpawn(payload as ResourceRespawnEvent)) {
          // Removed rare notification per user request
          ResourceTracker.handleSpawn(payload as ResourceRespawnEvent, store.currentZone);
        }
        break;
      }

      case 'gather_hit_ack':
      case 'resource_cooldown': {
        if (eventName === 'gather_hit_ack' && payload?.data) {
           const d = payload.data;
           if (d?.weaponDurability !== undefined) {
             const state = useTrackerStore.getState();
             const slot = d.weaponSlot !== undefined ? d.weaponSlot : -1;
             const currentMax = slot !== -1 ? (state.slotDurabilities[slot] || 150) : 150;
             const newMax = Math.max(currentMax, d.weaponDurability !== -1 ? d.weaponDurability : 0);
             
             if (slot !== -1 && newMax > currentMax) {
               state.updateSlotDurability(slot, newMax);
             }

             const name = state.weapon?.name || 'tool';
             
             if (d.weaponDurability === -1) {
                const oldWeapon = state.weapon?.name;
                if (oldWeapon) {
                   state.setWeapon(null);
                   BobCompanion.checkDurability(oldWeapon, 0, newMax);
                   import('../notifications/NotificationManager').then(({ NotificationManager }) => NotificationManager.checkDurability(oldWeapon, 0, newMax));
                }
             } else {
                if (d.weaponDurability === 0 && state.weapon?.durability && state.weapon.durability > 0) {
                  lastWeaponBreakTime = Date.now();
                }

                state.setWeapon({
                  name: name,
                  durability: d.weaponDurability,
                  maxDurability: newMax,
                  slot: slot
                });

                BobCompanion.checkDurability(name, d.weaponDurability, newMax);
                import('../notifications/NotificationManager').then(({ NotificationManager }) => NotificationManager.checkDurability(name, d.weaponDurability, newMax));
             }
           }
           ResourceTracker.handleGather(payload, store.currentZone);
        } else if (eventName === 'resource_cooldown') {
           ResourceTracker.handleGather(payload, store.currentZone);
        }
        break;
      }

      case 'move': {
         // player moving
         if (payload?.pos) {
            store.setPlayerPosition(payload.pos);
         }
         break;
      }

      case 'npcquest_all_result': {
        try {
          // payload is already the object {"success":true, "npcs": [...]}
          const npcs = payload?.npcs || [];
          const activeQuests: any[] = [];
          
          for (const npc of npcs) {
            if (npc.quests && Array.isArray(npc.quests)) {
              for (const q of npc.quests) {
                if (q.status === 'accepted') {
                  // Map result.currentAmount to currentAmount directly on the quest
                  q.currentAmount = q.result?.currentAmount || 0;
                  activeQuests.push(q);
                }
              }
            }
          }
          
          useTrackerStore.getState().setQuests(activeQuests);
        } catch (err) {
          console.error("Error parsing quests:", err);
        }
        break;
      }

      case 'zone_change':
      case 'join_zone': {
         const zone = payload?.zone || payload?.data?.zone;
         if (zone) {
            store.setCurrentZone(zone);
            BobCompanion.zoneChange(zone);
            if (store.notificationSettings.enabled && store.notificationSettings.toasts && store.notificationSettings.zoneChange) {
              store.addNotification({ type: 'info', title: 'System', message: `Entered Zone: ${zone}` });
            }
         }
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
               durability: maxDurability, // Assume max until we hit a mob or sync inventory
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
               BobCompanion.onWeaponUnequipped(oldWeapon);
               import('../notifications/NotificationManager').then(({ NotificationManager }) => NotificationManager.onWeaponUnequipped(oldWeapon));
            }
         } else if (payload?.equipSlot?.startsWith('armor')) {
            state.setArmor(payload.equipSlot, null);
         }
         break;
      }

      case 'level_up':
      case 'achievement':
      case 'milestone': {
        BobCompanion.onLevelUp();
        break;
      }

      default:
        // Unhandled events
        break;
    }
  } catch (error) {
    console.error(`[Parser] Error processing message: ${rawMessage}`, error);
  }
}
