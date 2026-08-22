import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Navigation is staged by hand (see components/motion/Warp.tsx) rather
     than by the browser's view-transition API — the curtain needs to know
     the destination world in order to paint itself in its colour, which a
     crossfade cannot express. */
};

export default nextConfig;
