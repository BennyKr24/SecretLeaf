// ────────────────────────────────────────────────────────────────────────────
// Admin API — route helpers
//
// Thin glue every `app/api/admin/<resource>/route.ts` handler is built on:
//   - `adminRoute()` — runs `requireAdmin`, resolves the actor, maps thrown
//     errors (zod → 400, AdminHttpError → its status, else → 500) to JSON.
//   - `parseQuery()` / `parseBody()` — zod-parse and throw on failure.
//   - `AdminHttpError` — deliberate, client-safe error with a status code.
//
// Replaces the old single `POST /api/admin/dashboard` switch with no
// validation (docs/ADMIN_PANEL_OVERHAUL_PLAN.md §2.2 / §5).
// ────────────────────────────────────────────────────────────────────────────

import { z } from "zod";
import { requireAdmin } from "@/lib/serverAuth";
import type { AuditActor } from "@/lib/admin/audit";
import { logError } from "@/lib/log";

export class AdminHttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "AdminHttpError";
    this.status = status;
  }
}

export type AdminRouteContext<P = Record<string, string>> = {
  actor: AuditActor;
  req: Request;
  url: URL;
  /** resolved dynamic route params ({} for non-dynamic routes) */
  params: P;
};

/** Next.js passes `{ params: Promise<...> }` as the 2nd handler arg for
 *  dynamic segments; non-dynamic routes get nothing. */
type NextRouteArg<P> = { params: Promise<P> } | undefined;

/**
 * Wrap an admin route handler. The handler returns a plain JS value that is
 * serialized as JSON (200), or throws — `AdminHttpError` for expected 4xx,
 * `ZodError` for a 400 with issues, anything else for a logged 500.
 */
export function adminRoute<T, P extends Record<string, string> = Record<string, string>>(
  handler: (ctx: AdminRouteContext<P>) => Promise<T>,
): (req: Request, next?: NextRouteArg<P>) => Promise<Response> {
  return async (req: Request, next?: NextRouteArg<P>): Promise<Response> => {
    const gate = await requireAdmin(req);
    if (gate instanceof Response) return gate;

    try {
      const url = new URL(req.url);
      const params = next ? await next.params : ({} as P);
      const data = await handler({ actor: { userId: gate.userId, email: gate.email }, req, url, params });
      return Response.json(data ?? { ok: true });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return Response.json({ error: "Ungültige Eingabe", issues: err.issues }, { status: 400 });
      }
      if (err instanceof AdminHttpError) {
        return Response.json({ error: err.message }, { status: err.status });
      }
      logError("admin.route.unhandled", {
        path: new URL(req.url).pathname,
        error: err instanceof Error ? err.message : String(err),
      });
      return Response.json({ error: "Interner Fehler" }, { status: 500 });
    }
  };
}

/** Parse URL search params against a schema. Throws `ZodError` on failure. */
export function parseQuery<S extends z.ZodTypeAny>(url: URL, schema: S): z.infer<S> {
  return schema.parse(Object.fromEntries(url.searchParams.entries()));
}

/** Parse a JSON request body against a schema. Throws `ZodError` on failure,
 *  `AdminHttpError(400)` if the body is not valid JSON. */
export async function parseBody<S extends z.ZodTypeAny>(req: Request, schema: S): Promise<z.infer<S>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new AdminHttpError(400, "Body ist kein gültiges JSON");
  }
  return schema.parse(raw);
}
