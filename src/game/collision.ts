import { PLAYER_RADIUS, ROOM } from "./constants";

export type Aabb = {
  min: [number, number, number];
  max: [number, number, number];
};

/** Solid furniture the capsule cannot walk through. Keep in sync with world meshes. */
export const FURNITURE: Aabb[] = [
  // Central table
  { min: [-0.88, 0, -1.18], max: [0.88, 0.76, -0.22] },
  // Corner crate
  { min: [-4.45, 0, -3.55], max: [-3.45, 0.72, -2.55] },
  // Back-wall shelf
  { min: [3.35, 0, -3.95], max: [4.88, 0.92, -3.15] },
];

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

export function resolvePlayerXz(x: number, z: number, radius = PLAYER_RADIUS) {
  const innerW = ROOM.halfW - ROOM.wall - radius;
  const innerD = ROOM.halfD - ROOM.wall - radius;
  let nx = clamp(x, -innerW, innerW);
  let nz = clamp(z, -innerD, innerD);
  for (const box of FURNITURE) {
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
  nx = clamp(nx, -innerW, innerW);
  nz = clamp(nz, -innerD, innerD);
  return { x: nx, z: nz };
}

export function surfaceY(x: number, z: number): number {
  let y = 0;
  for (const box of FURNITURE) {
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
