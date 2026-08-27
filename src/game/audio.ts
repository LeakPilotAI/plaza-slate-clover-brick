let ctx: AudioContext | null = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function unlockAudio() {
  getCtx();
}

function tone(
  freq: number,
  dur: number,
  type: OscillatorType,
  gain = 0.05,
  slide?: number,
) {
  const ac = getCtx();
  if (!ac) return;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ac.currentTime);
  if (slide) {
    o.frequency.exponentialRampToValueAtTime(
      Math.max(40, freq * slide),
      ac.currentTime + dur,
    );
  }
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0008, ac.currentTime + dur);
  o.connect(g);
  g.connect(ac.destination);
  o.start();
  o.stop(ac.currentTime + dur + 0.02);
}

export const sfx = {
  pickup: () => {
    tone(420, 0.08, "triangle", 0.04);
    tone(640, 0.12, "sine", 0.03, 1.4);
  },
  drop: () => tone(180, 0.1, "square", 0.03, 0.6),
  inspect: () => tone(520, 0.16, "sine", 0.035, 1.15),
  toggle: () => tone(300, 0.07, "square", 0.025),
  step: () => tone(90 + Math.random() * 20, 0.05, "triangle", 0.02),
  deny: () => tone(140, 0.12, "sawtooth", 0.02, 0.7),
  use: () => tone(380, 0.1, "sine", 0.03),
  door: () => {
    tone(170, 0.16, "triangle", 0.035, 0.55);
    tone(90, 0.2, "square", 0.012, 0.7);
  },
};
