const nameMap: Record<string, string> = {
  // Ores & Rocks
  'crystalrock': 'Crystal Rock',
  'dinobones': 'Dino Bones',
  'copperore': 'Copper Ore',
  'ironore': 'Iron Ore',
  'silverore': 'Silver Ore',
  'goldore': 'Gold Ore',
  'titaniumore': 'Titanium Ore',

  // Materials & Drops
  'slimegel': 'Slime Gel',
  'elasticcore': 'Elastic Core',
  'pureessence': 'Pure Essence',
  'wolfpelt': 'Wolf Pelt',
  'sharpfang': 'Sharp Fang',
  'alphawolfheart': 'Alpha Wolf Heart',
  'enchantedbark': 'Enchanted Bark',
  'ambersap': 'Amber Sap',
  'livingwoodcore': 'Living Wood Core',
  'crystaldust': 'Crystal Dust',
  'sonicwing': 'Sonic Wing',
  'echocrystal': 'Echo Crystal',
  'stonefragments': 'Stone Fragments',
  'graniteteeth': 'Granite Teeth',
  'geodecore': 'Geode Core',
  'spidersilk': 'Spider Silk',
  'venomsac': 'Venom Sac',
  'crawlereye': 'Crawler Eye',
  'mineralshard': 'Mineral Shard',
  'elementalessence': 'Elemental Essence',
  'primordialcore': 'Primordial Core',
  'glowingspores': 'Glowing Spores',
  'spritedust': 'Sprite Dust',
  'fungalcrown': 'Fungal Crown',

  // Plants & Flowers
  'silverleaf': 'Silverleaf',
  'mistweed': 'Mistweed',
  'bloodrootvine': 'Bloodroot Vine',
  'mourninglily': 'Mourning Lily',
  'moonpetal': 'Moonpetal',
  'shadowleaf': 'Shadowleaf',
  'witchbane': 'Witchbane',

  // Trees & Wood
  'blackoak': 'Black Oak',
  'ironwood': 'Ironwood',
  'bronzewood': 'Bronzewood',
  'godwood': 'Godwood',
  'dreadwood': 'Dreadwood',
  'cinderheart': 'Cinderheart',
  'goldleaf': 'Goldleaf',

  // Mobs
  'forest slime': 'Forest Slime',
  'forestslime': 'Forest Slime',
  'mushroom sprite': 'Mushroom Sprite',
  'mushroomsprite': 'Mushroom Sprite',
  'shadowwolf': 'Shadow Wolf',
  'crystalbat': 'Crystal Bat',
  'woodengolem': 'Wooden Golem',
  'oreelemental': 'Ore Elemental',
  'cavecrawler': 'Cave Crawler',
  'rockmuncher': 'Rock Muncher',
};

export const formatInternalName = (raw: string) => {
  let clean = raw.trim();
  
  // Strip common suffixes case-insensitively
  clean = clean.replace(/\s*(node|flower|tree|ai)$/i, '').trim();
  
  const mapKey = clean.toLowerCase().replace(/[^a-z]/g, '');
  if (nameMap[mapKey]) {
    return nameMap[mapKey];
  }
  
  // Format camelCase to Title Case if needed
  clean = clean.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  return clean.replace(/^./, (str) => str.toUpperCase());
};

export const formatDuration = (ms: number) => {
  const totalSecs = Math.floor(ms / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m ${s}s`;
  return `${m}m ${s}s`;
};

export function getRarityColor(rarityKey?: string, defaultColor = '#94a3b8'): string {
  if (!rarityKey) return defaultColor;
  const key = rarityKey.toLowerCase();
  if (key === 'common') return '#94a3b8';
  if (key === 'uncommon') return '#22c55e';
  if (key === 'rare') return '#3b82f6';
  if (key === 'epic') return '#a855f7';
  if (key === 'legendary') return '#eab308';
  if (key === 'mythic' || key === 'mystical') return '#ef4444';
  return defaultColor;
}
