export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  features: string[];
  fixes: string[];
}

export const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: '0.0.1',
    date: '2026-06-16',
    title: 'Initial Stable Release & Hotfixes',
    features: [
      'Added a Developer Override hotkey (Ctrl+Shift+C) to instantly skip connection checks and tutorials for testing.',
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
