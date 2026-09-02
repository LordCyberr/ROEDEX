/**
 * data/rarity.ts — Bridge re-export for backward compatibility.
 *
 * The canonical source of truth is gameDatabase.ts (GAME_DATABASE + DB_LOOKUP + DROP_LOOKUP).
 * Many files import `getItemInfo` from this path, so we re-export it here to avoid
 * having to touch every consumer file individually.
 */

import { GAME_DATABASE, DB_LOOKUP, DROP_LOOKUP, GameEntityDef, DropDef } from './gameDatabase';
import { StringCache } from '../utils/stringCache';

export type { GameEntityDef, DropDef };
export { GAME_DATABASE, DB_LOOKUP, DROP_LOOKUP };

/**
 * Look up an entity or item by its raw/sanitized name.
 * Returns the matching GameEntityDef if found, or null.
 * Fallbacks have been removed as per the strictly hardcoded DB requirement.
 */
export function getItemInfo(name: string): GameEntityDef | null {
  if (!name) return null;
  const key = StringCache.sanitize(name);
  if (DB_LOOKUP[key]) return DB_LOOKUP[key];
  if (DROP_LOOKUP[key]) {
    const drop = DROP_LOOKUP[key];
    return {
      rawName: drop.itemId,
      sanitizedName: drop.sanitizedName,
      rarity: drop.rarity,
      category: 'misc',
      hp: 0,
      maxHp: 0,
      cooldown: 0,
      drops: []
    };
  }
  return null;
}

/**
 * Look up a drop definition by item ID.
 */
export function getDropInfo(itemId: string): DropDef | null {
  if (!itemId) return null;
  const key = StringCache.sanitize(itemId);
  return DROP_LOOKUP[key] ?? null;
}
