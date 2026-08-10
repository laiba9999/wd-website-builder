import type { NextConfig } from "next";

const config: NextConfig = {
  // Images are already compressed client-side before upload, so we skip
  // Next's image optimiser entirely. On Vercel Hobby that optimiser has its
  // own metered quota — avoiding it keeps this project at £0.
  images: { unoptimized: true },
};

export default config;
