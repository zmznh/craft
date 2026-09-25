import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // The default 1MB cap silently fails document saves: the whole TipTap JSON
      // goes through one action, and a long note clears it easily.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
