"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The tools list, live from Convex.
 *
 * Set as plain text rather than a grid of icon tiles. Icons at this size
 * carry no information a reader needs — the names do all the work, and
 * they stay readable.
 */
export default function Toolkit() {
  const skills = useQuery(api.skills.getSkills);
  const subSkills = useQuery(api.subSkills.getSubSkills);

  const daily = skills?.map((s) => s.title) ?? null;
  const also = subSkills?.map((s) => s.title) ?? null;

  return (
    <section className="rule-t bg-wash">
      <div className="shell py-20 md:py-24">
        <Reveal>
          <h2 className="t-h2">Tools</h2>
        </Reveal>

        <div className="mt-12 grid gap-12 md:grid-cols-2 md:gap-16">
          <Reveal>
            <h3 className="t-label">Daily</h3>
            {daily ? (
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                {daily.map((t) => (
                  <li key={t} className="text-[1.05rem] text-ink">
                    {t}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-[1rem] text-ink-3">Loading…</p>
            )}
          </Reveal>

          <Reveal delay={60}>
            <h3 className="t-label">Also comfortable with</h3>
            {also ? (
              <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                {also.map((t) => (
                  <li key={t} className="text-[1.05rem] text-ink-2">
                    {t}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-[1rem] text-ink-3">Loading…</p>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
