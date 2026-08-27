import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { StartOverlay } from "@/game/ui/StartOverlay";

const loadGame = () => import("@/game/GameApp");
const GameApp = lazy(loadGame);

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    void loadGame();
    setMounted(true);
  }, []);

  const shell = (
    <div className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      <StartOverlay />
    </div>
  );

  if (!mounted) return shell;

  return (
    <Suspense fallback={shell}>
      <GameApp />
    </Suspense>
  );
}
