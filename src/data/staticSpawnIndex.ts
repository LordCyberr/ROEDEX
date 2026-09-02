/**
 * staticSpawnIndex.ts — mrsnorch ROE Tracker static map data index
 *
 * Loads staticSpawns.json at module init and provides a fast zone-keyed
 * lookup. Handles zone name normalization between the JSON format
 * ("MinesLower") and the store format ("Lower Mines").
 */
// Removed static import

export interface StaticSpawnEntry {
  zone: string;       // original zone string from JSON
  x: number;
  y: number;
  statsKey: string;
  type: string;
  /** Assigned by the loader — 'ore' | 'tree' | 'plant' | 'mob' */
  spawnCategory: 'ore' | 'tree' | 'plant' | 'mob';
}

// ── Zone name normalization ──────────────────────────────────────────────────
// Maps JSON zone keys → store currentZone values
const ZONE_NORMALIZE: Record<string, string> = {
  Forest:     'Forest',
  Mines:      'Mines',
  MinesLower: 'Lower Mines',
  Town:       'Town',
  Tavern:     'Tavern',
  Alchemist:  'Alchemist',
  Blacksmith: 'Blacksmith',
  Marketplace:'Marketplace',
  Bank:       'Bank',
  Guild:      'Guild',
  House:      'House',
};

// Reverse map: store zone → normalized JSON key (for lookups from store)
const STORE_TO_JSON_KEY: Record<string, string> = {};
for (const [jsonKey, storeZone] of Object.entries(ZONE_NORMALIZE)) {
  STORE_TO_JSON_KEY[storeZone.toLowerCase()] = jsonKey;
}

/** Normalizes a store zone string into the JSON zone key */
function normalizeZone(storeZone: string): string {
  return STORE_TO_JSON_KEY[storeZone.toLowerCase()] || storeZone;
}

// ── Build index: zoneName (JSON) → entries ───────────────────────────────────
const oresByZone   = new Map<string, StaticSpawnEntry[]>();
const treesByZone  = new Map<string, StaticSpawnEntry[]>();
const plantsByZone = new Map<string, StaticSpawnEntry[]>();
const mobsByZone   = new Map<string, StaticSpawnEntry[]>();

let isLoaded = false;

export async function loadStaticSpawns() {
  if (isLoaded) return;
  try {
    const res = await fetch('/staticSpawns.json');
    if (!res.ok) return;
    const data = await res.json();
    
    for (const ore of data.ores || []) {
      const key = ore.zone;
      if (!oresByZone.has(key)) oresByZone.set(key, []);
      oresByZone.get(key)!.push({ ...ore, spawnCategory: 'ore' });
    }
    for (const tree of data.trees || []) {
      const key = tree.zone;
      if (!treesByZone.has(key)) treesByZone.set(key, []);
      treesByZone.get(key)!.push({ ...tree, spawnCategory: 'tree' });
    }
    for (const plant of data.plants || []) {
      const key = plant.zone;
      if (!plantsByZone.has(key)) plantsByZone.set(key, []);
      plantsByZone.get(key)!.push({ ...plant, spawnCategory: 'plant' });
    }
    for (const mob of data.mobs || []) {
      const key = mob.zone;
      if (!mobsByZone.has(key)) mobsByZone.set(key, []);
      mobsByZone.get(key)!.push({ ...mob, spawnCategory: 'mob' });
    }
    isLoaded = true;
  } catch (e) {
    console.error('[ROEDEX] Failed to load staticSpawns.json', e);
  }
}

// ── Public API ───────────────────────────────────────────────────────────────

export interface StaticZoneSpawns {
  /** Ores, trees, plants — shown as resource dots */
  resources: StaticSpawnEntry[];
  /** Mobs — shown as enemy dots */
  enemies:   StaticSpawnEntry[];
}

/**
 * Returns static spawn data for a given store zone name.
 * Returns empty arrays if the zone has no static data.
 *
 * @param storeZone - e.g. "Forest", "Mines", "Lower Mines"
 */
export function getStaticSpawnsForZone(storeZone: string): StaticZoneSpawns {
  if (!storeZone) return { resources: [], enemies: [] };

  const key = normalizeZone(storeZone);

  const ores   = oresByZone.get(key)   || [];
  const trees  = treesByZone.get(key)  || [];
  const plants = plantsByZone.get(key) || [];
  const mobs   = mobsByZone.get(key)   || [];

  return {
    resources: [...ores, ...trees, ...plants],
    enemies:   mobs,
  };
}

/** Returns all zone names that have static data (in store format) */
export function getZonesWithStaticData(): string[] {
  const keys = new Set([
    ...oresByZone.keys(),
    ...treesByZone.keys(),
    ...plantsByZone.keys(),
    ...mobsByZone.keys(),
  ]);
  return Array.from(keys).map(k => ZONE_NORMALIZE[k] || k);
}
