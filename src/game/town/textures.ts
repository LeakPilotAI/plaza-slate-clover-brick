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

export function makeBrickTexture() {
  const tex = canvasTexture(512, (g, s) => {
    g.fillStyle = "#4a3b34";
    g.fillRect(0, 0, s, s);
    const bw = 44;
    const bh = 18;
    for (let y = 0, row = 0; y < s; y += bh, row++) {
      const ox = row % 2 === 0 ? 0 : bw / 2;
      for (let x = -bw; x < s; x += bw) {
        const n = ((x * 13 + y * 7) % 11) - 5;
        g.fillStyle = `hsl(16, ${18 + (n % 5)}%, ${26 + (n % 7)}%)`;
        g.fillRect(x + ox + 1, y + 1, bw - 2, bh - 2);
      }
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 8);
  return tex;
}

export function makeAsphaltTexture() {
  const tex = canvasTexture(512, (g, s) => {
    g.fillStyle = "#2a2a2c";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 1400; i++) {
      g.fillStyle = `rgba(0,0,0,${0.08 + Math.random() * 0.12})`;
      g.fillRect(Math.random() * s, Math.random() * s, 3, 2);
    }
    g.fillStyle = "rgba(220,200,140,0.22)";
    g.fillRect(s * 0.48, 0, 6, s);
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 4);
  return tex;
}

export function makeConcreteTexture() {
  const tex = canvasTexture(256, (g, s) => {
    g.fillStyle = "#6d6a64";
    g.fillRect(0, 0, s, s);
    for (let i = 0; i < 400; i++) {
      g.fillStyle = `rgba(20,18,16,${0.04 + Math.random() * 0.08})`;
      g.fillRect(Math.random() * s, Math.random() * s, 4, 3);
    }
    g.strokeStyle = "rgba(0,0,0,0.12)";
    g.strokeRect(1, 1, s - 2, s - 2);
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 3);
  return tex;
}

export function makeShopWindowTexture() {
  return canvasTexture(512, (g, s) => {
    g.fillStyle = "#141018";
    g.fillRect(0, 0, s, s);
    g.fillStyle = "#2a2420";
    g.fillRect(18, 70, s - 36, s - 110);
    for (let row = 0; row < 3; row++) {
      g.fillStyle = "#3a322c";
      g.fillRect(28, 92 + row * 70, s - 56, 8);
      for (let i = 0; i < 6; i++) {
        const hues = [168, 32, 210, 18, 48, 190];
        g.fillStyle = `hsl(${hues[i]}, 28%, ${38 + row * 4}%)`;
        g.fillRect(40 + i * 74, 108 + row * 70, 36, 48);
        g.fillStyle = "rgba(240,220,180,0.18)";
        g.fillRect(42 + i * 74, 110 + row * 70, 12, 48);
      }
    }
    g.fillStyle = "#d8d2c8";
    g.font = "600 28px serif";
    g.textAlign = "center";
    g.fillText("LUMEN ARC", s / 2, 44);
    g.fillStyle = "#8a9388";
    g.font = "16px sans-serif";
    g.fillText("SET 1  ·  AURORA SPARK", s / 2, 66);
  }, 360);
}

export function makeShopSignTexture() {
  return canvasTexture(512, (g, s) => {
    g.fillStyle = "#1a1614";
    g.fillRect(0, 0, s, s);
    g.fillStyle = "#d8d2c8";
    g.font = "600 54px serif";
    g.textAlign = "center";
    g.fillText("LUMEN ARC", s / 2, s * 0.42);
    g.font = "500 28px sans-serif";
    g.fillStyle = "#cfc3b0";
    g.fillText("CARDS", s / 2, s * 0.62);
    g.strokeStyle = "#8a8174";
    g.strokeRect(12, 12, s - 24, s - 24);
  }, 220);
}

export function makeSkyTexture() {
  return canvasTexture(512, (g, s) => {
    const sky = g.createLinearGradient(0, 0, 0, s);
    sky.addColorStop(0, "#141822");
    sky.addColorStop(0.45, "#2a2432");
    sky.addColorStop(0.72, "#6a4038");
    sky.addColorStop(1, "#c4784a");
    g.fillStyle = sky;
    g.fillRect(0, 0, s, s);
  });
}

export function makeAddressTexture() {
  return canvasTexture(256, (g, s) => {
    g.fillStyle = "#d8d2c8";
    g.fillRect(0, 0, s, s);
    g.fillStyle = "#2c2925";
    g.fillRect(8, 8, s - 16, s - 16);
    g.fillStyle = "#d8d2c8";
    g.font = "700 72px sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("14", s / 2, s / 2);
  });
}

let cache: {
  brick: THREE.CanvasTexture;
  asphalt: THREE.CanvasTexture;
  concrete: THREE.CanvasTexture;
  shopWindow: THREE.CanvasTexture;
  shopSign: THREE.CanvasTexture;
  sky: THREE.CanvasTexture;
  address: THREE.CanvasTexture;
} | null = null;

export function getTownTextures() {
  if (!cache) {
    cache = {
      brick: makeBrickTexture(),
      asphalt: makeAsphaltTexture(),
      concrete: makeConcreteTexture(),
      shopWindow: makeShopWindowTexture(),
      shopSign: makeShopSignTexture(),
      sky: makeSkyTexture(),
      address: makeAddressTexture(),
    };
  }
  return cache;
}
