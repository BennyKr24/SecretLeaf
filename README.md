# SecretLeaf
> Evidence-basierte Cannabis-Plattform für DACH. Wiki-Hub, Dünger-Katalog, Quellenregister und Betriebsstatus — transparent, peer-reviewed, diskret.

**Live:** [secretleaf.vercel.app](https://secretleaf.vercel.app)

---

## Stand 27. März 2026

| Bereich | Status | Details |
|---------|--------|---------|
| **Deployment** | ✅ Live | [secretleaf.vercel.app](https://secretleaf.vercel.app) |
| **Wiki-Hub (Terpira)** | ✅ Live | 13 Artikel + neue Seiten: Nährstoffmängel, Schädlinge |
| **Dünger-Katalog** | ✅ Live | Coverage-Audit, Coverage-History, Preishistorie, Pläne |
| **Quellenregister** | ✅ Live | 41 peer-reviewed Quellen, automatisches Coverage-Tracking |
| **Status-Seite** | ✅ Live | Cockpit-Redesign, neue Sektionsstruktur, Freshness-Badges |
| **Wiki-Komponenten** | ✅ Neu | TOC, AskBot, HubClient, ReadingProgress |
| **Fertilizer Prices API** | ✅ Neu | `/api/fertilizers/prices` + Sync-Pipeline |
| **Studien-Ranking API** | ✅ Neu | `/api/search/studies` (smart/fresh/quality Scoring) |
| **Status-Automation** | ✅ Aktiv | Probe alle 30 s, `status-data.json` aktuell |
| **API (Fastify)** | ✅ Stabil | Health, Status-Report, Public Endpoints |
| **Datenbank (Prisma)** | 🟡 Konfiguriert | Schema ready, DB-Endpoint nicht produktiv |
| **Monitoring** | 🟡 Partial | Status-Probe aktiv, Sentry ausstehend |

---

## Architektur (Monorepo)

```
apps/
   api/      Fastify REST-API (Health, Auth, Listings, Public, Status-Report)
   web/      Next.js 16 App-Router (Wiki, Status, Dünger, Suche, Auth)
packages/
   shared/   Gemeinsame TypeScript-Typen
scripts/    Automation (Preise, Wiki-Studien, Coverage, Status-Probe)
```

Deployment: Vercel (Frontend) · API & DB: eigenes Hosting vorbereitet

---

## Seiten-Übersicht

| Route | Art | Inhalt |
|-------|-----|--------|
| `/` | Dynamisch | Landing, API-Snapshot, CTAs |
| `/wiki` | Statisch | Hub mit 13 Artikeln, Lernpfade, Statistiken |
| `/wiki/[slug]` | Dynamisch | Artikel-Detail: Glossar, FAQ, Explainer, Quellen |
| `/wiki/quellen` | Statisch | Quellenregister (41 Einträge) |
| `/wiki/naehrstoffmaengel` | Statisch | Nährstoffmangel-Guide (Makro/Mikro/Sekundär) |
| `/wiki/schaedlinge` | Statisch | Schädlings-Protokolle mit Bildnachweis |
| `/fertilizers` | Statisch | Dünger-Katalog |
| `/fertilizers/coverage` | Statisch | Markenabdeckung + Freshness-Trend |
| `/fertilizers/plans` | Statisch | Düngepläne nach Level/Substrat/Ziel |
| `/status` | Dynamisch | Betriebsstatus, Coverage-Verlauf, Changelog |
| `/search` | Dynamisch | Suche mit Autocomplete |
| `/dashboard` | Statisch | Authentifizierte User-Area |
| `/auth` | Statisch | Login / Registrierung |

---

## Automatisierungen

### Wiki-Studien-Sync (GitHub Actions)
- Workflow: `.github/workflows/wiki-study-sync.yml`
- Täglich 04:30 UTC · manuell auslösbar
- Sammelt neue Studien in `autoSources.json`
- Erstellt Review-PR statt Direkt-Commit auf `main`

### Studien-Ranking (Server-seitig)
- API: `GET /api/search/studies`
- Modi: `mode=smart|fresh|quality`
- Quellen: `sourceRegister` (manuell + auto) mit Scoring-Breakdown
- Filter: `includeAuto=true|false`, `includeManual=true|false`
- Output: Score + Teilwerte (`queryMatch`, `quality`, `freshness`, `priorRelevance`)

Beispiel:

`/api/search/studies?q=thc+pain&mode=smart&limit=15`

### Status-Probe
- `scripts/status_probe.mjs` — Live-Probes (API + Web)
- Schreibt `status-data.json` alle 30 Sekunden
- Self-healing via `status_ensure_running.sh`

### Fertilizer Prices
- `scripts/sync-fertilizer-prices.mjs` — Preisdaten-Sync
- Ergebnis in `apps/web/src/data/terpira/fertilizerPrices.json`
- API: `GET /api/fertilizers/prices`

### Coverage-History
- `scripts/update-coverage-history.mjs` — Snapshot-Update
- Läuft automatisch im `prebuild`
- Ergebnis: `apps/web/src/data/fertilizerCoverageHistory.json`

### Vercel Cron (ohne lokalen PC)
- Datei: `apps/web/vercel.json`
- Cron-Route: `GET /api/automation/study-refresh`
- Schedule: täglich 04:17 UTC (`17 4 * * *`)
- Optional geschützt über Header `x-cron-key` mit Env `CRON_SECRET`

Wichtig:
- Der Ranking-Endpoint läuft auf der Live-Seite auch wenn dein PC aus ist.
- GitHub Actions werden dafür nicht benötigt.
- Für dauerhafte Speicherung neuer externer Studien außerhalb von GitHub wird später DB/Blob/KV benötigt.

---

## Quellenqualität (41 Quellen)

- 9 Medizinische Fachzeitschriften (JAMA, Lancet, Nature, Addiction …)
- 6 Laborstandards (AOAC, ISO, ASTM …)
- 7 DACH & EU Regulierung (BfArM, Swissmedic, AGES, EMA, GMP)
- 4 Anbau & Genetik (Horticulture, Plant Physiology, Genetics)
- 3 Weitere (Terpene, Pharmakokinetik, Mikrobiologie)
- 12 aufbereitet als Artikel-`sourceIds` mit Peer-Review-Kennzeichnung

---

## Nächste Prioritäten

1. **Produktive Datenbank** — PostgreSQL + Prisma Migrate auf Zielinfrastruktur
2. **Sentry-Integration** — Error-Tracking Frontend + API
3. **Impressum & Datenschutz** — DACH-konform, Pflichtinhalt für Live-Betrieb
4. **Uptime-Monitoring** — Externer Check (z. B. Uptime.com) auf `/health`
5. **OG-Meta pro Artikel** — Social Sharing, Schema.org-Markup
