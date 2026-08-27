import * as THREE from "three";

function canvasTexture(
  size: number,
  paint: (ctx: CanvasRenderingContext2D, size: number) => void,
  h?: number,
) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = h ?? size;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2d context");
  paint(ctx, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

export function makeWoodTexture() {
  const tex = canvasTexture(1024, (g, s) => {
    g.fillStyle = "#4a3426";
    g.fillRect(0, 0, s, s);
    const h = 72;
    for (let y = 0; y < s; y += h) {
      const light = 26 + ((y * 13) % 9);
      g.fillStyle = `hsl(24, 28%, ${light}%)`;
      g.fillRect(0, y, s, h - 2);
      g.strokeStyle = "rgba(20,12,8,0.35)";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(0, y + h - 1);
      g.lineTo(s, y + h - 1);
      g.stroke();
      g.strokeStyle = "rgba(90,60,36,0.18)";
      g.lineWidth = 1;
      for (let i = 0; i < 7; i++) {
        const yy = y + 8 + ((i * 47 + y) % (h - 16));
        g.beginPath();
        g.moveTo(0, yy);
        g.bezierCurveTo(s * 0.3, yy + 3, s * 0.6, yy - 2, s, yy + 1);
        g.stroke();
      }
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 3);
  return tex;
}

export function makeLaminateTexture() {
  const tex = canvasTexture(512, (g, s) => {
    g.fillStyle = "#8a7460";
    g.fillRect(0, 0, s, s);
    const h = 48;
    for (let y = 0; y < s; y += h) {
      const light = 42 + ((y * 9) % 8);
      g.fillStyle = `hsl(28, 22%, ${light}%)`;
      g.fillRect(0, y, s, h - 1);
      g.strokeStyle = "rgba(40,28,18,0.28)";
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(0, y + h - 1);
      g.lineTo(s, y + h - 1);
      g.stroke();
      g.strokeStyle = "rgba(120,90,60,0.12)";
      for (let i = 0; i < 5; i++) {
        const yy = y + 6 + ((i * 31 + y) % (h - 10));
        g.beginPath();
        g.moveTo(0, yy);
        g.lineTo(s, yy + (i % 2 === 0 ? 1 : -1));
        g.stroke();
      }
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 6);
  return tex;
}

export function makeLinoleumTexture() {
  const tex = canvasTexture(256, (g, s) => {
    g.fillStyle = "#4a4842";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(0,0,0,${0.04 + Math.random() * 0.06})`;
      g.fillRect(Math.random() * s, Math.random() * s, 2, 2);
    }
    g.strokeStyle = "rgba(0,0,0,0.12)";
    g.lineWidth = 2;
    for (let x = 0; x < s; x += 64) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, s);
      g.stroke();
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 4);
  return tex;
}

export function makePlasterTexture() {
  const tex = canvasTexture(512, (g, s) => {
    g.fillStyle = "#d8d0c2";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 1800; i++) {
      const x = Math.random() * s;
      const y = Math.random() * s;
      const a = 0.03 + Math.random() * 0.05;
      g.fillStyle = `rgba(90,80,70,${a})`;
      g.fillRect(x, y, 2, 2);
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
}

export function makeCityTexture() {
  return canvasTexture(512, (g, s) => {
    const sky = g.createLinearGradient(0, 0, 0, s);
    sky.addColorStop(0, "#1b2436");
    sky.addColorStop(0.55, "#3a2a28");
    sky.addColorStop(1, "#c47a4a");
    g.fillStyle = sky;
    g.fillRect(0, 0, s, s);
    g.fillStyle = "#121014";
    g.fillRect(0, s * 0.58, s, s * 0.42);
    for (let i = 0; i < 18; i++) {
      const bw = 18 + ((i * 17) % 28);
      const bh = 60 + ((i * 29) % 120);
      const x = (i * 31) % (s - bw);
      const y = s * 0.58 - bh;
      g.fillStyle = i % 4 === 0 ? "#1a1820" : "#141218";
      g.fillRect(x, y, bw, bh);
      g.fillStyle = "#e6c48a";
      for (let wy = y + 6; wy < y + bh - 6; wy += 8) {
        for (let wx = x + 3; wx < x + bw - 3; wx += 6) {
          if (Math.random() > 0.45) g.fillRect(wx, wy, 3, 4);
        }
      }
    }
  });
}

export function makeRugTexture() {
  const tex = canvasTexture(256, (g, s) => {
    g.fillStyle = "#3d322c";
    g.fillRect(0, 0, s, s);
    g.strokeStyle = "#cfc3b0";
    g.lineWidth = 10;
    g.strokeRect(12, 12, s - 24, s - 24);
    g.strokeStyle = "#6a5346";
    g.lineWidth = 2;
    g.strokeRect(22, 22, s - 44, s - 44);
  });
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

export function makeCardPoster(title: string, hue: number) {
  return canvasTexture(512, (g, s) => {
    g.fillStyle = "#1c1a18";
    g.fillRect(0, 0, s, s);
    g.fillStyle = `hsl(${hue}, 18%, 28%)`;
    g.fillRect(28, 28, s - 56, s - 56);
    g.fillStyle = `hsl(${hue}, 22%, 46%)`;
    g.beginPath();
    g.moveTo(s * 0.2, s * 0.62);
    g.lineTo(s * 0.5, s * 0.22);
    g.lineTo(s * 0.82, s * 0.66);
    g.closePath();
    g.fill();
    g.fillStyle = "#f2ece3";
    g.font = "600 28px serif";
    g.textAlign = "center";
    g.fillText(title, s / 2, s - 48);
    g.font = "16px sans-serif";
    g.fillStyle = "#cfc3b0";
    g.fillText("LUMEN ARC", s / 2, s - 24);
  });
}

export function makeCardboardTexture() {
  const tex = canvasTexture(256, (g, s) => {
    g.fillStyle = "#c4a574";
    g.fillRect(0, 0, s, s);
    g.strokeStyle = "rgba(90,60,30,0.25)";
    for (let i = 0; i < 40; i++) {
      g.beginPath();
      g.moveTo(0, i * 7);
      g.lineTo(s, i * 7 + 4);
      g.stroke();
    }
    g.strokeStyle = "rgba(70,45,20,0.35)";
    g.strokeRect(8, 8, s - 16, s - 16);
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

export function makeSheetTexture() {
  const tex = canvasTexture(256, (g, s) => {
    g.fillStyle = "#c9c3b8";
    g.fillRect(0, 0, s, s);
    g.fillStyle = "rgba(255,255,255,0.08)";
    for (let y = 0; y < s; y += 8) g.fillRect(0, y, s, 3);
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

export function makeMonitorTexture() {
  return canvasTexture(512, (g, s) => {
    g.fillStyle = "#152028";
    g.fillRect(0, 0, s, s);
    const glow = g.createRadialGradient(s * 0.5, s * 0.42, 20, s * 0.5, s * 0.5, s * 0.6);
    glow.addColorStop(0, "#2a4a58");
    glow.addColorStop(1, "#152028");
    g.fillStyle = glow;
    g.fillRect(0, 0, s, s);
    g.fillStyle = "#d8d2c8";
    g.font = "600 36px serif";
    g.textAlign = "center";
    g.fillText("LUMEN ARC", s / 2, s * 0.44);
    g.font = "18px sans-serif";
    g.fillStyle = "#8aa0a8";
    g.fillText("offline", s / 2, s * 0.54);
    g.fillStyle = "#1c2830";
    g.fillRect(0, s * 0.88, s, s * 0.12);
    g.fillStyle = "#3d5a66";
    g.fillRect(12, s * 0.91, 40, 8);
  }, 320);
}

export function makeDoormatTexture() {
  return canvasTexture(256, (g, s) => {
    g.fillStyle = "#3a322c";
    g.fillRect(0, 0, s, s);
    g.fillStyle = "#cfc3b0";
    g.font = "700 42px sans-serif";
    g.textAlign = "center";
    g.fillText("4B", s / 2, s * 0.58);
  }, 160);
}

let cache: {
  wood: THREE.CanvasTexture;
  laminate: THREE.CanvasTexture;
  linoleum: THREE.CanvasTexture;
  plaster: THREE.CanvasTexture;
  city: THREE.CanvasTexture;
  rug: THREE.CanvasTexture;
  posterA: THREE.CanvasTexture;
  posterB: THREE.CanvasTexture;
  cardboard: THREE.CanvasTexture;
  sheet: THREE.CanvasTexture;
  monitor: THREE.CanvasTexture;
  doormat: THREE.CanvasTexture;
} | null = null;

export function getTextures() {
  if (!cache) {
    cache = {
      wood: makeWoodTexture(),
      laminate: makeLaminateTexture(),
      linoleum: makeLinoleumTexture(),
      plaster: makePlasterTexture(),
      city: makeCityTexture(),
      rug: makeRugTexture(),
      posterA: makeCardPoster("GILDED MOTH", 38),
      posterB: makeCardPoster("NIGHT ORACLE", 210),
      cardboard: makeCardboardTexture(),
      sheet: makeSheetTexture(),
      monitor: makeMonitorTexture(),
      doormat: makeDoormatTexture(),
    };
  }
  return cache;
}
