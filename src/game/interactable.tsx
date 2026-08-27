import { useLayoutEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { registerInteractable, unregisterInteractable } from "./registry";

export function Interactable({
  id,
  position,
  rotationY = 0,
  visible = true,
  hit,
  hitOffset,
  children,
}: {
  id: string;
  position: [number, number, number];
  rotationY?: number;
  visible?: boolean;
  hit: [number, number, number];
  hitOffset?: [number, number, number];
  children?: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    const g = ref.current;
    if (!g) return;
    g.userData.propId = id;
    registerInteractable(g);
    return () => unregisterInteractable(g);
  }, [id]);

  const off = hitOffset ?? [0, 0, 0];

  return (
    <group ref={ref} position={position} rotation={[0, rotationY, 0]} visible={visible}>
      {children}
      <mesh position={off}>
        <boxGeometry args={hit} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
