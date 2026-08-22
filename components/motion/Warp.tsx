"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { quality } from "@/lib/motion-state";
import { WORLDS, worldForPath, type WorldId } from "@/lib/worlds";
import { useWorldStore } from "@/lib/store";
import { PROJECTS } from "@/data/projects";

const PANELS = 6;

/**
 * The warp.
 *
 * Travelling between worlds should feel like travelling, so navigation is
 * intercepted and staged: six columns sweep up in sequence, the
 * destination's name lands on top of them, the route and the 3D world swap
 * behind the curtain, then the columns clear downward.
 *
 * Doing it by hand rather than with the browser's own transition is a
 * deliberate trade. It costs an interception layer, but it buys a curtain
 * that knows *where you are going* — the panels are painted in the
 * destination's accent and carry its name, which a crossfade cannot do.
 *
 * The swap happens at the covered midpoint, so the world change and the
 * scroll reset are never visible.
 */
export default function Warp() {
  const router = useRouter();
  const pathname = usePathname();

  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const nameEl = useRef<HTMLSpanElement>(null);
  const indexEl = useRef<HTMLSpanElement>(null);
  const taglineEl = useRef<HTMLSpanElement>(null);

  const setWorld = useWorldStore((s) => s.setWorld);
  const beginWarp = useWorldStore((s) => s.beginWarp);
  const endWarp = useWorldStore((s) => s.endWarp);

  // Guards against a second click landing mid-flight.
  const busy = useRef(false);
  const pending = useRef<string | null>(null);

  /** Paints the accent custom properties the whole UI reads from. */
  const paintAccent = (id: WorldId) => {
    const w = WORLDS[id];
    const r = document.documentElement;
    r.style.setProperty("--accent", w.accent);
    r.style.setProperty("--accent-deep", w.accentDeep);
  };

  const worldFor = (path: string): WorldId => {
    const slug = path.startsWith("/work/") ? path.slice(6) : null;
    const project = slug ? PROJECTS.find((p) => p.slug === slug) : undefined;
    return worldForPath(path, project?.world);
  };

  // Paint the entry world before first paint of the chrome.
  useEffect(() => {
    const id = worldFor(window.location.pathname);
    setWorld(id);
    paintAccent(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const panels = el.querySelectorAll<HTMLElement>("[data-panel]");

    const go = (href: string) => {
      if (busy.current) return;
      const dest = worldFor(href);
      const w = WORLDS[dest];

      if (quality.reducedMotion) {
        setWorld(dest);
        paintAccent(dest);
        router.push(href);
        return;
      }

      busy.current = true;
      pending.current = href;
      beginWarp(dest);

      // The curtain is painted in the destination's colour, so the change
      // of place is legible before the new page has rendered a pixel.
      gsap.set(panels, { backgroundColor: w.accent });

      if (nameEl.current) nameEl.current.textContent = w.name;
      if (indexEl.current) indexEl.current.textContent = w.index;
      if (taglineEl.current) taglineEl.current.textContent = w.tagline;

      const tl = gsap.timeline();

      tl.set(el, { pointerEvents: "auto" })
        .set(panels, { scaleY: 0, transformOrigin: "bottom" })
        .set(label.current, { opacity: 0, y: 26 })
        .to(panels, {
          scaleY: 1,
          duration: 0.52,
          ease: "power3.inOut",
          stagger: { each: 0.045, from: "start" },
        })
        .to(label.current, { opacity: 1, y: 0, duration: 0.34, ease: "power2.out" }, "-=0.18")
        .call(() => {
          // Fully covered: swap the world and commit the route.
          setWorld(dest);
          paintAccent(dest);
          router.push(href);
        })
        // Hold long enough for the destination to render behind the
        // curtain. Any shorter and you see the new page assemble.
        .to({}, { duration: 0.42 })
        .to(label.current, { opacity: 0, y: -20, duration: 0.26, ease: "power2.in" })
        .to(
          panels,
          {
            scaleY: 0,
            transformOrigin: "top",
            duration: 0.55,
            ease: "power3.inOut",
            stagger: { each: 0.04, from: "end" },
          },
          "-=0.1",
        )
        .set(el, { pointerEvents: "none" })
        .call(() => {
          busy.current = false;
          pending.current = null;
          endWarp();
        });
    };

    // Capture-phase interception. Anything that looks like an ordinary
    // in-app link gets staged; modified clicks, new tabs, downloads and
    // external hosts are left entirely alone.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = (e.target as HTMLElement)?.closest?.("a");
      if (!a) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download") || a.dataset.noWarp === "true") return;

      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/")) return;

      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return;

      // Same page: let anchors and no-ops behave normally.
      if (url.pathname === window.location.pathname) return;

      e.preventDefault();
      go(url.pathname + url.search);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Back and forward buttons bypass the interception entirely, so the
  // world still has to follow the URL.
  useEffect(() => {
    if (busy.current) return;
    const id = worldFor(pathname);
    setWorld(id);
    paintAccent(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div
      ref={root}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[200]"
      style={{ pointerEvents: "none" }}
    >
      <div className="absolute inset-0 flex">
        {Array.from({ length: PANELS }, (_, i) => (
          <div
            key={i}
            data-panel
            className="h-full flex-1 origin-bottom scale-y-0 bg-white"
          />
        ))}
      </div>

      <div
        ref={label}
        className="absolute inset-0 flex flex-col items-center justify-center opacity-0"
      >
        <span ref={indexEl} className="t-mono text-[11px] tracking-[0.3em] text-black/55">
          01
        </span>
        <span
          ref={nameEl}
          className="t-display mt-3 text-[clamp(2.5rem,9vw,7rem)] text-black"
        >
          Tree
        </span>
        <span
          ref={taglineEl}
          className="t-mono mt-3 text-[11px] tracking-[0.18em] text-black/60"
        >
          A DOM, and a render pass walking it
        </span>
      </div>
    </div>
  );
}
