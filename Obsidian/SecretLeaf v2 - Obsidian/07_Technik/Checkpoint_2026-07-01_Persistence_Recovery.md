# Checkpoint 2026-07-01 — Persistence Recovery

## Zweck

Dokumentiert die Auflösung des kritischen Production-Incidents „Grow Creation Fails" (Juni 2026) inklusive Root Cause, Beweisführung, Fixes und Lehren. Dieser Checkpoint ist die verbindliche Referenz für alle zukünftigen Auth-, Persistenz- und Deployment-Entscheidungen.

## Zusammenfassung

Der Kerngeschäftsfluss (User → Account → Create Grow → Open Grow) schlug in Produktion fehl: Grows wurden nie in Supabase persistiert, die Detailseite zeigte „Grow nicht gefunden". Die Ursache war eine Kette aus drei Defekten (Dual-Session-Modell, Redirect-Race, lokale Phantom-Grows) plus einem Prozessfehler (Fixes erreichten 12 Tage lang nie Production, weil `fix/*`-Branches nur Preview-Deployments erzeugen). Am 2026-07-01 wurde der Flow End-to-End bewiesen (8/8 PASS) und in Produktion bestätigt: `grows`-Tabelle enthält reale Nutzer-Grows.

## Incident

**Symptom:**
- Grow-Erstellung schien erfolgreich, Redirect auf `/grow/[id]`
- Seite: „Grow nicht gefunden"
- Grow weder im Dashboard noch in Supabase-Tabelle `grows` (count = 0)

**Zeitraum:** ca. 2026-06-18 bis 2026-07-01

## Root Cause (drei Code-Defekte + ein Prozessfehler)

### 1. Dual-Session-Modell (Auth)

Zwei unabhängige Session-Quellen:

- `secretleaf.session` (localStorage) → steuerte `useAuth().user`
- Supabase-Client-Session → liefert `auth.uid()` für RLS

Wenn der Custom-Token die Supabase-Session überlebte: Frontend „eingeloggt", Supabase „nicht eingeloggt" → INSERT ohne JWT → **Postgres 42501** („new row violates row-level security policy") → stiller Rollback → Datenverlust.

**Beweis:** Insert ohne Session reproduzierte 42501 deterministisch; Insert mit echter Session: count 0 → 1.

### 2. Redirect-Race (Create-Flow)

`createGrow()` gab synchron zurück, der Supabase-Insert lief fire-and-forget im Hintergrund. `router.push('/grow/[id]')` feuerte, bevor der Grow in der Datenbank existierte.

### 3. Lokale Phantom-Grows

`storeCreateGrow()` schrieb vor dem Supabase-Insert in localStorage. Fehlgeschlagene Inserts hinterließen lokale Grow-Leichen, die UI-Zustände blockierten.

### 4. Prozessfehler: Deploy-Lücke

Alle Fixes lagen auf `fix/production-persistence`. Vercel deployt Production **nur von `main`**. Das letzte Production-Deployment war vom 2026-06-02 — die Fixes liefen 12 Tage nur als Preview.

## Fixes (Commits)

| Commit | Fix |
|---|---|
| `f5f2584` | Locale-aware Navigation (45 Dateien, `@/i18n/navigation`) |
| `432618d` | `@sentry/nextjs` als Workspace-Dependency |
| `2424fa8` | **Supabase-Session = Single Source of Truth** — `restoreSessionFromSupabase` fällt nicht mehr auf veraltete Tokens zurück; `useAuth` rekonziliert via `onAuthStateChange` |
| `bfc8939` | **Redirect erst nach Persistenz** — `createGrow` awaitet den Insert, wirft bei Fehler |
| `fa9078b` | **Keine Phantom-Grows** — `buildGrow()` ohne lokale Persistenz; localStorage-Cache spiegelt Supabase (auch leere Ergebnisse) |
| `7b0fac1` | Migrations-Timestamp-Duplikat `202606010012` → `202606020013` |
| `616555a` | Merge → `main`, Production-Deploy `success` |

## Beweisführung

1. **Node-Repro gegen Produktions-Supabase:** ohne Session → 42501 (count 0→0); mit Session → Insert OK (count 0→1)
2. **Browser-E2E (Playwright, Prod-Build):** 8/8 PASS — Login via UI → Wizard → Grow in `grows` → Plants synced → Reload → zweites Gerät
3. **Produktion (2026-07-01, nach Deploy):** realer User-Grow `f8548e8d` („Keller") in `grows` persistiert; Phantom-Grows vom 19.06. wurden durch die Migration nachträglich hochgeladen

## Grundprinzipien (Lehren)

1. **Eine Wahrheit für Auth:** Die Supabase-Session ist die einzige Quelle für Authentifizierung. Kein zweiter Session-Speicher darf Autorität haben.
2. **Persistenz vor Navigation:** Kein Redirect auf eine Entität, bevor sie serverseitig existiert.
3. **Kein lokaler Write vor Server-Write** im authentifizierten Pfad — sonst entstehen Phantom-Zustände.
4. **Deploy-Verifikation gehört zum Fix:** Ein Fix ist erst „done", wenn die Production-SHA ihn enthält (`gh api …/deployments?environment=Production`).
5. **Runtime-Beweis vor Theorie:** 42501 + count-Tests entschieden den Incident, nicht Audits.

## Auswirkungen auf das Unternehmen

### Produkt

Der Kern-Loop (Situation → Decision → Outcome) ist erstmals End-to-End nachgewiesen: Nutzerdaten fließen vom Browser bis in die Datenbank und überleben Reload, Logout und Gerätewechsel. Grundlage für MAG und Data Moat ist funktional.

### Technik

- RLS-Policies (`auth.uid() = user_id`) arbeiten korrekt und haben den Fehler sichtbar gemacht — sie bleiben unverändert.
- E-Mail-Confirmation ist in Produktion aktiv; Nutzer müssen vor dem ersten Grow bestätigen.
- Migrationsreihenfolge ist wieder deterministisch (kein Timestamp-Duplikat).

## Offene Punkte

- Erledigt nach Checkpoint: Test-/Duplikat-Grows wurden aus Supabase bereinigt.
- Erledigt nach Checkpoint: `SENTRY_AUTH_TOKEN` wurde in Vercel gesetzt; Source-Map-Upload ist aktiviert.
- Erledigt nach Checkpoint: Grow-Log-Einträge und Task-Auto-Complete synchronisieren nach Supabase.
- Weiter offen: Newsletter-Provider anbinden.
- Weiter offen: Legacy-API (`apps/api`) konsolidieren oder klar begrenzen.
- Weiter offen: Audit-Branch `copilot/full-system-audit-rebuild` nur selektiv portieren, nicht blind mergen.

## Status

**Incident geschlossen: 2026-07-01.** Production-Deploy `616555a`, Status `success`, Persistenz durch realen Nutzer bestätigt.
