import { create } from "zustand";
import { resetPlayer } from "./playerState";
import {
  defaultSave,
  isQaSession,
  loadSave,
  writeSave,
  SAVE_VERSION,
  type AptSave,
  type DropPose,
} from "./save";
import { EXIT, SHOP } from "./town/layout";
import { ROOM } from "./layout";
import type { Notice, Phase, PropInfo, Zone } from "./types";

type Tutorial = AptSave["tutorial"];

type GameState = {
  phase: Phase;
  lookingAt: PropInfo | null;
  carrying: PropInfo | null;
  inspecting: PropInfo | null;
  lampOn: boolean;
  doorOpen: boolean;
  exitOpen: boolean;
  zone: Zone;
  drops: Record<string, DropPose>;
  notice: Notice | null;
  pointerLocked: boolean;
  isTouch: boolean;
  debug: boolean;
  tutorial: Tutorial;
  hint: string;
  start: () => void;
  pause: () => void;
  resume: () => void;
  setLookingAt: (info: PropInfo | null) => void;
  setCarrying: (info: PropInfo | null) => void;
  setInspecting: (info: PropInfo | null) => void;
  recordDrop: (id: string, pose: DropPose) => void;
  toggleLamp: () => void;
  toggleDoor: () => void;
  toggleExit: () => void;
  openComputer: () => void;
  openStorage: () => void;
  openSleep: () => void;
  openShop: () => void;
  closeStation: () => void;
  setZone: (zone: Zone) => void;
  showNotice: (title: string, body: string) => void;
  clearNotice: () => void;
  setPointerLocked: (v: boolean) => void;
  setTouch: (v: boolean) => void;
  markPicked: () => void;
  markInspected: () => void;
  markDropped: () => void;
  setHint: (hint: string) => void;
  toggleDebug: () => void;
  flushSave: () => void;
};

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

let noticeTimer: number | undefined;

function snapshot(s: GameState): AptSave {
  return {
    version: SAVE_VERSION,
    lampOn: s.lampOn,
    doorOpen: s.doorOpen,
    drops: s.drops,
    tutorial: s.tutorial,
  };
}

export const useGame = create<GameState>((set, get) => ({
  phase: "boot",
  lookingAt: null,
  carrying: null,
  inspecting: null,
  lampOn: true,
  doorOpen: false,
  exitOpen: false,
  zone: "home",
  drops: {},
  notice: null,
  pointerLocked: false,
  isTouch: false,
  debug: false,
  tutorial: { picked: false, inspected: false, dropped: false },
  hint: "",
  start: () => {
    if (get().phase === "playing") return;
    resetPlayer();
    const saved = isQaSession() ? defaultSave() : loadSave();
    set({
      phase: "playing",
      isTouch: isTouchDevice(),
      lampOn: saved.lampOn,
      doorOpen: saved.doorOpen,
      exitOpen: false,
      zone: "home",
      drops: saved.drops,
      tutorial: saved.tutorial,
      notice: null,
      carrying: null,
      inspecting: null,
      hint: "",
    });
  },
  pause: () => {
    if (get().phase === "playing") set({ phase: "paused" });
  },
  resume: () => {
    if (get().phase === "paused") set({ phase: "playing" });
  },
  setLookingAt: (info) => {
    const cur = get().lookingAt;
    if (cur?.id === info?.id) return;
    set({ lookingAt: info });
  },
  setCarrying: (info) => set({ carrying: info }),
  setInspecting: (info) =>
    set({
      inspecting: info,
      phase: info ? "inspecting" : "playing",
    }),
  recordDrop: (id, pose) => {
    set({ drops: { ...get().drops, [id]: pose } });
    get().flushSave();
  },
  toggleLamp: () => {
    set({ lampOn: !get().lampOn });
    get().flushSave();
  },
  toggleDoor: () => {
    set({ doorOpen: !get().doorOpen });
    get().flushSave();
  },
  toggleExit: () => {
    set({ exitOpen: !get().exitOpen });
  },
  openComputer: () => {
    if (get().phase === "playing") set({ phase: "computer", lookingAt: null });
  },
  openStorage: () => {
    if (get().phase === "playing") set({ phase: "storage", lookingAt: null });
  },
  openSleep: () => {
    if (get().phase === "playing") set({ phase: "sleeping", lookingAt: null });
  },
  openShop: () => {
    if (get().phase === "playing") set({ phase: "shop", lookingAt: null });
  },
  closeStation: () => {
    const { phase } = get();
    if (
      phase === "computer" ||
      phase === "storage" ||
      phase === "sleeping" ||
      phase === "shop"
    ) {
      set({ phase: "playing" });
    }
  },
  setZone: (zone) => {
    if (get().zone === zone) return;
    set({ zone });
  },
  showNotice: (title, body) => {
    if (typeof window !== "undefined" && noticeTimer) {
      window.clearTimeout(noticeTimer);
    }
    set({ notice: { title, body } });
    if (typeof window !== "undefined") {
      noticeTimer = window.setTimeout(() => {
        if (get().notice?.title === title) set({ notice: null });
      }, 2800);
    }
  },
  clearNotice: () => {
    if (typeof window !== "undefined" && noticeTimer) {
      window.clearTimeout(noticeTimer);
    }
    set({ notice: null });
  },
  setPointerLocked: (v) => set({ pointerLocked: v }),
  setTouch: (v) => set({ isTouch: v }),
  markPicked: () => {
    set({ tutorial: { ...get().tutorial, picked: true } });
    get().flushSave();
  },
  markInspected: () => {
    set({ tutorial: { ...get().tutorial, inspected: true } });
    get().flushSave();
  },
  markDropped: () => {
    set({ tutorial: { ...get().tutorial, dropped: true } });
    get().flushSave();
  },
  setHint: (hint) => {
    if (get().hint === hint) return;
    set({ hint });
  },
  toggleDebug: () => set({ debug: !get().debug }),
  flushSave: () => {
    if (isQaSession()) return;
    writeSave(snapshot(get()));
  },
}));

export function zoneFromPos(x: number, z: number): Zone {
  if (z < ROOM.halfD + 0.15) return "home";
  if (z < EXIT.z - 0.15) return "hall";
  if (z > SHOP.z0 - 2.4 && Math.abs(x - SHOP.x) < SHOP.width / 2 + 0.8) return "shop";
  return "street";
}

export function zoneLabel(zone: Zone) {
  if (zone === "home") return { kicker: "Apt 4B · Home", area: "Home" };
  if (zone === "hall") return { kicker: "Building 14 · Hall", area: "Hall" };
  if (zone === "shop") return { kicker: "Lumen Arc Cards", area: "Shop" };
  return { kicker: "Ash Street", area: "Street" };
}

export function objectiveText(t: Tutorial, zone: Zone = "home") {
  if (!t.picked) return "Pick up the booster pack";
  if (!t.inspected) return "Inspect what you are holding";
  if (!t.dropped) return "Set it back down";
  if (zone === "home" || zone === "hall") return "The street is through the hall.";
  if (zone === "shop") return "Closed. Come back later.";
  return "Find Lumen Arc Cards.";
}

export function interactPrompt(
  looking: PropInfo | null,
  carrying: PropInfo | null,
  doorOpen = false,
  exitOpen = false,
) {
  if (!looking) {
    return carrying ? "G drop" : null;
  }
  if (looking.kind === "toggle") return `E  ${looking.name}`;
  if (looking.kind === "use") {
    if (looking.id === "door") return doorOpen ? "E  Close" : "E  Open";
    if (looking.id === "exit") return exitOpen ? "E  Close" : "E  Open";
    return `E  ${looking.useLabel ?? looking.name}`;
  }
  if (looking.kind === "inspect") return `F  Inspect ${looking.name}`;
  if (carrying) {
    if (carrying.id === looking.id) return "G  Drop";
    return "Hands full — drop first";
  }
  return `E  Pick up ${looking.name}`;
}
