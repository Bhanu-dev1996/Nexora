# NovaCRM AI — Coding Standards

> Comprehensive coding standards and conventions for the NovaCRM AI codebase.

---

## Table of Contents

1. [TypeScript Conventions](#typescript-conventions)
2. [Component Patterns](#component-patterns)
3. [File Naming & Organization](#file-naming--organization)
4. [Import Ordering](#import-ordering)
5. [CSS & Tailwind Conventions](#css--tailwind-conventions)
6. [API Conventions](#api-conventions)
7. [Error Handling](#error-handling)
8. [Git Workflow](#git-workflow)
9. [Code Review Checklist](#code-review-checklist)
10. [Accessibility Requirements](#accessibility-requirements)
11. [Performance Standards](#performance-standards)
12. [Security Practices](#security-practices)

---

## TypeScript Conventions

### Strict Mode Configuration

NovaCRM uses TypeScript 6 with strict mode enabled. All code must compile without errors under these `tsconfig.json` settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": false,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitOverride": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Type Definitions

#### Use Interfaces for Object Shapes

```tsx
// ✅ Interfaces for object shapes
interface Lead {
  id: string;
  name: string;
  email: string;
  status: LeadStatus;
  score: number;
  createdAt: string;
  updatedAt: string;
}

type LeadStatus = "new" | "contacted" | "qualified" | "unqualified" | "converted";

// ✅ Types for unions, intersections, and mapped types
type LeadFilterStatus = Exclude<LeadStatus, "converted">;

type LeadSummary = Pick<Lead, "id" | "name" | "status" | "score">;

type LeadUpdateInput = Partial<Omit<Lead, "id" | "createdAt" | "updatedAt">>;
```

#### Avoid `any` — Use Proper Types

```tsx
// ❌ Never use `any`
function handleData(data: any) {
  return data.items.map((item: any) => item.name);
}

// ✅ Use unknown and type narrow
function handleData(data: unknown) {
  if (!isApiResponse(data)) {
    throw new Error("Invalid API response");
  }
  return data.items.map((item) => item.name);
}

// ✅ Or use proper interface
interface ApiResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

function handleData(data: ApiResponse<Lead>) {
  return data.items.map((item) => item.name);
}
```

#### Discriminated Unions for State Machines

```tsx
// ✅ Discriminated union for async state
interface AsyncState<T> {
  status: "idle";
} | {
  status: "loading";
} | {
  status: "success";
  data: T;
} | {
  status: "error";
  error: Error;
}

// Usage
function useLead(id: string): AsyncState<Lead> {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.leads.detail(id),
    queryFn: () => fetchLead(id),
  });

  if (isLoading) return { status: "loading" };
  if (error) return { status: "error", error: new Error(error.message) };
  if (data) return { status: "success", data };
  return { status: "idle" };
}
```

#### Proper `Record` Usage

```tsx
// ✅ Use Record for typed dictionaries
const statusColors: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-green-100 text-green-800",
  unqualified: "bg-gray-100 text-gray-800",
  converted: "bg-purple-100 text-purple-800",
};

// ❌ Don't use Record without proper value type
const statusColors: Record<string, string> = { ... };
```

#### Enums vs. Const Objects

```tsx
// ✅ Prefer const objects over enums for tree-shaking
export const LeadStatus = {
  NEW: "new",
  CONTACTED: "contacted",
  QUALIFIED: "qualified",
  UNQUALIFIED: "unqualified",
  CONVERTED: "converted",
} as const;

export type LeadStatus = (typeof LeadStatus)[keyof typeof LeadStatus];

// ❌ Avoid TypeScript enums (less tree-shakeable, different runtime behavior)
export enum LeadStatus {
  NEW = "new",
  CONTACTED = "contacted",
  // ...
}
```

### Utility Types

```tsx
// ✅ Use built-in utility types
type LeadCreateInput = Omit<Lead, "id" | "createdAt" | "updatedAt">;
type LeadFilters = Partial<Pick<Lead, "status" | "score" | "assigneeId">>;
type LeadTableColumn = keyof Pick<Lead, "name" | "email" | "company" | "status">;

// ✅ Use Extract for narrowing
type ActiveLeadStatus = Extract<LeadStatus, "new" | "contacted" | "qualified">;
```

### Function Signatures

```tsx
// ✅ Named return types for exported functions
export function formatLeadValue(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

// ✅ Explicit parameter types for public APIs
export function createLead(input: CreateLeadInput): Promise<Lead> {
  return api.post("/leads", input).then((res) => res.data);
}

// ✅ Return type inference for internal functions
const getLeadColor = (status: LeadStatus) => {
  const colors = {
    new: "bg-blue-500",
    contacted: "bg-yellow-500",
    qualified: "bg-green-500",
  } as const;
  return colors[status] ?? "bg-gray-500";
};
```

---

## Component Patterns

### Functional Components Only

All components are functional. Class components are never used.

```tsx
// ✅ Always
export function LeadCard({ lead, onSelect }: LeadCardProps) {
  return (
    <Card onClick={() => onSelect(lead.id)}>
      <CardContent>
        <h3>{lead.name}</h3>
        <p>{lead.company}</p>
      </CardContent>
    </Card>
  );
}

// ❌ Never
export class LeadCard extends React.Component<LeadCardProps> {
  render() { /* ... */ }
}
```

### Props Interface Naming

```tsx
// ✅ ComponentName + Props
interface LeadCardProps {
  lead: Lead;
  onSelect: (id: string) => void;
  variant?: "compact" | "full";
}

// ✅ For components with no required props, use optional everywhere
interface SeparatorProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

// ✅ Props with children use ReactNode
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}
```

### Component File Structure

Each component file follows a consistent structure:

```tsx
// 1. Imports
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Lead } from "@/types/lead";

// 2. Types / Interfaces
interface LeadCardProps {
  lead: Lead;
  onSelect: (id: string) => void;
  variant?: "compact" | "full";
}

// 3. Constants
const VARIANT_CLASSES = {
  compact: "p-3",
  full: "p-6",
} as const;

// 4. Component
export function LeadCard({ lead, onSelect, variant = "full" }: LeadCardProps) {
  // Hooks
  const [isHovered, setIsHovered] = useState(false);

  // Handlers
  const handleClick = useCallback(() => {
    onSelect(lead.id);
  }, [lead.id, onSelect]);

  // Render
  return (
    <Card
      className={cn("cursor-pointer transition-colors", VARIANT_CLASSES[variant])}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent>
        <h3 className="font-medium">{lead.name}</h3>
        <p className="text-sm text-muted-foreground">{lead.company}</p>
      </CardContent>
    </Card>
  );
}
```

### Compound Components

For components with tightly coupled sub-components:

```tsx
import { createContext, useContext } from "react";

// 1. Context
interface StatsCardContextValue {
  variant: "default" | "success" | "warning" | "destructive";
}

const StatsCardContext = createContext<StatsCardContextValue | null>(null);

function useStatsCardContext() {
  const context = useContext(StatsCardContext);
  if (!context) {
    throw new Error("StatsCard compound components must be used within <StatsCard>");
  }
  return context;
}

// 2. Root component
interface StatsCardProps {
  variant?: "default" | "success" | "warning" | "destructive";
  children: React.ReactNode;
}

export function StatsCard({ variant = "default", children }: StatsCardProps) {
  return (
    <StatsCardContext.Provider value={{ variant }}>
      <Card>{children}</Card>
    </StatsCardContext.Provider>
  );
}

// 3. Sub-components
StatsCard.Title = function StatsCardTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
};

StatsCard.Value = function StatsCardValue({ children }: { children: React.ReactNode }) {
  return <p className="text-2xl font-bold">{children}</p>;
};

StatsCard.Change = function StatsCardChange({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  const { variant } = useStatsCardContext();
  const color = variant === "destructive" ? "text-destructive" : "text-accent";

  return (
    <div className={cn("flex items-center gap-1 text-sm", color)}>
      <TrendingUp className="h-3 w-3" />
      <span>{Math.abs(value)}%</span>
      {label && <span className="text-muted-foreground">{label}</span>}
    </div>
  );
};
```

### Hooks-First Architecture

Logic lives in custom hooks, not in components:

```tsx
// ✅ Custom hook encapsulates logic
function useLeadTable(leadId: string) {
  const { data: lead, isLoading } = useLead(leadId);
  const { mutate: updateLead } = useUpdateLead(leadId);
  const { mutate: deleteLead } = useDeleteLead();
  const navigate = useNavigate();

  const handleStatusChange = useCallback(
    (newStatus: LeadStatus) => {
      updateLead({ status: newStatus });
    },
    [updateLead]
  );

  const handleDelete = useCallback(() => {
    deleteLead(leadId, {
      onSuccess: () => navigate("/leads"),
    });
  }, [leadId, deleteLead, navigate]);

  return { lead, isLoading, handleStatusChange, handleDelete };
}

// ✅ Component is thin
function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lead, isLoading, handleStatusChange, handleDelete } = useLeadTable(id!);

  if (isLoading) return <DetailPageSkeleton />;

  return (
    <div>
      <PageHeader title={lead.name} />
      <LeadStatusSelect
        value={lead.status}
        onChange={handleStatusChange}
      />
      <Button variant="destructive" onClick={handleDelete}>
        Delete Lead
      </Button>
    </div>
  );
}
```

### Memoization Guidelines

```tsx
// ✅ Memoize callbacks passed to child components
const handleSelect = useCallback((id: string) => {
  setSelectedId(id);
}, []);

// ✅ Memoize expensive computations
const sortedLeads = useMemo(() => {
  return [...leads].sort((a, b) => b.score - a.score);
}, [leads]);

// ✅ Memoize JSX-heavy components
const MemoizedLeadCard = memo(LeadCard);

// ❌ Don't memoize simple components with no props
const Label = memo(({ children }) => <span>{children}</span>);
// Just use: function Label({ children }) { return <span>{children}</span> }
```

---

## File Naming & Organization

### Component Files

| Convention | Pattern | Example |
|---|---|---|
| PascalCase | `ComponentName.tsx` | `LeadCard.tsx` |
| One component per file | — | `LeadCard.tsx` exports `LeadCard` only |
| Co-located test | `ComponentName.test.tsx` | `LeadCard.test.tsx` |
| Co-located stories | `ComponentName.stories.tsx` | `LeadCard.stories.tsx` |

### Utility / Helper Files

| Convention | Pattern | Example |
|---|---|---|
| camelCase | `utility-name.ts` | `formatCurrency.ts` |
| kebab-case for modules | `module-name.ts` | `query-keys.ts` |
| Named exports preferred | — | `export function formatCurrency() {}` |

### Page Files

| Pattern | Example |
|---|---|
| `src/pages/{feature}/index.tsx` | `src/pages/leads/index.tsx` |
| `src/pages/{feature}/{sub-page}.tsx` | `src/pages/leads/list.tsx` |

### Type Files

| Pattern | Example |
|---|---|
| Domain types in `src/types/` | `src/types/lead.ts` |
| API response types co-located | `src/queries/use-lead-queries.ts` |
| Shared types in `src/types/index.ts` | `export * from "./lead"` |

### Directory Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   └── shared/                # Custom reusable components
│       ├── page-header.tsx
│       ├── stats-card.tsx
│       ├── kanban-board.tsx
│       └── ...
├── pages/                     # Route page components
│   ├── auth/
│   │   ├── login/
│   │   │   └── index.tsx
│   │   ├── register/
│   │   │   └── index.tsx
│   │   └── ...
│   ├── dashboard/
│   │   └── index.tsx
│   ├── leads/
│   │   ├── list.tsx
│   │   ├── create.tsx
│   │   └── detail.tsx
│   └── ...
├── stores/                    # Zustand stores
│   ├── auth-store.ts
│   ├── ui-store.ts
│   └── ...
├── queries/                   # TanStack Query hooks
│   ├── query-keys.ts
│   ├── use-lead-queries.ts
│   └── ...
├── hooks/                     # Custom React hooks
│   ├── use-debounce.ts
│   ├── use-media-query.ts
│   └── ...
├── contexts/                  # React Context providers
│   ├── theme-provider.tsx
│   └── locale-provider.tsx
├── lib/                       # Utilities and API client
│   ├── api.ts
│   ├── utils.ts
│   └── validations.ts
├── types/                     # TypeScript type definitions
│   ├── lead.ts
│   ├── contact.ts
│   ├── deal.ts
│   ├── api.ts
│   └── index.ts
├── styles/                    # Global styles
│   └── globals.css
├── routes/                    # Route configuration
│   ├── index.tsx
│   ├── guards/
│   └── layouts/
└── assets/                    # Static assets
    ├── images/
    └── icons/
```

---

## Import Ordering

Imports are organized in the following order with blank lines between groups:

```tsx
// 1. React & Next.js
import { useState, useCallback, useEffect } from "react";

// 2. External libraries
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";

// 3. UI components (shadcn/ui)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// 4. Custom shared components
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/shared/stats-card";
import { AvatarGroup } from "@/components/shared/avatar-group";

// 5. Stores
import { useAuthStore } from "@/stores/auth-store";

// 6. Query hooks
import { useLeads, useDeleteLead } from "@/queries/use-lead-queries";

// 7. Custom hooks
import { useDebounce } from "@/hooks/use-debounce";

// 8. Utilities
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";

// 9. Types
import type { Lead, LeadStatus } from "@/types/lead";
import type { ColumnDef } from "@tanstack/react-table";
```

### Path Aliases

| Alias | Path |
|---|---|
| `@/` | `src/` |
| `@components/` | `src/components/` |
| `@ui/` | `src/components/ui/` |
| `@lib/` | `src/lib/` |
| `@stores/` | `src/stores/` |
| `@queries/` | `src/queries/` |
| `@hooks/` | `src/hooks/` |
| `@types/` | `src/types/` |

### Import Rules

- **Always use path aliases** — never relative imports with `../` except for sibling files within the same directory.
- **Type-only imports** use the `import type` syntax:
  ```tsx
  import type { Lead } from "@/types/lead";
  ```
- **Named exports** preferred over default exports for components and hooks:
  ```tsx
  // ✅ Named export
  export function LeadCard() { ... }

  // ❌ Default export (only used for page components / lazy loading)
  export default function LeadDetailPage() { ... }
  ```

---

## CSS & Tailwind Conventions

### Utility-First Approach

All styling uses Tailwind CSS v4 utility classes. Custom CSS is avoided except for:

1. CSS custom properties for design tokens
2. Keyframe animations
3. Complex responsive utilities that can't be expressed with Tailwind

### The `cn()` Helper

All conditional classes use the `cn()` helper:

```tsx
import { cn } from "@/lib/utils";

<div
  className={cn(
    // Base classes (always applied)
    "px-4 py-2 rounded-md text-sm font-medium",
    // Conditional classes
    variant === "primary" && "bg-primary text-primary-foreground",
    variant === "outline" && "border border-input bg-background",
    disabled && "opacity-50 pointer-events-none",
    // External className (consumer override)
    className
  )}
/>
```

### Class Order

Within a `className` attribute, classes follow this order:

1. Layout: `flex`, `grid`, `block`, `inline-flex`, etc.
2. Position: `relative`, `absolute`, `fixed`, `sticky`
3. Box model: `w-`, `h-`, `p-`, `m-`, `gap-`
4. Typography: `text-`, `font-`, `leading-`, `tracking-`
5. Visual: `bg-`, `border-`, `rounded-`, `shadow-`
6. Interactive: `hover:`, `focus:`, `active:`, `disabled:`
7. Transition: `transition-`, `duration-`
8. Other: `sr-only`, `animate-`

### Tailwind Config Extensions

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        nova: {
          primary: "hsl(var(--nova-primary))",
          accent: "hsl(var(--nova-accent))",
        },
      },
      animation: {
        "slide-in": "slide-in 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-in",
      },
      keyframes: {
        "slide-in": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
};
```

### Responsive Breakpoints

| Prefix | Width | Usage |
|---|---|---|
| `sm:` | ≥640px | Mobile landscape |
| `md:` | ≥768px | Tablet |
| `lg:` | ≥1024px | Desktop |
| `xl:` | ≥1280px | Large desktop |
| `2xl:` | ≥1536px | Ultra-wide |

### Dark Mode

Dark mode uses the Tailwind `dark:` variant. All components must support both themes:

```tsx
// ✅ Proper dark mode support
<div className="bg-background text-foreground border border-border">
  <h2 className="text-card-foreground">Title</h2>
  <p className="text-muted-foreground">Description</p>
</div>

// ✅ Using shadcn/ui design tokens
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Click me
</Button>
```

### Avoid

```tsx
// ❌ Inline styles
<div style={{ backgroundColor: "red", padding: "16px" }}>

// ❌ Arbitrary values when token exists
<div className="bg-[#6366f1]">  {/* Use bg-primary instead */}

// ❌ @apply in component files (only in globals.css)
// ✅ @apply is acceptable in globals.css for animations and utilities
```

---

## API Conventions

### REST API Standards

| Verb | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/leads` | List leads (paginated) |
| `GET` | `/api/v1/leads/:id` | Get single lead |
| `POST` | `/api/v1/leads` | Create lead |
| `PATCH` | `/api/v1/leads/:id` | Update lead (partial) |
| `DELETE` | `/api/v1/leads/:id` | Delete lead |
| `POST` | `/api/v1/leads/bulk-delete` | Bulk delete leads |
| `POST` | `/api/v1/leads/bulk-assign` | Bulk assign leads |

### API Client

**File:** `src/lib/api.ts`

```tsx
import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor — attach access token
api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor — handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await useAuthStore.getState().refreshAccessToken();
        const newToken = useAuthStore.getState().accessToken;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
```

### Standard API Response Format

```ts
// Success response
interface ApiSuccessResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

// Error response
interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// Example: GET /api/v1/leads?page=1&limit=20
// Response:
{
  "data": [
    { "id": "lead-1", "name": "Jane Doe", "email": "jane@acme.com", ... },
    { "id": "lead-2", "name": "John Smith", "email": "john@tech.co", ... }
  ],
  "meta": {
    "total": 142,
    "page": 1,
    "limit": 20,
    "hasMore": true
  }
}

// Example: POST /api/v1/leads (validation error)
// Response:
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["Email is required"],
      "company": ["Company must be at least 2 characters"]
    }
  }
}
```

### Naming Conventions

| Context | Convention | Example |
|---|---|---|
| API endpoints | kebab-case | `/api/v1/leads`, `/api/v1/audit-logs` |
| Query parameters | camelCase | `?sortBy=createdAt&page=2` |
| Request body | camelCase | `{ "companyName": "Acme" }` |
| Response fields | camelCase | `{ "createdAt": "2026-03-15T10:00:00Z" }` |
| Database fields | snake_case | `created_at`, `deal_value` |

---

## Error Handling

### API Error Boundaries

```tsx
import { Component, type ReactNode } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-2">{this.state.error?.message}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

### Error Handling in Hooks

```tsx
// ✅ Consistent error handling pattern
export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateLeadInput) => {
      const { data } = await api.post("/leads", input);
      return data;
    },
    onSuccess: (newLead) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      toast.success("Lead created successfully");
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message =
        error.response?.data?.error?.message ||
        error.message ||
        "An unexpected error occurred";

      toast.error("Failed to create lead", {
        description: message,
      });
    },
  });
}
```

### Form Error Handling

```tsx
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const leadSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^\+?[\d\s-()]+$/, "Please enter a valid phone number")
    .optional()
    .or(z.literal("")),
  company: z.string().min(1, "Company is required"),
  source: z.enum(["website", "referral", "cold_call", "social", "other"], {
    errorMap: () => ({ message: "Please select a lead source" }),
  }),
  notes: z.string().max(2000, "Notes must be less than 2000 characters").optional(),
});

type LeadFormData = z.infer<typeof leadSchema>;

function CreateLeadForm() {
  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      source: "website",
      notes: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name *</FormLabel>
              <FormControl>
                <Input placeholder="Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

### Toast Notification Guidelines

```tsx
import { toast } from "sonner";

// Success — auto-dismiss after 3 seconds
toast.success("Lead created successfully");

// Error — stays until dismissed
toast.error("Failed to save changes", {
  description: "Please check your network connection and try again.",
  action: {
    label: "Retry",
    onClick: () => retrySave(),
  },
});

// Info — auto-dismiss after 5 seconds
toast.info("New notification received");

// Warning — auto-dismiss after 4 seconds
toast.warning("Your session expires in 5 minutes");

// Promise — shows loading, then success/error
toast.promise(saveLead(data), {
  loading: "Saving lead...",
  success: "Lead saved successfully",
  error: "Failed to save lead",
});
```

---

## Git Workflow

### Branch Strategy

```
main
├── develop
│   ├── feature/lead-management
│   ├── feature/deal-pipeline
│   ├── feature/ai-copilot
│   ├── fix/login-redirect-bug
│   └── chore/update-dependencies
├── release/v1.0.0
└── hotfix/security-patch
```

### Branch Naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feature/{short-description}` | `feature/kanban-board` |
| Fix | `fix/{short-description}` | `fix/lead-filter-reset` |
| Chore | `chore/{short-description}` | `chore/update-tailwind` |
| Refactor | `refactor/{short-description}` | `refactor/query-hooks` |
| Hotfix | `hotfix/{short-description}` | `hotfix/auth-token-leak` |

### Conventional Commits

Every commit message follows the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

#### Types

| Type | Description | Example |
|---|---|---|
| `feat` | New feature | `feat(leads): add bulk assign functionality` |
| `fix` | Bug fix | `fix(deals): correct pipeline drag position` |
| `docs` | Documentation only | `docs: update routing documentation` |
| `style` | Formatting, no code change | `style: fix lint warnings in lead queries` |
| `refactor` | Code change (no feature/fix) | `refactor(auth): extract token refresh logic` |
| `perf` | Performance improvement | `perf(dashboard): memoize chart components` |
| `test` | Adding/updating tests | `test(leads): add unit tests for form schema` |
| `chore` | Build, tooling, deps | `chore: upgrade React to v19.1` |
| `ci` | CI/CD changes | `ci: add GitHub Actions workflow` |
| `revert` | Reverts a commit | `revert: feat(leads): add bulk assign` |

#### Scopes

| Scope | Description |
|---|---|
| `auth` | Authentication system |
| `leads` | Lead management |
| `contacts` | Contact management |
| `companies` | Company management |
| `deals` | Deal pipeline |
| `tasks` | Task management |
| `calendar` | Calendar |
| `reports` | Reports |
| `analytics` | Analytics |
| `ai` | AI copilot |
| `settings` | Settings |
| `admin` | Admin panel |
| `ui` | UI components |
| `api` | API client / backend |
| `db` | Database |
| `ci` | CI/CD |
| `deps` | Dependencies |

#### Examples

```
feat(leads): add lead scoring algorithm

Implemented an ML-based lead scoring model that analyzes:
- Engagement history (email opens, site visits)
- Company size and industry
- Response time patterns

Closes #142

---

fix(auth): resolve token refresh race condition

When multiple API calls failed simultaneously, each would
attempt to refresh the token concurrently, causing a race
condition. Now uses a singleton refresh promise.

Fixes #287

---

chore(deps): upgrade TanStack Query to v5.20

BREAKING CHANGE: `placeholderData` now replaces `keepPreviousData`
```

### Pull Request Template

```markdown
## Description
<!-- Brief description of what this PR does -->

## Type of Change
- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation
- [ ] Chore

## Testing
- [ ] Unit tests pass (`npm test`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project conventions
- [ ] Self-review completed
- [ ] No console.log statements
- [ ] No `any` types used
- [ ] Components are accessible (keyboard nav, screen readers)
- [ ] Responsive on mobile, tablet, desktop
- [ ] Dark mode looks correct
- [ ] Error states are handled
- [ ] Loading states are implemented
```

---

## Code Review Checklist

### Functional Correctness
- [ ] Does the code do what it claims?
- [ ] Are edge cases handled (empty state, error, loading)?
- [ ] Are all user flows tested?
- [ ] Does it work on mobile, tablet, and desktop?

### TypeScript
- [ ] No `any` types
- [ ] Strict mode compliance
- [ ] Proper use of `interface` vs `type`
- [ ] No unused imports or variables

### React / Components
- [ ] Functional components only
- [ ] Proper hooks usage (no conditional hooks)
- [ ] Appropriate memoization (not over/under-memoized)
- [ ] No direct DOM manipulation
- [ ] Proper key props on lists

### State Management
- [ ] Server state in TanStack Query (not Zustand)
- [ ] UI state in Zustand (not React Context)
- [ ] Local state with `useState` / `useReducer`
- [ ] Selective store subscriptions

### Styling
- [ ] Utility-first (no custom CSS unless necessary)
- [ ] Uses `cn()` for conditional classes
- [ ] Dark mode compatible
- [ ] Responsive design
- [ ] No inline styles

### Accessibility
- [ ] Semantic HTML elements
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Focus management
- [ ] Color contrast meets WCAG AA

### Performance
- [ ] No unnecessary re-renders
- [ ] Images optimized (WebP, lazy loading)
- [ ] Code splitting (lazy-loaded routes)
- [ ] No large bundle additions

### Security
- [ ] No secrets in code
- [ ] Input validation (client + server)
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Auth tokens handled securely

### Code Quality
- [ ] Follows naming conventions
- [ ] Proper import ordering
- [ ] Comments only when necessary
- [ ] Error handling implemented
- [ ] No console.log in production code

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

All UI components must meet WCAG 2.1 Level AA standards.

### Semantic HTML

```tsx
// ✅ Use semantic elements
<main>
  <header>
    <nav aria-label="Main navigation">
      <ul>
        <li><a href="/leads">Leads</a></li>
        <li><a href="/contacts">Contacts</a></li>
      </ul>
    </nav>
  </header>
  <section aria-labelledby="leads-heading">
    <h1 id="leads-heading">Leads</h1>
    <DataTable columns={columns} data={data} />
  </section>
</main>

// ❌ Don't use divs for everything
<div class="nav">
  <div class="nav-item">Leads</div>
</div>
```

### Keyboard Navigation

```tsx
// ✅ All interactive elements are keyboard accessible
<Button onClick={handleClick}>Click Me</Button>  // ← Already accessible

// ✅ Custom interactive elements need keyboard support
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Custom Button
</div>

// ✅ Focus management for modals
<Dialog onOpenChange={(open) => {
  if (open) {
    // Focus first focusable element
    setTimeout(() => firstInputRef.current?.focus(), 0);
  }
}}>
```

### ARIA Attributes

```tsx
// ✅ Labeling
<Input aria-label="Email address" />
<Label htmlFor="email">Email</Label>
<Input id="email" aria-describedby="email-help" />
<p id="email-help" className="text-sm text-muted-foreground">
  We'll never share your email.
</p>

// ✅ Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {isSearching && <span>Searching...</span>}
  {results.length > 0 && <span>{results.length} results found</span>}
</div>

// ✅ Loading states
<div role="status" aria-label="Loading leads">
  <span className="sr-only">Loading...</span>
  <Skeleton className="h-4 w-full" />
</div>

// ✅ Tables
<Table>
  <TableCaption>Lead directory</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead scope="col">Name</TableHead>
      <TableHead scope="col">Email</TableHead>
      <TableHead scope="col">Status</TableHead>
    </TableRow>
  </TableHeader>
</Table>
```

### Color Contrast

All text and interactive elements must meet WCAG AA contrast ratios:

| Element | Minimum Ratio |
|---|---|
| Normal text (<18px) | 4.5:1 |
| Large text (≥18px bold or ≥24px) | 3:1 |
| UI components and graphics | 3:1 |

Use the `tailwindcss-forms` plugin or manual checks to verify contrast.

### Focus Indicators

```tsx
// ✅ Visible focus ring on all interactive elements
<button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Click Me
</button>

// shadcn/ui components include focus-visible styles by default
<Button>Already has focus ring</Button>
<Input />  // Already has focus ring
```

### Screen Reader Support

```tsx
// ✅ Visually hidden labels
<span className="sr-only">Close dialog</span>

// ✅ Image alt text
<img src={company.logoUrl} alt={`${company.name} logo`} />

// ✅ Icon-only buttons need labels
<Button variant="ghost" size="icon" aria-label="Delete lead">
  <Trash2 className="h-4 w-4" />
</Button>

// ✅ Status announcements
<div role="alert">
  {error && <p>Failed to load leads. Please try again.</p>}
</div>
```

---

## Performance Standards

### Core Web Vitals Targets

| Metric | Target | Description |
|---|---|---|
| LCP | < 2.5s | Largest Contentful Paint |
| FID | < 100ms | First Input Delay |
| CLS | < 0.1 | Cumulative Layout Shift |
| TTFB | < 800ms | Time to First Byte |

### Code Splitting

All route-level components are lazy-loaded:

```tsx
const LeadsListPage = lazy(() => import("@/pages/leads/list"));
```

### Image Optimization

- Use WebP format where possible
- Implement `loading="lazy"` on non-critical images
- Provide explicit `width` and `height` to prevent CLS
- Use `srcset` for responsive images

### Bundle Size Monitoring

Run `npm run build -- --analyze` to inspect bundle composition. Target:
- Core bundle: < 150 KB gzipped
- Feature bundles: < 80 KB gzipped each
- Total initial load: < 300 KB gzipped

---

## Security Practices

### Client-Side Security

1. **No secrets in code** — API keys, tokens, and passwords are never committed to the repository
2. **Environment variables** — Use `VITE_*` prefixed env vars for client-side configuration
3. **XSS prevention** — React escapes content by default; avoid `dangerouslySetInnerHTML`
4. **CSRF** — Use same-site cookies and CSRF tokens for state-changing requests
5. **Auth tokens** — Short-lived access tokens stored in memory; refresh tokens in httpOnly cookies or localStorage (as implemented)
6. **Input validation** — Validate all inputs with Zod on the client (server validation is the source of truth)

### Environment Variables

```env
# .env.local (not committed)
VITE_API_URL=https://api.novacrm.ai/v1
VITE_WS_URL=wss://api.novacrm.ai
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

### Dependency Management

- Run `npm audit` regularly
- Use `npm audit fix` for patch updates
- Review Dependabot/Renovate PRs promptly
- Pin major versions in `package.json`

---

## ESLint & Prettier Configuration

### ESLint Rules

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/consistent-type-imports": "error",
    "react/self-closing-comp": "error",
    "react/jsx-curly-brace-presence": ["error", { "props": "never", "children": "never" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindFunctions": ["cn"]
}
```
