"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { quality } from "@/lib/motion-state";
import { ScrambleCycle } from "@/components/motion/Scramble";
import Magnetic from "@/components/motion/Magnetic";

const NAME = "DAHMAN";

const ROLES = [
  "frontend engineer",
  "interface systems",
  "motion + webgl",
  "performance work",
];

/**
 * The landing.
 *
 * A full-viewport opening whose only job is to establish that this is a
 * place, not a document. The tree is live behind it and takes the
 * cursor, so the first interaction happens before a single word is read.
 *
 * The entrance is one orchestrated sequence rather than a set of separate
 * fades: letters climb out of their masks, the rules draw, the meta row
 * surfaces underneath. Everything shares an expo curve so it reads as one
 * movement.
 *
 * On the way out the whole hero recedes — lifts, scales down slightly and
 * blurs — so leaving the landing feels like stepping back from it rather
 * than scrolling past a banner.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const word = useRef<HTMLHeadingElement>(null);
  const [clock, setClock] = useState("--:--:--");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const paint = () => setClock(fmt.format(new Date()));
    paint();
    const id = window.setInterval(paint, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.from("[data-glyph]", {
        yPercent: 118,
        duration: 1.35,
        stagger: 0.055,
      })
        .from("[data-hero-eyebrow]", { opacity: 0, x: -14, duration: 0.9 }, 0.15)
        .from("[data-hero-rule]", { scaleX: 0, duration: 1.4, ease: "expo.inOut" }, 0.35)
        .from("[data-hero-up]", { opacity: 0, y: 26, duration: 1, stagger: 0.08 }, 0.55)
        .from("[data-hero-cue]", { opacity: 0, duration: 0.8 }, 0.9);

      if (quality.reducedMotion) tl.progress(1);

      // Variable-width reaction: the wordmark narrows as you leave the
      // landing. Quantised to whole units — an unquantised value reshapes a
      // 12rem word on every frame, which is exactly the kind of effect that
      // makes a page feel heavy.
      if (!quality.reducedMotion && word.current) {
        const w = word.current;
        let last = 100;
        ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: "bottom top",
          onUpdate: (self) => {
            const v = Math.round(100 - self.progress * 20);
            if (v !== last) {
              last = v;
              w.style.fontVariationSettings = `"wdth" ${v}`;
            }
          },
        });

        gsap.to("[data-hero-layer]", {
          yPercent: -12,
          scale: 0.965,
          opacity: 0,
          filter: "blur(7px)",
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.7 },
        });
      }
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pb-28 pt-[18vh] md:pb-24"
    >
      <div data-hero-layer className="shell will-change-transform">
        {/* ---- Eyebrow ---- */}
        <div data-hero-eyebrow className="flex flex-wrap items-center gap-3">
          <span
            className="h-1.5 w-1.5"
            style={{ background: "var(--accent)", boxShadow: "0 0 14px var(--accent)" }}
          />
          <span className="t-label" style={{ color: "var(--accent)" }}>
            World 01 · Tree
          </span>
          <span className="hidden h-3 w-px bg-w08 sm:block" />
          <span className="t-label hidden sm:inline">
            A DOM tree, and a render pass walking it
          </span>
        </div>

        {/* ---- Wordmark ---- */}
        <h1
          ref={word}
          className="t-display mt-8 text-[clamp(2.6rem,7.4vw,6rem)]"
          style={{ fontVariationSettings: '"wdth" 100' }}
        >
          <span className="sr-only">Mohamed Dahman — frontend engineer</span>
          <span aria-hidden className="flex overflow-hidden pb-[0.06em]">
            {NAME.split("").map((c, i) => (
              <span key={i} data-glyph className="inline-block will-change-transform">
                {c}
              </span>
            ))}
          </span>
        </h1>

        <div
          data-hero-rule
          className="mt-5 h-px w-full origin-left"
          style={{
            background:
              "linear-gradient(90deg, var(--accent), color-mix(in oklab, var(--accent) 20%, transparent) 55%, transparent)",
          }}
        />

        {/* ---- Role + statement ---- */}
        <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[42rem]">
            <p data-hero-up className="t-mono text-[13px] tracking-[0.06em] text-w60">
              <span className="text-w40">$ </span>
              <ScrambleCycle phrases={ROLES} />
              <span
                className="ml-0.5 inline-block h-[1em] w-[7px] translate-y-[2px] animate-pulse"
                style={{ background: "var(--accent)" }}
              />
            </p>

            <p
              data-hero-up
              className="t-body mt-6 max-w-[46ch] text-[clamp(0.98rem,1.35vw,1.15rem)]"
            >
              I build the half of the interface that never shows up in a
              mockup — the states, the edge cases, and the frame budget that
              decides whether any of the rest of it actually feels good.
            </p>

            <div data-hero-up className="mt-9 flex flex-wrap items-center gap-7">
              <Magnetic strength={0.22}>
                <Link href="/work" data-cursor="Work" className="btn">
                  <span className="fill" />
                  <span className="lbl t-label text-white">See the work</span>
                  <span className="lbl">→</span>
                </Link>
              </Magnetic>

              <Link
                href="/lab"
                data-cursor="Lab"
                className="t-label group inline-flex items-center gap-2 transition-colors duration-400 hover:text-white"
              >
                Seven worlds in the lab
                <span
                  className="block h-px w-5 transition-all duration-500 group-hover:w-9"
                  style={{ background: "var(--accent)" }}
                />
              </Link>
            </div>
          </div>

          {/* ---- Live plate ---- */}
          <dl data-hero-up className="grid w-full max-w-xs shrink-0 gap-y-2 lg:w-auto">
            {[
              ["Status", "Open to work"],
              ["Based", "Remote"],
              ["Local time", clock],
              ["Stack", "Next.js · TypeScript"],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex items-baseline justify-between gap-10 border-b border-w08 pb-2"
              >
                <dt className="t-label">{k}</dt>
                <dd className="t-mono text-[11px] text-w60">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* ---- Scroll cue ---- */}
      <div
        data-hero-cue
        className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
      >
        <span className="t-label">Scroll</span>
        <span className="relative block h-12 w-px overflow-hidden bg-w08">
          <span
            className="absolute inset-x-0 h-4 animate-[cue_2.2s_ease-in-out_infinite]"
            style={{ background: "var(--accent)" }}
          />
        </span>
      </div>

      <style>{`
        @keyframes cue {
          0%   { transform: translateY(-100%); }
          60%  { transform: translateY(300%); }
          100% { transform: translateY(300%); }
        }
      `}</style>
    </section>
  );
}
