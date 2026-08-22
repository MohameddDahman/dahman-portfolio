import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { ConvexClientProvider } from "@/components/ui/ConvexClientProvider";
import Scroll from "@/components/motion/Scroll";
import Cursor from "@/components/motion/Cursor";
import Warp from "@/components/motion/Warp";
import Stage from "@/components/gl/Stage";
import Hud from "@/components/ui/Hud";
import Preloader from "@/components/ui/Preloader";
import Footer from "@/components/ui/Footer";

/**
 * One grotesk does both display and body. Archivo carries a width axis
 * (62–125), which the scroll runtime narrows a little as you read down a
 * page; requesting the variable axis here is what makes that possible.
 *
 * Everything structural is set uppercase at weight 400 with positive
 * tracking — the hierarchy on this site comes from size and opacity, not
 * from weight.
 */
const display = Archivo({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["wdth"],
  display: "swap",
});

const body = Archivo({
  subsets: ["latin"],
  variable: "--font-body",
  axes: ["wdth"],
  display: "swap",
});

/** Carries every label, number and readout. */
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  // Set NEXT_PUBLIC_SITE_URL in the deployment environment so canonical
  // and Open Graph URLs resolve absolutely. localhost is a dev fallback.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Mohamed Dahman — Frontend engineer",
    template: "%s — Mohamed Dahman",
  },
  description:
    "Frontend engineer building interfaces that hold their frame under real data and real motion. Next.js, TypeScript, WebGL.",
  openGraph: {
    title: "Mohamed Dahman — Frontend engineer",
    description:
      "Seven worlds, one portfolio. Frontend engineering, interface systems, motion and WebGL.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b10",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="bg-void text-white antialiased">
        <Scroll />
        <Cursor />

        {/* One WebGL context for the whole site. It lives outside the warp
            curtain, so the world swaps behind the cover and is never seen
            being torn down. */}
        <Stage />
        <div aria-hidden className="vignette fixed inset-0 z-[1]" />

        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[400] focus: focus:border focus:border-white focus:bg-void focus:px-5 focus:py-2.5 focus:text-sm"
        >
          Skip to content
        </a>

        <ConvexClientProvider>
          <Hud />

          <div id="content" className="relative z-10">
            {children}
          </div>

          <Footer />
        </ConvexClientProvider>

        {/* Above everything: the curtain that carries you between worlds. */}
        <Warp />

        {/* And above that, on first load only, the gate. */}
        <Preloader />
      </body>
    </html>
  );
}
