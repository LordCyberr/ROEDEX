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

  // Crafted Armors & Weapons & Meals
  'gold gauntlets': 3931,
  'gold scale mail': 3558,
  'guardian’s meal': 448,
  'silver plate armor': 2300,
  'gold short sword': 1920,
  'reinforced dino gambeson': 18300,
  'copper gauntlets': 479,
  'crystal plate greaves': 19629,
  'dino boots': 19650,
  'titanium boots': 5247,
  'titanium axe': 3344,
  'gold sabatons': 3388,
  'dino greathelm': 28320,

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
  'goldgauntlets': 3931,
  'goldscalemail': 3558,
  'guardiansmeal': 448,
  'silverplatearmor': 2300,
  'goldshortsword': 1920,
  'reinforceddinogambeson': 18300,
  'coppergauntlets': 479,
  'crystalplategreaves': 19629,
  'dinoboots': 19650,
  'titaniumboots': 5247,
  'titaniumaxe': 3344,
  'goldsabatons': 3388,
  'dinogreathelm': 28320,
  'runes': 1,
  'rune': 1,
  'livingwoodc': 1600,
  'mineralshards': 120,
  'magichammer': 0,
  'crystaldust': 35,
  'sonicwing': 35,
  'stonefragments': 30,
  'graniteteeth': 35,
  'crystal': 480,
};

// Pre-compute a fully normalized dictionary where keys have no spaces/special chars
const NORMALIZED_RESELL_VALUES: Record<string, number> = {};
for (const [key, value] of Object.entries(RESELL_VALUES)) {
  const superKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
  NORMALIZED_RESELL_VALUES[superKey] = value;
}

export const getResellValue = (name: string, qty: number) => {
  const normalized = name.toLowerCase().replace(/\s+/g, '').trim();
  const superNormalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Try exact match first
  let val = RESELL_VALUES[name.toLowerCase().trim()];
  
  // Try fallback matches using the pre-computed dictionary
  if (val === undefined) {
    val = NORMALIZED_RESELL_VALUES[normalized];
  }
  if (val === undefined) {
    val = NORMALIZED_RESELL_VALUES[superNormalized];
  }
  
  if (val === undefined) {
    val = 0; // Default fallback for unknown items
  }

  return val * qty;
};
