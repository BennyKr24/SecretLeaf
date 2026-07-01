---
tags: [technik, audit, checkpoint, architektur]
status: Aktiv
verknüpft: ["[[00_Uebersicht]]", "[[01_Systemarchitektur]]", "[[04_API_Architektur]]"]
---

# SecretLeaf — Architekturübersicht (Stand 10.06.2026)

> Teil des Checkpoints [[00_Uebersicht]]. Vergleich mit dem strategischen Plan: [[01_Systemarchitektur]], [[04_API_Architektur]].

## 1. Tech Stack

**Monorepo** (npm workspaces, root `package.json`, Version 1.4.0, Node ≥20.11):
- `apps/web` — Next.js 16.2.1, React 19.2.0, App Router mit `[locale]` (next-intl 4.9.1, de/en), Tailwind 3.4.14, TypeScript 5.8, `@supabase/supabase-js` ^2.49.8, Zod ^3.24.2
- `apps/api` — eigenständiger Fastify-Server + Prisma + SQLite (separates Backend, siehe Abschnitt 3)
- `packages/shared` — geteilte Pakete (nicht im Detail untersucht)

**Datenbanken**:
- **Supabase Postgres** (Auth, RLS, 16 Migrationen) — Hauptdatenbank für `apps/web`: Grow-System, Studies, Knowledge OS, Rollen
- **SQLite via Prisma** (`apps/api/prisma/schema.prisma`, `DATABASE_URL=file:./dev.db`) — separates, komplett unabhängiges Datenmodell für `apps/api` (Marketplace: User/Listing/Purchase/AuditLog)

**Auth**: Zwei unabhängige Systeme (siehe Abschnitt 4)
- Supabase Auth (E-Mail/Passwort) für `apps/web`
- Eigenes JWT (`@fastify/jwt`, bcrypt) für `apps/api`

**Monitoring/Analytics**: Sentry (vollständig deaktiviert/auskommentiert), Plausible (Wrapper vorhanden, no-op falls Skript fehlt), `@vercel/analytics` (Dependency vorhanden, Nutzung nicht verifiziert), `lib/errorTracking.ts` aktuell nur `console.error`.

**Deployment**: Vercel (vercel.json mit 7 Cron-Jobs für `apps/web`), GitHub Actions CI (`ci.yml`: typecheck + build, **kein Test/Lint-Gate**), separater Workflow `wiki-study-sync.yml` (täglicher Cron + PR-Erstellung).

---

## 2. Zwei parallele Backends — zentrales Architektur-Finding

SecretLeaf besteht faktisch aus **zwei unabhängigen Backends ohne gemeinsames Datenmodell**:

### A) `apps/api` (Fastify + Prisma + SQLite) — "Marketplace"
- Eigener Server (Port 4000), eigenes JWT-Auth (`role: CONSUMER|PROVIDER`), eigene Modelle: `User`, `Listing`, `Purchase`, `AuditLog`.
- Domäne: Cannabis-Grow-Supplies-Marktplatz mit Preis-Stufen, pseudonymen Usern, Standort-"Zonen" statt echter Adressen.
- Routen: `/auth/register`, `/auth/login`, `/listings/*` (CRUD, JWT+Role PROVIDER), `/public/overview`, `/public/listings`, `/public/status-report`, `/search/offers`.
- Wird vom Web-App nur über `apps/web/src/lib/api.ts` (`NEXT_PUBLIC_API_URL`, Default `localhost:4000`) angesprochen — **keine Supabase-Anbindung**.

### B) `apps/web/src/app/api/*` (Next.js Route Handlers + Supabase) — "Knowledge/Studies Plattform"
- Nutzt Supabase-Session-Auth (`getAuthenticatedUser(WithRole)`, `requireAdmin`), Tabellen `studies`, `user_roles`, `knowledge_*`, `grows/plants/log_entries`, `automation_job_runs`.
- Umfangreiche Automation-Pipeline (9 Cron-Routen, siehe Abschnitt 5).
- Knowledge OS (Migrationen 13-15): Artikel, Tags, Graph, Tools, Events.

### Befund: vermuteter Produkt-Pivot
Die Next.js-Routen `api/public/listings`, `api/public/overview`, `api/public/status-report` **reimplementieren dieselben Namen** wie die Fastify-`/public/*`-Routen, liefern aber komplett andere Daten (Studies statt Listings/Users/AuditLog). Das deutet stark darauf hin, dass das Produkt von einem P2P-Marktplatz (Fastify) zu einer Cannabis-Wissensplattform (Next.js/Supabase) gepivotet wurde — die Marketplace-API existiert weiter, ist aber vom aktuellen Frontend nicht eingebunden ("totes" oder zumindest ungenutztes Backend).

---

## 3. Frontend-Architektur (`apps/web/src`)

### Auth (`lib/auth.ts`, `lib/supabaseBrowser.ts`, `hooks/useAuth.ts`, `lib/serverAuth.ts`)
- Supabase Auth E-Mail/Passwort, kein OAuth.
- Session in `localStorage["secretleaf.session"]` (`SessionData = {token, user:{id, username, email?, role, plan?}}`).
- Rolle kommt server-seitig aus `user_roles` via `getUserRole()`; fehlt der Eintrag, wird automatisch `CONSUMER` upserted.
- **Inkonsistenz**: `lib/serverAuth.ts::normalizeRole()` kann nie `"TEAM"` zurückgeben, obwohl `UserRole`-Typ und `lib/auth.ts::fetchRoleFromApi` dafür Branches haben — toter Codepfad.
- Beim Login: fire-and-forget Migration `lib/grow/migration.ts` (localStorage → Supabase), gesteuert über `secretleaf.migrated.v1`.

### Grow-System (Kernmodul, siehe auch [[02_Datenmodell]] und [[03_Datenfluesse]])
- Pure-Funktions-CRUD über localStorage: `lib/grow/store.ts` (`STORAGE_KEYS`: `secretleaf.grows.v1`, `secretleaf.log.v1`, `secretleaf.active_grow_id.v1`, `secretleaf.tools.v1`)
- Optionaler Cloud-Sync für eingeloggte User: `lib/grow/db.ts` (Supabase `grows`/`plants`/`log_entries`)
- Reaktiver Hook `hooks/useGrowState.ts` — Optimistic-UI mit Rollback bei Supabase-Fehlern
- Plan-/Phasen-/Task-Generierung: `lib/grow/planGenerator.ts` + `lib/grow/phases.ts` (deterministisch, abhängig von `umgebung/medium/erfahrung`)
- "Intelligence"-Layer (`lib/grow/intelligence.ts`): rein regelbasiert, **keine KI**, nur In-Memory-Berechnungen (Health Score, Prioritäten, Yield-Schätzung)
- "Insights"-Layer (`lib/grow/insights.ts`): verknüpft Grow-Kontext mit statischem Wiki-Content (`data/terpira/wiki.ts`) über hartkodierte Slug-Boost-Tabellen
- **Scaffolds ohne Backend**: `lib/grow/photoTypes.ts` (Foto-Uploads, "BLOCKED ON: Supabase Storage Bucket + Auth"), `lib/grow/communityTypes.ts` (Community-Grows, "BLOCKED ON: Supabase persistence + user accounts")

### Diagnose
- **Aktive Funktion**: statischer Decision-Tree-Wizard (`lib/diagnose/tree.ts`, `components/diagnose/DiagnoseFlow.tsx`/`DiagnoseResult.tsx`) — keine KI, keine externen Calls, kein Foto-Upload. Ergebnis kann als Notiz-LogEntry gespeichert werden — **bypasst `useGrowLog`/Supabase direkt über `lib/grow/store.ts`** (localStorage-only für eingeloggte User, bis Migration läuft).
- **Stub**: `app/api/diagnose/route.ts` — KI-basierte Bilddiagnose, vollständig auskommentiert, liefert HTTP 501 ("BLOCKED ON: OpenAI API key + Stripe").

### Knowledge OS (`lib/knowledge/*`, `app/api/knowledge/**`)
- Strukturierter Nachfolger des statischen `data/terpira/*`-Wiki-Contents, Supabase-backed (siehe [[02_Datenmodell]]).
- API-Routen: `api/knowledge` (Artikel/Suche/Kategorien), `api/knowledge/graph` (Graph-Traversal via RPC `knowledge_graph_expand`), `api/knowledge/recommend`, `api/knowledge/events` (Event-Ingestion, **ohne Auth/Rate-Limit**, verlässt sich auf RLS).

### Analytics / Monitoring
- `lib/analytics.ts` — Plausible-Wrapper (`Analytics.growCreated`, `.logEntryAdded`, `.toolUsed`, `.phaseAdvanced`, `.harvestRecorded`, `.newsletterSignup`, `.wikiArticleOpened`); no-op falls `window.plausible` nicht existiert (script-injection nur bei gesetztem `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` in `app/layout.tsx`)
- `lib/retention.ts` — reine Berechnungsfunktionen (Reading Streaks, "Community Signals" — trotz Namen **keine echten Community-Daten**, sondern Perzentil-Berechnungen über lokale Daten), Weekly-Digest-Payload-Builder ohne Versandmechanismus
- `lib/errorTracking.ts`, `instrumentation.ts`, `sentry.client/server.config.ts` — **alle inert/auskommentiert**, aktuell nur `console.error`

---

## 4. Auth-Systeme im Vergleich

| | `apps/web` | `apps/api` |
|---|---|---|
| Provider | Supabase Auth | eigenes JWT (`@fastify/jwt`) |
| Speicherort User | `auth.users` (Supabase) + `user_roles` | Prisma `User` (SQLite) |
| Rollen | CONSUMER / PROVIDER / ADMIN / TEAM | CONSUMER / PROVIDER |
| Session-Speicher Client | `localStorage["secretleaf.session"]` | Bearer-Token (vom Client verwaltet) |
| Verbindung zueinander | **keine** | **keine** |

---

## 5. Automations-Übersicht (Cron via `apps/web/vercel.json`)

| Zeit (UTC) | Route | Zweck |
|---|---|---|
| täglich 04:17 | `automation/study-refresh` | wärmt Such-Caches (smart/fresh/quality) — laut Kommentar reiner No-Op-Cache-Warmer |
| täglich 04:27 | `automation/studies-sync` | Legacy-Sync: `autoSources.json` + Crossref API → `studies` |
| täglich 04:37 | `automation/engine-sync` | Haupt-Pipeline: Crossref → normalisieren → dedupe → klassifizieren → `studies` |
| täglich 04:47 | `automation/engine-health` | Health-Snapshot + Circuit-Breaker-Status |
| wöchentlich Mo 05:00 | `automation/engine-adapt` | adaptive Scoring-Gewichte aus Feedback |
| wöchentlich Mo 05:15 | `automation/engine-reprocess` | Re-Scoring bestehender Studies |
| wöchentlich So 04:40 | `automation/cleanup` | löscht Smoke-Test-User/-Studies |

Zusätzlich (nicht gecront): `automation/engine-feedback` (POST, User-Feedback-Events), `automation/health` (Dashboard-Datenquelle).

**Befund: 3 überlappende Sync-Pipelines** (`engine-sync`, `studies-sync`, `study-refresh`) — alle schreiben/lesen `studies`/`automation_job_runs`, deutliche funktionale Redundanz. `scripts/sync-wiki-studies.mjs` dupliziert zusätzlich die Scoring-Logik aus `lib/engine/config.ts` für den separaten GitHub-Actions-Workflow `wiki-study-sync.yml`.

Alle Cron-Routen sind via `CRON_SECRET` geschützt (`Authorization: Bearer` für Vercel-Cron, legacy `x-cron-key` für ältere Routen).

---

## 6. Scripts & Ops-Tooling (`scripts/`)

- `prebuild` (läuft vor jedem `npm run build`): `changelog:generate` (`generate-changelog.mjs`, parst `git log`) + `coverage:snapshot` (`update-coverage-history.mjs`)
- `sync-fertilizer-prices.mjs` — echter externer Preis-Sync via SerpAPI (`SERPAPI_KEY` erforderlich)
- `generate-fertilizer-prices.mjs` — alternativer, deterministischer Preisgenerator (seeded PRNG) — **zwei parallele Preisquellen**
- `sync-wiki-studies.mjs` — eigenständiger Crossref-Sync für GH-Actions, dupliziert `engine/config.ts`-Logik
- `migrate-wiki-to-knowledge.mjs` — "Phase 11"-Migrationswerkzeug: transpiliert `wiki.ts` → `knowledge_seed.sql`/`knowledge_rollback.sql`
- `vercel_env_apply.sh` — appliziert Supabase-/Cron-Secrets auf Vercel (prod/preview/dev)
- diverse `*_autostart_install.sh` — installieren Crontab-Einträge für lokale/Server-Daemons (Status-Probe, Fertilizer-Sync, Wiki-Sync)

---

## 7. KI-Provider-Nutzung

Grep über `apps/web/src` nach `openai|anthropic|claude|gemini` (case-insensitive) ergibt **genau einen Treffer**: `app/api/diagnose/route.ts` — ein vollständig deaktivierter Stub (HTTP 501), der für eine zukünftige OpenAI-Vision-Bilddiagnose vorgesehen ist (`OPENAI_API_KEY`, optional Stripe-Paywall, Supabase-Rate-Limiting "5 Diagnosen/Tag"). **Kein KI-Feature ist aktuell live.**

---

## 8. Status/Admin-Oberflächen

- `/[locale]/status` — öffentliches "Status Cockpit" (Health, Pipeline-Status, Fertilizer-Coverage-Chart, 30-Tage-Verlauf, Changelog)
- `/[locale]/dashboard/admin/*` (alle hinter `requireAdmin`): `algorithm` (Scoring-Konfiguration), `analytics`, `engine` (Job-Runs + manuelle Trigger), `settings`, `studies` (CRUD-Review), `system`, `users` (Rollenverwaltung)
- `app/api/admin/dashboard/route.ts` — monolithischer Action-Dispatch-Endpoint für alle Admin-Funktionen, ruft intern per HTTP die `engine-*`-Cron-Routen auf (`getBaseUrl()` + `CRON_SECRET`)

---

## 9. Middleware / i18n / Deployment-Details

- `middleware.ts` — next-intl `createMiddleware`, Matcher schließt `/api`, `/_next`, statische Dateien aus
- `next.config.mjs` — `createNextIntlPlugin`, `reactStrictMode: true`, `poweredByHeader: false`, Remote-Images von `images.unsplash.com`, `typedRoutes` bewusst deaktiviert (Inkompatibilität mit `[locale]`-Routing)
- `app/layout.tsx` — Fonts, Dark-Mode-Inline-Script, bedingtes Plausible-Script
- `app/[locale]/layout.tsx` — Locale-Validierung, `NextIntlClientProvider`, `ThemeProvider`, `generateMetadata` mit hreflang (de/en/x-default), Basis-URL `https://secretleaf.de` (Default)
- CI (`ci.yml`): nur `npm ci` + Typecheck + Build für beide Workspaces — **kein Test- oder Lint-Gate**

## Verknüpfte Dokumente

[[00_Uebersicht]]
[[02_Datenmodell]]
[[03_Datenfluesse]]
[[01_Systemarchitektur]]
[[04_API_Architektur]]
