---
tags: [technik, audit, checkpoint, datenfluss]
status: Aktiv
verknüpft: ["[[00_Uebersicht]]", "[[02_Grow_Zyklus]]", "[[04_Diagnosedaten]]"]
---

# SecretLeaf — Datenfluss-Mapping (Stand 10.06.2026)

> Teil des Checkpoints [[00_Uebersicht]]. Vergleich mit dem strategischen Plan: [[02_Grow_Zyklus]], [[04_Diagnosedaten]].

## 1. Registrierung
`app/[locale]/auth/page.tsx` → `lib/auth.ts::registerWithSupabase()` → `supabase.auth.signUp({email,password})`.
- Bei aktivierter E-Mail-Bestätigung: keine Session zurück, UI zeigt "Check your email", fällt zurück in Login-Modus.
- Bei sofortiger Session: Rolle via `GET /api/auth/me` (Bearer-Token) → `lib/serverAuth.ts::getUserRole()` → liest `user_roles`, **upserted bei fehlendem Eintrag automatisch `CONSUMER`**.
- `SessionData` wird in `localStorage["secretleaf.session"]` gespeichert.

## 2. Login
`lib/auth.ts::loginWithSupabase()` → signOut (alte Session) → `supabase.auth.signInWithPassword()` → `fetchRoleFromApi()` → Session speichern.
- `useAuth.ts` lädt Session beim Mount, abonniert `storage`-Events (Cross-Tab) und `secretleaf:profileUpdated`.
- **Trigger Migration**: `needsMigration(userId)` prüft `localStorage["secretleaf.migrated.v1"] !== userId` UND lokale Grows nicht leer → fire-and-forget `runMigration(userId, supabase)`.

## 3. Grow erstellen — vollständiger Trace (Kernpfad des bekannten Bugs)

```
User (GrowSetupWizard, 4 Schritte)
  └─ components/grow/GrowSetupWizard.tsx :: handleSubmit()
       └─ hooks/useGrowState.ts :: createGrow(input)
            ├─ lib/grow/planGenerator.ts :: generateGrowPlan(input)
            │     └─ lib/grow/phases.ts :: getPhaseDurations() / buildPhaseTasks()
            ├─ lib/grow/store.ts :: createGrow(input, plan)
            │     └─ lib/grow/utils.ts :: generateId()   ← liefert "<base36-ts>-<base36-rand>", KEINE UUID
            │     └─ storage.set(STORAGE_KEYS.GROWS, [...])   (localStorage, IMMER erfolgreich)
            ├─ withLiveDay(grow)  → setGrows(optimistic update, UI zeigt Grow sofort)
            ├─ falls KEIN User: refresh(); return grow   (Ende — nur localStorage)
            └─ falls User eingeloggt:
                  └─ lib/grow/db.ts :: createGrow(supabase, userId, grow)
                        └─ supabase.from("grows").insert({ id: grow.id, user_id, name, ... }).select().single()
                              └─ Postgres: column "id" ist `uuid`, grow.id ist z.B. "lop2k3f-ab12xy"
                              └─ Fehler 22P02 "invalid input syntax for type uuid"
                  └─ catch → setGrows(prev => prev.filter(g.id !== grow.id))   ROLLBACK aus UI
                  └─ console.error("[grows] createGrow Supabase failed, rolling back:", err)
       └─ Analytics.growCreated(umgebung, medium)
       └─ router.push(`/grow/${grow.id}`)
```

**Resultat für eingeloggte User**: Der Grow erscheint kurz in der UI, verschwindet dann durch den Rollback wieder bzw. die Detailseite `/grow/[id]` zeigt einen Grow, der serverseitig nie existiert — je nach Timing/Caching. In Supabase wird **kein Datensatz angelegt**. Für anonyme User funktioniert localStorage einwandfrei (daher "es geht manchmal/auf manchen Geräten").

**Gleicher Bug betrifft**:
- `Plant.id` (`createDefaultPlants` in `store.ts`) → Insert in `plants`
- Offline-`LogEntry.id` (`createLogEntry` in `store.ts`) → Insert in `log_entries` via Migration
- `lib/grow/migration.ts::runMigration()` — chunked Upsert (200er-Batches) aller lokalen Grows/Plants/LogEntries beim ersten Login — **schlägt komplett fehl** für alle Datensätze mit `generateId()`-IDs

**Ausnahme**: `hooks/useGrowLog.ts::addEntry()` generiert für eingeloggte User `entry.id` separat via `crypto.randomUUID()` (echte UUID) — der Online-Log-Entry-Pfad ist **nicht** betroffen, nur der Offline/Migrations-Pfad.

## 4. Grow bearbeiten / Phase weiterschalten / Task abschließen
`useGrowState.ts::updateGrow/advancePhase/completeTask` — gleiches Optimistic+Rollback-Muster wie `createGrow`. Da die betroffenen Grows in Supabase ohnehin nie existieren (Schritt 3), schlagen auch UPDATE-Operationen fehl (0 betroffene Zeilen oder FK-Fehler je nach Postgres-Verhalten) — Rollback greift erneut.

## 5. Pflanzen erstellen
`lib/grow/store.ts::createDefaultPlants()` wird beim `createGrow` automatisch aufgerufen (Anzahl = `pflanzenAnzahl`), IDs via `generateId()` — gleicher Bug wie oben für `plants`-Insert.

## 6. Log Entries
- **Online (eingeloggt)**: `useGrowLog.ts::addEntry()` → `crypto.randomUUID()` → `lib/grow/db.ts::createLogEntry()` → Supabase Insert `log_entries` — funktioniert (UUID korrekt).
- **Offline / Diagnose-Flow**: `components/diagnose/DiagnoseResult.tsx` ruft `lib/grow/store.ts::createLogEntry()` **direkt** auf (localStorage, `generateId()`-ID, bypass von `useGrowLog`/Supabase) — Eintrag bleibt rein lokal bis zur nächsten Migration, die dann am UUID-Bug scheitert.
- `useGrowLog.ts::autoCompleteTask()` — bei `wasser`/`duenger`/`training`-Einträgen wird automatisch der nächstgelegene offene Task (±3 Tage) abgeschlossen → `completeTask()` (gleicher Sync-Pfad wie Schritt 4).

## 7. Bilder / Fotos
**Kein Datenfluss vorhanden.** `lib/grow/photoTypes.ts` definiert Typen (`GrowPhoto`, `GrowPhotoUploadInput`) und ist explizit als "BLOCKED ON: Supabase Storage Bucket + Auth" markiert. Keine UI-Komponente, kein API-Call, keine Tabelle nutzt diese Typen.

## 8. Diagnose
- **Aktiver Pfad**: User wählt Kategorie → Decision-Tree (`lib/diagnose/tree.ts`, rein lokal, keine Daten verlassen den Client) → Ergebnis (`DiagnoseResult`) → optional "Als Notiz speichern" → `lib/grow/store.ts::createLogEntry()` (siehe Schritt 6, localStorage-only Pfad).
- **KI-Pfad**: `app/api/diagnose/route.ts` — POST gibt sofort `501 {error:"AI Diagnose ist noch nicht verfügbar."}` zurück. Kein Datenfluss.
- Es existiert ein `knowledge_events`-Eventtyp `diagnostic_launch`, aber keine Verdrahtung vom Diagnose-Flow zu `api/knowledge/events` wurde gefunden — Diagnose-Nutzung wird **nicht getrackt**.

## 9. AI Features (allgemein)
Kein KI-Feature ist live (siehe [[01_Architektur]] Abschnitt 7). Einziger Bezugspunkt ist der `diagnose`-Stub.

## 10. Automations / Knowledge Events
- `api/knowledge/events` (POST, ohne Auth) → `lib/knowledge/db.ts::recordEvent()` → Insert in `knowledge_events` (partitioniert, RLS erlaubt INSERT für alle).
- `api/knowledge/graph`/`recommend`/Artikel-Routen → Supabase RPCs (`knowledge_graph_expand`, `knowledge_recommend_tools`) bzw. direkte Tabellenzugriffe, CDN-gecached (`revalidate=300`).
- Cron-Pipelines (`engine-sync`, `studies-sync`, `study-refresh`, `engine-adapt`, `engine-reprocess`, `engine-health`, `cleanup`) → siehe [[01_Architektur]] Abschnitt 5; schreiben/lesen `studies`, `automation_job_runs`, `automation_error_memory`, `scoring_weights_history`.

---

## Zusammenfassung: Wo Daten tatsächlich landen vs. verloren gehen

| Aktion | Anonymer User | Eingeloggter User |
|---|---|---|
| Grow erstellen | localStorage ✅ | localStorage ✅, Supabase ❌ (UUID-Bug) |
| Plant erstellen | localStorage ✅ | localStorage ✅, Supabase ❌ (UUID-Bug) |
| Phase/Task ändern | localStorage ✅ | localStorage ✅ (Optimistic), Supabase ❌ |
| Log Entry (online add) | localStorage ✅ | localStorage ✅ + Supabase ✅ (UUID korrekt) |
| Log Entry (Diagnose-Notiz) | localStorage ✅ | localStorage ✅, Supabase ❌ (bypass + UUID-Bug bei Migration) |
| Foto-Upload | nicht vorhanden | nicht vorhanden |
| Erst-Migration nach Login | n/a | schlägt für grows/plants/log_entries komplett fehl |
| Diagnose-Nutzung (Analytics) | nicht getrackt | nicht getrackt |

## Verknüpfte Dokumente

[[00_Uebersicht]]
[[01_Architektur]]
[[02_Datenmodell]]
[[02_Grow_Zyklus]]
[[04_Diagnosedaten]]
