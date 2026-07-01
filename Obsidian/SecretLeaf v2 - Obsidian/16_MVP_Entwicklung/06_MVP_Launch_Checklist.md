# MVP Launch Checklist

---

tags: #mvp #launch #checkliste #execution
status: In Bearbeitung
priorität: Tier S
verknüpft: [[01_MVP_Feature_Liste]] [[05_Entwicklungsplan]] [[05_Go_To_Market]] [[04_Rechtliche_Risiken]] [[05_Supabase_Datenmodell]]

---

## Zweck

Diese Checkliste definiert alle Aufgaben, die vor dem Public Launch des SecretLeaf MVP abgeschlossen sein müssen.

**Regel:** Kein Public Launch ohne grüne Checkliste in Tier S.

---

## Tier S – Pflicht vor Launch

### Technisch – Fundament

- [ ] Supabase Projekt erstellt (Production)
- [ ] Datenbankschema vollständig deployed
- [ ] RLS für alle Tabellen aktiviert und getestet
- [ ] Storage Bucket konfiguriert
- [ ] Auth funktioniert (Email Registrierung, Login, Passwort-Reset)
- [ ] Umgebungsvariablen Production gesetzt
- [ ] Deployment auf Vercel (Production)
- [ ] Custom Domain eingerichtet (secretleaf.de / secretleaf.app)
- [ ] SSL-Zertifikat aktiv
- [ ] Sentry Fehlertracking aktiv

### Technisch – Kernfunktionen

- [ ] Grow erstellen funktioniert
- [ ] Grow bearbeiten funktioniert
- [ ] Bild Upload funktioniert (inkl. Komprimierung)
- [ ] Bilder werden korrekt in Supabase Storage gespeichert
- [ ] KI Diagnose liefert valide Ergebnisse (>10 manuelle Tests)
- [ ] Dashboard zeigt aktive Grows korrekt an
- [ ] Timeline / Tagebuch funktioniert
- [ ] Journal Einträge können erstellt werden
- [ ] Profil-Einstellungen funktionieren

### Rechtlich

- [ ] Datenschutzerklärung (DSGVO-konform)
- [ ] Impressum (Name, Adresse, E-Mail)
- [ ] Cookie-Hinweis / Consent Banner
- [ ] Nutzungsbedingungen (AGB)
- [ ] Hinweis: Keine medizinische oder rechtliche Beratung
- [ ] Altersverifikation (18+) überprüft / implementiert
- [ ] Haftungsausschluss für KI-Empfehlungen

### Analytics & Monitoring

- [ ] Posthog Events implementiert:
  - [ ] `user_registered`
  - [ ] `grow_created`
  - [ ] `image_uploaded`
  - [ ] `diagnosis_started`
  - [ ] `diagnosis_completed`
  - [ ] `journal_entry_created`
- [ ] Dashboard in Posthog eingerichtet
- [ ] Sentry Error Rate < 1% in Beta

### E-Mail

- [ ] Resend konfiguriert
- [ ] Welcome E-Mail bei Registrierung
- [ ] E-Mail-Zustellung in Produktion getestet

---

## Tier A – Sollte vor Launch fertig sein

### UX/UI

- [ ] Mobile responsiv (wichtig für Bild-Upload vom Handy)
- [ ] Loading States für alle async Aktionen
- [ ] Fehlermeldungen sind nutzverständlich (keine technischen Fehlercodes)
- [ ] Leere States (kein Grow vorhanden → CTA zeigen)
- [ ] Onboarding nach Registrierung (mindestens: "Erstelle deinen ersten Grow")

### Wissenssystem

- [ ] Mindestens 20 Wissensartikel veröffentlicht
- [ ] Kategorien: Growing, Krankheiten, Nährstoffe
- [ ] Artikel sind SEO-optimiert (Meta Title, Description)
- [ ] Interne Verlinkung zwischen Artikeln

### Performance

- [ ] Lighthouse Score > 80 (Performance, Accessibility)
- [ ] Bildkomprimierung funktioniert
- [ ] Datenbankabfragen unter 500ms (kritische Routen)

---

## Tier B – Nice to have, nicht blockt Launch

- [ ] Benachrichtigungen (Grow-Erinnerung)
- [ ] Globale Suche
- [ ] Sortendatenbank (Basis)
- [ ] Social Sharing für Diagnosen

---

## Pre-Launch (3 Tage vorher)

- [ ] Beta-Nutzer informiert: Launch-Datum und -Uhrzeit
- [ ] Reddit-Post vorbereitet und von Bekannten gereviewed
- [ ] Product Hunt-Profil erstellt und Teaser online
- [ ] 5–10 "Seeding"-Nutzer bereit für sofortige Aktivität am Launch-Tag
- [ ] Demo-Video (30–60 Sekunden) fertig
- [ ] Landing Page Screenshot / Preview fertig

---

## Launch-Tag

- [ ] Reddit-Post live (r/germantrees + r/microgrowery)
- [ ] Product Hunt-Submission live (08:00 PST)
- [ ] Twitter/X Ankündigung
- [ ] Seeding-Nutzer kommentieren und interagieren
- [ ] Founder beantwortet alle Kommentare innerhalb 1 Stunde

---

## Post-Launch (erste Woche)

- [ ] Täglich Analytics prüfen (Registrierungen, Aktivierungen, MAG)
- [ ] Alle Fehlermeldungen in Sentry innerhalb 24h addressieren
- [ ] User-Feedback aus Reddit-Kommentaren sammeln
- [ ] Erster Beta-Nutzer-Feedback-Call nach 3 Tagen
- [ ] Kritische Bugs: Hotfix innerhalb 24h

---

## Erfolgsmessung (nach 7 Tagen)

| KPI | Ziel |
|---|---|
| Registrierungen | >200 |
| Grows erstellt | >80 |
| Diagnosen durchgeführt | >50 |
| 7-Tage-Retention | >20% |
| Kritische Bugs | 0 |

---

## Launch Go / No-Go Entscheidung

**Go wenn:**
- Alle Tier-S-Punkte grün
- Mindestens 80% der Tier-A-Punkte grün
- Keine kritischen Bugs in Beta seit 48h
- Rechtliche Dokumente vollständig

**No-Go wenn:**
- Kritische Sicherheitslücken offen
- KI-Diagnose liefert konsistent falsche Ergebnisse
- Rechtliche Dokumente fehlen

## Verknüpfte Dokumente

[[01_MVP_Feature_Liste]]
[[05_Entwicklungsplan]]
[[05_Go_To_Market]]
[[04_Rechtliche_Risiken]]
[[05_Supabase_Datenmodell]]
[[05_Tech_Stack]]

## Änderungsverlauf

### V1
Erstversion
