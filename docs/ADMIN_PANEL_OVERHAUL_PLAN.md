# Admin-Panel — Überarbeitung: Plan, Analyse & Recherche

**Ziel:** Das Admin-Panel vom „Studien-Kontrollraum mit ein paar Extras" zu
einem echten Betriebs-Cockpit machen. Seit dem letzten Umbau (2026-08-16,
9→7 Seiten) sind Billing, Auth-Mails, i18n-Pipeline, Consent-Versionierung,
das Knowledge-OS-CMS und die Grow-/Diagnose-Domäne dazugekommen — **keins
davon hat eine Admin-Oberfläche**. Gleichzeitig hat der bestehende Bestand
strukturelle Altlasten (eine 785-Zeilen-Mega-Route, kein Server-Gate, keine
geteilten Typen/Primitives) und mehrere echte Bugs.

Status-Legende: `[ ]` offen · `[~]` in Arbeit · `[x]` fertig & verifiziert

Referenz-Design: `DESIGN_SYSTEM.md` (v2.2) ist die Quelle der Wahrheit — vor
allem §5 (Farben), §13/§14 (Cards/Buttons), §16 (Materials), §18 (Dashboard
Rules), §19 (Mobile). §4 verbietet ausdrücklich „Admin Templates / Bootstrap
Dashboards / Themeforest" als Vorbild — das bleibt so.

---

## 0. Ausgangslage (Code-Check 2026-08-31)

Zwei Analyse-Durchläufe (bestehende Seiten + fehlende Flächen). Kurzfassung.

### 0.1 Struktur heute

| Ebene | Umsetzung |
|---|---|
| Routing | `apps/web/src/app/[locale]/dashboard/admin/**` — 1 Layout + 7 Seiten, **alle `"use client"`** |
| Shell/Nav | `components/admin/AdminShell.tsx` (client, 272 Z.) — 4 Nav-Gruppen, 3 davon mit nur 1 Eintrag |
| Auth-Gate | `lib/useAdminAuth.ts` — rein clientseitig, Supabase-Session + `role === "ADMIN"`. Läuft **doppelt pro Navigation** (Shell + jede Seite) |
| API-Client | `lib/adminApi.ts` — `adminApi(session, action, params)` → **`POST /api/admin/dashboard`** |
| API-Backend | **Eine einzige Datei**: `app/api/admin/dashboard/route.ts` (785 Z.), ein `POST`-Handler mit `switch(action)` über **18 Fälle** |
| Server-Auth | `requireAdmin(req)` in `lib/serverAuth.ts` |

Kein Server-Component im ganzen Admin-Baum, keine Ressourcen-Routen, **keine
geteilten Admin-Typen** — jede Seite deklariert ihre Response-Shape inline.
`layout.tsx` (7 Z.) macht nichts außer `<AdminShell>`.

**Aktuelle Nav (`NAV_GROUPS`):**
- Übersicht → `/dashboard/admin`
- Assistent → `/dashboard/admin/assistant`
- Inhalte → Benutzer, Studien
- Pipeline → Pipeline-Engine, Algorithmus, **Auswertungen** (Analytics falsch einsortiert)

### 0.2 Bugs & tote UI im Bestand

| # | Fundstelle | Problem |
|---|---|---|
| B1 | `users/page.tsx` + `users-list` | **Suche & Rollenfilter filtern nur die aktuelle 25er-Seite** — Server filtert *nach* der Pagination. Wer auf Seite 2+ liegt, ist unauffindbar. |
| B2 | `users-list` | `total`/`totalPages` sind ein zugegebener Schätzwert (`?? users.length`) → Pagination-Controls oft falsch. |
| B3 | `analytics/page.tsx` | **„Ø Score" mittelt nur die Top-20-Studien** → aufgeblähter, sinnloser Wert. „Study Types"-Kachel zählt *distinkte Typen*, nicht Studien (falsch beschriftet). |
| B4 | `page.tsx` → `studies/page.tsx` | Deep-Link `/dashboard/admin/studies?filter=pending` wird von der Zielseite **ignoriert**. |
| B5 | `studies/page.tsx` | Suche **ohne Debounce** → ein Fetch pro Tastenanschlag (Users-Seite macht 400 ms). |
| B6 | `algorithm/page.tsx` | **Kein Dirty-State-Guard** — ungespeicherte Edits verschwinden beim Reload. Save-Buttons nicht deaktiviert wenn `tableExists === false` (jeder Klick → 500-Toast). |
| B7 | `algorithm/page.tsx` | Sektion „Blockierte Quellen" hat als **einzige kein „Zurücksetzen"**. `newBlocked.reason`-Input wird nie gerendert. |
| B8 | `dashboard/route.ts` `engine-*` | Server-zu-Server-`fetch` in dasselbe Deployment via `getBaseUrl(req)` (Header-Raterei). Falscher Host-Header ⇒ Pipeline/Adapt/Reprocess brechen ohne Fallback. Kein Progress/Polling bei langen Läufen, keine Bestätigung bei destruktiven Nicht-Dry-Runs. |
| B9 | `types.ts` | `UserRole` enthält `"TEAM"`, aber Users-UI **und** Server-Whitelist lehnen es ab → ein TEAM-User ist uneditierbar, zeigt Fallback-Badge. |
| B10 | mehrere | Backend kann mehr als die UI zeigt: `study-update.reviewNote`, `studies`-Filter `studyType` + Sort `study_type`, `engine-reprocess.batchSize`, blocked-source `reason`. Kein Studien-Detail-View (Abstract/DOI/Topics nirgends lesbar). Keine Zeitreihe/Trend **irgendwo** im Panel. |
| B11 | `assistant/page.tsx` | Copy verspricht geräteübergreifende Persistenz — ist reines `localStorage`. Kein Streaming, kein Markdown-Rendering, kein „als Notiz speichern". |

### 0.3 Design-System-Verstöße (durchgängig)

- **`emerald-*` als Erfolgs-/Markengrün** in `users`, `studies`, Übersichts-Status-Pill
  (`bg-emerald-500/15`, `text-emerald-600`, `bg-emerald-600`-Buttons,
  `border-emerald-600`-Spinner). §5 sagt: Erfolg = `--primary`, und
  Standard-Grün ist explizit der „KI-generierte Dark-SaaS"-Tell.
- **Rohes `red-*`** für Fehler (`border-red-200 bg-red-50 text-red-700`) statt der `rose-*`-Tokens.
- **Pills handgerollt** mit `bg-purple-100 / bg-blue-100 / bg-emerald-100 / bg-amber-100 / bg-red-100`
  in `users` (`ROLE_COLORS`), `studies` (`QualityBadge`/`PriorityBadge`), `analytics`
  (zwei getrennte Prioritäts-Implementierungen). `<Badge tone>` gibt's — nur `algorithm` nutzt es.
- **Modal-Buttons handgerollt** (`bg-emerald-600 dark:bg-emerald-500`) statt `<CTAButton>`. Users-Modal nutzt Glyphen `⌫`/`×` statt Lucide.
- **4 verschiedene Notification-Muster** (Auto-Toast, Dismiss-Banner, Banner-mit-X, Result-Card). Kein `<Alert>`.
- **Übersichts-Schnellzugriff-Cards, Users/Studies-Stat-Reihen, Analytics `MetricCard`/`BarChart`** bauen `<Card>` (und einen echten Chart) von Hand nach. Kein Dataviz-Palette.
- `users` & `studies` bauen **je ein eigenes always-mounted, class-getoggeltes Modal** (~40 Z. fast identisch) statt eines geteilten. `Sheet` (existiert) wird dafür nicht genutzt.
- 785-Zeilen-Route ohne jede Input-Validierung (ad-hoc `as string`), kein `GET`/Caching, kein geteilter Pagination-Contract.

### 0.4 Was komplett fehlt — 30 von ~37 Tabellen ohne jede Admin-Sicht

| Bereich | Backend existiert | Admin-Sicht |
|---|---|---|
| **Billing / Stripe** | `subscriptions`-Tabelle (`20260819200137`), `api/billing/{checkout,portal,webhook}`, `lib/stripe.ts` | **keine** — kein Abo sichtbar, kein Webhook-Log (Events werden in-memory verarbeitet, keine Persistenz/Idempotenz), Benutzer-Seite hat nicht mal eine Plan-Spalte |
| **E-Mail** | `api/auth/send-email` (Supabase-Hook), `lib/email/brevo.ts`, `emails/*` React-Email-Templates, `api/newsletter` (Loops) | **keine** — kein Send-Log, kein Bounce-Handling; im Plan-Doc als SPOF markiert, nur Console-Logging |
| **i18n** | Branch `benny/i18n-content-translation`: `scripts/translate-content.mjs`, TM als JSON (`src/data/i18n/*.json`), `docs/i18n/glossary.json` | **keine** — Coverage nur als CLI-`--stats`, Lauf ist manueller Laptop-Job, kein Review-Queue. *Noch nicht auf `main`.* |
| **Consent / Datenschutz** | `lib/cookie-consent.ts` (`CONSENT_VERSION = 2`), `components/cookie/*` | **keine** — Consent lebt nur im `localStorage` (`sl-cookie-consent`), **kein Server-Record** → Art.-7-DSGVO-Nachweis = ein `ts` im Browser |
| **Changelog / News** | `src/data/changelog.json` (+ `scripts/generate-changelog.mjs`) **und** `src/data/updates.json` (+ `lib/updates.ts`) — zwei parallele, handgepflegte Systeme die auseinanderdriften | **keine** — 0 Treffer für beide Dateien in `dashboard/admin` |
| **Cron / Automatisierung** | 7 Vercel-Crons, `automation_job_runs` + `automation_error_memory` Tabellen, `lib/automationRuns.ts` | **minimal** — nur letzte **20** Zeilen auf dem Engine-Tab; nur 3 der 7 Jobs manuell auslösbar; `automation_error_memory` (Retry-Backoff-Intelligenz) **komplett unsichtbar** |
| **Runtime-Config / Feature-Flags** | `engine_config` (**ist** über Algorithmus-Seite bedienbar). Sonst nur hartkodierte Konstanten + „Env-Key vorhanden?"-Checks | kein generisches Flag-System; `fertilizers`-Route ist hart auf 503; `CONSENT_VERSION` hartkodiert |
| **Knowledge OS** | **19 `knowledge_*`-Tabellen** — vollständiges Headless-CMS mit Versionierung, Review-Queue, Contributors, Media, Sources/References, Metrics/Events, Embeddings | **keine** — nur per SQL bedienbar. Größtes Schema der App. |
| **Grows & Diagnosen** | `grows`/`plants`/`log_entries` + `diagnoses`/`recommendations`/`recommendation_events`/`diagnosis_outcomes`/`plant_health_snapshots` (9 Tabellen) | **keine** — der Kern des Nutzerprodukts hat kein operatives Dashboard; die selbstlernende Diagnose-Outcome-Schleife erzeugt Daten, die nichts anzeigt |

**Cron-Fahrplan (`apps/web/vercel.json`):**

| Pfad | Schedule | Bedeutung |
|---|---|---|
| `/api/automation/study-refresh` | `17 4 * * *` | tgl. 04:17 — Studien re-ranken |
| `/api/automation/engine-sync` | `37 4 * * *` | tgl. 04:37 — volle Engine-Pipeline |
| `/api/automation/engine-health` | `47 4 * * *` | tgl. 04:47 — Engine-Health-Check |
| `/api/automation/health-snapshot` | `50 4 * * *` | tgl. 04:50 — `plant_health_snapshots` + Diagnose-Outcome-Job |
| `/api/automation/engine-adapt` | `0 5 * * 1` | Mo 05:00 — Scoring-Gewichte neu → `engine_config` |
| `/api/automation/engine-reprocess` | `15 5 * * 1` | Mo 05:15 — gespeicherte Studien neu bewerten |
| `/api/automation/cleanup` | `40 4 * * 0` | So 04:40 — abgelaufene Test-User löschen |

---

## 1. Recherche — was ein Admin-Panel 2026 ausmacht

Quellen: [SaaS-Admin-Panel-UX-Prinzipien](https://taqwah.agency/blog/saas-admin-panel-design-guide) ·
[Admin-Dashboard Best Practices](https://rosalie24.medium.com/admin-dashboard-design-best-practices-for-saas-platforms-2f77e21b394b) ·
[Next.js-SaaS-Admin: Users/Metrics/Flags](https://dev.to/whoffagents/building-a-saas-admin-dashboard-with-nextjs-14-users-metrics-and-feature-flags-2ikf) ·
[Audit-Logging für interne Tools](https://appmaster.io/blog/audit-logging-internal-tools-activity-feed) ·
[Cron-Job-Monitoring-Dashboards](https://cronitor.io/cron-job-monitoring) ·
[Was ist ein Admin-Panel](https://flatlogic.com/blog/what-is-an-admin-panel-in-modern-saas/)

1. **Panel = Handeln & Steuern, nicht Beobachten.** Der Unterschied zum
   User-Dashboard: das Panel zentriert *Aktionen und Kontrolle*. Jede Ansicht
   soll eine Handlung ermöglichen, nicht nur eine Zahl zeigen. Deckt sich mit
   `DESIGN_SYSTEM.md` §18 („Arbeitsfläche, nicht Marketing").
2. **Übersicht: 3–5 kritische Kennzahlen, einspaltig, nach Priorität.**
   Nicht „alles was wir haben". Alarme oben, Rest darunter.
3. **Modulare Seitenstruktur.** Features müssen andocken/abgehen können, ohne
   den Rest anzufassen — genau unser Problem (neue Features landen laufend).
   Heißt konkret: Ressourcen-Routen statt einer Mega-`switch`, eine Registry
   für Nav-Einträge, geteilte Primitives.
4. **Audit-Log als Rückgrat.** Sobald ein Panel Nutzer/Billing/Config
   anfasst, ist „wer hat was wann geändert" (Feld-Level-Diff, unveränderlich,
   nur Admin lesbar) Standard. Bei Bulk-Aktionen: ein Eltern-Event + pro
   Datensatz ein Kind-Event.
5. **Cron braucht eine eigene Lauf-Historie.** Job-Name, menschenlesbarer
   Schedule, letzter Lauf, nächster erwarteter, Erfolgsquote, Ø-Dauer,
   stdout/Fehler pro Lauf, „hat seit > Intervall nicht erfolgreich
   abgeschlossen"-Alarm, „jetzt ausführen". Das ist zugleich die saubere
   Datenquelle, um auf `/status` die **automatischen Läufe von den manuellen
   Neuigkeiten zu trennen** (der zweite Punkt aus der Ausgangs-Anfrage).
6. **Row-Expansion statt Detailseiten-Sprünge** für Nutzer/Abos: Kerninfo in
   der Zeile, Permissions/History/Billing auf Aufklappen. Advanced-Settings
   hinter einem „Erweitert"-Toggle.
7. **Real-time-Erwartung.** Live-Zähler / auto-aktualisierende Panels gelten
   als Standard; statische Ansichten mit Reload-Zwang wirken alt. Für uns
   pragmatisch: `revalidate`-Tags + gezieltes Client-Polling auf den
   Lauf-/Health-Ansichten, kein Voll-SPA.

---

## 2. Ziel-Architektur

### 2.1 Informationsarchitektur — neue Navigation

Gruppen mit echtem Gewicht, Analytics raus aus „Pipeline", neue Bereiche
sauber einsortiert. Pfade **ohne `[locale]`** (Entscheidung §6.1). **Fett = neu.**

```
BETRIEB
  Übersicht                /admin
  Automatisierung          /admin/automation      ← NEU (aus Engine-Tab herausgelöst)
  Audit-Log                /admin/audit           ← NEU

NUTZER & UMSATZ
  Benutzer                 /admin/users
  Abonnements              /admin/billing          ← NEU
  E-Mail                   /admin/email            ← NEU (Phase 4)

INHALTE
  Studien                  /admin/studies
  Neuigkeiten & Changelog  /admin/changelog        ← NEU
  Übersetzungen (i18n)     /admin/i18n             ← NEU (Phase 4, nach Branch-Merge)

PRODUKT
  Auswertungen             /admin/analytics
  Grows & Diagnosen        /admin/product          ← NEU (Phase 3)

ENGINE
  Pipeline-Engine          /admin/engine
  Algorithmus              /admin/algorithm

SYSTEM
  Assistent                /admin/assistant
  Feature-Flags & Config   /admin/config           ← NEU (Phase 4)
  Datenschutz & Consent    /admin/consent          ← NEU (Phase 4)
```

_Knowledge OS (`/admin/knowledge`) ist ausgeklammert — eigener Durchgang, siehe §6.4._

Nav wird aus einer **Registry** (`components/admin/nav.ts`) gerendert:
`{ group, href, label, icon, badge?, flag? }`. Neue Seite = ein Registry-
Eintrag, nicht ein Eingriff in die Shell. `badge?` erlaubt Live-Zähler (z. B.
„3" offene Reviews), `flag?` blendet unfertige Bereiche hinter einem Feature-
Flag aus.

### 2.2 Technische Architektur

| Thema | Heute | Ziel |
|---|---|---|
| API | 1 Datei, `POST` + `switch` über 18 Actions, keine Validierung | **Ressourcen-Routen** `app/api/admin/<resource>/route.ts` mit echten `GET`/`PATCH`/`POST`/`DELETE`, **zod**-Schemas pro Endpoint, geteilte Response-Contracts in `lib/admin/contracts.ts` |
| Auth | clientseitig, doppelt pro Navigation | **`layout.tsx` als Server Component** mit `requireAdmin` serverseitig (Redirect statt Client-Flash); `useAdminAuth` nur noch für Logout/Anzeige. Jede Ressourcen-Route ruft `requireAdmin` selbst. |
| Rendering | alle Seiten `"use client"` | Server Components für den Daten-Load (RSC + `fetch` mit `revalidate`-Tag), Client-Inseln nur für Interaktion (Filter, Modals, Trigger) |
| Typen | inline pro Seite, `EngineConfig` dupliziert `configLoader.ts` | `lib/admin/contracts.ts` — eine Quelle; `algorithm` importiert `EngineConfigData` aus `configLoader.ts` |
| Engine-Trigger | Server-zu-Server-`fetch` mit Base-URL-Raterei | Automations-**Logik** direkt aufrufen (`runEngineSync(opts)` als importierbare Funktion; die Cron-Route wird ein dünner Wrapper). Kein Self-Fetch mehr. |
| Mutations | überall ad-hoc | Jede Mutation schreibt einen **`admin_audit_log`**-Eintrag (Actor, Ressource, Vorher/Nachher-Diff) über einen zentralen `withAudit()`-Wrapper |

### 2.3 Neue geteilte Primitives (`components/admin/`)

Bauen einmal, überall nutzen — beseitigt 0.3 fast vollständig:

- **`<AdminPage>`** — Breadcrumb + Icon-Titel + optionale Aktion(en), `max-w`, Ladeskelett. Ersetzt den handgerollten Header auf jeder Seite.
- **`<Alert tone="error|warn|info|success">`** — ein Banner-Muster statt vier. Nutzt `rose/amber/sky/primary`-Tokens.
- **`<StatCard>`** — auf `<Card>`+`<IconChip>`, mit optionalem Trend-Delta. Ersetzt `MetricCard`, die Übersichts-`StatCard`, die Users/Studies-Stat-Reihen.
- **`<DataTable>`** — auf `<ResponsiveTable>`: serverseitige Sortierung/Pagination als Contract, Debounce-Suche eingebaut, Zeilen-Expansion, Bulk-Select, `<EmptyState>`-Integration. Users + Studien + Billing + Audit + Automation nutzen dasselbe.
- **`<AdminModal>`** — auf `.modal-surface`, Fokus-Trap, `<CTAButton>`-Footer. Ersetzt die zwei handgebauten Toggle-Modals.
- **`<RunHistory>`** — Lauf-Tabelle mit Status-`<Badge>`, Dauer, aufklappbarem stdout/`error_details`/`metadata`. Für Automation + Engine.
- **`<KpiRow>`** — 3–5 `<StatCard>`, einspaltig auf Mobile (Recherche-Punkt 2).
- **Charts** — `dataviz`-Skill-Palette, ein `<BarList>` + `<TrendLine>` statt bespoke `<BarChart>`.

### 2.4 Audit-Log (Querschnitt, Phase 0)

Neue Tabelle `admin_audit_log` (siehe §4). Jede schreibende Admin-Aktion
geht durch `withAudit(actor, { resource, resourceId, action, before, after })`.
Eigene Seite `/dashboard/admin/audit`: filterbar nach Actor/Ressource/
Zeitraum, Feld-Diff-Ansicht, immutable (nur `INSERT`, kein `UPDATE`/`DELETE`
per RLS). Bulk-Aktionen: Eltern-Eintrag + Kind-Einträge pro Datensatz.

---

## 3. Seite für Seite

### 3.1 Übersicht — Rebuild

- `<KpiRow>` mit **max. 5**: offene Reviews · aktive Pro-Abos · fehlgeschlagene Crons (24 h) · neue Nutzer (7 T) · Studien-Coverage %. Jede Kachel verlinkt auf ihre Handlungs-Seite.
- **Alarm-Stack oben** (nur wenn was brennt): Cron seit > Intervall rot · Webhook-Signatur-Fehler · Mail-Hook down · Reviews > Schwelle. Nutzt `<Alert>`.
- „Letzter Pipeline-Durchlauf" bleibt, aber als `<RunHistory>`-Kompaktvariante.
- **Raus:** die 5 handgerollten Schnellzugriff-Cards (die Nav leistet das). `system-stats`-Felder, die hier nur doppelt liegen.
- Server Component; `revalidate: 60` + Tag `admin-overview`.

### 3.2 Benutzer — Bugfix + Erweiterung

- **B1/B2:** Suche & Rollenfilter **serverseitig** — weg von `auth.admin.listUsers`-Post-Filtering. Option A: `auth_users`-View + `user_roles`-Join serverseitig filtern/zählen (echte `total`). Option B: nächtlicher Sync `auth.users` → eigene `admin_users_index`-Tabelle. **Empfehlung: A** (kein neuer Sync-Job, Postgres kann das).
- **Plan-Spalte** aus `subscriptions` (Left Join): `free/pro/team` + `status`-Punkt. Row-Expansion zeigt Stripe-Customer-Link, `current_period_end`, letzte Rechnung.
- **B9:** `"TEAM"` in `ROLES` + Server-Whitelist aufnehmen (oder bewusst aus `UserRole` entfernen — Entscheidung §6).
- `<DataTable>`: Sortierung, Bulk-Rollenänderung, „Nutzer einladen".
- Design: `<Badge tone>` statt `ROLE_COLORS`, `<Alert>`, `<AdminModal>`, Lucide-Icons.

### 3.3 Abonnements — NEU (P1)

- **Voraussetzung:** Webhook-Persistenz. Neue Tabelle `stripe_events` (Event-ID unique = Idempotenz, `type`, `payload jsonb`, `received_at`, `processed`, `error`). `api/billing/webhook` schreibt jeden Event rein, bevor er verarbeitet wird; bei Fehler `error` setzen statt nur `logError`.
- Seite: `<DataTable>` aller `subscriptions` (User ↔ Plan ↔ Status ↔ `current_period_end` ↔ Stripe-Links). `<KpiRow>`: aktive Pro · Trialing · Past-due · MRR (aus Plan × Preis).
- Aktionen: **Pro manuell gewähren/entziehen** (Comp-Accounts, Support, Refund) → schreibt `subscriptions` + `admin_audit_log`; optional Stripe-Sub anlegen/canceln über API.
- **Webhook-Health-Panel:** letzter Event, Signatur-Fehler-Zähler, unverarbeitete Events mit „retry".
- Promo-Code-Nutzung (Codes sind aktiv, `checkout` hat `allow_promotion_codes: true`) — Redemptions aus Stripe API zählen.
- Verweis auf `secretleaf_pro_monetization_deferral` — Live-Stripe ist geparkt, aber Test-Modus-Abos existieren schon und sind hier sichtbar zu machen.

### 3.4 Studien — Bugfix + Detail-View

- **B4:** `?filter=pending` (und `?quality=`, `?priority=`) aus der URL lesen und in den Initial-State übernehmen.
- **B5:** Debounce 400 ms (aus `<DataTable>`).
- **B10:** Studien-**Detail-Panel** (Row-Expansion oder Drawer): Abstract, DOI-Link, `matched_topics`, `flags`, `origin_label`, `review_note`-Editor. `studyType`-Filter + `study_type`-Sort exponieren.
- Bulk approve/reject.
- Design: `<Badge tone>` statt `QualityBadge`/`PriorityBadge`, `<Alert>`, `<CTAButton>` im Modal.

### 3.5 Automatisierung — NEU (P1), aus dem Engine-Tab herausgelöst

- **Job-Registry** (menschenlesbar aus `vercel.json` abgeleitet, `components/admin/cronRegistry.ts`): Name, Schedule (`17 4 * * *` → „täglich 04:17"), Beschreibung, Route.
- Pro Job: letzter Lauf (Status/Dauer), **nächster erwarteter**, Erfolgsquote (30 T), Ø-Dauer, `<RunHistory>` mit vollem `automation_job_runs`-Verlauf (nicht 20 Zeilen), `error_details` + `metadata` aufklappbar. Filter nach `job_name`.
- **`automation_error_memory`-Panel:** was steckt im Retry-Backoff fest (`fingerprint`, `fail_count`, `next_retry_at`, `last_error`) — „Force-Retry" / „Eintrag löschen".
- **„Jetzt ausführen" für alle 7 Jobs** (heute nur 3). Bestätigungs-Dialog bei Nicht-Dry-Run.
- **Stale-Cron-Alarm:** Job ohne Erfolg seit > Schedule-Intervall → rote Zeile + Übersichts-Alarm. Daten sind da, nur nie angezeigt.
- Direkter Funktionsaufruf statt Self-Fetch (§2.2).

### 3.6 Pipeline-Engine — verschlankt

- Bleibt als Trigger-Konsole (Sync/Adapt/Reprocess), aber: `engine-reprocess.batchSize` als Input, Bestätigung bei nicht-Dry-Run, Progress-Polling (Lauf schreibt Zwischenstand in `automation_job_runs.metadata`, UI pollt).
- Logs-Tabelle wandert zu §3.5; hier nur noch „letzte 5 engine-sync".
- `extractStats`-Heuristik ersetzen durch typisierte Response-Contracts der Automations-Funktionen.

### 3.7 Algorithmus — Altlasten

- **B6:** Dirty-State-Tracking (`isDirty` pro Sektion), `beforeunload`-Guard, Save-Buttons disabled wenn `!tableExists`.
- **B7:** „Zurücksetzen" für „Blockierte Quellen"; `reason`-Input rendern.
- `EngineConfig`-Typ raus, `EngineConfigData` aus `configLoader.ts` importieren.
- `MIGRATION_SQL`-DDL-String aus der Komponente → auf einen echten Migrations-Verweis / `<SetupRequired>` mit Link.
- 1562-Zeilen-Datei in `algorithm/tabs/*.tsx` splitten.
- `<Alert>`/Token-Politur (amber-Hardcodes im `SetupRequired`).

### 3.8 Auswertungen — echte Metriken

- **B3:** „Ø Score" über den **ganzen** Korpus (ein `avg()`-Query), nicht Top-20. „Study Types" klar beschriften („… verschiedene Typen").
- **Erste Zeitreihe im Panel:** neue Studien/Woche, Feedback-Events/Woche, Accept-Rate-Trend — `<TrendLine>` mit `dataviz`-Palette.
- `unknown`-Buckets aus `null` explizit als „ohne Angabe" labeln.
- `<BarList>` statt bespoke `<BarChart>`; Prioritäts-Pill einmal (`<Badge>`), nicht zweimal.
- Product-Analytics (aktive Grows, Phasenverteilung, Diagnose-Genauigkeit aus der Outcome-Kette) gehen auf die neue Seite §3.11 — nicht hier reinquetschen.

### 3.9 Neuigkeiten & Changelog — NEU (P2) · löst den `/status`-Punkt

- **Editor für `src/data/updates.json`**: CRUD pro Eintrag (`slug`, `version`, `date`, `title`, `summary`, `category`, `featured`-Toggle mit „max. 1"-Guard, `sections{…}`, `stats`, `cta`). Schreibt die JSON-Datei via Server-Route + Git-Commit **oder** (sauberer) migriert `updates.json` in eine `updates`-Tabelle. **Empfehlung: Tabelle** (`updates`), dann ist der Editor eine normale CRUD-Fläche und `lib/updates.ts` liest aus der DB.
- **Changelog-Generator-Trigger:** `generate-changelog.mjs` als Server-Action ausführbar, Vorschau, manuelle Einträge + `version`-Tags über die UI.
- **`/status`-Folgeänderung** (`app/[locale]/status/page.tsx`): die „Chronik"-Sektion (Z. 477–514) wird **zwei getrennte Blöcke**:
  1. **„Automatische Läufe"** — aus `automation_job_runs` (Import-/Sync-/Coverage-Läufe), read-only, kompakt.
  2. **„Neuigkeiten"** — nur `updates`/manuelle Changelog-Einträge (neue Inhalte/Features).
  Der `operationalChangelog`-Merge (Z. 235–256) entfällt; die operativen Events sind ohnehin schon in „Was in den letzten 30 Tagen war" (Z. 451–475). Ergebnis: nicht mehr alles in einer Tabelle.
- Verweis: `feedback_copywriting_no_ai_kitsch` — Changelog-Copy bleibt schlicht deklarativ.

### 3.10 E-Mail — NEU (P2, Phase 4)

- **Voraussetzung:** neue Tabelle `email_log` (Empfänger-Hash, Template, Locale, Brevo-`messageId`, Status, `error`, `sent_at`). `api/auth/send-email` und `api/newsletter` schreiben rein.
- **Brevo-Bounce-Webhook** neu: `api/email/brevo-webhook` konsumiert `hardBounce`/`spam`/`blocked` → `email_log.status` aktualisieren + `email_suppression`-Liste.
- Seite: Delivery-Log (`<DataTable>`), Hook-up/down-Indikator (letzter Erfolg vs. jetzt), Bounce-/Complaint-Liste, „Transaktionsmail erneut senden" (Support), Loops-Newsletter-Signups-Zähler.
- Verweis: `secretleaf_email_templates_plan` — Phase 4–5 dort (Dashboard-Keys, E2E) sind Voraussetzung.

### 3.11 Grows & Diagnosen — NEU (P2, Phase 3)

- Aggregat: aktive Grows, Phasenverteilung, Log-Aktivität/Woche, Diagnose-Genauigkeit aus `diagnosis_outcomes`, Recommendation apply/dismiss aus `recommendation_events`.
- Per-User-Drilldown für Support (ein Grow ansehen, Log-Einträge, letzte Diagnose).
- Verweis: `project_diagnosis_outcome_chain` — die Outcome-Kette erzeugt genau die Daten für die Genauigkeits-Kachel.

### 3.12 Wissen / Knowledge OS — NEU (P1-Wert, Phase 3, größter Brocken)

19 Tabellen, Multi-Tab-Bereich:
- **Artikel** — Liste + Editor, Draft/Publish-State, `knowledge_versions`-Historie, `knowledge_reviews`-Queue.
- **Struktur** — `knowledge_categories`, `knowledge_tags`, `knowledge_relations`/`wiki_relationships`.
- **Quellen** — `knowledge_sources` / `knowledge_references` verwalten.
- **Medien** — `knowledge_media`-Bibliothek.
- **Beitragende** — `knowledge_contributors`.
- **Analytics** — `knowledge_metrics` / `knowledge_events`.
- Eigenes Sub-Plan-Dokument sinnvoll, sobald priorisiert (`docs/ADMIN_KNOWLEDGE_OS_PLAN.md`).

### 3.13 Assistent — Politur

- **B11:** entweder Server-Persistenz (`admin_assistant_threads`-Tabelle, dann stimmt die „geräteübergreifend"-Copy) **oder** Copy ehrlich auf „auf diesem Gerät" ändern. Empfehlung: kleine Tabelle, ist wenig Aufwand.
- Streaming-Antwort, Markdown-Rendering, „Antwort kopieren", `<EmptyState>` statt Dashed-Div.
- `<Alert>` statt hartkodiertem rose-Banner.

### 3.14 Feature-Flags & Config — NEU (P3, Phase 4)

- Neue Tabelle `feature_flags` (`key`, `enabled`, `description`, `rollout jsonb`, `updated_by`, `updated_at`).
- Erste Flags: `newsletter`, `email_hook`, `ai_assistant`, `fertilizer_catalog` (löst den 503-Hardcode ab), `translate_button`.
- **Integration-Status-Panel** (read-only): welche env-gekoppelten Provider laufen — Stripe, Brevo, Loops, Anthropic, `CRON_SECRET` — als „konfiguriert / fehlt". Viel Produkt degradiert heute still bei fehlendem Key.
- `engine_config` bleibt konzeptionell hier eingeordnet, Editor bleibt auf `/algorithm`.

### 3.15 Datenschutz & Consent — NEU (P3, Phase 4)

- **Voraussetzung:** Server-seitiger Consent-Beacon + `consent_records`-Tabelle (`anon_id`, `choice`, `version`, `gpc`, `ts`, `ua_hash`) — sonst gibt es nichts anzuzeigen.
- Consent-Versions-Registry + Liste der gegateten Tools editierbar ohne Deploy (statt `CONSENT_VERSION`-Konstante).
- Accept-all- vs. Essential-Rate, GPC-Anteil.
- Proof-of-Consent-Export für DSGVO-Anfragen.

---

## 4. Datenbank-Migrationen

Neue Tabellen (alle service-role-write, admin-read, `[locale]`-frei):

| Migration | Tabelle | Zweck | Phase |
|---|---|---|---|
| `…_admin_audit_log.sql` | `admin_audit_log` (`id`, `actor_id`, `actor_email`, `resource`, `resource_id`, `action`, `before jsonb`, `after jsonb`, `parent_id` nullable, `created_at`). Nur `INSERT` per RLS. | Querschnitts-Audit | 0 |
| `…_stripe_events.sql` | `stripe_events` (`id` = Stripe-Event-ID PK, `type`, `payload jsonb`, `received_at`, `processed bool`, `error text`) | Webhook-Idempotenz + Health | 2 |
| `…_updates_table.sql` | `updates` (Spiegel des `updates.json`-Schemas) + Backfill aus der JSON | Changelog-Editor | 2 |
| `…_email_log.sql` | `email_log` (`id`, `recipient_hash`, `template`, `locale`, `provider_message_id`, `status`, `error`, `sent_at`) + `email_suppression` (`recipient_hash` PK, `reason`, `created_at`) | Mail-Log + Bounce | 4 |
| `…_feature_flags.sql` | `feature_flags` (`key` PK, `enabled`, `description`, `rollout jsonb`, `updated_by`, `updated_at`) | Flags | 4 |
| `…_consent_records.sql` | `consent_records` (`id`, `anon_id`, `choice`, `version`, `gpc bool`, `ua_hash`, `created_at`) | Consent-Nachweis | 4 |
| `…_admin_assistant_threads.sql` | `admin_assistant_threads` (`id`, `admin_id`, `messages jsonb`, `updated_at`) | Assistent-Persistenz | 1 (optional) |

Kein Schema-Wechsel an bestehenden Tabellen nötig außer optionaler Left-Joins.
Alle Migrations gegen **lokale DB und Prod** fahren (`supabase db push --linked`)
— siehe `secretleaf_security_migration_gap_2026_08_19` (stille Dup-Timestamp-
Push-Fehler): Timestamps streng monoton wählen, Push-Ergebnis verifizieren.

---

## 5. API-Umbau

`app/api/admin/dashboard/route.ts` (785 Z., 18 Actions) → Ressourcen-Routen:

```
app/api/admin/
  overview/route.ts         GET
  users/route.ts            GET (filter/sort/paginate serverseitig), PATCH (role), DELETE
  users/invite/route.ts     POST
  billing/route.ts          GET (subscriptions + KPIs), PATCH (grant/revoke)
  billing/webhook-health/route.ts   GET
  studies/route.ts          GET, PATCH, DELETE, POST (bulk)
  automation/route.ts       GET (registry + runs + error-memory)
  automation/run/route.ts   POST (job-name, dry-run)
  automation/error-memory/route.ts  DELETE
  algorithm/route.ts        GET, PATCH (section), POST (reset)
  analytics/route.ts        GET
  changelog/route.ts        GET, POST (entry), PATCH, DELETE
  changelog/generate/route.ts       POST
  audit/route.ts            GET
  assistant/route.ts        POST (stream)
  email/route.ts            GET (Phase 4)
  config/flags/route.ts     GET, PATCH (Phase 4)
  consent/route.ts          GET (Phase 4)
  knowledge/**              (Phase 3)
```

- Jede Route: `requireAdmin` → zod-Parse → Handler → bei Mutation `withAudit()`.
- Geteilte Contracts in `lib/admin/contracts.ts` (Request- **und** Response-Typen), Client-`adminApi` typisiert dagegen.
- `engine-*`: `lib/automation/engineSync.ts` etc. exportieren `runX(opts): Promise<XResult>`; Cron-Routen + Admin-Routen rufen dieselbe Funktion. **Kein Self-Fetch.**
- Alt-Route bleibt übergangsweise als Deprecation-Shim (leitet auf die neuen Handler um), bis alle Seiten migriert sind, dann löschen.

---

## 6. Entscheidungen (2026-08-31 geklärt)

1. **`[locale]` im Admin-Pfad → raus.** Admin zieht auf `/admin` ohne Locale
   (eigener Route-Zweig), Redirects von `/[locale]/dashboard/admin/*` auf neu.
   Umzug in **Phase 1**.
2. **`updates.json` → DB-Tabelle `updates`** (+ Backfill aus der JSON,
   `lib/updates.ts` liest aus DB). Editor wird normale CRUD-Fläche.
3. **`"TEAM"`-Rolle → aus `UserRole` entfernen.** Kein Team-Feature auf der
   Roadmap (Pro-Monetization bis ~Feb 2027 geparkt). Rückgängig machbar.
   Betrifft `types.ts`, `UserPlan` bleibt (`team` dort ist ein Stripe-Plan-Name).
4. **Knowledge OS → eigener Durchgang.** Nicht in diesem Overhaul. Eigenes
   Sub-Plan-Doc (`docs/ADMIN_KNOWLEDGE_OS_PLAN.md`), wenn eine Content-
   Strategie-Entscheidung dafür da ist. Phase 3 hier = nur Grows & Diagnosen.
5. **Benutzer-Filter → Postgres-View auf `auth.users`** + `user_roles`-Join,
   serverseitig filtern/zählen. Kein nächtlicher Sync-Job.

---

## 7. Phasenplan

### Phase 0 — Fundament (kein sichtbares Feature, aber alles hängt dran)
- [x] `admin_audit_log`-Migration (`202608310000_admin_audit_log.sql`) + `withAudit()`/`recordAuditEntry()`/`diffFields()` in `lib/admin/audit.ts`
- [x] `lib/admin/contracts.ts` — `listQuerySchema`, `AdminListResponse<T>`, `buildListResponse`, Audit-Contracts (Pro-Ressource-Schemas kommen mit der jeweiligen Phase-1-Seite)
- [x] `lib/admin/http.ts` — `adminRoute()`, `parseQuery`/`parseBody`, `AdminHttpError` (Ressourcen-Routen-Helper steht)
- [x] Nav-Registry `components/admin/nav.ts` + `AdminShell` darauf umgestellt (6 Gruppen, `activeAdminEntry()` Longest-Match)
- [x] Primitives: `<AdminPage>`/`<AdminPageSkeleton>`, `<Alert>` (rose/amber/sky/primary), `<StatCard>`/`<KpiRow>`
- [ ] Server-`layout.tsx` mit `requireAdmin` (kommt mit dem `/admin`-Umzug §6.1 in Phase 1)
- [ ] Deprecation-Shim für `api/admin/dashboard` (Routen wandern mit jeder Phase-1-Seite mit)
- [ ] Restliche Primitives: `<DataTable>`, `<AdminModal>`, `<RunHistory>`, `<BarList>`/`<TrendLine>` (größer, gebaut wenn die Phase-1-Seiten sie brauchen)
- [ ] Migration gegen lokale DB **und** Prod fahren (`supabase db push --linked`), Ergebnis verifizieren

_Stand: erster Fundament-Commit steht (`tsc` + `eslint` clean, alle 7 Admin-Routen 200 im `next dev`)._

### Phase 1 — Bestand sanieren (Bugs + Design)
- [ ] Übersicht-Rebuild (§3.1)
- [ ] Benutzer: B1/B2 serverseitig, B9, Plan-Spalte (Read-only Join), Design (§3.2)
- [ ] Studien: B4, B5, Detail-View, `studyType`-Filter, Design (§3.4)
- [ ] Algorithmus: B6, B7, Typ-Import, Datei-Split (§3.7)
- [ ] Auswertungen: B3, erste Zeitreihe, Dataviz-Palette (§3.8)
- [ ] Engine: batchSize, Confirm, Progress; Logs → Automation (§3.6)
- [ ] Assistent: Streaming/Markdown + Persistenz-Entscheidung (§3.13)
- [ ] `/status`: Chronik in „Automatische Läufe" + „Neuigkeiten" splitten (§3.9)
- [ ] Voller Design-System-Pass über alle 7 Seiten (0.3 abhaken)
- [ ] `tsc --noEmit` + `eslint` clean; `next dev` alle Routen 200

### Phase 2 — Umsatz & Betrieb sichtbar machen
- [ ] `stripe_events`-Migration + Webhook-Persistenz
- [ ] Abonnements-Seite (§3.3)
- [ ] Automatisierung-Seite + `automation_error_memory`-Panel + Stale-Alarm (§3.5)
- [ ] Audit-Log-Seite (§2.4)
- [ ] `updates`-Tabelle + Changelog-Editor (§3.9)

### Phase 3 — Produkt
- [ ] Grows & Diagnosen (§3.11)
- [ ] _Knowledge OS (§3.12) — ausgeklammert, eigener Durchgang + `docs/ADMIN_KNOWLEDGE_OS_PLAN.md`_

### Phase 4 — Rand-Systeme
- [ ] E-Mail-Log + Brevo-Bounce-Webhook (§3.10) — nach Email-Plan Phase 4–5
- [ ] i18n-Seite (nach `benny/i18n-content-translation`-Merge)
- [ ] Feature-Flags & Config + Integration-Status (§3.14)
- [ ] Datenschutz & Consent + Server-Beacon (§3.15)

---

## 8. Definition of Done (pro Phase)

- `tsc --noEmit` + `eslint` clean über alle berührten Dateien
- `next dev`: jede Admin-Route 200, entfernte Routen 404, keine Compile-Fehler im Log
- Jede schreibende Aktion erzeugt einen `admin_audit_log`-Eintrag
- Kein `emerald-*`/`red-*`-Hardcode mehr auf berührten Seiten; `<Badge>`/`<Alert>`/`<CTAButton>` durchgängig
- Kein `"use client"` auf Seiten, die nur Daten laden
- Neue Migrations gegen lokale DB **und** Prod gefahren + verifiziert
- `TODO.md`-Punkte („📊 Admin-Panel + Status-Seite Review") abgehakt/entfernt, Commit ist der Nachweis
