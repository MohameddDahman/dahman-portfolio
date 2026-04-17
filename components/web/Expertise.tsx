"use client";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import * as LucideIcons from "lucide-react";
import * as Fa from "react-icons/fa";
import * as Si from "react-icons/si";

type LucideIconName = keyof typeof LucideIcons;

function DynamicIcon({ name }: { name: string | undefined }) {
  if (!name) return null;
  if (name.startsWith("devicon-")) return <i className={`${name} text-2xl`} />;
  const LucideIcon = LucideIcons[name as LucideIconName] as LucideIcons.LucideIcon;
  if (LucideIcon) return <LucideIcon size={24} />;
  const SiIcon = (Si as Record<string, React.ComponentType<{ size?: number }>>)[name];
  if (SiIcon) return <SiIcon size={24} />;
  const FaIcon = (Fa as Record<string, React.ComponentType<{ size?: number }>>)[name];
  if (FaIcon) return <FaIcon size={24} />;
  return null;
}

export default function Expertise() {
  const skills = useQuery(api.skills.getSkills);
  const subSkills = useQuery(api.subSkills.getSubSkills);

  return (
    <section className="px-6 md:px-20 min-h-[90vh] gap-12 flex flex-col justify-center py-16 md:py-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <p className="underline mb-2">CAPABILITY</p>
          <h1 className="text-3xl md:text-4xl font-bold font-body">Toolkit & Expertise</h1>
        </div>
        <div className="inline-flex items-center gap-2 border border-[#333] text-[#888] text-[11px] tracking-widest uppercase px-4 py-1.5 rounded-full w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          Frontend-Focused · Next.js App Router
        </div>
      </div>

      <div>
        <p className="mb-7">CORE MASTERY</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-1">
  {skills?.map((skill) => (
    <div
      key={skill._id}
      className="flex flex-col items-center justify-center gap-4 py-8 bg-[#161616] rounded-[3px]"
    >
      <DynamicIcon name={skill.icon} />
      <p className="text-sm uppercase tracking-widest">{skill.title}</p>
    </div>
  ))}
</div>
      </div>

      <div>
        <p className="mb-7">Familiar Territories</p>
        <div className="flex flex-wrap gap-1">
          {subSkills?.map((skill) => (
            <div key={skill._id} className="pl-4 pr-6 py-5 rounded-[3px] flex gap-3 bg-[#161616]">
              <DynamicIcon name={skill.icon} />
              <p className="text-sm">{skill.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}