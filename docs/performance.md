# Performance Optimization

## NovaCRM AI — Enterprise AI-Powered CRM Platform

**Version:** 1.0  
**Last Updated:** July 2026

---

## Table of Contents

1. [Performance Targets](#1-performance-targets)
2. [Frontend Optimization](#2-frontend-optimization)
3. [Backend Optimization](#3-backend-optimization)
4. [Database Optimization](#4-database-optimization)
5. [Caching Strategy](#5-caching-strategy)
6. [Network Optimization](#6-network-optimization)
7. [Monitoring & Observability](#7-monitoring--observability)
8. [Performance Budget](#8-performance-budget)
9. [Load Testing](#9-load-testing)

---

## 1. Performance Targets

### Core Web Vitals

| Metric | Target | Description |
|--------|--------|-------------|
| LCP (Largest Contentful Paint) | < 2.5s | Perceived load speed |
| FID (First Input Delay) | < 100ms | Interactivity |
| CLS (Cumulative Layout Shift) | < 0.1 | Visual stability |
| TTFB (Time to First Byte) | < 800ms | Server responsiveness |
| TTI (Time to Interactive) | < 3s | Full interactivity |
| FCP (First Contentful Paint) | < 1.5s | First content rendered |

### API Performance

| Endpoint Type | Target P95 | Target P99 |
|--------------|-----------|-----------|
| Simple CRUD | < 100ms | < 300ms |
| List with pagination | < 200ms | < 500ms |
| Search queries | < 500ms | < 1s |
| AI inference | < 3s | < 5s |
| File operations | < 2s | < 5s |
| Bulk operations | < 5s | < 10s |

### Lighthouse Scores

| Category | Target |
|----------|--------|
| Performance | ≥ 95 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 95 |
| SEO | ≥ 100 |

---

## 2. Frontend Optimization

### Code Splitting & Lazy Loading

#### Route-Level Splitting

Every route is code-split using React.lazy() and Suspense:

`	ypescript
const LeadsPage = React.lazy(() => import('./pages/LeadsPage'));
const DealsPage = React.lazy(() => import('./pages/DealsPage'));
const ReportsPage = React.lazy(() => import('./pages/ReportsPage'));

function AppRouter() {
  return (
    <Routes>
      <Route path="/leads" element={
        <Suspense fallback={<PageSkeleton />}>
          <LeadsPage />
        </Suspense>
      } />
      <Route path="/deals" element={
        <Suspense fallback={<PageSkeleton />}>
          <DealsPage />
        </Suspense>
      } />
    </Routes>
  );
}
`

#### Component-Level Splitting

Heavy components within a page are also lazy-loaded:

- Charts and data visualization libraries (Recharts, D3)
- Rich text editors
- PDF generators
- AI chat interfaces
- File upload previewers

#### Dynamic Imports

`	ypescript
// Heavy libraries loaded on demand
const { generatePDF } = await import('@/lib/pdf-generator');
const { default: ReactQuill } = await import('react-quill');
`

### Bundle Analysis & Optimization

#### Bundle Size Monitoring

`
Main bundle (initial):  < 150KB gzipped
Route chunks:           < 50KB gzipped each  
Vendor bundle:          < 80KB gzipped
Total initial:          < 300KB gzipped
`

#### Tree Shaking

- All imports use named imports to enable tree shaking
- Side-effect-free packages preferred
- lodash replaced with lodash-es for better tree shaking
- date-fns over moment.js (modular, tree-shakeable)
- Icon imports are individual (lucide-react tree-shakeable)

`	ypescript
// Good - tree-shakeable
import { format } from 'date-fns';
import { User, Mail, Phone } from 'lucide-react';

// Bad - imports entire library
import { format } from 'date-fns/format';  // still fine
// import _ from 'lodash'; // imports entire lodash
`

#### Manual Chunks (Vite)

`	ypescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        charts: ['recharts'],
        ai: ['@langchain/core', 'ai'],
      },
    },
  },
},
`

### Image Optimization

#### Formats & Compression

| Asset Type | Format | Compression | Dimensions |
|-----------|--------|-------------|------------|
| Photos | WebP (with JPEG fallback) | Quality 80 | Responsive srcset |
| Icons | SVG (inlined) | SVGO minified | As designed |
| Logos | WebP/AVIF | Lossless | 2x for retina |
| Avatars | WebP | Quality 70 | 48x48, 96x96, 192x192 |
| Backgrounds | WebP | Quality 60 | Max 1920px |

#### Implementation

`	ypescript
// Using Vite's built-in image optimization
// vite.config.ts
import imageminWebp from 'vite-plugin-imagemin-webp';

plugins: [
  imageminWebp({
    quality: 80,
    method: 6,
  }),
];

// Lazy loading with intersection observer
<img
  src={image.src}
  loading="lazy"
  decoding="async"
  width={image.width}
  height={image.height}
  alt={image.alt}
/>
`

#### Critical Images

Above-the-fold images are eagerly loaded with explicit dimensions to prevent CLS:

`html
<img
  src="hero.webp"
  width="1200"
  height="600"
  fetchpriority="high"
  alt="Dashboard preview"
/>
`

### Virtual Scrolling

Large lists and tables use virtual scrolling via TanStack Virtual:

`	ypescript
import { useVirtualizer } from '@tanstack/react-virtual';

const parentRef = useRef<HTMLDivElement>(null);
const virtualizer = useVirtualizer({
  count: leads.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 52, // row height
  overscan: 5,
});

// Only renders visible rows + overscan
// For 100,000 leads, DOM nodes stay under 30
`

#### Virtual Scroll Use Cases

| Component | Expected Items | Virtualization | 
|-----------|---------------|----------------|
| Lead table | Up to 100,000 | Yes (TanStack Virtual) |
| Contact list | Up to 50,000 | Yes |
| Activity feed | Up to 10,000 | Yes (infinite scroll) |
| Email inbox | Up to 20,000 | Yes |
| Dropdown selects | Up to 1,000 | Yes (downshift + virtual) |

### Prefetching & Preloading

#### Route Prefetching

`	ypescript
// Prefetch routes on hover/mount
import { usePrefetch } from '@/hooks/usePrefetch';

function SidebarLink({ to, label }) {
  const prefetch = usePrefetch(to);
  return (
    <Link
      to={to}
      onMouseEnter={prefetch}
      onFocus={prefetch}
    >
      {label}
    </Link>
  );
}
`

#### Data Prefetching (TanStack Query)

`	ypescript
// Prefetch data before user navigates
const queryClient = useQueryClient();

const prefetchLeads = () => {
  queryClient.prefetchQuery({
    queryKey: ['leads', { page: 1 }],
    queryFn: () => fetchLeads({ page: 1 }),
    staleTime: 30_000,
  });
};
`

#### Resource Hints

`html
<!-- DNS prefetch for third-party domains -->
<link rel="dns-prefetch" href="//api.novacrm.ai" />
<link rel="dns-prefetch" href="//fonts.googleapis.com" />

<!-- Preconnect for critical origins -->
<link rel="preconnect" href="https://api.novacrm.ai" />
<link rel="preconnect" href="https://fonts.googleapis.com" />

<!-- Preload critical fonts -->
<link
  rel="preload"
  href="/fonts/inter-var.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
`

### State Management Performance

#### Zustand Store Slicing

`	ypescript
// Stores are sliced by domain to minimize re-renders
const useLeadStore = create<LeadStore>()((set) => ({
  leads: [],
  selectedLead: null,
  filters: {},
  setLeads: (leads) => set({ leads }),
}));

// Components only subscribe to slices they need
const leads = useLeadStore((state) => state.leads);
const setLeads = useLeadStore((state) => state.setLeads);
`

#### TanStack Query for Server State

All server state is managed by TanStack Query, not Zustand:

`	ypescript
// Automatic caching, background refetching, stale management
const { data, isLoading, error } = useQuery({
  queryKey: ['leads', filters],
  queryFn: () => leadApi.getAll(filters),
  staleTime: 30_000,         // 30s before considered stale
  gcTime: 5 * 60 * 1000,    // 5min garbage collection
  keepPreviousData: true,    // Smooth pagination transitions
});
`

---

## 3. Backend Optimization

### Request Processing Pipeline

`
Client → CDN (Vercel Edge) → Load Balancer → Express Server → Redis Cache → Database
`

### Connection Pooling

`	ypescript
// Prisma connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool size
  // Pool: 20 connections per instance
  // Min: 2 connections
  // Max: 20 connections
  // Idle timeout: 30 seconds
});
`

### Response Compression

`	ypescript
import compression from 'compression';

// Brotli preferred, falls back to gzip
app.use(compression({
  brotli: { enabled: true, quality: 11 },
  threshold: 1024, // Only compress > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));
`

### Middleware Order (Performance-First)

`	ypescript
app.use(helmet());           // Security headers
app.use(compression());       // Response compression (early)
app.use(cors(corsOptions));   // CORS
app.use(express.json({       // JSON parsing with size limit
  limit: '1mb',
}));
app.use(rateLimiter);         // Rate limiting
app.use(authMiddleware);      // Authentication (after rate limiting)
`

### API Response Optimization

- All API responses use JSON with no unnecessary fields
- Pagination enforced on all list endpoints (max 100 per page)
- Sparse field sets (client specifies fields via ?fields=id,name,email)
- ETags for caching on GET requests
- Conditional requests (If-None-Match, If-Modified-Since)

---

## 4. Database Optimization

### Indexing Strategy

#### Primary Indexes

`sql
-- High-cardinality, frequently filtered columns
CREATE INDEX idx_leads_email ON "Lead" (email);
CREATE INDEX idx_leads_organization_status ON "Lead" (organization_id, status);
CREATE INDEX idx_deals_organization_stage ON "Deal" (organization_id, stage);
CREATE INDEX idx_contacts_organization_email ON "Contact" (organization_id, email);
CREATE INDEX idx_tasks_assignee_status ON "Task" (assignee_id, status);
`

#### Composite Indexes (Query Patterns)

`sql
-- Most common query patterns indexed
CREATE INDEX idx_leads_org_status_created 
ON "Lead" (organization_id, status, created_at DESC);

CREATE INDEX idx_deals_org_stage_value 
ON "Deal" (organization_id, stage, value DESC);

CREATE INDEX idx_activities_org_timestamp 
ON "Activity" (organization_id, created_at DESC);
`

#### Full-Text Search Indexes

`sql
-- GIN indexes for full-text search
CREATE INDEX idx_leads_search ON "Lead" 
USING gin(to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(email, '')));

CREATE INDEX idx_contacts_search ON "Contact" 
USING gin(to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(email, '')));
`

#### Index Maintenance

| Index Type | Maintenance | Frequency |
|-----------|-------------|-----------|
| B-tree | Reindex | Monthly |
| GIN | Autovacuum tuning | Continuous |
| Partial | Review | Quarterly |
| Covering | Monitor | Monthly |

### Query Optimization

#### N+1 Prevention

`	ypescript
// Bad: N+1 queries
const deals = await prisma.deal.findMany();
for (const deal of deals) {
  const contact = await prisma.contact.findUnique({ where: { id: deal.contactId } });
}

// Good: Single query with includes
const deals = await prisma.deal.findMany({
  include: {
    contact: true,
    company: true,
    owner: {
      select: { id: true, name: true, email: true },
    },
  },
  where: { organizationId },
  take: 20,
});
`

#### Pagination Patterns

`	ypescript
// Cursor-based pagination (preferred for large datasets)
const leads = await prisma.lead.findMany({
  take: 20 + 1, // +1 to check if more
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: 'desc' },
  where: { organizationId },
});

const hasMore = leads.length > 20;
const items = hasMore ? leads.slice(0, 20) : leads;
const nextCursor = hasMore ? items[items.length - 1].id : null;

// Offset-based (acceptable for small datasets < 1000 pages)
const page = await prisma.lead.findMany({
  skip: (pageNumber - 1) * pageSize,
  take: pageSize,
  where: { organizationId },
});
`

### Query Timeouts

`	ypescript
// Global query timeout
await prisma.SET statement_timeout = '30s';

// Per-query timeout for heavy operations
await prisma.lead.findMany({
  where: { organizationId },
  // Timeout handled at application level
}).then(result => {
  clearTimeout(timeout);
  return result;
}).catch(error => {
  if (error.message?.includes('canceling statement due to statementTimeout')) {
    throw new AppError('Query timed out', 503);
  }
  throw error;
});
`

---

## 5. Caching Strategy

### Redis Cache Layers

#### Session Cache

| Key Pattern | TTL | Purpose |
|------------|-----|---------|
| session:{userId} | 7 days | Refresh token storage |
| session:activity:{userId} | 1 hour | Idle session tracking |
| session:sso:{token} | 5 min | SSO state parameter |

#### Query Result Cache

| Key Pattern | TTL | Invalidation |
|------------|-----|-------------|
| query:leads:{orgId}:{filters} | 30s | On lead create/update/delete |
| query:deals:{orgId}:{filters} | 30s | On deal create/update/delete |
| query:dashboard:{orgId} | 60s | On any related change |
| query:reports:{orgId}:{reportId} | 5min | On report generation |

#### Rate Limiting

| Key Pattern | TTL | Purpose |
|------------|-----|---------|
| ratelimit:api:{userId} | 1 min | API rate limiting |
| ratelimit:auth:{ip} | 15 min | Auth rate limiting |
| ratelimit:login:{email} | 15 min | Login attempt limiting |

#### Cache-Aside Pattern

`	ypescript
async function getCachedData(key: string, fetchFn: () => Promise<any>, ttl: number) {
  // Try cache
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const data = await fetchFn();

  // Store in cache
  await redis.setex(key, ttl, JSON.stringify(data));

  return data;
}
`

#### Cache Invalidation

`	ypescript
// Event-driven cache invalidation
async function invalidateLeadCache(organizationId: string) {
  const pattern = query:leads::*;
  let cursor = '0';
  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    cursor = nextCursor;
  } while (cursor !== '0');
  
  // Also invalidate dashboard cache
  await redis.del(query:dashboard:);
}
`

### Browser Cache

#### Cache Headers

| Resource Type | Cache-Control | CDN Cache |
|--------------|---------------|-----------|
| Static assets (JS, CSS) | public, max-age=31536000, immutable | Yes |
| Font files | public, max-age=31536000, immutable | Yes |
| Images (user uploads) | public, max-age=86400 | Yes |
| API responses | private, no-cache | No |
| HTML pages | public, max-age=0, must-revalidate | Yes |

#### Service Worker Cache

`	ypescript
// Cache strategies
// - Network first: API requests
// - Cache first: Static assets
// - Stale while revalidate: Fonts, images
// - Network only: Auth requests

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(networkFirst(event.request));
  } else if (isStaticAsset(event.request)) {
    event.respondWith(cacheFirst(event.request));
  }
});
`

---

## 6. Network Optimization

### CDN (Vercel Edge Network)

- Global CDN with 100+ edge locations
- Static assets served from edge (JS, CSS, fonts, images)
- API responses served from nearest region
- Edge caching for public resources
- DDoS protection at edge

### Compression

| Algorithm | Level | Priority | Content Types |
|-----------|-------|----------|---------------|
| Brotli | 11 | Primary | HTML, JS, CSS, JSON, SVG |
| Gzip | 9 | Fallback | All (when Brotli unsupported) |

### HTTP/2 & HTTP/3

- HTTP/2 multiplexing for concurrent requests
- HTTP/3 (QUIC) for reduced latency on mobile networks
- Server push for critical CSS/fonts (used sparingly)
- Header compression (HPACK/QPACK)

### Resource Hints

`html
<!-- Preconnect to API origin -->
<link rel="preconnect" href="https://api.novacrm.ai" />

<!-- DNS-prefetch for third-party origins -->
<link rel="dns-prefetch" href="https://stripe.com" />
<link rel="dns-prefetch" href="https://slack.com" />

<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin />
`

---

## 7. Monitoring & Observability

### Real User Monitoring (RUM)

`	ypescript
// Web Vitals tracking
import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals';

onCLS(console.log);
onFCP(console.log);
onLCP(console.log);
onTTFB(console.log);

// Sent to analytics endpoint
function sendToAnalytics(metric: any) {
  const body = JSON.stringify(metric);
  navigator.sendBeacon('/api/analytics/vitals', body);
}
`

### Metrics Dashboard

| Metric | Data Source | Alert Threshold |
|--------|-------------|-----------------|
| API P95 latency | DataDog APM | > 500ms |
| Error rate | Sentry | > 1% |
| Cache hit ratio | Redis | < 70% |
| CDN cache hit ratio | Vercel | < 80% |
| Bundle size | Lighthouse CI | > 300KB gzip |
| LCP | RUM | > 2.5s |
| TTFB | RUM | > 800ms |

### APM (Application Performance Monitoring)

`	ypescript
// DataDog APM integration
import tracer from 'dd-trace';

tracer.init({
  service: 'novacrm-api',
  env: process.env.NODE_ENV,
  logInjection: true,
  runtimeMetrics: true,
  profiling: true,
});
`

### Logging

`	ypescript
// Structured JSON logging
logger.info({
  event: 'deal.created',
  dealId: deal.id,
  value: deal.value,
  organizationId: deal.organizationId,
  duration: Date.now() - start,
});
`

---

## 8. Performance Budget

### Bundle Budget (Gzipped)

| Asset | Budget | Current | Status |
|-------|--------|---------|--------|
| Main entry (index.js) | < 50KB | — | ⏳ |
| Vendor bundle | < 80KB | — | ⏳ |
| UI components | < 30KB | — | ⏳ |
| CSS (critical) | < 15KB | — | ⏳ |
| Total initial JS | < 200KB | — | ⏳ |
| Total initial CSS | < 30KB | — | ⏳ |

### Runtime Budget

| Operation | Budget |
|-----------|--------|
| API response (simple) | < 100ms |
| API response (complex) | < 500ms |
| Database query (indexed) | < 50ms |
| Database query (search) | < 500ms |
| Redis read | < 5ms |
| Redis write | < 10ms |
| Page render (initial) | < 2s |
| Page render (subsequent) | < 500ms |
| AI inference | < 3s |

### CI Pipeline Checks

`yaml
# Performance checks run on every PR
- name: Bundle Size
  run: npx bundlesize
- name: Lighthouse CI
  run: npx lhci autorun
- name: Load Test
  run: npx artillery run tests/load/smoke.yml
`

---

## 9. Load Testing

### Scenarios

| Scenario | Users | Duration | Target |
|----------|-------|----------|--------|
| Smoke test | 10 | 1 min | API < 200ms |
| Load test | 500 | 10 min | API < 300ms |
| Stress test | 2000 | 5 min | No errors |
| Spike test | 0 → 1000 → 0 | 2 min | Auto-scale within 30s |
| Soak test | 500 | 2 hours | No memory leaks |

### Tools

- **Artillery:** API load testing (YAML-based scenarios)
- **k6:** Performance testing for CI/CD pipeline
- **Lighthouse CI:** Frontend performance regression detection
- **WebPageTest:** Multi-location performance analysis

### Performance Regression Policy

- Any PR that increases LCP by > 10% requires optimization
- API P99 > 500ms triggers performance review
- Bundle size increase > 10KB requires justification
- Failed Lighthouse CI blocks merge

---

*This document is maintained by the NovaCRM Engineering Team. Last reviewed: July 2026.*
