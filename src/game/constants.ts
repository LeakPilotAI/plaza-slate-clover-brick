export { ROOM, SPAWN } from "./layout";

export const EYE_HEIGHT = 1.62;
export const PLAYER_RADIUS = 0.32;
export const WALK_SPEED = 3.15;
export const SPRINT_SPEED = 5.35;
export const ACCEL_GROUND = 18;
export const FRICTION = 10;
export const GRAVITY = 22;
export const JUMP_SPEED = 5.6;
export const MOUSE_SENS = 0.00215;
export const PAD_LOOK_SENS = 1.6;
export const TOUCH_LOOK_SENS = 0.0034;
export const PITCH_LIMIT = Math.PI / 2 - 0.04;
export const INTERACT_RANGE = 2.55;
export const HOLD_OFFSET = { x: 0.3, y: -0.16, z: -0.38 } as const;
export const INSPECT_OFFSET = { x: 0, y: -0.04, z: -0.55 } as const;
