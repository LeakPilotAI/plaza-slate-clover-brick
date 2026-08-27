# Foilbound — development log

Original 3D collector life / TCG economy sim. Built for the browser with
Three.js + React Three Fiber so it can run in the live preview.

**Engine decision:** Unity, Godot, and Unreal cannot run in this web preview.
Three.js is the production engine for v1. The data-driven TCG / economy
architecture is engine-agnostic and can be ported later if needed.

## Current milestone

**M2 — Apartment as a real home** (complete, awaiting sign-off)

## Completed

- Project scaffold (TanStack Start, folder layout, live preview)
- First-person walk / sprint / look (mouse lock + drag fallback + touch)
- AABB collision (walls + furniture, doorway gap, hallway)
- Pick up, carry, drop, inspect (Aurora Spark booster preserved)
- Apt 4B as a persistent starter home
- Bed → Sleep — Coming Soon overlay
- Computer → home terminal stub (Jobs / Market / Collection locked, Mail empty)
- Storage bin → empty 8-slot overlay
- Functional door onto a building hallway (street locked)
- Empty display shelf reserved for future collection
- Desk blotter reserved for future pack opening
- localStorage apartment save (lamp, door, drops, tutorial)

## Known issues

- Pointer lock may be blocked inside an embedded preview; drag-look is the fallback
- Jobs, money, shop, pack opening, collection, and the town are intentionally not in M2
- Stairwell is a stub — the town is M3

## Next (do not start until M2 is signed off)

M3 Town / Exterior → M4 Job → M5 Currency → M6 Card shop → M7 Products →
M8 Pack opening → M9 Collection → M10 Market

## Priorities

| ID | Item | Pri |
| --- | --- | --- |
| M1 | First-person prototype | P0 done |
| M2 | Lived-in apartment | P1 done |
| M3 | Small town / exterior world | P1 |
| — | Do not add dueling / multiplayer / grading | P4 |

## Architecture notes

- Cards, products, shops, jobs stay **data**, never hardcoded in gameplay
- Player movement is FPS strafe (A/D translate, mouse yaws) — not vehicle steer
- Fictional TCG for development: **Lumen Arc**
- Furniture positions live in `src/game/layout.ts` (meshes and collision share that file)
- Home stations reuse the existing `kind: "use"` interaction path
- Apartment save is versioned in `src/game/save.ts` — QA sessions (`?qa=1`) skip persistence
