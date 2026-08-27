import type { PropDef } from "./types";

export const PROPS: PropDef[] = [
  {
    id: "pack",
    name: "Aurora Spark Booster",
    blurb:
      "A sealed pack from Lumen Arc, the in-world TCG. Nine cards wait inside. Opening is a later milestone — for now, feel the weight of it.",
    kind: "carry",
    carryable: true,
    position: [0.22, 0.82, -0.58],
    rotationY: 0.35,
    holdScale: 2.6,
    dropHeight: 0.09,
  },
  {
    id: "mug",
    name: "Diner Mug",
    blurb:
      "Yesterday's coffee, cold. You will need more of these once the warehouse shift exists.",
    kind: "carry",
    carryable: true,
    position: [-0.48, 0.82, -0.72],
    holdScale: 2.1,
    dropHeight: 0.08,
  },
  {
    id: "binder",
    name: "Empty Binder",
    blurb:
      "Twelve pages, nothing sleeved. Collection storage comes after you can actually open product.",
    kind: "carry",
    carryable: true,
    position: [0.55, 0.84, -0.88],
    rotationY: -0.4,
    holdScale: 1.7,
    dropHeight: 0.03,
  },
  {
    id: "crate",
    name: "Shipping Crate",
    blurb:
      "Stenciled FRAGILE / TCG. Too heavy to pocket. Someone else's order — for now.",
    kind: "inspect",
    carryable: false,
    position: [-3.95, 0.36, -3.05],
    rotationY: 0.18,
    dropHeight: 0.36,
  },
  {
    id: "lamp",
    name: "Desk Lamp",
    blurb: "A cheap clamp lamp. Click to toggle. Mood is free.",
    kind: "toggle",
    carryable: false,
    position: [4.05, 0.96, -3.48],
    dropHeight: 0.4,
  },
];

export function getProp(id: string): PropDef | undefined {
  return PROPS.find((p) => p.id === id);
}

export function toInfo(def: PropDef) {
  return {
    id: def.id,
    name: def.name,
    blurb: def.blurb,
    kind: def.kind,
    carryable: def.carryable,
  };
}
