import { useGame } from "../store";

export function InspectOverlay() {
  const item = useGame((s) => s.inspecting);
  const close = useGame((s) => s.setInspecting);

  if (!item) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto w-full max-w-md rounded-xl border border-border bg-surface/95 p-5 shadow-lg">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Inspect</p>
        <h2 className="font-display mt-1 text-2xl text-fg">{item.name}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{item.blurb}</p>
        <button
          type="button"
          onClick={() => close(null)}
          className="mt-4 inline-flex h-11 min-w-28 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg"
        >
          Put back
        </button>
      </div>
    </div>
  );
}
