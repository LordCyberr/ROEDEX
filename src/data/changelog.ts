export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  features: string[];
  fixes: string[];
}

export const CHANGELOG_DATA: ChangelogEntry[] = [
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
    version: '0.0.4',
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
