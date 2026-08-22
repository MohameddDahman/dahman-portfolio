"use client";

import { useEffect } from "react";
import PageHead from "@/components/ui/PageHead";
import Panel from "@/components/ui/Panel";
import FrameMeter from "@/components/ui/FrameMeter";
import { RiseGroup } from "@/components/motion/Reveal";
import { WORLD_LIST, WORLDS, type WorldId } from "@/lib/worlds";
import { useWorldStore } from "@/lib/store";

/**
 * The lab.
 *
 * The one page where the environment is not decided by the route. Pick a
 * world and it loads underneath you, live, without navigating — which is
 * also the clearest way to show that all seven really are running scenes
 * rather than seven background videos.
 *
 * Each entry lists what it is actually made of, because the interesting
 * claim on this site is not "there is 3D" but "there is 3D and it is
 * cheap".
 */

const SPECS: Record<WorldId, { built: string; cost: string; trick: string }> = {
  tree: {
    built: "One point cloud, one set of line segments",
    cost: "2 draw calls · ~40 nodes",
    trick:
      "It is a DOM tree and a render pass walking it in depth-first order — the one structure this whole job is actually about. Each node and edge carries its traversal index as a vertex attribute, so the sweep is one uniform, not forty animations.",
  },
  lattice: {
    built: "One plane, drawn twice",
    cost: "2 draw calls · 100 × 100 grid",
    trick:
      "Scroll slides the noise sample window rather than the mesh, so the terrain is endless and the geometry never moves. Flying thirty units costs one uniform write.",
  },
  prism: {
    built: "One instanced octahedron",
    cost: "1 draw call · up to 15 shards",
    trick:
      "Real refraction means rendering the scene into a buffer per shard. This fakes dispersion in the fragment stage with a cosine palette driven by view angle — about thirty instructions.",
  },
  bloom: {
    built: "One point cloud",
    cost: "1 draw call · 6,500 points",
    trick:
      "Every particle is animated in the vertex shader from a time uniform and an attractor. The CPU cost of the whole swarm is two uniform writes per frame.",
  },
  orbit: {
    built: "A point field, a body, an instanced ring",
    cost: "3 draw calls · 3,200 stars",
    trick:
      "The planet's surface is generated in the fragment stage — banded noise quantised into strata. No texture, so nothing to download.",
  },
  tide: {
    built: "One plane",
    cost: "1 draw call · 140 × 140 grid",
    trick:
      "A ring buffer of eight ripple origins is passed as uniforms; each vertex sums the expanding rings. Enough to feel continuous, cheap enough to stay one draw call.",
  },
  neon: {
    built: "One instanced torus, one point cloud",
    cost: "2 draw calls · 46 gates",
    trick:
      "Gates wrap modulo the tunnel length, so the run is endless and no geometry is ever created or destroyed. The glow is a fragment falloff, not a bloom pass.",
  },
};

export default function LabClient() {
  const world = useWorldStore((s) => s.world);
  const visitWorld = useWorldStore((s) => s.visitWorld);
  const current = WORLDS[world];
  const spec = SPECS[world];

  // Arriving here should feel like standing somewhere, so the lab opens in
  // its own world rather than inheriting whatever you came from.
  useEffect(() => {
    visitWorld("orbit");
  }, [visitWorld]);

  return (
    <main>
      <PageHead
        index="02"
        eyebrow="Lab · Pick a world"
        title="Seven places, one canvas"
        lede="Every environment on this site runs in a single WebGL context, and only one is ever mounted. Switch between them here — no page load, no download, nothing torn down but the scene itself."
      />

      <section className="shell py-[4vh]">
        <div className="rule mb-8" />

        {/* ---- Selector ---- */}
        <div className="flex flex-wrap gap-2">
          {WORLD_LIST.map((w) => {
            const on = w.id === world;
            return (
              <button
                key={w.id}
                onClick={() => visitWorld(w.id)}
                data-cursor={on ? "Here" : "Go"}
                aria-pressed={on}
                className={
                  "group relative flex items-center gap-2.5  border px-4 py-2.5 transition-all duration-400 " +
                  (on ? "border-transparent" : "border-w08 hover:border-w20")
                }
                style={on ? { background: w.accent } : undefined}
              >
                <span
                  className="h-1.5 w-1.5 transition-colors duration-300"
                  style={{ background: on ? "#000" : w.accent }}
                />
                <span
                  className="t-label transition-colors duration-300"
                  style={{ color: on ? "#000" : undefined }}
                >
                  {w.index} {w.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---- Current world ---- */}
      <section className="shell grid gap-8 py-[6vh] lg:grid-cols-[1.15fr_0.85fr]">
        <Panel className="p-8 md:p-10">
          <div className="relative">
            <div className="flex items-baseline gap-3">
              <span className="t-mono text-[11px]" style={{ color: "var(--accent)" }}>
                {current.index}
              </span>
              <span className="t-label">Now standing in</span>
            </div>

            <h2 className="t-display mt-4 text-[clamp(1.8rem,3.4vw,2.6rem)] text-white">
              {current.name}
            </h2>
            <p className="t-body mt-3 text-[15px]">{current.tagline}.</p>

            <div
              className="mt-8 border px-4 py-3"
              style={{ borderColor: "color-mix(in oklab, var(--accent) 35%, transparent)" }}
            >
              <span className="t-label" style={{ color: "var(--accent)" }}>
                Try it
              </span>
              <p className="t-body mt-1.5 text-[14px] text-w90">
                {current.interaction}.
              </p>
            </div>

            <dl className="mt-8">
              {[
                ["Built from", spec.built],
                ["Cost", spec.cost],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex flex-col gap-1 border-b border-w08 py-3 last:border-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <dt className="t-label">{k}</dt>
                  <dd className="t-mono text-[11px] text-w90 sm:text-right">{v}</dd>
                </div>
              ))}
            </dl>

            <p className="t-body mt-6 max-w-[50ch] text-[14px]">{spec.trick}</p>
          </div>
        </Panel>

        <div className="space-y-3">
          <FrameMeter />

          <Panel className="p-6">
            <div className="relative">
              <span className="t-label">The rule</span>
              <p className="t-body mt-3 text-[14px]">
                No post-processing. No environment maps. Nothing fetched over
                the network. Every world animates on the GPU wherever it can,
                and detail scales down on weaker hardware before frames
                start dropping.
              </p>
              <p className="t-body mt-4 text-[14px]">
                An earlier version of this site ran a full 3D scene per page
                and made laptops audible. The budget above is what replaced
                it.
              </p>
            </div>
          </Panel>
        </div>
      </section>

      {/* ---- All worlds ---- */}
      <section className="shell py-[8vh]">
        <h2 className="t-label mb-8">The full set</h2>
        <div className="rule mb-6" />

        <RiseGroup className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" stagger={0.06}>
          {WORLD_LIST.map((w) => {
            const s = SPECS[w.id];
            const on = w.id === world;
            return (
              <button
                key={w.id}
                data-rise
                onClick={() => visitWorld(w.id)}
                data-cursor={on ? "Here" : "Visit"}
                className="panel group relative overflow-hidden p-6 text-left transition-transform duration-500 hover:-translate-y-0.5"
              >
                <span
                  className="absolute inset-x-0 top-0 h-px transition-all duration-500"
                  style={{ background: w.accent, opacity: on ? 1 : 0.4 }}
                />
                <div className="flex items-baseline justify-between gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="t-mono text-[9px]" style={{ color: w.accent }}>
                      {w.index}
                    </span>
                    <span className="t-display text-[1.25rem] text-white">{w.name}</span>
                  </div>
                  {on && (
                    <span className="t-label text-[8px]" style={{ color: w.accent }}>
                      Active
                    </span>
                  )}
                </div>
                <p className="t-body mt-3 text-[13.5px]">{w.tagline}</p>
                <p className="t-mono mt-5 text-[10px] text-w40">{s.cost}</p>
              </button>
            );
          })}
        </RiseGroup>
      </section>
    </main>
  );
}
