# SecretLeaf: Professionelle Cannabis-Wissensbasis + Platform

> **Mission**: Diskrete, evidence-basierte Plattform für Cannabis-Qualitätsstandards, Regulierung und Community. Fokus: Sicherheit, Transparenz, Fakten statt Mythen.

---

## 📊 Status Summary (März 2026)

| Phase | Status | Fortschritt |
|-------|--------|-------------|
| **Wiki-Hub (Terpira)** | ✅ Live | 13 Artikel + 41 Quellen |
| **Status-Automation** | ✅ Live | Daemon läuft, aktualisiert alle 30s |
| **Quellenintegration** | ✅ Live | Peer-reviewed + Standards |
| **API (Fastify)** | ✅ Stabil | Health, Status, Public Endpoints |
| **Frontend (Next.js)** | ✅ Stabil | Wiki + Dashboard |
| **Database (Prisma)** | ✅ Konfiguriert | Ready for deployment |
| **Monitoring** | 🟡 Partial | Status-Probe aktiv, kein Sentry noch |
| **Deployment** | 🟡 Planned | Docker/K8s ready, noch nicht deployed |

---

## ☁️ Wiki-Studien-Automation (PC kann aus sein)

Du musst die Seite nicht offen haben. Der automatische Studien-Sync laeuft serverseitig ueber GitHub Actions.

### Wie es jetzt laeuft
- Workflow: `.github/workflows/wiki-study-sync.yml`
- Trigger:
   - taeglich um `04:30 UTC`
   - jederzeit manuell per `Run workflow` in GitHub
- Job fuehrt `npm run wiki:studies:sync` aus
- Daten werden validiert (`wiki:studies:validate`)
- Es wird ein strukturierter Sync-Report fuer den Review erzeugt
- Bei Aenderungen wird ein Review-PR erstellt (kein Direkt-Commit auf main)

### Was das fuer deinen Ablauf bedeutet
- Dein Rechner kann aus sein.
- Neue Studien werden strukturiert in `autoSources.json` gesammelt.
- In der naechsten Session kannst du manuell entscheiden, welche dieser Quellen du in Artikel-`sourceIds` aufnimmst.
- Der PR-Report liefert dir dafuer bereits priorisierte Kandidaten inkl. Checkliste.

### Professioneller SOP-Ablauf (empfohlen)
1. Automation erstellt/aktualisiert den PR `automation/wiki-study-sync`.
2. Im PR zuerst den Sync-Report lesen (Top-Quellen + Review-Checklist).
3. 5-10 DOI-Links manuell verifizieren.
4. Nur relevante Quellen in Artikel-`sourceIds` uebernehmen.
5. Danach PR mergen.

### Einmalig in GitHub pruefen
1. Repository Settings → Actions: Actions muessen erlaubt sein.
2. Repository Settings → General: Workflow permissions auf `Read and write permissions`.
3. Im Tab Actions optional einmal manuell `Wiki Study Sync` starten.

---

## ✅ ERLEDIGT: Was wir jetzt haben

### 🎓 Wiki-Hub (Terpira)
**13 Artikel** mit professioneller Struktur:
- **Anbau & Genetik** (4 Artikel)
  - Cannabis-Anbau: Grundlagen
  - VPD einfach erklärt
  - Genetik und Phänotyp-Selektion
  - VPD- und EC-Kombi-Guide (Profi)

- **Chemie & Analytik** (3 Artikel)
  - Terpene und Wirkprofil
  - COA richtig lesen
  - Hash-Typen professionell (Profi, 16 min)

- **Konsumformen & Sicherheit** (3 Artikel)
  - Inhalation vs. Edibles
  - Wasseraktivität und Curing
  - PGR und Kontaminanten erkennen

- **Regulierung & Markt** (3 Artikel)
  - Cannabinoide und Evidenzlagen
  - Rechtliche Grundlagen DACH
  - Markttransparenz und Preise

**Struktur pro Artikel**:
- 2-3 Erkläer-Boxen (vereinfachte Konzepte)
- 2-3 FAQ (Typische Fragen)
- 3-5 Glossar-Einträge (Fachbegriffe)
- 3-5 spezialisierte Quellen (peer-reviewed)

**41 Wissenschaftliche Quellen** kategorisiert:
- 9 Medizinische Fachzeitschriften (JAMA, Lancet, Nature, Addiction, etc.)
- 6 Laborstandards (AOAC, ISO, ASTM, Chromatography, etc.)
- 7 DACH & EU Regulierung (BfArM, Swissmedic, AGES, EMA, GMP)
- 4 Anbau & Genetik (Horticulture, Plant Physiology, Genetics)
- 3 Weitere (Terpene, Pharmakokinetik, Mikrobiologie)
- 1 Zentrale Quellenregister-Seite `/wiki/quellen`

### 🤖 Status-Automation
**Daemon-Mode** mit automatischen Updates:
- `status_probe.mjs`: Live-Probes (Fastify + Next.js)
- `status_ensure_running.sh`: Self-healing Prozessmanager
- `status_autostart_install.sh`: Crontab/Shell-Integration
- Updates alle 30 Sekunden in `status-data.json`
- Verifiziert: Läuft und aktualisiert kontinuierlich

### 📡 API (Fastify)
**Public Endpoints**:
- `GET /health` → Service-Status
- `GET /public/status-report` → System-Ampel + 30-Tage-Report
- `GET /public/overview` → Landing-Metriken

**Auth Endpoints**:
- `POST /auth/register`, `POST /auth/login`

**Listings & Search** (JWT-protected):
- CRUD für Angebote
- Filter nach Zone, Preis, Menge
- Search-Funktionalität

### 🎨 Frontend (Next.js)
**Pages**:
- `/` → Landing mit API-Snapshot
- `/wiki` → Hub mit 13 Artikeln, Statistik, Lernpfade
- `/wiki/[slug]` → Detailseiten mit Sidebar (Glossar, FAQ, Explainer)
- `/wiki/quellen` → Quellenregister (41 Quellen)
- `/dashboard` → Authentifizierte Nutzer-Area
- `/auth` → Login/Register
- `/status` → Live-Status-Seite mit Daten-Wechsel

**Features**:
- TypeScript + Tailwind CSS
- Pre-rendering (8 Seiten statisch)
- Gradient-Design mit modernem UI
- Responsive auf Mobile/Desktop

---

## 🚧 TODO: Was noch ansteht

### 🔴 BLOCKER (vor Productive Use)

1. **Deployment-Setup**
   - [ ] Docker-Image bauen + testen
   - [ ] Environment-Variablen dokumentieren
   - [ ] Secrets-Handling (GitHub Secrets oder Vault)
   - [ ] Database-MigrationScript
   - [ ] Rollback-Runbook

2. **Monitoring & Alerting**
   - [ ] Sentry oder ähnlich für Error-Tracking
   - [ ] Uptime-Monitoring (z.B. Uptime.com)
   - [ ] Alert-Regeln definieren (CPU, Memory, HTTP 5xx)
   - [ ] Log-Aggregation (z.B. LogDNA, Datadog)

3. **Security Audit**
   - [ ] Penetration-Testing
   - [ ] Dependency-Scan (npm audit, Snyk)
   - [ ] CORS/CSRF-Policies überprüfen
   - [ ] Rate-Limiting Konfiguration

4. **Rechtliche Assets**
   - [ ] Impressum (Template existiert, aber content pending)
   - [ ] Datenschutzerklärung (DACH-spezifisch)
   - [ ] Terms of Service
   - [ ] Compliance-Übersicht (de, ch, at)

### 🟡 WICHTIG (Kurz nach Launch)

5. **Admin-Dashboard**
   - [ ] Einfacher Ops-View (aktive User, Listings, Fehler)
   - [ ] Moderations-Tools (Flag/Remove verdächtige Inhalte)
   - [ ] Reporting (Daily/Weekly Stats)

6. **Community-Features**
   - [ ] Benutzer-Profile erweitern (Verifizierungsgrad, Bewertung)
   - [ ] Messaging zwischen Nutzer (optional, privacy-first)
   - [ ] Favoriten/Watchlist für Artikel

7. **Enhanced SEO & Social**
   - [ ] Meta-Tags pro Artikel (OG-Graph)
   - [ ] Sitemap.xml
   - [ ] Structured Data (Schema.org für articles)
   - [ ] Social Media Sharing

### 🟢 OPTIONAL / VISION (Langfristig)

8. **Advanced Analytics**
   - [ ] Heatmap welche Inhalte beliebt sind
   - [ ] User-Journey Tracking
   - [ ] A/B Tests auf Lernpfade

9. **Mobile App**
   - [ ] React Native / Flutter für iOS/Android
   - [ ] Offline-Modi für Wiki-Artikel
   - [ ] Push-Notifications für Updates

10. **Community-Moderation Scale**
    - [ ] Content Moderation Pipeline
    - [ ] Spam/Abuse Detection (ML)
    - [ ] Community Guidelines enforcement

---

## 💡 Denkansätze & Architektur-Erkenntnisse

### 1. **Wiki als Knowledge-First Approach**
- Nicht Marketplace-zentrisch, sondern **Bildungs-zentrisch**
- 41 peer-reviewed Quellen geben Glaubwürdigkeit
- Denkansatz: "Nutzer verstehen bessere Qualität → bessere Kaufentscheidungen"

### 2. **Quellenintegration als Qualitäts-Signal**
- Jeder Artikel explizit mit Fachjournalen verlinkt
- DACH-Regulierung dokumentiert (BfArM, Swissmedic, AGES)
- Verhindert: Mythen vs. Realität

### 3. **Status-Automation als Selbstheilung**
- Kein "Server Down" → User sieht klaren Status
- 30s Update-Zyklus → Real-time Zuverlässigkeit
- Daemon-Mode → Zero-Manual-Intervention

### 4. **API als Ereignisquelle**
- Public Endpoints (health, listings, status)
- Auth-Endpoints (register, login, listings/search)
- **Design**: Fallback bei DB-Fehler (kein 500)

### 5. **Next.js Pre-rendering für Speed**
- 8 Wiki-Seiten statisch gebaut
- Schnelle erste Load
- Fallback auf Server-Rendering nur wenn nötig

### 6. **Skalierbarkeit durch Modularity**
- Monorepo (API + Web + Shared)
- Klare Separation of Concerns
- Einfach zu Docker/Kubernetes deployen

---

## 🛠️ Technical Stack

```
Frontend:     Next.js 16 + TypeScript + Tailwind CSS
Backend:      Fastify + TypeScript
Database:     Prisma (PostgreSQL ready)
Monorepo:     npm workspaces
Auth:         JWT (optionale erweitert)
```

---

## 🚀 Lokale Development

### Setup
```bash
npm install
npm run build
```

### Development Mode
```bash
# Terminal 1: API
cd apps/api && npm run dev

# Terminal 2: Web
cd apps/web && npm run dev

# Terminal 3 (optional): Status Probe
node scripts/status_probe.mjs --watch --interval=5000
```

### Build & Deploy
```bash
npm run build          # Kompiliert alles
npm run typecheck      # TypeScript validiert
npm start              # Produktionsstart
```

---

## 📋 Checklist für Produktionsreife

- [ ] Deployment-Infrastruktur (Docker/K8s)
- [ ] Environment-Secrets konfiguriert
- [ ] Database-Backups automatisiert
- [ ] Error-Tracking (Sentry) aktiv
- [ ] Uptime-Monitoring konfiguriert
- [ ] Rechtliche Assets aktualisiert
- [ ] SSL-Zertifikat (Let's Encrypt)
- [ ] Admin-Dashboard funktional
- [ ] Load-Testing durchgeführt
- [ ] Security Audit bestanden

---

## 📞 Kontakt & FAQ

**Was ist Terpira?**
→ Terpira ist das Wiki-Hub System (Cannabis-Bildung + Quellenintegration)

**Wo sind die Quellen?**
→ `/wiki/quellen` zeigt alle 41 Quellen. Jeder Artikel verlinkt relevante Quellen.

**Wie läuft Status-Automation?**
→ `status_probe.mjs` läuft als Daemon, prüft alle 30s beide Server, schreibt in `status-data.json`

**Kann ich offline nutzen?**
→ Ja - statische Wiki-Seiten funktionieren offline via Pre-rendering

**Ist das ready für Production?**
→ Nein - noch Monitoring, Deployment, Legal-Assets ausstehend. Beta-ready.

---

**Letzte Aktualisierung**: 26.03.2026
**Status**: 🟡 Beta - Wiki/Content fertig, Infrastruktur pending

- `status.html`: separate Status-/Incident-Seite fuer Ausfaelle.
- `status-data.json`: editierbare Snapshot-Datei fuer spaetere manuelle Hinweise oder als harter statischer Fallback.

### Automatisierte Live-Statusupdates
Die Datei `status-data.json` kann automatisiert mit echten Live-Probes aktualisiert werden.

Verfuegbare Root-Skripte:

```bash
npm run status:update
npm run status:update:local
npm run status:watch
npm run status:ensure
npm run status:autostart:install
```

Dauerbetrieb (empfohlen):
- `npm run status:ensure` startet den Watch-Prozess nur dann, wenn er noch nicht laeuft.
- `npm run status:autostart:install` richtet `crontab` ein, damit der Prozess nach Neustarts automatisch wieder sichergestellt wird.
- Falls `crontab` auf der Maschine fehlt, wird stattdessen ein Autostart-Fallback in `~/.bashrc` und `~/.profile` angelegt.
- Laufzeitdateien liegen unter `.runtime/status-watch.pid` und `.runtime/status-watch.log`.

Was dabei passiert:
- Echtzeit-Probe gegen API (`/health`, `/public/overview`, `/public/status-report`)
- Echtzeit-Probe gegen Web (`/`, `/wiki`)
- Automatisches Schreiben nach `status-data.json` mit Zeitstempel und Messdaten
- Fallback-Ereignisse werden nur erzeugt, wenn Live-Endpunkte fehlschlagen

Zusatzdaten im Snapshot:
- `probe.mode` (`once` oder `watch`)
- `probe.checks.*.status`
- `probe.checks.*.latencyMs`
- `probe.checks.*.error`

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
- `npm run status:update:local` schreibt echte Probe-Werte in `status-data.json`.

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
