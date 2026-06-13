# ROEDEX Regression Log (The Burn Book)

This file serves as the permanent memory bank for the `roedex-regression-guard`. 
Whenever a bug is fixed, log it here. Before committing a feature update, the swarm must review this log to ensure old bugs aren't accidentally reintroduced.

## [2026-06-09] Popout Window Resize Bug
* **What broke:** Users couldn't resize the Debug or Pop-out windows after an update.
* **Why it broke:** The CSS `resize: 'both'` and `overflow: 'hidden'` rules were accidentally overwritten, and the wrapper container had a fixed width instead of relying on the store state.
* **The Fix:** Removed fixed width classes (`w-72`), restored `resize: 'both'`, added `minHeight` / `minWidth`, and tied `width`/`height` directly to `store.tabDimensions` and `ResizeObserver`.
* **Prevention:** When modifying UI wrappers in `PoppedOutWindowComponent.tsx` or `DebugPanel.tsx`, DO NOT strip out the resize properties or lock the width.

## [2026-06-09] Bob Avatar & Orb Custom URL
* **What broke:** Custom image URLs for the Minimized Orb and Bob Avatar stopped rendering.
* **Why it broke:** The regex replace logic for the Settings UI update accidentally stripped out the `<input>` elements that bound `store.minimizedIconUrl` and `store.notificationSettings.bobIconUrl`.
* **The Fix:** Re-injected the JSX conditionally rendering an `<img>` tag when the icon value is `'custom'`, and restored the text inputs in `SettingsView.tsx`.
* **Prevention:** Be extremely careful when using regex `replace()` on `SettingsView.tsx`. Use precise substring targeting instead.

---
*(Regression Guard: Append new resolved bugs below this line)*

## [2026-06-09] Custom Resize Handle & Border Radius Fix
* **What broke:** Pop-out windows had sharp edges and the native `resize: 'both'` property was not working properly because pointer events were being blocked or handled incorrectly by framer-motion overlay layers.
* **Why it broke:** `resize: 'both'` natively strips `border-radius` in Chrome, and we removed `rounded-xl` by mistake in a previous UI cleanup.
* **The Fix:** Removed native CSS `resize` from `PoppedOutWindowComponent.tsx` and `DebugPanel.tsx`. Added `rounded-xl` back to the container class. Implemented a custom SVG drag handle on the bottom right (`cursor-se-resize`) bound to native document pointer events to smoothly resize the `windowRef`.
* **Prevention:** Do NOT use native `resize: 'both'` on `motion.div` pop-out components. Always use the custom SVG resize handle implementation to preserve `border-radius`.

## [2026-06-09] False Broken Tool Warning on Gather/Combat
* **What broke:** Players were receiving a "Weapon Broken!" toast when picking flowers or using bare hands, even if their tool wasn't actually broken.
* **Why it broke:** The WebSocket parser in `index.ts` checked if `weaponDurability === -1` (which means empty-handed) and erroneously passed `current: 0` into the `checkDurability` notification, triggering the broken alert.
* **The Fix:** Updated the parser logic for both `combat_hit_ack` and `gather_hit_ack`. Now, if `weaponDurability === -1`, it calls `NotificationManager.onWeaponUnequipped` instead of simulating a `0` durability hit.
* **Prevention:** Remember that `d.weaponDurability === -1` from the server means "no tool equipped", not "the tool reached exactly 0 durability". The parser already handles true breakage (0 durability) separately.

## [2026-06-10] Pop-Out Window Boundaries and Overflow Bug
* **What broke:** Pop-out windows could be dragged completely off-screen, expanded infinitely downwards causing them to disappear, and text was truncating instead of wrapping.
* **Why it broke:** The `motion.div` in `PoppedOutWindowComponent.tsx` was missing `dragConstraints`, missing `overflow-hidden` to bound its visual size, and the flex-1 content wrapper was missing `min-h-0`, causing `LootView.tsx` to infinitely stretch. `CategoryTable.tsx` used `truncate` instead of `break-words`.
* **The Fix:** Added strict `dragConstraints` mapped to `window.innerWidth/Height` to keep windows on-screen. Added `overflow-hidden` to the main `motion.div` and `min-h-0 overflow-y-auto` to the internal flex container. Replaced `truncate` with `break-words leading-tight` in the table view.
* **Prevention:** When modifying `PoppedOutWindowComponent.tsx`, never remove `overflow-hidden` from the wrapper, or `min-h-0` from the flex body. Always provide `dragConstraints` to `framer-motion` modals.

## [2026-06-11] Horizontal View Auto-Expand Bug
* **What broke:** The Tracker UI in horizontal view would no longer automatically expand its width to fit newly opened categories (showing a scrollbar instead of expanding).
* **Why it broke:** The container had a hardcoded `w-[600px]` class, and the inner content container in `TrackingView.tsx` had `w-full` with `overflow-x-auto`. This prevented the parent from dynamically measuring the width of the cards, meaning it was locked to 600px.
* **The Fix:** Changed the `OverlayContainer.tsx` horizontal width from `w-[600px]` to `w-fit min-w-[600px]`, and changed the horizontal list wrapper in `TrackingView.tsx` from `w-full overflow-x-auto` to `w-max min-w-full`. This allows the inner content to calculate its max-content width, which pushes the parent to expand up to `max-w-[calc(100vw-1rem)]`.
* **Prevention:** When trying to implement auto-expanding horizontal layouts, remember that `w-full` with `overflow-x-auto` will collapse the intrinsic width of the child to zero. You must use `w-max` on the child and `w-fit` on the parent to achieve shrink-wrapping expansion.

## [2026-06-13] Wrong Username Display Bug
* **What broke:** The player profile showed the wrong username (e.g. showing names of other players or even mobs).
* **Why it broke:** The WebSocket parser in `index.ts` had generic logic at the very top of the file that extracted `payload.name` or `payload.username` from *any* packet and forced it into the `playerProfile` state. This meant a nearby player walking, or an NPC spawning, could overwrite the local player's name.
* **The Fix:** Removed the global name extraction logic from the top of the parser. Moved the `BobCompanion.greetUser()` and name assignment logic exclusively into the `stats` and `player_state` packet handlers, where the payload is guaranteed to refer to the local player.
* **Prevention:** Never blindly extract properties like `name`, `id`, or `level` from the root of all WebSocket packets. The game server multiplexes data for many entities. Always extract profile data exclusively from player-specific packets (`stats`, `player_state`, etc).
