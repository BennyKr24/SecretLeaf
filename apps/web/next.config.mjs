import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // typedRoutes disabled: incompatible with next-intl [locale] routing
  // (all routes become /${string}/path which breaks href string literals)
  typedRoutes: false,
};

export default withSentryConfig(withNextIntl(nextConfig), {
  org: "secretleaf",
  project: "javascript-nextjs",
  // Upload source maps only in CI
  silent: !process.env.CI,
  // Route Sentry requests through Next.js to avoid ad-blockers
  // Note: /monitoring must not match existing middleware routes
  tunnelRoute: "/monitoring",
  widenClientFileUpload: true,
  // Disable Sentry telemetry
  telemetry: false,
});
