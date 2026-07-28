-- ────────────────────────────────────────────────────────────────────────────
-- Rollback: Knowledge Activation (Phase 15)
--
-- Reverts 202606020015_knowledge_activation.sql. Drops the recommendation RPC,
-- the tool registry and its taxonomy junction, and removes the tool_id column
-- added to knowledge_tool_links. Run only if the activation layer must be
-- backed out. Seeded canonical tags are intentionally left in place (they are
-- harmless and may be referenced by article content).
-- ────────────────────────────────────────────────────────────────────────────

drop function if exists public.knowledge_recommend_tools(text, int);

alter table public.knowledge_tool_links drop column if exists tool_id;

drop table if exists public.knowledge_tool_tags;
drop table if exists public.knowledge_tools;
