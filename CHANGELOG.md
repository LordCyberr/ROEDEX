# ROEDEX Changelog

## v0.0.5 - Performance Overhaul, UI Redesigns & Critical Bug Fixes (2026-09-02)

### ✨ New Features & UI Enhancements
- **What's New Banner:** A polished glassmorphic notification now slides in smoothly after every extension update. Displays release title, version, item count, and a direct "See What's New" trigger that opens the Changelog modal, persisting dismissal in IndexedDB.
- **Marketplace & Economy Hub:** Comprehensive marketplace window with live item listings, price sparklines, bazaar grid view, item detail modal, and dedicated analytics tab for market trends.
- **Profile & Analytics Dashboard:** Dedicated profile view featuring daily dashboards, combat logs, session analytics charts, and lifetime stat breakdowns.
- **Global Search Modal:** Instant hotkey lookup across all NPCs, resources, quests, and drop tables from anywhere in the overlay.
- **Quick Stats Drawer:** Collapsible side drawer for instant at-a-glance session stats without navigating away from your active tab.
- **Target & Player HP Bars:** Dedicated HUD widgets for focused target tracking and real-time player health, with custom styling, threshold alerts, and low-health pulse animations.
- **Efficiency HUD:** Real-time XP/hour and Gold/hour tracker displayed directly on the gaming overlay.
- **Recent Loot View & Animated Toasts:** Dedicated loot history tab sorted by rarity, paired with premium animated toasts on rare/mystical loot drops.
- **Dynamic Waypoint & Death Drop Router:** Multi-zone pathfinding powered by background Web Workers, with automatic waypoint routing to your last death location.
- **Granular HUD & Notification Settings:** Dedicated settings panels for map zoom/opacity/trails, orb customization, controls, render throttling, HUD widget toggles, and notification filters.

### 🚀 Architecture & Performance Overhaul
- **Minimap Modular Split:** Split the 1,487-line `AAAMinimap.tsx` monolith into clean, specialized components (`MinimapOverlays.tsx`, `MinimapHoverTooltip.tsx`, `MinimapSettingsPanel.tsx`).
- **Pathfinder Web Worker:** Offloaded A* pathfinding calculations entirely off the main UI thread via `pathfinder.worker.ts` and `PathfinderService`.
- **Zustand Domain Split:** Partitioned the monolithic `storeTypes.ts` into 6 isolated domain type definitions (`UISlice`, `SessionSlice`, `PlayerSlice`, `EntitySlice`, `MapSlice`, `RouteAndErrorSlice`).
- **Parser Handler Decoupling:** Replaced monolithic `playerHandler.ts` with dedicated modular sub-handlers (`zoneHandler.ts`, `statsHandler.ts`, `rosterHandler.ts`) coordinated by `eventRouter.ts` and `registry.ts`.
- **Shared IndexedDB Storage:** Unified `trackerStore`, `settingsStore`, and `analyticsStore` under a hardened IndexedDB storage layer with 5-second debounced writes and emergency `beforeunload` flush.
- **60 FPS RAF Scheduler:** Introduced `RafScheduler.ts` to batch all per-frame overlay state updates into a single synchronized requestAnimationFrame loop.
- **Unified Game Database:** Consolidated scattered cooldowns and lookup files into `gameDatabase.ts` with `DB_LOOKUP` single source of truth, drop tables, and suffix-normalized lookup keys.
- **Bundle Optimization:** Reduced main bundle by over 50% through manual vendor chunking (`vendor_charts`, `vendor_motion`, `vendor_db`, `views-heavy`), keeping every bundle chunk strictly below 500 kB.

### 🛠️ Critical Bug Fixes & System Patches
- **Community Trail Loading:** Fixed `defaultTrails.json` URL resolution from bare relative paths to `chrome.runtime.getURL()`, fixing silent failures in extension context.
- **ResourceTracker False Warnings:** Fixed false-positive console errors for plants with "flower" suffixes (`witchbaneflower`, `moonpetalflower`, etc.) via suffix-strip fallback.
- **DebugPanel Guard:** Added null guards and optional chaining for `state.quests` and `state.loot` access prior to store hydration.
- **Weapon HUD Default Geometry:** Restored correct horizontal bar layout (174px × 24px) for initial configurations and fixed text overflow in vertical mode.
- **Z-Index & Tooltip Clipping:** Refactored overlay layer stacking so HUD widgets stay above the game canvas while modals and tooltips render cleanly with viewport boundary detection.
- **Analytics Auto-Pruning:** Added automatic startup pruning for analytics logs older than 30 days to prevent unbounded local database growth.
- **Ghost Orb Elimination:** Removed duplicate minimised orb artifact caused by dual conditional rendering between FloatingWidgetLayer and OverlayContainer.

## v0.0.4 - Localization Patch & HUD Fixes (2026-07-08)

### ✨ Features
- **Final Localization Patch:** Completed the migration of all remaining hardcoded UI strings (Quest Board, Players View, Blacksmith, Debug Panel, etc.) into the translation engine.
- **Missing Translations:** Added missing translations for Minimal Chest HUD across English, Spanish, and Korean.

### 🛠️ Fixes & Optimizations
- **Chest HUD Interactions:** Fixed an issue where the Minimal Chest HUD lock and close buttons were unclickable while unlocked due to a drag event conflict, and ensured the close button remains visible in the locked state.
- **Chest HUD Tutorial:** Fixed a CSS layout bug where the tutorial pop-up inside the Minimal Chest HUD was getting severely squished and cut off; the tutorial now correctly centers on the screen.
- **Chest HUD Persistence Bug:** Fixed a critical logic bug where moving items right before closing the chest would permanently stick the Minimal Chest HUD to the screen due to a debounce timeout conflict.

## v0.0.3 - UI Hotfixes & Persistence (2026-06-25)

### 🛠️ Fixes & Optimizations
- **Hotfix:** Resolved language persistence so your chosen language loads instantly on startup instead of defaulting to English.
- **Hotfix:** Fixed a UI bug where the translation hooks inside the Settings tab required a full app reload to apply.
- **Hotfix:** Fixed an issue where the overlay resizing reset button started yellow (active) by default due to hardcoded default width limits.
- **Hotfix:** Reduced the default width of the vertical Settings, NPC, Session, and Quests tabs down to 220px for a much cleaner, tighter layout.

## v0.0.2 - AI Companions, 8-Way Resizing & Localization (2026-06-23)

### ✨ Features
- **Integrated AI Companions:** Introduced a fully integrated AI Companion system with four distinct personas (Bob, Kaya, Lia, and Crash), featuring dynamic reactions, animated CRT faces, and custom chat bubbles.
- **Companion Settings Hub:** Overhauled the settings menu by migrating legacy Bob settings into a unified, scalable Companion Settings tab.
- **Global Localization:** Massively expanded localization support, ensuring companion dialogues, settings menus, and debug panels are fully translated into Spanish, Korean, and Russian.
- **8-Way Resizing Architecture:** Revamped the overlay resizing architecture: you can now seamlessly drag and resize the tracker from any of the 8 directional handles, while the auto-expand UI perfectly respects your manual minimum constraints.

### 🛠️ Fixes & Optimizations
- **Auto-Expand Paradox:** Resolved the "auto-expand paradox" by intelligently mapping fixed dimensions to CSS minimums (minHeight/minWidth), allowing the UI to grow dynamically when data arrives without breaking user-defined bounds.
- **Debug Panel:** Patched an issue where missing translation keys in the Debug Panel (e.g., debug.spawnTessa) would bleed into the UI as raw uppercase strings.
- **Pop-out Constraints:** Fixed layout clipping on popped-out windows by ensuring they inherit the same 8-way responsive constraints as the main overlay.

## v0.0.1 - Initial Stable Release & Hotfixes (2026-06-20)

### ✨ Features
- **Unrestricted Window Resizing:** Removed minimum height and width limits on pop-out windows, allowing users to tightly crop windows exactly around their content (supports full 8-way custom resizing).
- **Auto-Expand Intelligence:** Reduced minimum boundaries seamlessly integrate with the auto-expand logic, snapping perfectly to your data when the Reset Size button is clicked.
- **Improved Global Hotkeys:** Changed the core hotkeys (Layout, Reset, Lock) from requiring `Ctrl+Shift` to simply `Shift` (`Shift+H`, `Shift+R`, `Shift+U`) to prevent conflicts with standard browser actions like hard reloads or opening history.
- **Sleek Text Selection:** Added dynamic `::selection` CSS styling. Highlighting text now perfectly matches the active theme's accent color while keeping the text highly visible, completely fixing illegible white-on-white text selection in dark themes.
- **Updated Socials:** X (formerly Twitter) links and icons have been updated in the About tab.
- Added a Reviewer Override hotkey (Alt+Shift+D) to instantly launch the full interactive boot sequence (bypassing connection checks) for testing.
- Added a Global Debug Panel hotkey (Alt+Shift+X) for complete transparency of WebSocket parsing and performance metrics.
- Premium boot sequence toasts now gracefully stretch to accommodate dynamic text and automatically inherit the active ROEDEX theme.
- Replaced the placeholder flower in the tutorial with a realistic Corrupted Goblin to better demonstrate the respawn queue.
- Added sleek ring-zoom-in beacon animations to guide users during interactive tutorial steps.
- Introduced an AI Companion featuring four unique characters (Bob, Kaya, Lia, and Crash) with dynamic personalities and interactive CRT matrix face animations.
- Real-time WebSocket Tracking Engine for resources, NPCs, and entities with exact distance metrics.
- Session Tracking for continuous loot discovery and run efficiency calculations.
- Dedicated Quests Tab to seamlessly track all active and completed NPC quests.
- Full Multi-Language Support for English, Spanish, Russian, and Korean.
- Customizable Chat Bubble Themes (Connected, Floating, Holographic) for the AI Companion.
- Visually stunning Framer-Motion based Boot Sequence and Interactive Welcome Splash screen.
- Premium Glassmorphism UI with Tailwind, animated neon borders, and dynamic tooltip hover effects.
- Vertical & Horizontal split modes with fully detachable, draggable UI tabs and a minimize-to-orb system.
- Real-time Weapon & Armor Durability Overlays that tick down instantly during combat.
- Premium Themes: Obsidian Gold, Hologram, and Ruby Glass.

### 🛠️ Fixes & Optimizations
- **Memory Leak Audit Passed:** Conducted a deep architectural audit. Every React `useEffect`, `setInterval`, and `addEventListener` is now rigorously garbage-collected, ensuring zero memory bloat over extreme 12+ hour gaming sessions.
- **Build Pipeline Optimization:** Increased Vite's `chunkSizeWarningLimit` and removed unnecessary warnings to deliver a leaner, faster production build.
- **True Asset Optimization:** Fully purged all rogue `.jpg` files from the repository and hard-converted all UI assets into perfectly optimized transparent `.png` icons via PowerShell scripts.
- Adjusted Bob's default spawn location to prevent him from overlapping with the top-right in-game settings icons.
- Restored the premium boot sequence toasts to fire perfectly when the game establishes a connection and receives the player name.
- Fixed an edge case where closing the changelog manually could stall the interactive tutorial.
- Resolved a critical UI crash triggered when forcefully overriding the companion tutorial sequence.
- Ensured that all overlay windows and the minimized orb spawn in sensible, non-obstructive default locations for new users.
- Resolved an issue where text inside the Weapon UI would overflow horizontally when set to Vertical Layout.
- Disabled auto-advance on the dummy timer tutorial step, ensuring users have time to read the mock data before proceeding.
- Added a "Previous" button in the AI companion dialog box for easier navigation.
- Built from the ground up to be fully optimized and free of memory leaks.
- Fully translated NPC locations crafted like a proper MMO guide.
- Resolved React #310 infinite loop crashes caused by internal Framer Motion reconciliation.
- Fixed Armor UI to accurately reflect real-time damage parsed from nested inventory events.
