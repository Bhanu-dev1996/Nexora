# NovaCRM AI — Component Library

> Reusable UI components built with React 19, TypeScript 6, Tailwind CSS v4, and shadcn/ui (base-nova theme).

---

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Utility Helpers](#utility-helpers)
3. [shadcn/ui Base Components](#shadcnui-base-components)
4. [Custom Components](#custom-components)
5. [Component Composition Patterns](#component-composition-patterns)

---

## Design Tokens

NovaCRM uses a custom `base-nova` shadcn/ui theme built on Tailwind CSS v4. All color, spacing, and typography values are defined via CSS custom properties in `src/styles/globals.css`.

| Token | CSS Variable | Description |
|---|---|---|
| `--nova-primary` | `hsl(245 80% 55%)` | Primary brand color (deep indigo) |
| `--nova-primary-foreground` | `hsl(0 0% 100%)` | Text on primary surfaces |
| `--nova-secondary` | `hsl(250 60% 97%)` | Secondary surface |
| `--nova-accent` | `hsl(160 60% 45%)` | Success / positive actions |
| `--nova-destructive` | `hsl(0 84% 60%)` | Destructive / error actions |
| `--nova-muted` | `hsl(250 20% 96%)` | Muted backgrounds |
| `--nova-ring` | `hsl(245 80% 55%)` | Focus ring color |
| `--nova-border` | `hsl(250 15% 90%)` | Default border color |
| `--nova-radius` | `0.625rem` | Base border radius |

---

## Utility Helpers

### `cn()` — Class Name Merger

Located in `src/lib/utils.ts`. Merges conditional Tailwind classes using `clsx` and `tailwind-merge`.

```tsx
import { cn } from "@/lib/utils";

<div
  className={cn(
    "px-4 py-2 rounded-md text-sm",
    variant === "primary" && "bg-primary text-primary-foreground",
    disabled && "opacity-50 pointer-events-none",
    className
  )}
/>
```

### `formatCurrency(value: number, currency?: string)`

Formats a number as localized currency. Defaults to USD.

### `formatRelativeTime(date: Date | string)`

Returns human-readable relative time strings (e.g., "2 hours ago", "in 3 days").

### `generateId(prefix?: string)`

Generates a unique ID with an optional prefix for component instances.

---

## shadcn/ui Base Components

All base components are installed under `src/components/ui/` and follow shadcn/ui conventions with the `base-nova` theme applied.

---

### Button

**File:** `src/components/ui/button.tsx`

A polymorphic button supporting multiple variants, sizes, and loading states.

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"default" \| "secondary" \| "destructive" \| "outline" \| "ghost" \| "link"` | `"default"` | Visual style variant |
| `size` | `"default" \| "sm" \| "lg" \| "icon"` | `"default"` | Size preset |
| `asChild` | `boolean` | `false` | Renders as child element (Slot pattern) |
| `isLoading` | `boolean` | `false` | Shows spinner and disables interaction |

#### Variants

| Variant | Appearance |
|---|---|
| `default` | Solid indigo background, white text |
| `secondary` | Light gray background, dark text |
| `destructive` | Red background, white text |
| `outline` | Border only, transparent background |
| `ghost` | No background, subtle hover state |
| `link` | Styled as inline link |

#### Usage

```tsx
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Basic
<Button>Save Changes</Button>

// Variant + Size
<Button variant="destructive" size="sm">Delete Lead</Button>

// Icon only
<Button variant="outline" size="icon">
  <Plus className="h-4 w-4" />
</Button>

// Loading state
<Button isLoading={isSubmitting} disabled={!isValid}>
  {isSubmitting ? "Creating..." : "Create Contact"}
</Button>

// As child (renders anchor)
<Button asChild>
  <a href="/dashboard">Go to Dashboard</a>
</Button>
```

---

### Input

**File:** `src/components/ui/input.tsx`

Text input with consistent sizing, focus states, and error support.

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `string` | `"text"` | HTML input type |
| `disabled` | `boolean` | `false` | Disables the input |
| `className` | `string` | — | Additional CSS classes |

#### Usage

```tsx
import { Input } from "@/components/ui/input";

<Input placeholder="Search contacts..." />
<Input type="email" />
<Input type="password" disabled />
```

---

### Label

**File:** `src/components/ui/label.tsx`

Accessible form label built on `@radix-ui/react-label`.

#### Usage

```tsx
import { Label } from "@/components/ui/label";

<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />
```

---

### Card

**File:** `src/components/ui/card.tsx`

Compound component for contained content sections.

#### Sub-components

| Component | Description |
|---|---|
| `Card` | Root container with border and background |
| `CardHeader` | Top section with title and description |
| `CardContent` | Main content area |
| `CardFooter` | Bottom section, typically for actions |
| `CardTitle` | Styled heading (h3) |
| `CardDescription` | Muted description text |

#### Usage

```tsx
import {
  Card, CardHeader, CardTitle,
  CardDescription, CardContent, CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

<Card>
  <CardHeader>
    <CardTitle>Deal Summary</CardTitle>
    <CardDescription>Acme Corp — Enterprise Plan</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-2xl font-bold">$124,000</p>
    <p className="text-muted-foreground text-sm">Expected close: Mar 15, 2026</p>
  </CardContent>
  <CardFooter className="gap-2">
    <Button size="sm">View Details</Button>
    <Button variant="outline" size="sm">Edit</Button>
  </CardFooter>
</Card>
```

---

### Dialog

**File:** `src/components/ui/dialog.tsx`

Modal dialog built on `@radix-ui/react-dialog`.

#### Sub-components

| Component | Description |
|---|---|
| `Dialog` | Root provider |
| `DialogTrigger` | Element that opens the dialog |
| `DialogContent` | Floating modal panel with overlay |
| `DialogHeader` | Title and description area |
| `DialogTitle` | Modal heading |
| `DialogDescription` | Modal description |
| `DialogFooter` | Action buttons area |
| `DialogClose` | Closes the dialog |

#### Props (DialogContent)

| Prop | Type | Default | Description |
|---|---|---|---|
| `showClose` | `boolean` | `true` | Show X close button |

#### Usage

```tsx
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

<Dialog>
  <DialogTrigger asChild>
    <Button variant="destructive">Delete Lead</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogDescription>
        This action cannot be undone. The lead "Jane Doe" will be permanently
        removed from the system.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Sheet

**File:** `src/components/ui/sheet.tsx`

Slide-out panel for side content, built on `@radix-ui/react-dialog` with slide animations.

#### Props

| Prop | Type | Description |
|---|---|---|
| `side` | `"top" \| "bottom" \| "left" \| "right"` | Direction the sheet slides from |

#### Usage

```tsx
import {
  Sheet, SheetTrigger, SheetContent,
  SheetHeader, SheetTitle, SheetDescription
} from "@/components/ui/sheet";

<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon">
      <Settings className="h-4 w-4" />
    </Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-[400px]">
    <SheetHeader>
      <SheetTitle>Filter Leads</SheetTitle>
      <SheetDescription>Apply filters to narrow results</SheetDescription>
    </SheetHeader>
    {/* Filter form content */}
  </SheetContent>
</Sheet>
```

---

### Select

**File:** `src/components/ui/select.tsx`

Dropdown select built on `@radix-ui/react-select`.

#### Sub-components

| Component | Description |
|---|---|
| `Select` | Root provider |
| `SelectTrigger` | Clickable trigger button |
| `SelectContent` | Dropdown panel |
| `SelectItem` | Individual option |
| `SelectValue` | Placeholder / selected value display |
| `SelectGroup` | Groups items with an optional label |
| `SelectLabel` | Group label |
| `SelectSeparator` | Visual divider |

#### Usage

```tsx
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem
} from "@/components/ui/select";

<Select value={status} onValueChange={setStatus}>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="new">New</SelectItem>
    <SelectItem value="contacted">Contacted</SelectItem>
    <SelectItem value="qualified">Qualified</SelectItem>
    <SelectItem value="unqualified">Unqualified</SelectItem>
  </SelectContent>
</Select>
```

---

### Checkbox

**File:** `src/components/ui/checkbox.tsx`

Accessible checkbox built on `@radix-ui/react-checkbox`.

#### Usage

```tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

<div className="flex items-center gap-2">
  <Checkbox id="terms" checked={accepted} onCheckedChange={setAccepted} />
  <Label htmlFor="terms" className="text-sm font-normal">
    I agree to the terms and conditions
  </Label>
</div>
```

---

### Radio Group

**File:** `src/components/ui/radio-group.tsx`

Radio button group built on `@radix-ui/react-radio-group`.

#### Usage

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

<RadioGroup value={plan} onValueChange={setPlan}>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="starter" id="starter" />
    <Label htmlFor="starter">Starter — $29/mo</Label>
  </div>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="pro" id="pro" />
    <Label htmlFor="pro">Pro — $79/mo</Label>
  </div>
  <div className="flex items-center gap-2">
    <RadioGroupItem value="enterprise" id="enterprise" />
    <Label htmlFor="enterprise">Enterprise — $199/mo</Label>
  </div>
</RadioGroup>
```

---

### Switch

**File:** `src/components/ui/switch.tsx`

Toggle switch built on `@radix-ui/react-switch`.

#### Usage

```tsx
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

<div className="flex items-center gap-2">
  <Switch id="notifications" checked={enabled} onCheckedChange={setEnabled} />
  <Label htmlFor="notifications">Enable email notifications</Label>
</div>
```

---

### Tabs

**File:** `src/components/ui/tabs.tsx`

Tabbed interface built on `@radix-ui/react-tabs`.

#### Sub-components

| Component | Description |
|---|---|
| `Tabs` | Root container |
| `TabsList` | Tab list bar |
| `TabsTrigger` | Individual tab button |
| `TabsContent` | Content panel for each tab |

#### Usage

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="activity">Activity</TabsTrigger>
    <TabsTrigger value="notes">Notes</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    <ContactOverview />
  </TabsContent>
  <TabsContent value="activity">
    <ActivityTimeline />
  </TabsContent>
  <TabsContent value="notes">
    <ContactNotes />
  </TabsContent>
</Tabs>
```

---

### Accordion

**File:** `src/components/ui/accordion.tsx`

Collapsible sections built on `@radix-ui/react-accordion`.

#### Props

| Prop | Type | Description |
|---|---|---|
| `type` | `"single" \| "multi"` | Allow one or multiple open items |
| `collapsible` | `boolean` | Allow closing open items |
| `defaultValue` | `string[]` | Initially open items |

#### Usage

```tsx
import {
  Accordion, AccordionItem, AccordionTrigger,
  AccordionContent
} from "@/components/ui/accordion";

<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Lead Source</AccordionTrigger>
    <AccordionContent>
      Website form submission on March 2, 2026.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Company Info</AccordionTrigger>
    <AccordionContent>
      Acme Corp, 250 employees, Series B funded.
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

### Alert

**File:** `src/components/ui/alert.tsx`

Inline alert messages.

#### Props

| Prop | Type | Description |
|---|---|---|
| `variant` | `"default" \| "destructive" \| "success"` | Alert style |
| `Icon` | `LucideIcon` | Optional leading icon |

#### Usage

```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Payment Failed</AlertTitle>
  <AlertDescription>
    Your invoice #INV-2024-047 could not be processed. Please update your
    billing information.
  </AlertDescription>
</Alert>

<Alert variant="success">
  <AlertTitle>Lead Created</AlertTitle>
  <AlertDescription>
    Jane Doe has been added to your pipeline as a new lead.
  </AlertDescription>
</Alert>
```

---

### Badge

**File:** `src/components/ui/badge.tsx`

Small status indicators and labels.

#### Variants

| Variant | Appearance |
|---|---|
| `default` | Solid indigo background |
| `secondary` | Light gray background |
| `destructive` | Red background |
| `outline` | Border only |
| `success` | Green background |
| `warning` | Amber background |

#### Usage

```tsx
import { Badge } from "@/components/ui/badge";

<Badge>Active</Badge>
<Badge variant="destructive">Overdue</Badge>
<Badge variant="success">Closed Won</Badge>
<Badge variant="warning">Pending Review</Badge>
<Badge variant="outline">v2.4.1</Badge>
```

---

### Avatar

**File:** `src/components/ui/avatar.tsx`

User avatar with image, fallback initials, and status indicator.

#### Sub-components

| Component | Description |
|---|---|
| `Avatar` | Root container (circle) |
| `AvatarImage` | Image element |
| `AvatarFallback` | Initials fallback when image fails |

#### Usage

```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

<Avatar className="h-10 w-10">
  <AvatarImage src={user.avatarUrl} alt={user.name} />
  <AvatarFallback>{user.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
</Avatar>
```

---

### Calendar

**File:** `src/components/ui/calendar.tsx`

Date picker calendar built on `react-day-picker`.

#### Props

| Prop | Type | Description |
|---|---|---|
| `mode` | `"single" \| "multiple" \| "range"` | Selection mode |
| `selected` | `Date \| Date[] \| { from: Date; to: Date }` | Currently selected date(s) |
| `onSelect` | `(date: ...) => void` | Selection callback |
| `disabled` | `(date: Date) => boolean` | Dates to disable |
| `numberOfMonths` | `number` | Number of months to display |

#### Usage

```tsx
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

function DatePicker() {
  const [date, setDate] = useState<Date | undefined>();

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      disabled={(d) => d < new Date()}
    />
  );
}
```

---

### Command

**File:** `src/components/ui/command.tsx`

⌘K-style command palette built on `cmdk`.

#### Sub-components

| Component | Description |
|---|---|
| `CommandDialog` | Modal command palette |
| `CommandInput` | Search input field |
| `CommandList` | Results list |
| `CommandEmpty` | No results message |
| `CommandGroup` | Grouped results with label |
| `CommandItem` | Individual result |
| `CommandSeparator` | Divider |

#### Usage

```tsx
import {
  CommandDialog, CommandInput, CommandList,
  CommandEmpty, CommandGroup, CommandItem
} from "@/components/ui/command";
import { User, FileText, Settings } from "lucide-react";

function CommandPalette({ open, onOpenChange }) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => router.push("/leads")}>
            <User className="mr-2 h-4 w-4" />
            Go to Leads
          </CommandItem>
          <CommandItem onSelect={() => router.push("/deals")}>
            <FileText className="mr-2 h-4 w-4" />
            Go to Deals
          </CommandItem>
          <CommandItem onSelect={() => router.push("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
```

---

### Context Menu

**File:** `src/components/ui/context-menu.tsx`

Right-click context menu built on `@radix-ui/react-context-menu`.

#### Usage

```tsx
import {
  ContextMenu, ContextMenuTrigger, ContextMenuContent,
  ContextMenuItem, ContextMenuSeparator, ContextMenuSub,
  ContextMenuSubTrigger, ContextMenuSubContent
} from "@/components/ui/context-menu";

<ContextMenu>
  <ContextMenuTrigger>
    <ContactRow contact={contact} />
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem onSelect={() => openContact(contact.id)}>
      View Details
    </ContextMenuItem>
    <ContextMenuItem onSelect={() => editContact(contact.id)}>
      Edit Contact
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuSub>
      <ContextMenuSubTrigger>Assign To</ContextMenuSubTrigger>
      <ContextMenuSubContent>
        {teamMembers.map((m) => (
          <ContextMenuItem key={m.id} onSelect={() => assignContact(contact.id, m.id)}>
            {m.name}
          </ContextMenuItem>
        ))}
      </ContextMenuSubContent>
    </ContextMenuSub>
    <ContextMenuSeparator />
    <ContextMenuItem onSelect={() => deleteContact(contact.id)} className="text-destructive">
      Delete Contact
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

---

### Data Table

**File:** `src/components/ui/data-table.tsx`

Flexible table built on `@tanstack/react-table` with sorting, filtering, pagination, and column visibility.

#### Props

| Prop | Type | Description |
|---|---|---|
| `columns` | `ColumnDef<TData>[]` | TanStack Table column definitions |
| `data` | `TData[]` | Row data |
| `searchPlaceholder` | `string` | Search input placeholder |
| `searchKey` | `string` | Column key to search by default |
| `isLoading` | `boolean` | Shows skeleton loading rows |
| `enablePagination` | `boolean` | Enable client-side pagination |
| `pageSize` | `number` | Rows per page (default: 10) |
| `actions` | `(row: TData) => ReactNode` | Row action buttons |

#### Usage

```tsx
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{getInitials(row.original.name)}</AvatarFallback>
        </Avatar>
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "company", header: "Company" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge>{row.original.status}</Badge>,
  },
];

<DataTable
  columns={columns}
  data={contacts}
  searchKey="name"
  searchPlaceholder="Search contacts..."
  isLoading={isLoading}
  actions={(row) => (
    <Button variant="ghost" size="icon" onClick={() => openContact(row.id)}>
      <ArrowRight className="h-4 w-4" />
    </Button>
  )}
/>
```

---

### Dropdown Menu

**File:** `src/components/ui/dropdown-menu.tsx`

Action menu built on `@radix-ui/react-dropdown-menu`.

#### Usage

```tsx
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Copy } from "lucide-react";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-48">
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuItem onClick={() => onEdit(deal)}>
      <Pencil className="mr-2 h-4 w-4" /> Edit Deal
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => onDuplicate(deal)}>
      <Copy className="mr-2 h-4 w-4" /> Duplicate
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={() => onDelete(deal)} className="text-destructive">
      <Trash2 className="mr-2 h-4 w-4" /> Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

### Form

**File:** `src/components/ui/form.tsx`

Form primitives integrated with `react-hook-form` and `zod` validation.

#### Sub-components

| Component | Description |
|---|---|
| `Form` | Root form context provider |
| `FormField` | Connects a form field to react-hook-form |
| `FormItem` | Wraps label + control + message |
| `FormLabel` | Label with error state styling |
| `FormControl` | Wrapper for the actual input |
| `FormDescription` | Helper text below the field |
| `FormMessage` | Validation error message |

#### Usage

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form, FormField, FormItem, FormLabel,
  FormControl, FormDescription, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().min(1, "Company is required"),
});

type LeadFormData = z.infer<typeof leadSchema>;

function CreateLeadForm() {
  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: { name: "", email: "", phone: "", company: "" },
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
              <FormDescription>Contact's full name</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="jane@acme.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create Lead</Button>
      </form>
    </Form>
  );
}
```

---

### Hover Card

**File:** `src/components/ui/hover-card.tsx`

Preview card on hover, built on `@radix-ui/react-hover-card`.

#### Usage

```tsx
import {
  HoverCard, HoverCardTrigger, HoverCardContent
} from "@/components/ui/hover-card";

<HoverCard>
  <HoverCardTrigger asChild>
    <a href={`/contacts/${contact.id}`} className="underline">
      {contact.name}
    </a>
  </HoverCardTrigger>
  <HoverCardContent className="w-80">
    <div className="flex gap-4">
      <Avatar className="h-12 w-12">
        <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{contact.name}</p>
        <p className="text-sm text-muted-foreground">{contact.email}</p>
        <p className="text-sm text-muted-foreground">{contact.company}</p>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>
```

---

### Menubar

**File:** `src/components/ui/menubar.tsx`

Application-style menu bar, built on `@radix-ui/react-menubar`.

#### Usage

```tsx
import {
  Menubar, MenubarMenu, MenubarTrigger,
  MenubarContent, MenubarItem, MenubarSeparator
} from "@/components/ui/menubar";

<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem onClick={onNewLead}>New Lead</MenubarItem>
      <MenubarItem onClick={onNewContact}>New Contact</MenubarItem>
      <MenubarSeparator />
      <MenubarItem onClick={onExport}>Export CSV</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
  <MenubarMenu>
    <MenubarTrigger>View</MenubarTrigger>
    <MenubarContent>
      <MenubarItem onClick={onToggleSidebar}>Toggle Sidebar</MenubarItem>
      <MenubarItem onClick={onToggleCompactView}>Compact View</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>
```

---

### Navigation Menu

**File:** `src/components/ui/navigation-menu.tsx`

Mega-menu navigation, built on `@radix-ui/react-navigation-menu`.

#### Usage

```tsx
import {
  NavigationMenu, NavigationMenuList,
  NavigationMenuItem, NavigationMenuLink,
  NavigationMenuTrigger, NavigationMenuContent
} from "@/components/ui/navigation-menu";

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>CRM</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid gap-3 p-4 w-[400px]">
          <li>
            <NavigationMenuLink href="/leads">
              <div className="font-medium">Leads</div>
              <p className="text-sm text-muted-foreground">
                Manage and track incoming leads
              </p>
            </NavigationMenuLink>
          </li>
          <li>
            <NavigationMenuLink href="/contacts">
              <div className="font-medium">Contacts</div>
              <p className="text-sm text-muted-foreground">
                Your complete contact directory
              </p>
            </NavigationMenuLink>
          </li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

---

### Popover

**File:** `src/components/ui/popover.tsx`

Floating content triggered by click, built on `@radix-ui/react-popover`.

#### Usage

```tsx
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, "PPP") : "Pick a date"}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar mode="single" selected={date} onSelect={setDate} />
  </PopoverContent>
</Popover>
```

---

### Progress

**File:** `src/components/ui/progress.tsx`

Linear progress bar built on `@radix-ui/react-progress`.

#### Props

| Prop | Type | Description |
|---|---|---|
| `value` | `number` | Progress percentage (0–100) |
| `max` | `number` | Maximum value (default: 100) |

#### Usage

```tsx
import { Progress } from "@/components/ui/progress";

<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Deal Pipeline</span>
    <span>{Math.round(pipelineValue / totalValue * 100)}%</span>
  </div>
  <Progress value={pipelineValue} max={totalValue} className="h-2" />
</div>
```

---

### Resizable

**File:** `src/components/ui/resizable.tsx`

Resizable panels built on `react-resizable-panels`.

#### Usage

```tsx
import {
  ResizablePanelGroup, ResizablePanel,
  ResizableHandle
} from "@/components/ui/resizable";

<ResizablePanelGroup direction="horizontal">
  <ResizablePanel defaultSize={25} minSize={15}>
    <Sidebar />
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={75}>
    <MainContent />
  </ResizablePanel>
</ResizablePanelGroup>
```

---

### Scroll Area

**File:** `src/components/ui/scroll-area.tsx`

Custom scrollbar for overflow content, built on `@radix-ui/react-scroll-area`.

#### Usage

```tsx
import { ScrollArea } from "@/components/ui/scroll-area";

<ScrollArea className="h-[400px]">
  <div className="p-4">
    {notifications.map((n) => (
      <NotificationItem key={n.id} notification={n} />
    ))}
  </div>
</ScrollArea>
```

---

### Separator

**File:** `src/components/ui/separator.tsx`

Visual divider, built on `@radix-ui/react-separator`.

#### Props

| Prop | Type | Description |
|---|---|---|
| `orientation` | `"horizontal" \| "vertical"` | Divider direction |

#### Usage

```tsx
import { Separator } from "@/components/ui/separator";

<div className="space-y-4">
  <h3 className="text-lg font-semibold">Contact Details</h3>
  <Separator />
  <div>{/* content */}</div>
</div>
```

---

### Skeleton

**File:** `src/components/ui/skeleton.tsx`

Loading placeholder with pulse animation.

#### Usage

```tsx
import { Skeleton } from "@/components/ui/skeleton";

<div className="space-y-3">
  <Skeleton className="h-4 w-[250px]" />
  <Skeleton className="h-4 w-[200px]" />
  <Skeleton className="h-32 w-full" />
</div>

// Card skeleton
<div className="flex gap-4 p-4">
  <Skeleton className="h-12 w-12 rounded-full" />
  <div className="space-y-2 flex-1">
    <Skeleton className="h-4 w-[180px]" />
    <Skeleton className="h-4 w-[120px]" />
  </div>
</div>
```

---

### Slider

**File:** `src/components/ui/slider.tsx`

Range slider built on `@radix-ui/react-slider`.

#### Props

| Prop | Type | Description |
|---|---|---|
| `min` | `number` | Minimum value |
| `max` | `number` | Maximum value |
| `step` | `number` | Increment step |
| `value` | `number[]` | Current value(s) |
| `onValueChange` | `(value: number[]) => void` | Change callback |

#### Usage

```tsx
import { Slider } from "@/components/ui/slider";

<Slider
  min={0}
  max={500000}
  step={10000}
  value={[dealValue]}
  onValueChange={([v]) => setDealValue(v)}
/>
<p className="text-sm text-muted-foreground mt-1">
  ${dealValue.toLocaleString()}
</p>
```

---

### Table

**File:** `src/components/ui/table.tsx`

Basic HTML table styled with Tailwind.

#### Sub-components

| Component | Description |
|---|---|
| `Table` | Root `<table>` |
| `TableHeader` | `<thead>` |
| `TableBody` | `<tbody>` |
| `TableFooter` | `<tfoot>` |
| `TableRow` | `<tr>` |
| `TableHead` | `<th>` |
| `TableCell` | `<td>` |
| `TableCaption` | Caption text |

#### Usage

```tsx
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell, TableCaption
} from "@/components/ui/table";

<Table>
  <TableCaption>Recent activities</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Action</TableHead>
      <TableHead>User</TableHead>
      <TableHead>Date</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {activities.map((a) => (
      <TableRow key={a.id}>
        <TableCell>{a.action}</TableCell>
        <TableCell>{a.user}</TableCell>
        <TableCell>{formatRelativeTime(a.date)}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

### Textarea

**File:** `src/components/ui/textarea.tsx`

Multi-line text input.

#### Usage

```tsx
import { Textarea } from "@/components/ui/textarea";

<Textarea
  placeholder="Write your notes about this contact..."
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  rows={4}
/>
```

---

### Toast

**File:** `src/components/ui/sonner.tsx`

Toast notifications using Sonner.

#### Usage

```tsx
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function LeadActions() {
  return (
    <Button onClick={() => toast.success("Lead created successfully!")}>
      Create Lead
    </Button>
  );
}

// Programmatic usage
toast.error("Failed to delete lead");
toast.info("New notification received");
toast.warning("Your session expires in 5 minutes");

// With description
toast("Event Created", {
  description: "Your meeting has been scheduled for tomorrow at 10 AM",
});

// Promise toast
toast.promise(saveLead(data), {
  loading: "Saving lead...",
  success: "Lead saved successfully",
  error: "Failed to save lead",
});
```

---

### Tooltip

**File:** `src/components/ui/tooltip.tsx`

Informational tooltip built on `@radix-ui/react-tooltip`.

#### Usage

```tsx
import {
  Tooltip, TooltipTrigger, TooltipContent, TooltipProvider
} from "@/components/ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon">
        <Info className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent>
      <p>View lead details and activity history</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## Custom Components

Custom components are located in `src/components/` (business-level) and `src/components/shared/` (reusable across features).

---

### PageHeader

**File:** `src/components/shared/page-header.tsx`

Consistent page header with title, description, breadcrumbs, and action buttons.

#### Props

| Prop | Type | Description |
|---|---|---|
| `title` | `string` | Page title |
| `description` | `string` | Subtitle description |
| `icon` | `LucideIcon` | Optional leading icon |
| `actions` | `ReactNode` | Action buttons (right-aligned) |
| `breadcrumbs` | `{ label: string; href?: string }[]` | Breadcrumb navigation |

#### Usage

```tsx
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";

<PageHeader
  title="Contacts"
  description="Manage your contact directory and relationships"
  icon={Users}
  breadcrumbs={[
    { label: "CRM", href: "/dashboard" },
    { label: "Contacts" },
  ]}
  actions={
    <Button onClick={openCreateModal}>
      <Plus className="mr-2 h-4 w-4" />
      Add Contact
    </Button>
  }
/>
```

---

### StatsCard

**File:** `src/components/shared/stats-card.tsx`

Metric card with icon, value, trend indicator, and comparison period.

#### Props

| Prop | Type | Description |
|---|---|---|
| `title` | `string` | Metric label |
| `value` | `string \| number` | Primary value |
| `change` | `number` | Percentage change from previous period |
| `changeLabel` | `string` | Comparison label (e.g., "vs last month") |
| `icon` | `LucideIcon` | Metric icon |
| `variant` | `"default" \| "success" \| "warning" \| "destructive"` | Color scheme |

#### Usage

```tsx
import { StatsCard } from "@/components/shared/stats-card";
import { DollarSign, TrendingUp } from "lucide-react";

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatsCard
    title="Total Revenue"
    value="$284,500"
    change={12.5}
    changeLabel="vs last month"
    icon={DollarSign}
    variant="success"
  />
  <StatsCard
    title="New Leads"
    value={142}
    change={-3.2}
    changeLabel="vs last month"
    icon={TrendingUp}
    variant="warning"
  />
</div>
```

---

### DataTable (Extended)

**File:** `src/components/shared/data-table.tsx`

Extended wrapper around the base Data Table with NovaCRM-specific features: server-side pagination, column filters, bulk actions, and export.

#### Additional Props

| Prop | Type | Description |
|---|---|---|
| `serverSide` | `boolean` | Enable server-side pagination/sorting |
| `totalRows` | `number` | Total server-side row count |
| `onPageChange` | `(page: number) => void` | Page change callback |
| `onSortChange` | `(sort: SortState) => void` | Sort change callback |
| `bulkActions` | `(selected: TData[]) => ReactNode` | Bulk action bar content |
| `onExport` | `(format: "csv" \| "xlsx") => void` | Export callback |

#### Usage

```tsx
import { DataTable } from "@/components/shared/data-table";

<DataTable
  columns={leadColumns}
  data={leads}
  serverSide
  totalRows={totalLeads}
  onPageChange={handlePageChange}
  onSortChange={handleSortChange}
  searchKey="name"
  bulkActions={(selected) => (
    <div className="flex gap-2">
      <Button onClick={() => bulkAssign(selected)}>Assign</Button>
      <Button variant="destructive" onClick={() => bulkDelete(selected)}>
        Delete ({selected.length})
      </Button>
    </div>
  )}
  onExport={handleExport}
/>
```

---

### KanbanBoard

**File:** `src/components/shared/kanban-board.tsx`

Drag-and-drop Kanban board for deal pipeline management, built with `@dnd-kit/core`.

#### Props

| Prop | Type | Description |
|---|---|---|
| `columns` | `KanbanColumn<T>[]` | Column definitions |
| `items` | `T[]` | Board items |
| `onMove` | `(itemId: string, from: string, to: string, position: number) => void` | Move callback |
| `renderCard` | `(item: T) => ReactNode` | Custom card renderer |
| `columnKey` | `keyof T` | Column grouping key |

#### Types

```ts
interface KanbanColumn<T> {
  id: string;
  title: string;
  color?: string;
  limit?: number;
}

interface KanbanItem {
  id: string;
  [key: string]: unknown;
}
```

#### Usage

```tsx
import { KanbanBoard } from "@/components/shared/kanban-board";

const pipelineStages: KanbanColumn<Deal>[] = [
  { id: "qualification", title: "Qualification", color: "#6366f1", limit: 10 },
  { id: "proposal", title: "Proposal", color: "#f59e0b" },
  { id: "negotiation", title: "Negotiation", color: "#8b5cf6" },
  { id: "closed-won", title: "Closed Won", color: "#10b981" },
  { id: "closed-lost", title: "Closed Lost", color: "#ef4444" },
];

<KanbanBoard
  columns={pipelineStages}
  items={deals}
  columnKey="stage"
  onMove={(itemId, from, to, pos) =>
    updateDealStage({ dealId: itemId, newStage: to, position: pos })
  }
  renderCard={(deal) => (
    <DealCard deal={deal} />
  )}
/>
```

---

### DatePicker

**File:** `src/components/shared/date-picker.tsx`

Combines Calendar + Popover into a polished date picker input.

#### Props

| Prop | Type | Description |
|---|---|---|
| `value` | `Date \| undefined` | Selected date |
| `onChange` | `(date: Date \| undefined) => void` | Selection callback |
| `placeholder` | `string` | Input placeholder text |
| `disabled` | `boolean` | Disabled state |
| `min` | `Date` | Earliest selectable date |
| `max` | `Date` | Latest selectable date |

#### Usage

```tsx
import { DatePicker } from "@/components/shared/date-picker";

<DatePicker
  value={dueDate}
  onChange={setDueDate}
  placeholder="Select due date"
  min={new Date()}
/>
```

---

### FileUpload

**File:** `src/components/shared/file-upload.tsx`

Drag-and-drop file upload with preview, progress bar, and file type validation. Uses `react-dropzone`.

#### Props

| Prop | Type | Description |
|---|---|---|
| `accept` | `Record<string, string[]>` | Accepted MIME types |
| `maxFiles` | `number` | Maximum number of files |
| `maxSize` | `number` | Maximum file size in bytes |
| `onUpload` | `(files: File[]) => Promise<void>` | Upload callback |
| `variant` | `"default" \| "compact"` | Display variant |

#### Usage

```tsx
import { FileUpload } from "@/components/shared/file-upload";

<FileUpload
  accept={{ "image/*": [".png", ".jpg", ".jpeg"], "application/pdf": [".pdf"] }}
  maxFiles={5}
  maxSize={10 * 1024 * 1024} // 10 MB
  onUpload={async (files) => {
    for (const file of files) {
      await uploadAttachment({ dealId: deal.id, file });
    }
  }}
/>
```

---

### RichTextEditor

**File:** `src/components/shared/rich-text-editor.tsx`

WYSIWYG editor built on Tiptap with toolbar.

#### Props

| Prop | Type | Description |
|---|---|---|
| `content` | `string` | HTML content string |
| `onChange` | `(html: string) => void` | Content change callback |
| `placeholder` | `string` | Placeholder text |
| `editable` | `boolean` | Read-only mode |
| `minHeight` | `number` | Minimum editor height in px |

#### Usage

```tsx
import { RichTextEditor } from "@/components/shared/rich-text-editor";

<RichTextEditor
  content={emailTemplate.body}
  onChange={(html) => setBody(html)}
  placeholder="Write your email template..."
  minHeight={200}
/>
```

---

### SearchInput

**File:** `src/components/shared/search-input.tsx`

Search input with debounced value, keyboard shortcut hint, and clear button.

#### Props

| Prop | Type | Description |
|---|---|---|
| `value` | `string` | Current search value |
| `onChange` | `(value: string) => void` | Value change callback |
| `debounceMs` | `number` | Debounce delay (default: 300) |
| `placeholder` | `string` | Input placeholder |
| `shortcut` | `boolean` | Show ⌘K hint (default: false) |

#### Usage

```tsx
import { SearchInput } from "@/components/shared/search-input";

<SearchInput
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Search leads, contacts, deals..."
  shortcut
/>
```

---

### NotificationBell

**File:** `src/components/shared/notification-bell.tsx`

Notification icon with unread count badge and dropdown panel.

#### Props

| Prop | Type | Description |
|---|---|---|
| `notifications` | `Notification[]` | Notification list |
| `unreadCount` | `number` | Unread badge count |
| `onMarkRead` | `(id: string) => void` | Mark single as read |
| `onMarkAllRead` | `() => void` | Mark all as read |
| `onDismiss` | `(id: string) => void` | Dismiss notification |
| `onNavigate` | `(notification: Notification) => void` | Navigate on click |

#### Usage

```tsx
import { NotificationBell } from "@/components/shared/notification-bell";
import { useNotificationStore } from "@/stores/notification-store";

function TopBar() {
  const { notifications, unreadCount, markRead, markAllRead, dismiss } =
    useNotificationStore();

  return (
    <NotificationBell
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkRead={markRead}
      onMarkAllRead={markAllRead}
      onDismiss={dismiss}
      onNavigate={(n) => router.push(n.link)}
    />
  );
}
```

---

### AIChatWidget

**File:** `src/components/shared/ai-chat-widget.tsx`

Floating AI assistant chat interface for the NovaCRM Copilot.

#### Props

| Prop | Type | Description |
|---|---|---|
| `isOpen` | `boolean` | Widget visibility |
| `onToggle` | `() => void` | Toggle widget visibility |
| `messages` | `ChatMessage[]` | Conversation history |
| `onSend` | `(message: string) => void` | Send message callback |
| `isTyping` | `boolean` | Show typing indicator |
| `suggestions` | `string[]` | Quick action suggestions |

#### Types

```ts
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
```

#### Usage

```tsx
import { AIChatWidget } from "@/components/shared/ai-chat-widget";
import { useAICopilot } from "@/hooks/use-ai-copilot";

function Layout() {
  const { messages, isTyping, sendMessage, suggestions, isOpen, toggle } =
    useAICopilot();

  return (
    <>
      {/* Main content */}
      <AIChatWidget
        isOpen={isOpen}
        onToggle={toggle}
        messages={messages}
        onSend={sendMessage}
        isTyping={isTyping}
        suggestions={suggestions}
      />
    </>
  );
}
```

---

### ActivityTimeline

**File:** `src/components/shared/activity-timeline.tsx`

Chronological activity feed for contacts, leads, and deals.

#### Props

| Prop | Type | Description |
|---|---|---|
| `activities` | `Activity[]` | Activity entries |
| `showFilters` | `boolean` | Show filter controls |
| `onFilter` | `(type: ActivityType) => void` | Filter callback |

#### Types

```ts
type ActivityType =
  | "call"
  | "email"
  | "meeting"
  | "note"
  | "status_change"
  | "assignment"
  | "deal_update";

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  user: { name: string; avatarUrl?: string };
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
```

#### Usage

```tsx
import { ActivityTimeline } from "@/components/shared/activity-timeline";

<ActivityTimeline
  activities={contactActivities}
  showFilters
  onFilter={(type) => filterActivities(type)}
/>
```

---

### AvatarGroup

**File:** `src/components/shared/avatar-group.tsx`

Overlapping avatar cluster with overflow count.

#### Props

| Prop | Type | Description |
|---|---|---|
| `users` | `{ name: string; avatarUrl?: string }[]` | User list |
| `max` | `number` | Maximum visible avatars (default: 4) |
| `size` | `"sm" \| "md" \| "lg"` | Avatar size |
| `onOverflowClick` | `() => void` | Callback when overflow count is clicked |

#### Usage

```tsx
import { AvatarGroup } from "@/components/shared/avatar-group";

<AvatarGroup
  users={deal.assignedTeam}
  max={3}
  size="md"
  onOverflowClick={() => openTeamMembers(deal.id)}
/>
```

---

## Component Composition Patterns

### 1. Compound Components

Most shadcn/ui components use compound component patterns where related sub-components share state through context.

```tsx
// Example: Tabs compound pattern
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### 2. Render Props

Used when child components need access to parent state.

```tsx
<DataTable
  columns={columns}
  data={data}
  actions={(row) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onEdit(row)}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDelete(row)}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )}
/>
```

### 3. Controlled / Uncontrolled

Components support both controlled and uncontrolled usage.

```tsx
// Controlled
<Select value={status} onValueChange={setStatus}>
  ...
</Select>

// Uncontrolled (internal state)
<Select defaultValue="new">
  ...
</Select>
```

### 4. Polymorphic `asChild`

Buttons and links use `asChild` to render as any element.

```tsx
<Button asChild>
  <a href="/leads">View All Leads</a>
</Button>
```
