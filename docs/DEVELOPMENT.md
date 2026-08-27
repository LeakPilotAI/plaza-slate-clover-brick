# Foilbound — development log

Original 3D collector life / TCG economy sim. Built for the browser with
Three.js + React Three Fiber so it can run in the live preview.

**Engine decision:** Unity, Godot, and Unreal cannot run in this web preview.
Three.js is the production engine for v1. The data-driven TCG / economy
architecture is engine-agnostic and can be ported later if needed.

## Current milestone

**M1 — Playable first-person prototype** (complete)

## Completed

- Project scaffold (TanStack Start, folder layout, live preview)
- First-person walk / sprint / look (mouse lock + drag fallback + touch)
- AABB collision in a prototype studio
- Pick up, carry, drop, inspect
- Touch fallback + `window.__controlsTest` (W/A/D/sprint verified)
- Fictional TCG placeholder: Lumen Arc / Aurora Spark booster

## Known issues

- Pointer lock may be blocked inside an embedded preview; drag-look is the fallback
- Pack opening, money, jobs, shop, and save are intentionally not in M1

## Next (do not start until M1 is signed off)

M2 Apartment → M3 Town → M4 Job → M5 Currency → M6 Card shop → M7 Card data →
M8 Pack purchase → M9 Pack opening → M10 Collection → M11 Market

## Priorities

| ID | Item | Pri |
| --- | --- | --- |
| M1 | First-person prototype | P0 |
| M2 | Lived-in apartment | P1 |
| — | Do not add dueling / multiplayer / grading | P4 |

## Architecture notes

- Cards, products, shops, jobs stay **data**, never hardcoded in gameplay
- Player movement is FPS strafe (A/D translate, mouse yaws) — not vehicle steer
- Fictional TCG for development: **Lumen Arc**
