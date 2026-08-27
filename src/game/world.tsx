import { ContactShadows } from "@react-three/drei";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { ROOM } from "./constants";
import { PropMesh } from "./meshes";
import { PROPS } from "./props";
import { registerInteractable, unregisterInteractable } from "./registry";
import { useGame } from "./store";
import { getTextures } from "./textures";

type DropPose = { x: number; y: number; z: number; yaw: number };

export function PrototypeStudio() {
  const tex = useMemo(() => getTextures(), []);
  const carryingId = useGame((s) => s.carrying?.id);
  const inspectingId = useGame((s) => s.inspecting?.id);
  const lampOn = useGame((s) => s.lampOn);
  const [drops, setDrops] = useState<Record<string, DropPose>>({});

  useEffect(() => {
    const onDrop = (e: Event) => {
      const d = (e as CustomEvent<DropPose & { id: string }>).detail;
      setDrops((prev) => ({ ...prev, [d.id]: d }));
    };
    window.addEventListener("foilbound-drop", onDrop);
    return () => window.removeEventListener("foilbound-drop", onDrop);
  }, []);

  const wallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: tex.plaster,
        color: "#d9d1c3",
        roughness: 0.92,
      }),
    [tex.plaster],
  );
  const trimMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ece4d6",
        roughness: 0.7,
      }),
    [],
  );
  const woodMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: tex.wood,
        roughness: 0.72,
      }),
    [tex.wood],
  );
  const darkWood = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#4a382c",
        roughness: 0.65,
      }),
    [],
  );
  const ceilingMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#e7dfd2",
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
      <hemisphereLight args={["#cfc4b2", "#2a241e", 0.55]} />
      <ambientLight intensity={0.18} />
      <directionalLight
        position={[-2.4, 3.2, -5.5]}
        intensity={1.35}
        color="#f0c9a0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={18}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <pointLight position={[0, 2.4, 0.2]} intensity={0.55} color="#f2e6d0" distance={10} />
      {lampOn ? (
        <pointLight position={[4.05, 1.45, -3.48]} intensity={1.1} color="#f4e2c0" distance={7} />
      ) : null}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        material={woodMat}
        receiveShadow
      >
        <planeGeometry args={[W, D]} />
      </mesh>
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, H, 0]}
        material={ceilingMat}
        receiveShadow
      >
        <planeGeometry args={[W, D]} />
      </mesh>

      {/* Walls */}
      <mesh position={[0, H / 2, -ROOM.halfD]} material={wallMat} receiveShadow castShadow>
        <boxGeometry args={[W, H, T]} />
      </mesh>
      <mesh position={[0, H / 2, ROOM.halfD]} material={wallMat} receiveShadow>
        <boxGeometry args={[W, H, T]} />
      </mesh>
      <mesh position={[-ROOM.halfW, H / 2, 0]} material={wallMat} receiveShadow>
        <boxGeometry args={[T, H, D]} />
      </mesh>
      <mesh position={[ROOM.halfW, H / 2, 0]} material={wallMat} receiveShadow>
        <boxGeometry args={[T, H, D]} />
      </mesh>

      {/* Baseboards */}
      <mesh position={[0, 0.06, -ROOM.halfD + T]} material={trimMat}>
        <boxGeometry args={[W - T * 2, 0.12, 0.04]} />
      </mesh>
      <mesh position={[0, 0.06, ROOM.halfD - T]} material={trimMat}>
        <boxGeometry args={[W - T * 2, 0.12, 0.04]} />
      </mesh>

      <Window tex={tex.city} z={-ROOM.halfD + T * 0.6} />
      <Door z={ROOM.halfD - T * 0.7} />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0.4]}
        receiveShadow
      >
        <planeGeometry args={[2.4, 1.8]} />
        <meshStandardMaterial map={tex.rug} roughness={0.9} />
      </mesh>

      {/* Table */}
      <group position={[0, 0, -0.7]}>
        <mesh position={[0, 0.72, 0]} material={darkWood} castShadow receiveShadow>
          <boxGeometry args={[1.7, 0.06, 0.9]} />
        </mesh>
        {[
          [-0.72, 0.36, -0.36],
          [0.72, 0.36, -0.36],
          [-0.72, 0.36, 0.36],
          [0.72, 0.36, 0.36],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]} material={darkWood} castShadow>
            <boxGeometry args={[0.07, 0.72, 0.07]} />
          </mesh>
        ))}
      </group>

      {/* Back shelf */}
      <mesh position={[4.12, 0.46, -3.55]} material={darkWood} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.92, 0.42]} />
      </mesh>

      <Poster
        map={tex.posterA}
        position={[-2.4, 1.7, -ROOM.halfD + 0.08]}
      />
      <Poster
        map={tex.posterB}
        position={[2.2, 1.65, -ROOM.halfD + 0.08]}
      />

      <pointLight position={[0, 2.7, -0.4]} intensity={0.25} color="#fff4e0" />

      <mesh position={[0, H - 0.06, 0]} material={trimMat}>
        <boxGeometry args={[0.28, 0.05, 0.28]} />
      </mesh>

      {PROPS.map((p) => {
        const hidden = carryingId === p.id || inspectingId === p.id;
        const drop = drops[p.id];
        const pos = drop ? ([drop.x, drop.y, drop.z] as [number, number, number]) : p.position;
        const rotY = drop ? drop.yaw : (p.rotationY ?? 0);
        return (
          <Interactable
            key={p.id}
            id={p.id}
            position={pos}
            rotationY={rotY}
            visible={!hidden}
          >
            <PropMesh id={p.id} />
          </Interactable>
        );
      })}

      <ContactShadows
        position={[0, 0.02, 0]}
        opacity={0.35}
        scale={12}
        blur={2.2}
        far={3}
      />
    </group>
  );
}

function Interactable({
  id,
  position,
  rotationY,
  visible,
  children,
}: {
  id: string;
  position: [number, number, number];
  rotationY: number;
  visible: boolean;
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    const g = ref.current;
    if (!g) return;
    g.userData.propId = id;
    registerInteractable(g);
    return () => unregisterInteractable(g);
  }, [id]);

  const HIT: Record<string, [number, number, number]> = {
    pack: [0.2, 0.28, 0.16],
    mug: [0.14, 0.2, 0.14],
    binder: [0.24, 0.14, 0.26],
    crate: [0.74, 0.74, 0.74],
    lamp: [0.22, 0.72, 0.22],
  };
  const hit = HIT[id] ?? [0.2, 0.2, 0.2];

  return (
    <group ref={ref} position={position} rotation={[0, rotationY, 0]} visible={visible}>
      {children}
      <mesh position={id === "lamp" ? [0, -0.18, 0] : [0, 0, 0]}>
        <boxGeometry args={hit} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Window({ tex, z }: { tex: THREE.Texture; z: number }) {
  const frame = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ece4d6", roughness: 0.5 }),
    [],
  );
  return (
    <group position={[0, 1.55, z]}>
      <mesh material={frame} position={[0, 0, -0.02]}>
        <boxGeometry args={[2.2, 1.35, 0.08]} />
      </mesh>
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[1.95, 1.12]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <mesh position={[0, 0, 0.02]} material={frame}>
        <boxGeometry args={[0.05, 1.12, 0.04]} />
      </mesh>
    </group>
  );
}

function Door({ z }: { z: number }) {
  const paint = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#6d5848", roughness: 0.7 }),
    [],
  );
  const metal = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#c9c3b8",
        metalness: 0.7,
        roughness: 0.3,
      }),
    [],
  );
  return (
    <group position={[1.4, 0, z]}>
      <mesh position={[0, 1.05, 0]} material={paint} castShadow>
        <boxGeometry args={[0.92, 2.1, 0.06]} />
      </mesh>
      <mesh position={[0.34, 1.05, 0.04]} material={metal}>
        <sphereGeometry args={[0.03, 12, 12]} />
      </mesh>
    </group>
  );
}

function Poster({
  map,
  position,
}: {
  map: THREE.Texture;
  position: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <planeGeometry args={[0.7, 0.95]} />
      <meshStandardMaterial map={map} roughness={0.8} />
    </mesh>
  );
}
