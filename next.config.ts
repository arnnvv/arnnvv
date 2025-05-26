import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: "incremental",
    reactCompiler: true,
    useCache: true,
  },
};

export default nextConfig;
