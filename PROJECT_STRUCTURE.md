# ROEDEX Project Structure

This document outlines the architecture for future AI agents working on this project.

## Directory Layout

- `src/`: Main source code directory.
  - `components/`: React UI Components.
    - `views/`: Full-page views like Dashboard, Settings, etc.
    - `widgets/`: Draggable overlays (WeaponUI, ArmorUI, NotificationToaster).
    - `overlay/`: Overlay containers and the MinimizedOrb.
    - `layout/`: Sidebar, Header, structural components.
  - `core/`: The backbone logic.
    - `parser/`: Handles incoming WebSocket packet mapping and parsing.
    - `trackers/`: State logic for Resource, Mob, and Session tracking over time.
    - `interceptor/`: The background script that hooks into the browser's WebSocket using chrome.debugger.
  - `store/`: Zustand global state managers (e.g., trackerStore).
  - `types/`: TypeScript interfaces for packets, components, and game state.
  - `utils/`: Helper functions.
  
- `public/`: Static assets (icons, manifest).
