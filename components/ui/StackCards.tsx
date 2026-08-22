"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { quality } from "@/lib/motion-state";

export type StackItem = {
  n: string;
  title: string;
  body: string;
  aside?: string;
};

/**
 * Sticky stack.
 *
 * Each card pins at the top and the next one slides over it, so the deck
 * compresses as you read. The cards underneath scale down and dim rather
 * than simply disappearing, which keeps the sense that they are still
 * there — a stack, not a slideshow.
 *
 * `position: sticky` does the pinning, so the browser handles it on the
 * compositor. GSAP only drives the scale and dim, and only on the card
 * being covered — the alternative, pinning four sections with
 * ScrollTrigger, creates four spacers and four sets of measurements for
 * something CSS already does well.
 */
export default function StackCards({ items }: { items: StackItem[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || quality.reducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]");

      cards.forEach((card, i) => {
        // The last card has nothing stacking on top of it, so it never
        // recedes.
        if (i === cards.length - 1) return;

        gsap.to(card, {
          scale: 0.92,
          opacity: 0.35,
          filter: "blur(2px)",
          ease: "none",
          scrollTrigger: {
            trigger: cards[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: 0.5,
          },
        });
      });
    }, el);

    return () => ctx.revert();
  }, [items.length]);

  return (
    <div ref={root} className="relative">
      {items.map((item, i) => (
        <div
          key={item.n}
          data-card
          className="sticky mb-6 will-change-transform"
          // Each card stops a little lower than the one before, so the
          // stack fans instead of hiding perfectly behind itself.
          style={{ top: `calc(16vh + ${i * 14}px)` }}
        >
          <article className="panel overflow-hidden p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-[auto_1fr] md:gap-14">
              <span
                className="t-display text-[clamp(1.8rem,3.4vw,2.6rem)] leading-none"
                style={{ color: "var(--accent)" }}
              >
                {item.n}
              </span>

              <div>
                <h3 className="t-display text-[clamp(1.2rem,2.2vw,1.75rem)] text-white">
                  {item.title}
                </h3>
                <p className="t-body mt-4 max-w-[58ch] text-[14.5px]">{item.body}</p>
                {item.aside && (
                  <p className="t-mono mt-6 max-w-[52ch] border-l pl-4 text-[11px] leading-relaxed text-w40"
                     style={{ borderColor: "color-mix(in oklab, var(--accent) 40%, transparent)" }}>
                    {item.aside}
                  </p>
                )}
              </div>
            </div>
          </article>
        </div>
      ))}
    </div>
  );
}
