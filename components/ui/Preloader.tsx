"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { quality, detectTier, type Tier } from "@/lib/motion-state";

const STEPS = [
  "Compiling shaders",
  "Building the field",
  "Binding scroll",
  "Warming the world",
];

const TIERS: { id: Tier; label: string; note: string }[] = [
  { id: "low", label: "Low", note: "Fewest particles, no antialias" },
  { id: "mid", label: "Mid", note: "Balanced" },
  { id: "high", label: "High", note: "Full detail" },
];

/**
 * The gate.
 *
 * A deliberate pause before the site starts. It does three jobs: it holds
 * scroll while the first world compiles its shaders, it gives the WebGL
 * context somewhere to hide during that first expensive frame, and it
 * hands over the one setting that actually matters here — how hard to
 * push the hardware.
 *
 * The quality switcher is not decoration. `detectTier()` guesses from core
 * count and memory, and it guesses wrong often enough that letting people
 * correct it before anything renders is worth a control. The choice is
 * written before the first world mounts, so it applies from frame one.
 *
 * Shown once per session. Coming back from a page in the same tab should
 * not make you sit through it again.
 */
const SEEN_KEY = "md.gate.seen";

const noopSubscribe = () => () => {};

/** Skip the gate for repeat views in the same tab, and for reduced motion. */
function shouldSkip() {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);

  // Whether the gate runs is a client-only fact. useSyncExternalStore
  // gives the server "true" (hidden) and the client the real answer, with
  // no cascading render on mount.
  const skip = useSyncExternalStore(noopSubscribe, shouldSkip, () => true);
  const [dismissed, setDismissed] = useState(false);
  const gone = skip || dismissed;

  const [tier, setTier] = useState<Tier>(() =>
    typeof window === "undefined" ? "high" : detectTier(),
  );

  useEffect(() => {
    if (gone) return;
    const lenis = (window as Window & { __lenis?: { stop(): void; start(): void } }).__lenis;
    lenis?.stop();
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);

    const n = { v: 0 };
    const tl = gsap.timeline();

    tl.to(n, {
      v: 100,
      duration: 2.1,
      ease: "power1.inOut",
      onUpdate: () => {
        const v = Math.round(n.v);
        if (pct.current) pct.current.textContent = String(v).padStart(3, "0");
        if (bar.current) bar.current.style.transform = "scaleX(" + n.v / 100 + ")";
        const s = Math.min(STEPS.length - 1, Math.floor((n.v / 100) * STEPS.length));
        setStep(s);
      },
      onComplete: () => setReady(true),
    });

    return () => {
      tl.kill();
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [gone]);

  const enter = () => {
    const el = root.current;
    if (!el) return;

    // Commit the chosen tier before the first world mounts, so it applies
    // from the very first frame rather than after a re-render.
    quality.tier = tier;
    sessionStorage.setItem(SEEN_KEY, "1");

    const lenis = (window as Window & { __lenis?: { start(): void } }).__lenis;

    gsap
      .timeline({
        onComplete: () => {
          document.body.style.overflow = "";
          lenis?.start();
          setDismissed(true);
          window.dispatchEvent(new Event("md:entered"));
        },
      })
      .to("[data-gate-fade]", { opacity: 0, duration: 0.35, ease: "power2.in" })
      .to(
        "[data-gate-panel]",
        {
          scaleY: 0,
          transformOrigin: "top",
          duration: 0.9,
          ease: "expo.inOut",
          stagger: { each: 0.05, from: "start" },
        },
        "-=0.1",
      );
  };

  if (gone) return null;

  return (
    <div ref={root} className="fixed inset-0 z-[300]">
      {/* Panels, so the gate leaves the same way the warp curtain does. */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} data-gate-panel className="h-full flex-1 origin-top bg-black" />
        ))}
      </div>

      <div
        data-gate-fade
        className="relative flex h-full flex-col justify-between px-[clamp(1.1rem,3.4vw,3.4rem)] py-6"
      >
        {/* ---- Top ---- */}
        <div className="flex items-start justify-between">
          <div>
            <div className="t-display text-[15px] tracking-[0.16em] text-white">DAHMAN</div>
            <div className="t-label mt-1">Frontend engineer</div>
          </div>
          <div className="t-label text-right">
            <div>Seven worlds</div>
            <div className="mt-1 text-w20">One canvas</div>
          </div>
        </div>

        {/* ---- Centre ---- */}
        <div className="flex flex-col items-center">
          <span
            ref={pct}
            className="t-display text-[clamp(4rem,15vw,9rem)] leading-none tracking-[0.02em] text-white"
          >
            000
          </span>

          <div className="mt-6 h-[0.8px] w-[min(78vw,520px)] overflow-hidden bg-w12">
            <div ref={bar} className="h-full w-full origin-left scale-x-0 bg-white" />
          </div>

          <div className="mt-4 flex w-[min(78vw,520px)] items-center justify-between">
            <span className="t-label">{STEPS[step]}</span>
            <span className="t-label">
              {String(step + 1).padStart(2, "0")}/{String(STEPS.length).padStart(2, "0")}
            </span>
          </div>

          {/* ---- Enter ---- */}
          <button
            onClick={enter}
            disabled={!ready}
            data-cursor="Enter"
            className="group relative mt-12 overflow-hidden border-[0.8px] border-w20 px-10 py-4 transition-all duration-500 disabled:cursor-default disabled:opacity-30 enabled:hover:border-white"
          >
            <span className="absolute inset-0 translate-y-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-enabled:group-hover:translate-y-0" />
            <span className="t-label relative text-[10px] tracking-[0.32em] text-white transition-colors duration-300 group-enabled:group-hover:text-black">
              {ready ? "Enter" : "Loading"}
            </span>
          </button>
        </div>

        {/* ---- Bottom: the one setting worth exposing ---- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="t-label mb-2.5">Rendering quality</div>
            <div className="flex gap-2">
              {TIERS.map((t) => {
                const on = t.id === tier;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTier(t.id)}
                    aria-pressed={on}
                    data-cursor={t.label}
                    className={
                      "border-[0.8px] px-3.5 py-2 transition-colors duration-300 " +
                      (on ? "border-white bg-white" : "border-w12 hover:border-w30")
                    }
                  >
                    <span
                      className={"t-label " + (on ? "text-black" : "")}
                      style={on ? { color: "#000" } : undefined}
                    >
                      {t.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="t-label mt-2.5 text-w20">
              {TIERS.find((t) => t.id === tier)?.note}
            </div>
          </div>

          <div className="t-label max-w-[34ch] text-right leading-relaxed sm:text-right">
            Detected automatically. Change it if the guess is wrong — it
            applies before anything renders.
          </div>
        </div>
      </div>
    </div>
  );
}
