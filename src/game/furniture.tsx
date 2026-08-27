import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Interactable } from "./interactable";
import { DOOR, doorHingeX, HALL, POS, ROOM, WINDOW } from "./layout";
import { getProp } from "./props";
import { useGame } from "./store";
import { getTextures } from "./textures";

const pine = new THREE.MeshStandardMaterial({ color: "#8a7358", roughness: 0.82 });
const pineDark = new THREE.MeshStandardMaterial({ color: "#5c4a38", roughness: 0.78 });
const metal = new THREE.MeshStandardMaterial({
  color: "#6e675c",
  metalness: 0.55,
  roughness: 0.4,
});
const metalDark = new THREE.MeshStandardMaterial({
  color: "#3a3834",
  metalness: 0.6,
  roughness: 0.45,
});
const sheet = new THREE.MeshStandardMaterial({ color: "#cfc8bc", roughness: 0.92 });
const duvet = new THREE.MeshStandardMaterial({ color: "#4f5c68", roughness: 0.9 });
const pillow = new THREE.MeshStandardMaterial({ color: "#e4ddd2", roughness: 0.88 });
const board = new THREE.MeshStandardMaterial({ color: "#cbb89a", roughness: 0.74 });
const boardEdge = new THREE.MeshStandardMaterial({ color: "#9a886c", roughness: 0.7 });
const plastic = new THREE.MeshStandardMaterial({ color: "#6a757c", roughness: 0.45 });
const plasticDark = new THREE.MeshStandardMaterial({ color: "#3e464c", roughness: 0.5 });
const screenBezel = new THREE.MeshStandardMaterial({ color: "#1a1c1e", roughness: 0.4 });
const keyMat = new THREE.MeshStandardMaterial({ color: "#2a2e32", roughness: 0.55 });
const bin = new THREE.MeshStandardMaterial({ color: "#8b93a0", roughness: 0.4 });
const binLid = new THREE.MeshStandardMaterial({ color: "#9aa3b0", roughness: 0.38 });
const paint = new THREE.MeshStandardMaterial({ color: "#6d5848", roughness: 0.7 });
const hallPaint = new THREE.MeshStandardMaterial({ color: "#b7aea0", roughness: 0.92 });
const hallTrim = new THREE.MeshStandardMaterial({ color: "#8a8174", roughness: 0.8 });
const shoe = new THREE.MeshStandardMaterial({ color: "#3b332c", roughness: 0.75 });
const curtainMat = new THREE.MeshStandardMaterial({
  color: "#9a8b78",
  roughness: 0.9,
  transparent: true,
  opacity: 0.82,
  side: THREE.DoubleSide,
});
const glass = new THREE.MeshStandardMaterial({
  color: "#b8c8d4",
  roughness: 0.08,
  metalness: 0.15,
  transparent: true,
  opacity: 0.18,
});
const frameAlu = new THREE.MeshStandardMaterial({
  color: "#c5c0b6",
  metalness: 0.55,
  roughness: 0.35,
});
const pot = new THREE.MeshStandardMaterial({ color: "#7a5340", roughness: 0.8 });
const deadLeaf = new THREE.MeshStandardMaterial({ color: "#6a5a3a", roughness: 1 });

export function ApartmentFurniture() {
  const tex = useMemo(() => getTextures(), []);
  return (
    <group>
      <Bed />
      <Nightstand map={tex.cardboard} />
      <Desk monitor={tex.monitor} felt={tex.felt} />
      <Chair />
      <StorageBin />
      <DisplayShelf />
      <ApartmentDoor plaque={tex.plaque} />
      <DoorFrame />
      <Hallway linoleum={tex.linoleum} plaque={tex.plaque} />
      <Window city={tex.city} />
      <Shoes />
      <CeilingFixture />
      <Doormat map={tex.doormat} />
      <WallClock />
      <StairHit />
    </group>
  );
}

function Bed() {
  const def = getProp("bed")!;
  return (
    <Interactable id="bed" position={POS.bed} hit={def.hit} hitOffset={def.hitOffset}>
      <group>
        {([
          [-0.92, 0.12, -0.48],
          [0.92, 0.12, -0.48],
          [-0.92, 0.12, 0.48],
          [0.92, 0.12, 0.48],
        ] as const).map((p, i) => (
          <mesh key={i} position={[...p]} material={pineDark} castShadow>
            <boxGeometry args={[0.06, 0.24, 0.06]} />
          </mesh>
        ))}
        <mesh position={[0, 0.26, 0]} material={pine} castShadow receiveShadow>
          <boxGeometry args={[2.02, 0.06, 1.1]} />
        </mesh>
        <mesh position={[0, 0.22, -0.54]} material={pineDark}>
          <boxGeometry args={[2.02, 0.16, 0.05]} />
        </mesh>
        <mesh position={[0, 0.38, 0]} material={sheet} castShadow receiveShadow>
          <boxGeometry args={[1.96, 0.16, 1.04]} />
        </mesh>
        <mesh
          position={[0.08, 0.5, 0.04]}
          rotation={[0, 0.04, 0.02]}
          material={duvet}
          castShadow
        >
          <boxGeometry args={[1.7, 0.1, 0.92]} />
        </mesh>
        <mesh position={[-0.62, 0.52, -0.06]} rotation={[0.05, 0.2, 0]} material={pillow} castShadow>
          <boxGeometry args={[0.38, 0.1, 0.26]} />
        </mesh>
      </group>
    </Interactable>
  );
}

function Nightstand({ map }: { map: THREE.Texture }) {
  const card = useMemo(
    () => new THREE.MeshStandardMaterial({ map, roughness: 0.88 }),
    [map],
  );
  return (
    <group position={POS.nightstand}>
      <mesh position={[0, 0.2, 0]} material={card} castShadow receiveShadow>
        <boxGeometry args={[0.38, 0.4, 0.36]} />
      </mesh>
      <mesh position={[0, 0.41, 0]} material={card}>
        <boxGeometry args={[0.4, 0.03, 0.38]} />
      </mesh>
    </group>
  );
}

function Desk({ monitor, felt }: { monitor: THREE.Texture; felt: THREE.Texture }) {
  const screen = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: monitor,
        roughness: 0.25,
        emissive: "#1a3040",
        emissiveIntensity: 0.35,
      }),
    [monitor],
  );
  const comp = getProp("computer")!;
  return (
    <group>
      <group position={POS.desk}>
        <mesh position={[0, 0.74, 0]} material={board} castShadow receiveShadow>
          <boxGeometry args={[0.62, 0.04, 1.56]} />
        </mesh>
        <mesh position={[0, 0.715, 0]} material={boardEdge}>
          <boxGeometry args={[0.64, 0.02, 1.58]} />
        </mesh>
        <mesh
          position={[0.02, 0.765, 0.18]}
          rotation={[-Math.PI / 2, 0, 0.08]}
          receiveShadow
        >
          <planeGeometry args={[0.48, 0.36]} />
          <meshStandardMaterial map={felt} roughness={0.95} />
        </mesh>
        {([
          [-0.26, 0.36, -0.7],
          [0.26, 0.36, -0.7],
          [-0.26, 0.36, 0.7],
          [0.26, 0.36, 0.7],
        ] as const).map((p, i) => (
          <mesh key={i} position={[...p]} material={boardEdge} castShadow>
            <boxGeometry args={[0.05, 0.72, 0.05]} />
          </mesh>
        ))}
        <mesh position={[0.18, 0.34, 0.42]} material={board} castShadow>
          <boxGeometry args={[0.24, 0.64, 0.4]} />
        </mesh>
      </group>

      <Interactable
        id="computer"
        position={POS.computer}
        rotationY={-Math.PI / 2}
        hit={comp.hit}
      >
        <mesh position={[0, -0.16, 0.02]} material={metalDark} castShadow>
          <boxGeometry args={[0.16, 0.04, 0.1]} />
        </mesh>
        <mesh position={[0, -0.08, 0.01]} material={metal}>
          <boxGeometry args={[0.03, 0.12, 0.03]} />
        </mesh>
        <mesh position={[0, 0.08, 0]} material={screenBezel} castShadow>
          <boxGeometry args={[0.46, 0.3, 0.04]} />
        </mesh>
        <mesh position={[0, 0.08, 0.022]} material={screen}>
          <planeGeometry args={[0.42, 0.26]} />
        </mesh>
      </Interactable>

      <mesh position={[2.86, 0.77, -1.22]} material={keyMat} castShadow>
        <boxGeometry args={[0.16, 0.02, 0.36]} />
      </mesh>
      <mesh position={[2.82, 0.775, -0.96]} material={plasticDark} castShadow>
        <boxGeometry args={[0.08, 0.02, 0.05]} />
      </mesh>
      <mesh position={[3.12, 0.28, -0.68]} material={plasticDark} castShadow>
        <boxGeometry args={[0.18, 0.42, 0.38]} />
      </mesh>
    </group>
  );
}

function Chair() {
  return (
    <group position={POS.chair}>
      <mesh position={[0, 0.46, 0]} material={plastic} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.4]} />
      </mesh>
      <mesh position={[0, 0.78, -0.18]} material={plastic} castShadow>
        <boxGeometry args={[0.4, 0.42, 0.05]} />
      </mesh>
      <mesh position={[0, 0.24, 0]} material={metalDark}>
        <cylinderGeometry args={[0.03, 0.03, 0.42, 8]} />
      </mesh>
      <mesh position={[0, 0.05, 0]} material={metal}>
        <cylinderGeometry args={[0.18, 0.18, 0.04, 12]} />
      </mesh>
    </group>
  );
}

function StorageBin() {
  const def = getProp("storage")!;
  const open = useGame((s) => s.phase === "storage");
  const lid = useRef<THREE.Group>(null);
  const ang = useRef(0);

  useFrame((_, dt) => {
    const target = open ? -0.85 : 0;
    ang.current = THREE.MathUtils.damp(ang.current, target, 10, dt);
    if (lid.current) lid.current.rotation.x = ang.current;
  });

  return (
    <Interactable id="storage" position={POS.storage} hit={def.hit} hitOffset={def.hitOffset}>
      <mesh position={[0, 0.22, 0]} material={bin} castShadow receiveShadow>
        <boxGeometry args={[0.52, 0.44, 0.4]} />
      </mesh>
      <mesh
        position={[0, 0.22, 0.202]}
        material={plasticDark}
      >
        <boxGeometry args={[0.28, 0.08, 0.01]} />
      </mesh>
      <group ref={lid} position={[0, 0.45, -0.22]}>
        <mesh position={[0, 0, 0.22]} material={binLid} castShadow>
          <boxGeometry args={[0.56, 0.04, 0.44]} />
        </mesh>
      </group>
    </Interactable>
  );
}

function ApartmentDoor({ plaque }: { plaque: THREE.Texture }) {
  const open = useGame((s) => s.doorOpen);
  const ref = useRef<THREE.Group>(null);
  const ang = useRef(0);
  const def = getProp("door")!;

  useFrame((_, dt) => {
    const target = open ? -Math.PI / 2 : 0;
    ang.current = THREE.MathUtils.damp(ang.current, target, 10, dt);
    if (ref.current) ref.current.rotation.y = ang.current;
  });

  const hinge = doorHingeX();
  return (
    <group position={[hinge, 0, DOOR.z]}>
      <group ref={ref}>
        <Interactable
          id="door"
          position={[-DOOR.width / 2, 0, 0]}
          hit={def.hit}
          hitOffset={def.hitOffset}
        >
          <mesh position={[0, DOOR.height / 2, 0]} material={paint} castShadow>
            <boxGeometry args={[DOOR.width, DOOR.height, DOOR.thickness]} />
          </mesh>
          <mesh position={[DOOR.width / 2 - 0.12, 1.02, 0.03]} material={metal}>
            <sphereGeometry args={[0.028, 12, 12]} />
          </mesh>
          <mesh position={[0, 1.62, 0.026]} material={metalDark}>
            <cylinderGeometry args={[0.012, 0.012, 0.01, 10]} />
          </mesh>
          <mesh position={[0, 1.86, 0.026]} material={metal}>
            <boxGeometry args={[0.16, 0.08, 0.01]} />
          </mesh>
          <mesh position={[-0.28, 1.55, 0.026]}>
            <planeGeometry args={[0.12, 0.12]} />
            <meshStandardMaterial map={plaque} roughness={0.45} metalness={0.2} />
          </mesh>
        </Interactable>
      </group>
    </group>
  );
}

function DoorFrame() {
  const gap = DOOR.gap;
  const jamb = (gap - DOOR.width) / 2;
  return (
    <group position={[DOOR.x, 0, DOOR.z]}>
      <mesh position={[-(DOOR.width / 2 + jamb / 2), DOOR.height / 2, 0]} material={pine}>
        <boxGeometry args={[jamb, DOOR.height, 0.08]} />
      </mesh>
      <mesh position={[DOOR.width / 2 + jamb / 2, DOOR.height / 2, 0]} material={pine}>
        <boxGeometry args={[jamb, DOOR.height, 0.08]} />
      </mesh>
      <mesh position={[0, DOOR.height + 0.04, 0]} material={pine}>
        <boxGeometry args={[gap, 0.08, 0.08]} />
      </mesh>
    </group>
  );
}

function Hallway({
  linoleum,
  plaque,
}: {
  linoleum: THREE.Texture;
  plaque: THREE.Texture;
}) {
  const hallFloor = useMemo(
    () => new THREE.MeshStandardMaterial({ map: linoleum, roughness: 0.88 }),
    [linoleum],
  );
  const z0 = ROOM.halfD;
  const depth = HALL.depth;
  const zMid = z0 + depth / 2;
  const zFar = z0 + depth;
  const { centerX: cx, width: w, height: h } = HALL;
  const T = ROOM.wall;

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[cx, 0.002, zMid]}
        material={hallFloor}
        receiveShadow
      >
        <planeGeometry args={[w, depth]} />
      </mesh>
      <mesh position={[cx, h, zMid]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, depth]} />
        <meshStandardMaterial color="#cfc6b8" roughness={1} />
      </mesh>
      <mesh position={[cx - w / 2, h / 2, zMid]} material={hallPaint} receiveShadow>
        <boxGeometry args={[T, h, depth]} />
      </mesh>
      <mesh position={[cx + w / 2, h / 2, zMid]} material={hallPaint} receiveShadow>
        <boxGeometry args={[T, h, depth]} />
      </mesh>
      <mesh position={[cx, h / 2, zFar]} material={hallPaint} receiveShadow>
        <boxGeometry args={[w, h, T]} />
      </mesh>

      {/* Neighbor door 4A */}
      <group position={[cx - w / 2 + 0.04, 0, z0 + 0.85]}>
        <mesh position={[0, 1.02, 0]} material={paint} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.86, 2.04, 0.05]} />
        </mesh>
        <mesh position={[0.03, 1.8, 0]} material={metal}>
          <boxGeometry args={[0.01, 0.07, 0.14]} />
        </mesh>
      </group>

      {/* Far stairwell door */}
      <group position={[cx, 0, zFar - 0.04]}>
        <mesh position={[0, 1.05, 0]} material={metalDark} castShadow>
          <boxGeometry args={[0.96, 2.1, 0.06]} />
        </mesh>
        <mesh position={[0, 1.35, 0.04]}>
          <planeGeometry args={[0.28, 0.42]} />
          <meshStandardMaterial color="#1a1c22" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[0, 1.88, 0.04]} material={metal}>
          <boxGeometry args={[0.28, 0.08, 0.01]} />
        </mesh>
      </group>

      <mesh position={[cx, h - 0.06, zMid]} material={hallTrim}>
        <boxGeometry args={[1.1, 0.04, 0.18]} />
      </mesh>
      <mesh position={[cx - 0.62, 1.58, z0 + 0.06]}>
        <planeGeometry args={[0.14, 0.14]} />
        <meshStandardMaterial map={plaque} roughness={0.45} metalness={0.2} />
      </mesh>
      <pointLight position={[cx, h - 0.12, zMid]} intensity={0.55} color="#e8e0c8" distance={6} />
    </group>
  );
}

function DisplayShelf() {
  const def = getProp("display")!;
  return (
    <Interactable id="display" position={POS.display} hit={def.hit}>
      <mesh position={[0, -0.22, 0]} material={pineDark} castShadow>
        <boxGeometry args={[0.22, 0.04, 0.9]} />
      </mesh>
      <mesh position={[0, 0.08, 0]} material={pine} castShadow>
        <boxGeometry args={[0.22, 0.04, 0.9]} />
      </mesh>
      <mesh position={[0, 0.38, 0]} material={pine} castShadow>
        <boxGeometry args={[0.22, 0.04, 0.9]} />
      </mesh>
      <mesh position={[0, 0.08, -0.44]} material={pineDark}>
        <boxGeometry args={[0.22, 0.64, 0.04]} />
      </mesh>
      <mesh position={[0, 0.08, 0.44]} material={pineDark}>
        <boxGeometry args={[0.22, 0.64, 0.04]} />
      </mesh>
    </Interactable>
  );
}

function WallClock() {
  return (
    <group position={[-ROOM.halfW + 0.07, 1.78, -0.95]} rotation={[0, Math.PI / 2, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={plasticDark}>
        <cylinderGeometry args={[0.11, 0.11, 0.04, 24]} />
      </mesh>
      <mesh position={[0, 0, 0.022]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.095, 24]} />
        <meshStandardMaterial color="#e8e0d4" roughness={0.7} />
      </mesh>
      <mesh position={[0.02, 0.03, 0.03]} rotation={[0, 0, -0.7]} material={metalDark}>
        <boxGeometry args={[0.012, 0.06, 0.006]} />
      </mesh>
      <mesh position={[-0.015, -0.01, 0.03]} rotation={[0, 0, 1.1]} material={metal}>
        <boxGeometry args={[0.008, 0.04, 0.006]} />
      </mesh>
    </group>
  );
}

function StairHit() {
  const def = getProp("stair")!;
  return (
    <Interactable id="stair" position={POS.stair} hit={def.hit} />
  );
}

function Window({ city }: { city: THREE.Texture }) {
  const { x, y, z, width, height } = WINDOW;
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0, -0.02]} material={frameAlu}>
        <boxGeometry args={[width + 0.08, height + 0.08, 0.06]} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[width - 0.06, height - 0.06]} />
        <meshBasicMaterial map={city} />
      </mesh>
      <mesh position={[0, 0, 0.02]} material={glass}>
        <planeGeometry args={[width - 0.08, height - 0.08]} />
      </mesh>
      <mesh position={[0, 0, 0.03]} material={frameAlu}>
        <boxGeometry args={[0.03, height - 0.06, 0.03]} />
      </mesh>
      <mesh position={[0, -(height / 2) - 0.04, 0.06]} material={frameAlu}>
        <boxGeometry args={[width + 0.12, 0.05, 0.12]} />
      </mesh>
      <mesh
        position={[-width / 2 + 0.12, 0, 0.08]}
        material={curtainMat}
        castShadow
      >
        <planeGeometry args={[0.28, height + 0.2]} />
      </mesh>
      <mesh
        position={[width / 2 - 0.12, 0, 0.08]}
        material={curtainMat}
        castShadow
      >
        <planeGeometry args={[0.28, height + 0.2]} />
      </mesh>
      <group position={[-0.52, -(height / 2) + 0.08, 0.1]}>
        <mesh material={pot} position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.045, 0.038, 0.08, 10]} />
        </mesh>
        <mesh material={deadLeaf} position={[0.01, 0.14, 0]} rotation={[0.3, 0.2, 0.4]}>
          <boxGeometry args={[0.01, 0.12, 0.01]} />
        </mesh>
        <mesh material={deadLeaf} position={[-0.01, 0.12, 0.01]} rotation={[-0.4, 0, -0.3]}>
          <boxGeometry args={[0.01, 0.1, 0.01]} />
        </mesh>
      </group>
      {/* Distant city plane so the glass isn't a flat sticker */}
      <mesh position={[0, 0, -1.4]}>
        <planeGeometry args={[width * 1.6, height * 1.5]} />
        <meshBasicMaterial map={city} />
      </mesh>
    </group>
  );
}

function Shoes() {
  return (
    <group position={POS.shoes}>
      <mesh position={[-0.08, 0.03, 0]} rotation={[0.1, 0.4, 0]} material={shoe} castShadow>
        <boxGeometry args={[0.1, 0.06, 0.26]} />
      </mesh>
      <mesh position={[0.1, 0.03, 0.02]} rotation={[0.08, 0.5, 0]} material={shoe} castShadow>
        <boxGeometry args={[0.1, 0.06, 0.26]} />
      </mesh>
    </group>
  );
}

function CeilingFixture() {
  return (
    <group position={[0.1, ROOM.height - 0.04, 0.05]}>
      <mesh material={metal}>
        <cylinderGeometry args={[0.04, 0.04, 0.04, 10]} />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <sphereGeometry args={[0.12, 16, 12]} />
        <meshStandardMaterial
          color="#f2ead8"
          roughness={0.35}
          emissive="#f0e6cc"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}

function Doormat({ map }: { map: THREE.Texture }) {
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ map, roughness: 0.95 }),
    [map],
  );
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[DOOR.x, 0.015, DOOR.z - 0.42]}
      material={mat}
      receiveShadow
    >
      <planeGeometry args={[0.7, 0.4]} />
    </mesh>
  );
}
