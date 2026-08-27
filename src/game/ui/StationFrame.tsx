import type { ReactNode } from "react";

export function StationFrame({
  kicker,
  title,
  children,
  onClose,
  closeLabel = "Close",
}: {
  kicker: string;
  title: string;
  children: ReactNode;
  onClose: () => void;
  closeLabel?: string;
}) {
  return (
    <div className="overlay-fade absolute inset-0 z-20 flex items-end justify-center bg-bg/70 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center">
      <div className="flex w-full max-w-lg flex-col rounded-2xl border border-border bg-surface p-5 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
              {kicker}
            </p>
            <h2 className="font-display mt-1 text-2xl text-fg">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 min-w-24 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg active:scale-[0.98]"
          >
            {closeLabel}
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
