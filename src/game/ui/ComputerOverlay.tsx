import { useState } from "react";
import { Briefcase, Library, LineChart, Lock, Mail } from "lucide-react";
import { tryPointerLock } from "../input";
import { useGame } from "../store";
import { StationFrame } from "./StationFrame";

const APPS = [
  {
    id: "jobs",
    title: "Jobs",
    blurb: "Warehouse and delivery shifts unlock later.",
    locked: true,
    icon: Briefcase,
  },
  {
    id: "market",
    title: "Market",
    blurb: "Lumen Arc prices unlock later.",
    locked: true,
    icon: LineChart,
  },
  {
    id: "collection",
    title: "Collection",
    blurb: "Binders and pulled cards unlock later.",
    locked: true,
    icon: Library,
  },
  {
    id: "mail",
    title: "Mail",
    blurb: "Inbox empty. Landlord notices will land here.",
    locked: false,
    icon: Mail,
  },
] as const;

export function ComputerOverlay() {
  const closeStation = useGame((s) => s.closeStation);
  const [status, setStatus] = useState("Home terminal · Apt 4B");

  function close() {
    closeStation();
    void tryPointerLock();
  }

  return (
    <StationFrame kicker="Unit 4B" title="Home terminal" onClose={close}>
      <p className="text-sm leading-relaxed text-muted">
        A cheap tower and a cracked monitor. Jobs, the market, and collection
        tools will live on this machine. Nothing is online yet.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {APPS.map((app) => {
          const Icon = app.icon;
          return (
            <button
              key={app.id}
              type="button"
              onClick={() => setStatus(app.blurb)}
              className="flex min-h-20 flex-col items-start rounded-lg border border-border bg-surface-2 p-3 text-left"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-fg">
                <Icon className="size-4" strokeWidth={1.75} />
                {app.title}
                {app.locked ? (
                  <Lock className="size-3.5 text-subtle" strokeWidth={1.75} />
                ) : null}
              </span>
              <span className="mt-1 text-xs text-muted">
                {app.locked ? "Locked" : "Empty"}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 font-mono text-xs leading-relaxed text-subtle">{status}</p>
    </StationFrame>
  );
}
