import { z } from 'zod';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { AICompanion } from '../companion/AICompanion';
import { NotificationManager } from '../notifications/NotificationManager';
import { handleEntityEvent } from './handlers/entityHandler';
import { handleInventoryEvent } from './handlers/inventoryHandler';
import { handlePlayerEvent } from './handlers/playerHandler';

// Zod Schema to strictly validate the incoming WebSocket shape
// Some game events contain only an event name and no payload, so a 1-element array is valid!
const WebSocketEventSchema = z.tuple([
  z.string()
]).rest(z.any());

// Parser module loaded

export let parserState = {
  previousInventory: {} as Record<string, number>,
  lastWeaponBreakTime: 0,
  lastChestOpenTime: 0,
  isBlacksmithOpen: false,
  loginTime: Date.now(),
  pendingUsername: '' as string,
  hasReceivedFirstPacket: false
};

export function resetParserState() {
  parserState.loginTime = Date.now();
  parserState.pendingUsername = '';
  parserState.hasReceivedFirstPacket = false;
}

// Profiling aggregation
let parseTimeAggregator = {
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
  const store = useTrackerStore.getState();
  
  let jsonString = rawMessage;
  if (jsonString.startsWith('42["')) {
    jsonString = jsonString.slice(2);
  } else if (jsonString.startsWith('42/game,[')) {
    jsonString = jsonString.slice(8);
  } else {
    return;
  }
  
  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    return;
  }

  // Strictly validate the tuple structure using Zod
  const validation = WebSocketEventSchema.safeParse(parsed);
  if (!validation.success) {
    console.warn(`[ROEDEX Zod] Dropped malformed WebSocket event. Game data structure may have changed.`, validation.error);
    return;
  }

  const [eventName, payload] = validation.data;

  if (typeof rawMessage === 'string' && rawMessage.includes('Hit rejected: Enemy is already dead')) {
    AICompanion.onCheatDetected();
  }

  try {
    const settings = useSettingsStore.getState();
    if (settings.tableSettings.showDistance) {
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
    }
    
    // Route events
    const startTime = performance.now();
    
    if (!parserState.hasReceivedFirstPacket) {
      parserState.hasReceivedFirstPacket = true;
      NotificationManager.showInitializingToast();
    }
    
    if (eventName === 'user_online') {
      parserState.loginTime = Date.now();
    }
    
    handleEntityEvent(eventName, payload, store);
    handleInventoryEvent(eventName, payload, store, parserState);
    handlePlayerEvent(eventName, payload, store, parserState);
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
    console.error(`[Parser] Error processing message: ${rawMessage}`, error);
  }
}
