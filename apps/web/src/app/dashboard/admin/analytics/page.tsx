"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminApi } from "@/lib/adminApi";

type AnalyticsData = {
  topStudies: Array<{
    id: string;
    title: string;
    relevance_score: number;
    study_type: string | null;
    editorial_priority: string | null;
    origin_label: string | null;
    matched_topics: string[] | null;
  }>;
  scoreDistribution: Record<string, number>;
  topSources: Array<{ source: string; count: number }>;
  typeCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  totalFeedbackEvents: number;
};

function BarChart({ data, maxValue }: { data: Array<{ label: string; value: number }>; maxValue: number }) {
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-20 truncate text-right text-xs text-[#6b8577]">{d.label}</span>
          <div className="flex-1">
            <div className="h-5 rounded-full bg-[#eef3f0]">
              <div
                className="h-5 rounded-full bg-[#1f7a4f] transition-all"
                style={{ width: maxValue > 0 ? `${Math.max(2, (d.value / maxValue) * 100)}%` : "2%" }}
              />
            </div>
          </div>
          <span className="w-10 text-right text-xs font-mono font-semibold text-[#10281e]">{d.value}</span>
        </div>
      ))}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-[#d8e8dd] bg-[#f6faf7] px-4 py-3 text-center">
      <p className="text-2xl font-bold text-[#10281e]">{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">{label}</p>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const auth = useAdminAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    void (async () => {
      try {
        const result = await adminApi<AnalyticsData>(auth.session, "analytics");
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Fehler beim Laden");
      } finally {
        setLoading(false);
      }
    })();
  }, [auth]);

  if (auth.status !== "authenticated") return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#10281e]">Analytics</h1>
        <p className="mt-1 text-sm text-[#4d685a]">Studienperformance, Quellen und Engagement-Metriken.</p>
      </div>

      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#d8e8dd] bg-white p-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#1f7a4f] border-t-transparent" />
          <span className="text-sm text-[#4d685a]">Analytics werden geladen...</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {data && (
        <>
          {/* Overview Metrics */}
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Feedback Events" value={data.totalFeedbackEvents} />
            <MetricCard label="Study Types" value={Object.keys(data.typeCounts).length} />
            <MetricCard label="Quellen" value={data.topSources.length} />
            <MetricCard
              label="Ø Score"
              value={
                data.topStudies.length > 0
                  ? Math.round(data.topStudies.reduce((s, t) => s + t.relevance_score, 0) / data.topStudies.length)
                  : "—"
              }
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Score Distribution */}
            <div className="rounded-2xl border border-[#d8e8dd] bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">Score-Verteilung</h2>
              <BarChart
                data={Object.entries(data.scoreDistribution).map(([label, value]) => ({ label, value }))}
                maxValue={Math.max(...Object.values(data.scoreDistribution), 1)}
              />
            </div>

            {/* Top Sources */}
            <div className="rounded-2xl border border-[#d8e8dd] bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">Beste Quellen</h2>
              <BarChart
                data={data.topSources.slice(0, 10).map((s) => ({ label: s.source.length > 20 ? s.source.slice(0, 18) + "…" : s.source, value: s.count }))}
                maxValue={Math.max(...data.topSources.map((s) => s.count), 1)}
              />
            </div>

            {/* Study Types */}
            <div className="rounded-2xl border border-[#d8e8dd] bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">Studientypen</h2>
              <BarChart
                data={Object.entries(data.typeCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([label, value]) => ({ label, value }))}
                maxValue={Math.max(...Object.values(data.typeCounts), 1)}
              />
            </div>

            {/* Priority Distribution */}
            <div className="rounded-2xl border border-[#d8e8dd] bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">Prioritäts-Verteilung</h2>
              <div className="flex gap-4">
                {Object.entries(data.priorityCounts)
                  .sort(([a], [b]) => {
                    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
                    return (order[a] ?? 3) - (order[b] ?? 3);
                  })
                  .map(([prio, count]) => {
                    const colors: Record<string, string> = {
                      high: "border-emerald-200 bg-emerald-50 text-emerald-700",
                      medium: "border-blue-200 bg-blue-50 text-blue-700",
                      low: "border-slate-200 bg-slate-50 text-slate-600",
                    };
                    return (
                      <div key={prio} className={`flex-1 rounded-xl border px-4 py-3 text-center ${colors[prio] ?? colors.low}`}>
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-xs font-semibold uppercase">{prio}</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Top Performing Studies */}
          <div className="mt-6 rounded-2xl border border-[#d8e8dd] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.15em] text-[#8fa89a]">Top Studien nach Score</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#d8e8dd]">
                    <th className="pb-2 pr-4 font-semibold text-[#4d685a]">#</th>
                    <th className="pb-2 pr-4 font-semibold text-[#4d685a]">Titel</th>
                    <th className="pb-2 pr-4 font-semibold text-[#4d685a]">Score</th>
                    <th className="pb-2 pr-4 font-semibold text-[#4d685a]">Typ</th>
                    <th className="pb-2 pr-4 font-semibold text-[#4d685a]">Priorität</th>
                    <th className="pb-2 font-semibold text-[#4d685a]">Quelle</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topStudies.slice(0, 15).map((study, i) => (
                    <tr key={study.id} className="border-b border-[#eef3f0]">
                      <td className="py-2 pr-4 text-xs text-[#8fa89a]">{i + 1}</td>
                      <td className="max-w-xs truncate py-2 pr-4 font-medium text-[#10281e]" title={study.title}>{study.title}</td>
                      <td className="py-2 pr-4 font-mono font-semibold text-[#1f7a4f]">{study.relevance_score}</td>
                      <td className="py-2 pr-4 text-xs text-[#6b8577]">{study.study_type ?? "—"}</td>
                      <td className="py-2 pr-4">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          study.editorial_priority === "high" ? "bg-emerald-100 text-emerald-700"
                            : study.editorial_priority === "medium" ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {study.editorial_priority ?? "—"}
                        </span>
                      </td>
                      <td className="max-w-[150px] truncate py-2 text-xs text-[#6b8577]">{study.origin_label ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
