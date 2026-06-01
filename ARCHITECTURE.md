# SecretLeaf Architecture

## 1. Purpose and Scope

This document describes the current technical architecture of SecretLeaf and the intended target structure.
It is an engineering reference for product, development, and operations.

Scope of this document:
- System boundaries and runtime topology
- Domain architecture
- Data ownership and persistence
- Security model
- Reliability and operations fundamentals
- Known architectural debt and migration direction

Out of scope:
- UI style rules (see AI_RULES.md)
- Deployment steps (see DEPLOYMENT.md)

---

## 2. Reality Check: Current System

SecretLeaf currently runs as a monorepo with two server paths:

1. apps/web (Next.js)
- Primary product runtime
- App Router pages and API routes
- Supabase-backed auth, studies, automation telemetry
- Grow product features with hybrid storage (Supabase + local cache)

2. apps/api (Fastify + Prisma)
- Legacy/parallel API stack
- Listing/marketplace-oriented routes
- Separate Prisma schema (SQLite datasource in current config)
- Not the primary production path for the core product

This duality is the main architectural complexity today.

---

## 3. Monorepo Structure

```text
SecretLeaf/
  apps/
    web/                 # Primary product runtime (Next.js)
    api/                 # Legacy parallel API (Fastify + Prisma)
  packages/
    shared/              # Shared types (currently minimal)
  scripts/               # Ops and data automation scripts
  supabase/
    migrations/          # Production DB/RLS migrations
```

Key principle:
- Product-critical development is centered in apps/web and supabase/migrations.

---

## 4. Runtime Topology

### 4.1 Primary runtime (production)

```text
Client (Browser)
  -> Next.js app (apps/web)
    -> App Router pages
    -> Next.js API routes (/api/*)
      -> Supabase (Auth + Postgres + RLS)
      -> External sources (Crossref)
```

### 4.2 Legacy runtime (secondary)

```text
Client/Internal caller
  -> Fastify API (apps/api)
    -> Prisma Client
      -> SQLite/Postgres (depends on env)
```

Strategic direction:
- Keep one primary backend path for product-critical use cases.
- Decommission or isolate legacy routes that do not support the current product thesis.

---

## 5. Domain Architecture

SecretLeaf currently contains four major domains.

### 5.1 Grow OS Domain

Purpose:
- Guided grow operations and daily execution

Core capabilities:
- Grow setup and planning
- Multi-plant management
- Task generation and completion
- Grow log entries and retention mechanics

Persistence model:
- Logged-in users: Supabase tables (grows, plants, log_entries)
- Anonymous/offline fallback: local storage adapter
- Migration path from local to cloud exists and is idempotent

### 5.2 Studies and Knowledge Domain

Purpose:
- Structured knowledge and source-backed content

Core capabilities:
- Static knowledge base pages
- Study records with quality status
- Search and filtering

Persistence model:
- Curated data in code + Supabase table storage for synchronized studies

### 5.3 Automation and Study Engine Domain

Purpose:
- Continuous ingestion, normalization, classification, scoring, persistence

Core capabilities:
- Scheduled ingestion via cron routes
- Deterministic, rule-based pipeline
- Telemetry via automation_job_runs
- Health monitoring endpoint and circuit breaker support

Persistence model:
- Supabase studies + automation_job_runs

### 5.4 Admin and Governance Domain

Purpose:
- Operate quality, runs, settings, and roles

Core capabilities:
- Admin dashboard API actions
- Study review workflows
- Engine trigger/reprocess/adapt actions

Security model:
- Role resolution via user_roles table
- Admin-only routes enforced server-side

---

## 6. Data Ownership and Persistence

### 6.1 Canonical production data

Supabase/Postgres is the canonical source for:
- Auth users and roles
- Studies and review status
- Grow cloud records for authenticated sessions
- Automation run telemetry

### 6.2 Transitional local persistence

localStorage remains in use for:
- Anonymous user flows
- Cache and offline-friendly UX
- Backward compatibility during migration

Important constraint:
- localStorage data is not an authoritative multi-device source.
- Product decisions should continue reducing local-only critical state.

### 6.3 Legacy schema

Prisma schema under apps/api currently models a different product slice (listing marketplace).
This is not aligned with the main Grow+Studies product path.

---

## 7. API Architecture

### 7.1 Primary API surface

Next.js API routes in apps/web/src/app/api:
- Public endpoints
- Auth context resolution
- Studies CRUD/review surface
- Search endpoints
- Automation endpoints (cron protected)
- Health/status endpoints

### 7.2 Access control

- Bearer token resolution against Supabase auth
- Role lookup through user_roles
- Explicit admin guard for privileged endpoints

### 7.3 Reliability pattern

Public endpoints frequently return degraded payloads instead of hard failures where useful.
This prevents brittle UI states and preserves partial functionality.

---

## 8. Security Architecture

Core controls implemented:
- Supabase auth and token validation
- Server-side role checks
- RLS-based data isolation in Supabase migrations
- Input validation on API boundaries
- Cron secret protection for automation routes

Controls to mature further:
- Full production error tracking enablement
- Expanded abuse/rate-limit controls on all exposed endpoints
- Regular secret rotation and hardening automation

---

## 9. Performance and Scalability

Current strengths:
- App + API colocated in Next.js runtime for low integration overhead
- Static knowledge assets and deterministic pipelines
- Database-backed automation telemetry for observability

Current bottlenecks:
- Dual backend architecture increases cognitive and operational cost
- Limited shared package usage creates type drift risk between stacks

Scalability direction:
1. Consolidate primary backend path
2. Keep domain modules isolated within apps/web
3. Add focused caching only for measured bottlenecks
4. Grow observability before aggressive infrastructure expansion

---

## 10. Reliability and Operations

Operational building blocks:
- Scheduled automation via vercel.json cron definitions
- Automation run recording in automation_job_runs
- Health endpoints for app and engine
- Structured internal logging wrappers in runtime modules

Production reliability target:
- Prefer predictable degraded behavior over silent hard crashes
- Keep all critical automation jobs auditable through run records

---

## 11. Architectural Debt and Risks

High-priority debt:
1. Parallel backend stacks with partially overlapping responsibilities
2. Documentation drift between architecture docs and runtime reality
3. Incomplete monetization architecture despite plan/entitlement signals in UI
4. Incomplete observability activation (Sentry wrappers present, runtime integration pending)

Risk impact:
- Slower delivery velocity
- Harder onboarding
- Increased incident/debugging time
- Product confusion across teams

---

## 12. Target Architecture (Near-term)

Target for next iteration:

```text
Client
  -> Next.js (single product gateway)
    -> Domain modules (Grow, Studies, Engine, Admin)
      -> Supabase (Auth/Postgres/RLS/Storage)
```

Key outcomes:
- One product backend path
- Clear domain ownership
- Reduced infra duplication
- Better alignment between roadmap and codebase

---

## 13. Engineering Standards

Standards for architecture-safe changes:
- No new cross-stack duplication between apps/web and apps/api
- New product features must declare data ownership explicitly
- API additions require auth and role model definition
- Every automation route must emit auditable run metadata
- Architecture-impacting changes require this document update in the same PR

---

## 14. Document Metadata

Owner: Product Engineering
Status: Active
Last updated: 2026-06-01
Next review: 2026-07-01
