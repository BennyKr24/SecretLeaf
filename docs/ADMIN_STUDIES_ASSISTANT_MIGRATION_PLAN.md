# Studien + Assistent — Migration auf die neuen Admin-Primitives

Letzter offener Punkt des Admin-Panel-Umbaus (`ADMIN_PANEL_OVERHAUL_PLAN.md`).
Die 7 anderen Admin-Seiten laufen auf `adminFetch` + `adminRoute` + `AdminPage`
+ `Alert` + `withAudit`; **Studien** und **Assistent** hängen noch an der
deprecateten Sammel-Route `POST /api/admin/dashboard` (`switch(action)`) und
am alten `lib/adminApi.ts`.

Beschlossener Umfang (2026-09-03):
- **Studien:** Umbau **+ kleine Verbesserungen** (B4 Deep-Link, B5 Debounce,
  `reviewNote`-Feld, `studyType`-Filter — Backend kann alles schon).
- **Assistent:** Umbau **+ serverseitige Verlaufs-Persistenz** (neue Tabelle),
  damit die „auf allen Geräten"-Copy stimmt. Streaming/Markdown weiter
  aufgeschoben.

Status-Legende: `[ ]` offen · `[~]` in Arbeit · `[x]` fertig & verifiziert

---

## Referenz-Muster (schon migriert)

| Rolle | Datei |
|---|---|
| Client-Fetch | `src/lib/admin/client.ts` (`adminFetch<T>(session, path, { method, json })`) |
| Route-Helper | `src/lib/admin/http.ts` (`adminRoute`, `parseQuery`, `parseBody`, `AdminHttpError`) |
| Audit | `src/lib/admin/audit.ts` (`withAudit(actor, {resource,resourceId,action,before,after}, mutate)`) |
| Contracts | `src/lib/admin/contracts.ts` (zod-Schemas + Typen, geteilt Client/Server) |
| Seiten-Shell | `src/components/admin/AdminPage.tsx` (`AdminPage`, `AdminPageSkeleton`) |
| Banner | `src/components/admin/Alert.tsx` (`tone: error|warn|info|success`, `onDismiss`) |
| Referenz-Route | `src/app/api/admin/pro-codes/route.ts` + `pro-codes/[id]/route.ts` |
| Referenz-Seite | `src/app/[locale]/dashboard/admin/pro-codes/page.tsx` |

`admin_audit_log`-Tabelle: Migration `202608310000_admin_audit_log.sql`, prod
angewendet (Pro-Codes nutzt sie live).

---

## 1. Studien

### 1.1 Contracts `[x]`

- `StudyRow` — die 16 Felder aus `dashboard/route.ts` `STUDIES_SELECT_ENGINE`
  (`id,title,description,source,tags,quality_status,relevance_score,study_type,
  editorial_priority,matched_topics,flags,first_author,origin_label,created_at,
  fetched_at,doi`).
- `AdminStudiesResponse = { studies: StudyRow[]; total; page; limit; totalPages }`.
- `adminStudiesQuerySchema = listQuerySchema.extend({ search?, quality?, priority?,
  studyType?, sortBy?, sortDir?, minScore?, maxScore?, source?, dateFrom?, dateTo? })`
  — alles optional, `sortDir: z.enum(["asc","desc"]).default("desc")`, Zahlen als
  `z.coerce.number()`.
- `studyUpdateSchema = z.object({ qualityStatus?, editorialPriority?, title?,
  description?, tags? (string[]), reviewNote? }).refine(mind. 1 Feld)`.

### 1.2 API-Routen `[x]`

**Neu:** `src/app/api/admin/content/studies/route.ts` — `GET`
- `parseQuery(url, adminStudiesQuerySchema)`.
- Query-Builder 1:1 aus `dashboard/route.ts` `case "studies"` übernehmen:
  `applyStudiesFilters`, `buildStudiesQuery`, den **Legacy-Spalten-Fallback**
  (`isMissingColumnError` → `STUDIES_SELECT_LEGACY` + `normalizeLegacyStudyRow`)
  mitnehmen — nicht wegoptimieren, prod-DB kann alte Schemata haben.
- Rückgabe = `AdminStudiesResponse`.

**Neu:** `src/app/api/admin/content/studies/[id]/route.ts` — `PATCH`, `DELETE`
(gleiches Muster wie `pro-codes/[id]/route.ts`)
- `PATCH`: `parseBody(studyUpdateSchema)`. Vorher-Row lesen (`select().eq("id",id).single()`)
  für den Diff. Update-Payload wie in `case "study-update"` (Feld-Mapping
  `qualityStatus→quality_status`, `reviewNote→review_note`,
  `editorialPriority→editorial_priority`; bei `qualityStatus` zusätzlich
  `reviewed_at`/`reviewed_by`). In `withAudit(actor, { resource: "study",
  resourceId: id, action: qualityStatus !== undefined ? "review" : "edit",
  ...diffFields(before, after) }, mutate)`.
- `DELETE`: `withAudit(actor, { resource: "study", resourceId: id,
  action: "delete", before }, () => supabase.delete().eq("id",id))`.

### 1.3 Seite `[x]`

- Header (Z. 219–238) → `<AdminPage title="Studien" icon={Microscope}
  description="Alle Studien filtern, sortieren, prüfen und bearbeiten."
  actions={data && <Badge tone="primary">{data.total} Studien</Badge>}>`.
- `adminApi(auth.session, "studies", {...})` → `adminFetch<AdminStudiesResponse>(
  auth.session, \`content/studies?${new URLSearchParams(...)}\`)`.
  `adminApi(..., "study-update", {studyId,...})` →
  `adminFetch(auth.session, \`content/studies/${id}\`, { method:"PATCH", json })`.
  `study-delete` → `{ method: "DELETE" }`.
- Fehler/Erfolg-Banner (Z. 286–294) → `<Alert tone="error" onDismiss={()=>setError(null)}>`
  bzw. `tone="success"`.
- Lade-Zustand (Z. 297–302) → `<AdminPageSkeleton rows={6} />`.
- `QualityBadge`/`PriorityBadge` (Z. 74–96): **rohe `bg-emerald-100 text-emerald-700`
  / `bg-red-100` / `bg-blue-100` raus** (DESIGN_SYSTEM §5 „kein raw red-*"). Wo
  `Badge` (`src/components/ui/Badge.tsx`) die Töne hat → `<Badge tone=…>`; sonst
  lokale Spans mit Token-Klassen (`bg-primary/10 text-primary`,
  `bg-amber-500/10 text-amber-600`, `bg-rose-500/10 text-rose-600`).
- Action-Buttons in der Tabelle (Z. 342–345): rohe `bg-emerald-50`/`bg-red-50`/
  `bg-blue-50` → Token-Varianten oder `IconButton`-Pattern der migrierten Seiten.
- Modal-Buttons (Z. 435, 463): `bg-emerald-600` → `<CTAButton variant="primary">`;
  `bg-red-600` (Löschen) → destruktiv, Token `bg-rose-600` behalten ist ok, aber
  konsistent zu anderen Delete-Dialogen prüfen.
- `ResponsiveTable` + `Dropdown` + die beiden Modals (always-mounted
  class-toggle, `.modal-surface`) **bleiben** — sind schon DS-konform.
- **B5 Debounce:** `search` über einen 300 ms-`useDebouncedValue` in die
  `fetchStudies`-Deps, nicht den Rohwert. (Andere Filter dürfen sofort feuern.)
- **B4 Deep-Link:** `useSearchParams()` auf Mount lesen — `?quality=pending`
  o. Ä. → initialer `quality`-State.
- **`reviewNote`:** `<textarea>` im Edit-Modal, Wert in den PATCH-`json`.
- **`studyType`-Filter:** zusätzliches `<Dropdown>` (`all` + die real
  vorkommenden `study_type`-Werte — vorab per SQL `select distinct study_type`
  prüfen; sonst feste Liste). Wert als `studyType` in die Query.

### 1.4 Seiten-Pfad

Seite **bleibt** unter `dashboard/admin/studies` (Nav-Eintrag `nav.ts` Z. 72
unverändert). Nur die **API** zieht auf den Ziel-Pfad `content/studies` um
(matcht `ADMIN_PANEL_OVERHAUL_PLAN.md` §7). Wenn Phase 3 die kombinierte
„Content & Wissen"-Seite baut, wandert die Studien-UI dort hinein — dann ist
die API schon am richtigen Ort.

---

## 2. Assistent

### 2.1 Migration `[x]` (Datei angelegt, Anwenden lokal+prod noch offen)

`supabase/migrations/<ts>_admin_assistant_messages.sql`:
```sql
create table admin_assistant_messages (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete cascade,
  prompt text not null,
  reply text not null,
  created_at timestamptz not null default now()
);
create index admin_assistant_messages_actor_created_idx
  on admin_assistant_messages (actor_id, created_at);
alter table admin_assistant_messages enable row level security;
-- keine Policies: nur Service-Role (Admin-Routen nutzen den Service-Client),
-- gleiche Linie wie admin_audit_log.
```
Lokal `supabase db push` **und** `--linked` gegen prod — danach in der prod-DB
gegenprüfen, dass die Tabelle wirklich da ist (Memory
`secretleaf_security_migration_gap_2026_08_19`: dup-Timestamp-Pushes können
still fehlschlagen).

### 2.2 Contract `[x]`

- `AssistantMessage = { id; prompt; reply; createdAt }`.
- `AdminAssistantResponse = { messages: AssistantMessage[] }`.
- `assistantAskSchema = z.object({ prompt: z.string().trim().min(1).max(8000) })`.

### 2.3 API-Route `[x]`

- `GET` = `adminRoute` — letzte ~50 Zeilen für `actor.userId`,
  `order("created_at", { ascending: true })`.
- `POST` = `adminRoute` — `parseBody(assistantAskSchema)`;
  Feature-Flag `isFeatureEnabled("ai_assistant")` (sonst
  `throw new AdminHttpError(403, "…deaktiviert (Steuerung → Feature-Flags).")`);
  `askClaude(prompt, SYSTEM_PROMPT, { feature: "admin-assistant", actorId: actor.userId })`
  (System-Prompt-Text aus `dashboard/route.ts` `case "ai-assist"` übernehmen);
  Zeile inserten; `{ message }` zurück. `askClaude`-Fehler → `AdminHttpError(502,
  message)`.
- `DELETE` = `adminRoute` — `delete().eq("actor_id", actor.userId)` (der „Verlauf
  löschen"-Knopf).
- Kein `withAudit` nötig — die Zeile selbst ist der Nachweis.

### 2.4 Seite `[x]`

- `readHistory`/`writeHistory`/`HISTORY_STORAGE_KEY`/localStorage **komplett raus**.
- Header → `<AdminPage title="Assistent" icon={Bot} description="Notizen,
  Content-Entwürfe und Ideen — serverseitig gespeichert, auf allen Geräten
  sichtbar. Nur für Admins, keine Kosten für normale Nutzer.">`. („auch von
  unterwegs"-Satz darf jetzt bleiben — stimmt.)
- Mount: `adminFetch<AdminAssistantResponse>(session, "assistant")` → `history`.
- Senden: `adminFetch(session, "assistant", { json: { prompt } })` → zurück­gelieferte
  `message` an `history` anhängen (kein Voll-Reload nötig).
- „Verlauf löschen": `adminFetch(session, "assistant", { method: "DELETE" })` →
  `history` leeren.
- Fehler → `<Alert tone="error">` (den `ANTHROPIC_API_KEY`-Hinweis behalten).
- Chat-Bubbles + Sticky-Composer + `CTAButton` **bleiben**, nur in `AdminPage`
  verschoben. `history.map(key={i})` → stabiler `key={entry.id}`.

---

## 3. Toter Code weg `[x]`

- `src/app/api/admin/dashboard/route.ts`: `case "studies" | "study-update" |
  "study-delete" | "ai-assist"` löschen → `switch` leer → **ganze Datei löschen**
  inkl. `STUDIES_SELECT_*`, `isMissingColumnError`, `normalizeLegacyStudyRow`
  (wandern anteilig in die neue Studies-Route).
- `src/lib/adminApi.ts`: `grep -rn "adminApi\b" src/` — wenn nur noch
  studies/assistant (jetzt migriert), **Datei löschen**.
- `src/lib/ai/anthropic.ts` Kopf-Kommentar: Verweis auf `action "ai-assist"` →
  `api/admin/assistant`.
- `ADMIN_PANEL_OVERHAUL_PLAN.md` §7 / Phase-Checkliste: Häkchen setzen.

---

## 4. Tests

### Lokal (Pflicht, gründlich — aktiv genutzter Moderations-Workflow) `[ ]`
- Studien-DB lokal befüllen. Durchspielen: jeder Filter (Suche mit Debounce,
  Qualität, Priorität, `studyType`, Quelle, Score min/max, Datum von/bis),
  Sortierung auf/ab je Feld, Pagination, Schnell-„gut", Schnell-„schlecht",
  Edit (Titel/Beschr./Tags/Priorität/Review-Notiz/Status) + Speichern, Löschen
  + Bestätigung. Nach jeder Mutation: `select * from admin_audit_log order by
  created_at desc limit 1` → Zeile da, `before`/`after`-Diff plausibel.
- Deep-Link `…/studies?quality=pending` → Filter steht initial richtig.
- Assistent: leer laden → Prompt senden → Seite neu laden → Verlauf da → zweiter
  Browser/Inkognito als selber Admin → beide Einträge sichtbar → „Verlauf
  löschen" → leer → Reload → immer noch leer. Feature-Flag `ai_assistant` in
  Steuerung aus → 403-Text.
- `npm run typecheck && npm run lint && npm run build` grün.

### Prod (vorsichtig, über den Browser mit dir eingeloggt) `[ ]`
- Studien: Seite öffnen, Liste + Filter lesen (read-only). **Eine** rückgängig­
  machbare Änderung (z. B. Priorität einer Studie ändern, dann zurückändern) →
  persistiert + Audit-Zeile. Queue **nicht** in Masse anfassen.
- Assistent: einen Wegwerf-Prompt senden → speichert + nach Reload sichtbar →
  wieder löschen.
- Network-Tab: kein Call mehr auf `/api/admin/dashboard` (Route ist weg → 404).

---

## 5. Reihenfolge / Größe

1. Contracts + `content/studies` GET/PATCH/DELETE (Query-Logik portieren)
2. Studien-Seite umschreiben
3. `admin_assistant_messages`-Migration (lokal + prod-Push + gegenprüfen)
4. `assistant` GET/POST/DELETE + Contract
5. Assistent-Seite umschreiben
6. `dashboard/route.ts` + `adminApi.ts` löschen
7. Lokaler Testlauf → typecheck/lint/build
8. Ein PR → prod-Smoke über den Browser

Grobe Größe: **ein mittlerer PR**. Studien-Seite ist der Hauptbrocken
(473 Z., überwiegend mechanische Swaps). Für dich ändert sich am Verhalten
nur: Suche ruckelt nicht mehr, Review-Notiz-Feld + Studien-Typ-Filter neu,
Assistent-Verlauf auf allen Geräten.
