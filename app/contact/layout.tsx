import type { Metadata } from "next";

/**
 * The contact page owns form state, so it is a client component and cannot
 * export metadata itself. This layout supplies it.
 */
export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a project with Mohamed Dahman — frontend engineering, interface systems, motion and WebGL.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
