# SecretLeaf HQ — Admin-Leitstand: Plan, Analyse & Recherche

**Neuausrichtung (2026-08-31):** Das Admin-Panel wird vom Studien-Werkzeug zu
einem **Leitstand für das ganze Unternehmen** — „SecretLeaf HQ". Benny nutzt es
solo, als **tägliches Morgen-Briefing** (2-Minuten-Blick: was lief über Nacht,
welche Zahl bewegt sich, was braucht heute eine Entscheidung) und für gezielte
Steuerung. Es schickt **gezielte Benachrichtigungen** per E-Mail bei echten
Ereignissen. Kosten kommen **so automatisch wie möglich** rein.

Was gesteuert / überwacht werden muss: Umsatz & Kosten, Wachstum & Nutzer,
Content & Wissen, Betrieb & Zustellung (inkl. ausgebaute Mail-Anbindung),
Compliance — plus die **Hebel**, die wir bisher übersehen (§5).

Status-Legende: `[ ]` offen · `[~]` in Arbeit · `[x]` fertig & verifiziert
Design: `DESIGN_SYSTEM.md` v2.2 ist Quelle der Wahrheit (§5 Farben, §13/§14
Cards/Buttons, §16 Materials, §18 „Arbeitsfläche, nicht Marketing", §19 Mobile).
§4 verbietet „Admin/Bootstrap/Themeforest-Dashboards" als Vorbild.

---

## 0. Die Module (Ziel-Bild)

| Modul | Was es steuert / zeigt | Route |
|---|---|---|
| **Lage** | Morgen-Briefing: Umsatz heute/MTD, neue Nutzer, aktive Grows, Nacht-Läufe, was rot ist, offene Entscheidungen | `/admin` |
| **Finanzen** | MRR/ARR, Abos (aktiv/Trial/past_due), Stripe-Auszahlungen & Gebühren, Infra-Kosten pro Dienst, Burn & Runway, Umsatz-vs-Kosten-Trend, Budget-Alerts | `/admin/finance` |
| **Wachstum** | Signup-Funnel, Aktivierung (erster Grow), Retention-Kohorten, Free→Pro-Conversion, Kündigungen + Gründe | `/admin/growth` |
| **Nutzer** | Serverseitige Suche/Filter, Detail (Plan, Grows, Aktivität, Mails, Consent), Aktionen: Pro geben/entziehen, Rolle, sperren, Support-Ansicht | `/admin/users` |
| **Content & Wissen** | Studien-Queue + Engine, Wissens-CMS (live/Entwurf/Review), Übersetzungs-Coverage, Neuigkeiten-Editor (speist `/status`) | `/admin/content` |
| **Betrieb** | Cron-Registry + Lauf-Historie + „jetzt ausführen", Fehler-Memory, Migrationsstand lokal/prod, Sentry-Fehlerrate, Integrations-/Key-Status | `/admin/ops` |
| **Zustellung / Mail** | Auth-Mail-Log, Hook-Health, Bounces/Complaints, Newsletter-Signups, Broadcast an Segmente | `/admin/mail` |
| **Steuerung** | Feature-Flags, Wartungsmodus/Kill-Switches, Site-Banner, Pricing-Config, Rate-Limits, Decision-Log (§5) | `/admin/control` |
| **Compliance** | Consent-Quoten & -Version, DSGVO-Anfragen-Log, Impressumspflicht-Trigger, Sub-Prozessoren-Liste | `/admin/compliance` |
| **Audit-Log** | wer hat was wann geändert — quer über alles | `/admin/audit` |
| **Engine / Algorithmus** | (bleibt) Pipeline-Trigger + Scoring-Config, aber unter Content einsortiert | `/admin/engine`, `/admin/algorithm` |
| **Assistent** | (bleibt) Claude-Chat für Notizen/Entwürfe, mit Server-Persistenz | `/admin/assistant` |

Pfade **ohne `[locale]`** — der `/admin`-Umzug ist ein eigener Infra-Pass
(§7 „Phase 1b"), bis dahin läuft alles unter `/dashboard/admin/*`.

---

## 1. Ausgangslage (Code-Check 2026-08-31)

Zwei Analyse-Durchläufe. Kern: **30 von ~37 DB-Tabellen ohne jede Admin-Sicht**,
alles läuft über **eine 785-Zeilen-Route** (`api/admin/dashboard`, 18-Wege-
`switch`, keine Validierung), kein Server-Gate, keine geteilten Typen/Primitives.

### 1.1 Was fehlt komplett

| Bereich | Backend existiert | Admin-Sicht |
|---|---|---|
| **Billing / Stripe** | `subscriptions`-Tabelle, `api/billing/{checkout,portal,webhook}`, `lib/stripe.ts` | **keine** — kein Abo sichtbar, Webhook-Events werden nicht persistiert (keine Idempotenz), Benutzer-Seite ohne Plan-Spalte |
| **Kosten** | — | **nichts** — keine Aggregation von Vercel/Supabase/Anthropic/Brevo, kein Burn/Runway |
| **E-Mail** | `api/auth/send-email` (Supabase-Hook), `lib/email/brevo.ts`, `emails/*`, `api/newsletter` (Loops) | **keine** — kein Send-Log, kein Bounce-Handling; im Email-Plan als SPOF markiert |
| **i18n** | Branch `benny/i18n-content-translation`: `scripts/translate-content.mjs`, TM als JSON, `docs/i18n/glossary.json` | **keine** — Coverage nur CLI, Lauf ist manueller Laptop-Job |
| **Consent** | `lib/cookie-consent.ts` (`CONSENT_VERSION = 2`), `components/cookie/*` | **keine** — nur `localStorage`, **kein Server-Record** → Art.-7-DSGVO-Nachweis = ein `ts` im Browser |
| **Changelog / News** | `data/changelog.json` (+ Script) **und** `data/updates.json` (+ `lib/updates.ts`) — zwei parallele handgepflegte Systeme | **keine** |
| **Cron / Automatisierung** | 7 Vercel-Crons, `automation_job_runs` + `automation_error_memory` | **minimal** — nur letzte 20 Zeilen auf dem Engine-Tab, nur 3 von 7 Jobs auslösbar, `automation_error_memory` unsichtbar |
| **Knowledge OS** | 19 `knowledge_*`-Tabellen (CMS mit Versionierung/Review/Media) | **keine** — nur per SQL |
| **Grows & Diagnosen** | `grows`/`plants`/`log_entries` + `diagnoses`/`recommendations`/`recommendation_events`/`diagnosis_outcomes`/`plant_health_snapshots` | **keine** — Kern des Produkts ohne operatives Dashboard |

**Cron-Fahrplan (`apps/web/vercel.json`):** `study-refresh` (tgl 04:17),
`engine-sync` (tgl 04:37), `engine-health` (tgl 04:47), `health-snapshot`
(tgl 04:50), `engine-adapt` (Mo 05:00), `engine-reprocess` (Mo 05:15),
`cleanup` (So 04:40). Auth via `CRON_SECRET`.

### 1.2 Bugs & tote UI im Bestand

| # | Fundstelle | Problem |
|---|---|---|
| B1 | `users` + `users-list` | Suche & Rollenfilter filtern nur die aktuelle 25er-Seite (Server filtert *nach* Pagination) — wer auf Seite 2+ liegt ist unauffindbar |
| B2 | `users-list` | `total`/`totalPages` sind ein zugegebener Schätzwert (`?? users.length`) |
| B3 | `analytics` | „Ø Score" mittelt nur die Top-20-Studien; „Study Types" zählt distinkte Typen statt Studien |
| B4 | `page.tsx` → `studies` | Deep-Link `?filter=pending` wird von der Zielseite ignoriert |
| B5 | `studies` | Suche ohne Debounce → Fetch pro Tastenanschlag |
| B6 | `algorithm` | Kein Dirty-State-Guard; Save-Buttons nicht disabled wenn `tableExists === false` (jeder Klick → 500) |
| B7 | `algorithm` | „Blockierte Quellen" als einzige Sektion ohne „Zurücksetzen"; `reason`-Input nie gerendert |
| B8 | `dashboard/route.ts` `engine-*` | Server-zu-Server-`fetch` mit Base-URL-Raterei; kein Progress bei langen Läufen; keine Bestätigung bei destruktiven Nicht-Dry-Runs |
| B9 | `types.ts` | `UserRole` enthält `"TEAM"`, von UI + Server abgelehnt → TEAM-User uneditierbar → **`"TEAM"` raus** (Entscheidung §8) |
| B10 | mehrere | Backend kann mehr als die UI zeigt (`reviewNote`, `studyType`-Filter, `batchSize`, blocked-source `reason`); kein Studien-Detail-View; keine Zeitreihe irgendwo |
| B11 | `assistant` | „geräteübergreifend"-Copy, ist reines `localStorage`; kein Streaming, kein Markdown |

### 1.3 Design-System-Verstöße (durchgängig)

`emerald-*` als Erfolgs-/Markengrün (§5 sagt `--primary`); rohes `red-*` statt
`rose-*`; handgerollte Pills statt `<Badge tone>`; Modal-Buttons statt
`<CTAButton>`; 4 verschiedene Banner-Muster statt `<Alert>`; bespoke `<Card>`/
`<BarChart>`-Nachbauten; zwei handgebaute Toggle-Modals statt eines geteilten.

---

## 2. Recherche — Leitstand-Prinzipien

Quellen: [SaaS-Admin-Panel-UX](https://taqwah.agency/blog/saas-admin-panel-design-guide) ·
[Admin-Dashboard Best Practices](https://rosalie24.medium.com/admin-dashboard-design-best-practices-for-saas-platforms-2f77e21b394b) ·
[Next.js-SaaS-Admin](https://dev.to/whoffagents/building-a-saas-admin-dashboard-with-nextjs-14-users-metrics-and-feature-flags-2ikf) ·
[Audit-Logging für interne Tools](https://appmaster.io/blog/audit-logging-internal-tools-activity-feed) ·
[Cron-Job-Monitoring](https://cronitor.io/cron-job-monitoring)

1. **Panel = Handeln & Steuern, nicht Beobachten.** Jede Ansicht ermöglicht
   eine Handlung, nicht nur eine Zahl (deckt sich mit §18).
2. **Briefing: 3–5 kritische Kennzahlen, einspaltig nach Priorität.** Alarme
   oben, Rest darunter. Nicht „alles was wir haben".
3. **Modulare Struktur.** Module docken über eine Registry an, ohne den Rest
   anzufassen — Pflicht, weil laufend Features dazukommen.
4. **Audit-Log als Rückgrat.** „Wer hat was wann" mit Feld-Diff, unveränderlich.
5. **Cron braucht Lauf-Historie.** Job, Schedule menschenlesbar, letzter/
   nächster Lauf, Erfolgsquote, Ø-Dauer, stdout/Fehler, Stale-Alarm, „jetzt
   ausführen". Das trennt auch auf `/status` die automatischen Läufe von den
   manuellen Neuigkeiten.
6. **Row-Expansion statt Seiten-Sprünge** für Nutzer/Abos.
7. **Real-time-Erwartung** — pragmatisch: `revalidate`-Tags + gezieltes
   Client-Polling auf Lauf-/Health-Ansichten, kein Voll-SPA.

---

## 3. Ziel-Architektur

### 3.1 Navigation (Registry)

```
LAGE
  Lage                     /admin                (= Morgen-Briefing)

GELD
  Finanzen                 /admin/finance
  Wachstum                 /admin/growth

MENSCHEN
  Nutzer                   /admin/users
  Zustellung / Mail        /admin/mail

INHALTE
  Content & Wissen         /admin/content
  Engine                   /admin/engine
  Algorithmus              /admin/algorithm

MASCHINE
  Betrieb                  /admin/ops
  Steuerung                /admin/control
  Audit-Log                /admin/audit

SONSTIGES
  Compliance               /admin/compliance
  Assistent                /admin/assistant
```

Gerendert aus `components/admin/nav.ts` (steht schon, Phase 0). Neue Seite =
ein Registry-Eintrag. `status: "planned"`-Einträge mit Phasen-Marker sind bis
zu ihrer Phase ausgeblendet. `badge?` erlaubt Live-Zähler (offene Reviews,
past_due-Abos), `flag?` blendet hinter Feature-Flag aus.

### 3.2 Technische Architektur

| Thema | Heute | Ziel |
|---|---|---|
| API | 1 Datei, `POST` + `switch`, keine Validierung | **Ressourcen-Routen** `app/api/admin/<modul>/route.ts`, echte Verben, **zod**, geteilte Contracts in `lib/admin/contracts.ts` |
| Auth | clientseitig, doppelt pro Navigation | Client-Gate bleibt (UX); echte Grenze = `requireAdmin`-Bearer in jeder Route. Server-`layout.tsx`-Gate braucht `@supabase/ssr` → Phase 1b |
| Rendering | alle Seiten `"use client"` | RSC für den Daten-Load (`fetch` + `revalidate`-Tag), Client-Inseln nur für Interaktion |
| Typen | inline pro Seite, `EngineConfig` dupliziert | `lib/admin/contracts.ts` — eine Quelle |
| Engine-Trigger | Self-`fetch` mit Base-URL-Raterei | Automations-**Logik** direkt aufrufen (`runEngineSync(opts)`), Cron-Route wird dünner Wrapper |
| Mutations | ad-hoc | jede Mutation → `withAudit()` → `admin_audit_log` |

**Geteilte Primitives (`components/admin/`)** — stehen z. T. schon:
`<AdminPage>`/`<AdminPageSkeleton>` ✓, `<Alert>` ✓, `<StatCard>`/`<KpiRow>` ✓;
noch zu bauen: `<DataTable>` (serverseitig sortieren/paginieren/Debounce/Row-
Expansion/Bulk), `<AdminModal>`, `<RunHistory>`, `<TrendLine>`/`<BarList>`
(dataviz-Palette), `<MoneyValue>` (€-Formatierung + Vorzeichen-Farbe),
`<Sparkline>`.

### 3.3 Kosten — so automatisch wie möglich

| Quelle | Wie | Aufwand |
|---|---|---|
| **Stripe** | `stripe.balanceTransactions` / `payouts` / `invoices` — Umsatz, Gebühren, Auszahlungen live über die schon integrierte Stripe-Lib | gering |
| **Anthropic** | Token-Zählung **im Code**: jeder `askClaude()`-Call schreibt `{model, inTok, outTok, €}` in `ai_usage`. €-Faktor aus einer Preistabelle (`lib/admin/pricing.ts`, per `claude-api`-Skill gepflegt). Deckt Admin-Assistent + i18n-Läufe ab | mittel |
| **Vercel** | Vercel-API (`/v1/usage` bzw. Rechnungs-Endpoint) wenn API-Token gesetzt, sonst monatlicher Handeintrag | mittel |
| **Supabase** | keine brauchbare Kosten-API → monatlicher Handeintrag (Plan-Fixbetrag + evtl. Zusatz) | gering |
| **Brevo** | Kontingent-Endpoint für Rest-Credits; Kosten = Plan-Fixbetrag monatlich | gering |
| **Domain** | Fixbetrag/Jahr, Handeintrag mit Ablaufdatum (→ Alert) | gering |

Neue Tabelle **`cost_entries`** (`service`, `period_month`, `amount_cents`,
`source: "auto"|"manual"`, `note`, `created_at`). Auto-Quellen schreiben via
Cron `cost-sync` (neu). `finance`-Seite zeigt: MRR, Kosten/Monat gestapelt nach
Dienst, **Burn** (Kosten − Umsatz), **Runway** (Kontostand ÷ Burn — Kontostand
als Handeintrag oder Stripe-Balance + Puffer), 6-Monats-Trend.

### 3.4 Alert-System

Neue Tabelle **`alert_rules`** (`key`, `enabled`, `threshold jsonb`,
`channel: "email"`, `last_fired_at`). Cron **`alert-check`** (alle 15–30 min)
wertet die Regeln aus und schickt bei Auslösung eine E-Mail an Benny über den
**bestehenden Brevo-Adapter** (`lib/email/brevo.ts`). Standard-Regeln:

- Cron seit > (Schedule-Intervall × 1,5) ohne Erfolg
- Mail-Hook: letzter Send-Fehler / Hook seit > X h ohne Erfolg
- neue Pro-Zahlung (positiv, zur Motivation)
- Abo `past_due` oder `canceled`
- Monatskosten projiziert > Budget (`alert_rules.threshold.budget_cents`)
- Studien-Review-Queue > N
- Sentry-Fehlerrate > Baseline (wenn Sentry-API-Token gesetzt)
- Domain-/SSL-Ablauf < 30 Tage

Jede Alert-Mail verlinkt tief in das zuständige Modul. Auslösungen landen auch
im **`admin_audit_log`** (`resource: "alert"`) für eine Historie.

---

## 4. Module im Detail

### 4.1 Lage (Morgen-Briefing) — `/admin`

Einspaltig, nach Priorität. Server Component, `revalidate: 60`.

1. **Braucht Entscheidung** (nur wenn nicht leer, `<Alert>`-Stack): roter Cron,
   Mail-Hook down, `past_due`-Abo, Review-Queue über Schwelle, Kosten über
   Budget, Migrations-Drift prod. Jede Zeile verlinkt in ihr Modul.
2. **Geld heute** (`<KpiRow>`): Umsatz heute · Umsatz MTD · aktive Pro · MRR ·
   Runway (Tage). Delta zu gestern/Vormonat.
3. **Menschen** (`<KpiRow>`): neue Nutzer 24 h / 7 T · aktive Grows · Aktivierung
   (Anteil neuer Nutzer mit erstem Grow) · Kündigungen 7 T.
4. **Über Nacht gelaufen** (`<RunHistory>` kompakt): die 7 Crons der letzten
   24 h — grün/rot, Dauer, kurzer Output. „Alles grün" wenn ok.
5. **Content-Puls**: Review-Queue-Größe · neue Studien 24 h · Übersetzungs-
   Coverage % · letzter Wissens-Artikel-Edit.

### 4.2 Finanzen — `/admin/finance`

- **Voraussetzung:** `stripe_events`-Tabelle (Webhook-Idempotenz + Persistenz),
  `cost_entries`-Tabelle, Cron `cost-sync`.
- Umsatz: MRR/ARR, MtD/letzter Monat, ARPU, `<TrendLine>` 12 Monate.
- Abos: `<DataTable>` (User ↔ Plan ↔ Status ↔ Renewal ↔ Stripe-Links),
  Zähler aktiv/Trial/past_due/canceled. Aktion **Pro manuell gewähren/entziehen**
  (Comp/Support/Refund) → `subscriptions` + `admin_audit_log`.
- Stripe-Health: letzter Event, Signatur-Fehler, unverarbeitete Events + Retry;
  Auszahlungen (nächste, letzte), Gebühren MtD, Promo-Code-Redemptions.
- Kosten: gestapelt nach Dienst/Monat, Handeintrag-Formular für manuelle Posten,
  **Burn & Runway**, Budget pro Dienst (→ Alert).

### 4.3 Wachstum — `/admin/growth`

- Signup-Funnel: Registrierung → E-Mail bestätigt → erster Grow → erster
  Log-Eintrag → Pro. Zahlen + Conversion je Stufe.
- Retention-Kohorten (Monats-Kohorten, „aktiv" = Log-Eintrag im Zeitraum) als
  Heatmap.
- Free→Pro-Conversion über Zeit; Kündigungen mit `cancellation_reason`
  (Stripe-Portal-Feedback, sofern gesetzt) — sonst „ohne Angabe".
- Aktivierungs-Rate als Leit-KPI (auch auf der Lage).

### 4.4 Nutzer — `/admin/users`

- **B1/B2:** Postgres-**View** auf `auth.users` + `user_roles`-Join,
  serverseitig filtern/zählen (echte `total`). Kein nächtlicher Sync.
- `<DataTable>`: E-Mail, Rolle, **Plan** (`subscriptions`-Join), bestätigt,
  registriert, letzte Aktivität. Sortierung, Debounce-Suche, Bulk-Rollen.
- **Detail-Drawer** (Row-Expansion): Plan/Renewal/Stripe-Link, Grows + letzter
  Log, letzte Mails (`email_log`), Consent-Status, Aktivitäts-Timeline.
  Aktionen: Pro geben/entziehen, Rolle, **sperren** (`banned`-Flag →
  Middleware), löschen, **Support-Ansicht** (read-only Impersonation später).
- **B9:** `"TEAM"` aus `UserRole` entfernen (`types.ts`, Server-Whitelist).

### 4.5 Content & Wissen — `/admin/content`

- **Studien:** bestehende Verwaltung (B4/B5/Detail-View/`studyType`-Filter/
  `reviewNote`), plus Engine-Trigger-Panel eingebettet.
- **Wissen (Knowledge OS):** erst mal read-only Liste aus `knowledge_articles`
  (Status live/Entwurf, letzter Edit, `knowledge_reviews`-Queue-Zähler). Voller
  CMS-Editor = eigener Durchgang (`docs/ADMIN_KNOWLEDGE_OS_PLAN.md`).
- **Übersetzungen:** Coverage % pro Quelle (nach `benny/i18n`-Merge), Liste der
  offenen Strings, „Lauf anstoßen" + letzter Lauf/Kosten (aus `ai_usage`).
- **Neuigkeiten-Editor:** `updates`-Tabelle (Backfill aus `updates.json`,
  `lib/updates.ts` liest aus DB). CRUD, `featured`-Toggle (max 1), Vorschau.
  **Speist die `/status`-Seite** — der Chronik-Split (§4.9) wird damit sauber.

### 4.6 Betrieb — `/admin/ops`

- **Cron-Registry** (`components/admin/cronRegistry.ts`, aus `vercel.json`
  abgeleitet): Name, Schedule menschenlesbar, Beschreibung, Route.
- Pro Job: letzter Lauf (Status/Dauer), nächster erwarteter, Erfolgsquote 30 T,
  Ø-Dauer, `<RunHistory>` voller Verlauf (nicht 20 Zeilen), `error_details` +
  `metadata` aufklappbar, Filter nach `job_name`.
- **`automation_error_memory`-Panel:** was steckt im Retry-Backoff
  (`fingerprint`, `fail_count`, `next_retry_at`) — Force-Retry / löschen.
- **„Jetzt ausführen"** für alle 7 Jobs (heute 3), Bestätigung bei Nicht-Dry-Run.
- **Migrationsstand:** lokale vs. Prod-`schema_migrations` gegen
  `supabase/migrations/` — Drift sichtbar machen (siehe die aktuelle
  `202606020014/15`-Altlast + der Prod-Gap von 2026-08-19).
- **Integrations-Status:** welche env-gekoppelten Provider leben (Stripe, Brevo,
  Loops, Anthropic, `CRON_SECRET`, Vercel-Token, Sentry) — „konfiguriert/fehlt".
- **Sentry-Fehlerrate** (wenn API-Token gesetzt), Release/Deploy-Info (live
  Commit, letzter Deploy).

### 4.7 Zustellung / Mail — `/admin/mail`

- **Voraussetzung:** `email_log` (`recipient_hash`, `template`, `locale`,
  `provider_message_id`, `status`, `error`, `sent_at`) + `email_suppression`.
  `api/auth/send-email` + `api/newsletter` schreiben rein. Neuer
  Brevo-Bounce-Webhook `api/email/brevo-webhook` → `status` + Suppression.
- Delivery-Log (`<DataTable>`), Hook-up/down-Indikator, Bounce-/Complaint-Liste,
  „Transaktionsmail erneut senden" (Support), Loops-Newsletter-Signups-Zähler.
- **Broadcast an Segmente** (§5): eine einmalige Mail an „alle Pro", „alle
  past_due", „alle mit Grow aber ohne Log seit 14 T" — Vorlage + Vorschau +
  Test an sich selbst + Bestätigung. Rechtlich: nur transaktionsnah / mit
  Opt-in; Segment-Definition sichtbar, Versand ins `email_log`.

### 4.8 Steuerung — `/admin/control` (die Hebel, siehe §5)

Feature-Flags, Wartungsmodus, Site-Banner, Pricing-Config, Rate-Limits,
Decision-Log — Detail in §5.

### 4.9 Compliance — `/admin/compliance`

- **Voraussetzung:** Server-Consent-Beacon + `consent_records`
  (`anon_id`, `choice`, `version`, `gpc`, `ua_hash`, `created_at`).
- Consent-Version-Registry + gegatete Tools ohne Deploy editierbar; Accept-all-
  vs. Essential-Rate, GPC-Anteil; Proof-of-Consent-Export für Anfragen.
- **DSGVO-Anfragen-Log** (Auskunft/Löschung) als leichter Tracker.
- **Impressumspflicht-Trigger:** Checkliste, die „aktiv" wird, sobald
  Monetarisierung startet (~Feb 2027) — § 5 DDG, USt, Handelsregister, AVV.
- **Sub-Prozessoren-Liste** (Vercel, Supabase, Stripe, Brevo, Loops, Anthropic,
  Sentry, Plausible) — hält Datenschutz-Seite + Banner synchron.

### 4.10 `/status`-Folgeänderung (schon erledigt, hier zur Doku)

`operationalChangelog`-Merge entfernt; „Automatischer Betrieb" (Läufe) und
„Neuigkeiten" (manuell) sind zwei getrennte Blöcke. Sobald der Neuigkeiten-
Editor (§4.5) auf der `updates`-Tabelle steht, liest der „Neuigkeiten"-Block
daraus statt aus `changelog.json`.

---

## 5. Hebel / Steuerung — was wir bisher übersehen

Konkrete Steuer-Hebel für ein Solo-geführtes Unternehmen, die heute nur als
Code-Konstanten, Env-Vars oder gar nicht existieren:

| Hebel | Heute | Ziel (Modul „Steuerung") |
|---|---|---|
| **Wartungsmodus / Kill-Switch** | `fertilizers`-Route hart auf 503 | `feature_flags` + Middleware: ganze App oder einzelne Route in Wartung/Read-only, mit Hinweistext, ohne Deploy |
| **Feature-Flags** | hartkodierte Konstanten, „Env-Key da?"-Checks | `feature_flags`-Tabelle + UI: `newsletter`, `email_hook`, `ai_assistant`, `translate_button`, `fertilizer_catalog`, per-Locale-Rollout |
| **Site-Banner** | — | globaler Hinweis-Banner („Wartung heute 22 Uhr", „neue Funktion") mit Zeitfenster, ohne Deploy; teilt Datenmodell mit dem Neuigkeiten-Editor |
| **Pricing-Steuerung** | Env-Vars + Stripe-Dashboard | Preis/Trial-Länge/Promo-Codes einsehen; Go-Live-Checkliste (Live-Keys, Webhook, Portal) mit Status; Preis-Anzeige gegen Live-Preise gegenchecken |
| **Rate-Limits / Missbrauch** | **keine** (Security-Audit-Memo) | Top-API-Verbraucher, IP/User throttlen oder sperren, `translate`/`ai-assist` mit Limit; `banned`-Flag auf User |
| **Broadcast-Mail an Segmente** | — | einmalige Mail an ein definiertes Segment (Dunning-Nudge, Feature-Ankündigung) — §4.7 |
| **Decision-Log** | Entscheidungen leben in Plan-Docs/Memory | leichter Tracker im Panel: „worauf bin ich blockiert", „was entschieden wann, warum" — quer verlinkt mit Audit-Log |
| **Backup-Status** | Supabase macht Backups, unsichtbar | letzter Backup-Zeitpunkt + PITR-Fenster anzeigen (Peace of Mind), Test-Restore-Erinnerung |
| **Externe Abhängigkeiten** | verstreut | ein Health-Streifen: DKIM/SPF/DMARC für `secretleaf.net`, SSL-Ablauf, Domain-Renewal-Datum, DNS-Änderungen — mit Ablauf-Alerts |
| **Legal-Trigger** | im Kopf / in Memory | Checkliste, die bei Monetarisierungs-Start scharf schaltet (Impressum, USt, AVV) — §4.9 |
| **Budget & Burn-Alert** | — | Monatsbudget pro Dienst, Alarm bei Projektion über Budget — §3.3/§3.4 |
| **Segment-Definitionen** | ad-hoc pro Query | „Power-User", „at risk", „Champion" einmal definieren, in Wachstum + Mail wiederverwenden |
| **Release-/Deploy-Sicht** | Changelog ist die einzige Spur | live Commit, letzter Deploy, Vercel-Link, „prod hinkt Migrationen hinterher"-Warnung |

---

## 6. Datenbank-Migrationen

| Migration | Tabelle | Zweck | Phase |
|---|---|---|---|
| `202608310000_admin_audit_log.sql` ✓ | `admin_audit_log` | Querschnitts-Audit (append-only, RLS revoked, service-role only) | 0 (Datei da, **noch nicht auf Prod**) |
| `…_ai_usage.sql` | `ai_usage` (`model`, `in_tokens`, `out_tokens`, `cost_cents`, `feature`, `created_at`) | Anthropic-Kosten aus dem Code | 2 |
| `…_cost_entries.sql` | `cost_entries` (`service`, `period_month`, `amount_cents`, `source`, `note`) | Infra-Kosten (auto + manuell) | 2 |
| `…_stripe_events.sql` | `stripe_events` (`id` PK, `type`, `payload`, `received_at`, `processed`, `error`) | Webhook-Idempotenz + Health | 2 |
| `…_email_log.sql` | `email_log` + `email_suppression` | Mail-Log + Bounce | 2 |
| `…_alert_rules.sql` | `alert_rules` (`key`, `enabled`, `threshold`, `channel`, `last_fired_at`) | Alert-System | 2 |
| `…_updates_table.sql` | `updates` (Spiegel `updates.json`) + Backfill | Neuigkeiten-Editor | 3 |
| `…_feature_flags.sql` | `feature_flags` (`key`, `enabled`, `description`, `rollout`, `updated_by`) | Flags + Wartungsmodus | 3 |
| `…_decision_log.sql` | `decision_log` (`title`, `status`, `context`, `decided_at`, `decided_by`) | Decision-Log | 3 |
| `…_consent_records.sql` | `consent_records` | Consent-Nachweis | 4 |
| `…_user_moderation.sql` | Spalte `user_roles.banned bool` (oder eigene `user_moderation`) | Sperren | 3 |

Alle service-role-write, admin-read. Timestamps streng monoton, Prod-Push
verifizieren (siehe `secretleaf_security_migration_gap_2026_08_19`). Lokale
Migrations-Historie hat einen Drift (`202606020014/15` als applied eingetragen,
Dateien fehlen) — separat mit `supabase migration repair` glätten.

---

## 7. API-Umbau

`app/api/admin/dashboard/route.ts` (785 Z., 18 Actions) → Ressourcen-Routen:

```
app/api/admin/
  overview|briefing/route.ts   GET   (Lage)   ← Phase 1
  finance/route.ts             GET, PATCH (grant/revoke)
  finance/costs/route.ts       GET, POST (manueller Posten)
  growth/route.ts              GET
  users/route.ts               GET, PATCH, DELETE, POST (bulk, ban)
  users/[id]/route.ts          GET   (Detail-Drawer)
  content/studies/route.ts     GET, PATCH, DELETE, POST (bulk)
  content/knowledge/route.ts   GET
  content/updates/route.ts     GET, POST, PATCH, DELETE
  ops/route.ts                 GET   (cron registry + runs + error-memory + integrations)
  ops/run/route.ts             POST  (job-name, dry-run)
  ops/error-memory/route.ts    DELETE
  mail/route.ts                GET
  mail/broadcast/route.ts      POST
  control/flags/route.ts       GET, PATCH
  control/decisions/route.ts   GET, POST, PATCH
  compliance/route.ts          GET
  audit/route.ts               GET
  algorithm/route.ts           GET, PATCH, POST(reset)
  assistant/route.ts           POST (stream)
```

Jede Route: `requireAdmin` → zod → Handler → bei Mutation `withAudit()`.
Geteilte Contracts in `lib/admin/contracts.ts`. Client: `adminFetch<T>()` ✓.
`engine-*`: `lib/automation/*` exportiert `runX(opts)`, Cron + Admin rufen
dieselbe Funktion — kein Self-`fetch`. Alt-Route bleibt Deprecation-Shim bis
alle Module migriert sind, dann löschen.

### Phase 1b — Admin-Routing + Server-Auth (eigener Infra-Pass)
`@supabase/ssr` einführen → Cookie-Session serverseitig; Admin von
`/[locale]/dashboard/admin/*` nach `/admin/*` (Redirects, `proxy.ts`-Matcher,
`ADMIN_BASE` flippen); Server-`layout.tsx` mit echtem `requireAdmin`-Gate.
Grund für die Auslagerung: `<CTAButton>` + next-intl `<Link>` erzwingen ein
`/de`-Präfix; sauber lösen statt mit den Modul-Bauten verzahnen.

---

## 8. Entscheidungen (2026-08-31 geklärt)

1. **Nutzung:** tägliches Morgen-Briefing als Zentrum, Module dahinter.
2. **Module:** alle vier (Finanzen/Wachstum/Content/Betrieb) + ausgebaute Mail
   + die Hebel aus §5.
3. **Kosten:** so automatisch wie möglich — Anthropic-Token im Code zählen,
   Vercel/Supabase/Brevo per API wo verfügbar, Rest monatlicher Handeintrag.
4. **Alerts:** gezielte E-Mail-Benachrichtigungen über den Brevo-Adapter.
5. **`[locale]` raus** → `/admin`, aber Phase 1b (eigener Infra-Pass).
6. **`updates.json` → Tabelle.**
7. **`"TEAM"` aus `UserRole` entfernen.**
8. **Knowledge OS** = eigener Durchgang; hier nur read-only Liste.
9. **Benutzer-Filter** = Postgres-View auf `auth.users`.

---

## 9. Phasenplan

### Phase 0 — Fundament ✓ (committet)
- [x] `admin_audit_log`-Migration + `withAudit()`/`diffFields()` (`lib/admin/audit.ts`)
- [x] `lib/admin/contracts.ts`, `lib/admin/http.ts` (`adminRoute()`), `lib/admin/client.ts` (`adminFetch`)
- [x] Nav-Registry (`components/admin/nav.ts`) + `AdminShell` darauf
- [x] Primitives: `<AdminPage>`, `<Alert>`, `<StatCard>`/`<KpiRow>`
- [x] `/status`-Chronik-Split
- [ ] Migration `admin_audit_log` auf Prod fahren
- [ ] Restliche Primitives: `<DataTable>`, `<AdminModal>`, `<RunHistory>`, `<TrendLine>`/`<BarList>`, `<MoneyValue>`

### Phase 1 — Lage + Betrieb (das tägliche Briefing steht) ✓
- [x] `components/admin/cronRegistry.ts` (7 Jobs aus `vercel.json` + `nextCronRun`/`cronIntervalMs`)
- [x] `api/admin/briefing/route.ts` — Geld/Menschen/Content-Puls/Nacht-Läufe/„braucht Entscheidung" in einem Call
- [x] **Lage-Seite** (`/dashboard/admin`) als Morgen-Briefing (§4.1) auf Primitives
- [x] **Betrieb-Seite** (`/dashboard/admin/ops`, §4.6): Cron-Jobs mit Lauf-Historie + Erfolgsquote + „Ausführen"/„Test" (→ `api/admin/ops/run`, audit-geloggt), `automation_error_memory`-Panel, Integrations-Status. `api/admin/ops/route.ts` GET + `api/admin/ops/run/route.ts` POST.
- [x] **Prune:** `/algorithm`, `/analytics`, `/engine`-Seiten gelöscht (Studien-Engine = nur Notfall-Zugriff, Entscheidung §8/2). Mega-Route `api/admin/dashboard` von 785 → ~380 Z., als deprecated markiert — nur noch `studies*`, `users*`, `ai-assist`.
- [x] Nav: neue IA (Lage / Geld / Menschen / Inhalte / Maschine / Sonstiges), aus der Registry
- [x] `tsc` + `eslint` clean; ops/run + Audit-Log end-to-end verifiziert
- [ ] Migrationsstand-Panel in Betrieb (braucht Prod-DB-Zugriff → mit Phase 1b)

### Phase 2 — Geld & Zustellung
- [x] Migrationen `202608310001_ai_usage.sql`, `202608310002_cost_entries.sql` (lokal angewendet; **noch nicht Prod**)
- [x] `lib/admin/pricing.ts` (Anthropic-Preistabelle aus dem `claude-api`-Skill) + `lib/admin/aiUsage.ts` (`recordAiUsage`, fire-and-forget)
- [x] `askClaude()` schreibt `ai_usage` (model/tokens/cache/€, mit `feature` + `actorId`)
- [x] **Finanzen-Seite** (`/dashboard/admin/finance`, §4.2): `api/admin/finance` GET (Abo-Zahlen + **live Stripe MtD** brutto/Gebühren/netto wenn `STRIPE_SECRET_KEY` da; verifiziert gegen Sandbox: 59 € brutto / 2,11 € Gebühr) + Kosten pro Monat nach Dienst (inkl. synthetischer „anthropic"-Reihe aus `ai_usage`) + Burn. POST = manueller Kosten-Posten (`cost_entries`, audit-geloggt). Nav: `finance` live.
- [ ] Migrationen `stripe_events`, `email_log`, `alert_rules`
- [ ] Stripe-Webhook schreibt `stripe_events` (Idempotenz + Health); Send-Email-Hook + Newsletter schreiben `email_log` (braucht `benny/email-templates`-Merge)
- [ ] Cron `cost-sync` (Vercel/Brevo APIs) + `alert-check` (→ Brevo-Mail)
- [ ] **Mail-Seite** (§4.7) inkl. Brevo-Bounce-Webhook
- [ ] Alert-System scharf, Standard-Regeln seeden

### Phase 3 — Menschen & Inhalte & Hebel
- [ ] Benutzer-Seite neu (§4.4): Postgres-View, `<DataTable>`, Detail-Drawer, `TEAM` raus, `banned`
- [ ] Wachstum-Seite (§4.3): Funnel, Kohorten, Conversion
- [ ] Content-Seite (§4.5): Studien + Knowledge-Liste + Neuigkeiten-Editor (`updates`-Tabelle) → `/status` liest daraus
- [ ] Steuerung-Seite (§4.8/§5): `feature_flags` + Wartungsmodus + Site-Banner + `decision_log` + Pricing-Checkliste
- [ ] Algorithmus: B6, B7, Typ-Import, Datei-Split

### Phase 4 — Compliance & Rest
- [ ] Consent-Beacon + `consent_records` + Compliance-Seite (§4.9)
- [ ] i18n-Coverage in Content (nach Branch-Merge)
- [ ] Rate-Limits / Missbrauchs-Panel, externe-Abhängigkeiten-Health
- [ ] Assistent: Streaming/Markdown + Server-Persistenz

### Phase 1b — Admin-Routing + Server-Auth (parallel möglich, §7)

---

## 10. Definition of Done (pro Phase)

- `tsc --noEmit` + `eslint` clean über alle berührten Dateien
- `next dev`: jede Admin-Route 200, entfernte 404, keine Compile-Fehler
- Jede schreibende Aktion → `admin_audit_log`-Eintrag
- Kein `emerald-*`/`red-*`-Hardcode auf berührten Seiten; `<Badge>`/`<Alert>`/`<CTAButton>` durchgängig
- Kein `"use client"` auf reinen Daten-Lade-Seiten
- Neue Migrationen gegen lokale DB **und** Prod gefahren + verifiziert
- Neue Kosten-/Alert-Quellen: ein echter Testlauf dokumentiert
