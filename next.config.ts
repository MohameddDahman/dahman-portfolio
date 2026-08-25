import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /* React's <ViewTransition> drives the page transitions. The browser
       composites them, so they cost no main-thread work — which is the
       only reason motion belongs on a site rebuilt for legibility. */
    viewTransition: true,
  },
};

export default nextConfig;
