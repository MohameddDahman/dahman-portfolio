"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scroll, pointer, quality, detectTier, damp } from "@/lib/motion-state";

/**
 * One scroll authority for the whole site.
 *
 * Lenis is driven from the GSAP ticker rather than its own rAF, so smooth
 * scrolling, ScrollTrigger and every timeline advance inside the same
 * frame. Two independent loops is exactly what makes inertial-scroll sites
 * feel soupy — the DOM lands a frame behind the wheel and you read it as
 * lag even though nothing is dropping frames.
 *
 * `lerp` is high and there is no duration: heavy easing reads as latency,
 * not smoothness. Touch keeps its native momentum, because layering Lenis
 * on top of a platform that already has inertia is the other half of why
 * those sites feel wrong.
 */
export default function Scroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    quality.tier = detectTier();
    quality.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: quality.reducedMotion ? 1 : 0.12,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      syncTouch: false,
      autoRaf: false,
      anchors: true,
    });
    lenisRef.current = lenis;
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;

    lenis.on("scroll", (e: { scroll: number; limit: number; velocity: number }) => {
      scroll.y = e.scroll;
      scroll.limit = Math.max(1, e.limit);
      scroll.progress = e.scroll / Math.max(1, e.limit);
      scroll.velocity = e.velocity;
      ScrollTrigger.update();
    });

    const root = document.documentElement;
    let lastDepth = -1;
    let last = -1;
    let px = 0;
    let py = 0;

    const tick = (time: number) => {
      const now = time * 1000;
      const dt = last < 0 ? 0.016 : Math.min(0.05, (now - last) / 1000);
      last = now;

      lenis.raf(now);

      // Energy decays on its own, so effects settle when scrolling stops
      // even though Lenis has stopped emitting events.
      scroll.energy = damp(scroll.energy, Math.abs(scroll.velocity), 9, dt);

      pointer.sx = damp(pointer.sx, pointer.nx, 5, dt);
      pointer.sy = damp(pointer.sy, pointer.ny, 5, dt);

      // Pointer speed in normalised units per second, damped. Worlds use
      // it to decide how hard to react.
      const dx = pointer.nx - px;
      const dy = pointer.ny - py;
      px = pointer.nx;
      py = pointer.ny;
      const raw = Math.hypot(dx, dy) / Math.max(dt, 0.001);
      pointer.speed = damp(pointer.speed, raw, 7, dt);

      // Depth drives the display width axis. Quantised to 20 steps: a
      // continuous value would reshape every variable-font heading on the
      // page on every single frame.
      const step = Math.round(scroll.progress * 20) / 20;
      if (step !== lastDepth) {
        lastDepth = step;
        root.style.setProperty("--depth", String(step));
      }
    };

    gsap.ticker.add(tick);
    // Must be off while Lenis drives the ticker: GSAP's catch-up clamp
    // fights the interpolation and produces a visible hitch after a stall.
    gsap.ticker.lagSmoothing(0);

    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ny = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onDown = () => (pointer.down = true);
    const onUp = () => (pointer.down = false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    // Fonts land after first paint and change every measured height.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);

    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("load", refresh);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as Window & { __lenis?: Lenis }).__lenis;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    // Next resets native scroll on navigation, but Lenis holds its own
    // interpolated position and would otherwise glide the new page back to
    // the top after it has already rendered.
    lenis.scrollTo(0, { immediate: true, force: true });
    scroll.y = 0;
    scroll.progress = 0;
    scroll.velocity = 0;
    scroll.energy = 0;
    document.documentElement.style.setProperty("--depth", "0");
    // Every measurement is stale the instant the DOM changes.
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [pathname]);

  return null;
}
