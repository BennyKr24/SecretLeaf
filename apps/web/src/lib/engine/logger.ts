// ──────────────────────────────────────────────────────────────────────────────
// Study Engine – Structured Pipeline Logger
// ──────────────────────────────────────────────────────────────────────────────

import type { PipelineLogEntry, PipelineLogLevel } from "./types";

export class PipelineLogger {
  private readonly entries: PipelineLogEntry[] = [];
  private readonly stage: string;

  constructor(stage: string) {
    this.stage = stage;
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.write("debug", message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.write("info", message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.write("warn", message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.write("error", message, meta);
  }

  getEntries(): PipelineLogEntry[] {
    return [...this.entries];
  }

  getErrors(): PipelineLogEntry[] {
    return this.entries.filter((e) => e.level === "error");
  }

  getErrorMessages(): string[] {
    return this.getErrors().map((e) => e.message);
  }

  private write(level: PipelineLogLevel, message: string, meta?: Record<string, unknown>): void {
    const entry: PipelineLogEntry = {
      ts: new Date().toISOString(),
      level,
      stage: this.stage,
      message,
      ...(meta ? { meta } : {}),
    };

    this.entries.push(entry);

    // Also write to console for runtime observability
    const payload = JSON.stringify(entry);
    switch (level) {
      case "error":
        console.error(payload);
        break;
      case "warn":
        console.warn(payload);
        break;
      default:
        console.info(payload);
        break;
    }
  }
}

/**
 * Aggregated logger that collects entries from all pipeline stages.
 * Each stage gets its own child logger with a unique stage label.
 */
export class PipelineLogAggregator {
  private readonly children: PipelineLogger[] = [];

  createLogger(stage: string): PipelineLogger {
    const logger = new PipelineLogger(stage);
    this.children.push(logger);
    return logger;
  }

  getAllEntries(): PipelineLogEntry[] {
    return this.children.flatMap((child) => child.getEntries());
  }

  getAllErrors(): string[] {
    return this.children.flatMap((child) => child.getErrorMessages());
  }

  getSummary(): {
    totalEntries: number;
    errors: number;
    warnings: number;
    stages: string[];
  } {
    const all = this.getAllEntries();
    return {
      totalEntries: all.length,
      errors: all.filter((e) => e.level === "error").length,
      warnings: all.filter((e) => e.level === "warn").length,
      stages: [...new Set(all.map((e) => e.stage))],
    };
  }
}
