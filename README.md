<div align="center">

# 🌿 SecretLeaf

**Grow OS · Wissensplattform · Diagnose · Tools**

[![Vercel](https://img.shields.io/badge/Vercel-Live-brightgreen?style=flat-square&logo=vercel)](https://secretleaf.vercel.app)
[![Version](https://img.shields.io/badge/Version-v2-blue?style=flat-square)](./version.txt)
[![Branch](https://img.shields.io/badge/Branch-main-purple?style=flat-square&logo=git)](https://github.com/BennyKr24/SecretLeaf)
[![Issues](https://img.shields.io/github/issues/BennyKr24/SecretLeaf?style=flat-square&color=orange)](https://github.com/BennyKr24/SecretLeaf/issues)
[![Last Commit](https://img.shields.io/github/last-commit/BennyKr24/SecretLeaf?style=flat-square&color=blueviolet)](https://github.com/BennyKr24/SecretLeaf/commits/main)
[![Stack](https://img.shields.io/badge/Stack-Next.js_16_·_Supabase_·_Tailwind-0ea5e9?style=flat-square)](https://github.com/BennyKr24/SecretLeaf)

</div>

---

## 🚨 Current Focus

> Was gerade zählt. Nicht was schön wäre.

- 🟢 **Grow OS** — Core vollständig (Plan, Tasks, Log, Multi-Plant, Retention). Kein weiterer Aufbau nötig.
- 🔴 **Grow-Daten gehören nicht dem User** — localStorage = kein Backup, kein Cross-Device. Migration zu Supabase ist der wichtigste unbuildete Schritt.
- 🔴 **Keine Monetarisierung** — Kein Stripe, kein Paywall, kein Pro-Tier. Null Einnahmen.
- 🟡 **Auth existiert, aber hängt in der Luft** — Supabase Auth läuft. Grow-Daten sind trotzdem localStorage-only.
- 🟡 **Diagnose-Loop bricht ab** — Diagnose endet mit Lognotiz-Vorschlag zum Kopieren. Kein direkter CTA.

---

## ⚠️ Critical Gaps

- Keine Monetarisierung
- Grow-Daten: kein Backend, kein Backup, kein Cross-Device
- Kein Analytics
- Kein Error-Tracking (Sentry fehlt)
- Newsletter speichert Emails in localStorage — kein echter Versand
- Diagnose schreibt nicht in den Log
- Grow-History nicht zugreifbar

---

## 🧠 Next Move

> Genau 3 Schritte. In dieser Reihenfolge.

1. **Grows in Supabase speichern** — Auth ist da, Schema fehlt. `grows`, `log_entries`, `plants` Tabellen erstellen, Store umschalten. Ohne das ist alles andere wertlos.
2. **Stripe + Pro-Tier** — Feature-Lock definieren + Checkout einbinden. Ohne Einnahmen: Hobby-Projekt.
3. **Diagnose → Log CTA** — Nach Diagnose: "Jetzt loggen" → `addEntry({ type: "notiz", text: logNote })`. Loop schließen. ~2h Aufwand.

---

## ⚡ Quick Actions

| Produkt | |
|---------|--|
| 🌱 Grow starten | [/start](https://secretleaf.vercel.app/start) |
| 📊 Dashboard | [/dashboard/user](https://secretleaf.vercel.app/dashboard/user) |
| 🩺 Diagnose | [/diagnose](https://secretleaf.vercel.app/diagnose) |
| 🛠️ Tools | [/tools](https://secretleaf.vercel.app/tools) |
| 📚 Studien | [/studies](https://secretleaf.vercel.app/studies) |

| Dev | |
|-----|--|
| 🚀 Deploy | `./deploy.sh` |
| 🌱 Dev Server | `npm run dev:web` |
| 🧪 Type-Check | `npm run typecheck` |
| 🔨 Build | `npm run build --workspace @secretleaf/web` |

| GitHub | |
|--------|--|
| 🐛 Issue | [New Issue](https://github.com/BennyKr24/SecretLeaf/issues/new) |
| 💡 Ideen | [IDEAS.md](./IDEAS.md) |
| 📜 History | [Commits](https://github.com/BennyKr24/SecretLeaf/commits/main) |

---

## 🛠️ Run Commands

```bash
./deploy.sh                                       # stage → tsc → next build → push → Vercel
npm run dev:web                                   # Next.js Dev-Server auf :3000
npm run dev:api                                   # Fastify API auf :4000 (nicht produktiv)
npm run typecheck                                 # tsc --noEmit alle Workspaces
npm run build --workspace @secretleaf/web         # Production Build
npm run lint                                      # ESLint alle Workspaces
```

`deploy.sh` blockiert bei TypeScript- oder Build-Fehlern (Rollback automatisch via `git reset --soft HEAD~1`).  
Schreibt `version.txt` + `deploy-log.txt` lokal (beide `.gitignore`).

---

## 📊 Product Signals

| Signal | Wert |
|--------|------|
| Core Features (Grow OS) | ✅ Wizard · Plan · Phasen · Tasks · Multi-Plant · Log · Alerts |
| Intelligence Layer | ✅ Plant Scoring · Comparison · Critical Alert · Micro-Insight |
| Retention | ✅ Streak · Milestones (3/7/14/21/30) · Daily Completion Banner |
| Tools | ✅ 6 (VPD · Abluft · Licht · Nährstoff · Ertrag · Düngepläne) |
| Diagnose | ✅ 18 Ergebnisse · 4 Kategorien · Konfidenz-Level |
| Auth | ✅ Supabase (Login / Register / Reset) |
| Monetarisierung | ❌ Nicht vorhanden |
| Cloud-Persistenz (Grow) | ❌ localStorage only |
| Analytics | ❌ Kein Tracking |
| Error-Tracking | ❌ Kein Sentry |
| Newsletter-Versand | ❌ Attrappe (localStorage) |
| Push-Notifications | ❌ Nicht gebaut |

---

## 🧩 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        SecretLeaf                               │
├──────────────────────────┬──────────────────────────────────────┤
│      GROW OS (Core)       │         WISSEN (statisch)           │
│                          │                                      │
│  /start  Wizard          │  /studies  Wiki + Quellenregister    │
│  /grow/[id]  Übersicht   │  /category  Themenhubs               │
│    ├─ Phasen-Timeline    │  /database  Dünger-Katalog           │
│    ├─ Task-Liste         │                                      │
│    ├─ PlantCard × n      │         PROBLEM-SOLVING              │
│    └─ Grow Health Row    │                                      │
│                          │  /diagnose  Entscheidungsbaum        │
│  /grow/[id]/log          │    ├─ 4 Kategorien                   │
│    ├─ Eintrag erstellen  │    ├─ 18 Diagnose-Ergebnisse         │
│    ├─ Plant-Filter       │    └─ Tool-Links pro Ergebnis        │
│    ├─ Streak-Badge       │                                      │
│    └─ Completion-Banner  │         KALKULATION                  │
│                          │                                      │
│  /dashboard/user         │  /tools  6 Rechner                   │
│    ├─ Aktiver Grow       │    ├─ VPD · Abluft · Licht           │
│    ├─ Alert-Banner       │    ├─ Nährstoff · Ertrag             │
│    └─ Wissens-Feed       │    └─ Düngepläne                     │
├──────────────────────────┴──────────────────────────────────────┤
│                       INFRASTRUKTUR                             │
│                                                                 │
│  Auth: Supabase (live) ── Grow-Daten: localStorage (⚠ Problem) │
│  Deploy: ./deploy.sh ── Hosting: Vercel ── Repo: GitHub/main   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Vision

**Kernthese:** Wer täglich loggt, pflegt besser. Wer besser pflegt, erntet mehr. Wer mehr erntet, bleibt.

Kein Blog. Kein Info-Portal. Ein Betriebssystem für den Grow — mit täglicher Nutzungsroutine durch Struktur (Plan), Dokumentation (Log), Feedback (Streak, Alerts) und Wissen (Wiki, Diagnose, Tools).

---

## 🧠 Core Principles

1. **Lokalität first.** Grow-Daten im localStorage. Kein Account nötig, zero latency. Schuld: kein Cross-Device, kein Backup.
2. **Plan schlägt Freitext.** 3 Felder → deterministischer Grow-Plan mit Phasen und Tasks.
3. **Feedback ist unmittelbar.** Nach Speichern: Streak-Pulse, ggf. Milestone-Badge, ggf. Completion-Banner.
4. **Wissen ist statisch.** Wiki, Diagnose-Tree, Tool-Logik — alles im Code. Änderungen = Code-Änderungen.
5. **Log auto-schließt Tasks.** Wasser-Eintrag → passende Task auto-completed innerhalb ±3 Tage.

---

## 🚀 Current Product State

### Grow OS

| Feature | Status | Details |
|---------|--------|---------|
| Wizard | ✅ | 3 Felder → `generateGrowPlan()` → persistierter Grow |
| Phasen | ✅ | Keimung → Sämling → Veg → Blüte → Spätblüte → Ernte |
| Tasks | ✅ | 6 Kategorien, auto-complete beim Loggen (±3 Tage) |
| Multi-Plant | ✅ | `Plant[]` pro Grow, rename, Log-Zuordnung |
| Log-Typen | ✅ | Wasser · Dünger · Training · Notiz · Tool-Ergebnis |
| Log bearbeiten | ✅ | Datum, Typ, Notiz editierbar |
| Plant Scoring | ✅ | +10/+5 Aktualität, -3/Tag Bewässerungslücke |
| Plant Comparison | ✅ | Best/Worst ab ≥3 Score-Differenz |
| Critical Alert | ✅ | Kein Log >3d oder kein Wasser >3d |
| Grow Health | ✅ | Stabil wenn keine überfälligen Tasks + keine krit. Pflanzen |

### Retention

| Feature | Status |
|---------|--------|
| Log-Streak | ✅ Tagesgenau, lookback 365 Tage |
| Milestone-Badges | ✅ bei 3 / 7 / 14 / 21 / 30 Tagen |
| Streak-Pulse | ✅ 1.5s Animation nach Speichern |
| Daily Completion Banner | ✅ Slide-in, 5s, nur wenn alles ok |
| Dashboard Alert Banner | ✅ Reaktiv, verschwindet nach Log |
| Lesehistorie / Bookmarks | ✅ localStorage (Wiki) |
| Newsletter | ⚠️ UI vorhanden — kein Versand |
| Push Notifications | ❌ Nicht gebaut |

### Tools (alle stateless, clientseitig)

VPD · Abluft-Rechner · Licht-Rechner · Nährstoff-Rechner · Ertrags-Schätzer · Düngepläne

### Diagnose

18 Ergebnisse mit Konfidenz-Level, Handlungsschritten, Tool-Links:
N/P/K/Ca/Mg/Fe-Mangel · Lockout · Übersalzung · Hitzestress · Kältestress · VPD-hoch · Überwässerung · Spinnmilben · Trauermücken · Thripse · Blattläuse · Botrytis · Breitmilben · Rostmilben · Wurzelläuse

**Lücke:** Kein direkter CTA in Log — `logNote` muss manuell kopiert werden.

---

## ⚠️ Current Gaps

### 🔴 Kritisch

**localStorage nur** — Gerätewechsel = Datenverlust. Auth existiert, Grow-Daten hängen nicht dran.  
**Keine Monetarisierung** — Kein Stripe, kein Paywall, kein Code dafür.

### 🟡 Wichtig

**Newsletter ist Attrappe** — `NewsletterSignup.tsx` schreibt in localStorage. Kein API-Call.  
**Diagnose-Loop bricht ab** — `logNote` vorhanden, aber kein CTA → kein direkter Log-Eintrag.  
**Plant Notes ohne UI** — `Plant.notes?: string` im Typ, nirgendwo editierbar.  
**Grow-History fehlt** — Abgeschlossene Grows gespeichert, aber keine Ansicht, kein Vergleich.

### 🔵 Blind Spots

Kein Error-Tracking · Kein Analytics · Fastify API ohne produktive DB wertlos.

---

## 🧩 Next Priorities

| Prio | Was | Warum |
|------|-----|-------|
| 1 | **Supabase Grow Storage** | Auth da, Schema fehlt. Ohne das: kein Backup, keine Monetarisierung möglich. |
| 2 | **Stripe + Pro-Tier** | Feature-Lock + Checkout. Ohne Einnahmen: Hobby-Projekt. |
| 3 | **Diagnose → Log CTA** | Loop schließen. ~2h. Höchste Effizienz/Aufwand-Ratio. |
| 4 | **Plant Notes UI** | Feld im Typ vorhanden. Nur Textarea fehlt. |
| 5 | **Newsletter Backend** | Resend/Loops (~2h). Emails sammeln bevor Userwachstum. |
| 6 | **Grow History View** | Abgeschlossene Grows anzeigen. Basis für Ernte-Tracking. |
| 7 | **i18n / Englisch** | `next-intl` + `/[locale]` Routing. Internationalisierung = Growth-Multiplikator. Details → [IDEAS.md](./IDEAS.md#-internationalisierung) |

---

## 🔁 Product Loops

### Primärer Daily Loop
```
Dashboard Alert → "Jetzt pflegen"
→ /grow/[id]/log?plant=<id>
→ Eintrag speichern → Task auto-completed
→ Streak +1 → ggf. Milestone-Badge → Completion-Banner
→ Dashboard: Alert weg
```

### Onboarding Loop
```
Landing → /start (3 Felder) → Plan generiert
→ /grow/[id] → Erste Task → Log → Streak beginnt
```

### Diagnose-Loop *(bricht aktuell ab)*
```
Symptom → /diagnose → Entscheidungsbaum → Diagnose + Steps
→ [Lücke: kein CTA] → Log manuell öffnen und kopieren
```

### Wissens-Loop *(passiv)*
```
/studies → Artikel lesen (Lesehistorie) → Bookmark
→ Dashboard-Feed personalisiert sich
```

---

## 💡 Feature Backlog

### High Impact
- Supabase Grow Storage (unlock alles andere)
- Stripe Pro-Tier (unlock: Einnahmen)
- Diagnose → Log CTA (~2h)
- Grow History View

### Medium Impact
- Plant Notes UI
- Newsletter Backend (~2h, Resend/Loops)
- Log-Export CSV/PDF
- Push Notifications via Service Worker
- Phasen-Wechsel-Vorschlag (wenn `currentDay > endDay`)

### Low Impact
- Harvest-Daten strukturiert (Gramm, Strain, Bewertung)
- Tool-Ergebnisse in Plant-View
- Dark Mode
- Grow-Fotos (Upload-Flow)

---

## 💡 Ideas

→ [IDEAS.md](./IDEAS.md) — Alle Ideen, frei strukturiert, mit Status-Labels (🔥 / 🌱 / 🧪 / 💀 / ✅)

---

## 🛠️ Dev Workflow

### Deployment

```
./deploy.sh
```

1. Pre-check: git repo + branch = main
2. `git add -A` → prüft auf Änderungen
3. `git commit "deploy vN: [files]"` (reversibel)
4. `tsc --noEmit` → bei Fehler: Rollback
5. `next build` → bei Fehler: Rollback
6. `git push origin main` (auto-rebase bei remote ahead)
7. `version.txt++`, `deploy-log.txt` schreiben

### Repo-Struktur

```
apps/
  web/       Next.js 16, App Router, Tailwind, Supabase Client
  api/       Fastify + Prisma (konfiguriert, nicht produktiv)
packages/
  shared/    (fast leer)
scripts/     Wiki-Sync, Fertilizer-Prices, Status-Probe
supabase/    Migrations: Auth, Studies, RLS, Engine
```

### Datenpersistenz

| Daten | Wo | Problem |
|-------|-----|---------|
| Grows, Plants, Log-Entries | localStorage | ⚠️ Kein Backup, Cross-Device |
| Auth Session | Supabase (cookie) | — |
| Wiki, Studien, Artikel | Code (static) | — |
| Dünger-Katalog | Code (`/data/terpira/fertilizers`) | — |
| Newsletter-Emails | localStorage | ⚠️ Attrappe |
| Lesehistorie, Bookmarks | localStorage | — |

---

## 📊 Key Metrics

*Aktuell kein Tracking vorhanden.*

| Metrik | Signal |
|--------|--------|
| Streak ≥ 3 Tage | Habit entsteht |
| Log-Entries pro Grow | Engagement-Tiefe |
| Grow-Abschlussrate | Nutzer bleiben bis Ernte |
| Task-Completion-Rate | Plan ist relevant |
| Diagnose-to-Log-Rate | Loop schließt sich |
| Grows pro User *(post-Supabase)* | Retention |
| Plant-Alert-Click-Rate | Alerts führen zu Handlung |

---

## 🧠 Product Rules

1. **Kein Push ohne Build.** `deploy.sh` blockt bei TypeScript- oder Build-Fehlern. Kein Bypass.
2. **Streak muss brechen.** Er ist kein Kosmetik-Feature. Bricht er nicht, hat er als Retention-Mechanismus keinen Wert.
3. **localStorage ist ein Schulden-Timeout.** Schnell jetzt. Beim ersten zahlenden Nutzer muss Supabase fertig sein — sonst verliert er beim Gerätewechsel alles.
