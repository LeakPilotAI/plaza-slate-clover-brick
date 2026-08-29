import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Interactable } from "../interactable";
import { HALL } from "../layout";
import { getProp } from "../props";
import { useGame } from "../store";
import {
  BUILDING,
  EXIT,
  exitHingeX,
  farWalkZ0,
  LOBBY,
  lobbyBounds,
  SHOP,
  STREET,
  TOWN_POS,
} from "./layout";
import { getTownTextures } from "./textures";

const stucco = new THREE.MeshStandardMaterial({ color: "#b7aea0", roughness: 0.9 });
const stuccoDark = new THREE.MeshStandardMaterial({ color: "#8a8174", roughness: 0.88 });
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
const glass = new THREE.MeshStandardMaterial({
  color: "#b8c8d4",
  roughness: 0.08,
  metalness: 0.2,
  transparent: true,
  opacity: 0.22,
});
const paint = new THREE.MeshStandardMaterial({ color: "#6d5848", roughness: 0.7 });
const lobbyPaint = new THREE.MeshStandardMaterial({ color: "#b7aea0", roughness: 0.92 });
const lobbyFloor = new THREE.MeshStandardMaterial({ color: "#4a4842", roughness: 0.88 });
const trim = new THREE.MeshStandardMaterial({ color: "#8a8174", roughness: 0.8 });
const litWin = new THREE.MeshStandardMaterial({
  color: "#e6c48a",
  emissive: "#e6c48a",
  emissiveIntensity: 0.55,
  roughness: 0.4,
});
const darkWin = new THREE.MeshStandardMaterial({ color: "#1a1820", roughness: 0.35 });
const neon = new THREE.MeshStandardMaterial({
  color: "#d8d2c8",
  emissive: "#cfc3b0",
  emissiveIntensity: 0.7,
  roughness: 0.3,
});
const foliage = new THREE.MeshStandardMaterial({ color: "#3d4a38", roughness: 0.95 });
const trunk = new THREE.MeshStandardMaterial({ color: "#4a3426", roughness: 0.9 });
const carBody = new THREE.MeshStandardMaterial({ color: "#3b332c", roughness: 0.55 });
const carGlass = new THREE.MeshStandardMaterial({
  color: "#1a2430",
  roughness: 0.15,
  metalness: 0.2,
});

export function Town() {
  const tex = useMemo(() => getTownTextures(), []);
  const brick = useMemo(
    () => new THREE.MeshStandardMaterial({ map: tex.brick, roughness: 0.9, color: "#c4b4a4" }),
    [tex.brick],
  );
  const asphalt = useMemo(
    () => new THREE.MeshStandardMaterial({ map: tex.asphalt, roughness: 0.95 }),
    [tex.asphalt],
  );
  const concrete = useMemo(
    () => new THREE.MeshStandardMaterial({ map: tex.concrete, roughness: 0.92 }),
    [tex.concrete],
  );

  return (
    <group>
      <Sky map={tex.sky} />
      <OutdoorLight />
      <StreetGround asphalt={asphalt} concrete={concrete} />
      <Lobby />
      <ExitDoor />
      <AptFacade brick={brick} address={tex.address} />
      <CardShop
        brick={brick}
        windowMap={tex.shopWindow}
        signMap={tex.shopSign}
      />
      <Neighbors brick={brick} />
      <StreetFurniture />
    </group>
  );
}

function Sky({ map }: { map: THREE.Texture }) {
  return (
    <mesh>
      <sphereGeometry args={[64, 16, 12]} />
      <meshBasicMaterial map={map} side={THREE.BackSide} depthWrite={false} />
    </mesh>
  );
}

function OutdoorLight() {
  return (
    <>
      <directionalLight
        position={[-18, 14, 8]}
        intensity={0.9}
        color="#f0c9a0"
      />
      <StreetLamp x={-4.2} z={EXIT.z + 1.05} />
      <StreetLamp x={7.1} z={EXIT.z + 1.05} />
      <StreetLamp x={SHOP.x + 3.4} z={SHOP.z0 - 0.85} />
    </>
  );
}

function StreetLamp({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.55, 0]} material={metalDark} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 3.1, 8]} />
      </mesh>
      <mesh position={[0, 3.22, 0.12]} material={metal}>
        <boxGeometry args={[0.08, 0.05, 0.36]} />
      </mesh>
      <mesh position={[0, 3.16, 0.28]}>
        <sphereGeometry args={[0.09, 10, 8]} />
        <meshStandardMaterial
          color="#f2ead8"
          emissive="#f0e6cc"
          emissiveIntensity={0.85}
          roughness={0.3}
        />
      </mesh>
      <pointLight
        position={[0, 3.1, 0.28]}
        intensity={1.15}
        color="#f2e0c0"
        distance={13}
      />
    </group>
  );
}

function StreetGround({
  asphalt,
  concrete,
}: {
  asphalt: THREE.MeshStandardMaterial;
  concrete: THREE.MeshStandardMaterial;
}) {
  const roadW = STREET.maxX - STREET.minX;
  const roadMidX = (STREET.minX + STREET.maxX) / 2;
  const farZ = farWalkZ0();
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[roadMidX, 0, EXIT.z + STREET.sidewalk / 2]}
        material={concrete}
        receiveShadow
      >
        <planeGeometry args={[roadW, STREET.sidewalk]} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[roadMidX, 0, STREET.roadZ0 + STREET.roadDepth / 2]}
        material={asphalt}
        receiveShadow
      >
        <planeGeometry args={[roadW, STREET.roadDepth]} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[roadMidX, 0, farZ + STREET.farWalk / 2]}
        material={concrete}
        receiveShadow
      >
        <planeGeometry args={[roadW, STREET.farWalk]} />
      </mesh>
      <Crosswalk />
      <mesh position={[roadMidX, 0.04, EXIT.z + 0.08]} material={trim}>
        <boxGeometry args={[roadW, 0.08, 0.16]} />
      </mesh>
      <mesh position={[roadMidX, 0.04, farZ]} material={trim}>
        <boxGeometry args={[roadW, 0.08, 0.16]} />
      </mesh>
    </group>
  );
}

function Crosswalk() {
  const z = STREET.roadZ0 + STREET.roadDepth / 2;
  return (
    <group>
      {Array.from({ length: 7 }, (_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[EXIT.x - 1.2 + i * 0.4, 0.012, z]}
        >
          <planeGeometry args={[0.22, 4.6]} />
          <meshStandardMaterial color="#d8d2c8" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function Lobby() {
  const b = lobbyBounds();
  const zMid = (b.minZ + b.maxZ) / 2;
  const { width: w, height: h } = LOBBY;
  const T = LOBBY.wall;
  const hallLeft = HALL.centerX - HALL.width / 2;
  const hallRight = HALL.centerX + HALL.width / 2;
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[LOBBY.centerX, 0.003, zMid]}
        material={lobbyFloor}
        receiveShadow
      >
        <planeGeometry args={[w, LOBBY.depth]} />
      </mesh>
      <mesh position={[LOBBY.centerX, h, zMid]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, LOBBY.depth]} />
        <meshStandardMaterial color="#cfc6b8" roughness={1} />
      </mesh>
      <mesh position={[b.minX, h / 2, zMid]} material={lobbyPaint}>
        <boxGeometry args={[T, h, LOBBY.depth]} />
      </mesh>
      <mesh position={[b.maxX, h / 2, zMid]} material={lobbyPaint}>
        <boxGeometry args={[T, h, LOBBY.depth]} />
      </mesh>
      <mesh
        position={[(b.minX + hallLeft) / 2, h / 2, b.minZ]}
        material={lobbyPaint}
      >
        <boxGeometry args={[hallLeft - b.minX, h, T]} />
      </mesh>
      <mesh
        position={[(b.maxX + hallRight) / 2, h / 2, b.minZ]}
        material={lobbyPaint}
      >
        <boxGeometry args={[b.maxX - hallRight, h, T]} />
      </mesh>
      <mesh position={[LOBBY.centerX, h - 0.08, zMid]} material={trim}>
        <boxGeometry args={[0.9, 0.04, 0.16]} />
      </mesh>
      <pointLight
        position={[LOBBY.centerX, h - 0.16, zMid]}
        intensity={1.0}
        color="#e8e0c8"
        distance={8}
      />
      <Mailboxes />
      <mesh position={[b.minX + 0.7, 1.15, zMid]} material={stuccoDark}>
        <boxGeometry args={[0.08, 2.2, 1.1]} />
      </mesh>
      <mesh position={[-0.55, 1.4, b.minZ + 0.08]}>
        <planeGeometry args={[0.7, 0.22]} />
        <meshStandardMaterial color="#2c2925" roughness={0.6} />
      </mesh>
    </group>
  );
}

function Mailboxes() {
  const z = LOBBY.z0 + 0.16;
  return (
    <group position={[3.05, 1.15, z]}>
      {[0, 0.22, 0.44, 0.66].map((y, i) => (
        <mesh key={i} position={[0, y - 0.33, 0]} material={metal}>
          <boxGeometry args={[0.28, 0.18, 0.08]} />
        </mesh>
      ))}
    </group>
  );
}

function ExitDoor() {
  const open = useGame((s) => s.exitOpen);
  const ref = useRef<THREE.Group>(null);
  const ang = useRef(0);
  const def = getProp("exit")!;

  useFrame((_, dt) => {
    const target = open ? -Math.PI / 2 : 0;
    ang.current = THREE.MathUtils.damp(ang.current, target, 10, dt);
    if (ref.current) ref.current.rotation.y = ang.current;
  });

  const hinge = exitHingeX();
  const gap = EXIT.gap;
  const jamb = (gap - EXIT.width) / 2;
  return (
    <group>
      <group position={[hinge, 0, EXIT.z]}>
        <group ref={ref}>
          <Interactable
            id="exit"
            position={[-EXIT.width / 2, 0, 0]}
            hit={def.hit}
            hitOffset={def.hitOffset}
          >
            <mesh position={[0, EXIT.height / 2, 0]} material={paint} castShadow>
              <boxGeometry args={[EXIT.width, EXIT.height, EXIT.thickness]} />
            </mesh>
            <mesh position={[EXIT.width / 2 - 0.14, 1.05, 0.04]} material={metal}>
              <sphereGeometry args={[0.03, 10, 10]} />
            </mesh>
            <mesh position={[0, 1.72, 0.035]} material={metalDark}>
              <boxGeometry args={[0.22, 0.08, 0.01]} />
            </mesh>
          </Interactable>
        </group>
      </group>
      <mesh position={[EXIT.x - EXIT.width / 2 - jamb / 2, EXIT.height / 2, EXIT.z]} material={trim}>
        <boxGeometry args={[jamb, EXIT.height, 0.1]} />
      </mesh>
      <mesh position={[EXIT.x + EXIT.width / 2 + jamb / 2, EXIT.height / 2, EXIT.z]} material={trim}>
        <boxGeometry args={[jamb, EXIT.height, 0.1]} />
      </mesh>
      <mesh position={[EXIT.x, EXIT.height + 0.05, EXIT.z]} material={trim}>
        <boxGeometry args={[gap, 0.1, 0.1]} />
      </mesh>
    </group>
  );
}

function AptFacade({
  brick,
  address,
}: {
  brick: THREE.MeshStandardMaterial;
  address: THREE.Texture;
}) {
  const gap = EXIT.gap;
  const leftW = EXIT.x - gap / 2 - BUILDING.minX;
  const rightW = BUILDING.maxX - (EXIT.x + gap / 2);
  const H = BUILDING.height;
  const z = EXIT.z - 0.18;
  const W = BUILDING.maxX - BUILDING.minX;

  return (
    <group>
      <mesh
        position={[(BUILDING.minX + EXIT.x - gap / 2) / 2, H / 2, z]}
        material={brick}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[leftW, H, 0.36]} />
      </mesh>
      <mesh
        position={[(BUILDING.maxX + EXIT.x + gap / 2) / 2, H / 2, z]}
        material={brick}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[rightW, H, 0.36]} />
      </mesh>
      <mesh position={[EXIT.x, (EXIT.height + H) / 2, z]} material={brick}>
        <boxGeometry args={[gap, H - EXIT.height, 0.36]} />
      </mesh>
      <Windows z={z + 0.2} />
      <mesh position={[EXIT.x - 1.05, 1.72, EXIT.z + 0.03]}>
        <planeGeometry args={[0.28, 0.28]} />
        <meshStandardMaterial map={address} roughness={0.45} metalness={0.15} />
      </mesh>
      <mesh position={[EXIT.x + 1.35, 1.55, EXIT.z + 0.03]}>
        <planeGeometry args={[0.7, 0.16]} />
        <meshStandardMaterial color="#2c2925" roughness={0.6} />
      </mesh>
      <mesh position={[BUILDING.minX, H / 2, z + 0.9]} material={brick}>
        <boxGeometry args={[0.36, H, 1.8]} />
      </mesh>
      <mesh position={[BUILDING.maxX, H / 2, z + 0.9]} material={brick}>
        <boxGeometry args={[0.36, H, 1.8]} />
      </mesh>
      <mesh position={[(BUILDING.minX + BUILDING.maxX) / 2, H + 0.12, z]} material={stuccoDark}>
        <boxGeometry args={[W + 0.4, 0.24, 0.7]} />
      </mesh>
    </group>
  );
}

function Windows({ z }: { z: number }) {
  const cols = [-5.2, -3.4, -1.6, 3.6, 5.4, 7.2];
  const rows = [3.4, 5.6, 7.8, 10.0];
  return (
    <group>
      {rows.flatMap((y, ri) =>
        cols.map((x, ci) => {
          const lit = (ri + ci) % 3 !== 1;
          return (
            <mesh key={`${ri}-${ci}`} position={[x, y, z]} material={lit ? litWin : darkWin}>
              <planeGeometry args={[0.7, 1.05]} />
            </mesh>
          );
        }),
      )}
    </group>
  );
}

function CardShop({
  brick,
  windowMap,
  signMap,
}: {
  brick: THREE.MeshStandardMaterial;
  windowMap: THREE.Texture;
  signMap: THREE.Texture;
}) {
  const def = getProp("shop")!;
  const z = SHOP.z0 + SHOP.depth / 2;
  const front = SHOP.z0 + 0.02;
  const window = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: windowMap,
        emissive: "#1a3040",
        emissiveIntensity: 0.45,
        roughness: 0.35,
      }),
    [windowMap],
  );
  const sign = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: signMap,
        emissive: "#d8d2c8",
        emissiveIntensity: 0.25,
        roughness: 0.4,
      }),
    [signMap],
  );

  return (
    <group>
      <mesh position={[SHOP.x, SHOP.height / 2, z]} material={stucco} castShadow receiveShadow>
        <boxGeometry args={[SHOP.width, SHOP.height, SHOP.depth]} />
      </mesh>
      <mesh position={[SHOP.x, 3.95, front - 0.02]} material={brick}>
        <boxGeometry args={[SHOP.width + 0.2, 0.7, 0.2]} />
      </mesh>
      <mesh position={[SHOP.x, 4.55, front]} material={sign}>
        <planeGeometry args={[4.4, 1.15]} />
      </mesh>
      <mesh position={[SHOP.x - 2.15, 1.55, front]} material={window}>
        <planeGeometry args={[2.6, 1.9]} />
      </mesh>
      <mesh position={[SHOP.x + 2.15, 1.55, front]} material={window}>
        <planeGeometry args={[2.6, 1.9]} />
      </mesh>
      <mesh position={[SHOP.x - 2.15, 1.55, front + 0.02]} material={glass}>
        <planeGeometry args={[2.55, 1.85]} />
      </mesh>
      <mesh position={[SHOP.x + 2.15, 1.55, front + 0.02]} material={glass}>
        <planeGeometry args={[2.55, 1.85]} />
      </mesh>
      <Interactable
        id="shop"
        position={TOWN_POS.shop}
        hit={def.hit}
        hitOffset={def.hitOffset}
      >
        <mesh position={[0, 1.12, 0.04]} material={metalDark} castShadow>
          <boxGeometry args={[1.16, 2.24, 0.08]} />
        </mesh>
        <mesh position={[0.42, 1.08, 0.09]} material={metal}>
          <sphereGeometry args={[0.03, 10, 10]} />
        </mesh>
        <mesh position={[0, 1.72, 0.09]} material={neon}>
          <boxGeometry args={[0.7, 0.16, 0.02]} />
        </mesh>
      </Interactable>
      <pointLight
        position={[SHOP.x, 3.4, front + 0.4]}
        intensity={0.7}
        color="#f0d8b0"
        distance={8}
      />
      <mesh position={[SHOP.x - 3.6, 0.55, front + 0.35]} material={metalDark}>
        <boxGeometry args={[0.7, 1.1, 0.4]} />
      </mesh>
    </group>
  );
}

function Neighbors({ brick }: { brick: THREE.MeshStandardMaterial }) {
  const z = EXIT.z + 1.1;
  return (
    <group>
      <mesh position={[-10.2, 5.2, z]} material={brick} castShadow>
        <boxGeometry args={[5.4, 10.4, 2.6]} />
      </mesh>
      <WindowStrip xs={[-11.6, -10.2, -8.8]} ys={[2.8, 5.0, 7.2, 9.4]} z={z + 1.32} />
      <mesh position={[11.6, 3.4, EXIT.z + 0.9]} material={stuccoDark} castShadow>
        <boxGeometry args={[5.2, 6.8, 2.4]} />
      </mesh>
      <WindowStrip xs={[10.4, 11.6, 12.8]} ys={[2.2, 4.2, 6.0]} z={EXIT.z + 2.12} />
      <mesh position={[-6.6, 3.2, SHOP.z0 + 3.1]} material={stucco} castShadow>
        <boxGeometry args={[7.2, 6.4, 6.2]} />
      </mesh>
      <mesh position={[-6.6, 5.4, SHOP.z0 + 0.02]}>
        <planeGeometry args={[2.8, 0.7]} />
        <meshStandardMaterial color="#2c2925" roughness={0.55} />
      </mesh>
      <WindowStrip
        xs={[-8.6, -6.6, -4.6]}
        ys={[2.0, 3.8]}
        z={SHOP.z0 + 0.04}
      />
      <mesh position={[10.8, 1.6, SHOP.z0 + 2.4]} material={metalDark} castShadow>
        <boxGeometry args={[4.6, 3.2, 4.8]} />
      </mesh>
      <mesh
        position={[(STREET.minX + STREET.maxX) / 2, 1.2, SHOP.z0 + SHOP.depth + 2.4]}
        material={stuccoDark}
      >
        <boxGeometry args={[STREET.maxX - STREET.minX, 2.4, 0.28]} />
      </mesh>
    </group>
  );
}

function WindowStrip({
  xs,
  ys,
  z,
}: {
  xs: number[];
  ys: number[];
  z: number;
}) {
  return (
    <group>
      {ys.flatMap((y, ri) =>
        xs.map((x, ci) => (
          <mesh
            key={`${ri}-${ci}`}
            position={[x, y, z]}
            material={(ri + ci) % 2 === 0 ? litWin : darkWin}
          >
            <planeGeometry args={[0.62, 0.9]} />
          </mesh>
        )),
      )}
    </group>
  );
}

function StreetFurniture() {
  return (
    <group>
      <group position={TOWN_POS.bench}>
        <mesh position={[0, 0.28, 0]} material={stuccoDark} castShadow>
          <boxGeometry args={[1.35, 0.08, 0.38]} />
        </mesh>
        <mesh position={[0, 0.5, -0.16]} material={stuccoDark}>
          <boxGeometry args={[1.35, 0.28, 0.08]} />
        </mesh>
        <mesh position={[-0.58, 0.16, 0]} material={metalDark}>
          <boxGeometry args={[0.08, 0.32, 0.38]} />
        </mesh>
        <mesh position={[0.58, 0.16, 0]} material={metalDark}>
          <boxGeometry args={[0.08, 0.32, 0.38]} />
        </mesh>
      </group>
      <mesh position={TOWN_POS.mailbox} material={metal} castShadow>
        <boxGeometry args={[0.22, 1.1, 0.22]} />
      </mesh>
      <mesh position={[-7.4, 0.45, STREET.roadZ0 + 2.2]} material={carBody} castShadow>
        <boxGeometry args={[1.7, 0.7, 4.2]} />
      </mesh>
      <mesh position={[-7.4, 0.95, STREET.roadZ0 + 2.05]} material={carGlass}>
        <boxGeometry args={[1.55, 0.45, 2.2]} />
      </mesh>
      <group position={[9.3, 0, EXIT.z + 1.6]}>
        <mesh position={[0, 0.55, 0]} material={trunk} castShadow>
          <cylinderGeometry args={[0.1, 0.14, 1.1, 8]} />
        </mesh>
        <mesh position={[0, 1.45, 0]} material={foliage} castShadow>
          <sphereGeometry args={[0.7, 10, 8]} />
        </mesh>
      </group>
      <mesh position={[SHOP.x - 4.6, 0.28, SHOP.z0 - 0.7]} material={metalDark} castShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.56, 10]} />
      </mesh>
    </group>
  );
}
