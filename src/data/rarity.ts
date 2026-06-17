export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'mythic';
export type ItemSource = 'plant' | 'tree' | 'monster' | 'ore';

export interface ItemInfo {
  id: string;
  rarity: ItemRarity;
  source: ItemSource;
}

// Based on user provided rarity tables:
export const RARITY_DB: Record<string, ItemInfo> = {
  // --- COMMON (Gray) ---
  'bloodroot': { id: 'bloodroot', rarity: 'common', source: 'plant' },
  'silverleaf': { id: 'silverleaf', rarity: 'common', source: 'plant' },
  'mistweed': { id: 'mistweed', rarity: 'common', source: 'plant' },
  'blackoak': { id: 'blackoak', rarity: 'common', source: 'tree' },
  'ironwood': { id: 'ironwood', rarity: 'common', source: 'tree' },
  'bronzewood': { id: 'bronzewood', rarity: 'common', source: 'tree' },
  'slime': { id: 'slime', rarity: 'common', source: 'monster' },
  'crystalbat': { id: 'crystalbat', rarity: 'common', source: 'monster' },
  'copperore': { id: 'copperore', rarity: 'common', source: 'ore' },
  'ironore': { id: 'ironore', rarity: 'common', source: 'ore' },
  'silverore': { id: 'silverore', rarity: 'common', source: 'ore' },
  'spidersilk': { id: 'spidersilk', rarity: 'common', source: 'monster' },
  'wolfpelt': { id: 'wolfpelt', rarity: 'common', source: 'monster' },

  // --- UNCOMMON (Blue) ---
  'mourninglily': { id: 'mourninglily', rarity: 'uncommon', source: 'plant' },
  'moonpetal': { id: 'moonpetal', rarity: 'uncommon', source: 'plant' },
  'cinderheart': { id: 'cinderheart', rarity: 'uncommon', source: 'tree' },
  'dreadwood': { id: 'dreadwood', rarity: 'uncommon', source: 'tree' },
  'mushroom': { id: 'mushroom', rarity: 'uncommon', source: 'monster' },
  'rockmuncher': { id: 'rockmuncher', rarity: 'uncommon', source: 'monster' },
  'goldore': { id: 'goldore', rarity: 'uncommon', source: 'ore' },
  'titaniumore': { id: 'titaniumore', rarity: 'uncommon', source: 'ore' },
  'ambersap': { id: 'ambersap', rarity: 'uncommon', source: 'tree' },
  'geode': { id: 'geode', rarity: 'uncommon', source: 'ore' },

  // --- RARE (Green) ---
  'shadowleaf': { id: 'shadowleaf', rarity: 'rare', source: 'plant' },
  'goldleaf': { id: 'goldleaf', rarity: 'rare', source: 'tree' },
  'shadowwolf': { id: 'shadowwolf', rarity: 'rare', source: 'monster' },
  'cavecrawler': { id: 'cavecrawler', rarity: 'rare', source: 'monster' },
  'alphawolfheart': { id: 'alphawolfheart', rarity: 'rare', source: 'monster' },

  // --- MYTHIC (Purple) ---
  'witchbane': { id: 'witchbane', rarity: 'mythic', source: 'plant' },
  'godwood': { id: 'godwood', rarity: 'mythic', source: 'tree' },
  'woodengolem': { id: 'woodengolem', rarity: 'mythic', source: 'monster' },
  'livingwoodcore': { id: 'livingwoodcore', rarity: 'mythic', source: 'monster' },
  'primordialcore': { id: 'primordialcore', rarity: 'mythic', source: 'monster' },
  'oreelemental': { id: 'oreelemental', rarity: 'mythic', source: 'monster' },
  'crystalrock': { id: 'crystalrock', rarity: 'mythic', source: 'ore' },
  'dinobones': { id: 'dinobones', rarity: 'mythic', source: 'ore' }
};

export function getItemInfo(itemName: string): ItemInfo | null {
  const normalized = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (RARITY_DB[normalized]) {
    return RARITY_DB[normalized];
  }
  
  return null;
}
