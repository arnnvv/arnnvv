import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: {
    panicThreshold: "all_errors",
  },
  experimental: {
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
    turbopackMinify: true,
    turbopackRemoveUnusedExports: true,
    turbopackImportTypeBytes: true,
    optimizeCss: true,
    cssChunking: "strict",
    optimizePackageImports: [
      "@neondatabase/serverless",
      "@radix-ui/react-dropdown-menu",
      "@upstash/redis",
      "lucide-react",
      "next",
      "react",
      "react-dom",
      "sonner",
      "tailwind-merge",
    ],
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
