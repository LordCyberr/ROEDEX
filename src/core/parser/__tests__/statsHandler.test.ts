import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleStatsOrPlayerState, handlePlayerDeath } from '../handlers/statsHandler';
import { useTrackerStore } from '../../../store/trackerStore';
import { AICompanion } from '../../companion/AICompanion';

vi.mock('../../companion/AICompanion', () => ({
  AICompanion: {
    onPlayerDeath: vi.fn(),
    greetUser: vi.fn(),
    onLevelUpReady: vi.fn()
  }
}));

describe('Stats Handler', () => {
  let parserState: any;

  beforeEach(() => {
    vi.clearAllMocks();
    useTrackerStore.setState({
      currentZone: 'Forest',
      playerPosition: { x: 10, y: 10 },
      pendingDeathDrop: null,
      playerProfile: { currentRunes: 500 } as any
    });
    parserState = {
      lastDeathTime: 0
    };
  });

  it('triggers death drop check when HP = 0', () => {
    const payload = { hp: 0 };
    handleStatsOrPlayerState(payload, parserState);

    expect(AICompanion.onPlayerDeath).toHaveBeenCalled();
    const state = useTrackerStore.getState();
    expect(state.pendingDeathDrop).not.toBeNull();
    expect(state.pendingDeathDrop?.quantity).toBe(500);
    expect(state.pendingDeathDrop?.zone).toBe('Forest');
  });

  it('debounces duplicate death events within 5s', () => {
    parserState.lastDeathTime = Date.now() - 1000; // 1 second ago

    const payload = { hp: 0 };
    handleStatsOrPlayerState(payload, parserState);

    expect(AICompanion.onPlayerDeath).not.toHaveBeenCalled();
    
    // ensure pending drop wasn't set again if it was null
    useTrackerStore.setState({ pendingDeathDrop: null });
    handleStatsOrPlayerState(payload, parserState);
    expect(useTrackerStore.getState().pendingDeathDrop).toBeNull();
  });
  
  it('sets pendingDeathDrop state based on currentRunes on death', () => {
    // Already tested in the first test implicitly, but let's test handlePlayerDeath explicitly
    handlePlayerDeath({ droppedRunes: 1000, position: { x: 50, y: 50 } }, parserState);
    const state = useTrackerStore.getState();
    expect(state.pendingDeathDrop).toEqual({
       dropId: expect.any(String),
       quantity: 1000,
       pos: { x: 50, y: 50 },
       zone: 'Forest'
    });
  });
});
