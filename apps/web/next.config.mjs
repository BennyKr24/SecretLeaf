import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isDev = process.env.NODE_ENV !== "production";

// Supabase talks to 127.0.0.1 locally (via `supabase start`) and to
// *.supabase.co in production — both need to be allowed so this one CSP
// works in both environments without an env-specific build step.
const connectSrc = [
  "'self'",
  "https://*.supabase.co",
  "https://plausible.io",
  isDev ? "http://127.0.0.1:*" : "",
].filter(Boolean).join(" ");

// Sentry client traffic is tunneled through our own /monitoring route
// (see tunnelRoute below) specifically so it's same-origin — no sentry.io
// entry needed here. Vercel Analytics/Speed Insights are also same-origin
// when deployed on Vercel (served/proxied under /_vercel/*).
//
// 'unsafe-eval' is dev-only: React's dev-mode HMR/stack-trace tooling
// calls eval(), production React never does — verified live (dropping
// this in dev throws "eval() is not supported... make sure unsafe-eval
// is included" from React itself; without it here the whole app was
// unusable in `next dev`).
const scriptSrc = ["'self'", "'unsafe-inline'", "https://plausible.io", isDev ? "'unsafe-eval'" : ""]
  .filter(Boolean)
  .join(" ");

const csp = [
  "default-src 'self'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src ${connectSrc}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // typedRoutes disabled: incompatible with next-intl [locale] routing
  // (all routes become /${string}/path which breaks href string literals)
  typedRoutes: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
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
