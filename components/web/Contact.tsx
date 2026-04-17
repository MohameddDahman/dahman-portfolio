export default function Contact() {
  return (
    <section className="bg-black min-h-[70vh] flex flex-col items-center justify-center px-6 md:px-20 py-24 text-center">
      <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tight mb-6">
        Let&apos;s Talk.
      </h2>

      <p className="text-[#666] text-[15px] leading-relaxed max-w-sm mb-16">
        Available for freelance opportunities and innovative engineering teams.
        Let&apos;s build the next iteration of the web.
      </p>

      <div className="flex items-center justify-center border-b border-[#333] pb-4">
        {/* Fixed the anchor tag below */}
        <a 
          href="mailto:medodahman454@gmail.com"
          className="text-white font-bold text-sm md:text-xl tracking-tight hover:text-[#888] transition-colors break-all"
        >
          medodahman454@gmail.com
        </a>
      </div>
    </section>
  );
}