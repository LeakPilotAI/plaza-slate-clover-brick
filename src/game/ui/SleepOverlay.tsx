import { tryPointerLock } from "../input";
import { useGame } from "../store";
import { StationFrame } from "./StationFrame";

export function SleepOverlay() {
  const closeStation = useGame((s) => s.closeStation);

  function close() {
    closeStation();
    void tryPointerLock();
  }

  return (
    <StationFrame
      kicker="Bed"
      title="Sleep — Coming Soon"
      onClose={close}
      closeLabel="Not now"
    >
      <p className="text-sm leading-relaxed text-muted">
        Days, energy, and rent wait for the first job. The mattress is here.
        Rest is not.
      </p>
    </StationFrame>
  );
}
