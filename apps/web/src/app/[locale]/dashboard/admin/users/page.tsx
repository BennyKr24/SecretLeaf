"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminFetch } from "@/lib/admin/client";
import type {
  AdminListResponse,
  AdminUserRow,
  AdminUserDetail,
  AdminUserRole,
} from "@/lib/admin/contracts";
import { AdminPage, AdminPageSkeleton } from "@/components/admin/AdminPage";
import { Alert } from "@/components/admin/Alert";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { CTAButton } from "@/components/ui/CTAButton";
import { Users, X, ChevronLeft, ChevronRight } from "lucide-react";

const ROLE_TONE: Record<AdminUserRole, BadgeTone> = {
  ADMIN: "rose",
  PROVIDER: "amber",
  CONSUMER: "muted",
};
const dt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("de-DE") : "—");
const dtt = (iso: string | null) => (iso ? new Date(iso).toLocaleString("de-DE") : "—");
const field =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none";

function UserDrawer({
  userId,
  onClose,
  onChanged,
}: {
  userId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const auth = useAdminAuth();
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    if (auth.status !== "authenticated") return;
    try {
      setDetail(await adminFetch<AdminUserDetail>(auth.session, `users/${userId}`));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Fehler beim Laden");
    }
  }, [auth, userId]);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  const patch = async (body: Record<string, unknown>) => {
    if (auth.status !== "authenticated") return;
    setBusy(true);
    setErr(null);
    try {
      await adminFetch(auth.session, `users/${userId}`, { method: "PATCH", json: body });
      await load();
      onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Änderung fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (auth.status !== "authenticated") return;
    setBusy(true);
    try {
      await adminFetch(auth.session, `users/${userId}`, { method: "DELETE" });
      onChanged();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Löschen fehlgeschlagen");
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="modal-surface relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Nutzer</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted-fg hover:text-foreground">
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        {err && (
          <Alert tone="error" className="mt-3" onDismiss={() => setErr(null)}>
            {err}
          </Alert>
        )}

        {!detail ? (
          <AdminPageSkeleton rows={4} />
        ) : (
          <div className="mt-4 space-y-5 text-sm">
            <div>
              <p className="font-semibold text-foreground">{detail.email ?? "(keine E-Mail)"}</p>
              <p className="break-all text-xs text-muted-fg">{detail.id}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge tone={ROLE_TONE[detail.role]}>{detail.role}</Badge>
                <Badge tone={detail.plan === "free" ? "muted" : "primary"}>{detail.plan}</Badge>
                {detail.subStatus && <Badge tone="muted">{detail.subStatus}</Badge>}
                {detail.banned && <Badge tone="rose">gesperrt</Badge>}
                {!detail.emailConfirmed && <Badge tone="amber">unbestätigt</Badge>}
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
              <dt className="text-muted-fg">Registriert</dt>
              <dd className="text-foreground">{dt(detail.createdAt)}</dd>
              <dt className="text-muted-fg">Letzter Login</dt>
              <dd className="text-foreground">{dtt(detail.lastSignInAt)}</dd>
              <dt className="text-muted-fg">Provider</dt>
              <dd className="text-foreground">{detail.provider}</dd>
              <dt className="text-muted-fg">Grows</dt>
              <dd className="text-foreground">{detail.grows}</dd>
              <dt className="text-muted-fg">Log-Einträge</dt>
              <dd className="text-foreground">{detail.logEntries}</dd>
              <dt className="text-muted-fg">Letzter Log</dt>
              <dd className="text-foreground">{dt(detail.lastLogAt)}</dd>
              <dt className="text-muted-fg">Letzte Diagnose</dt>
              <dd className="text-foreground">{dt(detail.lastDiagnosisAt)}</dd>
              {detail.stripeCustomerId && (
                <>
                  <dt className="text-muted-fg">Stripe</dt>
                  <dd className="break-all text-foreground">{detail.stripeCustomerId}</dd>
                </>
              )}
            </dl>

            <div className="space-y-2 border-t border-border pt-4">
              <label className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-fg">Rolle</span>
                <select
                  value={detail.role}
                  disabled={busy}
                  onChange={(e) => void patch({ role: e.target.value })}
                  className={field}
                >
                  <option value="CONSUMER">CONSUMER</option>
                  <option value="PROVIDER">PROVIDER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </label>

              <div className="flex flex-wrap gap-2">
                {detail.plan === "free" ? (
                  <button
                    onClick={() => void patch({ grantPro: true })}
                    disabled={busy}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Pro gewähren
                  </button>
                ) : (
                  <button
                    onClick={() => void patch({ grantPro: false })}
                    disabled={busy}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                  >
                    Pro entziehen
                  </button>
                )}
                <button
                  onClick={() => void patch({ banned: !detail.banned })}
                  disabled={busy}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                >
                  {detail.banned ? "Entsperren" : "Sperren"}
                </button>
              </div>

              <div className="pt-2">
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-rose-500">Endgültig löschen?</span>
                    <button
                      onClick={() => void remove()}
                      disabled={busy}
                      className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Ja, löschen
                    </button>
                    <button onClick={() => setConfirmDelete(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs">
                      Abbrechen
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="text-xs font-medium text-rose-500 hover:underline"
                  >
                    Account löschen
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

export default function AdminUsersPage() {
  const auth = useAdminAuth();
  const [resp, setResp] = useState<AdminListResponse<AdminUserRow> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [plan, setPlan] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [search]);

  const load = useCallback(async () => {
    if (auth.status !== "authenticated") return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "25", sortBy: "created_at", sortDir: "desc" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (role) params.set("role", role);
      if (plan) params.set("plan", plan);
      setResp(await adminFetch<AdminListResponse<AdminUserRow>>(auth.session, `users?${params}`));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }, [auth, page, debouncedSearch, role, plan]);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  if (auth.status !== "authenticated") return null;

  return (
    <AdminPage title="Nutzer" icon={Users} description={resp ? `${resp.total} insgesamt` : undefined}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="E-Mail suchen…"
            className={`${field} min-w-[220px] flex-1`}
          />
          <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} className={field}>
            <option value="">Alle Rollen</option>
            <option value="CONSUMER">Consumer</option>
            <option value="PROVIDER">Provider</option>
            <option value="ADMIN">Admin</option>
          </select>
          <select value={plan} onChange={(e) => { setPlan(e.target.value); setPage(1); }} className={field}>
            <option value="">Alle Pläne</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="team">Team</option>
          </select>
        </div>

        {error && (
          <Alert tone="error" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && !resp ? (
          <AdminPageSkeleton rows={6} />
        ) : resp ? (
          <>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-card text-left text-xs text-muted-fg">
                    <th className="px-3 py-2 font-medium">E-Mail</th>
                    <th className="px-3 py-2 font-medium">Rolle</th>
                    <th className="px-3 py-2 font-medium">Plan</th>
                    <th className="px-3 py-2 font-medium">Registriert</th>
                    <th className="px-3 py-2 font-medium">Letzter Login</th>
                  </tr>
                </thead>
                <tbody>
                  {resp.rows.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => setSelected(u.id)}
                      className="cursor-pointer border-b border-border last:border-0 bg-card hover:bg-background"
                    >
                      <td className="px-3 py-2">
                        <span className="text-foreground">{u.email ?? "(keine)"}</span>
                        <span className="ml-2 text-xs text-muted-fg">{u.provider}</span>
                        {u.banned && <Badge tone="rose" className="ml-2">gesperrt</Badge>}
                        {!u.emailConfirmed && <Badge tone="amber" className="ml-2">unbestätigt</Badge>}
                      </td>
                      <td className="px-3 py-2">
                        <Badge tone={ROLE_TONE[u.role]}>{u.role}</Badge>
                      </td>
                      <td className="px-3 py-2">
                        <Badge tone={u.plan === "free" ? "muted" : "primary"}>{u.plan}</Badge>
                      </td>
                      <td className="px-3 py-2 text-muted-fg">{dt(u.createdAt)}</td>
                      <td className="px-3 py-2 text-muted-fg">{dt(u.lastSignInAt)}</td>
                    </tr>
                  ))}
                  {resp.rows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-muted-fg">
                        Keine Nutzer gefunden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {resp.totalPages > 1 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-fg">
                  Seite {resp.page} / {resp.totalPages}
                </span>
                <div className="flex gap-2">
                  <CTAButton
                    variant="secondary"
                    size="sm"
                    type="button"
                    disabled={resp.page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={2} /> Zurück
                  </CTAButton>
                  <CTAButton
                    variant="secondary"
                    size="sm"
                    type="button"
                    disabled={resp.page >= resp.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Weiter <ChevronRight className="h-4 w-4" strokeWidth={2} />
                  </CTAButton>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {selected && (
        <UserDrawer userId={selected} onClose={() => setSelected(null)} onChanged={() => void load()} />
      )}
    </AdminPage>
  );
}
