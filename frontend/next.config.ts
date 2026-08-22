import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // 🚀 Yeh line multiple lockfiles ke conflict ko fix karegi
  outputFileTracingRoot: path.join(__dirname, "../"),
};

export default nextConfig;