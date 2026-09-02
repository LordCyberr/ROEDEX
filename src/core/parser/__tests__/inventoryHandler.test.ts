import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleInventoryEvent, evaluateToolWarnings } from '../handlers/inventoryHandler';
import { useTrackerStore } from '../../../store/trackerStore';
import { NotificationManager } from '../../notifications/NotificationManager';

vi.mock('../../notifications/NotificationManager', () => ({
  NotificationManager: {
    showToolWarningToast: vi.fn(),
    dismissToolWarningToast: vi.fn(),
    queueLootToast: vi.fn(),
  }
}));

describe('Inventory Handler', () => {
  let parserState: any;

  beforeEach(() => {
    vi.clearAllMocks();
    useTrackerStore.setState({
      chestInventory: {},
      isChestOpen: false,
      currentZone: 'Forest',
      weapon: { name: 'Sword', durability: 10, maxDurability: 10, slot: 1 }
    });
    parserState = {
      previousInventory: { 'Sword': 0 },
      previousEquippedWeaponId: 'Sword',
      lastWeaponBreakTime: 0,
      lastChestOpenTime: 0,
      isBlacksmithOpen: false,
      loginTime: 0,
      pendingUsername: '',
      hasReceivedFirstPacket: false,
      chestCloseTimeout: null,
      lastDeathTime: 0
    };
  });

  it('triggers weapon warning if weapon moved to chest', () => {
    // Moved to chest = item qty in inventory goes from 0 to 1, but weapon slot is empty
    const payload = {
      data: {
        InventoryItems: [
          { itemId: 'Sword', Quantity: 1, slot: undefined } // Now in inventory
        ],
        InventoryDetails: {} // No weapon equipped
      }
    };
    
    // Zone is 'Forest' (not safe)
    useTrackerStore.setState({ currentZone: 'Forest' }); // ensure we aren't in safe zone
    handleInventoryEvent('inventory', payload, null, parserState);

    expect(NotificationManager.showToolWarningToast).toHaveBeenCalledWith('Sword');
  });

  it('does NOT trigger warning for normal items', () => {
    parserState.previousEquippedWeaponId = null;
    useTrackerStore.setState({ weapon: null });

    const payload = {
      data: {
        InventoryItems: [
          { itemId: 'Wood', Quantity: 1 } 
        ],
        details: {}
      }
    };
    
    handleInventoryEvent('inventory', payload, null, parserState);

    expect(NotificationManager.showToolWarningToast).not.toHaveBeenCalled();
  });

  it('empty slot -> new weapon does NOT trigger false positive', () => {
    parserState.previousEquippedWeaponId = null;
    useTrackerStore.setState({ weapon: null });

    const payload = {
      data: {
        InventoryItems: [
          { itemId: 'Sword', Quantity: 1, MaxDurability: 10, slot: 1 } 
        ],
        details: { equippedWeaponInstanceId: 'inst1' }
      }
    };
    
    handleInventoryEvent('inventory', payload, null, parserState);

    expect(NotificationManager.showToolWarningToast).not.toHaveBeenCalled();
  });
});

describe('evaluateToolWarnings', () => {
  let parserState: any;

  beforeEach(() => {
    vi.clearAllMocks();
    useTrackerStore.setState({
      currentZone: 'Forest',
      weapon: null,
      quickBarInstances: []
    });
    parserState = {
      lastInventoryItems: []
    };
  });

  it('shows warning when tool is in inventory but not equipped', () => {
    const items = [{ itemId: 'Pickaxe', instanceId: 'inst_1' }];
    evaluateToolWarnings(items, [], {}, parserState);
    
    expect(NotificationManager.showToolWarningToast).toHaveBeenCalledWith('Pickaxe');
  });

  it('does not show warning when weapon is equipped', () => {
    useTrackerStore.setState({ weapon: { name: 'Sword', slot: 1, durability: 100, maxDurability: 100 } });
    const items = [{ itemId: 'Pickaxe', instanceId: 'inst_1' }];
    
    evaluateToolWarnings(items, [], {}, parserState);
    
    expect(NotificationManager.dismissToolWarningToast).toHaveBeenCalled();
    expect(NotificationManager.showToolWarningToast).not.toHaveBeenCalled();
  });

  it('does not show warning when tool is on hotbar', () => {
    const items = [{ itemId: 'Pickaxe', instanceId: 'inst_1' }];
    const quickBar = ['inst_1'];
    
    evaluateToolWarnings(items, quickBar, {}, parserState);
    
    expect(NotificationManager.dismissToolWarningToast).toHaveBeenCalled();
    expect(NotificationManager.showToolWarningToast).not.toHaveBeenCalled();
  });

  it('does not show warning in safe zones', () => {
    useTrackerStore.setState({ currentZone: 'Town' });
    const items = [{ itemId: 'Pickaxe', instanceId: 'inst_1' }];
    
    evaluateToolWarnings(items, [], {}, parserState);
    
    expect(NotificationManager.dismissToolWarningToast).toHaveBeenCalled();
    expect(NotificationManager.showToolWarningToast).not.toHaveBeenCalled();
  });

  it('does not show warning when no tools are in inventory', () => {
    const items = [{ itemId: 'apple', instanceId: 'inst_1' }];
    evaluateToolWarnings(items, [], {}, parserState);
    
    expect(NotificationManager.showToolWarningToast).not.toHaveBeenCalled();
  });

  it('prioritizes first detected tool warning when multiple tools exist', () => {
    const items = [
      { itemId: 'Woodaxe', instanceId: 'inst_1' },
      { itemId: 'Pickaxe', instanceId: 'inst_2' }
    ];
    evaluateToolWarnings(items, [], {}, parserState);
    
    expect(NotificationManager.showToolWarningToast).toHaveBeenCalledWith('Woodaxe');
  });
});
