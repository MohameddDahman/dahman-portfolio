import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PROJECTS, projectBySlug } from "@/data/projects";
import { Reveal } from "@/components/motion/Reveal";

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

  const host = project.live ? new URL(project.live).host : null;
  const index = PROJECTS.findIndex((p) => p.slug === slug);
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  const facts = project.facts.filter(([, v]) => v.trim().length > 0);

  return (
    <>
      <header className="shell pb-12 pt-20 md:pt-28">
        <Reveal>
          <Link
            href="/work"
            className="link t-data"
            transitionTypes={["close-project"]}
          >
            ← All work
          </Link>
        </Reveal>

        <Reveal delay={60}>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="t-label">{project.role}</span>
            <span className="t-label text-ink-3">{project.year}</span>
            {project.draft && (
              <span className="t-label border border-rule px-2 py-0.5 text-[0.6875rem] text-ink-3">
                Write-up in progress
              </span>
            )}
          </div>
        </Reveal>

        <h1 className="t-hero measure-wide mt-5">{project.title}</h1>
        <p className="t-lead measure mt-6">{project.summary}</p>

        {/* The primary action. Solid, 48px, and it names the domain —
            "Live ↗" told the reader nothing about where it went. */}
        {project.live && (
          <Reveal delay={200}>
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer noopener"
              className="btn mt-9"
            >
              Open the live site
              <span className="font-normal normal-case tracking-normal opacity-70">
                {host}
              </span>
              <span aria-hidden>↗</span>
            </a>
          </Reveal>
        )}
      </header>

      {/* ---- Case study ------------------------------------------------
          One column at the reading measure. No sidebar competing with the
          prose for attention while you are trying to read it. */}
      <section className="rule-t">
        <div className="shell py-16 md:py-20">
          {project.draft ? (
            <Reveal>
              <div className="card measure-wide p-8">
                <h2 className="t-h3">The write-up isn&rsquo;t finished</h2>
                <p className="mt-3 text-[1rem] leading-relaxed text-ink-2">
                  What&rsquo;s here is accurate; there is just more of it to
                  come. Happy to talk through the project in the meantime.
                </p>
                <Link href="/contact" className="link mt-6 inline-block">
                  Ask me about it →
                </Link>
              </div>
            </Reveal>
          ) : (
            <div className="measure space-y-14">
              {project.chapters.map((ch, ci) => (
                <Reveal key={ch.heading} delay={ci * 40}>
                  <h2 className="t-h3">{ch.heading}</h2>
                  <div className="mt-4 space-y-5">
                    {ch.body.map((p, i) => (
                      <p key={i} className="text-[1.0625rem] leading-[1.7]">
                        {p}
                      </p>
                    ))}
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---- Facts ------------------------------------------------------ */}
      <section className="rule-t bg-wash">
        <div className="shell py-16">
          <div className="grid gap-12 md:grid-cols-[1fr_1fr]">
            {facts.length > 0 && (
              <Reveal>
                <h2 className="t-label">Details</h2>
                <dl className="rule-t mt-5">
                  {facts.map(([k, v]) => (
                    <div
                      key={k}
                      className="rule-b flex flex-wrap items-baseline justify-between gap-4 py-3.5"
                    >
                      <dt className="text-[0.95rem] text-ink-2">{k}</dt>
                      <dd className="text-[0.95rem] text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}

            {project.stack.length > 0 && (
              <Reveal delay={60}>
                <h2 className="t-label">Built with</h2>
                <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
                  {project.stack.map((t) => (
                    <li key={t} className="text-[1.05rem] text-ink">
                      {t}
                    </li>
                  ))}
                </ul>

                {(project.live || project.source) && (
                  <div className="mt-10 flex flex-wrap gap-3">
                    {project.live && (
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="btn btn-quiet"
                      >
                        Open live site <span aria-hidden>↗</span>
                      </a>
                    )}
                    {project.source && (
                      <a
                        href={project.source}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="btn btn-quiet"
                      >
                        Source code <span aria-hidden>↗</span>
                      </a>
                    )}
                  </div>
                )}
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ---- Next ------------------------------------------------------- */}
      <section className="rule-t">
        <div className="shell py-16">
          <Reveal>
            <p className="t-label">Next project</p>
            <Link href={"/work/" + next.slug} className="group mt-4 block">
              <h2 className="t-h2 transition-colors duration-200">
                {next.title}
              </h2>
              <p className="measure mt-2 text-[1rem] text-ink-2">
                {next.summary}
              </p>
              <span className="link t-data mt-5 inline-block">Read it →</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
