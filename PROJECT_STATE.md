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

## NEXT AI AGENT INSTRUCTIONS
1. Scaffold the React 19 app using Vite.
2. Install dependencies.
3. Build the core websocket connection and parsers.
