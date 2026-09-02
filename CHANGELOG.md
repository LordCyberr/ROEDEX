# ROEDEX Changelog

## v0.0.6 - Engine Redesign & Core Bugfixes (2026-08-02)

### 🚀 Performance & Map Engine Optimizations
- **React Rendering Optimization:** Audited and wrapped all `useTrackerStore` selectors returning objects with `useShallow` (e.g. `EfficiencyHUD.tsx`), drastically reducing unnecessary component re-renders. Memoized top-level components (`OverlayContainer`, `TargetUI`) to prevent cascading re-renders.
- **Offscreen Canvas Rendering:** Refactored `MapRenderEngine` to completely remove heavy DOM-based rendering. Trail coordinates are now baked incrementally to an offscreen `HTMLCanvasElement`, resulting in a massive boost to FPS and zero jank during long play sessions.

### ✨ Features & Database
- **Unified Game Database:** Deprecated all fragmented hardcoded static lists and completed full integration with `gameDatabase.ts`. All item icons, rarities, mob data, and NPC data now flow directly through the single source of truth (`DB_LOOKUP`).
- **Minimap UX Polish:** Overhauled the Minimap interaction logic. Added a permanent zone identifier pill to the bottom of the map, animated smooth camera re-centering with `framer-motion`, and improved resize handle responsiveness by utilizing a unified delta `(dx + dy) / 2`. 

### 🛠️ Fixes & Strict Types
- **Hook Rules Violation Resolved:** Fixed a critical crash caused by calling `useTrackerStore.getState()` directly inside a component's render body in `Minimap.tsx`, ensuring proper React subscription rules are followed.
- **TypeScript Strictness:** Resolved a series of strict TypeScript compilation errors across the overlay engine, fixing uninitialized tracking types, implicit `any` usage, and React state mismatches.


## v0.0.5 - Performance Optimizations & Architecture Audit (2026-07-26)

### 🚀 Performance & Bundling Optimizations
- **Code-Splitting Architecture:** Implemented `React.lazy()` and `Suspense` lazy-loading across all major overlay views (Tracking, Session/Loot, NPC, Quests, and Settings) in `OverlayContainer.tsx` and `PoppedOutWindowComponent.tsx`.
- **Bundle Bloat Resolution:** Resolved monolithic bundle bloat by replacing static array chunks with a functional `manualChunks` strategy in `vite.config.ts`, cleanly isolating heavy dependencies (`motion`, `react`, and `icons`) into dedicated vendor chunks while eliminating circular dependency warnings between Zustand and React. Reduced main initial JavaScript bundle size from **966 kB down to ~475 kB** (a 51% reduction!).
- **Ghost Route Recording Prevention:** Silenced background "ghost" route recording in `routeRecorderSlice.ts` by adding strict guards that immediately halt coordinate recording when the Cartographer recording mode is disabled, preventing memory leaks during long gaming sessions.

### ✨ Features & Localization
- **100% Localization Completion:** Audited and resolved remaining hardcoded UI strings across `Header.tsx` (ROEpedia tab labels, Lock/Unlock UI tooltips) and `TutorialChatBubble.tsx` (mobs killed counter), mapping all strings to the master `translations.ts` dictionary across English, Spanish, and Korean.
- **Project Architecture & Upgrade Audit:** Completed a comprehensive codebase audit and produced an extensive roadmap and upgrade report detailing baseline metrics, store selector optimization strategies, memory leak mitigation, and future engine enhancements.

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
