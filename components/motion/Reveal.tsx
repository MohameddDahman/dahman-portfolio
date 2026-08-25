"use client";

import {
  useEffect,
  useRef,
  type ComponentType,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";

/**
 * The only animation on the site.
 *
 * A 10px rise and a fade, once, on entry. No library, no scroll
 * listener, no per-frame work — an IntersectionObserver flips one class
 * and disconnects. The previous build ran split-text line masks, velocity
 * skew, parallax and a pinned scroll hijack, which is what made the copy
 * unreadable; the brief here is explicitly "some, but not much".
 *
 * Reduced motion is handled in CSS, so the element is simply visible from
 * the start rather than depending on this component running at all.
 */
export function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  as?: "div" | "section" | "article" | "li" | "p" | "span";
  className?: string;
  /** Milliseconds. Used sparingly, to stagger a short list. */
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No observer needed if the visitor has asked for less motion — the
    // stylesheet already renders the final state.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("reveal-in");
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.style.transitionDelay = delay + "ms";
        el.classList.add("reveal-in");
        io.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  // A polymorphic intrinsic tag does not narrow its children or ref types
  // in JSX position, so it is cast to a component that accepts both.
  // React 19 treats ref as an ordinary prop, which makes this safe.
  const El = Tag as unknown as ComponentType<
    HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }
  >;

  return (
    <El ref={ref} className={"reveal " + className}>
      {children}
    </El>
  );
}
