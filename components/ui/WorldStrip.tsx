"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WORLD_LIST } from "@/lib/worlds";

/**
 * A pinned horizontal run through the seven worlds.
 *
 * Vertical scroll converts to lateral travel while the section is pinned —
 * the one place on the site where the reading direction changes, which is
 * why it is used exactly once. Cards also counter-move at their own rate,
 * so the row has depth instead of sliding as a single rigid strip.
 *
 * `invalidateOnRefresh` recomputes the distance on resize; without it the
 * track under-scrolls after a rotate and the last card is unreachable.
 * Below 1000px, and under reduced motion, it degrades to a normal grid.
 */
export default function WorldStrip() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = section.current;
    const t = track.current;
    if (!s || !t) return;

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1000px) and (prefers-reduced-motion: no-preference)", () => {
      const distance = () => Math.max(0, t.scrollWidth - window.innerWidth + 120);

      const tween = gsap.to(t, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: s,
          start: "top top",
          end: () => "+=" + distance(),
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (bar.current) {
              bar.current.style.transform = "scaleX(" + self.progress.toFixed(4) + ")";
            }
          },
        },
      });

      // Depth: each card drifts a little against the track.
      const cards = gsap.utils.toArray<HTMLElement>("[data-wcard]");
      const inner = cards.map((c, i) =>
        gsap.fromTo(
          c,
          { yPercent: i % 2 === 0 ? 4 : -4 },
          {
            yPercent: i % 2 === 0 ? -4 : 4,
            ease: "none",
            scrollTrigger: {
              trigger: s,
              start: "top top",
              end: () => "+=" + distance(),
              scrub: 1.2,
            },
          },
        ),
      );

      return () => {
        tween.kill();
        inner.forEach((tw) => tw.kill());
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={section} className="relative overflow-hidden py-[10vh] lg:py-0">
      <div className="flex min-h-0 flex-col justify-center lg:min-h-[100svh]">
        <div className="shell">
          <div className="mb-8 flex items-end justify-between gap-6">
            <h2 className="t-label">Seven worlds</h2>
            <Link
              href="/lab"
              data-cursor="Lab"
              className="t-label transition-colors duration-400 hover:text-white"
            >
              Open the lab →
            </Link>
          </div>
          <div className="rule mb-8" />
          <p className="t-body mb-10 max-w-[60ch] text-[15px]">
            Every page here stands somewhere different. These are not
            background images — each is a live scene, and each is built to the
            same budget: a couple of draw calls, no post-processing, and
            nothing fetched over the network.
          </p>
        </div>

        <div className="lg:mt-4">
          <div
            ref={track}
            className="grid grid-cols-2 gap-4 px-[clamp(1.25rem,4.5vw,5rem)] will-change-transform sm:grid-cols-3 lg:flex lg:w-max lg:gap-6"
          >
            {WORLD_LIST.map((w) => (
              <article
                key={w.id}
                data-wcard
                className="panel group relative overflow-hidden p-6 lg:h-[46vh] lg:min-h-[340px] lg:w-[clamp(17rem,22vw,21rem)] lg:p-8"
              >
                <span
                  className="absolute inset-x-0 top-0 h-px"
                  style={{ background: w.accent }}
                />
                {/* A wash of the world's own colour, so the card carries the
                    place rather than just naming it. */}
                <span
                  className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-700 group-hover:opacity-90"
                  style={{
                    background: `radial-gradient(120% 80% at 20% 0%, ${w.accent}22, transparent 62%)`,
                  }}
                />

                <div className="relative flex h-full flex-col">
                  <span className="t-mono text-[10px]" style={{ color: w.accent }}>
                    {w.index}
                  </span>

                  <h3 className="t-display mt-4 text-[clamp(1.2rem,2vw,1.6rem)] text-white">
                    {w.name}
                  </h3>
                  <p className="t-body mt-3 text-[13.5px]">{w.tagline}</p>

                  <div className="mt-auto pt-8">
                    <div className="rule mb-4" />
                    <p className="t-label leading-relaxed">{w.interaction}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="shell mt-10 hidden lg:block">
          <div className="h-px w-full overflow-hidden bg-w08">
            <div
              ref={bar}
              className="h-full w-full origin-left scale-x-0"
              style={{ background: "var(--accent)" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
