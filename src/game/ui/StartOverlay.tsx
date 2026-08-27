import { unlockAudio } from "../audio";
import { tryPointerLock } from "../input";
import { useGame } from "../store";

export function StartOverlay() {
  const start = useGame((s) => s.start);
  const isTouch = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  function enter() {
    unlockAudio();
    start();
    void tryPointerLock();
  }

  return (
    <div className="overlay-fade absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-bg via-bg/80 to-bg/30 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:justify-center sm:p-12">
      <div className="mx-auto w-full max-w-lg">
        <p className="reveal text-xs font-medium uppercase tracking-[0.22em] text-muted">
          Apt 4B · Home
        </p>
        <h1 className="reveal reveal-d1 font-display mt-2 text-5xl leading-none tracking-tight text-fg sm:text-6xl">
          Foilbound
        </h1>
        <p className="reveal reveal-d2 mt-4 max-w-md text-base leading-relaxed text-muted">
          A cheap starter apartment. Bed, desk, a sealed Lumen Arc pack. This is
          yours now.
        </p>

        <button
          id="enter-apartment"
          type="button"
          onClick={enter}
          className="reveal reveal-d3 mt-8 inline-flex h-12 min-w-44 items-center justify-center rounded-lg bg-accent px-6 text-sm font-medium text-accent-fg transition-transform duration-[var(--motion-quick,150ms)] hover:brightness-105 active:scale-[0.98]"
        >
          Enter Apartment
        </button>

        <dl className="reveal reveal-d4 mt-8 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted sm:grid-cols-3">
          <Control k={isTouch ? "Left stick" : "WASD"} v="Walk" />
          <Control k={isTouch ? "Right drag" : "Mouse"} v="Look" />
          <Control k={isTouch ? "Hold sprint" : "Shift"} v="Sprint" />
          <Control k={isTouch ? "Hand" : "E"} v="Use / Pick up" />
          <Control k={isTouch ? "Search" : "F"} v="Inspect" />
          <Control k={isTouch ? "Drop" : "G"} v="Drop" />
        </dl>
      </div>
    </div>
  );
}

function Control({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="font-mono text-xs uppercase tracking-wide text-fg">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
