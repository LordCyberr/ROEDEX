# ROEDEX Regression Log

This file tracks all resolved bugs, their root causes, and the files modified, ensuring that future updates do not break previously fixed features.

## Active Directives
- ALWAYS check this log before modifying files mentioned in past fixes.
- Keep ROEDEX version at 0.0.1 until explicitly told to bump it.

## Log Entries
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
- **Fix:** Updated \	rackerStore.ts\ \getItem\ to check \localStorage\ if IndexedDB \equest.result\ resolves to null.

### 2026-06-15: Master Lock Layout Bug
- **Symptom:** Master Lock button appeared out of order or was confusing to find in the vertical layout.
- **Root Cause:** Flex/Grid auto-flow was misplacing items when \poppedOutWindows\ conditions changed.
- **Fix:** Hardcoded explicit \col-start-*\ and \ow-start-*\ Tailwind classes in \Header.tsx\ to enforce a strict 3x2 grid.
### 2026-06-15: Vertical Auto-Expand Bug & Minimize Button Location
- **Symptom:** In vertical view, resizing the width explicitly locked the height, preventing auto-expand. Also, the minimize button wasn't floating at the top-right anymore.
- **Root Cause:** \OverlayContainer.tsx\ stored and applied \currentHeight\ even in vertical mode, overriding \h-fit\. Minimize button was moved into the Utilities Grid inside \Header.tsx\.
- **Fix:** Prevented \currentHeight\ and \onMove\ from applying explicit height in vertical mode (\OverlayContainer.tsx\). Moved \Minimize\ button back to \bsolute top-1 right-1.5\ inside \Header.tsx\ and added \pr-8\ to the flex layout so buttons don't collide.
### 2026-06-15: Export Store Data & Profiler Metrics
- **Feature added:** Added the \EXPORT STORE DATA\ button to \DebugPanel.tsx\ and added React Profiler metrics to diagnose lag, FPS drops, and RAM utilization.
- **Directives:** Ensure the Export button remains available in Developer Mode at all times.
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
- **Directive:** Do not change these rarity colors without explicit user permission.

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
