# 🛠️ Engineering TODO

Konkrete, code-nahe Folgeaufgaben, die über mehrere Sessions hinweg entdeckt
wurden — gefundene Bugs, halb verdrahtete Features, verschobene
Entscheidungen. Das ist **nicht** die Produkt-Roadmap (siehe `ROADMAP.md`) und
**nicht** der Content-Backlog (siehe `docs/CONTENT_BACKLOG.md`), sondern die
"geht nicht mehr verloren"-Liste für Engineering-Arbeit.

> Wenn du etwas aufgreifst: Punkt erledigen, dann aus dieser Datei löschen —
> Git-Historie und Commit-Message sind der Nachweis, was gemacht wurde. Diese
> Datei soll immer nur den aktuellen Stand zeigen, kein Changelog werden.

**Status-Legende:** 🔧 gefixt, braucht noch Verifikation · 🔍 neu gefunden,
noch nicht untersucht · ⏸️ blockiert auf Entscheidung/Check, kein Code nötig
· 💤 niedrige Priorität, kein Bug

---

## 🤖 Studien-Assistent

- [ ] 🔍 **Studien-Assistent (`components/WikiAskBot.tsx`) soll "schlauer und
      konkreter" antworten** — Nutzerwunsch 2026-08-13, nachdem eine große
      Recherche-Runde neue Wiki-Artikel-Inhalte lieferte. Wichtiger Fund beim
      Nachschauen: Der Bot braucht **keinen separaten "Fütterungs"-Schritt** —
      er ist rein clientseitig (kein externes LLM, keine Embeddings) und liest
      zur Laufzeit direkt aus `wikiArticles` in `data/terpira/wiki.ts`,
      demselben Array, das auch `/studies/[slug]` rendert. Sobald ein Artikel
      in `GROW_KNOWLEDGE` kuratiert ist, kennt der Assistent ihn automatisch.
      Was für "schlauer" tatsächlich fehlt:
      1. **Content-Abdeckung** — passiert bereits durch die laufende
         Kuratierung neuer Recherche-Artikel. Für gute Trefferqualität sollten
         `faq`- und `keyTakeaways`-Einträge an Formulierungen orientiert sein,
         wie Nutzer real fragen würden — `scoreArticle()` matcht nur auf
         Keyword-Overlap, keine Synonyme/Semantik.
      2. **Synthese-Logik ist simpel** (`synthesizeAnswer()`,
         `WikiAskBot.tsx:95-136`): nimmt nur den bestbewerteten *einen*
         Artikel, hängt Summary + erste 3 Kernpunkte + ggf. einen
         FAQ-Treffer zusammen. Kein Zusammenführen mehrerer relevanter
         Artikel, keine echte Beantwortung von Unterfragen — das ist der
         eigentliche Hebel für "konkreter", nicht mehr Content allein.
      Offene Entscheidung: reicht Content-Kuratierung + FAQ-Feintuning, oder
      soll die Synthese-Logik selbst überarbeitet werden (Multi-Artikel-
      Zusammenfassung, evtl. echtes LLM statt Keyword-Scoring)?
