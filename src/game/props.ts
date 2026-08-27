import { POS } from "./layout";
import type { PropDef, PropInfo } from "./types";

export const PROPS: PropDef[] = [
  {
    id: "pack",
    name: "Aurora Spark Booster",
    blurb:
      "A sealed pack from Lumen Arc, the in-world TCG. Nine cards wait inside. Opening is a later milestone — for now, feel the weight of it.",
    kind: "carry",
    carryable: true,
    position: POS.pack,
    rotationY: 0.42,
    holdScale: 5.2,
    worldScale: 2.4,
    dropHeight: 0.1,
    hit: [0.28, 0.36, 0.22],
    worldMesh: true,
  },
  {
    id: "mug",
    name: "Diner Mug",
    blurb:
      "Yesterday's coffee, cold. You will need more of these once the warehouse shift exists.",
    kind: "carry",
    carryable: true,
    position: POS.mug,
    holdScale: 2.1,
    dropHeight: 0.08,
    hit: [0.14, 0.2, 0.14],
    worldMesh: true,
  },
  {
    id: "binder",
    name: "Empty Binder",
    blurb:
      "Twelve pages, nothing sleeved. Collection storage comes after you can actually open product.",
    kind: "carry",
    carryable: true,
    position: POS.binder,
    rotationY: -0.4,
    holdScale: 1.7,
    dropHeight: 0.03,
    hit: [0.24, 0.14, 0.26],
    worldMesh: true,
  },
  {
    id: "crate",
    name: "Shipping Crate",
    blurb:
      "Stenciled FRAGILE / TCG. You dragged this in last week. Still haven't unpacked the last of it.",
    kind: "inspect",
    carryable: false,
    position: POS.crate,
    rotationY: 0.12,
    dropHeight: 0.36,
    hit: [0.74, 0.74, 0.74],
    worldMesh: true,
  },
  {
    id: "lamp",
    name: "Desk Lamp",
    blurb: "A cheap clamp lamp. Click to toggle. Mood is free.",
    kind: "toggle",
    carryable: false,
    position: POS.lamp,
    dropHeight: 0.4,
    hit: [0.22, 0.72, 0.22],
    hitOffset: [0, -0.18, 0],
    worldMesh: true,
  },
  {
    id: "bed",
    name: "Bed",
    blurb: "Sleep — Coming Soon",
    kind: "use",
    carryable: false,
    position: POS.bed,
    dropHeight: 0.5,
    useLabel: "Sleep",
    hit: [2.02, 1.2, 1.12],
    hitOffset: [0, 0.6, 0],
    worldMesh: false,
  },
  {
    id: "desk",
    name: "Desk",
    blurb: "Particleboard, one wobbly leg. Card opening will live on this desk later.",
    kind: "use",
    carryable: false,
    position: POS.desk,
    dropHeight: 0.74,
    useLabel: "Desk",
    hit: [0.7, 1.05, 1.56],
    hitOffset: [0, 0.72, 0],
    worldMesh: false,
  },
  {
    id: "computer",
    name: "Computer",
    blurb: "Computer — jobs, market, and collection tools.",
    kind: "use",
    carryable: false,
    position: POS.computer,
    dropHeight: 0.2,
    useLabel: "Use",
    hit: [0.7, 0.85, 0.36],
    worldMesh: false,
  },
  {
    id: "storage",
    name: "Storage",
    blurb: "Storage — Empty",
    kind: "use",
    carryable: false,
    position: POS.storage,
    dropHeight: 0.5,
    useLabel: "Open",
    hit: [0.62, 1.4, 0.55],
    hitOffset: [0, 0.7, 0],
    worldMesh: false,
  },
  {
    id: "display",
    name: "Display Shelf",
    blurb: "Display — Empty. Pulled cards will live here later.",
    kind: "use",
    carryable: false,
    position: POS.display,
    dropHeight: 0.2,
    useLabel: "Look",
    hit: [0.28, 0.7, 0.95],
    worldMesh: false,
  },
  {
    id: "door",
    name: "Door",
    blurb: "The building hall. The rest of the city comes later.",
    kind: "use",
    carryable: false,
    position: POS.door,
    dropHeight: 1,
    useLabel: "Open",
    hit: [0.96, 2.08, 0.08],
    hitOffset: [0, 1.04, 0],
    worldMesh: false,
  },
  {
    id: "stair",
    name: "Stairwell",
    blurb: "Street — Coming Soon",
    kind: "use",
    carryable: false,
    position: POS.stair,
    dropHeight: 1,
    useLabel: "Exit",
    hit: [1.04, 2.1, 0.12],
    worldMesh: false,
  },
];

export function getProp(id: string): PropDef | undefined {
  return PROPS.find((p) => p.id === id);
}

export function toInfo(def: PropDef): PropInfo {
  return {
    id: def.id,
    name: def.name,
    blurb: def.blurb,
    kind: def.kind,
    carryable: def.carryable,
    useLabel: def.useLabel,
  };
}

export function movableProps() {
  return PROPS.filter((p) => p.worldMesh);
}

export function fixtureProps() {
  return PROPS.filter((p) => p.worldMesh === false);
}
