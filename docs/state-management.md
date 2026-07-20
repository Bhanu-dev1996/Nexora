# NovaCRM AI — State Management

> State management strategy using Zustand for client state, TanStack Query for server state, and React Context for cross-cutting concerns.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Zustand Stores](#zustand-stores)
3. [TanStack Query (Server State)](#tanstack-query-server-state)
4. [Local Component State](#local-component-state)
5. [React Context Providers](#react-context-providers)
6. [State Flow Diagrams](#state-flow-diagrams)
7. [DevTools Integration](#devtools-tools-integration)
8. [Persistence Patterns](#persistence-patterns)
9. [Performance Optimizations](#performance-optimizations)

---

## Architecture Overview

NovaCRM separates state into four distinct layers:

| Layer | Technology | Purpose |
|---|---|---|
| **Server State** | TanStack Query | API data fetching, caching, synchronization |
| **Client State** | Zustand | Authentication, UI state, domain state |
| **Component State** | `useState` / `useReducer` | Local form state, ephemeral UI |
| **Cross-Cutting State** | React Context | Theme, locale, feature flags |

### Design Principles

1. **Server state is the source of truth.** Client state reflects server responses.
2. **Minimize client-side state.** Prefer derived/computed values over stored state.
3. **Colocate state with consumers.** Don't lift state higher than necessary.
4. **Immutable updates.** All state transitions produce new references.
5. **Type safety throughout.** Every store and query is fully typed with TypeScript 6.

### Project Structure

```
src/
├── stores/                    # Zustand stores
│   ├── auth-store.ts
│   ├── ui-store.ts
│   ├── notification-store.ts
│   ├── lead-store.ts
│   ├── deal-store.ts
│   └── index.ts               # Re-exports
├── queries/                   # TanStack Query hooks
│   ├── use-lead-queries.ts
│   ├── use-contact-queries.ts
│   ├── use-company-queries.ts
│   ├── use-deal-queries.ts
│   ├── use-task-queries.ts
│   └── query-keys.ts          # Centralized query key factory
├── hooks/                     # Custom hooks
│   ├── use-local-storage.ts
│   ├── use-debounce.ts
│   ├── use-media-query.ts
│   └── use-ai-copilot.ts
├── contexts/                  # React Context providers
│   ├── theme-provider.tsx
│   ├── locale-provider.tsx
│   └── feature-flag-provider.tsx
├── lib/
│   ├── api.ts                 # Axios instance + interceptors
│   └── utils.ts               # cn() and utility helpers
```

---

## Zustand Stores

### `authStore`

**File:** `src/stores/auth-store.ts`

Manages authentication state, user session, and token lifecycle.

#### State Shape

```ts
import { type StateCreator } from "zustand";

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: "super_admin" | "admin" | "manager" | "member" | "viewer";
  organizationId: string;
  teamId?: string;
  permissions: string[];
  preferences: UserPreferences;
}

interface UserPreferences {
  timezone: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  language: string;
}

interface AuthState {
  // ── State ──────────────────────────────────────
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // ── Actions ────────────────────────────────────
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (...roles: string[]) => boolean;
}
```

#### Implementation

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { api } from "@/lib/api";

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({
      // ── Initial State ──────────────────────────
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      // ── Actions ────────────────────────────────
      initialize: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          set({ isInitialized: true });
          return;
        }

        try {
          set({ isLoading: true });
          const { data } = await api.post("/auth/refresh", { refreshToken });
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            isInitialized: true,
          });
        } catch {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
          });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        const { data } = await api.post("/auth/login", { email, password });
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        const { refreshToken } = get();
        api.post("/auth/logout", { refreshToken }).catch(() => {});
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await api.post("/auth/refresh", { refreshToken });
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      },

      updateUser: (updates) => {
        set((state) => {
          if (state.user) {
            Object.assign(state.user, updates);
          }
        });
      },

      updatePreferences: (prefs) => {
        set((state) => {
          if (state.user) {
            Object.assign(state.user.preferences, prefs);
          }
        });
      },

      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        return user.permissions.includes(permission) || user.role === "super_admin";
      },

      hasRole: (...roles) => {
        const { user } = get();
        if (!user) return false;
        return roles.includes(user.role);
      },
    })),
    {
      name: "nova-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
```

#### Usage

```tsx
import { useAuthStore } from "@/stores/auth-store";

// Read state
function UserMenu() {
  const { user, logout } = useAuthStore();
  return (
    <div>
      <span>{user?.name}</span>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
}

// Check permissions
function DeleteButton() {
  const { hasPermission } = useAuthStore();
  if (!hasPermission("leads.delete")) return null;
  return <Button variant="destructive">Delete Lead</Button>;
}
```

---

### `uiStore`

**File:** `src/stores/ui-store.ts`

Manages global UI state: sidebar visibility, modals, command palette, theme.

#### State Shape

```ts
interface UIState {
  // ── Sidebar ────────────────────────────────────
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // ── Command Palette ────────────────────────────
  commandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;

  // ── Global Modals ──────────────────────────────
  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  openModal: (name: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  // ── Toast Queue ────────────────────────────────
  toasts: Toast[];

  // ── Responsive ─────────────────────────────────
  isMobile: boolean;
  setMobile: (value: boolean) => void;

  // ── Search ─────────────────────────────────────
  globalSearchOpen: boolean;
  globalSearchQuery: string;
  openGlobalSearch: () => void;
  closeGlobalSearch: () => void;
  setGlobalSearchQuery: (query: string) => void;

  // ── Right Panel ────────────────────────────────
  rightPanelOpen: boolean;
  rightPanelContent: React.ReactNode | null;
  openRightPanel: (content: React.ReactNode) => void;
  closeRightPanel: () => void;
}
```

#### Implementation

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export const useUIStore = create<UIState>()(
  persist(
    immer((set) => ({
      // ── Sidebar ────────────────────────────────
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => { s.sidebarCollapsed = !s.sidebarCollapsed; }),
      setSidebarCollapsed: (collapsed) => set((s) => { s.sidebarCollapsed = collapsed; }),

      // ── Command Palette ────────────────────────
      commandPaletteOpen: false,
      openCommandPalette: () => set((s) => { s.commandPaletteOpen = true; }),
      closeCommandPalette: () => set((s) => { s.commandPaletteOpen = false; }),
      toggleCommandPalette: () => set((s) => { s.commandPaletteOpen = !s.commandPaletteOpen; }),

      // ── Global Modals ──────────────────────────
      activeModal: null,
      modalData: null,
      openModal: (name, data = null) => set((s) => {
        s.activeModal = name;
        s.modalData = data;
      }),
      closeModal: () => set((s) => {
        s.activeModal = null;
        s.modalData = null;
      }),

      // ── Toast Queue ────────────────────────────
      toasts: [],

      // ── Responsive ─────────────────────────────
      isMobile: false,
      setMobile: (value) => set((s) => { s.isMobile = value; }),

      // ── Search ─────────────────────────────────
      globalSearchOpen: false,
      globalSearchQuery: "",
      openGlobalSearch: () => set((s) => {
        s.globalSearchOpen = true;
        s.globalSearchQuery = "";
      }),
      closeGlobalSearch: () => set((s) => {
        s.globalSearchOpen = false;
        s.globalSearchQuery = "";
      }),
      setGlobalSearchQuery: (query) => set((s) => { s.globalSearchQuery = query; }),

      // ── Right Panel ────────────────────────────
      rightPanelOpen: false,
      rightPanelContent: null,
      openRightPanel: (content) => set((s) => {
        s.rightPanelOpen = true;
        s.rightPanelContent = content;
      }),
      closeRightPanel: () => set((s) => {
        s.rightPanelOpen = false;
        s.rightPanelContent = null;
      }),
    })),
    {
      name: "nova-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
```

#### Keyboard Shortcuts

```ts
// src/hooks/use-keyboard-shortcuts.ts
import { useEffect } from "react";
import { useUIStore } from "@/stores/ui-store";

export function useKeyboardShortcuts() {
  const { toggleCommandPalette, openGlobalSearch, toggleSidebar } = useUIStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // ⌘K — Command Palette
      if (isMod && e.key === "k") {
        e.preventDefault();
        toggleCommandPalette();
      }

      // ⌘/ — Global Search
      if (isMod && e.key === "/") {
        e.preventDefault();
        openGlobalSearch();
      }

      // ⌘B — Toggle Sidebar
      if (isMod && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleCommandPalette, openGlobalSearch, toggleSidebar]);
}
```

---

### `notificationStore`

**File:** `src/stores/notification-store.ts`

Manages in-app notifications, unread count, and real-time updates.

#### State Shape

```ts
interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

interface NotificationState {
  // ── State ──────────────────────────────────────
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  page: number;

  // ── Actions ────────────────────────────────────
  fetchNotifications: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
  clearAll: () => void;
}
```

#### Implementation

```ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { api } from "@/lib/api";

export const useNotificationStore = create<NotificationState>()(
  immer((set, get) => ({
    // ── State ──────────────────────────────────
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    hasMore: true,
    page: 1,

    // ── Actions ────────────────────────────────
    fetchNotifications: async (reset = false) => {
      const { page: currentPage } = get();
      const page = reset ? 1 : currentPage;

      set((s) => { s.isLoading = true; });

      const { data } = await api.get("/notifications", {
        params: { page, limit: 20 },
      });

      set((s) => {
        if (reset) {
          s.notifications = data.items;
        } else {
          s.notifications.push(...data.items);
        }
        s.unreadCount = s.notifications.filter((n) => !n.read).length;
        s.hasMore = data.hasMore;
        s.page = page + 1;
        s.isLoading = false;
      });
    },

    loadMore: async () => {
      const { hasMore, isLoading } = get();
      if (!hasMore || isLoading) return;
      await get().fetchNotifications();
    },

    markRead: (id) => {
      set((s) => {
        const n = s.notifications.find((n) => n.id === id);
        if (n) n.read = true;
        s.unreadCount = s.notifications.filter((n) => !n.read).length;
      });
      api.patch(`/notifications/${id}/read`).catch(() => {});
    },

    markAllRead: () => {
      set((s) => {
        s.notifications.forEach((n) => { n.read = true; });
        s.unreadCount = 0;
      });
      api.patch("/notifications/read-all").catch(() => {});
    },

    dismiss: (id) => {
      set((s) => {
        s.notifications = s.notifications.filter((n) => n.id !== id);
        s.unreadCount = s.notifications.filter((n) => !n.read).length;
      });
      api.delete(`/notifications/${id}`).catch(() => {});
    },

    dismissAll: () => {
      set((s) => {
        s.notifications = [];
        s.unreadCount = 0;
      });
      api.delete("/notifications").catch(() => {});
    },

    addNotification: (notification) => {
      set((s) => {
        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          read: false,
          createdAt: new Date().toISOString(),
        };
        s.notifications.unshift(newNotification);
        s.unreadCount = s.notifications.filter((n) => !n.read).length;
      });
    },

    clearAll: () => {
      set((s) => {
        s.notifications = [];
        s.unreadCount = 0;
      });
    },
  }))
);
```

#### Real-Time Integration

```ts
// src/hooks/use-notification-realtime.ts
import { useEffect } from "react";
import { useNotificationStore } from "@/stores/notification-store";
import { useAuthStore } from "@/stores/auth-store";

export function useNotificationRealtime() {
  const { addNotification } = useNotificationStore();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/notifications/stream?userId=${user.id}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      addNotification(data);
    };

    eventSource.onerror = () => {
      eventSource.close();
      // Reconnect after 5 seconds
      setTimeout(() => {
        // Reconnection logic handled by parent component
      }, 5000);
    };

    return () => eventSource.close();
  }, [isAuthenticated, user, addNotification]);
}
```

---

### `leadStore`

**File:** `src/stores/lead-store.ts`

Manages client-side lead state that doesn't map 1:1 to server state (filters, selections, view preferences).

#### State Shape

```ts
interface LeadFilters {
  search: string;
  status: string[];
  source: string[];
  assignee: string[];
  scoreRange: { min: number; max: number };
  dateRange: { from: Date | null; to: Date | null };
}

interface LeadViewPreferences {
  viewMode: "list" | "grid";
  visibleColumns: string[];
  sortBy: string;
  sortDirection: "asc" | "desc";
  pageSize: number;
}

interface LeadState {
  // ── Filters ────────────────────────────────────
  filters: LeadFilters;
  setFilter: <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => void;
  resetFilters: () => void;
  activeFilterCount: () => number;

  // ── Selection ──────────────────────────────────
  selectedLeadIds: Set<string>;
  selectLead: (id: string) => void;
  deselectLead: (id: string) => void;
  toggleLeadSelection: (id: string) => void;
  selectAllLeads: (ids: string[]) => void;
  clearSelection: () => void;

  // ── View Preferences ───────────────────────────
  viewPreferences: LeadViewPreferences;
  setViewMode: (mode: "list" | "grid") => void;
  toggleColumn: (column: string) => void;
  setSortBy: (field: string, direction?: "asc" | "desc") => void;
  setPageSize: (size: number) => void;

  // ── Bulk Actions ───────────────────────────────
  isBulkActionInProgress: boolean;
  setBulkActionInProgress: (inProgress: boolean) => void;
}

const defaultFilters: LeadFilters = {
  search: "",
  status: [],
  source: [],
  assignee: [],
  scoreRange: { min: 0, max: 100 },
  dateRange: { from: null, to: null },
};

const defaultViewPreferences: LeadViewPreferences = {
  viewMode: "list",
  visibleColumns: ["name", "email", "company", "status", "score", "createdAt"],
  sortBy: "createdAt",
  sortDirection: "desc",
  pageSize: 20,
};
```

#### Implementation

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export const useLeadStore = create<LeadState>()(
  persist(
    immer((set, get) => ({
      // ── Filters ────────────────────────────────
      filters: { ...defaultFilters },

      setFilter: (key, value) => set((s) => {
        (s.filters as Record<string, unknown>)[key] = value;
      }),

      resetFilters: () => set((s) => {
        s.filters = { ...defaultFilters };
      }),

      activeFilterCount: () => {
        const { filters } = get();
        let count = 0;
        if (filters.search) count++;
        if (filters.status.length > 0) count++;
        if (filters.source.length > 0) count++;
        if (filters.assignee.length > 0) count++;
        if (filters.scoreRange.min > 0 || filters.scoreRange.max < 100) count++;
        if (filters.dateRange.from || filters.dateRange.to) count++;
        return count;
      },

      // ── Selection ──────────────────────────────
      selectedLeadIds: new Set(),

      selectLead: (id) => set((s) => { s.selectedLeadIds.add(id); }),
      deselectLead: (id) => set((s) => { s.selectedLeadIds.delete(id); }),
      toggleLeadSelection: (id) => set((s) => {
        if (s.selectedLeadIds.has(id)) {
          s.selectedLeadIds.delete(id);
        } else {
          s.selectedLeadIds.add(id);
        }
      }),
      selectAllLeads: (ids) => set((s) => {
        s.selectedLeadIds = new Set(ids);
      }),
      clearSelection: () => set((s) => {
        s.selectedLeadIds = new Set();
      }),

      // ── View Preferences ───────────────────────
      viewPreferences: { ...defaultViewPreferences },

      setViewMode: (mode) => set((s) => {
        s.viewPreferences.viewMode = mode;
      }),

      toggleColumn: (column) => set((s) => {
        const cols = s.viewPreferences.visibleColumns;
        const idx = cols.indexOf(column);
        if (idx >= 0) {
          cols.splice(idx, 1);
        } else {
          cols.push(column);
        }
      }),

      setSortBy: (field, direction) => set((s) => {
        s.viewPreferences.sortBy = field;
        if (direction) {
          s.viewPreferences.sortDirection = direction;
        } else if (s.viewPreferences.sortBy === field) {
          s.viewPreferences.sortDirection =
            s.viewPreferences.sortDirection === "asc" ? "desc" : "asc";
        }
      }),

      setPageSize: (size) => set((s) => {
        s.viewPreferences.pageSize = size;
      }),

      // ── Bulk Actions ───────────────────────────
      isBulkActionInProgress: false,
      setBulkActionInProgress: (inProgress) => set((s) => {
        s.isBulkActionInProgress = inProgress;
      }),
    })),
    {
      name: "nova-leads",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        viewPreferences: state.viewPreferences,
      }),
    }
  )
);
```

---

### `dealStore`

**File:** `src/stores/deal-store.ts`

Manages deal pipeline state, Kanban board drag state, and deal filters.

#### State Shape

```ts
interface DealFilters {
  search: string;
  stages: string[];
  assignee: string[];
  minValue: number;
  maxValue: number;
  dateRange: { from: Date | null; to: Date | null };
}

interface PipelineColumn {
  id: string;
  title: string;
  color: string;
  dealIds: string[];
  limit?: number;
}

interface DragState {
  activeId: string | null;
  overId: string | null;
  overColumnId: string | null;
}

interface DealState {
  // ── Filters ────────────────────────────────────
  filters: DealFilters;
  setFilter: <K extends keyof DealFilters>(key: K, value: DealFilters[K]) => void;
  resetFilters: () => void;

  // ── Pipeline View ──────────────────────────────
  pipelineColumns: PipelineColumn[];
  setPipelineColumns: (columns: PipelineColumn[]) => void;
  moveDeal: (dealId: string, fromColumnId: string, toColumnId: string, toIndex: number) => void;
  reorderDeal: (dealId: string, columnId: string, fromIndex: number, toIndex: number) => void;

  // ── Drag State ─────────────────────────────────
  dragState: DragState;
  setDragState: (state: Partial<DragState>) => void;
  resetDragState: () => void;

  // ── Stage Definitions ──────────────────────────
  stages: Stage[];
}

interface Stage {
  id: string;
  name: string;
  color: string;
  probability: number;  // Win probability percentage
  order: number;
  limit?: number;
}
```

#### Implementation

```ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

const DEFAULT_STAGES: Stage[] = [
  { id: "qualification", name: "Qualification", color: "#6366f1", probability: 20, order: 0 },
  { id: "proposal", name: "Proposal", color: "#f59e0b", probability: 40, order: 1 },
  { id: "negotiation", name: "Negotiation", color: "#8b5cf6", probability: 60, order: 2 },
  { id: "contract", name: "Contract", color: "#3b82f6", probability: 80, order: 3 },
  { id: "closed_won", name: "Closed Won", color: "#10b981", probability: 100, order: 4 },
  { id: "closed_lost", name: "Closed Lost", color: "#ef4444", probability: 0, order: 5 },
];

export const useDealStore = create<DealState>()(
  immer((set, get) => ({
    // ── Filters ──────────────────────────────────
    filters: {
      search: "",
      stages: [],
      assignee: [],
      minValue: 0,
      maxValue: 1000000,
      dateRange: { from: null, to: null },
    },

    setFilter: (key, value) => set((s) => {
      (s.filters as Record<string, unknown>)[key] = value;
    }),

    resetFilters: () => set((s) => {
      s.filters = {
        search: "",
        stages: [],
        assignee: [],
        minValue: 0,
        maxValue: 1000000,
        dateRange: { from: null, to: null },
      };
    }),

    // ── Pipeline View ────────────────────────────
    pipelineColumns: DEFAULT_STAGES
      .filter((s) => s.id !== "closed_won" && s.id !== "closed_lost")
      .map((s) => ({ id: s.id, title: s.name, color: s.color, dealIds: [] })),

    setPipelineColumns: (columns) => set((s) => {
      s.pipelineColumns = columns;
    }),

    moveDeal: (dealId, fromColumnId, toColumnId, toIndex) => set((s) => {
      const fromCol = s.pipelineColumns.find((c) => c.id === fromColumnId);
      const toCol = s.pipelineColumns.find((c) => c.id === toColumnId);
      if (!fromCol || !toCol) return;

      // Remove from source
      const fromIdx = fromCol.dealIds.indexOf(dealId);
      if (fromIdx >= 0) fromCol.dealIds.splice(fromIdx, 1);

      // Add to target
      toCol.dealIds.splice(toIndex, 0, dealId);
    }),

    reorderDeal: (dealId, columnId, fromIndex, toIndex) => set((s) => {
      const col = s.pipelineColumns.find((c) => c.id === columnId);
      if (!col) return;

      col.dealIds.splice(fromIndex, 1);
      col.dealIds.splice(toIndex, 0, dealId);
    }),

    // ── Drag State ───────────────────────────────
    dragState: { activeId: null, overId: null, overColumnId: null },

    setDragState: (state) => set((s) => {
      Object.assign(s.dragState, state);
    }),

    resetDragState: () => set((s) => {
      s.dragState = { activeId: null, overId: null, overColumnId: null };
    }),

    // ── Stage Definitions ────────────────────────
    stages: DEFAULT_STAGES,
  }))
);
```

---

## TanStack Query (Server State)

### Query Client Configuration

**File:** `src/lib/query-client.ts`

```ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 minutes
      gcTime: 1000 * 60 * 30,           // 30 minutes (was garbageCollectionTime)
      retry: 2,
      refetchOnWindowFocus: true,
      refetchOnReconnect: "always",
    },
    mutations: {
      retry: 1,
    },
  },
});
```

### Query Key Factory

**File:** `src/queries/query-keys.ts`

Centralized, type-safe query key management. Prevents duplicate keys and ensures consistency.

```ts
export const queryKeys = {
  // ── Auth ──────────────────────────────────────
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },

  // ── Leads ─────────────────────────────────────
  leads: {
    all: ["leads"] as const,
    lists: () => [...queryKeys.leads.all, "list"] as const,
    list: (filters: LeadFilters) =>
      [...queryKeys.leads.lists(), filters] as const,
    details: () => [...queryKeys.leads.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.leads.details(), id] as const,
    activities: (id: string) =>
      [...queryKeys.leads.detail(id), "activities"] as const,
    notes: (id: string) =>
      [...queryKeys.leads.detail(id), "notes"] as const,
    tasks: (id: string) =>
      [...queryKeys.leads.detail(id), "tasks"] as const,
    stats: () => [...queryKeys.leads.all, "stats"] as const,
  },

  // ── Contacts ──────────────────────────────────
  contacts: {
    all: ["contacts"] as const,
    lists: () => [...queryKeys.contacts.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.contacts.lists(), filters] as const,
    details: () => [...queryKeys.contacts.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.contacts.details(), id] as const,
  },

  // ── Companies ─────────────────────────────────
  companies: {
    all: ["companies"] as const,
    lists: () => [...queryKeys.companies.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.companies.lists(), filters] as const,
    details: () => [...queryKeys.companies.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.companies.details(), id] as const,
  },

  // ── Deals ─────────────────────────────────────
  deals: {
    all: ["deals"] as const,
    lists: () => [...queryKeys.deals.all, "list"] as const,
    list: (filters: DealFilters) =>
      [...queryKeys.deals.lists(), filters] as const,
    pipeline: (filters?: DealFilters) =>
      [...queryKeys.deals.all, "pipeline", filters] as const,
    details: () => [...queryKeys.deals.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.deals.details(), id] as const,
    stats: () => [...queryKeys.deals.all, "stats"] as const,
    forecast: () => [...queryKeys.deals.all, "forecast"] as const,
  },

  // ── Tasks ─────────────────────────────────────
  tasks: {
    all: ["tasks"] as const,
    lists: () => [...queryKeys.tasks.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.tasks.lists(), filters] as const,
    details: () => [...queryKeys.tasks.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
    calendar: (date: string) =>
      [...queryKeys.tasks.all, "calendar", date] as const,
  },

  // ── Reports ───────────────────────────────────
  reports: {
    all: ["reports"] as const,
    revenue: (params: ReportParams) =>
      [...queryKeys.reports.all, "revenue", params] as const,
    sales: (params: ReportParams) =>
      [...queryKeys.reports.all, "sales", params] as const,
    leads: (params: ReportParams) =>
      [...queryKeys.reports.all, "leads", params] as const,
  },

  // ── Analytics ─────────────────────────────────
  analytics: {
    all: ["analytics"] as const,
    dashboard: () => [...queryKeys.analytics.all, "dashboard"] as const,
    pipeline: () => [...queryKeys.analytics.all, "pipeline"] as const,
  },

  // ── Users / Admin ─────────────────────────────
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    detail: (id: string) => [...queryKeys.users.all, "detail", id] as const,
  },
  roles: {
    all: ["roles"] as const,
    lists: () => [...queryKeys.roles.all, "list"] as const,
  },
  teams: {
    all: ["teams"] as const,
    lists: () => [...queryKeys.teams.all, "list"] as const,
  },
  auditLogs: {
    all: ["audit-logs"] as const,
    lists: (filters?: Record<string, unknown>) =>
      [...queryKeys.auditLogs.all, "list", filters] as const,
  },
} as const;
```

### CRUD Query Hooks — Leads Example

**File:** `src/queries/use-lead-queries.ts`

```ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import { api } from "@/lib/api";
import { toast } from "sonner";

// ── Types ────────────────────────────────────────
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company: string;
  source: string;
  status: "new" | "contacted" | "qualified" | "unqualified" | "converted";
  score: number;
  assigneeId?: string;
  assignee?: { id: string; name: string; avatarUrl?: string };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LeadListResponse {
  items: Lead[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface LeadFilters {
  search?: string;
  status?: string[];
  source?: string[];
  assignee?: string[];
  page?: number;
  limit?: number;
  sort?: string;
}

// ── List Query ───────────────────────────────────
export function useLeads(filters: LeadFilters) {
  return useQuery({
    queryKey: queryKeys.leads.list(filters),
    queryFn: async (): Promise<LeadListResponse> => {
      const { data } = await api.get("/leads", { params: filters });
      return data;
    },
    placeholderData: (prev) => prev,  // Keep previous data while fetching new
  });
}

// ── Infinite Query ───────────────────────────────
export function useInfiniteLeads(filters: Omit<LeadFilters, "page">) {
  return useInfiniteQuery({
    queryKey: queryKeys.leads.list(filters),
    queryFn: async ({ pageParam = 1 }): Promise<LeadListResponse> => {
      const { data } = await api.get("/leads", {
        params: { ...filters, page: pageParam },
      });
      return data;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

// ── Detail Query ─────────────────────────────────
export function useLead(id: string) {
  return useQuery({
    queryKey: queryKeys.leads.detail(id),
    queryFn: async (): Promise<Lead> => {
      const { data } = await api.get(`/leads/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// ── Activities ───────────────────────────────────
export function useLeadActivities(id: string) {
  return useQuery({
    queryKey: queryKeys.leads.activities(id),
    queryFn: async () => {
      const { data } = await api.get(`/leads/${id}/activities`);
      return data;
    },
    enabled: !!id,
  });
}

// ── Create Mutation ──────────────────────────────
interface CreateLeadInput {
  name: string;
  email: string;
  phone?: string;
  company: string;
  source: string;
  assigneeId?: string;
  tags?: string[];
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateLeadInput): Promise<Lead> => {
      const { data } = await api.post("/leads", input);
      return data;
    },
    onSuccess: (newLead) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      toast.success("Lead created successfully", {
        description: `${newLead.name} has been added to your pipeline.`,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to create lead", {
        description: error.message,
      });
    },
  });
}

// ── Update Mutation ──────────────────────────────
interface UpdateLeadInput {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: Lead["status"];
  score?: number;
  assigneeId?: string;
  tags?: string[];
}

export function useUpdateLead(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateLeadInput): Promise<Lead> => {
      const { data } = await api.patch(`/leads/${id}`, input);
      return data;
    },
    onMutate: async (input) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.leads.detail(id) });

      const previousLead = queryClient.getQueryData<Lead>(
        queryKeys.leads.detail(id)
      );

      queryClient.setQueryData<Lead>(queryKeys.leads.detail(id), (old) =>
        old ? { ...old, ...input } : old
      );

      return { previousLead };
    },
    onError: (_err, _input, context) => {
      // Rollback on error
      if (context?.previousLead) {
        queryClient.setQueryData(
          queryKeys.leads.detail(id),
          context.previousLead
        );
      }
      toast.error("Failed to update lead");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
    },
  });
}

// ── Delete Mutation ──────────────────────────────
export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(`/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      toast.success("Lead deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete lead");
    },
  });
}

// ── Bulk Actions ─────────────────────────────────
export function useBulkDeleteLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]): Promise<void> => {
      await api.post("/leads/bulk-delete", { ids });
    },
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      toast.success(`${ids.length} leads deleted`);
    },
  });
}

export function useBulkAssignLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ids,
      assigneeId,
    }: {
      ids: string[];
      assigneeId: string;
    }): Promise<void> => {
      await api.post("/leads/bulk-assign", { ids, assigneeId });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leads.all });
      toast.success(`${variables.ids.length} leads reassigned`);
    },
  });
}
```

### Similar Query Hooks

The same pattern applies to all CRUD entities:

| File | Hooks |
|---|---|
| `use-contact-queries.ts` | `useContacts`, `useContact`, `useCreateContact`, `useUpdateContact`, `useDeleteContact` |
| `use-company-queries.ts` | `useCompanies`, `useCompany`, `useCreateCompany`, `useUpdateCompany`, `useDeleteCompany` |
| `use-deal-queries.ts` | `useDeals`, `useDealPipeline`, `useDeal`, `useCreateDeal`, `useUpdateDeal`, `useDeleteDeal`, `useMoveDeal` |
| `use-task-queries.ts` | `useTasks`, `useTask`, `useCreateTask`, `useUpdateTask`, `useDeleteTask`, `useCompleteTask` |
| `use-report-queries.ts` | `useRevenueReport`, `useSalesReport`, `useLeadReport` |
| `use-analytics-queries.ts` | `useAnalyticsDashboard`, `usePipelineAnalytics` |

---

## Local Component State

### `useState` for Simple State

```tsx
// Ephemeral UI state that doesn't need to be shared
function LeadFilterSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* ... */}
    </Sheet>
  );
}
```

### `useReducer` for Complex Local State

```tsx
interface FormState {
  values: LeadFormData;
  errors: Partial<Record<keyof LeadFormData, string>>;
  touched: Partial<Record<keyof LeadFormData, boolean>>;
  isSubmitting: boolean;
  submitCount: number;
}

type FormAction =
  | { type: "SET_VALUE"; field: keyof LeadFormData; value: unknown }
  | { type: "SET_ERROR"; field: keyof LeadFormData; error: string }
  | { type: "SET_TOUCHED"; field: keyof LeadFormData; touched: boolean }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS" }
  | { type: "SUBMIT_FAILURE"; errors: Partial<Record<keyof LeadFormData, string>> }
  | { type: "RESET"; initialValues?: LeadFormData };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_VALUE":
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        touched: { ...state.touched, [action.field]: true },
      };
    case "SET_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error },
      };
    case "SUBMIT_START":
      return { ...state, isSubmitting: true, submitCount: state.submitCount + 1 };
    case "SUBMIT_SUCCESS":
      return { ...state, isSubmitting: false, errors: {} };
    case "SUBMIT_FAILURE":
      return { ...state, isSubmitting: false, errors: action.errors };
    case "RESET":
      return createInitialState(action.initialValues);
    default:
      return state;
  }
}
```

---

## React Context Providers

### ThemeProvider

**File:** `src/contexts/theme-provider.tsx`

```tsx
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("nova-theme") as Theme) || "system";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (isDark: boolean) => {
      root.classList.remove("light", "dark");
      root.classList.add(isDark ? "dark" : "light");
      setResolvedTheme(isDark ? "dark" : "light");
    };

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else {
      applyTheme(theme === "dark");
    }
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("nova-theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
```

### LocaleProvider

**File:** `src/contexts/locale-provider.tsx`

```tsx
import { createContext, useContext, useState } from "react";

interface LocaleContextValue {
  locale: string;
  setLocale: (locale: string) => void;
  currency: string;
  setCurrency: (currency: string) => void;
  formatDate: (date: Date | string, format?: string) => string;
  formatNumber: (n: number, style?: "decimal" | "currency" | "percent") => string;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState(
    () => localStorage.getItem("nova-locale") || "en-US"
  );
  const [currency, setCurrency] = useState(
    () => localStorage.getItem("nova-currency") || "USD"
  );

  const formatDate = (date: Date | string, format = "medium") => {
    const d = typeof date === "string" ? new Date(date) : date;
    const options: Record<string, Intl.DateTimeFormatOptions> = {
      short: { month: "short", day: "numeric" },
      medium: { year: "numeric", month: "short", day: "numeric" },
      long: { year: "numeric", month: "long", day: "numeric", weekday: "long" },
      time: { hour: "numeric", minute: "2-digit" },
      full: {
        year: "numeric", month: "long", day: "numeric",
        hour: "numeric", minute: "2-digit",
      },
    };
    return new Intl.DateTimeFormat(locale, options[format] || options.medium).format(d);
  };

  const formatNumber = (n: number, style = "decimal") => {
    return new Intl.NumberFormat(locale, {
      style,
      ...(style === "currency" ? { currency } : {}),
      ...(style === "percent" ? {} : {}),
    }).format(n);
  };

  const handleSetLocale = (l: string) => {
    setLocale(l);
    localStorage.setItem("nova-locale", l);
  };

  const handleSetCurrency = (c: string) => {
    setCurrency(c);
    localStorage.setItem("nova-currency", c);
  };

  return (
    <LocaleContext.Provider
      value={{
        locale,
        setLocale: handleSetLocale,
        currency,
        setCurrency: handleSetCurrency,
        formatDate,
        formatNumber,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within a LocaleProvider");
  return context;
}
```

### Provider Composition

**File:** `src/App.tsx`

```tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-provider";
import { LocaleProvider } from "@/contexts/locale-provider";
import { queryClient } from "@/lib/query-client";
import { router } from "@/routes";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useResponsive } from "@/hooks/use-responsive";

function AppShell() {
  useKeyboardShortcuts();
  useResponsive();

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LocaleProvider>
          <AppShell />
        </LocaleProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## State Flow Diagrams

### Authentication Flow

```
User clicks "Login"
  │
  ├─ form.handleSubmit() ─────────────► authStore.login(email, password)
  │                                        │
  │                                        ├─ api.post("/auth/login")
  │                                        │    │
  │                                        │    ├─ Success: sets user, tokens
  │                                        │    │   └─ isAuthenticated = true
  │                                        │    │      └─ Navigate to returnUrl
  │                                        │    │
  │                                        │    └─ Error: throws error
  │                                        │         └─ form.handleSubmit catches
  │                                        │            toast.error(message)
  │
  └─ QueryClient invalidated
     └─ React Query prefetches /auth/me
```

### Data Fetching Flow

```
Component mounts
  │
  ├─ useLeads(filters) ─────────────────► QueryClient
  │                                        │
  │                                        ├─ Cache HIT + fresh?
  │                                        │    └─ Yes: return cached data
  │                                        │
  │                                        ├─ Cache HIT + stale?
  │                                        │    ├─ Return cached data
  │                                        │    └─ Background refetch
  │                                        │
  │                                        └─ Cache MISS?
  │                                             └─ api.get("/leads", { params })
  │                                                  │
  │                                                  ├─ Success: cache + return
  │                                                  └─ Error: retry (2x)
  │                                                       └─ After retries: error state
```

### Optimistic Update Flow

```
User clicks "Mark as Qualified"
  │
  ├─ useUpdateLead(id) ─────────────────► mutation.mutate({ status: "qualified" })
  │                                        │
  │                                        ├─ onMutate:
  │                                        │    ├─ Cancel outgoing refetches
  │                                        │    ├─ Snapshot current data
  │                                        │    ├─ Optimistically update cache
  │                                        │    └─ Return snapshot for rollback
  │                                        │
  │                                        ├─ api.patch("/leads/:id", { status })
  │                                        │
  │                                        ├─ onSuccess:
  │                                        │    ├─ Invalidate all lead queries
  │                                        │    └─ Refetch in background
  │                                        │
  │                                        └─ onError:
  │                                             ├─ Rollback to snapshot
  │                                             └─ toast.error("Failed to update")
```

---

## DevTools Integration

### Zustand DevTools

All stores are connected to Redux DevTools for time-travel debugging:

```ts
import { devtools } from "zustand/middleware";

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // ... store implementation
      })),
      { name: "nova-auth" }
    ),
    { name: "AuthStore" }  // Name shown in DevTools
  )
);
```

### React Query DevTools

```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Rendered at the bottom of the component tree
// Only visible in development
<ReactQueryDevtools
  initialIsOpen={false}
  position="bottom"
  buttonPosition="bottom-right"
/>
```

### Browser Extension Usage

Install the **Redux DevTools** Chrome/Firefox extension. All Zustand stores appear as named tabs:
- `AuthStore` — Authentication state
- `UIStore` — UI preferences
- `NotificationStore` — Notification state
- `LeadStore` — Lead filters and view state
- `DealStore` — Deal pipeline state

---

## Persistence Patterns

### What Gets Persisted

| Store | Persisted | Storage | Reason |
|---|---|---|---|
| `authStore` | `refreshToken`, `user` | localStorage | Session survival across tabs |
| `uiStore` | `sidebarCollapsed` | localStorage | UI preference |
| `leadStore` | `viewPreferences` | localStorage | Column/view preferences |
| `dealStore` | — | — | Server state, no persistence needed |
| `notificationStore` | — | — | Fetched fresh on each session |

### What Doesn't Get Persisted

| State | Why |
|---|---|
| `accessToken` | Short-lived, stored in memory only. Prevents XSS token theft. |
| Form state | Ephemeral, recreated on mount. |
| Query cache | Managed by TanStack Query, uses memory + optional persister. |

### TanStack Query Persistence (Optional)

For offline support, TanStack Query can persist its cache:

```ts
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "nova-query-cache",
});

function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.gcTime !== 0 && !query.meta?.persist === false,
        },
      }}
    >
      {/* ... */}
    </PersistQueryClientProvider>
  );
}
```

### Zustand Storage Migration

For schema versioning, Zustand supports migration:

```ts
const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({ /* ... */ })),
    {
      name: "nova-auth",
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>;

        if (version === 1) {
          // v1 → v2: renamed "token" to "accessToken"
          state.accessToken = (state as Record<string, string>).token;
          delete (state as Record<string, string>).token;
        }

        return state as AuthState;
      },
    }
  )
);
```

---

## Performance Optimizations

### Selective Store Subscriptions

Avoid unnecessary re-renders by selecting specific slices:

```tsx
// ❌ Bad — re-renders on ANY store change
const { user, isAuthenticated, sidebarCollapsed, commandPaletteOpen } = useUIStore();

// ✅ Good — only re-renders when this specific value changes
const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
const user = useAuthStore((s) => s.user);
```

### TanStack Query Optimizations

```tsx
// 1. Select only needed fields
const { data: leads } = useLeads(filters);
const leadNames = leads?.items.map((l) => l.name) ?? [];
// Use select option for derived data
const { data: leadNames } = useQuery({
  queryKey: queryKeys.leads.list(filters),
  queryFn: fetchLeads,
  select: (data) => data.items.map((l) => l.name),
});

// 2. Keep previous data during transitions
const { data, isPending } = useQuery({
  queryKey: [...],
  placeholderData: keepPreviousData,
});

// 3. Prefetch on hover
function LeadRow({ lead }: { lead: Lead }) {
  const queryClient = useQueryClient();

  return (
    <Link
      to={`/leads/${lead.id}`}
      onMouseEnter={() => {
        queryClient.prefetchQuery({
          queryKey: queryKeys.leads.detail(lead.id),
          queryFn: () => fetchLead(lead.id),
          staleTime: 1000 * 60 * 5,
        });
      }}
    >
      {lead.name}
    </Link>
  );
}
```

### Zustand Shallow Comparison

```tsx
import { useShallow } from "zustand/shallow";

// ✅ Prevents re-render when other selected values change
const { user, logout } = useAuthStore(
  useShallow((s) => ({ user: s.user, logout: s.logout }))
);
```
