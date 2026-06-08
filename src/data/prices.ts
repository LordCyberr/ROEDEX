export const RESELL_VALUES: Record<string, number> = {
  // Mobs
  'slime gel': 12,
  'elastic core': 25,
  'pure essence': 160,
  'glowing spores': 15,
  'sprite dust': 30,
  'fungal crown': 180,
  'wolf pelt': 20,
  'sharp fang': 480,
  'alpha wolf heart': 600,
  'enchanted bark': 120, // (Image says Enchantered Bark, log says enchantedbark)
  'amber sap': 140,
  'living wood core': 1600,
  'sonic wing': 35,
  'cristal dust': 35,
  'echo cristal': 240, // Note: The game spells it "cristal"
  'stone fragment': 30,
  'granith teeth': 35,
  'geode core': 260,
  'spider silk': 40,
  'venom sac': 200,
  'crawler eye': 880,
  'mineral shard': 120,
  'elemental essence': 720,
  'primordial core': 2100,

  // Plants
  'silver leaf': 10,
  'mistweed': 20,
  'bloodroot vine': 25,
  'mourning lily': 80,
  'moonpetal': 100,
  'shadowleaf': 360,
  'witchbane': 1200,

  // Woods
  'black oak': 25,
  'ironwood': 40,
  'bronze wood': 50,
  'dread wood': 140,
  'cinder heart': 160,
  'gold leaf': 400,
  'god wood': 1600,

  // Ores
  'copper': 30,
  'iron': 60,
  'silver': 100,
  'gold': 160,
  'titanium': 340,
  'cristal': 480,
  'bone': 1900,

  // Shop / Tools
  'fruit': 10,
  'leather': 24,
  'meat': 34,
  'milk': 24,
  'vegetables': 20,
  'wheat': 20,
  'copper sword': 496,
  'copper axe': 420,
  'copper pickaxe': 440,
  'minor healing potion': 330,
  'healing potion': 716,
  'minor energy potion': 330,
  'energy potion': 716,

  // Aliases for when game uses combined names or different spellings in logs
  'stone fragments': 30,
  'granite teeth': 35, // Image: Granith Teeth, Log: graniteteeth
  'mineral shards': 120,
  'crystal dust': 35, // Image: Cristal Dust, Log: crystaldust
  'echo crystal': 240,
  'dino bone': 1900,
  'dinobones': 1900,
  'iron ore': 60,
  'copper ore': 30,
  'gold ore': 160,
  'silver ore': 100,
  'titanium ore': 340,
  'crystal ore': 480,
  'godwood': 1600,
  'blackoak': 25,
  'bronzewood': 50,
  'dreadwood': 140,
  'cinderheart': 160,
  'goldleaf': 400,
  'silverleaf': 10,
  'bloodrootvine': 25,
  'mourninglily': 80,
  'crawlereye': 880,
  'spidersilk': 40,
  'venomsac': 200,
  'elasticcore': 25,
  'pureessence': 160,
  'slimegel': 12,
  'fungalcrown': 180,
  'spritedust': 30,
  'elementalessence': 720,
  'geodecore': 260,
  'alphawolfheart': 600,
  'sharpfang': 480,
  'wolfpelt': 20,
  'ambersap': 140,
  'enchantedbark': 120,
  'glowingspores': 15,
  'runes': 1,
  'rune': 1,
};

export const getResellValue = (name: string, qty: number) => {
  const normalized = name.toLowerCase().replace(/\s+/g, '').trim();
  
  // Try exact match first
  let val = RESELL_VALUES[name.toLowerCase().trim()];
  
  if (val === undefined) {
    // Try without spaces (to match log names like "slimegel")
    val = RESELL_VALUES[normalized];
  }
  
  if (val === undefined) {
    val = 10; // Default fallback
  }

  return val * qty;
};
