import { useTrackerStore } from '../../../store/trackerStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { TrackerValidator } from '../../../utils/trackerValidator';
import { MobTracker } from '../../trackers/MobTracker';
import { ResourceTracker } from '../../trackers/ResourceTracker';
import { AICompanion } from '../../companion/AICompanion';
import { NotificationManager } from '../../notifications/NotificationManager';
import { SpawnStateEvent, EnemyRespawnEvent, ResourceRespawnEvent } from '../../../types/events';
import { getRunesRequired } from '../../../data/levelRequirements';
import { useBlacksmithStore } from '../../../store/blacksmithStore';
import { parsePacket } from '../index';

const RARE_RESOURCES = [
  'diamond', 'void', 'godwood', 'moonpetal', 'shadow', 'cinder', 'crystal'
];

export function handlePlayerEvent(eventName: string, payload: any, store: any, parserState: any) {
  switch (eventName) {
    case 'user_online': {
       if (payload && payload.username) {
           const state = useTrackerStore.getState();
           
           if (!state.sessionPlayerName) {
             // Store it temporarily for verification when stats arrive
             if (!parserState.pendingUsername) {
               parserState.pendingUsername = payload.username;
             }
           }
           
           if (payload.userId) {
             state.setOnlinePlayer(payload.userId, {
               username: payload.username,
               lastSeen: Date.now()
             });
           }
       }
      break;
    }
    case 'spawn_state': {
      const data = payload as SpawnStateEvent;
      
      const currentZone = data.zone || 'Unknown';
      const prevZone = store.currentZone;
      
      store.setCurrentZone(currentZone);
      if (currentZone !== 'Unknown') {
        AICompanion.zoneChange(currentZone);
        if (currentZone !== prevZone) {
          NotificationManager.showZoneLoadingToast(currentZone);
        }
      }

      // Process massive datasets in chunks to prevent V8 main-thread locking and stuttering
      const processInChunks = (items: any[], chunkSize: number, processor: (chunk: any[]) => void) => {
        if (!items || !items.length) return;
        let index = 0;
        const processNext = () => {
          const chunk = items.slice(index, index + chunkSize);
          processor(chunk);
          index += chunkSize;
          if (index < items.length) {
            requestAnimationFrame(() => setTimeout(processNext, 0));
          }
        };
        processNext();
      };

      if (data.enemies) {
        processInChunks(data.enemies, 50, (chunk) => {
          const validEnemies = chunk.filter((e: any) => TrackerValidator.validateEnemySpawn(e));
          const parsedEnemies = validEnemies.map((e: any) => MobTracker.parseSpawn(e as EnemyRespawnEvent, currentZone));
          store.batchSetEnemies(parsedEnemies);
        });
      }

      if (data.resources) {
        processInChunks(data.resources, 150, (chunk) => {
          const validResources = chunk.filter((r: any) => TrackerValidator.validateResourceSpawn(r));
          
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
        });
      }
      break;
    }

    case 'state': {
      if (payload) {
        if (payload.locationName) {
          store.setCurrentZone(payload.locationName);
          AICompanion.zoneChange(payload.locationName);
        }
        if (payload.position) {
          store.setPlayerPosition(payload.position);
        }
        if (payload.health !== undefined && payload.maxHealth !== undefined) {
          const profileUpdate: any = {
            currentHealth: payload.health,
            maxHealth: payload.maxHealth
          };
          store.setPlayerProfile(profileUpdate);
        }
      }
      break;
    }

    case 'player_death': {
      parserState.lastDeathTime = Date.now();
      if (payload?.position && payload?.droppedRunes > 0) {
         const currentZone = useTrackerStore.getState().currentZone;
         const dropped = payload.droppedRunes;
         const pos = payload.position;
         useTrackerStore.getState().setActiveWaypoint(
            { x: pos.x, y: pos.y }, 
            `Recover ${dropped} Runes`, 
            currentZone
         );
         const settingsStore = useSettingsStore.getState();
         settingsStore.addNotification({
            type: 'combat',
            title: 'You Died!',
            message: `Dropped ${dropped} Runes in ${currentZone}. Tracker active.`
         });
      }
      break;
    }

    case 'player:damage:taken': {
      if (payload?.damageAmount === 0) {
        AICompanion.onParry();
      } else {
        const sourceName = payload?.sourceName || payload?.sourceId || '';
        const isBoss = payload?.isBoss || false;
        AICompanion.onPlayerDamage(sourceName, payload?.damageAmount || 0, isBoss);
      }
      
      if (payload?.stats) {
        parsePacket(`42["stats", ${JSON.stringify(payload.stats)}]`);
      }

      if (payload?.inventory?.main_items) {
        const inv = payload.inventory;
        const state = useTrackerStore.getState();
        const armorSlotMap: Record<number, 'Helmet' | 'Torso' | 'Pants' | 'Gloves' | 'Boots'> = {
          [inv.equipped_helmet]: 'Helmet',
          [inv.equipped_torso]: 'Torso',
          [inv.equipped_pants]: 'Pants',
          [inv.equipped_gloves]: 'Gloves',
          [inv.equipped_boots]: 'Boots'
        };

        for (const item of inv.main_items) {
          if (item.slot !== undefined && armorSlotMap[item.slot]) {
            const slotName = armorSlotMap[item.slot];
            state.setArmor(slotName, {
              name: item.itemId || 'Armor',
              durability: item.durability !== undefined ? item.durability : item.maxDurability,
              maxDurability: item.maxDurability,
              instanceId: item.instanceId || ''
            } as any);
          }
        }
      }
      break;
    }

    case 'stats':
    case 'player_state': {
      const d = payload?.data || payload; 
      
      if (d) {
        if (d.pos) {
          useTrackerStore.getState().setPlayerPosition(d.pos);
        } else if (d.playerPosition) {
          useTrackerStore.getState().setPlayerPosition(d.playerPosition);
        }
        
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
        }

        const storeState = useTrackerStore.getState();
        const profileUpdate: any = {};
        
        if (d.level !== undefined || d.Level !== undefined || d.lvl !== undefined) {
           profileUpdate.level = d.level ?? d.Level ?? d.lvl;
        }
        
        if (d.displayName || d.name || d.playerName) {
           const newName = d.displayName || d.name || d.playerName;
           const state = useTrackerStore.getState();
           if (newName !== 'tool' && newName !== 'weapon' && newName.toLowerCase() !== 'unknown') {
              if (!state.sessionPlayerName) {
                 if (parserState.pendingUsername && newName.toLowerCase() === parserState.pendingUsername.toLowerCase()) {
                    state.setSessionPlayerName(newName);
                    profileUpdate.name = newName;
                 } else if (!parserState.pendingUsername) {
                    state.setSessionPlayerName(newName);
                    profileUpdate.name = newName;
                 }
              }
              // Only greet if it's actually their name
              if (state.sessionPlayerName === newName) {
                AICompanion.greetUser(newName);
                NotificationManager.greetUser(newName);
              }
           }
        }
        
        if (d.exp !== undefined || d.Exp !== undefined || d.runes !== undefined || d.experience !== undefined) {
           profileUpdate.currentRunes = d.runes ?? d.exp ?? d.Exp ?? d.experience;
        }
        
        if (d.nextLevelExp !== undefined || d.next_exp !== undefined || d.NextExp !== undefined || d.nextLevel !== undefined) {
           profileUpdate.runesRequired = d.nextLevelExp ?? d.next_exp ?? d.NextExp ?? d.nextLevel;
        }

        if (d.hp === 0 || d.Hp === 0 || d.health === 0 || d.Health === 0) {
           parserState.lastDeathTime = Date.now();
           AICompanion.onPlayerDeath();
        }
        
        if (d.isGuildPassActive !== undefined) {
           storeState.setIsGuildPassActive(d.isGuildPassActive);
        }

        if (Object.keys(profileUpdate).length > 0) {
           const finalLevel = profileUpdate.level || storeState.playerProfile.level || 1;
           
           if (!profileUpdate.runesRequired && (!storeState.playerProfile.runesRequired || profileUpdate.level)) {
             profileUpdate.runesRequired = getRunesRequired(finalLevel);
           }
           
           if (profileUpdate.name && profileUpdate.name !== storeState.playerProfile.name) {
             AICompanion.greetUser(profileUpdate.name);
             NotificationManager.greetUser(profileUpdate.name);
           }
           
           storeState.setPlayerProfile(profileUpdate);
           
           const updatedProfile = useTrackerStore.getState().playerProfile;
           if (updatedProfile.currentRunes >= updatedProfile.runesRequired && updatedProfile.runesRequired > 0) {
             AICompanion.onLevelUpReady(updatedProfile.level);
           } else if (updatedProfile.runesRequired > 0) {
             const remaining = updatedProfile.runesRequired - updatedProfile.currentRunes;
             if (remaining > 0 && remaining < updatedProfile.runesRequired * 0.05) {
               AICompanion.onLevelUpNear();
             }
           }
        }

        if (d.enemiesData || d.oresData || d.treesData || d.bushesData) {
           const state = useTrackerStore.getState();
           const formatArray = (arr: any[]) => {
              if (!Array.isArray(arr)) return {};
              const res: Record<string, number> = {};
              for (const item of arr) {
                 if (item.ID && item.Count) {
                    let name = item.ID.replace(/ai\(clone\)$/i, '').replace(/\(clone\)$/i, '').replace(/ai$/i, '');
                    name = name.toLowerCase();
                    res[name] = (res[name] || 0) + item.Count;
                 }
              }
              return res;
           };
           
           const rawBushes = d.bushesData ? formatArray(d.bushesData) : null;
           const plantsHarvested: Record<string, number> = {};
           const itemsLooted: Record<string, number> = {};
           
           if (rawBushes) {
              const plantKeywords = ['leaf', 'weed', 'vine', 'petal', 'lily', 'spore', 'flower', 'mushroom'];
              for (const [key, val] of Object.entries(rawBushes)) {
                 if (plantKeywords.some(kw => key.includes(kw))) {
                    plantsHarvested[key] = val;
                 } else {
                    itemsLooted[key] = val;
                 }
              }
           }
           
           const newStats = {
              mobsKilled: d.enemiesData ? formatArray(d.enemiesData) : state.lifetimeStats.mobsKilled,
              oresMined: d.oresData ? formatArray(d.oresData) : state.lifetimeStats.oresMined,
              treesCut: d.treesData ? formatArray(d.treesData) : state.lifetimeStats.treesCut,
              plantsHarvested: rawBushes ? plantsHarvested : state.lifetimeStats.plantsHarvested,
              itemsLooted: rawBushes ? itemsLooted : state.lifetimeStats.itemsLooted,
           };
           
           if (d.blacksmith_item_stats) {
           try {
             const bsData = JSON.parse(d.blacksmith_item_stats);
             if (bsData.blacksmithItemStats) {
               const activeJobs = bsData.blacksmithItemStats.map((item: any) => {
                 const startTime = new Date(item.blacksmithStartTime).getTime();
                 const durationMs = (item.blacksmithDuration || 0) * 1000;
                 return {
                   instanceId: item.instanceId,
                   itemName: item.itemName,
                   startTime: startTime,
                   endTime: startTime + durationMs,
                   duration: item.blacksmithDuration,
                   mode: item.blacksmithMode,
                   notified: false
                 };
               });
               useBlacksmithStore.getState().setJobs(activeJobs);
             }
           } catch (e) {
             console.error('[ROEDEX] Failed to parse blacksmith_item_stats', e);
           }
         }

         if (d.enemiesData || d.oresData || d.treesData || d.bushesData) {
              state.setLifetimeStats(newStats);
           }
        }

        if (d.t && typeof d.t === 'string') {
          const resourceType = d.t.toLowerCase();
          if (resourceType.includes('ore') || resourceType.includes('rock') || resourceType.includes('copper') || resourceType.includes('iron') || resourceType.includes('gold')) {
             AICompanion.onMine();
          } else if (resourceType.includes('tree') || resourceType.includes('wood') || resourceType.includes('log')) {
             AICompanion.onChop();
          } else {
             AICompanion.onGather();
          }
        }
      }
      break;
    }

    case 'move': {
       if (payload?.pos) {
          store.setPlayerPosition(payload.pos);
       } else if (payload?.position) {
          store.setPlayerPosition(payload.position);
       }
       break;
    }

    case 'tutorial_state_push': {
      try {
        if (payload?.activeQuests && Array.isArray(payload.activeQuests)) {
          const formattedQuests = payload.activeQuests.map((q: any) => ({
            ...q,
            status: 'accepted'
          }));
          useTrackerStore.getState().setQuests(formattedQuests);
        }
      } catch (err) {
        console.error("Error parsing tutorial quests:", err);
      }
      break;
    }

    case 'npcquest_all_result': {
      try {
        const npcs = payload?.npcs || [];
        const activeQuests: any[] = [];
        
        for (const npc of npcs) {
          if (npc.quests && Array.isArray(npc.quests)) {
            for (const q of npc.quests) {
              if (q.status === 'accepted') {
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
          const state = useTrackerStore.getState();
          const currentZone = state.currentZone;
          AICompanion.zoneChange(zone);
          if (currentZone !== zone && zone !== 'Unknown') {
            NotificationManager.showZoneLoadingToast(zone);
            state.clearOnlinePlayers(); // Clear players when entering a new zone
            
            // Only update currentZone after 1 second to avoid UI flicker during transitions
            setTimeout(() => {
              useTrackerStore.getState().setCurrentZone(zone);
            }, 1000);
          }
       }
       break;
    }

    case 'user_offline': {
      if (payload?.userId) {
        useTrackerStore.getState().removeOnlinePlayer(payload.userId);
      }
      break;
    }

    case 'town:roster': {
      if (payload?.players && Array.isArray(payload.players)) {
        const state = useTrackerStore.getState();
        payload.players.forEach((p: any) => {
          if (p.userId) {
            state.setOnlinePlayer(p.userId, {
              username: p.username || 'Unknown',
              position: p.position || p.pos,
              lastSeen: Date.now()
            });
          }
        });
      }
      break;
    }

    case 'town:left':
    case 'town:leave': {
      const id = payload?.userId || payload?.id;
      if (id) {
        useTrackerStore.getState().removeOnlinePlayer(id);
      }
      break;
    }

    case 'town:joined': {
      if (payload?.userId) {
        useTrackerStore.getState().setOnlinePlayer(payload.userId, {
          username: payload.username || payload.displayName || 'Unknown',
          position: payload.position || payload.pos,
          lastSeen: Date.now()
        });
      }
      break;
    }

    case 'level_up':
    case 'achievement':
    case 'milestone': {
      AICompanion.onLevelUp();
      break;
    }
  }
}
