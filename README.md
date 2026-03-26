# SecretLeaf

Diskrete, privacy-first Cannabis Plattform (Web + API) mit Fokus auf Sicherheit, Compliance und stabilem Fallback-Verhalten.

## 🚦 Launch-Status auf einen Blick

| Bereich | Status | Bewertung |
|---|---|---|
| Branding / UX | umgesetzt | 🟢 |
| Public API (Landing) | umgesetzt | 🟢 |
| Fallback bei DB/API-Problemen | umgesetzt | 🟢 |
| Systemampel auf Website | umgesetzt | 🟢 |
| Statische Status-JSON fuer spaetere Aenderungen | umgesetzt | 🟢 |
| Warnbanner auf statischer Homepage | umgesetzt | 🟢 |
| Auth + Listings + Search (Core) | umgesetzt | 🟢 |
| Public API Filter (Zone/Preis) | umgesetzt | 🟢 |
| Ranking/Scoring fuer Featured Listings | optional, offen | 🟡 |
| Kontaktformular serverseitig (persist + mail) | offen | 🔴 |
| Monitoring/Alerting (Sentry/Uptime) | offen | 🔴 |
| Rechtstexte final (Impressum/Datenschutz/ToS) | offen | 🔴 |

## ✅ Was wir aktuell haben

### Produkt / Frontend
- Moderne Landing Page mit Live-API-Daten.
- Privacy Messaging und Security-Fokus im UI.
- API Snapshot inkl. Fallback-Anzeige.
- Warnbanner auf der statischen Homepage bei Gelb/Rot oder Fallback.
- Featured Listings mit dynamischem Rendering.
- Schnellfilter auf Landing (`zone`, `minPrice`, `maxPrice`).
- Footer-Systemampel mit Service-Zustand.
- Separate statische Statusseite (`status.html`) mit Auto-Fetch, lokalem Snapshot und JSON-Fallback.

### API / Backend
- `GET /health` fuer Health-Status.
- `GET /public/overview` fuer Landing-Metriken + Featured Listings.
- `GET /public/status-report` fuer Systemampel und 30-Tage-Risikoreport.
- `GET /public/listings` mit Filtern:
  - `locationZone`
  - `minPrice`
  - `maxPrice`
  - `limit`
- Fallback-Modus bei DB-Problemen (kein 500 auf Public-Endpunkten).
- Auth-Flows vorhanden (`/auth/register`, `/auth/login`).
- Listing-Management + Search vorhanden.

### Security / Privacy
- Helmet, CORS-Restriktion, Rate-Limit.
- JWT-basierte Authentifizierung.
- Minimal Logging / sensible Header redacted.
- Pseudonyme User-Struktur im Datenmodell.

## 🧩 Was fuer den Launch noch fehlt

### Blocker (vor Launch)
- Kontaktformular serverseitig anbinden (API + Speicherung + optional E-Mail).
- Monitoring/Alerting aufsetzen (z. B. Uptime + Error Tracking).
- Rechtstexte final und verlinkt bereitstellen.
- Deployment-Runbook inkl. Rollback und Secret-Handling.

### Wichtige Verbesserungen (kurz nach Launch)
- Ranking fuer Featured Listings (z. B. Aktualitaet + Preis + Verifizierungsgrad).
- Admin-Observability (einfaches Ops-Dashboard).
- Abuse/Anomaly Regeln fuer Fraud-Prevention erweitern.

### Optional
- Personalisierte Landing Segmente nach Nutzerintention.
- A/B Tests fuer Conversion auf CTA/Headline.

## 🛠️ API Uebersicht

### Public
- `GET /health`
- `GET /public/overview`
- `GET /public/listings?locationZone=berlin-mitte&minPrice=5&maxPrice=12&limit=6`

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Listings (auth, Provider)
- `GET /listings/mine`
- `POST /listings`
- `PATCH /listings/:listingId`
- `DELETE /listings/:listingId`

### Search (auth)
- `GET /search/offers?locationZone=berlin-mitte&minQuantity=5&maxPrice=10`

## 📡 Systemampel (Web)

Ampel-Logik auf der Startseite:
- 🟢 Gruen: API erreichbar + normale Daten.
- 🟡 Gelb: API erreichbar, aber Fallback/Degraded aktiv (z. B. DB down).
- 🔴 Rot: API nicht erreichbar.

Ziel: Nutzer sehen bei Server-Updates einen klaren Zustand statt harter Fehlermeldung.

### Statische Fallback-Dateien
- `index.html`: statische Premium-Homepage mit Warnbanner.
- `status.html`: separate Status-/Incident-Seite fuer Ausfaelle.
- `status-data.json`: editierbare Snapshot-Datei fuer spaetere manuelle Hinweise oder als harter statischer Fallback.

Ladereihenfolge auf der statischen Statusseite:
1. Live aus API (`/health`, `/public/overview`, `/public/status-report`)
2. Statische Datei `status-data.json`
3. Lokaler Browser-Snapshot
4. Harter eingebauter Notfall-Fallback

## 🚀 Quickstart

1. Installieren

```bash
npm install
```

2. Env vorbereiten

```bash
cp .env.example .env
```

3. DB + Prisma

```bash
npm run prisma:generate --workspace @secretleaf/api
npm run prisma:push --workspace @secretleaf/api
```

4. Starten

```bash
npm run dev
```

- Web: `http://localhost:3000`
- API: `http://localhost:4000`

## 🧪 Quality Gates vor Go-Live

```bash
npm run typecheck
npm run build
```

Manuell pruefen:
- Landing lädt bei API online korrekt.
- Landing zeigt bei DB-Down gelbe Ampel + Fallback-Datenmodus.
- Landing zeigt bei API-Down rote Ampel.
- Statische Homepage zeigt Warnbanner bei Gelb/Rot oder JSON-Fallback.
- `status.html` zieht erst Live-Daten und faellt dann auf `status-data.json` zurueck.
- Login/Register + Provider Listing Flows funktionieren.

## 📅 Empfohlene Launch-Reihenfolge

1. Kontaktformular serverseitig fertigstellen.
2. Monitoring + Alerts aktivieren.
3. Rechtstexte finalisieren.
4. Staging Smoke-Test.
5. Produktion deployen.

## 💾 Letzte Sicherung

Nach dieser Aenderung sollte ein Archiv-Backup im Ordner `backups/` liegen. Darin ist der aktuelle Projektstand zum schnellen Wiederaufsetzen vor dem Ausschalten gesichert.

## 🤝 Hinweis

Projekt ist auf Diskretion, Sicherheit und legalen Einsatz ausgelegt. Inhalte und Flows muessen regionale Gesetzgebung respektieren.
