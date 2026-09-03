"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown";
import { ResponsiveTable } from "@/components/ui/ResponsiveTable";
import { AdminPage, AdminPageSkeleton } from "@/components/admin/AdminPage";
import { Alert } from "@/components/admin/Alert";
import { Badge } from "@/components/ui/Badge";
import { CTAButton } from "@/components/ui/CTAButton";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminFetch } from "@/lib/admin/client";
import type { AdminStudiesResponse, StudyRow } from "@/lib/admin/contracts";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  Microscope, CheckCircle2, XCircle, Pencil, Trash2, ArrowDown, ArrowUp,
} from "lucide-react";

type EditingStudy = {
  id: string;
  title: string;
  description: string;
  qualityStatus: string;
  editorialPriority: string;
  tags: string;
  reviewNote: string;
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

const STUDY_TYPE_OPTIONS = [
  { value: "all", label: "Alle Typen" },
  { value: "meta-analysis", label: "Meta-Analyse" },
  { value: "systematic-review", label: "Systematischer Review" },
  { value: "controlled-study", label: "Kontrollierte Studie" },
  { value: "clinical-trial", label: "Klinische Studie" },
  { value: "laboratory-study", label: "Laborstudie" },
  { value: "observational-study", label: "Beobachtungsstudie" },
  { value: "protocol", label: "Protokoll" },
  { value: "case-report", label: "Fallbericht" },
  { value: "general-study", label: "Allgemein" },
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

function initialQuality(): string {
  if (typeof window === "undefined") return "all";
  const p = new URLSearchParams(window.location.search).get("quality");
  return ["pending", "good", "bad"].includes(p ?? "") ? (p as string) : "all";
}

function QualityBadge({ status }: { status: string }) {
  const map: Record<string, { tone: "primary" | "amber" | "rose"; label: string }> = {
    good: { tone: "primary", label: "Gut" },
    pending: { tone: "amber", label: "Offen" },
    bad: { tone: "rose", label: "Schlecht" },
  };
  const c = map[status] ?? map.pending!;
  return <Badge tone={c.tone}>{c.label}</Badge>;
}

function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return null;
  const tone = priority === "high" ? "primary" : priority === "medium" ? "amber" : "muted";
  return <Badge tone={tone}>{priority}</Badge>;
}

export default function AdminStudiesPage() {
  const auth = useAdminAuth();
  const [data, setData] = useState<AdminStudiesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [quality, setQuality] = useState(initialQuality);
  const [priority, setPriority] = useState("all");
  const [studyType, setStudyType] = useState("all");
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

  const query = useMemo(() => {
    const p = new URLSearchParams({ page: String(page), limit: "25", sortBy, sortDir });
    if (debouncedSearch) p.set("search", debouncedSearch);
    if (quality !== "all") p.set("quality", quality);
    if (priority !== "all") p.set("priority", priority);
    if (studyType !== "all") p.set("studyType", studyType);
    if (minScore) p.set("minScore", minScore);
    if (maxScore) p.set("maxScore", maxScore);
    if (source) p.set("source", source);
    if (dateFrom) p.set("dateFrom", dateFrom);
    if (dateTo) p.set("dateTo", dateTo);
    return p.toString();
  }, [page, sortBy, sortDir, debouncedSearch, quality, priority, studyType, minScore, maxScore, source, dateFrom, dateTo]);

  const fetchStudies = useCallback(async () => {
    if (auth.status !== "authenticated") return;
    setLoading(true);
    setError(null);
    try {
      setData(await adminFetch<AdminStudiesResponse>(auth.session, `content/studies?${query}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }, [auth, query]);

  useEffect(() => {
    void (async () => {
      await fetchStudies();
    })();
  }, [fetchStudies]);

  // Every filter change goes back to page 1. Wrap the raw setter instead of
  // an effect on all the filter values (which would be a setState-in-effect).
  const onFilter = useCallback(
    <T,>(setter: (v: T) => void) =>
      (v: T) => {
        setter(v);
        setPage(1);
      },
    [],
  );

  const patchStudy = async (id: string, json: Record<string, unknown>, okMsg: string) => {
    if (auth.status !== "authenticated") return;
    setError(null);
    await adminFetch(auth.session, `content/studies/${id}`, { method: "PATCH", json });
    setActionMsg(okMsg);
    await fetchStudies();
  };

  const handleQuickAction = async (studyId: string, qualityStatus: string) => {
    try {
      await patchStudy(studyId, { qualityStatus }, `Studie als „${qualityStatus}" markiert.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Aktion fehlgeschlagen");
    }
  };

  const handleDelete = async (studyId: string) => {
    if (auth.status !== "authenticated") return;
    try {
      await adminFetch(auth.session, `content/studies/${studyId}`, { method: "DELETE" });
      setDeletingId(null);
      setActionMsg("Studie gelöscht.");
      await fetchStudies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Löschen fehlgeschlagen");
    }
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await patchStudy(
        editing.id,
        {
          title: editing.title,
          description: editing.description,
          qualityStatus: editing.qualityStatus,
          editorialPriority: editing.editorialPriority,
          tags: editing.tags.split(",").map((t) => t.trim()).filter(Boolean),
          ...(editing.reviewNote.trim() ? { reviewNote: editing.reviewNote.trim() } : {}),
        },
        "Studie aktualisiert.",
      );
      setEditing(null);
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
      reviewNote: "",
    });
  };

  if (auth.status !== "authenticated") return null;

  return (
    <AdminPage
      title="Studien"
      icon={Microscope}
      description="Alle Studien filtern, sortieren, prüfen und bearbeiten."
      actions={data ? <Badge tone="primary">{data.total} Studien</Badge> : undefined}
    >
      {/* Filters */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            value={search}
            onChange={(e) => onFilter(setSearch)(e.target.value)}
            placeholder="Titel suchen..."
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--ring)]"
          />
          <Dropdown value={quality} onChange={onFilter(setQuality)}>
            {QUALITY_OPTIONS.map((o) => <DropdownOption key={o.value} value={o.value}>{o.label}</DropdownOption>)}
          </Dropdown>
          <Dropdown value={priority} onChange={onFilter(setPriority)}>
            {PRIORITY_OPTIONS.map((o) => <DropdownOption key={o.value} value={o.value}>{o.label}</DropdownOption>)}
          </Dropdown>
          <Dropdown value={studyType} onChange={onFilter(setStudyType)}>
            {STUDY_TYPE_OPTIONS.map((o) => <DropdownOption key={o.value} value={o.value}>{o.label}</DropdownOption>)}
          </Dropdown>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <input
            type="text"
            value={source}
            onChange={(e) => onFilter(setSource)(e.target.value)}
            placeholder="Quelle filtern..."
            className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-[var(--ring)]"
          />
          <input type="number" value={minScore} onChange={(e) => onFilter(setMinScore)(e.target.value)} placeholder="Min Score" className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground" />
          <input type="number" value={maxScore} onChange={(e) => onFilter(setMaxScore)(e.target.value)} placeholder="Max Score" className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground" />
          <input type="date" value={dateFrom} onChange={(e) => onFilter(setDateFrom)(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground" />
          <input type="date" value={dateTo} onChange={(e) => onFilter(setDateTo)(e.target.value)} className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground" />
          <div className="flex gap-2">
            <Dropdown value={sortBy} onChange={onFilter(setSortBy)} className="flex-1">
              {SORT_OPTIONS.map((o) => <DropdownOption key={o.value} value={o.value}>{o.label}</DropdownOption>)}
            </Dropdown>
            <button
              type="button"
              onClick={() => { setSortDir((d) => (d === "desc" ? "asc" : "desc")); setPage(1); }}
              aria-label={sortDir === "desc" ? "Absteigend sortiert" : "Aufsteigend sortiert"}
              className="flex items-center justify-center rounded-xl border border-border px-2.5 text-muted-fg transition-transform duration-150 active:scale-[0.97] hover:bg-background"
            >
              {sortDir === "desc" ? <ArrowDown className="h-4 w-4" strokeWidth={2} /> : <ArrowUp className="h-4 w-4" strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <Alert tone="error" onDismiss={() => setError(null)}>{error}</Alert>
      )}
      {actionMsg && (
        <Alert tone="success" onDismiss={() => setActionMsg(null)}>{actionMsg}</Alert>
      )}

      {loading && <AdminPageSkeleton rows={6} />}

      {!loading && data && (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {data.studies.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-muted-fg">Keine Studien für die aktuellen Filter gefunden.</div>
            ) : (
              <ResponsiveTable
                rows={data.studies}
                rowKey={(study) => study.id}
                cellPadding="px-3 py-3"
                columns={[
                  {
                    header: "Titel",
                    isTitle: true,
                    tdClassName: "max-w-xs font-medium text-foreground",
                    cell: (study) => (
                      <>
                        <p className="truncate font-medium text-foreground" title={study.title}>{study.title}</p>
                        {study.first_author && <p className="truncate text-xs text-muted-fg">{study.first_author}</p>}
                      </>
                    ),
                  },
                  { header: "Score", cell: (study) => <span className="font-mono font-semibold text-foreground">{study.relevance_score ?? "—"}</span> },
                  { header: "Qualität", cell: (study) => <QualityBadge status={study.quality_status} /> },
                  { header: "Priorität", cell: (study) => <PriorityBadge priority={study.editorial_priority} /> },
                  { header: "Typ", cell: (study) => study.study_type ?? "—" },
                  {
                    header: "Quelle",
                    tdClassName: "max-w-[120px] truncate text-foreground/80",
                    cell: (study) => <span title={study.origin_label ?? ""}>{study.origin_label ?? "—"}</span>,
                  },
                  { header: "Datum", cell: (study) => formatDate(study.created_at) },
                  {
                    header: "Aktionen",
                    fullWidthOnMobile: true,
                    cell: (study) => (
                      <div className="flex gap-1">
                        <button onClick={() => void handleQuickAction(study.id, "good")} className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-medium text-primary transition-transform duration-150 active:scale-90 hover:bg-primary/20" title="Genehmigen"><CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} /></button>
                        <button onClick={() => void handleQuickAction(study.id, "bad")} className="rounded-lg bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-600 transition-transform duration-150 active:scale-90 hover:bg-rose-500/20 dark:text-rose-400" title="Ablehnen"><XCircle className="h-3.5 w-3.5" strokeWidth={2} /></button>
                        <button onClick={() => openEdit(study)} className="rounded-lg bg-sky-500/10 px-2 py-1 text-xs font-medium text-sky-600 transition-transform duration-150 active:scale-90 hover:bg-sky-500/20 dark:text-sky-400" title="Bearbeiten"><Pencil className="h-3.5 w-3.5" strokeWidth={2} /></button>
                        <button onClick={() => setDeletingId(study.id)} className="rounded-lg bg-background px-2 py-1 text-xs font-medium text-foreground/80 transition-transform duration-150 active:scale-90 hover:bg-border" title="Löschen"><Trash2 className="h-3.5 w-3.5" strokeWidth={2} /></button>
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-fg">
                Seite {data.page} von {data.totalPages} · {data.total} Studien
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-fg transition active:scale-[0.97] hover:bg-background disabled:opacity-40"
                >
                  Zurück
                </button>
                <button
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-fg transition active:scale-[0.97] hover:bg-background disabled:opacity-40"
                >
                  Weiter
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Modal — always mounted + class-toggled (not conditionally
          rendered) so open/close can transition instead of popping
          instantly, same pattern as components/UserMenu.tsx. Modals stay
          opaque + centered (.modal-surface, DESIGN_SYSTEM.md §16). */}
      <div
        className={`fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:items-center ${
          editing ? "opacity-100" : "invisible pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`modal-surface w-full max-w-lg rounded-t-2xl border border-border px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl transition-[opacity,transform] duration-300 [transition-timing-function:var(--ease-drawer)] max-h-[85vh] overflow-y-auto md:mx-4 md:rounded-2xl md:pb-6 ${
            editing ? "translate-y-0 opacity-100 md:scale-100" : "translate-y-full opacity-0 md:translate-y-0 md:scale-[0.96]"
          }`}
        >
          {editing && (
            <>
              <h2 className="text-lg font-bold text-foreground">Studie bearbeiten</h2>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-fg">Titel</label>
                  <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-fg">Beschreibung</label>
                  <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-fg">Qualitätsstatus</label>
                    <Dropdown value={editing.qualityStatus} onChange={(v) => setEditing({ ...editing, qualityStatus: v })}>
                      <DropdownOption value="pending">Offen</DropdownOption>
                      <DropdownOption value="good">Gut</DropdownOption>
                      <DropdownOption value="bad">Schlecht</DropdownOption>
                    </Dropdown>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-fg">Priorität</label>
                    <Dropdown value={editing.editorialPriority} onChange={(v) => setEditing({ ...editing, editorialPriority: v })}>
                      <DropdownOption value="high">High</DropdownOption>
                      <DropdownOption value="medium">Medium</DropdownOption>
                      <DropdownOption value="low">Low</DropdownOption>
                    </Dropdown>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-fg">Tags (kommagetrennt)</label>
                  <input value={editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-fg">Review-Notiz (optional)</label>
                  <textarea
                    value={editing.reviewNote}
                    onChange={(e) => setEditing({ ...editing, reviewNote: e.target.value })}
                    rows={2}
                    placeholder="Interne Notiz zu dieser Prüfung"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button onClick={() => setEditing(null)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-fg transition-transform duration-150 active:scale-[0.97] hover:bg-background">
                  Abbrechen
                </button>
                <CTAButton variant="primary" onClick={() => void handleSaveEdit()} disabled={saving}>
                  {saving ? "Speichert..." : "Speichern"}
                </CTAButton>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirm Modal — same always-mounted pattern as the edit modal. */}
      <div
        className={`fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:items-center ${
          deletingId ? "opacity-100" : "invisible pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`modal-surface w-full max-w-sm rounded-t-2xl border border-border px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-xl transition-[opacity,transform] duration-300 [transition-timing-function:var(--ease-drawer)] md:mx-4 md:rounded-2xl md:pb-6 ${
            deletingId ? "translate-y-0 opacity-100 md:scale-100" : "translate-y-full opacity-0 md:translate-y-0 md:scale-[0.96]"
          }`}
        >
          {deletingId && (
            <>
              <h2 className="text-lg font-bold text-foreground">Studie löschen?</h2>
              <p className="mt-2 text-sm text-muted-fg">Diese Aktion kann nicht rückgängig gemacht werden.</p>
              <div className="mt-5 flex justify-end gap-3">
                <button onClick={() => setDeletingId(null)} className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-fg transition-transform duration-150 active:scale-[0.97] hover:bg-background">
                  Abbrechen
                </button>
                <CTAButton variant="danger" onClick={() => void handleDelete(deletingId)}>
                  Löschen
                </CTAButton>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminPage>
  );
}
