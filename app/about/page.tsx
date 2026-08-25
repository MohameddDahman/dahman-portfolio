import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/ui/PageHead";
import Toolkit from "@/components/ui/Toolkit";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "How Mohamed Dahman works: Next.js, TypeScript, and the unglamorous half of interface engineering.",
};

const STORY = [
  "I'm a frontend engineer working mainly in the Next.js App Router. Most of my time goes to the half of interface work that never appears in a mockup: keeping state honest, handling the cases nobody drew, and making sure a build still holds up once real content is in it.",
  "I got here the way a lot of people do — by making things that looked great in a screenshot and fell apart on a three-year-old Android. That gap turned out to be the interesting part of the job, and it is still the part I care most about.",
  "The most recent version of this site is a case in point. It had seven live 3D scenes running behind the text, and it looked impressive in a still frame. It was also genuinely hard to read. So it got rebuilt around one rule: text and image never share pixels.",
];

const BELIEFS = [
  {
    title: "Legibility is not a finishing touch",
    body: "If a visitor has to work to read a sentence, nothing else on the page matters. Contrast, measure and type size are structural decisions, not polish applied at the end.",
  },
  {
    title: "Empty states are the product",
    body: "Most people meet a feature when they have no data in it. The screen with nothing on it deserves as much attention as the one in the marketing shot.",
  },
  {
    title: "Errors are instructions",
    body: "An error should say what to do next, in the interface's voice. “Something went wrong” is a shrug with a stylesheet.",
  },
  {
    title: "Motion needs a reason",
    body: "Every animation should explain a cause and effect. If it cannot, it is competing with the content for the reader's attention — and the content should win.",
  },
];

const FACTS: [string, string][] = [
  ["Based", "Cairo, working remote"],
  ["Focus", "Next.js · TypeScript · React"],
  ["Also", "Internationalisation, RTL, performance"],
  ["Reply within", "One working day"],
];

export default function AboutPage() {
  return (
    <>
      <PageHead
        eyebrow="About"
        title="The half nobody mocks up"
      />

      <section className="shell grid gap-14 pb-20 md:grid-cols-[1fr_auto] md:gap-20">
        <div className="measure space-y-6">
          {STORY.map((p, i) => (
            <Reveal key={i} delay={i * 50}>
              <p className="text-[1.0625rem] leading-[1.7]">{p}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="md:w-[19rem]">
          <dl className="rule-t">
            {FACTS.map(([k, v]) => (
              <div key={k} className="rule-b py-4">
                <dt className="t-label">{k}</dt>
                <dd className="mt-1.5 text-[1rem] text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <section className="rule-t">
        <div className="shell py-20 md:py-24">
          <Reveal>
            <h2 className="t-h2">What I argue for</h2>
          </Reveal>

          <dl className="mt-12 grid gap-x-16 gap-y-10 md:grid-cols-2">
            {BELIEFS.map((b, i) => (
              <Reveal key={b.title} delay={i * 50}>
                <dt className="t-h3">{b.title}</dt>
                <dd className="measure mt-3 text-[1rem] leading-relaxed text-ink-2">
                  {b.body}
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <Toolkit />

      <section className="shell py-20 md:py-24">
        <Reveal>
          <h2 className="t-h2 measure-wide">Want the longer version?</h2>
          <p className="t-lead measure mt-5">
            Happy to talk through any of it on a call.
          </p>
          <Link href="/contact" className="btn mt-8">
            Get in touch
          </Link>
        </Reveal>
      </section>
    </>
  );
}
