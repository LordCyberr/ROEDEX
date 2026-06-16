# ROEDEX Changelog

## v0.0.1 - Initial Stable Release & Hotfixes (2026-06-15)

### ✨ Features
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
- Resolved an issue where text inside the Weapon UI would overflow horizontally when set to Vertical Layout.
- Disabled auto-advance on the dummy timer tutorial step, ensuring users have time to read the mock data before proceeding.
- Added a "Previous" button in the AI companion dialog box for easier navigation.
- Built from the ground up to be fully optimized and free of memory leaks.
- Fully translated NPC locations crafted like a proper MMO guide.
- Resolved React #310 infinite loop crashes caused by internal Framer Motion reconciliation.
- Fixed Armor UI to accurately reflect real-time damage parsed from nested inventory events.
