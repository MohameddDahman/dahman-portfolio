import Link from "next/link";
import type { Project } from "@/data/projects";

/**
 * A project, as a row you can read.
 *
 * Two destinations per card and they must not fight: the whole row opens
 * the write-up via an overlay link, and the live-site button is raised
 * above it. That is why this is an <article> rather than one big anchor —
 * nesting an <a> inside an <a> is invalid, and browsers resolve it by
 * dropping one.
 */
export default function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const host = project.live ? new URL(project.live).host : null;

  return (
    <article className="card group relative p-6 sm:p-8">
      {/* Covers the whole card, padding included. Carries the accessible
          name so the visible title can stay plain text. */}
      <Link
        href={"/work/" + project.slug}
        className="absolute inset-0 z-10"
        aria-label={`${project.title} — read the write-up`}
        transitionTypes={["open-project"]}
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
        <span className="t-label shrink-0 md:pt-1.5">
          {String(index + 1).padStart(2, "0")}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <h3 className="t-h3">{project.title}</h3>
            <span className="t-label text-ink-3">{project.year}</span>
            {project.draft && (
              <span className="t-label border border-rule px-2 py-0.5 text-[0.6875rem] text-ink-3">
                Placeholder
              </span>
            )}
          </div>

          <p className="measure mt-3 text-[1rem] leading-relaxed text-ink-2">
            {project.summary}
          </p>

          {project.stack.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
              {project.stack.map((t) => (
                <li key={t} className="t-data text-[0.8125rem] text-ink-3">
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Raised above the overlay so it wins its own click. */}
        <div className="relative z-20 flex shrink-0 flex-wrap items-center gap-3">
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-quiet"
            >
              Visit site
              <span aria-hidden>↗</span>
            </a>
          )}
          <span
            aria-hidden
            className="t-label hidden text-ink-3 transition-colors duration-200 group-hover:text-ink md:inline"
          >
            Read →
          </span>
        </div>
      </div>

      {host && (
        <p className="t-data relative mt-6 text-[0.8125rem] text-ink-3">{host}</p>
      )}
    </article>
  );
}
