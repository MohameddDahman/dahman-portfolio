import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PROJECTS, projectBySlug } from "@/data/projects";
import { WORLDS } from "@/lib/worlds";
import { SplitReveal, RiseGroup, Parallax } from "@/components/motion/Reveal";
import Panel from "@/components/ui/Panel";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return { title: "Not found" };
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  // Show the real hostname on the button. "Live ↗" says nothing about
  // where it goes; the domain is the strongest signal that this leaves for
  // the actual shipped site rather than another page of this one.
  const host = project.live ? new URL(project.live).host : null;

  const index = PROJECTS.findIndex((p) => p.slug === slug);
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  const world = WORLDS[project.world];

  return (
    <main>
      <header className="shell pt-[24vh] md:pt-[27vh]">
        <Link
          href="/work"
          data-cursor="Back"
          className="t-label group inline-flex items-center gap-2 transition-colors duration-400 hover:text-white"
        >
          <span className="transition-transform duration-400 group-hover:-translate-x-1">←</span>
          All work
        </Link>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <span className="t-mono text-[11px]" style={{ color: "var(--accent)" }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="t-label">{project.role}</span>
          <span className="h-3 w-px bg-w08" />
          <span className="t-label">{project.year}</span>
          <span className="h-3 w-px bg-w08" />
          <span className="t-label">World · {world.name}</span>
          {project.draft && (
            <span className="border border-w20 px-2.5 py-1">
              <span className="t-label text-[8px]">Placeholder entry</span>
            </span>
          )}
        </div>

        <SplitReveal
          as="h1"
          className="t-display mt-6 max-w-[14ch] text-[clamp(2.2rem,5.4vw,4rem)]"
          immediate
          stagger={0.085}
        >
          {project.title}
        </SplitReveal>

        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noreferrer noopener"
            data-cursor="Live site"
            className="group mt-9 inline-flex items-center gap-4 border border-white bg-white px-7 py-4 transition-colors duration-400 hover:bg-transparent"
          >
            <span className="t-label text-[10px] tracking-[0.24em] text-black transition-colors duration-300 group-hover:text-white">
              Open the live site
            </span>
            <span className="t-mono text-[11px] text-black/55 transition-colors duration-300 group-hover:text-w60">
              {host}
            </span>
            <span className="text-[13px] leading-none text-black transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white">
              ↗
            </span>
          </a>
        )}

        <div className="rule mt-10" />
      </header>

      {/* ---- Outcomes ---------------------------------------------------
          Only rendered when there is something real to put in it. A
          results strip full of em-dashes is worse than no strip at all,
          and a finished write-up can legitimately have no numbers yet. */}
      {project.outcomes.length > 0 && (
        <section className="shell py-[6vh]">
          <RiseGroup className="grid grid-cols-1 gap-6 sm:grid-cols-3" stagger={0.08}>
            {project.outcomes.map((o) => (
              <div key={o.label} data-rise>
                <div
                  className="t-display text-[clamp(1.7rem,3vw,2.4rem)]"
                  style={{ color: "var(--accent)" }}
                >
                  {o.value}
                </div>
                <div className="t-label mt-2 max-w-[22ch]">{o.label}</div>
              </div>
            ))}
          </RiseGroup>
        </section>
      )}

      {/* ---- Case study ------------------------------------------------- */}
      <section className="shell grid gap-14 py-[6vh] lg:grid-cols-[1.25fr_0.75fr] lg:gap-20">
        <div className="space-y-16">
          {/* A draft shows an honest note instead of its scaffolding. The
              project is real and belongs in the list; the write-up simply
              is not finished, and saying so is better than printing the
              prompts I left myself. */}
          {project.draft ? (
            <div className="panel p-8 md:p-10">
              <span className="t-label">Write-up in progress</span>
              <p className="t-body mt-4 max-w-[52ch]">
                The case study for this one is not written up yet. What is
                here is accurate; there is just more of it to come.
              </p>
              <Link
                href="/contact"
                data-cursor="Ask"
                className="t-label group mt-8 inline-flex items-center gap-2 transition-colors duration-400 hover:text-white"
              >
                Ask me about it directly
                <span className="transition-transform duration-400 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          ) : (
          project.chapters.map((ch, ci) => (
            <div key={ch.heading}>
              <div className="mb-5 flex items-baseline gap-3">
                <span className="t-mono text-[10px] text-w40">
                  {String(ci + 1).padStart(2, "0")}
                </span>
                <h2 className="t-display text-[clamp(1.4rem,2.4vw,2rem)] text-white">
                  {ch.heading}
                </h2>
              </div>
              <div className="space-y-5">
                {ch.body.map((p, i) => (
                  <SplitReveal
                    key={i}
                    as="p"
                    className="t-body max-w-[58ch] text-[15px]"
                    stagger={0.04}
                    immediate={ci === 0 && i === 0}
                  >
                    {p}
                  </SplitReveal>
                ))}
              </div>
            </div>
          )))}
        </div>

        <aside>
          <Parallax speed={0.05}>
            <Panel className="p-7">
              <dl className="relative">
                {project.facts
                  .filter(([, v]) => v.trim().length > 0)
                  .map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-baseline justify-between gap-6 border-b border-w08 py-3 last:border-0"
                  >
                    <dt className="t-label">{k}</dt>
                    <dd className="t-mono text-[11px] text-w90">{v}</dd>
                  </div>
                ))}
              </dl>

              {project.stack.length > 0 && (
              <div className="relative mt-7">
                <div className="t-label mb-3">Built with</div>
                <ul className="flex flex-wrap gap-2">
                  {project.stack.map((t) => (
                    <li
                      key={t}
                      className="t-mono border border-w08 px-3 py-1.5 text-[10px] text-w40"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              )}

              {(project.live || project.source) && (
                <div className="relative mt-7">
                  <div className="t-label mb-3">Links</div>
                  <div className="flex flex-wrap gap-2">
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noreferrer noopener"
                      data-cursor="Live site"
                      className="t-label border border-w20 px-4 py-2 transition-colors duration-400 hover:border-white hover:text-white"
                    >
                      Open live site ↗
                    </a>
                  )}
                  {project.source && (
                    <a
                      href={project.source}
                      target="_blank"
                      rel="noreferrer noopener"
                      data-cursor="Source"
                      className="t-label border border-w20 px-4 py-2 transition-colors duration-400 hover:border-white hover:text-white"
                    >
                      Source code ↗
                    </a>
                  )}
                  </div>
                </div>
              )}
            </Panel>
          </Parallax>
        </aside>
      </section>

      {/* ---- Next ------------------------------------------------------- */}
      <section className="shell py-[12vh]">
        <div className="rule mb-8" />
        <span className="t-label">Next</span>

        <Link href={"/work/" + next.slug} data-cursor="Next" className="group mt-6 block">
          <h2 className="t-display text-[clamp(1.6rem,3.6vw,2.6rem)] text-w40 transition-colors duration-500 group-hover:text-white">
            {next.title}
          </h2>
          <span
            className="mt-6 block h-px w-full origin-left scale-x-[0.04] transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
            style={{ background: "var(--accent)" }}
          />
        </Link>
      </section>
    </main>
  );
}
