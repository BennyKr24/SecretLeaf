# SecretLeaf

SecretLeaf ist eine datenbasierte Cannabis-Plattform mit Fokus auf taegliche Grow-Execution, qualitaetsgesichertes Wissen und automatisierte Studienaufbereitung.

## Produktkern

SecretLeaf besteht aktuell aus vier Kernbereichen:
- Grow OS: Setup, Plan, Tasks, Log, Multi-Plant, Retention-Mechaniken
- Studies Hub: Wissens- und Studienoberflaeche mit Review-Status
- Diagnose und Tools: Entscheidungsbaum plus operative Rechner
- Admin und Engine: Review, Monitoring, Automation-Runs

## Aktueller Status

Produktiv nutzbar:
- Grow-Workflows mit Supabase-Persistenz fuer Grows, Plants, Log-Eintraege und Task-Fortschritt
- Studien-Pipeline und Cron-Automation
- Rollenbasierte Adminflaechen fuer Review und Betrieb
- Sentry Error Monitoring, Vercel Web Analytics und Speed Insights

Offene kritische Punkte:
- Monetarisierungspfad nicht live
- Legacy-Backendpfad als Architekturschuld
- Newsletter-Anmeldung ist noch ein Stub ohne produktiven E-Mail-Provider

## Architektur auf einen Blick

Primaerer Runtime-Pfad:
- apps/web (Next.js App Router + API Routes)
- Supabase fuer Auth, Postgres, RLS und Telemetrie
- Vercel Cron fuer Studien- und Engine-Automation

Sekundaerer Runtime-Pfad:
- apps/api (Fastify + Prisma), aktuell Legacy/parallel

Detaillierte Architektur: siehe ARCHITECTURE.md
Detaillierte Betriebsprozesse: siehe DEPLOYMENT.md

## Repository-Struktur

```text
SecretLeaf/
  apps/
    web/
    api/
  packages/
    shared/
  scripts/
  supabase/
    migrations/
```

## Lokale Entwicklung

Voraussetzungen:
- Node.js >= 20.11
- npm
- Supabase-Projekt und gueltige Environment-Variablen

Empfohlene lokale Env-Dateien:
- Root: .env.example nach .env kopieren (plattformweite Defaults)
- API: apps/api/.env.example nach apps/api/.env kopieren
- Web: apps/web/.env.example nach apps/web/.env.local kopieren

Wichtig fuer API-Start lokal:
- JWT_SECRET muss mindestens 24 Zeichen haben

Install:

```bash
npm ci
```

Wichtige Kommandos:

```bash
npm run dev:web
npm run dev:api
npm run typecheck
npm run build --workspace @secretleaf/web
npm run build --workspace @secretleaf/api
npm run lint
```

Architekturkonforme Defaults:
- `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck` laufen absichtlich nur auf dem primären `apps/web`-Pfad.
- Legacy-API-Validierung läuft nur explizit über `npm run legacy:api:typecheck` und `npm run legacy:api:build`.
- Legacy-API-Skripte benötigen zusätzlich `LEGACY_API_ENABLED=1` als bewusstes Opt-in.

## Environment-Variablen

Minimal fuer produktive API-Funktionalitaet im Web-Runtime:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
- CRON_SECRET

Optional fuer Automation-Fehlerspeicher:
- AUTOMATION_ERROR_MEMORY_MIN_DELAY_MINUTES (Default: 60)

Observability:
- NEXT_PUBLIC_SENTRY_DSN
- SENTRY_DSN
- SENTRY_AUTH_TOKEN (nur Vercel/CI; fuer Source-Map-Uploads)
- NEXT_PUBLIC_PLAUSIBLE_DOMAIN (optional; Vercel Analytics ist separat aktiv)

Siehe DEPLOYMENT.md fuer vollstaendige Betriebs- und Security-Vorgaben.

## Health-Checks lokal

Relevante Endpunkte:
- Web Runtime Health: /api/health
- Legacy API Health: http://localhost:4000/health

Hinweis zu degraded im lokalen Setup:
- /api/health liefert bewusst 503 mit status=degraded, wenn keine gueltige Supabase-Verbindung vorhanden ist (z. B. fehlende SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY oder nicht erreichbare DB).
- Das ist lokal erwartbar, solange Supabase nicht konfiguriert ist, und bedeutet nicht automatisch einen Build- oder Lint-Fehler.

Hinweis zum Studies-Sync-Fehlerspeicher:
- Wiederholt fehlerhafte Quellen werden mit Fingerprint persistent gespeichert.
- Diese Fingerprints werden bis zum naechsten Retry-Zeitpunkt automatisch uebersprungen.
- Bei erfolgreicher Verarbeitung wird der gespeicherte Fehler fuer den Fingerprint wieder entfernt.

## Daten und Migrationen

Produktive SQL- und RLS-Aenderungen liegen unter:
- supabase/migrations

Aktueller Grow-OS-Persistenzpfad:
- `grows`
- `plants`
- `log_entries`

Auth-Regel:
- Supabase Session ist die einzige Auth-Quelle fuer RLS-geschuetzte Writes.
- UI darf eine Nutzer-Session nur als eingeloggt behandeln, wenn eine echte Supabase-Session existiert.

Regel:
- Keine produktive Schema-Aenderung ohne Migration und Review.

## CI und Qualitaet

Aktuelle CI-Basis:
- Dependency-Installation
- Typecheck fuer web
- Build fuer web

Mindeststandard fuer Merges:
- Typecheck gruen
- Build gruen
- Keine unbegruendete Architekturdrift

## Engineering-Prinzipien

- Produkt vor Content: jede Aenderung muss einen klaren Nutzerjob bedienen
- Einfache, testbare Loesungen vor Framework-Hopping
- Kein neuer Scope auf Legacy-Pfaden ohne Architekturentscheid
- Betriebsfaehigkeit ist Teil der Definition of Done

Verbindliche Richtlinien: siehe AI_RULES.md

## Roadmap-Fokus

Jetzt:
- Monetarisierungskern produktiv machen
- Newsletter-Provider anbinden
- Legacy-Umfang kontrolliert reduzieren

Als naechstes:
- PubMed-Quelle und wertvolle Teile aus `copilot/full-system-audit-rebuild` gezielt portieren
- Conversion- und Retention-Messung vertiefen
- Produkt- und Datenfluesse weiter vereinheitlichen

Spaeter:
- Erweiterte Team- und B2B-Modelle

## Dokumente

- ARCHITECTURE.md: technische Ziel- und Ist-Architektur
- DEPLOYMENT.md: Deployment, Runbook, Incident-Prozesse
- AI_RULES.md: Engineering- und Produkt-Guardrails
- IDEAS.md: priorisiertes Innovations-Portfolio
- PRODUCT.md: Produktstrategie, Kernmetriken, Priorisierungslogik
- DESIGN_SYSTEM.md: visuelle und interaktive Systemregeln
- DATABASE.md: Supabase-Datenmodell, RLS und Migrationsstandards
- LOCALIZATION.md: Sprach- und Terminologie-Standards de/en
- AI_SYSTEM.md: Studien-Engine, Diagnose und Automation-System
- WIKI_ARCHITECTURE.md: Taxonomie und Wissensstruktur
- ROADMAP.md: Sequenzierung Jetzt/Als naechstes/Spaeter
- STANDARDS.md: technische Mindeststandards fuer Delivery
- AGENTS.md: Agentenmodell und Guardrails

## Lizenz und Hinweise

Interne Projektrichtlinien und Compliance-Vorgaben gelten zusaetzlich zu diesem Dokument.

## Dokument-Metadaten

Owner: Product Engineering
Status: Active
Last updated: 2026-07-01
Next review: 2026-08-01
