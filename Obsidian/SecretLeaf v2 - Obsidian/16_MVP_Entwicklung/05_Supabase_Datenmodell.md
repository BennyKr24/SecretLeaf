# Supabase Datenmodell

---

tags: #technik #datenbank #mvp #supabase #kritisch
status: Entwurf
priorität: Tier S
verknüpft: [[03_Datenmodell_MVP]] [[02_Datenbankarchitektur]] [[07_Entitaetsmodell]] [[05_Entwicklungsplan]]

---

## Zweck

Dieses Dokument definiert das vollständige Supabase-Datenbankschema für den SecretLeaf MVP.
Es ist die direkte technische Umsetzung des konzeptionellen Datenmodells.
Es dient als Grundlage für die Datenbankeinrichtung, RLS-Policies und API-Entwicklung.

## Stack

- **Datenbank:** Supabase (PostgreSQL 15)
- **Auth:** Supabase Auth (email + OAuth)
- **Storage:** Supabase Storage (Bilder)
- **Realtime:** optional (später für Dashboard-Updates)

---

## Tabellen

### `users` (via Supabase Auth)

Supabase erstellt `auth.users` automatisch.
Zusätzlich wird eine `public.profiles`-Tabelle angelegt.

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  display_name TEXT,
  country TEXT,
  timezone TEXT DEFAULT 'Europe/Berlin',
  premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `grows`

Zentrale Dateneinheit. Wichtigstes Objekt der gesamten Plattform.

```sql
CREATE TABLE public.grows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  strain_name TEXT NOT NULL,
  medium TEXT NOT NULL CHECK (medium IN ('erde', 'coco', 'hydro', 'aero', 'andere')),
  environment TEXT NOT NULL CHECK (environment IN ('indoor', 'outdoor', 'gewächshaus')),
  status TEXT NOT NULL DEFAULT 'keimung' CHECK (status IN (
    'keimung', 'sämling', 'vegetation', 'vorblüte',
    'blüte', 'spülung', 'ernte', 'trocknung', 'curing', 'abgeschlossen'
  )),
  start_date DATE NOT NULL,
  end_date DATE,
  pot_size_liter NUMERIC(5,1),
  light_type TEXT,
  tent_size TEXT,
  notes TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `plants`

Einzelne Pflanze innerhalb eines Grows.

```sql
CREATE TABLE public.plants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grow_id UUID REFERENCES public.grows(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Pflanze',
  strain_name TEXT,
  age_days INTEGER DEFAULT 0,
  status TEXT DEFAULT 'aktiv' CHECK (status IN ('aktiv', 'abgeschlossen', 'entfernt')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `images`

Bilddokumentation – wichtigste KI-Datenquelle.

```sql
CREATE TABLE public.images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grow_id UUID REFERENCES public.grows(id) ON DELETE CASCADE NOT NULL,
  plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  category TEXT DEFAULT 'allgemein' CHECK (category IN (
    'allgemein', 'blatt', 'gesamtpflanze', 'bud', 'wurzel', 'symptom', 'ernte'
  )),
  grow_phase TEXT,
  description TEXT,
  ai_analyzed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `diagnoses`

KI-Diagnose-Ergebnisse – zentrales Lernwerkzeug.

```sql
CREATE TABLE public.diagnoses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_id UUID REFERENCES public.images(id) ON DELETE SET NULL,
  grow_id UUID REFERENCES public.grows(id) ON DELETE CASCADE NOT NULL,
  plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- KI Output
  primary_cause TEXT NOT NULL,
  primary_confidence NUMERIC(5,2),
  alternative_causes JSONB,        -- [{cause: "...", confidence: 0.15}]
  recommendation TEXT,
  prevention TEXT,
  ai_model TEXT,                   -- z.B. "gpt-4o", "claude-3-5-sonnet"
  raw_ai_response JSONB,

  -- Nutzer Feedback
  feedback TEXT CHECK (feedback IN ('richtig', 'teilweise_richtig', 'falsch')),
  feedback_note TEXT,
  feedback_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `journal_entries`

Grow-Tagebuch – chronologische Dokumentation.

```sql
CREATE TABLE public.journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grow_id UUID REFERENCES public.grows(id) ON DELETE CASCADE NOT NULL,
  plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  entry_type TEXT NOT NULL CHECK (entry_type IN (
    'bewässerung', 'düngung', 'training', 'beobachtung',
    'problem', 'ernte', 'phasenwechsel', 'sonstiges'
  )),
  title TEXT,
  description TEXT,
  metadata JSONB,                  -- z.B. {ph: 6.2, ec: 1.8, menge_liter: 2.5}
  image_ids UUID[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `harvests`

Erntedokumentation – schließt den Datenkreislauf.

```sql
CREATE TABLE public.harvests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grow_id UUID REFERENCES public.grows(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Quantitative Daten
  wet_weight_grams NUMERIC(8,2),
  dry_weight_grams NUMERIC(8,2),
  grow_duration_days INTEGER,

  -- Qualitative Daten
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  aroma_notes TEXT,
  appearance_notes TEXT,
  general_notes TEXT,

  -- Prozessdaten
  harvest_date DATE,
  drying_days INTEGER,
  curing_weeks INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `knowledge_articles`

Wissenssystem – Grundlage für SEO und KI-Kontext.

```sql
CREATE TABLE public.knowledge_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'growing', 'krankheiten', 'nährstoffe', 'sorten',
    'extrakte', 'terpene', 'cannabinoide', 'equipment'
  )),
  summary TEXT,
  content TEXT,
  tags TEXT[],
  related_slugs TEXT[],
  seo_title TEXT,
  seo_description TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Beziehungsdiagramm

```
profiles
  └── grows
        ├── plants
        │     ├── images ──→ diagnoses
        │     └── journal_entries
        ├── images ──→ diagnoses
        ├── journal_entries
        └── harvests
```

---

## Row Level Security (RLS)

Alle Tabellen erhalten RLS. Grundprinzip: Nutzer sieht nur eigene Daten.

```sql
-- Beispiel für grows
ALTER TABLE public.grows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nutzer sieht eigene Grows"
  ON public.grows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Nutzer erstellt eigene Grows"
  ON public.grows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Nutzer bearbeitet eigene Grows"
  ON public.grows FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Nutzer löscht eigene Grows"
  ON public.grows FOR DELETE
  USING (auth.uid() = user_id);
```

Gleiches Muster für: `plants`, `images`, `diagnoses`, `journal_entries`, `harvests`.

---

## Storage Buckets

```
images/
  └── {user_id}/
        └── {grow_id}/
              └── {image_id}.jpg
```

Bucket-Policy: Nutzer liest/schreibt nur in eigenem Ordner.

---

## Indizes (Performance)

```sql
-- Häufig genutzte Queries
CREATE INDEX idx_grows_user_id ON public.grows(user_id);
CREATE INDEX idx_grows_status ON public.grows(status);
CREATE INDEX idx_images_grow_id ON public.images(grow_id);
CREATE INDEX idx_diagnoses_grow_id ON public.diagnoses(grow_id);
CREATE INDEX idx_journal_grow_id ON public.journal_entries(grow_id);
CREATE INDEX idx_journal_type ON public.journal_entries(entry_type);
CREATE INDEX idx_knowledge_slug ON public.knowledge_articles(slug);
CREATE INDEX idx_knowledge_category ON public.knowledge_articles(category);
```

---

## Triggers

```sql
-- updated_at automatisch setzen
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Für jede Tabelle mit updated_at
CREATE TRIGGER update_grows_updated_at
  BEFORE UPDATE ON public.grows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## Supabase Projekt Setup – Reihenfolge

1. Supabase Projekt erstellen
2. Auth aktivieren (Email + OAuth Google/Apple)
3. Tabellen in oben genannter Reihenfolge anlegen
4. RLS für alle Tabellen aktivieren
5. Policies anlegen
6. Storage Bucket `images` erstellen
7. Storage Policies setzen
8. Indizes anlegen
9. Triggers anlegen
10. API Keys in `.env.local` eintragen

---

## Offene Fragen

- Welche OAuth-Provider werden unterstützt? (Google, Apple, Discord?)
- Sollen Grows öffentlich teilbar sein? (Public Grows)
- Wie werden Diagnosedaten für KI-Training anonymisiert gespeichert?
- Brauchen wir eine separate `strains`-Tabelle im MVP oder reicht `strain_name TEXT`?

---

## Nächste Schritte

- [ ] Supabase Projekt erstellen
- [ ] SQL-Skript ausführen
- [ ] RLS testen
- [ ] Storage Bucket konfigurieren
- [ ] Verbindung mit Next.js testen

## Verknüpfte Dokumente

[[03_Datenmodell_MVP]]
[[02_Datenbankarchitektur]]
[[07_Entitaetsmodell]]
[[05_Entwicklungsplan]]
[[06_Tech_Stack]]

## Änderungsverlauf

### V1
Erstversion – MVP Schema
