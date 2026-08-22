"use client";

import { create } from "zustand";
import { WORLDS, type WorldId } from "./worlds";

/**
 * The only global React state on the site.
 *
 * Deliberately tiny: which world we are standing in, whether a warp is in
 * flight, and the measured device tier. Everything that changes per frame
 * lives in lib/motion-state.ts as plain mutables instead, because putting
 * it here would re-render the tree sixty times a second.
 */
type State = {
  world: WorldId;
  /** True from the moment a link is clicked until the curtain lifts. */
  warping: boolean;
  /** The world being travelled to, used to colour the curtain. */
  destination: WorldId | null;
  /** Set once the active environment has drawn its first frame. */
  envReady: boolean;

  setWorld: (id: WorldId) => void;
  /** Switch world *and* repaint the accent, without navigating. */
  visitWorld: (id: WorldId) => void;
  beginWarp: (to: WorldId) => void;
  endWarp: () => void;
  setEnvReady: (v: boolean) => void;
};

export const useWorldStore = create<State>((set) => ({
  world: "tree",
  warping: false,
  destination: null,
  envReady: false,

  setWorld: (id) => set({ world: id }),

  visitWorld: (id) => {
    // The lab lets you change place without changing route, so the accent
    // has to be repainted here as well as in the warp.
    const w = WORLDS[id];
    const r = document.documentElement;
    r.style.setProperty("--accent", w.accent);
    r.style.setProperty("--accent-deep", w.accentDeep);
    set({ world: id });
  },
  beginWarp: (to) => set({ warping: true, destination: to, envReady: false }),
  endWarp: () => set({ warping: false, destination: null }),
  setEnvReady: (v) => set({ envReady: v }),
}));

/** Accent of the world currently on screen. */
export function useAccent() {
  const world = useWorldStore((s) => s.world);
  return WORLDS[world].accent;
}
