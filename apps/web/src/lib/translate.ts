/**
 * Dynamic translation helper for runtime content (diagnosis results, tool outputs, user logs).
 * Uses a memory + localStorage cache. Always falls back to the original German text.
 */

type Lang = "de" | "en";

const memoryCache = new Map<string, string>();

function cacheKey(text: string, lang: Lang) {
  return `${lang}:${text.slice(0, 80)}`;
}

function getFromStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(`translate_cache_${key}`);
  } catch {
    return null;
  }
}

function saveToStorage(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`translate_cache_${key}`, value);
  } catch {
    // storage quota exceeded — ignore
  }
}

/**
 * Translate dynamic text to the target language.
 * Only call for user-facing runtime content (diagnosis results, tool outputs).
 * Always falls back to the original German text on error.
 */
export async function translate(text: string, targetLang: Lang): Promise<string> {
  // No translation needed if already in target language or target is German
  if (!text || targetLang === "de") return text;

  const key = cacheKey(text, targetLang);

  // Check memory cache first
  const cached = memoryCache.get(key) ?? getFromStorage(key);
  if (cached) {
    memoryCache.set(key, cached);
    return cached;
  }

  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLang }),
    });

    if (!res.ok) throw new Error("Translation request failed");

    const data = (await res.json()) as { translated: string };
    const translated = data.translated ?? text;

    memoryCache.set(key, translated);
    saveToStorage(key, translated);

    return translated;
  } catch {
    // Always fall back to German (original text)
    return text;
  }
}
