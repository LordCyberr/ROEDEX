// Central re-export barrel — import from here instead of storeTypes.ts
export type { UISlice, PoppedOutWindow, Language, NpcDialogueData } from './UISlice.types';
export type { MarketSlice, MarketListing, MarketSale, MarketShopPrice } from './MarketSlice.types';
export type { SessionSlice } from './SessionSlice.types';
export type {
  PlayerSlice,
  CustomMarker,
  OnlinePlayer,
  ArmorSlot,
  ArmorItem,
  Quest,
  QuestIngredient,
  QuestStep,
} from './PlayerSlice.types';
export type { EntitySlice } from './EntitySlice.types';
export type {
  ErrorLogSlice,
  ErrorLog,
} from './RouteAndErrorSlice.types';

import type { SessionSlice } from './SessionSlice.types';
import type { PlayerSlice } from './PlayerSlice.types';
import type { EntitySlice } from './EntitySlice.types';
import type { ErrorLogSlice } from './RouteAndErrorSlice.types';
import type { MapSlice } from './MapSlice.types';
import type { MarketSlice } from './MarketSlice.types';

export type TrackerState = SessionSlice & PlayerSlice & EntitySlice & ErrorLogSlice & MapSlice & MarketSlice;
export * from './MapSlice.types';
