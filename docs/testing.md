# NovaCRM AI — Testing Guide

> Testing strategy, conventions, and examples for the NovaCRM AI codebase.

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Testing Stack](#testing-stack)
3. [Test File Structure](#test-file-structure)
4. [Unit Tests (Vitest)](#unit-tests-vitest)
5. [Integration Tests](#integration-tests)
6. [E2E Tests (Playwright)](#e2e-tests-playwright)
7. [Mocking Strategies](#mocking-strategies)
8. [CI Test Pipeline](#ci-test-pipeline)
9. [Coverage Goals](#coverage-goals)
10. [Test Examples](#test-examples)

---

## Testing Philosophy

- **Test behavior, not implementation.** Tests should survive refactors.
- **Tests are documentation.** A new contributor should understand the system by reading tests.
- **Fast feedback loop.** Unit tests run in < 5s. Integration tests in < 30s. E2E in < 5 min.
- **Deterministic.** No flaky tests. If a test is flaky, fix it immediately and never skip it.
- **Isolated.** Tests do not depend on each other or external state. Each test cleans up after itself.

### Testing Pyramid

```
         /\
        /  \         E2E Tests (5%)
       /    \        Critical user flows
      /------\
     /        \      Integration Tests (25%)
    /          \     API endpoints, DB operations
   /------------\
  /              \   Unit Tests (70%)
 /                \  Functions, hooks, components
/------------------\
```

---

## Testing Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| **Unit Tests** | Vitest | Component, hook, utility, service tests |
| **Component Tests** | Vitest + React Testing Library | React component rendering and interaction |
| **Integration Tests** | Vitest + Supertest | API endpoint testing with real DB |
| **E2E Tests** | Playwright | Full browser user flow tests |
| **Mocking** | Vitest built-in + MSW | HTTP mocking, module mocking |
| **Coverage** | Vitest built-in (v8) | Code coverage reporting |
| **Assertions** | Vitest expect + jest-dom | DOM assertions |

### Configuration

**Vitest config** (`vitest.config.ts`):

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/**/*.d.ts',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
```

**Test setup** (`src/test/setup.ts`):

```typescript
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

window.scrollTo = vi.fn();
```

---

## Test File Structure

### Naming Convention

Test files follow the pattern: `<filename>.test.ts` or `<filename>.test.tsx`

```
src/
├── components/
│   └── contacts/
│       ├── ContactCard.tsx
│       ├── ContactCard.test.tsx      <-- co-located test
│       ├── ContactList.tsx
│       ├── ContactList.test.tsx
│       ├── contact-filters.ts
│       └── contact-filters.test.ts
├── hooks/
│   ├── use-contacts.ts
│   ├── use-contacts.test.ts
│   ├── use-debounce.ts
│   └── use-debounce.test.ts
├── services/
│   ├── contact.service.ts
│   └── contact.service.test.ts
├── lib/
│   ├── utils.ts
│   └── utils.test.ts
└── test/
    ├── setup.ts
    ├── factories.ts            <-- test data factories
    └── msw/
        └── handlers.ts         <-- MSW mock handlers

apps/api/src/
├── controllers/
│   ├── contact.controller.ts
│   └── contact.controller.test.ts
├── services/
│   ├── contact.service.ts
│   └── contact.service.test.ts
└── test/
    ├── setup.ts
    ├── helpers.ts
    └── factories.ts
```

### Separation by Test Type

For larger test suites, separate by directory:

```
tests/
├── unit/
│   ├── lib/
│   │   └── utils.test.ts
│   ├── hooks/
│   │   └── use-contacts.test.ts
│   └── services/
│       └── contact.service.test.ts
├── integration/
│   ├── contacts.test.ts
│   ├── deals.test.ts
│   └── auth.test.ts
└── e2e/
    ├── contact-management.spec.ts
    ├── deal-pipeline.spec.ts
    └── auth-flow.spec.ts
```

### Test Data Factories

Centralize test data creation:

```typescript
// src/test/factories.ts
import { type Contact, type Deal, type User } from '@prisma/client';

let counter = 0;

export function createTestUser(overrides: Partial<User> = {}): User {
  counter++;
  return {
    id: `user_test_${counter}`,
    email: `user${counter}@test.com`,
    firstName: 'Test',
    lastName: `User ${counter}`,
    passwordHash: '$2b$12$hashedpassword',
    role: 'MEMBER',
    isActive: true,
    avatar: null,
    lastLoginAt: null,
    organizationId: 'org_test_1',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestContact(overrides: Partial<Contact> = {}): Contact {
  counter++;
  return {
    id: `contact_test_${counter}`,
    firstName: 'John',
    lastName: `Doe ${counter}`,
    email: `john.doe${counter}@example.com`,
    phone: '+1-555-0100',
    jobTitle: 'Software Engineer',
    avatar: null,
    lifecycleStage: 'LEAD',
    leadSource: 'Website',
    score: 50,
    tags: [],
    customFields: null,
    organizationId: 'org_test_1',
    ownerId: 'user_test_1',
    companyId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createTestDeal(overrides: Partial<Deal> = {}): Deal {
  counter++;
  return {
    id: `deal_test_${counter}`,
    title: `Deal ${counter}`,
    value: 10000 + counter * 1000,
    currency: 'USD',
    stage: 'QUALIFICATION',
    probability: 25,
    expectedClose: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    closedAt: null,
    lostReason: null,
    organizationId: 'org_test_1',
    pipelineId: 'pipeline_test_1',
    ownerId: 'user_test_1',
    contactId: null,
    companyId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
```

---

## Unit Tests (Vitest)

### What to Unit Test

- Pure utility functions
- Custom hooks (state logic, side effects)
- Service methods (business logic)
- Component rendering and interactions
- Store logic (Zustand)
- Form validation schemas (Zod)

### Component Testing

```typescript
// src/components/contacts/ContactCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ContactCard } from './ContactCard';
import { createTestContact } from '@/test/factories';

describe('ContactCard', () => {
  const defaultProps = {
    contact: createTestContact({ firstName: 'Sarah', lastName: 'Chen' }),
    onSelect: vi.fn(),
    isSelected: false,
  };

  it('renders contact name and email', () => {
    render(<ContactCard {...defaultProps} />);
    expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText(/sarah\.chen/)).toBeInTheDocument();
  });

  it('calls onSelect with contact id when clicked', () => {
    render(<ContactCard {...defaultProps} />);
    fireEvent.click(screen.getByText('Sarah Chen'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith(defaultProps.contact.id);
  });

  it('applies selected styles when isSelected is true', () => {
    render(<ContactCard {...defaultProps} isSelected={true} />);
    const card = screen.getByTestId('contact-card');
    expect(card.className).toContain('ring-2');
  });

  it('displays lifecycle stage badge', () => {
    const contact = createTestContact({ lifecycleStage: 'LEAD' });
    render(<ContactCard {...defaultProps} contact={contact} />);
    expect(screen.getByText('Lead')).toBeInTheDocument();
  });

  it('renders avatar with initials when no avatar URL', () => {
    render(<ContactCard {...defaultProps} />);
    expect(screen.getByText('SC')).toBeInTheDocument();
  });
});
```

### Hook Testing

```typescript
// src/hooks/use-debounce.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useDebounce } from './use-debounce';

describe('useDebounce', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('debounces value changes', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } }
    );

    rerender({ value: 'world', delay: 500 });
    expect(result.current).toBe('hello');

    act(() => vi.advanceTimersByTime(500));
    expect(result.current).toBe('world');

    vi.useRealTimers();
  });
});
```

### Utility Function Testing

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  calculateDealWeightedValue,
  getInitials,
  debounce,
  slugify,
} from './utils';

describe('formatCurrency', () => {
  it('formats USD values correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('formats zero as $0.00', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });

  it('formats negative values with minus sign', () => {
    expect(formatCurrency(-500, 'USD')).toBe('-$500.00');
  });

  it('handles large numbers', () => {
    expect(formatCurrency(1000000, 'USD')).toBe('$1,000,000.00');
  });
});

describe('calculateDealWeightedValue', () => {
  it('multiplies value by probability percentage', () => {
    expect(calculateDealWeightedValue(100000, 75)).toBe(75000);
  });

  it('returns 0 when probability is 0', () => {
    expect(calculateDealWeightedValue(100000, 0)).toBe(0);
  });

  it('returns full value when probability is 100', () => {
    expect(calculateDealWeightedValue(100000, 100)).toBe(100000);
  });
});

describe('getInitials', () => {
  it('returns first letter of first and last name', () => {
    expect(getInitials('John', 'Doe')).toBe('JD');
  });

  it('handles single character names', () => {
    expect(getInitials('A', 'B')).toBe('AB');
  });

  it('handles names with spaces', () => {
    expect(getInitials('Mary Jane', 'Watson')).toBe('MW');
  });
});
```

### Service Layer Testing

```typescript
// apps/api/src/services/contact.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContactService } from './contact.service';
import { prismaMock } from '../test/helpers';

describe('ContactService', () => {
  let service: ContactService;

  beforeEach(() => {
    service = new ContactService(prismaMock as any);
  });

  describe('create', () => {
    it('creates a contact with valid data', async () => {
      const input = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        organizationId: 'org_1',
      };

      prismaMock.contact.create.mockResolvedValue({
        id: 'contact_1',
        ...input,
        phone: null,
        avatar: null,
        jobTitle: null,
        lifecycleStage: 'LEAD',
        leadSource: null,
        score: 0,
        tags: [],
        customFields: null,
        ownerId: null,
        companyId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(input);

      expect(result.id).toBe('contact_1');
      expect(prismaMock.contact.create).toHaveBeenCalledWith({
        data: expect.objectContaining(input),
      });
    });

    it('throws error for duplicate email within organization', async () => {
      prismaMock.contact.findFirst.mockResolvedValue({
        id: 'existing_contact',
        email: 'john@example.com',
      });

      await expect(
        service.create({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          organizationId: 'org_1',
        })
      ).rejects.toThrow('A contact with this email already exists');
    });
  });

  describe('list', () => {
    it('returns paginated contacts', async () => {
      const contacts = Array.from({ length: 20 }, (_, i) => ({
        id: `contact_${i}`,
        firstName: `User ${i}`,
        lastName: `Test`,
        email: `user${i}@test.com`,
        organizationId: 'org_1',
      }));

      prismaMock.contact.findMany.mockResolvedValue(contacts);
      prismaMock.contact.count.mockResolvedValue(50);

      const result = await service.list({
        organizationId: 'org_1',
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(20);
      expect(result.meta.total).toBe(50);
      expect(result.meta.hasMore).toBe(true);
    });

    it('filters by lifecycle stage', async () => {
      prismaMock.contact.findMany.mockResolvedValue([]);
      prismaMock.contact.count.mockResolvedValue(0);

      await service.list({
        organizationId: 'org_1',
        lifecycleStage: 'LEAD',
        page: 1,
        limit: 20,
      });

      expect(prismaMock.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            lifecycleStage: 'LEAD',
          }),
        })
      );
    });
  });
});
```

---

## Integration Tests

### API Endpoint Testing

Integration tests use Supertest to make real HTTP requests against a test database.

```typescript
// apps/api/src/test/integration/contacts.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../app';
import { prisma } from '../../lib/prisma';
import { createTestToken, createTestOrg, createTestUser } from '../helpers';

const app = createApp();

let org: any;
let user: any;
let authToken: string;

beforeAll(async () => {
  org = await createTestOrg();
  user = await createTestUser({ organizationId: org.id });
  authToken = createTestToken(user);
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.contact.deleteMany({ where: { organizationId: org.id } });
});

describe('POST /api/contacts', () => {
  it('creates a contact with valid data', async () => {
    const response = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0123',
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      lifecycleStage: 'LEAD',
    });
    expect(response.body.data.id).toBeDefined();
  });

  it('returns 400 for missing required fields', async () => {
    const response = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ firstName: 'Jane' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 401 without auth token', async () => {
    const response = await request(app)
      .post('/api/contacts')
      .send({ firstName: 'Jane', lastName: 'Smith' });

    expect(response.status).toBe(401);
  });

  it('returns 409 for duplicate email in same org', async () => {
    await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ firstName: 'Jane', lastName: 'Smith', email: 'dupe@test.com' });

    const response = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ firstName: 'John', lastName: 'Doe', email: 'dupe@test.com' });

    expect(response.status).toBe(409);
  });

  it('allows same email in different organizations', async () => {
    const org2 = await createTestOrg({ slug: 'org-2' });
    const user2 = await createTestUser({ organizationId: org2.id });
    const token2 = createTestToken(user2);

    await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ firstName: 'Jane', lastName: 'Smith', email: 'same@test.com' });

    const response = await request(app)
      .post('/api/contacts')
      .set('Authorization', `Bearer ${token2}`)
      .send({ firstName: 'John', lastName: 'Doe', email: 'same@test.com' });

    expect(response.status).toBe(201);
  });
});

describe('GET /api/contacts', () => {
  beforeEach(async () => {
    const contacts = Array.from({ length: 25 }, (_, i) => ({
      firstName: `Contact`,
      lastName: `${i}`,
      email: `contact${i}@test.com`,
      organizationId: org.id,
      lifecycleStage: i < 10 ? 'LEAD' : 'CUSTOMER',
      score: i * 4,
    }));

    await prisma.contact.createMany({ data: contacts });
  });

  it('returns paginated results', async () => {
    const response = await request(app)
      .get('/api/contacts')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(20);
    expect(response.body.meta.total).toBe(25);
    expect(response.body.meta.hasMore).toBe(true);
  });

  it('filters by lifecycle stage', async () => {
    const response = await request(app)
      .get('/api/contacts?lifecycleStage=LEAD')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(10);
    expect(response.body.meta.total).toBe(10);
  });

  it('searches by name', async () => {
    await prisma.contact.create({
      data: {
        firstName: 'Unique',
        lastName: 'Searchable',
        email: 'unique@search.com',
        organizationId: org.id,
      },
    });

    const response = await request(app)
      .get('/api/contacts?search=Unique')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].firstName).toBe('Unique');
  });

  it('paginates correctly', async () => {
    const page1 = await request(app)
      .get('/api/contacts?page=1&limit=10')
      .set('Authorization', `Bearer ${authToken}`);

    const page2 = await request(app)
      .get('/api/contacts?page=2&limit=10')
      .set('Authorization', `Bearer ${authToken}`);

    expect(page1.body.data).toHaveLength(10);
    expect(page2.body.data).toHaveLength(10);
    expect(page1.body.data[0].id).not.toBe(page2.body.data[0].id);
  });
});

describe('PATCH /api/contacts/:id', () => {
  it('updates contact fields', async () => {
    const created = await prisma.contact.create({
      data: {
        firstName: 'Old',
        lastName: 'Name',
        email: 'old@test.com',
        organizationId: org.id,
      },
    });

    const response = await request(app)
      .patch(`/api/contacts/${created.id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ firstName: 'New', lifecycleStage: 'MQL' });

    expect(response.status).toBe(200);
    expect(response.body.data.firstName).toBe('New');
    expect(response.body.data.lifecycleStage).toBe('MQL');
  });

  it('returns 404 for non-existent contact', async () => {
    const response = await request(app)
      .patch('/api/contacts/nonexistent')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ firstName: 'Test' });

    expect(response.status).toBe(404);
  });
});
```

### Database Operation Tests

```typescript
// apps/api/src/test/integration/database.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../../lib/prisma';

describe('Database Operations', () => {
  let orgId: string;

  beforeAll(async () => {
    const org = await prisma.organization.create({
      data: { name: 'Test Org', slug: 'test-db-org' },
    });
    orgId = org.id;
  });

  afterAll(async () => {
    await prisma.organization.delete({ where: { id: orgId } });
    await prisma.$disconnect();
  });

  describe('Organization scoping', () => {
    it('creates and retrieves contacts within org', async () => {
      const contact = await prisma.contact.create({
        data: {
          firstName: 'Scoped',
          lastName: 'Contact',
          email: 'scoped@test.com',
          organizationId: orgId,
        },
      });

      const found = await prisma.contact.findUnique({
        where: { id: contact.id },
      });

      expect(found).toBeTruthy();
      expect(found!.organizationId).toBe(orgId);
    });

    it('enforces foreign key constraints', async () => {
      await expect(
        prisma.contact.create({
          data: {
            firstName: 'Bad',
            lastName: 'Contact',
            email: 'bad@test.com',
            organizationId: 'nonexistent_org',
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Transactions', () => {
    it('rolls back on error within transaction', async () => {
      const initialCount = await prisma.contact.count({
        where: { organizationId: orgId },
      });

      try {
        await prisma.$transaction(async (tx) => {
          await tx.contact.create({
            data: {
              firstName: 'Tx',
              lastName: 'Contact',
              email: 'tx@test.com',
              organizationId: orgId,
            },
          });
          throw new Error('Intentional rollback');
        });
      } catch {
        // Expected
      }

      const afterCount = await prisma.contact.count({
        where: { organizationId: orgId },
      });

      expect(afterCount).toBe(initialCount);
    });
  });
});
```

---

## E2E Tests (Playwright)

### Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev --workspace=apps/web',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev --workspace=apps/api',
      url: 'http://localhost:4000/api/health',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
```

### E2E Test Examples

```typescript
// tests/e2e/contact-management.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Contact Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@acme.com');
    await page.fill('[name="password"]', 'Demo1234!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('can create a new contact', async ({ page }) => {
    // Navigate to contacts
    await page.click('[data-testid="nav-contacts"]');
    await expect(page).toHaveURL('/contacts');

    // Click add contact button
    await page.click('[data-testid="add-contact-btn"]');

    // Fill in the form
    await page.fill('[name="firstName"]', 'Playwright');
    await page.fill('[name="lastName"]', 'Test User');
    await page.fill('[name="email"]', 'playwright@test.com');
    await page.fill('[name="phone"]', '+1-555-9999');
    await page.fill('[name="jobTitle"]', 'QA Engineer');

    // Submit
    await page.click('button:has-text("Save Contact")');

    // Verify success
    await expect(page.locator('[data-testid="toast"]')).toContainText(
      'Contact created successfully'
    );

    // Verify contact appears in list
    await page.click('[data-testid="nav-contacts"]');
    await expect(page.locator('text=Playwright Test User')).toBeVisible();
  });

  test('can search for contacts', async ({ page }) => {
    await page.click('[data-testid="nav-contacts"]');

    // Use global search
    await page.keyboard.press('Control+k');
    await page.fill('[data-testid="global-search-input"]', 'Sarah');

    // Verify results appear
    await expect(page.locator('[data-testid="search-results"]')).toContainText(
      'Sarah Chen'
    );
  });

  test('can view contact detail', async ({ page }) => {
    await page.click('[data-testid="nav-contacts"]');
    await page.click('text=Sarah Chen');

    // Verify detail page loads
    await expect(page.locator('h1')).toContainText('Sarah Chen');
    await expect(page.locator('[data-testid="contact-email"]')).toContainText(
      'sarah@acme.com'
    );
  });

  test('can update contact lifecycle stage', async ({ page }) => {
    await page.click('[data-testid="nav-contacts"]');
    await page.click('text=Sarah Chen');

    // Change lifecycle stage
    await page.click('[data-testid="lifecycle-stage-selector"]');
    await page.click('text=Marketing Qualified Lead');

    // Verify update
    await expect(
      page.locator('[data-testid="lifecycle-badge"]')
    ).toContainText('MQL');
  });
});
```

```typescript
// tests/e2e/deal-pipeline.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Deal Pipeline', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@acme.com');
    await page.fill('[name="password"]', 'Demo1234!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('displays pipeline board with stages', async ({ page }) => {
    await page.click('[data-testid="nav-deals"]');
    await expect(page).toHaveURL('/deals');

    // Verify stage columns exist
    await expect(
      page.locator('[data-testid="stage-column"]')
    ).toHaveCount(6); // 6 deal stages
  });

  test('can create a deal', async ({ page }) => {
    await page.click('[data-testid="nav-deals"]');
    await page.click('[data-testid="add-deal-btn"]');

    await page.fill('[name="title"]', 'E2E Test Deal');
    await page.fill('[name="value"]', '75000');
    await page.click('button:has-text("Create Deal")');

    await expect(page.locator('text=E2E Test Deal')).toBeVisible();
  });

  test('drag and drop moves deal between stages', async ({ page }) => {
    await page.click('[data-testid="nav-deals"]');

    // Find a deal card in Qualification stage
    const dealCard = page.locator(
      '[data-testid="stage-QUALIFICATION"] [data-testid="deal-card"]'
    ).first();

    const targetStage = page.locator(
      '[data-testid="stage-NEEDS_ANALYSIS"]'
    );

    // Drag and drop
    await dealCard.dragTo(targetStage);

    // Verify deal moved (check stage column count changes)
    await expect(
      page.locator('[data-testid="stage-NEEDS_ANALYSIS"] [data-testid="deal-card"]')
    ).toHaveCount(1, { timeout: 5000 });
  });
});
```

```typescript
// tests/e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

  test('can register a new account', async ({ page }) => {
    await page.goto('/register');

    await page.fill('[name="firstName"]', 'New');
    await page.fill('[name="lastName"]', 'User');
    await page.fill('[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="organizationName"]', 'Test Organization');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
  });

  test('can login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@acme.com');
    await page.fill('[name="password"]', 'Demo1234!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toContainText(
      'Sarah Chen'
    );
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Invalid email or password'
    );
  });

  test('can logout', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@acme.com');
    await page.fill('[name="password"]', 'Demo1234!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');

    await expect(page).toHaveURL('/login');
  });
});
```

---

## Mocking Strategies

### MSW (Mock Service Worker) for API Mocks

```typescript
// src/test/msw/handlers.ts
import { http, HttpResponse } from 'msw';
import { createTestContact, createTestDeal } from '../factories';

export const handlers = [
  // Contacts
  http.get('/api/contacts', ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const page = Number(url.searchParams.get('page') || '1');

    let contacts = Array.from({ length: 25 }, (_, i) =>
      createTestContact({ id: `contact_${i}` })
    );

    if (search) {
      contacts = contacts.filter(
        (c) =>
          c.firstName.toLowerCase().includes(search.toLowerCase()) ||
          c.lastName.toLowerCase().includes(search.toLowerCase())
      );
    }

    const limit = 20;
    const start = (page - 1) * limit;
    const paginated = contacts.slice(start, start + limit);

    return HttpResponse.json({
      data: paginated,
      meta: { total: contacts.length, page, limit, hasMore: start + limit < contacts.length },
    });
  }),

  http.get('/api/contacts/:id', ({ params }) => {
    return HttpResponse.json({
      data: createTestContact({ id: params.id as string }),
    });
  }),

  http.post('/api/contacts', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json(
      { data: createTestContact({ ...body, id: 'contact_new' }) },
      { status: 201 }
    );
  }),

  // Deals
  http.get('/api/deals', () => {
    const deals = Array.from({ length: 10 }, (_, i) =>
      createTestDeal({ id: `deal_${i}` })
    );
    return HttpResponse.json({ data: deals, meta: { total: 10 } });
  }),
];
```

```typescript
// src/test/msw/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```typescript
// src/test/setup.ts (add MSW)
import { server } from './msw/server';
import { beforeAll, afterEach, afterAll } from 'vitest';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Vitest Module Mocking

```typescript
// Mock a module
vi.mock('@/services/contact.service', () => ({
  contactService: {
    list: vi.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
    getById: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ id: 'new' }),
    update: vi.fn().mockResolvedValue({ id: 'updated' }),
    delete: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock a specific function
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock environment variables
vi.stubEnv('VITE_API_URL', 'http://localhost:4000');

// Spy on console methods
vi.spyOn(console, 'error').mockImplementation(() => {});
```

### Backend Mocking (Prisma)

```typescript
// src/test/helpers.ts
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

export const prismaMock = mockDeep<PrismaClient>();

export function createTestToken(user: { id: string; organizationId: string; role: string }) {
  return jwt.sign(
    { sub: user.id, organizationId: user.organizationId, role: user.role },
    process.env.JWT_ACCESS_SECRET || 'test-secret',
    { expiresIn: '15m' }
  );
}

export async function createTestOrg(overrides: Record<string, any> = {}) {
  // In integration tests, this creates a real org in the test DB
  // In unit tests, use prismaMock
  const { prisma } = await import('../lib/prisma');
  return prisma.organization.create({
    data: {
      name: 'Test Org',
      slug: `test-org-${Date.now()}`,
      ...overrides,
    },
  });
}

export async function createTestUser(overrides: Record<string, any> = {}) {
  const { prisma } = await import('../lib/prisma');
  const bcrypt = await import('bcryptjs');
  return prisma.user.create({
    data: {
      email: `test-${Date.now()}@test.com`,
      passwordHash: await bcrypt.hash('TestPass123!', 12),
      firstName: 'Test',
      lastName: 'User',
      role: 'MEMBER',
      isActive: true,
      organizationId: 'org_test',
      ...overrides,
    },
  });
}
```

---

## CI Test Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - name: Frontend unit tests
        run: npm test -- --coverage --reporter=json --outputFile=test-results/frontend.json
        working-directory: apps/web
      - name: Backend unit tests
        run: npm test -- --coverage --reporter=json --outputFile=test-results/backend.json
        working-directory: apps/api
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          flags: unit-tests

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    needs: unit-tests
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: testpassword
          POSTGRES_DB: novacrm_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    env:
      DATABASE_URL: postgresql://postgres:testpassword@localhost:5432/novacrm_test
      REDIS_URL: redis://localhost:6379
      JWT_ACCESS_SECRET: test-access-secret-for-ci-min-32-chars
      JWT_REFRESH_SECRET: test-refresh-secret-for-ci-min-32-chars
      NODE_ENV: test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - name: Run migrations
        run: npx prisma migrate deploy
        working-directory: apps/api
      - name: Integration tests
        run: npm run test:integration -- --coverage
        working-directory: apps/api
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          flags: integration-tests

  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Run E2E tests
        run: npx playwright test
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
```

---

## Coverage Goals

### Per Module

| Module | Lines | Branches | Functions | Statements |
|--------|-------|----------|-----------|------------|
| Services (business logic) | 90% | 85% | 90% | 90% |
| Controllers (API handlers) | 80% | 75% | 80% | 80% |
| React Components | 80% | 75% | 80% | 80% |
| Custom Hooks | 85% | 80% | 85% | 85% |
| Utilities (lib/) | 95% | 90% | 95% | 95% |
| Zod Schemas | 100% | 100% | 100% | 100% |
| **Overall** | **80%** | **75%** | **80%** | **80%** |

### Coverage Enforcement

CI enforces minimum thresholds. A PR that decreases coverage below thresholds will fail CI.

```bash
# Run with coverage
npm run test:coverage

# View HTML report
open coverage/index.html

# Check specific thresholds
npx vitest run --coverage.threshold.lines=80
```

### Coverage Reports

- **CI:** JSON + LCOV format uploaded to Codecov.
- **Local:** HTML report generated in `coverage/` directory.
- **Codecov:** PR comments with coverage diff.

---

## Test Examples for Key Scenarios

### Authentication Flow

```typescript
describe('Authentication', () => {
  describe('Registration', () => {
    it('creates user and organization on valid registration');
    it('hashes password with bcrypt');
    it('returns access and refresh tokens');
    it('rejects duplicate email addresses');
    it('validates password strength requirements');
    it('creates default pipeline for new organization');
  });

  describe('Login', () => {
    it('returns tokens for valid credentials');
    it('updates lastLoginAt timestamp');
    it('rejects invalid password');
    it('rejects inactive user accounts');
    it('handles non-existent email gracefully');
  });

  describe('Token Refresh', () => {
    it('issues new access token with valid refresh token');
    it('rotates refresh token (invalidates old)');
    it('rejects expired refresh tokens');
    it('rejects revoked refresh tokens');
    it('detects refresh token reuse (token family)');
  });

  describe('Logout', () => {
    it('invalidates refresh token in Redis');
    it('returns 204 No Content');
  });
});
```

### Deal Pipeline Operations

```typescript
describe('Deal Pipeline', () => {
  describe('Stage Transitions', () => {
    it('moves deal to next stage');
    it('allows skipping stages');
    it('sets probability automatically based on stage');
    it('requires lost reason when moving to CLOSED_LOST');
    it('sets closedAt timestamp when moving to CLOSED_WON');
    it('logs activity for stage change');
    it('sends notification to deal owner');
  });

  describe('Pipeline Calculations', () => {
    it('calculates total pipeline value');
    it('calculates weighted value per stage');
    it('calculates average deal size');
    it('calculates average cycle length');
    it('calculates conversion rates between stages');
  });

  describe('Drag and Drop', () => {
    it('updates stage via API on drop');
    it('rolls back on API failure');
    it('prevents dropping onto same stage');
    it('shows optimistic UI update');
  });
});
```

### AI Features

```typescript
describe('AI Features', () => {
  describe('Email Generation', () => {
    it('generates email from contact context');
    it('respects tone parameter');
    it('handles OpenAI API errors gracefully');
    it('enforces rate limits per user');
    it('includes relevant contact history in context');
  });

  describe('Lead Scoring', () => {
    it('calculates score based on engagement');
    it('factors in company fit');
    it('updates score on new activity');
    it('returns score explanation');
    it('caps score at 100');
  });

  describe('Meeting Summaries', () => {
    it('extracts key points from transcript');
    it('identifies action items');
    it('suggests task creation for action items');
    it('handles empty or short input');
  });
});
```

### Data Import/Export

```typescript
describe('Data Import', () => {
  describe('CSV Import', () => {
    it('parses CSV file correctly');
    it('auto-detects column mapping');
    it('validates required fields');
    it('handles duplicate detection by email');
    it('reports import progress');
    it('creates activity log for bulk import');
    it('rejects files over 10MB');
    it('handles special characters in CSV');
  });

  describe('CSV Export', () => {
    it('exports all visible columns');
    it('respects active filters');
    it('exports max 10,000 records');
    it('streams large exports');
    it('includes correct CSV headers');
  });
});
```

### Error Handling

```typescript
describe('Error Handling', () => {
  it('returns 400 for validation errors with field details');
  it('returns 401 for unauthenticated requests');
  it('returns 403 for unauthorized actions');
  it('returns 404 for non-existent resources');
  it('returns 409 for conflict errors (duplicate email)');
  it('returns 429 for rate limit exceeded');
  it('returns 500 for unexpected server errors');
  it('logs error details to server logger');
  it('returns sanitized error in production (no stack traces)');
  it('handles database connection errors gracefully');
  it('handles Redis connection errors gracefully');
});
```
