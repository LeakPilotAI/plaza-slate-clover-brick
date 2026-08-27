import { tryPointerLock } from "../input";
import { useGame } from "../store";

export function PauseOverlay() {
  const resume = useGame((s) => s.resume);

  return (
    <div className="overlay-fade absolute inset-0 z-20 flex items-center justify-center bg-bg/70 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">Paused</p>
        <h2 className="font-display mt-2 text-3xl text-fg">Studio</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Pointer lock releases with Escape. Resume to keep walking.
        </p>
        <button
          type="button"
          onClick={() => {
            resume();
            void tryPointerLock();
          }}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-accent text-sm font-medium text-accent-fg active:scale-[0.98]"
        >
          Resume
        </button>
      </div>
    </div>
  );
}
