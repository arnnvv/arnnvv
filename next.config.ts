import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    dynamicIO: true,
    ppr: "incremental",
    reactCompiler: true,
  },
};

export default nextConfig;
