# ROEDEX Regression Log

This file tracks all resolved bugs, their root causes, and the files modified, ensuring that future updates do not break previously fixed features.

## Architectural Guidelines & Prevention Rules
- Check resolved incidents before refactoring core stores or parser pipelines.
- Modern animation stack standardized on `motion/react` (Motion v11) — avoid legacy `framer-motion` imports.
- MapSettings interface fields are optional (`?`) by design to support gradual state hydration.

## Log Entries

### 2026-08-07: BUG-06 — mapSettings Missing Defaults (CRITICAL)
- **Symptom:** Minimap silently crashes on opacity, showCompass, showGrid, etc. — all return `undefined`.
- **Root Cause:** `uiSlice.ts` default `mapSettings` only had 7 fields. `Minimap.tsx` reads ~20+ fields from the same object.
- **Fix:** Added all missing fields to `mapSettings` default in `uiSlice.ts`. Added corresponding fields to `MapSlice.types.ts` as optional.
- **Files:** `src/store/slices/uiSlice.ts`, `src/store/types/MapSlice.types.ts`
- **Rule:** Any new field read by `Minimap.tsx` MUST be added to BOTH the type AND the default state simultaneously.

### 2026-08-07: BUG-01 — HoverTooltip stale data via getState()
- **Symptom:** Hover tooltip showed wrong respawn timer data, never updating after first render.
- **Root Cause:** `useTrackerStore.getState().timers[hoveredEntity.id]` called inside JSX render — bypasses React reactivity.
- **Fix:** Added `liveTimers` state to Minimap parent, synced via `setLiveTimers(state.timers)` inside the existing store subscription. HoverTooltip now receives `timers` as a prop.
- **Files:** `src/components/map/Minimap.tsx`
- **Rule:** NEVER call `.getState()` inside JSX render. Use selectors or props.

### 2026-08-07: BUG-02 — DebugPanel packetCounts stale via getState()
- **Symptom:** Packet breakdown in Debug Panel always showed 0 / initial values.
- **Root Cause:** `Object.entries(useTrackerStore.getState().packetCounts || {})` in JSX body.
- **Fix:** Added `packetCounts` to the `useShallow` selector in `DebugPanel.tsx`.
- **Files:** `src/components/widgets/DebugPanel.tsx`
- **Rule:** NEVER call `.getState()` in JSX body. All store reads must go through selectors.

### 2026-08-07: BUG-03 — alert() in clipboard handler
- **Symptom:** `alert()` blocks the Chrome extension UI when copying debug logs.
- **Fix:** Replaced `alert()` with `useSettingsStore.getState().addNotification({ type: 'success', ... })`.
- **Files:** `src/components/widgets/DebugPanel.tsx`
- **Rule:** NEVER use `alert()`, `confirm()`, or `prompt()` in the extension context. Always use the `addNotification` action.

### 2026-08-07: BUG-07 — syncState stale viewZone closure
- **Symptom:** After switching to a different zone in the minimap viewer, the subscription callback still rendered entities from the previous zone.
- **Root Cause:** `syncState` captured `viewZone` at subscription time via closure — never updates when `viewZone` changes.
- **Fix:** Added `viewZoneRef` that's always kept current via `useEffect`. `syncState` reads from `viewZoneRef.current`.
- **Files:** `src/components/map/Minimap.tsx`
- **Rule:** Any useTrackerStore.subscribe callback that uses component state MUST read from a ref, not the closed-over value.

### 2026-08-07: Migrated framer-motion → motion/react (ALL FILES)
- **Symptom:** The installed package is `motion` (not `framer-motion`). The vite manualChunks had the wrong name `vendor-framer-motion`.
- **Fix:** Replaced all 40 `from 'framer-motion'` imports with `from 'motion/react'`. Removed `vendor-react` and `vendor-motion` empty chunk definitions from `vite.config.ts` (Chrome extensions cannot lazy-load split chunks).
- **Files:** 40 .tsx/.ts files; `vite.config.ts`
- **Rule:** Import from `'motion/react'` ALWAYS. Never `'framer-motion'`.

### 2026-08-07: New Feature — Minimap Settings Panel
- **Summary:** Added `MinimapSettingsPanel.tsx` — full-featured settings drawer with Display, Layers, Overlays, and Advanced sections.
- **New fields consumed:** `opacity`, `showCompass`, `showGrid`, `showScaleBar`, `showCoordinates`, `showMobs`, `showDrops`, `showPortals`, `recordPaths`
- **New overlays:** Compass rose (SVG), Scale bar, PNG export button
- **Files:** `src/components/map/MinimapSettingsPanel.tsx`, `src/components/map/Minimap.tsx`

### 2026-08-07: New Feature — Debug Panel v2 (Full Rewrite)
- **Summary:** Rebuilt `DebugPanel.tsx` from scratch as a 5-tab developer IDE.
- **Tabs:** SYSTEM (FPS/RAM/Parse charts), NETWORK (packet breakdown), STORE (game state), LOGS (error stream + bug report builder), MAP (engine diagnostics)
- **Dependencies:** Uses `recharts` (AreaChart) for performance graphs.
- **Files:** `src/components/widgets/DebugPanel.tsx`

### 2026-08-07: New Feature — AnimationKit.tsx & UI Polish
- **Summary:** Created shared animation component library and implemented spring physics across overlays.
- **Components:** `AnimatedCounter` (spring number tick), `RarityGlowBadge` (pulsing glow), `StaggerList`, `FadeSlide`, `PulseOnChange`.
- **Implementations:** Added spring physics to `PoppedOutWindowComponent.tsx` (drag constraints bounce) and `CategoryList.tsx` (staggered entrance animations for entity rows).
- **Files:** `src/components/ui/AnimationKit.tsx`, `src/components/overlay/PoppedOutWindowComponent.tsx`, `src/components/ui/table/CategoryList.tsx`

### 2026-08-07: Phase D — Bundle Audit
- **Summary:** Completed full bundle audit post UI upgrade.
- **Result:** `main.tsx.js` sits at 630.79 KB (below 900 KB limit). `views-heavy` isolated perfectly to 506.04 KB. `vendor-charts` isolated for `recharts`. Total build time: ~9.6s. ZERO TypeScript errors.

### 2026-06-15: Tutorial Auto-Advance & Dummy Target Fix
- **Symptom:** The tutorial skipped the mock dummy data step instantly without user input, and the mock data used an unrealistic placeholder.
- **Root Cause:** The dummy step had `actionRequired: true` linked directly to a hover event, which triggered an immediate `handleNext()` via the interval checker.
- **Fix:** Removed `actionRequired`, replaced the dummy flower with a Corrupted Goblin, and introduced an `actionCompleted` state combined with `animate-ring-zoom-in` beacon rings to highlight the "Next" button.

### 2026-06-15: Weapon UI Vertical Layout Overflow
- **Symptom:** When setting the Weapon UI to Vertical layout with Percentage, the percentage numbers overflowed horizontally out of the vertical gauge box.
- **Root Cause:** The flex container squished the horizontal text, but the text styling did not wrap or rotate natively.
- **Fix:** Implemented `writing-mode: vertical-rl` and `transform: rotate(180deg)` explicitly when the vertical bar layout is active.

### 2026-06-15: Repeating Tutorial Bug
- **Symptom:** Tutorial kept repeating upon fast reload, ignoring skips.
- **Root Cause:** IndexedDB successfully opened but returned null if saved to localStorage during a debounce window. Zustand did not fall back to localStorage on null.
- **Fix:** Updated `trackerStore.ts` `getItem` to check `localStorage` if IndexedDB `request.result` resolves to null.

### 2026-06-15: Master Lock Layout Bug
- **Symptom:** Master Lock button appeared out of order or was confusing to find in the vertical layout.
- **Root Cause:** Flex/Grid auto-flow was misplacing items when `poppedOutWindows` conditions changed.
- **Fix:** Hardcoded explicit `col-start-*` and `row-start-*` Tailwind classes in `Header.tsx` to enforce a strict 3x2 grid.
### 2026-06-15: Vertical Auto-Expand Bug & Minimize Button Location
- **Symptom:** In vertical view, resizing the width explicitly locked the height, preventing auto-expand. Also, the minimize button wasn't floating at the top-right anymore.
- **Root Cause:** `OverlayContainer.tsx` stored and applied `currentHeight` even in vertical mode, overriding `h-fit`. Minimize button was moved into the Utilities Grid inside `Header.tsx`.
- **Fix:** Prevented `currentHeight` and `onMove` from applying explicit height in vertical mode (`OverlayContainer.tsx`). Moved `Minimize` button back to `absolute top-1 right-1.5` inside `Header.tsx` and added `pr-8` to the flex layout so buttons don't collide.
### 2026-06-15: Export Store Data & Profiler Metrics
- **Feature added:** Added the `EXPORT STORE DATA` button to `DebugPanel.tsx` and added React Profiler metrics to diagnose lag, FPS drops, and RAM utilization.
- **Engineering Standard:** Ensure the Export button remains available in Developer Mode at all times.
### 2026-06-15: Weapon & Armor UI Lock Sync
- **Symptom:** The Lock Position toggle in settings did not actually disable dragging for the Weapon Overlay, and drag borders persisted.
- **Root Cause:** WeaponUI and ArmorUI ignored their specific locked setting from the store, and only checked the Master UI lock. Framer Motion constraints were also not being fully disabled.
- **Files Modified:** src/components/widgets/WeaponUI.tsx, src/components/widgets/ArmorUI.tsx
### 2026-06-15: Infinite Memory Leak in Zustand Store
- **Symptom:** The extension RAM usage swelled over time, causing massive FPS drops and lag. The Debug Panel showed hundreds of enemies and resources persisting in memory.
- **Root Cause:** MobTracker and ResourceTracker flagged entities as dead or gathered, but never removed them from the store arrays. Since TrackingView iterates over the entire object on every position update, the rendering load grew exponentially.
- **Files Modified:** src/core/trackers/MobTracker.ts, src/core/trackers/ResourceTracker.ts
### 2026-06-15: Tiny Icons in Vertical Layout
- **Symptom:** Icons in the header appeared as 2px specks when switching to Vertical mode.
- **Root Cause:** Added flexbox shrinking classes (flex-1 min-w-0 and w-full) during a previous layout fix, which squashed the SVG grids down to a few pixels wide.
- **Files Modified:** src/components/layout/Header.tsx
### 2026-06-15: Lost Timers on Refresh
- **Symptom:** Respawn timers and recent tracking data disappeared after refreshing the extension.
- **Root Cause:** IndexedDB debounces saves every 5 seconds. The \ eforeunload\ event fired an emergency save to \localStorage\, but \	rackerStore.ts\ was hardcoded to only check \localStorage\ if IndexedDB was completely empty, causing it to load outdated data from IndexedDB instead of the fresh emergency data.
- **Files Modified:** src/store/trackerStore.ts

### 2026-06-16: Changelog Tutorial Loop & Modal State
- **Symptom:** Users became stuck in an infinite tutorial loop because the "Next" button became unclickable when closing the changelog modal (state dependency conflict). Also, the tutorial target didn't exist if the settings accordion was closed.
- **Root Cause:** Tutorial Step 11 depended directly on `isChangelogOpen`. If closed, the step was never fulfilled, but the text prompt didn't adapt.
- **Fix:** Separated the single step into three discrete `tutorial-about-accordion`, `tutorial-changelog-btn`, and `tutorial-close-changelog` steps to explicitly guide the user through the component lifecycle.

### 2026-06-16: Tutorial Skip/Restart Buttons Opacity
- **Symptom:** Skip Tutorial and Restart Intro buttons were partially transparent (`bg-red-500/20`), making them hard to read.
- **Fix:** Removed `/20` opacity tags from tailwind classes to enforce 100% solidity for high visibility.

### 2026-06-16: Tutorial Respawn Tooltip Fix
- **Symptom:** The tutorial step to show the "respawn queue" tooltip failed if the targeted data row had no active timers.
- **Fix:** Passed `tutorialStep` to the `DataRow` component to forcefully render a `TimerDisplay` dummy element when the tutorial reaches the timer step, guaranteeing the tooltip works.

### 2026-06-16: Companion Text Size & Holographic Theme Disconnect
- **Symptom:** The 'Companion Text Size' slider did nothing. The Holographic chat bubble theme ignored the currently selected AI companion's theme color (staying cyan even for the red companion).
- **Root Cause:** Text scale property `bobTextScale` was completely missing from the rendered UI component. The holographic theme used hardcoded `bg-cyan-900` and `#22d3ee` hex codes.
- **Fix:** Applied `fontSize: calc(13px * ${bobTextScale})` explicitly. Rewrote the Holographic theme logic to dynamically inherit the `currentOrbColor` state variable, appending an alpha hex code (`25`) for the glowing background.

### 2026-06-16: Default UI Position Migrations
- **Symptom:** The UI Overlay, Minimized Orb, and AI Companion spawned in suboptimal default screen locations, sometimes overlapping center-screen gameplay elements.
- **Fix:** Updated `uiSlice.ts` to set new default spawn coordinates: Overlay (`top-left`, offset), Minimized Orb (`top-left`, under health bar), AI Companion (`top-right`, near minimap). Added `v10PositionsMigrated` flag to `trackerStore.ts` merge function to force-migrate existing users to these improved layouts.

### 2026-06-16: Auto-Advance & Action Required Text Clarification
- **Symptom:** Users would get stuck in the changelog tutorial step because they closed the modal without explicitly clicking "Next" on the companion bubble, leading to a broken loop. Furthermore, the dialogue text didn't explicitly instruct the user on where to click.
- **Root Cause:** Steps requiring action waited for the action to be completed to *reveal* the Next button, but did not auto-advance, causing the UI to desync if the user closed the modal early.
- **Fix:** Introduced `autoAdvance: true` to the `TutorialStep` interface. Whenever a step's `checkCompletion` returns true, it now seamlessly auto-advances. Added explicit "Click NEXT" or "Click X" text to every dialogue step.

### 2026-06-16: Bob Position Polish & Premium Toasts Restored
- **Symptom:** Bob overlapped the top-right in-game settings buttons (`y: 30`). The premium "ROEDEX INITIALIZING" and "SYSTEM ONLINE" toasts went missing after a recent refactor, and when they did appear, they wrapped text awkwardly, fired prematurely before the player actually logged in, and didn't match the dynamic ROEDEX glassmorphism theme.
- **Fix:** Shifted default `bobPosition.y` to 120 and added `v11PositionsMigrated`. Moved the boot sequence toasts from the raw websocket connection (`connection.ts`) into `NotificationManager.greetUser`, which fires precisely when the game sends the first `username` packet. The sequence now fires `INITIALIZING SYSTEM`, waits 5 seconds, and then fires `CONNECTION ESTABLISHED` along with the user's name (`Welcome, {username}!`). Fixed `NotificationToaster.tsx` by setting `minWidth`, `width: 'auto'`, and `whitespace-nowrap` to ensure premium toasts elegantly stretch to fit their text in a single centered line. Replaced hardcoded black backgrounds with `bg-[var(--bg-panel)]` and dynamic `${toastShape}` to perfectly inherit the active ROEDEX UI theme.

### 2026-06-16: Developer Override Hotkey
- **Feature:** Added a developer-exclusive hotkey (`Ctrl+Shift+C`) to bypass connection requirements and instantly spawn the overlay UI + tutorial from anywhere, including the login screen.
- **Implementation:** Added `devForceOverlay` to `uiSlice.ts` and intercepted the keybind in `App.tsx` to force `connected = true` and `tutorialStep = 1`. Updated `OverlayContainer.tsx` to instantly bypass the 10-second loading delay and zone check if `devForceOverlay` is active.

### 2026-06-16: Fix CompanionGuideOverlay Crash on Dev Bypass
- **Symptom:** Pressing `Ctrl+Shift+C` to trigger the developer override caused the Chrome extension to crash with `TypeError: Cannot read properties of undefined (reading 'actionRequired')`.
- **Root Cause:** Bypassing the tutorial by setting `tutorialStep = -1` caused an out-of-bounds array access in `CompanionGuideOverlay.tsx`, which strictly checked `tutorialStep === 0` instead of `tutorialStep <= 0` before trying to read `steps[tutorialStep - 1]`.
- **Fix:** Changed all instances of `tutorialStep === 0` to `tutorialStep <= 0` in `CompanionGuideOverlay.tsx` to safely handle negative values used for complete bypass states.

### 2026-06-22: Boot Screen Layout & Companion Names
- **Symptom:** AI companion names showed translation keys instead of actual names, and the language screen was accidentally removed.
- **Root Cause:** Misunderstanding of layout requirements led to removing the hasSelectedLanguage flow.
- **Fix:** Restored BootSequence.tsx to its original state. Applied translations specifically to companion labels. Ensure the hasSelectedLanguage state is NEVER removed.

### 2026-06-22: Rarity Colors Overlay Inversion
- **Symptom:** Rarity colors were inverted.
- **Fix:** Explicitly mapped getRarityColor: Common=Grey, Uncommon=Blue, Rare=Green, Mythic=Purple.
- **Design Standard:** Rarity color hex values are calibrated to match the official in-game item palette.

### 2026-06-24: The Asynchronous Wipe Reload
- **Symptom:** The "DRAG ME" notification gets stuck on screen after clearing data, and the boot sequence breaks.
- **Root Cause:** Calling `location.reload()` immediately after `indexedDB.deleteDatabase()` cancelled the asynchronous wipe.
- **Fix:** Wait for the database wipe request's `onsuccess` callback before reloading the page. Added a "Factory Reset" button to `DebugPanel.tsx`.
- **Files to Watch:** `src/components/widgets/DebugPanel.tsx`

### 2026-06-24: Zod WebSocket Array Too Small Error
- **Symptom:** Legitimate game packets without payloads (like simple ping events) were dropped, breaking UI updates.
- **Root Cause:** The `WebSocketEventSchema` in `parser/index.ts` strictly mandated an array of exactly 2 elements (`[eventName, payload]`). Single-element arrays (`[eventName]`) failed validation.
- **Fix:** Relaxed the Zod schema to `z.tuple([z.string()]).rest(z.any())` to allow 1-element arrays.
- **Files to Watch:** `src/core/parser/index.ts`

### 2026-06-24: Welcome Screen Username Hijacking
- **Symptom:** The extension welcomed a completely random user instead of the player immediately after a factory reset.
- **Root Cause:** `playerHandler.ts` was capturing the global server broadcast `user_online` (which fires when *any* user logs in) and incorrectly assigning it to `sessionPlayerName`.
- **Fix:** Removed `sessionPlayerName` assignment from the `user_online` switch case. Now only `stats` and `player_state` packets are used to determine the local player name.
- **Files to Watch:** `src/core/parser/handlers/playerHandler.ts`

### 2026-06-25: Lifetime Stats Persistence and Tooltip Localization
- **Symptom:** The Lifetime Stats window was completely empty ("0" for all data), making the user think it was broken. Hovering over tabs in the Header showed English text regardless of the selected language. 
- **Root Cause 1 (Lifetime Stats):** In `src/store/trackerStore.ts`, the `lifetimeStats` slice was omitted from the `partialize` function array, meaning its data was completely lost whenever the extension reloaded or the tab was closed.
- **Fix 1:** Added `lifetimeStats: state.lifetimeStats` to the `partialize` whitelist in `trackerStore.ts` so IndexedDB actually saves lifetime metrics.
- **Root Cause 2 (Tooltips):** The tab hover messages in `Header.tsx` (like "This is the Global Tab") were completely hardcoded strings, completely bypassing the `t()` translation function. The `CATEGORIES.RESPAWNS` tooltip was also missing from `translations.ts` in all languages.
- **Fix 2:** Added a new `tabHover` object and `categories.respawns` to all four languages in `translations.ts`. Updated `Header.tsx` to correctly pass these keys through the `t()` function.
- **Files to Watch:** `src/store/trackerStore.ts`, `src/components/layout/Header.tsx`, `src/i18n/translations.ts`
### 2026-06-25: Localization Bugs in Boot Sequence and AI Greetings
- **Symptom:** When a user selected a language (like Korean) on the boot screen, the initial boot toast notification and AI Companion greeting still appeared in English, or wrapped Korean quotes with hardcoded English text (e.g., "Hey Username! [Korean string]").
- **Root Cause 1:** The `NotificationManager.ts` hardcoded the initial 'SYSTEM BOOT' and 'CONNECTION ESTABLISHED' toasts in English, completely bypassing the `i18n` translations object.
- **Root Cause 2:** The `AICompanion.ts` `greetUser` function hardcoded English matching strings (`if (line.includes("Welcome back!"))`) and fell back to `Hey ${username}! ${line}` for all non-English localized quotes.
- **Fix 1:** Imported `translations.ts` directly into `NotificationManager.ts` and used the saved language preference from the `settingsStore` to fetch the localized `bootSequence` strings.
- **Fix 2:** Removed the hardcoded English logic in `AICompanion.ts` `greetUser` and replaced it with a switch-like fallback that respects the current language (e.g., `${username}님! ${line}` for Korean).
- **Prevention:** Always use the `translations` object or `t()` function for all user-facing strings, especially in core managers that operate independently of the React component lifecycle.
### 2026-06-24: Missing Lifetime Stats and Run History Windows
- **Symptom:** Clicking "Lifetime Stats" or "Run History" buttons did absolutely nothing.
- **Root Cause 1:** During the implementation of draggable "Popped Out Windows", the `<LifetimeStatsWindow />` and `<RunHistoryWindow />` elements were accidentally deleted from the main React render tree inside `OverlayContainer.tsx`.
- **Root Cause 2:** An accidental typo caused the buttons and windows to try and pull state from the wrong Zustand store (`useTrackerStore` vs `useSettingsStore`).
- **Fix:** Added the missing components back into `OverlayContainer.tsx` beneath the other HUD elements. Fixed all store references so the popup logic reads from the correct `settingsStore` while the stats read from `trackerStore`.
- **Files to Watch:** `src/components/overlay/OverlayContainer.tsx`, `src/components/views/loot/ProfileTab.tsx`, `src/components/views/loot/SessionTab.tsx`, `src/components/overlay/LifetimeStatsWindow.tsx`

### 2026-06-25: Stolen Username on Init
- **Symptom:** The Boot Screen showed the correct username from local storage, but when the game initialized, the AI Companion welcomed someone else!
- **Root Cause:** The catch-all `username` grabber inside `playerHandler.ts` was intercepting global server broadcasts like `user_online` and `chat`, accidentally stealing the names of other players who logged in or spoke before our local player's `stats` packet arrived.
- **Fix:** Added a `GLOBAL_BROADCASTS` blacklist (`user_online`, `chat`, `message`, `player_join`, `player_leave`, `spawn_state`, `other_player_move`) to ensure the catch-all only intercepts player-specific init packets (like `stats`, `player_state`, `hero`, etc.).
- **Files to Watch:** `src/core/parser/handlers/playerHandler.ts`

### 2026-07-19 (v0.0.5): Bundle Size Regression — 2,997 KB Single Chunk
- **Symptom:** Extension had a single 2,997 KB JS chunk (`main.tsx`) causing slow initial load.
- **Root Cause:** No `manualChunks` configuration in `vite.config.ts`. The `chunkSizeWarningLimit: 3000` suppressor was hiding the problem.
- **Fix:** Added `manualChunks` to `vite.config.ts` splitting into: `main.tsx` (527 KB), `views-heavy` (491 KB), `onboarding` (42 KB), `vendor-*` packages.
- **Performance Standard:** Resolve bundle size issues via code-splitting rather than raising chunkSizeWarningLimit.
- **Files Modified:** `vite.config.ts`

### 2026-07-19 (v0.0.5): 1.88 MB Collision Data Bundled into JS
- **Symptom:** `pathfinder.worker.ts` used `import collisionDataRaw from '../../data/collisionData.json'` — a static import that bakes 1.88 MB into the JS bundle.
- **Root Cause:** Workers cannot safely use dynamic imports with Chrome extensions, so the collision data was statically imported.
- **Fix:** Moved `collisionData.json` to `public/collision-data.json`. Worker now fetches it at runtime using `fetch(chrome.runtime.getURL('collision-data.json'))` inside the `INIT` message handler.
- **Performance Standard:** Static assets > 50 KB must reside in `public/` and load asynchronously at runtime.
- **Files Modified:** `src/core/pathfinding/pathfinder.worker.ts`, `public/collision-data.json` (added)

### 2026-07-19 (v0.0.5): A* PriorityQueue Using Array.sort() — O(n²) Bug
- **Symptom:** Pathfinding on large maps (Forest, Mines) was visibly slow.
- **Root Cause:** The `PriorityQueue` class called `.sort()` on every `enqueue()` operation, making each insertion O(n log n) and the overall A* algorithm O(n² log n).
- **Fix:** Replaced `PriorityQueue` with a proper binary `MinHeap` class. Enqueue is O(log n), dequeue is O(log n). Also replaced the `Math.sqrt` heuristic with Octile distance (no sqrt needed for 8-directional grids).
- **Files Modified:** `src/core/pathfinding/pathfinder.worker.ts`

### 2026-07-19 (v0.0.5): Tutorial Interval Logging Every 500ms in Production
- **Symptom:** `console.log('tutorial tracker', ...)` firing every 500ms throughout the entire tutorial flow — in production builds.
- **Root Cause:** Debug logging was left inside the `setInterval` checker in `CompanionGuideOverlay.tsx`.
- **Fix:** Removed all `console.log('tutorial tracker', ...)` calls. Increased interval from 500ms to 1000ms (imperceptible to users).
- **Code Quality Standard:** Strip all interval-bound logging in production builds.
- **Files Modified:** `src/components/overlay/CompanionGuideOverlay.tsx`

### 2026-07-19 (v0.0.5): chrome.storage.local.set Firing on Every Drag Event
- **Symptom:** Every mouse move during drag triggered a `chrome.storage.local.set()` call, causing I/O thrash.
- **Root Cause:** The `useSettingsStore.subscribe` callback in `App.tsx` had no debounce on the chrome.storage write.
- **Fix:** Added a 500ms debounce. The chrome.storage write now fires at most once per 500ms after the last change.
- **Files Modified:** `src/App.tsx`

### 2026-07-19 (v0.0.5): IndexedDB Boilerplate Duplicated in Two Stores
- **Symptom:** `trackerStore.ts` and `settingsStore.ts` each contained 80 lines of identical `openDB`, `debouncedSetItem`, and `getItem/setItem/removeItem` boilerplate.
- **Root Cause:** No shared storage utility existed.
- **Fix:** Created `src/store/indexedDBStorage.ts` with `createIndexedDBStorage(dbName, debounceMs, lsKey)` factory. Both stores now use it. The `clearAllStorageAndReload` function was kept as standalone to bypass the debounce.
- **Files Modified:** `src/store/trackerStore.ts`, `src/store/settingsStore.ts`, `src/store/indexedDBStorage.ts` (new)

### 2026-08-05 (v0.0.7): Global Rarity CSS Architecture & Cross-Theme Styling
- **Symptom:** Rarity colors were static or broken when switching themes.
- **Root Cause:** Hardcoded hex color codes in `rarity.ts`.
- **Fix:** Introduced `--rarity-mythic/rare/uncommon/common` CSS variables in `index.css` across all themes and refactored `rarity.ts` to consume them dynamically.
- **Files Modified:** `src/index.css`, `src/utils/rarity.ts`

### 2026-08-05 (v0.0.7): Chest Tab Pagination & Header Settings
- **Symptom:** Chest inventory rendered as a massive scrolling list, causing layout bloat.
- **Fix:** Added paginated controls (5/10/15/20/All items per page) with a settings gear icon dropdown inside `ChestTab.tsx`.
- **Files Modified:** `src/components/views/loot/ChestTab.tsx`

### 2026-08-05 (v0.0.7): Marketplace Analytics Dashboard & IndexedDB Persistence
- **Feature Added:** Integrated `roedex-market-db` via `marketDatabaseSlice.ts` to record daily price snapshots and created the `MarketplaceAnalyticsTab` component showing 7-day and 30-day percentage price trends.
- **Files Modified:** `src/store/slices/marketDatabaseSlice.ts`, `src/components/views/market/MarketplaceAnalyticsTab.tsx`, `src/components/views/market/MarketplaceWindow.tsx`

### 2026-08-05 (v0.0.7): Global Search Modal (Ctrl+K)
- **Feature Added:** Built `GlobalSearchModal.tsx` for fast cross-tab shortcut navigation and instant entity/item searching.
- **Files Modified:** `src/components/ui/GlobalSearchModal.tsx`, `src/components/overlay/OverlayContainer.tsx`

\n### 2026-08-05 (v0.0.7): Vite Bundle Split Fix\n- **Symptom:** Single large main.tsx.js chunk over 800 KB throwing chunk warnings.\n- **Fix:** Removed chunkSizeWarningLimit suppressor. Restored views-heavy and onboarding manual chunks to vite.config.ts.\n- **Files Modified:** vite.config.ts\n
  
### 2026-08-14: BUG-A - Minimap Vanishes When Main Overlay Expands (CRITICAL)

### 2026-08-14: BUG-A — Minimap Vanishes When Main Overlay Expands (CRITICAL)
- **Symptom:** Opening/expanding the main ROEDEX overlay panel caused the minimap to completely disappear.
- **Root Cause:** `<AAAMinimap />` was rendered inside OverlayContainer's root div which has `overflow: hidden`. Expanding the overlay clipped the minimap out of view.
- **Fix:** Extracted `<AAAMinimap />` to a parallel sibling `div` outside the overflow-hidden container. Sibling uses `position:fixed; inset:0; z-index:30; overflow:visible; pointer-events:none`.
- **Files Modified:** `src/components/overlay/OverlayContainer.tsx`
- **Rule:** AAAMinimap and any floating independently-positioned widget MUST NEVER be inside `overflow:hidden`. Always use a parallel fixed sibling layer.

### 2026-08-14: BUG-B — Off-Screen Radar Icons Cluster/Overflow (HIGH)
- **Symptom:** Multiple rare entities off-screen caused many overlapping arrows at the same edge pixel — radar looked broken.
- **Root Cause:** `renderOffScreenRadar()` in AAAMapEngine.ts called `renderEdgeArrow()` once per entity with no aggregation.
- **Fix:** Added 8-sector clustering (N/NE/E/SE/S/SW/W/NW via atan2 bucketing). Renders one badge arrow per occupied sector showing `×N` count with highest-rarity color. Static spawns excluded from radar.
- **Files Modified:** `src/core/map/AAAMapEngine.ts`
- **Rule:** Off-screen indicator systems MUST aggregate by direction sector before rendering. Never call per-entity render in a loop for edge-of-screen UI.

### 2026-08-14: BUG-C — Minimap Default Position {0,0} Hidden Behind Health Bar (MEDIUM)
- **Symptom:** Fresh installs had the minimap spawn at top-left corner behind the health bar — invisible.
- **Root Cause:** `uiSlice.ts` default `mapPosition: { x: 0, y: 0 }` was never updated to a sensible position.
- **Fix:** Changed default to `{ x: 700, y: 60 }`. Added `v12MinimapPositionMigrated` flag in trackerStore.ts merge to auto-migrate users stuck at `{0,0}`.
- **Files Modified:** `src/store/slices/uiSlice.ts`, `src/store/trackerStore.ts`
- **Rule:** Floating widget default positions MUST be visually clear of all game HUD elements. `{0,0}` is NEVER an acceptable default.

### 2026-08-14: Vite Chunk Fix — Circular Dependency & Empty Chunk & manualChunks Restored
- **Symptom:** After last session manualChunks were stripped — `main.tsx.js` regressed to 1,485 KB. `vendor_react` was 0 KB (empty). Circular chunk warning: vendor_charts → views-heavy → vendor_charts.
- **Fix:** Restored views-heavy + onboarding chunks. Removed `vendor_react` (react already in main). Removed `vendor_charts`. Extracted DebugPanel to its own `debug-panel` chunk so recharts bundles cleanly with it. Final: main=549 KB, debug-panel=597 KB (recharts included), views-heavy=326 KB.
- **Files Modified:** `vite.config.ts`
- **Rule:** Do NOT add `vendor_react` as a manual chunk. When a component uses a heavy library, put BOTH in the same dedicated chunk to avoid circular references. NEVER let manualChunks be stripped between sessions.

### 2026-08-21: BUG-MAP-01 — Spaghetti Trail Lines on Minimap (CRITICAL)
- **Symptom:** Minimap rendered a tangled web of yellow lines connecting distant trail points across the entire zone, especially visible in Forest.
- **Root Cause:** `_drawSmoothPath()` used `MAX_WORLD_DIST_SQ = 150 * 150`. Forest zone is ~500 world units wide; 150-unit jumps (30% of zone width) drew as connecting lines instead of teleportation breaks. `defaultTrails.ts` (97 KB pre-recorded community paths) is loaded at startup with thousands of points having large inter-point gaps that triggered this.
- **Fix:** Reduced `MAX_WORLD_DIST_SQ` to `25 * 25`. 25 world units ≈ 1.5 in-game tiles — catches real zone-boundary teleports without spaghetti from normal pathing gaps.
- **Files Modified:** `src/core/map/AAAMapEngine.ts`
- **Rule:** Trail teleportation threshold MUST be calibrated per-zone coordinate scale. For ROE's world units, 25 is the correct value. Do NOT revert to 150.

### 2026-08-21: BUG-MAP-02 — Minimap Lag / High CPU (HIGH)
- **Symptom:** Minimap caused severe UI lag, especially in zones with many static spawns (Forest, Mines).
- **Root Cause 1 (Scanlines):** `render()` fired 55+ individual `fillRect()` GPU draw calls every frame for scanlines.
- **Root Cause 2 (FPS cap missing):** `activeWaypoint` forced a full render on every RAF tick (~60 FPS) just for the dashed waypoint line animation.
- **Root Cause 3 (Static spawn culling):** Viewport cull check fired AFTER `toScreen()` projection, meaning all off-screen static spawns went through coordinate math before being discarded.
- **Fix 1:** Halved scanline density (every 8px instead of 4px), reducing per-frame draw calls ~55→~28.
- **Fix 2:** Added `MIN_FRAME_MS = 1000/30` hard cap. Waypoint animation throttled to 15 FPS independently.
- **Fix 3:** Moved viewport cull check BEFORE the `isStatic` branch in both renderEnemies and renderResources.
- **Files Modified:** `src/core/map/AAAMapEngine.ts`
- **Rule:** Minimap render loop MUST be capped at 30 FPS. NEVER add `should = true` unconditionally for any animation — always gate behind a time check.

### 2026-08-25: UI/UX & Accessibility Overhaul + Testing Peer Dependency Fix
- **Summary:** Executed full accessibility and keyboard navigation audit across overlay widgets and modals.
- **A11y & UX Fixes:**
  - Added global `Escape` key listeners on all modal and fullscreen overlay containers (`LifetimeStatsWindow`, `RunHistoryWindow`, `MarketplaceWindow`, `ChangelogModal`, `AAAMinimap`).
  - Added semantic `role="tablist"` and `role="tab"` with `aria-selected` and `aria-label` to header tabs, fullscreen zone selector, and modal sidebars.
  - Replaced blocking `window.confirm()` in `RunHistoryWindow.tsx` with non-blocking inline confirmation button.
  - Injected accessible `aria-label` and `title` attributes on all icon-only control buttons and search inputs.
- **Testing Dependency Fix:** Restored `@testing-library/dom` in `devDependencies` to prevent missing symbol errors in unit test compilation.
- **Files Modified:** `src/components/layout/Header.tsx`, `src/components/map/AAAMinimap.tsx`, `src/components/overlay/LifetimeStatsWindow.tsx`, `src/components/overlay/RunHistoryWindow.tsx`, `src/components/views/market/MarketplaceWindow.tsx`, `src/components/ui/ChangelogModal.tsx`, `src/components/ui/GlobalSearchModal.tsx`, `src/components/overlay/PoppedOutWindowComponent.tsx`, `package.json`

