import { EYE_HEIGHT, SPAWN } from "./constants";

export const player = {
  x: SPAWN.x,
  y: SPAWN.y,
  z: SPAWN.z,
  vx: 0,
  vy: 0,
  vz: 0,
  yaw: SPAWN.yaw,
  pitch: SPAWN.pitch,
  grounded: true,
  bob: 0,
  bobPhase: 0,
  eye: EYE_HEIGHT,
};

export function resetPlayer() {
  player.x = SPAWN.x;
  player.y = SPAWN.y;
  player.z = SPAWN.z;
  player.vx = 0;
  player.vy = 0;
  player.vz = 0;
  player.yaw = SPAWN.yaw;
  player.pitch = SPAWN.pitch;
  player.grounded = true;
  player.bob = 0;
  player.bobPhase = 0;
}

export function horizontalSpeed() {
  return Math.hypot(player.vx, player.vz);
}
