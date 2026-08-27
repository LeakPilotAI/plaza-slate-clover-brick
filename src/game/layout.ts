/** Apartment furniture, door, and hallway — single source of truth for meshes + collision. */

export type Box3 = {
  pos: [number, number, number];
  size: [number, number, number];
};

export const ROOM = {
  halfW: 3.4,
  halfD: 2.9,
  height: 2.62,
  wall: 0.1,
} as const;

export const SPAWN: {
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
} = {
  x: 1.08,
  y: 0,
  z: 1.72,
  yaw: 0.1,
  pitch: -0.12,
};

export const DOOR = {
  x: 1.22,
  z: ROOM.halfD,
  width: 0.96,
  gap: 1.18,
  height: 2.08,
  thickness: 0.046,
} as const;

export const HALL = {
  centerX: 1.22,
  width: 2.52,
  depth: 2.28,
  height: 2.5,
} as const;

/** Floor-space origins and prop placements. */
export const POS = {
  bed: [-2.16, 0, -2.2] as [number, number, number],
  nightstand: [-0.96, 0, -2.36] as [number, number, number],
  desk: [2.98, 0, -1.28] as [number, number, number],
  chair: [2.28, 0, -1.28] as [number, number, number],
  computer: [2.98, 0.97, -1.52] as [number, number, number],
  lamp: [2.98, 0.97, -0.7] as [number, number, number],
  lampLight: [2.98, 1.44, -0.7] as [number, number, number],
  pack: [2.66, 0.82, -1.08] as [number, number, number],
  mug: [2.82, 0.8, -0.76] as [number, number, number],
  binder: [-0.96, 0.45, -2.32] as [number, number, number],
  storage: [-2.94, 0, 0.58] as [number, number, number],
  display: [-3.28, 1.22, 1.48] as [number, number, number],
  crate: [-2.86, 0.36, 2.46] as [number, number, number],
  door: [1.22, 0, ROOM.halfD] as [number, number, number],
  stair: [1.22, 1.05, ROOM.halfD + HALL.depth - 0.06] as [number, number, number],
  shoes: [0.42, 0.03, 2.42] as [number, number, number],
  rug: [0.05, 0.012, 0.15] as [number, number, number],
} as const;

export const WINDOW = {
  x: 0.62,
  y: 1.5,
  z: -ROOM.halfD + ROOM.wall * 0.45,
  width: 1.72,
  height: 1.22,
  sill: 0.92,
} as const;

export function doorGap() {
  return {
    left: DOOR.x - DOOR.gap / 2,
    right: DOOR.x + DOOR.gap / 2,
  };
}

export function doorHingeX() {
  return DOOR.x + DOOR.width / 2;
}

export function hallBounds() {
  return {
    minX: HALL.centerX - HALL.width / 2,
    maxX: HALL.centerX + HALL.width / 2,
    minZ: ROOM.halfD,
    maxZ: ROOM.halfD + HALL.depth,
  };
}

export const FURNITURE_BOXES: Box3[] = [
  { pos: [-1.98, 0.25, -2.22], size: [2.44, 0.5, 1.12] },
  { pos: [2.98, 0.39, -1.28], size: [0.72, 0.78, 1.58] },
  { pos: [2.28, 0.42, -1.28], size: [0.42, 0.84, 0.42] },
  { pos: [-2.94, 0.26, 0.58], size: [0.56, 0.52, 0.44] },
  { pos: [-2.86, 0.36, 2.46], size: [0.72, 0.72, 0.72] },
  { pos: [-3.22, 1.22, 1.48], size: [0.28, 0.62, 0.95] },
];

export function collisionWalls(): Box3[] {
  const { halfW: hw, halfD: hd, height: H, wall: T } = ROOM;
  const W = hw * 2;
  const D = hd * 2;
  const gap = doorGap();
  const hall = hallBounds();
  const southLeftW = gap.left - (-hw - T / 2);
  const southLeftX = (-hw - T / 2 + gap.left) / 2;
  const southRightW = hw + T / 2 - gap.right;
  const southRightX = (gap.right + hw + T / 2) / 2;
  const jamb = (gap.right - gap.left - DOOR.width) / 2;

  return [
    { pos: [0, H / 2, -hd], size: [W + T, H, T] },
    { pos: [-hw, H / 2, 0], size: [T, H, D] },
    { pos: [hw, H / 2, 0], size: [T, H, D] },
    { pos: [southLeftX, H / 2, hd], size: [southLeftW, H, T] },
    { pos: [southRightX, H / 2, hd], size: [southRightW, H, T] },
    // Door jambs (always solid)
    {
      pos: [gap.left + jamb / 2, DOOR.height / 2, hd],
      size: [jamb, DOOR.height, T + 0.02],
    },
    {
      pos: [gap.right - jamb / 2, DOOR.height / 2, hd],
      size: [jamb, DOOR.height, T + 0.02],
    },
    // Hallway enclosure
    {
      pos: [hall.minX, HALL.height / 2, (hall.minZ + hall.maxZ) / 2],
      size: [T, HALL.height, HALL.depth + T],
    },
    {
      pos: [hall.maxX, HALL.height / 2, (hall.minZ + hall.maxZ) / 2],
      size: [T, HALL.height, HALL.depth + T],
    },
    {
      pos: [HALL.centerX, HALL.height / 2, hall.maxZ],
      size: [HALL.width + T, HALL.height, T],
    },
  ];
}

export function doorSolid(open: boolean): Box3 {
  if (!open) {
    return {
      pos: [DOOR.x, DOOR.height / 2, DOOR.z],
      size: [DOOR.width, DOOR.height, DOOR.thickness + 0.04],
    };
  }
  const hinge = doorHingeX();
  return {
    pos: [hinge - 0.02, DOOR.height / 2, DOOR.z - DOOR.width / 2],
    size: [DOOR.thickness + 0.04, DOOR.height, DOOR.width],
  };
}

export function worldBounds() {
  const hall = hallBounds();
  return {
    minX: -ROOM.halfW - 0.8,
    maxX: ROOM.halfW + 0.8,
    minZ: -ROOM.halfD - 0.8,
    maxZ: hall.maxZ + 0.8,
  };
}

export const VISUAL = {
  apartmentFloor: { pos: [0, 0, 0] as [number, number, number], size: [ROOM.halfW * 2, ROOM.halfD * 2] as [number, number] },
  hallFloor: {
    pos: [HALL.centerX, 0, ROOM.halfD + HALL.depth / 2] as [number, number, number],
    size: [HALL.width, HALL.depth] as [number, number],
  },
};
