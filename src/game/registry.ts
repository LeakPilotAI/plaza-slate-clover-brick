import type { Object3D } from "three";

const roots: Object3D[] = [];

export function registerInteractable(obj: Object3D) {
  roots.push(obj);
}

export function unregisterInteractable(obj: Object3D) {
  const i = roots.indexOf(obj);
  if (i >= 0) roots.splice(i, 1);
}

export function interactableRoots() {
  return roots;
}
