# KI Integration

---

tags: #technik #ki #diagnose #mvp
status: Entwurf
priorität: Tier S
verknüpft: [[03_KI_Architektur]] [[03_Diagnose_Spec]] [[06_AI_Assistant_Spec]] [[05_Tech_Stack]] [[05_Supabase_Datenmodell]]

---

## Zweck

Dieses Dokument beschreibt die konkrete technische Umsetzung der KI-Systeme im SecretLeaf MVP.
Es überbrückt die konzeptionelle KI-Architektur mit der tatsächlichen Implementierung.

---

## MVP KI-Systeme (Priorität)

| System | Priorität | API | Phase |
|---|---|---|---|
| Bilddiagnose | Tier S | OpenAI GPT-4o Vision | MVP |
| Wissensfragen | Tier A | Anthropic Claude | MVP |
| Empfehlungen | Tier A | Anthropic Claude | MVP |
| Prognosen | Tier B | Anthropic Claude | Post-MVP |
| Benchmark Engine | Tier B | Eigene Logik | Post-MVP |

---

## System 1: Bilddiagnose (GPT-4o Vision)

### Architektur

```
Nutzer lädt Bild hoch
↓
Bild → Supabase Storage
↓
API Route: /api/diagnose
↓
Bild-URL + Kontext → OpenAI GPT-4o Vision
↓
JSON Response parsen
↓
Diagnose in DB speichern
↓
Diagnose anzeigen
```

### Prompt-Template

```
System Prompt:
Du bist ein erfahrener Cannabis-Experte mit tiefem Fachwissen über
Nährstoffmängel, Pflanzenkrankheiten, Schädlinge und Umweltprobleme.

Analysiere das Bild einer Cannabis-Pflanze.

Zusatzkontext (wenn verfügbar):
- Grow-Medium: {medium}
- Grow-Phase: {phase}
- Alter: {age_days} Tage
- Indoor/Outdoor: {environment}
- Letzte Düngung: {last_fertilized}

Antworte ausschließlich im folgenden JSON-Format:
{
  "primary_cause": "Name des Problems",
  "primary_confidence": 0.87,
  "primary_description": "Kurze Erklärung",
  "alternative_causes": [
    {"cause": "...", "confidence": 0.12, "description": "..."}
  ],
  "recommendation": "Konkrete Handlungsanweisung",
  "prevention": "Wie vermeiden in Zukunft",
  "severity": "niedrig|mittel|hoch",
  "urgency": "heute|diese_woche|beobachten"
}
```

### Fehlerbehandlung

- Kein Bild erkennbar → Nutzer auffordern, besseres Bild hochzuladen
- Kein Problem erkennbar → "Pflanze sieht gesund aus" zurückgeben
- API-Fehler → Fallback auf regelbasierte Diagnose (Phase 1 des KI-Systems)
- Rate Limit → Queue-System, Nutzer informieren

### Kosten-Optimierung

```typescript
// Bild vor API-Call komprimieren
const compressedImage = await compressImage(imageFile, {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.85
});

// Modell-Auswahl basierend auf Nutzertyp
const model = user.premium 
  ? "gpt-4o"           // Höhere Genauigkeit
  : "gpt-4o-mini";     // Kosteneffizient für Free-Nutzer
```

---

## System 2: Wissensfragen + Empfehlungen (Claude)

### Architektur

```
Nutzer stellt Frage
↓
API Route: /api/ai/chat
↓
Frage + Grow-Kontext + relevante Knowledge-Articles
↓
Anthropic Claude API
↓
Antwort streamen (SSE)
↓
Antwort anzeigen
```

### Context-Aufbau (RAG-Lite für MVP)

```typescript
// Für MVP: einfaches Keyword-Matching auf Knowledge Articles
const relevantArticles = await supabase
  .from('knowledge_articles')
  .select('title, summary, content')
  .textSearch('content', query)
  .limit(3);

const prompt = `
Nutzer-Kontext:
- Aktiver Grow: ${grow.strain_name}, Phase: ${grow.status}
- Medium: ${grow.medium}
- Letzte Diagnose: ${lastDiagnosis?.primary_cause || 'keine'}

Relevantes Wissen:
${relevantArticles.map(a => `${a.title}: ${a.summary}`).join('\n')}

Nutzerfrage: ${question}

Antworte präzise, hilfreich und auf Deutsch.
Fokus auf praktische Handlungsempfehlungen.
`;
```

### Streaming Response

```typescript
// API Route mit Streaming
export async function POST(req: Request) {
  const stream = anthropic.messages.stream({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }]
  });
  
  return new StreamingTextResponse(stream.toReadableStream());
}
```

---

## Nutzerfeedback-Schleife

Das Feedback der Nutzer ist die wichtigste Datenquelle zur Verbesserung der Diagnosen.

```typescript
// Diagnose-Feedback speichern
await supabase
  .from('diagnoses')
  .update({
    feedback: 'richtig' | 'teilweise_richtig' | 'falsch',
    feedback_note: note,
    feedback_at: new Date()
  })
  .eq('id', diagnosisId);
```

### Feedback-Auswertung (Dashboard für Founder)

- Genauigkeitsrate pro Diagnose-Typ
- Häufigste falsche Diagnosen
- Häufigste Korrekturen
- Konfidenz-Kalibrierung

---

## Regelbasiertes Fallback-System (Phase 1)

Für den MVP kann die KI mit einem einfachen regelbasierten System ergänzt werden,
das auch ohne Bild funktioniert.

### Symptom-Mapping (Basis)

```typescript
const symptomRules = {
  'gelbe_blätter_unten': {
    primary: 'Stickstoffmangel',
    confidence: 0.65,
    recommendation: 'N-Düngung erhöhen, pH auf 6.0-6.5 überprüfen'
  },
  'braune_blattränder': {
    primary: 'Kaliummangel oder Windburn',
    confidence: 0.55,
    recommendation: 'K-Düngung überprüfen, Luftzirkulation anpassen'
  },
  'gelbe_flecken_blätter': {
    primary: 'Calcium-Mangel (CalMag)',
    confidence: 0.70,
    recommendation: 'CalMag-Lösung zugeben, pH prüfen'
  }
  // ... weitere Symptom-Regeln
};
```

---

## Rate Limiting & Sicherheit

```typescript
// API Route Schutz
const rateLimit = new RateLimit({
  free_tier: {
    diagnoses_per_day: 5,
    questions_per_day: 10
  },
  premium: {
    diagnoses_per_day: 50,
    questions_per_day: 100
  }
});
```

---

## Datenerfassung für zukünftiges Training

Jede Diagnose wird vollständig gespeichert (raw_ai_response JSONB) für späteres Fine-Tuning.

Wichtig: Nutzerfeedback + tatsächliche Ergebnisse werden gesammelt.
Diese Daten sind die Grundlage für proprietäre Modelle in Phase 4.

---

## Kosten-Monitoring

```typescript
// Token-Verbrauch tracken
await supabase.from('ai_usage_log').insert({
  user_id: userId,
  model: modelName,
  input_tokens: usage.input_tokens,
  output_tokens: usage.output_tokens,
  cost_usd: calculateCost(modelName, usage),
  type: 'diagnosis' | 'question'
});
```

---

## Entwicklungsstufen

### Phase 1 (MVP)
- GPT-4o Vision für Bilddiagnosen
- Claude für Fragen und Empfehlungen
- Regelbasiertes Fallback
- Feedback-Sammlung

### Phase 2 (Post-MVP)
- RAG auf Knowledge Graph
- Diagnosedaten-Analyse
- Genauigkeitsoptimierung
- Automatische Reminder-Empfehlungen

### Phase 3
- Benchmark Engine
- Prognose Engine
- Grow-übergreifende Mustererkennung

### Phase 4
- Fine-Tuning auf proprietären Grow-Daten
- Proprietäres Diagnosemodell
- Similarity Engine (ähnliche Grows)

---

## Offene Fragen

- Soll die Diagnose synchron oder asynchron (Background Job) ablaufen?
- Wie gehen wir mit nicht-Cannabis-Bildern um (Moderation)?
- Soll die KI auf Deutsch oder Englisch trainiert/prompted werden?
- Wie oft soll die Prompt-Qualität reviewed werden?

## Verknüpfte Dokumente

[[03_KI_Architektur]]
[[03_Diagnose_Spec]]
[[06_AI_Assistant_Spec]]
[[05_Tech_Stack]]
[[05_Supabase_Datenmodell]]
[[04_Diagnosedaten]]

## Änderungsverlauf

### V1
Erstversion – MVP KI Integration
