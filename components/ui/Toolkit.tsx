"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useQuery } from "convex/react";
import * as LucideIcons from "lucide-react";
import * as Si from "react-icons/si";
import * as Fa from "react-icons/fa";
import { api } from "@/convex/_generated/api";
import { quality } from "@/lib/motion-state";
import { RiseGroup } from "@/components/motion/Reveal";

type LucideIconName = keyof typeof LucideIcons;

function DynamicIcon({ name, size = 22 }: { name?: string; size?: number }) {
  if (!name) return null;
  if (name.startsWith("devicon-")) return <i className={name} style={{ fontSize: size }} />;
  const L = LucideIcons[name as LucideIconName] as LucideIcons.LucideIcon | undefined;
  if (L) return <L size={size} strokeWidth={1.25} />;
  const S = (Si as Record<string, React.ComponentType<{ size?: number }>>)[name];
  if (S) return <S size={size} />;
  const F = (Fa as Record<string, React.ComponentType<{ size?: number }>>)[name];
  if (F) return <F size={size} />;
  return null;
}

/** Live from Convex, so the lists are edited in the dashboard, not in code. */
export default function Toolkit() {
  const skills = useQuery(api.skills.getSkills);
  const subSkills = useQuery(api.subSkills.getSubSkills);
  const drift = useRef<HTMLDivElement>(null);

  // Counter-drifting rows bound to scroll position rather than a timer, so
  // the motion belongs to the reader. An autoplaying marquee here would
  // just be noise competing with the world behind it.
  useEffect(() => {
    const el = drift.current;
    if (!el || quality.reducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const common = {
        ease: "none" as const,
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 },
      };
      gsap.fromTo("[data-drift='a']", { xPercent: -4 }, { xPercent: 3, ...common });
      gsap.fromTo("[data-drift='b']", { xPercent: 4 }, { xPercent: -3, ...common });
    }, el);

    return () => ctx.revert();
  }, [subSkills]);

  const entries = subSkills ?? [];
  const split = entries.length >= 6;
  const half = split ? Math.ceil(entries.length / 2) : entries.length;
  const rows = split ? [entries.slice(0, half), entries.slice(half)] : [entries];

  return (
    <section className="shell py-[8vh]">
      <h2 className="t-label mb-8">Daily tools</h2>
      <div className="rule mb-6" />

      <RiseGroup className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" stagger={0.05}>
        {skills
          ? skills.map((s) => (
              <div
                key={s._id}
                data-rise
                className="panel group flex h-[124px] flex-col items-center justify-center gap-3.5 transition-transform duration-500 hover:-translate-y-0.5"
              >
                <span className="text-w40 transition-colors duration-500 group-hover:text-white">
                  <DynamicIcon name={s.icon} size={24} />
                </span>
                <span className="t-label transition-colors duration-500 group-hover:text-white">
                  {s.title}
                </span>
              </div>
            ))
          : Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="panel h-[124px] animate-pulse opacity-40" />
            ))}
      </RiseGroup>

      <div className="mt-14" ref={drift}>
        <h2 className="t-label mb-8">Also comfortable with</h2>
        <div className="rule mb-6" />

        <div className="space-y-2.5 overflow-hidden">
          {rows.map((row, ri) => (
            <div
              key={ri}
              data-drift={ri === 0 ? "a" : "b"}
              className="flex flex-wrap gap-2.5 will-change-transform"
            >
              {row.map((s) => (
                <span
                  key={s._id}
                  className="group inline-flex items-center gap-2.5 border border-w08 px-4 py-2.5 transition-colors duration-500 hover:border-w20"
                >
                  <span className="text-w40 transition-colors duration-500 group-hover:text-white">
                    <DynamicIcon name={s.icon} size={14} />
                  </span>
                  <span className="t-mono text-[10.5px] text-w60 transition-colors duration-500 group-hover:text-white">
                    {s.title}
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
