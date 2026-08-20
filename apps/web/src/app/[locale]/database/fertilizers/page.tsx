import { Link } from '@/i18n/navigation';
import type { Route } from 'next';
import { Wrench } from 'lucide-react';

export default function FertilizersPage() {
  return (
    <main className="min-h-screen bg-card px-6 py-16">
      <section className="mx-auto max-w-2xl rounded-2xl border border-border bg-background p-10 text-center shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40">
          <Wrench className="h-6 w-6 text-amber-700 dark:text-amber-400" strokeWidth={2} />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-foreground">Dünger-Katalog vorübergehend nicht verfügbar</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-fg">
          Der Dünger-Katalog wird gerade überarbeitet und ist vorübergehend nicht verfügbar. Wir arbeiten daran, die
          Produktdaten neu und verlässlich zu quellen, bevor wir sie wieder anzeigen.
        </p>
        <Link
          href={'/database' as Route}
          className="mt-6 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          ← Zurück zur Datenbank
        </Link>
      </section>
    </main>
  );
}
