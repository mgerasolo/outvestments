import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker builds
  output: "standalone",

  // External packages needed at runtime (not bundled by Webpack)
  serverExternalPackages: ["postgres"],

  // Allow external images from Finnhub for stock logos
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static2.finnhub.io",
        pathname: "/file/publicdatany/finnhubimage/**",
      },
      {
        protocol: "https",
        hostname: "static.finnhub.io",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
