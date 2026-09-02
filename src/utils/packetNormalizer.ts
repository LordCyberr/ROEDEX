/**
 * packetNormalizer.ts
 * -------------------
 * Utility for safely extracting field values from WebSocket payloads.
 * Embervault's server is inconsistent with field naming across versions.
 * This normalizer tries every known alias for a field and returns the
 * first defined (non-null, non-undefined) value.
 *
 * Verified against: Embervault WS packets (2026-08 snapshot)
 */

/**
 * Try a list of key aliases on a payload object and return the first
 * defined value. Returns `undefined` if none match.
 *
 * @example
 * const hp = normalizeField(payload, 'hp', 'Hp', 'health', 'Health', 'curHp', 'currentHp');
 */
export function normalizeField<T = unknown>(
  payload: Record<string, unknown>,
  ...keys: string[]
): T | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  for (const key of keys) {
    const val = payload[key];
    if (val !== undefined && val !== null) return val as T;
  }
  return undefined;
}

// ─── Pre-baked normalizers for common game fields ─────────────────────────────

/** Player current HP */
export const normalizeHp = (p: Record<string, unknown>) =>
  normalizeField<number>(p, 'hp', 'Hp', 'health', 'Health', 'currentHealth', 'curHp', 'currentHp', 'cur_hp', 'hitpoints');

/** Player max HP */
export const normalizeMaxHp = (p: Record<string, unknown>) =>
  normalizeField<number>(p, 'maxHp', 'MaxHp', 'maxHealth', 'MaxHealth', 'max_hp', 'maximumHitpoints', 'maxHitpoints');

/** Player X position */
export const normalizePosX = (p: Record<string, unknown>) =>
  normalizeField<number>(p, 'x', 'X', 'posX', 'pos_x', 'position_x');

/** Player Y position */
export const normalizePosY = (p: Record<string, unknown>) =>
  normalizeField<number>(p, 'y', 'Y', 'posY', 'pos_y', 'position_y');

/** Zone name */
export const normalizeZone = (p: Record<string, unknown>) =>
  normalizeField<string>(p, 'zone', 'Zone', 'zoneName', 'zone_name', 'currentZone', 'mapName', 'map');

/** Player experience points */
export const normalizeExp = (p: Record<string, unknown>) =>
  normalizeField<number>(p, 'exp', 'Exp', 'xp', 'Xp', 'experience', 'totalXp', 'total_xp', 'earnedExp');

/** Player level */
export const normalizeLevel = (p: Record<string, unknown>) =>
  normalizeField<number>(p, 'level', 'Level', 'playerLevel', 'player_level', 'lvl');

/** Entity/mob name */
export const normalizeName = (p: Record<string, unknown>) =>
  normalizeField<string>(p, 'name', 'Name', 'entityName', 'entity_name', 'mobName', 'npcName', 'displayName');

/** Entity HP */
export const normalizeEntityHp = (p: Record<string, unknown>) =>
  normalizeField<number>(p, 'hp', 'Hp', 'health', 'Health', 'currentHp', 'currentHealth');

/** Entity Max HP */
export const normalizeEntityMaxHp = (p: Record<string, unknown>) =>
  normalizeField<number>(p, 'maxHp', 'MaxHp', 'maxHealth', 'MaxHealth', 'max_hp');

/** Drop / item quantity */
export const normalizeQuantity = (p: Record<string, unknown>) =>
  normalizeField<number>(p, 'quantity', 'qty', 'amount', 'count', 'stackSize', 'stack_size');

/** Rune count */
export const normalizeRunes = (p: Record<string, unknown>) =>
  normalizeField<number>(p, 'currentRunes', 'runes', 'runestones', 'runeCount', 'rune_count');
