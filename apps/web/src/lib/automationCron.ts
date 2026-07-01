export function isAutomationCronAuthorized(req: Request, configuredSecret: string): boolean {
  const auth = req.headers.get("authorization");
  const bearerToken = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const legacyKey =
    req.headers.get("x-cron-key") ??
    new URL(req.url).searchParams.get("x-cron-key");

  return (bearerToken ?? legacyKey) === configuredSecret;
}