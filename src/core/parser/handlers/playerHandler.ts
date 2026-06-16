import { useTrackerStore } from '../../../store/trackerStore';
import { TrackerValidator } from '../../../utils/trackerValidator';
import { MobTracker } from '../../trackers/MobTracker';
import { ResourceTracker } from '../../trackers/ResourceTracker';
import { BobCompanion } from '../../companion/BobCompanion';
import { NotificationManager } from '../../notifications/NotificationManager';
import { SpawnStateEvent, EnemyRespawnEvent, ResourceRespawnEvent } from '../../../types/events';
import { getRunesRequired } from '../../../data/levelRequirements';
import { parsePacket } from '../index';

const RARE_RESOURCES = [
  'diamond', 'void', 'godwood', 'moonpetal', 'shadow', 'cinder', 'crystal'
];

export function handlePlayerEvent(eventName: string, payload: any, store: any) {
  switch (eventName) {
    case 'user_online': {
       if (payload && payload.username) {
           const state = useTrackerStore.getState();
           if (payload.username !== 'tool' && payload.username !== 'weapon' && payload.username.toLowerCase() !== 'unknown') {
               if (!state.sessionPlayerName) {
                  state.setSessionPlayerName(payload.username);
                  state.setPlayerProfile({ name: payload.username });
               }
               BobCompanion.greetUser(payload.username);
               NotificationManager.greetUser(payload.username);
           }
       }
      break;
    }
    case 'spawn_state': {
      const data = payload as SpawnStateEvent;
      
      const currentZone = data.zone || 'Unknown';
      store.setCurrentZone(currentZone);
      if (currentZone !== 'Unknown') {
        BobCompanion.zoneChange(currentZone);
      }

      if (data.enemies) {
        const validEnemies = data.enemies.filter((e: any) => TrackerValidator.validateEnemySpawn(e));
        const parsedEnemies = validEnemies.map((e: any) => MobTracker.parseSpawn(e as EnemyRespawnEvent, currentZone));
        store.batchSetEnemies(parsedEnemies);
      }

      if (data.resources) {
        const validResources = data.resources.filter((r: any) => TrackerValidator.validateResourceSpawn(r));
        
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

    case 'player:damage:taken': {
      if (payload?.damageAmount === 0) {
        BobCompanion.onParry();
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
        
        if (d.name || d.playerName) {
           const newName = d.name || d.playerName;
           const state = useTrackerStore.getState();
           if (newName !== 'tool' && newName !== 'weapon' && newName.toLowerCase() !== 'unknown') {
              if (!state.sessionPlayerName) {
                 state.setSessionPlayerName(newName);
                 profileUpdate.name = newName;
              }
              BobCompanion.greetUser(newName);
              NotificationManager.greetUser(newName);
           }
        }
        
        if (d.exp !== undefined || d.Exp !== undefined || d.runes !== undefined || d.experience !== undefined) {
           profileUpdate.currentRunes = d.runes ?? d.exp ?? d.Exp ?? d.experience;
        }
        
        if (d.nextLevelExp !== undefined || d.next_exp !== undefined || d.NextExp !== undefined || d.nextLevel !== undefined) {
           profileUpdate.runesRequired = d.nextLevelExp ?? d.next_exp ?? d.NextExp ?? d.nextLevel;
        }
        
        if (Object.keys(profileUpdate).length > 0) {
           const finalLevel = profileUpdate.level || storeState.playerProfile.level || 1;
           
           if (!profileUpdate.runesRequired && (!storeState.playerProfile.runesRequired || profileUpdate.level)) {
             profileUpdate.runesRequired = getRunesRequired(finalLevel);
           }
           
           if (profileUpdate.name && profileUpdate.name !== storeState.playerProfile.name) {
             BobCompanion.greetUser(profileUpdate.name);
             NotificationManager.greetUser(profileUpdate.name);
           }
           
           storeState.setPlayerProfile(profileUpdate);
           
           const updatedProfile = useTrackerStore.getState().playerProfile;
           if (updatedProfile.currentRunes >= updatedProfile.runesRequired && updatedProfile.runesRequired > 0) {
             BobCompanion.onLevelUpReady(updatedProfile.level);
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
           
           if (d.enemiesData || d.oresData || d.treesData || d.bushesData) {
              state.setLifetimeStats(newStats);
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

    case 'move': {
       if (payload?.pos) {
          store.setPlayerPosition(payload.pos);
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
          store.setCurrentZone(zone);
          BobCompanion.zoneChange(zone);
          if (store.notificationSettings.enabled && store.notificationSettings.toasts && store.notificationSettings.zoneChange) {
            store.addNotification({ type: 'info', title: 'System', message: `Entered Zone: ${zone}` });
          }
       }
       break;
    }

    case 'level_up':
    case 'achievement':
    case 'milestone': {
      BobCompanion.onLevelUp();
      break;
    }
  }
}
