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

- [x] ✅ **Studien-Assistent (`components/WikiAskBot.tsx`) "schlauer und
      konkreter"** — erledigt 2026-08-13. Zwei Root-Cause-Fixes in
      `synthesizeAnswer()`/`findBestFaq()`:
      1. **FAQ-Matching entkoppelt vom Artikel-Ranking**: `findBestFaq()`
         durchsucht jetzt alle Artikel-FAQs direkt statt nur die Top-2 aus
         `scoreArticle()` — vorher konnte ein Artikel mit zufälligem
         Titel-Treffer (Gewicht 12) vor dem Artikel landen, der die Frage
         wörtlich als FAQ beantwortet.
      2. **Stopwortliste stark erweitert**: Modalverben/Pronomen wie "ich",
         "sollte", "kann" wurden vorher als Keyword-Tokens gewertet (inkl.
         Längenbonus ab 6 Zeichen) und haben Fragen zu falschen Artikeln
         gezogen.
      3. **Zweiter, eigenständiger Artikel wird bei vergleichbarer Relevanz
         kurz mit angehängt** ("Ergänzend – ...") statt Antworten immer nur
         aus einem einzelnen Artikel zu synthetisieren.
      Live getestet: wörtliche FAQ-Fragen (z. B. "Wie lange zwischen zwei
      Portionen Edibles warten?", "Ist Live Resin dasselbe wie Live Rosin?")
      liefern jetzt die exakte FAQ-Antwort statt einer generischen
      Artikel-Zusammenfassung.
