import { create } from "zustand";
import { resetPlayer } from "./playerState";
import type { Phase, PropInfo } from "./types";

type Tutorial = {
  picked: boolean;
  inspected: boolean;
  dropped: boolean;
};

type GameState = {
  phase: Phase;
  lookingAt: PropInfo | null;
  carrying: PropInfo | null;
  inspecting: PropInfo | null;
  lampOn: boolean;
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
  toggleLamp: () => void;
  setPointerLocked: (v: boolean) => void;
  setTouch: (v: boolean) => void;
  markPicked: () => void;
  markInspected: () => void;
  markDropped: () => void;
  setHint: (hint: string) => void;
  toggleDebug: () => void;
};

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

export const useGame = create<GameState>((set, get) => ({
  phase: "boot",
  lookingAt: null,
  carrying: null,
  inspecting: null,
  lampOn: true,
  pointerLocked: false,
  isTouch: false,
  debug: false,
  tutorial: { picked: false, inspected: false, dropped: false },
  hint: "",
  start: () => {
    if (get().phase === "playing") return;
    resetPlayer();
    set({
      phase: "playing",
      isTouch: isTouchDevice(),
    });
  },
  pause: () => {
    const { phase } = get();
    if (phase === "playing") set({ phase: "paused" });
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
  toggleLamp: () => set({ lampOn: !get().lampOn }),
  setPointerLocked: (v) => set({ pointerLocked: v }),
  setTouch: (v) => set({ isTouch: v }),
  markPicked: () =>
    set({ tutorial: { ...get().tutorial, picked: true } }),
  markInspected: () =>
    set({ tutorial: { ...get().tutorial, inspected: true } }),
  markDropped: () =>
    set({ tutorial: { ...get().tutorial, dropped: true } }),
  setHint: (hint) => {
    if (get().hint === hint) return;
    set({ hint });
  },
  toggleDebug: () => set({ debug: !get().debug }),
}));

export function objectiveText(t: Tutorial) {
  if (!t.picked) return "Pick up the booster pack";
  if (!t.inspected) return "Inspect what you are holding";
  if (!t.dropped) return "Set it back down";
  return "Prototype loop complete — keep exploring";
}

export function interactPrompt(looking: PropInfo | null, carrying: PropInfo | null) {
  if (!looking) {
    return carrying ? "G drop" : null;
  }
  if (looking.kind === "toggle") return `E  ${looking.name}`;
  if (looking.kind === "inspect") return `F  Inspect ${looking.name}`;
  if (carrying) {
    if (carrying.id === looking.id) return "G  Drop";
    return "Hands full — drop first";
  }
  return `E  Pick up ${looking.name}`;
}
