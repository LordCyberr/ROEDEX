// ─── useEntityGhosts — Dead Entity Ghost Cache ────────────────────────────────
// When the store calls removeEnemy/removeResource, entities vanish instantly.
// This hook watches for disappearing entities and keeps a ghost copy with
// isDead/gathered = true so the canvas can render them as grey for ~45 seconds.

import { useRef } from 'react';
import { EnemyEntity, ResourceNode } from '../types/events';

const GHOST_TTL_MS = 45_000; // Keep grey ghosts for 45 seconds

interface GhostEnemy    extends EnemyEntity    { _ghostDiedAt: number; }
interface GhostResource extends ResourceNode   { _ghostDiedAt: number; }

export function useEntityGhosts(
  enemies:   Record<string, EnemyEntity>,
  resources: Record<string, ResourceNode>
): {
  mergedEnemiesRef:   React.MutableRefObject<Record<string, EnemyEntity>>;
  mergedResourcesRef: React.MutableRefObject<Record<string, ResourceNode>>;
} {
  const ghostEnemies   = useRef<Record<string, GhostEnemy>>({});
  const ghostResources = useRef<Record<string, GhostResource>>({});
  const prevEnemies    = useRef<Record<string, EnemyEntity>>(enemies);
  const prevResources  = useRef<Record<string, ResourceNode>>(resources);
  
  const mergedEnemiesRef   = useRef<Record<string, EnemyEntity>>({ ...enemies });
  const mergedResourcesRef = useRef<Record<string, ResourceNode>>({ ...resources });

  // Update immediately during render to avoid 1-frame latency in RAF
  const now = Date.now();
  let ghostsMutated = false;

  // ── Detect vanished enemies ──────────────────────────────────────────────
  for (const [key, enemy] of Object.entries(prevEnemies.current)) {
    if (!enemies[key]) {
      ghostEnemies.current[key] = { ...enemy, isDead: true, hp: 0, _ghostDiedAt: now };
      ghostsMutated = true;
    }
  }

  // ── Detect vanished resources ────────────────────────────────────────────
  for (const [key, res] of Object.entries(prevResources.current)) {
    if (!resources[key]) {
      ghostResources.current[key] = { ...res, gathered: true, hp: 0, _ghostDiedAt: now };
      ghostsMutated = true;
    }
  }

  // ── Evict stale ghosts ───────────────────────────────────────────────────
  for (const key of Object.keys(ghostEnemies.current)) {
    if (now - ghostEnemies.current[key]._ghostDiedAt > GHOST_TTL_MS || enemies[key]) {
      delete ghostEnemies.current[key];
      ghostsMutated = true;
    }
  }
  for (const key of Object.keys(ghostResources.current)) {
    if (now - ghostResources.current[key]._ghostDiedAt > GHOST_TTL_MS || resources[key]) {
      delete ghostResources.current[key];
      ghostsMutated = true;
    }
  }

  // Only recreate the merged objects if something actually changed (enemies, resources, or ghosts)
  if (ghostsMutated || prevEnemies.current !== enemies) {
    mergedEnemiesRef.current = { ...ghostEnemies.current, ...enemies };
  }
  if (ghostsMutated || prevResources.current !== resources) {
    mergedResourcesRef.current = { ...ghostResources.current, ...resources };
  }

  prevEnemies.current   = enemies;
  prevResources.current = resources;

  return { mergedEnemiesRef, mergedResourcesRef };
}
