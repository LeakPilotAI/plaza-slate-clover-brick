import { interactPrompt, objectiveText, useGame, zoneLabel } from "../store";
import { horizontalSpeed, player } from "../playerState";
import { useEffect, useState } from "react";

export function Hud() {
  const lookingAt = useGame((s) => s.lookingAt);
  const carrying = useGame((s) => s.carrying);
  const tutorial = useGame((s) => s.tutorial);
  const hint = useGame((s) => s.hint);
  const notice = useGame((s) => s.notice);
  const doorOpen = useGame((s) => s.doorOpen);
  const exitOpen = useGame((s) => s.exitOpen);
  const zone = useGame((s) => s.zone);
  const pointerLocked = useGame((s) => s.pointerLocked);
  const isTouch = useGame((s) => s.isTouch);
  const debug = useGame((s) => s.debug);
  const prompt = interactPrompt(lookingAt, carrying, doorOpen, exitOpen);
  const objective = objectiveText(tutorial, zone);
  const loc = zoneLabel(zone);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-fg">
      <div className="absolute left-4 top-4 max-w-[16rem] sm:left-6 sm:top-6">
        <p className="font-display text-xl tracking-tight">Foilbound</p>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted">{loc.kicker}</p>
        <p className="mt-4 text-sm text-fg">{objective}</p>
        {hint ? <p className="mt-2 text-xs text-danger">{hint}</p> : null}
      </div>

      <div className="absolute right-4 top-4 text-right sm:right-6 sm:top-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{loc.area}</p>
        {carrying ? (
          <p className="mt-2 text-sm text-fg">Holding {carrying.name}</p>
        ) : (
          <p className="mt-2 text-sm text-muted">Hands empty</p>
        )}
      </div>

      {notice ? (
        <div className="absolute left-1/2 top-20 w-max max-w-[90vw] -translate-x-1/2 rounded-md border border-border bg-surface/92 px-4 py-3 text-center sm:top-24">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
            {notice.title}
          </p>
          <p className="mt-1 max-w-sm text-sm text-fg">{notice.body}</p>
        </div>
      ) : null}

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-4 w-4">
          <span className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-accent/80" />
          <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-accent/80" />
        </div>
      </div>

      {prompt ? (
        <div className="absolute bottom-24 left-1/2 w-max max-w-[90vw] -translate-x-1/2 rounded-md border border-border bg-surface/90 px-3 py-2 text-center text-sm text-fg sm:bottom-16">
          {prompt}
        </div>
      ) : null}

      {!isTouch && !pointerLocked ? (
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-xs text-muted">
          Click the apartment to lock the mouse. Drag if lock is blocked.
        </p>
      ) : null}

      {debug ? <DebugPanel /> : null}
    </div>
  );
}

function DebugPanel() {
  const [, setN] = useState(0);
  const looking = useGame((s) => s.lookingAt);
  const doorOpen = useGame((s) => s.doorOpen);
  useEffect(() => {
    const id = window.setInterval(() => setN((n) => n + 1), 120);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 rounded-md border border-border bg-surface/90 p-3 font-mono text-[11px] leading-relaxed text-muted">
      <div>
        pos {player.x.toFixed(2)} {player.y.toFixed(2)} {player.z.toFixed(2)}
      </div>
      <div>
        yaw {player.yaw.toFixed(2)} pitch {player.pitch.toFixed(2)}
      </div>
      <div>spd {horizontalSpeed().toFixed(2)}</div>
      <div>look {looking?.id ?? "—"}</div>
      <div>door {doorOpen ? "open" : "shut"}</div>
      <div>F3 hide</div>
    </div>
  );
}
