# NovaCRM AI — UI Design System

> **Version:** 1.0.0
> **Last Updated:** 2026-07-20
> **Framework:** React 19, TypeScript 6, Vite 8, Tailwind CSS v4, shadcn/ui (base-nova style)

---

## Table of Contents

1. [Overview](#overview)
2. [Design Principles](#design-principles)
3. [Theme System](#theme-system)
4. [Color Palette](#color-palette)
5. [Typography](#typography)
6. [Spacing System](#spacing-system)
7. [Icons](#icons)
8. [Shadows & Elevation](#shadows--elevation)
9. [Animations & Motion](#animations--motion)
10. [Responsive Breakpoints](#responsive-breakpoints)
11. [Layout Patterns](#layout-patterns)
12. [Component Patterns](#component-patterns)
13. [Dark Mode](#dark-mode)
14. [Accessibility](#accessibility)

---

## Overview

NovaCRM AI's design system is built on top of **shadcn/ui** with the **base-nova** style variant, extended with custom tokens, components, and patterns specific to enterprise CRM workflows. The system prioritizes clarity, density, and data readability for power users who spend 8+ hours daily in the application.

### Tech Stack

| Tool              | Version | Purpose                         |
|-------------------|---------|---------------------------------|
| React             | 19      | UI framework                    |
| TypeScript        | 6       | Type safety                     |
| Vite              | 8       | Build tooling and HMR           |
| Tailwind CSS      | v4      | Utility-first CSS               |
| shadcn/ui         | base-nova | Pre-built accessible components |
| Lucide React      | latest  | Icon library                    |
| Framer Motion     | latest  | Animation library               |

---

## Design Principles

1. **Information Density** — CRM users need maximum data visibility. Components are compact by default with expandable detail views.

2. **Progressive Disclosure** — Show essential information first. Detailed views, filters, and advanced options are one click away.

3. **Consistent Patterns** — Every list, form, table, and detail page follows the same structural patterns. Users learn once, apply everywhere.

4. **Accessibility First** — WCAG 2.1 AA compliance minimum. All interactive elements are keyboard navigable. Screen reader support throughout.

5. **Dark/Light Parity** — Both themes receive equal design attention. No feature is light-mode-only.

---

## Theme System

NovaCRM uses CSS custom properties for theming, enabling runtime theme switching without layout shift.

### Theme Activation

The active theme is determined by:
1. User preference (stored in settings)
2. System preference (`prefers-color-scheme`)
3. Default (light)

### Theme Application

```html
<html data-theme="light">
  <!-- or -->
<html data-theme="dark">
```

Tailwind CSS v4 handles theme switching via the `@theme` directive in the global CSS file:

```css
@import "tailwindcss";

@theme {
  --color-background: var(--nova-background);
  --color-foreground: var(--nova-foreground);
  --color-primary: var(--nova-primary);
  /* ... all tokens */
}
```

---

## Color Palette

### Primary Colors

The primary palette centers around indigo/blue tones for actions, focus states, and brand identity.

| Token              | Light Mode  | Dark Mode   | Usage                              |
|--------------------|-------------|-------------|-------------------------------------|
| `--nova-primary`       | `#6366f1` | `#818cf8` | Primary buttons, links, focus rings |
| `--nova-primary-hover` | `#4f46e5` | `#6366f1` | Primary button hover                |
| `--nova-primary-active`| `#4338ca` | `#4f46e5` | Primary button active/pressed       |
| `--nova-primary-muted` | `#e0e7ff` | `#312e81` | Muted primary backgrounds           |
| `--nova-primary-fg`    | `#ffffff` | `#ffffff` | Text on primary backgrounds         |

### Semantic Colors

| Token                 | Light Mode  | Dark Mode   | Usage                              |
|-----------------------|-------------|-------------|-------------------------------------|
| `--nova-success`          | `#22c55e` | `#4ade80` | Success states, positive indicators |
| `--nova-success-muted`    | `#dcfce7` | `#14532d` | Success backgrounds                 |
| `--nova-warning`          | `#f59e0b` | `#fbbf24` | Warning states, caution indicators  |
| `--nova-warning-muted`    | `#fef3c7` | `#78350f` | Warning backgrounds                 |
| `--nova-error`            | `#ef4444` | `#f87171` | Error states, destructive actions   |
| `--nova-error-muted`      | `#fee2e2` | `#7f1d1d` | Error backgrounds                   |
| `--nova-info`             | `#3b82f6` | `#60a5fa` | Informational states                |
| `--nova-info-muted`       | `#dbeafe` | `#1e3a5f` | Info backgrounds                    |

### Neutral Colors

| Token                   | Light Mode  | Dark Mode   | Usage                              |
|-------------------------|-------------|-------------|-------------------------------------|
| `--nova-background`         | `#ffffff` | `#09090b` | Page background                     |
| `--nova-foreground`         | `#09090b` | `#fafafa` | Primary text                        |
| `--nova-card`               | `#ffffff` | `#0a0a0c` | Card backgrounds                    |
| `--nova-card-foreground`    | `#09090b` | `#fafafa` | Card text                           |
| `--nova-muted`              | `#f4f4f5` | `#27272a` | Muted backgrounds                   |
| `--nova-muted-foreground`   | `#71717a` | `#a1a1aa` | Secondary text, placeholders        |
| `--nova-border`             | `#e4e4e7` | `#27272a` | Default borders                     |
| `--nova-input`              | `#e4e4e7` | `#27272a` | Input borders                       |
| `--nova-ring`               | `#6366f1` | `#818cf8` | Focus rings                         |
| `--nova-accent`             | `#f4f4f5` | `#27272a` | Accent backgrounds (hover states)   |
| `--nova-accent-foreground`  | `#09090b` | `#fafafa` | Accent text                         |
| `--nova-destructive`        | `#ef4444` | `#f87171` | Destructive action backgrounds      |
| `--nova-destructive-fg`     | `#ffffff` | `#ffffff` | Destructive action text             |

### Data Visualization Colors

Used for charts, pipeline stages, and data categorization:

| Token              | Light Mode  | Dark Mode   | Usage                    |
|--------------------|-------------|-------------|---------------------------|
| `--nova-chart-1`       | `#6366f1` | `#818cf8` | Primary chart series     |
| `--nova-chart-2`       | `#22c55e` | `#4ade80` | Secondary chart series   |
| `--nova-chart-3`       | `#f59e0b` | `#fbbf24` | Tertiary chart series    |
| `--nova-chart-4`       | `#ef4444` | `#f87171` | Quaternary chart series  |
| `--nova-chart-5`       | `#8b5cf6` | `#a78bfa` | Quinary chart series     |
| `--nova-chart-6`       | `#06b6d4` | `#22d3ee` | Senary chart series      |

---

## Typography

### Font Family

```css
--font-sans: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
--font-mono: 'Geist Mono', 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace;
```

**Geist** is the primary typeface. It is a clean, modern sans-serif optimized for UI rendering at small sizes. The Geist Mono variant is used for code blocks, timestamps, and data values.

### Type Scale

| Token              | Size    | Line Height | Weight    | Letter Spacing | Usage                      |
|--------------------|---------|-------------|-----------|----------------|----------------------------|
| `--text-xs`            | 12px    | 16px        | 400       | 0.01em         | Captions, helper text      |
| `--text-sm`            | 14px    | 20px        | 400       | 0              | Secondary text, labels     |
| `--text-base`          | 16px    | 24px        | 400       | 0              | Body text, paragraphs      |
| `--text-lg`            | 18px    | 28px        | 500       | -0.01em        | Subheadings                |
| `--text-xl`            | 20px    | 28px        | 600       | -0.01em        | Section headings           |
| `--text-2xl`           | 24px    | 32px        | 600       | -0.02em        | Page titles                |
| `--text-3xl`           | 30px    | 36px        | 700       | -0.02em        | Dashboard headings         |
| `--text-4xl`           | 36px    | 40px        | 700       | -0.02em        | Hero text, marketing      |

### Font Weights

| Weight | CSS Value | Usage                                    |
|--------|-----------|------------------------------------------|
| Regular | 400      | Body text, labels, descriptions          |
| Medium  | 500      | Subheadings, navigation, button text     |
| Semibold| 600      | Section headings, table headers          |
| Bold    | 700      | Page titles, critical emphasis           |

### Typography Examples

```html
<!-- Page Title -->
<h1 className="text-3xl font-bold tracking-tight text-foreground">
  Dashboard
</h1>

<!-- Section Heading -->
<h2 className="text-xl font-semibold tracking-tight text-foreground">
  Recent Activity
</h2>

<!-- Card Title -->
<h3 className="text-lg font-medium tracking-tight text-foreground">
  Pipeline Summary
</h3>

<!-- Body Text -->
<p className="text-base text-foreground">
  Welcome to NovaCRM AI. Your sales pipeline at a glance.
</p>

<!-- Secondary/Helper Text -->
<p className="text-sm text-muted-foreground">
  Showing 1-20 of 142 results
</p>

<!-- Caption -->
<span className="text-xs text-muted-foreground">
  Last updated 5 minutes ago
</span>

<!-- Monospace Data -->
<code className="font-mono text-sm text-foreground">
  $1,247,500.00
</code>
```

---

## Spacing System

The spacing system uses a **4px base unit**. All spacing values are multiples of 4.

### Spacing Scale

| Token   | Value | Usage                                    |
|---------|-------|------------------------------------------|
| `0`     | 0px   | No spacing                               |
| `px`    | 1px   | Borders, fine dividers                   |
| `0.5`   | 2px   | Tight internal padding                   |
| `1`     | 4px   | Minimum gap, inline element spacing      |
| `1.5`   | 6px   | Compact list item gaps                   |
| `2`     | 8px   | Default icon gaps, small padding         |
| `2.5`   | 10px  | Form field internal padding              |
| `3`     | 12px  | Button padding (vertical), card padding  |
| `3.5`   | 14px  | Medium button padding                    |
| `4`     | 16px  | Standard card padding, section gaps      |
| `5`     | 20px  | Large card padding, form spacing         |
| `6`     | 24px  | Section padding, modal padding           |
| `7`     | 28px  | Large section gaps                       |
| `8`     | 32px  | Page padding, major section separation   |
| `9`     | 36px  | Extra-large gaps                         |
| `10`    | 40px  | Page header spacing                      |
| `11`    | 44px  | Touch target minimum                     |
| `12`    | 48px  | Large section padding                    |
| `14`    | 56px  | Hero spacing                             |
| `16`    | 64px  | Page-level vertical spacing              |
| `20`    | 80px  | Maximum content width padding            |
| `24`    | 96px  | Major page sections                      |

### Tailwind Usage

```html
<!-- Tight spacing (lists, compact UI) -->
<div className="space-y-1">...</div>   <!-- 4px gaps -->
<div className="space-y-2">...</div>   <!-- 8px gaps -->

<!-- Standard spacing (forms, cards) -->
<div className="space-y-4">...</div>   <!-- 16px gaps -->
<div className="space-y-6">...</div>   <!-- 24px gaps -->

<!-- Section spacing -->
<div className="space-y-8">...</div>   <!-- 32px gaps -->

<!-- Card padding -->
<div className="p-4">...</div>         <!-- 16px all sides -->
<div className="p-6">...</div>         <!-- 24px all sides -->
```

---

## Icons

### Icon Library

NovaCRM uses **Lucide React** for all iconography. Lucide provides consistent, customizable SVG icons with a 24x24 grid.

### Icon Sizes

| Size    | Pixels | Usage                                    |
|---------|--------|------------------------------------------|
| `xs`    | 12px   | Inline badges, status indicators         |
| `sm`    | 16px   | Button icons, table cell icons           |
| `md`    | 20px   | Default icon size, navigation            |
| `lg`    | 24px   | Feature icons, empty states              |
| `xl`    | 32px   | Section headers, dashboard widgets       |
| `2xl`   | 48px   | Hero icons, onboarding illustrations     |

### Common Icons

```typescript
// Navigation
import { Home, Users, Building2, Phone, Mail, BarChart3 } from 'lucide-react';

// CRM Actions
import { Plus, Pencil, Trash2, Filter, Search, Download, Upload } from 'lucide-react';

// Status Indicators
import { CheckCircle2, XCircle, AlertTriangle, Clock, Info } from 'lucide-react';

// Deal Pipeline
import { TrendingUp, TrendingDown, DollarSign, Target, Award } from 'lucide-react';

// AI Features
import { Sparkles, Brain, Lightbulb, Wand2 } from 'lucide-react';

// Communication
import { MessageSquare, Video, PhoneCall, Bell, Send } from 'lucide-react';

// File Management
import { FileText, Image, Paperclip, File, FolderOpen } from 'lucide-react';
```

### Icon Usage Pattern

```tsx
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

function UsersHeader({ userCount }: { userCount: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Users className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Team Members</h2>
          <p className="text-sm text-muted-foreground">{userCount} active</p>
        </div>
      </div>
      <Button size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Invite Member
      </Button>
    </div>
  );
}
```

---

## Shadows & Elevation

NovaCRM uses a layered elevation system for depth and visual hierarchy.

### Elevation Levels

| Level | Token              | Light Mode Shadow                                | Dark Mode Shadow                              | Usage                        |
|-------|--------------------|--------------------------------------------------|-----------------------------------------------|------------------------------|
| 0     | `--shadow-none`        | `none`                                           | `none`                                        | Flat elements                |
| 1     | `--shadow-sm`          | `0 1px 2px 0 rgb(0 0 0 / 0.05)`                | `0 1px 2px 0 rgb(0 0 0 / 0.3)`              | Subtle depth, input fields   |
| 2     | `--shadow-md`          | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | `0 4px 6px -1px rgb(0 0 0 / 0.4)` | Cards, dropdowns             |
| 3     | `--shadow-lg`          | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | `0 10px 15px -3px rgb(0 0 0 / 0.5)` | Modals, popovers             |
| 4     | `--shadow-xl`          | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | `0 20px 25px -5px rgb(0 0 0 / 0.6)` | Command palette, toast       |
| 5     | `--shadow-2xl`         | `0 25px 50px -12px rgb(0 0 0 / 0.25)`           | `0 25px 50px -12px rgb(0 0 0 / 0.7)` | Full-screen overlays         |

### Special Shadows

| Token                   | Value                                                        | Usage                     |
|-------------------------|--------------------------------------------------------------|---------------------------|
| `--shadow-inner`            | `inset 0 2px 4px 0 rgb(0 0 0 / 0.05)`                      | Inset inputs, pressed btn |
| `--shadow-glow-primary`     | `0 0 20px rgb(99 102 241 / 0.3)`                           | Focus glow on primary     |
| `--shadow-glow-success`     | `0 0 20px rgb(34 197 94 / 0.3)`                            | Success state glow        |
| `--shadow-glow-error`       | `0 0 20px rgb(239 68 68 / 0.3)`                            | Error state glow          |

### Tailwind Usage

```html
<!-- Card with elevation -->
<div className="rounded-xl border bg-card shadow-md">...</div>

<!-- Dropdown with elevation -->
<div className="rounded-lg border bg-popover shadow-lg">...</div>

<!-- Modal with maximum elevation -->
<div className="rounded-xl border bg-card shadow-xl">...</div>

<!-- Subtle card (no shadow, border only) -->
<div className="rounded-xl border bg-card">...</div>
```

---

## Animations & Motion

### Transition Defaults

NovaCRM uses smooth, subtle animations that don't impede productivity.

```css
/* Base transition for interactive elements */
transition-property: color, background-color, border-color, box-shadow, opacity;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
transition-duration: 150ms;

/* Complex transitions for layout changes */
transition-property: all;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
transition-duration: 200ms;

/* Spring animations for modals/overlays */
transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Tailwind Transition Classes

| Class               | Duration | Usage                                    |
|---------------------|----------|------------------------------------------|
| `transition-none`       | 0ms      | Disable transitions                      |
| `transition-all`        | 200ms    | Full property transitions                |
| `transition-colors`     | 150ms    | Color changes (hover, focus)             |
| `transition-opacity`    | 150ms    | Fade in/out                              |
| `transition-shadow`     | 150ms    | Shadow changes (hover)                   |
| `transition-transform`  | 200ms    | Scale, rotate, translate                 |

### Keyframe Animations

```css
/* Fade in from below */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fade in from center */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide in from right (sidebars, drawers) */
@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* Slide in from left (mobile nav) */
@keyframes slide-in-left {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

/* Scale in (modals, popovers) */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Pulse (loading, notifications) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Spin (loading spinners) */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Bounce (attention indicators) */
@keyframes bounce {
  0%, 100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

/* Shimmer (loading skeletons) */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Notification slide-in */
@keyframes notification-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Tailwind Animation Classes

| Class                 | Duration | Usage                              |
|-----------------------|----------|-------------------------------------|
| `animate-fade-in`         | 200ms    | Content appearing                   |
| `animate-fade-in-up`      | 200ms    | Cards, list items entering          |
| `animate-scale-in`        | 150ms    | Modals, popovers                    |
| `animate-slide-in-right`  | 250ms    | Side panels, drawers                |
| `animate-slide-in-left`   | 250ms    | Mobile navigation                   |
| `animate-pulse`           | 2000ms   | Loading states                      |
| `animate-spin`            | 1000ms   | Loading spinners                    |
| `animate-shimmer`         | 2000ms   | Skeleton loading                    |
| `animate-notification-in` | 300ms    | Toast notifications                 |

### Reduced Motion

All animations respect the `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Responsive Breakpoints

### Breakpoint Values

| Name          | Min Width | Max Width | Tailwind Prefix | Target Device           |
|---------------|-----------|-----------|-----------------|--------------------------|
| `mobile`      | 0px       | 374px     | `default`       | Small phones (SE, Mini)  |
| `sm`          | 375px     | 767px     | `sm:`           | Standard phones          |
| `md`          | 768px     | 1023px    | `md:`           | Tablets (portrait)       |
| `lg`          | 1024px    | 1279px    | `lg:`           | Tablets (landscape), laptops |
| `xl`          | 1280px    | 1535px    | `xl:`           | Desktops                 |
| `2xl`         | 1536px    | —         | `2xl:`          | Wide screens, ultrawide  |

### Layout Behavior at Breakpoints

| Breakpoint    | Sidebar          | Top Nav    | Content Width | Table Behavior     |
|---------------|------------------|------------|---------------|--------------------|
| `mobile`      | Hidden (hamburger)| Compact   | Full width    | Card view          |
| `sm`          | Hidden (hamburger)| Compact   | Full width    | Card view          |
| `md`          | Collapsed (icons) | Standard  | Fluid        | Horizontal scroll  |
| `lg`          | Expanded (256px)  | Standard  | Fluid        | Full table         |
| `xl`          | Expanded (256px)  | Standard  | Max 1280px   | Full table         |
| `2xl`         | Expanded (256px)  | Standard  | Max 1440px   | Full table + panels|

### Container Classes

```html
<!-- Standard content container -->
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">...</div>

<!-- Narrow content (forms, auth pages) -->
<div className="mx-auto max-w-md px-4">...</div>

<!-- Wide content (dashboards, analytics) -->
<div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">...</div>

<!-- Full width content -->
<div className="w-full px-4 sm:px-6 lg:px-8">...</div>
```

---

## Layout Patterns

### Primary Layout: Sidebar + Top Nav + Content

The main application layout consists of three regions:

```
+--------------------------------------------------+
|  Top Navigation Bar (h-16, fixed top)            |
|  [Logo]  [Search]  [Notifications]  [User Menu]  |
+----------+---------------------------------------+
|          |                                       |
| Sidebar  |   Content Area                       |
| (w-64)   |   (flex-1, overflow-auto)            |
|          |                                       |
| Nav      |   [Page Header]                      |
| Items    |   [Page Content]                     |
|          |                                       |
|          |                                       |
+----------+---------------------------------------+
```

**Implementation:**

```tsx
function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMediaQuery('(max-width: 767px)');

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className={cn(
        'flex flex-col border-r bg-card transition-all duration-200',
        isMobile ? 'fixed inset-y-0 left-0 z-50 w-64' : 'relative',
        sidebarOpen ? 'w-64' : 'w-16',
        isMobile && !sidebarOpen && 'hidden'
      )}>
        <SidebarContent collapsed={!sidebarOpen} />
      </aside>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="flex h-16 items-center border-b bg-card px-4 lg:px-6">
          <TopNav onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### Page Header Pattern

Every page follows a consistent header structure:

```tsx
function PageHeader({ title, description, actions, breadcrumbs }) {
  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-foreground transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
```

### Two-Panel Layout (Detail Views)

Used for lead/contact/deal detail pages:

```
+-----------------------------------------------+
|  [Page Header with breadcrumbs]               |
+------------------------+----------------------+
|                        |                      |
|  Main Panel (60%)      |  Side Panel (40%)    |
|                        |                      |
|  [Activity Feed]       |  [Record Info]       |
|  [Notes]               |  [Contact Details]   |
|  [Timeline]            |  [Related Records]   |
|  [Comments]            |  [AI Insights]       |
|                        |  [Quick Actions]     |
|                        |                      |
+------------------------+----------------------+
```

---

## Component Patterns

### Card Pattern

Cards are the primary container for content grouping.

```tsx
function CardPattern() {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Card Title</h3>
            <p className="text-xs text-muted-foreground">Subtitle text</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Content here */}
      </div>

      {/* Card Footer (optional) */}
      <div className="flex items-center justify-end gap-2 border-t p-4">
        <Button variant="outline" size="sm">Cancel</Button>
        <Button size="sm">Save</Button>
      </div>
    </div>
  );
}
```

### Table Pattern

Data tables for lists with sorting, filtering, and bulk actions.

```tsx
function TablePattern() {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      {/* Table Header / Toolbar */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 w-64" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                Name
              </th>
              <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                Status
              </th>
              <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                Value
              </th>
              <th className="h-10 px-4 text-right text-xs font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Rows here */}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t p-4">
        <p className="text-sm text-muted-foreground">
          Showing 1-20 of 142 results
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}
```

### Form Pattern

Forms follow a consistent structure with validation, helper text, and error states.

```tsx
function FormPattern() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Form Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create Lead</h2>
        <p className="text-sm text-muted-foreground">
          Fill in the details below to create a new lead.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 rounded-xl border bg-card p-6">
        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input id="firstName" placeholder="John" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input id="lastName" placeholder="Connor" />
          </div>
        </div>

        {/* Full-width field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" placeholder="john@example.com" />
          <p className="text-xs text-muted-foreground">
            We'll use this for communication.
          </p>
        </div>

        {/* Textarea */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" placeholder="Any additional information..." rows={4} />
        </div>

        {/* Select */}
        <div className="space-y-2">
          <Label htmlFor="source">Lead Source *</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="cold_call">Cold Call</SelectItem>
              <SelectItem value="social">Social Media</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error state example */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-destructive">Phone *</Label>
          <Input id="phone" className="border-destructive" />
          <p className="text-xs text-destructive">Please enter a valid phone number.</p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button>Create Lead</Button>
      </div>
    </div>
  );
}
```

### Modal / Dialog Pattern

```tsx
function ModalPattern() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this lead? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Confirmation content or form */}
        </div>

        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Empty State Pattern

```tsx
function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// Usage
<EmptyState
  icon={Users}
  title="No team members yet"
  description="Invite your team members to start collaborating on deals."
  action={<Button><Plus className="mr-2 h-4 w-4" />Invite Member</Button>}
/>
```

### Skeleton Loading Pattern

```tsx
function SkeletonPattern() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Dark Mode

### Implementation

Dark mode is implemented via the `data-theme` attribute on the root element. All colors are defined as CSS custom properties that change based on the theme.

```typescript
// Theme toggle hook
function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('nova-theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nova-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return { theme, setTheme, toggle };
}
```

### Theme Toggle Component

```tsx
function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <Button variant="ghost" size="icon" onClick={toggle}>
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      ) : (
        <Moon className="h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

### Dark Mode Color Adjustments

- Background colors are darkened (`#ffffff` -> `#09090b`)
- Text colors are lightened (`#09090b` -> `#fafafa`)
- Border colors use darker values (`#e4e4e7` -> `#27272a`)
- Primary colors shift slightly lighter for contrast (`#6366f1` -> `#818cf8`)
- Shadows use higher opacity values
- Semantic colors (success, warning, error) are adjusted for dark backgrounds

---

## Accessibility

### Keyboard Navigation

| Key               | Action                                    |
|--------------------|-------------------------------------------|
| `Tab`              | Move to next interactive element          |
| `Shift + Tab`      | Move to previous interactive element      |
| `Enter`            | Activate buttons and links                |
| `Space`            | Activate buttons, toggle checkboxes       |
| `Escape`           | Close modals, dropdowns, popovers         |
| `Arrow keys`       | Navigate within lists, tabs, menus        |
| `Home`             | Jump to first item in list/tab            |
| `End`              | Jump to last item in list/tab             |

### Focus Management

All interactive elements use visible focus indicators:

```css
:focus-visible {
  outline: 2px solid var(--nova-ring);
  outline-offset: 2px;
  border-radius: 4px;
}
```

### ARIA Labels

Key components include proper ARIA labels:

```html
<!-- Navigation -->
<nav aria-label="Main navigation">...</nav>
<nav aria-label="Breadcrumb">...</nav>

<!-- Tables -->
<table aria-label="Deals list">
  <caption className="sr-only">All deals in the sales pipeline</caption>
</table>

<!-- Modals -->
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">...</div>

<!-- Live regions for dynamic content -->
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {notificationMessage}
</div>

<!-- Skip to main content -->
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50">
  Skip to main content
</a>
```

### Color Contrast

All text colors meet WCAG AA contrast ratios:
- Normal text (< 18px): **4.5:1** minimum contrast
- Large text (>= 18px bold or >= 24px): **3:1** minimum contrast
- Interactive elements: **3:1** minimum against adjacent colors

### Screen Reader Support

- All images include descriptive `alt` text
- Form fields are linked to labels via `htmlFor`/`id`
- Error messages use `aria-describedby`
- Loading states use `aria-busy` and `aria-live`
- Status messages use `role="status"` or `aria-live="polite"`

---

## Changelog

| Version | Date       | Changes                                              |
|---------|------------|------------------------------------------------------|
| 1.0.0   | 2026-07-20 | Initial design system release                        |
