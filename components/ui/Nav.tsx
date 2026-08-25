"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ROUTES = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * A header that stays where you put it.
 *
 * Sticky, opaque, and it does not retract, invert, blend or slide. The
 * previous one composited with mix-blend-mode: difference over a live 3D
 * scene, which meant its legibility depended on whatever happened to be
 * rendering behind it. A solid bar with a rule under it is the whole
 * design here, and it is the right one.
 */
export default function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // One passive listener, one boolean. The bar gains a hairline once you
    // leave the top so it separates from the page — nothing more.
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={
        "sticky top-0 z-50 bg-paper transition-colors duration-200 " +
        (scrolled ? "border-b border-rule" : "border-b border-transparent")
      }
    >
      <div className="shell flex h-[72px] items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex items-baseline gap-3 focus-visible:outline-2"
        >
          {/* Never wraps. On a phone the surname carries it alone rather
              than folding into two lines against the links. */}
          <span className="whitespace-nowrap font-[family-name:var(--font-display)] text-[1.05rem] font-semibold tracking-tight text-ink">
            <span className="hidden sm:inline">Mohamed </span>Dahman
          </span>
          <span className="t-label hidden whitespace-nowrap text-ink-3 lg:inline">
            Frontend engineer
          </span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-1">
          {ROUTES.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              aria-current={isActive(r.href) ? "page" : undefined}
              className="relative flex min-h-[44px] items-center px-2.5 sm:px-4"
            >
              <span
                className={
                  "font-[family-name:var(--font-mono)] text-[0.8125rem] tracking-wide transition-colors duration-200 " +
                  (isActive(r.href)
                    ? "text-ink"
                    : "text-ink-2 hover:text-ink")
                }
              >
                {r.label}
              </span>
              {isActive(r.href) && (
                <span className="absolute inset-x-3 bottom-2 h-[2px] bg-ink sm:inset-x-4" />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
