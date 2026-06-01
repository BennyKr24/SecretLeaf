import type { StudyRecord } from "@/lib/types";
import { logError, logWarn } from "@/lib/log";
import { getAuthenticatedUserWithRole } from "@/lib/serverAuth";
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

const createStudySchema = z.object({
  title: z.string().trim().min(1).max(500),
  description: z.string().trim().max(4000).optional(),
  source: z.string().trim().max(1000).optional(),
  tags: z.array(z.string().trim().min(1).max(100)).max(40).optional(),
});

const listStudiesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  quality: z.enum(["good", "pending", "bad"]).optional(),
  tag: z.string().trim().min(1).max(100).optional(),
  q: z.string().trim().max(200).optional(),
});

function mapRowToRecord(row: StudyRow): StudyRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    source: row.source,
    tags: row.tags ?? [],
    qualityStatus: row.quality_status,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    reviewNote: row.review_note,
    createdAt: row.created_at,
  };
}

export async function GET(request: Request) {
  try {
    const authUser = await getAuthenticatedUserWithRole(request);
    if (!authUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const parsedQuery = listStudiesQuerySchema.safeParse({
      page: url.searchParams.get("page") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
      quality: url.searchParams.get("quality") ?? undefined,
      tag: url.searchParams.get("tag") ?? undefined,
      q: url.searchParams.get("q") ?? undefined,
    });

    if (!parsedQuery.success) {
      return Response.json({ error: "Invalid query", details: parsedQuery.error.flatten().fieldErrors }, { status: 400 });
    }

    const query = parsedQuery.data;
    const offset = (query.page - 1) * query.limit;
    const rangeStart = offset;
    const rangeEnd = offset + query.limit - 1;

    const supabase = getSupabaseServerClient();
    let selectQuery = supabase
      .from(STUDIES_TABLE)
      .select("id, title, description, source, tags, quality_status, reviewed_at, reviewed_by, review_note, created_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(rangeStart, rangeEnd);

    if (query.quality) {
      selectQuery = selectQuery.eq("quality_status", query.quality);
    }

    if (query.tag) {
      selectQuery = selectQuery.contains("tags", [query.tag.toLowerCase()]);
    }

    if (query.q) {
      const escaped = query.q.replace(/[%_]/g, "");
      if (escaped.length > 0) {
        selectQuery = selectQuery.or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%,source.ilike.%${escaped}%`);
      }
    }

    const { data, error, count } = await selectQuery;

    if (error) {
      logError("api.studies.list.failed", { error: error.message, userId: authUser.userId });
      return Response.json({ error: error.message }, { status: 500 });
    }

    const studies = (data ?? []).map((row) => mapRowToRecord(row as StudyRow));
    const total = count ?? studies.length;
    const totalPages = Math.max(1, Math.ceil(total / query.limit));

    return Response.json(
      {
        studies,
        total,
        pagination: {
          page: query.page,
          limit: query.limit,
          totalPages,
          hasNext: query.page < totalPages,
        },
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load studies";
    logError("api.studies.list.exception", { message });
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthenticatedUserWithRole(request);
    if (!authUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payloadRaw = await request.json();
    const parsed = createStudySchema.safeParse(payloadRaw);
    if (!parsed.success) {
      logWarn("api.studies.create.invalid-input", { userId: authUser.userId });
      return Response.json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const payload = parsed.data;

    const input = {
      title: payload.title,
      description: payload.description?.trim() || null,
      source: payload.source?.trim() || null,
      tags: (payload.tags ?? []).map((tag) => tag.trim()).filter(Boolean),
      quality_status: "pending" as const,
      reviewed_by: null,
      reviewed_at: null,
      review_note: null,
    };

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from(STUDIES_TABLE)
      .insert(input)
      .select("id, title, description, source, tags, quality_status, reviewed_at, reviewed_by, review_note, created_at")
      .single();

    if (error) {
      logError("api.studies.create.failed", { error: error.message, userId: authUser.userId });
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ study: mapRowToRecord(data as StudyRow) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create study";
    logError("api.studies.create.exception", { message });
    return Response.json({ error: message }, { status: 500 });
  }
}
