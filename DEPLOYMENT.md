# SecretLeaf Deployment and Operations Guide

## 1. Purpose

This guide defines how SecretLeaf is deployed, operated, and recovered in production.
It is optimized for the current primary runtime: apps/web on Vercel with Supabase.

This is not a generic Docker template document. It reflects the current product architecture.

---

## 2. Deployment Model

Primary production model:
- Application: Next.js app in apps/web
- Platform: Vercel
- Database/Auth: Supabase
- Scheduled automation: Vercel cron routes

Secondary/legacy path:
- apps/api can be run independently for legacy use cases, but is not the primary product runtime.

---

## 3. Environments

Recommended environments:
1. local
- Developer machine
- Fast iteration and debugging

2. preview
- Branch/PR previews on Vercel
- Feature validation and smoke tests

3. production
- main branch deploy
- Protected secrets and stable cron execution

Minimum rule:
- No direct production-only changes without preview validation.

---

## 4. Required Environment Variables

### 4.1 Core runtime

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
- CRON_SECRET

### 4.2 Optional but strongly recommended

- NEXT_PUBLIC_SENTRY_DSN
- SENTRY_DSN
- SENTRY_ENVIRONMENT
- SENTRY_AUTH_TOKEN (Vercel/CI only; required for source-map uploads)

### 4.3 Product analytics

- Vercel Web Analytics is enabled via `@vercel/analytics`.
- Vercel Speed Insights is enabled via `@vercel/speed-insights`.
- Optional Plausible tracking can be enabled with NEXT_PUBLIC_PLAUSIBLE_DOMAIN.

### 4.4 Newsletter

- LOOPS_API_KEY enables `/api/newsletter` in production.
- Without LOOPS_API_KEY, production returns 503 for newsletter signups instead of pretending success.

Notes:
- Never commit secrets.
- Keep production and preview secrets separated.
- Rotate service-role and cron secrets on a regular cadence.

---

## 5. Vercel Cron Jobs

The following scheduled routes are defined in apps/web/vercel.json:

Daily jobs:
- /api/automation/study-refresh at 04:17 UTC
- /api/automation/studies-sync at 04:27 UTC
- /api/automation/engine-sync at 04:37 UTC
- /api/automation/engine-health at 04:47 UTC

Weekly jobs:
- /api/automation/engine-adapt at Monday 05:00 UTC
- /api/automation/engine-reprocess at Monday 05:15 UTC
- /api/automation/cleanup at Sunday 04:40 UTC

Security model:
- All automation routes require CRON_SECRET authorization.

Operational rule:
- A cron route is production-ready only if it records run telemetry and returns explicit status payloads.

---

## 6. CI/CD Baseline

Current CI baseline (GitHub Actions):
- Install dependencies
- Typecheck web
- Typecheck api
- Build web
- Build api

Release gate recommendation:
1. Typecheck must pass
2. Build must pass
3. Critical route smoke tests must pass
4. Migration risk reviewed before production deploy

---

## 7. Supabase Migration Operations

All production SQL changes are tracked in:
- supabase/migrations

Deployment policy:
- Apply migrations in order
- Validate RLS behavior after each migration batch
- Keep rollback notes with each schema change

Post-migration verification checklist:
- Studies read/write paths healthy
- user_roles resolution works
- grow tables (grows/plants/log_entries) access obeys RLS
- automation_job_runs insert path healthy

---

## 8. Standard Deployment Procedure

### 8.1 Pre-flight checks

1. Confirm clean branch state
2. Run workspace typecheck
3. Run workspace build
4. Verify required env vars exist in target environment
5. Verify no pending critical migrations are missing

### 8.2 Deploy

1. Merge to main
2. Allow platform deployment to complete
3. Verify the GitHub deployment SHA for Production matches the pushed main commit
4. Validate health endpoints
5. Validate one protected admin/API flow
6. Validate latest cron runs after first schedule window

Important Vercel rule:
- `fix/*` and feature branches create Preview deployments only.
- Production deploys from `main`.
- A fix is not production-complete until `gh api "repos/BennyKr24/SecretLeaf/deployments?environment=Production"` shows the expected SHA with `success`.

### 8.3 Post-deploy validation

Mandatory checks:
- /api/health returns healthy response
- /api/public/status-report returns non-error payload
- /api/automation/health returns expected run diagnostics
- Admin dashboard can load overview metrics
- Critical Grow OS flow passes when touched: confirmed user -> login -> create grow -> row exists in `grows` -> reload -> second device login
- If SENTRY_AUTH_TOKEN changed, build logs show successful source-map upload
- If LOOPS_API_KEY changed, submit `/api/newsletter` once and verify the contact exists in Loops

---

## 9. Observability and Alerting

### 9.1 Required telemetry sources

1. Platform logs (Vercel)
2. Supabase logs/insights
3. automation_job_runs table
4. CI workflow outcomes
5. Sentry errors with uploaded source maps
6. Vercel Web Analytics and Speed Insights

### 9.2 Minimum KPIs

- API error rate
- p95 response latency for critical routes
- Automation success ratio (24h, 7d)
- Study freshness lag in hours
- Pending review backlog

### 9.3 Alert thresholds (initial)

- 3 consecutive failed engine-sync runs
- engine-health severity red
- health endpoint degraded for >15 minutes

---

## 10. Incident Response

Severity model:
- Sev1: core product unavailable or data integrity risk
- Sev2: major function degraded with workaround
- Sev3: minor degradation or non-critical subsystem issue

Immediate response playbook:
1. Triage scope and user impact
2. Check latest Production deploy SHA and whether a fix is only in Preview
3. Check latest deploy and migration history
4. Inspect automation_job_runs and health endpoints
5. For persistence incidents, prove database state directly (`count(*)`, row readback, RLS error code)
6. Roll back code if regression is confirmed
7. Publish internal incident summary with action items

---

## 11. Rollback Strategy

Application rollback:
- Roll back to last known good deployment in platform
- If needed, revert offending commit in git and redeploy

Data rollback:
- Prefer forward-fix migrations
- Use destructive rollback only with explicit data-impact analysis

Rule:
- Never roll back schema blindly without checking downstream route behavior.

---

## 12. Backup and Recovery

Supabase responsibilities:
- Ensure backup policy is enabled
- Validate restore process periodically

Operational requirement:
- Run restore drills at least quarterly
- Record RTO and RPO results

---

## 13. Security Operations

Mandatory controls:
- Least privilege for all service credentials
- Secret rotation schedule
- No sensitive data in logs
- Protected admin routes with server-side role checks

Recommended hardening:
- Enable and enforce Sentry in production
- Add route-level abuse controls where needed
- Track security-relevant events in structured logs

---

## 14. Legacy Stack Note (apps/api)

apps/api is maintained as a legacy/parallel service path.
It should not receive new product-critical scope unless explicitly approved in architecture review.

Before introducing new deployment surface for apps/api:
- Define owner
- Define SLA
- Define observability and incident model
- Validate alignment with product roadmap

---

## 15. Operational Checklists

### 15.1 Daily

- Check automation health and last successful runs
- Check error spikes and degraded endpoint responses

### 15.2 Weekly

- Review failed jobs and retry patterns
- Review pending study backlog
- Review role and access anomalies

### 15.3 Monthly

- Dependency and security update review
- Secret rotation audit
- Backup and restore verification status

---

## 16. Document Metadata

Owner: Product Engineering
Status: Active
Last updated: 2026-07-01
Next review: 2026-08-01
