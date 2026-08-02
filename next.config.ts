import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lint/typecheck ficam no CI — encurta o build na Vercel
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
