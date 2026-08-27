import { useMemo } from "react";
import * as THREE from "three";

const packMat = new THREE.MeshStandardMaterial({
  color: "#1d3a48",
  roughness: 0.45,
  metalness: 0.12,
});
const packFoil = new THREE.MeshStandardMaterial({
  color: "#d8d2c8",
  roughness: 0.18,
  metalness: 0.85,
  emissive: "#3a3834",
  emissiveIntensity: 0.2,
});
const packBand = new THREE.MeshStandardMaterial({
  color: "#cfc3b0",
  roughness: 0.4,
  metalness: 0.3,
});
const ceramic = new THREE.MeshStandardMaterial({
  color: "#d7cfc4",
  roughness: 0.55,
  metalness: 0.02,
});
const ceramicDark = new THREE.MeshStandardMaterial({
  color: "#3b332c",
  roughness: 0.5,
});
const binderMat = new THREE.MeshStandardMaterial({
  color: "#2a3238",
  roughness: 0.6,
});
const ringMat = new THREE.MeshStandardMaterial({
  color: "#b7b1a6",
  metalness: 0.7,
  roughness: 0.3,
});
const crateMat = new THREE.MeshStandardMaterial({
  color: "#8a6a48",
  roughness: 0.8,
});
const crateDark = new THREE.MeshStandardMaterial({
  color: "#5c4632",
  roughness: 0.85,
});
const lampMetal = new THREE.MeshStandardMaterial({
  color: "#6e675c",
  metalness: 0.6,
  roughness: 0.35,
});
const lampShade = new THREE.MeshStandardMaterial({
  color: "#efe6d6",
  roughness: 0.7,
  emissive: "#efe6d6",
  emissiveIntensity: 0.15,
});

export function PropMesh({ id }: { id: string }) {
  if (id === "pack") return <PackMesh />;
  if (id === "mug") return <MugMesh />;
  if (id === "binder") return <BinderMesh />;
  if (id === "crate") return <CrateMesh />;
  if (id === "lamp") return <LampMesh />;
  return null;
}

export function PackMesh() {
  return (
    <group>
      <mesh material={packMat} castShadow dispose={null}>
        <boxGeometry args={[0.078, 0.112, 0.016]} />
      </mesh>
      <mesh position={[0, 0.028, 0.0084]} material={packFoil} dispose={null}>
        <boxGeometry args={[0.07, 0.018, 0.001]} />
      </mesh>
      <mesh position={[0, -0.03, 0.0084]} material={packBand} dispose={null}>
        <boxGeometry args={[0.07, 0.008, 0.001]} />
      </mesh>
    </group>
  );
}

export function MugMesh() {
  const handle = useMemo(() => {
    const geo = new THREE.TorusGeometry(0.028, 0.007, 8, 16, Math.PI);
    geo.rotateY(Math.PI / 2);
    return geo;
  }, []);
  return (
    <group>
      <mesh material={ceramic} castShadow position={[0, 0.01, 0]} dispose={null}>
        <cylinderGeometry args={[0.032, 0.028, 0.07, 16]} />
      </mesh>
      <mesh material={ceramicDark} position={[0, 0.044, 0]} dispose={null}>
        <cylinderGeometry args={[0.03, 0.03, 0.008, 16]} />
      </mesh>
      <mesh geometry={handle} material={ceramic} position={[0.032, 0.01, 0]} dispose={null} />
    </group>
  );
}

export function BinderMesh() {
  return (
    <group>
      <mesh material={binderMat} castShadow rotation={[0, 0, 0.04]} dispose={null}>
        <boxGeometry args={[0.16, 0.02, 0.21]} />
      </mesh>
      <mesh material={ringMat} position={[-0.06, 0.014, 0]} rotation={[Math.PI / 2, 0, 0]} dispose={null}>
        <cylinderGeometry args={[0.008, 0.008, 0.18, 8]} />
      </mesh>
    </group>
  );
}

export function CrateMesh() {
  return (
    <group>
      <mesh material={crateMat} castShadow receiveShadow dispose={null}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
      </mesh>
      <mesh material={crateDark} position={[0, 0.36, 0]} dispose={null}>
        <boxGeometry args={[0.74, 0.04, 0.74]} />
      </mesh>
      <mesh material={crateDark} position={[0, -0.34, 0]} dispose={null}>
        <boxGeometry args={[0.74, 0.06, 0.74]} />
      </mesh>
    </group>
  );
}

export function LampMesh() {
  const shade = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.09, 0.12, 16, 1, true);
    geo.rotateX(Math.PI);
    return geo;
  }, []);
  return (
    <group>
      <mesh material={lampMetal} position={[0, -0.28, 0]} castShadow dispose={null}>
        <cylinderGeometry args={[0.045, 0.06, 0.08, 12]} />
      </mesh>
      <mesh material={lampMetal} position={[0, -0.08, 0]} dispose={null}>
        <cylinderGeometry args={[0.012, 0.012, 0.32, 8]} />
      </mesh>
      <mesh geometry={shade} material={lampShade} position={[0, 0.12, 0]} dispose={null} />
    </group>
  );
}
