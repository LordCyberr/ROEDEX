# ROEDEX Worklog

## Current Phase: Phase 7.5 (Comprehensive UI/UX Overhaul & Optimization)

### Recent Technical Decisions
- **Session Tracking**: Session states (Runes, active time, loot map) are stored in `trackerStore` but managed manually to allow resets independently of global historical loot.
- **Opacity Handling**: CSS styles bound directly to `isHovered` in `OverlayContainer` using inline `style={{ opacity }}` instead of complex Framer Motion variants to ensure smooth transitions without conflicting with Framer's `x/y` layout constraints.
- **Version Tracking**: Ensuring all documentation, `package.json`, and `manifest.json` are consistently bumped upon major structural implementations.

### Recent Technical Decisions
- **Persistence Strategy**: We opted for Zustand `persist` middleware backed by `chrome.storage.local`. This is necessary for a Chrome Extension to safely survive background page unloads or UI refreshes without wiping out user preferences.
- **Overlay Layouts**:
  - Vertical Mode: Designed as a compact, draggable overlay, bound with Framer Motion. Uses `max-h-[70vh]` to naturally shrink when empty.
  - Horizontal Mode: Fixed to the bottom of the screen with a multi-column flex layout. Columns scroll independently.
- **Socket Interception**: `interceptor.ts` is injected into the main page to override the native `WebSocket` object. It uses `window.postMessage` to broadcast intercepted packets up to the content script (`connection.ts`).
- **Validation Layer**: Built `trackerValidator.ts` that runs before the parsed payloads are applied to the Zustand store. It ensures negative timers are clamped and malformed coordinates are dropped, using `console.warn` instead of throwing errors to prevent UI crashes.
- **Physics & Positioning**: Integrated Framer Motion's `dragConstraints` mapped to the window viewport for perfect resize clamping, and eliminated tailwind `transition-all` on framer elements to achieve 1:1 real-time drag tracking without CSS easing lag.
- **Payload Parsing (Distance & Zoning)**: Handled missing variations of payload variables (`payload.position`, `payload.data.position`) to ensure player distance tracking remains perfect. `spawn_state` arrays correctly overwrite tracked elements instead of running complex difference calculations.

### Known Limitations
- The tracker currently cannot perfectly identify which specific mob was killed if multiple mobs of the exact same type are standing on the exact same coordinate.
- The `chrome.storage.local` quota could theoretically be exceeded if we store hundreds of thousands of mob coordinates, which is why we only persist UI state (`layoutMode`, `collapsedCategories`, `overlayPosition`), not live game entities.
