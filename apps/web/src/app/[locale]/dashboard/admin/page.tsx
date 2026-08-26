"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminApi } from "@/lib/adminApi";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { IconChip, type IconChipTone } from "@/components/ui/IconChip";
import { CTAButton } from "@/components/ui/CTAButton";
import {
  Settings, AlertTriangle, AlertCircle, Info, Inbox, Calendar, Microscope,
  Search, User, ShoppingCart, Store, ShieldCheck, Users, Dna,
  Bot, Ticket, type LucideIcon,
} from "lucide-react";

type OverviewData = {
  newToday: number;
  newThisWeek: number;
  totalStudies: number;
  pendingReview: number;
  pipelineStatus: "healthy" | "degraded" | "failing";
  lastRun: {
    success: boolean;
    finishedAt: string;
    errors: string | null;
    metadata: Record<string, unknown> | null;
  } | null;
  errorCount: number;
  consecutiveFailures: number;
};

type SystemStats = {
  usersByRole: Record<string, number>;
  totalAuthUsers: number;
  totalStudies: number;
  automationRunsLast24h: number;
  totalFeedbackEvents: number;
};

const STATUS_CONFIG = {
  healthy: { label: "Stabil", color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  degraded: { label: "Eingeschränkt", color: "bg-amber-500/15 text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
  failing: { label: "Fehlerhaft", color: "bg-rose-500/15 text-rose-700 dark:text-rose-400", dot: "bg-rose-500" },
} as const;

function StatCard({
  label,
  value,
  sub,
  accent,
  icon: Icon,
  style,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: IconChipTone;
  icon?: LucideIcon;
  style?: React.CSSProperties;
}) {
  return (
    <Card padding="md" className="tool-pop tool-card-lift" style={style}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-fg">{label}</p>
        {Icon && <IconChip icon={Icon} tone={accent ?? "muted"} size="sm" />}
      </div>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-fg">{sub}</p>}
    </Card>
  );
}

function stagger(idx: number): React.CSSProperties {
  return { animationDelay: `${Math.min(idx * 40, 320)}ms`, animationFillMode: "backwards" };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminOverviewPage() {
  const auth = useAdminAuth();
  const [data, setData] = useState<OverviewData | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    void (async () => {
      try {
        const [result, stats] = await Promise.all([
          adminApi<OverviewData>(auth.session, "overview"),
          adminApi<SystemStats>(auth.session, "system-stats"),
        ]);
        setData(result);
        setSystemStats(stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Fehler beim Laden");
      } finally {
        setLoading(false);
      }
    })();
  }, [auth]);

  // Greeting
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Guten Morgen";
    if (h < 18) return "Guten Tag";
    return "Guten Abend";
  }, []);

  const todayLabel = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (auth.status !== "authenticated") return null;

  const username = auth.session.user.username;

  return (
    <div>
      {/* Header */}
      <div className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-fg">{todayLabel}</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground">
            {greeting}, {username} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-fg">
            Hier ist dein aktueller Systemüberblick.
          </p>
        </div>
        <CTAButton variant="primary" href="/dashboard/admin/engine">
          <Settings className="h-4 w-4" strokeWidth={2} />
          Engine steuern
        </CTAButton>
      </div>

      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-fg">Daten werden geladen…</span>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
          {error}
        </div>
      )}

      {data && (
        <>
          {/* Alert Banner — only when something needs attention */}
          {(data.pipelineStatus !== "healthy" || data.pendingReview > 0 || data.consecutiveFailures > 0) && (
            <div className="mb-5 space-y-2">
              {data.pipelineStatus === "failing" && (
                <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
                  <span className="font-semibold">Pipeline fehlerhaft</span>
                  <span className="text-rose-500">—</span>
                  <span>{data.consecutiveFailures} Fehler in Folge. Bitte sofort prüfen.</span>
                  <Link href="/dashboard/admin/engine" className="ml-auto font-semibold underline hover:no-underline">
                    Zur Engine →
                  </Link>
                </div>
              )}
              {data.pipelineStatus === "degraded" && (
                <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
                  <span className="font-semibold">Pipeline eingeschränkt</span>
                  <span className="text-amber-500">—</span>
                  <span>{data.consecutiveFailures} Fehler in Folge. Bitte im Blick behalten.</span>
                  <Link href="/dashboard/admin/engine" className="ml-auto font-semibold underline hover:no-underline">
                    Details →
                  </Link>
                </div>
              )}
              {data.pendingReview > 0 && (
                <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
                  <Info className="h-4 w-4 flex-shrink-0" strokeWidth={2} />
                  <span><span className="font-semibold">{data.pendingReview} Studi{data.pendingReview === 1 ? "e" : "en"}</span> warten auf Prüfung.</span>
                  <Link href="/dashboard/admin/studies?filter=pending" className="ml-auto font-semibold underline hover:no-underline">
                    Jetzt prüfen →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Heute neu" value={data.newToday} icon={Inbox} accent="primary" style={stagger(0)} />
            <StatCard label="Diese Woche" value={data.newThisWeek} icon={Calendar} style={stagger(1)} />
            <StatCard label="Gesamt Studien" value={data.totalStudies} icon={Microscope} style={stagger(2)} />
            <StatCard
              label="Zu prüfen"
              value={data.pendingReview}
              icon={Search}
              accent={data.pendingReview > 0 ? "amber" : "muted"}
              sub={data.pendingReview > 0 ? "Manuelle Prüfung ausstehend" : "Alles geprüft"}
              style={stagger(3)}
            />
          </div>

          {/* Pipeline + Last Run */}
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {/* Pipeline Status */}
            <Card padding="md">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Pipeline Status</h2>
                <Link href="/dashboard/admin/engine" className="text-xs font-medium text-primary hover:underline">
                  Details →
                </Link>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <span className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${STATUS_CONFIG[data.pipelineStatus].color}`}>
                  <span className={`inline-block h-2 w-2 rounded-full ${STATUS_CONFIG[data.pipelineStatus].dot}`} />
                  {STATUS_CONFIG[data.pipelineStatus].label}
                </span>
                {data.consecutiveFailures > 0 && (
                  <Badge tone="rose">{data.consecutiveFailures}× Fehler</Badge>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-background p-3">
                  <p className="text-xs text-muted-fg">Fehler letzte 10 Runs</p>
                  <p className={`mt-0.5 text-xl font-bold ${data.errorCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-primary"}`}>
                    {data.errorCount}
                  </p>
                </div>
                <div className="rounded-xl bg-background p-3">
                  <p className="text-xs text-muted-fg">Automation Runs 24h</p>
                  <p className="mt-0.5 text-xl font-bold text-foreground">
                    {systemStats?.automationRunsLast24h ?? "—"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Last Run */}
            <Card padding="md">
              <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Letzter Pipeline-Durchlauf</h2>
              {data.lastRun ? (
                <div className="mt-3">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${data.lastRun.success ? "bg-emerald-500" : "bg-rose-500"}`} />
                    <span className="font-semibold text-foreground">
                      {data.lastRun.success ? "Erfolgreich" : "Fehlgeschlagen"}
                    </span>
                    <span className="ml-auto text-xs text-muted-fg">{formatDate(data.lastRun.finishedAt)}</span>
                  </div>
                  {data.lastRun.metadata && (
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      {typeof data.lastRun.metadata.accepted === "number" && (
                        <div className="rounded-xl bg-primary/10 px-2 py-2 text-center">
                          <p className="text-lg font-bold text-primary">{data.lastRun.metadata.accepted as number}</p>
                          <p className="text-primary/80">Angenommen</p>
                        </div>
                      )}
                      {typeof data.lastRun.metadata.rejected === "number" && (
                        <div className="rounded-xl bg-rose-500/10 px-2 py-2 text-center">
                          <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{data.lastRun.metadata.rejected as number}</p>
                          <p className="text-rose-500 dark:text-rose-400/80">Abgelehnt</p>
                        </div>
                      )}
                      {typeof data.lastRun.metadata.durationMs === "number" && (
                        <div className="rounded-xl bg-background px-2 py-2 text-center">
                          <p className="text-lg font-bold text-foreground">{Math.round((data.lastRun.metadata.durationMs as number) / 1000)}s</p>
                          <p className="text-muted-fg">Dauer</p>
                        </div>
                      )}
                    </div>
                  )}
                  {data.lastRun.errors && (
                    <p className="mt-3 flex items-start gap-1.5 rounded-xl bg-rose-500/10 px-3 py-2 text-xs text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} /> {data.lastRun.errors}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-fg">
                  <span>—</span>
                  <span>Noch kein Pipeline-Durchlauf aufgezeichnet.</span>
                </div>
              )}
            </Card>
          </div>

          {/* Users + Quick Actions */}
          {systemStats && (
            <>
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Benutzerübersicht</h2>
                  <Link href="/dashboard/admin/users" className="text-xs font-medium text-primary hover:underline">
                    Alle Benutzer →
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Registriert" value={systemStats.totalAuthUsers} icon={User} style={stagger(0)} />
                  <StatCard label="Consumer" value={systemStats.usersByRole.CONSUMER ?? 0} icon={ShoppingCart} accent="primary" style={stagger(1)} />
                  <StatCard label="Provider" value={systemStats.usersByRole.PROVIDER ?? 0} icon={Store} style={stagger(2)} />
                  <StatCard label="Admins" value={systemStats.usersByRole.ADMIN ?? 0} icon={ShieldCheck} style={stagger(3)} />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-5">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-muted-fg">Schnellzugriff</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {([
                    {
                      href: "/dashboard/admin/users" as const,
                      icon: Users,
                      title: "Benutzer",
                      sub: `${systemStats.totalAuthUsers} registriert`,
                    },
                    {
                      href: "/dashboard/admin/studies" as const,
                      icon: Microscope,
                      title: "Studien prüfen",
                      sub: data.pendingReview > 0 ? `${data.pendingReview} ausstehend` : "Alles aktuell",
                    },
                    {
                      href: "/dashboard/admin/engine" as const,
                      icon: Settings,
                      title: "Engine",
                      sub: `Status: ${STATUS_CONFIG[data.pipelineStatus].label}`,
                    },
                    {
                      href: "/dashboard/admin/algorithm" as const,
                      icon: Dna,
                      title: "Algorithmus",
                      sub: "Keywords & Filter konfigurieren",
                    },
                    {
                      href: "/dashboard/admin/assistant" as const,
                      icon: Bot,
                      title: "KI-Assistent",
                      sub: "Notizen & Content-Entwürfe (Claude)",
                    },
                    {
                      href: "/dashboard/admin/codes" as const,
                      icon: Ticket,
                      title: "Pro-Codes",
                      sub: "Zugangscodes generieren",
                    },
                  ]).map((item, idx) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={stagger(idx)}
                      className="tool-pop tool-card-lift group rounded-2xl border border-border bg-card p-4 shadow-sm active:scale-[0.98] transition-transform"
                    >
                      <item.icon className="h-6 w-6 text-primary" strokeWidth={2} />
                      <p className="mt-2 text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="mt-0.5 text-xs text-muted-fg">{item.sub}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
