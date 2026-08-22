import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true, // 🚀 Yeh sub-routes ke 404 (Not Found) error ko fix kar dega!
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;