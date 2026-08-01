"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminApi } from "@/lib/adminApi";

type StudyRow = {
  id: string;
  title: string;
  description: string | null;
  source: string | null;
  tags: string[];
  quality_status: string;
  relevance_score: number | null;
  study_type: string | null;
  editorial_priority: string | null;
  matched_topics: string[] | null;
  flags: string[] | null;
  first_author: string | null;
  origin_label: string | null;
  created_at: string | null;
  fetched_at: string | null;
  doi: string | null;
};

type StudiesResponse = {
  studies: StudyRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type EditingStudy = {
  id: string;
  title: string;
  description: string;
  qualityStatus: string;
  editorialPriority: string;
  tags: string;
};

const QUALITY_OPTIONS = [
  { value: "all", label: "Alle" },
  { value: "pending", label: "Offen" },
  { value: "good", label: "Gut" },
  { value: "bad", label: "Schlecht" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "Alle" },
  { value: "high", label: "Hoch" },
  { value: "medium", label: "Mittel" },
  { value: "low", label: "Niedrig" },
];

const SORT_OPTIONS = [
  { value: "created_at", label: "Erstelldatum" },
  { value: "relevance_score", label: "Score" },
  { value: "title", label: "Titel" },
  { value: "fetched_at", label: "Fetch-Datum" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function QualityBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    good: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Gut" },
    pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Offen" },
    bad: { bg: "bg-red-100", text: "text-red-700", label: "Schlecht" },
  };
  const c = config[status] ?? config.pending!;
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
}

function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return null;
  const config: Record<string, string> = {
    high: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
    medium: "bg-blue-100 text-blue-700",
    low: "bg-border text-foreground/80",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${config[priority] ?? config.low}`}>
      {priority}
    </span>
  );
}

export default function AdminStudiesPage() {
  const auth = useAdminAuth();
  const [data, setData] = useState<StudiesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [quality, setQuality] = useState("all");
  const [priority, setPriority] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [minScore, setMinScore] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [source, setSource] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Edit modal
  const [editing, setEditing] = useState<EditingStudy | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchStudies = useCallback(async () => {
    if (auth.status !== "authenticated") return;
    setLoading(true);
    setError(null);
    try {
      const result = await adminApi<StudiesResponse>(auth.session, "studies", {
        page,
        limit: 25,
        search: search || undefined,
        quality: quality !== "all" ? quality : undefined,
        priority: priority !== "all" ? priority : undefined,
        sortBy,
        sortDir,
        minScore: minScore ? Number(minScore) : undefined,
        maxScore: maxScore ? Number(maxScore) : undefined,
        source: source || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }, [auth, page, search, quality, priority, sortBy, sortDir, minScore, maxScore, source, dateFrom, dateTo]);

  useEffect(() => {
    const t = setTimeout(() => {
      void fetchStudies();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchStudies]);

  const handleQuickAction = async (studyId: string, qualityStatus: string) => {
    if (auth.status !== "authenticated") return;
    setActionMsg(null);
    try {
      await adminApi(auth.session, "study-update", { studyId, qualityStatus });
      setActionMsg(`Studie als "${qualityStatus}" markiert.`);
      await fetchStudies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Aktion fehlgeschlagen");
    }
  };

  const handleDelete = async (studyId: string) => {
    if (auth.status !== "authenticated") return;
    try {
      await adminApi(auth.session, "study-delete", { studyId });
      setDeletingId(null);
      setActionMsg("Studie gelöscht.");
      await fetchStudies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Löschen fehlgeschlagen");
    }
  };

  const handleSaveEdit = async () => {
    if (auth.status !== "authenticated" || !editing) return;
    setSaving(true);
    try {
      await adminApi(auth.session, "study-update", {
        studyId: editing.id,
        title: editing.title,
        description: editing.description,
        qualityStatus: editing.qualityStatus,
        editorialPriority: editing.editorialPriority,
        tags: editing.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setEditing(null);
      setActionMsg("Studie aktualisiert.");
      await fetchStudies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (s: StudyRow) => {
    setEditing({
      id: s.id,
      title: s.title,
      description: s.description ?? "",
      qualityStatus: s.quality_status,
      editorialPriority: s.editorial_priority ?? "low",
      tags: (s.tags ?? []).join(", "),
    });
  };

  if (auth.status !== "authenticated") return null;

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-fg">
            <span>Admin</span><span>/</span><span className="font-semibold text-muted-fg">Studien</span>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-2xl">🔬</span>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Studien-Management</h1>
              <p className="text-sm text-muted-fg">Alle Studien filtern, sortieren, prüfen und bearbeiten.</p>
            </div>
          </div>
        </div>
        {data && (
          <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-3 py-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {data.total} Studien
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Titel suchen..."
            className="rounded-xl border border-border px-3 py-2 text-sm outline-none transition focus:border-emerald-400 dark:border-emerald-600 focus:ring-2 focus:ring-[#cfe8d6]"
          />
          <select value={quality} onChange={(e) => { setQuality(e.target.value); setPage(1); }} className="rounded-xl border border-border px-3 py-2 text-sm">
            {QUALITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={priority} onChange={(e) => { setPriority(e.target.value); setPage(1); }} className="rounded-xl border border-border px-3 py-2 text-sm">
            {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input
            type="text"
            value={source}
            onChange={(e) => { setSource(e.target.value); setPage(1); }}
            placeholder="Quelle filtern..."
            className="rounded-xl border border-border px-3 py-2 text-sm outline-none transition focus:border-emerald-400 dark:border-emerald-600 focus:ring-2 focus:ring-[#cfe8d6]"
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <input type="number" value={minScore} onChange={(e) => { setMinScore(e.target.value); setPage(1); }} placeholder="Min Score" className="rounded-xl border border-border px-3 py-2 text-sm" />
          <input type="number" value={maxScore} onChange={(e) => { setMaxScore(e.target.value); setPage(1); }} placeholder="Max Score" className="rounded-xl border border-border px-3 py-2 text-sm" />
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="rounded-xl border border-border px-3 py-2 text-sm" />
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="rounded-xl border border-border px-3 py-2 text-sm" />
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} className="rounded-xl border border-border px-3 py-2 text-sm">
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
            className="rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-fg hover:bg-background"
          >
            {sortDir === "desc" ? "↓ Absteigend" : "↑ Aufsteigend"}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
      {actionMsg && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {actionMsg}
          <button onClick={() => setActionMsg(null)} className="text-emerald-500 hover:text-emerald-700">✕</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 dark:border-emerald-500 border-t-transparent" />
          <span className="text-sm text-muted-fg">Studien werden geladen...</span>
        </div>
      )}

      {/* Study Table */}
      {!loading && data && (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-background">
                    <th className="px-4 py-3 font-semibold text-muted-fg">Titel</th>
                    <th className="px-3 py-3 font-semibold text-muted-fg">Score</th>
                    <th className="px-3 py-3 font-semibold text-muted-fg">Qualität</th>
                    <th className="px-3 py-3 font-semibold text-muted-fg">Priorität</th>
                    <th className="px-3 py-3 font-semibold text-muted-fg">Typ</th>
                    <th className="px-3 py-3 font-semibold text-muted-fg">Quelle</th>
                    <th className="px-3 py-3 font-semibold text-muted-fg">Datum</th>
                    <th className="px-3 py-3 font-semibold text-muted-fg">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {data.studies.map((study) => (
                    <tr key={study.id} className="border-b border-border transition hover:bg-background">
                      <td className="max-w-xs px-4 py-3">
                        <p className="truncate font-medium text-foreground" title={study.title}>{study.title}</p>
                        {study.first_author && <p className="truncate text-xs text-muted-fg">{study.first_author}</p>}
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-mono font-semibold text-foreground">{study.relevance_score ?? "—"}</span>
                      </td>
                      <td className="px-3 py-3"><QualityBadge status={study.quality_status} /></td>
                      <td className="px-3 py-3"><PriorityBadge priority={study.editorial_priority} /></td>
                      <td className="px-3 py-3 text-xs text-muted-fg">{study.study_type ?? "—"}</td>
                      <td className="max-w-[120px] truncate px-3 py-3 text-xs text-muted-fg" title={study.origin_label ?? ""}>{study.origin_label ?? "—"}</td>
                      <td className="px-3 py-3 text-xs text-muted-fg">{formatDate(study.created_at)}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => void handleQuickAction(study.id, "good")} className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100" title="Genehmigen">✓</button>
                          <button onClick={() => void handleQuickAction(study.id, "bad")} className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100" title="Ablehnen">✗</button>
                          <button onClick={() => openEdit(study)} className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100" title="Bearbeiten">✎</button>
                          <button onClick={() => setDeletingId(study.id)} className="rounded-lg bg-background px-2 py-1 text-xs font-medium text-foreground/80 hover:bg-border" title="Löschen">⌫</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.studies.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-fg">
                        Keine Studien für die aktuellen Filter gefunden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-fg">
                Seite {data.page} von {data.totalPages} · {data.total} Studien
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-fg transition hover:bg-background disabled:opacity-40"
                >
                  Zurück
                </button>
                <button
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-fg transition hover:bg-background disabled:opacity-40"
                >
                  Weiter
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">Studie bearbeiten</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-fg">Titel</label>
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full rounded-xl border border-border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-fg">Beschreibung</label>
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full rounded-xl border border-border px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-fg">Qualitätsstatus</label>
                  <select value={editing.qualityStatus} onChange={(e) => setEditing({ ...editing, qualityStatus: e.target.value })} className="w-full rounded-xl border border-border px-3 py-2 text-sm">
                    <option value="pending">Offen</option>
                    <option value="good">Gut</option>
                    <option value="bad">Schlecht</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-fg">Priorität</label>
                  <select value={editing.editorialPriority} onChange={(e) => setEditing({ ...editing, editorialPriority: e.target.value })} className="w-full rounded-xl border border-border px-3 py-2 text-sm">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-fg">Tags (kommagetrennt)</label>
                <input value={editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} className="w-full rounded-xl border border-border px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-fg hover:bg-background">
                Abbrechen
              </button>
              <button onClick={() => void handleSaveEdit()} disabled={saving} className="rounded-xl bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                {saving ? "Speichert..." : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">Studie löschen?</h2>
            <p className="mt-2 text-sm text-muted-fg">Diese Aktion kann nicht rückgängig gemacht werden.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setDeletingId(null)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-fg hover:bg-background">
                Abbrechen
              </button>
              <button onClick={() => void handleDelete(deletingId)} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
