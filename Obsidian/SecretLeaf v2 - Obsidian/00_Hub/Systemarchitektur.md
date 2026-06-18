# Systemarchitektur – Übersicht

---

tags: #technik #architektur #hub
status: Aktiv

---

> **Dieses Dokument ist eine Kurzübersicht.**
> Vollständige Dokumentation: [[01_Systemarchitektur]] in 07_Technik

---

## SecretLeaf System auf einen Blick

```
┌─────────────────────────────────────────────────────┐
│                    NUTZER                           │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│               FRONTEND                              │
│  Next.js 14 · TypeScript · Tailwind · shadcn/ui    │
│  Dashboard · Grow Tagebuch · Diagnose · Wissen     │
└────────────────────┬────────────────────────────────┘
                     │ API
┌────────────────────▼────────────────────────────────┐
│               SUPABASE                              │
│  PostgreSQL · Auth · Storage · RLS                 │
│  grows · plants · images · diagnoses · journal     │
└────────────┬────────────────────┬───────────────────┘
             │                    │
┌────────────▼──────┐   ┌────────▼────────────────────┐
│   OPENAI API      │   │   ANTHROPIC API             │
│  GPT-4o Vision   │   │  Claude (Empfehlungen)       │
│  Bilddiagnosen   │   │  Wissensabfragen             │
└───────────────────┘   └─────────────────────────────┘
             │
┌────────────▼────────────────────────────────────────┐
│           KNOWLEDGE GRAPH                           │
│  Entitäten · Beziehungen · Wissen                  │
│  Sorten · Krankheiten · Nährstoffe · Terpene       │
└─────────────────────────────────────────────────────┘
```

---

## Weiterführende Dokumente

- **Vollständige Systemarchitektur:** [[01_Systemarchitektur]]
- **Datenbank-Schema:** [[05_Supabase_Datenmodell]]
- **KI-Architektur:** [[03_KI_Architektur]]
- **KI-Integration Details:** [[06_KI_Integration]]
- **Tech Stack Entscheidungen:** [[05_Tech_Stack]]
- **API-Architektur:** [[04_API_Architektur]]
