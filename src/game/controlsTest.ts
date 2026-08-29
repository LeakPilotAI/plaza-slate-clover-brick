import { solids } from "./collision";
import { setInjectedKeys } from "./input";
import { horizontalSpeed, player, resetPlayer } from "./playerState";
import { interactableRoots } from "./registry";
import { useGame } from "./store";

export function installControlsTest() {
  window.__controlsTest = {
    getYaw: () => player.yaw,
    getSpeed: () => horizontalSpeed(),
    getPosition: () => ({ x: player.x, y: player.y, z: player.z }),
    setKeys: (codes) => {
      setInjectedKeys(codes);
    },
    reset: () => {
      setInjectedKeys([]);
      resetPlayer();
    },
  };

  window.__debug = {
    teleport: (x, y, z) => {
      player.x = x;
      player.y = y;
      player.z = z;
      player.vx = 0;
      player.vy = 0;
      player.vz = 0;
    },
    reset: () => {
      resetPlayer();
      useGame.getState().setCarrying(null);
      useGame.getState().setInspecting(null);
      useGame.getState().closeStation();
    },
    toggleLamp: () => useGame.getState().toggleLamp(),
    toggleDoor: () => useGame.getState().toggleDoor(),
    setLook: (yaw: number, pitch: number) => {
      player.yaw = yaw;
      player.pitch = pitch;
    },
    looking: () => useGame.getState().lookingAt,
    carrying: () => useGame.getState().carrying,
    inspecting: () => useGame.getState().inspecting,
    doorOpen: () => useGame.getState().doorOpen,
    exitOpen: () => useGame.getState().exitOpen,
    zone: () => useGame.getState().zone,
    toggleExit: () => useGame.getState().toggleExit(),
    openShop: () => useGame.getState().openShop(),
    phase: () => useGame.getState().phase,
    openComputer: () => useGame.getState().openComputer(),
    openStorage: () => useGame.getState().openStorage(),
    openSleep: () => useGame.getState().openSleep(),
    closeStation: () => useGame.getState().closeStation(),
    solids: () =>
      solids(useGame.getState().doorOpen, useGame.getState().exitOpen),
    targets: () => interactableRoots().length,
    pose: () => ({
      x: player.x,
      y: player.y,
      z: player.z,
      yaw: player.yaw,
      pitch: player.pitch,
      phase: useGame.getState().phase,
    }),
  };
}
