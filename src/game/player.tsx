import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { sfx } from "./audio";
import { resolvePlayerXz, surfaceY } from "./collision";
import {
  ACCEL_GROUND,
  EYE_HEIGHT,
  FRICTION,
  GRAVITY,
  INSPECT_OFFSET,
  INTERACT_RANGE,
  JUMP_SPEED,
  MOUSE_SENS,
  PAD_LOOK_SENS,
  PITCH_LIMIT,
  ROOM,
  SPAWN,
  SPRINT_SPEED,
  WALK_SPEED,
} from "./constants";
import { sampleInput, tryPointerLock, exitPointerLock } from "./input";
import { horizontalSpeed, player } from "./playerState";
import { getProp, toInfo } from "./props";
import { interactableRoots } from "./registry";
import { useGame } from "./store";
import { PropMesh } from "./meshes";
import type { PropInfo } from "./types";

const _fwd = new THREE.Vector3();
const _right = new THREE.Vector3();
const _euler = new THREE.Euler(0, 0, 0, "YXZ");
const _hold = new THREE.Vector3();
const _rayNdc = new THREE.Vector2(0, 0);
const _world = new THREE.Vector3();
const _to = new THREE.Vector3();
const _dir = new THREE.Vector3();
const raycaster = new THREE.Raycaster();

function approach(current: number, target: number, maxDelta: number) {
  const d = target - current;
  if (Math.abs(d) <= maxDelta) return target;
  return current + Math.sign(d) * maxDelta;
}

function setLookBasis() {
  _fwd.set(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
  _right.set(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
}

export function FirstPersonPlayer() {
  const camera = useThree((s) => s.camera);
  const held = useRef<THREE.Group>(null);
  const inspectGrp = useRef<THREE.Group>(null);
  const acc = useRef(0);
  const t = useRef(0);
  const lastStepSign = useRef(0);
  const markedReady = useRef(false);

  useEffect(() => {
    camera.near = 0.06;
    camera.far = 60;
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    t.current += dt;
    if (!markedReady.current) {
      markedReady.current = true;
      window.__gameReady = true;
    }

    const state = useGame.getState();
    const input = sampleInput();

    if (input.debug) state.toggleDebug();

    if (state.phase === "boot") {
      const sway = Math.sin(t.current * 0.18) * 0.1;
      player.yaw = SPAWN.yaw + sway;
      player.pitch = -0.08 + Math.sin(t.current * 0.13) * 0.025;
      applyCamera(camera, 0);
      return;
    }

    const live = useGame.getState();
    if (input.pause) {
      if (live.phase === "inspecting") {
        live.setInspecting(null);
      } else if (
        live.phase === "computer" ||
        live.phase === "storage" ||
        live.phase === "sleeping"
      ) {
        live.closeStation();
        void tryPointerLock();
      } else if (live.phase === "playing") {
        exitPointerLock();
        live.pause();
      } else if (live.phase === "paused") {
        live.resume();
        void tryPointerLock();
      }
    }

    if (useGame.getState().phase === "paused") {
      applyCamera(camera, 0);
      return;
    }

    const canLook =
      useGame.getState().phase === "playing" ||
      useGame.getState().phase === "inspecting";
    if (canLook) {
      player.yaw -= input.lookDx * MOUSE_SENS + input.lookRateX * PAD_LOOK_SENS * dt;
      player.pitch -= input.lookDy * MOUSE_SENS + input.lookRateY * PAD_LOOK_SENS * dt;
      player.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, player.pitch));
    }

    const moving = useGame.getState().phase === "playing";
    acc.current += dt;
    const STEP = 1 / 60;
    let jumpConsumed = false;
    const doorOpen = useGame.getState().doorOpen;
    while (acc.current >= STEP) {
      const doJump = moving && input.jump && !jumpConsumed;
      if (moving) simStep(STEP, input.moveX, input.moveY, input.sprint, doJump, doorOpen);
      jumpConsumed = jumpConsumed || input.jump;
      acc.current -= STEP;
    }

    const speed = horizontalSpeed();
    if (moving && player.grounded && speed > 0.4) {
      player.bobPhase += dt * speed * 1.7;
      player.bob = Math.sin(player.bobPhase) * 0.032;
      const sign = Math.sign(Math.sin(player.bobPhase));
      if (sign !== 0 && sign !== lastStepSign.current && Math.abs(Math.sin(player.bobPhase)) > 0.85) {
        lastStepSign.current = sign;
        sfx.step();
      }
    } else {
      player.bob *= Math.max(0, 1 - dt * 8);
    }

    const persp = camera as THREE.PerspectiveCamera;
    const fovTarget = moving && input.sprint && speed > 1 ? 82 : 75;
    persp.fov = THREE.MathUtils.damp(persp.fov, fovTarget, 6, dt);
    persp.updateProjectionMatrix();

    applyCamera(camera, player.bob);

    updateInteraction(camera, input);
    updateHeld(held.current, camera, dt);
    updateInspect(inspectGrp.current, camera);
  });

  const carryingId = useGame((s) => s.carrying?.id);
  const inspectingId = useGame((s) => s.inspecting?.id);
  const holdScale = carryingId ? (getProp(carryingId)?.holdScale ?? 1) : 1;
  const inspectScale =
    inspectingId === "crate" ? 0.4 : inspectingId === "lamp" ? 1.15 : inspectingId === "pack" ? 3.8 : 2.6;

  return (
    <>
      <group ref={held} visible={Boolean(carryingId) && !inspectingId}>
        {carryingId ? (
          <group scale={holdScale}>
            <PropMesh id={carryingId} />
          </group>
        ) : null}
      </group>
      <group ref={inspectGrp} visible={Boolean(inspectingId)}>
        {inspectingId ? (
          <group scale={inspectScale}>
            <PropMesh id={inspectingId} />
          </group>
        ) : null}
      </group>
    </>
  );
}

function simStep(
  dt: number,
  moveX: number,
  moveY: number,
  sprint: boolean,
  jump: boolean,
  doorOpen: boolean,
) {
  setLookBasis();
  const speed = sprint ? SPRINT_SPEED : WALK_SPEED;
  const wishX = _fwd.x * moveY + _right.x * moveX;
  const wishZ = _fwd.z * moveY + _right.z * moveX;
  const targetX = wishX * speed;
  const targetZ = wishZ * speed;
  const moving = Math.abs(moveX) + Math.abs(moveY) > 0.01;
  const rate = moving ? ACCEL_GROUND : FRICTION;
  player.vx = approach(player.vx, targetX, rate * dt * (moving ? speed : 1) * 0.55);
  player.vz = approach(player.vz, targetZ, rate * dt * (moving ? speed : 1) * 0.55);

  if (player.grounded && jump) {
    player.vy = JUMP_SPEED;
    player.grounded = false;
  }
  player.vy -= GRAVITY * dt;

  let x = player.x + player.vx * dt;
  let z = player.z + player.vz * dt;
  const resolved = resolvePlayerXz(x, z, undefined, doorOpen);
  if (Math.abs(resolved.x - x) > 0.0001) player.vx = 0;
  if (Math.abs(resolved.z - z) > 0.0001) player.vz = 0;
  player.x = resolved.x;
  player.z = resolved.z;

  player.y += player.vy * dt;
  const floor = 0;
  if (player.y <= floor) {
    player.y = floor;
    player.vy = 0;
    player.grounded = true;
  }
  const head = player.y + EYE_HEIGHT + 0.12;
  if (head > ROOM.height - ROOM.wall) {
    player.y = ROOM.height - ROOM.wall - EYE_HEIGHT - 0.12;
    if (player.vy > 0) player.vy = 0;
  }
}

function applyCamera(camera: THREE.Camera, bob: number) {
  camera.position.set(player.x, player.y + EYE_HEIGHT + bob, player.z);
  _euler.set(player.pitch, player.yaw, 0);
  camera.quaternion.setFromEuler(_euler);
}

function updateHeld(group: THREE.Group | null, _camera: THREE.Camera, dt: number) {
  if (!group) return;
  setLookBasis();
  const bobY = Math.sin(player.bobPhase) * 0.012;
  group.position.set(
    player.x + _fwd.x * 0.38 + _right.x * 0.18,
    player.y + 1.28 + bobY,
    player.z + _fwd.z * 0.38 + _right.z * 0.18,
  );
  _euler.set(-0.55, player.yaw + 0.35, 0.18);
  group.quaternion.setFromEuler(_euler);
  const s = group.scale.x || 1;
  group.scale.setScalar(THREE.MathUtils.damp(s, 1, 8, dt));
}

function updateInspect(group: THREE.Group | null, camera: THREE.Camera) {
  if (!group) return;
  const inspecting = useGame.getState().inspecting;
  if (!inspecting) return;
  _hold.set(INSPECT_OFFSET.x, INSPECT_OFFSET.y, INSPECT_OFFSET.z);
  _hold.applyQuaternion(camera.quaternion);
  group.position.copy(camera.position).add(_hold);
  group.quaternion.copy(camera.quaternion);
  group.rotateY(performance.now() * 0.0006);
  group.rotateX(0.08);
}

function kindPriority(kind: PropInfo["kind"]) {
  if (kind === "carry") return 0;
  if (kind === "toggle") return 1;
  if (kind === "inspect") return 2;
  return 3;
}

function considerTarget(
  bag: Map<string, { id: string; priority: number; dist: number; ang: number }>,
  id: string,
  dist: number,
  ang: number,
) {
  const def = getProp(id);
  if (!def) return;
  const priority = kindPriority(def.kind);
  const prev = bag.get(id);
  if (!prev || dist < prev.dist) {
    bag.set(id, { id, priority, dist, ang });
  }
}

function pickLookTarget(camera: THREE.Camera): PropInfo | null {
  const bag = new Map<string, { id: string; priority: number; dist: number; ang: number }>();

  raycaster.setFromCamera(_rayNdc, camera);
  raycaster.far = INTERACT_RANGE;
  const hits = raycaster.intersectObjects(interactableRoots(), true);
  for (const hit of hits) {
    const id = findPropId(hit.object);
    if (id) considerTarget(bag, id, hit.distance, 0);
  }

  camera.getWorldDirection(_dir);
  for (const root of interactableRoots()) {
    if (!root.visible) continue;
    const id = root.userData.propId as string | undefined;
    if (!id) continue;
    root.getWorldPosition(_world);
    _to.copy(_world).sub(camera.position);
    const dist = _to.length();
    if (dist > INTERACT_RANGE || dist < 0.12) continue;
    _to.multiplyScalar(1 / dist);
    const ang = Math.acos(Math.min(1, Math.max(-1, _dir.dot(_to))));
    const def = getProp(id);
    const cone = def?.kind === "carry" || def?.kind === "toggle" ? 0.38 : 0.22;
    if (ang < cone) considerTarget(bag, id, dist, ang);
  }

  let best: { id: string; priority: number; dist: number; ang: number } | null = null;
  for (const c of bag.values()) {
    if (!best) {
      best = c;
      continue;
    }
    if (c.priority < best.priority) {
      best = c;
      continue;
    }
    if (c.priority === best.priority && (c.ang < best.ang - 0.02 || (Math.abs(c.ang - best.ang) <= 0.02 && c.dist < best.dist))) {
      best = c;
    }
  }
  if (!best) return null;
  const def = getProp(best.id);
  return def ? toInfo(def) : null;
}

function updateInteraction(
  camera: THREE.Camera,
  input: ReturnType<typeof sampleInput>,
) {
  const state = useGame.getState();
  if (state.phase !== "playing" && state.phase !== "inspecting") return;

  const info = pickLookTarget(camera);
  if (state.phase === "playing") state.setLookingAt(info);

  if (state.phase === "inspecting") {
    if (input.inspect || input.interact) {
      state.setInspecting(null);
    }
    if (input.drop && state.carrying) {
      state.setInspecting(null);
      dropCarrying();
    }
    return;
  }

  if (input.inspect) {
    const target = state.carrying ?? info;
    if (target && target.kind !== "use") {
      state.setInspecting(target);
      state.markInspected();
      sfx.inspect();
    }
    return;
  }

  if (input.drop && state.carrying) {
    dropCarrying();
    return;
  }

  if (input.interact) {
    if (!info) {
      if (state.carrying) dropCarrying();
      return;
    }
    if (info.kind === "use") {
      handleUse(info);
      return;
    }
    if (info.kind === "toggle" && info.id === "lamp") {
      state.toggleLamp();
      sfx.toggle();
      return;
    }
    if (info.kind === "inspect") {
      state.setInspecting(info);
      state.markInspected();
      sfx.inspect();
      return;
    }
    if (info.carryable) {
      if (state.carrying) {
        if (state.carrying.id === info.id) {
          dropCarrying();
        } else {
          sfx.deny();
          state.setHint("Hands full — drop with G");
        }
        return;
      }
      pickUp(info);
    }
  }
}

function handleUse(info: PropInfo) {
  const state = useGame.getState();
  if (info.id === "door") {
    state.toggleDoor();
    sfx.door();
    return;
  }
  if (info.id === "computer") {
    exitPointerLock();
    state.openComputer();
    sfx.boot();
    return;
  }
  if (info.id === "storage") {
    exitPointerLock();
    state.openStorage();
    sfx.use();
    return;
  }
  if (info.id === "bed") {
    exitPointerLock();
    state.openSleep();
    sfx.use();
    return;
  }
  state.showNotice(info.name, info.blurb);
  sfx.use();
}

function findPropId(obj: THREE.Object3D | null): string | null {
  let o: THREE.Object3D | null = obj;
  while (o) {
    const id = o.userData.propId as string | undefined;
    if (id) return id;
    o = o.parent;
  }
  return null;
}

function pickUp(info: PropInfo) {
  const state = useGame.getState();
  state.setCarrying(info);
  state.markPicked();
  sfx.pickup();
  state.setHint("");
}

function dropCarrying() {
  const state = useGame.getState();
  const carrying = state.carrying;
  if (!carrying) return;
  const def = getProp(carrying.id);
  setLookBasis();
  const x = player.x + _fwd.x * 0.85;
  const z = player.z + _fwd.z * 0.85;
  const y = surfaceY(x, z) + (def?.dropHeight ?? 0.05);
  state.recordDrop(carrying.id, { x, y, z, yaw: player.yaw });
  state.setCarrying(null);
  state.markDropped();
  sfx.drop();
  state.setHint("");
}
