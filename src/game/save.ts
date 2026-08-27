export type DropPose = { x: number; y: number; z: number; yaw: number };

export type TutorialSave = {
  picked: boolean;
  inspected: boolean;
  dropped: boolean;
};

export type AptSave = {
  version: number;
  lampOn: boolean;
  doorOpen: boolean;
  drops: Record<string, DropPose>;
  tutorial: TutorialSave;
};

export const SAVE_VERSION = 1;
const KEY = "foilbound-apt";

export function defaultSave(): AptSave {
  return {
    version: SAVE_VERSION,
    lampOn: true,
    doorOpen: false,
    drops: {},
    tutorial: { picked: false, inspected: false, dropped: false },
  };
}

export function loadSave(): AptSave {
  const fallback = defaultSave();
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<AptSave>;
    if (parsed.version !== SAVE_VERSION) return fallback;
    return {
      version: SAVE_VERSION,
      lampOn: parsed.lampOn ?? fallback.lampOn,
      doorOpen: parsed.doorOpen ?? fallback.doorOpen,
      drops: parsed.drops ?? {},
      tutorial: { ...fallback.tutorial, ...parsed.tutorial },
    };
  } catch {
    return fallback;
  }
}

export function writeSave(save: AptSave) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...save, version: SAVE_VERSION }));
  } catch {
    /* private mode / quota — keep playing in memory */
  }
}

export function isQaSession() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("qa") === "1";
}
