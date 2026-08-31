#!/usr/bin/env node
/**
 * apps/web/scripts/seed-admin-user.mjs
 *
 * Legt einen lokalen Admin-Test-User an (idempotent) und setzt seine Rolle
 * in `user_roles` auf ADMIN. Nur für lokale Entwicklung gegen `supabase
 * start` — nutzt den SERVICE_ROLE_KEY aus apps/web/.env.local.
 *
 * Voraussetzung: `npx supabase start` läuft und die Migrationen sind
 * eingespielt (`npx supabase db reset` oder `npx supabase migration up`).
 *
 * Verwendung (vom Repo-Root):
 *   node apps/web/scripts/seed-admin-user.mjs
 *   node apps/web/scripts/seed-admin-user.mjs --email me@local.test --password geheim123
 *
 * Danach Login auf http://localhost:3000/de/auth (bzw. dein Dev-Port).
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.resolve(__dirname, "..", ".env.local");

// ── tiny .env parser (kein dotenv-Dependency nötig) ────────────────────────
function loadEnv(file) {
  const out = {};
  let raw;
  try {
    raw = readFileSync(file, "utf8");
  } catch {
    return out;
  }
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

// ── args ──────────────────────────────────────────────────────────────────
function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const env = loadEnv(ENV_PATH);
const SUPABASE_URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const EMAIL = arg("email", "admin@secretleaf.test");
const PASSWORD = arg("password", "secretleaf-admin");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    `✗ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY nicht in ${ENV_PATH} gefunden.`,
  );
  process.exit(1);
}
if (!SUPABASE_URL.includes("127.0.0.1") && !SUPABASE_URL.includes("localhost")) {
  console.error(
    `✗ Sicherheitsstopp: SUPABASE_URL zeigt nicht auf localhost (${SUPABASE_URL}).\n` +
      `  Dieses Script ist nur für lokale Entwicklung gedacht.`,
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(email) {
  // listUsers ist paginiert; für lokale DBs reicht die erste Seite locker.
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (hit) return hit;
    if (data.users.length < 200) return null;
  }
  return null;
}

async function main() {
  console.log(`→ Supabase: ${SUPABASE_URL}`);
  console.log(`→ Admin-User: ${EMAIL}`);

  let user = await findUserByEmail(EMAIL);

  if (user) {
    console.log(`• User existiert bereits (${user.id}) — setze Passwort neu & bestätige E-Mail.`);
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
    console.log(`• User angelegt (${user.id}).`);
  }

  const { error: roleErr } = await supabase
    .from("user_roles")
    .upsert({ user_id: user.id, role: "ADMIN" }, { onConflict: "user_id" });
  if (roleErr) throw roleErr;
  console.log(`• Rolle ADMIN gesetzt.`);

  console.log(`\n✓ Fertig. Login:\n    E-Mail:   ${EMAIL}\n    Passwort: ${PASSWORD}\n`);
}

main().catch((err) => {
  console.error("✗ Fehlgeschlagen:", err.message || err);
  process.exit(1);
});
