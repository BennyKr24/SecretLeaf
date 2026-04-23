import { NextRequest, NextResponse } from "next/server";

interface TranslateRequestBody {
  text: string;
  targetLang: string;
}

interface MyMemoryResponse {
  responseData: {
    translatedText: string;
    match: number;
  };
  responseStatus: number;
}

/**
 * POST /api/translate
 * Body: { text: string, targetLang: "en" }
 * Uses MyMemory free translation API (no key needed, 5k chars/day/IP).
 * Falls back to original text on failure.
 */
export async function POST(request: NextRequest) {
  let body: TranslateRequestBody;

  try {
    body = (await request.json()) as TranslateRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { text, targetLang } = body;

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  if (!targetLang || typeof targetLang !== "string") {
    return NextResponse.json({ error: "targetLang is required" }, { status: 400 });
  }

  // Sanitize input — limit to 500 chars to stay within free tier
  const truncated = text.slice(0, 500);
  const sourceLang = "de";
  const langPair = `${sourceLang}|${targetLang}`;

  try {
    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q", truncated);
    url.searchParams.set("langpair", langPair);

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "SecretLeaf/1.0" },
      // 5-second timeout
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      throw new Error(`MyMemory responded with ${res.status}`);
    }

    const data = (await res.json()) as MyMemoryResponse;
    const translated = data.responseData?.translatedText ?? text;

    return NextResponse.json({ translated });
  } catch {
    // Always fall back to original text — never error in the client
    return NextResponse.json({ translated: text });
  }
}
