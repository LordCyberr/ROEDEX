# ROEDEX Handover Document

**Purpose:** To allow future AI agents to continue development safely.
**Current Version:** 1.0.0

## Architecture Summary
ROEDEX is a Chrome Extension that acts as an analytical overlay for the game. It uses the `chrome.debugger` API to sniff WebSocket traffic without modifying the game client. The UI is built with React, TailwindCSS, and Framer Motion, injected onto the page via a content script (`main.tsx`).

## Major Systems
- **WebSocket Interceptor:** Located in `src/core/interceptor.ts`. This attaches to the game tab and forwards packets to the React frontend.
- **Parser Engine:** Located in `src/core/parser/index.ts`. This takes raw JSON arrays, validates them, and updates the Zustand store.
- **Overlay Engine:** Draggable, persistent widgets (Weapon, Armor, Notifications, Minimized Orb) built using Framer Motion and bound to the Tracker Store.

## Do Not Touch Areas
- `manifest.json`: Permissions are strictly configured for `debugger` and `storage`. Modifications may break installation.
- `vite.config.ts`: Configured to output a clean extension format (preventing chunk splitting on content scripts).

## Future Roadmap
- Enhance the parser for guild and party interactions.
- Add an interactive Map overlay using canvas.
- Introduce persistent history caching across browser restarts (IndexedDB).
