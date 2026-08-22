"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { quality } from "@/lib/motion-state";

/**
 * A live readout of this page, on your machine.
 *
 * The site claims to be cheap; this is the instrument that either backs
 * that up or doesn't. Everything is measured rather than asserted — frame
 * rate from the shared ticker, long tasks from PerformanceObserver, and
 * the canvas buffer read off the live element rather than a constant.
 *
 * Values are written straight to the DOM. A meter updating this often
 * through React state would re-render the tree every frame and make the
 * number it reports worse.
 */
export default function FrameMeter() {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const cell = (k: string) => el.querySelector<HTMLElement>('[data-k="' + k + '"]');
    const fpsEl = cell("fps");
    const msEl = cell("ms");
    const jankEl = cell("jank");
    const bufEl = cell("buf");
    const tierEl = cell("tier");
    const motionEl = cell("motion");

    let longTasks = 0;
    let observer: PerformanceObserver | null = null;
    try {
      observer = new PerformanceObserver((list) => {
        longTasks += list.getEntries().length;
      });
      observer.observe({ entryTypes: ["longtask"] });
    } catch {
      // Not shipped in Safari or Firefox. Say so rather than lying.
      if (jankEl) jankEl.textContent = "unavailable";
    }

    if (tierEl) tierEl.textContent = quality.tier;
    if (motionEl) motionEl.textContent = quality.reducedMotion ? "reduced" : "full";

    let frames = 0;
    let acc = 0;

    const tick = () => {
      frames++;
      acc += gsap.ticker.deltaRatio(60) / 60;
      if (acc < 0.5) return;

      const fps = Math.round(frames / acc);
      if (fpsEl) fpsEl.textContent = fps + " fps";
      if (msEl) msEl.textContent = ((acc / frames) * 1000).toFixed(1) + " ms";
      if (jankEl && observer) {
        jankEl.textContent = longTasks === 0 ? "no long tasks" : longTasks + " long tasks";
      }
      if (bufEl) {
        const c = document.querySelector("canvas");
        bufEl.textContent = c ? c.width + " × " + c.height : "no canvas";
      }
      if (bar.current) bar.current.style.transform = "scaleX(" + Math.min(1, fps / 60) + ")";

      frames = 0;
      acc = 0;
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      observer?.disconnect();
    };
  }, []);

  const rows: [string, string][] = [
    ["Frame rate", "fps"],
    ["Frame time", "ms"],
    ["Main thread", "jank"],
    ["Canvas buffer", "buf"],
    ["Quality tier", "tier"],
    ["Motion", "motion"],
  ];

  return (
    <div ref={root} className="panel p-6">
      <div className="mb-5 flex items-center justify-between">
        <span className="t-label">Live · this page</span>
        <span className="flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 animate-pulse"
            style={{ background: "var(--accent)" }}
          />
          <span className="t-label" style={{ color: "var(--accent)" }}>
            Measuring
          </span>
        </span>
      </div>

      <dl>
        {rows.map(([label, key]) => (
          <div
            key={key}
            className="flex items-baseline justify-between gap-6 border-b border-w08 py-2.5 last:border-0"
          >
            <dt className="t-label">{label}</dt>
            <dd data-k={key} className="t-mono text-[11px] text-w90">
              —
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="t-label">Budget</span>
          <span className="t-label">60 fps</span>
        </div>
        <div className="h-[2px] w-full overflow-hidden bg-w08">
          <div
            ref={bar}
            className="h-full w-full origin-left scale-x-0 transition-transform duration-700 ease-out"
            style={{ background: "var(--accent)" }}
          />
        </div>
      </div>
    </div>
  );
}
