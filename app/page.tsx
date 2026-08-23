import Link from "next/link";
import Hero from "@/components/ui/Hero";
import Panel from "@/components/ui/Panel";
import WorldStrip from "@/components/ui/WorldStrip";
import StackCards, { type StackItem } from "@/components/ui/StackCards";
import Magnetic from "@/components/motion/Magnetic";
import { RiseGroup, SplitReveal, Skewed, Parallax } from "@/components/motion/Reveal";
import { PROJECTS } from "@/data/projects";
import { WORLDS } from "@/lib/worlds";

const PRACTICE = [
  {
    n: "01",
    title: "Interface build",
    body: "Full frontend from a design file or a rough idea — including the parts nobody mocks up: loading, empty, error, and what happens at 320px.",
    tags: ["Next.js", "React", "Tailwind"],
  },
  {
    n: "02",
    title: "Data and forms",
    body: "Typed end to end, validated on both sides, and honest with the reader about what is still in flight.",
    tags: ["Convex", "REST", "Zod"],
  },
  {
    n: "03",
    title: "Performance",
    body: "Finding out why a page feels slow and fixing the actual cause, not the symptom that happens to be easiest to reach.",
    tags: ["Web Vitals", "Profiling"],
  },
  {
    n: "04",
    title: "Motion and WebGL",
    body: "Scroll choreography and 3D built to a frame budget. Motion that survives a mid-range laptop, and stops when asked to.",
    tags: ["GSAP", "Three.js", "GLSL"],
  },
];

const PROCESS: StackItem[] = [
  {
    n: "01",
    title: "Find the thing that cannot move",
    body: "Before anything gets designed I want to know the one constraint that is fixed — the deadline, the legacy endpoint, the device you still support, the person who has to maintain it after me. Everything good on a project comes from taking that seriously in week one instead of week six.",
    aside: "Most expensive rewrites start with a constraint nobody wrote down.",
  },
  {
    n: "02",
    title: "Build the ugly version",
    body: "Real data, real states, no styling. It is the fastest way to find out which screens were fiction — the table that turns out to have four hundred rows, the name field that is sometimes empty, the flow that has a step nobody drew. Most projects change shape here, and changing shape here is cheap.",
    aside: "A prototype with real data beats a beautiful prototype with fake data, every time.",
  },
  {
    n: "03",
    title: "Set the budget before the polish",
    body: "A number for bundle size and a number for frame time, agreed before any motion goes in. Without one, 'make it feel premium' quietly becomes 'make it slow', and nobody notices until it is on someone's phone on a train.",
    aside: "This site holds two draw calls per world and measures itself in the lab.",
  },
  {
    n: "04",
    title: "Finish the edges",
    body: "Empty states, error copy that says what to do next, focus order, reduced motion, the 320px case, the offline case. This is the part that separates something demo-able from something you can put in front of a customer, and it is almost always the part that gets cut.",
    aside: "If it only works on my machine, I have not finished it.",
  },
];

export default function HomePage() {
  const featured = PROJECTS.slice(0, 3);

  return (
    <main>
      <Hero />

      {/* ---- Statement ------------------------------------------------- */}
      <section className="shell py-[10vh]">
        <div className="grid gap-12 lg:grid-cols-[0.35fr_1fr]">
          <span className="t-label pt-3">What I actually do</span>
          <SplitReveal
            as="p"
            className="t-display t-display-light max-w-[22ch] text-[clamp(1.2rem,2.2vw,1.75rem)] leading-[1.06] text-white"
            stagger={0.06}
          >
            Most sites look finished in a screenshot and fall apart under real
            content. I build the other kind.
          </SplitReveal>
        </div>
      </section>

      {/* ---- Numbers --------------------------------------------------- */}
      <section className="shell py-[5vh]">
        <div className="rule mb-8" />
        <RiseGroup className="grid grid-cols-2 gap-6 md:grid-cols-4" stagger={0.07}>
          {[
            ["7", "Live worlds in this site"],
            ["2", "Draw calls per world"],
            ["60", "Frames per second, budgeted"],
            ["0", "Megabytes of 3D assets downloaded"],
          ].map(([v, l]) => (
            <div key={l} data-rise>
              <div
                className="t-display text-[clamp(1.7rem,3vw,2.4rem)]"
                style={{ color: "var(--accent)" }}
              >
                {v}
              </div>
              <div className="t-label mt-2 max-w-[18ch]">{l}</div>
            </div>
          ))}
        </RiseGroup>
      </section>

      {/* ---- Featured work --------------------------------------------- */}
      <section className="shell py-[10vh]">
        <div className="mb-8 flex items-end justify-between gap-6">
          <h2 className="t-label">Selected work</h2>
          <Link
            href="/work"
            data-cursor="All"
            className="t-label transition-colors duration-400 hover:text-white"
          >
            All {PROJECTS.length} →
          </Link>
        </div>
        <div className="rule mb-6" />

        <Skewed>
          <RiseGroup className="space-y-3" stagger={0.09} y={30}>
            {featured.map((p, i) => {
              const w = WORLDS[p.world];
              return (
                <article
                  key={p.slug}
                  data-rise
                  className="panel panel-live group relative overflow-hidden px-6 py-7 md:px-9"
                >
                  <span className="rim" />
                  <span className="sheen" />

                  {/* Covers the whole card, padding included. The visible
                      title is plain text; this carries the link. */}
                  <Link
                    href={"/work/" + p.slug}
                    data-cursor="Read"
                    className="absolute inset-0 z-10"
                  >
                    <span className="sr-only">{p.title} — read the case study</span>
                  </Link>

                  <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:gap-9">
                    <span className="t-mono text-[11px] text-w40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="t-display text-[clamp(1.2rem,2.2vw,1.75rem)] text-w60 transition-colors duration-500 group-hover:text-white">
                        {p.title}
                      </h3>
                      <p className="t-body mt-2 max-w-[48ch] text-[13.5px]">{p.summary}</p>
                    </div>
                    <div className="relative z-20 flex shrink-0 flex-wrap items-center gap-3">
                      {p.draft && (
                        <span className="border border-w20 px-2.5 py-1">
                          <span className="t-label text-[8px]">Placeholder</span>
                        </span>
                      )}
                      <span
                        className="t-label border px-2.5 py-1 text-[8px]"
                        style={{ borderColor: w.accent + "55", color: w.accent }}
                      >
                        {w.name}
                      </span>

                      {p.live && (
                        <a
                          href={p.live}
                          target="_blank"
                          rel="noreferrer noopener"
                          data-cursor="Live site"
                          className="group/live inline-flex items-center gap-1.5 border border-w20 px-3 py-1.5 transition-colors duration-400 hover:border-white hover:bg-white"
                        >
                          <span className="t-label text-[8px] transition-colors duration-300 group-hover/live:text-black">
                            Visit site
                          </span>
                          <span className="text-[10px] leading-none text-w60 transition-colors duration-300 group-hover/live:text-black">
                            ↗
                          </span>
                        </a>
                      )}

                      <span className="text-w40 transition-all duration-500 group-hover:translate-x-1 group-hover:text-white">
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
            })}
          </RiseGroup>
        </Skewed>
      </section>

      {/* ---- Worlds (pinned horizontal run) ----------------------------- */}
      <WorldStrip />

      {/* ---- Practice --------------------------------------------------- */}
      <section className="shell py-[10vh]">
        <h2 className="t-label mb-8">What I take on</h2>
        <div className="rule mb-6" />

        <RiseGroup className="grid gap-3 md:grid-cols-2" stagger={0.08} y={28}>
          {PRACTICE.map((c) => (
            <Panel key={c.n} as="article" className="p-8 md:p-10">
              <div data-rise className="relative">
                <span className="t-mono text-[10px] text-w40">{c.n}</span>
                <h3 className="t-display mt-5 text-[clamp(1.3rem,2.1vw,1.85rem)] text-white">
                  {c.title}
                </h3>
                <p className="t-body mt-4 max-w-[42ch] text-[14px]">{c.body}</p>
                <ul className="mt-7 flex flex-wrap gap-2">
                  {c.tags.map((t) => (
                    <li
                      key={t}
                      className="t-mono border border-w08 px-2.5 py-1 text-[10px] text-w40"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>
          ))}
        </RiseGroup>
      </section>

      {/* ---- Process (sticky stack) -------------------------------------- */}
      <section className="shell py-[8vh]">
        <div className="mb-10 grid gap-6 lg:grid-cols-[0.4fr_1fr]">
          <h2 className="t-label pt-2">How a project goes</h2>
          <Parallax speed={0.05}>
            <p className="t-body max-w-[44ch] text-[15px]">
              Four steps, in this order, every time. The order is the part that
              matters — most of the expensive mistakes come from doing step
              four first.
            </p>
          </Parallax>
        </div>

        <StackCards items={PROCESS} />
      </section>

      {/* ---- Close ------------------------------------------------------ */}
      <section className="shell py-[14vh]">
        <div className="rule mb-12" />
        <SplitReveal
          as="h2"
          className="t-display max-w-[13ch] text-[clamp(1.9rem,4.4vw,3.2rem)] text-white"
        >
          Got something worth building properly?
        </SplitReveal>

        <Magnetic strength={0.2}>
          <Link href="/contact" data-cursor="Talk" className="btn mt-14">
            <span className="fill" />
            <span className="lbl t-label text-white">Start a conversation</span>
            <span className="lbl">→</span>
          </Link>
        </Magnetic>
      </section>
    </main>
  );
}
