import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import { Archivo, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { ConvexClientProvider } from "@/components/ui/ConvexClientProvider";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";

/**
 * Sans display over serif body — a deliberate inversion of the usual
 * pairing. A serif at 18px on white is simply the most readable thing to
 * put under a paragraph, and readability is the entire brief here.
 */
const display = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  axes: ["wdth"],
  display: "swap",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  axes: ["opsz"],
  display: "swap",
});

/** Labels, figures and data only. */
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Mohamed Dahman — Frontend engineer",
    template: "%s — Mohamed Dahman",
  },
  description:
    "Frontend engineer building interfaces that hold up under real content. Next.js, TypeScript, and the unglamorous half of the job.",
  openGraph: {
    title: "Mohamed Dahman — Frontend engineer",
    description:
      "Frontend engineer building interfaces that hold up under real content.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${serif.variable} ${mono.variable}`}
    >
      <body className="bg-paper text-ink antialiased">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:border focus:border-ink focus:bg-paper focus:px-4 focus:py-3 focus:text-base"
        >
          Skip to content
        </a>

        <Nav />

        <ConvexClientProvider>
          {/* This wrapper is what starts a view transition on navigation
              and forwards the type from the Link — measured: without it
              document.startViewTransition is never called at all.

              It carries no enter/exit classes on purpose: <main> stays
              mounted across a navigation, so React sees an update rather
              than an enter/exit and never applies them. The animation is
              driven from CSS off the root group and the active transition
              type instead — see globals.css. */}
          <ViewTransition>
            <main id="content">{children}</main>
          </ViewTransition>
          <Footer />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
