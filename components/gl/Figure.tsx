"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const DomTree = dynamic(() => import("./DomTree"), { ssr: false });

/**
 * The frame the 3D is allowed to live in.
 *
 * Numbered, captioned, and bounded — a plate in a document rather than a
 * background. It also owns the decision about whether the scene runs at
 * all: the canvas only mounts once the figure is near the viewport, and
 * only animates while it is actually on screen.
 */
export default function Figure({
  number,
  caption,
  className = "",
}: {
  number: string;
  caption: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        // Mount a little before arrival so it is never caught blank, then
        // let `active` gate the frame loop from then on.
        if (entry.isIntersecting) setMounted(true);
        setActive(entry.isIntersecting);
      },
      { rootMargin: "200px 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <figure ref={ref} className={className}>
      <div className="figure-frame aspect-[16/10] w-full sm:aspect-[2/1]">
        {mounted && <DomTree active={active} />}
      </div>

      <figcaption className="mt-4 flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-4">
        <span className="t-label shrink-0">Fig. {number}</span>
        <span className="measure-wide text-[0.95rem] leading-relaxed text-ink-2">
          {caption}
        </span>
      </figcaption>
    </figure>
  );
}
