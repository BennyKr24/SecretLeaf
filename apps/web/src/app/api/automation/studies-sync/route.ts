import autoSourcesData from "@/data/terpira/autoSources.json";
import {
  clearAutomationErrorMemory,
  getBlockedFingerprints,
  rememberAutomationError,
} from "@/lib/automationErrorMemory";
import { recordAutomationRun } from "@/lib/automationRuns";
import { getCronSecret } from "@/lib/env";
import { logError, logInfo, logWarn } from "@/lib/log";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { createHash } from "node:crypto";

export const dynamic = "force-dynamic";

const STUDIES_TABLE = "studies";
const JOB_NAME = "studies-sync";
const DEFAULT_LOOKBACK_DAYS = 14;
const MAX_LOOKBACK_DAYS = 60;
const DEFAULT_ROWS_PER_QUERY = 100;
const MAX_ROWS_PER_QUERY = 200;
const MAX_QUERY_COUNT = 6;
const DEFAULT_SYNC_QUERIES = [
  "cannabis cultivation thc cbd terpene profile",
  "cannabis greenhouse indoor environmental control cannabinoid",
  "cannabis postharvest curing drying terpene retention",
  "medical cannabis clinical trial thc cbd",
  "cannabis contaminants pesticides heavy metals microbiology",
  "cannabinoid pharmacology thc cbd review",
];

type AutoSource = {
  title?: string;
  url?: string;
  doi?: string;
  publisher?: string;
  tags?: string[];
  matchedTopics?: string[];
  reviewSummary?: string[];
};

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").trim();
}

function toStudyInsert(source: AutoSource) {
  const title = normalizeText(source.title);
  if (!title) return null;

  const reviewSummary = (source.reviewSummary ?? []).map((line) => line.trim()).filter(Boolean).slice(0, 3);
  const description = reviewSummary.length > 0 ? reviewSummary.join(" ") : null;

  const sourceLabel = normalizeText(source.url) || normalizeText(source.publisher) || null;

  const tags = Array.from(
    new Set([...(source.tags ?? []), ...(source.matchedTopics ?? [])].map((tag) => tag.trim().toLowerCase()).filter(Boolean))
  );

  const rawFingerprint = source.doi?.trim().toLowerCase() || source.url?.trim().toLowerCase() || `${title}|${sourceLabel ?? ""}`;
  const sourceFingerprint = createHash("sha256").update(rawFingerprint).digest("hex");

  return {
    title,
    description,
    source: sourceLabel,
    tags,
    source_fingerprint: sourceFingerprint,
    quality_status: "pending" as const,
    reviewed_by: null,
    reviewed_at: null,
    review_note: null,
  };
}

type StudySyncRow = {
  title: string;
  description: string | null;
  source: string | null;
  tags: string[];
  source_fingerprint: string;
  quality_status: "pending";
  reviewed_by: null;
  reviewed_at: null;
  review_note: null;
};

type CrossrefWorkItem = {
  title?: string[];
  URL?: string;
  DOI?: string;
  publisher?: string;
  subject?: string[];
  published?: { "date-parts"?: number[][] };
  issued?: { "date-parts"?: number[][] };
};

type CrossrefResponse = {
  message?: {
    items?: CrossrefWorkItem[];
  };
};

type SyncMetrics = {
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  blockedByErrorMemory: number;
  failedWrites: number;
  errors: string[];
  attempts: number;
  sourceGeneratedAt: string | null;
};

type CrossrefFetchResult = {
  sources: AutoSource[];
  attempts: number;
  errors: string[];
  queryCount: number;
  lookbackDays: number;
  rowsPerQuery: number;
};

function isCronAuthorized(req: Request, configuredSecret: string): boolean {
  // Vercel Cron sends: Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get("authorization");
  const bearerToken = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  // Manual/legacy calls use x-cron-key header or query param
  const legacyKey =
    req.headers.get("x-cron-key") ??
    new URL(req.url).searchParams.get("x-cron-key");
  const candidate = bearerToken ?? legacyKey;
  return candidate === configuredSecret;
}

function parseBoundedInt(value: string | undefined, fallback: number, min: number, max: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function getConfiguredQueries(): string[] {
  const raw = process.env.STUDY_SYNC_CROSSREF_QUERIES;
  const fromEnv = raw
    ? raw
        .split(/\r?\n|\|/g)
        .map((part) => part.trim())
        .filter((part) => part.length >= 3)
    : [];

  const base = fromEnv.length > 0 ? fromEnv : DEFAULT_SYNC_QUERIES;
  return Array.from(new Set(base)).slice(0, MAX_QUERY_COUNT);
}

function buildCrossrefUrl(query: string, fromDate: string, rows: number): string {
  const params = new URLSearchParams({
    query,
    rows: String(rows),
    sort: "published",
    order: "desc",
    filter: `from-pub-date:${fromDate},type:journal-article`,
    select: "title,URL,DOI,publisher,subject,published,issued",
  });

  return `https://api.crossref.org/works?${params.toString()}`;
}

async function fetchCrossrefSources(maxAttempts: number): Promise<CrossrefFetchResult> {
  const errors: string[] = [];
  const lookbackDays = parseBoundedInt(
    process.env.STUDY_SYNC_LOOKBACK_DAYS,
    DEFAULT_LOOKBACK_DAYS,
    1,
    MAX_LOOKBACK_DAYS,
  );
  const rowsPerQuery = parseBoundedInt(
    process.env.STUDY_SYNC_ROWS_PER_QUERY,
    DEFAULT_ROWS_PER_QUERY,
    20,
    MAX_ROWS_PER_QUERY,
  );
  const queries = getConfiguredQueries();
  const fromDate = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const collected: AutoSource[] = [];
  let attempts = 0;

  for (const query of queries) {
    const url = buildCrossrefUrl(query, fromDate, rowsPerQuery);
    let queryCompleted = false;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      attempts += 1;
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "SecretLeafAutomation/1.0 (status@secretleaf.local)",
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          const message = `crossref_http_${response.status}:${query}`;
          errors.push(message);
          continue;
        }

        const body = (await response.json()) as CrossrefResponse;
        const items = body.message?.items ?? [];
        const sources: AutoSource[] = items.map((item) => {
          const title = (item.title ?? []).find((entry) => entry && entry.trim().length > 0) ?? "";
          const subjects = (item.subject ?? []).slice(0, 6).map((subject) => subject.trim().toLowerCase());
          const issued = item.published?.["date-parts"]?.[0] ?? item.issued?.["date-parts"]?.[0] ?? [];
          const year = issued[0] ? String(issued[0]) : "";

          const source: AutoSource = {
            title,
            tags: ["auto:crossref", ...subjects],
            matchedTopics: subjects,
            reviewSummary: [
              year ? `Publiziert ${year}` : "Aktueller Fachartikel",
              item.publisher ?? "Verlag unbekannt",
              `Suchprofil: ${query}`,
            ],
          };

          if (item.URL) source.url = item.URL;
          if (item.DOI) source.doi = item.DOI;
          if (item.publisher) source.publisher = item.publisher;

          return source;
        });

        collected.push(...sources);
        queryCompleted = true;
        break;
      } catch (error) {
        const message = error instanceof Error ? error.message : "crossref_fetch_failed";
        errors.push(`${message}:${query}`);
      }
    }

    if (!queryCompleted) {
      errors.push(`crossref_query_failed:${query}`);
    }
  }

  const deduped = new Map<string, AutoSource>();
  for (const source of collected) {
    const key =
      normalizeText(source.doi).toLowerCase() ||
      normalizeText(source.url).toLowerCase() ||
      normalizeText(source.title).toLowerCase();
    if (!key) continue;
    if (!deduped.has(key)) deduped.set(key, source);
  }

  return {
    sources: Array.from(deduped.values()),
    attempts,
    errors,
    queryCount: queries.length,
    lookbackDays,
    rowsPerQuery,
  };
}

async function safeRecordAutomationRun(input: Parameters<typeof recordAutomationRun>[0]): Promise<void> {
  try {
    await recordAutomationRun(input);
  } catch (error) {
    const message = error instanceof Error ? error.message : "automation_run_record_failed";
    logWarn("automation.studies-sync.telemetry-failed", { message, jobName: input.jobName });
  }
}

export async function GET(req: Request) {
  const startedAt = new Date().toISOString();
  const metrics: SyncMetrics = {
    fetched: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    blockedByErrorMemory: 0,
    failedWrites: 0,
    errors: [],
    attempts: 1,
    sourceGeneratedAt: (autoSourcesData as { generatedAt?: string }).generatedAt ?? null,
  };

  let configuredSecret: string;
  try {
    configuredSecret = getCronSecret();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Missing CRON secret";
    logError("automation.studies-sync.misconfigured", { message });
    metrics.errors.push(message);

    try {
      await safeRecordAutomationRun({
        jobName: JOB_NAME,
        startedAt,
        finishedAt: new Date().toISOString(),
        success: false,
        fetched: metrics.fetched,
        inserted: metrics.inserted,
        updated: metrics.updated,
        skipped: metrics.skipped,
        attempts: metrics.attempts,
        sourceGeneratedAt: metrics.sourceGeneratedAt,
        errorDetails: message,
        metadata: { errors: metrics.errors },
      });
    } catch {
      // ignore telemetry failure
    }

    return Response.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }

  if (!isCronAuthorized(req, configuredSecret)) {
    logWarn("automation.studies-sync.unauthorized");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseServerClient();
    const crossrefAttemptRaw = Number.parseInt(process.env.STUDY_SYNC_MAX_ATTEMPTS ?? "3", 10);
    const crossrefAttempts = Number.isFinite(crossrefAttemptRaw) ? Math.min(Math.max(crossrefAttemptRaw, 1), 5) : 3;

    const safeRememberSourceError = async (
      fingerprint: string,
      stage: "insert" | "update",
      errorMessage: string,
    ) => {
      metrics.failedWrites += 1;
      metrics.errors.push(`${stage}:${errorMessage}`);

      try {
        await rememberAutomationError({
          jobName: JOB_NAME,
          fingerprint,
          errorMessage,
          metadata: { stage },
        });
      } catch (memoryError) {
        const message = memoryError instanceof Error ? memoryError.message : "automation_error_memory_write_failed";
        metrics.errors.push(message);
        logWarn("automation.studies-sync.error-memory-write-failed", { message, stage, fingerprint });
      }
    };

    const safeClearSourceError = async (fingerprint: string) => {
      try {
        await clearAutomationErrorMemory(JOB_NAME, fingerprint);
      } catch (memoryError) {
        const message = memoryError instanceof Error ? memoryError.message : "automation_error_memory_clear_failed";
        logWarn("automation.studies-sync.error-memory-clear-failed", { message, fingerprint });
      }
    };

    const fetchedExternal = await fetchCrossrefSources(crossrefAttempts);
    metrics.attempts = fetchedExternal.attempts;
    metrics.errors.push(...fetchedExternal.errors);

    const mergedSources = [
      ...((autoSourcesData as { sources?: AutoSource[] }).sources ?? []),
      ...fetchedExternal.sources,
    ];

    const sourceCandidates = mergedSources
      .map(toStudyInsert)
      .filter(Boolean) as StudySyncRow[];

    const dedupedByFingerprint = new Map<string, StudySyncRow>();
    for (const source of sourceCandidates) {
      if (!dedupedByFingerprint.has(source.source_fingerprint)) {
        dedupedByFingerprint.set(source.source_fingerprint, source);
      }
    }

    const sources = Array.from(dedupedByFingerprint.values());
    metrics.skipped = Math.max(sourceCandidates.length - sources.length, 0);

    let blockedFingerprints = new Set<string>();
    try {
      blockedFingerprints = await getBlockedFingerprints(JOB_NAME);
    } catch (error) {
      const message = error instanceof Error ? error.message : "automation_error_memory_read_failed";
      metrics.errors.push(message);
      logWarn("automation.studies-sync.error-memory-read-failed", { message });
    }

    const runnableSources = sources.filter((source) => !blockedFingerprints.has(source.source_fingerprint));
    metrics.blockedByErrorMemory = Math.max(sources.length - runnableSources.length, 0);
    metrics.skipped += metrics.blockedByErrorMemory;
    metrics.fetched = runnableSources.length;

    if (runnableSources.length === 0) {
      logInfo("automation.studies-sync.empty");
      await safeRecordAutomationRun({
        jobName: JOB_NAME,
        startedAt,
        finishedAt: new Date().toISOString(),
        success: true,
        fetched: metrics.fetched,
        inserted: 0,
        updated: 0,
        skipped: metrics.skipped,
        attempts: metrics.attempts,
        sourceGeneratedAt: metrics.sourceGeneratedAt,
        metadata: {
          blockedByErrorMemory: metrics.blockedByErrorMemory,
          errors: metrics.errors,
        },
      });

      return Response.json({
        success: true,
        fetched: metrics.fetched,
        inserted: 0,
        updated: 0,
        skipped: metrics.skipped,
        blockedByErrorMemory: metrics.blockedByErrorMemory,
        errors: metrics.errors,
        generatedAt: new Date().toISOString(),
      });
    }

    // Explicit insert/update path avoids dependency on ON CONFLICT index inference.
    // Fingerprints are looked up in batches of 100 to avoid PostgREST URL length limits.

    const fingerprints = runnableSources.map((source) => source.source_fingerprint);
    const FINGERPRINT_BATCH_SIZE = 100;
    const existingByFingerprint = new Map<string, string>();

    for (let i = 0; i < fingerprints.length; i += FINGERPRINT_BATCH_SIZE) {
      const batch = fingerprints.slice(i, i + FINGERPRINT_BATCH_SIZE);
      const { data: batchRows, error: batchError } = await supabase
        .from(STUDIES_TABLE)
        .select("id, source_fingerprint")
        .in("source_fingerprint", batch);

      if (batchError) {
        logError("automation.studies-sync.existing-fetch-failed", { error: batchError.message });
        metrics.errors.push(batchError.message);

        await safeRecordAutomationRun({
          jobName: JOB_NAME,
          startedAt,
          finishedAt: new Date().toISOString(),
          success: false,
          fetched: metrics.fetched,
          inserted: metrics.inserted,
          updated: metrics.updated,
          skipped: metrics.skipped,
          attempts: metrics.attempts,
          sourceGeneratedAt: metrics.sourceGeneratedAt,
          errorDetails: batchError.message,
          metadata: { errors: metrics.errors },
        });

        return Response.json({ error: batchError.message }, { status: 500 });
      }

      for (const row of batchRows ?? []) {
        if (typeof row.source_fingerprint === "string") {
          existingByFingerprint.set(row.source_fingerprint as string, row.id as string);
        }
      }
    }

    const toInsert = runnableSources.filter((source) => !existingByFingerprint.has(source.source_fingerprint));
    const toUpdate = runnableSources.filter((source) => existingByFingerprint.has(source.source_fingerprint));

    for (const source of toInsert) {
      const { error: insertError } = await supabase.from(STUDIES_TABLE).insert(source);
      if (insertError) {
        logWarn("automation.studies-sync.insert-failed", {
          error: insertError.message,
          fingerprint: source.source_fingerprint,
        });
        await safeRememberSourceError(source.source_fingerprint, "insert", insertError.message);
        metrics.skipped += 1;
        continue;
      }

      metrics.inserted += 1;
      await safeClearSourceError(source.source_fingerprint);
    }

    for (const source of toUpdate) {
      const studyId = existingByFingerprint.get(source.source_fingerprint);
      if (!studyId) continue;

      const { error: updateError } = await supabase
        .from(STUDIES_TABLE)
        .update({
          title: source.title,
          description: source.description,
          source: source.source,
          tags: source.tags,
          source_fingerprint: source.source_fingerprint,
        })
        .eq("id", studyId);

      if (updateError) {
        logWarn("automation.studies-sync.update-failed", {
          error: updateError.message,
          studyId,
          fingerprint: source.source_fingerprint,
        });
        await safeRememberSourceError(source.source_fingerprint, "update", updateError.message);
        metrics.skipped += 1;
        continue;
      }

      metrics.updated += 1;
      await safeClearSourceError(source.source_fingerprint);
    }

    const runSucceeded = metrics.failedWrites === 0;

    logInfo("automation.studies-sync.success", {
      totalCandidates: runnableSources.length,
      inserted: metrics.inserted,
      updated: metrics.updated,
      blockedByErrorMemory: metrics.blockedByErrorMemory,
      failedWrites: metrics.failedWrites,
    });

    await safeRecordAutomationRun({
      jobName: JOB_NAME,
      startedAt,
      finishedAt: new Date().toISOString(),
      success: runSucceeded,
      fetched: metrics.fetched,
      inserted: metrics.inserted,
      updated: metrics.updated,
      skipped: metrics.skipped,
      attempts: metrics.attempts,
      sourceGeneratedAt: metrics.sourceGeneratedAt,
      metadata: {
        externalFetched: fetchedExternal.sources.length,
        queryCount: fetchedExternal.queryCount,
        lookbackDays: fetchedExternal.lookbackDays,
        rowsPerQuery: fetchedExternal.rowsPerQuery,
        blockedByErrorMemory: metrics.blockedByErrorMemory,
        failedWrites: metrics.failedWrites,
        errors: metrics.errors,
      },
    });

    return Response.json({
      success: runSucceeded,
      partialFailure: metrics.failedWrites > 0,
      fetched: metrics.fetched,
      inserted: metrics.inserted,
      updated: metrics.updated,
      skipped: metrics.skipped,
      blockedByErrorMemory: metrics.blockedByErrorMemory,
      failedWrites: metrics.failedWrites,
      errors: metrics.errors,
      generatedAt: new Date().toISOString(),
      notes: [
        "Runs on Vercel cron independent of local PC sessions.",
        "Sync source: static autoSources + external Crossref runtime fetch",
        "Error memory stores failing fingerprints and retries them later with backoff.",
        `Crossref coverage: ${fetchedExternal.queryCount} queries, lookback ${fetchedExternal.lookbackDays} days, ${fetchedExternal.rowsPerQuery} rows/query.`,
      ],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    logError("automation.studies-sync.exception", { message });
    metrics.errors.push(message);

    try {
      await safeRecordAutomationRun({
        jobName: JOB_NAME,
        startedAt,
        finishedAt: new Date().toISOString(),
        success: false,
        fetched: metrics.fetched,
        inserted: metrics.inserted,
        updated: metrics.updated,
        skipped: metrics.skipped,
        attempts: metrics.attempts,
        sourceGeneratedAt: metrics.sourceGeneratedAt,
        errorDetails: message,
        metadata: { errors: metrics.errors },
      });
    } catch {
      // ignore telemetry failure
    }

    return Response.json(
      {
        success: false,
        fetched: metrics.fetched,
        inserted: metrics.inserted,
        updated: metrics.updated,
        skipped: metrics.skipped,
        errors: metrics.errors,
      },
      { status: 500 }
    );
  }
}
