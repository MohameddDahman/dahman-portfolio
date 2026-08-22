# Portfolio — Seven Worlds

Personal site for Mohamed Dahman. Next.js 16 (App Router), multipage, with
seven live 3D environments sharing a single WebGL context.

## The idea

A portfolio built like a level select, in the visual language of the
reference sites: **pure black, white, and nothing else.**

The whole palette is one colour at seven alphas — 95/90/60/40/30/20/8
percent white. Hierarchy comes from size and opacity, never from hue or
weight. Every heading is uppercase Archivo at weight 400 with *positive*
tracking; every label is JetBrains Mono at 9px. Nothing has a corner
radius. Surfaces are black glass — `rgba(0,0,0,α)` with a backdrop blur
and a 0.8px border at 2.4% white — not grey cards. The fixed chrome
composites with `mix-blend-mode: difference`, so it inverts against
whatever the world puts behind it and never needs a plate of its own.

Every destination is a *place* with its own live 3D environment.
Navigating plays a warp: six columns sweep up, the destination's name
lands on them, the route and the world swap behind the cover, and the
columns clear.

| # | World | Where | What it is |
|---|-------|-------|------------|
| 01 | Tree | `/` | A DOM tree, and a render pass walking it depth-first |
| 02 | Lattice | `/work` | Wireframe terrain, flown by scroll |
| 03 | Prism | `/about` | Shards splitting light into value |
| 04 | Bloom | `/contact` | A swarm that follows the cursor |
| 05 | Orbit | `/lab` | A body, a debris ring, a deep field |
| 06 | Tide | project pages | A surface that remembers where you touched it |
| 07 | Neon | project pages | A tunnel of gates, falling |

The home world is the one that carries meaning rather than decoration: a
root, a fan of children, and a traversal sweeping the structure in
depth-first order — the one thing a frontend engineer actually builds,
drawn as itself. Scroll pushes the pass along, so it runs while you read.

## Running it

```bash
npm run dev
```

Convex powers the toolkit lists and the contact form; `NEXT_PUBLIC_CONVEX_URL`
must be set in `.env.local`. Set `NEXT_PUBLIC_SITE_URL` in production so
canonical and Open Graph URLs resolve absolutely.

## Routes

```
/                 landing — hero, statement, selected work, worlds, process
/work             the rail: a pinned 3D corridor of projects
/work/[slug]      case study, statically generated, own world per project
/lab              switch all seven worlds live, with what each one costs
/about            story, beliefs, live frame meter, toolkit (from Convex)
/contact          the form, plus an FAQ
```

## Structure

```
app/                  routes
components/
  gl/
    Stage.tsx         the single canvas; code-splits and mounts one world
    env/*.tsx         the seven worlds, one file each
    shared/glsl.ts    noise + lighting chunks shared across worlds
  motion/
    Scroll.tsx        Lenis driven from the GSAP ticker — one scroll authority
    Warp.tsx          the between-worlds curtain; intercepts navigation
    Reveal.tsx        SplitText line masks, rise groups, skew, parallax
    Scramble.tsx      decode-in text
    Cursor.tsx        three-layer pointer, composited with difference
    Magnetic.tsx      pointer-attracted wrapper
  ui/                 Hud, Hero, Rail, WorldStrip, StackCards, Panel, …
lib/
  worlds.ts           the seven worlds — names, taglines, interactions
  motion-state.ts     mutable scroll/pointer (never re-renders React)
  store.ts            tiny zustand store: current world, warp state
data/projects.ts      <-- REPLACE THE PLACEHOLDERS
```

## What to edit first

1. **`data/projects.ts`** — every entry is a placeholder and renders a
   visible "Placeholder" marker while `draft: true`. Each project also
   picks which world stands behind its page.
2. **Social links** in `components/ui/Footer.tsx` (currently bare
   github.com / linkedin.com).
3. **`lib/worlds.ts`** — names, taglines and interaction hints. Every
   world's `accent` is white; that field is the single place to put hue
   back if you ever want it.

## Performance

Seven environments, and they cost roughly what one costs:

- **One WebGL context**, mounted once in the root layout and never torn
  down. Worlds are code-split with `React.lazy` and exactly one is mounted
  at a time.
- **A hard budget per world**: at most three draw calls, no
  post-processing, no environment maps, nothing fetched over the network.
  The glow effects are fragment-stage falloffs, not bloom passes.
- **Animation on the GPU wherever possible.** Bloom's swarm and Lattice's
  100×100 terrain are animated entirely in their vertex stages — the CPU
  cost of each is a couple of uniform writes per frame. The Tree's
  traversal sweep is one uniform, not forty animations.
- **One rAF loop.** Lenis is driven from `gsap.ticker` with
  `lagSmoothing(0)`. Two independent loops is what makes inertial-scroll
  sites feel a frame behind the wheel.
- **Scroll never re-renders React.** Scroll and pointer live in plain
  mutable objects in `lib/motion-state.ts`, read inside `useFrame` and the
  ticker.
- **Detail scales with device tier** (`detectTier()`), and
  `PerformanceMonitor` walks resolution down further if frames slip.

`/lab` carries a live frame meter — frame rate, frame time, long tasks,
canvas buffer — measured from the real renderer rather than asserted.

### Verifying the shaders

Custom GLSL fails *silently*: a bad shader leaves a world blank with
nothing in the console a visitor will ever see. Every shader source is
exported from its world module (`TREE_NODE_VERT`, `TIDE_FRAG`, …) so a
throwaway page can compile all eleven programs through a real
`WebGLRenderer` and check `gl.getError()`.

Doing exactly that caught `sample` being a reserved word in GLSL ES 3.0,
which had silently blanked the entire Lattice world. Worth repeating after
any shader change.

## Accessibility

- `prefers-reduced-motion` disables the reveals, the warp (navigation
  becomes instant), the rail pin, and the worlds' animation.
- The custom cursor only replaces the pointer on fine-pointer devices, and
  hides the system cursor *only after* it has painted — with a watchdog
  that restores it if pointer events stop.
- The rail renders one set of rows for both layouts, so screen readers get
  exactly one copy of each project.
- Native focus outlines kept and styled; skip link to content.
