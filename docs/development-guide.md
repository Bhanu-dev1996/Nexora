# NovaCRM AI — Development Guide

> Contributor guidelines, workflows, and conventions for the NovaCRM AI codebase.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Git Workflow](#git-workflow)
3. [Branch Naming](#branch-naming)
4. [Commit Conventions](#commit-conventions)
5. [Local Development Setup](#local-development-setup)
6. [Code Style](#code-style)
7. [Pull Request Process](#pull-request-process)
8. [Code Review Guidelines](#code-review-guidelines)
9. [Testing Requirements](#testing-requirements)
10. [Architecture Decisions](#architecture-decisions)

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 20.11 LTS | Runtime |
| npm | ≥ 10.x | Package manager |
| PostgreSQL | ≥ 16 | Database |
| Redis | ≥ 7.x | Caching, queues |
| Git | ≥ 2.40 | Version control |
| Docker | ≥ 24.x (optional) | Containerized dev services |

Install the recommended VS Code extensions listed in `.vscode/extensions.json`.

---

## Git Workflow

NovaCRM uses **GitHub Flow** — a lightweight, branch-based workflow.

### Branches

| Branch | Purpose | Protected |
|--------|---------|-----------|
| `main` | Production-ready code | Yes |
| `feature/*` | New features | No |
| `bugfix/*` | Bug fixes (non-urgent) | No |
| `hotfix/*` | Urgent production fixes | No |
| `chore/*` | Tooling, deps, config | No |

### Workflow

```
1. Pull latest main
   git checkout main && git pull origin main

2. Create feature branch
   git checkout -b feature/deal-pipeline-kanban

3. Make changes, commit often (see Commit Conventions)

4. Push and open PR
   git push -u origin feature/deal-pipeline-kanban

5. Address review feedback (new commits, never force-push to PR branch)

6. Squash-merge into main after approval + CI pass

7. Delete remote branch automatically
```

### Rules

- **Never** push directly to `main`.
- **Never** force-push to a PR branch after review has started.
- **Always** rebase on `main` if your branch is behind (before merge).
- Keep PRs small and focused — ideally under 400 lines changed.
- Reference issue numbers in PR descriptions (`Closes #123`).

---

## Branch Naming

Use the format: `<type>/<short-description>`

```
feature/deal-pipeline-kanban
feature/ai-email-generation
bugfix/contact-search-not-filtering
bugfix/deal-value-not-updating
hotfix/auth-token-expiry-crash
chore/update-prisma-to-6.x
chore/configure-oxlint
```

**Rules:**
- Lowercase only.
- Use hyphens (not underscores or spaces).
- Keep description under 50 characters.
- Be descriptive but concise.

---

## Commit Conventions

NovaCRM follows **Conventional Commits** (`conventionalcommits.org`).

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | When to Use | Example |
|------|------------|---------|
| `feat` | New feature | `feat(deals): add drag-and-drop pipeline board` |
| `fix` | Bug fix | `fix(auth): handle expired refresh token gracefully` |
| `docs` | Documentation only | `docs: add API endpoint reference for contacts` |
| `style` | Formatting, no logic change | `style: fix indentation in sidebar component` |
| `refactor` | Code restructuring, no feature/fix | `refactor(contacts): extract filter logic to custom hook` |
| `test` | Adding or updating tests | `test(deals): add unit tests for pipeline service` |
| `chore` | Tooling, deps, CI config | `chore: add vitest coverage configuration` |
| `perf` | Performance improvement | `perf(query): add index for contact search` |
| `ci` | CI/CD changes | `ci: add playwright e2e workflow` |
| `build` | Build system changes | `build: configure vite code splitting` |
| `revert` | Revert a commit | `revert: undo contact import regression` |

### Scopes

Use the affected module as scope:

```
auth, contacts, companies, deals, tasks, pipeline,
calendar, email, notifications, search, analytics,
ai, automation, admin, billing, api-keys, audit,
ui, layout, database, infra, config
```

### Examples

```
feat(contacts): implement CSV import with field mapping

- Add CSV parser utility with automatic column detection
- Create import preview modal with field mapping UI
- Implement bulk insert with progress tracking
- Handle duplicate detection by email

Closes #234
```

```
fix(deals): prevent race condition in stage updates

When two users move a deal simultaneously, the last write now
wins with an optimistic lock check instead of silent overwrite.

Fixes #567
```

```
refactor(auth): extract token refresh into reusable hook

Move token refresh logic from AuthProvider to useTokenRefresh
hook for reuse in API client and WebSocket handler.
```

### Commit Message Rules

- Subject line: imperative mood, lowercase, no period, max 72 characters.
- Body: explain **what** and **why**, not **how** (the code shows how).
- Reference issues in footer.
- One logical change per commit — don't mix unrelated changes.
- Don't commit generated files (`package-lock.json` changes are fine, `dist/` is not).

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/novacrm-ai.git
cd novacrm-ai
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
npm install

# Or install specific workspace
npm install --workspace=apps/web
npm install --workspace=apps/api
```

### 3. Environment Variables

```bash
# Backend
cp apps/api/.env.example apps/api/.env

# Frontend
cp apps/web/.env.example apps/web/.env
```

Fill in the values — see `setup-guide.md` for detailed variable descriptions.

### 4. Start Infrastructure Services

**Option A: Docker (recommended)**
```bash
docker-compose up -d postgres redis
```

**Option B: Local installation**
```bash
# Ensure PostgreSQL and Redis are running
# Then verify connection
psql -h localhost -U postgres -c "SELECT 1"
redis-cli ping
```

### 5. Initialize Database

```bash
# Run migrations
npm run db:migrate --workspace=apps/api

# Seed demo data
npm run db:seed --workspace=apps/api

# Open Prisma Studio (optional)
npm run db:studio --workspace=apps/api
```

### 6. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev --workspace=apps/web    # Frontend on :5173
npm run dev --workspace=apps/api    # Backend on :4000
```

### 7. Verify

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api/health
- Prisma Studio: http://localhost:5555

---

## Code Style

### General Principles

1. **Clarity over cleverness** — write code that your teammates can understand in 30 seconds.
2. **Consistency** — follow existing patterns in the codebase.
3. **Minimal abstractions** — don't abstract until you have at least 3 uses.
4. **Colocation** — keep related code close together.

### TypeScript

```typescript
// ✅ Good: explicit return types on exported functions
export function calculateDealWeightedValue(deal: Deal): number {
  return deal.value * (deal.probability / 100);
}

// ✅ Good: discriminated unions for state
type ContactListState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; contacts: Contact[]; total: number };

// ❌ Bad: any type
function processData(data: any): any { ... }

// ❌ Bad: non-null assertion
const name = user!.profile!.name!;
```

**Rules:**
- Strict mode enabled (`strict: true` in tsconfig).
- No `any` — use `unknown` and narrow with type guards.
- Prefer `interface` for object shapes, `type` for unions/intersections.
- Use `satisfies` operator for type checking without widening.
- Export types that are used outside the file.

### React Components

```tsx
// ✅ Good: Named function component with explicit props type
interface ContactCardProps {
  contact: Contact;
  onSelect: (id: string) => void;
  isSelected?: boolean;
}

export function ContactCard({ contact, onSelect, isSelected }: ContactCardProps) {
  return (
    <Card
      className={cn('cursor-pointer', isSelected && 'ring-2 ring-primary')}
      onClick={() => onSelect(contact.id)}
    >
      {/* content */}
    </Card>
  );
}

// ✅ Good: Compose hooks for logic separation
export function useContactList() {
  const [filters, setFilters] = useState<ContactFilters>(DEFAULT_FILTERS);
  const query = useQuery({
    queryKey: ['contacts', filters],
    queryFn: () => contactService.list(filters),
  });
  return { ...query, filters, setFilters };
}
```

**Rules:**
- One component per file (named export, not default).
- File name matches component name in PascalCase.
- Co-locate styles, tests, and types with the component.
- Extract reusable logic into custom hooks.
- Use React 19 features: `use()`, `useOptimistic`, `useTransition`.
- Prefer composition over prop drilling — use context sparingly.

### File Naming

```
apps/web/src/
├── components/
│   ├── contacts/
│   │   ├── ContactCard.tsx        ← PascalCase for components
│   │   ├── ContactList.tsx
│   │   ├── contact-filters.tsx    ← kebab-case for non-component files
│   │   └── use-contacts.ts        ← kebab-case for hooks (or useContacts.tsx)
│   └── ui/                        ← shadcn components (don't modify directly)
├── hooks/
│   ├── use-debounce.ts            ← kebab-case with "use-" prefix
│   └── use-local-storage.ts
├── lib/
│   ├── utils.ts                   ← utilities
│   └── cn.ts                      ← className helper
├── stores/
│   ├── auth.store.ts              ← dot notation for store files
│   └── ui.store.ts
├── services/
│   ├── contact.service.ts         ← dot notation for service files
│   └── deal.service.ts
└── types/
    └── index.ts                   ← barrel exports

apps/api/src/
├── controllers/
│   ├── contact.controller.ts      ← dot notation
│   └── deal.controller.ts
├── services/
│   ├── contact.service.ts
│   └── deal.service.ts
├── middleware/
│   ├── authenticate.ts
│   └── validate.ts
└── lib/
    ├── prisma.ts
    └── redis.ts
```

### CSS / Tailwind

```tsx
// ✅ Good: Use cn() utility for conditional classes
import { cn } from '@/lib/cn';

<div className={cn(
  'base-styles',
  isActive && 'active-styles',
  className  // always accept className prop for composition
)} />

// ✅ Good: Extract repeated patterns to constants
const CARD_STYLES = 'rounded-lg border bg-card p-4 shadow-sm';

// ❌ Bad: Long inline class strings
<div className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 shadow-sm hover:bg-accent" />
```

**Rules:**
- Use Tailwind utility classes — avoid custom CSS when possible.
- Use `cn()` (clsx + tailwind-merge) for conditional classes.
- Define color tokens in the theme, not hardcoded Tailwind colors.
- Keep class strings under 100 characters — extract to constants if longer.

### API Conventions

```typescript
// ✅ Good: RESTful route naming
GET    /api/contacts           → List contacts
GET    /api/contacts/:id       → Get contact
POST   /api/contacts           → Create contact
PATCH  /api/contacts/:id       → Update contact
DELETE /api/contacts/:id       → Delete contact

// ✅ Good: Consistent response shape
{
  "data": { ... },           // Single resource
  "data": [...],             // Collection
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}

// ✅ Good: Consistent error shape
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      { "field": "email", "message": "Must be a valid email" }
    ]
  }
}
```

**Rules:**
- Plural nouns for collections (`/api/contacts`, not `/api/contact`).
- Use PATCH for partial updates, PUT for full replacement.
- Return 201 for created, 204 for deleted (no content).
- Use cursor-based pagination for large datasets, offset for small.
- Validate all inputs with Zod schemas at the controller boundary.

### Linting & Formatting

**Oxlint** (fast linting):
```json
// .oxlintrc.json
{
  "plugins": ["react", "typescript", "import"],
  "rules": {
    "no-unused-vars": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "react/jsx-key": "error",
    "react-hooks/rules-of-hooks": "error",
    "import/no-duplicates": "error",
    "typescript/no-explicit-any": "warn"
  }
}
```

**Prettier** (formatting):
```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

**Run linting:**
```bash
npm run lint          # Oxlint
npm run format        # Prettier
npm run typecheck     # TypeScript
```

---

## Pull Request Process

### Creating a PR

1. **Push your branch** to origin.
2. **Open a PR** against `main`.
3. **Fill out the PR template:**
   ```markdown
   ## What does this PR do?
   Brief description of the change.

   ## Why?
   Context for why this change is needed.

   ## How?
   Key implementation details (if non-obvious).

   ## Screenshots/Recording
   For UI changes, include before/after.

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests added/updated
   - [ ] Manual testing done (describe steps)

   ## Checklist
   - [ ] Code follows project style guidelines
   - [ ] Self-review completed
   - [ ] Comments added for complex logic
   - [ ] Documentation updated (if applicable)
   - [ ] No new warnings from linter/typechecker
   - [ ] Tests pass locally
   ```
4. **Request review** from at least 1 team member.
5. **Ensure CI passes** before requesting review.

### PR Size Guidelines

| Size | Lines Changed | Review Time | Guideline |
|------|--------------|-------------|-----------|
| XS | 1–50 | 15 min | Quick review |
| S | 51–200 | 30 min | Standard review |
| M | 201–400 | 1 hour | Consider splitting |
| L | 401+ | 2+ hours | **Must split into smaller PRs** |

### After Approval

- **Squash-merge** into `main` (keeps history clean).
- Delete the feature branch.
- Reference the issue in the merge commit description.

---

## Code Review Guidelines

### For Authors

- Self-review your own PR before requesting review.
- Write a clear PR description — assume the reviewer has no context.
- Keep PRs focused on one change.
- Respond to all comments (even with "Done" or an explanation).
- Don't take feedback personally — the goal is better code.

### For Reviewers

**Priority order:**
1. **Correctness** — Does it work? Are there bugs?
2. **Security** — Any vulnerabilities? Input validation? Auth checks?
3. **Architecture** — Does it fit the existing patterns? Right abstractions?
4. **Readability** — Will the team understand this in 6 months?
5. **Tests** — Adequate coverage? Edge cases tested?
6. **Performance** — Any N+1 queries? Unnecessary re-renders?
7. **Style** — Minor formatting, naming (let the linter handle most).

**Review etiquette:**
- Be constructive, not critical. Suggest alternatives instead of just saying "no."
- Use conventional comment prefixes:
  - `nit:` — minor style preference, not blocking
  - `suggestion:` — consider this alternative
  - `question:` — I don't understand this, please explain
  - `blocker:` — must fix before merge
  - `praise:` — nice work on this part!
- Approve with minor nits — don't block on formatting.
- Respond to reviews within 24 hours.

---

## Testing Requirements

### Coverage Targets

| Module | Minimum Coverage |
|--------|-----------------|
| Services (business logic) | 90% |
| Controllers (API handlers) | 80% |
| React Components | 80% |
| Custom Hooks | 85% |
| Utilities | 95% |
| Overall | 80% |

### What to Test

- **Services:** All business logic, edge cases, error paths.
- **Controllers:** Request handling, validation, response format.
- **Components:** Rendering, user interactions, state changes.
- **Hooks:** State management, side effects, return values.
- **Utilities:** Pure functions, boundary conditions.

### What NOT to Test

- Third-party library internals.
- Trivial pass-through functions.
- Framework-generated code (Prisma client, etc.).
- CSS styling (use visual regression tests instead).
- TypeScript type-level logic (the compiler tests this).

### Running Tests

```bash
npm test                 # Run all tests (Vitest)
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:e2e         # Playwright E2E tests
```

### CI Enforcement

- All tests must pass before merge.
- Coverage cannot decrease (enforced in CI).
- E2E tests run on `main` and release branches.

---

## Architecture Decisions

### Key Patterns

| Pattern | Where | Rationale |
|---------|-------|-----------|
| Service Layer | Backend | Separates business logic from HTTP handling |
| Repository Pattern | Database queries | Prisma acts as repository; services consume it |
| Custom Hooks | Frontend | Encapsulates reusable React logic |
| Zustand Stores | Frontend | Lightweight global state (auth, UI) |
| TanStack Query | Server state | Caching, refetching, optimistic updates |
| Middleware Chain | Backend | Composable request processing |
| Event-Driven | Automation | Workflows triggered by domain events |

### Data Flow

```
User Action
  → React Component
    → Custom Hook
      → TanStack Query / Zustand
        → API Service (fetch/axios)
          → Express Controller
            → Zod Validation
              → Service Layer
                → Prisma ORM
                  → PostgreSQL
```

### Error Handling Strategy

**Frontend:**
- TanStack Query `onError` → toast notification.
- Form validation → inline error messages.
- Route errors → Error Boundary → fallback UI.
- API errors → centralized error interceptor.

**Backend:**
- Controller catches service errors → maps to HTTP status.
- `AppError` class for domain errors with status codes.
- Global error handler catches unhandled errors → 500.
- Zod validation errors → 400 with field details.

### Security Checklist (Per Feature)

- [ ] Input validated with Zod on the server.
- [ ] Authentication required (middleware).
- [ ] Authorization checked (role/permission).
- [ ] Organization scoping applied (multi-tenancy).
- [ ] SQL injection prevented (Prisma parameterized queries).
- [ ] XSS prevented (React escaping + CSP).
- [ ] Rate limiting applied.
- [ ] Audit log entry created (if sensitive data).
