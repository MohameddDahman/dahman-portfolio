"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { quality } from "@/lib/motion-state";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>[]{}=+*#%$@";

/**
 * Decode effect.
 *
 * Text resolves out of noise, one character at a time, left to right. Each
 * character holds a random glyph until its own reveal moment passes, so
 * the string is legible from the first frame at the left edge and still
 * churning at the right — which reads as decoding rather than as a
 * shuffle.
 *
 * The whole thing runs off one GSAP tween writing to `textContent`. No
 * per-character DOM nodes, no React state, no layout thrash beyond a
 * single text node update per frame.
 */
export function useScramble(
  ref: React.RefObject<HTMLElement | null>,
  text: string,
  opts: { duration?: number; delay?: number; auto?: boolean } = {},
) {
  const { duration = 1.1, delay = 0, auto = true } = opts;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (quality.reducedMotion) {
      el.textContent = text;
      return;
    }

    const chars = text.split("");
    // Each character gets its own reveal point, ordered left to right with
    // a little jitter so the edge is ragged rather than a hard wipe.
    const reveal = chars.map(
      (_, i) => (i / chars.length) * 0.75 + Math.random() * 0.2,
    );

    const state = { p: 0 };
    const tween = gsap.to(state, {
      p: 1,
      duration,
      delay,
      ease: "power2.out",
      onUpdate() {
        let out = "";
        for (let i = 0; i < chars.length; i++) {
          const c = chars[i];
          if (c === " ") {
            out += " ";
          } else if (state.p >= reveal[i]) {
            out += c;
          } else {
            out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }
        }
        el.textContent = out;
      },
      onComplete() {
        el.textContent = text;
      },
      paused: !auto,
    });

    return () => {
      tween.kill();
    };
  }, [ref, text, duration, delay, auto]);
}

/** Scrambles on mount. */
export function Scramble({
  text,
  className,
  duration,
  delay,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  duration?: number;
  delay?: number;
  as?: "span" | "div" | "p";
}) {
  const ref = useRef<HTMLElement>(null);
  useScramble(ref, text, { duration, delay });

  return (
    <Tag
      // @ts-expect-error -- one of three intrinsic tags; ref widens fine
      ref={ref}
      className={className}
    >
      {text}
    </Tag>
  );
}

/**
 * Cycles through a list of phrases, decoding each one in turn. Used for
 * the hero's role line, where a static label would waste the moment.
 */
export function ScrambleCycle({
  phrases,
  className,
  hold = 2.6,
}: {
  phrases: string[];
  className?: string;
  hold?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || phrases.length === 0) return;

    if (quality.reducedMotion) {
      el.textContent = phrases[0];
      return;
    }

    let index = 0;
    let killed = false;
    let tween: gsap.core.Tween | null = null;
    let timer: number | undefined;

    const run = () => {
      if (killed) return;
      const text = phrases[index % phrases.length];
      const chars = text.split("");
      const reveal = chars.map(
        (_, i) => (i / chars.length) * 0.7 + Math.random() * 0.25,
      );
      const state = { p: 0 };

      tween = gsap.to(state, {
        p: 1,
        duration: 0.85,
        ease: "power2.out",
        onUpdate() {
          let out = "";
          for (let i = 0; i < chars.length; i++) {
            const c = chars[i];
            if (c === " ") out += " ";
            else if (state.p >= reveal[i]) out += c;
            else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
          }
          el.textContent = out;
        },
        onComplete() {
          el.textContent = text;
          index++;
          timer = window.setTimeout(run, hold * 1000);
        },
      });
    };

    run();

    return () => {
      killed = true;
      tween?.kill();
      if (timer) window.clearTimeout(timer);
    };
  }, [phrases, hold]);

  return <span ref={ref} className={className} />;
}
