"use client";

import { useEffect, useState, useCallback } from "react";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown";
import { AdminShell } from "@/components/admin/AdminShell";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminApi } from "@/lib/adminApi";

// ── Types ───────────────────────────────────────────────────────────────────

type RequiredKeyword = { term: string; enabled: boolean };
type PreferredSource = { name: string; quality: "high" | "mid"; enabled: boolean };
type BlockedSource = { name: string; pattern: string; reason: string };
type CustomExclusion = { pattern: string; reason: string; enabled: boolean };
type CustomCluster = {
  key: string;
  label: string;
  queries: string[];
  includePatterns: string[];
  enabled: boolean;
};
type CannabisAnchorTerm = { term: string; enabled: boolean; wordBoundary?: boolean };
type ScoringParams = {
  minAcceptScore: number;
  crossrefRowsPerQuery: number;
  fuzzyThreshold: number;
  weights: {
    topicFit: number;
    evidenceLevel: number;
    publisherQuality: number;
    freshness: number;
    editorialUtility: number;
  };
};

type EngineConfig = {
  required_keywords: { keywords: RequiredKeyword[] };
  preferred_sources: { sources: PreferredSource[] };
  blocked_sources: { sources: BlockedSource[] };
  custom_exclusions: { rules: CustomExclusion[] };
  topic_clusters: {
    overrides: Record<string, unknown>;
    customClusters: CustomCluster[];
  };
  scoring_params: ScoringParams;
  cannabis_anchor: { terms: CannabisAnchorTerm[] };
};

type Tab =
  | "keywords"
  | "sources"
  | "exclusions"
  | "clusters"
  | "scoring"
  | "anchor";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "keywords", label: "Pflicht-Keywords", icon: "🔑" },
  { key: "sources", label: "Quellen", icon: "📚" },
  { key: "exclusions", label: "Ausschlüsse", icon: "🚫" },
  { key: "clusters", label: "Topic-Cluster", icon: "🧬" },
  { key: "scoring", label: "Bewertung", icon: "⚖️" },
  { key: "anchor", label: "Cannabis-Anker", icon: "🌿" },
];

// ── Helper Components ───────────────────────────────────────────────────────

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        ok
          ? "bg-green-100 text-green-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {ok ? "● Aktiv" : "○ Deaktiviert"}
    </span>
  );
}

function SaveButton({
  saving,
  onClick,
  label = "Speichern",
}: {
  saving: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="rounded-xl bg-emerald-600 dark:bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
    >
      {saving ? "Wird gespeichert..." : label}
    </button>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-fg">{description}</p>
      )}
      <div className="mt-4">{children}</div>
    </div>
  );
}

// ── Setup Required Banner ───────────────────────────────────────────────────

function SetupRequired() {
  const [showSql, setShowSql] = useState(false);

  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
      <div className="flex items-start gap-3">
        <span className="text-3xl">⚠️</span>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-amber-900">
            Datenbank-Setup erforderlich
          </h3>
          <p className="mt-1 text-sm text-amber-800">
            Die Tabelle <code className="rounded bg-amber-100 px-1">engine_config</code>{" "}
            existiert noch nicht in Supabase. Die Algorithmus-Konfiguration nutzt
            derzeit die hardcoded Standardwerte.
          </p>
          <p className="mt-2 text-sm text-amber-800">
            Öffne das{" "}
            <strong>Supabase Dashboard → SQL Editor</strong> und führe die
            Migration aus:
          </p>
          <button
            onClick={() => setShowSql(!showSql)}
            className="mt-3 rounded-lg border border-amber-300 bg-card px-4 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-50"
          >
            {showSql ? "SQL ausblenden" : "Migration-SQL anzeigen"}
          </button>
          {showSql && (
            <div className="mt-3 max-h-64 overflow-auto rounded-lg bg-[#10281e] p-4">
              <pre className="text-xs text-green-300 whitespace-pre-wrap">
                {MIGRATION_SQL}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(MIGRATION_SQL);
                }}
                className="mt-2 rounded bg-green-700 px-3 py-1 text-xs text-white hover:bg-green-600"
              >
                📋 SQL kopieren
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const MIGRATION_SQL = `-- Engine Config Table
CREATE TABLE IF NOT EXISTS engine_config (
    id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    config_key   text UNIQUE NOT NULL,
    config_value jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at   timestamptz DEFAULT now() NOT NULL,
    updated_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_engine_config_key ON engine_config (config_key);

ALTER TABLE engine_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access" ON engine_config
    FOR ALL TO service_role USING (true) WITH CHECK (true);`;

// ── Main Page ───────────────────────────────────────────────────────────────

export default function AlgorithmPage() {
  const auth = useAdminAuth();
  const [activeTab, setActiveTab] = useState<Tab>("keywords");
  const [config, setConfig] = useState<EngineConfig | null>(null);
  const [fromDatabase, setFromDatabase] = useState(false);
  const [tableExists, setTableExists] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const showToast = useCallback(
    (type: "success" | "error", msg: string) => {
      setToast({ type, msg });
      setTimeout(() => setToast(null), 3000);
    },
    [],
  );

  // Load config
  useEffect(() => {
    if (auth.status !== "authenticated") return;
    const t = setTimeout(() => {
      setLoading(true);
      adminApi<{
        config: EngineConfig;
        fromDatabase: boolean;
        tableExists: boolean;
      }>(auth.session, "algorithm-get")
        .then((data) => {
          setConfig(data.config);
          setFromDatabase(data.fromDatabase);
          setTableExists(data.tableExists);
        })
        .catch((err) => showToast("error", err.message))
        .finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(t);
  }, [auth.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save a section
  const saveSection = useCallback(
    async (section: string, value: unknown) => {
      if (auth.status !== "authenticated") return;
      setSaving(true);
      try {
        await adminApi(auth.session, "algorithm-update", { section, value });
        showToast("success", "Gespeichert!");
      } catch (err: unknown) {
        showToast("error", (err as Error).message);
      } finally {
        setSaving(false);
      }
    },
    [auth, showToast],
  );

  // Reset a section
  const resetSection = useCallback(
    async (section: string) => {
      if (auth.status !== "authenticated") return;
      setSaving(true);
      try {
        await adminApi<{ reset: boolean }>(auth.session, "algorithm-reset", { section });
        // Reload config
        const data = await adminApi<{
          config: EngineConfig;
          fromDatabase: boolean;
          tableExists: boolean;
        }>(auth.session, "algorithm-get");
        setConfig(data.config);
        setFromDatabase(data.fromDatabase);
        showToast("success", "Zurückgesetzt!");
      } catch (err: unknown) {
        showToast("error", (err as Error).message);
      } finally {
        setSaving(false);
      }
    },
    [auth, showToast],
  );

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-fg">
              <span>Admin</span><span>/</span><span className="font-semibold text-muted-fg">Algorithmus</span>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-2xl">🧬</span>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Algorithmus-Konfiguration</h1>
                <p className="text-sm text-muted-fg">Keywords, Quellen, Ausschlüsse, Scoring-Parameter und mehr.</p>
              </div>
            </div>
          </div>
          <span
            className={`mt-1 rounded-full px-3 py-1 text-xs font-semibold ${
              fromDatabase
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {fromDatabase ? "● Aus Datenbank geladen" : "○ Standardwerte (hardcoded)"}
          </span>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${
              toast.type === "success"
                ? "border-green-300 bg-green-50 text-green-800"
                : "border-red-300 bg-red-50 text-red-800"
            }`}
          >
            {toast.msg}
          </div>
        )}

        {/* Setup Required */}
        {!tableExists && <SetupRequired />}

        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                activeTab === tab.key
                  ? "bg-emerald-600 dark:bg-emerald-500 text-white"
                  : "text-muted-fg hover:bg-background"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 dark:border-emerald-500 border-t-transparent" />
          </div>
        ) : config ? (
          <div>
            {activeTab === "keywords" && (
              <KeywordsTab
                config={config}
                setConfig={setConfig}
                save={saveSection}
                reset={resetSection}
                saving={saving}
              />
            )}
            {activeTab === "sources" && (
              <SourcesTab
                config={config}
                setConfig={setConfig}
                save={saveSection}
                reset={resetSection}
                saving={saving}
              />
            )}
            {activeTab === "exclusions" && (
              <ExclusionsTab
                config={config}
                setConfig={setConfig}
                save={saveSection}
                reset={resetSection}
                saving={saving}
              />
            )}
            {activeTab === "clusters" && (
              <ClustersTab
                config={config}
                setConfig={setConfig}
                save={saveSection}
                reset={resetSection}
                saving={saving}
              />
            )}
            {activeTab === "scoring" && (
              <ScoringTab
                config={config}
                setConfig={setConfig}
                save={saveSection}
                reset={resetSection}
                saving={saving}
              />
            )}
            {activeTab === "anchor" && (
              <AnchorTab
                config={config}
                setConfig={setConfig}
                save={saveSection}
                reset={resetSection}
                saving={saving}
              />
            )}
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}

// ── Tab Props ───────────────────────────────────────────────────────────────

type TabProps = {
  config: EngineConfig;
  setConfig: React.Dispatch<React.SetStateAction<EngineConfig | null>>;
  save: (section: string, value: unknown) => Promise<void>;
  reset: (section: string) => Promise<void>;
  saving: boolean;
};

// ── Keywords Tab ────────────────────────────────────────────────────────────

function KeywordsTab({ config, setConfig, save, reset, saving }: TabProps) {
  const [newTerm, setNewTerm] = useState("");

  const keywords = config.required_keywords.keywords;

  const toggleKeyword = (idx: number) => {
    const updated = keywords.map((kw, i) =>
      i === idx ? { ...kw, enabled: !kw.enabled } : kw,
    );
    setConfig((c) =>
      c ? { ...c, required_keywords: { keywords: updated } } : c,
    );
  };

  const removeKeyword = (idx: number) => {
    const updated = keywords.filter((_, i) => i !== idx);
    setConfig((c) =>
      c ? { ...c, required_keywords: { keywords: updated } } : c,
    );
  };

  const addKeyword = () => {
    const term = newTerm.trim().toLowerCase();
    if (!term || keywords.some((k) => k.term === term)) return;
    const updated = [...keywords, { term, enabled: true }];
    setConfig((c) =>
      c ? { ...c, required_keywords: { keywords: updated } } : c,
    );
    setNewTerm("");
  };

  return (
    <div className="space-y-4">
      <SectionCard
        title="Pflicht-Keywords"
        description="Studien müssen mindestens eines dieser Keywords enthalten, um in die Pipeline aufgenommen zu werden. Deaktivierte Keywords werden ignoriert."
      >
        <div className="space-y-2">
          {keywords.map((kw, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
            >
              <button
                onClick={() => toggleKeyword(idx)}
                className={`h-5 w-5 flex-shrink-0 rounded-md border text-xs font-bold transition ${
                  kw.enabled
                    ? "border-emerald-600 dark:border-emerald-500 bg-emerald-600 dark:bg-emerald-500 text-white"
                    : "border-border bg-card text-transparent"
                }`}
              >
                ✓
              </button>
              <code className="flex-1 text-sm text-foreground">{kw.term}</code>
              <StatusBadge ok={kw.enabled} />
              <button
                onClick={() => removeKeyword(idx)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add new */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addKeyword()}
            placeholder="Neues Keyword..."
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-fg focus:border-emerald-600 dark:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-[#1f7a4f]"
          />
          <button
            onClick={addKeyword}
            className="rounded-lg bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            + Hinzufügen
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <SaveButton
            saving={saving}
            onClick={() => save("required_keywords", config.required_keywords)}
          />
          <button
            onClick={() => reset("required_keywords")}
            className="rounded-xl border border-border px-4 py-2 text-sm text-muted-fg hover:bg-background"
          >
            Zurücksetzen
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Sources Tab ─────────────────────────────────────────────────────────────

function SourcesTab({ config, setConfig, save, reset, saving }: TabProps) {
  const [newSource, setNewSource] = useState("");
  const [newQuality, setNewQuality] = useState<"high" | "mid">("high");
  const [newBlocked, setNewBlocked] = useState({ name: "", pattern: "", reason: "" });

  const sources = config.preferred_sources.sources;
  const blocked = config.blocked_sources.sources;

  const toggleSource = (idx: number) => {
    const updated = sources.map((src, i) =>
      i === idx ? { ...src, enabled: !src.enabled } : src,
    );
    setConfig((c) =>
      c ? { ...c, preferred_sources: { sources: updated } } : c,
    );
  };

  const removeSource = (idx: number) => {
    const updated = sources.filter((_, i) => i !== idx);
    setConfig((c) =>
      c ? { ...c, preferred_sources: { sources: updated } } : c,
    );
  };

  const addSource = () => {
    const name = newSource.trim();
    if (!name || sources.some((s) => s.name.toLowerCase() === name.toLowerCase()))
      return;
    const updated = [...sources, { name, quality: newQuality, enabled: true }];
    setConfig((c) =>
      c ? { ...c, preferred_sources: { sources: updated } } : c,
    );
    setNewSource("");
  };

  const removeBlocked = (idx: number) => {
    const updated = blocked.filter((_, i) => i !== idx);
    setConfig((c) =>
      c ? { ...c, blocked_sources: { sources: updated } } : c,
    );
  };

  const addBlocked = () => {
    if (!newBlocked.name.trim()) return;
    const updated = [
      ...blocked,
      {
        name: newBlocked.name.trim(),
        pattern: newBlocked.pattern.trim() || newBlocked.name.trim().toLowerCase(),
        reason: newBlocked.reason.trim() || "blocked-by-admin",
      },
    ];
    setConfig((c) =>
      c ? { ...c, blocked_sources: { sources: updated } } : c,
    );
    setNewBlocked({ name: "", pattern: "", reason: "" });
  };

  return (
    <div className="space-y-6">
      {/* Preferred Sources */}
      <SectionCard
        title="Bevorzugte Quellen"
        description="Publisher die als 'high' oder 'mid' eingestuft werden, bekommen einen Scoring-Boost."
      >
        <div className="space-y-2">
          {sources.map((src, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
            >
              <button
                onClick={() => toggleSource(idx)}
                className={`h-5 w-5 flex-shrink-0 rounded-md border text-xs font-bold transition ${
                  src.enabled
                    ? "border-emerald-600 dark:border-emerald-500 bg-emerald-600 dark:bg-emerald-500 text-white"
                    : "border-border bg-card text-transparent"
                }`}
              >
                ✓
              </button>
              <span className="flex-1 text-sm font-medium text-foreground">
                {src.name}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  src.quality === "high"
                    ? "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400"
                    : "bg-border text-foreground/80"
                }`}
              >
                {src.quality.toUpperCase()}
              </span>
              <button
                onClick={() => removeSource(idx)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newSource}
            onChange={(e) => setNewSource(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSource()}
            placeholder="Publisher-Name..."
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-emerald-600 dark:border-emerald-500 focus:outline-none"
          />
          <Dropdown value={newQuality} onChange={(v) => setNewQuality(v as "high" | "mid")}>
            <DropdownOption value="high">High</DropdownOption>
            <DropdownOption value="mid">Mid</DropdownOption>
          </Dropdown>
          <button
            onClick={addSource}
            className="rounded-lg bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            +
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <SaveButton
            saving={saving}
            onClick={() => save("preferred_sources", config.preferred_sources)}
          />
          <button
            onClick={() => reset("preferred_sources")}
            className="rounded-xl border border-border px-4 py-2 text-sm text-muted-fg hover:bg-background"
          >
            Zurücksetzen
          </button>
        </div>
      </SectionCard>

      {/* Blocked Sources */}
      <SectionCard
        title="Blockierte Quellen"
        description="Studien von diesen Publishern werden automatisch abgelehnt."
      >
        {blocked.length === 0 && (
          <p className="text-sm italic text-muted-fg">
            Keine blockierten Quellen konfiguriert.
          </p>
        )}
        <div className="space-y-2">
          {blocked.map((b, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2"
            >
              <span className="text-red-500">🚫</span>
              <span className="flex-1 text-sm font-medium text-red-800">
                {b.name}
              </span>
              <code className="text-xs text-red-600">{b.pattern}</code>
              <button
                onClick={() => removeBlocked(idx)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <input
            type="text"
            value={newBlocked.name}
            onChange={(e) =>
              setNewBlocked((b) => ({ ...b, name: e.target.value }))
            }
            placeholder="Name..."
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-emerald-600 dark:border-emerald-500 focus:outline-none"
          />
          <input
            type="text"
            value={newBlocked.pattern}
            onChange={(e) =>
              setNewBlocked((b) => ({ ...b, pattern: e.target.value }))
            }
            placeholder="Pattern (regex)..."
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-emerald-600 dark:border-emerald-500 focus:outline-none"
          />
          <button
            onClick={addBlocked}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            + Blockieren
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <SaveButton
            saving={saving}
            onClick={() => save("blocked_sources", config.blocked_sources)}
          />
        </div>
      </SectionCard>
    </div>
  );
}

// ── Exclusions Tab ──────────────────────────────────────────────────────────

function ExclusionsTab({ config, setConfig, save, reset, saving }: TabProps) {
  const [newExclusion, setNewExclusion] = useState({
    pattern: "",
    reason: "",
  });

  const rules = config.custom_exclusions.rules;

  // Hardcoded exclusions (read-only display)
  const hardcoded = [
    { pattern: "corrigendum|erratum", reason: "erratum-corrigendum" },
    { pattern: "canine|dog|dogs|feline|cat|cats", reason: "non-human-veterinary" },
    { pattern: "laying hens|broiler|poultry|hens|hen", reason: "poultry-feed" },
    { pattern: "marine organism|marine pollution|aquatic|fish|shrimp", reason: "marine-topic" },
    { pattern: "hempseed meal|egg quality|dairy cow|ruminant", reason: "agriculture-feed" },
    { pattern: "industrial hemp breeding lines", reason: "industrial-hemp-low-fit" },
    { pattern: "nigella sativa", reason: "non-cannabis-sativa" },
  ];

  const toggleRule = (idx: number) => {
    const updated = rules.map((rule, i) =>
      i === idx ? { ...rule, enabled: !rule.enabled } : rule,
    );
    setConfig((c) =>
      c ? { ...c, custom_exclusions: { rules: updated } } : c,
    );
  };

  const removeRule = (idx: number) => {
    const updated = rules.filter((_, i) => i !== idx);
    setConfig((c) =>
      c ? { ...c, custom_exclusions: { rules: updated } } : c,
    );
  };

  const addRule = () => {
    if (!newExclusion.pattern.trim()) return;
    const updated = [
      ...rules,
      {
        pattern: newExclusion.pattern.trim(),
        reason: newExclusion.reason.trim() || "custom-exclusion",
        enabled: true,
      },
    ];
    setConfig((c) =>
      c ? { ...c, custom_exclusions: { rules: updated } } : c,
    );
    setNewExclusion({ pattern: "", reason: "" });
  };

  return (
    <div className="space-y-6">
      {/* Hardcoded Exclusions (Read-only) */}
      <SectionCard
        title="System-Ausschlüsse (fest)"
        description="Diese Regeln sind im Code hartcodiert und können nicht geändert werden."
      >
        <div className="space-y-1.5">
          {hardcoded.map((rule, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-lg bg-background px-3 py-2"
            >
              <span className="text-xs text-muted-fg">🔒</span>
              <code className="flex-1 text-xs text-foreground">
                {rule.pattern}
              </code>
              <span className="rounded-full bg-border px-2 py-0.5 text-[10px] text-muted-fg">
                {rule.reason}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Custom Exclusions */}
      <SectionCard
        title="Eigene Ausschlussregeln"
        description="Regex-Muster die auf Titel + Abstract geprüft werden. Treffer werden sofort abgelehnt."
      >
        {rules.length === 0 && (
          <p className="text-sm italic text-muted-fg">
            Keine eigenen Regeln definiert.
          </p>
        )}
        <div className="space-y-2">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
            >
              <button
                onClick={() => toggleRule(idx)}
                className={`h-5 w-5 flex-shrink-0 rounded-md border text-xs font-bold transition ${
                  rule.enabled
                    ? "border-emerald-600 dark:border-emerald-500 bg-emerald-600 dark:bg-emerald-500 text-white"
                    : "border-border bg-card text-transparent"
                }`}
              >
                ✓
              </button>
              <code className="flex-1 text-sm text-foreground">
                {rule.pattern}
              </code>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">
                {rule.reason}
              </span>
              <button
                onClick={() => removeRule(idx)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <input
            type="text"
            value={newExclusion.pattern}
            onChange={(e) =>
              setNewExclusion((ex) => ({ ...ex, pattern: e.target.value }))
            }
            placeholder="Regex-Pattern (z.B. aquaculture|fish farm)"
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-emerald-600 dark:border-emerald-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={newExclusion.reason}
              onChange={(e) =>
                setNewExclusion((ex) => ({ ...ex, reason: e.target.value }))
              }
              placeholder="Grund (z.B. off-topic)"
              className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-emerald-600 dark:border-emerald-500 focus:outline-none"
            />
            <button
              onClick={addRule}
              className="rounded-lg bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <SaveButton
            saving={saving}
            onClick={() =>
              save("custom_exclusions", config.custom_exclusions)
            }
          />
          <button
            onClick={() => reset("custom_exclusions")}
            className="rounded-xl border border-border px-4 py-2 text-sm text-muted-fg hover:bg-background"
          >
            Zurücksetzen
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Clusters Tab ────────────────────────────────────────────────────────────

function ClustersTab({ config, setConfig, save, reset, saving }: TabProps) {
  const [newCluster, setNewCluster] = useState({
    key: "",
    label: "",
    queries: "",
    includePatterns: "",
  });

  // Hardcoded clusters (read-only display). Kept in sync with
  // apps/web/src/lib/engine/config.ts TOPIC_CLUSTERS — medizin-evidenz,
  // pharmakologie and markt-regulierung were dropped, they don't match
  // SecretLeaf's grow-focused Wissenssystem scope.
  const hardcoded = [
    {
      key: "qualitaet-labor",
      label: "Qualität & Labor",
      queries: ["cannabis laboratory", "cannabis contaminants", "cannabis heavy metals", "cannabis pesticides"],
    },
    {
      key: "anbau-postharvest",
      label: "Anbau & Post-Harvest",
      queries: ["cannabis cultivation thc cbd terpene profile", "cannabis curing drying storage", "cannabis postharvest terpene retention", "cannabis greenhouse indoor environmental control"],
    },
  ];

  const customClusters = config.topic_clusters.customClusters;

  const toggleCluster = (idx: number) => {
    const updated = customClusters.map((cl, i) =>
      i === idx ? { ...cl, enabled: !cl.enabled } : cl,
    );
    setConfig((c) =>
      c
        ? {
            ...c,
            topic_clusters: { ...c.topic_clusters, customClusters: updated },
          }
        : c,
    );
  };

  const removeCluster = (idx: number) => {
    const updated = customClusters.filter((_, i) => i !== idx);
    setConfig((c) =>
      c
        ? {
            ...c,
            topic_clusters: { ...c.topic_clusters, customClusters: updated },
          }
        : c,
    );
  };

  const addCluster = () => {
    if (!newCluster.key.trim() || !newCluster.label.trim()) return;
    const updated = [
      ...customClusters,
      {
        key: newCluster.key.trim().toLowerCase().replace(/\s+/g, "-"),
        label: newCluster.label.trim(),
        queries: newCluster.queries
          .split("\n")
          .map((q) => q.trim())
          .filter(Boolean),
        includePatterns: newCluster.includePatterns
          .split("\n")
          .map((p) => p.trim())
          .filter(Boolean),
        enabled: true,
      },
    ];
    setConfig((c) =>
      c
        ? {
            ...c,
            topic_clusters: { ...c.topic_clusters, customClusters: updated },
          }
        : c,
    );
    setNewCluster({ key: "", label: "", queries: "", includePatterns: "" });
  };

  return (
    <div className="space-y-6">
      {/* Hardcoded Clusters */}
      <SectionCard
        title="System-Cluster (fest)"
        description="Die 5 Basis-Cluster für die Crossref-Suche. Können nicht deaktiviert werden."
      >
        <div className="space-y-3">
          {hardcoded.map((c) => (
            <div
              key={c.key}
              className="rounded-lg border border-border bg-background p-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs">🔒</span>
                <span className="font-semibold text-sm text-foreground">
                  {c.label}
                </span>
                <code className="rounded bg-border px-1.5 py-0.5 text-[10px] text-muted-fg">
                  {c.key}
                </code>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {c.queries.map((q, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-card px-2 py-0.5 text-[11px] text-muted-fg border border-border"
                  >
                    {q}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Custom Clusters */}
      <SectionCard
        title="Eigene Topic-Cluster"
        description="Erstelle eigene Cluster mit Suchbegriffen und Matching-Patterns. Diese werden zusätzlich zu den System-Clustern verwendet."
      >
        {customClusters.length === 0 && (
          <p className="text-sm italic text-muted-fg">
            Keine eigenen Cluster definiert.
          </p>
        )}
        <div className="space-y-3">
          {customClusters.map((cluster, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-border bg-background p-3"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleCluster(idx)}
                  className={`h-5 w-5 flex-shrink-0 rounded-md border text-xs font-bold transition ${
                    cluster.enabled
                      ? "border-emerald-600 dark:border-emerald-500 bg-emerald-600 dark:bg-emerald-500 text-white"
                      : "border-border bg-card text-transparent"
                  }`}
                >
                  ✓
                </button>
                <span className="font-semibold text-sm text-foreground">
                  {cluster.label}
                </span>
                <code className="rounded bg-border px-1.5 py-0.5 text-[10px] text-muted-fg">
                  {cluster.key}
                </code>
                <StatusBadge ok={cluster.enabled} />
                <button
                  onClick={() => removeCluster(idx)}
                  className="ml-auto text-xs text-red-400 hover:text-red-600"
                >
                  ✕ Entfernen
                </button>
              </div>
              <div className="mt-2">
                <span className="text-[10px] font-semibold uppercase text-muted-fg">
                  Queries:
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {cluster.queries.map((q, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-card px-2 py-0.5 text-[11px] text-muted-fg border border-border"
                    >
                      {q}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-2">
                <span className="text-[10px] font-semibold uppercase text-muted-fg">
                  Include-Patterns:
                </span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {cluster.includePatterns.map((p, i) => (
                    <code
                      key={i}
                      className="rounded bg-card px-1.5 py-0.5 text-[10px] text-foreground border border-border"
                    >
                      {p}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add new cluster */}
        <div className="mt-4 rounded-lg border border-dashed border-border p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">
            Neuen Cluster erstellen
          </p>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={newCluster.key}
              onChange={(e) =>
                setNewCluster((c) => ({ ...c, key: e.target.value }))
              }
              placeholder="Cluster-Key (z.B. genetik)"
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-emerald-600 dark:border-emerald-500 focus:outline-none"
            />
            <input
              type="text"
              value={newCluster.label}
              onChange={(e) =>
                setNewCluster((c) => ({ ...c, label: e.target.value }))
              }
              placeholder="Anzeige-Name (z.B. Genetik & Züchtung)"
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-emerald-600 dark:border-emerald-500 focus:outline-none"
            />
            <textarea
              value={newCluster.queries}
              onChange={(e) =>
                setNewCluster((c) => ({ ...c, queries: e.target.value }))
              }
              placeholder={"Suchbegriffe (einer pro Zeile)\nz.B. cannabis genetics\ncannabis breeding"}
              rows={3}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-emerald-600 dark:border-emerald-500 focus:outline-none"
            />
            <textarea
              value={newCluster.includePatterns}
              onChange={(e) =>
                setNewCluster((c) => ({
                  ...c,
                  includePatterns: e.target.value,
                }))
              }
              placeholder={"Include-Patterns (einer pro Zeile)\nz.B. genetic\nbreeding\ngenome"}
              rows={3}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-emerald-600 dark:border-emerald-500 focus:outline-none"
            />
          </div>
          <button
            onClick={addCluster}
            className="mt-3 rounded-lg bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            + Cluster erstellen
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <SaveButton
            saving={saving}
            onClick={() => save("topic_clusters", config.topic_clusters)}
          />
          <button
            onClick={() => reset("topic_clusters")}
            className="rounded-xl border border-border px-4 py-2 text-sm text-muted-fg hover:bg-background"
          >
            Zurücksetzen
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Scoring Tab ─────────────────────────────────────────────────────────────

function ScoringTab({ config, setConfig, save, reset, saving }: TabProps) {
  const sp = config.scoring_params;

  const updateParam = (key: keyof ScoringParams, value: number) => {
    setConfig((c) =>
      c
        ? {
            ...c,
            scoring_params: { ...c.scoring_params, [key]: value },
          }
        : c,
    );
  };

  const updateWeight = (key: string, value: number) => {
    setConfig((c) =>
      c
        ? {
            ...c,
            scoring_params: {
              ...c.scoring_params,
              weights: { ...c.scoring_params.weights, [key]: value },
            },
          }
        : c,
    );
  };

  const totalWeight = Object.values(sp.weights).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <SectionCard
        title="Pipeline-Parameter"
        description="Grundeinstellungen für die Studien-Pipeline."
      >
        <div className="grid grid-cols-3 gap-4">
          {/* Min Accept Score */}
          <div>
            <label className="text-xs font-semibold uppercase text-muted-fg">
              Min. Accept Score
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                value={sp.minAcceptScore}
                onChange={(e) =>
                  updateParam("minAcceptScore", Number(e.target.value))
                }
                className="flex-1 accent-[#1f7a4f]"
              />
              <span className="w-10 text-right text-sm font-bold text-foreground">
                {sp.minAcceptScore}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-muted-fg">
              Studien unter diesem Score werden abgelehnt
            </p>
          </div>

          {/* Crossref Rows */}
          <div>
            <label className="text-xs font-semibold uppercase text-muted-fg">
              Crossref Rows/Query
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="range"
                min={10}
                max={200}
                step={10}
                value={sp.crossrefRowsPerQuery}
                onChange={(e) =>
                  updateParam("crossrefRowsPerQuery", Number(e.target.value))
                }
                className="flex-1 accent-[#1f7a4f]"
              />
              <span className="w-10 text-right text-sm font-bold text-foreground">
                {sp.crossrefRowsPerQuery}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-muted-fg">
              Ergebnisse pro Crossref-Suche
            </p>
          </div>

          {/* Fuzzy Threshold */}
          <div>
            <label className="text-xs font-semibold uppercase text-muted-fg">
              Fuzzy Dedup Threshold
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="range"
                min={50}
                max={100}
                value={Math.round(sp.fuzzyThreshold * 100)}
                onChange={(e) =>
                  updateParam("fuzzyThreshold", Number(e.target.value) / 100)
                }
                className="flex-1 accent-[#1f7a4f]"
              />
              <span className="w-10 text-right text-sm font-bold text-foreground">
                {Math.round(sp.fuzzyThreshold * 100)}%
              </span>
            </div>
            <p className="mt-0.5 text-[10px] text-muted-fg">
              Ähnlichkeit ab der Duplikat erkannt wird
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Score-Gewichtung"
        description={`Die 5 Scoring-Faktoren und ihre Gewichtung. Summe: ${(totalWeight * 100).toFixed(0)}% ${Math.abs(totalWeight - 1) > 0.01 ? "(⚠️ sollte 100% sein!)" : "✓"}`}
      >
        <div className="space-y-4">
          {(
            [
              { key: "topicFit", label: "Topic Fit", desc: "Themen-Relevanz" },
              { key: "evidenceLevel", label: "Evidenz-Level", desc: "Studientyp-Wertung" },
              { key: "publisherQuality", label: "Publisher-Qualität", desc: "Journal-Ranking" },
              { key: "freshness", label: "Aktualität", desc: "Publikationsjahr" },
              { key: "editorialUtility", label: "Editorial Utility", desc: "Redaktioneller Nutzen" },
            ] as const
          ).map(({ key, label, desc }) => (
            <div key={key}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-foreground">
                    {label}
                  </span>
                  <span className="ml-2 text-xs text-muted-fg">{desc}</span>
                </div>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {Math.round(sp.weights[key] * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(sp.weights[key] * 100)}
                onChange={(e) =>
                  updateWeight(key, Number(e.target.value) / 100)
                }
                className="mt-1 w-full accent-[#1f7a4f]"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <SaveButton
            saving={saving}
            onClick={() => save("scoring_params", config.scoring_params)}
          />
          <button
            onClick={() => reset("scoring_params")}
            className="rounded-xl border border-border px-4 py-2 text-sm text-muted-fg hover:bg-background"
          >
            Zurücksetzen
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Anchor Tab ──────────────────────────────────────────────────────────────

function AnchorTab({ config, setConfig, save, reset, saving }: TabProps) {
  const [newTerm, setNewTerm] = useState("");
  const [newWordBoundary, setNewWordBoundary] = useState(false);

  const terms = config.cannabis_anchor.terms;

  const toggleTerm = (idx: number) => {
    const updated = terms.map((t, i) =>
      i === idx ? { ...t, enabled: !t.enabled } : t,
    );
    setConfig((c) =>
      c ? { ...c, cannabis_anchor: { terms: updated } } : c,
    );
  };

  const toggleWordBoundary = (idx: number) => {
    const updated = terms.map((t, i) =>
      i === idx ? { ...t, wordBoundary: !t.wordBoundary } : t,
    );
    setConfig((c) =>
      c ? { ...c, cannabis_anchor: { terms: updated } } : c,
    );
  };

  const removeTerm = (idx: number) => {
    const updated = terms.filter((_, i) => i !== idx);
    setConfig((c) =>
      c ? { ...c, cannabis_anchor: { terms: updated } } : c,
    );
  };

  const addTerm = () => {
    const term = newTerm.trim().toLowerCase();
    if (!term || terms.some((t) => t.term === term)) return;
    const updated = [
      ...terms,
      { term, enabled: true, wordBoundary: newWordBoundary },
    ];
    setConfig((c) =>
      c ? { ...c, cannabis_anchor: { terms: updated } } : c,
    );
    setNewTerm("");
    setNewWordBoundary(false);
  };

  // Build preview regex
  const enabledTerms = terms.filter((t) => t.enabled);
  const regexPreview = enabledTerms
    .map((t) => {
      const escaped = t.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return t.wordBoundary ? `\\b${escaped}\\b` : escaped;
    })
    .join("|");

  return (
    <div className="space-y-6">
      <SectionCard
        title="Cannabis-Anker Begriffe"
        description="Studien müssen mindestens einen dieser Begriffe im Titel oder Abstract enthalten, um als Cannabis-relevant zu gelten."
      >
        <div className="space-y-2">
          {terms.map((term, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
            >
              <button
                onClick={() => toggleTerm(idx)}
                className={`h-5 w-5 flex-shrink-0 rounded-md border text-xs font-bold transition ${
                  term.enabled
                    ? "border-emerald-600 dark:border-emerald-500 bg-emerald-600 dark:bg-emerald-500 text-white"
                    : "border-border bg-card text-transparent"
                }`}
              >
                ✓
              </button>
              <code className="flex-1 text-sm text-foreground">
                {term.term}
              </code>
              <button
                onClick={() => toggleWordBoundary(idx)}
                title="Word Boundary (\\b)"
                className={`rounded-md border px-2 py-0.5 text-[10px] font-mono transition ${
                  term.wordBoundary
                    ? "border-blue-300 bg-blue-100 text-blue-700"
                    : "border-border bg-card text-muted-fg"
                }`}
              >
                \\b
              </button>
              <StatusBadge ok={term.enabled} />
              <button
                onClick={() => removeTerm(idx)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add new */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTerm()}
            placeholder="Neuer Anker-Begriff..."
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-emerald-600 dark:border-emerald-500 focus:outline-none"
          />
          <label className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={newWordBoundary}
              onChange={(e) => setNewWordBoundary(e.target.checked)}
              className="accent-[#1f7a4f]"
            />
            <span className="text-xs text-muted-fg">\\b</span>
          </label>
          <button
            onClick={addTerm}
            className="rounded-lg bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            + Hinzufügen
          </button>
        </div>

        {/* Regex Preview */}
        <div className="mt-4 rounded-lg bg-[#10281e] p-3">
          <p className="text-[10px] font-semibold uppercase text-green-400">
            Regex-Vorschau (Live)
          </p>
          <code className="mt-1 block text-xs text-green-300 break-all">
            /{regexPreview || "..."}/i
          </code>
        </div>

        <div className="mt-4 flex gap-2">
          <SaveButton
            saving={saving}
            onClick={() => save("cannabis_anchor", config.cannabis_anchor)}
          />
          <button
            onClick={() => reset("cannabis_anchor")}
            className="rounded-xl border border-border px-4 py-2 text-sm text-muted-fg hover:bg-background"
          >
            Zurücksetzen
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
