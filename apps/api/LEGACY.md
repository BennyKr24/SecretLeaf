# Legacy Status: apps/api

Status:
- Legacy-Pfad
- Nicht primärer Produktpfad

Verbindliche Regeln:
- Keine neuen Produktfeatures in `apps/api`
- Keine produktive Source-of-Truth-Datenhaltung in Prisma/SQLite
- Alle neuen Endpunkte im primären Pfad `apps/web` Route Handler

Migration:
- Schrittweise Ablösung bestehender Legacy-Endpunkte
- Entfernen der Prisma/SQLite-Abhängigkeit nach Abschluss

Ziel-Enddatum:
- 2026-09-30