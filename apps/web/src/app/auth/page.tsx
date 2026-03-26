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
    <main className="min-h-screen px-6 py-12 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block text-2xl font-bold text-[#1f7a4f] hover:text-[#17613f]">
            SecretLeaf
          </Link>
          <h1 className="mt-6 text-3xl font-bold text-[#10281e]">
            {mode === "login" ? "Willkommen zurück" : "Konto erstellen"}
          </h1>
          <p className="mt-2 text-sm text-[#4d685a]">
            Nur minimale Felder. Keine echten Namen erforderlich.
          </p>
        </div>

        <div className="mb-8 flex gap-2 rounded-xl border border-[#d8e8dd] bg-[#edf6f0] p-1">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(null); }}
            className={`flex-1 py-2 px-4 rounded font-medium transition ${
              mode === "login"
                ? "bg-white text-[#1f7a4f] shadow-sm"
                : "text-[#4d685a] hover:text-[#173126]"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(null); }}
            className={`flex-1 py-2 px-4 rounded font-medium transition ${
              mode === "register"
                ? "bg-white text-[#1f7a4f] shadow-sm"
                : "text-[#4d685a] hover:text-[#173126]"
            }`}
          >
            Registrieren
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 rounded-2xl border border-[#d8e8dd] bg-white/90 p-6 shadow-sm">
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-medium text-[#355b49]">
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
              className="w-full rounded-xl border border-[#d8e8dd] bg-white px-4 py-2 outline-none transition focus:border-[#5ca87f] focus:ring-2 focus:ring-[#cfe8d6]"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#355b49]">
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
              className="w-full rounded-xl border border-[#d8e8dd] bg-white px-4 py-2 outline-none transition focus:border-[#5ca87f] focus:ring-2 focus:ring-[#cfe8d6]"
            />
          </div>

          {mode === "register" && (
            <>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#355b49]">
                  E-Mail <span className="text-[#7b9688]">(optional)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="optional@beispiel.de"
                  className="w-full rounded-xl border border-[#d8e8dd] bg-white px-4 py-2 outline-none transition focus:border-[#5ca87f] focus:ring-2 focus:ring-[#cfe8d6]"
                />
              </div>

              <div>
                <label htmlFor="role" className="mb-2 block text-sm font-medium text-[#355b49]">
                  Ich möchte
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-[#d8e8dd] bg-white px-4 py-2 outline-none transition focus:border-[#5ca87f] focus:ring-2 focus:ring-[#cfe8d6]"
                >
                  <option value="CONSUMER">Nur Angebote suchen</option>
                  <option value="PROVIDER">Nur Angebote erstellen</option>
                </select>
              </div>
            </>
          )}

          {error && (
            <div className="rounded-xl border border-[#e7c1c1] bg-[#fff4f4] p-3 text-sm text-[#a54b4b]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-[#1f7a4f] px-4 py-2 font-medium text-white transition hover:bg-[#17613f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Wird verarbeitet..." : mode === "login" ? "Einloggen" : "Konto erstellen"}
          </button>
        </form>

        {DEMO_MODE && (
          <div className="mt-6 rounded-2xl border border-[#ead5a3] bg-[#fff8e7] p-4">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-[#9b7a2c]">
              Demo-Modus aktiv – API deaktiviert
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => demoLogin(false)}
                className="flex-1 rounded-lg bg-[#c89a3f] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#b4872f]"
              >
                Als Consumer einloggen
              </button>
              <button
                type="button"
                onClick={() => demoLogin(true)}
                className="flex-1 rounded-lg bg-[#c89a3f] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#b4872f]"
              >
                Als Provider einloggen
              </button>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-[#4d685a]">
          <Link href="/" className="font-medium text-[#1f7a4f] hover:text-[#17613f]">
            ← Zur Startseite
          </Link>
        </p>
      </div>
    </main>
  );
}
