import type { Metadata } from "next";
import PageHead from "@/components/ui/PageHead";
import Rail from "@/components/ui/Rail";
import { PROJECTS } from "@/data/projects";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected frontend projects by Mohamed Dahman.",
};

export default function WorkPage() {
  return (
    <main>
      <PageHead
        index="01"
        eyebrow="Lattice · Scroll to fly"
        title="Things I have built"
        lede="Keep scrolling. The list runs on a rail — rows come toward you, turn, and pass. Each one opens into its own world."
        meta={[
          ["Entries", String(PROJECTS.length)],
          ["Range", "2024 — 2025"],
          ["Sort", "Newest first"],
        ]}
      />
      <div className="pt-[6vh]">
        <Rail />
      </div>
    </main>
  );
}
