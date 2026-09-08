# ROEDEX Architecture & System Overview

Welcome to the technical architecture guide for ROEDEX, a real-time tracking overlay and web application for Roots of Embervault.


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
│     interceptor.ts      │ (Injected Script)
└────────────┬────────────┘
             │ MessagePort (Zero-latency Transferable)
             ▼
┌─────────────────────────┐
│     parser.worker.ts    │ (Web Worker Thread)
└────────────┬────────────┘
             │ Dispatches parsed EventPayload
             ▼
┌─────────────────────────┐
│      eventRouter.ts     │ (Main Thread Dispatcher)
└────────────┬────────────┘
             │ Invokes Handlers
             ├──> zoneHandler.ts
             ├──> inventoryHandler.ts
             ├──> statsHandler.ts
             └──> marketHandler.ts
             │
             ▼
┌─────────────────────────┐
│  Zustand Global Store   │ (Sliced State Architecture)
└────────────┬────────────┘
             │ Selector Hooks (useTrackerSelector, useSettingsSelector)
             ▼
┌─────────────────────────┐
│      React Overlay      │ (Glassmorphic UI Views & Widgets)
└─────────────────────────┘
```

---

## 2. Store Architecture (Sliced Zustand)

State is organized into domain-specific slices that compose `trackerStore` and `settingsStore`:

| Slice Name | Responsibilities | Key Actions / State |
|---|---|---|
| `uiSlice.ts` | Modal states, active tab, scale, theme, companion overlay | `setIsMinimized`, `setTheme`, `setIsMarketplaceOpen`, `setIsQuickStatsOpen` |
| `playerSlice.ts` | Player stats, position, zone, lifetime records | `setPlayerProfile`, `addExploredPoint`, `incrementLifetimeStat` |
| `routeRecorderSlice.ts` | Map routes, static barrier walls, portals | `loadStaticBarriers`, `saveRoute`, `startRecording` |
| `marketDatabaseSlice.ts` | IndexedDB historical market snapshots & 7d/30d trends | `upsertDaySnapshot`, `getMarketAnalysis`, `pruneOldSnapshots` |
| `sessionSlice.ts` | Current run statistics, loot logs, per-hour efficiency | `addSessionLoot`, `addSessionRuneDrop`, `endSession` |

---

## 3. Directory Layout

```
src/
├── components/         # React Components
│   ├── layout/         # Header, Navigation
│   ├── map/            # Canvas & Leaflet Map Engines
│   ├── overlay/        # HUD Layers, Companion Overlays, Floating Widgets
│   ├── ui/             # Modals, Tooltips, Custom Selects, Hover Cards
│   ├── views/          # Main Views (Global, Session, Chest, Marketplace, NPCs, Settings)
│   └── widgets/        # WeaponUI, ArmorUI, EfficiencyHUD, QuickStatsDrawer
├── core/               # Non-React Engine Logic
│   ├── companion/      # AI Persona (Bob) dialogue & roast logic
│   ├── map/            # Pathfinding & static spawn loaders
│   ├── notifications/  # Sound & Toast notification manager
│   ├── parser/         # Web Worker parser & event handlers
│   ├── trackers/       # Specialized trackers (Loot, Respawn)
│   └── websocket/      # Interceptor connection & MessageChannel logic
├── data/               # Static Databases & Lookups
│   ├── gameDatabase.ts # Mob/resource HP, drops, cooldowns (O(1) DB_LOOKUP)
│   ├── prices.ts       # Base item floor values
│   └── companions.ts   # Companion personalities & theme configs
├── i18n/               # Internationalization
│   └── translations.ts # Full en/es/ru/ko dictionary
├── store/              # Zustand Stores & Selector Hooks
│   ├── hooks/          # Granular selector hooks for zero re-render overhead
│   └── slices/         # Sliced state domain modules
└── utils/              # Utility Functions
    ├── formatters.ts   # Formatting numbers, durations, and rarity CSS variables
    └── rarity.ts       # Rarity colors & weight logic
```

---

## 4. Contributing a New Event Handler

To add support for a new game event or packet payload:

1. **Define the Event Type**: Add the payload interface in `src/types/events.ts`.
2. **Implement Parser Logic**: Add payload extraction inside `src/core/parser/parserWorker.ts`.
3. **Register Handler**: Create or update a handler file under `src/core/parser/handlers/` and register it in `eventRouter.ts`.
4. **Update Zustand State**: Call state updates using `useTrackerStore.getState()` inside your handler.
5. **Write Vitest Test**: Create a corresponding `.test.ts` file in `src/core/parser/__tests__/`.
