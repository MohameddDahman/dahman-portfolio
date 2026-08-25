import type { Metadata } from "next";
import PageHead from "@/components/ui/PageHead";
import ProjectCard from "@/components/ui/ProjectCard";
import { Reveal } from "@/components/motion/Reveal";
import { PROJECTS } from "@/data/projects";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected frontend projects by Mohamed Dahman.",
};

export default function WorkPage() {
  const real = PROJECTS.filter((p) => !p.draft);
  const drafts = PROJECTS.filter((p) => p.draft);

  return (
    <>
      <PageHead
        eyebrow={`${real.length} shipped`}
        title="Work"
        lead="Each entry links to the live site and to a write-up of how it was built."
      />

      <section className="shell pb-20">
        <div className="flex flex-col gap-5">
          {real.map((p, i) => (
            <Reveal key={p.slug} delay={i * 60}>
              <ProjectCard project={p} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      {drafts.length > 0 && (
        <section className="rule-t bg-wash">
          <div className="shell py-20">
            <Reveal>
              <h2 className="t-h3">In progress</h2>
              <p className="measure mt-3 text-[1rem] leading-relaxed text-ink-2">
                Placeholders while the write-ups are finished. They are marked
                so nothing here reads as work that is done when it is not.
              </p>
            </Reveal>

            <div className="mt-10 flex flex-col gap-5">
              {drafts.map((p, i) => (
                <Reveal key={p.slug} delay={i * 40}>
                  <ProjectCard project={p} index={real.length + i} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
