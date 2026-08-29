import { PLAYER_RADIUS } from "./constants";
import {
  collisionWalls,
  doorSolid,
  FURNITURE_BOXES,
  type Box3,
} from "./layout";
import { exitSolid, lobbyWalls, townSolids, townWorldBounds } from "./town/layout";

export type Aabb = {
  min: [number, number, number];
  max: [number, number, number];
};

export function boxToAabb(b: Box3): Aabb {
  const [x, y, z] = b.pos;
  const [sx, sy, sz] = b.size;
  return {
    min: [x - sx / 2, y - sy / 2, z - sz / 2],
    max: [x + sx / 2, y + sy / 2, z + sz / 2],
  };
}

export function solids(doorOpen: boolean, exitOpen = false): Aabb[] {
  return [
    ...collisionWalls().map(boxToAabb),
    ...lobbyWalls().map(boxToAabb),
    ...FURNITURE_BOXES.map(boxToAabb),
    ...townSolids().map(boxToAabb),
    boxToAabb(doorSolid(doorOpen)),
    boxToAabb(exitSolid(exitOpen)),
  ];
}

export function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

export function separateCircleAabb(
  x: number,
  z: number,
  radius: number,
  minX: number,
  minZ: number,
  maxX: number,
  maxZ: number,
): [number, number] {
  const inside = x >= minX && x <= maxX && z >= minZ && z <= maxZ;
  if (inside) {
    const left = x - minX;
    const right = maxX - x;
    const bottom = z - minZ;
    const top = maxZ - z;
    const m = Math.min(left, right, top, bottom);
    if (m === left) return [minX - radius, z];
    if (m === right) return [maxX + radius, z];
    if (m === bottom) return [x, minZ - radius];
    return [x, maxZ + radius];
  }

  const closestX = clamp(x, minX, maxX);
  const closestZ = clamp(z, minZ, maxZ);
  const dx = x - closestX;
  const dz = z - closestZ;
  const d2 = dx * dx + dz * dz;
  if (d2 >= radius * radius) return [x, z];
  if (d2 === 0) return [x + radius, z];
  const d = Math.sqrt(d2);
  const s = radius / d;
  return [closestX + dx * s, closestZ + dz * s];
}

export function resolvePlayerXz(
  x: number,
  z: number,
  radius = PLAYER_RADIUS,
  doorOpen = false,
  exitOpen = false,
) {
  const bound = townWorldBounds();
  let nx = clamp(x, bound.minX + radius, bound.maxX - radius);
  let nz = clamp(z, bound.minZ + radius, bound.maxZ - radius);
  for (const box of solids(doorOpen, exitOpen)) {
    [nx, nz] = separateCircleAabb(
      nx,
      nz,
      radius,
      box.min[0],
      box.min[2],
      box.max[0],
      box.max[2],
    );
  }
  nx = clamp(nx, bound.minX + radius, bound.maxX - radius);
  nz = clamp(nz, bound.minZ + radius, bound.maxZ - radius);
  return { x: nx, z: nz };
}

export function surfaceY(x: number, z: number): number {
  let y = 0;
  for (const box of FURNITURE_BOXES.map(boxToAabb)) {
    if (
      x >= box.min[0] &&
      x <= box.max[0] &&
      z >= box.min[2] &&
      z <= box.max[2]
    ) {
      y = Math.max(y, box.max[1]);
    }
  }
  return y;
}
