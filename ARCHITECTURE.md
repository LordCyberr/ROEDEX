# ROEDEX Architecture & System Overview

Welcome to the technical architecture guide for ROEDEX, a real-time tracking overlay and web application for Roots of Embervault.

**Version:** 0.0.5+ · **Last Updated:** September 2026

---

## 1. High-Level Data Pipeline

ROEDEX relies on a zero-latency WebSocket interceptor architecture to process raw game packets off the main UI thread.

```
┌─────────────────────────┐
│     Game Client WS      │
└────────────┬────────────┘
             │ (WebSockets / Interceptor)
             ▼
┌─────────────────────────┐
│     interceptor.ts      │ (Injected Script — world_isolated context)
└────────────┬────────────┘
             │ MessagePort (Zero-latency Transferable, no clone overhead)
             ▼
┌─────────────────────────┐
│   parser.worker.ts      │ (Dedicated Web Worker Thread)
│   + PathfinderService   │ (A* pathfinding also runs off-thread)
└────────────┬────────────┘
             │ Dispatches parsed EventPayload via postMessage
             ▼
┌─────────────────────────┐
│     eventRouter.ts      │ (Main Thread — routes to domain handlers)
└────────────┬────────────┘
             │ Invokes Handlers
             ├──> zoneHandler.ts       (Zone transitions, entity cleanup)
             ├──> inventoryHandler.ts  (Loot, chest items, rune drops)
             ├──> statsHandler.ts      (Player XP, health, combat stats)
             ├──> rosterHandler.ts     (Players in zone, NPC tracking)
             └──> marketHandler.ts     (Marketplace listings, bazaar data)
             │
             ▼
┌─────────────────────────┐
│   RafScheduler.ts       │ (Batches all per-frame overlay updates into
│                         │  a single requestAnimationFrame loop → 60fps)
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Zustand Global Store   │ (Sliced State Architecture)
│  trackerStore.ts        │ ← game entities, timers, player, sessions
│  settingsStore.ts       │ ← UI settings, positions, notifications
└────────────┬────────────┘
             │ Selector Hooks (useTrackerSelector, useSettingsSelector, useShallow)
             ▼
┌─────────────────────────┐
│      React Overlay      │ (Glassmorphic UI Views & Widgets)
└─────────────────────────┘
```

---

## 2. Store Architecture (Sliced Zustand)

State is organized into domain-specific slices that compose `trackerStore` and `settingsStore`:

### trackerStore.ts Slices

| Slice Name | Responsibilities | Key Actions / State |
|---|---|---|
| `entitySlice.ts` | Live mobs, resources, NPC entities in zone | `upsertEntity`, `removeEntity`, `setTimers` |
| `playerSlice.ts` | Player stats, position, zone, lifetime records | `setPlayerProfile`, `addExploredPoint`, `incrementLifetimeStat` |
| `routeRecorderSlice.ts` | Map routes, static barrier walls, portals | `loadStaticBarriers`, `saveRoute`, `startRecording` |
| `marketDatabaseSlice.ts` | IndexedDB historical market snapshots & 7d/30d trends | `upsertDaySnapshot`, `getMarketAnalysis`, `pruneOldSnapshots` |
| `sessionSlice.ts` | Current run statistics, loot logs, per-hour efficiency | `addSessionLoot`, `addSessionRuneDrop`, `endSession` |
| `mapSlice.ts` | Trail data, zone map metadata, path recordings | `setTrails`, `setActiveZoneMap`, `saveRoute` |

### settingsStore.ts Slices

| Slice Name | Responsibilities |
|---|---|
| `uiSlice.ts` | Modal states, active tab, scale, theme, companion overlay, `WhatsNew` banner version tracking |
| `notificationSlice.ts` | Toast notification queue and display settings |
| `overlaySlice.ts` | Weapon/Armor HUD positions, opacity, visibility flags |

---

## 3. Key v0.0.5 Systems

### RafScheduler (`src/core/scheduler/RafScheduler.ts`)
Batches all per-frame overlay state updates into a single `requestAnimationFrame` loop. Prevents multiple components from each calling `setState` independently, which would stagger renders across frames.

### PathfinderService + pathfinder.worker.ts
A* pathfinding runs on a dedicated Web Worker via `PathfinderService.ts`. The main thread posts start/end coordinates; the worker returns the computed path. Zero main-thread blocking.

### staticSpawnIndex.ts
Pre-computes a spatial hash index of static spawn locations per zone. O(1) zone-area lookups rather than linear scans across the full spawn list.

### gameDatabase.ts (O(1) DB_LOOKUP)
Centralised entity registry. All mob/resource names, HPs, drop tables, and cooldowns are stored with suffix-normalised keys for O(1) lookup. **Critical Rule:** Entity names displayed in any overlay MUST be resolved through `DB_LOOKUP` — never render raw server strings. See `REGRESSION_LOG.md` BUG-03 class.

### AAAMapEngine.ts (Canvas Map Renderer)
Hardware-accelerated canvas renderer with pre-baked offscreen canvases for scanlines, gradients, and the discovery beam. All expensive operations are cached per-resize. The main `drawFrame()` method runs inside `RafScheduler` at 60fps.

---

## 4. Directory Layout

```
src/
├── App.tsx                 # Root component — hotkey bindings, store hydration
├── components/             # React Components
│   ├── layout/             # Header, Navigation
│   ├── map/                # AAAMapEngine canvas renderer, AAAMinimap, MinimapSettingsPanel
│   ├── overlay/            # HUD Layers, BootSequence, WhatsNewBanner, PoppedOutWindowComponent
│   ├── ui/                 # Modals, Tooltips, AnimationKit, ChangelogModal, GlobalSearchModal
│   ├── views/              # Main Views (Global, Session, Chest, Marketplace, NPCs, Settings)
│   └── widgets/            # WeaponUI, ArmorUI, CompanionOverlay, DebugPanel, QuickStatsDrawer
├── core/                   # Non-React Engine Logic
│   ├── companion/          # AI Persona (Bob/Kaya/Lia/Crash) dialogue & roast logic (AICompanion.ts)
│   ├── map/                # AAAMapEngine.ts, PathfinderService.ts, staticSpawnIndex.ts
│   ├── notifications/      # Sound & Toast notification manager
│   ├── parser/             # parserWorker.ts (Web Worker), eventRouter.ts, handlers/
│   ├── scheduler/          # RafScheduler.ts — single requestAnimationFrame loop
│   ├── trackers/           # LootTracker.ts, MobTracker.ts, ResourceTracker.ts
│   └── websocket/          # interceptor.ts (content script), connection.ts (MessagePort)
├── data/                   # Static Databases & Lookups
│   ├── gameDatabase.ts     # O(1) DB_LOOKUP — entity registry (mobs, resources, drops, cooldowns)
│   ├── prices.ts           # Base item floor values
│   ├── changelog.ts        # CHANGELOG_DATA — drives the in-app WhatsNew modal
│   └── companions.ts       # Companion personalities & theme configs
├── i18n/                   # Internationalization
│   ├── translations.ts     # en / es / ko dictionary (ru falls back to en)
│   └── companionTranslations.ts  # Companion dialogue strings (en / es / ko / ru)
├── store/                  # Zustand Stores & Selector Hooks
│   ├── trackerStore.ts     # Main game-state store (composed from slices)
│   ├── settingsStore.ts    # UI & settings store (persisted to localStorage)
│   ├── hooks/              # Granular selector hooks for zero re-render overhead
│   ├── slices/             # Sliced state domain modules
│   └── storeTypes.ts       # Composite type for the full store shape
├── types/                  # TypeScript interfaces & event payload types
├── db/                     # IndexedDB wrapper (market snapshot storage)
└── utils/                  # Utility Functions
    ├── formatters.ts       # Format numbers, durations, rarity CSS vars
    └── rarity.ts           # Rarity colors & weight logic
```

---

## 5. Contributing a New Event Handler

To add support for a new game event or packet payload:

1. **Define the Event Type**: Add the payload interface in `src/types/events.ts`.
2. **Implement Parser Logic**: Add payload extraction inside `src/core/parser/parserWorker.ts`.
3. **Register Handler**: Create or update a handler file under `src/core/parser/handlers/` and register it in `eventRouter.ts`.
4. **Update Zustand State**: Call state updates using `useTrackerStore.getState()` inside your handler.
5. **Write Vitest Test**: Create a corresponding `.test.ts` file in `src/core/parser/__tests__/`.

---

## 6. Critical Rules (Read Before Modifying)

| Rule | Context |
|---|---|
| Import animations from `'motion/react'` | Never `'framer-motion'` |
| Never call `.getState()` inside JSX | Use selector hooks or refs |
| All overlay text must use `DB_LOOKUP` | Never raw server strings (BUG-03) |
| Check `REGRESSION_LOG.md` before touching high-risk files | Prevents re-introducing known bugs |
| `MapSettings` interface fields are `?` optional | Do not revert to required |

---

## 7. Performance Targets

| Metric | Target | Status |
|---|---|---|
| Main bundle size | < 900 KB | ✅ 630 KB |
| Views-heavy chunk | < 600 KB | ✅ 506 KB |
| TypeScript errors | 0 | ✅ 0 |
| Vitest tests | All pass | ✅ 54/54 |
| Main thread blocking | < 16ms/frame | ✅ RafScheduler |
