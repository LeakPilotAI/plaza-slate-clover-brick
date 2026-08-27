export type PropKind = "carry" | "toggle" | "inspect" | "use";

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
  worldScale?: number;
  useLabel?: string;
  hit: [number, number, number];
  hitOffset?: [number, number, number];
  /** When false, furniture.tsx owns the mesh; we only register a hit volume. */
  worldMesh?: boolean;
};

export type PropInfo = Pick<
  PropDef,
  "id" | "name" | "blurb" | "kind" | "carryable" | "useLabel"
>;

export type Phase =
  | "boot"
  | "playing"
  | "paused"
  | "inspecting"
  | "computer"
  | "storage"
  | "sleeping";

export type Vec3 = { x: number; y: number; z: number };

export type Notice = { title: string; body: string };

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
      toggleDoor: () => void;
      setLook: (yaw: number, pitch: number) => void;
      looking: () => PropInfo | null | undefined;
      carrying: () => PropInfo | null | undefined;
      inspecting: () => PropInfo | null | undefined;
      doorOpen: () => boolean;
      phase: () => Phase;
      openComputer: () => void;
      openStorage: () => void;
      openSleep: () => void;
      closeStation: () => void;
      solids: () => { min: [number, number, number]; max: [number, number, number] }[];
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
