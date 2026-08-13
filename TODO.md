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

## 📝 Content

- [ ] 🔍 **Zwei Wiki-Artikel (`recall-und-sperrprozesse-fuer-chargen`,
      `batch-release-und-freigabekriterien`) sind nicht in `GROW_KNOWLEDGE`
      kuratiert** — beim B2B-Ton-Rewrite 2026-08-13 gefunden. `wikiArticles`
      in `data/terpira/wiki.ts` filtert alle Quell-Artikel auf
      `.filter((a) => a.slug in GROW_KNOWLEDGE)` — beide Artikel existieren
      im Quellcode (inzwischen auf Home-Grow-Ton umgeschrieben) und werden
      von anderen Artikeln in `relatedSlugs` referenziert, sind aber selbst
      nie über `/studies/[slug]` erreichbar (404). Kein akutes Problem für
      Nutzer — die Related-Artikel-Logik filtert nicht auflösbare Slugs
      bereits sauber raus, keine toten Links sichtbar. Aber unklar, ob das
      Fehlen in `GROW_KNOWLEDGE` Absicht ist (Artikel noch nicht bereit) oder
      ein Versehen — falls sie eigentlich live sein sollten, fehlt nur der
      `GROW_KNOWLEDGE`-Eintrag mit `growValue`/`qualityScore`/`growCategory`.
