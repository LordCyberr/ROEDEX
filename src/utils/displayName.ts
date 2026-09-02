import { DB_LOOKUP, DROP_LOOKUP } from '../data/gameDatabase';
import { formatInternalName } from './formatters';

/**
 * Sanitizes a raw string into a DB_LOOKUP key.
 * Mirrors the key-building logic in gameDatabase.ts.
 */
function sanitizeKey(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * getDisplayName — SINGLE SOURCE OF TRUTH for rendering entity names on the overlay.
 *
 * Resolution order:
 * 1. Strip known game server suffixes (' ai', ' clone', 'node', 'flower', 'tree')
 * 2. Look up in DB_LOOKUP for the canonical sanitizedName (DB_LOOKUP pre-bakes all variant keys)
 * 3. Fall back to formatInternalName() for unknown entities only
 *
 * ALWAYS use this function in JSX — never render .type, .resource, or .rawName directly.
 *
 * @param raw - The raw entity string from the game server (e.g. 'ForestSlime ai', 'silverorenode')
 * @returns Human-readable display name (e.g. 'Slime', 'Silver Ore')
 */
export function getDisplayName(raw: string): string {
  if (!raw) return 'Unknown';

  // Try direct lookup first (DB_LOOKUP pre-bakes stripped keys)
  const directKey = sanitizeKey(raw);
  if (DROP_LOOKUP[directKey]) {
    return DROP_LOOKUP[directKey].sanitizedName;
  }
  if (DB_LOOKUP[directKey]) {
    return DB_LOOKUP[directKey].sanitizedName;
  }

  // Strip known server-appended suffixes and retry
  const normalized = raw
    .replace(/\s+(ai|clone)\s*$/i, '')
    .replace(/(node|tree|flower|vine|plant|leafy)$/i, '')
    .trim();

  const normalizedKey = sanitizeKey(normalized);
  if (DROP_LOOKUP[normalizedKey]) {
    return DROP_LOOKUP[normalizedKey].sanitizedName;
  }
  if (DB_LOOKUP[normalizedKey]) {
    return DB_LOOKUP[normalizedKey].sanitizedName;
  }

  return formatInternalName(normalized);
}

/**
 * getDisplayNameFromDbKey — for Zustand store keys (e.g. DB_LOOKUP keys from aggregation).
 * Resolves a pre-sanitized key directly against the database.
 *
 * Use when iterating over `store.enemies` or `store.resources` record keys
 * that were already built by gameDatabase.ts logic.
 */
export function getDisplayNameFromDbKey(dbKey: string): string {
  return DROP_LOOKUP[dbKey]?.sanitizedName ?? DB_LOOKUP[dbKey]?.sanitizedName ?? formatInternalName(dbKey);
}
