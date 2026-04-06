"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginWithSupabase, registerWithSupabase, saveSession } from "@/lib/auth";
import { DEMO_SESSION, DEMO_SESSION_PROVIDER } from "@/lib/demoData";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

type AuthMode = "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const demoLogin = (asProvider = false) => {
    saveSession(asProvider ? DEMO_SESSION_PROVIDER : DEMO_SESSION);
    router.push("/dashboard");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setInfo(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) {
        throw new Error("E-Mail ist erforderlich");
      }

      if (mode === "login") {
        await loginWithSupabase({ email: cleanEmail, password });
        router.push("/dashboard");
      } else {
        const session = await registerWithSupabase({ email: cleanEmail, password });
        if (session) {
          saveSession(session);
          router.push("/dashboard");
        } else {
          setInfo("Konto erstellt. Bitte bestaetige deine E-Mail und logge dich danach ein.");
          setMode("login");
        }
      }
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
            Login und Registrierung laufen jetzt ueber Supabase Auth.
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
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#355b49]">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="du@beispiel.de"
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
            <div className="rounded-xl border border-[#d8e8dd] bg-[#f6faf7] p-3 text-sm text-[#4d685a]">
              Neue Konten starten mit Rolle <span className="font-semibold">CONSUMER</span>. Provider-Rechte werden serverseitig vergeben.
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-[#e7c1c1] bg-[#fff4f4] p-3 text-sm text-[#a54b4b]">
              {error}
            </div>
          )}

          {info && (
            <div className="rounded-xl border border-[#b8dfc2] bg-[#eefaf2] p-3 text-sm text-[#2f6b45]">
              {info}
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
