"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminFetch } from "@/lib/admin/client";
import type { AdminAssistantResponse, AssistantMessage } from "@/lib/admin/contracts";
import { AdminPage } from "@/components/admin/AdminPage";
import { Alert } from "@/components/admin/Alert";
import { CTAButton } from "@/components/ui/CTAButton";
import { Bot } from "lucide-react";

export default function AdminAssistantPage() {
  const auth = useAdminAuth();
  const [prompt, setPrompt] = useState("");
  const [history, setHistory] = useState<AssistantMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (auth.status !== "authenticated") return;
    try {
      const res = await adminFetch<AdminAssistantResponse>(auth.session, "assistant");
      setHistory(res.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verlauf konnte nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  if (auth.status !== "authenticated") return null;

  const handleSend = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    setPrompt("");
    try {
      const { message } = await adminFetch<{ message: AssistantMessage }>(auth.session, "assistant", {
        json: { prompt: trimmed },
      });
      setHistory((prev) => [...prev, message]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Anfrage fehlgeschlagen");
      setPrompt(trimmed);
    } finally {
      setSending(false);
    }
  };

  const clearHistory = async () => {
    try {
      await adminFetch(auth.session, "assistant", { method: "DELETE" });
      setHistory([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verlauf konnte nicht gelöscht werden");
    }
  };

  return (
    <AdminPage
      title="Assistent"
      icon={Bot}
      description="Notizen erfassen, Content-Entwürfe generieren oder Ideen festhalten — serverseitig gespeichert, auf allen Geräten (Handy, iPad, Rechner) sichtbar. Nur für Admins, keine Kosten für normale Nutzer."
      actions={
        history.length > 0 ? (
          <button
            type="button"
            onClick={() => void clearHistory()}
            className="text-xs text-muted-fg transition hover:text-rose-500 dark:hover:text-rose-400"
          >
            Verlauf löschen
          </button>
        ) : undefined
      }
    >
      {error && (
        <Alert tone="error" onDismiss={() => setError(null)}>
          {error}
          {error.includes("ANTHROPIC_API_KEY") && (
            <p className="mt-1 text-xs opacity-80">
              Diese Funktion braucht einen Anthropic-API-Key als Umgebungsvariable (Vercel-Projekteinstellungen oder .env.local).
            </p>
          )}
        </Alert>
      )}

      <div className="space-y-4">
        {history.map((entry) => (
          <div key={entry.id} className="tool-pop space-y-2">
            <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-primary/10 px-4 py-2.5 text-sm text-foreground">
              {entry.prompt}
            </div>
            <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 text-sm text-foreground shadow-sm">
              {entry.reply}
            </div>
          </div>
        ))}
        {!loading && history.length === 0 && !sending && (
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
    </AdminPage>
  );
}
