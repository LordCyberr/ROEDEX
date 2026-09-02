export type RarityType = 'common' | 'uncommon' | 'rare' | 'mystical';
export type CategoryType = 'plant' | 'tree' | 'monster' | 'ore' | 'boss' | 'misc' | 'weapon' | 'tool' | 'consumable' | 'currency' | 'lootbox' | 'voucher' | 'material';

export interface DropDef {
  itemId: string;
  sanitizedName: string;
  rarity: RarityType | string;
}

export interface GameEntityDef {
  rawName: string;
  sanitizedName: string;
  rarity: RarityType | string;
  category: CategoryType;
  hp: number;
  maxHp: number;
  cooldown: number;
  drops: DropDef[];
}

export const GAME_DATABASE: GameEntityDef[] = [
  { rawName: 'ForestSlime', sanitizedName: 'Slime', rarity: 'common', category: 'monster', hp: 570, maxHp: 570, cooldown: 1800, drops: [{ itemId: 'slimegel', sanitizedName: 'Slime Gel', rarity: 'common' }, { itemId: 'elasticcore', sanitizedName: 'Elastic Core', rarity: 'common' }, { itemId: 'pureessence', sanitizedName: 'Pure Essence', rarity: 'uncommon' }] },
  { rawName: 'MushroomSprite', sanitizedName: 'Mushroom', rarity: 'uncommon', category: 'monster', hp: 1020, maxHp: 1020, cooldown: 2700, drops: [{ itemId: 'glowingspores', sanitizedName: 'Glowing Spores', rarity: 'common' }, { itemId: 'spritedust', sanitizedName: 'Sprite Dust', rarity: 'common' }, { itemId: 'fungalcrown', sanitizedName: 'Fungal Crown', rarity: 'uncommon' }] },
  { rawName: 'ShadowWolf', sanitizedName: 'Shadow Wolf', rarity: 'rare', category: 'monster', hp: 1850, maxHp: 1850, cooldown: 3600, drops: [{ itemId: 'wolfpelt', sanitizedName: 'Wolf Pelt', rarity: 'common' }, { itemId: 'sharpfang', sanitizedName: 'Sharp Fang', rarity: 'uncommon' }, { itemId: 'alphawolfheart', sanitizedName: 'Alpha Wolf Heart', rarity: 'rare' }] },
  { rawName: 'WoodenGolem', sanitizedName: 'Wooden Golem', rarity: 'mystical', category: 'monster', hp: 3750, maxHp: 3750, cooldown: 5400, drops: [{ itemId: 'enchantedbark', sanitizedName: 'Enchanted Bark', rarity: 'common' }, { itemId: 'ambersap', sanitizedName: 'Ambersap', rarity: 'rare' }, { itemId: 'livingwoodcore', sanitizedName: 'Living Wood Core', rarity: 'mystical' }] },
  { rawName: 'RockMuncher', sanitizedName: 'Rock Muncher', rarity: 'uncommon', category: 'monster', hp: 1420, maxHp: 1420, cooldown: 2700, drops: [{ itemId: 'stonefragments', sanitizedName: 'Stone Fragments', rarity: 'common' }, { itemId: 'graniteteeth', sanitizedName: 'Granite Teeth', rarity: 'common' }, { itemId: 'geodecore', sanitizedName: 'Geode Core', rarity: 'uncommon' }] },
  { rawName: 'CrystalBat', sanitizedName: 'Crystal Bat', rarity: 'common', category: 'monster', hp: 870, maxHp: 870, cooldown: 1800, drops: [{ itemId: 'crystaldust', sanitizedName: 'Crystal Dust', rarity: 'common' }, { itemId: 'sonicwing', sanitizedName: 'Sonic Wing', rarity: 'common' }, { itemId: 'echocrystal', sanitizedName: 'Echo Crystal', rarity: 'uncommon' }] },
  { rawName: 'CaveCrawler', sanitizedName: 'Cave Crawler', rarity: 'rare', category: 'monster', hp: 2250, maxHp: 2250, cooldown: 3600, drops: [{ itemId: 'spidersilk', sanitizedName: 'Spider Silk', rarity: 'common' }, { itemId: 'venomsac', sanitizedName: 'Venom Sac', rarity: 'uncommon' }, { itemId: 'crawlereye', sanitizedName: 'Crawler Eye', rarity: 'rare' }] },
  { rawName: 'OreElemental', sanitizedName: 'Ore Elemental', rarity: 'mystical', category: 'monster', hp: 4250, maxHp: 4250, cooldown: 5400, drops: [{ itemId: 'mineralshards', sanitizedName: 'Mineral Shards', rarity: 'uncommon' }, { itemId: 'elementalessence', sanitizedName: 'Elemental Essence', rarity: 'rare' }, { itemId: 'primordialcore', sanitizedName: 'Primordial Core', rarity: 'mystical' }] },
  { rawName: 'ironwoodtree', sanitizedName: 'Iron wood', rarity: 'common', category: 'tree', hp: 400, maxHp: 400, cooldown: 1800, drops: [{ itemId: 'ironwood', sanitizedName: 'Iron Wood', rarity: 'common' }] },
  { rawName: 'blackoaktree', sanitizedName: 'Black oak', rarity: 'common', category: 'tree', hp: 250, maxHp: 250, cooldown: 1800, drops: [{ itemId: 'blackoak', sanitizedName: 'Black Oak', rarity: 'common' }] },
  { rawName: 'bronzewoodtree', sanitizedName: 'Bronze wood', rarity: 'common', category: 'tree', hp: 850, maxHp: 850, cooldown: 1800, drops: [{ itemId: 'bronzewood', sanitizedName: 'Bronze Wood', rarity: 'common' }] },
  { rawName: 'goldleaftree', sanitizedName: 'Gold leaf', rarity: 'rare', category: 'tree', hp: 2950, maxHp: 2950, cooldown: 3600, drops: [{ itemId: 'goldleaf', sanitizedName: 'Gold Leaf', rarity: 'rare' }] },
  { rawName: 'cinderhearttree', sanitizedName: 'Cinder heart', rarity: 'uncommon', category: 'tree', hp: 2200, maxHp: 2200, cooldown: 2700, drops: [{ itemId: 'cinderheart', sanitizedName: 'Cinder Heart', rarity: 'uncommon' }] },
  { rawName: 'dreadwoodtree', sanitizedName: 'Dread wood', rarity: 'uncommon', category: 'tree', hp: 1450, maxHp: 1450, cooldown: 2700, drops: [{ itemId: 'dreadwood', sanitizedName: 'Dread Wood', rarity: 'uncommon' }] },
  { rawName: 'godwoodtree', sanitizedName: 'God wood', rarity: 'mystical', category: 'tree', hp: 3800, maxHp: 3800, cooldown: 5400, drops: [{ itemId: 'godwood', sanitizedName: 'God Wood', rarity: 'mystical' }] },
  { rawName: 'mistweedflower', sanitizedName: 'Mist Weed', rarity: 'common', category: 'plant', hp: 100, maxHp: 100, cooldown: 1800, drops: [{ itemId: 'mistweed', sanitizedName: 'Mist weed', rarity: 'common' }] },
  { rawName: 'witchbane', sanitizedName: 'Witch Bane', rarity: 'mystical', category: 'plant', hp: 100, maxHp: 100, cooldown: 5400, drops: [{ itemId: 'witchbane', sanitizedName: 'Witch Bane', rarity: 'mystical' }] },
  { rawName: 'moonpetal', sanitizedName: 'Moon Petal', rarity: 'uncommon', category: 'plant', hp: 100, maxHp: 100, cooldown: 2700, drops: [{ itemId: 'moonpetal', sanitizedName: 'Moon Petal', rarity: 'uncommon' }] },
  { rawName: 'mourninglily', sanitizedName: 'Mourning Lily', rarity: 'uncommon', category: 'plant', hp: 100, maxHp: 100, cooldown: 2700, drops: [{ itemId: 'mourninglily', sanitizedName: 'Mourning Lily', rarity: 'uncommon' }] },
  { rawName: 'shadowleafy', sanitizedName: 'Shadow Leaf', rarity: 'rare', category: 'plant', hp: 100, maxHp: 100, cooldown: 3600, drops: [{ itemId: 'shadowleaf', sanitizedName: 'Shadow Leaf', rarity: 'rare' }] },
  { rawName: 'witchbaneflower', sanitizedName: 'Witch Bane', rarity: 'mystical', category: 'plant', hp: 100, maxHp: 100, cooldown: 5400, drops: [{ itemId: 'witchbane', sanitizedName: 'Witch Bane', rarity: 'mystical' }] },
  { rawName: 'moonpetalflower', sanitizedName: 'Moon Petal', rarity: 'uncommon', category: 'plant', hp: 100, maxHp: 100, cooldown: 2700, drops: [{ itemId: 'moonpetal', sanitizedName: 'Moon Petal', rarity: 'uncommon' }] },
  { rawName: 'mourninglilyflower', sanitizedName: 'Mourning Lily', rarity: 'uncommon', category: 'plant', hp: 100, maxHp: 100, cooldown: 2700, drops: [{ itemId: 'mourninglily', sanitizedName: 'Mourning Lily', rarity: 'uncommon' }] },
  { rawName: 'shadowleafflower', sanitizedName: 'Shadow Leaf', rarity: 'rare', category: 'plant', hp: 100, maxHp: 100, cooldown: 3600, drops: [{ itemId: 'shadowleaf', sanitizedName: 'Shadow Leaf', rarity: 'rare' }] },
  { rawName: 'silverleafflower', sanitizedName: 'Silver Leaf', rarity: 'common', category: 'plant', hp: 100, maxHp: 100, cooldown: 1800, drops: [{ itemId: 'silverleaf', sanitizedName: 'Silver Leaf', rarity: 'common' }] },
  { rawName: 'bloodrootvineflower', sanitizedName: 'Bloodroot Vine', rarity: 'common', category: 'plant', hp: 100, maxHp: 100, cooldown: 1800, drops: [{ itemId: 'bloodrootvine', sanitizedName: 'Blood Root', rarity: 'common' }] },
  { rawName: 'silverorenode', sanitizedName: 'Silver Ore', rarity: 'common', category: 'ore', hp: 1550, maxHp: 1550, cooldown: 1800, drops: [{ itemId: 'silverore', sanitizedName: 'Silver Ore', rarity: 'common' }] },
  { rawName: 'ironorenode', sanitizedName: 'Iron Ore', rarity: 'common', category: 'ore', hp: 750, maxHp: 750, cooldown: 1800, drops: [{ itemId: 'ironore', sanitizedName: 'Iron Ore', rarity: 'common' }] },
  { rawName: 'copperorenode', sanitizedName: 'Copper Ore', rarity: 'common', category: 'ore', hp: 500, maxHp: 500, cooldown: 1800, drops: [{ itemId: 'copperore', sanitizedName: 'Copper Ore', rarity: 'common' }] },
  { rawName: 'goldorenode', sanitizedName: 'Gold Ore', rarity: 'uncommon', category: 'ore', hp: 2250, maxHp: 2250, cooldown: 2700, drops: [{ itemId: 'goldore', sanitizedName: 'Gold Ore', rarity: 'uncommon' }] },
  { rawName: 'dinobonesnode', sanitizedName: 'Dino Bones', rarity: 'mystical', category: 'ore', hp: 4750, maxHp: 4750, cooldown: 5400, drops: [{ itemId: 'dinobones', sanitizedName: 'Dino bones', rarity: 'mystical' }] },
  { rawName: 'crystalrocknode', sanitizedName: 'Crystal Rock', rarity: 'mystical', category: 'ore', hp: 4200, maxHp: 4200, cooldown: 3600, drops: [{ itemId: 'crystalrock', sanitizedName: 'Crystal Rock', rarity: 'mystical' }] },
  { rawName: 'titaniumorenode', sanitizedName: 'Titanium Ore', rarity: 'uncommon', category: 'ore', hp: 3500, maxHp: 3500, cooldown: 2700, drops: [{ itemId: 'titaniumore', sanitizedName: 'Titanium Ore', rarity: 'uncommon' }] },
  { rawName: 'tree', sanitizedName: 'Tree', rarity: 'common', category: 'tree', hp: 150, maxHp: 150, cooldown: 1800, drops: [{ itemId: 'wood', sanitizedName: 'Wood', rarity: 'common' }] },
  { rawName: 'rock', sanitizedName: 'Rock', rarity: 'common', category: 'ore', hp: 150, maxHp: 150, cooldown: 1800, drops: [{ itemId: 'stone', sanitizedName: 'Stone', rarity: 'common' }] },
  { rawName: 'stone', sanitizedName: 'Stone', rarity: 'common', category: 'ore', hp: 150, maxHp: 150, cooldown: 1800, drops: [{ itemId: 'stone', sanitizedName: 'Stone', rarity: 'common' }] },
  { rawName: 'plant', sanitizedName: 'Plant', rarity: 'common', category: 'plant', hp: 50, maxHp: 50, cooldown: 900, drops: [{ itemId: 'fiber', sanitizedName: 'Fiber', rarity: 'common' }] },
];

/**
 * LOOT_ITEMS — flat registry for non-entity loot items.
 * These are items that appear in inventory/drop packets but are NOT world entities
 * (no HP, no respawn timer). Weapons, tools, consumables, currencies, loot boxes, etc.
 */
export interface LootItemDef {
  rawName?: string;
  hp?: number;
  maxHp?: number;
  cooldown?: number;
  drops?: any[];
  itemId: string;
  sanitizedName: string;
  rarity: RarityType | string;
  category: CategoryType;
}

export const LOOT_ITEMS: LootItemDef[] = [
  // ── Currency ──────────────────────────────────────────────────────────────
  { itemId: 'runestone',            sanitizedName: 'Runestone',           rarity: 'common',   category: 'currency' },
  { itemId: 'coin',                 sanitizedName: 'Coin',                rarity: 'common',   category: 'currency' },
  { itemId: 'goldcoin',             sanitizedName: 'Gold Coin',           rarity: 'uncommon', category: 'currency' },

  // ── Crafting Kits ─────────────────────────────────────────────────────────
  { itemId: 'cookingkit',           sanitizedName: 'Cooking Kit',         rarity: 'common',   category: 'tool', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'brewingkit',           sanitizedName: 'Brewing Kit',         rarity: 'common',   category: 'tool', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'repairkit',            sanitizedName: 'Repair Kit',          rarity: 'common',   category: 'tool', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'advancedrepairkit',    sanitizedName: 'Advanced Repair Kit', rarity: 'uncommon', category: 'tool', hp:0, maxHp:0, cooldown:0, drops:[] },

  // ── Consumables ───────────────────────────────────────────────────────────
  { itemId: 'magicpot',             sanitizedName: 'Magic Pot',           rarity: 'uncommon', category: 'consumable', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'magicpan',             sanitizedName: 'Magic Pan',           rarity: 'uncommon', category: 'consumable', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'healthpotion',         sanitizedName: 'Health Potion',       rarity: 'common',   category: 'consumable', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'greaterhealthpotion',  sanitizedName: 'Greater Health Potion', rarity: 'uncommon', category: 'consumable', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'manapotion',           sanitizedName: 'Mana Potion',         rarity: 'common',   category: 'consumable', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'antidote',             sanitizedName: 'Antidote',            rarity: 'common',   category: 'consumable', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'elixir',               sanitizedName: 'Elixir',              rarity: 'rare',     category: 'consumable', hp:0, maxHp:0, cooldown:0, drops:[] },

  // ── Materials ─────────────────────────────────────────────────────────────
  { itemId: 'leather',              sanitizedName: 'Leather',             rarity: 'common',   category: 'material', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'hardleather',          sanitizedName: 'Hard Leather',        rarity: 'uncommon', category: 'material', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'cloth',                sanitizedName: 'Cloth',               rarity: 'common',   category: 'material', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'silk',                 sanitizedName: 'Silk',                rarity: 'uncommon', category: 'material', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'bone',                 sanitizedName: 'Bone',                rarity: 'common',   category: 'material', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'crystal',              sanitizedName: 'Crystal',             rarity: 'uncommon', category: 'material', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'crystalore',           sanitizedName: 'Crystal Ore',         rarity: 'uncommon', category: 'material', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'copper',               sanitizedName: 'Copper',              rarity: 'common',   category: 'material', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'iron',                 sanitizedName: 'Iron',                rarity: 'common',   category: 'material', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'silver',               sanitizedName: 'Silver',              rarity: 'uncommon', category: 'material', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'gold',                 sanitizedName: 'Gold',                rarity: 'uncommon', category: 'material', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'titanium',             sanitizedName: 'Titanium',            rarity: 'uncommon', category: 'material', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'dino',                 sanitizedName: 'Dino Bone',           rarity: 'mystical', category: 'material', hp:0, maxHp:0, cooldown:0, drops:[] },

  // ── Loot Boxes & Vouchers ─────────────────────────────────────────────────
  { itemId: 'season0commonlootbox', sanitizedName: 'Common Loot Box',     rarity: 'common',   category: 'lootbox', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'season0uncommonlootbox',sanitizedName: 'Uncommon Loot Box',  rarity: 'uncommon', category: 'lootbox', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'season0rarelootbox',   sanitizedName: 'Rare Loot Box',       rarity: 'rare',     category: 'lootbox', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'season0mythiclootbox', sanitizedName: 'Mythic Loot Box',     rarity: 'mystical', category: 'lootbox', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'burnvoucher_legendary',sanitizedName: 'Legendary Burn Voucher', rarity: 'mystical', category: 'voucher', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'burnvoucher_rare',     sanitizedName: 'Rare Burn Voucher',   rarity: 'rare',     category: 'voucher', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'burnvoucher_common',   sanitizedName: 'Burn Voucher',        rarity: 'common',   category: 'voucher', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'nftraffleticket',      sanitizedName: 'Raffle Ticket',       rarity: 'rare',     category: 'voucher', hp:0, maxHp:0, cooldown:0, drops:[] },
  { itemId: 'raffleticket',         sanitizedName: 'Raffle Ticket',       rarity: 'common',   category: 'voucher', hp:0, maxHp:0, cooldown:0, drops:[] },

  // ── Weapons ───────────────────────────────────────────────────────────────
  { itemId: 'woodensword',          sanitizedName: 'Wooden Sword',        rarity: 'common',   category: 'weapon' },
  { itemId: 'ironsword',            sanitizedName: 'Iron Sword',          rarity: 'common',   category: 'weapon' },
  { itemId: 'coppersword',          sanitizedName: 'Copper Sword',        rarity: 'common',   category: 'weapon' },
  { itemId: 'silversword',          sanitizedName: 'Silver Sword',        rarity: 'uncommon', category: 'weapon' },
  { itemId: 'goldsword',            sanitizedName: 'Gold Sword',          rarity: 'uncommon', category: 'weapon' },
  { itemId: 'goldshortsword',       sanitizedName: 'Gold Short Sword',    rarity: 'uncommon', category: 'weapon' },
  { itemId: 'titaniumsword',        sanitizedName: 'Titanium Sword',      rarity: 'uncommon', category: 'weapon' },
  { itemId: 'titaniumshortsword',   sanitizedName: 'Titanium Short Sword',rarity: 'uncommon', category: 'weapon' },
  { itemId: 'dinosword',            sanitizedName: 'Dino Sword',          rarity: 'rare',     category: 'weapon' },
  { itemId: 'dinoshortsword',       sanitizedName: 'Dino Short Sword',    rarity: 'rare',     category: 'weapon' },
  { itemId: 'crystalsword',         sanitizedName: 'Crystal Sword',       rarity: 'mystical', category: 'weapon' },
  { itemId: 'godslayer',            sanitizedName: 'Godslayer',           rarity: 'mystical', category: 'weapon' },

  // ── Tools / Pickaxes ──────────────────────────────────────────────────────
  { itemId: 'woodenpickaxe',        sanitizedName: 'Wooden Pickaxe',      rarity: 'common',   category: 'tool' },
  { itemId: 'ironpickaxe',          sanitizedName: 'Iron Pickaxe',        rarity: 'common',   category: 'tool' },
  { itemId: 'copperpickaxe',        sanitizedName: 'Copper Pickaxe',      rarity: 'common',   category: 'tool' },
  { itemId: 'silverpickaxe',        sanitizedName: 'Silver Pickaxe',      rarity: 'uncommon', category: 'tool' },
  { itemId: 'goldpickaxe',          sanitizedName: 'Gold Pickaxe',        rarity: 'uncommon', category: 'tool' },
  { itemId: 'titaniumpickaxe',      sanitizedName: 'Titanium Pickaxe',    rarity: 'uncommon', category: 'tool' },
  { itemId: 'crystalpickaxe',       sanitizedName: 'Crystal Pickaxe',     rarity: 'mystical', category: 'tool' },
  { itemId: 'magichammer',          sanitizedName: 'Magic Hammer',        rarity: 'rare',     category: 'tool' },
  { itemId: 'dinopickaxe',          sanitizedName: 'Dino Pickaxe',        rarity: 'rare',     category: 'tool' },

  // ── Axes ──────────────────────────────────────────────────────────────────
  { itemId: 'woodenaxe',            sanitizedName: 'Wooden Axe',          rarity: 'common',   category: 'tool' },
  { itemId: 'ironaxe',              sanitizedName: 'Iron Axe',            rarity: 'common',   category: 'tool' },
  { itemId: 'copperaxe',            sanitizedName: 'Copper Axe',          rarity: 'common',   category: 'tool' },
  { itemId: 'silveraxe',            sanitizedName: 'Silver Axe',          rarity: 'uncommon', category: 'tool' },
  { itemId: 'goldaxe',              sanitizedName: 'Gold Axe',            rarity: 'uncommon', category: 'tool' },
  { itemId: 'titaniumaxe',          sanitizedName: 'Titanium Axe',        rarity: 'uncommon', category: 'tool' },
  { itemId: 'crystalaxe',           sanitizedName: 'Crystal Axe',         rarity: 'mystical', category: 'tool' },
  { itemId: 'dinoaxe',              sanitizedName: 'Dino Axe',            rarity: 'rare',     category: 'tool' },
];

/** O(1) lookup for loot items by raw itemId or sanitizedName (normalized) */
export const LOOT_LOOKUP: Record<string, LootItemDef> = {};

LOOT_ITEMS.forEach(item => {
  const key1 = item.itemId.toLowerCase().replace(/[^a-z0-9]/g, '');
  LOOT_LOOKUP[key1] = item;
  const key2 = item.sanitizedName.toLowerCase().replace(/[^a-z0-9]/g, '');
  LOOT_LOOKUP[key2] = item;
});

/**
 * Optimized dictionary for O(1) lookups.
 * The key is always lowercase and stripped of special characters/spaces to match websocket data perfectly.
 */
export const DB_LOOKUP: Record<string, GameEntityDef> = {};
export const DROP_LOOKUP: Record<string, DropDef> = {};

GAME_DATABASE.forEach(entity => {
  const key1 = entity.rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
  DB_LOOKUP[key1] = entity;
  
  const key2 = entity.sanitizedName.toLowerCase().replace(/[^a-z0-9]/g, '');
  DB_LOOKUP[key2] = entity;
  
  // Stripped keys (without common suffixes like flower, node, tree, vine, leafy)
  const stripped1 = key1.replace(/(flower|node|tree|vine|plant|leafy)$/g, '');
  if (stripped1) DB_LOOKUP[stripped1] = entity;

  const stripped2 = key2.replace(/(flower|node|tree|vine|plant|leafy)$/g, '');
  if (stripped2) DB_LOOKUP[stripped2] = entity;

  // Server-appended suffix variants: game server appends ' ai' or ' clone' to NPC names.
  // Pre-baking these keys means the lookup works even for code paths that skip normalization.
  // e.g. 'CrystalBat ai' → 'crystalbatai' → still resolves to CrystalBat entry
  const withAi = key1 + 'ai';
  if (!DB_LOOKUP[withAi]) DB_LOOKUP[withAi] = entity;

  const withClone = key1 + 'clone';
  if (!DB_LOOKUP[withClone]) DB_LOOKUP[withClone] = entity;

  const withAi2 = key2 + 'ai';
  if (!DB_LOOKUP[withAi2]) DB_LOOKUP[withAi2] = entity;

  const withClone2 = key2 + 'clone';
  if (!DB_LOOKUP[withClone2]) DB_LOOKUP[withClone2] = entity;
  
  entity.drops.forEach(drop => {
    if (drop.itemId) {
      const dropKey = drop.itemId.toLowerCase().replace(/[^a-z0-9]/g, '');
      DROP_LOOKUP[dropKey] = drop;

      const dropSanitizedKey = drop.sanitizedName.toLowerCase().replace(/[^a-z0-9]/g, '');
      DROP_LOOKUP[dropSanitizedKey] = drop;

      const pseudoDef: GameEntityDef = {
        rawName: drop.itemId,
        sanitizedName: drop.sanitizedName,
        rarity: drop.rarity,
        category: 'misc',
        hp: 0,
        maxHp: 0,
        cooldown: 0,
        drops: []
      };

      if (!DB_LOOKUP[dropKey]) DB_LOOKUP[dropKey] = pseudoDef;
      if (!DB_LOOKUP[dropSanitizedKey]) DB_LOOKUP[dropSanitizedKey] = pseudoDef;
    }
  });
});

