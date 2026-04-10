# SecretLeaf — v1.5
> Evidence-basierte Cannabis-Wissensplattform für DACH.
> Studies-Hub · Datenbank · Tools · Review-Workflow · Betriebsstatus

**Produktion:** [secretleaf.vercel.app](https://secretleaf.vercel.app) &nbsp;|&nbsp; **Branch:** `main` &nbsp;|&nbsp; **Stand:** April 2026

---

## 🟢 Live-Status

| System | Status | Info |
|--------|--------|------|
| **Vercel Frontend** | ✅ Live | Auto-Deploy bei Push auf `main` |
| **Studies-Hub** | ✅ Live | 13+ Artikel, kategoriegruppiert, Schädlinge, Mängel |
| **Studien-Ranking API** | ✅ Live | `/api/search/studies` — smart / fresh / quality |
| **Quellenregister** | ✅ Live | 41 manuell + 22 auto-Quellen mit Coverage-Tracking |
| **Database-Hub** | ✅ Live | Dünger-Katalog, Fachregister-Einstieg |
| **Tools-Hub** | ✅ Live | Operative Werkzeuge, Düngepläne |
| **Status-Seite** | ✅ Live | Cockpit mit 6 Gesundheitskarten, Coverage-Verlauf |
| **Review-Dashboard** | ✅ Live | `/dashboard/review` — 1-Klick-Workflow intern, mobil optimiert |
| **Vercel Cron** | ✅ Aktiv | Täglich **04:17 UTC** — läuft ohne lokalen PC |
| **Wiki-Studien-Sync** | ✅ Aktiv | GitHub Actions täglich **04:30 UTC** — Review-PR |
| **Status-Probe** | ✅ Aktiv | Alle 30 s, schreibt `status-data.json` |
| **Fertilizer Prices API** | ✅ Live | `/api/fertilizers/prices` + Sync-Pipeline |
| **Coverage-History** | ✅ Aktiv | Build-Snapshot via `prebuild` |
| **Fastify API** | 🟡 Bereit | Health, Status-Report, Public Endpoints konfiguriert |
| **Produktive DB (Prisma)** | 🟡 Pending | Schema ready — DB-Endpoint nicht produktiv |
| **Sentry** | 🔴 Fehlt | Error-Tracking noch nicht eingebunden |

---

## 📐 Architektur (Monorepo)

```
SecretLeaf/
├── apps/
│   ├── api/           Fastify REST-API  (Health · Auth · Listings · Status-Report)
│   └── web/           Next.js App-Router (Studies · Database · Tools · Dashboard · Search)
│       ├── src/app/   Routen + API-Handler
│       ├── src/components/
│       ├── src/data/terpira/   Wiki-Artikel + autoSources.json
│       └── src/lib/            Utilities, Auth, API-Client
├── packages/
│   └── shared/        Gemeinsame TypeScript-Typen (@secretleaf/shared)
├── scripts/           Automation (Status-Probe, Preise, Coverage, Wiki-Sync)
├── supabase/
│   └── migrations/    PostgreSQL-Migrationen (Rollen, RLS, Studies, Automation)
└── .github/workflows/ Wiki-Studien-Sync (CI täglich)
```

**Deployment:** Vercel (Frontend, Crons) · API & DB: eigenes Hosting vorbereitet
**Stack:** Next.js 15 · Fastify · TypeScript · Tailwind CSS · Supabase PostgreSQL · Prisma

---

## 🗺️ Alle Routen

| Route | Typ | Beschreibung |
|-------|-----|--------------|
| `/` | Dynamisch | Landing, API-Snapshot, CTAs |
| `/studies` | Statisch | Hub — Artikel kategoriegruppiert, Lernpfade |
| `/studies/[slug]` | Dynamisch | Artikel-Detail: Glossar, FAQ, Quellen |
| `/studies/sources` | Statisch | Quellenregister (41 manuell + 22 auto) |
| `/studies/pests` | Statisch | Schädlings-Protokolle mit Bildnachweis |
| `/studies/deficiencies` | Statisch | Nährstoffmangel-Guide (Makro / Mikro / Sekundär) |
| `/database` | Statisch | Datenbank-Hub + Fachregister-Einstieg |
| `/database/fertilizers` | Statisch | Dünger-Katalog |
| `/tools` | Statisch | Tools-Hub |
| `/tools/plans` | Statisch | Düngepläne nach Level / Substrat / Ziel |
| `/search` | Dynamisch | Suche mit Autocomplete |
| `/status` | Dynamisch | Betriebsstatus, Coverage-Verlauf, Changelog |
| `/dashboard` | Auth | User-Area + Einstieg Review |
| `/dashboard/review` | Auth | **Intern:** Studien-Review-Inbox |
| `/auth` | Statisch | Login / Registrierung |

---

## ⚙️ Automatisierungen

### 1 · Vercel Cron — `study-refresh` (täglich 04:17 UTC)
```
vercel.json → GET /api/automation/study-refresh
```
- Läuft auf der Live-Seite — kein lokaler PC, kein GitHub nötig
- Optional geschützt via `CRON_SECRET` Env-Variable
- Dient als täglicher Refresh-Lauf für bestehende Quellen

### 2 · Vercel Cron — `studies-sync` (täglich 04:27 UTC)
```
vercel.json → GET /api/automation/studies-sync
```
- Crossref-Sync: **6 Cannabis-Queries**, 14 Tage Lookback, 100 Ergebnisse/Query, deduped by DOI/URL
- Erzeugt deutsche Kurz-Zusammenfassungen und akzeptiert Vercel-Bearer-Cron-Auth nativ
- Env: `STUDY_SYNC_CROSSREF_QUERIES` · `STUDY_SYNC_LOOKBACK_DAYS` · `STUDY_SYNC_ROWS_PER_QUERY`

### 3 · GitHub Actions — Wiki-Studien-Sync (täglich 04:30 UTC)
```
.github/workflows/wiki-study-sync.yml
```
- Filter: Cannabis-Anker → Themen-Cluster → Evidenzscoring → Hard-Exclusions
- Schreibt `apps/web/src/data/terpira/autoSources.json` mit 3-Zeilen-Summaries
- **Erstellt Review-PR** statt Direkt-Commit → kein ungeprüfter Code auf `main`
- Bericht: `.github/wiki-sync-report.md`

### 4 · Status-Probe (Daemon, alle 30 s)
```
scripts/status_probe.mjs  →  status-data.json
scripts/status_ensure_running.sh (Self-healing)
```

### 5 · Fertilizer Prices
```
scripts/sync-fertilizer-prices.mjs  →  data/terpira/fertilizerPrices.json
API: GET /api/fertilizers/prices
```

### 6 · Coverage-History (Build-Snapshot)
```
scripts/update-coverage-history.mjs
Läuft automatisch als prebuild — Vercel deployiert immer frisch
Ergebnis: data/fertilizerCoverageHistory.json
```

---

## 🔬 Interner Workflow: Studien-Review

```
GitHub Actions (04:30 UTC)
  └─ Crossref-Sync → autoSources.json (3-Zeilen-Summary, Score, Autor)
       └─ Review-PR wird erstellt
            └─ /dashboard/review (nur eingeloggt)
                 ├─ REIN    → Quelle bestätigt
                 ├─ SPÄTER  → zurückgestellt
                 └─ NEIN    → verworfen
                      └─ PR mergen oder schließen
```

**Review-Karten-Inhalt:**
- Evidenzlevel, Institut/Publisher, Erstautor
- 3-Zeilen-Zusammenfassung (algorithmisch generiert)
- Relevanz-Score für SecretLeaf
- Sortierung: High → Medium → Low

**Filter-Tabs:** Offen · Rein · Später · Nein · Alle

---

## 📊 Quellenqualität

**41 manuelle Quellen:**
- 9 Medizinische Fachzeitschriften (JAMA, Lancet, Nature, Addiction …)
- 6 Laborstandards (AOAC, ISO, ASTM …)
- 7 DACH & EU Regulierung (BfArM, Swissmedic, AGES, EMA, GMP)
- 4 Anbau & Genetik (Horticulture, Plant Physiology, Genetics)
- 12 als Artikel-`sourceIds` mit Peer-Review-Kennzeichnung

**22 Auto-Quellen (dynamisch):**
- Täglich via Crossref-API — 6 Queries, 14 Tage, DOI/URL-deduped
- Jede Studie mit `reviewSummary`, `originLabel`, `firstAuthor`
- Vorschlag-Pool — endgültige Aufnahme erst nach Review

---

## 🔑 Wichtige Env-Variablen

| Variable | Zweck |
|----------|-------|
| `CRON_SECRET` | Schutz der Cron-Route `POST /api/automation/*` |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Datenbankzugriff |
| `NEXTAUTH_SECRET` | Auth-Session |
| `STUDY_SYNC_CROSSREF_QUERIES` | Pipe-getrennte Custom-Queries (optional) |
| `STUDY_SYNC_LOOKBACK_DAYS` | Lookback 1–60 Tage (Standard: 14) |
| `STUDY_SYNC_ROWS_PER_QUERY` | Ergebnisse je Query 20–200 (Standard: 100) |

---

## 🚀 Release-Notes

### v1.5 (April 2026)
- Studien-Liste: **kategoriegruppierte Sektionen** mit Show-More/Weniger
- Status-Seite: **6 Gesundheitskarten** (API, DB, Cron, Pipeline, Studiencount)
- Crossref-Ingestion: **6 parallele Queries**, konfigurierbarer Lookback, DOI/URL-Deduplizierung
- Deutsches Encoding komplett bereinigt (ü/ä/ö/ß) in allen UI-Texten und API-Responses

### v1.5.1 (April 2026)
- Cron-Auth-Fix: Automation-Routen akzeptieren jetzt Vercel `Authorization: Bearer <CRON_SECRET>`
- Studien-Sync gehärtet: Fingerprint-Lookup und Inserts in Batches gegen PostgREST-Limits
- Supabase-Migrationshistorie repariert und Engine-Schema live nachgezogen
- Review-Dashboard mobil optimiert
- Bestehende 578 Studien per Engine-Reprocess vollständig neu bewertet

### v1.4 (März 2026)
- Neue kanonische IA: Studies · Database · Tools · Dashboard
- Premium-UI-Redesign (Stripe/Notion/Apple-Level)
- Studien-Review-Inbox `/dashboard/review`
- Vercel-Cron, Coverage-History, Status-Automation

---

## 🎯 Nächste Prioritäten

| Prio | Aufgabe | Warum |
|------|---------|-------|
| **P0** | Impressum & Datenschutz | DACH-Pflicht für öffentlichen Betrieb |
| **P1** | Produktive Datenbank | PostgreSQL + Prisma Migrate für persistente Review-Entscheidungen |
| **P1** | Sentry-Integration | Error-Tracking Frontend + API |
| **P2** | Uptime-Monitoring | Externer Check auf `/health` mit Alarmierung |
| **P2** | OG / Schema-Markup | SEO-Distribution pro Artikel und Study-Page |
| **P3** | Review-Speed & Bulk-Actions | Mehrere Studien mobil schneller in Serie bewerten |
