/**
 * statsHandler.ts — handles player stats, weapons, level, death events
 * Extracted from playerHandler.ts (v0.0.5 refactor)
 */
import { useTrackerStore } from '../../../store/trackerStore';
import { useBlacksmithStore } from '../../../store/blacksmithStore';
import { AICompanion } from '../../companion/AICompanion';
import { NotificationManager } from '../../notifications/NotificationManager';
import { getRunesRequired } from '../../../data/levelRequirements';
import { parsePacket } from '../index';
import { Point } from '../../../store/types';
import { StringCache } from '../../../utils/stringCache';
import { normalizeHp, normalizeMaxHp } from '../../../utils/packetNormalizer';
import { useAnalyticsStore } from '../../../store/analyticsStore';

let trailBuffer: Point[] = [];
let trailFlushTimer: any = null;
export let lastRecordedPos: Point | null = null;
let currentBufferZone: string = '';

/** Write accumulated trail points to store immediately then clear buffer */
export function flushTrailBuffer(zone?: string) {
  const targetZone = zone || currentBufferZone;
  if (trailBuffer.length === 0 || !targetZone) return;
  try {
    const state = useTrackerStore.getState();
    state.appendExploredPoints(targetZone, [...trailBuffer]);
  } catch { /* silent */ }
  trailBuffer = [];
  if (trailFlushTimer) {
    clearTimeout(trailFlushTimer);
    trailFlushTimer = null;
  }
}

export function bufferTrailPoint(zone: string, point: Point) {
  trailBuffer.push(point);
  lastRecordedPos = { ...point };
  currentBufferZone = zone;

  const state = useTrackerStore.getState();

  if (state.isRecordingTrail) {
    // Manual trail recording: flush immediately every point
    state.appendTrailPoints(zone, [...trailBuffer]);
    trailBuffer = [];
    if (trailFlushTimer) {
      clearTimeout(trailFlushTimer);
      trailFlushTimer = null;
    }
    return;
  }

  if (state.isEraserMode) {
    state.eraseTrailPoints(zone, point, 4);
    trailBuffer = [];
    if (trailFlushTimer) {
      clearTimeout(trailFlushTimer);
      trailFlushTimer = null;
    }
    return;
  }

  // Always-on exploration trail: write every 5 points to prevent data loss
  if (trailBuffer.length >= 5) {
    try {
      state.appendExploredPoints(zone, [...trailBuffer]);
    } catch { /* silent */ }
    trailBuffer = [];
    if (trailFlushTimer) {
      clearTimeout(trailFlushTimer);
      trailFlushTimer = null;
    }
    return;
  }

  // Safety flush timer — write remainder after 3 seconds of inactivity
  if (!trailFlushTimer) {
    trailFlushTimer = setTimeout(() => {
      flushTrailBuffer(zone);
    }, 3000);
  }
}

export function handlePlayerDeath(payload: any, parserState: any) {
  parserState.lastDeathTime = Date.now();
  
  const state = useTrackerStore.getState();
  const currentZone = state.currentZone;
  const pos = payload?.position || state.playerPosition;
  const dropped = payload?.droppedRunes || state.playerProfile.currentRunes || 0;
  
  if (pos && dropped > 0) {
    const dropId = payload?.dropId || (payload?.data && payload?.data?.dropId) || '';
    
    useTrackerStore.getState().setPendingDeathDrop({
      dropId,
      quantity: dropped,
      pos: { x: pos.x, y: pos.y },
      zone: currentZone
    });

    useTrackerStore.getState().setActiveWaypoint(
      { x: pos.x, y: pos.y },
      `Recover ${dropped} Runes`,
      currentZone
    );
    useTrackerStore.getState().setDeathSpot({ x: pos.x, y: pos.y });
    
    NotificationManager.showDeathDropToast(dropped, currentZone, { x: pos.x, y: pos.y });
    AICompanion.onPlayerDeath();
    
    // Analytics
    useAnalyticsStore.getState().recordDeath();
  }

  // Activate death recovery mode — quiets the companion and focuses the minimap on the death drop pin
  useTrackerStore.getState().setDeathRecoveryMode(true);

  // Safety auto-clear after 30 seconds if the pickup event never fires
  setTimeout(() => {
    useTrackerStore.getState().setDeathRecoveryMode(false);
  }, 30_000);
}

export function handleDamageTaken(payload: any) {
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
}

export function handleStatsOrPlayerState(payload: any, parserState: any) {
  const d = payload?.data || payload;
  if (!d) return;

  if (d.pos || d.playerPosition) {
    const p = d.pos || d.playerPosition;
    const store = useTrackerStore.getState();
    store.setPlayerPosition(p);
    
    if (store.mapSettings.enabled && store.currentZone) {
      if (!lastRecordedPos || currentBufferZone !== store.currentZone) {
        if (currentBufferZone && currentBufferZone !== store.currentZone) {
          flushTrailBuffer(currentBufferZone);
        }
        lastRecordedPos = { ...p };
        bufferTrailPoint(store.currentZone, p);
      } else {
        const dx = p.x - lastRecordedPos.x;
        const dy = p.y - lastRecordedPos.y;
        const thresholdSq = store.isRecordingTrail ? 1 : 25; // Proper pixel by pixel recording
        if (dx * dx + dy * dy >= thresholdSq) {
          lastRecordedPos = { ...p };
          bufferTrailPoint(store.currentZone, p);
        }
      }
    }
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

  const parsedHp = normalizeHp(d);
  if (parsedHp !== undefined) {
    profileUpdate.hp = parsedHp;
  }

  const parsedMaxHp = normalizeMaxHp(d);
  if (parsedMaxHp !== undefined) {
    profileUpdate.maxHp = parsedMaxHp;
  }

  if (profileUpdate.hp === 0 || d.hp === 0 || d.Hp === 0 || d.health === 0 || d.Health === 0) {
    // Only trigger if we haven't already processed a death recently (prevent double trigger)
    if (Date.now() - parserState.lastDeathTime > 5000) {
      parserState.lastDeathTime = Date.now();
      AICompanion.onPlayerDeath();
      handlePlayerDeath({ droppedRunes: storeState.playerProfile.currentRunes, position: storeState.playerPosition }, parserState);
    }
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
        const id = item.ID || item.id || item.itemId;
        const count = item.Count || item.count || item.amount || 1;
        if (id) {
          let name = StringCache.stripCloneSuffix(id);
          res[name] = (res[name] || 0) + count;
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
              startTime,
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
    } else if (resourceType.includes('tree') || resourceType.includes('wood') || resourceType.includes('log') || resourceType.includes('cinder') || resourceType.includes('leaf')) {
      AICompanion.onChop();
    } else {
      AICompanion.onGather();
    }
  }
}
