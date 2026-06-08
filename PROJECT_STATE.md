# PROJECT_STATE

## CURRENT VERSION
Version: v5.5.0
Status: Development
Branch: main

## CURRENT PHASE
Phase: 7.5 - Comprehensive UI/UX Overhaul & Optimization
Progress: 100%

## COMPLETED TASKS
✓ Project documentation initialized
✓ Phase 1-6 features implemented
✓ Phase 7.5 Overhaul: Compact UI, Resizability, Favorites, Session Tracker, Theming, Transparency, Cooldown Bugs Fixed, Item Rarity Colors.

## ACTIVE TASK
Current Goal: Maintenance and Feature Polish based on user feedback.

## NEXT TASK
After current task: Refine settings, balance resell values, check memory utilization.

## KNOWN ISSUES
None yet.

## KNOWN WORKING FEATURES
(To be updated continuously)

## KNOWN BROKEN FEATURES
(To be updated continuously)

## ARCHITECTURE DECISIONS
- Compact mode removed to avoid duplicate code and maintenance.
- Using existing `.ts` data files from `Cool_Down_Data/` as source of truth instead of rebuilding known game knowledge.

## MULTI-AGENT SWARM RULES (CRITICAL INSTRUCTIONS)
Any Agent working on this project MUST adhere to these architectural rules:
1. **React Rules of Hooks:** NEVER place a React hook (`useEffect`, `useState`, etc.) inside a conditional block or after an early `return`. Hooks must execute unconditionally in the exact same order every render to prevent Error #300 and #310.
2. **Zustand Optimization:** Always use `useShallow` when pulling multiple fields from a Zustand store (e.g., `useTrackerStore(useShallow(state => ({ ... })))`) to prevent unnecessary React re-renders.
3. **Styling Paradigm:** Use pure Tailwind CSS and inline styles for dynamic calculations (like `ResizeObserver` widths). Avoid custom CSS stylesheets unless it is a global variable defined in `index.css`.
4. **Data Pipeline:** Do not mutate Zustand states directly. Raw WebSocket data must be processed by `interceptor.ts` and sanitized by the core parsers before entering the store.
5. **Agent Handoffs:** Stick to your specialized role. Frontend agents do not write Python; Backend agents do not write Tailwind.
