/**
 * The seven worlds.
 *
 * Every destination on this site is a place, and each place has its own
 * environment and its own mood.
 *
 * The palette is deliberately empty. Every world's accent is white: the
 * interface carries no hue at all, and the places are told apart by form,
 * motion and name rather than by colour. `accent` stays a per-world field
 * so a hue could be reintroduced in one line, but shipping seven colours
 * over seven live scenes turned the whole site into a colour cast.
 *
 * `env` names a module under components/gl/env. Only one is ever mounted;
 * they are code-split and loaded on arrival.
 */

export type WorldId =
  | "tree"
  | "lattice"
  | "prism"
  | "bloom"
  | "orbit"
  | "tide"
  | "neon";

export type World = {
  id: WorldId;
  /** Two-digit index shown in the HUD. */
  index: string;
  name: string;
  /** One line of flavour, shown during the warp. */
  tagline: string;
  /** Hex accent. Drives HUD, cursor, key light and curtain. */
  accent: string;
  /** A dimmer companion, used for gradients and secondary marks. */
  accentDeep: string;
  /** What the pointer does here. Shown as a HUD hint. */
  interaction: string;
};

export const WORLDS: Record<WorldId, World> = {
  tree: {
    id: "tree",
    index: "01",
    name: "Tree",
    tagline: "A DOM, and a render pass walking it",
    accent: "#ffffff",
    accentDeep: "rgba(255,255,255,0.45)",
    interaction: "Nodes light in traversal order · scroll drives the pass",
  },
  lattice: {
    id: "lattice",
    index: "02",
    name: "Lattice",
    tagline: "A grid that breathes",
    accent: "#ffffff",
    accentDeep: "rgba(255,255,255,0.45)",
    interaction: "Scroll to fly the grid",
  },
  prism: {
    id: "prism",
    index: "03",
    name: "Prism",
    tagline: "Light, split apart",
    accent: "#ffffff",
    accentDeep: "rgba(255,255,255,0.45)",
    interaction: "Move to turn the shards",
  },
  bloom: {
    id: "bloom",
    index: "04",
    name: "Bloom",
    tagline: "Six thousand small lights",
    accent: "#ffffff",
    accentDeep: "rgba(255,255,255,0.45)",
    interaction: "The swarm follows your cursor",
  },
  orbit: {
    id: "orbit",
    index: "05",
    name: "Orbit",
    tagline: "Somewhere quiet and far",
    accent: "#ffffff",
    accentDeep: "rgba(255,255,255,0.45)",
    interaction: "Drag your eye across the field",
  },
  tide: {
    id: "tide",
    index: "06",
    name: "Tide",
    tagline: "A surface that remembers",
    accent: "#ffffff",
    accentDeep: "rgba(255,255,255,0.45)",
    interaction: "Move to break the surface",
  },
  neon: {
    id: "neon",
    index: "07",
    name: "Neon",
    tagline: "Falling through the gate",
    accent: "#ffffff",
    accentDeep: "rgba(255,255,255,0.45)",
    interaction: "Scroll to travel the tunnel",
  },
};

export const WORLD_LIST = Object.values(WORLDS);

/** Which world a route stands in. */
export function worldForPath(pathname: string, projectWorld?: WorldId): WorldId {
  if (pathname === "/") return "tree";
  if (pathname === "/work") return "lattice";
  if (pathname.startsWith("/work/")) return projectWorld ?? "neon";
  if (pathname.startsWith("/about")) return "prism";
  if (pathname.startsWith("/lab")) return "orbit";
  if (pathname.startsWith("/contact")) return "bloom";
  return "tree";
}
