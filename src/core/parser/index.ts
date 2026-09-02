import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { unstable_batchedUpdates } from 'react-dom';
import { AICompanion } from '../companion/AICompanion';
import { NotificationManager } from '../notifications/NotificationManager';
import { handleEntityEvent } from './handlers/entityHandler';
import { handleInventoryEvent } from './handlers/inventoryHandler';
import { bufferTrailPoint, lastRecordedPos } from './handlers/statsHandler';
import { handlePlayerEvent } from './handlers/playerHandler';
import { handleQuestData } from './handlers/questHandler';
import { handleMarketEvent } from './handlers/marketHandler';
import { routerMap } from './eventRouter';
import { rafScheduler } from '../RafScheduler';
// @ts-ignore
import ParserWorker from './parser.worker?worker&inline';

const parserWorker = new ParserWorker();
const eventQueue: any[] = [];
let isProcessingQueue = false;

export interface ParserState {
  previousInventory: Record<string, number>;
  previousEquippedWeaponId: string | null;
  lastInventoryItems?: any[];
  lastWeaponBreakTime: number;
  lastChestOpenTime: number;
  isBlacksmithOpen: boolean;
  loginTime: number;
  pendingUsername: string;
  hasReceivedFirstPacket: boolean;
  chestCloseTimeout: ReturnType<typeof setTimeout> | null;
  lastDeathTime: number;
}


// Parser backlog diagnostics (exposed for DebugPanel)
let peakQueueDepth = 0;
export function getQueueDiagnostics() {
  return { currentDepth: eventQueue.length, peakDepth: peakQueueDepth };
}
export function resetQueuePeakDepth() {
  peakQueueDepth = 0;
}

// Max events to drain per animation frame. Prevents a single oversized
// burst (e.g. zone entry with many spawns) from causing a visible jank spike.
// At 60fps this allows 3,000 events/second sustained throughput.
const MAX_PER_FRAME = 50;
let rafUnsubscribe: (() => void) | null = null;

function processQueue(_dt: number, _time: number) {
  if (eventQueue.length === 0) {
    isProcessingQueue = false;
    if (rafUnsubscribe) {
      rafUnsubscribe();
      rafUnsubscribe = null;
    }
    return;
  }

  // Track peak backlog depth for DebugPanel diagnostics
  if (eventQueue.length > peakQueueDepth) peakQueueDepth = eventQueue.length;

  // Time-slice: drain up to MAX_PER_FRAME events per RAF tick.
  const limit = eventQueue.length > 200 ? 100 : MAX_PER_FRAME;
  const eventsToProcess = eventQueue.splice(0, limit);

  unstable_batchedUpdates(() => {
    for (const event of eventsToProcess) {
      const { parsed, eventName, payload } = event;
      processParsedPacket(eventName, payload, parsed);
    }
  });

  if (eventQueue.length === 0) {
    isProcessingQueue = false;
    if (rafUnsubscribe) {
      rafUnsubscribe();
      rafUnsubscribe = null;
    }
  }
}

parserWorker.onmessage = (e: MessageEvent) => {
  if (e.data.success) {
    eventQueue.push(e.data);
    if (!isProcessingQueue) {
      isProcessingQueue = true;
      if (!rafUnsubscribe) {
        rafUnsubscribe = rafScheduler.register(processQueue);
      }
    }
  } else if (e.data.error === 'invalid_shape') {
    console.warn(`[ROEDEX Worker] Dropped malformed WebSocket event. Game data structure may have changed.`);
  }
};

// Parser module loaded

export function initParserWorkerPort(port: MessagePort) {
  parserWorker.postMessage({ type: 'INIT_PORT' }, [port]);
}

export let parserState: ParserState = {
  previousInventory: {},
  previousEquippedWeaponId: null,
  lastWeaponBreakTime: 0,
  lastChestOpenTime: 0,
  isBlacksmithOpen: false,
  loginTime: 0,
  pendingUsername: '',
  hasReceivedFirstPacket: false,
  chestCloseTimeout: null,
  lastDeathTime: 0
};

export function resetParserState() {
  parserState.loginTime = Date.now();
  parserState.pendingUsername = '';
  parserState.hasReceivedFirstPacket = false;
  parserState.previousEquippedWeaponId = null;
}

// Profiling aggregation
export let parseTimeAggregator = {
  count: 0,
  totalTime: 0,
  maxTime: 0,
  lastSpike: 0,
  lastSync: Date.now()
};

export function updateWeaponDurabilityState(d: any, defaultName: string) {
   const state = useTrackerStore.getState();
   const slot = d.weaponSlot !== undefined ? d.weaponSlot : -1;
   const currentMax = slot !== -1 ? (state.slotDurabilities[slot] || 150) : 150;
   const newMax = Math.max(currentMax, d.weaponDurability !== -1 ? d.weaponDurability : 0);
   
   if (slot !== -1 && newMax > currentMax) {
     state.updateSlotDurability(slot, newMax);
   }

   const name = state.weapon?.name || defaultName;
   
   if (d.weaponDurability !== -1) {
     if (d.weaponDurability === 0 && state.weapon?.durability && state.weapon.durability > 0) {
       parserState.lastWeaponBreakTime = Date.now();
     }

     state.setWeapon({
       name: name,
       durability: d.weaponDurability,
       maxDurability: newMax,
       slot: slot
     });

     AICompanion.checkDurability(name, d.weaponDurability, newMax);
     NotificationManager.checkDurability(name, d.weaponDurability, newMax);
   }
}

export function parsePacket(rawMessage: string) {
  if ((import.meta as any).env?.MODE === 'test') {
    try {
      if (typeof rawMessage === 'string' && rawMessage.includes('Hit rejected: Enemy is already dead')) {
        processParsedPacket('__CHEAT_DETECTED__', null, []);
      }
      const pIndex = rawMessage.indexOf('[');
      if (pIndex !== -1) {
        const jsonStr = rawMessage.substring(pIndex);
        const parsed = JSON.parse(jsonStr);
        processParsedPacket(parsed[0], parsed[1], parsed);
      }
    } catch (e) {}
    return;
  }

  // Offload heavy JSON parsing to the background worker
  parserWorker.postMessage({ rawMessage });
}

function processParsedPacket(eventName: string, payload: any, parsed: any) {
  const store = useTrackerStore.getState();

  try {
    const settings = useSettingsStore.getState();
    if (settings.tableSettings.showDistance) {
      if (typeof eventName === 'string') {
        const en = eventName.toLowerCase();
        
        // Exact matches or safe bounded matches for movement events to avoid hijacking from 'enemy_respawn' (which contains 'm')
        const isMoveEvent = ['move', 'm', 'walk', 'pos', 'update', 'hero', 'player', 'sync'].some(k => en === k || en === `${k}_pos` || en === `hero_${k}`);
        
        if (isMoveEvent) {
          const isOtherPlayer = payload?.userId && store.sessionPlayerName && payload.userId !== store.sessionPlayerName;
          const isMultiplayerEvent = en.includes('town') || en.includes('online') || en.includes('roster');

          if (!isOtherPlayer && !isMultiplayerEvent) {
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
              store.setPlayerPosition(newPos, payload?.locationName);
              AICompanion.onActivity();
              // Route recording removed

              // Minimap trail recording logic
              if (store.mapSettings.enabled && store.currentZone) {
                const lp = lastRecordedPos; // local copy
                if (!lp || store.currentZone !== payload?.locationName) {
                  // Use the exported variable by mutating its reference inside statsHandler? Wait, I can't mutate an imported let directly, but bufferTrailPoint handles the buffer.
                  // Actually, it's better to just call bufferTrailPoint.
                  bufferTrailPoint(store.currentZone, newPos);
                } else {
                  const dx = newPos.x - lp.x;
                  const dy = newPos.y - lp.y;
                  if (dx * dx + dy * dy > 25) {
                    bufferTrailPoint(store.currentZone, newPos);
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // Route events
    const startTime = performance.now();
    
    if (eventName === '__CHEAT_DETECTED__') {
      AICompanion.onCheatDetected();
      return;
    }
    
    if (!parserState.hasReceivedFirstPacket) {
      parserState.hasReceivedFirstPacket = true;
      NotificationManager.showInitializingToast();
    }
    
    const en = typeof eventName === 'string' ? eventName.toLowerCase() : '';
    const handlersToCall = routerMap.get(en);
    if (handlersToCall) {
      for (const h of handlersToCall) {
        if (h === 'entity') handleEntityEvent(eventName, payload, store);
        else if (h === 'inventory') handleInventoryEvent(eventName, payload, store, parserState);
        else if (h === 'player') handlePlayerEvent(eventName, payload, store, parserState);
        else if (h === 'quest') handleQuestData(parsed);
        else if (h === 'market') handleMarketEvent(eventName, payload, store);
      }
    }
    
    const duration = performance.now() - startTime;
    
    // Aggregate profiling data
    parseTimeAggregator.count++;
    parseTimeAggregator.totalTime += duration;
    if (duration > parseTimeAggregator.maxTime) {
      parseTimeAggregator.maxTime = duration;
    }
    if (duration > 5) {
      parseTimeAggregator.lastSpike = duration;
    }
    
    const now = Date.now();
    if (now - parseTimeAggregator.lastSync > 1000) {
      const avg = parseTimeAggregator.count > 0 ? parseTimeAggregator.totalTime / parseTimeAggregator.count : 0;
      settings.updateProfilerMetrics({
        parseTime: {
          average: Number(avg.toFixed(3)),
          max: Number(parseTimeAggregator.maxTime.toFixed(3)),
          lastSpike: Number(parseTimeAggregator.lastSpike.toFixed(3)),
          totalEvents: settings.profilerMetrics.parseTime.totalEvents + parseTimeAggregator.count
        }
      });
      
      parseTimeAggregator.count = 0;
      parseTimeAggregator.totalTime = 0;
      parseTimeAggregator.lastSync = now;
    }
    
  } catch (error) {
    console.error(`[Parser] Error processing message:`, parsed, error);
  }
}
