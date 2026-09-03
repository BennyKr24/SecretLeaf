// ────────────────────────────────────────────────────────────────────────────
// GET    /api/admin/assistant — this admin's chat history (oldest first)
// POST   /api/admin/assistant — ask Claude, persist the prompt/reply pair
// DELETE /api/admin/assistant — clear this admin's history
//
// Ported from POST /api/admin/dashboard `case "ai-assist"`, plus server-side
// persistence (docs/ADMIN_STUDIES_ASSISTANT_MIGRATION_PLAN.md §2). Gated by
// the `ai_assistant` feature flag (Steuerung).
// ────────────────────────────────────────────────────────────────────────────

import { adminRoute, parseBody, AdminHttpError } from "@/lib/admin/http";
import {
  assistantAskSchema,
  type AdminAssistantResponse,
  type AssistantMessage,
} from "@/lib/admin/contracts";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { isFeatureEnabled } from "@/lib/featureFlags";
import { askClaude } from "@/lib/ai/anthropic";
import { logError, logInfo } from "@/lib/log";

export const dynamic = "force-dynamic";

const TABLE = "admin_assistant_messages";
const HISTORY_LIMIT = 50;

const SYSTEM_PROMPT =
  "Du hilfst dem Admin-Team von SecretLeaf (einer Cannabis-Grow-App) bei Notizen, " +
  "Content-Entwürfen (z. B. Wissensartikel, Studien-Zusammenfassungen) und Ideen für die App. " +
  "Antworte auf Deutsch, präzise und ohne Floskeln.";

type Row = { id: string; prompt: string; reply: string; created_at: string };
const mapRow = (r: Row): AssistantMessage => ({
  id: r.id,
  prompt: r.prompt,
  reply: r.reply,
  createdAt: r.created_at,
});

export const GET = adminRoute(async ({ actor }): Promise<AdminAssistantResponse> => {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, prompt, reply, created_at")
    .eq("actor_id", actor.userId)
    .order("created_at", { ascending: true })
    .limit(HISTORY_LIMIT);
  if (error) throw new Error(error.message);
  return { messages: ((data ?? []) as Row[]).map(mapRow) };
});

export const POST = adminRoute(async ({ req, actor }): Promise<{ message: AssistantMessage }> => {
  if (!(await isFeatureEnabled("ai_assistant"))) {
    throw new AdminHttpError(403, "Der KI-Assistent ist aktuell deaktiviert (Steuerung → Feature-Flags).");
  }

  const { prompt } = await parseBody(req, assistantAskSchema);

  let reply: string;
  try {
    reply = await askClaude(prompt, SYSTEM_PROMPT, { feature: "admin-assistant", actorId: actor.userId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Claude-Anfrage fehlgeschlagen";
    logError("admin.assistant.exception", { message });
    throw new AdminHttpError(502, message);
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ actor_id: actor.userId, prompt, reply })
    .select("id, prompt, reply, created_at")
    .single();
  if (error) throw new Error(error.message);

  logInfo("admin.assistant.ask", { by: actor.userId, promptLength: prompt.length });
  return { message: mapRow(data as Row) };
});

export const DELETE = adminRoute(async ({ actor }): Promise<{ cleared: true }> => {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from(TABLE).delete().eq("actor_id", actor.userId);
  if (error) throw new Error(error.message);
  return { cleared: true };
});
