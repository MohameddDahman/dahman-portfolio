"use client";
import { Monitor, Zap, Paintbrush, Globe } from "lucide-react";
import BorderGlow from "./BorderGlow";

const services = [
  { icon: Monitor, title: "Responsive UI/UX", description: "Crafting seamless experiences across all devices. I ensure your application looks and functions perfectly from ultra-wide monitors to the smallest mobile screens.", tag: "Mobile First Architecture" },
  { icon: Globe, title: "API Integration", description: "Connecting frontends to robust backends and third-party services. Experience with RESTful APIs, GraphQL, and real-time data synchronization.", tag: "Type-Safe Data Fetching" },
  { icon: Zap, title: "Performance Optimization", description: "Ensuring fast load times and smooth interactions using Next.js. I focus on Core Web Vitals, server-side rendering, and efficient asset delivery.", tag: "Lighthouse Score Focus" },
  { icon: Paintbrush, title: "Modern Styling", description: "Expert use of Tailwind CSS for clean, maintainable designs. Implementing design systems that are scalable, accessible, and visually stunning.", tag: "Utility-First Excellence" },
];

export default function Services() {
  return (
    <section className="px-6 md:px-20 py-24 bg-[#0e0e0e]">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">What I Can Do</h2>
      <p className="text-[#888] mb-12 text-[15px]">Specialized frontend engineering for modern digital products.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <BorderGlow key={service.title} backgroundColor="#1a1a1a" borderRadius={12} colors={["#c084fc", "#f472b6", "#38bdf8"]} glowColor="220 80 80" glowRadius={40} glowIntensity={1} edgeSensitivity={30} coneSpread={25}>
            <div className="p-6 md:p-8 flex flex-col h-full">
              <service.icon size={28} className="text-[#888] mb-5" />
              <h3 className="text-white font-bold text-xl mb-3">{service.title}</h3>
              <p className="text-[#666] text-[14px] leading-relaxed mb-8">{service.description}</p>
              <div className="flex items-center gap-2 mt-auto">
                <span className="w-8 h-px bg-[#444]" />
                <span className="text-[#555] text-[11px] tracking-widest uppercase">{service.tag}</span>
              </div>
            </div>
          </BorderGlow>
        ))}
      </div>
    </section>
  );
}