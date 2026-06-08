import { mobCooldowns } from './mobs';
import { treeCooldowns } from './trees';
import { plantCooldowns } from './plants';
import { oreCooldowns } from './ores';

const ALL_COOLDOWNS: Record<string, number> = {
  ...mobCooldowns,
  ...treeCooldowns,
  ...plantCooldowns,
  ...oreCooldowns,
};

/**
 * Returns the verified default cooldown (in seconds) for a given entity name.
 * Falls back to 300 seconds (5 minutes) if the name is not in the database.
 */
export function getFallbackCooldown(name: string): number {
  if (!name) return 300;
  
  // 1. Direct match
  if (ALL_COOLDOWNS[name] !== undefined) return ALL_COOLDOWNS[name];

  const sanitize = (str: string) => str.toLowerCase()
    .replace(/ai$/i, '')
    .replace(/node/i, '')
    .replace(/flower/i, '')
    .replace(/tree/i, '')
    .replace(/\(bush\)/i, '')
    .replace(/\(tree\)/i, '')
    .replace(/\(ore\)/i, '')
    .replace(/ore$/i, '')
    .replace(/rock$/i, '')
    .replace(/vein$/i, '')
    .replace(/\s+/g, '');

  const sanitizedName = sanitize(name);
  
  // 2. Case and space insensitive match
  for (const key in ALL_COOLDOWNS) {
    if (sanitize(key) === sanitizedName) {
      return ALL_COOLDOWNS[key];
    }
  }
  
  // 3. Partial substring match fallbacks (e.g. any slime, any wolf)
  if (sanitizedName.includes('slime')) return 1800; // 30m
  if (sanitizedName.includes('wolf')) return 3600; // 60m
  if (sanitizedName.includes('golem') || sanitizedName.includes('elemental') || sanitizedName.includes('troll')) return 5400; // 90m
  if (sanitizedName.includes('spider') || sanitizedName.includes('crawler')) return 1800; // 30m
  
  return 300; // Default fallback: 5 minutes
}
