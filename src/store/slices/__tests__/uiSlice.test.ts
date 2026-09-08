import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createUISlice } from '../uiSlice';

// Mock changelog data so tests don't depend on the real version string
vi.mock('../../../data/changelog', () => ({
  CHANGELOG_DATA: [
    {
      version: '0.0.5',
      title: 'Test Release',
      date: '2026-09-01',
      features: ['Feature 1', 'Feature 2'],
      fixes: ['Fix 1'],
      changes: [],
    },
  ],
}));

/** Minimal store factory that mirrors how createUISlice is composed in settingsStore.ts */
const createStore = () => {
  let state: any = {};
  const set = (fn: any) => {
    state = typeof fn === 'function' ? { ...state, ...fn(state) } : { ...state, ...fn };
  };
  const get = () => state;
  state = { ...state, ...createUISlice(set, get, null as any) };
  return { get, set, slice: state };
};

describe('uiSlice', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createStore();
  });

  // ── WhatsNew / Changelog Banner ──────────────────────────────────────────

  describe('dismissWhatsNew', () => {
    it('sets lastSeenVersion to the latest changelog version', () => {
      // Initial state: lastSeenVersion is empty (banner should show)
      expect(store.get().lastSeenVersion).toBe('');

      store.get().dismissWhatsNew();

      // After dismiss: version is set to the mocked latest version
      expect(store.get().lastSeenVersion).toBe('0.0.5');
    });

    it('is idempotent — calling it twice keeps lastSeenVersion the same', () => {
      store.get().dismissWhatsNew();
      store.get().dismissWhatsNew();
      expect(store.get().lastSeenVersion).toBe('0.0.5');
    });
  });

  describe('setIsChangelogOpen', () => {
    it('opens the changelog modal', () => {
      expect(store.get().isChangelogOpen).toBe(false);
      store.get().setIsChangelogOpen(true);
      expect(store.get().isChangelogOpen).toBe(true);
    });

    it('closes the changelog modal', () => {
      store.get().setIsChangelogOpen(true);
      store.get().setIsChangelogOpen(false);
      expect(store.get().isChangelogOpen).toBe(false);
    });
  });

  // ── Popped-out Windows ───────────────────────────────────────────────────

  describe('popOutTab', () => {
    it('adds a tab to poppedOutWindows with correct position', () => {
      store.get().popOutTab('global', 200, 150);
      const win = store.get().poppedOutWindows['global'];
      expect(win).toBeDefined();
      expect(win.x).toBe(200);
      expect(win.y).toBe(150);
      expect(win.isMinimized).toBe(false);
    });

    it('can pop out multiple tabs independently', () => {
      store.get().popOutTab('global', 100, 100);
      store.get().popOutTab('session', 300, 200);
      expect(Object.keys(store.get().poppedOutWindows)).toHaveLength(2);
    });
  });

  describe('mergeTab', () => {
    it('removes a single tab from poppedOutWindows', () => {
      store.get().popOutTab('global', 100, 100);
      store.get().popOutTab('session', 200, 200);
      store.get().mergeTab('global');
      expect(store.get().poppedOutWindows['global']).toBeUndefined();
      expect(store.get().poppedOutWindows['session']).toBeDefined();
    });

    it('is a no-op when tab is not popped out', () => {
      store.get().mergeTab('global');
      expect(store.get().poppedOutWindows).toEqual({});
    });
  });

  describe('mergeAllTabs', () => {
    it('clears all popped-out windows', () => {
      store.get().popOutTab('global', 100, 100);
      store.get().popOutTab('session', 200, 200);
      store.get().mergeAllTabs();
      expect(store.get().poppedOutWindows).toEqual({});
    });
  });

  // ── Marketplace ──────────────────────────────────────────────────────────

  describe('setIsMarketplaceOpen', () => {
    it('toggles marketplace open state', () => {
      expect(store.get().isMarketplaceOpen).toBe(false);
      store.get().setIsMarketplaceOpen(true);
      expect(store.get().isMarketplaceOpen).toBe(true);
      store.get().setIsMarketplaceOpen(false);
      expect(store.get().isMarketplaceOpen).toBe(false);
    });
  });

  // ── Debug Panel ──────────────────────────────────────────────────────────

  describe('toggleDebugPanel', () => {
    it('flips the debug panel open state', () => {
      expect(store.get().isDebugPanelOpen).toBe(false);
      store.get().toggleDebugPanel();
      expect(store.get().isDebugPanelOpen).toBe(true);
      store.get().toggleDebugPanel();
      expect(store.get().isDebugPanelOpen).toBe(false);
    });
  });
});
