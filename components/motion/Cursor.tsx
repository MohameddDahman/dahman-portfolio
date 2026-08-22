"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { quality } from "@/lib/motion-state";

/**
 * The pointer.
 *
 * Three layers at different follow rates — a hard dot tracking 1:1, a ring
 * that lags, and a soft glow that lags further — so fast movement stretches
 * the group into a comet and rest collapses it to a point. It takes its
 * colour from the world you are standing in.
 *
 * The important detail is *when* `cursor: none` is applied. Hiding the
 * system pointer on mount means that if anything stalls the animation
 * frame before first paint, the visitor is left with nothing at all. Here
 * the class goes on only after the cursor has been positioned and drawn,
 * and comes straight back off on blur, on leaving the document, on
 * unmount, or if pointer events simply stop arriving.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (quality.reducedMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const d = dot.current;
    const r = ring.current;
    const g = glow.current;
    const l = label.current;
    if (!d || !r || !g || !l) return;

    const root = document.documentElement;
    gsap.set([d, r, g], { xPercent: -50, yPercent: -50, opacity: 0 });

    const dx = gsap.quickTo(d, "x", { duration: 0.04, ease: "none" });
    const dy = gsap.quickTo(d, "y", { duration: 0.04, ease: "none" });
    const rx = gsap.quickTo(r, "x", { duration: 0.42, ease: "power3.out" });
    const ry = gsap.quickTo(r, "y", { duration: 0.42, ease: "power3.out" });
    const gx = gsap.quickTo(g, "x", { duration: 0.75, ease: "power3.out" });
    const gy = gsap.quickTo(g, "y", { duration: 0.75, ease: "power3.out" });

    let live = false;
    let lastMove = 0;

    const goLive = () => {
      if (live) return;
      live = true;
      root.classList.add("pointer-live");
      gsap.to([d, r, g], { opacity: 1, duration: 0.35, ease: "power2.out" });
    };

    const standDown = () => {
      if (!live) return;
      live = false;
      root.classList.remove("pointer-live");
      gsap.to([d, r, g], { opacity: 0, duration: 0.2 });
    };

    const move = (e: PointerEvent) => {
      lastMove = performance.now();
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      gx(e.clientX);
      gy(e.clientY);
      // Position first, hide the system cursor second. Never the reverse.
      if (!live) requestAnimationFrame(goLive);
    };

    const over = (e: PointerEvent) => {
      const el = (e.target as HTMLElement)?.closest?.(
        "a, button, [data-cursor]",
      ) as HTMLElement | null;
      const tag = el?.dataset.cursor;

      if (el) {
        l.textContent = tag ?? "";
        gsap.to(r, { width: 62, height: 62, borderWidth: 1, duration: 0.4, ease: "expo.out" });
        gsap.to(g, { scale: 1.8, duration: 0.5, ease: "expo.out" });
        gsap.to(d, { scale: 0.35, duration: 0.4, ease: "expo.out" });
        gsap.to(l, { opacity: tag ? 1 : 0, duration: 0.25 });
      } else {
        gsap.to(r, { width: 26, height: 26, borderWidth: 1, duration: 0.4, ease: "expo.out" });
        gsap.to(g, { scale: 1, duration: 0.5, ease: "expo.out" });
        gsap.to(d, { scale: 1, duration: 0.4, ease: "expo.out" });
        gsap.to(l, { opacity: 0, duration: 0.18 });
      }
    };

    const down = () => gsap.to(r, { scale: 0.78, duration: 0.18, ease: "power2.out" });
    const up = () => gsap.to(r, { scale: 1, duration: 0.35, ease: "expo.out" });

    // Safety net: if pointer events stop while the window still has focus,
    // give the real cursor back rather than leaving a ghost behind.
    const watchdog = window.setInterval(() => {
      if (live && performance.now() - lastMove > 4000) standDown();
    }, 2000);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    window.addEventListener("blur", standDown);
    document.addEventListener("pointerleave", standDown);

    return () => {
      window.clearInterval(watchdog);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("blur", standDown);
      document.removeEventListener("pointerleave", standDown);
      root.classList.remove("pointer-live");
    };
  }, []);

  // Difference blending is what lets a single white cursor stay visible
  // over both a black void and a lit surface, with no halo and no shadow.
  return (
    <div
      aria-hidden
      className="blend-diff pointer-events-none fixed inset-0 z-[210] hidden md:block"
    >
      <div
        ref={glow}
        className="fixed left-0 top-0 h-[130px] w-[130px] rounded-full opacity-0"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 68%)",
        }}
      />
      <div
        ref={ring}
        className="fixed left-0 top-0 flex h-[26px] w-[26px] items-center justify-center border opacity-0"
        style={{ borderColor: "rgba(255,255,255,0.85)" }}
      >
        <span
          ref={label}
          className="t-label absolute top-[calc(100%+9px)] whitespace-nowrap text-[8.5px] opacity-0"
          style={{ color: "#fff" }}
        />
      </div>
      <div
        ref={dot}
        className="fixed left-0 top-0 h-[5px] w-[5px] opacity-0"
        style={{ background: "#fff" }}
      />
    </div>
  );
}
