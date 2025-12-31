import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

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

export default withSentryConfig(nextConfig, {
  // Sentry organization and project
  org: "next-level-foundry",
  project: "outvestments",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: "/monitoring",

  // Upload a larger set of source maps for prettier stack traces
  widenClientFileUpload: true,

  // Webpack-specific options (new API)
  webpack: {
    // Automatically annotate React components for better debugging
    reactComponentAnnotation: {
      enabled: true,
    },
    // Tree-shake Sentry logger statements to reduce bundle size
    treeshake: {
      removeDebugLogging: true,
    },
  },

  // Source map configuration
  sourcemaps: {
    // Don't include source maps in client bundles
    deleteSourcemapsAfterUpload: true,
  },
});
