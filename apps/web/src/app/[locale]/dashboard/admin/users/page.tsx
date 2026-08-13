"use client";

import { useCallback, useEffect, useState } from "react";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminApi } from "@/lib/adminApi";
import { Users, Pencil } from "lucide-react";

type AdminUser = {
  id: string;
  email: string | null;
  role: string;
  createdAt: string;
  lastSignIn: string | null;
  emailConfirmed: boolean;
  provider: string;
};

type UsersResponse = {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const ROLES = ["CONSUMER", "PROVIDER", "ADMIN"] as const;
const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400",
  PROVIDER: "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400",
  CONSUMER: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminUsersPage() {
  const auth = useAdminAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modals
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState("");
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (auth.status !== "authenticated") return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi<UsersResponse>(auth.session, "users-list", {
        page,
        limit: 25,
        search: search || undefined,
        roleFilter,
      });
      setUsers(data.users);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Benutzer konnten nicht geladen werden");
    } finally {
      setLoading(false);
    }
  }, [auth, page, search, roleFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      void fetchUsers();
    }, 0);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  // Debounce search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleRoleChange = async () => {
    if (!editingUser || auth.status !== "authenticated") return;
    setActionLoading(true);
    setError(null);
    try {
      await adminApi(auth.session, "user-update-role", {
        userId: editingUser.id,
        role: editRole,
      });
      setSuccess(`Rolle von ${editingUser.email ?? editingUser.id} auf ${editRole} geändert.`);
      setEditingUser(null);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rolle konnte nicht geändert werden");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser || auth.status !== "authenticated") return;
    setActionLoading(true);
    setError(null);
    try {
      await adminApi(auth.session, "user-delete", { userId: deletingUser.id });
      setSuccess(`Benutzer ${deletingUser.email ?? deletingUser.id} wurde gelöscht.`);
      setDeletingUser(null);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Benutzer konnte nicht gelöscht werden");
    } finally {
      setActionLoading(false);
    }
  };

  if (auth.status !== "authenticated") return null;

  return (
    <div>
      <div className="mb-7">
        <div className="flex items-center gap-2 text-xs text-muted-fg">
          <span>Admin</span><span>/</span><span className="font-semibold text-muted-fg">Benutzer</span>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <Users className="h-6 w-6 text-emerald-600" strokeWidth={2} />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Benutzerverwaltung</h1>
            <p className="text-sm text-muted-fg">Rollen verwalten, Benutzerkonten einsehen und administrieren.</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-fg">Gesamt</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{total}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-fg">Aktuelle Seite</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{users.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-fg">Seite</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{page} / {totalPages || 1}</p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-semibold transition-transform duration-150 active:scale-90 hover:underline">×</button>
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {success}
          <button onClick={() => setSuccess(null)} className="ml-2 font-semibold transition-transform duration-150 active:scale-90 hover:underline">×</button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Suche nach E-Mail oder ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full max-w-sm rounded-xl border border-border px-3 py-2 text-sm outline-none transition focus:border-emerald-400 dark:border-emerald-600 focus:ring-2 focus:ring-[#cfe8d6]"
          />
        </div>
        <Dropdown value={roleFilter} onChange={(v) => { setRoleFilter(v); setPage(1); }}>
          <DropdownOption value="all">Alle Rollen</DropdownOption>
          <DropdownOption value="CONSUMER">Consumer</DropdownOption>
          <DropdownOption value="PROVIDER">Provider</DropdownOption>
          <DropdownOption value="ADMIN">Admin</DropdownOption>
        </Dropdown>
        <button
          onClick={() => void fetchUsers()}
          className="rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted-fg transition active:scale-[0.97] hover:bg-background"
        >
          Aktualisieren
        </button>
      </div>

      {/* Users Table */}
      <div className="min-h-[400px] overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 dark:border-emerald-500 border-t-transparent" />
            <span className="text-sm text-muted-fg">Benutzer werden geladen...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-background">
                  <th className="px-4 py-3 font-semibold text-muted-fg">E-Mail</th>
                  <th className="px-3 py-3 font-semibold text-muted-fg">Rolle</th>
                  <th className="px-3 py-3 font-semibold text-muted-fg">Provider</th>
                  <th className="px-3 py-3 font-semibold text-muted-fg">Bestätigt</th>
                  <th className="px-3 py-3 font-semibold text-muted-fg">Registriert</th>
                  <th className="px-3 py-3 font-semibold text-muted-fg">Letzter Login</th>
                  <th className="px-3 py-3 font-semibold text-muted-fg">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border transition hover:bg-background">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{user.email ?? "—"}</div>
                      <div className="text-[10px] font-mono text-muted-fg">{user.id.slice(0, 8)}…</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_COLORS[user.role] ?? "bg-border text-foreground/80"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-fg capitalize">{user.provider}</td>
                    <td className="px-3 py-3">
                      {user.emailConfirmed ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ja
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Nein
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-fg">{formatDate(user.createdAt)}</td>
                    <td className="px-3 py-3 text-xs text-muted-fg">{formatDate(user.lastSignIn)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingUser(user); setEditRole(user.role); }}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 transition active:scale-90 hover:bg-emerald-100 dark:bg-emerald-950/40"
                          title="Rolle bearbeiten"
                        >
                          <Pencil className="h-3 w-3" strokeWidth={2} /> Rolle
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition active:scale-90 hover:bg-red-50"
                          title="Benutzer löschen"
                        >
                          ⌫
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-fg">
                      Keine Benutzer gefunden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-fg">{total} Benutzer insgesamt</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-fg transition active:scale-[0.97] hover:bg-background disabled:opacity-40"
            >
              ← Zurück
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-fg transition active:scale-[0.97] hover:bg-background disabled:opacity-40"
            >
              Weiter →
            </button>
          </div>
        </div>
      )}

      {/* Edit Role Modal — always mounted + class-toggled (not conditionally
          rendered) so open/close can transition instead of popping
          instantly, same pattern as components/UserMenu.tsx. Modals stay
          opaque + centered (.modal-surface, DESIGN_SYSTEM.md §16) — the
          glass/blur treatment is reserved for trigger-anchored dropdowns. */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          editingUser ? "opacity-100" : "invisible pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`modal-surface mx-4 w-full max-w-md rounded-2xl border border-border p-6 shadow-xl transition-[opacity,transform] duration-300 ${
            editingUser ? "scale-100 opacity-100" : "scale-[0.96] opacity-0"
          }`}
        >
          {editingUser && (
            <>
              <h3 className="text-lg font-bold text-foreground">Rolle bearbeiten</h3>
              <p className="mt-1 text-sm text-muted-fg">
                Benutzer: <span className="font-mono font-medium">{editingUser.email ?? editingUser.id}</span>
              </p>

              <div className="mt-4 space-y-2">
                {ROLES.map((role) => (
                  <label
                    key={role}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                      editRole === role
                        ? "border-emerald-600 dark:border-emerald-500 bg-emerald-100 dark:bg-emerald-950/40"
                        : "border-border hover:bg-background"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={editRole === role}
                      onChange={() => setEditRole(role)}
                      className="accent-[#1f7a4f]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{role}</p>
                      <p className="text-xs text-muted-fg">
                        {role === "ADMIN" && "Voller Zugriff auf das Admin-Panel und alle Funktionen."}
                        {role === "PROVIDER" && "Kann Angebote erstellen und Studien bearbeiten."}
                        {role === "CONSUMER" && "Standard-Benutzer. Kann Studien lesen und suchen."}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setEditingUser(null)}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-fg transition active:scale-[0.97] hover:bg-background"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => void handleRoleChange()}
                  disabled={actionLoading || editRole === editingUser.role}
                  className="rounded-xl bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition active:scale-[0.97] hover:bg-emerald-700 disabled:opacity-50"
                >
                  {actionLoading ? "Wird gespeichert..." : "Rolle speichern"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal — same always-mounted pattern as above. */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          deletingUser ? "opacity-100" : "invisible pointer-events-none opacity-0"
        }`}
      >
        <div
          className={`modal-surface mx-4 w-full max-w-md rounded-2xl border border-red-200 p-6 shadow-xl transition-[opacity,transform] duration-300 ${
            deletingUser ? "scale-100 opacity-100" : "scale-[0.96] opacity-0"
          }`}
        >
          {deletingUser && (
            <>
              <h3 className="text-lg font-bold text-red-700">Benutzer löschen</h3>
              <p className="mt-2 text-sm text-muted-fg">
                Bist du sicher, dass du den Benutzer{" "}
                <span className="font-mono font-semibold text-foreground">
                  {deletingUser.email ?? deletingUser.id}
                </span>{" "}
                endgültig löschen möchtest?
              </p>
              <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                Diese Aktion kann nicht rückgängig gemacht werden. Alle Daten des Benutzers werden unwiderruflich gelöscht.
              </p>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => setDeletingUser(null)}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-fg transition active:scale-[0.97] hover:bg-background"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => void handleDelete()}
                  disabled={actionLoading}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition active:scale-[0.97] hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? "Wird gelöscht..." : "Endgültig löschen"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
