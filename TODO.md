# Engineering TODO

Concrete, code-level follow-ups discovered across sessions — bugs found but not
fixed, features half-wired, deferred decisions. This is **not** the product
roadmap (see `ROADMAP.md`) and **not** the content backlog
(see `docs/CONTENT_BACKLOG.md`); it's the "don't let this get lost" list for
engineering work.

When you pick something up: move it to "In Progress", and once shipped, delete
it (git history + commit message is the record — don't let this file become a
changelog).

---

## Diagnosis → Recommendation → Outcome chain

The schema (`diagnoses`, `recommendations`, `recommendation_events`,
`plant_health_snapshots`, `diagnosis_outcomes`) is live and wired for the
rule-tree diagnose path. Three pieces of the loop are still missing:

- [ ] **Recommendation apply/dismiss UI.** `recommendation_events` +
      `trg_recommendation_events_apply` exist and are verified working, but no
      screen lets a user mark a recommendation applied or dismissed — nothing
      in the UI writes to this table. Never update `recommendations.status`
      directly, the trigger owns that.
- [ ] **`lib/grow/insights.ts` phase-insight recommendations aren't persisted.**
      Computed client-side/in-memory from `wikiArticles` only.
      `source='phase_insight'` exists in the schema's check constraint but
      nothing ever writes that row.
- [ ] **`plant_health_snapshots` / `diagnosis_outcomes` cron job doesn't exist
      yet.** Referenced in migration comments as a future job
      (`trigger_source in ('daily_cron','on_log_entry')`), following the
      existing `automation_job_runs`/engine-health telemetry pattern. Needed
      before "did this recommendation actually help" becomes answerable at all.
- [ ] **AI-vision diagnose route is a 501 stub.**
      `apps/web/src/app/api/diagnose/route.ts` — blocked on an OpenAI key +
      billing decision, unrelated to the rule-tree path above.

## Grow feature

- [ ] **Grows never load back from Supabase for a returning session.**
      Active grow is determined purely from `localStorage`
      (`lib/grow/store.ts`'s `getActiveGrow()`). A logged-in user on a fresh
      browser/device sees "kein aktiver Grow" even though their grow already
      synced to Supabase — there's an upload path (local → Supabase, via
      `lib/grow/migration.ts`) but no download path (Supabase → local) for a
      returning session. `lib/grow/db.ts` already has `getGrows(supabase)` but
      nothing calls it to populate local state on login.

## Studies / content engine

- [ ] **Live regex false-positive bug in the production classifier.**
      `TOPIC_CLUSTERS['anbau-postharvest'].include` in `lib/engine/config.ts`
      has bare-word patterns `/thc/i`, `/cbd/i`, `/terpene/i`, `/terpenoid/i`
      with no cannabis-context requirement. Confirmed false positives from
      real prod data: "tourists' travel health concern (**THC**)",
      "thermo-hydro-chemical (**THC**)" (geology), "**CBD**-CdS thin films"
      (materials science), terpene-synthase papers about unrelated plants
      (Ginkgo, Styrax, Aquilaria, Abrus). Needs a word-boundary +
      nearby-cannabis-context fix.
- [ ] **Dead config in the admin algorithm UI** (`dashboard/admin/algorithm`) —
      presented as live-editable but doesn't do anything:
  - `preferred_sources` / `blocked_sources` — loaded by `configLoader.ts`,
    never read in `score.ts` (publisher quality is still the hardcoded
    `HIGH_QUALITY_PUBLISHERS`/`MID_QUALITY_PUBLISHERS` lists)
  - `scoring_params.weights` — loaded into `dynConfig` in `pipeline.ts`,
    never passed into `scoreStudy()` (always uses the hardcoded
    `SCORE_WEIGHTS` const)
  - `topic_clusters.overrides` — only additive `customClusters` actually
    works; `classify.ts`'s `matchTopics()` always iterates the hardcoded
    `TOPIC_CLUSTERS` regardless of overrides
  - `engine-adapt` cron (weekly, Mondays) computes adaptive scoring weights
    and writes them to `scoring_weights_history`, but `loadLatestWeights()`
    is never called anywhere — a full read-write loop with no consumer,
    currently pure wasted cron cycles

  Decide per item: wire it up properly, or rip it out and stop the admin UI
  from implying it works.

## Content

- [ ] **~58 more B2B-tone occurrences in the wiki** (`Charge`/`Chargen`/
      `Lieferkette`/`Sperrlogik`/`Audit`) found via grep during the PGR
      article rewrite. Same scale as the Wave 1-4 content-quality overhaul —
      re-derive the current list with
      `grep 'Charge\b\|Chargen\b\|Lieferkette\|Sperrlogik\|operativen Ablauf\|Audit\b' apps/web/src/data/terpira/wiki.ts`
      before starting (content may have shifted since).

## Cosmetic / low priority

- [ ] `apps/web/src/middleware.ts` → rename to `proxy.ts` per Next 16's new
      convention (still works today, just prints a deprecation warning on
      every dev server start).

## Blocked on a decision, not on code

- [ ] **`ANTHROPIC_API_KEY` not set.** The admin AI assistant feature
      (`dashboard/admin/assistant`, `/api/admin/dashboard` `ai-assist` action)
      is fully built but fails with a clear German error until this env var
      is set in Vercel + `.env.local`. Real API cost — user's call, not to be
      set unilaterally.
- [ ] **Vercel deploy status unconfirmed.** User reported a deploy appeared
      stuck/hung in "production" state (2026-08-03) despite a recent build
      showing in the dashboard; never pinned down whether it was
      Building/Queued/built-but-not-promoted before moving on. Worth
      confirming the latest pushes to `main` actually went live before
      assuming so.
