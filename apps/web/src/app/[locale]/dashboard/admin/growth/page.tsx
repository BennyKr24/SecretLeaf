"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminFetch } from "@/lib/admin/client";
import type { AdminGrowth } from "@/lib/admin/contracts";
import { AdminPage, AdminPageSkeleton } from "@/components/admin/AdminPage";
import { Alert } from "@/components/admin/Alert";
import { StatCard, KpiRow } from "@/components/admin/StatCard";
import { Sprout, TrendingUp, Zap } from "lucide-react";

function FunnelBar({ stage, max }: { stage: AdminGrowth["funnel"][number]; max: number }) {
  const widthPct = max > 0 ? Math.max((stage.users / max) * 100, stage.users > 0 ? 4 : 0) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-foreground">{stage.label}</span>
        <span className="text-muted-fg">
          <span className="font-semibold text-foreground">{stage.users}</span> · {stage.pctOfTotal}%
          {stage.pctOfPrevious != null && (
            <span className="ml-1 text-xs">(von voriger Stufe {stage.pctOfPrevious}%)</span>
          )}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${widthPct}%` }} />
      </div>
    </div>
  );
}

export default function AdminGrowthPage() {
  const auth = useAdminAuth();
  const [data, setData] = useState<AdminGrowth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (auth.status !== "authenticated") return;
    try {
      setData(await adminFetch<AdminGrowth>(auth.session, "growth"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  if (auth.status !== "authenticated") return null;

  const totalUsers = data?.funnel[0]?.users ?? 0;
  const proUsers = data?.funnel[data.funnel.length - 1]?.users ?? 0;

  return (
    <AdminPage title="Wachstum" icon={Sprout} description="Signup-Funnel und Free→Pro-Conversion">
      {loading && <AdminPageSkeleton rows={5} />}
      {error && (
        <Alert tone="error" title="Wachstum konnte nicht geladen werden">
          {error}
        </Alert>
      )}

      {data && (
        <div className="space-y-8">
          <section className="space-y-3">
            <KpiRow>
              <StatCard label="Registriert" value={totalUsers} icon={Sprout} tone="primary" />
              <StatCard
                label="Aktivierung"
                value={`${data.activationPct}%`}
                icon={Zap}
                tone="muted"
                hint="hat mindestens einen Log-Eintrag"
              />
              <StatCard label="Pro" value={proUsers} icon={TrendingUp} tone="primary" />
            </KpiRow>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Signup-Funnel</h2>
            <div className="space-y-4 rounded-xl border border-border bg-card p-4">
              {data.funnel.map((stage) => (
                <FunnelBar key={stage.key} stage={stage} max={totalUsers} />
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">
              Free→Pro-Conversion pro Monat
            </h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-card text-left text-xs text-muted-fg">
                    <th className="px-3 py-2 font-medium">Monat</th>
                    <th className="px-3 py-2 text-right font-medium">Neue Registrierungen</th>
                    <th className="px-3 py-2 text-right font-medium">Neue Pro</th>
                    <th className="px-3 py-2 text-right font-semibold">Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {data.months.map((m) => (
                    <tr key={m.month} className="border-b border-border last:border-0 bg-card">
                      <td className="px-3 py-2 font-medium text-foreground">{m.month}</td>
                      <td className="px-3 py-2 text-right text-muted-fg">{m.newSignups}</td>
                      <td className="px-3 py-2 text-right text-muted-fg">{m.newPro}</td>
                      <td className="px-3 py-2 text-right font-semibold text-foreground">{m.conversionPct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-fg">
              Zeigt, wie viele Nutzer aus einem Monat inzwischen Pro sind — kein strenges Kohorten-Modell
              (&bdquo;neue Pro&ldquo; zählt nach dem Monat, in dem das Abo begann, nicht nach dem Signup-Monat).
              Retention-Kohorten und Kündigungsgründe fehlen noch (keine Daten dafür vorhanden).
            </p>
          </section>
        </div>
      )}
    </AdminPage>
  );
}
