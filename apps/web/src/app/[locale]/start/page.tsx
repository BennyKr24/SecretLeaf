import GrowSetupWizard from '@/components/grow/GrowSetupWizard';

export const metadata = {
  title: "Grow starten – SecretLeaf",
  description: "Richte deinen neuen Grow ein und erhalte einen personalisierten Grow-Plan.",
};

export default function StartPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto flex max-w-md flex-col">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="text-4xl">🌱</span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            Neuen Grow starten
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Beantworte 3 kurze Fragen — danach generieren wir deinen persönlichen Grow-Plan.
          </p>
        </div>

        <GrowSetupWizard />
      </div>
    </main>
  );
}
