"use client";

import { Suspense, lazy, useMemo, useSyncExternalStore } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useState } from "react";
import { quality, type Tier } from "@/lib/motion-state";
import { WORLDS, type WorldId } from "@/lib/worlds";
import { useWorldStore } from "@/lib/store";

/**
 * The stage.
 *
 * One WebGL context for the entire site, mounted once in the root layout
 * and never torn down. Only the *contents* change: each world is a
 * separate code-split module and exactly one is mounted at a time, so
 * seven environments cost roughly what one costs.
 *
 * Every world is written to the same budget — six draw calls, no
 * post-processing, no environment maps, animation on the GPU wherever it
 * can be. That budget is the reason this can be ambitious without being
 * heavy.
 */

const ENVS: Record<WorldId, React.LazyExoticComponent<React.ComponentType>> = {
  tree: lazy(() => import("./env/Tree")),
  lattice: lazy(() => import("./env/Lattice")),
  prism: lazy(() => import("./env/Prism")),
  bloom: lazy(() => import("./env/Bloom")),
  orbit: lazy(() => import("./env/Orbit")),
  tide: lazy(() => import("./env/Tide")),
  neon: lazy(() => import("./env/Neon")),
};

const DPR: Record<Tier, number> = { low: 1, mid: 1.3, high: 1.7 };

let probed: boolean | null = null;
function webglAvailable() {
  if (probed !== null) return probed;
  try {
    const c = document.createElement("canvas");
    probed = !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl2") || c.getContext("webgl"))
    );
  } catch {
    probed = false;
  }
  return probed;
}
const noopSubscribe = () => () => {};

function WorldContents() {
  const world = useWorldStore((s) => s.world);
  const Env = ENVS[world];
  // `key` forces a clean remount per world: leftover state from the last
  // place would be worse than a one-frame gap.
  return (
    <Suspense fallback={null}>
      <Env key={world} />
    </Suspense>
  );
}

export default function Stage() {
  const world = useWorldStore((s) => s.world);
  const accent = WORLDS[world].accent;

  // useSyncExternalStore rather than an effect: the server snapshot is
  // false, the client snapshot is the real capability, no cascading render.
  const ready = useSyncExternalStore(noopSubscribe, webglAvailable, () => false);

  const [tier] = useState<Tier>(() => quality.tier);
  const [dpr, setDpr] = useState(() => DPR[quality.tier]);

  // Painted ground under the canvas. Kept almost pure black — the world
  // is the only thing allowed to put colour on screen, and a tinted plate
  // behind it just turns the whole page into a colour cast.
  const ground = useMemo(
    () => ({
      backgroundImage: `radial-gradient(70% 50% at 62% 26%, ${accent}0d, transparent 64%)`,
    }),
    [accent],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-void transition-[background-image] duration-1000"
        style={ground}
      />

      {ready && (
        <Canvas
          className="!absolute inset-0"
          dpr={dpr}
          gl={{
            antialias: tier === "high",
            alpha: true,
            powerPreference: "high-performance",
            stencil: false,
          }}
          camera={{ fov: 40, near: 0.1, far: 120, position: [0, 0, 12] }}
          frameloop={quality.reducedMotion ? "demand" : "always"}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
            // Without this the tab keeps a dead canvas after a GPU reset
            // instead of letting the browser restore the context.
            gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault());
          }}
        >
          <PerformanceMonitor
            onDecline={() => setDpr((d) => Math.max(0.8, d - 0.2))}
            onIncline={() => setDpr((d) => Math.min(DPR[tier], d + 0.1))}
            flipflops={3}
            onFallback={() => setDpr(0.8)}
          />
          <WorldContents />
        </Canvas>
      )}

      <div className="grain" />
    </div>
  );
}
