import TerminalHero from "./TerminalHero";

export default function Identity() {
  return (
    <section className=" overflow-hidden px-6 md:px-20 min-h-[90vh] bg-[#101010] flex flex-col md:flex-row justify-center md:justify-between items-center gap-12 py-16 md:py-0">
      <div className="w-full md:w-96">
        <span className="mb-7 inline-block border border-[#333] text-[#888] text-[11px] tracking-widest uppercase px-3 py-1 rounded-full">
          Identity
        </span>
        <h1 className="text-4xl md:text-6xl font-heading text-white font-bold">
          Beyond the <br />
          <span className="text-[#888888]">pixels.</span>
        </h1>
        <p className="mt-7 text-[#888] text-[15px] leading-relaxed">
          I am Mohamed Dahman, a Frontend Developer obsessed with the
          architecture of simplicity. My approach is centered on creating
          high-performance digital experiences that feel as premium as they look.
        </p>
        <p className="mt-7 text-[#888] text-[15px] leading-relaxed">
          With a deep specialization in the Next.js ecosystem, I bridge the gap
          between complex backend logic and seamless, intuitive user interfaces.
        </p>
      </div>
      <div className="w-full md:w-auto">
        <TerminalHero />
      </div>
    </section>
  );
}