"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminFetch } from "@/lib/admin/client";
import type { AdminFinance } from "@/lib/admin/contracts";
import { AdminPage, AdminPageSkeleton } from "@/components/admin/AdminPage";
import { Alert } from "@/components/admin/Alert";
import { StatCard, KpiRow } from "@/components/admin/StatCard";
import { Card } from "@/components/ui/Card";
import { CTAButton } from "@/components/ui/CTAButton";
import { Euro, TrendingUp, Receipt, Flame, CreditCard, Bot, Webhook } from "lucide-react";

const euro = (cents: number) =>
  (cents / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const euro2 = (cents: number) =>
  (cents / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });

const SERVICE_LABEL: Record<string, string> = {
  anthropic: "Anthropic",
  vercel: "Vercel",
  supabase: "Supabase",
  brevo: "Brevo",
  loops: "Loops",
  domain: "Domain",
  stripe: "Stripe-Gebühren",
  other: "Sonstiges",
};
const label = (s: string) => SERVICE_LABEL[s] ?? s;

function relTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `vor ${h} h`;
  const d = Math.round(h / 24);
  return `vor ${d} T`;
}

const thisMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

function CostForm({ onSaved }: { onSaved: () => void }) {
  const auth = useAdminAuth();
  const [service, setService] = useState("vercel");
  const [month, setMonth] = useState(thisMonthKey());
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (auth.status !== "authenticated") return;
    const amountCents = Math.round(parseFloat(amount.replace(",", ".")) * 100);
    if (!Number.isFinite(amountCents) || amountCents < 0) {
      setMsg({ tone: "error", text: "Betrag ungültig" });
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      await adminFetch(auth.session, "finance", {
        json: { service, periodMonth: month, amountCents, note: note || undefined },
      });
      setMsg({ tone: "success", text: `${label(service)} · ${month} gespeichert.` });
      setAmount("");
      setNote("");
      onSaved();
    } catch (err) {
      setMsg({ tone: "error", text: err instanceof Error ? err.message : "Speichern fehlgeschlagen" });
    } finally {
      setBusy(false);
    }
  };

  const field = "rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none";

  return (
    <Card padding="sm" className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Kosten nachtragen</h3>
      <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs text-muted-fg">
          Dienst
          <select value={service} onChange={(e) => setService(e.target.value)} className={field}>
            {Object.keys(SERVICE_LABEL).filter((s) => s !== "anthropic").map((s) => (
              <option key={s} value={s}>{label(s)}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-fg">
          Monat
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={field} required />
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted-fg">
          Betrag (€)
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className={`${field} w-24`}
            required
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-xs text-muted-fg">
          Notiz
          <input value={note} onChange={(e) => setNote(e.target.value)} className={field} placeholder="optional" />
        </label>
        <CTAButton variant="primary" size="sm" type="submit" disabled={busy}>
          Speichern
        </CTAButton>
      </form>
      {msg && (
        <Alert tone={msg.tone} onDismiss={() => setMsg(null)}>
          {msg.text}
        </Alert>
      )}
    </Card>
  );
}

export default function AdminFinancePage() {
  const auth = useAdminAuth();
  const [data, setData] = useState<AdminFinance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (auth.status !== "authenticated") return;
    try {
      setData(await adminFetch<AdminFinance>(auth.session, "finance"));
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

  const services = data
    ? Array.from(new Set(data.costs.months.flatMap((m) => Object.keys(m.byService)))).sort()
    : [];

  return (
    <AdminPage title="Finanzen" icon={Euro} description="Umsatz, Kosten und Burn">
      {loading && <AdminPageSkeleton rows={5} />}
      {error && (
        <Alert tone="error" title="Finanzen konnten nicht geladen werden">
          {error}
        </Alert>
      )}

      {data && (
        <div className="space-y-8">
          {/* KPIs */}
          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Diesen Monat</h2>
              <span className="text-[11px] text-muted-fg">
                {data.revenue.stripeConnected
                  ? "Umsatz live aus Stripe"
                  : "Umsatz geschätzt aus Abo-Daten — Stripe nicht verbunden"}
              </span>
            </div>
            <KpiRow>
              <StatCard
                label={data.revenue.stripeConnected ? "Netto-Umsatz" : "MRR (geschätzt)"}
                value={euro(data.revenue.netMtdCents ?? data.revenue.estimatedMrrCents)}
                icon={Euro}
                tone="primary"
              />
              <StatCard
                label="Brutto-Umsatz"
                value={data.revenue.grossMtdCents != null ? euro(data.revenue.grossMtdCents) : "—"}
                icon={TrendingUp}
                tone="muted"
              />
              <StatCard
                label="Stripe-Gebühren"
                value={data.revenue.feesMtdCents != null ? euro2(data.revenue.feesMtdCents) : "—"}
                icon={Receipt}
                tone="muted"
              />
              <StatCard label="Kosten" value={euro(data.costs.currentMonthCents)} icon={Receipt} tone="amber" />
              <StatCard
                label="Burn"
                value={euro(data.burnMtdCents)}
                icon={Flame}
                tone={data.burnMtdCents > 0 ? "rose" : "primary"}
                hint={data.burnMtdCents > 0 ? "Kosten über Umsatz" : "Umsatz deckt Kosten"}
              />
            </KpiRow>
          </section>

          {/* Abos */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Abos</h2>
            <KpiRow>
              <StatCard label="Aktive Pro" value={data.revenue.activePro} icon={CreditCard} tone="primary" />
              <StatCard label="Im Trial" value={data.revenue.trialing} icon={CreditCard} tone="muted" />
              <StatCard
                label="Offene Zahlung"
                value={data.revenue.pastDue}
                icon={CreditCard}
                tone={data.revenue.pastDue > 0 ? "amber" : "muted"}
              />
              <StatCard
                label="Kündigungen 30 T"
                value={data.revenue.canceled30d}
                icon={CreditCard}
                tone={data.revenue.canceled30d > 0 ? "rose" : "muted"}
              />
            </KpiRow>
          </section>

          {/* Stripe-Health */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Stripe-Webhook</h2>
            <KpiRow>
              <StatCard
                label="Letztes Event"
                value={data.stripeHealth.lastEventAt ? relTime(data.stripeHealth.lastEventAt) : "—"}
                hint={data.stripeHealth.lastEventType ?? undefined}
                icon={Webhook}
                tone="muted"
              />
              <StatCard
                label="Unverarbeitet"
                value={data.stripeHealth.unprocessedCount}
                icon={Webhook}
                tone={data.stripeHealth.unprocessedCount > 0 ? "amber" : "primary"}
              />
              <StatCard
                label="Fehlerhaft (letzte 10)"
                value={data.stripeHealth.recentErrors.length}
                icon={Webhook}
                tone={data.stripeHealth.recentErrors.length > 0 ? "rose" : "primary"}
              />
            </KpiRow>
            {data.stripeHealth.recentErrors.length > 0 && (
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                {data.stripeHealth.recentErrors.map((e) => (
                  <li key={e.id} className="bg-card px-3 py-2.5 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground">{e.type}</span>
                      <span className="text-xs text-muted-fg">{relTime(e.receivedAt)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-rose-500" title={e.error}>
                      {e.error}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* AI-Verbrauch */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">
              KI-Verbrauch (automatisch erfasst)
            </h2>
            <Card padding="sm" className="flex items-center gap-3 text-sm">
              <Bot className="h-5 w-5 flex-shrink-0 text-primary" strokeWidth={2} />
              <span className="text-foreground">
                {data.costs.aiCallsMtd} Claude-Aufrufe diesen Monat ·{" "}
                <span className="font-semibold">{euro2(data.costs.aiUsageMtdCents)}</span> geschätzt
              </span>
            </Card>
          </section>

          {/* Kosten pro Monat */}
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Kosten pro Monat</h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-card text-left text-xs text-muted-fg">
                    <th className="px-3 py-2 font-medium">Monat</th>
                    {services.map((s) => (
                      <th key={s} className="px-3 py-2 text-right font-medium">{label(s)}</th>
                    ))}
                    <th className="px-3 py-2 text-right font-semibold">Summe</th>
                  </tr>
                </thead>
                <tbody>
                  {data.costs.months.map((m) => (
                    <tr key={m.month} className="border-b border-border last:border-0 bg-card">
                      <td className="px-3 py-2 font-medium text-foreground">{m.month}</td>
                      {services.map((s) => (
                        <td key={s} className="px-3 py-2 text-right text-muted-fg">
                          {m.byService[s] ? euro2(m.byService[s] as number) : "—"}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right font-semibold text-foreground">
                        {m.totalCents ? euro2(m.totalCents) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-fg">
              &bdquo;Anthropic&ldquo; wird automatisch aus den Claude-Aufrufen gerechnet. Alle anderen Dienste per Handeintrag —
              der automatische Sync (Vercel/Brevo) kommt in Phase 2.
            </p>
          </section>

          <CostForm onSaved={() => void load()} />
        </div>
      )}
    </AdminPage>
  );
}
