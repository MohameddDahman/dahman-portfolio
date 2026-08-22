"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { scroll } from "@/lib/motion-state";
import { WORLDS } from "@/lib/worlds";
import { useWorldStore } from "@/lib/store";
import Magnetic from "@/components/motion/Magnetic";

const ROUTES = [
  { href: "/work", label: "Work", n: "01" },
  { href: "/lab", label: "Lab", n: "02" },
  { href: "/about", label: "About", n: "03" },
  { href: "/contact", label: "Contact", n: "04" },
];

/**
 * The HUD.
 *
 * Persistent chrome in all four corners, sitting outside the warp curtain
 * so it never blinks during navigation. It reads as an app's interface
 * rather than a website's header: identity top-left, routes top-right,
 * a readout of the world you are standing in bottom-left, and travel
 * bottom-right.
 *
 * Everything that moves here is written straight to the DOM from the
 * shared ticker. Nothing in the HUD re-renders on scroll.
 */
export default function Hud() {
  const pathname = usePathname();
  const world = useWorldStore((s) => s.world);
  const w = WORLDS[world];

  const bar = useRef<HTMLElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = bar.current;
    const to = el ? gsap.quickTo(el, "yPercent", { duration: 0.55, ease: "power3.out" }) : null;
    let hidden = false;

    const tick = () => {
      if (to) {
        const shouldHide = scroll.velocity > 0.5 && scroll.y > 260;
        if (shouldHide !== hidden) {
          hidden = shouldHide;
          to(shouldHide ? -130 : 0);
        }
      }
      if (progress.current) {
        progress.current.style.transform = "scaleX(" + scroll.progress.toFixed(4) + ")";
      }
      if (pct.current) {
        pct.current.textContent = String(Math.round(scroll.progress * 100)).padStart(3, "0");
      }
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* ---- Top bar ---- */}
      <header
        ref={bar}
        className="blend-diff fixed inset-x-0 top-0 z-[120] will-change-transform"
      >
        <div className="shell flex items-center justify-between py-5">
          <Link href="/" data-cursor="Home" className="group flex items-baseline gap-3">
            <span className="t-display text-[18px] leading-none tracking-tight sm:text-[20px]">
              DAHMAN
            </span>
            <span className="t-label hidden lg:inline">Frontend engineer</span>
          </Link>

          <nav aria-label="Primary" className="flex items-center">
            {ROUTES.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                data-cursor={r.label}
                aria-current={active(r.href) ? "page" : undefined}
                className="group relative flex items-baseline gap-1.5 px-2 py-2 sm:px-3.5"
              >
                <span
                  className="t-mono hidden text-[8px] transition-colors duration-400 sm:inline"
                  style={{ color: active(r.href) ? "#fff" : undefined }}
                >
                  {r.n}
                </span>
                <span
                  className={
                    "t-label whitespace-nowrap transition-colors duration-400 " +
                    (active(r.href) ? "text-white" : "group-hover:text-w60")
                  }
                >
                  {r.label}
                </span>
                <span
                  className={
                    "absolute inset-x-2 bottom-1 h-px origin-left transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:inset-x-3.5 " +
                    (active(r.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")
                  }
                  style={{ background: "#fff" }}
                />
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* ---- Bottom-left: where you are ---- */}
      <div className="blend-diff pointer-events-none fixed bottom-5 left-0 z-[120] hidden md:block">
        <div className="shell">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 bg-white" />
            <span className="t-mono text-[10px] tracking-[0.2em] text-white">{w.index}</span>
            <span className="t-label text-white">{w.name}</span>
            <span className="hidden h-3 w-px bg-w08 lg:block" />
            <span className="t-label hidden lg:inline">{w.interaction}</span>
          </div>
        </div>
      </div>

      {/* ---- Bottom-right: travel ---- */}
      <div className="blend-diff pointer-events-none fixed bottom-5 right-0 z-[120] hidden md:block">
        <div className="shell flex items-center justify-end gap-3">
          <div className="h-px w-24 overflow-hidden bg-w08">
            <div
              ref={progress}
              className="h-full w-full origin-left scale-x-0"
              style={{ background: "#fff" }}
            />
          </div>
          <span className="t-mono text-[10px] text-w40">
            <span ref={pct}>000</span>%
          </span>
        </div>
      </div>

      {/* ---- Mobile CTA ---- */}
      <div className="pointer-events-none fixed bottom-4 inset-x-0 z-[120] flex justify-center md:hidden">
        <Magnetic strength={0}>
          <Link
            href="/contact"
            className="pointer-events-auto border border-w20 bg-void/80 px-5 py-2.5 backdrop-blur"
          >
            <span className="t-label text-white">Start a project</span>
          </Link>
        </Magnetic>
      </div>
    </>
  );
}
