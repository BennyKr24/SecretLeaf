"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminApi } from "@/lib/adminApi";

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
  ADMIN: "bg-purple-100 text-purple-700",
  PROVIDER: "bg-blue-100 text-blue-700",
  CONSUMER: "bg-[#e5f4ea] text-[#1f7a4f]",
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
    void fetchUsers();
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#10281e]">Benutzerverwaltung</h1>
        <p className="mt-1 text-sm text-[#4d685a]">
          Registrierte Benutzer einsehen, Rollen verwalten und Accounts administrieren.
        </p>
      </div>

      {/* Stats Row */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#d8e8dd] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">Gesamt</p>
          <p className="mt-1 text-2xl font-bold text-[#10281e]">{total}</p>
        </div>
        <div className="rounded-2xl border border-[#d8e8dd] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">Aktuelle Seite</p>
          <p className="mt-1 text-2xl font-bold text-[#10281e]">{users.length}</p>
        </div>
        <div className="rounded-2xl border border-[#d8e8dd] bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">Seite</p>
          <p className="mt-1 text-2xl font-bold text-[#10281e]">{page} / {totalPages || 1}</p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-semibold hover:underline">×</button>
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {success}
          <button onClick={() => setSuccess(null)} className="ml-2 font-semibold hover:underline">×</button>
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
            className="w-full max-w-sm rounded-xl border border-[#d8e8dd] px-3 py-2 text-sm outline-none transition focus:border-[#5ca87f] focus:ring-2 focus:ring-[#cfe8d6]"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-[#d8e8dd] px-3 py-2 text-sm outline-none transition focus:border-[#5ca87f] focus:ring-2 focus:ring-[#cfe8d6]"
        >
          <option value="all">Alle Rollen</option>
          <option value="CONSUMER">Consumer</option>
          <option value="PROVIDER">Provider</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button
          onClick={() => void fetchUsers()}
          className="rounded-xl border border-[#d8e8dd] px-3 py-2 text-sm font-medium text-[#4d685a] transition hover:bg-[#f6faf7]"
        >
          Aktualisieren
        </button>
      </div>

      {/* Users Table */}
      <div className="min-h-[400px] overflow-hidden rounded-2xl border border-[#d8e8dd] bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1f7a4f] border-t-transparent" />
            <span className="text-sm text-[#4d685a]">Benutzer werden geladen...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#d8e8dd] bg-[#f6faf7]">
                  <th className="px-4 py-3 font-semibold text-[#4d685a]">E-Mail</th>
                  <th className="px-3 py-3 font-semibold text-[#4d685a]">Rolle</th>
                  <th className="px-3 py-3 font-semibold text-[#4d685a]">Provider</th>
                  <th className="px-3 py-3 font-semibold text-[#4d685a]">Bestätigt</th>
                  <th className="px-3 py-3 font-semibold text-[#4d685a]">Registriert</th>
                  <th className="px-3 py-3 font-semibold text-[#4d685a]">Letzter Login</th>
                  <th className="px-3 py-3 font-semibold text-[#4d685a]">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-[#eef3f0] transition hover:bg-[#fbfefc]">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#10281e]">{user.email ?? "—"}</div>
                      <div className="text-[10px] font-mono text-[#8fa89a]">{user.id.slice(0, 8)}…</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${ROLE_COLORS[user.role] ?? "bg-gray-100 text-gray-700"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-[#6b8577] capitalize">{user.provider}</td>
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
                    <td className="px-3 py-3 text-xs text-[#6b8577]">{formatDate(user.createdAt)}</td>
                    <td className="px-3 py-3 text-xs text-[#6b8577]">{formatDate(user.lastSignIn)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setEditingUser(user); setEditRole(user.role); }}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-[#1f7a4f] transition hover:bg-[#e5f4ea]"
                          title="Rolle bearbeiten"
                        >
                          ✎ Rolle
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
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
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-[#4d685a]">
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
          <p className="text-xs text-[#6b8577]">{total} Benutzer insgesamt</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-xl border border-[#d8e8dd] px-3 py-1.5 text-xs font-medium text-[#4d685a] transition hover:bg-[#f6faf7] disabled:opacity-40"
            >
              ← Zurück
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-xl border border-[#d8e8dd] px-3 py-1.5 text-xs font-medium text-[#4d685a] transition hover:bg-[#f6faf7] disabled:opacity-40"
            >
              Weiter →
            </button>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-[#d8e8dd] bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-[#10281e]">Rolle bearbeiten</h3>
            <p className="mt-1 text-sm text-[#4d685a]">
              Benutzer: <span className="font-mono font-medium">{editingUser.email ?? editingUser.id}</span>
            </p>

            <div className="mt-4 space-y-2">
              {ROLES.map((role) => (
                <label
                  key={role}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                    editRole === role
                      ? "border-[#1f7a4f] bg-[#e5f4ea]"
                      : "border-[#d8e8dd] hover:bg-[#f6faf7]"
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
                    <p className="text-sm font-semibold text-[#10281e]">{role}</p>
                    <p className="text-xs text-[#6b8577]">
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
                className="rounded-xl border border-[#d8e8dd] px-4 py-2 text-sm font-medium text-[#4d685a] transition hover:bg-[#f6faf7]"
              >
                Abbrechen
              </button>
              <button
                onClick={() => void handleRoleChange()}
                disabled={actionLoading || editRole === editingUser.role}
                className="rounded-xl bg-[#1f7a4f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#17613f] disabled:opacity-50"
              >
                {actionLoading ? "Wird gespeichert..." : "Rolle speichern"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-red-700">Benutzer löschen</h3>
            <p className="mt-2 text-sm text-[#4d685a]">
              Bist du sicher, dass du den Benutzer{" "}
              <span className="font-mono font-semibold text-[#10281e]">
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
                className="rounded-xl border border-[#d8e8dd] px-4 py-2 text-sm font-medium text-[#4d685a] transition hover:bg-[#f6faf7]"
              >
                Abbrechen
              </button>
              <button
                onClick={() => void handleDelete()}
                disabled={actionLoading}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "Wird gelöscht..." : "Endgültig löschen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
