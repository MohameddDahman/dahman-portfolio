"use client";

import {
  useEffect,
  useRef,
  type ComponentType,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { quality, scroll } from "@/lib/motion-state";

let registered = false;
function register() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  registered = true;
}

type Tag = "div" | "p" | "h1" | "h2" | "h3" | "h4" | "span" | "li" | "blockquote";

/**
 * Line-masked reveal, split on real line boxes.
 *
 * `autoSplit` re-measures on resize, which matters: a reflowed paragraph
 * with stale line masks clips its own text permanently, and it only shows
 * up at viewport widths nobody tested.
 *
 * `immediate` runs on mount instead of on scroll — needed after a warp,
 * where the heading is already in frame and a scroll trigger would leave
 * it invisible on arrival.
 */
export function SplitReveal({
  children,
  as = "div",
  className,
  stagger = 0.075,
  delay = 0,
  immediate = false,
}: {
  children: ReactNode;
  as?: Tag;
  className?: string;
  stagger?: number;
  delay?: number;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    register();

    if (quality.reducedMotion) {
      gsap.set(el, { autoAlpha: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 112,
            duration: 1.1,
            ease: "expo.out",
            stagger,
            delay,
            scrollTrigger: immediate
              ? undefined
              : { trigger: el, start: "top 88%", once: true },
          });
        },
      });
      return () => split.revert();
    }, el);

    return () => ctx.revert();
  }, [stagger, delay, immediate]);

  // A polymorphic intrinsic tag does not narrow children or ref in JSX
  // position, so it is cast to a component accepting both. React 19 treats
  // ref as an ordinary prop, which makes this safe.
  const Element = as as unknown as ComponentType<
    HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLElement> }
  >;

  return (
    <Element ref={ref} className={className}>
      {children}
    </Element>
  );
}

/**
 * Batched rise-in for anything that is not text.
 *
 * One ScrollTrigger per group rather than one per child — a grid of
 * twenty-four tiles should not install twenty-four scroll listeners.
 */
export function RiseGroup({
  children,
  className,
  selector = "[data-rise]",
  stagger = 0.06,
  y = 24,
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  selector?: string;
  stagger?: number;
  y?: number;
  immediate?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    register();

    const targets = el.querySelectorAll(selector);
    if (!targets.length) return;

    if (quality.reducedMotion) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.95,
          ease: "expo.out",
          stagger: { each: stagger },
          scrollTrigger: immediate
            ? undefined
            : { trigger: el, start: "top 86%", once: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [selector, stagger, y, immediate]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/**
 * Scroll-velocity skew.
 *
 * Leans its contents into the direction of travel and springs back when
 * you stop. Driven from the shared ticker and written straight to the
 * element, so it never re-renders and never allocates.
 */
export function Skewed({
  children,
  className,
  amount = 3.2,
}: {
  children: ReactNode;
  className?: string;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || quality.reducedMotion) return;

    const set = gsap.quickSetter(el, "skewY", "deg");
    let current = 0;

    const tick = () => {
      const target = gsap.utils.clamp(-amount, amount, scroll.velocity * 0.55);
      current += (target - current) * 0.12;
      set(current);
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      set(0);
    };
  }, [amount]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}

/**
 * Parallax layer. Offsets its contents against page scroll by a fraction
 * of the distance travelled.
 */
export function Parallax({
  children,
  className,
  speed = 0.12,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || quality.reducedMotion) return;
    register();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -speed * 100 },
        {
          yPercent: speed * 100,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
