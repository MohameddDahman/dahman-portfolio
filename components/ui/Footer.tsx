"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { WORLD_LIST } from "@/lib/worlds";

const EMAIL = "medodahman454@gmail.com";

/** Closing plate. Doubles as a map of the seven worlds. */
export default function Footer() {
  const clock = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const paint = () => {
      if (clock.current) clock.current.textContent = fmt.format(new Date());
    };
    paint();
    const id = window.setInterval(paint, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <footer className="relative z-10 mt-[10vh] pb-24 md:pb-16">
      <div className="shell">
        <div className="rule" />

        <div className="grid gap-12 py-14 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="t-display max-w-[14ch] text-[clamp(1.4rem,2.6vw,2rem)]">
              Available for new work
            </p>
            <a
              href={"mailto:" + EMAIL}
              data-cursor="Write"
              className="group mt-6 inline-flex items-center gap-2"
            >
              <span className="t-mono text-[12px] text-white">{EMAIL}</span>
              <span
                className="block h-px w-0 transition-all duration-500 group-hover:w-6"
                style={{ background: "var(--accent)" }}
              />
            </a>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-2.5">
            <span className="t-label mb-1">Pages</span>
            {[
              ["Home", "/"],
              ["Work", "/work"],
              ["Lab", "/lab"],
              ["About", "/about"],
              ["Contact", "/contact"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                data-cursor={label}
                className="t-mono w-fit text-[11px] text-w40 transition-colors duration-400 hover:text-white"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2.5">
            <span className="t-label mb-1">Elsewhere</span>
            {[
              ["GitHub", "https://github.com"],
              ["LinkedIn", "https://linkedin.com"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                data-cursor={label}
                className="t-mono w-fit text-[11px] text-w40 transition-colors duration-400 hover:text-white"
              >
                {label} ↗
              </a>
            ))}
          </div>
        </div>

        {/* The seven worlds, as a legend. */}
        <div className="rule" />
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 py-6">
          <span className="t-label">Worlds</span>
          {WORLD_LIST.map((w) => (
            <span key={w.id} className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5"
                style={{ background: w.accent }}
              />
              <span className="t-label">{w.name}</span>
            </span>
          ))}
        </div>

        <div className="rule" />
        <div className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="t-label">
            Mohamed Dahman — {new Date().getFullYear()}
          </span>
          <span className="t-label">
            Local <span ref={clock}>--:--:--</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
