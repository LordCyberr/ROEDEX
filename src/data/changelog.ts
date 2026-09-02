export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  features: string[];
  fixes: string[];
}

export const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: '0.0.5',
    date: '2026-09-02',
    title: 'Performance Overhaul, UI Redesigns & Critical Bug Fixes',
    features: [
      // --- NEW FEATURES ---
      'What\'s New Banner: A polished glassmorphic notification now slides in after every extension update. Shows the version, release title, feature/fix count, and a direct "See What\'s New" button to open the Changelog — then dismisses permanently until the next update.',
      'Marketplace & Economy Hub: Full marketplace window with live item listings, price sparklines, bazaar grid view, item detail modals, and a dedicated analytics tab for market trends.',
      'Profile & Analytics Dashboard: New Profile view with daily dashboards, combat logs, session analytics charts, and lifetime stat breakdowns.',
      'Global Search Modal: Press a hotkey to instantly search across all NPCs, resources, quests, and items from anywhere in the overlay.',
      'Quick Stats Drawer: Collapsible side drawer for instant at-a-glance session stats without navigating away from your current tab.',
      'Loot Popup Toast: Premium animated toast that fires on rare/mystical loot drops, showing item name, rarity badge, and icon.',
      'Target Health Bar: Dedicated HUD widget for focused target tracking with configurable style, scale, and alert thresholds.',
      'Player HP Bar: Standalone health bar widget with real-time HP tracking, low-health pulse animation, and threshold alerts.',
      'Efficiency HUD: Live XP/hour and Gold/hour tracker displayed directly on the overlay.',
      'Recent Loot View: Dedicated loot history tab showing the last N drops with timestamps, sorted by rarity.',
      'NPC Player Cards: Nearby player detection with distance badges shown in the NPC view.',
      'Death Drop Router: Automatic waypoint routing to your last death location for loot recovery.',
      'Dynamic Waypoint Router: Intelligent pathfinding system that routes you to objectives across zones with A* pathfinding via a dedicated Web Worker.',
      'Map Settings Panel: Full settings page for minimap zoom, opacity, entity visibility toggles, trail colour, and fog-of-war controls.',
      'Orb Settings: Separate settings page to customise the minimised orb size, position lock, and pulse animation.',
      'Controls Settings: Dedicated hotkey reference and remapping page.',
      'Performance Settings: Advanced settings for render throttle, RAF budget, and entity ghost timeout controls.',
      'HUD Widgets Settings: Central settings hub for toggling and configuring all HUD overlays (Weapon, Armor, Target, Player HP, Efficiency HUD).',
      'Notification Filters: Granular control over which entity types trigger toasts and audible alerts.',
      'UI Appearance Settings: Theme token overrides, font scale, panel opacity, and glass strength sliders.',
      // --- ARCHITECTURE ---
      'Minimap Modular Split: The 1,487-line AAAMinimap.tsx monolith has been split into MinimapOverlays.tsx (zone tabs, compass, legend), MinimapHoverTooltip.tsx, and MinimapSettingsPanel.tsx.',
      'TypeScript Domain Split: The monolithic storeTypes.ts is now 6 clean domain files: UISlice.types, SessionSlice.types, PlayerSlice.types, EntitySlice.types, MapSlice.types, RouteAndErrorSlice.types.',
      'Handler Architecture Split: playerHandler.ts (481 lines) is now a thin dispatcher routing to zoneHandler, statsHandler, and rosterHandler.',
      'Event Router & Registry: New eventRouter.ts and registry.ts decouple WebSocket packet dispatch from handler logic for clean separation of concerns.',
      'Shared IndexedDB Storage: All three stores (trackerStore, settingsStore, analyticsStore) now share a single hardened IndexedDB implementation with 5-second debounced writes and emergency flush on page close.',
      'Pathfinder Web Worker: A* pathfinding runs fully off the main thread via pathfinder.worker.ts with a PathfinderService abstraction layer.',
      'RAF Scheduler: New RafScheduler.ts batches all per-frame overlay updates into a single requestAnimationFrame loop for consistent 60fps rendering.',
      'Game Database: Centralised gameDatabase.ts replaces scattered cooldowns/ folder files — unified entity registry with sanitised names, rarities, drop tables, and suffix-normalised lookup keys.',
      'Static Spawn Index: Pre-built spatialHash index for O(1) nearest-spawn lookups replacing linear scan on every frame.',
    ],
    fixes: [
      // --- CRITICAL FIXES ---
      'Critical: defaultTrails.json fetch URL fixed from bare relative path (/defaultTrails.json) to chrome.runtime.getURL() — the relative path never resolved in Chrome Extension content script context, silently breaking all community trail loading for every user.',
      'ResourceTracker False Warnings: Eliminated false-positive "[ResourceTracker] Unknown resource entity" console errors for all plants whose game server names include a "flower" suffix (witchbaneflower, moonpetalflower, mourninglilyflower, shadowleafflower). All three lookup sites now perform a suffix-strip fallback.',
      'DebugPanel Crash: Fixed TypeError on state.quests and state.loot access before store hydration — null guard with optional chaining added to all early-access store reads.',
      // --- PERFORMANCE ---
      'Bundle Size: debug-panel.js reduced from 549KB to 151KB by extracting recharts and all D3 sub-dependencies into a dedicated vendor_charts chunk.',
      'Bundle Size: defaultTrails.json (97KB) extracted from the main JS bundle into a lazy-fetched public asset — loaded only when the map view opens.',
      'Analytics Pruning: Analytics logs older than 30 days are automatically pruned on startup, preventing unbounded IndexedDB storage growth.',
      'Emergency Save: beforeunload handler now flushes all three stores (tracker, settings, analytics) instead of only one.',
      // --- UI / DESIGN FIXES ---
      'Weapon HUD Defaults: New users now get the correct horizontal bar layout (174px × 24px) out of the box. Old defaults (width: 20, height: 100, layout: vertical) were visually broken.',
      'WeaponUI Text Overflow: Fixed text overflowing horizontally when set to vertical layout mode.',
      'OverlayContainer: Fixed z-index stacking so HUD widgets always render above game UI but below ROEDEX modals.',
      'MinimizedOrb: Removed ghost duplicate orb that appeared when FloatingWidgetLayer and OverlayContainer both conditionally rendered it.',
      'Tooltip Clipping: Fixed tooltips being clipped at overlay edges by switching from absolute to fixed positioning with viewport boundary detection.',
      // --- DEAD CODE & CLEANUP ---
      'Removed: routeRecorderSlice.ts (defunct route-recording feature).',
      'Removed: RadarMinimap.tsx and MinimalChestHUD.tsx (replaced by new map engine and chest UI).',
      'Removed: PlayersView.tsx (merged into NPC view with PlayerCard.tsx).',
      'Removed: collisionData.json and staticMapNodes.json (replaced by gameDatabase.ts and staticSpawnIndex.ts).',
      'Removed: cooldowns/ folder split (index, mobs, ores, plants, trees) consolidated into cooldowns.ts.',
      'Removed: forestRoutes.ts (replaced by community trail system).',
      'Fixed: .gitignore now correctly excludes dist/, scratch/, AI agent files (.cursorrules, ARCHITECTURE.md, .gemini/, agents/) and secret MarketSniper files.',
    ]
  },
  {
    version: '0.0.4',
    date: '2026-07-08',
    title: 'Localization Patch & HUD Fixes',
    features: [
      'Final Localization Patch: Completed the migration of all remaining hardcoded UI strings (Quest Board, Players View, Blacksmith, Debug Panel, etc.) into the translation engine.',
      'Missing Translations: Added missing translations for Minimal Chest HUD across English, Spanish, and Korean.'
    ],
    fixes: [
      'Chest HUD Persistence Bug: Fixed a critical logic bug where moving items right before closing the chest would permanently stick the Minimal Chest HUD to the screen due to a debounce timeout conflict.'
    ]
  },
  {
    version: '0.0.3',
    date: '2026-06-25',
    title: 'UI Hotfixes & Persistence',
    features: [],
    fixes: [
      'Hotfix: Resolved language persistence so your chosen language loads instantly on startup instead of defaulting to English.',
      'Hotfix: Fixed a UI bug where the translation hooks inside the Settings tab required a full app reload to apply.',
      'Hotfix: Fixed an issue where the overlay resizing reset button started yellow (active) by default due to hardcoded default width limits.',
      'Hotfix: Reduced the default width of the vertical Settings, NPC, Session, and Quests tabs down to 220px for a much cleaner, tighter layout.'
    ]
  },
  {
    version: '0.0.2',
    date: '2026-06-23',
    title: 'AI Companions, 8-Way Resizing & Localization',
    features: [
      'Introduced a fully integrated AI Companion system with four distinct personas (Bob, Kaya, Lia, and Crash), featuring dynamic reactions, animated CRT faces, and custom chat bubbles.',
      'Overhauled the settings menu by migrating legacy Bob settings into a unified, scalable Companion Settings tab.',
      'Massively expanded localization support, ensuring companion dialogues, settings menus, and debug panels are fully translated into Spanish, Korean, and Russian.',
      'Revamped the overlay resizing architecture: you can now seamlessly drag and resize the tracker from any of the 8 directional handles, while the auto-expand UI perfectly respects your manual minimum constraints.'
    ],
    fixes: [
      'Resolved the "auto-expand paradox" by intelligently mapping fixed dimensions to CSS minimums (minHeight/minWidth), allowing the UI to grow dynamically when data arrives without breaking user-defined bounds.',
      'Patched an issue where missing translation keys in the Debug Panel (e.g., debug.spawnTessa) would bleed into the UI as raw uppercase strings.',
      'Fixed layout clipping on popped-out windows by ensuring they inherit the same 8-way responsive constraints as the main overlay.'
    ]
  },
  {
    version: '0.0.1',
    date: '2026-06-20',
    title: 'Initial Stable Release & Hotfixes',
    features: [
      'Unrestricted Window Resizing: Removed minimum height and width limits on pop-out windows, allowing users to tightly crop windows exactly around their content (supports full 8-way custom resizing).',
      'Auto-Expand Intelligence: Reduced minimum boundaries seamlessly integrate with the auto-expand logic, snapping perfectly to your data when the Reset Size button is clicked.',
      'Improved Global Hotkeys: Changed the core hotkeys (Layout, Reset, Lock) from requiring Ctrl+Shift to simply Shift (Shift+H, Shift+R, Shift+U) to prevent conflicts with standard browser actions.',
      'Sleek Text Selection: Added dynamic ::selection CSS styling. Highlighting text now perfectly matches the active theme\'s accent color while keeping the text highly visible.',
      'Updated Socials: X (formerly Twitter) links and icons have been updated in the About tab.',
      'Added a Reviewer Override hotkey (Alt+Shift+D) to instantly launch the full interactive boot sequence (bypassing connection checks) for testing.',
      'Added a Global Debug Panel hotkey (Alt+Shift+X) for complete transparency of WebSocket parsing and performance metrics.',
      'Premium boot sequence toasts now gracefully stretch to accommodate dynamic text and automatically inherit the active ROEDEX theme.',
      'Replaced the placeholder flower in the tutorial with a realistic Corrupted Goblin to better demonstrate the respawn queue.',
      'Added sleek ring-zoom-in beacon animations to guide users during interactive tutorial steps.',
      'Introduced an AI Companion featuring four unique characters (Bob, Kaya, Lia, and Crash) with dynamic personalities and interactive CRT matrix face animations.',
      'Real-time WebSocket Tracking Engine for resources, NPCs, and entities with exact distance metrics.',
      'Session Tracking for continuous loot discovery and run efficiency calculations.',
      'Dedicated Quests Tab to seamlessly track all active and completed NPC quests.',
      'Full Multi-Language Support for English, Spanish, Russian, and Korean.',
      'Customizable Chat Bubble Themes (Connected, Floating, Holographic) for the AI Companion.',
      'Visually stunning Framer-Motion based Boot Sequence and Interactive Welcome Splash screen.',
      'Premium Glassmorphism UI with Tailwind, animated neon borders, and dynamic tooltip hover effects.',
      'Vertical & Horizontal split modes with fully detachable, draggable UI tabs and a minimize-to-orb system.',
      'Real-time Weapon & Armor Durability Overlays that tick down instantly during combat.',
      'Premium Themes: Obsidian Gold, Hologram, and Ruby Glass.'
    ],
    fixes: [
      'Memory Leak Audit Passed: Conducted a deep architectural audit. Every React useEffect, setInterval, and addEventListener is now rigorously garbage-collected.',
      'Build Pipeline Optimization: Increased Vite\'s chunkSizeWarningLimit and removed unnecessary warnings to deliver a leaner, faster production build.',
      'True Asset Optimization: Fully purged all rogue .jpg files and hard-converted all UI assets into perfectly optimized transparent .png icons via PowerShell scripts.',
      'Adjusted Bob\'s default spawn location to prevent him from overlapping with the top-right in-game settings icons.',
      'Restored the premium boot sequence toasts to fire perfectly when the game establishes a connection and receives the player name.',
      'Fixed an edge case where closing the changelog manually could stall the interactive tutorial.',
      'Resolved a critical UI crash triggered when forcefully overriding the companion tutorial sequence.',
      'Ensured that all overlay windows and the minimized orb spawn in sensible, non-obstructive default locations for new users.',
      'Resolved an issue where text inside the Weapon UI would overflow horizontally when set to Vertical Layout.',
      'Disabled auto-advance on the dummy timer tutorial step, ensuring users have time to read the mock data before proceeding.',
      'Added a "Previous" button in the AI companion dialog box for easier navigation.',
      'Built from the ground up to be fully optimized and free of memory leaks.',
      'Fully translated NPC locations crafted like a proper MMO guide.',
      'Resolved React #310 infinite loop crashes caused by internal Framer Motion reconciliation.',
      'Fixed Armor UI to accurately reflect real-time damage parsed from nested inventory events.'
    ]
  }
];
