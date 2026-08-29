# Foilbound — development log

Original 3D collector life / TCG economy sim. Built for the browser with
Three.js + React Three Fiber so it can run in the live preview.

**Engine decision:** Unity, Godot, and Unreal cannot run in this web preview.
Three.js is the production engine for v1. The data-driven TCG / economy
architecture is engine-agnostic and can be ported later if needed.

## Current milestone

**M3 — Small town / exterior world** (complete, awaiting sign-off)

## Completed

- First-person walk / sprint / look, collision, pick up / inspect / drop
- Apt 4B as a persistent starter home (bed, computer, storage, display)
- Building 14 lobby connected to the apartment hall
- Ash Street: sidewalks, road, streetlights, neighbors
- Lumen Arc Cards exterior (windows, sign, locked door — opening soon)
- Return path: street → building door → hall → Apt 4B

## Known issues

- Pointer lock may be blocked inside an embedded preview; drag-look is the fallback
- Jobs, money, shop interior, pack opening, and collection are intentionally not in M3
- Neighborhood is compact and fenced — no traffic, NPCs, or other interiors

## Next (do not start until M3 is signed off)

M4 First interactive job → M5 Currency → M6 Card shop interior → M7 Products →
M8 Pack opening → M9 Collection → M10 Market

## Priorities

| ID | Item | Pri |
| --- | --- | --- |
| M1 | First-person prototype | P0 done |
| M2 | Lived-in apartment | P1 done |
| M3 | Small town / exterior world | P1 done |
| M4 | First interactive job | P1 |
| — | Do not add dueling / multiplayer / grading | P4 |

## Architecture notes

- Cards, products, shops, jobs stay **data**, never hardcoded in gameplay
- Town layout and collision live in `src/game/town/layout.ts`
- Street meshes live in `src/game/town/Town.tsx` — same interactable / AABB path as Apt 4B
- Fictional TCG for development: **Lumen Arc**
- Apartment save is versioned in `src/game/save.ts` — QA sessions (`?qa=1`) skip persistence
