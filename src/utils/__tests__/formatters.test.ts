import { describe, it, expect } from 'vitest';
import { formatInternalName, formatDuration, getRarityColor } from '../formatters';

describe('Formatters Utilities', () => {
  describe('formatInternalName', () => {
    it('formats known items correctly from nameMap', () => {
      expect(formatInternalName('copperore')).toBe('Copper Ore');
      expect(formatInternalName('crystalrock')).toBe('Crystal Rock');
      expect(formatInternalName('slimegel')).toBe('Slime Gel');
      expect(formatInternalName('forest slime')).toBe('Forest Slime');
      expect(formatInternalName('forestslime')).toBe('Forest Slime');
    });

    it('strips common suffixes', () => {
      expect(formatInternalName('copperore node')).toBe('Copper Ore');
      expect(formatInternalName('silverleaf flower')).toBe('Silverleaf');
      expect(formatInternalName('blackoak tree')).toBe('Black Oak');
      expect(formatInternalName('shadowwolf ai')).toBe('Shadow Wolf');
    });

    it('returns capitalized fallback for unknown keys', () => {
      expect(formatInternalName('unknownitem')).toBe('Unknownitem');
      expect(formatInternalName('strange potion')).toBe('Strange potion'); // simple capitalization
    });

    it('formats camelCase to Title Case', () => {
      expect(formatInternalName('camelCaseItem')).toBe('Camel Case Item');
    });
  });

  describe('formatDuration', () => {
    it('formats ms to m and s', () => {
      expect(formatDuration(125000)).toBe('2m 5s');
    });

    it('formats ms to h, m, and s', () => {
      expect(formatDuration(3665000)).toBe('1h 1m 5s');
    });
  });

  describe('getRarityColor', () => {
    it('returns correct hex codes', () => {
      expect(getRarityColor('common')).toBe('#94a3b8');
      expect(getRarityColor('uncommon')).toBe('#22c55e');
      expect(getRarityColor('rare')).toBe('#3b82f6');
      expect(getRarityColor('epic')).toBe('#a855f7');
      expect(getRarityColor('legendary')).toBe('#eab308');
      expect(getRarityColor('mythic')).toBe('#ef4444');
      expect(getRarityColor('mystical')).toBe('#ef4444');
    });

    it('returns default color for unknown or empty', () => {
      expect(getRarityColor('')).toBe('#94a3b8');
      expect(getRarityColor(undefined)).toBe('#94a3b8');
      expect(getRarityColor('weird')).toBe('#94a3b8');
      expect(getRarityColor('weird', '#000000')).toBe('#000000');
    });
  });
});
