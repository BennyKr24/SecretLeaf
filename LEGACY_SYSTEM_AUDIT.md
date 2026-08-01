# Legacy System Audit

Audit-Snapshot: 2026-06-01

Hinweis 2026-07-01: Historischer Legacy-Audit-Snapshot. `apps/api` bleibt Legacy/parallel und soll keinen neuen produktkritischen Scope erhalten, siehe ARCHITECTURE.md und DEPLOYMENT.md.

## Scope

Analysiert wurde das komplette Prisma/SQLite-Legacy-System unter `apps/api` sowie seine verbleibenden Consumer im Monorepo.

## Verifizierte aktive Abhängigkeiten im Repository

### 1. Runtime / Tooling
- `apps/api/src/server.ts`
- `apps/api/src/lib/prisma.ts`
- `apps/api/src/routes/auth.ts`
- `apps/api/src/routes/listings.ts`
- `apps/api/src/routes/public.ts`
- `apps/api/src/routes/search.ts`

Diese Dateien sind innerhalb des Legacy-Servers aktiv verdrahtet.

### 2. Root / Betrieb
- `package.json`
  - `dev:api`
  - `legacy:api:build`
  - `legacy:api:typecheck`
- `scripts/status_probe.mjs`
  - war bis zu diesem Lauf noch auf Legacy-API-Defaults ausgerichtet

### 3. Web / Produktpfad
- Vor diesem Lauf: `apps/web/src/lib/api.ts` und `apps/web/src/components/ListingManager.tsx`
- Status: entfernt, da keine weiteren Consumer im Web-Pfad gefunden wurden

## Verifizierte tote oder intern nicht referenzierte Pfade

### Direkt tote Web-Dateien
- `apps/web/src/lib/api.ts`
- `apps/web/src/components/ListingManager.tsx`

Begründung:
- Keine weiteren Repo-Referenzen
- Direkte Abhängigkeit auf Legacy-Endpunkt `/listings`
- Produktwiderspruch zu PRODUCT.md (`keine Marktplätze ohne direkten Grow-Workflow-Bezug`)

### Im Repo nicht mehr konsumierte Legacy-Endpunkte
- `apps/api/src/routes/auth.ts`
- `apps/api/src/routes/listings.ts`
- `apps/api/src/routes/search.ts`

Hinweis:
- Innerhalb des Repos wurden keine Consumer mehr gefunden.
- Externe, nicht im Repository sichtbare Consumer können nicht ausgeschlossen werden.

## Bestehende Datenflüsse

### Legacy-Datenfluss
Client/Tooling -> `apps/api` Fastify -> Prisma -> SQLite

### Primärer Datenfluss
Next.js Route Handler -> Server Services -> Supabase PostgreSQL

### Bereits migrierte öffentliche Pfade
- `/api/public/overview`
- `/api/public/listings`
- `/api/public/status-report`

Diese Pfade laufen im primären Web-System und benötigen den Legacy-Server nicht mehr.

## Sichere Entkopplungen in diesem Lauf

1. Status-Probe defaultet jetzt auf `http://localhost:3000/api` statt auf `http://localhost:4000`
2. Toter Web-API-Client entfernt
3. Tote Marketplace-Komponente entfernt

## Migrationsplan

### Phase 1: interne Entkopplung
- erledigt: Root/CI nicht mehr vom Legacy-Server abhängig
- erledigt: Status-Tooling auf primären API-Pfad umgestellt
- erledigt: tote Web-Consumer entfernt

### Phase 2: externe Risikoabschirmung
- Legacy-Endpunkte dokumentiert als nicht produktiv
- Legacy-Skripte bleiben gated via `LEGACY_API_ENABLED=1`
- Beobachten, ob noch externe Consumer existieren

### Phase 3: Stilllegung vorbereiten
- `apps/api` Endpunkte mit Sunset-Plan versehen
- Prisma/SQLite nur noch archiviert halten
- Dokumentation und Deployment-Hinweise weiter auf Primärpfad reduzieren

### Phase 4: vollständige Entfernung
- Entfernen von Prisma-/SQLite-Dependencies
- Entfernen von `apps/api` aus aktivem Workspace-Betrieb
- Bereinigung verbleibender Legacy-Dokumentation

## Restrisiken

- Externe, nicht im Repo sichtbare Aufrufer der Legacy-Endpunkte sind nicht verifizierbar.
- Solange `apps/api` im Workspace verbleibt, besteht Wartungs- und Sicherheitsoberfläche.