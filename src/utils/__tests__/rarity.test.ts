import { describe, it, expect, beforeEach } from 'vitest';
import { getRarityClass, getRarityColor } from '../rarity';

describe('Rarity Utilities', () => {
  beforeEach(() => {
    // We don't need to mock since we're using actual data or we can spy if needed.
  });

  describe('getRarityClass', () => {
    it('returns mythic class for mythic variants', () => {
      expect(getRarityClass('mythic')).toBe('text-[var(--rarity-mythic)]');
      expect(getRarityClass('mystical')).toBe('text-[var(--rarity-mythic)]');
      expect(getRarityClass('legendary')).toBe('text-[var(--rarity-mythic)]');
      expect(getRarityClass('epic')).toBe('text-[var(--rarity-mythic)]');
    });

    it('returns rare class for rare', () => {
      expect(getRarityClass('rare')).toBe('text-[var(--rarity-rare)]');
    });

    it('returns uncommon class for uncommon', () => {
      expect(getRarityClass('uncommon')).toBe('text-[var(--rarity-uncommon)]');
    });

    it('returns common class for common', () => {
      expect(getRarityClass('common')).toBe('text-[var(--rarity-common)]');
    });

    it('handles edge cases: empty string, null, unknown', () => {
      expect(getRarityClass('')).toBe('text-[var(--rarity-common)]');
      expect(getRarityClass(undefined)).toBe('text-[var(--rarity-common)]');
      expect(getRarityClass('unknown_rarity_123')).toBe('text-[var(--rarity-common)]');
    });
  });

  describe('getRarityColor', () => {
    it('returns CSS var string for valid item', () => {
      // Assuming getItemInfo will work. Let's mock it just to be sure we get predictable results.
      // But we can also test the fallback logic.
      expect(getRarityColor('wood')).toBe('text-[var(--rarity-common)]');
    });
  });
});
