# SecretLeaf
> Evidence-basierte Cannabis-Plattform für DACH. Studies-Hub, Database, Tools, interne Review-Queue und Betriebsstatus.

**Live:** [secretleaf.vercel.app](https://secretleaf.vercel.app)

---

## Stand v1.4 (April 2026)

| Bereich | Status | Details |
|---------|--------|---------|
| **Deployment** | ✅ Live | [secretleaf.vercel.app](https://secretleaf.vercel.app) |
| **Studies-Hub (Terpira)** | ✅ Live | 13 Artikel + Nährstoffmängel, Schädlinge, Quellen |
| **Database-Bereich** | ✅ Live | Dünger-Katalog + Fachregister-Übersicht |
| **Tools-Bereich** | ✅ Live | Pläne und operative Werkzeuge getrennt vom Katalog |
| **Quellenregister** | ✅ Live | 41 manuelle + 22 auto-Quellen, Coverage-Tracking |
| **Status-Seite** | ✅ Live | Cockpit-Redesign, Freshness-Badges, Sektionsreihung |
| **Studien-Ranking API** | ✅ Live | `/api/search/studies` (smart/fresh/quality Scoring) |
| **Vercel Cron** | ✅ Aktiv | Täglich 04:17 UTC, kein PC nötig |
| **Wiki-Studien-Sync** | ✅ Aktiv | GitHub Actions, täglich 04:30 UTC, Review-PR |
| **Studien-Review (intern)** | ✅ Neu | `/dashboard/review` — 3-Zeilen-Karten, 1-Klick-Entscheidung |
| **Fertilizer Prices API** | ✅ Live | `/api/fertilizers/prices` + Sync-Pipeline |
| **Status-Automation** | ✅ Aktiv | Probe alle 30 s, `status-data.json` aktuell |
| **API (Fastify)** | ✅ Stabil | Health, Status-Report, Public Endpoints |
| **Datenbank (Prisma)** | 🟡 Konfiguriert | Schema ready, DB-Endpoint nicht produktiv |
| **Monitoring** | 🟡 Partial | Status-Probe aktiv, Sentry ausstehend |

---

## Architektur (Monorepo)

```
apps/
   api/      Fastify REST-API (Health, Auth, Listings, Public, Status-Report)
   web/      Next.js 16 App-Router (Studies, Database, Tools, Search, Auth, Dashboard)
packages/
   shared/   Gemeinsame TypeScript-Typen
scripts/    Automation (Preise, Wiki-Studien, Coverage, Status-Probe)
.github/
   workflows/  Wiki-Studien-Sync (täglich, Node 24, Review-PR)
```

Deployment: Vercel (Frontend) · API & DB: eigenes Hosting vorbereitet

---

## Release v1.4

Schwerpunkte dieser Version:

- Neue kanonische IA mit klarer Trennung: `Studies`, `Database`, `Tools`, `Dashboard`, `Search`
- Neuer `Database`-Hub mit professioneller Fachregister-Sektion (Schaedlinge, Naehrstoffmaengel, Quellen)
- Neuer `Tools`-Hub als operativer Bereich getrennt von Kataloginhalten
- Dashboard-Workflow konsolidiert auf `/dashboard/review`
- Navigation, Landing-Copy und interne Verlinkungen durchgaengig auf neue IA umgestellt
- Legacy-Routen aus Altstruktur entfernt, um dauerhafte Konsistenz zu sichern

---

## Seiten-Übersicht

| Route | Art | Inhalt |
|-------|-----|--------|
| `/` | Dynamisch | Landing, API-Snapshot, CTAs |
| `/studies` | Statisch | Hub mit 13 Artikeln, Lernpfade, Statistiken |
| `/studies/[slug]` | Dynamisch | Artikel-Detail: Glossar, FAQ, Explainer, Quellen |
| `/studies/sources` | Statisch | Quellenregister (41 manuell + 22 auto) |
| `/studies/pests` | Statisch | Schädlings-Protokolle mit Bildnachweis |
| `/studies/deficiencies` | Statisch | Nährstoffmangel-Guide (Makro/Mikro/Sekundär) |
| `/database` | Statisch | Datenbank-Hub inkl. Fachregister-Einstieg |
| `/database/fertilizers` | Statisch | Dünger-Katalog |
| `/tools` | Statisch | Tools-Hub |
| `/tools/plans` | Statisch | Düngepläne nach Level/Substrat/Ziel |
| `/status` | Dynamisch | Betriebsstatus, Coverage-Verlauf, Changelog |
| `/search` | Dynamisch | Suche mit Autocomplete |
| `/dashboard` | Statisch | Authentifizierte User-Area + Einstieg Studien-Review |
| `/dashboard/review` | Statisch | **Intern:** Studien-Review-Inbox, 1 min/Studie |
| `/auth` | Statisch | Login / Registrierung |

---

## Interner Workflow: Studien-Review

Der Sync liefert täglich frische Studien aus Crossref, die algorithmisch vorgefiltert und mit Scoring versehen sind. Das interne Review läuft auf `/dashboard/review` (nur eingeloggt):

- **3-Zeilen-Zusammenfassung** je Studie: Evidenzlevel, Herkunft/Institut, Relevanz für SecretLeaf
- **Herkunftsdaten:** Erstautor, Publisher, Institut/Uni wenn verfügbar
- **Prioritätsreihenfolge:** High → Medium → Low mit Relevanz-Score
- **Entscheidungen:** `Rein` / `Spaeter` / `Nein` — werden im Browser gespeichert
- **Filter-Tabs:** Offen / Rein / Spaeter / Nein / Alle

Workflow in der Praxis:
```
GitHub Actions (04:30 UTC) → Crossref-Sync → autoSources.json → Review-PR
                                                                       ↓
                                                            /dashboard/review
                                                            Entscheide in ~1 min/Studie
                                                            Dann PR mergen oder ablehnen
```

---

## Automatisierungen

### Wiki-Studien-Sync (GitHub Actions)
- Workflow: `.github/workflows/wiki-study-sync.yml`
- Täglich 04:30 UTC · manuell auslösbar (`workflow_dispatch`)
- Filterstufen: Cannabis-Anker, Themen-Cluster, Evidenzscoring, Hard-Exclusions
- Schreibt `apps/web/src/data/terpira/autoSources.json` mit 3-Zeilen-Summaries
- Erstellt Review-PR statt Direkt-Commit auf `main`
- Bericht: `.github/wiki-sync-report.md`

### Studien-Ranking (Server-seitig)
- API: `GET /api/search/studies`
- Modi: `mode=smart|fresh|quality`
- Quellen: `sourceRegister` (manuell + auto) mit Scoring-Breakdown
- Filter: `includeAuto`, `includeManual`, `limit`
- Output: Score + Teilwerte (`queryMatch`, `quality`, `freshness`, `priorRelevance`)

Beispiel:
```
GET /api/search/studies?q=thc+pain&mode=smart&limit=15
```

### Vercel Cron (ohne lokalen PC)
- Datei: `apps/web/vercel.json`
- Cron-Route: `GET /api/automation/study-refresh`
- Schedule: täglich 04:17 UTC (`17 4 * * *`)
- Läuft auf der Live-Seite unabhängig von GitHub und lokalem PC
- Optional geschützt via `CRON_SECRET` Env-Variable

### Status-Probe
- `scripts/status_probe.mjs` — Live-Probes (API + Web)
- Schreibt `status-data.json` alle 30 Sekunden
- Self-healing via `status_ensure_running.sh`

### Fertilizer Prices
- `scripts/sync-fertilizer-prices.mjs` — Preisdaten-Sync
- Ergebnis in `apps/web/src/data/terpira/fertilizerPrices.json`
- API: `GET /api/fertilizers/prices`

### Coverage-History
- `scripts/update-coverage-history.mjs` — Snapshot-Update bei jedem Build
- Läuft automatisch im `prebuild` (Vercel deployed also immer frisch)
- Ergebnis: `apps/web/src/data/fertilizerCoverageHistory.json`

---

## Quellenqualität

**41 manuelle Quellen:**
- 9 Medizinische Fachzeitschriften (JAMA, Lancet, Nature, Addiction …)
- 6 Laborstandards (AOAC, ISO, ASTM …)
- 7 DACH & EU Regulierung (BfArM, Swissmedic, AGES, EMA, GMP)
- 4 Anbau & Genetik (Horticulture, Plant Physiology, Genetics)
- 3 Weitere (Terpene, Pharmakokinetik, Mikrobiologie)
- 12 als Artikel-`sourceIds` mit Peer-Review-Kennzeichnung

**22 Auto-Quellen (dynamisch):**
- Täglich via Crossref-API synchronisiert
- Gefiltert nach Cannabis-Anker, Themen-Cluster, Evidenzstufe
- Jede Studie mit `reviewSummary` (3 Zeilen), `originLabel`, `firstAuthor`
- Vorschlag-Pool — endgültige Aufnahme nach Review in `/dashboard/review`

---

## Nächste Prioritäten

1. **Impressum & Datenschutz (P0)** — DACH-konform, Pflichtinhalt für öffentlichen Betrieb
2. **Produktive Datenbank (P1)** — PostgreSQL + Prisma Migrate für persistente Entscheidungen + Auth
3. **Sentry-Integration (P1)** — Error-Tracking für Frontend und API
4. **Uptime-Monitoring (P2)** — Externer Check auf `/health` mit Alarmierung
5. **OG/Schema-Markup (P2)** — bessere Distribution pro Artikel/Study-Page
