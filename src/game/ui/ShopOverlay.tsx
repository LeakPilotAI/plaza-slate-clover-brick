import { tryPointerLock } from "../input";
import { useGame } from "../store";
import { StationFrame } from "./StationFrame";

export function ShopOverlay() {
  const closeStation = useGame((s) => s.closeStation);

  function close() {
    closeStation();
    void tryPointerLock();
  }

  return (
    <StationFrame
      kicker="Ash Street"
      title="Lumen Arc Cards"
      onClose={close}
      closeLabel="Not now"
    >
      <p className="text-sm leading-relaxed text-muted">
        Opening soon. Sealed product, singles, and the market wait behind this
        door. Come back when you can pay.
      </p>
    </StationFrame>
  );
}
