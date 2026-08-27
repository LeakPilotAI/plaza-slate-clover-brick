export type PropKind = "carry" | "toggle" | "inspect";

export type PropDef = {
  id: string;
  name: string;
  blurb: string;
  kind: PropKind;
  carryable: boolean;
  position: [number, number, number];
  rotationY?: number;
  holdScale?: number;
  dropHeight: number;
};

export type PropInfo = Pick<
  PropDef,
  "id" | "name" | "blurb" | "kind" | "carryable"
>;

export type Phase = "boot" | "playing" | "paused" | "inspecting";

export type Vec3 = { x: number; y: number; z: number };

export type ControlsProbe = {
  getYaw: () => number;
  getSpeed: () => number;
  getPosition: () => Vec3;
  setKeys: (codes: string[]) => void;
  setSteer?: (v: number) => void;
  reset: () => void;
};

declare global {
  interface Window {
    __controlsTest?: ControlsProbe;
    __gameReady?: boolean;
    __debug?: {
      teleport: (x: number, y: number, z: number) => void;
      reset: () => void;
      toggleLamp: () => void;
      setLook: (yaw: number, pitch: number) => void;
      looking: () => PropInfo | null | undefined;
      carrying: () => PropInfo | null | undefined;
      inspecting: () => PropInfo | null | undefined;
      targets: () => number;
      pose: () => {
        x: number;
        y: number;
        z: number;
        yaw: number;
        pitch: number;
        phase: Phase;
      };
    };
  }
}

export {};
