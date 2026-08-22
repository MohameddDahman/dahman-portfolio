import { SplitReveal } from "@/components/motion/Reveal";

/**
 * The masthead every page opens with.
 *
 * Reveals run `immediate`: after a warp the heading is already in frame,
 * so waiting for a scroll trigger would leave it invisible on arrival.
 */
export default function PageHead({
  index,
  eyebrow,
  title,
  lede,
  meta,
  children,
}: {
  index: string;
  eyebrow: string;
  title: React.ReactNode;
  lede?: string;
  meta?: [string, string][];
  children?: React.ReactNode;
}) {
  return (
    <header className="shell pt-[24vh] md:pt-[27vh]">
      <div className="flex items-center gap-3">
        <span
          className="t-mono text-[10px] tracking-[0.25em]"
          style={{ color: "var(--accent)" }}
        >
          {index}
        </span>
        <span className="h-3 w-px bg-w08" />
        <span className="t-label">{eyebrow}</span>
      </div>

      <SplitReveal
        as="h1"
        className="t-display t-display-xl mt-7 max-w-[20ch]"
        immediate
        stagger={0.085}
      >
        {title}
      </SplitReveal>

      <div className="rule mt-10" />

      {(lede || meta) && (
        <div className="grid gap-10 py-8 md:grid-cols-[1.3fr_1fr]">
          {lede && (
            <SplitReveal
              as="p"
              className="t-body max-w-[54ch] text-[clamp(0.98rem,1.3vw,1.12rem)]"
              stagger={0.045}
              delay={0.12}
              immediate
            >
              {lede}
            </SplitReveal>
          )}

          {meta && (
            <dl className="grid h-fit gap-y-2 self-start md:min-w-[19rem] md:justify-self-end">
              {meta.map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between gap-8 border-b border-w08 pb-2"
                >
                  <dt className="t-label">{k}</dt>
                  <dd className="t-mono text-[11px] text-w60">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}

      {children}
    </header>
  );
}
