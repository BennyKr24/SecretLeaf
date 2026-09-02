import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { getFeatureFlag } from "./lib/featureFlags";

const intlProxy = createMiddleware(routing);

// Paths that stay reachable during maintenance_mode (locale prefix stripped
// before matching): the admin panel itself (to turn maintenance back off)
// and the login page (so an admin can sign in in the first place).
const MAINTENANCE_BYPASS = ["/dashboard/admin", "/auth"];

function isMaintenanceBypass(pathname: string): boolean {
  const path = pathname.replace(/^\/(de|en)(?=\/|$)/, "") || "/";
  return MAINTENANCE_BYPASS.some((p) => path === p || path.startsWith(`${p}/`));
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

function maintenanceResponse(pathname: string, message: string): Response {
  const locale = pathname.startsWith("/en") ? "en" : "de";
  const copy =
    locale === "en"
      ? { title: "Under maintenance", fallback: "We'll be back shortly." }
      : { title: "Wartungsarbeiten", fallback: "Wir sind gleich wieder da." };

  const html = `<!doctype html>
<html lang="${locale}"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${copy.title} — SecretLeaf</title>
<style>
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
    background:#0b1410; color:#e8f0ea; font-family:system-ui,-apple-system,sans-serif; padding:24px; }
  main { max-width:32rem; text-align:center; }
  h1 { font-size:1.5rem; margin:0 0 12px; }
  p { color:#9fb3a8; line-height:1.6; margin:0; }
</style></head>
<body><main><h1>${copy.title}</h1><p>${escapeHtml(message) || copy.fallback}</p></main></body></html>`;

  return new Response(html, {
    status: 503,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "retry-after": "1800",
      "cache-control": "no-store",
    },
  });
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isMaintenanceBypass(pathname)) {
    const flag = await getFeatureFlag("maintenance_mode");
    if (flag.enabled) return maintenanceResponse(pathname, flag.description);
  }
  return intlProxy(request);
}

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
