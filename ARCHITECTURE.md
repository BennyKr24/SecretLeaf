"# Architecture & Design Decisions

## 🏗️ Overall Architecture

```
┌─────────────────────────────────────────────┐
│        Browser / Mobile Client              │
└────────────────┬────────────────────────────┘
                 │
        ┌────────┴─────────┐
        │                  │
    ┌───▼──────┐      ┌────▼──────┐
    │ Next.js  │      │  Fastify  │
    │ (Web)    │      │  (API)    │
    └───┬──────┘      └────┬──────┘
        │                  │
        │       ┌──────────┴─────────────┐
        │       │                        │
    ┌───▼───────▼────────┐    ┌─────────▼──────┐
    │  TypeScript Stack  │    │   Prisma ORM   │
    │  + Tailwind CSS    │    │  + PostgreSQL  │
    └────────────────────┘    └────────────────┘
```

### Why this Stack?

**Frontend (Next.js)**
- Server-Side Rendering ready
- Static generation für Wiki (Performance)
- Built-in API routes (optional)
- Great TypeScript support
- Tailwind für schnelle Styling

**Backend (Fastify)**
- Leicht (einfaches Deployment)
- TypeScript native
- Plugin-System für Modularität
- Auto-Reloading in Dev
- Fast benchmarks

**Database (Prisma + PostgreSQL)**
- Type-safe schema
- Migration system
- Easy querying
- PostgreSQL = robust + GDPR-ready

**Monorepo (npm workspaces)**
- Shared types (`@secretleaf/shared`)
- Coordinated versioning
- Atomic commits über packages
- One `package.json` management

---

## 📦 Folder Structure

```
SecretLeaf/
├── apps/
│   ├── api/              # Fastify backend
│   │   ├── src/
│   │   │   ├── routes/   # API endpoints
│   │   │   ├── lib/      # Utilities
│   │   │   └── server.ts # Entry
│   │   └── prisma/       # DB schema + migrations
│   │
│   └── web/              # Next.js frontend
│       ├── src/
│       │   ├── app/      # Routes/Pages
│       │   ├── components/
│       │   ├── lib/      # Utilities + Terpira
│       │   ├── data/     # Wiki content
│       │   └── styles/
│       └── public/       # Static assets
│
├── packages/
│   └── shared/           # Shared types & utilities
│
├── scripts/              # Automation (status probe, etc.)
├── README.md             # Main overview
├── DEPLOYMENT.md         # Production guide
└── ARCHITECTURE.md       # This file
```

---

## 🧠 Key Design Decisions

### 1. **Wiki as Knowledge Base (Terpira)**

**Decision**: Dedicate significant effort to structured wiki with peer-reviewed sources.

**Why**:
- Users benefit from education → better decisions
- Reduces misinformation & regulatory risk
- Builds credibility (41 peer-reviewed sources)
- Evergreen content (SEO bonus)

**Trade-offs**:
- Development time upfront
- Requires maintenance
- Benefit: Long-term organic traffic

---

### 2. **Status Automation (Daemon Mode)**

**Decision**: Run continuous status probes (every 30s) instead of polling from frontend.

**Why**:
- Users see real status immediately
- No race conditions with stale data
- Backend-driven vs frontend-spam polling
- Self-healing with `ensure_running.sh`

**Implementation**:
```
status_probe.mjs → checks /health + /status-report → writes status-data.json
↓
Frontend (static or dynamic) reads status-data.json
↓
Fallback if API down: Show last-known status
```

---

### 3. **Pre-rendering for Performance**

**Decision**: Pre-render 8 wiki pages (hub + 13 articles + sources) as static HTML.

**Why**:
- Fastest possible load time
- Minimal JavaScript
- Works offline
- Great for SEO

**Trade-offs**:
- Rebuild needed if content changes
- Mitigation: On-demand ISR (Incremental Static Regeneration)

---

### 4. **Public API with Fallback**

**Decision**: Public API endpoints never return 500 (fallback to degraded response).

**Why**:
- Better UX (something beats nothing)
- System resilience
- User trust

**Example**:
```typescript
// If DB down, return demo data instead of 500
GET /public/overview
→ Try DB query
→ Fail: Return cached/demo data with "degraded" flag
```

---

### 5. **JWT + Minimal Auth**

**Decision**: JWT for simplicity, no OAuth initially.

**Why**:
- No external dependencies
- Stateless (scales easily)
- Good enough for MVP

**Future**: Add OAuth2 / OIDC if needed

---

## 🔄 Data Flow

### Wiki Article View
```
User clicks /wiki/cannabis-anbau-grundlagen
↓
Next.js checks pre-rendered cache
↓
If fresh: Serve static HTML (instant)
If stale: Generate on-demand (ISR)
↓
Page loads with:
- Erkläboxen, FAQ, Glossar (client-side)
- Source links (from sidebar)
- Related articles
```

### Status Update
```
status_probe.mjs (every 30s)
↓
GET http://localhost:4000/health
GET http://localhost:3000/
↓
Write status-data.json
↓
Frontend / Next.js / Landing reads file
↓
Show ampel (🟢 / 🟡 / 🔴)
```

### Listing Creation (Protected)
```
User (logged in)
→ POST /listings {title, price, location}
↓
Fastify: Verify JWT
↓
Prisma: Insert into Database
↓
Return: {id, slug, ...}
↓
Frontend: Update dashboard
```

---

## 🛡️ Security by Design

### Authentication
- JWT in httpOnly cookies (XSS-safe)
- Refresh tokens separate (if extended sessions needed)
- No passwords in logs
- Argon2 hashing for passwords (via bcrypt)

### Authorization
- Role-based (user, provider, admin)
- Scoped API endpoints (can't access others' listings)
- Public routes for wiki + health
- Protected routes for user-specific data

### Input Validation
- Zod schemas (runtime validation)
- Prisma prevents SQL injection
- CORS restrictions
- Rate limiting on public endpoints

### Privacy
- Minimal user profiling
- No 3rd-party cookies (goal: 🟢)
- Logging redacts sensitive fields
- Optional pseudonymity (no real names required)

---

## 📈 Scalability Considerations

### Current State (MVP)
- Single instance (API + Web together)
- SQLite or PostgreSQL
- In-memory cache
- No load balancer needed

### Scaling Path (Future)
1. **Separate API & Web**
   - Docker containers
   - Kubernetes orchestration

2. **Database**
   - Read replicas
   - Connection pooling (PgBouncer)
   - Caching layer (Redis)

3. **Frontend**
   - CDN for static wiki pages
   - Image optimization (Next.js Image)

4. **Monitoring**
   - Prometheus metrics
   - Grafana dashboards
   - ELK stack for logs

---

## 🚀 Performance Targets

| Metric | Target | How |
|--------|--------|-----|
| First Contentful Paint (FCP) | < 1s | Pre-rendering, Tailwind CSS |
| Largest Contentful Paint (LCP) | < 2.5s | Optimized images, lazy loading |
| Cumulative Layout Shift (CLS) | < 0.1 | Fixed sizes, no late-loaded ads |
| Time to Interactive (TTI) | < 3.5s | Minimal JS, code splitting |
| API Response | < 200ms | DB indexing, caching |

---

## 🧪 Testing Strategy

### Current
- TypeScript for compile-time safety
- Build validation

### Future
- Unit tests (Jest) for utilities
- Integration tests (API routes)
- E2E tests (Playwright) for wiki
- Performance tests (k6)

---

## 📚 Example: Adding a New Wiki Article

```typescript
// 1. Add content to apps/web/src/data/terpira/wiki.ts
{
  slug: "my-new-article",
  title: "My Topic",
  category: "anbau",
  difficulty: "einsteiger",
  simpleExplainers: [ { title, text }, ... ],
  faq: [ { question, answer }, ... ],
  glossary: [ { term, definition }, ... ],
  sourceIds: [ "id1", "id2", ... ],
  relatedSlugs: [ ... ],
  // ... other fields
}

// 2. Add sources to sourceRegister if needed
{
  id: "my-new-source",
  title: "...",
  publisher: "...",
  year: "2024",
  url: "https://..."
}

// 3. Rebuild
npm run build

// 4. Deploy (pre-renders automatically)
```

---

## 🔍 Debugging Tips

### API Issues
```bash
# Check health
curl http://localhost:4000/health

# Check status report
curl http://localhost:4000/public/status-report

# Logs
cd apps/api && npm run dev
# Look for TypeScript errors
```

### Frontend Issues
```bash
# Check dev server
cd apps/web && npm run dev

# Build cache
rm -rf .next

# Rebuild
npm run build
```

### Wiki Generation
```bash
# Check wiki.ts syntax
npm run typecheck

# Rebuild wiki pages
rm -rf apps/web/.next
npm run build

# Check output
ls -la apps/web/.next/server/app/wiki/
```

---

## 🎯 Future Improvements

1. **Full-text search** on wiki articles (Meilisearch, Algolia)
2. **Internationalization** (i18n for German, English, French?)
3. **Community ratings** on articles
4. **Weekly wiki updates** (fetch new papers via RSS)
5. **Mobile app** (React Native)
6. **Analytics** (Plausible, Fathom - privacy-first)

---

**Last Updated**: 26.03.2026
**Status**: MVP Architecture
