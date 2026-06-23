/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { parsePacket } from '../index';
import { useTrackerStore } from '../../../store/trackerStore';
import { AICompanion } from '../../companion/AICompanion';

// Mock IndexedDB
const idbMock = {
  open: vi.fn().mockReturnValue({
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
    result: {
      createObjectStore: vi.fn(),
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          get: vi.fn().mockReturnValue({ onsuccess: null, onerror: null }),
          put: vi.fn().mockReturnValue({ onsuccess: null, onerror: null }),
        })
      })
    }
  })
};

Object.defineProperty(window, 'indexedDB', {
  writable: true,
  value: idbMock,
});
Object.defineProperty(globalThis, 'indexedDB', {
  writable: true,
  value: idbMock,
});

// Provide a mock for matchMedia to fix Zustand devtools/hydration issues in test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock the dependencies
vi.mock('../../companion/AICompanion', () => ({
  AICompanion: {
    checkDurability: vi.fn(),
    onCheatDetected: vi.fn(),
    onPlayerDeath: vi.fn(),
    onPlayerDamage: vi.fn(),
    triggerInteraction: vi.fn(),
    onZoneChange: vi.fn(),
    onMobKill: vi.fn(),
    greetUser: vi.fn(),
    zoneChange: vi.fn(),
    onParry: vi.fn()
  }
}));

describe('Parser logic', () => {
  beforeEach(() => {
    // Reset store state with exact types from slices
    useTrackerStore.setState({
      tableSettings: { showDistance: true },
      playerPosition: null,
      throttledPlayerPosition: null,
      inventoryMap: {},
      sessionStats: { duration: 0, initialWealth: 0, currentWealth: 0, mobsKilled: 0, expGained: 0, goldGained: 0, deaths: 0 }
    } as any);
    vi.clearAllMocks();
  });

  it('should ignore invalid json', () => {
    parsePacket('42["invalid json');
    const state = useTrackerStore.getState();
    expect(state.playerPosition).toBeNull(); // Should not crash and position remains null
  });

  it('should detect cheat string and trigger companion roast', () => {
    parsePacket('42["console_message", "Hit rejected: Enemy is already dead"]');
    expect(AICompanion.onCheatDetected).toHaveBeenCalledTimes(1);
  });

  it('should parse player position updates', () => {
    parsePacket('42["move", {"x": 150, "y": 200}]');
    const state = useTrackerStore.getState();
    expect(state.playerPosition).not.toBeNull();
    expect(state.playerPosition?.x).toBe(150);
    expect(state.playerPosition?.y).toBe(200);
  });

  it('should trigger user_online without crashing', () => {
    parsePacket('42["user_online", {"id": 123, "username": "Tester"}]');
    expect(true).toBe(true);
  });

  it('should trigger player damage handlers properly', () => {
    parsePacket('42["player:damage:taken", {"sourceName": "slime", "damageAmount": 10}]');
    expect(AICompanion.onPlayerDamage).toHaveBeenCalledWith("slime", 10, false);
  });

  it('should trigger boss damage handlers properly', () => {
    parsePacket('42["player:damage:taken", {"sourceName": "Dragon", "damageAmount": 55, "isBoss": true}]');
    expect(AICompanion.onPlayerDamage).toHaveBeenCalledWith("Dragon", 55, true);
  });
  
  it('should trigger player death on stats payload if hp is 0', () => {
    parsePacket('42["stats", {"hp": 0, "max_hp": 100}]');
    expect(AICompanion.onPlayerDeath).toHaveBeenCalledTimes(1);
  });
});
