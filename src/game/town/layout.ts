import { HALL, ROOM, type Box3 } from "../layout";

export const LOBBY = {
  centerX: HALL.centerX,
  width: 4.5,
  z0: ROOM.halfD + HALL.depth,
  depth: 3.55,
  height: 2.62,
  wall: 0.12,
} as const;

export const EXIT = {
  x: HALL.centerX,
  z: LOBBY.z0 + LOBBY.depth,
  width: 1.12,
  gap: 1.38,
  height: 2.22,
  thickness: 0.06,
} as const;

export const STREET = {
  minX: -12.5,
  maxX: 14.5,
  sidewalk: 2.55,
  roadZ0: EXIT.z + 2.55,
  roadDepth: 7.4,
  farWalk: 2.45,
} as const;

export const SHOP = {
  x: 2.15,
  z0: EXIT.z + STREET.sidewalk + STREET.roadDepth + STREET.farWalk,
  width: 8.6,
  depth: 6.6,
  height: 4.35,
} as const;

export const BUILDING = {
  minX: -6.6,
  maxX: 8.4,
  height: 11.4,
} as const;

export const TOWN_POS = {
  exit: [EXIT.x, 0, EXIT.z] as [number, number, number],
  shop: [SHOP.x, 0, SHOP.z0 - 0.05] as [number, number, number],
  mailbox: [-1.15, 0, EXIT.z + 0.72] as [number, number, number],
  bench: [5.4, 0, EXIT.z + 1.15] as [number, number, number],
};

export function lobbyBounds() {
  return {
    minX: LOBBY.centerX - LOBBY.width / 2,
    maxX: LOBBY.centerX + LOBBY.width / 2,
    minZ: LOBBY.z0,
    maxZ: LOBBY.z0 + LOBBY.depth,
  };
}

export function exitGap() {
  return {
    left: EXIT.x - EXIT.gap / 2,
    right: EXIT.x + EXIT.gap / 2,
  };
}

export function exitHingeX() {
  return EXIT.x + EXIT.width / 2;
}

export function farWalkZ0() {
  return STREET.roadZ0 + STREET.roadDepth;
}

export function townMaxZ() {
  return SHOP.z0 + SHOP.depth + 2.4;
}

export function townWorldBounds() {
  return {
    minX: STREET.minX,
    maxX: STREET.maxX,
    minZ: -ROOM.halfD - 0.8,
    maxZ: townMaxZ(),
  };
}

function wall(pos: [number, number, number], size: [number, number, number]): Box3 {
  return { pos, size };
}

export function lobbyWalls(): Box3[] {
  const b = lobbyBounds();
  const T = LOBBY.wall;
  const H = LOBBY.height;
  const hall = {
    left: HALL.centerX - HALL.width / 2,
    right: HALL.centerX + HALL.width / 2,
  };
  const gap = exitGap();
  const zMid = (b.minZ + b.maxZ) / 2;
  const backLeftW = hall.left - b.minX;
  const backRightW = b.maxX - hall.right;
  const frontLeftW = gap.left - b.minX;
  const frontRightW = b.maxX - gap.right;

  return [
    wall([b.minX, H / 2, zMid], [T, H, LOBBY.depth + T]),
    wall([b.maxX, H / 2, zMid], [T, H, LOBBY.depth + T]),
    wall([(b.minX + hall.left) / 2, H / 2, b.minZ], [backLeftW, H, T]),
    wall([(b.maxX + hall.right) / 2, H / 2, b.minZ], [backRightW, H, T]),
    wall([(b.minX + gap.left) / 2, H / 2, b.maxZ], [frontLeftW, H, T]),
    wall([(b.maxX + gap.right) / 2, H / 2, b.maxZ], [frontRightW, H, T]),
  ];
}

export function exitSolid(open: boolean): Box3 {
  if (!open) {
    return {
      pos: [EXIT.x, EXIT.height / 2, EXIT.z],
      size: [EXIT.width, EXIT.height, EXIT.thickness + 0.05],
    };
  }
  const hinge = exitHingeX();
  return {
    pos: [hinge - 0.02, EXIT.height / 2, EXIT.z - EXIT.width / 2],
    size: [EXIT.thickness + 0.05, EXIT.height, EXIT.width],
  };
}

/** Street-facing solids. Interior of Apt 4B is excluded. */
export function townSolids(): Box3[] {
  const H = BUILDING.height;
  const facadeZ = EXIT.z + 0.22;
  const gap = exitGap();
  const leftW = gap.left - BUILDING.minX;
  const rightW = BUILDING.maxX - gap.right;
  const shopZ = SHOP.z0 + SHOP.depth / 2;
  const zEnd = townMaxZ();

  return [
    wall([(BUILDING.minX + gap.left) / 2, H / 2, facadeZ], [leftW, H, 0.42]),
    wall([(BUILDING.maxX + gap.right) / 2, H / 2, facadeZ], [rightW, H, 0.42]),
    // Wings so you cannot slip behind the facade at the corners
    wall([BUILDING.minX, H / 2, facadeZ + 0.8], [0.4, H, 1.8]),
    wall([BUILDING.maxX, H / 2, facadeZ + 0.8], [0.4, H, 1.8]),
    // Card shop — fully solid; interior is display-only
    wall([SHOP.x, SHOP.height / 2, shopZ], [SHOP.width, SHOP.height, SHOP.depth]),
    // Neighbor walk-up west
    wall([-10.2, 5.2, facadeZ + 1.1], [5.4, 10.4, 2.6]),
    // Closed laundry east
    wall([11.6, 3.4, facadeZ + 0.9], [5.2, 6.8, 2.4]),
    // Far-side cafe west of shop
    wall([-6.6, 3.2, SHOP.z0 + 3.1], [7.2, 6.4, 6.2]),
    // Utility shed east of shop
    wall([10.8, 1.6, SHOP.z0 + 2.4], [4.6, 3.2, 4.8]),
    // Map fences
    wall([(STREET.minX + STREET.maxX) / 2, 1.2, zEnd], [STREET.maxX - STREET.minX, 2.4, 0.28]),
    wall([STREET.minX, 1.2, (facadeZ + zEnd) / 2], [0.28, 2.4, zEnd - facadeZ]),
    wall([STREET.maxX, 1.2, (facadeZ + zEnd) / 2], [0.28, 2.4, zEnd - facadeZ]),
    // Street furniture
    wall([-4.2, 1.55, EXIT.z + 1.05], [0.18, 3.1, 0.18]),
    wall([7.1, 1.55, EXIT.z + 1.05], [0.18, 3.1, 0.18]),
    wall([SHOP.x + 3.4, 1.55, SHOP.z0 - 0.85], [0.18, 3.1, 0.18]),
    wall([5.4, 0.28, EXIT.z + 1.15], [1.35, 0.56, 0.42]),
    wall([-1.15, 0.55, EXIT.z + 0.72], [0.22, 1.1, 0.22]),
    wall([-7.4, 0.55, STREET.roadZ0 + 2.2], [1.7, 1.1, 4.2]),
    wall([9.3, 0.7, EXIT.z + 1.6], [0.55, 1.4, 0.55]),
  ];
}
