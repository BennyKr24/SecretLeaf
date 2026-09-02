"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminFetch } from "@/lib/admin/client";
import type { AdminUpdate, AdminUpdatesResponse } from "@/lib/admin/contracts";
import { AdminPage, AdminPageSkeleton } from "@/components/admin/AdminPage";
import { Alert } from "@/components/admin/Alert";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CTAButton } from "@/components/ui/CTAButton";
import { Megaphone, Star, Pencil, Trash2 } from "lucide-react";

const field =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none";

/** ISO string -> value for <input type="datetime-local"> in the browser's local time. */
const toLocalInput = (iso: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** <input type="datetime-local"> value (interpreted as local time) -> ISO string, or null. */
const toIso = (local: string): string | null => (local ? new Date(local).toISOString() : null);

const emptyForm = {
  slug: "",
  title: "",
  summary: "",
  category: "",
  date: new Date().toISOString().slice(0, 10),
  version: "",
  featured: false,
  published: true,
  banner: false,
  bannerStartsAt: "",
  bannerEndsAt: "",
};
type FormState = typeof emptyForm;

function Editor({
  categories,
  editing,
  onDone,
  onCancel,
}: {
  categories: string[];
  editing: AdminUpdate | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const auth = useAdminAuth();
  const [form, setForm] = useState<FormState>(
    editing
      ? {
          slug: editing.slug,
          title: editing.title,
          summary: editing.summary,
          category: editing.category,
          date: editing.date,
          version: editing.version ?? "",
          featured: editing.featured,
          published: editing.published,
          banner: editing.banner,
          bannerStartsAt: toLocalInput(editing.bannerStartsAt),
          bannerEndsAt: toLocalInput(editing.bannerEndsAt),
        }
      : { ...emptyForm, category: categories[0] ?? "" },
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (auth.status !== "authenticated") return;
    setBusy(true);
    setErr(null);
    try {
      const body = {
        title: form.title,
        summary: form.summary,
        category: form.category,
        date: form.date,
        version: form.version || undefined,
        featured: form.featured,
        published: form.published,
        banner: form.banner,
        bannerStartsAt: toIso(form.bannerStartsAt),
        bannerEndsAt: toIso(form.bannerEndsAt),
      };
      if (editing) {
        await adminFetch(auth.session, `content/updates/${editing.id}`, { method: "PATCH", json: body });
      } else {
        await adminFetch(auth.session, "content/updates", { json: { ...body, slug: form.slug } });
      }
      onDone();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Speichern fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card padding="sm" className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        {editing ? `Bearbeiten: ${editing.slug}` : "Neue Neuigkeit"}
      </h3>
      {editing?.hasSections && (
        <Alert tone="info">Diese Neuigkeit hat Detailinhalt (aus JSON). Der Editor ändert nur die Kernfelder.</Alert>
      )}
      {err && <Alert tone="error" onDismiss={() => setErr(null)}>{err}</Alert>}
      <form onSubmit={submit} className="grid gap-2 sm:grid-cols-2">
        {!editing && (
          <label className="flex flex-col gap-1 text-xs text-muted-fg sm:col-span-2">
            Slug (URL)
            <input value={form.slug} onChange={(e) => set("slug", e.target.value)} className={field} required placeholder="neue-funktion-xy" />
          </label>
        )}
        <label className="flex flex-col gap-1 text-xs text-muted-fg sm:col-span-2">
          Titel
          <input value={form.title} onChange={(e) => set("title", e.target.value)} className={field} required />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-fg sm:col-span-2">
          Zusammenfassung
          <textarea value={form.summary} onChange={(e) => set("summary", e.target.value)} className={`${field} min-h-[72px]`} required />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-fg">
          Kategorie
          <select value={form.category} onChange={(e) => set("category", e.target.value)} className={field} required>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-fg">
          Datum
          <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={field} required />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-fg">
          Version (optional)
          <input value={form.version} onChange={(e) => set("version", e.target.value)} className={field} placeholder="v1.5.0" />
        </label>
        <div className="flex items-end gap-4">
          <label className="flex items-center gap-2 text-xs text-muted-fg">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
            Hervorgehoben
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-fg">
            <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} />
            Veröffentlicht
          </label>
        </div>
        <div className="space-y-2 rounded-lg border border-border bg-background/50 p-3 sm:col-span-2">
          <label className="flex items-center gap-2 text-xs font-medium text-foreground">
            <input type="checkbox" checked={form.banner} onChange={(e) => set("banner", e.target.checked)} />
            Auch als Site-Banner zeigen (Titel + Zusammenfassung, oben auf jeder Seite)
          </label>
          {form.banner && (
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs text-muted-fg">
                Sichtbar ab (optional)
                <input
                  type="datetime-local"
                  value={form.bannerStartsAt}
                  onChange={(e) => set("bannerStartsAt", e.target.value)}
                  className={field}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-muted-fg">
                Sichtbar bis (optional)
                <input
                  type="datetime-local"
                  value={form.bannerEndsAt}
                  onChange={(e) => set("bannerEndsAt", e.target.value)}
                  className={field}
                />
              </label>
            </div>
          )}
        </div>
        <div className="flex gap-2 sm:col-span-2">
          <CTAButton variant="primary" size="sm" type="submit" disabled={busy}>
            {editing ? "Speichern" : "Anlegen"}
          </CTAButton>
          <CTAButton variant="secondary" size="sm" type="button" onClick={onCancel}>
            Abbrechen
          </CTAButton>
        </div>
      </form>
    </Card>
  );
}

export default function AdminChangelogPage() {
  const auth = useAdminAuth();
  const [data, setData] = useState<AdminUpdatesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminUpdate | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    if (auth.status !== "authenticated") return;
    try {
      setData(await adminFetch<AdminUpdatesResponse>(auth.session, "content/updates"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  const remove = async (u: AdminUpdate) => {
    if (auth.status !== "authenticated") return;
    try {
      await adminFetch(auth.session, `content/updates/${u.id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Löschen fehlgeschlagen");
    }
  };

  const togglePublished = async (u: AdminUpdate) => {
    if (auth.status !== "authenticated") return;
    try {
      await adminFetch(auth.session, `content/updates/${u.id}`, {
        method: "PATCH",
        json: { published: !u.published },
      });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Änderung fehlgeschlagen");
    }
  };

  if (auth.status !== "authenticated") return null;

  return (
    <AdminPage
      title="Neuigkeiten"
      icon={Megaphone}
      description="Speist /updates und den Neuigkeiten-Block auf /status"
      actions={
        !creating && !editing ? (
          <CTAButton variant="primary" size="sm" type="button" onClick={() => setCreating(true)}>
            Neu
          </CTAButton>
        ) : undefined
      }
    >
      {loading && <AdminPageSkeleton rows={4} />}
      {error && (
        <Alert tone="error" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {(creating || editing) && data && (
        <div className="mb-4">
          <Editor
            categories={data.categories}
            editing={editing}
            onDone={() => {
              setCreating(false);
              setEditing(null);
              void load();
            }}
            onCancel={() => {
              setCreating(false);
              setEditing(null);
            }}
          />
        </div>
      )}

      {data && (
        <div className="space-y-2">
          {data.updates.map((u) => (
            <Card key={u.id} padding="sm" className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {u.featured && <Star className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" strokeWidth={2} fill="currentColor" />}
                  <span className="font-semibold text-foreground">{u.title}</span>
                  <Badge tone="muted">{u.category}</Badge>
                  {!u.published && <Badge tone="amber">Entwurf</Badge>}
                  {u.hasSections && <Badge tone="muted">Detailinhalt</Badge>}
                  {u.banner && <Badge tone="primary">Banner</Badge>}
                </div>
                <p className="text-xs text-muted-fg">
                  {u.date} · <code>{u.slug}</code>
                  {u.version && ` · ${u.version}`}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1">
                <button
                  onClick={() => void togglePublished(u)}
                  className="rounded-lg border border-border px-2 py-1 text-xs font-medium text-muted-fg hover:text-foreground"
                >
                  {u.published ? "Zurückziehen" : "Veröffentlichen"}
                </button>
                <button
                  onClick={() => { setEditing(u); setCreating(false); }}
                  className="rounded-lg p-1.5 text-muted-fg hover:text-foreground"
                  title="Bearbeiten"
                >
                  <Pencil className="h-4 w-4" strokeWidth={2} />
                </button>
                <button
                  onClick={() => void remove(u)}
                  className="rounded-lg p-1.5 text-muted-fg hover:text-rose-500"
                  title="Löschen"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </Card>
          ))}
          {data.updates.length === 0 && (
            <p className="rounded-xl border border-border bg-card px-4 py-6 text-center text-sm text-muted-fg">
              Noch keine Neuigkeiten.
            </p>
          )}
        </div>
      )}
    </AdminPage>
  );
}
