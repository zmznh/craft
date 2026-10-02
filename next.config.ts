import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits `.next/standalone` so the server ships without a full node_modules
  // tree — the target box has ~5.8 GB free and cannot afford one.
  output: "standalone",
  experimental: {
    serverActions: {
      // The default 1MB cap silently fails document saves: the whole TipTap JSON
      // goes through one action, and a long note clears it easily.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
