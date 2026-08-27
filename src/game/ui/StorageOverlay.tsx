import { tryPointerLock } from "../input";
import { useGame } from "../store";
import { StationFrame } from "./StationFrame";

export function StorageOverlay() {
  const closeStation = useGame((s) => s.closeStation);

  function close() {
    closeStation();
    void tryPointerLock();
  }

  return (
    <StationFrame kicker="Plastic bin" title="Storage — Empty" onClose={close}>
      <p className="text-sm leading-relaxed text-muted">
        Eight slots. No product yet. Sealed packs and extras will land here after
        you can actually buy them.
      </p>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="aspect-square rounded-md border border-border bg-surface-2"
          />
        ))}
      </div>
    </StationFrame>
  );
}
