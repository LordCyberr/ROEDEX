# MEMORY - ROEDEX V4 Game & Project Knowledge

## CORE PRINCIPLE
Information First. Tracking First. UI Second. Features Third.
Never build UI before proving tracking works.

## NON-NEGOTIABLE RULES
Never break:
- WebSocket interception
- Packet parsing
- Spawn tracking
- Respawn tracking
- Distance calculations
- Loot tracking
- Weapon durability
- Notifications
- Overlay dragging/resizing/minimizing
- Settings persistence

## KNOWN CONNECTION
- **WebSocket:** `wss://roe-prod-20fe6d199715.herokuapp.com/socket.io/?EIO=4&transport=websocket`
- **Known Events:** `spawn_state`, `enemy_respawn`, `resource_respawn`, `stats`

## VERIFIED ENTITY HP
### FOREST
- Forest Slime: 570
- Mushroom Sprite: 1020
- Shadow Wolf: 1850
- Wooden Golem: 3750

### MINES
- Crystal Bat: 870
- Rock Muncher: 1420
- Cave Crawler: 2250
- Ore Elemental: 4250

### RESOURCES
- Tree: 400
- Plant: 100

## ARCHITECTURE
WebSocket -> Packet Queue -> Parser -> Tracking Engine -> Store -> UI
UI never parses packets. UI only reads store. Store is the single source of truth.

## LAYOUT STRATEGY
ONLY TWO MODES:
1. Vertical Orientation (Deep Tracking: Compact, Dense, Scrollable)
2. Horizontal Orientation (Overview Mode: Category collapse, responsive)
*Compact Mode is removed.*

## DEVELOPMENT PHASES
1. **Phase 1: Data Engine:** Connect, Parse, Store, Print. No UI.
2. **Phase 2: Tracking Engine:** Build Mob, Ore, Tree, Plant, Loot, Weapon trackers.
3. **Phase 3: Minimal Overlay:** Connected, counts.
4. **Phase 4: Full UI.**

## KNOWN PROJECT DATA
*Cooldowns / Respawn Times have already been researched.*
*Source of Truth:* `Cool_Down_Data/cooldowns` (.ts files)
Do NOT recalculate them. Do NOT estimate them again. Do NOT hardcode new values. If missing, mark as UNKNOWN.
