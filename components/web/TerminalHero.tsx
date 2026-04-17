export default function TerminalHero() {
  const stack = [
    ["Next.js / React", "TypeScript"],
    ["Tailwind CSS", "Framer Motion"],
    ["Node.js", "PostgreSQL"],
  ];

  return (
    <div className="w-full md:w-[480px] rounded-xl overflow-hidden bg-[#1a1a1a] font-mono text-[13px] shadow-2xl">
      <div className="bg-[#2d2d2d] px-4 py-2.5 flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="flex-1 text-center text-[11px] text-[#666]">bash — 80×24</span>
      </div>
      <div className="p-6 pb-8 space-y-5 text-[#bbb] leading-relaxed">
        <div className="space-y-1">
          <p className="text-[#666]">~ <span className="text-[#e2e2e2] font-bold">whoami</span></p>
          <p className="pl-1"><span className="text-white">Dahman.</span> Modern UI Architect & Creative Coder.</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-[#666]">~ <span className="text-[#e2e2e2] font-bold">stack --list</span></p>
          <div className="pl-1 grid grid-cols-2 gap-y-1">
            {stack.map(([left, right], i) => (
              <div key={i} className="contents text-[#bbb]">
                <span><span className="text-[#555] mr-2">•</span>{left}</span>
                <span><span className="text-[#555] mr-2">•</span>{right}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-[#666] flex items-center gap-2">
          <span>~</span>
          <span className="inline-block w-[9px] h-[15px] bg-[#aaa] animate-[blink_1.1s_step-end_infinite]" />
        </div>
      </div>
    </div>
  );
}