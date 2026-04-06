type LogLevel = "info" | "warn" | "error";

function write(level: LogLevel, event: string, meta?: Record<string, unknown>) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    ...(meta ? { meta } : {}),
  };

  if (level === "error") {
    console.error(JSON.stringify(payload));
    return;
  }

  if (level === "warn") {
    console.warn(JSON.stringify(payload));
    return;
  }

  console.info(JSON.stringify(payload));
}

export function logInfo(event: string, meta?: Record<string, unknown>) {
  write("info", event, meta);
}

export function logWarn(event: string, meta?: Record<string, unknown>) {
  write("warn", event, meta);
}

export function logError(event: string, meta?: Record<string, unknown>) {
  write("error", event, meta);
}
