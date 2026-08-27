import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { unlockAudio } from "./audio";
import { attachInput, tryPointerLock } from "./input";
import { FirstPersonPlayer } from "./player";
import { installControlsTest } from "./controlsTest";
import { useGame } from "./store";
import { Hud } from "./ui/Hud";
import { InspectOverlay } from "./ui/InspectOverlay";
import { PauseOverlay } from "./ui/PauseOverlay";
import { SleepOverlay } from "./ui/SleepOverlay";
import { StartOverlay } from "./ui/StartOverlay";
import { StorageOverlay } from "./ui/StorageOverlay";
import { ComputerOverlay } from "./ui/ComputerOverlay";
import { TouchControls } from "./ui/TouchControls";
import { Apartment } from "./world";
import { SPAWN } from "./constants";

export default function GameApp() {
  const phase = useGame((s) => s.phase);
  const isTouch = useGame((s) => s.isTouch);
  const [canvasEl, setCanvasEl] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    installControlsTest();
    const touch = window.matchMedia("(pointer: coarse)").matches;
    useGame.getState().setTouch(touch);
    const qa = new URLSearchParams(window.location.search);
    if (qa.get("qa") === "1" || qa.get("debug") === "1") {
      if (qa.get("debug") === "1") useGame.getState().toggleDebug();
      if (qa.get("qa") === "1") useGame.getState().start();
    }
    const flush = () => useGame.getState().flushSave();
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  useEffect(() => {
    if (!canvasEl) return;
    return attachInput(canvasEl);
  }, [canvasEl]);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      <Canvas
        className="absolute inset-0 touch-none"
        dpr={[1, 1.75]}
        shadows
        camera={{
          fov: 75,
          near: 0.08,
          far: 60,
          position: [SPAWN.x, 1.62, SPAWN.z],
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          setCanvasEl(gl.domElement);
          gl.domElement.addEventListener("click", () => {
            if (useGame.getState().phase === "playing") {
              unlockAudio();
              void tryPointerLock();
            }
          });
        }}
      >
        <color attach="background" args={["#16131c"]} />
        <fog attach="fog" args={["#16131c", 10, 26]} />
        <Apartment />
        <FirstPersonPlayer />
      </Canvas>

      {phase === "playing" || phase === "inspecting" ? <Hud /> : null}
      {phase === "playing" && isTouch ? <TouchControls /> : null}
      {phase === "boot" ? <StartOverlay /> : null}
      {phase === "paused" ? <PauseOverlay /> : null}
      {phase === "inspecting" ? <InspectOverlay /> : null}
      {phase === "computer" ? <ComputerOverlay /> : null}
      {phase === "storage" ? <StorageOverlay /> : null}
      {phase === "sleeping" ? <SleepOverlay /> : null}
    </div>
  );
}
