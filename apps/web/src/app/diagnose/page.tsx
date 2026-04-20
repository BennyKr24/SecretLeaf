// Placeholder — Phase 1 (Routing)
// Final implementation: Phase 7 (Diagnose System)

export const metadata = {
  title: "Problem diagnostizieren – SecretLeaf",
  description: "Interaktiver Entscheidungsbaum für Pflanzenprobleme — Mängel, Schädlinge, Klima.",
};

export default function DiagnosePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-md text-center space-y-4">
        <span className="text-5xl">🩺</span>
        <h1 className="text-2xl font-bold text-slate-900">Problem diagnostizieren</h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          Wähle ein Symptom, beantworte geführte Fragen und erhalte
          eine Diagnose mit konkreten Lösungsschritten.
        </p>
        <p className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          Wird in Phase 7 implementiert
        </p>
      </div>
    </main>
  );
}
