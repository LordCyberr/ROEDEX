# ROEDEX Project Audit

This report was generated during the v1.0.0 release.

## Unused Exports & Dead Code
The following files have exports that are either entirely unused or only used internally within the same module:

- `src/App.tsx:64` - `default`
- `src/data/prices.ts:1` - `RESELL_VALUES` (used internally)
- `src/store/trackerStore.ts:5` - `ArmorSlot` (used internally)
- `src/store/trackerStore.ts:6` - `ArmorItem` (used internally)
- `src/types/events.ts:76` - `GatherEvent` (type definition not currently applied)
- `src/components/layout/Header.tsx:5` - `HeaderProps` (used internally)
- `src/components/layout/SidebarNav.tsx:5` - `SidebarNav`
- `src/components/views/CategoryTable.tsx:14` - `getRarityColor` (used internally)
- `src/components/views/CategoryTable.tsx:205` - `CategoryTable`
- `src/core/parser/index.ts:26` - `parsePacket`

## Unused Dependencies
No unused major dependencies found. All UI components (Lucide React, Framer Motion, Tailwind) are actively consumed.

## Action Items for Future Dev
- Consolidate internal types in `trackerStore.ts` to `types/events.ts` or remove `export`.
- Remove `GatherEvent` if gathering is purely handled by `resource_spawn`.
