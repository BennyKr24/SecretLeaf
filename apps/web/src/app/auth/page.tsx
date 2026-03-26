"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import { DEMO_SESSION, DEMO_SESSION_PROVIDER } from "@/lib/demoData";
import { SessionData, UserRole } from "@/lib/types";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("CONSUMER");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const demoLogin = (asProvider = false) => {
    saveSession(asProvider ? DEMO_SESSION_PROVIDER : DEMO_SESSION);
    router.push("/dashboard");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const body =
        mode === "login"
          ? { username, password }
          : {
              username,
              password,
              role,
              ...(email.trim() ? { email } : {})
            };

      const response = await apiRequest<SessionData>(endpoint, {
        method: "POST",
        body
      });

      saveSession(response);
      router.push("/dashboard");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentifizierung fehlgeschlagen");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-2xl font-bold text-blue-600 hover:text-blue-700">
            SecretLeaf
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            {mode === "login" ? "Willkommen zurück" : "Konto erstellen"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Nur minimale Felder. Keine echten Namen erforderlich.
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(null); }}
            className={`flex-1 py-2 px-4 rounded font-medium transition ${
              mode === "login"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(null); }}
            className={`flex-1 py-2 px-4 rounded font-medium transition ${
              mode === "register"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Registrieren
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-5">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Benutzername
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={32}
              placeholder="dein-pseudonym"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={10}
              placeholder={mode === "login" ? "••••••••••" : "Mindestens 10 Zeichen"}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Registration Fields */}
          {mode === "register" && (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-Mail <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="optional@beispiel.de"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Ich möchte
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="CONSUMER">Nur Angebote suchen</option>
                  <option value="PROVIDER">Nur Angebote erstellen</option>
                </select>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={pending}
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {pending ? "Wird verarbeitet..." : mode === "login" ? "Einloggen" : "Konto erstellen"}
          </button>
        </form>

        {/* Demo-Mode */}
        {DEMO_MODE && (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-center text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">
              Demo-Modus aktiv – API deaktiviert
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => demoLogin(false)}
                className="flex-1 py-2 px-3 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition"
              >
                Als Consumer einloggen
              </button>
              <button
                type="button"
                onClick={() => demoLogin(true)}
                className="flex-1 py-2 px-3 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition"
              >
                Als Provider einloggen
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-600">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Zur Startseite
          </Link>
        </p>
      </div>
    </main>
  );
}
