"use client";

import type { ReactNode, PointerEvent as ReactPointerEvent } from "react";

/**
 * A glass panel whose rim lights where the cursor is, tinted by whichever
 * world you are standing in.
 *
 * Two CSS custom properties written from one pointer handler; the
 * compositor draws the gradient. A page full of these costs nothing per
 * frame, which is why they can be used freely over a live 3D scene.
 */
export default function Panel({
  children,
  className = "",
  as: Tag = "div",
  cursor,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li" | "section";
  cursor?: string;
}) {
  const track = (e: ReactPointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", e.clientX - r.left + "px");
    el.style.setProperty("--my", e.clientY - r.top + "px");
    el.style.setProperty("--lit", "1");
  };

  return (
    <Tag
      data-cursor={cursor}
      className={"panel panel-live group relative " + className}
      onPointerMove={track}
      onPointerLeave={(e: ReactPointerEvent<HTMLElement>) =>
        e.currentTarget.style.setProperty("--lit", "0")
      }
    >
      <span className="rim" />
      <span className="sheen" />
      {children}
    </Tag>
  );
}
