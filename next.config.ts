import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: {
    panicThreshold: "all_errors",
  },
  experimental: {
    ppr: true,
    useCache: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
