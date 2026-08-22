/**
 * Shared mutable motion state.
 *
 * Scroll and pointer are read every frame by both the WebGL loop and the
 * GSAP loop. Routing them through React state would re-render the tree at
 * refresh rate, so they live here as plain mutable objects. Nothing in
 * this module ever triggers a render.
 */

export const scroll = {
  /** Smoothed offset in px, from Lenis — not window.scrollY. */
  y: 0,
  /** 0..1 through the document. */
  progress: 0,
  /** Signed px/frame. Positive is downward. */
  velocity: 0,
  /** Absolute velocity, damped, so effects settle when scrolling stops. */
  energy: 0,
  limit: 1,
};

export const pointer = {
  x: 0,
  y: 0,
  /** Normalised to -1..1 from viewport centre. */
  nx: 0,
  ny: 0,
  /** Damped follower, so 3D parallax lags the raw pointer slightly. */
  sx: 0,
  sy: 0,
  /** How fast the pointer is moving, damped. Drives splash and shove. */
  speed: 0,
  down: false,
};

export type Tier = "low" | "mid" | "high";

export const quality = {
  tier: "high" as Tier,
  reducedMotion: false,
};

/** Frame-rate independent exponential damping. */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export function clamp(v: number, min = 0, max = 1) {
  return v < min ? min : v > max ? max : v;
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Seeded PRNG (mulberry32). Scene layout uses this rather than Math.random
 * so a given build always composes identically — which makes the worlds
 * something that can be art-directed instead of rolled, and keeps setup a
 * pure function of its seed.
 */
export function makeRng(seed: number) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function detectTier(): Tier {
  if (typeof window === "undefined") return "high";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "low";

  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;

  if (cores <= 2) return "low";
  if (cores <= 4 || mem <= 4 || (coarse && window.innerWidth < 900)) return "mid";
  return "high";
}
