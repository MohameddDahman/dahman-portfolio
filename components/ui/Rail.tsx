"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { damp } from "@/lib/motion-state";
import { WORLDS } from "@/lib/worlds";
import { PROJECTS } from "@/data/projects";

/**
 * The rail.
 *
 * Rows sit on one shared 3D stage and are pushed along it by a single
 * offset. Distance from the centre line drives translateZ, rotateX, scale
 * and opacity *together*, so a row does not merely travel up the screen —
 * it recedes down a corridor and turns away as it goes. That coupling is
 * the whole difference between reading as depth and reading as a list
 * sliding behind a mask.
 *
 * The offset wraps modulo the track length, so the corridor is endless in
 * both directions; page scroll drives one full pass while the section is
 * pinned, then releases.
 *
 * None of it touches React. The offset is damped and written straight to
 * `style.transform` from the GSAP ticker — transform and opacity only,
 * which keeps the entire effect on the compositor.
 */

const ROW_H = 250;
const DEPTH = 640;
const TILT = 32;
const REACH = 1.15;

export default function Rail() {
  const section = useRef<HTMLElement>(null);
  const rows = useRef<HTMLDivElement[]>([]);
  const marker = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [railing, setRailing] = useState(false);

  const total = PROJECTS.length * ROW_H;

  useEffect(() => {
    const sec = section.current;
    if (!sec) return;

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1000px) and (prefers-reduced-motion: no-preference)", () => {
      setRailing(true);
      const target = { v: 0 };
      const current = { v: 0 };
      let lastIndex = -1;

      // Roughly 300px of scroll per row: long enough to read a title,
      // short enough that the pin never feels like a trap.
      const distance = () => total * 1.2;

      const trigger = ScrollTrigger.create({
        trigger: sec,
        start: "top top",
        end: () => "+=" + distance(),
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          target.v = self.progress * total;
        },
      });

      const paint = () => {
        const half = window.innerHeight / 2;
        current.v = damp(current.v, target.v, 7, gsap.ticker.deltaRatio(60) / 60);

        for (let i = 0; i < rows.current.length; i++) {
          const el = rows.current[i];
          if (!el) continue;

          // Wrap into [-total/2, total/2) around the centre line.
          let y = i * ROW_H - current.v;
          y = (((y % total) + total * 1.5) % total) - total / 2;

          const d = y / (half * REACH);
          const ad = Math.min(1.6, Math.abs(d));

          el.style.transform =
            "translate3d(0," + y.toFixed(2) + "px," + (-ad * DEPTH).toFixed(1) + "px)" +
            " rotateX(" + (-d * TILT).toFixed(2) + "deg)" +
            " scale(" + (1 - ad * 0.15).toFixed(4) + ")";

          const op = Math.max(0, 1 - Math.pow(ad, 1.7) * 1.05);
          el.style.opacity = op.toFixed(3);
          // Rows past the horizon must not swallow clicks.
          el.style.pointerEvents = op > 0.55 ? "auto" : "none";
          el.style.zIndex = String(1000 - Math.round(ad * 500));
        }

        const idx =
          ((Math.round(current.v / ROW_H) % PROJECTS.length) + PROJECTS.length) %
          PROJECTS.length;
        if (idx !== lastIndex) {
          lastIndex = idx;
          setActive(idx);
          if (readout.current) readout.current.textContent = String(idx + 1).padStart(2, "0");
        }
        if (marker.current) {
          marker.current.style.transform =
            "translateY(" + (((current.v % total) / total) * 100).toFixed(2) + "%)";
        }
      };

      gsap.ticker.add(paint);
      paint();

      return () => {
        gsap.ticker.remove(paint);
        trigger.kill();
        setRailing(false);
        // The paint loop writes inline styles directly, so matchMedia's
        // revert cannot undo them. Clearing by hand is what makes a
        // desktop-to-mobile resize fall back to a readable list instead of
        // a pile of absolutely positioned rows.
        for (const el of rows.current) {
          if (!el) continue;
          el.style.transform = "";
          el.style.opacity = "";
          el.style.pointerEvents = "";
          el.style.zIndex = "";
        }
      };
    });

    return () => mm.revert();
  }, [total]);

  const setRow = (i: number) => (el: HTMLDivElement | null) => {
    if (el) rows.current[i] = el;
  };

  return (
    <section
      ref={section}
      className="relative pb-[12vh] lg:h-[100svh] lg:overflow-hidden lg:pb-0"
    >
      {/* One markup, two layouts: a plain list below 1000px, the corridor
          above it. CSS does the switch — see .rail-stage. Rendering two
          lists would duplicate every row in the accessibility tree. */}
      <div className="rail-stage rail-mask">
        {PROJECTS.map((p, i) => (
          <div key={p.slug} ref={setRow(i)} className="rail-row">
            <div className="shell">
              <Row project={p} index={i} lit={railing && active === i} />
            </div>
          </div>
        ))}
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute right-[clamp(1rem,3vw,2.5rem)] top-1/2 z-20 hidden -translate-y-1/2 lg:block"
      >
        <div className="t-label mb-3">Pos</div>
        <div className="relative h-[190px] w-px bg-w08">
          {PROJECTS.map((p, i) => (
            <span
              key={p.slug}
              className="absolute -left-1 h-px w-[9px] bg-w08"
              style={{ top: (i / PROJECTS.length) * 100 + "%" }}
            />
          ))}
          <div ref={marker} className="absolute inset-x-0 top-0 will-change-transform">
            <span
              className="absolute -left-2 -top-px h-[2px] w-[17px]"
              style={{ background: "var(--accent)", boxShadow: "0 0 10px var(--accent)" }}
            />
          </div>
        </div>
        <div className="t-mono mt-3 text-[11px] text-white">
          <span ref={readout}>01</span>
          <span className="text-w40">/{String(PROJECTS.length).padStart(2, "0")}</span>
        </div>
      </div>
    </section>
  );
}

/**
 * A rail row.
 *
 * The card is an <article>, not a link. The title carries the link to the
 * case study and stretches an ::after over the whole card, which is what
 * lets a second, separate link to the live site live inside the same card
 * — nesting one <a> inside another is invalid, and browsers resolve it by
 * dropping one of them.
 */
function Row({
  project,
  index,
  lit,
}: {
  project: (typeof PROJECTS)[number];
  index: number;
  lit: boolean;
}) {
  const world = WORLDS[project.world];

  return (
    <article
      className="panel panel-live group relative overflow-hidden px-6 py-6 md:px-9 md:py-8"
      onPointerMove={(e) => {
        const el = e.currentTarget;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", e.clientX - r.left + "px");
        el.style.setProperty("--my", e.clientY - r.top + "px");
        el.style.setProperty("--lit", "1");
      }}
      onPointerLeave={(e) => e.currentTarget.style.setProperty("--lit", "0")}
    >
      <span className="rim" />
      <span className="sheen" />

        {/* Covers the whole card, padding included. The visible title is
            plain text; this carries the link and its accessible name. */}
        <Link
          href={"/work/" + project.slug}
          data-cursor="Read"
          className="absolute inset-0 z-10"
        >
          <span className="sr-only">{project.title} — read the case study</span>
        </Link>

      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:gap-9">
        <span
          className="t-mono text-[11px] transition-colors duration-500"
          style={{ color: lit ? "var(--accent)" : undefined }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="min-w-0 flex-1">
          <h2
            className={
              "t-display text-[clamp(1.25rem,2.3vw,1.85rem)] transition-colors duration-500 " +
              (lit ? "text-white" : "text-w60")
            }
          >
            {project.title}
          </h2>
          <p className="t-body mt-2 max-w-[48ch] text-[13.5px]">{project.summary}</p>
        </div>

        <div className="relative z-20 flex shrink-0 flex-wrap items-center gap-2">
          {project.draft && (
            <span className="border border-w20 px-2.5 py-1">
              <span className="t-label text-[8px]">Placeholder</span>
            </span>
          )}
          <span
            className="t-label border px-2.5 py-1 text-[8px]"
            style={{ borderColor: world.accent + "55", color: world.accent }}
          >
            {world.name}
          </span>
          <span className="t-label ml-1 hidden xl:inline">{project.year}</span>

          {/* Straight to the real thing, without reading the write-up
              first. Sits above the stretched link so it wins the click. */}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer noopener"
              data-cursor="Live site"
              className="group/live ml-1 inline-flex items-center gap-1.5 border border-w20 px-3 py-1.5 transition-colors duration-400 hover:border-white hover:bg-white"
            >
              <span className="t-label text-[8px] transition-colors duration-300 group-hover/live:text-black">
                Visit site
              </span>
              <span className="text-[10px] leading-none text-w60 transition-colors duration-300 group-hover/live:text-black">
                ↗
              </span>
            </a>
          )}

          <span className="ml-2 text-w40 transition-all duration-500 group-hover:translate-x-1 group-hover:text-white">
            →
          </span>
        </div>
      </div>

      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
        style={{ background: "var(--accent)" }}
      />
    </article>
  );
}
