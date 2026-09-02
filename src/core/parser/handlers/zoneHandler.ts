/**
 * zoneHandler.ts — handles zone/spawn/movement events
 * Extracted from playerHandler.ts (v0.0.5 refactor)
 */
import { useTrackerStore } from '../../../store/trackerStore';

import { TrackerValidator } from '../../../utils/trackerValidator';
import { MobTracker } from '../../trackers/MobTracker';
import { ResourceTracker } from '../../trackers/ResourceTracker';
import { AICompanion } from '../../companion/AICompanion';
import { NotificationManager } from '../../notifications/NotificationManager';
import { SpawnStateEvent, EnemyRespawnEvent, ResourceRespawnEvent } from '../../../types/events';
import { flushTrailBuffer } from './statsHandler';
import { normalizeHp, normalizeMaxHp } from '../../../utils/packetNormalizer';


const RARE_RESOURCES = [
  'diamond', 'void', 'godwood', 'moonpetal', 'shadow', 'cinder', 'crystal'
];

function processInChunks(items: any[], chunkSize: number, processor: (chunk: any[]) => void) {
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
}

export function handleSpawnState(payload: SpawnStateEvent, store: any) {
  const currentZone = payload.zone || 'Unknown';
  const prevZone = store.currentZone;

  if (prevZone && prevZone !== currentZone && prevZone !== 'Unknown') {
    // Flush any buffered trail points for the zone we're leaving
    flushTrailBuffer(prevZone);
    // Route commitment removed
    store.clearEnemies();
    store.clearResources();
    store.clearLoot();
  }

  store.setCurrentZone(currentZone);
  if (currentZone !== 'Unknown') {
    AICompanion.zoneChange(currentZone);
    if (currentZone !== prevZone) {
      NotificationManager.showZoneLoadingToast(currentZone);
    }
  }

  if (payload.enemies) {
    processInChunks(payload.enemies, 50, (chunk) => {
      const validEnemies = chunk.filter((e: any) => TrackerValidator.validateEnemySpawn(e));
      const parsedEnemies = validEnemies.map((e: any) => MobTracker.parseSpawn(e as EnemyRespawnEvent, currentZone));
      store.batchSetEnemies(parsedEnemies);
    });
  }

  if (payload.resources) {
    processInChunks(payload.resources, 150, (chunk) => {
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
}

export function handleZoneChange(payload: any) {
  const zone = payload?.zone || payload?.data?.zone;
  if (!zone) return;

  const state = useTrackerStore.getState();
  const prevZone = state.currentZone;
  
  AICompanion.zoneChange(zone);

  // Guard: only trigger zone change logic if it's actually a different zone
  if (zone !== prevZone) {
    // Flush trail before clearing zone state
    flushTrailBuffer(prevZone);
    // Route commitment removed
    state.clearEnemies();
    state.clearResources();
    state.clearLoot();
    state.setCurrentZone(zone);
  }

  setTimeout(() => {
    useTrackerStore.getState().setIsLoadingZone(false);
  }, 3000);
}

export function handleMove(payload: any, store: any, _parserState: any) {
  if (!payload) return;

  let newPos = payload.pos || payload.position || payload.data?.position;
  let zoneName = payload.locationName || payload.zone || payload.location || payload.data?.locationName;

  const sessionName = useTrackerStore.getState().sessionPlayerName;
  const isOtherPlayer = payload?.userId && sessionName && payload.userId !== sessionName;

  if (!isOtherPlayer) {
    const prevZone = store.currentZone;
    // Only trigger setCurrentZone if zone actually changed and is valid
    // This prevents spurious zone markers from being stamped on every move packet
    if (zoneName && zoneName !== 'Unknown' && zoneName !== prevZone) {
      // Use the store's setCurrentZone which handles marker recording, route commits, etc.
      useTrackerStore.getState().setCurrentZone(zoneName);
    }

    if (newPos) {
      const state = useTrackerStore.getState();
      const activeZone = zoneName || state.currentZone;
      store.setPlayerPosition(newPos, activeZone);
      // Auto path recording is now handled globally in parser/index.ts via batchRecordRoutePoints
    }
  }
}

export function handleState(payload: any, store: any) {
  if (!payload) return;
  if (payload.locationName) {
    if (store.currentZone !== payload.locationName) {
      // route commitment removed
      store.clearEnemies();
      store.clearResources();
      store.clearLoot();
    }
    store.setCurrentZone(payload.locationName);
    AICompanion.zoneChange(payload.locationName);
  }
  if (payload.position) {
    store.setPlayerPosition(payload.position, payload.locationName || store.currentZone);
  }
  const h = normalizeHp(payload);
  const mh = normalizeMaxHp(payload);
  if (h !== undefined || mh !== undefined) {
    const update: any = {};
    if (h !== undefined) update.hp = h;
    if (mh !== undefined) update.maxHp = mh;
    store.setPlayerProfile(update);
  }
}
