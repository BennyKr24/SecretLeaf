import { getAuthenticatedUserWithRole } from "@/lib/serverAuth";
import { logError, logWarn } from "@/lib/log";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { z } from "zod";

export const dynamic = "force-dynamic";

const STUDIES_TABLE = "studies";

type StudyRow = {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  tags: string[] | null;
  quality_status: "good" | "pending" | "bad";
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_note: string | null;
  created_at: string | null;
};

const updateStudySchema = z.object({
  qualityStatus: z.enum(["good", "pending", "bad"]).optional(),
  tags: z.array(z.string().trim().min(1).max(100)).max(40).optional(),
  reviewNote: z.string().trim().max(1500).optional(),
});

function normalizeTags(tags: string[] | undefined): string[] {
  return Array.from(new Set((tags ?? []).map((tag) => tag.trim()).filter(Boolean)));
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthenticatedUserWithRole(request);
    if (!authUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (authUser.role !== "PROVIDER") {
      logWarn("api.studies.update.forbidden", { userId: authUser.userId, role: authUser.role });
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const payloadRaw = await request.json();
    const parsed = updateStudySchema.safeParse(payloadRaw);
    if (!parsed.success) {
      logWarn("api.studies.update.invalid-input", { userId: authUser.userId });
      return Response.json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const payload = parsed.data;

    if (!id || id.length < 6) {
      return Response.json({ error: "Invalid study id" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const updateData: {
      tags?: string[];
      quality_status?: "good" | "pending" | "bad";
      reviewed_by?: string | null;
      reviewed_at?: string | null;
      review_note?: string | null;
    } = {};

    if (payload.tags) {
      updateData.tags = normalizeTags(payload.tags);
    }

    if (payload.qualityStatus) {
      updateData.quality_status = payload.qualityStatus;
      updateData.reviewed_by = authUser.userId;
      updateData.reviewed_at = new Date().toISOString();
      updateData.review_note = payload.reviewNote?.trim() || null;
    }

    const { data, error } = await supabase
      .from(STUDIES_TABLE)
      .update(updateData)
      .eq("id", id)
      .select("id, title, description, source, tags, quality_status, reviewed_at, reviewed_by, review_note, created_at")
      .single();

    if (error) {
      logError("api.studies.update.failed", { error: error.message, userId: authUser.userId, studyId: id });
      return Response.json({ error: error.message }, { status: 500 });
    }

    const study = data as StudyRow;

    return Response.json({
      study: {
        id: study.id,
        title: study.title,
        description: study.description,
        source: study.source,
        tags: study.tags ?? [],
        qualityStatus: study.quality_status,
        reviewedAt: study.reviewed_at,
        reviewedBy: study.reviewed_by,
        reviewNote: study.review_note,
        createdAt: study.created_at,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update study";
    logError("api.studies.update.exception", { message });
    return Response.json({ error: message }, { status: 500 });
  }
}
