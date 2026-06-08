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

  // --- UNCOMMON (Blue) ---
  'mourninglily': { id: 'mourninglily', rarity: 'uncommon', source: 'plant' },
  'moonpetal': { id: 'moonpetal', rarity: 'uncommon', source: 'plant' },
  'cinderheart': { id: 'cinderheart', rarity: 'uncommon', source: 'tree' },
  'dreadwood': { id: 'dreadwood', rarity: 'uncommon', source: 'tree' },
  'mushroom': { id: 'mushroom', rarity: 'uncommon', source: 'monster' },
  'rockmuncher': { id: 'rockmuncher', rarity: 'uncommon', source: 'monster' },
  'goldore': { id: 'goldore', rarity: 'uncommon', source: 'ore' },
  'titaniumore': { id: 'titaniumore', rarity: 'uncommon', source: 'ore' },

  // --- RARE (Green) ---
  'shadowleaf': { id: 'shadowleaf', rarity: 'rare', source: 'plant' },
  'goldleaf': { id: 'goldleaf', rarity: 'rare', source: 'tree' },
  'shadowwolf': { id: 'shadowwolf', rarity: 'rare', source: 'monster' },
  'cavecrawler': { id: 'cavecrawler', rarity: 'rare', source: 'monster' },

  // --- MYTHIC (Purple) ---
  'witchbane': { id: 'witchbane', rarity: 'mythic', source: 'plant' },
  'godwood': { id: 'godwood', rarity: 'mythic', source: 'tree' },
  'woodengolem': { id: 'woodengolem', rarity: 'mythic', source: 'monster' },
  'oreelemental': { id: 'oreelemental', rarity: 'mythic', source: 'monster' },
  'crystalrock': { id: 'crystalrock', rarity: 'mythic', source: 'ore' },
  'dinobones': { id: 'dinobones', rarity: 'mythic', source: 'ore' }
};

export function getItemInfo(itemName: string): ItemInfo | null {
  const normalized = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (RARITY_DB[normalized]) {
    return RARITY_DB[normalized];
  }
  
  // Fallbacks for when only partial strings or drops match
  
  // Mythic
  if (normalized.includes('golem') || normalized.includes('elemental') || normalized.includes('enchantedbark') || normalized.includes('ambersap') || normalized.includes('geode')) return { id: normalized, rarity: 'mythic', source: 'monster' };
  if (normalized.includes('witchbane')) return { id: normalized, rarity: 'mythic', source: 'plant' };
  if (normalized.includes('godwood')) return { id: normalized, rarity: 'mythic', source: 'tree' };
  if (normalized.includes('crystalrock') || normalized.includes('dinobone')) return { id: normalized, rarity: 'mythic', source: 'ore' };

  // Rare
  if (normalized.includes('wolf') || normalized.includes('crawler') || normalized.includes('fang') || normalized.includes('silk') || normalized.includes('venom')) return { id: normalized, rarity: 'rare', source: 'monster' };
  if (normalized.includes('shadowleaf')) return { id: normalized, rarity: 'rare', source: 'plant' };
  if (normalized.includes('goldleaf')) return { id: normalized, rarity: 'rare', source: 'tree' };

  // Uncommon
  if (normalized.includes('mushroom') || normalized.includes('rockmuncher') || normalized.includes('spore') || normalized.includes('fungal') || normalized.includes('graniteteeth')) return { id: normalized, rarity: 'uncommon', source: 'monster' };
  if (normalized.includes('mourninglily') || normalized.includes('moonpetal')) return { id: normalized, rarity: 'uncommon', source: 'plant' };
  if (normalized.includes('cinderheart') || normalized.includes('dreadwood')) return { id: normalized, rarity: 'uncommon', source: 'tree' };
  if (normalized.includes('gold') || normalized.includes('titanium')) return { id: normalized, rarity: 'uncommon', source: 'ore' };

  // Common
  if (normalized.includes('slime') || normalized.includes('bat') || normalized.includes('gel') || normalized.includes('echocrystal') || normalized.includes('sonicwing')) return { id: normalized, rarity: 'common', source: 'monster' };
  if (normalized.includes('bloodroot') || normalized.includes('silverleaf') || normalized.includes('mistweed')) return { id: normalized, rarity: 'common', source: 'plant' };
  if (normalized.includes('blackoak') || normalized.includes('ironwood') || normalized.includes('bronzewood')) return { id: normalized, rarity: 'common', source: 'tree' };
  if (normalized.includes('copper') || normalized.includes('iron') || normalized.includes('silver')) return { id: normalized, rarity: 'common', source: 'ore' };
  
  return null;
}
