import { create } from "zustand";
import { resetPlayer } from "./playerState";
import type { Notice, Phase, PropInfo } from "./types";

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
  doorOpen: boolean;
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
  toggleLamp: () => void;
  toggleDoor: () => void;
  /** Stub for the future computer UI (jobs, market, collection). */
  useComputer: () => void;
  showNotice: (title: string, body: string) => void;
  clearNotice: () => void;
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

let noticeTimer: number | undefined;

export const useGame = create<GameState>((set, get) => ({
  phase: "boot",
  lookingAt: null,
  carrying: null,
  inspecting: null,
  lampOn: true,
  doorOpen: false,
  notice: null,
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
      doorOpen: false,
      notice: null,
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
  toggleDoor: () => set({ doorOpen: !get().doorOpen }),
  useComputer: () => {
    get().showNotice(
      "Computer — Coming Soon",
      "Jobs, the market, and collection tools will live here.",
    );
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
  return "This is yours. Look around.";
}

export function interactPrompt(
  looking: PropInfo | null,
  carrying: PropInfo | null,
  doorOpen = false,
) {
  if (!looking) {
    return carrying ? "G drop" : null;
  }
  if (looking.kind === "toggle") return `E  ${looking.name}`;
  if (looking.kind === "use") {
    if (looking.id === "door") return doorOpen ? "E  Close" : "E  Open";
    return `E  ${looking.useLabel ?? looking.name}`;
  }
  if (looking.kind === "inspect") return `F  Inspect ${looking.name}`;
  if (carrying) {
    if (carrying.id === looking.id) return "G  Drop";
    return "Hands full — drop first";
  }
  return `E  Pick up ${looking.name}`;
}
