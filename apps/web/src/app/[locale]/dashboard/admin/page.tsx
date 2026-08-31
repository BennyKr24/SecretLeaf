"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminFetch } from "@/lib/admin/client";
import type { AdminBriefing } from "@/lib/admin/contracts";
import { AdminPage, AdminPageSkeleton } from "@/components/admin/AdminPage";
import { Alert } from "@/components/admin/Alert";
import { StatCard, KpiRow } from "@/components/admin/StatCard";
import { RunHistory } from "@/components/admin/RunHistory";
import {
  Radar,
  Euro,
  Sparkles,
  CreditCard,
  UserPlus,
  Sprout,
  ClipboardCheck,
  Microscope,
  MessageSquare,
  Percent,
} from "lucide-react";

function euro(cents: number): string {
  return (cents / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

export default function AdminLagePage() {
  const auth = useAdminAuth();
  const [data, setData] = useState<AdminBriefing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    void (async () => {
      try {
        setData(await adminFetch<AdminBriefing>(auth.session, "briefing"));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Fehler beim Laden");
      } finally {
        setLoading(false);
      }
    })();
  }, [auth]);

  if (auth.status !== "authenticated") return null;

  const todayLabel = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <AdminPage title="Lage" icon={Radar} description={todayLabel}>
      {loading && <AdminPageSkeleton rows={5} />}

      {error && (
        <Alert tone="error" title="Briefing konnte nicht geladen werden">
          {error}
        </Alert>
      )}

      {data && (
        <div className="space-y-8">
          {/* 1 — Braucht Entscheidung */}
          {data.attention.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">
                Braucht Entscheidung
              </h2>
              {data.attention.map((item, i) => (
                <Alert
                  key={i}
                  tone={item.severity}
                  action={
                    <Link href={item.href} className="text-sm font-semibold underline hover:no-underline">
                      Ansehen →
                    </Link>
                  }
                >
                  {item.text}
                </Alert>
              ))}
            </section>
          )}

          {/* 2 — Geld */}
          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Geld</h2>
              {!data.money.stripeConnected && (
                <span className="text-[11px] text-muted-fg">
                  Schätzung aus Abo-Daten — echter Stripe-Umsatz folgt (Phase 2)
                </span>
              )}
            </div>
            <KpiRow>
              <StatCard label="MRR (geschätzt)" value={euro(data.money.estimatedMrrCents)} icon={Euro} tone="primary" />
              <StatCard label="Aktive Pro" value={data.money.activePro} icon={CreditCard} tone="primary" />
              <StatCard label="Im Trial" value={data.money.trialing} icon={Sparkles} tone="muted" />
              <StatCard
                label="Offene Zahlung"
                value={data.money.pastDue}
                icon={CreditCard}
                tone={data.money.pastDue > 0 ? "amber" : "muted"}
                hint={data.money.pastDue > 0 ? "past_due" : undefined}
              />
              <StatCard
                label="Kündigungen 30 T"
                value={data.money.canceled30d}
                icon={CreditCard}
                tone={data.money.canceled30d > 0 ? "rose" : "muted"}
              />
            </KpiRow>
          </section>

          {/* 3 — Menschen */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Menschen</h2>
            <KpiRow>
              <StatCard label="Nutzer gesamt" value={data.people.totalUsers} icon={UserPlus} tone="muted" />
              <StatCard label="Neu (24 h)" value={data.people.newUsers24h} icon={UserPlus} tone="primary" />
              <StatCard label="Neu (7 T)" value={data.people.newUsers7d} icon={UserPlus} tone="muted" />
              <StatCard label="Aktive Grows" value={data.people.activeGrows} icon={Sprout} tone="primary" />
              <StatCard
                label="Aktivierung 7 T"
                value={`${Math.round(data.people.activation7d * 100)} %`}
                icon={Percent}
                tone="muted"
                hint="neue Nutzer mit ≥1 Grow"
              />
            </KpiRow>
            <p className="text-xs text-muted-fg">
              {data.people.logEntries24h} Log-Einträge in den letzten 24 h
            </p>
          </section>

          {/* 4 — Über Nacht gelaufen */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">
                Über Nacht gelaufen
              </h2>
              <Link href="/dashboard/admin/ops" className="text-xs font-medium text-primary hover:underline">
                Engine &amp; Läufe →
              </Link>
            </div>
            <RunHistory runs={data.runs} />
          </section>

          {/* 5 — Content-Puls */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Content-Puls</h2>
              <Link href="/dashboard/admin/studies" className="text-xs font-medium text-primary hover:underline">
                Studien →
              </Link>
            </div>
            <KpiRow>
              <StatCard
                label="Review-Queue"
                value={data.content.pendingReview}
                icon={ClipboardCheck}
                tone={data.content.pendingReview > 0 ? "amber" : "muted"}
              />
              <StatCard label="Neue Studien 24 h" value={data.content.newStudies24h} icon={Microscope} tone="primary" />
              <StatCard label="Studien gesamt" value={data.content.totalStudies} icon={Microscope} tone="muted" />
              <StatCard label="Feedback 7 T" value={data.content.feedbackEvents7d} icon={MessageSquare} tone="muted" />
            </KpiRow>
          </section>
        </div>
      )}
    </AdminPage>
  );
}
