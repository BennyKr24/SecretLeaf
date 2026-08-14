// Der Secret wird bewusst nur über Header akzeptiert (Authorization: Bearer
// oder x-cron-key), nie über den URL-Query-String — Query-Strings landen
// routinemäßig in Plattform-/Proxy-Logs und würden das Secret dort leaken.
export function isAutomationCronAuthorized(req: Request, configuredSecret: string): boolean {
  const auth = req.headers.get("authorization");
  const bearerToken = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const legacyKey = req.headers.get("x-cron-key");

  return (bearerToken ?? legacyKey) === configuredSecret;
}