import { ContactShadows } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { ROOM } from "./constants";
import { ApartmentFurniture } from "./furniture";
import { Interactable } from "./interactable";
import { DOOR, POS, WINDOW } from "./layout";
import { PropMesh } from "./meshes";
import { movableProps } from "./props";
import { useGame } from "./store";
import { getTextures } from "./textures";

const WINDOW_LIGHT = { x: 0.6, y: 2.8, z: -6.2 };

export function Apartment() {
  const tex = useMemo(() => getTextures(), []);
  const carryingId = useGame((s) => s.carrying?.id);
  const inspectingId = useGame((s) => s.inspecting?.id);
  const lampOn = useGame((s) => s.lampOn);
  const drops = useGame((s) => s.drops);

  const wallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: tex.plaster,
        color: "#d4cdc0",
        roughness: 0.94,
      }),
    [tex.plaster],
  );
  const trimMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#e6ddd0",
        roughness: 0.72,
      }),
    [],
  );
  const floorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: tex.laminate,
        roughness: 0.78,
      }),
    [tex.laminate],
  );
  const ceilingMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#e4dcd0",
        roughness: 1,
      }),
    [],
  );

  const W = ROOM.halfW * 2;
  const D = ROOM.halfD * 2;
  const H = ROOM.height;
  const T = ROOM.wall;

  return (
    <group>
      <hemisphereLight args={["#cfc4b2", "#2a241e", 0.5]} />
      <ambientLight intensity={0.22} />
      <directionalLight
        position={[WINDOW_LIGHT.x, WINDOW_LIGHT.y, WINDOW_LIGHT.z]}
        intensity={1.15}
        color="#f0c9a0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.4}
        shadow-camera-far={16}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
      />
      <pointLight position={[0.1, H - 0.22, 0.05]} intensity={0.7} color="#f2e6d0" distance={9} />
      <pointLight position={[-2.1, 1.6, -1.6]} intensity={0.35} color="#e8d8c0" distance={5} />
      {lampOn ? (
        <pointLight
          position={POS.lampLight}
          intensity={1.05}
          color="#f4e2c0"
          distance={6.5}
        />
      ) : null}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={floorMat} receiveShadow>
        <planeGeometry args={[W, D]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]} material={ceilingMat} receiveShadow>
        <planeGeometry args={[W, D]} />
      </mesh>

      <ApartmentWalls material={wallMat} />

      <mesh position={[0, 0.06, -ROOM.halfD + T]} material={trimMat}>
        <boxGeometry args={[W - T * 2, 0.12, 0.04]} />
      </mesh>
      <mesh position={[-1.1, 0.06, ROOM.halfD - T]} material={trimMat}>
        <boxGeometry args={[3.2, 0.12, 0.04]} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={POS.rug} receiveShadow>
        <planeGeometry args={[2.1, 1.5]} />
        <meshStandardMaterial map={tex.rug} roughness={0.92} />
      </mesh>

      <Poster
        map={tex.posterA}
        position={[-ROOM.halfW + 0.07, 1.62, -0.35]}
        rotationY={Math.PI / 2}
      />
      <Poster map={tex.posterB} position={[-1.15, 1.58, -ROOM.halfD + 0.07]} />

      <ApartmentFurniture />

      {movableProps().map((p) => {
        const hidden = carryingId === p.id || inspectingId === p.id;
        const drop = drops[p.id];
        const pos = drop
          ? ([drop.x, drop.y, drop.z] as [number, number, number])
          : p.position;
        const rotY = drop ? drop.yaw : (p.rotationY ?? 0);
        return (
          <Interactable
            key={p.id}
            id={p.id}
            position={pos}
            rotationY={rotY}
            visible={!hidden}
            hit={p.hit}
            hitOffset={p.hitOffset}
          >
            <group scale={p.worldScale ?? 1}>
              <PropMesh id={p.id} />
            </group>
          </Interactable>
        );
      })}

      <ContactShadows position={[0, 0.018, 0]} opacity={0.32} scale={14} blur={2.4} far={3.2} />
    </group>
  );
}

function ApartmentWalls({ material }: { material: THREE.MeshStandardMaterial }) {
  const H = ROOM.height;
  const T = ROOM.wall;
  const hw = ROOM.halfW;
  const hd = ROOM.halfD;
  const D = hd * 2;
  const winLeft = WINDOW.x - WINDOW.width / 2;
  const winRight = WINDOW.x + WINDOW.width / 2;
  const sill = WINDOW.sill;
  const winTop = WINDOW.sill + WINDOW.height;
  const winSpan = winRight - winLeft;

  return (
    <group>
      <mesh position={[(-hw + winLeft) / 2, H / 2, -hd]} material={material} receiveShadow castShadow>
        <boxGeometry args={[winLeft - -hw, H, T]} />
      </mesh>
      <mesh position={[(winRight + hw) / 2, H / 2, -hd]} material={material} receiveShadow castShadow>
        <boxGeometry args={[hw - winRight, H, T]} />
      </mesh>
      <mesh position={[(winLeft + winRight) / 2, sill / 2, -hd]} material={material} receiveShadow>
        <boxGeometry args={[winSpan, sill, T]} />
      </mesh>
      <mesh
        position={[(winLeft + winRight) / 2, (winTop + H) / 2, -hd]}
        material={material}
        receiveShadow
      >
        <boxGeometry args={[winSpan, H - winTop, T]} />
      </mesh>

      <mesh position={[-hw, H / 2, 0]} material={material} receiveShadow>
        <boxGeometry args={[T, H, D]} />
      </mesh>
      <mesh position={[hw, H / 2, 0]} material={material} receiveShadow>
        <boxGeometry args={[T, H, D]} />
      </mesh>

      <SouthWall material={material} />
    </group>
  );
}

function SouthWall({ material }: { material: THREE.MeshStandardMaterial }) {
  const H = ROOM.height;
  const T = ROOM.wall;
  const hw = ROOM.halfW;
  const hd = ROOM.halfD;
  const gapLeft = DOOR.x - DOOR.gap / 2;
  const gapRight = DOOR.x + DOOR.gap / 2;
  const leftW = gapLeft - -hw;
  const rightW = hw - gapRight;
  return (
    <group>
      <mesh position={[(-hw + gapLeft) / 2, H / 2, hd]} material={material} receiveShadow>
        <boxGeometry args={[leftW, H, T]} />
      </mesh>
      <mesh position={[(gapRight + hw) / 2, H / 2, hd]} material={material} receiveShadow>
        <boxGeometry args={[rightW, H, T]} />
      </mesh>
      <mesh position={[DOOR.x, (DOOR.height + H) / 2, hd]} material={material} receiveShadow>
        <boxGeometry args={[DOOR.gap, H - DOOR.height, T]} />
      </mesh>
    </group>
  );
}

function Poster({
  map,
  position,
  rotationY = 0,
}: {
  map: THREE.Texture;
  position: [number, number, number];
  rotationY?: number;
}) {
  return (
    <mesh position={position} rotation={[0, rotationY, 0]}>
      <planeGeometry args={[0.7, 0.95]} />
      <meshStandardMaterial map={map} roughness={0.8} />
    </mesh>
  );
}
