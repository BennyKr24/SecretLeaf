import { getCronSecret } from "@/lib/env";
import { logError, logInfo, logWarn } from "@/lib/log";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

const DEFAULT_MAX_AGE_HOURS = 24;
const MAX_USER_SCAN_PAGES = 20;
const USERS_PER_PAGE = 200;

function shouldDeleteSmokeUser(email: string | null | undefined, createdAt: string | null | undefined, olderThanIso: string): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized.startsWith("smoke.") || !normalized.endsWith("@example.com")) {
    return false;
  }

  if (!createdAt) return true;
  return createdAt < olderThanIso;
}

export async function GET(req: Request) {
  let configuredSecret: string;
  try {
    configuredSecret = getCronSecret();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Missing CRON secret";
    logError("automation.cleanup.misconfigured", { message });
    return Response.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  const headerSecret = req.headers.get("x-cron-key");
  if (headerSecret !== configuredSecret) {
    logWarn("automation.cleanup.unauthorized");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const maxAgeRaw = Number.parseInt(process.env.SMOKE_USER_MAX_AGE_HOURS ?? String(DEFAULT_MAX_AGE_HOURS), 10);
  const maxAgeHours = Number.isFinite(maxAgeRaw) && maxAgeRaw > 0 ? Math.min(maxAgeRaw, 24 * 30) : DEFAULT_MAX_AGE_HOURS;
  const olderThanIso = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).toISOString();

  try {
    const supabase = getSupabaseServerClient();

    let scannedUsers = 0;
    let deletedUsers = 0;

    for (let page = 1; page <= MAX_USER_SCAN_PAGES; page += 1) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: USERS_PER_PAGE });
      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }

      const users = data?.users ?? [];
      if (users.length === 0) {
        break;
      }

      scannedUsers += users.length;

      for (const user of users) {
        if (!shouldDeleteSmokeUser(user.email, user.created_at ?? null, olderThanIso)) {
          continue;
        }

        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (!deleteError) {
          deletedUsers += 1;
        }
      }
    }

    const { error: deleteStudyError, count: deletedStudies } = await supabase
      .from("studies")
      .delete({ count: "exact" })
      .or("source.eq.smoke-test,title.ilike.Smoke Study%")
      .lt("created_at", olderThanIso);

    if (deleteStudyError) {
      return Response.json({ error: deleteStudyError.message }, { status: 500 });
    }

    logInfo("automation.cleanup.success", {
      scannedUsers,
      deletedUsers,
      deletedStudies: deletedStudies ?? 0,
      maxAgeHours,
    });

    return Response.json({
      ok: true,
      scannedUsers,
      deletedUsers,
      deletedStudies: deletedStudies ?? 0,
      maxAgeHours,
      olderThan: olderThanIso,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cleanup failed";
    logError("automation.cleanup.exception", { message });
    return Response.json({ error: message }, { status: 500 });
  }
}
