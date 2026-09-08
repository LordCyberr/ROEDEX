/**
 * WhatsNewBanner — Logic tests
 * 
 * We test the banner's core show/hide decision logic directly via the store
 * rather than rendering the component (which has heavy framer-motion + lucide deps).
 * Full render tests belong in Playwright/Playwright-CT E2E scope.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUISlice } from '../../slices/uiSlice';

vi.mock('../../../data/changelog', () => ({
  CHANGELOG_DATA: [
    {
      version: '0.0.6',
      title: 'Professional Overhaul',
      date: '2026-09-08',
      features: ['React.memo on heavy components', 'CI pipeline', 'CONTRIBUTING.md'],
      fixes: ['DEV console guards', 'Aria labels'],
      changes: [],
    },
    {
      version: '0.0.5',
      title: 'WhatsNew Banner',
      date: '2026-09-01',
      features: ['In-overlay WhatsNew banner'],
      fixes: [],
      changes: [],
    },
  ],
}));

const createStore = () => {
  let state: any = {};
  const set = (fn: any) => {
    state = typeof fn === 'function' ? { ...state, ...fn(state) } : { ...state, ...fn };
  };
  state = { ...state, ...createUISlice(set, () => state, null as any) };
  return { get: () => state };
};

/** Mirrors the banner's shouldShow logic from WhatsNewBanner.tsx */
const shouldBannerShow = (lastSeenVersion: string, latestVersion: string): boolean =>
  !!latestVersion && lastSeenVersion !== latestVersion;

describe('WhatsNewBanner — show/hide logic', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createStore();
  });

  it('shows banner when lastSeenVersion is empty (new install)', () => {
    expect(store.get().lastSeenVersion).toBe('');
    expect(shouldBannerShow('', '0.0.6')).toBe(true);
  });

  it('shows banner when user has seen an older version', () => {
    expect(shouldBannerShow('0.0.4', '0.0.6')).toBe(true);
    expect(shouldBannerShow('0.0.5', '0.0.6')).toBe(true);
  });

  it('does NOT show banner when lastSeenVersion matches latest', () => {
    expect(shouldBannerShow('0.0.6', '0.0.6')).toBe(false);
  });

  it('dismissing the banner sets lastSeenVersion to the latest version', () => {
    expect(store.get().lastSeenVersion).toBe('');
    store.get().dismissWhatsNew();
    // After dismiss, lastSeenVersion should equal LATEST version from mocked CHANGELOG_DATA
    expect(store.get().lastSeenVersion).toBe('0.0.6');
    // Banner should now be hidden
    expect(shouldBannerShow(store.get().lastSeenVersion, '0.0.6')).toBe(false);
  });

  it('opening changelog also works independently of banner dismiss', () => {
    expect(store.get().isChangelogOpen).toBe(false);
    store.get().setIsChangelogOpen(true);
    expect(store.get().isChangelogOpen).toBe(true);
    // Banner should still be showing until explicitly dismissed
    expect(store.get().lastSeenVersion).toBe('');
  });

  it('banner state survives multiple store reads (pure function — no side effects)', () => {
    const v1 = store.get().lastSeenVersion;
    const v2 = store.get().lastSeenVersion;
    expect(v1).toBe(v2);
    expect(v1).toBe('');
  });
});
