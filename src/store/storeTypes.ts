/**
 * storeTypes.ts — LEGACY SHIM (v0.0.5)
 *
 * This file now re-exports from the split domain-type files in store/types/.
 * Do NOT add new types here — add them to the appropriate domain file.
 *
 * Domain files:
 *   UISlice.types.ts          — UI state, notifications, settings
 *   SessionSlice.types.ts     — Session tracking, loot, run history
 *   PlayerSlice.types.ts      — Player position, quests, armor, lifetime stats
 *   EntitySlice.types.ts      — Enemies, resources, loot drops, timers
 *   RouteAndErrorSlice.types.ts — Route recording, error logs
 *   index.ts                  — TrackerState union + barrel re-exports
 */
export type {
  UISlice,
  PoppedOutWindow,
  Language,
  NpcDialogueData,
  SessionSlice,
  PlayerSlice,
  CustomMarker,
  OnlinePlayer,
  ArmorSlot,
  ArmorItem,
  Quest,
  QuestIngredient,
  QuestStep,
  EntitySlice,
  ErrorLogSlice,
  ErrorLog,

  TrackerState,
} from './types/index';
