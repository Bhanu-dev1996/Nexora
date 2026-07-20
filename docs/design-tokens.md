# NovaCRM AI — Design Tokens

> **Version:** 1.0.0
> **Last Updated:** 2026-07-20
> **Format:** CSS Custom Properties, JSON, Tailwind CSS v4 Theme

---

## Table of Contents

1. [Overview](#overview)
2. [Color Tokens](#color-tokens)
3. [Typography Tokens](#typography-tokens)
4. [Spacing Tokens](#spacing-tokens)
5. [Border Radius Tokens](#border-radius-tokens)
6. [Elevation / Shadow Tokens](#elevation--shadow-tokens)
7. [Motion / Animation Tokens](#motion--animation-tokens)
8. [Breakpoint Tokens](#breakpoint-tokens)
9. [Z-Index Tokens](#z-index-tokens)
10. [CSS Custom Property Definitions](#css-custom-property-definitions)
11. [Tailwind Theme Integration](#tailwind-theme-integration)
12. [JSON Token Export](#json-token-export)

---

## Overview

Design tokens are the single source of truth for all visual design decisions in NovaCRM AI. They are defined as CSS custom properties for runtime use and exported as JSON for tooling integration.

### Token Naming Convention

```
--nova-<category>-<property>-<variant>
```

Examples:
- `--nova-color-primary-500`
- `--nova-text-size-lg`
- `--nova-shadow-lg`
- `--nova-spacing-4`
- `--nova-radius-lg`
- `--nova-z-modal`
- `--nova-duration-fast`

---

## Color Tokens

### Brand Colors

```css
:root {
  /* Brand Primary */
  --nova-color-primary-50:  #eef2ff;
  --nova-color-primary-100: #e0e7ff;
  --nova-color-primary-200: #c7d2fe;
  --nova-color-primary-300: #a5b4fc;
  --nova-color-primary-400: #818cf8;
  --nova-color-primary-500: #6366f1;
  --nova-color-primary-600: #4f46e5;
  --nova-color-primary-700: #4338ca;
  --nova-color-primary-800: #3730a3;
  --nova-color-primary-900: #312e81;
  --nova-color-primary-950: #1e1b4b;

  /* Brand Accent */
  --nova-color-accent-50:  #f0f9ff;
  --nova-color-accent-100: #e0f2fe;
  --nova-color-accent-200: #bae6fd;
  --nova-color-accent-300: #7dd3fc;
  --nova-color-accent-400: #38bdf8;
  --nova-color-accent-500: #0ea5e9;
  --nova-color-accent-600: #0284c7;
  --nova-color-accent-700: #0369a1;
  --nova-color-accent-800: #075985;
  --nova-color-accent-900: #0c4a6e;
  --nova-color-accent-950: #082f49;
}
```

### Semantic Colors

```css
:root {
  /* Success */
  --nova-color-success-50:  #f0fdf4;
  --nova-color-success-100: #dcfce7;
  --nova-color-success-200: #bbf7d0;
  --nova-color-success-300: #86efac;
  --nova-color-success-400: #4ade80;
  --nova-color-success-500: #22c55e;
  --nova-color-success-600: #16a34a;
  --nova-color-success-700: #15803d;
  --nova-color-success-800: #166534;
  --nova-color-success-900: #14532d;
  --nova-color-success-950: #052e16;

  /* Warning */
  --nova-color-warning-50:  #fffbeb;
  --nova-color-warning-100: #fef3c7;
  --nova-color-warning-200: #fde68a;
  --nova-color-warning-300: #fcd34d;
  --nova-color-warning-400: #fbbf24;
  --nova-color-warning-500: #f59e0b;
  --nova-color-warning-600: #d97706;
  --nova-color-warning-700: #b45309;
  --nova-color-warning-800: #92400e;
  --nova-color-warning-900: #78350f;
  --nova-color-warning-950: #451a03;

  /* Error / Destructive */
  --nova-color-error-50:  #fef2f2;
  --nova-color-error-100: #fee2e2;
  --nova-color-error-200: #fecaca;
  --nova-color-error-300: #fca5a5;
  --nova-color-error-400: #f87171;
  --nova-color-error-500: #ef4444;
  --nova-color-error-600: #dc2626;
  --nova-color-error-700: #b91c1c;
  --nova-color-error-800: #991b1b;
  --nova-color-error-900: #7f1d1d;
  --nova-color-error-950: #450a0a;

  /* Info */
  --nova-color-info-50:  #eff6ff;
  --nova-color-info-100: #dbeafe;
  --nova-color-info-200: #bfdbfe;
  --nova-color-info-300: #93c5fd;
  --nova-color-info-400: #60a5fa;
  --nova-color-info-500: #3b82f6;
  --nova-color-info-600: #2563eb;
  --nova-color-info-700: #1d4ed8;
  --nova-color-info-800: #1e40af;
  --nova-color-info-900: #1e3a8a;
  --nova-color-info-950: #172554;
}
```

### Neutral / Gray Colors

```css
:root {
  --nova-color-gray-50:  #fafafa;
  --nova-color-gray-100: #f4f4f5;
  --nova-color-gray-200: #e4e4e7;
  --nova-color-gray-300: #d4d4d8;
  --nova-color-gray-400: #a1a1aa;
  --nova-color-gray-500: #71717a;
  --nova-color-gray-600: #52525b;
  --nova-color-gray-700: #3f3f46;
  --nova-color-gray-800: #27272a;
  --nova-color-gray-900: #18181b;
  --nova-color-gray-950: #09090b;
}
```

### Chart / Data Visualization Colors

```css
:root {
  --nova-chart-1: #6366f1;
  --nova-chart-2: #22c55e;
  --nova-chart-3: #f59e0b;
  --nova-chart-4: #ef4444;
  --nova-chart-5: #8b5cf6;
  --nova-chart-6: #06b6d4;
  --nova-chart-7: #ec4899;
  --nova-chart-8: #14b8a6;
}
```

### Pipeline Stage Colors

```css
:root {
  --nova-stage-discovery:    #f59e0b;
  --nova-stage-qualification: #3b82f6;
  --nova-stage-proposal:     #6366f1;
  --nova-stage-negotiation:  #8b5cf6;
  --nova-stage-closed-won:   #22c55e;
  --nova-stage-closed-lost:  #ef4444;
}
```

### Themed Semantic Aliases (Light Mode)

```css
[data-theme="light"] {
  --nova-background:          var(--nova-color-gray-50);
  --nova-foreground:          var(--nova-color-gray-950);
  --nova-card:                #ffffff;
  --nova-card-foreground:     var(--nova-color-gray-950);
  --nova-popover:             #ffffff;
  --nova-popover-foreground:  var(--nova-color-gray-950);
  --nova-muted:               var(--nova-color-gray-100);
  --nova-muted-foreground:    var(--nova-color-gray-500);
  --nova-accent:              var(--nova-color-gray-100);
  --nova-accent-foreground:   var(--nova-color-gray-950);
  --nova-border:              var(--nova-color-gray-200);
  --nova-input:               var(--nova-color-gray-200);
  --nova-ring:                var(--nova-color-primary-500);
  --nova-destructive:         var(--nova-color-error-500);
  --nova-destructive-fg:      #ffffff;

  --nova-primary:             var(--nova-color-primary-500);
  --nova-primary-hover:       var(--nova-color-primary-600);
  --nova-primary-active:      var(--nova-color-primary-700);
  --nova-primary-muted:       var(--nova-color-primary-100);
  --nova-primary-fg:          #ffffff;

  --nova-success:             var(--nova-color-success-500);
  --nova-success-muted:       var(--nova-color-success-100);
  --nova-warning:             var(--nova-color-warning-500);
  --nova-warning-muted:       var(--nova-color-warning-100);
  --nova-error:               var(--nova-color-error-500);
  --nova-error-muted:         var(--nova-color-error-100);
  --nova-info:                var(--nova-color-info-500);
  --nova-info-muted:          var(--nova-color-info-100);

  --nova-sidebar-bg:          var(--nova-color-gray-950);
  --nova-sidebar-fg:          var(--nova-color-gray-50);
  --nova-sidebar-muted:       var(--nova-color-gray-400);
  --nova-sidebar-border:      var(--nova-color-gray-800);
  --nova-sidebar-accent:      var(--nova-color-gray-800);
  --nova-sidebar-accent-fg:   var(--nova-color-gray-50);
}
```

### Themed Semantic Aliases (Dark Mode)

```css
[data-theme="dark"] {
  --nova-background:          var(--nova-color-gray-950);
  --nova-foreground:          var(--nova-color-gray-50);
  --nova-card:                var(--nova-color-gray-900);
  --nova-card-foreground:     var(--nova-color-gray-50);
  --nova-popover:             var(--nova-color-gray-900);
  --nova-popover-foreground:  var(--nova-color-gray-50);
  --nova-muted:               var(--nova-color-gray-800);
  --nova-muted-foreground:    var(--nova-color-gray-400);
  --nova-accent:              var(--nova-color-gray-800);
  --nova-accent-foreground:   var(--nova-color-gray-50);
  --nova-border:              var(--nova-color-gray-800);
  --nova-input:               var(--nova-color-gray-800);
  --nova-ring:                var(--nova-color-primary-400);
  --nova-destructive:         var(--nova-color-error-400);
  --nova-destructive-fg:      var(--nova-color-gray-950);

  --nova-primary:             var(--nova-color-primary-400);
  --nova-primary-hover:       var(--nova-color-primary-500);
  --nova-primary-active:      var(--nova-color-primary-600);
  --nova-primary-muted:       var(--nova-color-primary-900);
  --nova-primary-fg:          var(--nova-color-gray-950);

  --nova-success:             var(--nova-color-success-400);
  --nova-success-muted:       var(--nova-color-success-900);
  --nova-warning:             var(--nova-color-warning-400);
  --nova-warning-muted:       var(--nova-color-warning-900);
  --nova-error:               var(--nova-color-error-400);
  --nova-error-muted:         var(--nova-color-error-900);
  --nova-info:                var(--nova-color-info-400);
  --nova-info-muted:          var(--nova-color-info-900);

  --nova-sidebar-bg:          var(--nova-color-gray-950);
  --nova-sidebar-fg:          var(--nova-color-gray-50);
  --nova-sidebar-muted:       var(--nova-color-gray-400);
  --nova-sidebar-border:      var(--nova-color-gray-800);
  --nova-sidebar-accent:      var(--nova-color-gray-800);
  --nova-sidebar-accent-fg:   var(--nova-color-gray-50);
}
```

---

## Typography Tokens

### Font Family Tokens

```css
:root {
  --nova-font-sans:   'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --nova-font-mono:   'Geist Mono', 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace;
  --nova-font-display: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

### Font Size Tokens

```css
:root {
  --nova-text-xs:    0.75rem;    /* 12px */
  --nova-text-sm:    0.875rem;   /* 14px */
  --nova-text-base:  1rem;       /* 16px */
  --nova-text-lg:    1.125rem;   /* 18px */
  --nova-text-xl:    1.25rem;    /* 20px */
  --nova-text-2xl:   1.5rem;     /* 24px */
  --nova-text-3xl:   1.875rem;   /* 30px */
  --nova-text-4xl:   2.25rem;    /* 36px */
  --nova-text-5xl:   3rem;       /* 48px */
}
```

### Line Height Tokens

```css
:root {
  --nova-leading-none:    1;
  --nova-leading-tight:   1.25;
  --nova-leading-snug:    1.375;
  --nova-leading-normal:  1.5;
  --nova-leading-relaxed: 1.625;
  --nova-leading-loose:   2;
  --nova-leading-3:       0.75rem;    /* 12px — for xs text */
  --nova-leading-4:       1rem;       /* 16px — for sm text */
  --nova-leading-5:       1.25rem;    /* 20px — for sm/base text */
  --nova-leading-6:       1.5rem;     /* 24px — for base text */
  --nova-leading-7:       1.75rem;    /* 28px — for lg text */
  --nova-leading-8:       2rem;       /* 32px — for xl/2xl text */
  --nova-leading-9:       2.25rem;    /* 36px — for 3xl text */
  --nova-leading-10:      2.5rem;     /* 40px — for 4xl text */
}
```

### Font Weight Tokens

```css
:root {
  --nova-font-thin:       100;
  --nova-font-extralight: 200;
  --nova-font-light:      300;
  --nova-font-regular:    400;
  --nova-font-medium:     500;
  --nova-font-semibold:   600;
  --nova-font-bold:       700;
  --nova-font-extrabold:  800;
  --nova-font-black:      900;
}
```

### Letter Spacing Tokens

```css
:root {
  --nova-tracking-tighter: -0.05em;
  --nova-tracking-tight:   -0.025em;
  --nova-tracking-normal:  0em;
  --nova-tracking-wide:    0.025em;
  --nova-tracking-wider:   0.05em;
  --nova-tracking-widest:  0.1em;
}
```

### Composite Typography Tokens

```css
:root {
  --nova-display-lg:    700 2.25rem/2.5rem var(--nova-font-display);
  --nova-display-md:    700 1.875rem/2.25rem var(--nova-font-display);
  --nova-display-sm:    600 1.5rem/2rem var(--nova-font-display);
  --nova-heading-lg:    600 1.25rem/1.75rem var(--nova-font-sans);
  --nova-heading-md:    600 1.125rem/1.5rem var(--nova-font-sans);
  --nova-heading-sm:    600 1rem/1.5rem var(--nova-font-sans);
  --nova-body-lg:       400 1.125rem/1.75rem var(--nova-font-sans);
  --nova-body-md:       400 1rem/1.5rem var(--nova-font-sans);
  --nova-body-sm:       400 0.875rem/1.25rem var(--nova-font-sans);
  --nova-body-xs:       400 0.75rem/1rem var(--nova-font-sans);
  --nova-label-lg:      500 1rem/1.5rem var(--nova-font-sans);
  --nova-label-md:      500 0.875rem/1.25rem var(--nova-font-sans);
  --nova-label-sm:      500 0.75rem/1rem var(--nova-font-sans);
  --nova-code-md:       400 1rem/1.5rem var(--nova-font-mono);
  --nova-code-sm:       400 0.875rem/1.25rem var(--nova-font-mono);
}
```

---

## Spacing Tokens

The spacing scale uses a **4px base unit**. All values are multiples of 4.

```css
:root {
  --nova-spacing-0:    0px;
  --nova-spacing-px:   1px;
  --nova-spacing-0-5:  0.125rem;   /* 2px */
  --nova-spacing-1:    0.25rem;    /* 4px */
  --nova-spacing-1-5:  0.375rem;   /* 6px */
  --nova-spacing-2:    0.5rem;     /* 8px */
  --nova-spacing-2-5:  0.625rem;   /* 10px */
  --nova-spacing-3:    0.75rem;    /* 12px */
  --nova-spacing-3-5:  0.875rem;   /* 14px */
  --nova-spacing-4:    1rem;       /* 16px */
  --nova-spacing-5:    1.25rem;    /* 20px */
  --nova-spacing-6:    1.5rem;     /* 24px */
  --nova-spacing-7:    1.75rem;    /* 28px */
  --nova-spacing-8:    2rem;       /* 32px */
  --nova-spacing-9:    2.25rem;    /* 36px */
  --nova-spacing-10:   2.5rem;     /* 40px */
  --nova-spacing-11:   2.75rem;    /* 44px */
  --nova-spacing-12:   3rem;       /* 48px */
  --nova-spacing-14:   3.5rem;     /* 56px */
  --nova-spacing-16:   4rem;       /* 64px */
  --nova-spacing-20:   5rem;       /* 80px */
  --nova-spacing-24:   6rem;       /* 96px */
  --nova-spacing-28:   7rem;       /* 112px */
  --nova-spacing-32:   8rem;       /* 128px */
  --nova-spacing-36:   9rem;       /* 144px */
  --nova-spacing-40:   10rem;      /* 160px */
  --nova-spacing-44:   11rem;      /* 176px */
  --nova-spacing-48:   12rem;      /* 192px */
  --nova-spacing-52:   13rem;      /* 208px */
  --nova-spacing-56:   14rem;      /* 224px */
  --nova-spacing-60:   15rem;      /* 240px */
  --nova-spacing-64:   16rem;      /* 256px */
  --nova-spacing-72:   18rem;      /* 288px */
  --nova-spacing-80:   20rem;      /* 320px */
  --nova-spacing-96:   24rem;      /* 384px */
}
```

### Semantic Spacing Tokens

```css
:root {
  /* Component spacing */
  --nova-space-field-gap:       var(--nova-spacing-4);   /* 16px — between form fields */
  --nova-space-field-label:     var(--nova-spacing-1-5); /* 6px — label to input */
  --nova-space-card-padding:    var(--nova-spacing-6);   /* 24px — card inner padding */
  --nova-space-card-gap:        var(--nova-spacing-4);   /* 16px — between cards */
  --nova-space-section-gap:     var(--nova-spacing-8);   /* 32px — between sections */
  --nova-space-page-padding:    var(--nova-spacing-6);   /* 24px — page side padding */
  --nova-space-sidebar-width:   var(--nova-spacing-64);  /* 256px — sidebar width */
  --nova-space-sidebar-collapsed: var(--nova-spacing-16); /* 64px — collapsed sidebar */
  --nova-space-topnav-height:   var(--nova-spacing-16);  /* 64px — top nav height */
  --nova-space-modal-padding:   var(--nova-spacing-6);   /* 24px — modal inner padding */
  --nova-space-inline-gap:      var(--nova-spacing-2);   /* 8px — inline element gap */
}
```

---

## Border Radius Tokens

```css
:root {
  --nova-radius-none:  0px;
  --nova-radius-xs:    0.125rem;   /* 2px */
  --nova-radius-sm:    0.25rem;    /* 4px */
  --nova-radius-md:    0.375rem;   /* 6px */
  --nova-radius-lg:    0.5rem;     /* 8px */
  --nova-radius-xl:    0.75rem;    /* 12px */
  --nova-radius-2xl:   1rem;       /* 16px */
  --nova-radius-3xl:   1.5rem;     /* 24px */
  --nova-radius-full:  9999px;
}
```

### Semantic Radius Tokens

```css
:root {
  --nova-radius-default:  var(--nova-radius-lg);   /* 8px — default for most elements */
  --nova-radius-button:   var(--nova-radius-lg);   /* 8px — buttons */
  --nova-radius-input:    var(--nova-radius-lg);   /* 8px — input fields */
  --nova-radius-card:     var(--nova-radius-xl);   /* 12px — cards */
  --nova-radius-modal:    var(--nova-radius-xl);   /* 12px — modals/dialogs */
  --nova-radius-dropdown: var(--nova-radius-xl);   /* 12px — dropdowns, popovers */
  --nova-radius-badge:    var(--nova-radius-full); /* pill — badges, tags */
  --nova-radius-avatar:   var(--nova-radius-full); /* circle — avatars */
  --nova-radius-tooltip:  var(--nova-radius-md);   /* 6px — tooltips */
  --nova-radius-toast:    var(--nova-radius-xl);   /* 12px — toast notifications */
  --nova-radius-table:    var(--nova-radius-xl);   /* 12px — table containers */
}
```

---

## Elevation / Shadow Tokens

```css
:root {
  /* Shadow scale */
  --nova-shadow-none:    none;
  --nova-shadow-xs:      0 1px 2px 0 rgb(0 0 0 / 0.05);
  --nova-shadow-sm:      0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --nova-shadow-md:      0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --nova-shadow-lg:      0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --nova-shadow-xl:      0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --nova-shadow-2xl:     0 25px 50px -12px rgb(0 0 0 / 0.25);
  --nova-shadow-inner:   inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
}

/* Dark mode shadow adjustments */
[data-theme="dark"] {
  --nova-shadow-xs:    0 1px 2px 0 rgb(0 0 0 / 0.2);
  --nova-shadow-sm:    0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3);
  --nova-shadow-md:    0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3);
  --nova-shadow-lg:    0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4);
  --nova-shadow-xl:    0 20px 25px -5px rgb(0 0 0 / 0.6), 0 8px 10px -6px rgb(0 0 0 / 0.5);
  --nova-shadow-2xl:   0 25px 50px -12px rgb(0 0 0 / 0.7);
  --nova-shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.2);
}

/* Glow / special shadows */
:root {
  --nova-shadow-glow-primary:   0 0 20px rgb(99 102 241 / 0.3);
  --nova-shadow-glow-success:   0 0 20px rgb(34 197 94 / 0.3);
  --nova-shadow-glow-warning:   0 0 20px rgb(245 158 11 / 0.3);
  --nova-shadow-glow-error:     0 0 20px rgb(239 68 68 / 0.3);
  --nova-shadow-glow-info:      0 0 20px rgb(59 130 246 / 0.3);
}

/* Semantic shadow aliases */
:root {
  --nova-shadow-card:       var(--nova-shadow-sm);
  --nova-shadow-dropdown:   var(--nova-shadow-lg);
  --nova-shadow-modal:      var(--nova-shadow-xl);
  --nova-shadow-popover:    var(--nova-shadow-lg);
  --nova-shadow-toast:      var(--nova-shadow-xl);
  --nova-shadow-tooltip:    var(--nova-shadow-md);
  --nova-shadow-focus:      0 0 0 2px var(--nova-background), 0 0 0 4px var(--nova-ring);
}
```

---

## Motion / Animation Tokens

### Duration Tokens

```css
:root {
  --nova-duration-instant:  0ms;
  --nova-duration-fast:     100ms;
  --nova-duration-normal:   150ms;
  --nova-duration-moderate: 200ms;
  --nova-duration-slow:     300ms;
  --nova-duration-slower:   500ms;
  --nova-duration-slowest:  700ms;
}
```

### Easing / Timing Function Tokens

```css
:root {
  --nova-ease-default:       cubic-bezier(0.4, 0, 0.2, 1);
  --nova-ease-linear:        cubic-bezier(0, 0, 1, 1);
  --nova-ease-in:            cubic-bezier(0.4, 0, 1, 1);
  --nova-ease-out:           cubic-bezier(0, 0, 0.2, 1);
  --nova-ease-in-out:        cubic-bezier(0.4, 0, 0.2, 1);
  --nova-ease-bounce:        cubic-bezier(0.34, 1.56, 0.64, 1);
  --nova-ease-spring:        cubic-bezier(0.175, 0.885, 0.32, 1.275);
  --nova-ease-expo-out:      cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Composite Transition Tokens

```css
:root {
  /* Standard transitions */
  --nova-transition-colors:   color var(--nova-duration-normal) var(--nova-ease-default),
                              background-color var(--nova-duration-normal) var(--nova-ease-default),
                              border-color var(--nova-duration-normal) var(--nova-ease-default),
                              box-shadow var(--nova-duration-normal) var(--nova-ease-default);
  --nova-transition-opacity:  opacity var(--nova-duration-normal) var(--nova-ease-default);
  --nova-transition-shadow:   box-shadow var(--nova-duration-normal) var(--nova-ease-default);
  --nova-transition-transform: transform var(--nova-duration-moderate) var(--nova-ease-default);
  --nova-transition-all:      all var(--nova-duration-moderate) var(--nova-ease-default);

  /* Entrance animations */
  --nova-transition-fade-in:  opacity var(--nova-duration-moderate) var(--nova-ease-out);
  --nova-transition-slide-in: transform var(--nova-duration-slow) var(--nova-ease-expo-out);
  --nova-transition-scale-in: transform var(--nova-duration-moderate) var(--nova-ease-bounce);
}
```

### Keyframe Tokens

```css
:root {
  --nova-keyframe-fade-in:        fade-in;
  --nova-keyframe-fade-in-up:     fade-in-up;
  --nova-keyframe-fade-in-down:   fade-in-down;
  --nova-keyframe-slide-in-right: slide-in-right;
  --nova-keyframe-slide-in-left:  slide-in-left;
  --nova-keyframe-scale-in:       scale-in;
  --nova-keyframe-spin:           spin;
  --nova-keyframe-pulse:          pulse;
  --nova-keyframe-bounce:         bounce;
  --nova-keyframe-shimmer:        shimmer;
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in-down {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slide-in-right {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}

@keyframes slide-in-left {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
  50%      { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
}

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

---

## Breakpoint Tokens

```css
:root {
  --nova-bp-xs:   0px;
  --nova-bp-sm:   375px;
  --nova-bp-md:   768px;
  --nova-bp-lg:   1024px;
  --nova-bp-xl:   1280px;
  --nova-bp-2xl:  1536px;
}
```

### Tailwind v4 Breakpoint Configuration

```css
@theme {
  --breakpoint-xs:  0px;
  --breakpoint-sm:  375px;
  --breakpoint-md:  768px;
  --breakpoint-lg:  1024px;
  --breakpoint-xl:  1280px;
  --breakpoint-2xl: 1536px;
}
```

### Container Max-Width Tokens

```css
:root {
  --nova-container-xs:  20rem;     /* 320px */
  --nova-container-sm:  24rem;     /* 384px */
  --nova-container-md:  28rem;     /* 448px */
  --nova-container-lg:  32rem;     /* 512px */
  --nova-container-xl:  36rem;     /* 576px */
  --nova-container-2xl: 42rem;     /* 672px */
  --nova-container-3xl: 48rem;     /* 768px */
  --nova-container-4xl: 56rem;     /* 896px */
  --nova-container-5xl: 64rem;     /* 1024px */
  --nova-container-6xl: 72rem;     /* 1152px */
  --nova-container-7xl: 80rem;     /* 1280px */
  --nova-container-8xl: 88rem;     /* 1408px */
  --nova-container-9xl: 96rem;     /* 1536px */
}
```

---

## Z-Index Tokens

```css:root {
  --nova-z-base:          0;
  --nova-z-raised:        10;
  --nova-z-dropdown:      50;
  --nova-z-sticky:        100;
  --nova-z-overlay:       200;
  --nova-z-modal:         300;
  --nova-z-popover:       400;
  --nova-z-toast:         500;
  --nova-z-tooltip:       600;
  --nova-z-command:       700;
  --nova-z-max:           9999;
}
```

### Semantic Z-Index Aliases

```css
:root {
  /* Layout layers */
  --nova-z-sidebar:           var(--nova-z-sticky);       /* 100 */
  --nova-z-topnav:            var(--nova-z-sticky);       /* 100 */
  --nova-z-mobile-overlay:    var(--nova-z-overlay);      /* 200 */

  /* Interactive layers */
  --nova-z-dropdown-menu:     var(--nova-z-dropdown);     /* 50 */
  --nova-z-select-dropdown:   var(--nova-z-dropdown);     /* 50 */
  --nova-z-datepicker:        var(--nova-z-dropdown);     /* 50 */
  --nova-z-popover:           var(--nova-z-popover);      /* 400 */
  --nova-z-tooltip:           var(--nova-z-tooltip);      /* 600 */

  /* Modal layers */
  --nova-z-dialog:            var(--nova-z-modal);        /* 300 */
  --nova-z-drawer:            var(--nova-z-modal);        /* 300 */
  --nova-z-alert-dialog:      var(--nova-z-modal);        /* 300 */
  --nova-z-command-palette:   var(--nova-z-command);      /* 700 */

  /* Notification layers */
  --nova-z-toast:             var(--nova-z-toast);        /* 500 */
  --nova-z-notification:      var(--nova-z-toast);        /* 500 */

  /* Utility */
  --nova-z-spinner:           var(--nova-z-max);          /* 9999 */
  --nova-z-skip-link:         var(--nova-z-max);          /* 9999 */
}
```

---

## CSS Custom Property Definitions

### Complete Root Definition

The following block contains the full `:root` CSS custom property definitions used by NovaCRM AI. This should be placed in the global CSS file (e.g., `globals.css`).

```css
/* ============================================================
   NovaCRM AI Design Tokens — Global CSS Custom Properties
   ============================================================ */

:root {
  /* ----- Font Families ----- */
  --font-sans: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'Geist Mono', 'SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', monospace;

  /* ----- Font Sizes ----- */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;

  /* ----- Line Heights ----- */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* ----- Font Weights ----- */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* ----- Letter Spacing ----- */
  --tracking-tight: -0.025em;
  --tracking-normal: 0em;
  --tracking-wide: 0.025em;

  /* ----- Spacing Scale ----- */
  --space-0: 0px;
  --space-px: 1px;
  --space-0-5: 0.125rem;
  --space-1: 0.25rem;
  --space-1-5: 0.375rem;
  --space-2: 0.5rem;
  --space-2-5: 0.625rem;
  --space-3: 0.75rem;
  --space-3-5: 0.875rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-7: 1.75rem;
  --space-8: 2rem;
  --space-9: 2.25rem;
  --space-10: 2.5rem;
  --space-11: 2.75rem;
  --space-12: 3rem;
  --space-14: 3.5rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;
  --space-28: 7rem;
  --space-32: 8rem;
  --space-36: 9rem;
  --space-40: 10rem;
  --space-44: 11rem;
  --space-48: 12rem;
  --space-52: 13rem;
  --space-56: 14rem;
  --space-60: 15rem;
  --space-64: 16rem;
  --space-72: 18rem;
  --space-80: 20rem;
  --space-96: 24rem;

  /* ----- Border Radius ----- */
  --radius-none: 0px;
  --radius-xs: 0.125rem;
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-3xl: 1.5rem;
  --radius-full: 9999px;

  /* ----- Shadows ----- */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);

  /* ----- Duration ----- */
  --duration-instant: 0ms;
  --duration-fast: 100ms;
  --duration-normal: 150ms;
  --duration-moderate: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
  --duration-slowest: 700ms;

  /* ----- Easing ----- */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-linear: cubic-bezier(0, 0, 1, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);

  /* ----- Z-Index ----- */
  --z-base: 0;
  --z-raised: 10;
  --z-dropdown: 50;
  --z-sticky: 100;
  --z-overlay: 200;
  --z-modal: 300;
  --z-popover: 400;
  --z-toast: 500;
  --z-tooltip: 600;
  --z-command: 700;
  --z-max: 9999;
}
```

---

## Tailwind Theme Integration

The tokens are integrated into Tailwind CSS v4 via the `@theme` directive:

```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-background: var(--nova-background);
  --color-foreground: var(--nova-foreground);
  --color-card: var(--nova-card);
  --color-card-foreground: var(--nova-card-foreground);
  --color-popover: var(--nova-popover);
  --color-popover-foreground: var(--nova-popover-foreground);
  --color-primary: var(--nova-primary);
  --color-primary-foreground: var(--nova-primary-fg);
  --color-secondary: var(--nova-muted);
  --color-secondary-foreground: var(--nova-muted-foreground);
  --color-muted: var(--nova-muted);
  --color-muted-foreground: var(--nova-muted-foreground);
  --color-accent: var(--nova-accent);
  --color-accent-foreground: var(--nova-accent-foreground);
  --color-destructive: var(--nova-destructive);
  --color-destructive-foreground: var(--nova-destructive-fg);
  --color-border: var(--nova-border);
  --color-input: var(--nova-input);
  --color-ring: var(--nova-ring);
  --color-success: var(--nova-success);
  --color-warning: var(--nova-warning);
  --color-error: var(--nova-error);
  --color-info: var(--nova-info);

  /* Chart colors */
  --color-chart-1: var(--nova-chart-1);
  --color-chart-2: var(--nova-chart-2);
  --color-chart-3: var(--nova-chart-3);
  --color-chart-4: var(--nova-chart-4);
  --color-chart-5: var(--nova-chart-5);
  --color-chart-6: var(--nova-chart-6);

  /* Sidebar */
  --color-sidebar: var(--nova-sidebar-bg);
  --color-sidebar-foreground: var(--nova-sidebar-fg);
  --color-sidebar-muted: var(--nova-sidebar-muted);
  --color-sidebar-border: var(--nova-sidebar-border);
  --color-sidebar-accent: var(--nova-sidebar-accent);
  --color-sidebar-accent-foreground: var(--nova-sidebar-accent-fg);

  /* Font families */
  --font-sans: var(--nova-font-sans);
  --font-mono: var(--nova-font-mono);

  /* Font sizes */
  --text-xs: var(--nova-text-xs);
  --text-sm: var(--nova-text-sm);
  --text-base: var(--nova-text-base);
  --text-lg: var(--nova-text-lg);
  --text-xl: var(--nova-text-xl);
  --text-2xl: var(--nova-text-2xl);
  --text-3xl: var(--nova-text-3xl);
  --text-4xl: var(--nova-text-4xl);
  --text-5xl: var(--nova-text-5xl);

  /* Border radius */
  --radius-none: var(--nova-radius-none);
  --radius-xs: var(--nova-radius-xs);
  --radius-sm: var(--nova-radius-sm);
  --radius-md: var(--nova-radius-md);
  --radius-lg: var(--nova-radius-lg);
  --radius-xl: var(--nova-radius-xl);
  --radius-2xl: var(--nova-radius-2xl);
  --radius-3xl: var(--nova-radius-3xl);
  --radius-full: var(--nova-radius-full);

  /* Shadows */
  --shadow-xs: var(--nova-shadow-xs);
  --shadow-sm: var(--nova-shadow-sm);
  --shadow-md: var(--nova-shadow-md);
  --shadow-lg: var(--nova-shadow-lg);
  --shadow-xl: var(--nova-shadow-xl);
  --shadow-2xl: var(--nova-shadow-2xl);
  --shadow-inner: var(--nova-shadow-inner);

  /* Animations */
  --animate-fade-in: fade-in 200ms var(--ease-out);
  --animate-fade-in-up: fade-in-up 200ms var(--ease-out);
  --animate-scale-in: scale-in 150ms var(--ease-bounce);
  --animate-slide-in-right: slide-in-right 250ms var(--ease-out);
  --animate-slide-in-left: slide-in-left 250ms var(--ease-out);
  --animate-pulse: pulse 2s var(--ease-in-out) infinite;
  --animate-spin: spin 1s linear infinite;
  --animate-shimmer: shimmer 2s linear infinite;

  /* Breakpoints */
  --breakpoint-xs: 0px;
  --breakpoint-sm: 375px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;

  /* Spacing */
  --spacing: 0.25rem;
}
```

---

## JSON Token Export

For tooling integration (Figma, Style Dictionary, etc.), tokens are also exported as JSON:

```json
{
  "nova": {
    "color": {
      "primary": {
        "50": "#eef2ff",
        "100": "#e0e7ff",
        "200": "#c7d2fe",
        "300": "#a5b4fc",
        "400": "#818cf8",
        "500": "#6366f1",
        "600": "#4f46e5",
        "700": "#4338ca",
        "800": "#3730a3",
        "900": "#312e81",
        "950": "#1e1b4b"
      },
      "success": {
        "500": "#22c55e"
      },
      "warning": {
        "500": "#f59e0b"
      },
      "error": {
        "500": "#ef4444"
      },
      "info": {
        "500": "#3b82f6"
      }
    },
    "spacing": {
      "0": "0px",
      "1": "0.25rem",
      "2": "0.5rem",
      "3": "0.75rem",
      "4": "1rem",
      "5": "1.25rem",
      "6": "1.5rem",
      "8": "2rem",
      "10": "2.5rem",
      "12": "3rem",
      "16": "4rem",
      "20": "5rem",
      "24": "6rem",
      "32": "8rem",
      "40": "10rem",
      "48": "12rem",
      "64": "16rem"
    },
    "fontSize": {
      "xs": ["0.75rem", "1rem"],
      "sm": ["0.875rem", "1.25rem"],
      "base": ["1rem", "1.5rem"],
      "lg": ["1.125rem", "1.75rem"],
      "xl": ["1.25rem", "1.75rem"],
      "2xl": ["1.5rem", "2rem"],
      "3xl": ["1.875rem", "2.25rem"],
      "4xl": ["2.25rem", "2.5rem"]
    },
    "borderRadius": {
      "none": "0px",
      "sm": "0.25rem",
      "md": "0.375rem",
      "lg": "0.5rem",
      "xl": "0.75rem",
      "2xl": "1rem",
      "3xl": "1.5rem",
      "full": "9999px"
    },
    "shadow": {
      "sm": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      "md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
    },
    "duration": {
      "fast": "100ms",
      "normal": "150ms",
      "moderate": "200ms",
      "slow": "300ms",
      "slower": "500ms"
    },
    "ease": {
      "default": "cubic-bezier(0.4, 0, 0.2, 1)",
      "in": "cubic-bezier(0.4, 0, 1, 1)",
      "out": "cubic-bezier(0, 0, 0.2, 1)",
      "bounce": "cubic-bezier(0.34, 1.56, 0.64, 1)"
    },
    "zIndex": {
      "dropdown": 50,
      "sticky": 100,
      "overlay": 200,
      "modal": 300,
      "popover": 400,
      "toast": 500,
      "tooltip": 600,
      "command": 700
    },
    "breakpoint": {
      "sm": "375px",
      "md": "768px",
      "lg": "1024px",
      "xl": "1280px",
      "2xl": "1536px"
    }
  }
}
```

---

## Changelog

| Version | Date       | Changes                                              |
|---------|------------|------------------------------------------------------|
| 1.0.0   | 2026-07-20 | Initial token system release                         |
