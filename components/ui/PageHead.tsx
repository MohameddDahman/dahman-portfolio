import { Reveal } from "@/components/motion/Reveal";

/**
 * The masthead every page opens with. An eyebrow, a heading, and at most
 * one paragraph — set at the reading measure so the first thing a visitor
 * meets is something they can actually read.
 */
export default function PageHead({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="shell pb-14 pt-20 md:pb-20 md:pt-28">
      <Reveal>
        <p className="t-label">{eyebrow}</p>
        <h1 className="t-hero measure-wide mt-5">{title}</h1>
        {lead && <p className="t-lead measure mt-7">{lead}</p>}
        {children}
      </Reveal>
    </header>
  );
}
