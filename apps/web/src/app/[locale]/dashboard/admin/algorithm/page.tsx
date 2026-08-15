"use client";

import { useEffect, useState, useCallback } from "react";
import { Dropdown, DropdownOption } from "@/components/ui/Dropdown";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CTAButton } from "@/components/ui/CTAButton";
import { useAdminAuth } from "@/lib/useAdminAuth";
import { adminApi } from "@/lib/adminApi";
import { TOPIC_CLUSTERS, HARD_EXCLUSIONS } from "@/lib/engine/config";
import {
  Key, BookOpen, Ban, Dna, Scale, Leaf, AlertTriangle, Clipboard,
  Check, X, Lock, CheckCircle2, Sparkles, History, type LucideIcon,
} from "lucide-react";

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

const TABS: { key: Tab; label: string; icon: LucideIcon }[] = [
  { key: "keywords", label: "Pflicht-Keywords", icon: Key },
  { key: "sources", label: "Quellen", icon: BookOpen },
  { key: "exclusions", label: "Ausschlüsse", icon: Ban },
  { key: "clusters", label: "Topic-Cluster", icon: Dna },
  { key: "scoring", label: "Bewertung", icon: Scale },
  { key: "anchor", label: "Cannabis-Anker", icon: Leaf },
];

// Display labels for the hardcoded TOPIC_CLUSTERS (config.ts only carries
// key/queries/include, no display label) — falls back to a title-cased key
// for anything not explicitly mapped, so a future cluster can't render blank.
const CLUSTER_LABELS: Record<string, string> = {
  "qualitaet-labor": "Qualität & Labor",
  "anbau-postharvest": "Anbau & Post-Harvest",
};

function clusterLabel(key: string): string {
  return CLUSTER_LABELS[key] ?? key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Stagger helper: entrance delay capped so long lists don't crawl in.
function staggerStyle(idx: number): React.CSSProperties {
  return { animationDelay: `${Math.min(idx * 40, 320)}ms`, animationFillMode: "backwards" };
}

const FIELD_CLASS =
  "rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-fg focus:border-primary focus:outline-none focus:ring-1 focus:ring-[var(--ring)]";

// ── Helper Components ───────────────────────────────────────────────────────

function StatusBadge({ ok }: { ok: boolean }) {
  return <Badge tone={ok ? "primary" : "muted"}>{ok ? "Aktiv" : "Inaktiv"}</Badge>;
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
    <CTAButton variant="primary" onClick={onClick} disabled={saving}>
      {saving ? "Wird gespeichert..." : label}
    </CTAButton>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card padding="lg">
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-fg">{description}</p>
      )}
      <div className="mt-4">{children}</div>
    </Card>
  );
}

// Fades/scales the active tab's content in on every switch — materialize,
// not a plain cut (apple-design §12), reuses the app's existing .tool-pop
// entrance rather than inventing a new one.
function TabContent({ tabKey, children }: { tabKey: string; children: React.ReactNode }) {
  return (
    <div key={tabKey} className="tool-pop">
      {children}
    </div>
  );
}

// ── Setup Required Banner ───────────────────────────────────────────────────

function SetupRequired() {
  const [showSql, setShowSql] = useState(false);

  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6 dark:border-amber-900/40 dark:bg-amber-950/30">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-8 w-8 flex-shrink-0 text-amber-500" strokeWidth={2} />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200">
            Datenbank-Setup erforderlich
          </h3>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
            Die Tabelle <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">engine_config</code>{" "}
            existiert noch nicht in Supabase. Die Algorithmus-Konfiguration nutzt
            derzeit die hardcoded Standardwerte.
          </p>
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-300">
            Öffne das{" "}
            <strong>Supabase Dashboard → SQL Editor</strong> und führe die
            Migration aus:
          </p>
          <button
            onClick={() => setShowSql(!showSql)}
            className="mt-3 rounded-lg border border-amber-300 bg-card px-4 py-1.5 text-sm font-medium text-amber-900 transition-transform duration-150 active:scale-[0.97] hover:bg-amber-50 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-950/50"
          >
            {showSql ? "SQL ausblenden" : "Migration-SQL anzeigen"}
          </button>
          {showSql && (
            <div className="mt-3 max-h-64 overflow-auto rounded-lg bg-[var(--primary-deep)] p-4">
              <pre className="text-xs text-primary whitespace-pre-wrap">
                {MIGRATION_SQL}
              </pre>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(MIGRATION_SQL);
                }}
                className="mt-2 flex items-center gap-1.5 rounded bg-primary px-3 py-1 text-xs text-white transition-transform duration-150 active:scale-[0.97] hover:bg-[var(--primary-dark)]"
              >
                <Clipboard className="h-3.5 w-3.5" strokeWidth={2} /> SQL kopieren
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-fg">
            <span>Admin</span><span>/</span><span className="font-semibold text-muted-fg">Algorithmus</span>
          </div>
          <div className="mt-1 flex items-center gap-3">
            <Dna className="h-6 w-6 text-primary" strokeWidth={2} />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Algorithmus-Konfiguration</h1>
              <p className="text-sm text-muted-fg">Keywords, Quellen, Ausschlüsse, Scoring-Parameter und mehr.</p>
            </div>
          </div>
        </div>
        <Badge tone={fromDatabase ? "primary" : "amber"} className="mt-1">
          {fromDatabase ? "Aus Datenbank geladen" : "Standardwerte (hardcoded)"}
        </Badge>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`tool-pop rounded-xl border px-4 py-2.5 text-sm font-medium ${
            toast.type === "success"
              ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
              : "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"
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
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition active:scale-[0.97] ${
              activeTab === tab.key
                ? "bg-primary text-white"
                : "text-muted-fg hover:bg-background"
            }`}
          >
            <tab.icon className="h-4 w-4" strokeWidth={2} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : config ? (
        <TabContent tabKey={activeTab}>
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
        </TabContent>
      ) : null}
    </div>
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
              style={staggerStyle(idx)}
              className="tool-pop flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
            >
              <button
                onClick={() => toggleKeyword(idx)}
                className={`h-5 w-5 flex-shrink-0 rounded-md border text-xs font-bold transition active:scale-90 ${
                  kw.enabled
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-card text-transparent"
                }`}
              >
                {kw.enabled && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
              </button>
              <code className="flex-1 text-sm text-foreground">{kw.term}</code>
              <StatusBadge ok={kw.enabled} />
              <button
                onClick={() => removeKeyword(idx)}
                className="text-xs text-rose-400 transition-transform duration-150 active:scale-90 hover:text-rose-600 dark:hover:text-rose-300"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
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
            className={`flex-1 ${FIELD_CLASS}`}
          />
          <CTAButton variant="primary" onClick={addKeyword}>+ Hinzufügen</CTAButton>
        </div>

        <div className="mt-4 flex gap-2">
          <SaveButton
            saving={saving}
            onClick={() => save("required_keywords", config.required_keywords)}
          />
          <CTAButton variant="secondary" onClick={() => reset("required_keywords")}>
            Zurücksetzen
          </CTAButton>
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
              style={staggerStyle(idx)}
              className="tool-pop flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
            >
              <button
                onClick={() => toggleSource(idx)}
                className={`h-5 w-5 flex-shrink-0 rounded-md border text-xs font-bold transition active:scale-90 ${
                  src.enabled
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-card text-transparent"
                }`}
              >
                {src.enabled && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
              </button>
              <span className="flex-1 text-sm font-medium text-foreground">
                {src.name}
              </span>
              <Badge tone={src.quality === "high" ? "primary" : "muted"}>
                {src.quality}
              </Badge>
              <button
                onClick={() => removeSource(idx)}
                className="text-xs text-rose-400 transition-transform duration-150 active:scale-90 hover:text-rose-600 dark:hover:text-rose-300"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
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
            className={`flex-1 ${FIELD_CLASS}`}
          />
          <Dropdown value={newQuality} onChange={(v) => setNewQuality(v as "high" | "mid")}>
            <DropdownOption value="high">High</DropdownOption>
            <DropdownOption value="mid">Mid</DropdownOption>
          </Dropdown>
          <CTAButton variant="primary" onClick={addSource}>+</CTAButton>
        </div>

        <div className="mt-4 flex gap-2">
          <SaveButton
            saving={saving}
            onClick={() => save("preferred_sources", config.preferred_sources)}
          />
          <CTAButton variant="secondary" onClick={() => reset("preferred_sources")}>
            Zurücksetzen
          </CTAButton>
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
              style={staggerStyle(idx)}
              className="tool-pop flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 dark:border-rose-900/40 dark:bg-rose-950/30"
            >
              <Ban className="h-4 w-4 flex-shrink-0 text-rose-500 dark:text-rose-400" strokeWidth={2} />
              <span className="flex-1 text-sm font-medium text-rose-800 dark:text-rose-300">
                {b.name}
              </span>
              <code className="text-xs text-rose-600 dark:text-rose-400">{b.pattern}</code>
              <button
                onClick={() => removeBlocked(idx)}
                className="text-xs text-rose-400 transition-transform duration-150 active:scale-90 hover:text-rose-600 dark:hover:text-rose-300"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
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
            className={FIELD_CLASS}
          />
          <input
            type="text"
            value={newBlocked.pattern}
            onChange={(e) =>
              setNewBlocked((b) => ({ ...b, pattern: e.target.value }))
            }
            placeholder="Pattern (regex)..."
            className={FIELD_CLASS}
          />
          <CTAButton variant="danger" onClick={addBlocked}>+ Blockieren</CTAButton>
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
      {/* Hardcoded Exclusions (Read-only) — sourced live from
          lib/engine/config.ts HARD_EXCLUSIONS, never a stale copy. */}
      <SectionCard
        title="System-Ausschlüsse (fest)"
        description="Diese Regeln sind im Code hartcodiert und können nicht geändert werden."
      >
        <div className="space-y-1.5">
          {HARD_EXCLUSIONS.map((rule, idx) => (
            <div
              key={idx}
              style={staggerStyle(idx)}
              className="tool-pop flex items-center gap-3 rounded-lg bg-background px-3 py-2"
            >
              <Lock className="h-3 w-3 flex-shrink-0 text-muted-fg" strokeWidth={2} />
              <code className="flex-1 text-xs text-foreground">
                {rule.pattern.source}
              </code>
              <Badge tone="muted">{rule.reason}</Badge>
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
              style={staggerStyle(idx)}
              className="tool-pop flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
            >
              <button
                onClick={() => toggleRule(idx)}
                className={`h-5 w-5 flex-shrink-0 rounded-md border text-xs font-bold transition active:scale-90 ${
                  rule.enabled
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-card text-transparent"
                }`}
              >
                {rule.enabled && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
              </button>
              <code className="flex-1 text-sm text-foreground">
                {rule.pattern}
              </code>
              <Badge tone="amber">{rule.reason}</Badge>
              <button
                onClick={() => removeRule(idx)}
                className="text-xs text-rose-400 transition-transform duration-150 active:scale-90 hover:text-rose-600 dark:hover:text-rose-300"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
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
            className={FIELD_CLASS}
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={newExclusion.reason}
              onChange={(e) =>
                setNewExclusion((ex) => ({ ...ex, reason: e.target.value }))
              }
              placeholder="Grund (z.B. off-topic)"
              className={`flex-1 ${FIELD_CLASS}`}
            />
            <CTAButton variant="primary" onClick={addRule}>+</CTAButton>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <SaveButton
            saving={saving}
            onClick={() =>
              save("custom_exclusions", config.custom_exclusions)
            }
          />
          <CTAButton variant="secondary" onClick={() => reset("custom_exclusions")}>
            Zurücksetzen
          </CTAButton>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Clusters Tab ────────────────────────────────────────────────────────────

const MAX_CLUSTER_QUERIES = 4;

function ClustersTab({ config, setConfig, save, reset, saving }: TabProps) {
  const auth = useAdminAuth();
  const [newCluster, setNewCluster] = useState({
    key: "",
    label: "",
    queries: "",
    includePatterns: "",
  });
  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

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
          .filter(Boolean)
          .slice(0, MAX_CLUSTER_QUERIES),
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
    setAiTopic("");
  };

  // "Bei Bedarf" — nur auf Klick, kein Auto-Trigger. Nutzt die bestehende
  // admin-gated ai-assist-Action, kein neuer Backend-Code nötig.
  const suggestWithAi = async () => {
    if (auth.status !== "authenticated" || !aiTopic.trim() || aiLoading) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const prompt =
        `Schlage ${MAX_CLUSTER_QUERIES} enge, mehrwortige Crossref-Suchphrasen ` +
        `für das Cannabis-Grow-Zusatzthema "${aiTopic.trim()}" vor, im Stil dieser ` +
        `Beispiele:\n- "cannabis cultivation thc cbd terpene profile"\n- "cannabis curing drying storage"\n- ` +
        `"cannabis postharvest terpene retention"\nKeine Einzelwörter, keine breiten Oberbegriffe. ` +
        `Antworte NUR mit den Suchphrasen, eine pro Zeile, ohne Nummerierung oder Erklärung.`;
      const result = await adminApi<{ reply: string }>(auth.session, "ai-assist", { prompt });
      const suggested = result.reply
        .split("\n")
        .map((l) => l.replace(/^[-*\d.)\s]+/, "").trim())
        .filter(Boolean)
        .slice(0, MAX_CLUSTER_QUERIES)
        .join("\n");
      setNewCluster((c) => ({ ...c, queries: suggested }));
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Vorschlag fehlgeschlagen");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hardcoded Clusters — sourced live from lib/engine/config.ts
          TOPIC_CLUSTERS, never a stale copy. */}
      <SectionCard
        title="System-Cluster (fest)"
        description={`Die ${TOPIC_CLUSTERS.length} Basis-Cluster für die Crossref-Suche. Können nicht deaktiviert werden.`}
      >
        <div className="space-y-3">
          {TOPIC_CLUSTERS.map((c, idx) => (
            <div
              key={c.key}
              style={staggerStyle(idx)}
              className="tool-pop rounded-lg border border-border bg-background p-3"
            >
              <div className="flex items-center gap-2">
                <Lock className="h-3 w-3 text-muted-fg" strokeWidth={2} />
                <span className="font-semibold text-sm text-foreground">
                  {clusterLabel(c.key)}
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
              style={staggerStyle(idx)}
              className="tool-pop rounded-lg border border-border bg-background p-3"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleCluster(idx)}
                  className={`h-5 w-5 flex-shrink-0 rounded-md border text-xs font-bold transition active:scale-90 ${
                    cluster.enabled
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-card text-transparent"
                  }`}
                >
                  {cluster.enabled && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
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
                  className="ml-auto flex items-center gap-1 text-xs text-rose-400 transition-transform duration-150 active:scale-90 hover:text-rose-600 dark:hover:text-rose-300"
                >
                  <X className="h-3 w-3" strokeWidth={2} /> Entfernen
                </button>
              </div>
              <div className="mt-2">
                <span className="text-[10px] font-semibold uppercase text-muted-fg">
                  Queries (max. {MAX_CLUSTER_QUERIES}, treibt die Crossref-Suche):
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
          <p className="mb-1 text-sm font-semibold text-foreground">
            Neuen Cluster erstellen
          </p>
          <p className="mb-3 text-xs text-muted-fg">
            Ein Cluster = ein konkretes Zusatzthema. 3–4 enge Mehrwort-Phrasen
            wie bei den System-Clustern oben — keine Einzelwörter, kein
            Versuch alles auf einmal abzudecken.
          </p>

          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background p-2.5">
            <Sparkles className="h-4 w-4 flex-shrink-0 text-primary" strokeWidth={2} />
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="Thema, z.B. LED-Beleuchtungsspektren"
              className={`min-w-[180px] flex-1 ${FIELD_CLASS}`}
            />
            <CTAButton
              variant="secondary"
              size="sm"
              onClick={() => void suggestWithAi()}
              disabled={aiLoading || !aiTopic.trim()}
            >
              {aiLoading ? "Denkt nach…" : "Mit Claude vorschlagen"}
            </CTAButton>
          </div>
          {aiError && (
            <p className="mb-3 text-xs text-rose-600 dark:text-rose-400">{aiError}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={newCluster.key}
              onChange={(e) =>
                setNewCluster((c) => ({ ...c, key: e.target.value }))
              }
              placeholder="Cluster-Key (z.B. beleuchtung)"
              className={FIELD_CLASS}
            />
            <input
              type="text"
              value={newCluster.label}
              onChange={(e) =>
                setNewCluster((c) => ({ ...c, label: e.target.value }))
              }
              placeholder="Anzeige-Name (z.B. Beleuchtung & Spektren)"
              className={FIELD_CLASS}
            />
            <textarea
              value={newCluster.queries}
              onChange={(e) =>
                setNewCluster((c) => ({ ...c, queries: e.target.value }))
              }
              placeholder={"Suchbegriffe (max. 4, eine pro Zeile)\nz.B. cannabis led spectrum flowering\ncannabis light intensity yield"}
              rows={3}
              className={FIELD_CLASS}
            />
            <textarea
              value={newCluster.includePatterns}
              onChange={(e) =>
                setNewCluster((c) => ({
                  ...c,
                  includePatterns: e.target.value,
                }))
              }
              placeholder={"Include-Patterns (einer pro Zeile)\nz.B. led spectrum\nphotoperiod"}
              rows={3}
              className={FIELD_CLASS}
            />
          </div>
          <CTAButton variant="primary" onClick={addCluster} className="mt-3">
            + Cluster erstellen
          </CTAButton>
        </div>

        <div className="mt-4 flex gap-2">
          <SaveButton
            saving={saving}
            onClick={() => save("topic_clusters", config.topic_clusters)}
          />
          <CTAButton variant="secondary" onClick={() => reset("topic_clusters")}>
            Zurücksetzen
          </CTAButton>
        </div>
      </SectionCard>
    </div>
  );
}

// ── Scoring Tab ─────────────────────────────────────────────────────────────

type WeightsHistoryEntry = {
  weights: Record<string, number>;
  reason: string;
  based_on_studies: number;
  computed_at: string;
};

function WeightsHistorySection() {
  const auth = useAdminAuth();
  const [entry, setEntry] = useState<WeightsHistoryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth.status !== "authenticated") return;
    adminApi<{ latest: WeightsHistoryEntry | null }>(auth.session, "weights-history")
      .then((data) => setEntry(data.latest))
      .catch(() => setEntry(null))
      .finally(() => setLoading(false));
  }, [auth.status]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SectionCard
      title="Adaptive Gewichte — Verlauf"
      description="Der wöchentliche Anpassungslauf berechnet Gewichte aus Nutzer-Feedback und übernimmt sie automatisch oben in die Score-Gewichtung. Nur Anzeige, kein Formular."
    >
      {loading ? (
        <p className="text-sm text-muted-fg">Lädt…</p>
      ) : !entry ? (
        <p className="text-sm italic text-muted-fg">
          Noch kein automatischer Anpassungslauf durchgeführt.
        </p>
      ) : (
        <div className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
          <History className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" strokeWidth={2} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-fg">
              <span>{new Date(entry.computed_at).toLocaleString("de-DE")}</span>
              <Badge tone="muted">{entry.based_on_studies} Studien</Badge>
            </div>
            <p className="mt-1 text-sm text-foreground">{entry.reason}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(entry.weights).map(([key, value]) => (
                <span
                  key={key}
                  className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-muted-fg"
                >
                  {key}: {Math.round(value * 100)}%
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

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
                className="flex-1 accent-primary"
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
                className="flex-1 accent-primary"
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
                className="flex-1 accent-primary"
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
        description={
          <>
            Die 5 Scoring-Faktoren und ihre Gewichtung. Summe: {(totalWeight * 100).toFixed(0)}%{" "}
            {Math.abs(totalWeight - 1) > 0.01 ? (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="inline h-3.5 w-3.5" strokeWidth={2} /> sollte 100% sein!
              </span>
            ) : (
              <CheckCircle2 className="inline h-3.5 w-3.5 text-primary" strokeWidth={2} />
            )}
          </>
        }
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
                <span className="text-sm font-bold text-primary">
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
                className="mt-1 w-full accent-primary"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-2">
          <SaveButton
            saving={saving}
            onClick={() => save("scoring_params", config.scoring_params)}
          />
          <CTAButton variant="secondary" onClick={() => reset("scoring_params")}>
            Zurücksetzen
          </CTAButton>
        </div>
      </SectionCard>

      <WeightsHistorySection />
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
              style={staggerStyle(idx)}
              className="tool-pop flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2"
            >
              <button
                onClick={() => toggleTerm(idx)}
                className={`h-5 w-5 flex-shrink-0 rounded-md border text-xs font-bold transition active:scale-90 ${
                  term.enabled
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-card text-transparent"
                }`}
              >
                {term.enabled && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
              </button>
              <code className="flex-1 text-sm text-foreground">
                {term.term}
              </code>
              <button
                onClick={() => toggleWordBoundary(idx)}
                title="Word Boundary (\\b)"
                className={`rounded-md border px-2 py-0.5 text-[10px] font-mono transition active:scale-90 ${
                  term.wordBoundary
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-fg"
                }`}
              >
                \\b
              </button>
              <StatusBadge ok={term.enabled} />
              <button
                onClick={() => removeTerm(idx)}
                className="text-xs text-rose-400 transition-transform duration-150 active:scale-90 hover:text-rose-600 dark:hover:text-rose-300"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
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
            className={`flex-1 ${FIELD_CLASS}`}
          />
          <label className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={newWordBoundary}
              onChange={(e) => setNewWordBoundary(e.target.checked)}
              className="accent-primary"
            />
            <span className="text-xs text-muted-fg">\\b</span>
          </label>
          <CTAButton variant="primary" onClick={addTerm}>+ Hinzufügen</CTAButton>
        </div>

        {/* Regex Preview */}
        <div className="mt-4 rounded-lg bg-[var(--primary-deep)] p-3">
          <p className="text-[10px] font-semibold uppercase text-primary">
            Regex-Vorschau (Live)
          </p>
          <code className="mt-1 block text-xs text-primary break-all">
            /{regexPreview || "..."}/i
          </code>
        </div>

        <div className="mt-4 flex gap-2">
          <SaveButton
            saving={saving}
            onClick={() => save("cannabis_anchor", config.cannabis_anchor)}
          />
          <CTAButton variant="secondary" onClick={() => reset("cannabis_anchor")}>
            Zurücksetzen
          </CTAButton>
        </div>
      </SectionCard>
    </div>
  );
}
