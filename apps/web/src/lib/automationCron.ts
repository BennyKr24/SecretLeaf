import { timingSafeEqual } from "node:crypto";

// Plain `===` on secrets leaks their content one byte at a time via
// response-time differences (a remote attacker can measure this in
// practice, not just in theory). `timingSafeEqual` takes the same time
// regardless of where the strings first differ — but it throws on
// mismatched lengths, so that's checked separately first.
function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

// Der Secret wird bewusst nur über Header akzeptiert (Authorization: Bearer
// oder x-cron-key), nie über den URL-Query-String — Query-Strings landen
// routinemäßig in Plattform-/Proxy-Logs und würden das Secret dort leaken.
export function isAutomationCronAuthorized(req: Request, configuredSecret: string): boolean {
  const auth = req.headers.get("authorization");
  const bearerToken = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const legacyKey = req.headers.get("x-cron-key");
  const provided = bearerToken ?? legacyKey;

  return provided !== null && safeCompare(provided, configuredSecret);
}