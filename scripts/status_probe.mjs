#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const args = process.argv.slice(2);

const getArg = (name, fallback) => {
  const pref = `--${name}=`;
  const found = args.find((arg) => arg.startsWith(pref));
  return found ? found.slice(pref.length) : fallback;
};

const hasFlag = (name) => args.includes(`--${name}`);

const API_BASE = getArg("api", process.env.API_BASE || "http://localhost:4000");
const WEB_BASE = getArg("web", process.env.WEB_BASE || "http://localhost:3000");
const OUTPUT = resolve(getArg("output", process.env.STATUS_OUTPUT || "status-data.json"));
const INTERVAL_MS = Math.max(5000, Number(getArg("interval", process.env.STATUS_INTERVAL_MS || "30000")) || 30000);
const WATCH = hasFlag("watch");
const SILENT = hasFlag("silent");

const nowIso = () => new Date().toISOString();

const withTimeout = async (promiseFactory, timeoutMs = 7000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await promiseFactory(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
};

const probeUrl = async (url, timeoutMs = 7000) => {
  const started = Date.now();
  try {
    const response = await withTimeout(
      (signal) => fetch(url, { signal, headers: { accept: "application/json" } }),
      timeoutMs
    );

    const latencyMs = Date.now() - started;
    const contentType = response.headers.get("content-type") || "";

    let data = null;
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { raw: text.slice(0, 400) };
    }

    return {
      ok: response.ok,
      status: response.status,
      latencyMs,
      data,
      error: null
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      latencyMs: Date.now() - started,
      data: null,
      error: error instanceof Error ? error.message : "unknown_error"
    };
  }
};

const buildFallbackOverview = (generatedAt) => ({
  generatedAt,
  degraded: true,
  stats: {
    activeListings: 0,
    providers: 0,
    privacyMode: "minimal-logging"
  },
  featuredListings: []
});

const buildFallbackStatusReport = (generatedAt, apiOk, dbOk) => ({
  generatedAt,
  windowDays: 30,
  degraded: true,
  overallStatus: apiOk && dbOk ? "yellow" : "red",
  services: {
    api: apiOk ? "green" : "red",
    db: dbOk ? "green" : "red"
  },
  events: [
    {
      key: "AUTO_PROBE_STATUS",
      label: "Automatische Live-Probe",
      count: apiOk ? 1 : 2,
      level: apiOk ? "yellow" : "red",
      description: apiOk
        ? "API ist erreichbar, aber der Detail-Statusreport konnte nicht vollständig gelesen werden."
        : "API nicht erreichbar; Snapshot wurde aus Live-Probe mit Red-Status erzeugt.",
      lastSeen: generatedAt
    }
  ]
});

const normalizeHealth = (healthProbe) => ({
  status: healthProbe.ok ? (healthProbe.data?.status || "ok") : "offline",
  privacyMode: healthProbe.data?.privacyMode || "minimal-logging"
});

const runProbe = async () => {
  const generatedAt = nowIso();

  const [healthProbe, overviewProbe, statusProbe, webRootProbe, webWikiProbe] = await Promise.all([
    probeUrl(`${API_BASE}/health`),
    probeUrl(`${API_BASE}/public/overview`),
    probeUrl(`${API_BASE}/public/status-report`),
    probeUrl(`${WEB_BASE}/`),
    probeUrl(`${WEB_BASE}/wiki`)
  ]);

  const health = normalizeHealth(healthProbe);
  const overview = overviewProbe.ok && overviewProbe.data
    ? overviewProbe.data
    : buildFallbackOverview(generatedAt);

  const dbLevelFromStatus = statusProbe.data?.services?.db;
  const dbOk = dbLevelFromStatus ? dbLevelFromStatus === "green" : false;

  const statusReport = statusProbe.ok && statusProbe.data
    ? statusProbe.data
    : buildFallbackStatusReport(generatedAt, healthProbe.ok, dbOk);

  const overallStatus = statusReport?.overallStatus || (healthProbe.ok ? "yellow" : "red");
  const banner = {
    enabled: overallStatus !== "green",
    level: overallStatus,
    label: overallStatus === "red" ? "Stoerung" : overallStatus === "yellow" ? "Eingeschraenkt" : "Stabil",
    message:
      overallStatus === "red"
        ? "Ein oder mehrere Kerndienste sind derzeit nicht erreichbar."
        : overallStatus === "yellow"
          ? "Der Dienst laeuft mit Einschraenkungen oder Fallback-Logik."
          : "Alle Dienste sind aktuell stabil erreichbar.",
    ctaText: "Statusseite oeffnen",
    ctaHref: "/status"
  };

  const snapshot = {
    generatedAt,
    health,
    overview,
    statusReport,
    banner,
    probe: {
      mode: WATCH ? "watch" : "once",
      apiBase: API_BASE,
      webBase: WEB_BASE,
      measuredAt: generatedAt,
      checks: {
        apiHealth: healthProbe,
        apiOverview: overviewProbe,
        apiStatusReport: statusProbe,
        webRoot: webRootProbe,
        webWiki: webWikiProbe
      }
    }
  };

  await writeFile(OUTPUT, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  if (!SILENT) {
    const lines = [
      `[status-probe] ${generatedAt}`,
      `[status-probe] API /health: ${healthProbe.ok ? "OK" : "FAIL"} (${healthProbe.status ?? "ERR"}, ${healthProbe.latencyMs}ms)`,
      `[status-probe] API /public/overview: ${overviewProbe.ok ? "OK" : "FAIL"} (${overviewProbe.status ?? "ERR"}, ${overviewProbe.latencyMs}ms)`,
      `[status-probe] API /public/status-report: ${statusProbe.ok ? "OK" : "FAIL"} (${statusProbe.status ?? "ERR"}, ${statusProbe.latencyMs}ms)`,
      `[status-probe] WEB /: ${webRootProbe.ok ? "OK" : "FAIL"} (${webRootProbe.status ?? "ERR"}, ${webRootProbe.latencyMs}ms)`,
      `[status-probe] WEB /wiki: ${webWikiProbe.ok ? "OK" : "FAIL"} (${webWikiProbe.status ?? "ERR"}, ${webWikiProbe.latencyMs}ms)`,
      `[status-probe] Wrote ${OUTPUT}`
    ];
    console.log(lines.join("\n"));
  }
};

const main = async () => {
  if (!WATCH) {
    await runProbe();
    return;
  }

  await runProbe();
  setInterval(() => {
    runProbe().catch((error) => {
      console.error("[status-probe] watch cycle failed", error);
    });
  }, INTERVAL_MS);
};

main().catch((error) => {
  console.error("[status-probe] fatal", error);
  process.exit(1);
});
