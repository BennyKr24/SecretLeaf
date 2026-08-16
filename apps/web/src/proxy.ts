import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for API routes, static files, etc.
  // "icon"/"apple-icon"/"icons" excluded too: those are root-level
  // generated assets (app/icon.tsx, app/apple-icon.tsx,
  // app/icons/[size]/route.tsx), not locale routes — without this
  // exclusion this middleware 307-redirects them to /de/icon etc., which
  // 404s and silently breaks the favicon/apple-touch-icon/manifest icons.
  matcher: [
    "/",
    "/(de|en)/:path*",
    "/((?!api|_next|_vercel|icon|apple-icon|icons|.*\\..*).*)",
  ],
};
