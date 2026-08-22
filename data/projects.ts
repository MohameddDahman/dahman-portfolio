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
 *  Jamora Vibes and Reem Store are real, shipped projects. Their copy was
 *  written from the live sites, so everything in it is verifiable —
 *  what the store sells, how it is built, what is unusual about it.
 *  Deliberately absent: why the client wanted it, how long it took, and
 *  any results. I could not know those. Add them and the entries get
 *  stronger; the outcomes strip stays hidden until `outcomes` has
 *  something in it.
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
    role: "Online store",
    year: "2025", // TODO: confirm
    world: "tide",
    summary:
      "An instrument shop where every listing has a recording of that exact instrument.",
    chapters: [
      {
        heading: "What it is",
        body: [
          "Jamora Vibes sells instruments across six families — acoustic guitars, pianos, violins, brass, drums and accessories — to customers across Egypt, with cash on delivery and order tracking.",
          "The positioning is in the tagline: instruments worth hearing before you buy. Everything on the site is arranged around that promise rather than around a generic product grid.",
        ],
      },
      {
        heading: "Hear it before it ships",
        body: [
          "The feature the whole storefront is built around: a brass play button on a listing means that specific instrument has been recorded, so you can hear the one you are actually buying rather than a stock sample of the model.",
          "That is an unusual thing to put in a catalogue. It turns every product card into a small media player, which changes how the grid has to behave — audio is real HTML audio, and playback has to be handled deliberately once more than one listing can make a sound.",
        ],
      },
      {
        heading: "Build",
        body: [
          "Next.js, with every product image going through next/image. Tailwind with a custom theme rather than stock utilities, and Archivo, Inter and JetBrains Mono loaded through next/font.",
        ],
      },
    ],
    stack: ["Next.js", "Tailwind CSS", "next/image", "HTML audio"],
    facts: [
      ["Client", "Jamora Vibes"],
      ["Type", "Online store"],
      ["Catalogue", "Six instrument families"],
      ["Region", "Egypt"],
      // TODO: add duration, team and scope — I could not know these.
      ["Duration", ""],
      ["Team", ""],
    ],
    // TODO: add real numbers when you have them; the strip stays hidden
    // until this array has something in it.
    outcomes: [],
    live: "https://jamora-vibes.vercel.app/",
    draft: false,
  },
  {
    slug: "reem-store",
    title: "Reem Store",
    role: "E-commerce storefront",
    year: "2025", // TODO: confirm
    world: "lattice",
    summary:
      "A bilingual Egyptian care storefront — English and Arabic, with the whole layout mirrored.",
    chapters: [
      {
        heading: "What it is",
        body: [
          "Reem sells everyday personal care across nine departments — skin, hair, makeup, mother and baby, adult care, daily personal care, oral, men's and feminine care — delivered across Egypt in two to four days.",
          "The commerce model is regional and shapes the interface: cash on delivery, seven-day returns, and free delivery over a threshold. Those are not badges bolted on at the end; they are the reasons people trust the checkout, so they sit at the top of every page.",
        ],
      },
      {
        heading: "Two languages, two directions",
        body: [
          "The store runs at /en and /ar. The Arabic build is not a swapped dictionary — it serves lang=\"ar\" with dir=\"rtl\", so the entire layout mirrors, and the copy is written for Arabic rather than translated word for word.",
          "Full RTL is the part of internationalisation that actually costs something. Every asymmetric margin, every icon that points somewhere, every carousel direction and every grid that reads left to right has to have an answer in both directions.",
        ],
      },
      {
        heading: "The storefront",
        body: [
          "Department navigation, category routes, search, a deals rail with a live countdown, discount badges, rating counts, add to cart and order tracking.",
          "Roughly a hundred and thirty product images on the landing page alone, every one of them served through next/image — which is the difference between a catalogue this dense loading well and it not.",
        ],
      },
    ],
    stack: ["Next.js", "i18n routing", "RTL", "next/image"],
    facts: [
      ["Client", "Reem"],
      ["Type", "E-commerce storefront"],
      ["Languages", "English + Arabic (RTL)"],
      ["Region", "Egypt"],
      ["Duration", ""],
      ["Team", ""],
    ],
    outcomes: [],
    live: "https://reemstore.vercel.app/en",
    draft: false,
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
