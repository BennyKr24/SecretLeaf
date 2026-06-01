import createNextIntlPlugin from "next-intl/plugin";

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

export default withNextIntl(nextConfig);
