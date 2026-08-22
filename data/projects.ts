import type { WorldId } from "@/lib/worlds";

/**
 * ---------------------------------------------------------------------
 *  REPLACE THESE WITH YOUR REAL PROJECTS.
 *
 *  Every entry is a placeholder. While `draft` is true, the rail row and
 *  the case-study page both show a visible marker, so nothing here can be
 *  mistaken for real work if the site ships before you have filled it in.
 *  Set `draft: false` once an entry describes something you actually
 *  built.
 *
 *  `world` picks which of the seven 3D environments stands behind the
 *  project's page — see lib/worlds.ts.
 * ---------------------------------------------------------------------
 */
export type Project = {
  slug: string;
  title: string;
  role: string;
  year: string;
  /** One line. Used on the rail and the index. */
  summary: string;
  /** The environment behind this project's page. */
  world: WorldId;
  /** Long-form case study, in order. */
  chapters: { heading: string; body: string[] }[];
  stack: string[];
  facts: [string, string][];
  /** Big numbers for the results strip. Keep them true. */
  outcomes: { value: string; label: string }[];
  live?: string;
  source?: string;
  draft: boolean;
};

export const PROJECTS: Project[] = [
  {
    slug: "first-project",
    title: "First project",
    role: "Design & build",
    year: "2025",
    world: "neon",
    summary: "One line on the problem and the result. Concrete beats impressive.",
    chapters: [
      {
        heading: "The situation",
        body: [
          "Open with who it was for, what they had before, and what was actually going wrong. Two or three sentences is plenty — the reader is deciding whether to keep going.",
          "Name the constraint that shaped everything else. A deadline, a legacy API, a device you were not allowed to drop. Constraints are the most interesting thing on a case-study page and almost nobody writes them down.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "Describe the thing in the words its users would use, not in the words its repository uses.",
          "Then the part you are actually proud of: the decision that was not obvious, and what you chose against.",
        ],
      },
      {
        heading: "What changed",
        body: [
          "Close with a measurement. A load time, a conversion, a support ticket that stopped arriving, a task that used to take an hour. A number beats an adjective every single time.",
        ],
      },
    ],
    stack: ["Next.js", "TypeScript", "Tailwind", "Vercel"],
    facts: [
      ["Client", "Add the client, or Personal"],
      ["Duration", "e.g. Six weeks"],
      ["Team", "e.g. Solo"],
      ["Scope", "Design, build, deploy"],
    ],
    outcomes: [
      { value: "00%", label: "Replace with a real number" },
      { value: "0.0s", label: "Replace with a real number" },
      { value: "0×", label: "Replace with a real number" },
    ],
    draft: true,
  },
  {
    slug: "second-project",
    title: "Second project",
    role: "Frontend engineering",
    year: "2025",
    world: "tide",
    summary: "Name the hard part. That is the line people actually read.",
    chapters: [
      {
        heading: "The situation",
        body: [
          "What the product does and who it is for.",
          "The state it was in when you arrived.",
        ],
      },
      {
        heading: "The hard part",
        body: [
          "Every project has one. Realtime sync, an offline mode, a table with fifty thousand rows, a form nobody could finish.",
          "Say what you tried first and why it did not hold. Being honest about a dead end reads as experience, not weakness.",
        ],
      },
      {
        heading: "What changed",
        body: ["The measured outcome, and how you measured it."],
      },
    ],
    stack: ["React", "Convex", "Realtime", "Zod"],
    facts: [
      ["Client", "Add the client, or Personal"],
      ["Duration", "e.g. Three months"],
      ["Team", "e.g. Two engineers"],
      ["Scope", "Frontend, data layer"],
    ],
    outcomes: [
      { value: "00ms", label: "Replace with a real number" },
      { value: "00%", label: "Replace with a real number" },
      { value: "0k", label: "Replace with a real number" },
    ],
    draft: true,
  },
  {
    slug: "third-project",
    title: "Third project",
    role: "Interface systems",
    year: "2025",
    world: "prism",
    summary: "If it was a client build, say what they needed and what changed.",
    chapters: [
      {
        heading: "The situation",
        body: [
          "A team shipping inconsistent interfaces, or a product that had outgrown its first design.",
        ],
      },
      {
        heading: "The system",
        body: [
          "Describe the system rather than the screens: the tokens, the primitives, the rules that let other people keep building after you left.",
          "Say how you handled the parts systems usually get wrong — density, dark mode, focus order, and what happens when a label is three words longer in German.",
        ],
      },
      {
        heading: "Adoption",
        body: [
          "End with uptake. A design system nobody uses is a folder. Say how many surfaces moved onto it and how long that took.",
        ],
      },
    ],
    stack: ["Design system", "Storybook", "Tailwind", "Radix"],
    facts: [
      ["Client", "Add the client, or Personal"],
      ["Duration", "e.g. Ongoing"],
      ["Team", "e.g. Design + 3 engineers"],
      ["Scope", "System design, docs"],
    ],
    outcomes: [
      { value: "00", label: "Replace with a real number" },
      { value: "00%", label: "Replace with a real number" },
      { value: "0 wks", label: "Replace with a real number" },
    ],
    draft: true,
  },
  {
    slug: "fourth-project",
    title: "Fourth project",
    role: "Motion & WebGL",
    year: "2024",
    world: "bloom",
    summary: "Experiments belong here too. They show range.",
    chapters: [
      {
        heading: "Why",
        body: [
          "Curiosity is a perfectly good reason to build something, and saying so reads as honest.",
        ],
      },
      {
        heading: "The technique",
        body: [
          "Explain it plainly enough that a non-specialist gets the idea, and precisely enough that a specialist believes you.",
          "Include the budget you held it to. Anyone can make something pretty at fifteen frames a second.",
        ],
      },
      {
        heading: "What it taught me",
        body: ["The thing you now use in client work because of this."],
      },
    ],
    stack: ["WebGL", "GLSL", "GSAP", "Three.js"],
    facts: [
      ["Client", "Personal"],
      ["Duration", "e.g. A weekend"],
      ["Team", "Solo"],
      ["Scope", "Concept and build"],
    ],
    outcomes: [
      { value: "60fps", label: "Replace with a real number" },
      { value: "0kb", label: "Replace with a real number" },
      { value: "0", label: "Replace with a real number" },
    ],
    draft: true,
  },
  {
    slug: "fifth-project",
    title: "Fifth project",
    role: "Performance",
    year: "2024",
    world: "lattice",
    summary: "A before and after number is worth a paragraph of adjectives.",
    chapters: [
      {
        heading: "The symptom",
        body: [
          "Write it the way the client described it, not the way a profiler describes it. 'It feels sticky on my phone' is the real brief.",
        ],
      },
      {
        heading: "The cause",
        body: [
          "What was actually wrong. Usually bundle weight, layout thrash, or main-thread work that belonged somewhere else.",
          "Say how you found it. The method is the transferable part.",
        ],
      },
      {
        heading: "The result",
        body: ["Before and after, with the conditions you measured under."],
      },
    ],
    stack: ["Web Vitals", "Profiling", "Node", "Lighthouse CI"],
    facts: [
      ["Client", "Add the client, or Personal"],
      ["Duration", "e.g. Two weeks"],
      ["Team", "Solo"],
      ["Scope", "Audit and remediation"],
    ],
    outcomes: [
      { value: "0.0s", label: "Replace with a real number" },
      { value: "-00%", label: "Replace with a real number" },
      { value: "00", label: "Replace with a real number" },
    ],
    draft: true,
  },
  {
    slug: "sixth-project",
    title: "Sixth project",
    role: "Full build",
    year: "2024",
    world: "orbit",
    summary: "Keep the oldest entry short. It is here for shape, not detail.",
    chapters: [
      {
        heading: "The short version",
        body: [
          "A paragraph is fine for older work. Say what it was, what you owned, and move on.",
        ],
      },
    ],
    stack: ["Next.js", "Postgres", "Node"],
    facts: [
      ["Client", "Add the client, or Personal"],
      ["Duration", "e.g. Two months"],
      ["Team", "e.g. Small"],
      ["Scope", "Full stack"],
    ],
    outcomes: [
      { value: "00", label: "Replace with a real number" },
      { value: "00%", label: "Replace with a real number" },
      { value: "0", label: "Replace with a real number" },
    ],
    draft: true,
  },
];

export function projectBySlug(slug: string) {
  return PROJECTS.find((p) => p.slug === slug);
}
