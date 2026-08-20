import { Link } from "@/i18n/navigation";
import Image from "next/image";
import type { Route } from "next";
import {
  Bug,
  FlaskConical,
  Microscope,
  Wrench,
  Check,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

const LEXICONS: Array<{
  icon: LucideIcon;
  label: string;
  desc: string;
  href: string;
  accentCls: string;
  labelCls: string;
}> = [
  {
    icon: Bug,
    label: "Schädlinge",
    desc: "Symptome, Monitoring und Gegenmaßnahmen.",
    href: "/studies/pests",
    accentCls: "border-rose-100 dark:border-rose-900/40 hover:border-rose-300 hover:bg-rose-50 dark:bg-rose-950/30 dark:hover:bg-rose-950/30",
    labelCls: "text-rose-700 dark:text-rose-400",
  },
  {
    icon: FlaskConical,
    label: "Nährstoffmängel",
    desc: "Diagnose und Korrektur nach Symptom.",
    href: "/studies/deficiencies",
    accentCls: "border-sky-100 dark:border-sky-900/40 hover:border-sky-300 hover:bg-sky-50 dark:bg-sky-950/30 dark:hover:bg-sky-950/30",
    labelCls: "text-sky-700 dark:text-sky-400",
  },
  {
    icon: Microscope,
    label: "Quellenregister",
    desc: "Wissenschaftliche Quellen nach Publisher & Typ.",
    href: "/studies/sources",
    accentCls: "border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-300 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/30",
    labelCls: "text-emerald-700 dark:text-emerald-400",
  },
];

export default function DatabaseHubPage() {
  return (
    <main className="min-h-screen bg-card">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-800 px-6 pb-14 pt-12 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[10%] top-1/2 h-[380px] w-[380px] -translate-y-1/2 rounded-full bg-emerald-400/12 blur-[110px]" />
        </div>

        <Image
          src="/images/hero/database-dropper.png"
          alt=""
          width={862}
          height={1824}
          className="pointer-events-none absolute right-[-24px] top-[-20px] hidden h-[440px] w-[208px] object-cover opacity-90 mix-blend-screen sl-photo-leaf sl-plant-leaf--slow xl:block"
          aria-hidden="true"
          loading="lazy"
        />

        <div className="relative mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Datenbank
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
            Fachregister{" "}
            <span className="text-emerald-400">& Lexika.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300">
            Nachschlagewerke zu Schädlingen, Nährstoffmängeln und wissenschaftlichen Quellen.
          </p>

          {/* Primary CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={"/studies/sources" as Route}
              className="rounded-xl bg-emerald-500 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/40 transition hover:bg-emerald-400"
            >
              Quellenregister öffnen →
            </Link>
            <Link
              href={"/tools" as Route}
              className="rounded-xl border border-white/20 px-7 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Zu den Rechner-Tools
            </Link>
          </div>
        </div>
      </section>

      {/* ── Hinweis: Dünger-Katalog ──────────────────────────────────── */}
      <section className="border-b border-border bg-amber-50 dark:bg-amber-950/20 px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-amber-200 dark:border-amber-900/40 bg-card">
              <Wrench className="h-4 w-4 text-amber-700 dark:text-amber-400" strokeWidth={2} />
            </span>
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Dünger-Katalog wird überarbeitet</p>
              <p className="mt-0.5 text-sm text-amber-800 dark:text-amber-300/90">
                Der Produkt-Katalog ist vorübergehend nicht verfügbar, während wir die Daten neu quellen.
              </p>
            </div>
          </div>
          <Link
            href={"/database/fertilizers" as Route}
            className="inline-flex shrink-0 items-center rounded-lg border border-amber-300 dark:border-amber-900/40 bg-card px-3 py-1.5 text-sm font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/40"
          >
            Details ansehen
          </Link>
        </div>
      </section>

      {/* ── Fachregister ──────────────────────────────────────────── */}
      <section className="bg-background px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-fg">
            Fachregister
          </p>
          <h2 className="mt-2 text-2xl font-bold text-foreground">Lexika & Quellen</h2>
          <p className="mt-1 text-sm text-muted-fg">
            Eigenständige Nachschlagewerke – unabhängig vom Produkt-Katalog.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LEXICONS.map((lex) => (
              <Link
                key={lex.href}
                href={lex.href as Route}
                className={`group flex flex-col rounded-2xl border p-5 transition-[border-color,background-color,transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-md ${lex.accentCls}`}
              >
                <lex.icon className="h-6 w-6 text-foreground/80" strokeWidth={2} />
                <h3 className="mt-3 text-base font-bold text-foreground">{lex.label}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-fg">{lex.desc}</p>
                <span className={`mt-4 text-xs font-semibold group-hover:underline ${lex.labelCls}`}>
                  Öffnen →
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-5">
            <Link
              href={"/studies" as Route}
              className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/80 hover:text-emerald-700 dark:text-emerald-400"
            >
              Zur vollständigen Studiensammlung →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust / Kontext ───────────────────────────────────────── */}
      <section className="border-t border-border bg-card px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap gap-6 sm:gap-10">
            {[
              { icon: BookOpen, text: "Peer-reviewed Quellenregister" },
              { icon: Check, text: "Redaktionell geprüfte Lexika" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-muted-fg">
                <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
