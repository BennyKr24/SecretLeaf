# Tech Stack

---

tags: #technik #architektur #mvp #entscheidung
status: Entschieden
priorität: Tier S
verknüpft: [[01_Systemarchitektur]] [[05_Supabase_Datenmodell]] [[03_KI_Architektur]] [[05_Entwicklungsplan]]

---

## Zweck

Dieses Dokument definiert den vollständigen technischen Stack von SecretLeaf.
Es begründet jede technologische Entscheidung und dient als Referenz für alle Entwicklungsarbeiten.

---

## Leitprinzipien für Technologieentscheidungen

1. **Geschwindigkeit vor Perfektion** – Wir müssen schnell validieren.
2. **Hosting-Kosten minimal halten** – Serverless und managed services bevorzugen.
3. **Data Moat-fähig** – Jede Technologieentscheidung muss Datengewinn ermöglichen.
4. **KI-Integration als erste Klasse** – Architektur muss KI nativ unterstützen.
5. **Skalierbar von Anfang an** – Keine Architektur, die bei 10.000 Nutzern neu gebaut werden muss.

---

## Stack Übersicht

| Bereich | Technologie | Begründung |
|---|---|---|
| Frontend Framework | Next.js 14 (App Router) | SEO, SSR, API Routes, Vercel-native |
| Sprache | TypeScript | Typensicherheit, bessere DX |
| Styling | Tailwind CSS | Schnelle Entwicklung, konsistentes Design |
| UI Komponenten | shadcn/ui | Flexibel, Tailwind-kompatibel, nicht opinionated |
| Backend / Auth / DB | Supabase | PostgreSQL + Auth + Storage in einem |
| Datenbank | PostgreSQL (via Supabase) | Relationale Struktur, JSONB für flexible Daten |
| Bilderspeicherung | Supabase Storage | Direkte Integration, CDN |
| KI / Diagnose | OpenAI API (GPT-4o Vision) | Bildanalyse, beste Erkennungsrate |
| KI / Text | Anthropic Claude API | Empfehlungen, Erklärungen, Wissensabfragen |
| Deployment | Vercel | Next.js-nativ, Preview-Deployments, Edge |
| E-Mail | Resend | Developer-freundlich, React Email Templates |
| Analytics | Posthog | Self-hostable, Event Tracking, Funnelanalyse |
| Monitoring | Sentry | Fehlertracking Frontend + Backend |
| Package Manager | pnpm | Schneller als npm/yarn |

---

## Frontend

### Next.js 14 (App Router)

**Warum:** SecretLeaf braucht Server-Side Rendering für SEO (Wissenssystem, Sortendatenbank, Programmatic SEO). Next.js ist der Standard für datengetriebene Web-Apps mit SEO-Anforderungen. Die App Router Architektur ermöglicht eine saubere Trennung zwischen Server- und Client-Komponenten.

**Entscheidung gegen:** Create React App (kein SSR), Remix (kleineres Ökosystem), SvelteKit (weniger KI-Tooling).

### TypeScript

**Warum:** Wachsende Codebasis braucht Typsicherheit. Fehler werden früher erkannt. Besseres Refactoring. KI-Assistenten (Copilot, Cursor) produzieren besseren Code mit TypeScript.

### Tailwind CSS + shadcn/ui

**Warum:** Kein CSS-Framework-Overhead. Direkte Kontrolle über Design. shadcn/ui liefert zugängliche Basiskomponenten (Dialog, Dropdown, Toast etc.) ohne Design-Vorgaben aufzuzwingen.

**Design-Referenz:** Linear, Vercel, Stripe – nicht Reddit oder Foren.

---

## Backend / Datenbank

### Supabase

**Warum:** Supabase löst in einem Service:
- PostgreSQL-Datenbank mit vollem SQL-Zugriff
- Auth (Email, OAuth, Magic Link)
- Row Level Security für Datenisolation
- Storage für Bilder (S3-kompatibel)
- Realtime (optional, später für Live-Updates)
- Auto-generierte REST + GraphQL APIs

**Entscheidung gegen:** Firebase (kein SQL, Lock-in), PlanetScale (nur MySQL), eigener Server (zu viel Overhead in MVP-Phase).

**Kritisch:** Supabase-Schema-Entscheidungen sind langfristig. Jede Tabelle wird mit Blick auf den Data Moat und KI-Training designed. Siehe [[05_Supabase_Datenmodell]].

---

## KI-Systeme

### Bildanalyse: OpenAI GPT-4o Vision

**Warum:** Beste Bilderkennungsleistung für botanische Symptome. Multimodal (Bild + Text in einem Prompt). API-Kosten vertretbar für MVP.

**Kosten-Schätzung MVP:**
- ca. 0,003 USD pro Bild (GPT-4o-mini Vision)
- ca. 0,015 USD pro Bild (GPT-4o Vision, höhere Qualität)
- Ziel: Diagnose-Kosten unter 0,05 USD pro Session halten

**Prompt-Strategie:**
```
System: Du bist ein Cannabis-Experte mit tiefem Wissen über 
Nährstoffmängel, Krankheiten und Grow-Probleme.
Analysiere das Bild und identifiziere:
1. Wahrscheinlichste Ursache + Konfidenz (%)
2. Alternative Ursachen
3. Konkrete Handlungsempfehlung
4. Präventionsmaßnahme
Antworte im JSON-Format.
```

### Wissensabfragen + Empfehlungen: Anthropic Claude

**Warum:** Claude ist stärker bei komplexen Erklärungen, längeren Antworten und Nutzung strukturierter Wissensdatenbanken (via RAG).

**Einsatz:**
- Fragen beantworten ("Warum wachsen meine Pflanzen langsam?")
- Empfehlungen generieren (basierend auf Grow-Status)
- Wissenssystem-Abfragen

### Langfristig: RAG + Eigene Modelle

Phase 3+: Retrieval Augmented Generation (RAG) auf Basis des SecretLeaf Knowledge Graph.
Phase 4+: Finetuning auf proprietären Grow-Daten.

---

## Deployment

### Vercel

**Warum:** Next.js-nativ. Preview-Deployments für jeden PR. Automatisches SSL. Edge Functions für schnelle globale Performance. Kostenlos bis zu einem definierten Limit.

**Pipeline:**
```
GitHub Push → Vercel CI → Build → Preview-Deployment → Review → Production
```

### Branching-Strategie
- `main` → Production
- `develop` → Staging (Vercel Preview)
- `feature/*` → Feature-Preview

---

## Analytics & Tracking

### Posthog

**Warum:** Open-Source, selbst-hostbar (kein Datenschutzproblem), Event-Tracking für AARRR-Funnel, Session-Recording, Feature Flags.

**Kritische Events:**
```
user_registered
grow_created
image_uploaded
diagnosis_started
diagnosis_completed
diagnosis_feedback
journal_entry_created
harvest_documented
dashboard_viewed
```

Diese Events direkt mapbar auf AARRR-Framework. Siehe [[02_AARRR_Framework]].

---

## E-Mail

### Resend + React Email

**Warum:** Entwicklerfreundlichste E-Mail-Lösung. React-Templates. Hohe Zustellrate.

**Geplante E-Mails:**
- Welcome E-Mail nach Registrierung
- Grow-Erinnerung (kein Update seit 7 Tagen)
- Diagnose-Ergebnis
- Ernte-Zusammenfassung

---

## Monitoring

### Sentry

Frontend + Backend Fehlertracking. Pflicht ab Tag 1 in Production.

---

## Lokale Entwicklung

### Setup

```bash
git clone [repo]
pnpm install
cp .env.example .env.local
# Supabase Keys eintragen
pnpm dev
```

### Umgebungsvariablen

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
SENTRY_DSN=
```

---

## Kosten-Übersicht (MVP-Phase, ~100 MAG)

| Service | Kosten/Monat | Bemerkung |
|---|---|---|
| Vercel | 0 USD | Hobby-Plan ausreichend |
| Supabase | 0 USD | Free Tier: 500MB DB, 1GB Storage |
| OpenAI API | ~5–15 USD | ~100 Diagnosen/Monat |
| Anthropic API | ~3–8 USD | ~200 Abfragen/Monat |
| Resend | 0 USD | Free Tier: 3.000 E-Mails/Monat |
| Posthog | 0 USD | Free Tier: 1M Events/Monat |
| Sentry | 0 USD | Free Tier ausreichend |
| **Gesamt** | **~10–25 USD** | Skaliert mit Nutzung |

---

## Risiken

- **OpenAI API-Kosten** skalieren linear mit Diagnosen → frühzeitig Caching und Ratenlimits einbauen
- **Supabase Free Tier Limits** bei schnellem Wachstum → Upgrade auf Pro ($25/Monat) einplanen
- **KI-Latenz** bei Diagnosen → Ladeanimation und Erwartungsmanagement nötig
- **Lock-in** bei Supabase → PostgreSQL-Standard ermöglicht Migration; vertretbar für MVP

---

## Nicht verwendet (und warum)

| Technologie | Warum nicht |
|---|---|
| Firebase | Kein SQL, schwerer Data Moat aufzubauen |
| Prisma ORM | Overhead für MVP, Supabase-Client reicht |
| tRPC | Overhead, Next.js API Routes ausreichend |
| GraphQL | Zu komplex für MVP, REST-Stil über Supabase |
| Docker / eigener Server | Zu viel DevOps-Overhead in der MVP-Phase |
| React Native | Mobile App ist Post-MVP |

---

## Offene Entscheidungen

- [ ] OAuth Provider: Google und/oder Apple und/oder Discord?
- [ ] Bild-Komprimierung clientseitig (vor Upload) oder serverseitig?
- [ ] Caching-Strategie für Wissensdatenbank (ISR vs. SSG)?
- [ ] Supabase Realtime für Dashboard-Live-Updates (MVP oder Post-MVP)?

## Verknüpfte Dokumente

[[01_Systemarchitektur]]
[[05_Supabase_Datenmodell]]
[[03_KI_Architektur]]
[[04_API_Architektur]]
[[05_Entwicklungsplan]]

## Änderungsverlauf

### V1
Erstversion
