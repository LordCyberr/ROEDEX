import { getItemInfo } from '../data/rarity';
import { ThemeColors } from './theme';

const rarityColorCache = new Map<string, string>();

export const getRarityClass = (rarity?: string): string => {
  if (!rarity) return 'text-[var(--rarity-common)]';
  const r = rarity.toLowerCase();
  if (r === 'mythic' || r === 'mystical' || r === 'legendary' || r === 'epic') return 'text-[var(--rarity-mythic)]';
  if (r === 'rare') return 'text-[var(--rarity-rare)]';
  if (r === 'uncommon') return 'text-[var(--rarity-uncommon)]';
  if (r === 'common') return 'text-[var(--rarity-common)]';
  return 'text-[var(--rarity-common)]';
};

export const getRarityColor = (name: string): string => {
  if (!name) return ThemeColors.rarity.common.text;
  if (rarityColorCache.has(name)) return rarityColorCache.get(name)!;
  
  const info = getItemInfo(name);
  let color = 'text-[var(--rarity-common)]';
  
  if (info && info.rarity) {
    color = getRarityClass(info.rarity);
  } else {
    // Check for hardcoded patterns as fallback ONLY if not in database
    const n = name.toLowerCase();
    if (n.includes('core') || n.includes('essence') || n.includes('crystal')) color = 'text-[var(--rarity-mythic)]';
    else if (n.includes('pelt') || n.includes('fang') || n.includes('gland')) color = 'text-[var(--rarity-uncommon)]';
    else if (n.includes('spores') || n.includes('root') || n.includes('herb')) color = 'text-[var(--rarity-uncommon)]';
    else if (n.includes('fragment') || n.includes('dust')) color = 'text-[var(--rarity-rare)]';
    else color = 'text-[var(--rarity-common)]';
  }
  
  rarityColorCache.set(name, color);
  return color;
};

export const getRarityWeight = (name: string): number => {
  const info = getItemInfo(name);
  if (!info) return 0;
  switch (info.rarity) {
    case 'mythic':
    case 'mystical': return 3;
    case 'rare': return 2;
    case 'uncommon': return 1;
    case 'common':
    default: return 0;
  }
};
