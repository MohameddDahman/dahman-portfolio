import Link from "next/link";
import Figure from "@/components/gl/Figure";
import ProjectCard from "@/components/ui/ProjectCard";
import { Reveal } from "@/components/motion/Reveal";
import { PROJECTS } from "@/data/projects";

const PRACTICE = [
  {
    title: "Interface build",
    body: "Full frontend from a design file or a rough idea — including the parts nobody mocks up: loading, empty, error, and what happens at 320px.",
  },
  {
    title: "Data and forms",
    body: "Typed end to end, validated on both sides, and honest with the reader about what is still in flight.",
  },
  {
    title: "Performance",
    body: "Finding out why a page feels slow and fixing the cause, not the symptom that happens to be easiest to reach.",
  },
  {
    title: "Internationalisation",
    body: "Including full right-to-left, which is the part that actually costs something once every margin and icon needs an answer in both directions.",
  },
];

export default function HomePage() {
  const featured = PROJECTS.filter((p) => !p.draft).slice(0, 2);

  return (
    <>
      {/* ---- Hero. Nothing behind the words. ------------------------- */}
      <section className="shell pb-16 pt-20 md:pb-24 md:pt-32">
        <Reveal>
          <p className="t-label">Cairo · Available for work</p>
          <h1 className="t-hero measure-wide mt-6">
            I build interfaces that hold up once the{" "}
            <span className="mark">real content</span> arrives.
          </h1>
          <p className="t-lead measure mt-8">
            I&rsquo;m Mohamed Dahman, a frontend engineer working mainly in
            Next.js. Most of my time goes to the half of the job that never
            appears in a mockup — the states, the edge cases, and whether the
            thing is still readable on someone else&rsquo;s screen.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/work" className="btn">
              See the work
            </Link>
            <Link href="/contact" className="btn btn-quiet">
              Start a project
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ---- Figure. The 3D, in a frame, beside nothing. -------------- */}
      <section className="shell pb-20 md:pb-28">
        <Reveal>
          <Figure
            number="01"
            caption="A DOM tree with a render pass walking it depth-first. Nodes are outlined until the pass reaches them, then they fill. It is the shape of the work rather than a decoration next to it — and it stops rendering the moment it leaves your screen."
          />
        </Reveal>
      </section>

      {/* ---- Selected work -------------------------------------------- */}
      <section className="rule-t bg-wash">
        <div className="shell py-20 md:py-28">
          <Reveal>
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="t-h2">Selected work</h2>
              <Link href="/work" className="link t-data">
                All {PROJECTS.length} projects →
              </Link>
            </div>
          </Reveal>

          <div className="mt-12 flex flex-col gap-5">
            {featured.map((p, i) => (
              <Reveal key={p.slug} delay={i * 60}>
                <ProjectCard project={p} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---- What I do -------------------------------------------------
          A plain definition list. Four things, each one sentence, at the
          reading measure. */}
      <section className="shell py-20 md:py-28">
        <Reveal>
          <h2 className="t-h2">What I take on</h2>
        </Reveal>

        <dl className="mt-12 grid gap-x-16 gap-y-10 md:grid-cols-2">
          {PRACTICE.map((c, i) => (
            <Reveal key={c.title} delay={i * 50}>
              <dt className="t-h3">{c.title}</dt>
              <dd className="measure mt-3 text-[1rem] leading-relaxed text-ink-2">
                {c.body}
              </dd>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* ---- Close ------------------------------------------------------ */}
      <section className="rule-t">
        <div className="shell py-20 md:py-28">
          <Reveal>
            <h2 className="t-h2 measure-wide">
              Got something that needs building <span className="mark">properly</span>?
            </h2>
            <p className="t-lead measure mt-6">
              Tell me what it is and roughly when you need it. If it&rsquo;s
              outside what I do, I&rsquo;ll say so and point you somewhere
              better.
            </p>
            <Link href="/contact" className="btn mt-10">
              Start a conversation
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
