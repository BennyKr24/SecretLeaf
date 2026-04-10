# Deployment & Operations Guide

## 🚀 Pre-Deployment Checklist

### Infrastructure
- [ ] VPS/Cloud Provider ausgewählt (AWS, DigitalOcean, Hetzner, Linode)
- [ ] SSL-Zertifikat (Let's Encrypt vorbereitet)
- [ ] Database-Server (PostgreSQL 14+)
- [ ] Docker-Runtime oder K8s Cluster
- [ ] Backup-Strategie definiert

### Secrets & Configuration
- [ ] `.env.production` konfiguriert (nicht in Git!)
- [ ] Database-Credentials sicher gespeichert
- [ ] JWT-Secret generiert
- [ ] API-Keys (falls später nötig)

### Monitoring & Alerting
- [ ] Sentry Project erstellt (Error Tracking)
- [ ] Uptime.com oder ähnlich konfiguriert
- [ ] Log-Aggregation (Optional: LogDNA, Datadog)
- [ ] Alert-Recipient(s) definiert

### Security
- [ ] npm audit durchgeführt
- [ ] Helmet Security Headers aktiviert
- [ ] CORS Policy definiert
- [ ] Rate Limiting für Public APIs

### Legal & Compliance
- [ ] Impressum aktualisiert
- [ ] Datenschutzerklärung (DACH)
- [ ] Terms of Service
- [ ] Cookie Banner (falls nötig)

---

## 📦 Docker Build & Push

```bash
# Bild bauen (Multistage)
docker build -t secretleaf:latest .

# Lokal testen
docker run -p 3000:3000 -p 4000:4000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  secretleaf:latest

# In Registry pushen (z.B. Docker Hub, ghcr.io, etc.)
docker tag secretleaf:latest myregistry/secretleaf:latest
docker push myregistry/secretleaf:latest
```

### Dockerfile Template
```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Runtime
FROM node:20-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package*.json ./

ENV NODE_ENV=production
EXPOSE 3000 4000
CMD ["npm", "start"]
```

---

## 🐘 Database Migration

```bash
# Development
npm run db:dev

# Staging/Production
DATABASE_URL="postgresql://user:pass@host/db" npx prisma migrate deploy

# Rollback (if needed)
npx prisma migrate resolve --rolled-back migration-name
```

### Schema Updates
1. Edit `apps/api/prisma/schema.prisma`
2. `npx prisma migrate dev --name migration-name`
3. Test lokal
4. Commit schema + migration file
5. In Production: `prisma migrate deploy`

---

## 📡 Environment Variables

**Required für Production**:
```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/secretleaf"

# Auth
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_EXPIRATION="7d"

# Server
NODE_ENV="production"
FASTIFY_HOST="0.0.0.0"
FASTIFY_PORT="4000"
NEXTJS_HOST="0.0.0.0"
NEXTJS_PORT="3000"

# Optional: Error Tracking
SENTRY_DSN="https://..."
SENTRY_ENVIRONMENT="production"

# Optional: Email (falls Kontaktformular)
SMTP_HOST="smtp.provider.com"
SMTP_PORT="587"
SMTP_USER="noreply@..."
SMTP_PASS="..."

# Supabase (automatischer Studien-Sync + API)
SUPABASE_URL="https://<project-ref>.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
# Public Browser Auth
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY="<publishable-key>"

# Cron-Schutz fuer Automation-Routen
CRON_SECRET="long-random-secret"
```

### Studien-Automation ohne manuelle Ausfuehrung
Die Web-App synchronisiert Studien automatisch in Supabase:

- `/api/automation/study-refresh` taeglich um 04:17 UTC
- `/api/automation/studies-sync` taeglich um 04:27 UTC
- `/api/automation/cleanup` sonntags um 04:40 UTC
- `/api/automation/health` fuer Laufhistorie und Freshness-Diagnostik

Die Routen sind per `CRON_SECRET` geschuetzt. Auf Vercel wird kein lokaler Rechner benoetigt.

### Supabase SQL Migrations
- Alle produktiven DB- und RLS-Aenderungen liegen in `supabase/migrations`.
- Rolle fuer API-Authorisierung wird serverseitig ueber `public.user_roles` geprueft (nicht ueber `user_metadata`).
- Neu hinzugekommen fuer Härtung:
  - `supabase/migrations/202604060003_rls_hardening.sql`
  - `supabase/migrations/202604060004_studies_fingerprint_index_rebuild.sql`
  - `supabase/migrations/202604060005_automation_runs.sql`

---

## 🔄 Continuous Deployment (CI/CD)

### GitHub Actions Example
```yaml
name: Deploy on Push

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm ci
      - run: npm run typecheck
      - run: npm run build
      - run: npm run test
      
      - name: Build & Push Docker
        run: |
          docker build -t ghcr.io/${{ github.repository }}:${{ github.sha }} .
          docker push ghcr.io/${{ github.repository }}:${{ github.sha }}
      
      - name: Deploy to Production
        run: |
          # kubectl apply, docker-compose up, etc.
          ssh deploy@prod "docker pull ... && docker run ..."
```

---

## 📊 Monitoring & Observability

### Health Checks
- `GET /health` → 200 OK wenn bereit
- `GET /public/status-report` → System-Status

### Logs
```bash
# Docker Container
docker logs secretleaf

# Application logs (empfohlen: JSON structured)
tail -f logs/app.log | jq .
```

### Metrics zu Tracken
- **API Response Time**: p50, p95, p99
- **Error Rate**: 5xx errors / total requests
- **Database Connections**: Active/Pool size
- **CPU/Memory**: Container usage
- **Uptime**: 99.5%+ target

---

## 🔧 Rollback Procedure

```bash
# Wenn etwas schiefgegangen ist
git revert <commit> && git push

# Oder schnell zurück zu letztem Release
kubectl rollout undo deployment/secretleaf
# or
docker stop secretleaf && docker run -d (old version)

# Database rollback (Vorsicht!)
DATABASE_URL=... npx prisma migrate resolve --rolled-back <migration-name>
```

---

## 🛡️ Security Best Practices

1. **Secrets Management**
   - Nutze GitHub Secrets, AWS Secrets Manager, oder HashiCorp Vault
   - Nie Secrets in `.env` committen
   - Rotate regularly

2. **Database**
   - Backup täglich + test restore
   - SSL-Verbindung erzwingen
   - Minimal-Permissions für App-User

3. **API Security**
   - Rate limiting pro IP
   - CORS auf spezifische Origins
   - Helmet Security Headers
   - Input validation + SQL injection prevention (Prisma macht das)

4. **Monitoring**
   - Error Tracking (Sentry)
   - Abuse Detection (Autoflag suspicious IPs)
   - WAF (Web Application Firewall) optional

---

## 📞 Support & Runbook

### Common Issues

**API nicht erreichbar**
- Check: `docker ps` (Container läuft?)
- Check: `curl localhost:4000/health`
- Logs: `docker logs secretleaf`
- Fix: Restart, redeploy, or rollback

**Database Connection Timeout**
- Check: Firewall-Regeln
- Check: Connection String korrekt?
- Fix: Restart Database, increase pool size

**High Memory/CPU**
- Check: `top`, `docker stats`
- Check: Memory leak in Logs
- Fix: Restart Service, scale horizontal, optimize code

**Deployment fehlgeschlagen**
- Check: Build logs
- Check: Secrets korrekt?
- Fix: Rollback, fix code, redeploy

---

## 🎯 Long-Term Operations

### Monthly
- [ ] Security Updates (npm audit, Docker base images)
- [ ] Backup Restore Test
- [ ] Performance Review (Logs, Metrics)
- [ ] Database Maintenance (VACUUM, REINDEX)

### Quarterly
- [ ] Dependency Updates
- [ ] Security Audit
- [ ] Capacity Planning
- [ ] Cost Review

### Annually
- [ ] DR (Disaster Recovery) Test
- [ ] Architecture Review
- [ ] Compliance Audit (DACH regs)
- [ ] Major Version Upgrades

---

**Last Updated**: 26.03.2026
**Status**: Pre-Production
**Next Step**: Setup infrastructure, populate `.env.production`, deploy to staging
