import type { WorldId } from "@/lib/worlds";

/**
 * ---------------------------------------------------------------------
 *  Projects.
 *
 *  `draft: true` puts a visible "Placeholder" marker on the rail row and
 *  the case-study page, so an entry that has not been written yet can
 *  never be mistaken for finished work on a live site. Flip it to false
 *  once the copy below describes what you actually did.
 *
 *  Jamora Vibes and Reem Store are real projects with placeholder copy:
 *  the names and slugs are right, everything narrative still needs your
 *  facts. Anything marked "TODO" is a prompt, not a claim.
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
  /* ------------------------------------------------------------------ *
   *  REAL PROJECTS — names confirmed, copy still to write.
   * ------------------------------------------------------------------ */
  {
    slug: "jamora-vibes",
    title: "Jamora Vibes",
    role: "Website", // TODO: your actual role, e.g. "Design & build"
    year: "2025", // TODO: confirm
    world: "tide",
    summary: "A website for Jamora Vibes.",
    chapters: [
      {
        heading: "The brief",
        body: [
          "TODO — who Jamora Vibes are, what they needed a site for, and what they had before this one.",
          "TODO — the constraint that shaped the build. A launch date, a budget, a brand kit you had to work inside, a client who needed to update it themselves.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "TODO — describe the site in the words a visitor would use, not the words the repo uses. Pages, key interactions, anything custom.",
          "TODO — the part that was genuinely hard, and the approach you picked over the obvious one.",
        ],
      },
      {
        heading: "Result",
        body: [
          "TODO — what changed. Traffic, enquiries, a load time, a task the client used to pay someone else to do. A number beats an adjective.",
        ],
      },
    ],
    // Empty until confirmed — the "Built with" block hides itself rather
    // than listing a stack I guessed at.
    stack: [], // TODO: real stack
    facts: [
      ["Client", "Jamora Vibes"],
      ["Type", "Website"],
      // Rows with an empty value are dropped, so these stay invisible
      // until they are filled in.
      ["Duration", ""],
      ["Team", ""],
      ["Scope", ""],
    ],
    outcomes: [
      { value: "—", label: "TODO — a real number" },
      { value: "—", label: "TODO — a real number" },
      { value: "—", label: "TODO — a real number" },
    ],
    // live: "https://…",   TODO — add the URL and this becomes a button
    draft: true,
  },
  {
    slug: "reem-store",
    title: "Reem Store",
    role: "Online store", // TODO: your actual role
    year: "2025", // TODO: confirm
    world: "lattice",
    summary: "An online storefront for Reem Store.",
    chapters: [
      {
        heading: "The brief",
        body: [
          "TODO — what Reem Store sells, who buys it, and how they were selling before.",
          "TODO — the constraint. Payments in a particular region, a catalogue size, stock that changes daily, a client updating products from a phone.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "TODO — the storefront itself: catalogue, product pages, cart, checkout, whatever you actually owned. Say where the product data lives and who edits it.",
          "TODO — the hard part. Commerce always has one — variants, stock sync, a payment provider, or making a long catalogue feel fast.",
        ],
      },
      {
        heading: "Result",
        body: [
          "TODO — orders, conversion, page speed, or the manual job it replaced.",
        ],
      },
    ],
    stack: [], // TODO: real stack
    facts: [
      ["Client", "Reem Store"],
      ["Type", "E-commerce storefront"],
      ["Duration", ""],
      ["Team", ""],
      ["Scope", ""],
    ],
    outcomes: [
      { value: "—", label: "TODO — a real number" },
      { value: "—", label: "TODO — a real number" },
      { value: "—", label: "TODO — a real number" },
    ],
    // live: "https://…",   TODO
    draft: true,
  },

  /* ------------------------------------------------------------------ *
   *  PLACEHOLDERS — delete these as real projects replace them. The rail
   *  wraps, so any count works; six or more keeps it feeling continuous.
   * ------------------------------------------------------------------ */
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
          "Say how you handled the parts systems usually get wrong — density, dark mode, focus order, and what happens when a label is three words longer in another language.",
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
    world: "orbit",
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
    world: "neon",
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
