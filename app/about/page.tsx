import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/ui/PageHead";
import Panel from "@/components/ui/Panel";
import Toolkit from "@/components/ui/Toolkit";
import FrameMeter from "@/components/ui/FrameMeter";
import Magnetic from "@/components/motion/Magnetic";
import { SplitReveal, RiseGroup, Parallax } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "How Mohamed Dahman works: Next.js, TypeScript, and a frame budget. The unglamorous half of interface engineering.",
};

const STORY = [
  "I'm a frontend engineer working mainly in the Next.js App Router. Most of my time goes to the half of interface work that never appears in a mockup: keeping the main thread free, keeping state honest, and making sure a build still holds its frame once real data and real motion are in it.",
  "I got here the way a lot of people do — by making things that looked great in a screenshot and terrible on a three-year-old Android. That gap turned out to be the interesting part of the job, and it is still the part I care most about.",
  "This site is the argument rather than a claim about it. Seven live 3D environments, one WebGL context, two draw calls apiece, nothing downloaded. The meter measures it on your machine while you read.",
];

const BELIEFS = [
  {
    n: "01",
    title: "A frame budget is a design decision",
    body: "Deciding how much motion a page gets is exactly as much a design choice as deciding its colour. If nobody sets the number, the number gets set by accident.",
  },
  {
    n: "02",
    title: "Empty states are the product",
    body: "Most people meet a feature when they have no data in it. The screen with nothing on it deserves as much attention as the one in the marketing shot.",
  },
  {
    n: "03",
    title: "Errors are instructions",
    body: "An error message should say what to do next, in the interface's voice. 'Something went wrong' is a shrug with a stylesheet.",
  },
  {
    n: "04",
    title: "Motion should be interruptible",
    body: "If a user can't scroll past your animation, it isn't polish, it's a toll booth. Everything here respects reduced motion and gets out of the way.",
  },
];

const TIMELINE = [
  ["Now", "Available for frontend work — freelance or full-time."],
  ["Recently", "Interface systems and performance work in the Next.js ecosystem."],
  ["Before that", "Learning the hard way that a screenshot is not a product."],
];

export default function AboutPage() {
  return (
    <main>
      <PageHead
        index="03"
        eyebrow="Prism · Move to turn the shards"
        title="The half nobody mocks up"
        meta={[
          ["Name", "Mohamed Dahman"],
          ["Role", "Frontend engineer"],
          ["Working", "Remote"],
          ["Reply within", "One working day"],
        ]}
      />

      <section className="shell grid gap-14 py-[6vh] lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
        <div className="space-y-6">
          {STORY.map((p, i) => (
            <SplitReveal
              key={i}
              as="p"
              className="t-body max-w-[58ch] text-[15px]"
              stagger={0.04}
              immediate={i === 0}
            >
              {p}
            </SplitReveal>
          ))}

          <Parallax speed={0.04}>
            <blockquote className="mt-10 border-l-2 pl-6" style={{ borderColor: "var(--accent)" }}>
              <p className="t-display-light t-display max-w-[24ch] text-[clamp(1.3rem,2.6vw,2rem)] leading-[1.15] text-white">
                If it only works on my machine, I haven&apos;t finished it.
              </p>
            </blockquote>
          </Parallax>
        </div>

        <div className="space-y-3">
          <FrameMeter />
          <Panel className="p-6">
            <div className="relative">
              <span className="t-label">Where things stand</span>
              <dl className="mt-4">
                {TIMELINE.map(([k, v]) => (
                  <div key={k} className="border-b border-w08 py-3 last:border-0">
                    <dt className="t-label" style={{ color: "var(--accent)" }}>
                      {k}
                    </dt>
                    <dd className="t-body mt-1.5 text-[13.5px]">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Panel>
        </div>
      </section>

      {/* ---- Beliefs ---- */}
      <section className="shell py-[8vh]">
        <h2 className="t-label mb-8">What I argue for</h2>
        <div className="rule mb-6" />

        <RiseGroup className="grid gap-3 md:grid-cols-2" stagger={0.08} y={28}>
          {BELIEFS.map((b) => (
            <Panel key={b.n} as="article" className="p-8">
              <div data-rise className="relative">
                <span className="t-mono text-[10px]" style={{ color: "var(--accent)" }}>
                  {b.n}
                </span>
                <h3 className="t-display mt-5 text-[clamp(1.2rem,2vw,1.6rem)] text-white">
                  {b.title}
                </h3>
                <p className="t-body mt-3 max-w-[44ch] text-[14px]">{b.body}</p>
              </div>
            </Panel>
          ))}
        </RiseGroup>
      </section>

      <Toolkit />

      {/* ---- Close ---- */}
      <section className="shell py-[10vh]">
        <div className="rule mb-12" />
        <SplitReveal
          as="h2"
          className="t-display max-w-[14ch] text-[clamp(2rem,6vw,5rem)] text-white"
        >
          Want the long version over a call?
        </SplitReveal>

        <Magnetic strength={0.2}>
          <Link href="/contact" data-cursor="Talk" className="btn mt-12">
            <span className="fill" />
            <span className="lbl t-label text-white">Get in touch</span>
            <span className="lbl">→</span>
          </Link>
        </Magnetic>
      </section>
    </main>
  );
}
