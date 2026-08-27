import { useRef, type ReactNode } from "react";
import { Hand, Search, ArrowDownToLine, ChevronUp } from "lucide-react";
import { addTouchLook, setInjectedKeys, setTouchJoystick } from "../input";
import { useGame } from "../store";

export function TouchControls() {
  const carrying = useGame((s) => s.carrying);
  const looking = useGame((s) => s.lookingAt);

  return (
    <div className="absolute inset-0 z-10">
      <LookZone />
      <Joystick />
      <div className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 flex flex-col gap-3">
        <RoundBtn
          label="Inspect"
          onPress={() => pulse(["KeyF"])}
          icon={<Search className="size-5" strokeWidth={1.75} />}
        />
        <RoundBtn
          label={carrying ? "Drop" : "Pick up"}
          onPress={() => pulse(carrying ? ["KeyG"] : ["KeyE"])}
          icon={
            carrying ? (
              <ArrowDownToLine className="size-5" strokeWidth={1.75} />
            ) : (
              <Hand className="size-5" strokeWidth={1.75} />
            )
          }
          primary
        />
        {looking?.kind === "toggle" || looking?.kind === "use" ? (
          <RoundBtn label="Use" onPress={() => pulse(["KeyE"])} icon={<Hand className="size-5" />} />
        ) : null}
      </div>
      <button
        type="button"
        aria-label="Sprint"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setInjectedKeys(["ShiftLeft"]);
        }}
        onPointerUp={() => setInjectedKeys([])}
        onPointerCancel={() => setInjectedKeys([])}
        className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-36 flex size-12 items-center justify-center rounded-full border border-border bg-surface/80 text-fg"
      >
        <ChevronUp className="size-5" strokeWidth={1.75} />
      </button>
    </div>
  );
}

function pulse(codes: string[]) {
  setInjectedKeys(codes);
  window.setTimeout(() => setInjectedKeys([]), 80);
}

function RoundBtn({
  label,
  onPress,
  icon,
  primary,
}: {
  label: string;
  onPress: () => void;
  icon: ReactNode;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        e.stopPropagation();
        onPress();
      }}
      className={
        "flex size-14 items-center justify-center rounded-full border border-border " +
        (primary ? "bg-accent text-accent-fg" : "bg-surface/85 text-fg")
      }
    >
      {icon}
    </button>
  );
}

function Joystick() {
  const origin = useRef<{ x: number; y: number; id: number } | null>(null);
  const knob = useRef<HTMLDivElement>(null);

  function setFrom(clientX: number, clientY: number) {
    const o = origin.current;
    if (!o) return;
    const dx = clientX - o.x;
    const dy = clientY - o.y;
    const max = 42;
    const m = Math.hypot(dx, dy);
    const s = m > max ? max / m : 1;
    const x = (dx * s) / max;
    const y = (-dy * s) / max;
    setTouchJoystick(x, y);
    if (knob.current) {
      knob.current.style.transform = `translate(${dx * s}px, ${dy * s}px)`;
    }
  }

  return (
    <div
      className="absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-4 size-28 touch-none rounded-full border border-border bg-surface/50"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        const r = e.currentTarget.getBoundingClientRect();
        origin.current = {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
          id: e.pointerId,
        };
        setFrom(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (origin.current?.id === e.pointerId) setFrom(e.clientX, e.clientY);
      }}
      onPointerUp={() => {
        origin.current = null;
        setTouchJoystick(0, 0);
        if (knob.current) knob.current.style.transform = "translate(0,0)";
      }}
      onPointerCancel={() => {
        origin.current = null;
        setTouchJoystick(0, 0);
        if (knob.current) knob.current.style.transform = "translate(0,0)";
      }}
    >
      <div
        ref={knob}
        className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/80"
      />
    </div>
  );
}

function LookZone() {
  const last = useRef<{ x: number; y: number; id: number } | null>(null);
  return (
    <div
      className="absolute inset-y-0 right-0 w-[58%] touch-none"
      onPointerDown={(e) => {
        last.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        const l = last.current;
        if (!l || l.id !== e.pointerId) return;
        addTouchLook(e.clientX - l.x, e.clientY - l.y);
        last.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
      }}
      onPointerUp={() => {
        last.current = null;
      }}
      onPointerCancel={() => {
        last.current = null;
      }}
    />
  );
}
