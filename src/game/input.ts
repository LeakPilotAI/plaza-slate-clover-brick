import { MOUSE_SENS, TOUCH_LOOK_SENS } from "./constants";
import { useGame } from "./store";

const keys = new Set<string>();
const injected = new Set<string>();
const mouse = { left: false, right: false };
const lookAccum = { x: 0, y: 0 };
const lookRate = { x: 0, y: 0 };
const touchMove = { x: 0, y: 0 };
const padMove = { x: 0, y: 0 };
const prev = {
  interact: false,
  inspect: false,
  drop: false,
  pause: false,
  jump: false,
  debug: false,
};

let canvasEl: HTMLCanvasElement | null = null;
let lockArmed = false;

const GAME_CODES = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyE",
  "KeyF",
  "KeyG",
  "KeyQ",
  "ShiftLeft",
  "ShiftRight",
  "Space",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Escape",
  "F3",
  "Backquote",
]);

function down(code: string) {
  return keys.has(code) || injected.has(code);
}

function radialDeadzone(x: number, y: number, dz = 0.16) {
  const m = Math.hypot(x, y);
  if (m < dz) return { x: 0, y: 0 };
  const scale = (m - dz) / (1 - dz) / m;
  return { x: x * scale, y: y * scale };
}

function onKeyDown(e: KeyboardEvent) {
  if (e.repeat) {
    if (GAME_CODES.has(e.code)) e.preventDefault();
    return;
  }
  keys.add(e.code);
  if (GAME_CODES.has(e.code)) e.preventDefault();
}

function onKeyUp(e: KeyboardEvent) {
  keys.delete(e.code);
}

function onBlur() {
  keys.clear();
  mouse.left = false;
  mouse.right = false;
}

function onMouseDown(e: MouseEvent) {
  if (e.button === 0) mouse.left = true;
  if (e.button === 2) mouse.right = true;
}

function onMouseUp(e: MouseEvent) {
  if (e.button === 0) mouse.left = false;
  if (e.button === 2) mouse.right = false;
}

function onMouseMove(e: MouseEvent) {
  const locked = document.pointerLockElement === canvasEl;
  if (locked) {
    lookAccum.x += e.movementX;
    lookAccum.y += e.movementY;
    return;
  }
  if (mouse.left && useGame.getState().phase === "playing" && canvasEl) {
    lookAccum.x += e.movementX;
    lookAccum.y += e.movementY;
  }
}

function onPointerLockChange() {
  const locked = document.pointerLockElement === canvasEl;
  useGame.getState().setPointerLocked(locked);
  if (!locked && useGame.getState().phase === "playing" && lockArmed) {
    // ESC unlocks — treat as pause on desktop.
    if (!useGame.getState().isTouch) useGame.getState().pause();
  }
}

function onContextMenu(e: Event) {
  e.preventDefault();
}

function pollGamepad() {
  lookRate.x = 0;
  lookRate.y = 0;
  padMove.x = 0;
  padMove.y = 0;
  if (typeof navigator === "undefined" || !navigator.getGamepads) return;
  const pads = navigator.getGamepads();
  const p = pads[0] ?? pads[1];
  if (!p) {
    keys.delete("PadInteract");
    keys.delete("PadInspect");
    keys.delete("PadDrop");
    keys.delete("PadSprint");
    return;
  }
  const l = radialDeadzone(p.axes[0] ?? 0, -(p.axes[1] ?? 0));
  padMove.x = l.x;
  padMove.y = l.y;
  const r = radialDeadzone(p.axes[2] ?? 0, p.axes[3] ?? 0, 0.12);
  lookRate.x = r.x;
  lookRate.y = r.y;
  if (p.buttons[0]?.pressed) keys.add("PadInteract");
  else keys.delete("PadInteract");
  if (p.buttons[2]?.pressed) keys.add("PadInspect");
  else keys.delete("PadInspect");
  if (p.buttons[1]?.pressed) keys.add("PadDrop");
  else keys.delete("PadDrop");
  if (p.buttons[10]?.pressed || (p.buttons[6]?.value ?? 0) > 0.5) {
    keys.add("PadSprint");
  } else keys.delete("PadSprint");
}

export function setTouchJoystick(x: number, y: number) {
  touchMove.x = x;
  touchMove.y = y;
}

export function addTouchLook(dx: number, dy: number) {
  const scale = TOUCH_LOOK_SENS / MOUSE_SENS;
  lookAccum.x += dx * scale;
  lookAccum.y += dy * scale;
}

export function setInjectedKeys(codes: string[]) {
  injected.clear();
  for (const c of codes) injected.add(c);
  if (codes.length && useGame.getState().phase === "boot") {
    useGame.getState().start();
  }
}

export function clearInjectedKeys() {
  injected.clear();
}

export async function tryPointerLock() {
  if (!canvasEl) return;
  const phase = useGame.getState().phase;
  if (phase !== "playing") return;
  if (useGame.getState().isTouch) return;
  if (document.pointerLockElement === canvasEl) return;
  lockArmed = true;
  try {
    const req = canvasEl.requestPointerLock as (
      opts?: { unadjustedMovement?: boolean },
    ) => Promise<void> | void;
    const result = req.call(canvasEl, { unadjustedMovement: true });
    if (result && typeof (result as Promise<void>).catch === "function") {
      await (result as Promise<void>).catch(async () => {
        try {
          await (canvasEl as HTMLCanvasElement).requestPointerLock();
        } catch {
          lockArmed = false;
        }
      });
    }
  } catch {
    lockArmed = false;
  }
}

export function exitPointerLock() {
  lockArmed = false;
  if (document.pointerLockElement) document.exitPointerLock();
}

export function attachInput(canvas: HTMLCanvasElement) {
  canvasEl = canvas;
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  document.addEventListener("visibilitychange", onBlur);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mouseup", onMouseUp);
  document.addEventListener("pointerlockchange", onPointerLockChange);
  canvas.addEventListener("contextmenu", onContextMenu);
  canvas.style.touchAction = "none";

  return () => {
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
    document.removeEventListener("visibilitychange", onBlur);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mousedown", onMouseDown);
    window.removeEventListener("mouseup", onMouseUp);
    document.removeEventListener("pointerlockchange", onPointerLockChange);
    canvas.removeEventListener("contextmenu", onContextMenu);
    if (document.pointerLockElement === canvas) document.exitPointerLock();
    canvasEl = null;
    keys.clear();
    injected.clear();
  };
}

export type FrameInput = {
  moveX: number;
  moveY: number;
  lookDx: number;
  lookDy: number;
  lookRateX: number;
  lookRateY: number;
  sprint: boolean;
  jump: boolean;
  interact: boolean;
  inspect: boolean;
  drop: boolean;
  pause: boolean;
  debug: boolean;
};

export function sampleInput(): FrameInput {
  pollGamepad();

  let moveX = 0;
  let moveY = 0;
  if (down("KeyW") || down("ArrowUp")) moveY += 1;
  if (down("KeyS") || down("ArrowDown")) moveY -= 1;
  if (down("KeyD") || down("ArrowRight")) moveX += 1;
  if (down("KeyA") || down("ArrowLeft")) moveX -= 1;
  moveX += touchMove.x + padMove.x;
  moveY += touchMove.y + padMove.y;
  const mag = Math.hypot(moveX, moveY);
  if (mag > 1) {
    moveX /= mag;
    moveY /= mag;
  }

  const interact =
    down("KeyE") ||
    down("PadInteract") ||
    (useGame.getState().pointerLocked && mouse.left);
  const inspect = down("KeyF") || down("PadInspect");
  const drop = down("KeyG") || down("KeyQ") || down("PadDrop");
  const pause = down("Escape");
  const jump = down("Space");
  const debug = down("F3") || down("Backquote");
  const sprint =
    down("ShiftLeft") || down("ShiftRight") || down("PadSprint");

  const just = {
    interact: interact && !prev.interact,
    inspect: inspect && !prev.inspect,
    drop: drop && !prev.drop,
    pause: pause && !prev.pause,
    jump: jump && !prev.jump,
    debug: debug && !prev.debug,
  };
  prev.interact = interact;
  prev.inspect = inspect;
  prev.drop = drop;
  prev.pause = pause;
  prev.jump = jump;
  prev.debug = debug;

  const lookDx = lookAccum.x;
  const lookDy = lookAccum.y;
  lookAccum.x = 0;
  lookAccum.y = 0;

  return {
    moveX,
    moveY,
    lookDx,
    lookDy,
    lookRateX: lookRate.x,
    lookRateY: lookRate.y,
    sprint,
    jump: just.jump,
    interact: just.interact,
    inspect: just.inspect,
    drop: just.drop,
    pause: just.pause,
    debug: just.debug,
  };
}
