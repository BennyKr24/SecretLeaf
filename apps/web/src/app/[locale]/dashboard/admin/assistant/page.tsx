"use client";

import { useState } from "react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminApi } from "@/lib/adminApi";
import { CTAButton } from "@/components/ui/CTAButton";

type HistoryEntry = {
  prompt: string;
  reply: string;
};

// Chat history previously lived only in React state and vanished on reload
// or navigation — despite the page's own copy promising "auch von unterwegs
// Notizen erfassen". localStorage makes that promise actually true. Same
// read/write-at-mutation-point pattern as hooks/useReadingHistory.ts.
const HISTORY_STORAGE_KEY = "sl-admin-assistant-history";

function readHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: HistoryEntry[]): void {
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // storage full or unavailable — not fatal, just won't persist
  }
}

export default function AdminAssistantPage() {
  const auth = useAdminAuth();
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>(() => readHistory());
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (auth.status !== "authenticated") return null;

  const handleSend = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    setPrompt("");
    try {
      const result = await adminApi<{ reply: string }>(auth.session, "ai-assist", { prompt: trimmed });
      setHistory((prev) => {
        const next = [...prev, { prompt: trimmed, reply: result.reply }];
        writeHistory(next);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Anfrage fehlgeschlagen");
      setPrompt(trimmed);
    } finally {
      setSending(false);
    }
  };

  const clearHistory = () => {
    writeHistory([]);
    setHistory([]);
  };

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-fg">
            <span>Admin</span><span>/</span><span className="font-semibold text-muted-fg">KI-Assistent</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-foreground">KI-Assistent</h1>
          <p className="mt-1 text-sm text-muted-fg">
            Notizen erfassen, Content-Entwürfe generieren oder Ideen festhalten — auch von unterwegs (Handy/iPad),
            einfach diese Seite im Browser öffnen. Bleibt zwischen Besuchen erhalten. Nur für Admins sichtbar,
            keine Kosten für normale Nutzer.
          </p>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="flex-shrink-0 text-xs text-muted-fg transition hover:text-rose-500 dark:hover:text-rose-400"
          >
            Verlauf löschen
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
          {error}
          {error.includes("ANTHROPIC_API_KEY") && (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400/80">
              Diese Funktion braucht einen Anthropic-API-Key als Umgebungsvariable (Vercel-Projekteinstellungen oder .env.local).
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {history.map((entry, i) => (
          <div key={i} className="tool-pop space-y-2">
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary/10 px-4 py-2.5 text-sm text-foreground">
              {entry.prompt}
            </div>
            <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm">
              {entry.reply}
            </div>
          </div>
        ))}
        {history.length === 0 && !sending && (
          <div className="rounded-2xl border border-dashed border-border bg-background/60 px-6 py-10 text-center text-sm text-muted-fg">
            Noch keine Anfragen. Schreib z. B. &bdquo;Entwirf einen Wissensartikel über Lollipopping&ldquo;
            oder &bdquo;Notiere: Icon-Farben im Tools-Tab wirken inkonsistent&ldquo;.
          </div>
        )}
        {sending && (
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 text-sm text-muted-fg shadow-sm">
            Claude denkt nach …
          </div>
        )}
      </div>

      <div className="sticky bottom-4 mt-6 flex gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSend();
            }
          }}
          placeholder="Notiz, Idee oder Content-Anfrage eingeben …"
          rows={2}
          className="flex-1 resize-none rounded-xl border-0 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-fg focus:outline-none"
        />
        <CTAButton
          variant="primary"
          onClick={() => void handleSend()}
          disabled={sending || !prompt.trim()}
          className="flex-shrink-0 self-end"
        >
          Senden
        </CTAButton>
      </div>
    </div>
  );
}
